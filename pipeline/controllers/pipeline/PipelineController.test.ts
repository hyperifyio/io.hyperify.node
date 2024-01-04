// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import PipelineController, { isPipelineController } from "./PipelineController";
import StageController from "../stage/StageController";
import JobController from "../job/JobController";
import ScriptController from "../step/script/ScriptController";
import PipelineContext from "../../PipelineContext";
import PureSystem from "../../systems/pure/PureSystem";
import PipelineDefaults from "../../PipelineDefaults";
PipelineDefaults.registerControllers();

describe('isPipelineController', () => {

    test('can detect PipelineControllers', () => {

        const context = new PipelineContext(new PureSystem());
        expect( isPipelineController( new PipelineController(context,"foo", [
            new StageController(context, "build", [
                new JobController(context, "build", [
                    new ScriptController(context, "build_npm", "npm", ["run", "build"])
                ])
            ])
        ]) ) ).toBe(true);

    });

    test('can detect invalid values', () => {

        expect(isPipelineController(undefined)).toBe(false);
        expect(isPipelineController(null)).toBe(false);
        expect(isPipelineController(false)).toBe(false);
        expect(isPipelineController(true)).toBe(false);
        expect(isPipelineController(NaN)).toBe(false);
        expect(isPipelineController(() => {
        })).toBe(false);
        expect(isPipelineController(0)).toBe(false);
        expect(isPipelineController(Symbol())).toBe(false);
        expect(isPipelineController(1628078651664)).toBe(false);
        expect(isPipelineController(new Date('2021-08-04T12:04:00.844Z'))).toBe(false);
        expect(isPipelineController(1)).toBe(false);
        expect(isPipelineController(12)).toBe(false);
        expect(isPipelineController(-12)).toBe(false);
        expect(isPipelineController(123)).toBe(false);
        expect(isPipelineController(123.99999)).toBe(false);
        expect(isPipelineController(-123.99999)).toBe(false);
        expect(isPipelineController("123")).toBe(false);
        expect(isPipelineController("hello")).toBe(false);
        expect(isPipelineController("")).toBe(false);
        expect(isPipelineController([])).toBe(false);
        expect(isPipelineController([ 123 ])).toBe(false);
        expect(isPipelineController([ "123" ])).toBe(false);
        expect(isPipelineController([ "Hello world", "foo" ])).toBe(false);
        expect(isPipelineController({})).toBe(false);
        expect(isPipelineController({"foo": "bar"})).toBe(false);
        expect(isPipelineController({"foo": 1234})).toBe(false);

    });

});

describe('PipelineController', () => {

    describe('#constructor', () => {

        test('can create objects', () => {
            const context = new PipelineContext(new PureSystem());
            expect(() => new PipelineController(context, "foo", [
            new StageController(context, "build", [
                new JobController(context, "build", [
                    new ScriptController(context, "build_npm", "npm", ["run", "build"])
                ])
            ])
        ])).not.toThrow();
        });

    });

    describe('#toJSON', () => {

        test('can turn class to JSON', () => {

            const context = new PipelineContext(new PureSystem());
            expect(
                (
                    new PipelineController(context,"foo", [
                        new StageController(context,"build", [
                            new JobController(context,"build", [
                                new ScriptController(context,"build_npm", "npm", ["run", "build"])
                            ])
                        ])
                    ])
                ).toJSON()
            ).toStrictEqual({
                type: 'fi.nor.pipeline',
                name: 'foo',
                state: 0,
                stages: [
                    {
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
                    }
                ]
            });

        });

    });

    describe('#toString', () => {

        test('can turn class to string', () => {
            const context = new PipelineContext(new PureSystem());
            expect((new PipelineController(context,"foo", [
            new StageController(context,"build", [
                new JobController(context,"build", [
                    new ScriptController(context,"build_npm", "npm", ["run", "build"])
                ])
            ])
        ])).toString()).toBe('PipelineController#foo');
        });

    });

});
