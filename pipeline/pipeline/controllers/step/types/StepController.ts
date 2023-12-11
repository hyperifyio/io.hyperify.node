// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ObserverCallback, ObserverDestructor } from "../../../../../../core/Observer";
import { JsonAny } from "../../../../../../core/Json";
import { Name } from "../../../types/Name";
import { Controller, isController } from "../../types/Controller";
import { ControllerState } from "../../types/ControllerState";
import { PipelineContext } from "../../../PipelineContext";

export interface StepController extends Controller {

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

    start ()   : StepController;
    pause ()   : StepController;
    resume ()  : StepController;
    stop ()    : StepController;
    destroy () : void;

    onStarted (
        callback: ObserverCallback<string, [StepController]>
    ) : ObserverDestructor;

    onPaused (
        callback: ObserverCallback<string, [StepController]>
    ) : ObserverDestructor;

    onResumed (
        callback: ObserverCallback<string, [StepController]>
    ) : ObserverDestructor;

    onCancelled (
        callback: ObserverCallback<string, [StepController]>
    ) : ObserverDestructor;

    onFailed (
        callback: ObserverCallback<string, [StepController]>
    ) : ObserverDestructor;

    onFinished (
        callback: ObserverCallback<string, [StepController]>
    ) : ObserverDestructor;

    onChanged (
        callback: ObserverCallback<string, [StepController]>
    ) : ObserverDestructor;

    toString (): string;

    toJSON (): JsonAny;

}

export function isStepController (value: any): value is StepController {
    return isController(value);
}

export default StepController;
