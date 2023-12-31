// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Step } from "../../../types/Step";
import { concat } from "../../../../../core/functions/concat";
import { Name, isName } from "../../../types/Name";
import { BASE_PIPELINE_KEYS, isBasePipelineModel } from "../../../types/BasePipelineModel";
import { isReadonlyJsonAny, ReadonlyJsonAny } from "../../../../../core/Json";
import { isUndefined } from "../../../../../core/types/undefined";
import { hasNoOtherKeys } from "../../../../../core/types/OtherKeys";

export const ASSERT_STEP_KEYS = concat(BASE_PIPELINE_KEYS, [
    'name',
    'assert',
    'equals',
    'output'
]);

export interface AssertStep extends Step {

    readonly name      : Name;
    readonly assert    : ReadonlyJsonAny;
    readonly equals   ?: ReadonlyJsonAny | undefined;
    readonly output   ?: string | undefined;

}

export function isAssertStep (value: any): value is AssertStep {
    return (
        isBasePipelineModel(value)
        && isName(value?.name)
        && isReadonlyJsonAny(value?.assert)
        && (isUndefined(value?.equals) || isReadonlyJsonAny(value?.equals))
        && hasNoOtherKeys(value, ASSERT_STEP_KEYS)
    );
}

export function stringifyAssertStep (value: AssertStep): string {
    if ( !isAssertStep(value) ) throw new TypeError(`Not AssertStep: ${value}`);
    return `AssertStep#${value.name}`;
}

export function parseAssertStep (value: any): AssertStep | undefined {
    if ( isAssertStep(value) ) return value;
    return undefined;
}

export default AssertStep;
