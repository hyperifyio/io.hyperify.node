// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { ServerCloseCallback, ServerInstance, ServerListenCallback } from "./ServerInstance";
import { IncomingMessage, ServerResponse } from "http";
import { Server, createServer } from "https";

export class HttpsServerInstanceImpl implements ServerInstance {

    private readonly _server : Server;

    public static create (
        handler: (req: IncomingMessage, res: ServerResponse) => void
    ) : HttpsServerInstanceImpl {
        return new HttpsServerInstanceImpl(
            createServer(handler)
        );
    }

    protected constructor (
        server: Server
    ) {
        this._server = server;

        // FIXME: Implement these as configurable options
        // this._server.maxRequestsPerSocket = 0;
        // this._server.requestTimeout = 0;
        // this._server.headersTimeout = 0;
        // this._server.timeout = 0;
        // this._server.keepAliveTimeout = 0;

    }

    public listen (port: number, hostname: string, listenCallback: ServerListenCallback): void {
        if (hostname === undefined) {
            this._server.listen(port, listenCallback);
        } else {
            this._server.listen(port, hostname, listenCallback);
        }
    }

    public close (closeCallback: ServerCloseCallback): void {
        this._server.close(closeCallback);
    }

}
