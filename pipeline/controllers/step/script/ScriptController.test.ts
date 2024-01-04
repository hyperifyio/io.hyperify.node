// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { ScriptController, isScriptController } from "./ScriptController";
import { PipelineContext } from "../../../PipelineContext";
import { PureSystem } from "../../../systems/pure/PureSystem";
import PipelineDefaults from "../../../PipelineDefaults";
PipelineDefaults.registerControllers();

describe('isScriptController', () => {

    test('can detect ScriptControllers', () => {

        const context = new PipelineContext(new PureSystem());

        expect(isScriptController(new ScriptController(context,"npm_build", "npm", ["run", "build"]))).toBe(true);

    });

    test('can detect invalid values', () => {

        expect(isScriptController(undefined)).toBe(false);
        expect(isScriptController(null)).toBe(false);
        expect(isScriptController(false)).toBe(false);
        expect(isScriptController(true)).toBe(false);
        expect(isScriptController(NaN)).toBe(false);
        expect(isScriptController(() => {})).toBe(false);
        expect(isScriptController(0)).toBe(false);
        expect(isScriptController(Symbol())).toBe(false);
        expect(isScriptController(1628078651664)).toBe(false);
        expect(isScriptController(new Date('2021-08-04T12:04:00.844Z'))).toBe(false);
        expect(isScriptController(1)).toBe(false);
        expect(isScriptController(12)).toBe(false);
        expect(isScriptController(-12)).toBe(false);
        expect(isScriptController(123)).toBe(false);
        expect(isScriptController(123.99999)).toBe(false);
        expect(isScriptController(-123.99999)).toBe(false);
        expect(isScriptController("123")).toBe(false);
        expect(isScriptController("hello")).toBe(false);
        expect(isScriptController("")).toBe(false);
        expect(isScriptController([])).toBe(false);
        expect(isScriptController([ 123 ])).toBe(false);
        expect(isScriptController([ "123" ])).toBe(false);
        expect(isScriptController([ "Hello world", "foo" ])).toBe(false);
        expect(isScriptController({})).toBe(false);
        expect(isScriptController({"foo": "bar"})).toBe(false);
        expect(isScriptController({"foo": 1234})).toBe(false);

    });

});

describe('ScriptController', () => {

    describe('#constructor', () => {

        test('can create objects', () => {
            const context = new PipelineContext(new PureSystem());
            expect(() => new ScriptController(context,"npm_build", "npm", ["run", "build"])).not.toThrow();
        });

    });

    describe('#toJSON', () => {

        test('can turn class to JSON', () => {
            expect(
                (
                    new ScriptController(
                        new PipelineContext(new PureSystem()),
                        "npm_build",
                        "npm",
                        ["run", "build"]
                    )
                ).toJSON()
            ).toStrictEqual({
                type: 'fi.nor.pipeline.step.script',
                state: 0,
                name: 'npm_build'
            });
        });

    });

    describe('#toString', () => {

        test('can turn class to string', () => {
            expect( (new ScriptController(
                new PipelineContext(new PureSystem()),
                "npm_build",
                "npm",
                ["run", "build"]
            )).toString() ).toBe('ScriptController#npm_build');
        });

    });

});
