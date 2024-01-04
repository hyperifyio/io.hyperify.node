// Copyright (c) 2022-2023 Heusala Group <info@hg.fi>. All rights reserved.
// Copyright (c) 2020-2021 Sendanor <info@sendanor.fi>. All rights reserved.

import { ContentType } from "../core/request/types/ContentType";
import { RequestServer, RequestServerDestructor, RequestServerEvent } from "../core/RequestServer";
import { RequestRouter } from "../core/requestServer/RequestRouter";
import { Disposable } from "../core/types/Disposable";
import { IncomingHttpHeaders, IncomingMessage, ServerResponse} from "http";
import { RequestStatus, isRequestStatus, stringifyRequestStatus } from "../core/request/types/RequestStatus";
import { RequestError, createRequestError, isRequestError } from "../core/request/types/RequestError";
import { ServerService } from "../core/requestServer/types/ServerService";
import { RequestHandler} from "../core/requestServer/types/RequestHandler";
import { parseRequestMethod} from "../core/request/types/RequestMethod";
import { LogService } from "../core/LogService";
import { isRequestController} from "../core/request/types/RequestController";
import { JsonAny } from "../core/Json";
import { NodeHttpUtils } from "./requestClient/node/NodeHttpUtils";
import { ResponseEntity } from "../core/request/types/ResponseEntity";
import { Headers } from "../core/request/types/Headers";
import { LogLevel } from "../core/types/LogLevel";
import { Observer, ObserverCallback } from "../core/Observer";
import { isArray } from "../core/types/Array";
import { isString } from "../core/types/String";

const LOG = LogService.createLogger('RequestServerImpl');

/**
 *
 * @example
 *         const server: RequestServer = RequestServerImpl.create(
 *             ServerServiceImpl.create(BACKEND_URL),
 *             RequestRouterImpl.create(),
 *         );
 */
export class RequestServerImpl implements RequestServer, Disposable {

    private readonly _server: ServerService<IncomingMessage, ServerResponse>;
    private readonly _router: RequestRouter;
    private readonly _handleRequestCallback: RequestHandler<any, any>;

    public static setLogLevel (level: LogLevel) : void {
        LOG.setLogLevel(level);
    }

    private readonly _observer: Observer<RequestServerEvent>;

    public static Event = RequestServerEvent;

    protected constructor (
        server: ServerService<IncomingMessage, ServerResponse>,
        router: RequestRouter,
    ) {
        this._observer = new Observer<RequestServerEvent>("RequestServerImpl");
        this._server = server;
        this._router = router;
        this._handleRequestCallback = this._handleRequest.bind(this);
        this._server.setHandler(this._handleRequestCallback);
    }

    /**
     *
     * @example
     *         const server: RequestServer = RequestServerImpl.create(
     *             ServerServiceImpl.create(BACKEND_URL),
     *             RequestRouterImpl.create(),
     *         );
     */
    public static create (
        server: ServerService<IncomingMessage, ServerResponse>,
        router: RequestRouter,
    ) : RequestServerImpl {
        return new RequestServerImpl(
            server,
            router,
        );
    }

    public on (
        name: RequestServerEvent,
        callback: ObserverCallback<RequestServerEvent>
    ): RequestServerDestructor {
        return this._observer.listenEvent(name, callback);
    }

    public destroy (): void {
        this._observer.destroy();
    }

    /**
     * Attach an instance which was previously annotated with our Request annotation
     * implementation.
     *
     * @param controller Class instance which has internal Request annotations
     */
    public attachController (
        controller : any
    ) : void {
        if (isRequestController(controller)) {
            this._router.attachController(controller);
        } else {
            throw new TypeError(`RequestServer: The provided controller was not RequestController`);
        }
        if (this._observer.hasCallbacks(RequestServerEvent.CONTROLLER_ATTACHED)) {
            this._observer.triggerEvent(RequestServerEvent.CONTROLLER_ATTACHED);
        }
    }

    public start () : void {
        LOG.debug(`Starting server`);
        this._server.start();
        if (this._observer.hasCallbacks(RequestServerEvent.STARTED)) {
            this._observer.triggerEvent(RequestServerEvent.STARTED);
        }
    }

