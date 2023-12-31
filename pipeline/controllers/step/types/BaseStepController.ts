// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Observer, ObserverCallback, ObserverDestructor } from "../../../../../core/Observer";
import { JsonAny } from "../../../../../core/Json";
import { isReadonlyJsonAny, ReadonlyJsonAny } from "../../../../../core/Json";
import { Name, isName } from "../../../types/Name";
import { StepController } from "./StepController";
import { LogService } from "../../../../../core/LogService";
import { ControllerState } from "../../types/ControllerState";
import { BaseStepControllerStateDTO } from "./BaseStepControllerStateDTO";
import { ControllerType } from "../../types/ControllerType";
import { PipelineContext } from "../../../PipelineContext";
import { StringUtils } from "../../../../../core/StringUtils";
import { isUndefined } from "../../../../../core/types/undefined";
import { isString } from "../../../../../core/types/String";
import { isFunction } from "../../../../../core/types/Function";
import { isPromise } from "../../../../../core/types/Promise";

const LOG = LogService.createLogger('BaseStepController');

export enum BaseStepControllerEvent {

    JSON_STARTED   = "BaseStepController:scriptStarted",
    JSON_PAUSED    = "BaseStepController:scriptPaused",
    JSON_RESUMED   = "BaseStepController:scriptResumed",
    JSON_CANCELLED = "BaseStepController:scriptCancelled",
    JSON_FAILED    = "BaseStepController:scriptFailed",
    JSON_FINISHED  = "BaseStepController:scriptFinished",
    JSON_CHANGED   = "BaseStepController:scriptChanged"

}


export type BaseStepControllerEventCallback = ObserverCallback<BaseStepControllerEvent, [BaseStepController]>;

export type BaseStepControllerDestructor = ObserverDestructor;

export abstract class BaseStepController implements StepController {

    public static Event = BaseStepControllerEvent;
    public static State = ControllerState;


    private readonly _context        : PipelineContext;
    private readonly _observer       : Observer<BaseStepControllerEvent>;
    private readonly _controllerType : ControllerType;
    private readonly _controllerName : string;
    private readonly _stepName       : string;
    private readonly _name           : Name;
    private readonly _action         : ReadonlyJsonAny;
    private readonly _input          : ReadonlyJsonAny | undefined;
    private readonly _output         : string | undefined;

    private _state              : ControllerState;
    private _compiledAction     : ReadonlyJsonAny  | undefined;
    private _compiledInput      : ReadonlyJsonAny  | undefined;
    private _compiledOutput     : string           | undefined;
    private _successResult      : any              | undefined;
    private _errorResult        : any              | undefined;

    /**
     *
     * @param context         The context object, which contains variables, etc.
     * @param controllerType  The type of this controller in log files, eg. `ControllerType.JSON`.
     * @param controllerName  The display name of this controller in log files, eg. `"JsonController"`.
     * @param stepName        The display name of this type of actions, eg. usually the property name like `"file"` or "`command`".
     * @param name            The user defined name of the step
     * @param input           This is usually the primary argument for the action.
     * @param action          This is usually the value for the property which defines the type of the step, eg. `"file"` or `"command"`.
     * @param outputVariable  The variable name where to save successful results of this step
     */
    protected constructor (
        context        : PipelineContext,
        controllerType : ControllerType,
        controllerName : string,
        stepName       : string,
        name           : Name,
        input          : ReadonlyJsonAny | undefined = undefined,
        action         : ReadonlyJsonAny | undefined = undefined,
        outputVariable : string          | undefined = undefined
    ) {

        if ( !isString(controllerName) ) throw new TypeError(`[${controllerName}] invalid controller identifier: ${controllerName}`);
        if ( !isString(stepName)       ) throw new TypeError(`[${stepName}] invalid step identifier: ${stepName}`);
        if ( !isName(name)             ) throw new TypeError(`[${stepName}] invalid name: ${name}`);
        if ( !isString(action)         ) throw new TypeError(`[${stepName}] must have a valid string: ${action}`);
        if ( !(isUndefined(input) || isReadonlyJsonAny(input)) ) throw new TypeError(`[${stepName}] must have a valid input property: ${JSON.stringify(input)}`);
        if ( !(isUndefined(outputVariable) || isString(outputVariable)) ) throw new TypeError(`[${stepName}] must have a valid output property: ${JSON.stringify(outputVariable)}`);

        this._controllerType  = controllerType;
        this._controllerName  = controllerName;
        this._stepName        = stepName;
        this._name            = name;
        this._context         = context;
        this._state           = ControllerState.CONSTRUCTED;
        this._action          = action;
        this._input           = input;
        this._output          = outputVariable;
        this._observer        = new Observer<BaseStepControllerEvent>(`BaseStepController#${name}`);
        this._compiledAction  = undefined;
        this._compiledInput   = undefined;
        this._compiledOutput  = undefined;
        this._successResult   = undefined;
        this._successResult   = undefined;
        this._errorResult     = undefined;

    }

