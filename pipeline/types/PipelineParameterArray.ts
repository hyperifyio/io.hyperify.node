// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import ParameterModel, { isParameterModel } from "../parameters/ParameterModel";
import { isArrayOf } from "../../../core/types/Array";

export type PipelineParameterArray = ParameterModel[];

export function isPipelineParameterArray (value: any): value is PipelineParameterArray {
    return (
        isArrayOf<ParameterModel>(value, isParameterModel)
    );
}

export function stringifyPipelineParameterArray (value: PipelineParameterArray): string {
    return `PipelineParameterArray(${value})`;
}

export function parsePipelineParameterArray (value: any): PipelineParameterArray | undefined {
    if ( isPipelineParameterArray(value) ) return value;
    return undefined;
}

export default PipelineParameterArray;
