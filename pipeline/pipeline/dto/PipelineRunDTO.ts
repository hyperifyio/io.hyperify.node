// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { PipelineModel, isPipelineModel, parsePipelineModel } from "../types/PipelineModel";
import { ControllerStateDTO, isControllerStateDTO } from "../controllers/types/ControllerStateDTO";
import { isUndefined } from "../../../../core/types/undefined";
import { isStringOrUndefined, parseString } from "../../../../core/types/String";
import { isNumberOrUndefined } from "../../../../core/types/Number";
import { isRegularObject } from "../../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../../core/types/OtherKeys";

export interface PipelineRunDTO {

    readonly id             ?: string;

    /**
     * Which pipeline this run originated from
     */
    readonly pipelineId     ?: string;

    /**
     * Which pipeline version this run originated from
     */
    readonly pipelineVersion ?: number;

    /**
     * The ID of agent (room), which may contain multiple agents to process the pipeline.
     */
    readonly agentPoolId    ?: string;

    /**
     * The model which will be executed
     */
    readonly model           : PipelineModel;

    /**
     * This is the actual account which has started to process the run.
     *
     * The Pipeline Runner will update this.
     */
    readonly agentAccountId ?: string;

    /**
     * Current pipeline controller state.
     *
     * The Pipeline Runner will update this.
     */
    readonly state          ?: ControllerStateDTO;

}

export function isPipelineRunDTO (value: any): value is PipelineRunDTO {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'id',
            'pipelineId',
            'pipelineVersion',
            'agentPoolId',
            'agentAccountId',
            'model',
            'state'
        ])
        && isStringOrUndefined(value?.id)
        && isStringOrUndefined(value?.pipelineId)
        && isStringOrUndefined(value?.agentPoolId)
        && isNumberOrUndefined(value?.pipelineVersion)
        && isStringOrUndefined(value?.agentAccountId)
        && isPipelineModel(value?.model)
        && ( isUndefined(value?.state) || isControllerStateDTO(value?.state) )
    );
}

export function stringifyPipelineRunDTO (value: PipelineRunDTO): string {
    return `PipelineRunDTO(${value})`;
}

export function parsePipelineRunDTO (value: any): PipelineRunDTO | undefined {

    const id             = parseString(value?.id);
    const pipelineId     = parseString(value?.pipelineId);
    const agentPoolId    = parseString(value?.agentPoolId);
    const agentAccountId = parseString(value?.agentAccountId);

    const model = parsePipelineModel(value?.model);
    if (model === undefined) return undefined;

    const state = isControllerStateDTO(value?.model) ? value?.model : undefined;

    return {
        id,
        pipelineId,
        agentPoolId,
        agentAccountId,
        model,
        state
    };

}

export default PipelineRunDTO;
