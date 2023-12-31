// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

export enum CsvControllerAction {
    STRINGIFY = "stringify",
    PARSE = "parse"
}

export function isCsvControllerAction (value: any): value is CsvControllerAction {
    switch (value) {
        case CsvControllerAction.STRINGIFY:
        case CsvControllerAction.PARSE:
            return true;
    }
    return false;
}

export default CsvControllerAction;
