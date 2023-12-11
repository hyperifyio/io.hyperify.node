// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { LogService } from "../../../core/LogService";
import { PackageManagerType } from "./types/PackageManagerType";
import { SystemService } from "../../../core/SystemService";

const LOG = LogService.createLogger('initPackage');

/**
 *
 * @param pkgManager
 */
export async function initPackage (pkgManager : PackageManagerType) : Promise<void> {
    const args = process.argv.slice(2).filter((arg : string) => arg.startsWith("-"));
    LOG.debug(`Executing: `, pkgManager, "init", ...args);
    await SystemService.executeCommand(
        pkgManager,
        [ "init", ...args ],
        {
            stdio: 'inherit'
        }
    );
}
