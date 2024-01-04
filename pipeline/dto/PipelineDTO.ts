// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import PipelineModel, { isPipelineModel, parsePipelineModel } from "../types/PipelineModel";
import { isUndefined } from "../../../core/types/undefined";
import { isStringOrUndefined, parseString } from "../../../core/types/String";
import { isRegularObject } from "../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../core/types/OtherKeys";

export interface PipelineDTO {

    readonly id      ?: string;
    readonly model    : PipelineModel;

}

export function isPipelineDTO (value: any): value is PipelineDTO {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'id',
            'model'
        ])
        && isStringOrUndefined(value?.id)
        && isPipelineModel(value?.model)
    );
}

export function isPartialPipelineDTO (value: any): value is Partial<PipelineDTO> {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'id',
            'model'
        ])
        && isStringOrUndefined(value?.id)
        && ( isUndefined(value?.model) || isPipelineModel(value?.model) )
    );
}

export function stringifyPipelineDTO (value: PipelineDTO): string {
    return `PipelineDTO(${value})`;
}

export function parsePipelineDTO (value: any): PipelineDTO | undefined {

    const id = parseString(value?.id);

    const model = parsePipelineModel(value?.model);
    if (model === undefined) return undefined;

    return {id, model};

}

export default PipelineDTO;
