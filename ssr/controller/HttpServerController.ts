// Copyright (c) 2021. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { IncomingMessage, ServerResponse } from "http";
import { Server as StaticServer } from 'node-static';
import { LogService } from "../../../core/LogService";
import { ResponseEntity } from "../../../core/request/types/ResponseEntity";
import { ReactServerController } from "./ReactServerController";
import { WELL_KNOWN_HG_HEALTH_CHECK_END_POINT } from "../../../core/constants/wellKnown";
import { startsWith } from "../../../core/functions/startsWith";
import { createHealthCheckDTO } from "../../../core/types/HealthCheckDTO";
import { every } from "../../../core/functions/every";
import { some } from "../../../core/functions/some";
import { Headers } from "../../../core/request/types/Headers";
import { isArray } from "../../../core/types/Array";

const LOG = LogService.createLogger('HttpServerController');

export class HttpServerController {

    private readonly _appDir         : string;
    private readonly _fileServer     : StaticServer;
    private readonly _App            : any;
    private readonly _apiBasePath    : string | undefined;
    private readonly _apiUrl         : string | undefined;
    private readonly _proxy          : any    | undefined;
    private readonly _reactRouteList : readonly string[];

    /**
     *
     * @param appDir
     * @param App
     * @param apiUrl
     * @param reactRouteList This array should include any route that must be handler using SSR React.
     *                       Especially it should include the index.html file located inside the public folder, otherwise
     *                       it will be served directly using static router and SSR wouldn't work for the index page.
     * @param clientCacheTime Configures the time how long client is supposed to cache data
     * @param serverInfo Configures the server info HTTP header for static files
     * @param enableGzip Configures the support to serve gzip files if one exist with the same name and .gz prefix
     */
    public constructor (
        appDir           : string,
        App              : any,
        apiUrl          ?: string,
        reactRouteList  ?: readonly string[],
        clientCacheTime  : number = 300,
        serverInfo       : string = 'hg-ssr-server',
        enableGzip       : boolean = true
    ) {
        this._appDir     = appDir;
        this._App        = App;
        this._fileServer = new StaticServer(
            appDir,
            {
                cache: clientCacheTime,

                // Incorrect type information. It is not a Buffer, but string (or anything that has toString() method).
                // @ts-ignore
                serverInfo: serverInfo,

                gzip: enableGzip

            }
        );
        this._reactRouteList = reactRouteList ?? [];

        if (apiUrl !== undefined) {
            this._apiBasePath = '/api';
            this._apiUrl = apiUrl;
            const httpProxy = require('http-proxy');
            this._proxy = httpProxy.createProxyServer(
                {
                    autoRewrite: true,
                    proxyTimeout: 30*1000,
                    timeout: 30*1000
                }
            );
            LOG.info(`Enabled docroot "${this._appDir}" with "${this._apiBasePath}" passed to "${this._apiUrl}"`);
        } else {
            LOG.info(`Enabled docroot "${this._appDir}"`);
        }

    }

    public async handleRequest (
        req    : IncomingMessage,
        res    : ServerResponse,
    ) {
        let method = undefined;
        let url = undefined;
        try {
            method = req.method;
            url = req.url;
            if (!url) {
                throw new TypeError('Request did not have URL');
            }
            if ( startsWith(url, WELL_KNOWN_HG_HEALTH_CHECK_END_POINT)) {
                LOG.debug(`Routing request "${method} ${url}" to local health check`);
                await this._waitUntilRequestEnd(req);
                await this._serveAsLocalHealthCheck(res, url, true);
            } else if ( this._isReactRoute(url) ) {
                LOG.debug(`Routing request "${method} ${url}" to ReactController`)
                await this._serveUsingReactController(res, url);
            } else if ( this._proxy && this._isApiRoute(url) ) {
                LOG.debug(`Routing request "${method} ${url}" to "${this._apiUrl}"`)
                if (!this._apiUrl) throw new TypeError('apiUrl not defined');
                if (!this._apiBasePath) throw new TypeError('apiBasePath not defined');
                await this._proxyRequestToTarget(req, res, this._apiUrl, this._apiBasePath);
            } else {
                LOG.debug(`Routing request "${method} ${url}" to static server`)
                await this._waitUntilRequestEnd(req);
                await this._serveUsingStaticServer(req, res);
            }
        } catch (err) {
            const statusCode = (err as any)?.status ?? -1;
            if ( statusCode === 404 ) {
                try {
                    LOG.debug(`"${method} ${url}": Not Found 404: Routing request to ReactController`);
                    await this._serveUsingReactController(res, url ? url : '/');
                } catch (err2) {
                    LOG.debug(`"${method} ${url}": Error in ReactController: `, err2);
                    HttpServerController._writeError(res, url ? url : '/', err2, 500, 'Internal Server Error');
                }
            } else {
                LOG.error(`"${method} ${url}": Error ${statusCode}: `, err);
                HttpServerController._writeError(res, url ? url : '/', err, statusCode, `Error ${statusCode}`);
            }
        } finally {
            if (!res.writableEnded) {
                LOG.warn(`"${method} ${url}": Warning! Request handler did not close the response.`);
                res.end();
            }
        }
    }

