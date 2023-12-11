// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { SystemProcess } from "./SystemProcess";
import { isString } from "../../../../../core/types/String";
import { isRegularObject, isRegularObjectOf } from "../../../../../core/types/RegularObject";
import { isArrayOf } from "../../../../../core/types/Array";

export type SystemArgumentList = readonly string[];
export type SystemEnvironment = {readonly [key: string]: string};

export function isSystemArgumentList (value: any): value is SystemArgumentList {
    return isArrayOf(value, isString, 0);
}

export function isSystemEnvironment (value: any): value is SystemEnvironment {
    return isRegularObjectOf<string, string>(value, isString, isString);
}

export interface System {

    destroy () : void;

    createProcess (
        command : string,
        args    : SystemArgumentList | undefined,
        env     : SystemEnvironment | undefined,
        cwd     : string | undefined
    ): SystemProcess;

    getWorkingDirectory () : string;

    createDirectory (
        target: string
    ): System;

    pathExists (path: string) : boolean;

    readFile (
        target: string
    ): string;

    writeFile (
        target  : string,
        content : string
    ) : System;

    /**
     * Implementation should make sure these are cleaned on destroy.
     */
    createTemporaryFile (): string;

}

export function isSystem (value: any): value is System {
    return (
        isRegularObject(value)
        //&& isString(value?.foo)
    );
}

export function stringifySystem (value: System): string {
    return `System(${value})`;
}

export function parseSystem (value: any): System | undefined {
    if ( isSystem(value) ) return value;
    return undefined;
}

export default System;
