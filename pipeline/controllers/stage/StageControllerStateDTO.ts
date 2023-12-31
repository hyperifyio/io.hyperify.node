// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ControllerType } from "../types/ControllerType";
import { ControllerState, isControllerState } from "../types/ControllerState";
import { ControllerStateDTO } from "../types/ControllerStateDTO";
import { JobControllerStateDTO, isJobControllerStateDTO } from "../job/JobControllerStateDTO";
import { isString } from "../../../../core/types/String";
import { isRegularObject } from "../../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../../core/types/OtherKeys";
import { isArrayOf } from "../../../../core/types/Array";

export interface StageControllerStateDTO extends ControllerStateDTO {

    readonly type  : ControllerType;
    readonly state : ControllerState;
    readonly name  : string;
    readonly jobs  : JobControllerStateDTO[];

}

export function isStageControllerStateDTO (value: any): value is StageControllerStateDTO {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'type',
            'state',
            'name',
            'jobs'
        ])
        && value?.type === ControllerType.STAGE
        && isControllerState(value?.state)
        && isString(value?.name)
        && isArrayOf<JobControllerStateDTO>(value?.jobs, isJobControllerStateDTO)
    );
}

export function stringifyStageControllerStateDTO (value: StageControllerStateDTO): string {
    return `StageStateDTO(${value})`;
}

export function parseStageControllerStateDTO (value: any): StageControllerStateDTO | undefined {
    return isStageControllerStateDTO(value) ? value : undefined;
}

export default StageControllerStateDTO;
