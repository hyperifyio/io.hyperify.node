// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { StageController, isStageController } from "./StageController";
import { JobController } from "../job/JobController";
import { ScriptController } from "../step/script/ScriptController";
import { PipelineContext } from "../../PipelineContext";
import { PureSystem } from "../../systems/pure/PureSystem";
import PipelineDefaults from "../../PipelineDefaults";
PipelineDefaults.registerControllers();

describe('isStageController', () => {

    test('can detect StageControllers', () => {

        const context = new PipelineContext(new PureSystem());

        expect( isStageController( new StageController(context,"build", [
            new JobController(context, "build", [
                new ScriptController(context,"build_npm", "npm", ["run", "build"])
            ])
        ]) ) ).toBe(true);

    });

    test('can detect invalid values', () => {

        expect(isStageController(undefined)).toBe(false);
        expect(isStageController(null)).toBe(false);
        expect(isStageController(false)).toBe(false);
        expect(isStageController(true)).toBe(false);
        expect(isStageController(NaN)).toBe(false);
        expect(isStageController(() => {
        })).toBe(false);
        expect(isStageController(0)).toBe(false);
        expect(isStageController(Symbol())).toBe(false);
        expect(isStageController(1628078651664)).toBe(false);
        expect(isStageController(new Date('2021-08-04T12:04:00.844Z'))).toBe(false);
        expect(isStageController(1)).toBe(false);
        expect(isStageController(12)).toBe(false);
        expect(isStageController(-12)).toBe(false);
        expect(isStageController(123)).toBe(false);
        expect(isStageController(123.99999)).toBe(false);
        expect(isStageController(-123.99999)).toBe(false);
        expect(isStageController("123")).toBe(false);
        expect(isStageController("hello")).toBe(false);
        expect(isStageController("")).toBe(false);
        expect(isStageController([])).toBe(false);
        expect(isStageController([ 123 ])).toBe(false);
        expect(isStageController([ "123" ])).toBe(false);
        expect(isStageController([ "Hello world", "foo" ])).toBe(false);
        expect(isStageController({})).toBe(false);
        expect(isStageController({"foo": "bar"})).toBe(false);
        expect(isStageController({"foo": 1234})).toBe(false);

    });

});

describe('StageController', () => {

    describe('#constructor', () => {

        test('can create objects', () => {
            const context = new PipelineContext(new PureSystem());

            expect(() => new StageController(context,"build", [
            new JobController(context,"build", [
                new ScriptController(context,"build_npm", "npm", ["run", "build"])
            ])
        ])).not.toThrow();
        });

    });

    describe('#toJSON', () => {

        test('can turn class to JSON', () => {

            const context = new PipelineContext(new PureSystem());
            expect(
                (new StageController(context,"build", [
                    new JobController(context,"build", [
                        new ScriptController(context,"build_npm", "npm", [ "run", "build" ])
                    ])
                ])).toJSON()
            ).toStrictEqual({
                type: 'fi.nor.pipeline.stage',
                name: 'build',
                state: 0,
                jobs: [
                    {
                        type: 'fi.nor.pipeline.job',
                        name: 'build',
                        state: 0,
                        steps: [
                            {
                                type: "fi.nor.pipeline.step.script",
                                name: "build_npm",
                                state: 0
                            }
                        ]
                    }
                ]
            });

        });

    });

    describe('#toString', () => {

        test('can turn class to string', () => {
            const context = new PipelineContext(new PureSystem());
            expect(
                (new StageController(context, "build", [
                    new JobController(context, "build", [
                        new ScriptController(context, "build_npm", "npm", ["run", "build"])
                    ])
                ])).toString()
            ).toBe('StageController#build');
        });

    });

});
