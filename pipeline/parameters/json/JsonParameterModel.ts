// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ParameterType } from "../types/ParameterType";
import { isReadonlyJsonAny, parseJson, ReadonlyJsonAny } from "../../../../core/Json";
import { BaseParameterModel } from "../types/BaseParameterModel";
import { isUndefined } from "../../../../core/types/undefined";
import { isString, isStringOrUndefined } from "../../../../core/types/String";
import { isRegularObject } from "../../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../../core/types/OtherKeys";

export interface JsonParameterModel extends BaseParameterModel {

    readonly type          : ParameterType.JSON;
    readonly name          : string;
    readonly displayName  ?: string;
    readonly default      ?: ReadonlyJsonAny;

}

export function isJsonParameterModel (value: any): value is JsonParameterModel {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'type',
            'name',
            'displayName',
            'default'
        ])
        && value?.type === ParameterType.JSON
        && isString(value?.name)
        && isStringOrUndefined(value?.displayName)
        && ( isUndefined(value?.default) || isReadonlyJsonAny(value?.default) )
    );
}

export function stringifyJsonParameterModel (value: JsonParameterModel): string {
    return `JsonParameterModel(${value})`;
}

export function parseJsonParameterModel (value: any): JsonParameterModel | undefined {
    if (value === undefined) return undefined;
    if (isString(value)) {
        value = parseJson(value);
    }
    if ( isJsonParameterModel(value) ) return value;
    return undefined;
}

export default JsonParameterModel;
