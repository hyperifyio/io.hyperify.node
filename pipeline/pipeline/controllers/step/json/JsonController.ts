// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { JsonAny, isReadonlyJsonAny, ReadonlyJsonAny } from "../../../../../../core/Json";
import { Name } from "../../../types/Name";
import { LogService } from "../../../../../../core/LogService";
import { ControllerType } from "../../types/ControllerType";
import { PipelineContext } from "../../../PipelineContext";
import { StringUtils } from "../../../../../../core/StringUtils";
import { isJsonControllerAction, JsonControllerAction } from "./JsonControllerAction";
import { BaseStepController } from "../types/BaseStepController";
import { JsonStep, isJsonStep, parseJsonStep } from "./JsonStep";
import { Controller } from "../../types/Controller";
import { isString } from "../../../../../../core/types/String";

const LOG = LogService.createLogger('JsonController');

export class JsonController extends BaseStepController {

    public static parseControllerModel (model: any) : JsonStep | undefined {
        return parseJsonStep(model);
    }

    public static isControllerModel (model: any) : model is JsonStep {
        return isJsonStep(model);
    }

    public static createController (
        context : PipelineContext,
        model   : JsonStep
    ) : Controller {
        return new JsonController(
            context,
            model.name,
            model.json,
            model.action,
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
        action         : string = JsonControllerAction.STRINGIFY,
        outputVariable : string | undefined = undefined
    ) {

        super(
            context,
            ControllerType.JSON,
            `JsonController#${name}`,
            `json#${name}`,
            name,
            input,
            action ?? JsonControllerAction.STRINGIFY,
            outputVariable
        );

    }

    public run (
        action : ReadonlyJsonAny | undefined,
        input  : ReadonlyJsonAny | undefined
    ) : ReadonlyJsonAny | undefined {

        if (!isJsonControllerAction(action)) {
            LOG.debug(`run: action = `, action);
            throw new TypeError(`JSON#${this.getName()} failed to compile the action property: ${StringUtils.toString(action)}`);
        }

        if ( action === JsonControllerAction.STRINGIFY ) {

            if (!isReadonlyJsonAny(input)) {
                throw new TypeError(`JSON#${this.getName()} failed to compile the input property as JSON: ${StringUtils.toString(input)}`);
            }

            const result : ReadonlyJsonAny | JsonAny | undefined = JSON.stringify(input, null, 2);

            if (!isString(result)) {
                LOG.debug(`run: result = `, result);
                throw new TypeError(`Failed to stringify as JSON: ${result}`);
            }

            return result;

        } else if (action === JsonControllerAction.PARSE) {

            if (!isString(input)) {
                LOG.debug(`run: input = `, input);
                throw new TypeError(`JSON#${this.getName()} failed to compile the input property as string: ${StringUtils.toString(input)}`);
            }

            return JSON.parse(input);

        } else {
            LOG.debug(`run: action = `, action);
            throw new TypeError(`Unimplemented action: ${action}`)
        }

    }

}

export function isJsonController (value: any) : value is JsonController {
    return value instanceof JsonController;
}

export default JsonController;
