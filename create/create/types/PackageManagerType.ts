// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

export enum PackageManagerType {
    NPM  = "npm",
    YARN = "yarn",
    HGM  = "hgm"
}

export function isPackageManagerType (value: any): value is PackageManagerType {
    switch (value) {
        case PackageManagerType.NPM:
        case PackageManagerType.YARN:
        case PackageManagerType.HGM:
            return true;

        default:
            return false;
    }
}

export function stringifyPackageManagerType (value: PackageManagerType): string {
    switch (value) {
        case PackageManagerType.NPM   : return 'npm';
        case PackageManagerType.YARN  : return 'yarn';
        case PackageManagerType.HGM   : return 'hgm';
    }
    throw new TypeError(`Unsupported PackageManagerType value: ${value}`);
}

export function parsePackageManagerType (value: any): PackageManagerType | undefined {
    switch (`${value}`.toLowerCase()) {
        case 'npm'  : return PackageManagerType.NPM;
        case 'yarn' : return PackageManagerType.YARN;
        case 'hgm'  : return PackageManagerType.HGM;
        default     : return undefined;
    }
}
