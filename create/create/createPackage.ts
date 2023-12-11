// Copyright (c) 2022-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { CreatePackageConfig } from "./types/CreatePackageConfig";
import {
    dirname as pathDirname,
    resolve as pathResolve
} from "path";
import { SyncFileUtils } from "../../../core/SyncFileUtils";
import { InstallConfig } from "pkg-install/lib/config";
import { PackageManagerType, parsePackageManagerType } from "./types/PackageManagerType";
import { getPackageManager, install } from "pkg-install";
import { initPackage } from "./initPackage";
import { camelCase } from "../../../core/functions/camelCase";
import { has } from "../../../core/functions/has";
import { isEqual } from "../../../core/functions/isEqual";
import { map } from "../../../core/functions/map";
import { reduce } from "../../../core/functions/reduce";
import { uniq } from "../../../core/functions/uniq";
import { GitUtils } from "./GitUtils";
import { isReadonlyJsonObject } from "../../../core/Json";
import { LogService } from "../../../core/LogService";
import { GitSubmoduleConfig } from "./types/GitSubmoduleConfig";

const LOG = LogService.createLogger('createPackage');

export async function createPackage (
    config: CreatePackageConfig
) {

    let cwd: string = process.cwd();

    // Initialize the project directory
    const dirname = process.argv.slice(2).filter((arg: string) => !arg.startsWith("-")).shift();
    if ( dirname ) {
        const newCwd = pathResolve(cwd, dirname);
        LOG.debug(`Creating project directory: `, newCwd);
        SyncFileUtils.mkdirp(newCwd);
        process.chdir(newCwd);
        cwd = newCwd;
    }

    const packageSystem : PackageManagerType = config.getPreferredPackageSystem();

    // Initialize the package.json
    const installConfig: InstallConfig = {
        dev: false,
        exact: false,
        noSave: false,
        bundle: false,
        verbose: false,
        global: false,
        prefer: packageSystem === PackageManagerType.YARN ? "yarn" : "npm",
        stdio: "inherit",
        cwd: cwd
    };

    LOG.debug(`Initial install config: `, installConfig);
    const pkgManager: PackageManagerType | undefined = parsePackageManagerType( await getPackageManager(installConfig) );
    if (!pkgManager) {
        throw new TypeError(`Failed to initialize pkgManager: ${pkgManager}`);
    }

    LOG.debug(`Initializing package.json using `, pkgManager);
    await initPackage(pkgManager);

    // Get information
    const packageJsonPath = pathResolve("package.json");
    if ( !SyncFileUtils.fileExists(packageJsonPath) ) {
        LOG.warn(`Warning! package.json did not exist: `, packageJsonPath);
        return;
    }

    config.setPackageDirectory( pathDirname(packageJsonPath) );

    const pkgDir = config.getPackageDirectory();
    if (!pkgDir) throw new TypeError(`Failed to read pkgDir: ${pkgDir}`);
    const mainName = config.getMainName();

    const currentYear = (new Date().getFullYear());

    const gitOrganization = config.getGitOrganization();
    if (!gitOrganization) throw new TypeError(`Failed to read git organization`);
    const gitOrganizationName = config.getOrganizationName();
    if (!gitOrganizationName) throw new TypeError(`Failed to read git organization name`);
    const gitOrganizationEmail = config.getOrganizationEmail();
    if (!gitOrganizationEmail) throw new TypeError(`Failed to read git organization email`);

    const replacements : {readonly [name: string]: string} = {
        'GIT-ORGANISATION': gitOrganization,
        'ORGANISATION-NAME': gitOrganizationName,
        'ORGANISATION-EMAIL': gitOrganizationEmail,
        'CURRENT-YEAR': `${currentYear}`,
        'PROJECT-NAME': mainName,
        'projectName': camelCase(mainName)
    };

    const files = config.getFiles();
    const renameFiles = config.getRenameFiles();

    const directories = uniq(map(files, (item: string) => {
        let targetItem = item;
        if (has(renameFiles, item)) {
            targetItem = renameFiles[item];
        }
        return pathDirname(targetItem);
    }));

    const templatesDir = config.getTemplatesDirectory();
    if (!templatesDir) throw new TypeError(`Failed to read templatesDir: ${templatesDir}`);

    // Create directories
    directories.forEach((item: string) => {
        const resolvedDir = pathResolve(pkgDir, item);
        LOG.debug(`Creating directory: `, resolvedDir);
        SyncFileUtils.mkdirp(resolvedDir);
    });

    // Initialize git
    LOG.debug(`Initializing git if necessary`);
    const projectDir = pathResolve( process.cwd() );

    const gitDir = await GitUtils.initGit( projectDir );
    if ( gitDir !== projectDir ) {
        LOG.debug(`Git directory was already created in parent: `, gitDir);
    }

    // Copy files
    files.forEach((item: string) => {

        let targetItem = item;
        if (has(renameFiles, item)) {
            targetItem = renameFiles[item];
        }

        SyncFileUtils.copyTextFileWithReplacementsIfMissing(
            pathResolve(templatesDir, item),
            pathResolve(pkgDir, targetItem),
            replacements
        );

    });

    SyncFileUtils.copyTextFileWithReplacementsIfMissing(
        pathResolve(templatesDir, config.getMainSourceFileTemplate()),
        pathResolve(pkgDir, config.getMainSourceFileName()),
        replacements
    );

    // Update package.json
    const pkgJSON = SyncFileUtils.readJsonFile(packageJsonPath);
    if ( !isReadonlyJsonObject(pkgJSON) ) {
        throw new TypeError('package.json was invalid');
    }

    const packageJsonModifier = config.getPackageJsonModifier();
    const newPkgJson = packageJsonModifier(pkgJSON, config);

    if ( !isEqual(newPkgJson, pkgJSON) ) {
        SyncFileUtils.writeJsonFile(packageJsonPath, newPkgJson);
    } else {
        LOG.warn(`Warning! No changes to package.json detected`);
    }

    // Initialize git sub modules
    await reduce(
        config.getGitSubmodules(),
        async (prev: Promise<void>, config: GitSubmoduleConfig) : Promise<void> => {
            await prev;

            const {
                url,
                path,
                branch
            } = config;

            LOG.debug(
                `Initializing core git submodule from ${url} and branch ${branch} to ${path}`);
            await GitUtils.initSubModule(
                url,
                pathResolve(projectDir, path),
                branch ?? 'main',
                pathResolve(gitDir)
            );

        },
        Promise.resolve()
    );

    // Install packages
    const npmPackagesToInstall = config.getPackages();
    LOG.debug(`Installing packages: `, npmPackagesToInstall);
    await install( map(npmPackagesToInstall, (item : string) : string => item), installConfig );

    // Add files to git
    LOG.debug(`Adding files to git`);
    await GitUtils.addFiles([ "." ], projectDir);

    LOG.debug(`Initial git commit`);
    const commitMessage = config.getGitCommitMessage();
    if (!commitMessage) throw new TypeError(`Failed to read commit message: ${commitMessage}`);
    await GitUtils.commit(commitMessage, projectDir);

    // Rename git branch
    const gitBranch = config.getGitBranch();
    if (!gitBranch) throw new TypeError(`Failed to read git branch: ${gitBranch}`);
    LOG.debug(`Renaming main git branch to '${gitBranch}'`);
    await GitUtils.renameMainBranch(gitBranch, gitDir);

}
