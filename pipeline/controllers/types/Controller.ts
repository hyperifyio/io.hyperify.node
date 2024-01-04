// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import Name from "../../types/Name";
import { ObserverCallback, ObserverDestructor } from "../../../../core/Observer";
import { JsonAny } from "../../../../core/Json";
import ControllerState from "./ControllerState";
import ControllerStateDTO from "./ControllerStateDTO";
import PipelineContext from "../../PipelineContext";
import { isFunction } from "../../../../core/types/Function";
import { isObject } from "../../../../core/types/Object";

export interface Controller {

    getState () : ControllerState;
    getName () : Name;
    getContext () : PipelineContext;

    isRunning ()    : boolean;
    isStarted ()    : boolean;
    isPaused ()     : boolean;
    isCancelled ()  : boolean;
    isFinished ()   : boolean;
    isFailed ()     : boolean;
    isSuccessful () : boolean;

    start ()   : Controller;
    pause ()   : Controller;
    resume ()  : Controller;
    stop ()    : Controller;
    destroy () : void;

    onStarted (
        callback: ObserverCallback<string, [Controller]>
    ) : ObserverDestructor;

    onPaused (
        callback: ObserverCallback<string, [Controller]>
    ) : ObserverDestructor;

    onResumed (
        callback: ObserverCallback<string, [Controller]>
    ) : ObserverDestructor;

    onCancelled (
        callback: ObserverCallback<string, [Controller]>
    ) : ObserverDestructor;

    onFailed (
        callback: ObserverCallback<string, [Controller]>
    ) : ObserverDestructor;

    onFinished (
        callback: ObserverCallback<string, [Controller]>
    ) : ObserverDestructor;

    onChanged (
        callback: ObserverCallback<string, [Controller]>
    ) : ObserverDestructor;

    getErrorString () : string;

    getOutputString () : string;

    toString (): string;

    getStateDTO () : ControllerStateDTO;

    toJSON (): JsonAny;

}

export function isController (value: any): value is Controller {
    return (
        isObject(value)
        && isFunction(value?.getName)
        && isFunction(value?.isRunning)
        && isFunction(value?.isStarted)
        && isFunction(value?.isPaused)
        && isFunction(value?.isCancelled)
        && isFunction(value?.isFinished)
        && isFunction(value?.isFailed)
        && isFunction(value?.isSuccessful)
        && isFunction(value?.start)
        && isFunction(value?.pause)
        && isFunction(value?.resume)
        && isFunction(value?.stop)
        && isFunction(value?.destroy)
        && isFunction(value?.toString)
        && isFunction(value?.toJSON)
        && isFunction(value?.onStarted)
        && isFunction(value?.onPaused)
        && isFunction(value?.onResumed)
        && isFunction(value?.onCancelled)
        && isFunction(value?.onFailed)
        && isFunction(value?.onFinished)
        && isFunction(value?.onChanged)
    );
}

export default Controller;