    private async _waitUntilRequestEnd (
        req    : IncomingMessage
    ) : Promise<void> {
        await new Promise( (resolve, reject) => {
            try {
                req.addListener('end', () => {
                    resolve(undefined);
                }).resume();
            } catch (err) {
                reject(err);
            }
        });
    }

    private async _serveUsingStaticServer (
        req : IncomingMessage,
        res : ServerResponse
    ) : Promise<void> {
        await new Promise( (resolve, reject) => {
            try {
                this._fileServer.serve(req, res, (err : Error) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(undefined);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    private async _serveUsingReactController (
        res : ServerResponse,
        url : string
    ) : Promise<void> {
        const response : ResponseEntity<string> = await ReactServerController.handleReactRequest(
            url,
            this._appDir,
            this._App
        );
        HttpServerController._writeResponseEntity(res, url, response);
    }

    /**
     *
     * @param res
     * @param url
     * @param isHealthy
     * @private
     * @fixme Call health check for proxy target
     */
    private async _serveAsLocalHealthCheck (
        res : ServerResponse,
        url : string,
        isHealthy: boolean
    ) : Promise<void> {
        HttpServerController._writeResponseEntity(res, url, ResponseEntity.ok<string>(JSON.stringify(createHealthCheckDTO(isHealthy))));
        return;
    }

    private static _writeResponseEntity (
        res      : ServerResponse,
        url      : string,
        response : ResponseEntity<any>
    ) {
        const statusCode = response.getStatusCode();
        LOG.info(`"${url}": ${statusCode}`);
        this._writeResponseHeaders(response, res, 'text/plain');
        res.writeHead(statusCode);
        if (response.hasBody()) {
            res.end(response.getBody());
        } else {
            res.end();
        }
    }

    private static _writeError (
        res        : ServerResponse,
        url        : string,
        err        : any,
        statusCode : number,
        body       : string
    ) {
        LOG.error(`ERROR: `, err);
        LOG.info(`"${url}": ${statusCode}`);
        res.writeHead(statusCode);
        res.end(body);
    }

    /**
     * Proxies the request to another address.
     *
     * Note! Call this method only from a code which tests that optional `this._proxy` exists.
     *
     * @param req
     * @param res
     * @param target Target to proxy the request
     * @param basePath Base path to strip from the request
     * @private
     */
    private async _proxyRequestToTarget (
        req      : IncomingMessage,
        res      : ServerResponse,
        target   : string,
        basePath : string
    ) : Promise<void> {

        return await new Promise( (resolve, reject) => {
            try {

                const url : string = `${req.url}`;
                req.url = url.startsWith(basePath) ? url.substring(basePath.length) : url;

                LOG.debug(`_proxyRequestToTarget: Routing "${req.url}" to "${target}"`)
                this._proxy.web(req, res, {target}, (err: Error) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });

            } catch (err) {
                reject(err);
            }
        });

    }

    /**
     *
     * @param url
     * @returns true if the route is API route and should be proxied
     * @private
     */
    private _isApiRoute (url: string) : boolean {
        return startsWith(url, this._apiBasePath);
    }

    /**
     *
     * @param url
     * @returns true if the route should be directed to the React SSR handler
     * @private
     */
    private _isReactRoute (url: string) : boolean {
        return some(
            this._reactRouteList,
            (route: string) : boolean => {
                const urlParts = url.split('/');
                const routeParts = route.split('/');
                if (urlParts.length !== routeParts.length) {
                    return false;
                }
                return every(
                    urlParts,
                    (part: string, index: number) : boolean => {
                        const routePart = routeParts[index];
                        return startsWith(routePart, ':') ? true : routePart === part;
                    }
                );
            }
        );
    }

    private static _writeResponseHeaders (
        responseEntity  : ResponseEntity<any>,
        res             : ServerResponse,
        defaultMimeType : string = 'text/plain'
    ) {
        const headers : Headers = responseEntity.getHeaders();
        if (!headers.isEmpty()) {
            headers.keySet().forEach((headerKey : string) => {
                const headerValue = headers.getValue(headerKey) ?? '';
                LOG.debug(`_writeResponseHeaders: Setting response header as "${headerKey}": "${headerValue}"`);
                if (isArray(headerValue)) {
                    res.setHeader(headerKey, [...headerValue] as string[]);
                } else {
                    res.setHeader(headerKey, headerValue);
                }
            });
        }
        if (!headers.containsKey('Content-Type')) {
            res.setHeader('Content-Type', defaultMimeType);
        }
    }

}
