// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Observer, ObserverCallback, ObserverDestructor } from "../../../../../core/Observer";
import { JsonAny, ReadonlyJsonAny } from "../../../../../core/Json";
import { Name, isName } from "../../../types/Name";
import { StepController } from "../types/StepController";
import { LogService } from "../../../../../core/LogService";
import { ControllerState } from "../../types/ControllerState";
import { ScriptControllerStateDTO } from "./ScriptControllerStateDTO";
import { ControllerType } from "../../types/ControllerType";
import { PipelineContext } from "../../../PipelineContext";
import {
    SystemProcess,
    SystemProcessEvent,
    SystemProcessEventCallback
} from "../../../systems/types/SystemProcess";
import {
    System,
    isSystemArgumentList,
    isSystemEnvironment,
    SystemArgumentList,
    SystemEnvironment
} from "../../../systems/types/System";
import { isString, isStringOrUndefined } from "../../../../../core/types/String";
import { isRegularObjectOf } from "../../../../../core/types/RegularObject";
import { isArrayOf } from "../../../../../core/types/Array";

const LOG = LogService.createLogger('BaseScriptController');

export enum BaseScriptControllerEvent {

    SCRIPT_STARTED   = "BaseScriptController:scriptStarted",
    SCRIPT_PAUSED    = "BaseScriptController:scriptPaused",
    SCRIPT_RESUMED   = "BaseScriptController:scriptResumed",
    SCRIPT_CANCELLED = "BaseScriptController:scriptCancelled",
    SCRIPT_FAILED    = "BaseScriptController:scriptFailed",
    SCRIPT_FINISHED  = "BaseScriptController:scriptFinished",
    SCRIPT_CHANGED   = "BaseScriptController:scriptChanged"

}

export type BaseScriptControllerEventCallback = ObserverCallback<BaseScriptControllerEvent, [BaseScriptController]>;

export type BaseScriptControllerDestructor = ObserverDestructor;

export abstract class BaseScriptController implements StepController {

    public static Event = BaseScriptControllerEvent;
    public static State = ControllerState;


    private readonly _context        : PipelineContext;
    private readonly _observer       : Observer<BaseScriptControllerEvent>;
    private readonly _controllerType : ControllerType;
    private readonly _controllerName : string;
    private readonly _stepName       : string;
    private readonly _name           : Name;
    private readonly _command        : string;
    private readonly _cwd            : string | undefined;
    private readonly _outputVariable : string | undefined;
    private readonly _args           : SystemArgumentList;
    private readonly _env            : SystemEnvironment;
    private readonly _closeCallback  : SystemProcessEventCallback;

    private _compiledCwd            : string             | undefined;
    private _compiledCommand        : string             | undefined;
    private _compiledArgs           : SystemArgumentList | undefined;
    private _compiledEnv            : SystemEnvironment  | undefined;
    private _systemProcess          : SystemProcess      | undefined;
    private _state                  : ControllerState;

