// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { VariablesModel } from "./types/VariablesModel";
import { PipelineParameterArray } from "./types/PipelineParameterArray";
import { JsonAny, isJsonObject, parseJson, ReadonlyJsonAny } from "../../core/Json";
import { get } from "../../core/functions/get";
import { set } from "../../core/functions/set";
import { StringUtils, VariableResolverCallback } from "../../core/StringUtils";
import { System } from "./systems/types/System";
import { LogService } from "../../core/LogService";

const LOG = LogService.createLogger('PipelineContext');

export class PipelineContext {

    private readonly _system         : System;
    private readonly _parameters     : PipelineParameterArray | undefined;
    private readonly _variablePrefix : string;
    private readonly _variableSuffix : string;
    private readonly _lookupVariable : VariableResolverCallback;

    private _variables               : VariablesModel;

    public constructor (
        system         : System,
        parameters     : PipelineParameterArray | undefined = undefined,
        variables      : VariablesModel         | undefined = undefined,
        variablePrefix : string = '${',
        variableSuffix : string = '}'
    ) {

        this._system         = system;
        this._variables      = variables ?? {};
        this._parameters     = parameters;
        this._variablePrefix = variablePrefix;
        this._variableSuffix = variableSuffix;
        this._lookupVariable = this._onLookupVariable.bind(this);

    }

    public getSystem () : System {
        return this._system;
    }

    public compileModel<T extends ReadonlyJsonAny> (
        model : T
    ) : ReadonlyJsonAny | undefined {
        LOG.debug(`Compiling model using: `, model, this._variablePrefix, this._variableSuffix);
        const result = StringUtils.processVariables(
            model,
            this._lookupVariable,
            this._variablePrefix,
            this._variableSuffix
        );
        LOG.debug(`Compiled as: `, result);
        return result;
    }

    public getParametersArray () : PipelineParameterArray {
        return this._parameters ?? [];
    }

    public getVariablesModel () : VariablesModel {
        return this._variables;
    }

    public getVariable (path: string) : ReadonlyJsonAny | undefined {
        return get(this._variables, path);
    }

    private _onLookupVariable (path: string) : ReadonlyJsonAny | undefined {
        const value = this.getVariable(path);
        LOG.debug(`lookup variable "${path}": `, value, this._variables);
        return value;
    }

    public setVariable (
        path  : string,
        value : JsonAny | ReadonlyJsonAny
    ) : PipelineContext {

        if (!isJsonObject(this._variables)) {
            this._variables = {};
        }

        set(this._variables as object, path, value);
        LOG.debug(`setVariable "${path}": `, value, this._variables);

        return this;

    }

    public toString (): string {
        return 'PipelineContext';
    }

    public toJSON (): JsonAny {
        return {
            type: 'fi.nor.pipeline.context',
            variables: parseJson(JSON.stringify(this._variables))
        };
    }

}

export function isPipelineContext (value: any): value is PipelineContext {
    return value instanceof PipelineContext;
}

export default PipelineContext;
