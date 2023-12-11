// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import {
    basename as pathBasename,
    dirname as pathDirname,
    join as pathJoin,
    resolve as pathResolve
} from "path";
import { map } from "../../../../core/functions/map";
import { ReadonlyJsonObject } from "../../../../core/Json";
import { PackageManagerType, parsePackageManagerType } from "./PackageManagerType";
import { GitSubmoduleConfig } from "./GitSubmoduleConfig";
import { CreatePackageConfigDataObject } from "./CreatePackageConfigDataObject";

export interface PackageJsonModifyCallback {
    (
        pkgJSON: ReadonlyJsonObject,
        config : CreatePackageConfig
    ) : ReadonlyJsonObject;
}

export class CreatePackageConfig {

    private _preferredPackageSystem : PackageManagerType | undefined;
    private _gitOrganization        : string | undefined;
    private _organizationName       : string | undefined;
    private _organizationEmail      : string | undefined;
    private _pkgDir                 : string | undefined;
    private _buildDir               : string | undefined;
    private _sourceDir              : string | undefined;
    private _templatesDir           : string | undefined;
    private _gitCommitMessage       : string | undefined;
    private _gitBranch              : string | undefined;
    private _mainName               : string | undefined;
    private _distFile               : string | undefined;
    private _mainSrcFileTemplate    : string | undefined;
    private _mainSrcFileName        : string | undefined;
    private _files                  : readonly string[];
    private _renameFiles            : {readonly [key: string]: string};
    private _gitSubmodules          : readonly GitSubmoduleConfig[];
    private _packages               : readonly string[];
    private _packageJsonModifier    : PackageJsonModifyCallback | undefined;

    public constructor () {
        this._files = [];
        this._renameFiles = {};
        this._gitSubmodules = [];
        this._packages = [];
        this._packageJsonModifier = undefined;
    }

    public static createFromTemplateFile (templateConfigFile : string) : CreatePackageConfig {
        const templateConfigDir : string = pathDirname(templateConfigFile);
        const configData : CreatePackageConfigDataObject = require(templateConfigFile);
        const config = CreatePackageConfig.createFromDataObject(configData);
        config.setTemplatesDirectory(pathResolve(templateConfigDir, configData?.templatesDir ?? "./templates"));
        return config;
    }

    public static createFromDataObject (configData: CreatePackageConfigDataObject) : CreatePackageConfig {
        const config = new CreatePackageConfig();
        config.setPreferredPackageSystem(parsePackageManagerType(configData?.preferredPackageSystem ?? "npm"));
        config.setGitOrganization(configData?.gitOrganization ?? '@heusalagroup')
        config.setOrganizationName(configData?.organizationName ?? 'Heusala Group')
        config.setOrganizationEmail(configData?.organizationEmail ?? 'info@heusalagroup.fi')
        config.setSourceDir(configData?.sourceDir ?? './src');
        config.setBuildDir(configData?.buildDir ?? './dist');
        config.setMainSourceFileTemplate(configData?.mainSourceFileTemplate ?? "./src/run.ts");
        config.setFiles( configData?.files ?? [] );
        config.setRenameFiles( configData?.renameFiles ?? {} );
        config.setGitSubmodules( configData?.gitSubmodules ?? [] );
        config.setPackages( configData?.packages ?? [] );
        config.setGitCommitMessage( configData?.gitCommitMessage ?? 'first commit');
        config.setGitBranch(configData?.gitBranch ?? 'main');
        return config;
    }

    public toString (): string {
        return 'CreatePackageConfig';
    }

    public toJSON (): ReadonlyJsonObject {
        return {
        };
    }


    public setPreferredPackageSystem (value: PackageManagerType | undefined) : CreatePackageConfig {
        this._preferredPackageSystem = value;
        return this;
    }

    public getPreferredPackageSystem () : PackageManagerType {
        return this._preferredPackageSystem ?? PackageManagerType.NPM;
    }


    public setGitOrganization (value : string | undefined) : CreatePackageConfig {
        this._gitOrganization = value;
        return this;
    }

    public getGitOrganization () : string | undefined {
        return this._gitOrganization;
    }


    public setOrganizationName (value : string | undefined) : CreatePackageConfig {
        this._organizationName = value;
        return this;
    }

    public getOrganizationName () : string | undefined {
        return this._organizationName;
    }


    public setOrganizationEmail (value : string | undefined) : CreatePackageConfig {
        this._organizationEmail = value;
        return this;
    }

    public getOrganizationEmail () : string | undefined {
        return this._organizationEmail;
    }


    /**
     * Set the package directory
     */
    public setPackageDirectory (value : string | undefined) : CreatePackageConfig {
        this._pkgDir = value;
        return this;
    }

    /**
     * The package directory
     */
    public getPackageDirectory () : string | undefined {
        return this._pkgDir;
    }


