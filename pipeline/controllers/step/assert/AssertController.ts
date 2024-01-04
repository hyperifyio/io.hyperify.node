// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ReadonlyJsonAny } from "../../../../../core/Json";
import { Name } from "../../../types/Name";
import { LogService } from "../../../../../core/LogService";
import { ControllerType } from "../../types/ControllerType";
import { PipelineContext } from "../../../PipelineContext";
import { StringUtils } from "../../../../../core/StringUtils";
import { BaseStepController } from "../types/BaseStepController";
import { AssertStep, isAssertStep, parseAssertStep } from "./AssertStep";
import { Controller } from "../../types/Controller";
import { AssertControllerAction, isAssertControllerAction } from "./AssertControllerAction";

const LOG = LogService.createLogger('AssertController');

export class AssertController extends BaseStepController {

    public static parseControllerModel (model: any) : AssertStep | undefined {
        return parseAssertStep(model);
    }

    public static isControllerModel (model: any) : model is AssertStep {
        return isAssertStep(model);
    }

    public static createController (
        context : PipelineContext,
        model   : AssertStep
    ) : Controller {
        return new AssertController(
            context,
            model.name,
            model,
            AssertControllerAction.EQUALS,
            model.output
        );
    }

    /**
     *
     * @param context The context object, which contains variables, etc.
     * @param name The user defined name of the step
     * @param input This is usually the primary argument for the action.
     * @param target This is usually the primary argument for the action.
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
            `AssertController#${name}`,
            `assert#${name}`,
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

        if (!isAssertControllerAction(action)) {
            LOG.debug(`run: action = `, action);
            throw new TypeError(`[assert#${this.getName()}] failed to compile the action property: ${StringUtils.toString(action)}`);
        }

        if ( action === AssertControllerAction.EQUALS ) {

            if (!isAssertStep(input)) {
                throw new TypeError(`[assert#${this.getName()}] failed to compile the input property as variable: ${StringUtils.toString(input)}`);
            }

            const assertValue = input?.assert;
            const targetValue = input?.equals;

            if ( assertValue !== targetValue ) {
                throw new TypeError(`[assert#${this.getName()}] Values do not match: ${StringUtils.toString(assertValue)} vs ${StringUtils.toString(targetValue)}`)
            }

            return assertValue;

        } else {
            LOG.debug(`run: action = `, action);
            throw new TypeError(`Unimplemented action: ${action}`)
        }

    }

}

export function isAssertController (value: any) : value is AssertController {
    return value instanceof AssertController;
}

export default AssertController;
