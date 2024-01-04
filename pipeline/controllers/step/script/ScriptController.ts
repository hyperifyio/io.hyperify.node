// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Name } from "../../../types/Name";
import { PipelineContext } from "../../../PipelineContext";
import {
    SystemArgumentList,
    SystemEnvironment
} from "../../../systems/types/System";
import { Controller } from "../../types/Controller";
import { Script, isScript, parseScript } from "./Script";
import { BaseScriptController } from "./BaseScriptController";
import { ControllerType } from "../../types/ControllerType";

export class ScriptController extends BaseScriptController {

    public static parseControllerModel (model: any) : Script | undefined {
        return parseScript(model);
    }

    public static isControllerModel (model: any) : model is Script {
        return isScript(model);
    }

    public static createController (
        context : PipelineContext,
        model   : Script
    ) : Controller {
        return new ScriptController(
            context,
            model.name,
            model.command,
            model.args,
            model.env,
            model.cwd,
            model.output
        );
    }


    public constructor (
        context        : PipelineContext,
        name           : Name,
        command        : string,
        args           : SystemArgumentList = [],
        env            : SystemEnvironment  = {},
        cwd            : string | undefined = undefined,
        outputVariable : string | undefined = undefined,
    ) {

        super(
            context,
            ControllerType.SCRIPT,
            'ScriptController',
            'command',
            name,
            command,
            args,
            env,
            cwd,
            outputVariable
        );

    }

}

export function isScriptController (value: any) : value is ScriptController {
    return value instanceof ScriptController;
}

export default ScriptController;
