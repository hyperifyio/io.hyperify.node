// Copyright (c) 2021. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { Server as HttpServer, createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';

import { ProcessUtils } from "../../../core/ProcessUtils";
import { RequestServerImpl } from "../../RequestServerImpl";

// Must be first import to define environment variables before anything else
ProcessUtils.initEnvFromDefaultFiles();

import {
    BACKEND_API_PROXY_URL,
    BACKEND_API_URL, BACKEND_ENABLE_GZIP,
    BACKEND_LOG_LEVEL,
    BACKEND_PORT,
    BACKEND_SCRIPT_NAME,
    DISCORD_LOG_LEVEL,
    DISCORD_LOG_NAME,
    DISCORD_LOG_URL
} from "./constants/runtime";
import { LogService } from "../../../core/LogService";

LogService.setLogLevel(BACKEND_LOG_LEVEL);

import { ExitStatus } from "./types/ExitStatus";
import { LogLevel } from "../../../core/types/LogLevel";
import { RequestClientImpl } from "../../../core/RequestClientImpl";
import { RequestRouterImpl } from "../../../core/requestServer/RequestRouterImpl";
import { Headers } from "../../../core/request/types/Headers";
import { HttpServerController } from "./controller/HttpServerController";
import { HttpService } from "../../../core/HttpService";
import { HgNode } from "../../HgNode";
import { isString } from "../../../core/types/String";
import { ConsoleLogger } from "../../../core/logger/console/ConsoleLogger";
import { DiscordLogger } from "../../../core/logger/discord/DiscordLogger";
import { CompositeLogger } from "../../../core/logger/composite/CompositeLogger";

const LOG = LogService.createLogger('main');

let ALL_REACT_ROUTES : readonly string[] = [];
export function setMainReactRoutes (routes : readonly string[]) {
    ALL_REACT_ROUTES = routes;
}

export async function main (
    args: any[] = []
) : Promise<ExitStatus> {
    let server : HttpServer | undefined;
    try {

        Headers.setLogLevel(LogLevel.INFO);
        RequestRouterImpl.setLogLevel(LogLevel.DEBUG);
        RequestClientImpl.setLogLevel(LogLevel.INFO);
        RequestServerImpl.setLogLevel(LogLevel.DEBUG);
        // SimpleMatrixClient.setLogLevel(LogLevel.INFO);
        // MatrixCrudRepository.setLogLevel(LogLevel.INFO);

        HgNode.initialize();

        // Setup logging
        LogService.setLogLevel(LogLevel.DEBUG);
        const consoleLogger = new ConsoleLogger();
        consoleLogger.setLogLevel(BACKEND_LOG_LEVEL);
        const discordLogger = DISCORD_LOG_URL ? new DiscordLogger(
            DISCORD_LOG_NAME,
            DISCORD_LOG_URL,
            DISCORD_LOG_LEVEL
        ) : undefined;
        const mainLogger = new CompositeLogger(
            [
                consoleLogger,
                ...(discordLogger ? [discordLogger]: [])
            ]
        );
        LogService.setLogger(mainLogger);
        LOG.debug(`Loglevel as ${LogService.getLogLevelString()}`);

        args.shift();
        args.shift();

        const appDir       : string | undefined = args.shift();
        const appComponent : string | undefined = args.shift();
        const initFile     : string | undefined = args.shift();

        if ( !isString(appDir) || !appComponent ) {
            LOG.error(`USAGE: ${BACKEND_SCRIPT_NAME} APP_DIR APP_COMPONENT_FILE`);
            return ExitStatus.USAGE;
        }

        // Hijack require for TypeScript ES2020 interop
        const ModuleM = require('module');
        const Module = (ModuleM as any)?.default ?? ModuleM;
        const {require: oldRequire} = Module.prototype;
        Module.prototype.require = function hijacked (file: string) {
            // LOG.debug(`Loading 1: "${file}"`);
            // noinspection JSVoidFunctionReturnValueUsed
            const result = oldRequire.apply(this, [file]);
            return result?.default ?? result;
        };

        if (BACKEND_API_URL) {
            LOG.debug(`Internal backend API set as: ${BACKEND_API_URL}`);
            HttpService.setBaseUrl(BACKEND_API_URL);
        } else {
            LOG.warn(`Warning! No BACKEND_API_URL defined. HTTP calls may not work correctly.`);
        }

        if (initFile) {
            require(initFile);
        }

        const App = isString(appComponent) ? require(appComponent) : appComponent;

        const httpController = new HttpServerController(
            appDir,
            App,
            BACKEND_API_PROXY_URL,
            ALL_REACT_ROUTES,
            300,
            'nor-ssr-server',
            BACKEND_ENABLE_GZIP
        );

        server = createHttpServer(
            (
                req : IncomingMessage,
                res : ServerResponse
            ) => {
                handleSafeServerRequest(httpController, req, res).catch((err => {
                    LOG.error(`Unexpected error in request handler: `, err);
                }));
            }
        );

        server.listen(BACKEND_PORT);
        server.on('error', onError);
        server.on('listening', onListening);

        const stopPromise = new Promise<void>((resolve, reject) => {
            try {
                if (!server) {
                    reject(`No server defined`);
                    return;
                }
                server.once('close', () => {
                    LOG.debug('Stopping server from RequestServer stop event');
                    resolve();
                });
            } catch(err) {
                reject(err);
            }
        });

        ProcessUtils.setupDestroyHandler( () => {

            if (server) {
                server.removeListener('error', onError);
                server.removeListener('listening', onListening);
            }

            LOG.debug('Stopping server from process utils event');

            if (server?.close) {
                server.close();
            }

        }, (err : any) => {
            LOG.error('Error while shutting down the service: ', err);
        });

        await stopPromise;

        return ExitStatus.OK;

    } catch (err) {
        LOG.error(`Fatal error: `, err);
        return ExitStatus.FATAL_ERROR;
    }

    /**
     *
     * @param httpController
     * @param req
     * @param res
     */
    async function handleSafeServerRequest (
        httpController : HttpServerController,
        req : IncomingMessage,
        res : ServerResponse
    ) {
        const method = req?.method;
        const url = req?.url;
        try {
            LOG.debug(`"${method} ${url}": Request started...`);
            await httpController.handleRequest(req, res);
            LOG.debug(`"${method} ${url}": Request ended`);
        } catch (err: any) {
            LOG.error(`"${method} ${url}": Exception caught: `, err);
        } finally {
            if (!res.writableEnded) {
                LOG.warn(`"${method} ${url}": Warning! Request handler did not close the response.`);
                res.end();
            }
        }
    }

    /**
     * Event listener for HTTP server "error" event.
     */
    function onError (error : any) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = typeof BACKEND_PORT === 'string'
            ? 'Pipe ' + BACKEND_PORT
            : 'Port ' + BACKEND_PORT;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening () {
        if (!server) {
            LOG.info('Listening on unknown');
            return;
        }
        const addr = server.address();
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + (addr ? addr.port : 'unknown');
        LOG.info('Listening on ' + bind);
    }

}


