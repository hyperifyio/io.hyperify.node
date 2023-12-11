// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Step } from "../../../types/Step";
import { concat } from "../../../../../../core/functions/concat";
import { Name, isName } from "../../../types/Name";
import { BASE_PIPELINE_KEYS, isBasePipelineModel } from "../../../types/BasePipelineModel";
import { isString, isStringOrUndefined } from "../../../../../../core/types/String";
import { isRegularObjectOrUndefinedOf } from "../../../../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../../../../core/types/OtherKeys";
import { isArrayOrUndefinedOf } from "../../../../../../core/types/Array";

export const SCRIPT_STEP_KEYS = concat(BASE_PIPELINE_KEYS, [
    'name',
    'command',
    'args',
    'env',
    'output',
    'cwd'
]);

export interface Script extends Step {

    readonly name     : Name;
    readonly command  : string;
    readonly args    ?: string[];
    readonly env     ?: {readonly [key: string]: string};
    readonly cwd     ?: string;
    readonly output  ?: string;

}

export function isScript (value: any): value is Script {
    return (
        isBasePipelineModel(value)
        && isName(value?.name)
        && isString(value?.command)
        && isArrayOrUndefinedOf(value?.args, isString)
        && isRegularObjectOrUndefinedOf<string, string>(value?.env, isString, isString)
        && isStringOrUndefined(value?.cwd)
        && isStringOrUndefined(value?.output)
        && hasNoOtherKeys(value, SCRIPT_STEP_KEYS)
    );
}

export function stringifyScript (value: Script): string {
    if ( !isScript(value) ) throw new TypeError(`Not Script: ${value}`);
    return `Script#${value.name}`;
}

export function parseScript (value: any): Script | undefined {

    if ( isScript(value) ) return value;

    return undefined;

}

export default Script;
