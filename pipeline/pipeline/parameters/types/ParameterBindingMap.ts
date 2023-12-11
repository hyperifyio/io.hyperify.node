// Copyright (c) 2021-2023. Sendanor <info@sendanor.fi>. All rights reserved.

import { TestCallbackNonStandardOf } from "../../../../../core/types/TestCallback";
import { isString } from "../../../../../core/types/String";
import { isRegularObjectOf } from "../../../../../core/types/RegularObject";

/**
 * Binding configuration for a resource outside of the Pipeline model.
 *
 * See `ParameterBindingString`
 */
export interface ParameterBindingMap<T> {
    readonly [key: string]: T;
}

export function isParameterBindingMap<T> (
    value : any,
    isT   : TestCallbackNonStandardOf<T>
): value is ParameterBindingMap<T> {
    return isRegularObjectOf<string, T>(value, isString, item => isT(item));
}

export function stringifyParameterBindingMap<T> (value: ParameterBindingMap<T>): string {
    return `ParameterBindingMap(${JSON.stringify(value)})`;
}

export function parseParameterBindingMap<T> (
    value : any,
    isT   : TestCallbackNonStandardOf<T>
): ParameterBindingMap<T> | undefined {
    if ( isParameterBindingMap<T>(value, isT) ) return value;
    return undefined;
}

export default ParameterBindingMap;
