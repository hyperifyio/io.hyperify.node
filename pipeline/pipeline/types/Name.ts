// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { trim } from "../../../../core/functions/trim";
import { isString, isStringOf } from "../../../../core/types/String";

export type Name = string;

export function isName (value: any): value is Name {
    return isStringOf(value, 1) && value.indexOf(' ') < 0;
}

export function stringifyName (value: Name): string {
    if ( !isName(value) ) throw new TypeError(`Not Name: ${value}`);
    return value;
}

export function parseName (value: any): Name | undefined {
    if (!isString(value)) return undefined;
    value = trim(value);
    if ( isName(value) ) return value;
    return undefined;
}

export default Name;
