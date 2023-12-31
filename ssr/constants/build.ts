// Copyright (c) 2021. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
//
// See also rollup.config.js
//

import { isString, parseNonEmptyString as _parseNonEmptyString } from "../../../core/types/String";
import { parseBoolean as _parseBoolean } from "../../../core/types/Boolean";

function parseBoolean (value : any) : boolean | undefined {
    if (value === undefined) return undefined;
    if (isString(value) && value.startsWith('%'+'{') && value.endsWith('}')) return undefined;
    return _parseBoolean(value);
}

function parseNonEmptyString (value : any) : string | undefined {
    if (value === undefined) return undefined;
    if (isString(value) && value.startsWith('%'+'{') && value.endsWith('}')) return undefined;
    return _parseNonEmptyString(value);
}

/**
 * @__PURE__
 */
export const BUILD_VERSION : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_VERSION}') ?? '?';

/**
 * @__PURE__
 */
export const BUILD_COMMAND_NAME : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_COMMAND_NAME}') ?? 'react-seo-server';

/**
 * @__PURE__
 */
export const BUILD_LOG_LEVEL : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_LOG_LEVEL}') ?? '';

/**
 * @__PURE__
 */
export const BUILD_NODE_ENV : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_NODE_ENV}')       ?? 'development';

/**
 * @__PURE__
 */
export const BUILD_DATE : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_DATE}')           ?? '';

/**
 * @__PURE__
 */
export const BUILD_ENABLE_GZIP : boolean = parseBoolean(process?.env?.BUILD_ENABLE_GZIP) ?? true;

/**
 * @__PURE__
 */
export const IS_PRODUCTION  : boolean = BUILD_NODE_ENV === 'production';

/**
 * @__PURE__
 */
export const IS_TEST        : boolean = BUILD_NODE_ENV === 'test';

/**
 * @__PURE__
 */
export const IS_DEVELOPMENT : boolean = !IS_PRODUCTION && !IS_TEST;
