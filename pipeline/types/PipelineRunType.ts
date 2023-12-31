// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

export enum PipelineRunType {

    /**
     * No pipeline runs will be created by the system.
     */
    NONE = "NONE",

    /**
     * Schedule single run to be executed by the first available agent.
     *
     * Only one pipeline instance will be created and added to every configured agent room.
     */
    ONCE = "ONCE",

    /**
     * Schedule multiple runs, one for every agent room configured.
     *
     * *Note!* Not implemented yet.
     */
    ONCE_PER_POOL = "ONCE_POOL"

}

export function isPipelineRunType (value: any): value is PipelineRunType {
    switch (value) {

        case PipelineRunType.NONE:
        case PipelineRunType.ONCE:
        case PipelineRunType.ONCE_PER_POOL:
            return true;

        default:
            return false;

    }
}

export function stringifyPipelineRunType (value: PipelineRunType): string {
    switch (value) {
        case PipelineRunType.NONE  : return 'NONE';
        case PipelineRunType.ONCE  : return 'ONCE';
        case PipelineRunType.ONCE_PER_POOL  : return 'ONCE_PER_POOL';
    }
    throw new TypeError(`Unsupported PipelineRunType value: ${value}`);
}

export function parsePipelineRunType (value: any): PipelineRunType | undefined {

    if ( value === undefined ) return undefined;

    switch (`${value}`.toUpperCase()) {

        case 'FALSE':
        case 'DISABlED':
        case 'NEVER':
        case 'NONE' : return PipelineRunType.NONE;

        case 'TRUE':
        case 'ENABLED':
        case 'ONCE' :
        case 'ONCE_RUN' :
        case 'ONCE_PER_RUN' :
            return PipelineRunType.ONCE;

        case 'ONCE_POOL':
        case 'ONCE_PER_POOL' : return PipelineRunType.ONCE_PER_POOL;
        default    :
            return undefined;

    }

}

export default PipelineRunType;
