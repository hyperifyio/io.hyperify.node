// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ParameterType } from "../types/ParameterType";
import { parseJson } from "../../../../../core/Json";
import { BaseParameterModel } from "../types/BaseParameterModel";
import { isString, isStringOrUndefined } from "../../../../../core/types/String";
import { isRegularObject } from "../../../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../../../core/types/OtherKeys";

export interface StringParameterModel extends BaseParameterModel {

    readonly type         : ParameterType.STRING;
    readonly name         : string;
    readonly displayName ?: string;
    readonly default     ?: string;

}

export function isStringParameterModel (value: any): value is StringParameterModel {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'type',
            'name',
            'displayName',
            'default'
        ])
        && value?.type === ParameterType.STRING
        && isString(value?.name)
        && isStringOrUndefined(value?.displayName)
        && isStringOrUndefined(value?.default)
    );
}

export function stringifyStringParameterModel (value: StringParameterModel): string {
    return `StringParameterModel(${value})`;
}

export function parseStringParameterModel (value: any): StringParameterModel | undefined {
    if (value === undefined) return undefined;
    if (isString(value)) {
        value = parseJson(value);
    }
    if ( isStringParameterModel(value) ) return value;
    return undefined;
}

export default StringParameterModel;
