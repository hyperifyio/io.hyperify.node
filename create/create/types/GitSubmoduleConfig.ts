// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { isString } from "../../../../core/types/String";
import { isRegularObject } from "../../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../../core/types/OtherKeys";

export interface GitSubmoduleConfig {
    readonly url: string;
    readonly path: string;
    readonly branch: string;
}


export function isGitSubmoduleConfig (value: any): value is GitSubmoduleConfig {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'url',
            'path',
            'branch'
        ])
        && isString(value?.url)
        && isString(value?.path)
        && isString(value?.branch)
    );
}

export function stringifyGitSubmoduleConfig (value: GitSubmoduleConfig): string {
    return `GitSubmoduleConfig(${value})`;
}

export function parseGitSubmoduleConfig (value: any): GitSubmoduleConfig | undefined {
    if ( isGitSubmoduleConfig(value) ) return value;
    return undefined;
}
