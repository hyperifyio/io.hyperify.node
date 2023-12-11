// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

export enum ParameterType {
    JSON    = "json",
    STRING  = "string",
    BOOLEAN = "boolean",
    NUMBER  = "number",
    INTEGER = "integer"
}

export function isParameterType (value: any): value is ParameterType {
    switch (value) {

        case ParameterType.JSON:
        case ParameterType.STRING:
        case ParameterType.BOOLEAN:
        case ParameterType.NUMBER:
        case ParameterType.INTEGER:
            return true;

        default:
            return false;

    }
}

export function stringifyParameterType (value: ParameterType): string {
    switch (value) {

        case ParameterType.JSON: return 'JSON';
        case ParameterType.STRING: return 'STRING';
        case ParameterType.BOOLEAN: return 'BOOLEAN';
        case ParameterType.NUMBER: return 'NUMBER';
        case ParameterType.INTEGER: return 'INTEGER';

    }
    throw new TypeError(`Unsupported ParameterPropertyType value: ${value}`);
}

export function parseParameterType (value: any): ParameterType | undefined {

    switch (`${value}`.toUpperCase()) {

        case 'JSON' : return ParameterType.JSON;
        case 'STRING' : return ParameterType.STRING;
        case 'BOOLEAN' : return ParameterType.BOOLEAN;
        case 'NUMBER' : return ParameterType.NUMBER;
        case 'INTEGER' : return ParameterType.INTEGER;

        default    : return undefined;

    }

}

export default ParameterType;