    public stop () : void {
        LOG.debug(`Stopping server`);
        this._server.stop();
        if (this._observer.hasCallbacks(RequestServerEvent.STOPPED)) {
            this._observer.triggerEvent(RequestServerEvent.STOPPED);
        }
    }

    private async _handleRequest(
        req: IncomingMessage,
        res: ServerResponse
    ) : Promise<void> {
        const reqMethod = req.method;
        const reqUrl = req.url;
        try {
            const method = parseRequestMethod(reqMethod);
            const responseData : ResponseEntity<any> = await this._router.handleRequest(
                method,
                reqUrl,
                (headers: Headers) => RequestServerImpl._requestBodyParser(req, headers),
                this._parseRequestHeaders(req.headers)
            );
            LOG.debug(`"${reqMethod} ${reqUrl}": Processing responseEntity`);
            await this._handleResponse(responseData, res);
        } catch (err) {
            LOG.debug(`"${reqMethod} ${reqUrl}": Error, passing it on: `, err);
            await this._handleErrorResponse(err, res);
        }
    }

    private static async _requestBodyParser (
        req: IncomingMessage,
        headers : Headers
    ) : Promise<JsonAny | undefined> {
        const contentType : string = headers.getFirst('content-type')?.toLowerCase() ?? 'application/json';
        switch (contentType) {
            case 'application/x-www-form-urlencoded':
                return NodeHttpUtils.getRequestDataAsFormUrlEncoded(req);
            default:
                return NodeHttpUtils.getRequestDataAsJson(req);
        }
    }

    private async _handleResponse (
        responseEntity : ResponseEntity<any>,
        res            : ServerResponse
    ): Promise<void> {
        const statusCode : RequestStatus | number = responseEntity.getStatusCode();
        res.statusCode    = statusCode;
        res.statusMessage = stringifyRequestStatus(statusCode);
        if (responseEntity.hasBody()) {
            const body = responseEntity.getBody();

            if (isString(body)) {

                LOG.debug('_handleResponse: Ending as text ', statusCode, body);
                this._writeResponseHeaders(responseEntity, res, ContentType.TEXT);
                res.end(body);

            } else if ( typeof Response !== 'undefined' && body instanceof Response ) {

                this._writeResponseHeaders(responseEntity, res, undefined);
                // @ts-ignore
                for await (const chunk of body.body) {
                    res.write(chunk);
                }
                res.end();

            } else {

                this._writeResponseHeaders(responseEntity, res, ContentType.JSON);
                LOG.debug('_handleResponse: Ending as json ', statusCode, body);
                res.end(JSON.stringify(body, null, 2));

            }

        } else {
            this._writeResponseHeaders(responseEntity, res, undefined);
            LOG.debug('_handleResponse: Ending without body ', statusCode);
            res.end();
        }
    }

    private async _handleErrorResponse(
        error: any,
        res: ServerResponse
    ): Promise<void> {
        let responseEntity : ResponseEntity<RequestError> | undefined;
        if (isRequestStatus(error)) {
            responseEntity = new ResponseEntity(error);
        } else if (isRequestError(error)) {
            responseEntity = new ResponseEntity(error, error.getStatusCode());
        } else {
            LOG.error('_handleErrorResponse_ Exception: ', error);

            // FIXME: We should have an public API for testing production mode
            if ( process?.env?.NODE_ENV === 'production' ) {
                responseEntity = ResponseEntity.internalServerError();
            } else {
                responseEntity = new ResponseEntity<RequestError>(
                    createRequestError(RequestStatus.InternalServerError, `Internal Server Error: ${error}`),
                    RequestStatus.InternalServerError
                );
            }

        }
        await this._handleResponse(responseEntity, res);
    }

    /**
     *
     * @param value
     * @private
     */
    private _parseRequestHeaders (value : IncomingHttpHeaders) : Headers {
        return new Headers(value);
    }

    private _writeResponseHeaders (
        responseEntity  : ResponseEntity<any>,
        res             : ServerResponse,
        defaultMimeType : string | undefined = undefined
    ) : void {
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
        if ( defaultMimeType !== undefined && !headers.containsKey( 'Content-Type' ) ) {
            res.setHeader( 'Content-Type', defaultMimeType );
        }
    }

}
