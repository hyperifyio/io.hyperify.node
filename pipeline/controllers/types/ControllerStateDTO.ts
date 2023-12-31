// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ControllerType, isControllerType } from "./ControllerType";
import { ControllerState, isControllerState } from "./ControllerState";
import { isString } from "../../../../core/types/String";
import { isRegularObject } from "../../../../core/types/RegularObject";

export interface ControllerStateDTO {

    readonly type  : ControllerType;
    readonly state : ControllerState;
    readonly name  : string;

}

export function isControllerStateDTO (value: any): value is ControllerStateDTO {
    return (
        isRegularObject(value)
        && isControllerType(value?.type)
        && isControllerState(value?.state)
        && isString(value?.name)
    );
}

export function stringifyControllerStateDTO (value: ControllerStateDTO): string {
    return `ControllerStateDTO(${value})`;
}

export default ControllerStateDTO;
