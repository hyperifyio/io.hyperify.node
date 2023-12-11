// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ObserverDestructor } from "../../../../../core/Observer";
import { isRegularObject } from "../../../../../core/types/RegularObject";

/**
 * The instance of SystemProcess will be provided as the second parameter to callbacks
 */
export enum SystemProcessEvent {
    ON_EXIT = "NodeSystemProcess:onExit"
}

export interface SystemProcessEventCallback {
    (event: SystemProcessEvent, process: SystemProcess): void;
}

export type SystemProcessDestructor = ObserverDestructor;

export interface SystemProcess {

    start () : SystemProcess;
    stop () : SystemProcess;
    pause () : SystemProcess;
    resume () : SystemProcess;

    getExitStatus () : number | undefined;
    getErrorString () : string;
    getOutputString () : string;

    on (
        name     : SystemProcessEvent,
        callback : SystemProcessEventCallback
    ): SystemProcessDestructor;

}

export function isSystemProcess (value: any): value is SystemProcess {
    return (
        isRegularObject(value)
        //&& isString(value?.foo)
    );
}

export function stringifySystemProcess (value: SystemProcess): string {
    return `SystemProcess(${value})`;
}

export function parseSystemProcess (value: any): SystemProcess | undefined {
    if ( isSystemProcess(value) ) return value;
    return undefined;
}

export default SystemProcess;
