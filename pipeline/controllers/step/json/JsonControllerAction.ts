// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

export enum JsonControllerAction {
    STRINGIFY = "stringify",
    PARSE     = "parse"
}

export function isJsonControllerAction (value: any): value is JsonControllerAction {
    switch (value) {
        case JsonControllerAction.STRINGIFY:
        case JsonControllerAction.PARSE:
            return true;
    }
    return false;
}

export default JsonControllerAction;
