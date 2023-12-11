// Copyright (c) 2022-2023 Heusala Group <info@heusalagroup.fi>. All rights reserved.
// Copyright (c) 2020-2021 Sendanor <info@sendanor.fi>. All rights reserved.

import type { IncomingMessage, RequestListener, ServerResponse } from "http";
import { URL } from "url";
import { has } from "../../core/functions/has";
import { LogService } from "../../core/LogService";
import { ServerService } from "../../core/requestServer/types/ServerService";
import { RequestHandler } from "../../core/requestServer/types/RequestHandler";
import { HttpServerInstanceImpl } from "./HttpServerInstanceImpl";
import { HttpsServerInstanceImpl } from "./HttpsServerInstanceImpl";
import { ServerCloseCallback, ServerInstance, ServerListenCallback } from "./ServerInstance";

const LOG = LogService.createLogger('ServerServiceImpl');

export interface ServerInstanceFactory {
    (callback: (req: IncomingMessage, res: ServerResponse) => void) : ServerInstance;
}

/**
 * HTTP server service
 */
export class ServerServiceImpl implements ServerService<IncomingMessage, ServerResponse> {

    private static _protocolFactories : { [key: string] : ServerInstanceFactory} = {
        ['http:']: HttpServerInstanceImpl.create,
        ['https:']: HttpsServerInstanceImpl.create,
    };

    private readonly _requestHandler : RequestListener;
    private readonly _hostname       : string | undefined;
    private readonly _port           : number;
    private readonly _closeCallback  : ServerCloseCallback;
    private readonly _listenCallback : ServerListenCallback;

    private _server  : ServerInstance;
    private _handler : RequestHandler<IncomingMessage, ServerResponse> | undefined;

    /**
     *
     * @param config
     */
    public static create (
        config: string
    ) : ServerService<IncomingMessage, ServerResponse> {
        const url = new URL(config);
        const port = url.port ? parseInt( url.port, 10 ) : 80;
        const protocol : string = url.protocol;
        if (!has(this._protocolFactories, protocol)) {
            throw new TypeError( `RequestServer: Protocol "${protocol}" not yet supported` );
        }
        return new ServerServiceImpl(
            port,
            url.hostname,
            undefined,
            this._protocolFactories[protocol],
        );
    }

    protected constructor (
        port         : number,
        hostname     : string | undefined,
        handler      : RequestHandler<IncomingMessage, ServerResponse> | undefined,
        createServer : (callback: (req: IncomingMessage, res: ServerResponse) => void) => ServerInstance,
    ) {
        LOG.debug('new: ', hostname, port, handler);
        this._requestHandler = this._onRequest.bind(this);
        this._listenCallback = this._onListen.bind(this);
        this._closeCallback  = this._onClose.bind(this);
        this._hostname = hostname;
        this._port     = port;
        this._handler  = handler;
        this._server   = createServer(this._requestHandler);
    }

    public start () : void {
        LOG.debug(`Going to start server at ${this._getConnectionString()}`);
        this._server.listen(this._port, this._hostname, this._listenCallback);
    }

    public stop () : void {
        LOG.debug(`Going to stop server at ${this._getConnectionString()}`)
        this._server.close(this._closeCallback);
    }

    public setHandler (newHandler : RequestHandler<IncomingMessage, ServerResponse> | undefined) : void {
        LOG.debug(`Setting handler at ${this._getConnectionString()} as "${newHandler}", was "${this._handler}"`);
        this._handler = newHandler;
    }

    private _getConnectionString () : string {
        if (this._hostname === undefined) {
            return `http://${this._port}`;
        } else {
            return `http://${this._hostname}:${this._port}`;
        }
    }

    private async _callRequestHandler (req: IncomingMessage, res: ServerResponse) : Promise<void> {
        if ( this._handler !== undefined ) {
            try {
                await this._handler(req, res);
            } catch (e) {
                LOG.error(`"${req.method} ${req.url}": Response handler had an error: `, e);
            }
            if (!res.writableEnded) {
                LOG.warn(`"${req.method} ${req.url}": Warning! Request handler did not close the response.`);
                res.end();
            }
        } else {
            LOG.error(`"${req.method} ${req.url}": No handler configured"`);
            res.end('Error');
        }
    }

    private _onRequest (req: IncomingMessage, res: ServerResponse) : void {
        this._callRequestHandler(req, res).catch((err : any) => {
            LOG.error(`${req.method} ${req.url}: Error: `, err);
        });
    }

    private _onListen () {
        LOG.info(`Started at ${this._getConnectionString()}`);
    }

    private _onClose () {
        LOG.debug(`Closed at ${this._getConnectionString()}`);
    }

}
