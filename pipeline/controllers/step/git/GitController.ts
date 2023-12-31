// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Name } from "../../../types/Name";
import { PipelineContext } from "../../../PipelineContext";
import {
    SystemArgumentList,
    SystemEnvironment
} from "../../../systems/types/System";
import { Controller } from "../../types/Controller";
import { BaseScriptController } from "../script/BaseScriptController";
import { GitStep, isGitStep, parseGitStep } from "./GitStep";
import { GitControllerAction } from "./GitControllerAction";
import { ControllerType } from "../../types/ControllerType";

export class GitController extends BaseScriptController {

    public static parseControllerModel (model: any) : GitStep | undefined {
        return parseGitStep(model);
    }

    public static isControllerModel (model: any) : model is GitStep {
        return isGitStep(model);
    }

    public static createController (
        context : PipelineContext,
        model   : GitStep
    ) : Controller {

        if ( model.git === GitControllerAction.CLONE ) {

            const target = model.target;
            const url = model.url;
            if (!url) throw new TypeError(`url is required for git clone`);

            const args : SystemArgumentList = target ? [
                'clone',
                url,
                target
            ]: [
                'clone',
                url
            ];

            return new GitController(
                context,
                model.name,
                'git',
                args,
                {
                    GIT_TERMINAL_PROMPT: "0",
                    GIT_ASKPASS: "/bin/echo"
                },
                model.cwd
            );

        } else if ( model.git === GitControllerAction.ADD ) {

            const target = model?.target ?? '.';

            return new GitController(
                context,
                model.name,
                'git',
                [
                    'add',
                    target
                ],
                {
                    GIT_TERMINAL_PROMPT: "0",
                    GIT_ASKPASS: "/bin/echo"
                },
                model.cwd
            );

        } else if ( model.git === GitControllerAction.PUSH ) {

            const target = model?.target;

            if (target !== undefined) {

                return new GitController(
                    context,
                    model.name,
                    'git',
                    [
                        'push',
                        target
                    ],
                    {
                        GIT_TERMINAL_PROMPT: "0",
                        GIT_ASKPASS: "/bin/echo"
                    },
                    model.cwd
                );

            } else {

                return new GitController(
                    context,
                    model.name,
                    'git',
                    [
                        'push'
                    ],
                    {
                        GIT_TERMINAL_PROMPT: "0",
                        GIT_ASKPASS: "/bin/echo"
                    },
                    model.cwd
                );

            }

        } else if ( model.git === GitControllerAction.PULL ) {

            const target = model?.target;

            if (target !== undefined) {

                return new GitController(
                    context,
                    model.name,
                    'git',
                    [
                        'pull',
                        target
                    ],
                    {
                        GIT_TERMINAL_PROMPT: "0",
                        GIT_ASKPASS: "/bin/echo"
                    },
                    model.cwd
                );

            } else {

                return new GitController(
                    context,
                    model.name,
                    'git',
                    [
                        'pull'
                    ],
                    {
                        GIT_TERMINAL_PROMPT: "0",
                        GIT_ASKPASS: "/bin/echo"
                    },
                    model.cwd
                );

            }

        } else if ( model.git === GitControllerAction.CONFIG ) {

            const propertyName  = model?.set ?? '';
            const propertyValue = model?.value ?? '';

            return new GitController(
                context,
                model.name,
                'git',
                [
                    'config',
                    propertyName,
                    propertyValue
                ],
                {
                    GIT_TERMINAL_PROMPT: "0",
                    GIT_ASKPASS: "/bin/echo"
                },
                model.cwd
            );

        } else if ( model.git === GitControllerAction.COMMIT ) {

            const message = model?.message ?? 'Pipeline commit';

            return new GitController(
                context,
                model.name,
                'git',
                [
                    'commit',
                    '-m',
                    message
                ],
                {
                    GIT_TERMINAL_PROMPT: "0",
                    GIT_ASKPASS: "/bin/echo"
                },
                model.cwd
            );

        } else {
            throw new TypeError(`Unknown git action: ${model.git}`);
        }

    }


    public constructor (
        context  : PipelineContext,
        name     : Name,
        command  : string,
        args     : SystemArgumentList = [],
        env      : SystemEnvironment  = {},
        cwd      : string | undefined = undefined
    ) {

        const SSH_AUTH_SOCK = process.env?.SSH_AUTH_SOCK;
        if (SSH_AUTH_SOCK && !env?.SSH_AUTH_SOCK) {
            env = {
                ...env,
                SSH_AUTH_SOCK: SSH_AUTH_SOCK
            };
        }

        super(
            context,
            ControllerType.GIT,
            'GitController',
            'git',
            name,
            command,
            args,
            env,
            cwd
        );

    }

}

export function isGitController (value: any) : value is GitController {
    return value instanceof GitController;
}

export default GitController;
