// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

export enum VariableControllerAction {
    SET = "set"
}

export function isVariableControllerAction (value: any): value is VariableControllerAction {
    switch (value) {
        case VariableControllerAction.SET:
            return true;
    }
    return false;
}

export default VariableControllerAction;
