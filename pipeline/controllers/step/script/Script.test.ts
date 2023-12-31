// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { isScript, parseScript, stringifyScript } from "./Script";
import PipelineDefaults from "../../../PipelineDefaults";
PipelineDefaults.registerControllers();

describe('isScript', () => {

    test( 'can detect Scripts', () => {

        expect( isScript({
            name: 'get_date',
            command: 'date'
        }) ).toBe(true);

        expect( isScript({
            name: 'test_node',
            command: 'npm',
            args: ['test']
        }) ).toBe(true);

        expect( isScript({
            name: 'build_node',
            command: 'npm',
            args: ['run', 'build']
        }) ).toBe(true);

        expect( isScript({
            name: 'get_date',
            command: 'date',
            env: {
                NODE_ENV: 'production'
            }
        }) ).toBe(true);

        expect( isScript({
            name: 'test_node',
            command: 'npm',
            args: ['test'],
            env: {
                NODE_ENV: 'production'
            }
        }) ).toBe(true);

        expect( isScript({
            name: 'build_node',
            command: 'npm',
            args: ['run', 'build'],
            env: {
                NODE_ENV: 'production'
            }
        }) ).toBe(true);

    });

    test( 'can detect invalid values', () => {

        expect( isScript({
            name: 'get date',
            command: 'date'
        }) ).toBe(false);

        expect( isScript({
            name: 'test node',
            command: 'npm',
            args: ['test']
        }) ).toBe(false);

        expect( isScript({
            name: 'build node',
            command: 'npm',
            args: ['run', 'build']
        }) ).toBe(false);

        expect( isScript({
            name: 'build node',
            command: 'npm',
            args: []
        }) ).toBe(false);

        expect( isScript({
            name: 'build node',
            command: 'npm',
            env: []
        }) ).toBe(false);

        expect( isScript({
            name: 'build node',
            command: 'npm',
            env: [],
            foo: 'bar'
        }) ).toBe(false);

        expect( isScript({
            name: 'build node',
            command: 123,
            env: [],
            foo: 'bar'
        }) ).toBe(false);

        expect( isScript({
            name: 123,
            command: 'build_node',
            env: [],
            foo: 'bar'
        }) ).toBe(false);

        expect( isScript(undefined) ).toBe(false);
        expect( isScript(null) ).toBe(false);
        expect( isScript(false) ).toBe(false);
        expect( isScript(true) ).toBe(false);
        expect( isScript(NaN) ).toBe(false);
        expect( isScript(() => {}) ).toBe(false);
        expect( isScript(0) ).toBe(false);
        expect( isScript(Symbol()) ).toBe(false);
        expect( isScript(1628078651664) ).toBe(false);
        expect( isScript(new Date('2021-08-04T12:04:00.844Z')) ).toBe(false);
        expect( isScript(1) ).toBe(false);
        expect( isScript(12) ).toBe(false);
        expect( isScript(-12) ).toBe(false);
        expect( isScript(123) ).toBe(false);
        expect( isScript(123.99999) ).toBe(false);
        expect( isScript(-123.99999) ).toBe(false);
        expect( isScript("123") ).toBe(false);
        expect( isScript("hello") ).toBe(false);
        expect( isScript("") ).toBe(false);
        expect( isScript([]) ).toBe(false);
        expect( isScript([123]) ).toBe(false);
        expect( isScript(["123"]) ).toBe(false);
        expect( isScript(["Hello world", "foo"]) ).toBe(false);
        expect( isScript({}) ).toBe(false);
        expect( isScript({"foo":"bar"}) ).toBe(false);
        expect( isScript({"foo":1234}) ).toBe(false);

    });

});

describe('stringifyScript', () => {

    test( 'can stringify values', () => {

        expect( stringifyScript({
            name: 'get_date',
            command: 'date'
        }) ).toBe('Script#get_date');

    });

    test( 'throws TypeError on incorrect values', () => {

        // @ts-ignore
        expect( () => stringifyScript(undefined) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(null) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(false) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(true) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(NaN) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(() => {}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(0) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(Symbol()) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(1628078651664) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(new Date('2021-08-04T12:04:00.844Z')) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(1) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(12) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(-12) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(123) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(123.99999) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(-123.99999) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript("123") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript("hello") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript("") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript([]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript([123]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(["123"]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript(["Hello world", "foo"]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript({}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript({"foo":"bar"}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyScript({"foo":1234}) ).toThrow(TypeError);

    });

});

describe('parseScript', () => {

    test( 'can parse Scripts', () => {

        expect( parseScript({
            name: 'get_date',
            command: 'date'
        }) ).toStrictEqual({
            name: 'get_date',
            command: 'date'
        });

    });

    test( 'returns undefined for invalid values', () => {

        expect( parseScript(undefined) ).toBeUndefined();
        expect( parseScript(null) ).toBeUndefined();
        expect( parseScript(false) ).toBeUndefined();
        expect( parseScript(true) ).toBeUndefined();
        expect( parseScript(NaN) ).toBeUndefined();
        expect( parseScript(() => {}) ).toBeUndefined();
        expect( parseScript(0) ).toBeUndefined();
        expect( parseScript(Symbol()) ).toBeUndefined();
        expect( parseScript(1628078651664) ).toBeUndefined();
        expect( parseScript(new Date('2021-08-04T12:04:00.844Z')) ).toBeUndefined();
        expect( parseScript(1) ).toBeUndefined();
        expect( parseScript(12) ).toBeUndefined();
        expect( parseScript(-12) ).toBeUndefined();
        expect( parseScript(123) ).toBeUndefined();
        expect( parseScript(123.99999) ).toBeUndefined();
        expect( parseScript(-123.99999) ).toBeUndefined();
        expect( parseScript("123") ).toBeUndefined();
        expect( parseScript("hello") ).toBeUndefined();
        expect( parseScript("") ).toBeUndefined();
        expect( parseScript([]) ).toBeUndefined();
        expect( parseScript([123]) ).toBeUndefined();
        expect( parseScript(["123"]) ).toBeUndefined();
        expect( parseScript(["Hello world", "foo"]) ).toBeUndefined();
        expect( parseScript({}) ).toBeUndefined();
        expect( parseScript({"foo":"bar"}) ).toBeUndefined();
        expect( parseScript({"foo":1234}) ).toBeUndefined();

    });

});