    public destroy () {

        this._observer.destroy();

        if (this.isPaused()) {
            this.resume().stop();
        } else if (this.isRunning()) {
            this.stop();
        }

    }

    public getContext () : PipelineContext {
        return this._context;
    }

    public getState () : ControllerState {
        return this._state;
    }

    public getName () : Name {
        return this._name;
    }

    public on (name : BaseStepControllerEvent, callback: BaseStepControllerEventCallback) : BaseStepControllerDestructor {
        return this._observer.listenEvent(name, callback);
    }

    public toString (): string {
        return `${this._controllerName}`;
    }

    public getStateDTO (): BaseStepControllerStateDTO {
        return {
            type  : this._controllerType,
            state : this._state,
            name  : this._name
        };
    }

    public toJSON (): JsonAny {
        return this.getStateDTO() as unknown as JsonAny;
    }

    public isRunning () : boolean {
        switch (this._state) {

            case ControllerState.STARTED:
                return true;

            case ControllerState.PAUSED:
            case ControllerState.CONSTRUCTED:
            case ControllerState.CANCELLED:
            case ControllerState.FINISHED:
            case ControllerState.FAILED:
            case ControllerState.UNCONSTRUCTED:
                return false;

        }
    }

    public isStarted () : boolean {
        switch (this._state) {

            case ControllerState.STARTED:
            case ControllerState.PAUSED:
                return true;

            case ControllerState.CONSTRUCTED:
            case ControllerState.CANCELLED:
            case ControllerState.FINISHED:
            case ControllerState.FAILED:
            case ControllerState.UNCONSTRUCTED:
                return false;

        }
    }

    public isPaused () : boolean {
        switch (this._state) {

            case ControllerState.PAUSED:
                return true;

            case ControllerState.CONSTRUCTED:
            case ControllerState.STARTED:
            case ControllerState.CANCELLED:
            case ControllerState.FINISHED:
            case ControllerState.FAILED:
            case ControllerState.UNCONSTRUCTED:
                return false;

        }
    }

    public isFinished () : boolean {
        switch (this._state) {

            case ControllerState.CANCELLED:
            case ControllerState.FINISHED:
            case ControllerState.FAILED:
                return true;

            case ControllerState.CONSTRUCTED:
            case ControllerState.STARTED:
            case ControllerState.PAUSED:
            case ControllerState.UNCONSTRUCTED:
                return false;

        }
    }

    public isSuccessful () : boolean {
        switch (this._state) {

            case ControllerState.FINISHED:
                return true;

            case ControllerState.FAILED:
            case ControllerState.CANCELLED:
            case ControllerState.CONSTRUCTED:
            case ControllerState.STARTED:
            case ControllerState.PAUSED:
            case ControllerState.UNCONSTRUCTED:
                return false;

        }
    }

    public isCancelled () : boolean {
        switch (this._state) {

            case ControllerState.CANCELLED:
                return true;

            case ControllerState.FINISHED:
            case ControllerState.FAILED:
            case ControllerState.CONSTRUCTED:
            case ControllerState.STARTED:
            case ControllerState.PAUSED:
            case ControllerState.UNCONSTRUCTED:
                return false;

        }
    }

    public isFailed () : boolean {
        switch (this._state) {

            case ControllerState.FAILED:
            case ControllerState.UNCONSTRUCTED:
                return true;

            case ControllerState.CANCELLED:
            case ControllerState.FINISHED:
            case ControllerState.CONSTRUCTED:
            case ControllerState.STARTED:
            case ControllerState.PAUSED:
                return false;

        }
    }

    /**
     * Implements the actual task.
     *
     * It may return Promise, in which case it will be waited.
     *
     * Otherwise the task finished instantly at start up.
     */
    public abstract run (
        action : ReadonlyJsonAny | undefined,
        input  : ReadonlyJsonAny | undefined
    ) : any;

