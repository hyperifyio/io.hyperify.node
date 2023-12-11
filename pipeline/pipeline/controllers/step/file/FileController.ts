// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ReadonlyJsonAny } from "../../../../../../core/Json";
import { Name } from "../../../types/Name";
import { LogService } from "../../../../../../core/LogService";
import { ControllerType } from "../../types/ControllerType";
import { PipelineContext } from "../../../PipelineContext";
import { StringUtils } from "../../../../../../core/StringUtils";
import { isFileControllerAction, FileControllerAction } from "./FileControllerAction";
import { BaseStepController } from "../types/BaseStepController";
import { FileStep, isFileStep, parseFileStep } from "./FileStep";
import { Controller } from "../../types/Controller";
import { isString, isStringOrUndefined } from "../../../../../../core/types/String";

const LOG = LogService.createLogger('FileController');

export class FileController extends BaseStepController {

    public static parseControllerModel (model: any) : FileStep | undefined {
        return parseFileStep(model);
    }

    public static isControllerModel (model: any) : model is FileStep {
        return isFileStep(model);
    }

    public static createController (
        context : PipelineContext,
        model   : FileStep
    ) : Controller {
        return new FileController(
            context,
            model.name,
            model,
            model.file,
            model.output
        );
    }

    /**
     *
     * @param context The context object, which contains variables, etc.
     * @param name The user defined name of the step
     * @param input This should be FileStep model
     * @param action This is usually the value for the property which defines the type of the
     *     step, eg. `"file"` or `"command"`.
     * @param outputVariable The variable name where to save successful results of this step
     */
    public constructor (
        context        : PipelineContext,
        name           : Name,
        input          : ReadonlyJsonAny | undefined,
        action         : ReadonlyJsonAny,
        outputVariable : string | undefined = undefined
    ) {

        super(
            context,
            ControllerType.FILE,
            `FileController#${name}`,
            `file#${name}`,
            name,
            input,
            action,
            outputVariable
        );

    }

    public run (
        action : ReadonlyJsonAny | undefined,
        input : ReadonlyJsonAny | undefined
    ) : ReadonlyJsonAny | undefined {

        const context = this.getContext();

        const system = context.getSystem();

        if (!isFileControllerAction(action)) {
            LOG.debug(`run: action = `, action);
            throw new TypeError(`[file#${this.getName()}] failed to compile the action property: ${StringUtils.toString(action)}`);
        }

        if (!isFileStep(input)) {
            LOG.debug(`run: input = `, input);
            throw new TypeError(`[file#${this.getName()}] failed to compile the input property: ${StringUtils.toString(input)}`);
        }

        let target = input?.target;
        if (!isStringOrUndefined(target)) {
            throw new TypeError(`[file#${this.getName()}] failed to compile the target property: ${StringUtils.toString(target)}`);
        }

        if ( action === FileControllerAction.MKDIR ) {

            if ( target === undefined ) {
                target = system.createTemporaryFile();
                system.createDirectory(target);
                LOG.info(`Created temporary directory: ${target}`);
            } else {
                system.createDirectory(target);
                LOG.info(`Created directory: ${target}`);
            }

            return target;

        } else if ( action === FileControllerAction.READ ) {

            if (target === undefined) {
                throw new TypeError(`[file#${this.getName()}] No file to read defined`);
            }

            return system.readFile(target);

        } else if ( action === FileControllerAction.READ_OR_CREATE ) {

            if (target === undefined) {
                throw new TypeError(`[file#${this.getName()}] No file to read defined`);
            }

            if (system.pathExists(target)) {

                return system.readFile(target);

            } else {

                let defaultValue : ReadonlyJsonAny | undefined = input?.default;
                if (!isString(defaultValue)) {
                    defaultValue = JSON.stringify(defaultValue, null, 2);
                }

                system.writeFile(target, defaultValue);

                return defaultValue;

            }

        } else if ( action === FileControllerAction.WRITE ) {

            if (target === undefined) {
                throw new TypeError(`[file#${this.getName()}] No file to read defined`);
            }

            let content : ReadonlyJsonAny | undefined = input?.content;

            if (!isString(content)) {
                content = JSON.stringify(content, null, 2);
            }

            system.writeFile(target, content);

            return target;

        } else {
            LOG.debug(`run: action = `, action);
            throw new TypeError(`Unimplemented action: ${action}`)
        }

    }

}

export function isFileController (value: any) : value is FileController {
    return value instanceof FileController;
}

export default FileController;
