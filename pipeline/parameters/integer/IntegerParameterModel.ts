// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ParameterType } from "../types/ParameterType";
import { parseJson } from "../../../../core/Json";
import { BaseParameterModel } from "../types/BaseParameterModel";
import { isString, isStringOrUndefined } from "../../../../core/types/String";
import { isNumberOrUndefined } from "../../../../core/types/Number";
import { isRegularObject } from "../../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../../core/types/OtherKeys";

export interface IntegerParameterModel extends BaseParameterModel {

    readonly type         : ParameterType.INTEGER;
    readonly name         : string;
    readonly displayName ?: string;
    readonly default     ?: number;

}

export function isIntegerParameterModel (value: any): value is IntegerParameterModel {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'type',
            'name',
            'displayName',
            'default'
        ])
        && value?.type === ParameterType.INTEGER
        && isString(value?.name)
        && isStringOrUndefined(value?.displayName)
        && isNumberOrUndefined(value?.default)
    );
}

export function stringifyIntegerParameterModel (value: IntegerParameterModel): string {
    return `IntegerParameterModel(${value})`;
}

export function parseIntegerParameterModel (value: any): IntegerParameterModel | undefined {
    if (value === undefined) return undefined;
    if (isString(value)) {
        value = parseJson(value);
    }
    if ( isIntegerParameterModel(value) ) return value;
    return undefined;
}

export default IntegerParameterModel;