    /**
     * Set build directory relative to the package directory
     */
    public setBuildDir (value : string | undefined) : CreatePackageConfig {
        this._buildDir = value;
        return this;
    }

    /**
     * Build directory relative to the package directory
     */
    public getBuildDir () : string | undefined {
        return this._buildDir;
    }


    /**
     * Set source directory relative to the package directory
     * @param value
     */
    public setSourceDir (value : string | undefined) : CreatePackageConfig {
        this._sourceDir = value;
        return this;
    }

    /**
     * Source directory relative to the package directory
     */
    public getSourceDir () : string | undefined {
        return this._sourceDir;
    }


    /**
     * Set templates directory relative to the package directory
     * @param value
     */
    public setTemplatesDirectory (value : string | undefined) : CreatePackageConfig {
        this._templatesDir = value;
        return this;
    }

    /**
     * Source directory relative to the package directory
     */
    public getTemplatesDirectory () : string | undefined {
        return this._templatesDir;
    }


    public setGitCommitMessage (value : string | undefined) : CreatePackageConfig {
        this._gitCommitMessage = value;
        return this;
    }

    public getGitCommitMessage () : string | undefined {
        return this._gitCommitMessage;
    }


    public setGitBranch (value : string | undefined) : CreatePackageConfig {
        this._gitBranch = value;
        return this;
    }

    public getGitBranch () : string | undefined {
        return this._gitBranch;
    }


    public setMainName (value : string | undefined) : CreatePackageConfig {
        this._mainName = value;
        return this;
    }

    private _getDefaultMainName () : string {
        const pkgDir = this.getPackageDirectory();
        if (!pkgDir) throw new TypeError('Package directory or main name must be set first');
        return pathBasename(pkgDir);
    }

    public getMainName () : string {
        return this._mainName ?? this._getDefaultMainName();
    }


    public setDistFile (value : string | undefined) : CreatePackageConfig {
        this._distFile = value;
        return this;
    }

    public getDistFile () : string {
        if (this._distFile) return this._distFile;
        const buildDir = this.getBuildDir();
        if (!buildDir) throw new TypeError(`No buildDir defined`);
        return pathJoin(buildDir, `${this.getMainName()}.js`);
    }


    public setMainSourceFileName (value : string | undefined) : CreatePackageConfig {
        this._mainSrcFileName = value;
        return this;
    }

    public getMainSourceFileName () : string {
        if (this._mainSrcFileName) return this._mainSrcFileName;
        const sourceDir = this.getSourceDir();
        if (!sourceDir) throw new TypeError(`No sourceDir defined`);
        return pathJoin(sourceDir, `${this.getMainName()}.ts`);
    }


    public setMainSourceFileTemplate (value : string | undefined) : CreatePackageConfig {
        this._mainSrcFileTemplate = value;
        return this;
    }

    public getMainSourceFileTemplate () : string {
        if (this._mainSrcFileTemplate) return this._mainSrcFileTemplate;
        const sourceDir = this.getSourceDir();
        if (!sourceDir) throw new TypeError(`No sourceDir defined`);
        return pathJoin(sourceDir, `${this.getMainName()}.ts`);
    }


    public setFiles (value : string[] | readonly string[]) : CreatePackageConfig {
        this._files = map(value, (item: string) : string => item);
        return this;
    }

    public getFiles () : readonly string[] {
        return this._files;
    }


    public setRenameFiles (value : {readonly [key: string]: string}) : CreatePackageConfig {
        this._renameFiles = value;
        return this;
    }

    public getRenameFiles () : {readonly [key: string]: string} {
        return this._renameFiles;
    }


    public setPackages (value : string[] | readonly string[]) : CreatePackageConfig {
        this._packages = map(value, (item: string) : string => item);
        return this;
    }

    public getPackages () : readonly string[] {
        return this._packages;
    }


    public setGitSubmodules (value : GitSubmoduleConfig[] | readonly GitSubmoduleConfig[]) : CreatePackageConfig {
        this._gitSubmodules = map(value, (item: GitSubmoduleConfig) : GitSubmoduleConfig => item);
        return this;
    }

    public getGitSubmodules () : readonly GitSubmoduleConfig[] {
        return this._gitSubmodules;
    }


    public setPackageJsonModifier (value : PackageJsonModifyCallback) : CreatePackageConfig {
        this._packageJsonModifier = value;
        return this;
    }

    public getPackageJsonModifier () : PackageJsonModifyCallback {
        if (!this._packageJsonModifier) throw new TypeError(`The packageJsonModifier not initialized yet`);
        return this._packageJsonModifier;
    }


}

export function isCreatePackageConfig (value: any): value is CreatePackageConfig {
    return value instanceof CreatePackageConfig;
}
