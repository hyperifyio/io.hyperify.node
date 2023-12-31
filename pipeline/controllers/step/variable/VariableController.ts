// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { isReadonlyJsonAny, ReadonlyJsonAny } from "../../../../../core/Json";
import Name from "../../../types/Name";
import { LogService } from "../../../../../core/LogService";
import ControllerType from "../../types/ControllerType";
import PipelineContext from "../../../PipelineContext";
import { StringUtils } from "../../../../../core/StringUtils";
import BaseStepController from "../types/BaseStepController";
import VariableStep, { isVariableStep, parseVariableStep } from "./VariableStep";
import Controller from "../../types/Controller";
import VariableControllerAction, { isVariableControllerAction } from "./VariableControllerAction";

const LOG = LogService.createLogger('VariableController');

export class VariableController extends BaseStepController {

    public static parseControllerModel (model: any) : VariableStep | undefined {
        return parseVariableStep(model);
    }

    public static isControllerModel (model: any) : model is VariableStep {
        return isVariableStep(model);
    }

    public static createController (
        context : PipelineContext,
        model   : VariableStep
    ) : Controller {
        return new VariableController(
            context,
            model.name,
            model.set,
            VariableControllerAction.SET,
            model.variable
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
            `VariableController#${name}`,
            `variable#${name}`,
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

        if (!isVariableControllerAction(action)) {
            LOG.debug(`run: action = `, action);
            throw new TypeError(`variable#${this.getName()} failed to compile the action property: ${StringUtils.toString(action)}`);
        }

        if ( action === VariableControllerAction.SET ) {

            if (!isReadonlyJsonAny(input)) {
                throw new TypeError(`variable#${this.getName()} failed to compile the input property as variable: ${StringUtils.toString(input)}`);
            }

            return input;

        } else {
            LOG.debug(`run: action = `, action);
            throw new TypeError(`Unimplemented action: ${action}`)
        }

    }

}

export function isVariableController (value: any) : value is VariableController {
    return value instanceof VariableController;
}

export default VariableController;
