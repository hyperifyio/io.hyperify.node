// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Stage, isStage } from "./Stage";
import { concat } from "../../../../core/functions/concat";
import { isName } from "./Name";
import { BasePipelineModel, BASE_PIPELINE_KEYS, isBasePipelineModel } from "./BasePipelineModel";
import { hasNoOtherKeys } from "../../../../core/types/OtherKeys";
import { isArrayOf } from "../../../../core/types/Array";

export const PIPELINE_STEP_KEYS = concat(BASE_PIPELINE_KEYS, [
    'name',
    'stages'
]);


export interface Pipeline extends BasePipelineModel {

    readonly name   : string;
    readonly stages : readonly Stage[];

}

export function isPipeline (value: any): value is Pipeline {
    return (
        isBasePipelineModel(value)
        && isName(value?.name)
        && isArrayOf(value?.stages, isStage, 1)
        && hasNoOtherKeys(value, PIPELINE_STEP_KEYS)
    );
}

export function stringifyPipeline (value: Pipeline): string {

    if ( !isPipeline(value) ) throw new TypeError(`Not Pipeline: ${value}`);

    return `Pipeline#${value.name}`;

}

export function parsePipeline (value: any): Pipeline | undefined {
    if ( isPipeline(value) ) return value;
    return undefined;
}

/** @deprecated Default export is deprecated */
export default Pipeline;