    /**
     * @FIXME: Implement promise support
     */
    public start () : BaseStepController {

        try {

            if (this._state !== ControllerState.CONSTRUCTED) {
                throw new Error(`[${this._stepName}] was already started`);
            }

            this._state = ControllerState.STARTED;

            const compiledAction = this._context.compileModel(this._action);
            if (!isReadonlyJsonAny(compiledAction)) {
                throw new Error(`[${this._stepName}] failed to compile the action property: ${StringUtils.toString(this._action)}`);
            }
            this._compiledAction = compiledAction;

            const compiledInput : ReadonlyJsonAny | undefined = this._input !== undefined ? this._context.compileModel(this._input) : undefined;
            if (!( isUndefined(compiledInput) || isReadonlyJsonAny(compiledInput) )) {
                throw new Error(`[${this._stepName}] failed to compile the input property: ${StringUtils.toString(this._input)}`);
            }
            this._compiledInput = compiledInput;

            const compiledOutput : ReadonlyJsonAny | undefined = this._output ? this._context.compileModel(this._output) : undefined;
            if (!( isString(compiledOutput) || isUndefined(compiledOutput) )) {
                throw new Error(`[${this._stepName}] failed to compile the output property: ${StringUtils.toString(this._output)}`);
            }
            this._compiledOutput = compiledOutput;

            LOG.info(`Starting ${this._stepName} action "${this._compiledAction}" for `, this._compiledInput);

            if (this._observer.hasCallbacks(BaseStepControllerEvent.JSON_STARTED)) {
                this._observer.triggerEvent(BaseStepControllerEvent.JSON_STARTED, this);
            }

            if (this._observer.hasCallbacks(BaseStepControllerEvent.JSON_CHANGED)) {
                this._observer.triggerEvent(BaseStepControllerEvent.JSON_CHANGED, this);
            }

            if (!isFunction(this.run)) {
                throw new Error(`[${this._stepName}] the controller did not implement the "run" property`);
            }

            let result : any = this.run(this._compiledAction, this._compiledInput);

            if (isPromise(result)) {

                result.then(
                    (successResult: any) => {
                        this._successCloseAction(successResult);
                    },
                    (err) => {
                        this._errorCloseAction(err);
                    }
                );

            } else {
                this._successCloseAction(result);
            }

        } catch (err) {
            this._errorCloseAction(err);
        }

        return this;

    }

    public pause () : BaseStepController {
        // FIXME: Implement promise support
        throw new Error(`[${this._stepName}] was not running`);
    }

    public resume () : BaseStepController {
        // FIXME: Implement promise support
        throw new Error(`[${this._stepName}] was not paused`);
    }

    public stop () : BaseStepController {
        // FIXME: Implement promise / cancel support
        throw new Error(`[${this._stepName}] was not started`);
    }

    public onStarted (callback: ObserverCallback<string, [BaseStepController]>) : BaseStepControllerDestructor {
        return this.on(BaseStepControllerEvent.JSON_STARTED, callback);
    }

    public onPaused (callback: ObserverCallback<string, [BaseStepController]>) : BaseStepControllerDestructor {
        return this.on(BaseStepControllerEvent.JSON_PAUSED, callback);
    }

    public onResumed (callback: ObserverCallback<string, [BaseStepController]>) : BaseStepControllerDestructor {
        return this.on(BaseStepControllerEvent.JSON_RESUMED, callback);
    }

    public onCancelled (callback: ObserverCallback<string, [BaseStepController]>) : BaseStepControllerDestructor {
        return this.on(BaseStepControllerEvent.JSON_CANCELLED, callback);
    }

    public onFailed (callback: ObserverCallback<string, [BaseStepController]>) : BaseStepControllerDestructor {
        return this.on(BaseStepControllerEvent.JSON_FAILED, callback);
    }

    public onFinished (callback: ObserverCallback<string, [BaseStepController]>) : BaseStepControllerDestructor {
        return this.on(BaseStepControllerEvent.JSON_FINISHED, callback);
    }

    public onChanged (callback: ObserverCallback<string, [BaseStepController]>) : BaseStepControllerDestructor {
        return this.on(BaseStepControllerEvent.JSON_CHANGED, callback);
    }

    public getErrorString () : string {
        return this._errorResult ? `${this._errorResult}` : "";
    }

    public getOutputString () : string {
        return this._successResult ? `${this._successResult}` : "";
    }


    protected _successCloseAction (
        result: any | undefined
    ) {

        LOG.error(`Action success: `, result);

        if (this._compiledOutput !== undefined) {
            LOG.info(`Saving output as variable "${this._compiledOutput}": `, result)
            this._context.setVariable(this._compiledOutput, result);
        } else {
            LOG.info(`No output target configured for result: `, result);
        }

        this._successResult = result;
        this._state = ControllerState.FINISHED;
        if (this._observer.hasCallbacks(BaseStepControllerEvent.JSON_FINISHED)) {
            this._observer.triggerEvent(BaseStepControllerEvent.JSON_FINISHED, this);
        }

        if (this._observer.hasCallbacks(BaseStepControllerEvent.JSON_CHANGED)) {
            this._observer.triggerEvent(BaseStepControllerEvent.JSON_CHANGED, this);
        }

    }

    protected _errorCloseAction (
        err: any | undefined
    ) {

        LOG.error(`Action failed: `, err);

        this._errorResult = err;

        this._state = ControllerState.FAILED;
        if (this._observer.hasCallbacks(BaseStepControllerEvent.JSON_FAILED)) {
            this._observer.triggerEvent(BaseStepControllerEvent.JSON_FAILED, this);
        }

        if (this._observer.hasCallbacks(BaseStepControllerEvent.JSON_CHANGED)) {
            this._observer.triggerEvent(BaseStepControllerEvent.JSON_CHANGED, this);
        }

    }

}

export function isBaseStepController (value: any) : value is BaseStepController {
    return value instanceof BaseStepController;
}

export default BaseStepController;
