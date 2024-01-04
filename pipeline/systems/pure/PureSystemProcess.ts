// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import {
    SystemProcess,
    SystemProcessDestructor,
    SystemProcessEvent,
    SystemProcessEventCallback
} from "../types/SystemProcess";
import { JsonAny } from "../../../../core/Json";
import { Observer } from "../../../../core/Observer";
import { SystemArgumentList, SystemEnvironment } from "../types/System";

/**
 * This is (partially) non-functioning pure implementation of System so that pipelines can be
 * executed on the browser (in the future) if steps are not system dependable.
 *
 * @FIXME: Implement a cloud based System to run scripts on browser
 */
export class PureSystemProcess implements SystemProcess {

    // private readonly _command   : string;
    // private readonly _args      : SystemArgumentList | undefined;
    // private readonly _env       : SystemEnvironment  | undefined;
    // private readonly _cwd       : string  | undefined;
    private readonly _observer  : Observer<SystemProcessEvent>;

    public constructor (
        // @ts-ignore @TODO: Why not used?
        command  : string,
        // @ts-ignore @TODO: Why not used?
        args     : SystemArgumentList | undefined,
        // @ts-ignore @TODO: Why not used?
        env      : SystemEnvironment  | undefined,
        // @ts-ignore @TODO: Why not used?
        cwd     : string | undefined
    ) {
        // this._command  = command;
        // this._args     = args;
        // this._env      = env;
        // this._cwd      = cwd;
        this._observer = new Observer<SystemProcessEvent>("PureSystemProcess");
    }

    public toString (): string {
        return 'PureSystemProcess';
    }

    public toJSON (): JsonAny {
        return {
            type: 'PureSystemProcess'
        };
    }

    public getErrorString (): string {
        return "";
    }

    public getOutputString (): string {
        return "";
    }

    public getExitStatus (): number | undefined {
        return undefined;
    }

    public destroy (): void {
        this._observer.destroy();
    }

    public on (
        name     : SystemProcessEvent,
        callback : SystemProcessEventCallback
    ): SystemProcessDestructor {
        return this._observer.listenEvent(name, callback);
    }

    public pause (): SystemProcess {
        this._notImplementedYet();
        return this;
    }

    public resume (): SystemProcess {
        this._notImplementedYet();
        return this;
    }

    public start (): SystemProcess {
        this._notImplementedYet();
        return this;
    }

    public stop (): SystemProcess {
        this._notImplementedYet();
        return this;
    }


    public static Event = SystemProcessEvent;


    private _notImplementedYet () {
        throw new Error(`No pure JavaScript implementation to run scripts exists yet`);
    }

}

export function isPureSystemProcess (value: any): value is PureSystemProcess {
    return value instanceof PureSystemProcess;
}

export default PureSystemProcess;
