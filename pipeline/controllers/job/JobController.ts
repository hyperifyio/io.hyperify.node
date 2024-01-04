// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Observer, ObserverCallback, ObserverDestructor } from "../../../../core/Observer";
import { JsonAny } from "../../../../core/Json";
import { Name, isName } from "../../types/Name";
import { StepController, isStepController } from "../step/types/StepController";
import { filter } from "../../../../core/functions/filter";
import { map } from "../../../../core/functions/map";
import { isArrayOf } from "../../../../core/types/Array";
import { LogService } from "../../../../core/LogService";
import { Controller } from "../types/Controller";
import { ControllerState } from "../types/ControllerState";
import { StepControllerStateDTO } from "../step/types/StepControllerStateDTO";
import { JobControllerStateDTO } from "./JobControllerStateDTO";
import { ControllerType } from "../types/ControllerType";
import { PipelineContext } from "../../PipelineContext";

const LOG = LogService.createLogger('JobController');

export enum JobControllerEvent {

    JOB_CHANGED   = "JobController:jobChanged",
    JOB_STARTED   = "JobController:jobStarted",
    JOB_PAUSED    = "JobController:jobPaused",
    JOB_RESUMED   = "JobController:jobResumed",
    JOB_CANCELLED = "JobController:jobCancelled",
    JOB_FAILED    = "JobController:jobFailed",
    JOB_FINISHED  = "JobController:jobFinished",

}

export type JobControllerDestructor = ObserverDestructor;

export class JobController implements Controller {

    private readonly _context         : PipelineContext;
    private readonly _observer        : Observer<JobControllerEvent>;
    private readonly _name            : Name;
    private readonly _steps           : StepController[];
    private readonly _changedCallback : (event: string, step : StepController) => void;

    private _state           : ControllerState;
    private _stepDestructors : ObserverDestructor[];
    private _current         : number;

