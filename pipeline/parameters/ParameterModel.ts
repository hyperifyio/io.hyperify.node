// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import BooleanParameterModel, {
    isBooleanParameterModel,
    parseBooleanParameterModel, stringifyBooleanParameterModel
} from "./boolean/BooleanParameterModel";
import IntegerParameterModel, {
    isIntegerParameterModel,
    parseIntegerParameterModel, stringifyIntegerParameterModel
} from "./integer/IntegerParameterModel";
import JsonParameterModel, {
    isJsonParameterModel,
    parseJsonParameterModel, stringifyJsonParameterModel
} from "./json/JsonParameterModel";
import NumberParameterModel, {
    isNumberParameterModel,
    parseNumberParameterModel, stringifyNumberParameterModel
} from "./number/NumberParameterModel";
import StringParameterModel, {
    isStringParameterModel,
    parseStringParameterModel, stringifyStringParameterModel
} from "./string/StringParameterModel";

export type ParameterModel = (
      BooleanParameterModel
    | IntegerParameterModel
    | NumberParameterModel
    | StringParameterModel
    | JsonParameterModel
);

export function isParameterModel (value: any): value is ParameterModel {
    return (
        isBooleanParameterModel(value)
        || isIntegerParameterModel(value)
        || isNumberParameterModel(value)
        || isStringParameterModel(value)
        || isJsonParameterModel(value)
    );
}

export function stringifyParameterModel (value: ParameterModel): string {

    if (isBooleanParameterModel(value) ) return stringifyBooleanParameterModel(value);
    if (isIntegerParameterModel(value) ) return stringifyIntegerParameterModel(value);
    if (isNumberParameterModel(value)  ) return stringifyNumberParameterModel(value);
    if (isStringParameterModel(value)  ) return stringifyStringParameterModel(value);
    if (isJsonParameterModel(value)    ) return stringifyJsonParameterModel(value);
    return `ParameterModel(unknown)`;

}

export function parseParameterModel (value: any): ParameterModel | undefined {
    return (
        parseBooleanParameterModel(value)
        ?? parseIntegerParameterModel(value)
        ?? parseNumberParameterModel(value)
        ?? parseStringParameterModel(value)
        ?? parseJsonParameterModel(value)
        ?? undefined
    )
}

export default ParameterModel;
