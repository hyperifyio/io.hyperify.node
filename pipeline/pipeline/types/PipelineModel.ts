import Pipeline, { isPipeline, parsePipeline } from "./Pipeline";
import Stage, { isStage, parseStage } from "./Stage";
import Job, { isJob, parseJob } from "./Job";
import Step, { isStep } from "./Step";
import { parseStep } from "../parseStep";

export type PipelineModel = Pipeline | Stage | Job | Step;

export function isPipelineModel (value : any) : value is PipelineModel {

    if ( isPipeline(value) ) {
        return true;
    } else if ( isStage(value) ) {
        return true;
    } else if ( isJob(value) ) {
        return true;
    }
    return isStep(value);

}

export function parsePipelineModel (value: any) : PipelineModel | undefined {

    const model : PipelineModel | undefined = (
        parsePipeline(value)
        ?? parseStage(value)
        ?? parseJob(value)
        ?? parseStep(value)
    );

    return model;

}

export default PipelineModel;
