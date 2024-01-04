// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import Step from "../../types/Step";
import PipelineContext from "../../PipelineContext";
import Controller from "./Controller";

export interface ControllerFactory {

    isControllerModel (model: any) : boolean;

    parseControllerModel (model: any) : Step | undefined;

    createController (
        context : PipelineContext,
        step    : Step
    ) : Controller;

}

export default ControllerFactory;
