// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { reduce } from "../../../../../core/functions/reduce";
import { trim } from "../../../../../core/functions/trim";
import {
    ParameterBindingType,
    isParameterBindingType,
    parseParameterBindingType
} from "./ParameterBindingType";
import { isReadonlyJsonAny, parseJson, ReadonlyJsonAny } from "../../../../../core/Json";
import { ParameterBindingMap } from "./ParameterBindingMap";
import { isUndefined } from "../../../../../core/types/undefined";
import { isString, isStringOrUndefined } from "../../../../../core/types/String";
import { isRegularObject } from "../../../../../core/types/RegularObject";
import { keys } from "../../../../../core/functions/keys";

/**
 * Binding configuration for a resource outside of the Pipeline model.
 *
 * The value may be one of:
 *
 *   - Path to a variable or form field, eg. `@order.id`.
 *
 *   - The single `@` may be used to map to the root resource, if applicable for the use case.
 *
 *   - Static JSON value, eg. `="..."`, `=false`, `=true`, `=123`, `=-123`, `={...}`, `=[...]`
 *
 */
export interface ParameterBindingObject {

    readonly type    : ParameterBindingType;
    readonly path   ?: string;
    readonly value  ?: ReadonlyJsonAny | undefined;

}


export function isParameterBindingObject (value: any): value is ParameterBindingObject {
    return (
        isRegularObject(value)
        && isParameterBindingType(value?.type)
        && isStringOrUndefined(value?.path)
        && ( isUndefined(value?.value) || isReadonlyJsonAny(value?.value) )
    );
}

export function stringifyParameterBindingObject (value: ParameterBindingObject): string {
    return `ParameterBindingObject(${value})`;
}

export function parseParameterBindingObject (value: any): ParameterBindingObject | undefined {

    if (isString(value)) {

        const type : ParameterBindingType | undefined = parseParameterBindingType( value.substr(0, 1) );

        if ( type === undefined ) {
            throw new TypeError(`Could not parse binding type from '${value}'`);
        }

        const bindingValue = trim(value.substr(1));
        switch (type) {

            case ParameterBindingType.KEY:
                return {
                    type,
                    path: bindingValue ? bindingValue : undefined
                };

            case ParameterBindingType.JSON: {

                const parsedBindingValue : ReadonlyJsonAny | undefined = (
                    bindingValue
                        ? parseJson(bindingValue) as ReadonlyJsonAny | undefined
                        : undefined
                );

                if ( parsedBindingValue === undefined ) {
                    return undefined;
                }

                return {
                    type,
                    value: parsedBindingValue
                };

            }

            default:
                throw new TypeError(`Unimplemented binding type: ${type}`);
        }

    }

    if ( isParameterBindingObject(value) ) return value;

    return undefined;

}

export function parseParameterBindingObjectMap (value : any) : ParameterBindingMap<ParameterBindingObject> | undefined {

    if (!isRegularObject(value)) {
        return undefined;
    }

    return reduce(
        keys<string>(value, isString),
        (
            ret         : ParameterBindingMap<ParameterBindingObject> | undefined,
            propertyKey : string
        ) : ParameterBindingMap<ParameterBindingObject> | undefined => {

            if (ret === undefined) return undefined;

            const parsedValue = parseParameterBindingObject(value[propertyKey]);
            if (parsedValue) {
                return {
                    ...ret,
                    [propertyKey] : parsedValue
                };
            } else {
                return undefined;
            }

        },
        {} as ParameterBindingMap<ParameterBindingObject>
    );

}

export default ParameterBindingObject;
