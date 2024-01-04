// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { PipelineModel, isPipelineModel } from "./PipelineModel";
import { PipelineRunType, isPipelineRunType } from "./PipelineRunType";
import { isJsonObject, JsonObject } from "../../../core/Json";
import { ParameterBindingMap, isParameterBindingMap } from "../parameters/types/ParameterBindingMap";
import { ParameterBindingString, isParameterBindingString } from "../parameters/types/ParameterBindingString";
import { isUndefined } from "../../../core/types/undefined";
import { isString } from "../../../core/types/String";
import { isRegularObject } from "../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../core/types/OtherKeys";
import { isArrayOf } from "../../../core/types/Array";

export interface PipelineRunModel {

    /**
     * The pipeline to run
     */
    readonly pipelineId       : string;

    /**
     * The type of the pipeline run
     */
    readonly type : PipelineRunType;

    /**
     * Array of agent pool (room) IDs which should be run this task
     */
    readonly agentPoolIdList  : string[];

    /** Optional. The precompiled pipeline model without the parameters property. */
    readonly model   ?: PipelineModel;

    /**
     * Optional variables.
     */
    readonly variables ?: JsonObject;

    /**
     * Possible bindings of parameters in the PipelineModel to values outside of the pipeline (eg.
     * the form) and/or static values
     */
    readonly bindings ?: ParameterBindingMap<ParameterBindingString>;

}

export function isPipelineRunModel (value: any): value is PipelineRunModel {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'pipelineId',
            'type',
            'model',
            'agentPoolIdList',
            'variables',
            'bindings'
        ])
        && isPipelineRunType(value?.type)
        && isString(value?.pipelineId)
        && isArrayOf<string>(value?.agentPoolIdList, isString)
        && ( isUndefined(value?.pipelineModel) || isPipelineModel(value?.pipelineModel) )
        && ( isUndefined(value?.variables) || isJsonObject(value?.variables) )
        && ( isUndefined(value?.bindings) || isParameterBindingMap<ParameterBindingString>(value?.bindings, isParameterBindingString) )
    );
}

export function stringifyPipelineRunModel (value: PipelineRunModel): string {
    return `PipelineRunModel(${value})`;
}

export function parsePipelineRunModel (value: any): PipelineRunModel | undefined {
    if ( isPipelineRunModel(value) ) return value;
    return undefined;
}

export default PipelineRunModel;
