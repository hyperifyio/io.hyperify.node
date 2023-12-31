// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import AgentAccountModel, { isAgentAccountModel, parseAgentAccountModel } from "../types/AgentAccountModel";
import { isUndefined } from "../../../core/types/undefined";
import { isStringOrUndefined, parseString } from "../../../core/types/String";
import { isRegularObject } from "../../../core/types/RegularObject";
import { hasNoOtherKeys } from "../../../core/types/OtherKeys";

export interface AgentAccountDTO {

    readonly id           ?: string;
    readonly model        ?: AgentAccountModel;
    readonly password     ?: string;
    readonly access_token ?: string;

}

export function isAgentAccountDTO (value: any): value is AgentAccountDTO {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'id',
            'model',
            'password',
            'access_token'
        ])
        && isStringOrUndefined(value?.id)
        && ( isUndefined(value?.model) || isAgentAccountModel(value?.model) )
        && isStringOrUndefined(value?.password)
        && isStringOrUndefined(value?.access_token)
    );
}

export function isPartialAgentAccountDTO (value: any): value is Partial<AgentAccountDTO> {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'id',
            'model',
            'password',
            'access_token'
        ])
        && isStringOrUndefined(value?.id)
        && ( isUndefined(value?.model) || isAgentAccountModel(value?.model) )
        && isStringOrUndefined(value?.password)
        && isStringOrUndefined(value?.access_token)
    );
}

export function stringifyAgentAccountDTO (value: AgentAccountDTO): string {
    return `AgentAccountDTO(${value})`;
}

export function parseAgentAccountDTO (value: any): AgentAccountDTO | undefined {

    if (value === undefined) return undefined;

    return {
        id           : parseString(value?.id),
        model        : parseAgentAccountModel(value?.model),
        password     : parseString(value?.password),
        access_token : parseString(value?.access_token)
    };

}

export default AgentAccountDTO;
