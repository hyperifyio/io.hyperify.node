// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Step, isStep } from "./Step";
import { concat } from "../../../../core/functions/concat";
import { isName } from "./Name";
import { BasePipelineModel, BASE_PIPELINE_KEYS, isBasePipelineModel } from "./BasePipelineModel";
import { hasNoOtherKeys } from "../../../../core/types/OtherKeys";
import { isArrayOf } from "../../../../core/types/Array";

export const JOB_STEP_KEYS = concat(BASE_PIPELINE_KEYS, [
    'name',
    'steps'
]);

export interface Job extends BasePipelineModel {
    readonly name  : string;
    readonly steps : readonly Step[];
}


export function isJob (value: any): value is Job {
    return (
        isBasePipelineModel(value)
        && isName(value?.name)
        && isArrayOf(value?.steps, isStep, 1)
        && hasNoOtherKeys(value, JOB_STEP_KEYS)
    );
}

export function stringifyJob (value: Job): string {

    if ( !isJob(value) ) throw new TypeError(`Not Job: ${value}`);

    return `Job#${ value.name }`;

}

export function parseJob (value: any): Job | undefined {
    if ( isJob(value) ) return value;
    return undefined;
}

export default Job;