    public constructor (
        context  : PipelineContext,
        controllerType : ControllerType,
        controllerName : string,
        stepName       : string,
        name     : Name,
        command  : string,
        args     : SystemArgumentList = [],
        env      : SystemEnvironment  = {},
        cwd      : string | undefined = undefined,
        outputVariable : string | undefined = undefined
    ) {

        if ( !isString(controllerName) )       throw new TypeError(`[${stepName}] invalid controller identifier: ${controllerName}`);
        if ( !isString(stepName)       )       throw new TypeError(`[${stepName}] invalid step identifier: ${stepName}`);
        if ( !isName(name) )                   throw new TypeError(`[${stepName}] name invalid: ${name}`);
        if ( !isString(command) )              throw new TypeError(`[${stepName}#${name}] must have a valid command: ${command}`);
        if ( !isSystemArgumentList(args) )     throw new TypeError(`[${stepName}#${name}] must have a valid args: ${JSON.stringify(args)}`);
        if ( !isSystemEnvironment(env) )       throw new TypeError(`[${stepName}#${name}] must have a valid env: ${JSON.stringify(env)}`);
        if ( !isStringOrUndefined(cwd)       ) throw new TypeError(`[${stepName}#${name}] invalid cwd: ${cwd}`);
        if ( !isStringOrUndefined(outputVariable) ) throw new TypeError(`[${stepName}#${name}] invalid output variable name: ${outputVariable}`);

        this._controllerType  = controllerType;
        this._controllerName  = controllerName;
        this._stepName        = stepName;
        this._context         = context;
        this._state           = ControllerState.CONSTRUCTED;
        this._name            = name;
        this._cwd             = cwd;
        this._outputVariable  = outputVariable;
        this._command         = command;
        this._args            = args;
        this._env             = env;
        this._observer        = new Observer<BaseScriptControllerEvent>(`BaseScriptController#${name}`);
        this._closeCallback   = this._onClose.bind(this);
        this._compiledCommand = undefined;
        this._compiledArgs    = undefined;
        this._compiledEnv     = undefined;
        this._systemProcess   = undefined;

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

    public on (name : BaseScriptControllerEvent, callback: BaseScriptControllerEventCallback) : BaseScriptControllerDestructor {
        return this._observer.listenEvent(name, callback);
    }

    public toString (): string {
        return `${this._controllerName}#${this._name}`;
    }

    public getStateDTO (): ScriptControllerStateDTO {
        return {
            type: this._controllerType,
            state : this._state,
            name: this._name
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

    public start () : BaseScriptController {

        if (this._state !== ControllerState.CONSTRUCTED) {
            throw new Error(`${this._stepName}#${this._name} was already started`);
        }

        this._state = ControllerState.STARTED;

        const compiledCommand = this._context.compileModel(this._command);
        if (!isString(compiledCommand)) {
            throw new Error(`${this._stepName}#${this._name} failed to compile the command: ${this._command}`);
        }
        this._compiledCommand = compiledCommand;

        const compiledCwd = this._cwd ? this._context.compileModel(this._cwd) : undefined;
        if (!isStringOrUndefined(compiledCwd)) {
            throw new Error(`${this._stepName}#${this._name} failed to compile the cwd: ${this._cwd}`);
        }
        this._compiledCwd = compiledCwd;

        const compiledArgs : ReadonlyJsonAny | undefined = this._context.compileModel(this._args);
        if (!isArrayOf<string>(compiledArgs, isString)) {
            throw new Error(`${this._stepName}#${this._name} failed to compile args: ${this._args.join(' ')}`);
        }
        this._compiledArgs = compiledArgs;

        const compiledEnv : ReadonlyJsonAny | undefined = this._context.compileModel(this._env);
        if (!isRegularObjectOf<string, string>(compiledEnv, isString, isString)) {
            throw new Error(`${this._stepName}#${this._name} failed to compile environment: ${JSON.stringify(this._env, null, 2)}`);
        }
        this._compiledEnv = compiledEnv;

        LOG.info(`Starting command "${this._compiledCommand}" with args: "${this._compiledArgs.join('", "')}"`);

        const system : System = this._context.getSystem();

        this._systemProcess = system.createProcess(
            compiledCommand,
            compiledArgs,
            this._compiledEnv,
            this._compiledCwd
        );

        this._systemProcess.on(
            SystemProcessEvent.ON_EXIT,
            this._closeCallback
        )

        this._systemProcess.start();

        if (this._observer.hasCallbacks(BaseScriptControllerEvent.SCRIPT_STARTED)) {
            this._observer.triggerEvent(BaseScriptControllerEvent.SCRIPT_STARTED, this);
        }

        if (this._observer.hasCallbacks(BaseScriptControllerEvent.SCRIPT_CHANGED)) {
            this._observer.triggerEvent(BaseScriptControllerEvent.SCRIPT_CHANGED, this);
        }

        return this;

    }

    public pause () : BaseScriptController {

        if ( !this.isRunning() ) {
            throw new Error(`${this._stepName}#${this._name} was not running`);
        }

        if ( !this._systemProcess ) throw new Error(`No process initialized`);

        LOG.info(`Pausing command "${this._command} ${this._args.join(' ')}"`);

        this._state = ControllerState.PAUSED;

        this._systemProcess.pause();

        if (this._observer.hasCallbacks(BaseScriptControllerEvent.SCRIPT_PAUSED)) {
            this._observer.triggerEvent(BaseScriptControllerEvent.SCRIPT_PAUSED, this);
        }
        if (this._observer.hasCallbacks(BaseScriptControllerEvent.SCRIPT_CHANGED)) {
            this._observer.triggerEvent(BaseScriptControllerEvent.SCRIPT_CHANGED, this);
        }

        return this;

    }

    public resume () : BaseScriptController {

        if ( !this.isPaused() ) {
            throw new Error(`${this._stepName}#${this._name} was not paused`);
        }

        if ( !this._systemProcess ) {
            throw new Error(`No process initialized`);
        }

        LOG.info(`Resuming command "${this._command} ${this._args.join(' ')}"`);

        this._state = ControllerState.STARTED;

        this._systemProcess.resume();

        if (this._observer.hasCallbacks(BaseScriptControllerEvent.SCRIPT_RESUMED)) {
            this._observer.triggerEvent(BaseScriptControllerEvent.SCRIPT_RESUMED, this);
        }
        if (this._observer.hasCallbacks(BaseScriptControllerEvent.SCRIPT_CHANGED)) {
            this._observer.triggerEvent(BaseScriptControllerEvent.SCRIPT_CHANGED, this);
        }

        return this;

    }

    public stop () : BaseScriptController {

        if ( this._state !== ControllerState.STARTED ) {
            throw new Error(`${this._stepName}#${this._name} was not started`);
        }

        if ( !this._systemProcess ) throw new Error(`No process initialized`);

        LOG.debug(`Cancelling command "${this._command} ${this._args.join(' ')}"`);

        this._state = ControllerState.CANCELLED;

        this._systemProcess.stop();

        if (this._observer.hasCallbacks(BaseScriptControllerEvent.SCRIPT_CANCELLED)) {
            this._observer.triggerEvent(BaseScriptControllerEvent.SCRIPT_CANCELLED, this);
        }

        if (this._observer.hasCallbacks(BaseScriptControllerEvent.SCRIPT_CHANGED)) {
            this._observer.triggerEvent(BaseScriptControllerEvent.SCRIPT_CHANGED, this);
        }

        return this;

    }

    public onStarted (callback: ObserverCallback<string, [BaseScriptController]>) : BaseScriptControllerDestructor {
        return this.on(BaseScriptControllerEvent.SCRIPT_STARTED, callback);
    }

    public onPaused (callback: ObserverCallback<string, [BaseScriptController]>) : BaseScriptControllerDestructor {
        return this.on(BaseScriptControllerEvent.SCRIPT_PAUSED, callback);
    }

    public onResumed (callback: ObserverCallback<string, [BaseScriptController]>) : BaseScriptControllerDestructor {
        return this.on(BaseScriptControllerEvent.SCRIPT_RESUMED, callback);
    }

    public onCancelled (callback: ObserverCallback<string, [BaseScriptController]>) : BaseScriptControllerDestructor {
        return this.on(BaseScriptControllerEvent.SCRIPT_CANCELLED, callback);
    }

    public onFailed (callback: ObserverCallback<string, [BaseScriptController]>) : BaseScriptControllerDestructor {
        return this.on(BaseScriptControllerEvent.SCRIPT_FAILED, callback);
    }

    public onFinished (callback: ObserverCallback<string, [BaseScriptController]>) : BaseScriptControllerDestructor {
        return this.on(BaseScriptControllerEvent.SCRIPT_FINISHED, callback);
    }

    public onChanged (callback: ObserverCallback<string, [BaseScriptController]>) : BaseScriptControllerDestructor {
        return this.on(BaseScriptControllerEvent.SCRIPT_CHANGED, callback);
    }

    public getErrorString () : string {
        return this._systemProcess ? this._systemProcess.getErrorString() : "";
    }

    public getOutputString () : string {
        return this._systemProcess ? this._systemProcess.getOutputString() : "";
    }


    private _onClose (
        // @ts-ignore
        event: SystemProcessEvent, child: SystemProcess) {

        const code = child.getExitStatus();

        LOG.debug(`Child process stopped with exit status ${code}`);

        if (code === 0) {

            this._state = ControllerState.FINISHED;
            if (this._observer.hasCallbacks(BaseScriptControllerEvent.SCRIPT_FINISHED)) {
                this._observer.triggerEvent(BaseScriptControllerEvent.SCRIPT_FINISHED, this);
            }

            if (this._outputVariable !== undefined) {
                this._context.setVariable(this._outputVariable, this.getOutputString());
            }

        } else {

            this._state = ControllerState.FAILED;
            if (this._observer.hasCallbacks(BaseScriptControllerEvent.SCRIPT_FAILED)) {
                this._observer.triggerEvent(BaseScriptControllerEvent.SCRIPT_FAILED, this);
            }

        }

        if (this._observer.hasCallbacks(BaseScriptControllerEvent.SCRIPT_CHANGED)) {
            this._observer.triggerEvent(BaseScriptControllerEvent.SCRIPT_CHANGED, this);
        }

    }

}

export function isBaseScriptController (value: any) : value is BaseScriptController {
    return value instanceof BaseScriptController;
}

export default BaseScriptController;
