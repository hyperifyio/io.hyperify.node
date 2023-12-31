// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

export enum ParameterBindingType {
    KEY,
    JSON
}

export function isParameterBindingType (value: any): value is ParameterBindingType {
    switch (value) {

        case ParameterBindingType.KEY:
        case ParameterBindingType.JSON:
            return true;

        default:
            return false;

    }
}

export function stringifyParameterBindingType (value: ParameterBindingType): string {
    switch (value) {
        case ParameterBindingType.KEY   : return 'KEY';
        case ParameterBindingType.JSON  : return 'JSON';
    }
    throw new TypeError(`Unsupported ParameterBindingType value: ${value}`);
}

export function parseParameterBindingType (value: any): ParameterBindingType | undefined {

    switch (value) {

        case '@':
        case 'KEY'  : return ParameterBindingType.KEY;

        case '=':
        case 'JSON' : return ParameterBindingType.JSON;

        default     : return undefined;

    }

}

export default ParameterBindingType;
