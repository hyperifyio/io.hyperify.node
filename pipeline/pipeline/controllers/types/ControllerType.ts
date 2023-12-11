// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

export enum ControllerType {
    NONE     = 'fi.nor.pipeline.none',
    PIPELINE = 'fi.nor.pipeline',
    JOB      = 'fi.nor.pipeline.job',
    STAGE    = 'fi.nor.pipeline.stage',
    TASK     = 'fi.nor.pipeline.task',
    STEP     = 'fi.nor.pipeline.step',
    FILE     = 'fi.nor.pipeline.step.file',
    SCRIPT   = 'fi.nor.pipeline.step.script',
    VARIABLE = 'fi.nor.pipeline.step.variable',
    JSON     = 'fi.nor.pipeline.step.json',
    CSV      = 'fi.nor.pipeline.step.csv',
    GIT      = 'fi.nor.pipeline.step.git'
}

export function isControllerType (value: any): value is ControllerType {
    switch (value) {

        case 'none':
        case ControllerType.NONE:
        case ControllerType.PIPELINE:
        case ControllerType.JOB:
        case ControllerType.STAGE:
        case ControllerType.TASK:
        case ControllerType.STEP:
        case ControllerType.SCRIPT:
        case ControllerType.JSON:
        case ControllerType.CSV:
            return true;

        default:
            return false;

    }
}

export function stringifyControllerType (value: ControllerType): string {
    switch (value) {
        case ControllerType.NONE        : return 'NONE';
        case ControllerType.PIPELINE    : return 'PIPELINE';
        case ControllerType.JOB         : return 'JOB';
        case ControllerType.STAGE       : return 'STAGE';
        case ControllerType.TASK        : return 'TASK';
        case ControllerType.STEP        : return 'STEP';
        case ControllerType.SCRIPT : return 'SCRIPT_STEP';
        case ControllerType.JSON   : return 'JSON_STEP';
        case ControllerType.CSV    : return 'CSV_STEP';
    }
    throw new TypeError(`Unsupported ControllerType value: ${value}`);
}

export function parseControllerType (value: any): ControllerType | undefined {

    if (value === undefined) return undefined;

    switch (`${value}`.toUpperCase()) {

        case 'NONE'        : return ControllerType.NONE;
        case 'PIPELINE'    : return ControllerType.PIPELINE;
        case 'JOB'         : return ControllerType.JOB;
        case 'STAGE'       : return ControllerType.STAGE;
        case 'TASK'        : return ControllerType.TASK;
        case 'STEP'        : return ControllerType.STEP;
        case 'SCRIPT_STEP' : return ControllerType.SCRIPT;
        case 'JSON_STEP'   : return ControllerType.JSON;
        case 'CSV_STEP'    : return ControllerType.CSV;

        default:
            return undefined;

    }

}

export default ControllerType;
