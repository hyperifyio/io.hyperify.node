// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ParameterType } from "../types/ParameterType";
import { parseJson } from "../../../../../core/Json";
import { BaseParameterModel } from "../types/BaseParameterModel";
import { isString, isStringOrUndefined } from "../../../../../core/types/String";
import { isNumberOrUndefined } from "../../../../../core/types/Number";
import { isRegularObject } from "../../../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../../../core/types/OtherKeys";

export interface NumberParameterModel extends BaseParameterModel {

    readonly type         : ParameterType.NUMBER;
    readonly name         : string;
    readonly displayName ?: string;
    readonly default     ?: number;

}

export function isNumberParameterModel (value: any): value is NumberParameterModel {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'type',
            'name',
            'displayName',
            'default'
        ])
        && value?.type === ParameterType.NUMBER
        && isString(value?.name)
        && isStringOrUndefined(value?.displayName)
        && isNumberOrUndefined(value?.default)
    );
}

export function stringifyNumberParameterModel (value: NumberParameterModel): string {
    return `NumberParameterModel(${value})`;
}

export function parseNumberParameterModel (value: any): NumberParameterModel | undefined {
    if (value === undefined) return undefined;
    if (isString(value)) {
        value = parseJson(value);
    }
    if ( isNumberParameterModel(value) ) return value;
    return undefined;
}

export default NumberParameterModel;
