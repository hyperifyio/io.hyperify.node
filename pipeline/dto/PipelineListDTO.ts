// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import PipelineDTO, { isPipelineDTO } from "./PipelineDTO";
import { isRegularObject } from "../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../core/types/OtherKeys";
import { isArrayOf } from "../../../core/types/Array";

export interface PipelineListDTO {

    readonly list  : PipelineDTO[];

}

export function isPipelineListDTO (value: any): value is PipelineListDTO {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'list'
        ])
        && isArrayOf<PipelineDTO>(value?.list, isPipelineDTO)
    );
}

export function stringifyPipelineListDTO (value: PipelineListDTO): string {
    return `PipelineListDTO(${value})`;
}

export function parsePipelineListDTO (value: any): PipelineListDTO | undefined {
    if (!isPipelineListDTO(value)) return undefined;
    return value;
}

export default PipelineListDTO;
