// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import {
    isJsonObject,
    parseJson,
    ReadonlyJsonObject
} from "../../../../core/Json";

export type VariablesModel = ReadonlyJsonObject;

export function isVariablesModel (value: any): value is VariablesModel {
    return isJsonObject(value);
}

export function stringifyVariablesModel (value: VariablesModel): string {
    return `VariablesModel(${value})`;
}

export function parseVariablesModel (value: any): VariablesModel | undefined {
    const item = parseJson(value);
    if (isVariablesModel(item)) return item;
    return undefined;
}

export default VariablesModel;
