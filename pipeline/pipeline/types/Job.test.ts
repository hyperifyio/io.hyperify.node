// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { isJob, parseJob, stringifyJob } from "./Job";
import Script from "../controllers/step/script/Script";
import PipelineDefaults from "../PipelineDefaults";
PipelineDefaults.registerControllers();

describe('isJob', () => {

    test( 'can detect Jobs', () => {

        expect( isJob({name: "build_foo", steps: [{
            name: "foo",
            command: "npm",
            args: ["run", "build"]
        }]}) ).toBe(true);

    });

    test( 'can detect invalid values', () => {

        expect( isJob(undefined) ).toBe(false);
        expect( isJob(null) ).toBe(false);
        expect( isJob(false) ).toBe(false);
        expect( isJob(true) ).toBe(false);
        expect( isJob(NaN) ).toBe(false);
        expect( isJob(() => {}) ).toBe(false);
        expect( isJob(0) ).toBe(false);
        expect( isJob(Symbol()) ).toBe(false);
        expect( isJob(1628078651664) ).toBe(false);
        expect( isJob(new Date('2021-08-04T12:04:00.844Z')) ).toBe(false);
        expect( isJob(1) ).toBe(false);
        expect( isJob(12) ).toBe(false);
        expect( isJob(-12) ).toBe(false);
        expect( isJob(123) ).toBe(false);
        expect( isJob(123.99999) ).toBe(false);
        expect( isJob(-123.99999) ).toBe(false);
        expect( isJob("123") ).toBe(false);
        expect( isJob("hello") ).toBe(false);
        expect( isJob("") ).toBe(false);
        expect( isJob([]) ).toBe(false);
        expect( isJob([123]) ).toBe(false);
        expect( isJob(["123"]) ).toBe(false);
        expect( isJob(["Hello world", "foo"]) ).toBe(false);
        expect( isJob({}) ).toBe(false);
        expect( isJob({"foo":"bar"}) ).toBe(false);
        expect( isJob({"foo":1234}) ).toBe(false);

    });

});

describe('stringifyJob', () => {

    test( 'can stringify values', () => {

        expect( stringifyJob({name: "build_foo", steps: [{
            name: "foo",
            command: "npm",
            args: ["run", "build"]
        } as Script ]}) ).toBe('Job#build_foo');

    });

    test( 'throws TypeError on incorrect values', () => {

        // @ts-ignore
        expect( () => stringifyJob(undefined) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(null) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(false) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(true) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(NaN) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(() => {}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(0) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(Symbol()) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(1628078651664) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(new Date('2021-08-04T12:04:00.844Z')) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(1) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(12) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(-12) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(123) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(123.99999) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(-123.99999) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob("123") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob("hello") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob("") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob([]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob([123]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(["123"]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob(["Hello world", "foo"]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob({}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob({"foo":"bar"}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyJob({"foo":1234}) ).toThrow(TypeError);

    });

});

describe('parseJob', () => {

    test( 'can parse Jobs', () => {

        expect( parseJob({name: "build_foo", steps: [{
            name: "foo",
            command: "npm",
            args: ["run", "build"]
        }]}) ).toStrictEqual({name: "build_foo", steps: [{
            name: "foo",
            command: "npm",
            args: ["run", "build"]
        }]});

    });

    test( 'returns undefined for invalid values', () => {

        expect( parseJob(undefined) ).toBeUndefined();
        expect( parseJob(null) ).toBeUndefined();
        expect( parseJob(false) ).toBeUndefined();
        expect( parseJob(true) ).toBeUndefined();
        expect( parseJob(NaN) ).toBeUndefined();
        expect( parseJob(() => {}) ).toBeUndefined();
        expect( parseJob(0) ).toBeUndefined();
        expect( parseJob(Symbol()) ).toBeUndefined();
        expect( parseJob(1628078651664) ).toBeUndefined();
        expect( parseJob(new Date('2021-08-04T12:04:00.844Z')) ).toBeUndefined();
        expect( parseJob(1) ).toBeUndefined();
        expect( parseJob(12) ).toBeUndefined();
        expect( parseJob(-12) ).toBeUndefined();
        expect( parseJob(123) ).toBeUndefined();
        expect( parseJob(123.99999) ).toBeUndefined();
        expect( parseJob(-123.99999) ).toBeUndefined();
        expect( parseJob("123") ).toBeUndefined();
        expect( parseJob("hello") ).toBeUndefined();
        expect( parseJob("") ).toBeUndefined();
        expect( parseJob([]) ).toBeUndefined();
        expect( parseJob([123]) ).toBeUndefined();
        expect( parseJob(["123"]) ).toBeUndefined();
        expect( parseJob(["Hello world", "foo"]) ).toBeUndefined();
        expect( parseJob({}) ).toBeUndefined();
        expect( parseJob({"foo":"bar"}) ).toBeUndefined();
        expect( parseJob({"foo":1234}) ).toBeUndefined();

    });

});
