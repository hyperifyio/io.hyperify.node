// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ParameterType } from "../types/ParameterType";
import { parseJson } from "../../../../../core/Json";
import { BaseParameterModel } from "../types/BaseParameterModel";
import { isBooleanOrUndefined } from "../../../../../core/types/Boolean";
import { isString, isStringOrUndefined } from "../../../../../core/types/String";
import { isRegularObject } from "../../../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../../../core/types/OtherKeys";

export interface BooleanParameterModel extends BaseParameterModel {

    readonly type         : ParameterType.BOOLEAN;
    readonly name         : string;
    readonly displayName ?: string;
    readonly default     ?: boolean;

}

export function isBooleanParameterModel (value: any): value is BooleanParameterModel {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'type',
            'name',
            'displayName',
            'default'
        ])
        && value?.type === ParameterType.BOOLEAN
        && isString(value?.name)
        && isStringOrUndefined(value?.displayName)
        && isBooleanOrUndefined(value?.default)
    );
}

export function stringifyBooleanParameterModel (value: BooleanParameterModel): string {
    return `BooleanParameterModel(${value})`;
}

export function parseBooleanParameterModel (value: any): BooleanParameterModel | undefined {
    if (value === undefined) return undefined;
    if (isString(value)) {
        value = parseJson(value);
    }
    if ( isBooleanParameterModel(value) ) return value;
    return undefined;
}

export default BooleanParameterModel;
