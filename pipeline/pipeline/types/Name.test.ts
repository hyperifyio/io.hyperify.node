// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { isName, parseName, stringifyName } from "./Name";
import PipelineDefaults from "../PipelineDefaults";
PipelineDefaults.registerControllers();

describe('isName', () => {

    test( 'can detect Names', () => {

        expect( isName("build") ).toBe(true);
        expect( isName("build_job") ).toBe(true);
        expect( isName("hello") ).toBe(true);
        expect( isName("123") ).toBe(true);

    });

    test( 'can detect invalid values', () => {

        expect( isName(undefined) ).toBe(false);
        expect( isName(null) ).toBe(false);
        expect( isName(false) ).toBe(false);
        expect( isName(true) ).toBe(false);
        expect( isName(NaN) ).toBe(false);
        expect( isName(() => {}) ).toBe(false);
        expect( isName(0) ).toBe(false);
        expect( isName(Symbol()) ).toBe(false);
        expect( isName(1628078651664) ).toBe(false);
        expect( isName(new Date('2021-08-04T12:04:00.844Z')) ).toBe(false);
        expect( isName(1) ).toBe(false);
        expect( isName(12) ).toBe(false);
        expect( isName(-12) ).toBe(false);
        expect( isName(123) ).toBe(false);
        expect( isName(123.99999) ).toBe(false);
        expect( isName(-123.99999) ).toBe(false);
        expect( isName("") ).toBe(false);
        expect( isName([]) ).toBe(false);
        expect( isName([123]) ).toBe(false);
        expect( isName(["123"]) ).toBe(false);
        expect( isName(["Hello world", "foo"]) ).toBe(false);
        expect( isName({}) ).toBe(false);
        expect( isName({"foo":"bar"}) ).toBe(false);
        expect( isName({"foo":1234}) ).toBe(false);

    });

});

describe('stringifyName', () => {

    test( 'can stringify values', () => {

        expect( stringifyName("build") ).toBe('build');
        expect( stringifyName("build_job") ).toBe('build_job');
        expect( stringifyName("hello") ).toBe('hello');
        expect( stringifyName("123") ).toBe('123');

    });

    test( 'throws TypeError on incorrect values', () => {

        // @ts-ignore
        expect( () => stringifyName(undefined) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(null) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(false) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(true) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(NaN) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(() => {}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(0) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(Symbol()) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(1628078651664) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(new Date('2021-08-04T12:04:00.844Z')) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(1) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(12) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(-12) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(123) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(123.99999) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(-123.99999) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName("hello world") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName("") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName([]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName([123]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(["123"]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName(["Hello world", "foo"]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName({}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName({"foo":"bar"}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyName({"foo":1234}) ).toThrow(TypeError);

    });

});

describe('parseName', () => {

    test( 'can parse Names', () => {

        expect( parseName("build") ).toBe('build');
        expect( parseName("build_job") ).toBe('build_job');
        expect( parseName(" build_job") ).toBe('build_job');
        expect( parseName("build_job ") ).toBe('build_job');
        expect( parseName(" build_job  ") ).toBe('build_job');
        expect( parseName("hello") ).toBe('hello');
        expect( parseName("123") ).toBe('123');

    });

    test( 'returns undefined for invalid values', () => {

        expect( parseName(undefined) ).toBeUndefined();
        expect( parseName(null) ).toBeUndefined();
        expect( parseName(false) ).toBeUndefined();
        expect( parseName(true) ).toBeUndefined();
        expect( parseName(NaN) ).toBeUndefined();
        expect( parseName(() => {}) ).toBeUndefined();
        expect( parseName(0) ).toBeUndefined();
        expect( parseName(Symbol()) ).toBeUndefined();
        expect( parseName(1628078651664) ).toBeUndefined();
        expect( parseName(new Date('2021-08-04T12:04:00.844Z')) ).toBeUndefined();
        expect( parseName(1) ).toBeUndefined();
        expect( parseName(12) ).toBeUndefined();
        expect( parseName(-12) ).toBeUndefined();
        expect( parseName(123) ).toBeUndefined();
        expect( parseName(123.99999) ).toBeUndefined();
        expect( parseName(-123.99999) ).toBeUndefined();
        expect( parseName("") ).toBeUndefined();
        expect( parseName([]) ).toBeUndefined();
        expect( parseName([123]) ).toBeUndefined();
        expect( parseName(["123"]) ).toBeUndefined();
        expect( parseName(["Hello world", "foo"]) ).toBeUndefined();
        expect( parseName({}) ).toBeUndefined();
        expect( parseName({"foo":"bar"}) ).toBeUndefined();
        expect( parseName({"foo":1234}) ).toBeUndefined();

    });

});
