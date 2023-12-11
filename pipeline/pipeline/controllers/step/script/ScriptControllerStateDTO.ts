// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ControllerType } from "../../types/ControllerType";
import { ControllerState } from "../../types/ControllerState";
import { StepControllerStateDTO } from "../types/StepControllerStateDTO";
import { isRegularObject } from "../../../../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../../../../core/types/OtherKeys";

export interface ScriptControllerStateDTO extends StepControllerStateDTO {

    readonly type  : ControllerType;
    readonly state : ControllerState;
    readonly name  : string;

}

export function isScriptControllerStateDTO (value: any): value is ScriptControllerStateDTO {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'type',
            'state',
            'name'
        ])
    );
}

export function stringifyScriptControllerStateDTO (value: ScriptControllerStateDTO): string {
    return `ScriptStepStateDTO(${value})`;
}

export function parseScriptControllerStateDTO (value: any): ScriptControllerStateDTO | undefined {
    return isScriptControllerStateDTO(value) ? value : undefined;
}

export default ScriptControllerStateDTO;
