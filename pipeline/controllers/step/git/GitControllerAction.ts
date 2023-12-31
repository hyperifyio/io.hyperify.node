// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

export enum GitControllerAction {
    CLONE  = "clone",
    COMMIT = "commit",
    ADD    = "add",
    CONFIG = "config",
    PUSH   = "push",
    PULL   = "pull"
}

export function isGitControllerAction (value: any): value is GitControllerAction {
    switch (value) {
        case GitControllerAction.CLONE:
        case GitControllerAction.COMMIT:
        case GitControllerAction.ADD:
        case GitControllerAction.CONFIG:
        case GitControllerAction.PUSH:
        case GitControllerAction.PULL:
            return true;
    }
    return false;
}

export default GitControllerAction;
