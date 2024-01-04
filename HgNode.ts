// Copyright (c) 2022-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { RequestClientImpl } from "../core/RequestClientImpl";
import { NodeRequestClient } from "./requestClient/node/NodeRequestClient";
import { LogLevel } from "../core/types/LogLevel";
import { LogService } from "../core/LogService";
import { RequestClientAdapter } from "../core/requestClient/RequestClientAdapter";
import { NodeChildProcessService } from "./NodeChildProcessService";
import { SystemService } from "../core/SystemService";
import { AutowireService } from "../core/cmd/main/services/AutowireService";
import { AutowireServiceImpl } from "../core/cmd/main/services/AutowireServiceImpl";

const LOG = LogService.createLogger('HgNode');

export class HgNode {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    /**
     * This method will initialize our libraries using frontend implementations.
     *
     * Right now it will call `RequestClientImpl.setClient()` with a standard NodeJS
     * implementation. It has a dependency to NodeJS's http and https modules.
     *
     * @param requestClient The request client adapter to be used by default
     * @param autowireService The global autowire service
     */
    public static initialize (
        requestClient ?: RequestClientAdapter | undefined,
        autowireService ?: AutowireService | undefined,
    ) : void {
        if (!requestClient) {
            const HTTP = require('http');
            const HTTPS = require('https');
            requestClient = NodeRequestClient.create(HTTP, HTTPS);
        }
        RequestClientImpl.setClient(requestClient);
        SystemService.initialize( NodeChildProcessService.create() );
        // DefaultValue.initialize( NodeDefaultValueFactoryImpl.create() );
        AutowireServiceImpl.setAutowireService( autowireService ?? AutowireServiceImpl.create() );
    }

}
