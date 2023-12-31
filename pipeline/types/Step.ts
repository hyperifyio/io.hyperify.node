// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { isTask } from "./Task";
import BasePipelineModel, { isBasePipelineModel } from "./BasePipelineModel";
import PipelineRegistry from "../PipelineRegistry";

export interface Step extends BasePipelineModel {

    readonly name : string;

}

export function isStep (value: any): value is Step {

    if (!isBasePipelineModel(value)) return false;

    const controller = PipelineRegistry.findController(value);
    if ( controller !== undefined ) return true;

    return !!isTask(value);
}

export default Step;
