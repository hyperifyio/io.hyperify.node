// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { isStage, parseStage, stringifyStage } from "./Stage";
import Script from "../controllers/step/script/Script";
import { PipelineDefaults } from "../PipelineDefaults";
PipelineDefaults.registerControllers();

describe('isStage', () => {

    test( 'can detect Stages', () => {

        expect( isStage({
            name: "build",
            jobs: [
                {
                    name: "build_foo", steps: [{
                        name: "foo",
                        command: "npm",
                        args: ["run", "build"]
                    } as Script ]
                }
            ]
        }) ).toBe(true);

    });

    test( 'can detect invalid values', () => {

        expect( isStage(undefined) ).toBe(false);
        expect( isStage(null) ).toBe(false);
        expect( isStage(false) ).toBe(false);
        expect( isStage(true) ).toBe(false);
        expect( isStage(NaN) ).toBe(false);
        expect( isStage(() => {}) ).toBe(false);
        expect( isStage(0) ).toBe(false);
        expect( isStage(Symbol()) ).toBe(false);
        expect( isStage(1628078651664) ).toBe(false);
        expect( isStage(new Date('2021-08-04T12:04:00.844Z')) ).toBe(false);
        expect( isStage(1) ).toBe(false);
        expect( isStage(12) ).toBe(false);
        expect( isStage(-12) ).toBe(false);
        expect( isStage(123) ).toBe(false);
        expect( isStage(123.99999) ).toBe(false);
        expect( isStage(-123.99999) ).toBe(false);
        expect( isStage("123") ).toBe(false);
        expect( isStage("hello") ).toBe(false);
        expect( isStage("") ).toBe(false);
        expect( isStage([]) ).toBe(false);
        expect( isStage([123]) ).toBe(false);
        expect( isStage(["123"]) ).toBe(false);
        expect( isStage(["Hello world", "foo"]) ).toBe(false);
        expect( isStage({}) ).toBe(false);
        expect( isStage({"foo":"bar"}) ).toBe(false);
        expect( isStage({"foo":1234}) ).toBe(false);

    });

});

describe('stringifyStage', () => {

    test( 'can stringify values', () => {

        expect( parseStage({
            name: "build",
            jobs: [
                {
                    name: "build_foo", steps: [{
                        name: "foo",
                        command: "npm",
                        args: ["run", "build"]
                    } as Script ]
                }
            ]
        }) ).toStrictEqual({
            name: "build",
            jobs: [
                {
                    name: "build_foo", steps: [{
                        name: "foo",
                        command: "npm",
                        args: ["run", "build"]
                    } as Script ]
                }
            ]
        });

    });

    test( 'throws TypeError on incorrect values', () => {

        // @ts-ignore
        expect( () => stringifyStage(undefined) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(null) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(false) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(true) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(NaN) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(() => {}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(0) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(Symbol()) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(1628078651664) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(new Date('2021-08-04T12:04:00.844Z')) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(1) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(12) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(-12) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(123) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(123.99999) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(-123.99999) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage("123") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage("hello") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage("") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage([]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage([123]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(["123"]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage(["Hello world", "foo"]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage({}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage({"foo":"bar"}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyStage({"foo":1234}) ).toThrow(TypeError);

    });

});

describe('parseStage', () => {

    test( 'can parse Stages', () => {

        expect( parseStage({
            name: "build",
            jobs: [
                {
                    name: "build_foo", steps: [{
                        name: "foo",
                        command: "npm",
                        args: ["run", "build"]
                    } as Script ]
                }
            ]
        }) ).toStrictEqual({
            name: "build",
            jobs: [
                {
                    name: "build_foo", steps: [{
                        name: "foo",
                        command: "npm",
                        args: ["run", "build"]
                    } as Script ]
                }
            ]
        });

    });

    test( 'returns undefined for invalid values', () => {

        expect( parseStage(undefined) ).toBeUndefined();
        expect( parseStage(null) ).toBeUndefined();
        expect( parseStage(false) ).toBeUndefined();
        expect( parseStage(true) ).toBeUndefined();
        expect( parseStage(NaN) ).toBeUndefined();
        expect( parseStage(() => {}) ).toBeUndefined();
        expect( parseStage(0) ).toBeUndefined();
        expect( parseStage(Symbol()) ).toBeUndefined();
        expect( parseStage(1628078651664) ).toBeUndefined();
        expect( parseStage(new Date('2021-08-04T12:04:00.844Z')) ).toBeUndefined();
        expect( parseStage(1) ).toBeUndefined();
        expect( parseStage(12) ).toBeUndefined();
        expect( parseStage(-12) ).toBeUndefined();
        expect( parseStage(123) ).toBeUndefined();
        expect( parseStage(123.99999) ).toBeUndefined();
        expect( parseStage(-123.99999) ).toBeUndefined();
        expect( parseStage("123") ).toBeUndefined();
        expect( parseStage("hello") ).toBeUndefined();
        expect( parseStage("") ).toBeUndefined();
        expect( parseStage([]) ).toBeUndefined();
        expect( parseStage([123]) ).toBeUndefined();
        expect( parseStage(["123"]) ).toBeUndefined();
        expect( parseStage(["Hello world", "foo"]) ).toBeUndefined();
        expect( parseStage({}) ).toBeUndefined();
        expect( parseStage({"foo":"bar"}) ).toBeUndefined();
        expect( parseStage({"foo":1234}) ).toBeUndefined();

    });

});
