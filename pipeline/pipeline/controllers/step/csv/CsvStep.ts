// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { Step } from "../../../types/Step";
import { concat } from "../../../../../../core/functions/concat";
import { Name, isName } from "../../../types/Name";
import { BASE_PIPELINE_KEYS, isBasePipelineModel } from "../../../types/BasePipelineModel";
import { isReadonlyJsonAny, ReadonlyJsonAny } from "../../../../../../core/Json";
import { isStringOrUndefined } from "../../../../../../core/types/String";
import { hasNoOtherKeys } from "../../../../../../core/types/OtherKeys";

export const SCRIPT_STEP_KEYS = concat(BASE_PIPELINE_KEYS, [
    'name',
    'csv',
    'action',
    'output'
]);

export interface CsvStep extends Step {

    readonly name     : Name;
    readonly csv      : ReadonlyJsonAny;
    readonly action  ?: string;
    readonly output  ?: string;

}

export function isCsvStep (value: any): value is CsvStep {
    return (
        isBasePipelineModel(value)
        && isName(value?.name)
        && isReadonlyJsonAny(value?.csv)
        && isStringOrUndefined(value?.action)
        && isStringOrUndefined(value?.output)
        && hasNoOtherKeys(value, SCRIPT_STEP_KEYS)
    );
}

export function stringifyCsvStep (value: CsvStep): string {
    if ( !isCsvStep(value) ) throw new TypeError(`Not csv: ${value}`);
    return `csv#${value.name}`;
}

export function parseCsvStep (value: any): CsvStep | undefined {
    if ( isCsvStep(value) ) return value;
    return undefined;
}

export default CsvStep;
