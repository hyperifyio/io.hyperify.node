// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ReadonlyJsonAny } from "../../../../../core/Json";
import { Name } from "../../../types/Name";
import { LogService } from "../../../../../core/LogService";
import { ControllerType } from "../../types/ControllerType";
import { PipelineContext } from "../../../PipelineContext";
import { StringUtils } from "../../../../../core/StringUtils";
import { isCsv, parseCsv, stringifyCsv } from "../../../../../core/Csv";
import { Controller } from "../../types/Controller";
import { isCsvControllerAction, CsvControllerAction } from "./CsvControllerAction";
import { BaseStepController } from "../types/BaseStepController";
import { CsvStep, isCsvStep, parseCsvStep } from "./CsvStep";
import { isString } from "../../../../../core/types/String";

const LOG = LogService.createLogger('CsvController');

export class CsvController extends BaseStepController {

    public static parseControllerModel (model: any) : CsvStep | undefined {
        return parseCsvStep(model);
    }

    public static isControllerModel (model: any) : model is CsvStep {
        return isCsvStep(model);
    }

    public static createController (
        context : PipelineContext,
        model   : CsvStep
    ) : Controller {
        return new CsvController(
            context,
            model.name,
            model.csv,
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
        action         : string = CsvControllerAction.STRINGIFY,
        outputVariable : string | undefined = undefined
    ) {

        super(
            context,
            ControllerType.CSV,
            `CsvController#${name}`,
            `csv#${name}`,
            name,
            input,
            action ?? CsvControllerAction.STRINGIFY,
            outputVariable
        );

    }

    public run (
        action : ReadonlyJsonAny | undefined,
        input  : ReadonlyJsonAny | undefined
    ) : ReadonlyJsonAny | undefined {

        if (!isCsvControllerAction(action)) {
            LOG.debug(`run: action = `, action);
            throw new TypeError(`[csv#${this.getName()}] failed to compile the action property: ${StringUtils.toString(action)}`);
        }

        if ( action === CsvControllerAction.STRINGIFY ) {

            if (!isCsv(input)) {
                throw new Error(`[csv#${this.getName()}] failed to compile the input property as CSV: ${StringUtils.toString(input)}`);
            }

            const result = stringifyCsv(input);
            if (!isString(result)) {
                throw new TypeError(`[csv#${this.getName()}] Could not stringify CSV: ${result}`);
            }

            return result;

        } else if (action === CsvControllerAction.PARSE) {

            if (!isString(input)) {
                LOG.debug(`run: input = `, input);
                throw new TypeError(`[csv#${this.getName()}] failed to compile the input property as string: ${StringUtils.toString(input)}`);
            }

            const result = parseCsv(input);
            if (!isCsv(result)) throw new TypeError(`[csv#${this.getName()}] Result was not csv: ${result}`);
            return result;

        } else {
            LOG.debug(`run: action = `, action);
            throw new TypeError(`Unimplemented action: ${action}`)
        }

    }

}

export function isCsvController (value: any) : value is CsvController {
    return value instanceof CsvController;
}

export default CsvController;
