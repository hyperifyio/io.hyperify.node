// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import {
    resolve as pathResolve,
    dirname as pathDirname,
    relative as relativePath
} from "path";
import { SyncFileUtils } from "../../../core/SyncFileUtils";
import { LogService } from "../../../core/LogService";
import { isString } from "../../../core/types/String";
import { SystemService } from "../../../core/SystemService";

const LOG = LogService.createLogger('GitUtils');

export class GitUtils {

    /**
     * Returns the git directory path
     *
     * @param filePath
     */
    static getGitDir (filePath: string): string | undefined {

        let dirPath: string = filePath;
        let newDirPath: string = dirPath;

        do {

            LOG.debug(`getGitDir: Searching git directory from `, dirPath);

            dirPath = newDirPath;

            if ( SyncFileUtils.fileExists(pathResolve(dirPath, '.git')) ) {
                return dirPath;
            }

            newDirPath = pathDirname(dirPath);

        } while ( newDirPath !== dirPath );

        return undefined;

    }

    static async initGit (
        projectDir: string
    ) : Promise<string> {
        const currentGitDir = GitUtils.getGitDir(projectDir);
        if ( !currentGitDir ) {
            LOG.debug(`Creating git directory`);
            await GitUtils._git([ "init" ]);
            return projectDir;
        } else {
            LOG.debug(`Git directory already exists: `, currentGitDir);
            return currentGitDir;
        }
    }

    static async addFiles (
        filePath: string | string[],
        projectPath: string
    ) {

        const files = isString(filePath) ? [ filePath ] : filePath;

        LOG.debug(`addFiles: Adding files: `, filePath);
        await GitUtils._git([ '-C', projectPath, "add", ...files ]);

    }

    static async commit (
        message: string,
        projectPath: string
    ) {

        LOG.debug(`commit with: `, message);
        await GitUtils._git([ '-C', projectPath, "commit", '-m', message ]);

    }

    /**
     *
     * git branch -M main
     * @param newName
     */
    static async renameMainBranch (
        newName: string,
        projectPath: string
    ) {
        LOG.debug(`rename branch: `, newName);
        await GitUtils._git([ '-C', projectPath, "branch", '-M', newName ]);
    }

    static async addSubModule (
        moduleUrl: string,
        modulePath: string,
        projectPath: string
    ) {
        if ( !SyncFileUtils.fileExists(modulePath) ) {
            await GitUtils._git([ '-C', projectPath, "submodule", 'add', moduleUrl, relativePath( projectPath, modulePath ) ]);
        } else {
            LOG.warn(`Warning! Git sub module directory already exists: `, modulePath);
        }
    }

    static async setSubModuleBranch (
        modulePath: string,
        moduleBranch: string,
        projectPath: string
    ) {
        await GitUtils._git(
            [ '-C', projectPath, "config", '-f', '.gitmodules', `submodule.${relativePath( projectPath, modulePath )}.branch`, moduleBranch ]);
    }

    static async initSubModule (
        moduleUrl    : string,
        modulePath   : string,
        moduleBranch : string,
        projectPath  : string
    ) : Promise<void> {

        const parentPath = pathDirname(modulePath);

        // mkdir -p src/fi/hg
        LOG.debug(`initSubModule: Creating: `, parentPath);
        SyncFileUtils.mkdirp(parentPath);

        // git submodule add git@github.com:sendanor/typescript.git src/fi/hg/ts
        LOG.debug(`initSubModule: Adding submodule: `, moduleUrl, modulePath);
        await GitUtils.addSubModule(moduleUrl, modulePath, projectPath);

        // git config -f .gitmodules submodule.src/fi/hg/ts.branch main
        LOG.debug(
            `initSubModule: Configuring branch for `, moduleUrl, modulePath, ': ', moduleBranch);
        await GitUtils.setSubModuleBranch(modulePath, moduleBranch, projectPath);

    }

    private static async _git (
        args: string[]
    ): Promise<void> {
        await SystemService.executeCommand('git', args, {stdio: 'inherit'});
    }

}
