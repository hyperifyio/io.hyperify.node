// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { isPipeline, parsePipeline, stringifyPipeline } from "./Pipeline";
import Script from "../controllers/step/script/Script";
import PipelineDefaults from "../PipelineDefaults";
PipelineDefaults.registerControllers();

describe('isPipeline', () => {

    test( 'can detect Pipelines', () => {

        expect( isPipeline({
            name: "foo",
            stages: [
                {
                    name: "build",
                    jobs: [
                        {
                            name: "build_foo", steps: [
                                {
                                    name: "foo",
                                    command: "npm",
                                    args: ["run", "build"]
                                } as Script
                            ]
                        }
                    ]
                }
            ]
        }) ).toBe(true);

    });

    test( 'can detect invalid values', () => {

        expect( isPipeline(undefined) ).toBe(false);
        expect( isPipeline(null) ).toBe(false);
        expect( isPipeline(false) ).toBe(false);
        expect( isPipeline(true) ).toBe(false);
        expect( isPipeline(NaN) ).toBe(false);
        expect( isPipeline(() => {}) ).toBe(false);
        expect( isPipeline(0) ).toBe(false);
        expect( isPipeline(Symbol()) ).toBe(false);
        expect( isPipeline(1628078651664) ).toBe(false);
        expect( isPipeline(new Date('2021-08-04T12:04:00.844Z')) ).toBe(false);
        expect( isPipeline(1) ).toBe(false);
        expect( isPipeline(12) ).toBe(false);
        expect( isPipeline(-12) ).toBe(false);
        expect( isPipeline(123) ).toBe(false);
        expect( isPipeline(123.99999) ).toBe(false);
        expect( isPipeline(-123.99999) ).toBe(false);
        expect( isPipeline("123") ).toBe(false);
        expect( isPipeline("hello") ).toBe(false);
        expect( isPipeline("") ).toBe(false);
        expect( isPipeline([]) ).toBe(false);
        expect( isPipeline([123]) ).toBe(false);
        expect( isPipeline(["123"]) ).toBe(false);
        expect( isPipeline(["Hello world", "foo"]) ).toBe(false);
        expect( isPipeline({}) ).toBe(false);
        expect( isPipeline({"foo":"bar"}) ).toBe(false);
        expect( isPipeline({"foo":1234}) ).toBe(false);

    });

});

describe('stringifyPipeline', () => {

    test( 'can stringify values', () => {

        expect( stringifyPipeline({
            name: "foo",
            stages: [
                {
                    name: "build",
                    jobs: [
                        {
                            name: "build_foo", steps: [
                                {
                                    name: "foo",
                                    command: "npm",
                                    args: ["run", "build"]
                                } as Script
                            ]
                        }
                    ]
                }
            ]
        }) ).toBe('Pipeline#foo');

    });

    test( 'throws TypeError on incorrect values', () => {

        // @ts-ignore
        expect( () => stringifyPipeline(undefined) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(null) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(false) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(true) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(NaN) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(() => {}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(0) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(Symbol()) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(1628078651664) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(new Date('2021-08-04T12:04:00.844Z')) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(1) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(12) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(-12) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(123) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(123.99999) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(-123.99999) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline("123") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline("hello") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline("") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline([]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline([123]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(["123"]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline(["Hello world", "foo"]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline({}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline({"foo":"bar"}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyPipeline({"foo":1234}) ).toThrow(TypeError);

    });

});

describe('parsePipeline', () => {

    test( 'can parse Pipelines', () => {

        expect( parsePipeline({
            name: "foo",
            stages: [
                {
                    name: "build",
                    jobs: [
                        {
                            name: "build_foo", steps: [
                                {
                                    name: "foo",
                                    command: "npm",
                                    args: ["run", "build"]
                                } as Script
                            ]
                        }
                    ]
                }
            ]
        }) ).toStrictEqual({
            name: "foo",
            stages: [
                {
                    name: "build",
                    jobs: [
                        {
                            name: "build_foo", steps: [
                                {
                                    name: "foo",
                                    command: "npm",
                                    args: ["run", "build"]
                                } as Script
                            ]
                        }
                    ]
                }
            ]
        });

    });

    test( 'returns undefined for invalid values', () => {

        expect( parsePipeline(undefined) ).toBeUndefined();
        expect( parsePipeline(null) ).toBeUndefined();
        expect( parsePipeline(false) ).toBeUndefined();
        expect( parsePipeline(true) ).toBeUndefined();
        expect( parsePipeline(NaN) ).toBeUndefined();
        expect( parsePipeline(() => {}) ).toBeUndefined();
        expect( parsePipeline(0) ).toBeUndefined();
        expect( parsePipeline(Symbol()) ).toBeUndefined();
        expect( parsePipeline(1628078651664) ).toBeUndefined();
        expect( parsePipeline(new Date('2021-08-04T12:04:00.844Z')) ).toBeUndefined();
        expect( parsePipeline(1) ).toBeUndefined();
        expect( parsePipeline(12) ).toBeUndefined();
        expect( parsePipeline(-12) ).toBeUndefined();
        expect( parsePipeline(123) ).toBeUndefined();
        expect( parsePipeline(123.99999) ).toBeUndefined();
        expect( parsePipeline(-123.99999) ).toBeUndefined();
        expect( parsePipeline("123") ).toBeUndefined();
        expect( parsePipeline("hello") ).toBeUndefined();
        expect( parsePipeline("") ).toBeUndefined();
        expect( parsePipeline([]) ).toBeUndefined();
        expect( parsePipeline([123]) ).toBeUndefined();
        expect( parsePipeline(["123"]) ).toBeUndefined();
        expect( parsePipeline(["Hello world", "foo"]) ).toBeUndefined();
        expect( parsePipeline({}) ).toBeUndefined();
        expect( parsePipeline({"foo":"bar"}) ).toBeUndefined();
        expect( parsePipeline({"foo":1234}) ).toBeUndefined();

    });

});