    public constructor (
        context : PipelineContext,
        name  : Name,
        steps : StepController[] = []
    ) {

        if ( !isName(name) ) throw new TypeError(`Job name invalid: ${name}`);
        if ( !isArrayOf(steps, isStepController, 1) ) throw new TypeError(`Job#${name} must have at least one step`);

        this._context         = context;
        this._current         = 0;
        this._name            = name;
        this._steps           = steps;
        this._observer        = new Observer<JobControllerEvent>(`JobController#${this._name}`);
        this._state           = ControllerState.CONSTRUCTED;
        this._changedCallback = this._onChanged.bind(this);
        this._stepDestructors = map(steps, (item: StepController) => item.onChanged(this._changedCallback));

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

    public destroy (): void {

        this._observer.destroy();

        this._stepDestructors = filter(this._stepDestructors, (item : ObserverDestructor, index: number) : boolean => {
            const step = this._steps[index];
            try {
                item();
            } catch (err) {
                LOG.warn(`Warning! Exception in the step#${step.getName()} listener destructor: `, err);
            }
            return false;
        });

    }

    public on (
        name: JobControllerEvent,
        callback: ObserverCallback<JobControllerEvent>
    ): JobControllerDestructor {
        return this._observer.listenEvent(name, callback);
    }

    public toString (): string {
        return `JobController#${this._name}`;
    }

    public getStateDTO (): JobControllerStateDTO {
        return {
            type  : ControllerType.JOB,
            state : this._state,
            name  : this._name,
            steps : map(this._steps, (item: StepController) : StepControllerStateDTO => item.getStateDTO())
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

            case ControllerState.PAUSED:
            case ControllerState.STARTED:
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

            case ControllerState.STARTED:
            case ControllerState.CONSTRUCTED:
            case ControllerState.CANCELLED:
            case ControllerState.FINISHED:
            case ControllerState.FAILED:
            case ControllerState.UNCONSTRUCTED:
                return false;

        }
    }

    public isCancelled () : boolean {
        switch (this._state) {

            case ControllerState.CANCELLED:
            case ControllerState.UNCONSTRUCTED:
                return true;

            case ControllerState.PAUSED:
            case ControllerState.STARTED:
            case ControllerState.CONSTRUCTED:
            case ControllerState.FINISHED:
            case ControllerState.FAILED:
                return false;

        }
    }

    public isFinished () : boolean {
        switch (this._state) {

            case ControllerState.FINISHED:
            case ControllerState.FAILED:
            case ControllerState.CANCELLED:
                return true;

            case ControllerState.CONSTRUCTED:
            case ControllerState.PAUSED:
            case ControllerState.STARTED:
            case ControllerState.UNCONSTRUCTED:
                return false;

        }
    }

    public isFailed () : boolean {
        switch (this._state) {

            case ControllerState.FAILED:
            case ControllerState.UNCONSTRUCTED:
                return true;

            case ControllerState.CONSTRUCTED:
            case ControllerState.FINISHED:
            case ControllerState.PAUSED:
            case ControllerState.STARTED:
            case ControllerState.CANCELLED:
                return false;

        }
    }

    public isSuccessful () : boolean {
        switch (this._state) {

            case ControllerState.FINISHED:
                return true;

            case ControllerState.FAILED:
            case ControllerState.CONSTRUCTED:
            case ControllerState.PAUSED:
            case ControllerState.STARTED:
            case ControllerState.CANCELLED:
            case ControllerState.UNCONSTRUCTED:
                return false;

        }
    }

    public start () : JobController {

        if (this._state !== ControllerState.CONSTRUCTED) {
            throw new Error(`Job#${this._name} was already started`);
        }

        LOG.info(`Starting job ${this._name}`);

        this._state = ControllerState.STARTED;

        this._steps[this._current].start();

        if (this._observer.hasCallbacks(JobControllerEvent.JOB_STARTED)) {
            this._observer.triggerEvent(JobControllerEvent.JOB_STARTED, this);
        }

        if (this._observer.hasCallbacks(JobControllerEvent.JOB_CHANGED)) {
            this._observer.triggerEvent(JobControllerEvent.JOB_CHANGED, this);
        }

        return this;

    }

    public pause ()   : JobController {

        if ( !this.isRunning() ) {
            throw new Error(`Job#${this._name} was not running`);
        }

        LOG.info(`Pausing job ${this._name}`);

        this._state = ControllerState.PAUSED;

        this._steps[this._current].pause();

        if (this._observer.hasCallbacks(JobControllerEvent.JOB_PAUSED)) {
            this._observer.triggerEvent(JobControllerEvent.JOB_PAUSED, this);
        }

        if (this._observer.hasCallbacks(JobControllerEvent.JOB_CHANGED)) {
            this._observer.triggerEvent(JobControllerEvent.JOB_CHANGED, this);
        }

        return this;

    }

    public resume ()  : JobController {

        if ( !this.isPaused() ) {
            throw new Error(`Job#${this._name} was not paused`);
        }

        LOG.info(`Resuming job ${this._name}`);

        this._state = ControllerState.STARTED;

        this._steps[this._current].resume();

        if (this._observer.hasCallbacks(JobControllerEvent.JOB_RESUMED)) {
            this._observer.triggerEvent(JobControllerEvent.JOB_RESUMED, this);
        }

        if (this._observer.hasCallbacks(JobControllerEvent.JOB_CHANGED)) {
            this._observer.triggerEvent(JobControllerEvent.JOB_CHANGED, this);
        }

        return this;

    }

    public stop ()    : JobController {

        if ( this._state !== ControllerState.STARTED ) {
            throw new Error(`Job#${this._name} was not started`);
        }

        LOG.info(`Stopping job ${this._name}`);

        this._state = ControllerState.CANCELLED;

        this._steps[this._current].stop();

        if (this._observer.hasCallbacks(JobControllerEvent.JOB_CANCELLED)) {
            this._observer.triggerEvent(JobControllerEvent.JOB_CANCELLED, this);
        }

        if (this._observer.hasCallbacks(JobControllerEvent.JOB_CHANGED)) {
            this._observer.triggerEvent(JobControllerEvent.JOB_CHANGED, this);
        }

        return this;

    }

    public onCancelled (callback: ObserverCallback<JobControllerEvent, [ JobController ]>): ObserverDestructor {
        return this.on(JobControllerEvent.JOB_CANCELLED, callback);
    }

    public onChanged (callback: ObserverCallback<JobControllerEvent, [ JobController ]>): ObserverDestructor {
        return this.on(JobControllerEvent.JOB_CHANGED, callback);
    }

    public onFailed (callback: ObserverCallback<JobControllerEvent, [ JobController ]>): ObserverDestructor {
        return this.on(JobControllerEvent.JOB_FAILED, callback);
    }

    public onFinished (callback: ObserverCallback<JobControllerEvent, [ JobController ]>): ObserverDestructor {
        return this.on(JobControllerEvent.JOB_FINISHED, callback);
    }

    public onPaused (callback: ObserverCallback<JobControllerEvent, [ JobController ]>): ObserverDestructor {
        return this.on(JobControllerEvent.JOB_PAUSED, callback);
    }

    public onResumed (callback: ObserverCallback<JobControllerEvent, [ JobController ]>): ObserverDestructor {
        return this.on(JobControllerEvent.JOB_RESUMED, callback);
    }

    public onStarted (callback: ObserverCallback<JobControllerEvent, [ JobController ]>): ObserverDestructor {
        return this.on(JobControllerEvent.JOB_STARTED, callback);
    }

    public getErrorString () : string {
        return map(this._steps, (step: StepController) => step.getErrorString()).join('\n');
    }

    public getOutputString () : string {
        return map(this._steps, (step: StepController) => step.getOutputString()).join('\n');
    }

    public static Event = JobControllerEvent;


    private _onChanged (
        // @ts-ignore
        event: string, eventStep : StepController) : void {

        const prevState = this._state;

        const currentStep = this._steps[this._current];

        if ( eventStep !== currentStep ) {
            return;
        }

        if ( currentStep.isFinished() && this.isStarted() ) {

            try {
                const index = this._steps.indexOf(currentStep);
                this._stepDestructors[index]();
            } catch (err) {
                LOG.warn(`Warning! Exception in the step#${currentStep.getName()} listener destructor: `, err);
            }

            if ( currentStep.isFailed() ) {

                this._state = ControllerState.FAILED;

                if ( this._observer.hasCallbacks(JobControllerEvent.JOB_FAILED) ) {
                    this._observer.triggerEvent(JobControllerEvent.JOB_FAILED, this);
                }

            } else if (currentStep.isCancelled()) {

                this._state = ControllerState.CANCELLED;

                if ( this._observer.hasCallbacks(JobControllerEvent.JOB_CANCELLED) ) {
                    this._observer.triggerEvent(JobControllerEvent.JOB_CANCELLED, this);
                }

            } else {

                this._current += 1;

                if ( this._current < this._steps.length ) {

                    this._state = ControllerState.STARTED;

                    this._steps[this._current].start();

                    if ( prevState === ControllerState.PAUSED && this._observer.hasCallbacks(JobControllerEvent.JOB_RESUMED) ) {
                        this._observer.triggerEvent(JobControllerEvent.JOB_RESUMED, this);
                    }

                } else {

                    this._state = ControllerState.FINISHED;

                    if (this._observer.hasCallbacks(JobControllerEvent.JOB_FINISHED)) {
                        this._observer.triggerEvent(JobControllerEvent.JOB_FINISHED, this);
                    }

                }

            }

            if (this._observer.hasCallbacks(JobControllerEvent.JOB_CHANGED)) {
                this._observer.triggerEvent(JobControllerEvent.JOB_CHANGED, this);
            }

        } else if ( currentStep.isPaused() && !this.isPaused() ) {

            this._state = ControllerState.PAUSED;

            if ( this._observer.hasCallbacks(JobControllerEvent.JOB_PAUSED) ) {
                this._observer.triggerEvent(JobControllerEvent.JOB_PAUSED, this);
            }

            if (this._observer.hasCallbacks(JobControllerEvent.JOB_CHANGED)) {
                this._observer.triggerEvent(JobControllerEvent.JOB_CHANGED, this);
            }

        } else if ( currentStep.isStarted() && this.isPaused() ) {

            this._state = ControllerState.STARTED;

            if ( this._observer.hasCallbacks(JobControllerEvent.JOB_RESUMED) ) {
                this._observer.triggerEvent(JobControllerEvent.JOB_RESUMED, this);
            }

            if (this._observer.hasCallbacks(JobControllerEvent.JOB_CHANGED)) {
                this._observer.triggerEvent(JobControllerEvent.JOB_CHANGED, this);
            }

        }

    }

}

export function isJobController (value: any): value is JobController {
    return value instanceof JobController;
}

export default JobController;
