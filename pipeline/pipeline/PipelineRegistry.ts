// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Step } from "./types/Step";
import { ControllerFactory } from "./controllers/types/ControllerFactory";
import { find } from "../../../core/functions/find";
import { reduce } from "../../../core/functions/reduce";

export class PipelineRegistry {

    private static _stepControllers : ControllerFactory[] = [];

    public static hasControllers () : boolean {
        return this._stepControllers.length !== 0;
    }

    public static registerController (controller : ControllerFactory) {
        if (find(this._stepControllers, (item: ControllerFactory) : boolean => item === controller) === undefined) {
            this._stepControllers.push(controller);
        }
    }

    public static findController (model : Step) : ControllerFactory | undefined {
        return find(this._stepControllers, (item: ControllerFactory): boolean => item.isControllerModel(model));
    }

    public static parseControllerModel (model : any) : Step | undefined {
        return reduce(
            this._stepControllers,
            (prevResult: any, item: ControllerFactory) => {
                if (prevResult !== undefined) {
                    return prevResult;
                }
                return item.parseControllerModel(model);
            },
            undefined
        );
    }

}

export default PipelineRegistry;
