// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Step } from "../../../types/Step";
import { concat } from "../../../../../../core/functions/concat";
import { Name, isName } from "../../../types/Name";
import { BASE_PIPELINE_KEYS, isBasePipelineModel } from "../../../types/BasePipelineModel";
import { isReadonlyJsonAny, ReadonlyJsonAny } from "../../../../../../core/Json";
import { isStringOrUndefined } from "../../../../../../core/types/String";
import { hasNoOtherKeys } from "../../../../../../core/types/OtherKeys";

export const GIT_STEP_KEYS = concat(BASE_PIPELINE_KEYS, [
    'name',
    'git',
    'url',
    'target',
    'message',
    'set',
    'value',
    'cwd'
]);

export interface GitStep extends Step {

    readonly name     : Name;
    readonly git      : ReadonlyJsonAny;
    readonly url     ?: string;
    readonly target  ?: string;
    readonly message ?: string;
    readonly cwd     ?: string;
    readonly set     ?: string;
    readonly value   ?: string;

}

export function isGitStep (value: any): value is GitStep {
    return (
        isBasePipelineModel(value)
        && isName(value?.name)
        && isReadonlyJsonAny(value?.git)
        && isStringOrUndefined(value?.url)
        && isStringOrUndefined(value?.target)
        && isStringOrUndefined(value?.message)
        && isStringOrUndefined(value?.cwd)
        && isStringOrUndefined(value?.set)
        && isStringOrUndefined(value?.value)
        && hasNoOtherKeys(value, GIT_STEP_KEYS)
    );
}

export function stringifyGitStep (value: GitStep): string {
    if ( !isGitStep(value) ) throw new TypeError(`Not GitStep: ${value}`);
    return `GitStep#${value.name}`;
}

export function parseGitStep (value: any): GitStep | undefined {

    if ( isGitStep(value) ) return value;

    return undefined;

}

export default GitStep;
