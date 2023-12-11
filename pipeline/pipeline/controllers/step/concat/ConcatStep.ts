// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Step } from "../../../types/Step";
import { concat } from "../../../../../../core/functions/concat";
import { Name, isName } from "../../../types/Name";
import { BASE_PIPELINE_KEYS, isBasePipelineModel } from "../../../types/BasePipelineModel";
import { isReadonlyJsonAny, ReadonlyJsonAny } from "../../../../../../core/Json";
import { hasNoOtherKeys } from "../../../../../../core/types/OtherKeys";

export const CONCAT_STEP_KEYS = concat(BASE_PIPELINE_KEYS, [
    'name',
    'concat',
    'output'
]);

export interface ConcatStep extends Step {

    readonly name      : Name;
    readonly concat    : ReadonlyJsonAny;
    readonly output   ?: string | undefined;

}

export function isConcatStep (value: any): value is ConcatStep {
    return (
        isBasePipelineModel(value)
        && isName(value?.name)
        && isReadonlyJsonAny(value?.concat)
        && hasNoOtherKeys(value, CONCAT_STEP_KEYS)
    );
}

export function stringifyConcatStep (value: ConcatStep): string {
    if ( !isConcatStep(value) ) throw new TypeError(`Not ConcatStep: ${value}`);
    return `ConcatStep#${value.name}`;
}

export function parseConcatStep (value: any): ConcatStep | undefined {
    if ( isConcatStep(value) ) return value;
    return undefined;
}

export default ConcatStep;
