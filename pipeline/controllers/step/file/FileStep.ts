// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Step } from "../../../types/Step";
import { concat } from "../../../../../core/functions/concat";
import { Name, isName } from "../../../types/Name";
import { BASE_PIPELINE_KEYS, isBasePipelineModel } from "../../../types/BasePipelineModel";
import { isReadonlyJsonAny, ReadonlyJsonAny } from "../../../../../core/Json";
import { isUndefined } from "../../../../../core/types/undefined";
import { isStringOrUndefined } from "../../../../../core/types/String";
import { hasNoOtherKeys } from "../../../../../core/types/OtherKeys";

export const SCRIPT_STEP_KEYS = concat(BASE_PIPELINE_KEYS, [
    'name',
    'file',
    'target',
    'content',
    'output',
    'default'
]);

export interface FileStep extends Step {

    readonly name     : Name;
    readonly file     : ReadonlyJsonAny;
    readonly target  ?: string;
    readonly content ?: ReadonlyJsonAny;
    readonly output  ?: string;
    readonly default ?: string;

}

export function isFileStep (value: any): value is FileStep {
    return (
        isBasePipelineModel(value)
        && isName(value?.name)
        && isReadonlyJsonAny(value?.file)
        && ( isUndefined(value?.content) || isReadonlyJsonAny(value?.content) )
        && isStringOrUndefined(value?.target)
        && isStringOrUndefined(value?.output)
        && isStringOrUndefined(value?.default)
        && hasNoOtherKeys(value, SCRIPT_STEP_KEYS)
    );
}

export function stringifyFileStep (value: FileStep): string {
    if ( !isFileStep(value) ) throw new TypeError(`Not FileStep: ${value}`);
    return `FileStep#${value.name}`;
}

export function parseFileStep (value: any): FileStep | undefined {

    if ( isFileStep(value) ) return value;

    return undefined;

}

export default FileStep;
