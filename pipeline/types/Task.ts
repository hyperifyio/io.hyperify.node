// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import Step from "./Step";
import { isName } from "./Name";
import { isBasePipelineModel } from "./BasePipelineModel";
import { isRegularObject } from "../../../core/types/RegularObject";

export interface Task extends Step {

    readonly name     : string;

}

export function isTask (value: any): value is Task {
    return (
        isBasePipelineModel(value)
        && isRegularObject(value)
        && isName(value?.name)
    );
}

export function stringifyTask (value: Task): string {
    if ( !isTask(value) ) throw new TypeError(`Not Task: ${value}`);
    return `Task#${value.name}`;
}

export function parseTask (value: any): Task | undefined {
    if ( isTask(value) ) return value;
    return undefined;
}

export function copyTask (value : Task) : Task {
    return {...value};
}

export default Task;
