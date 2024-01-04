// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Step } from "../../../types/Step";
import { concat } from "../../../../../core/functions/concat";
import { Name, isName } from "../../../types/Name";
import { BASE_PIPELINE_KEYS, isBasePipelineModel } from "../../../types/BasePipelineModel";
import { isReadonlyJsonAny, ReadonlyJsonAny } from "../../../../../core/Json";
import { isStringOrUndefined } from "../../../../../core/types/String";
import { hasNoOtherKeys } from "../../../../../core/types/OtherKeys";

export const SCRIPT_STEP_KEYS = concat(BASE_PIPELINE_KEYS, [
    'name',
    'variable',
    'set'
]);

export interface VariableStep extends Step {

    readonly name      : Name;
    readonly set       : ReadonlyJsonAny;
    readonly variable ?: string;

}

export function isVariableStep (value: any): value is VariableStep {
    return (
        isBasePipelineModel(value)
        && isName(value?.name)
        && isReadonlyJsonAny(value?.set)
        && isStringOrUndefined(value?.variable)
        && hasNoOtherKeys(value, SCRIPT_STEP_KEYS)
    );
}

export function stringifyVariableStep (value: VariableStep): string {
    if ( !isVariableStep(value) ) throw new TypeError(`Not VariableStep: ${value}`);
    return `VariableStep#${value.name}`;
}

export function parseVariableStep (value: any): VariableStep | undefined {

    if ( isVariableStep(value) ) return value;

    return undefined;

}

export default VariableStep;
