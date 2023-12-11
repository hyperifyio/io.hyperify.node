// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { HgNode } from "../../HgNode";

export const LOG_LEVEL = process?.env?.LOG_LEVEL ?? "INFO";

import { LogService } from "../../../core/LogService";
import { parseLogLevel } from "../../../core/types/LogLevel";

const LOG = LogService.createLogger('main');

const logLevel = parseLogLevel(LOG_LEVEL);
if ( logLevel ) {
    LOG.debug(`Setting log level as `, logLevel);
    LogService.setLogLevel(logLevel);
}

import {
    CreatePackageConfig,
    PackageJsonModifyCallback
} from "./types/CreatePackageConfig";
import { createPackage } from "./createPackage";

export async function main (
    templateConfigFile : string,
    modifyPackageJson  : PackageJsonModifyCallback
): Promise<void> {
    HgNode.initialize();
    const config = CreatePackageConfig.createFromTemplateFile(templateConfigFile);
    config.setPackageJsonModifier(modifyPackageJson);
    await createPackage(config);
}
