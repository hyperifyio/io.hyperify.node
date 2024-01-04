// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import {
    isReadonlyJsonArray,
    isReadonlyJsonObject,
    ReadonlyJsonAny,
    ReadonlyJsonArray,
    ReadonlyJsonObject
} from "../../../../../core/Json";
import { Name } from "../../../types/Name";
import { LogService } from "../../../../../core/LogService";
import { ControllerType } from "../../types/ControllerType";
import { PipelineContext } from "../../../PipelineContext";
import { StringUtils } from "../../../../../core/StringUtils";
import { BaseStepController } from "../types/BaseStepController";
import { ConcatStep, isConcatStep, parseConcatStep } from "./ConcatStep";
import { Controller } from "../../types/Controller";
import { ConcatControllerAction, isConcatControllerAction } from "./ConcatControllerAction";
import { concat } from "../../../../../core/functions/concat";
import { reduce } from "../../../../../core/functions/reduce";
import { isArray, isArrayOf } from "../../../../../core/types/Array";

const LOG = LogService.createLogger('ConcatController');

export class ConcatController extends BaseStepController {

    public static parseControllerModel (model: any) : ConcatStep | undefined {
        return parseConcatStep(model);
    }

    public static isControllerModel (model: any) : model is ConcatStep {
        return isConcatStep(model);
    }

    public static createController (
        context : PipelineContext,
        model   : ConcatStep
    ) : Controller {
        return new ConcatController(
            context,
            model.name,
            model,
            ConcatControllerAction.CONCAT,
            model.output
        );
    }

    /**
     *
     * @param context The context object, which contains variables, etc.
     * @param name The user defined name of the step
     * @param input This is usually the primary argument for the action.
     * @param action This is usually the value for the property which defines the type of the
     *     step, eg. `"file"` or `"command"`.
     * @param outputVariable The variable name where to save successful results of this step
     */
    public constructor (
        context        : PipelineContext,
        name           : Name,
        input          : ReadonlyJsonAny,
        action         : string | undefined = undefined,
        outputVariable : string | undefined = undefined
    ) {

        super(
            context,
            ControllerType.VARIABLE,
            `ConcatController#${name}`,
            `concat#${name}`,
            name,
            input,
            action,
            outputVariable
        );

    }

    public run (
        action : ReadonlyJsonAny | undefined,
        input  : ReadonlyJsonAny | undefined
    ) : ReadonlyJsonAny | undefined {

        if (!isConcatControllerAction(action)) {
            LOG.debug(`run: action = `, action);
            throw new TypeError(`[concat#${this.getName()}] failed to compile the action property: ${StringUtils.toString(action)}`);
        }

        if ( action === ConcatControllerAction.CONCAT ) {

            if (!isConcatStep(input)) {
                throw new TypeError(`[concat#${this.getName()}] failed to compile the input property as variable: ${StringUtils.toString(input)}`);
            }

            const concatValues = input?.concat;

            if (isArrayOf<ReadonlyJsonArray[]>(concatValues, isReadonlyJsonArray)) {
                return concat([], ...concatValues);

            } else if (isArrayOf<ReadonlyJsonObject>(concatValues, isReadonlyJsonObject)) {
                return reduce(
                    concatValues,
                    (obj: ReadonlyJsonObject, item : ReadonlyJsonObject) : ReadonlyJsonObject => {
                        return {
                            ...obj,
                            ...item
                        };
                    },
                    {}
                );

            } else if (isArray(concatValues)) {
                return concatValues.join('');

            } else {
                return [concatValues];
            }

        } else {
            LOG.debug(`run: action = `, action);
            throw new TypeError(`Unimplemented action: ${action}`)
        }

    }

}

export function isConcatController (value: any) : value is ConcatController {
    return value instanceof ConcatController;
}

export default ConcatController;
