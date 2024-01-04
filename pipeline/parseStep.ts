// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import Step from "./types/Step";
import PipelineRegistry from "./PipelineRegistry";
import { parseJob } from "./types/Job";

export function parseStep (value: any): Step | undefined {
    return PipelineRegistry.parseControllerModel(value) ?? parseJob(value);
}

export default parseStep;
