// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import Task, { copyTask, isTask, parseTask, stringifyTask } from "./Task";
import PipelineDefaults from "../PipelineDefaults";
PipelineDefaults.registerControllers();

describe('isTask', () => {

    test( 'can detect Tasks', () => {

        expect( isTask({name: "foo"}) ).toBe(true);

    });

    test( 'can detect invalid values', () => {

        expect( isTask(undefined) ).toBe(false);
        expect( isTask(null) ).toBe(false);
        expect( isTask(false) ).toBe(false);
        expect( isTask(true) ).toBe(false);
        expect( isTask(NaN) ).toBe(false);
        expect( isTask(() => {}) ).toBe(false);
        expect( isTask(0) ).toBe(false);
        expect( isTask(Symbol()) ).toBe(false);
        expect( isTask(1628078651664) ).toBe(false);
        expect( isTask(new Date('2021-08-04T12:04:00.844Z')) ).toBe(false);
        expect( isTask(1) ).toBe(false);
        expect( isTask(12) ).toBe(false);
        expect( isTask(-12) ).toBe(false);
        expect( isTask(123) ).toBe(false);
        expect( isTask(123.99999) ).toBe(false);
        expect( isTask(-123.99999) ).toBe(false);
        expect( isTask("123") ).toBe(false);
        expect( isTask("hello") ).toBe(false);
        expect( isTask("") ).toBe(false);
        expect( isTask([]) ).toBe(false);
        expect( isTask([123]) ).toBe(false);
        expect( isTask(["123"]) ).toBe(false);
        expect( isTask(["Hello world", "foo"]) ).toBe(false);
        expect( isTask({}) ).toBe(false);
        expect( isTask({"foo":"bar"}) ).toBe(false);
        expect( isTask({"foo":1234}) ).toBe(false);

    });

});

describe('stringifyTask', () => {

    test( 'can stringify values', () => {

        expect( stringifyTask({name: "foo"}) ).toBe('Task#foo');

    });

    test( 'throws TypeError on incorrect values', () => {

        // @ts-ignore
        expect( () => stringifyTask(undefined) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(null) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(false) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(true) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(NaN) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(() => {}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(0) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(Symbol()) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(1628078651664) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(new Date('2021-08-04T12:04:00.844Z')) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(1) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(12) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(-12) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(123) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(123.99999) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(-123.99999) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask("123") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask("hello") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask("") ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask([]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask([123]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(["123"]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask(["Hello world", "foo"]) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask({}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask({"foo":"bar"}) ).toThrow(TypeError);
        // @ts-ignore
        expect( () => stringifyTask({"foo":1234}) ).toThrow(TypeError);

    });

});

describe('parseTask', () => {

    test( 'can parse Tasks', () => {

        expect( parseTask({name: "foo"}) ).toStrictEqual({name: "foo"});

    });

    test( 'returns undefined for invalid values', () => {

        expect( parseTask(undefined) ).toBeUndefined();
        expect( parseTask(null) ).toBeUndefined();
        expect( parseTask(false) ).toBeUndefined();
        expect( parseTask(true) ).toBeUndefined();
        expect( parseTask(NaN) ).toBeUndefined();
        expect( parseTask(() => {}) ).toBeUndefined();
        expect( parseTask(0) ).toBeUndefined();
        expect( parseTask(Symbol()) ).toBeUndefined();
        expect( parseTask(1628078651664) ).toBeUndefined();
        expect( parseTask(new Date('2021-08-04T12:04:00.844Z')) ).toBeUndefined();
        expect( parseTask(1) ).toBeUndefined();
        expect( parseTask(12) ).toBeUndefined();
        expect( parseTask(-12) ).toBeUndefined();
        expect( parseTask(123) ).toBeUndefined();
        expect( parseTask(123.99999) ).toBeUndefined();
        expect( parseTask(-123.99999) ).toBeUndefined();
        expect( parseTask("123") ).toBeUndefined();
        expect( parseTask("hello") ).toBeUndefined();
        expect( parseTask("") ).toBeUndefined();
        expect( parseTask([]) ).toBeUndefined();
        expect( parseTask([123]) ).toBeUndefined();
        expect( parseTask(["123"]) ).toBeUndefined();
        expect( parseTask(["Hello world", "foo"]) ).toBeUndefined();
        expect( parseTask({}) ).toBeUndefined();
        expect( parseTask({"foo":"bar"}) ).toBeUndefined();
        expect( parseTask({"foo":1234}) ).toBeUndefined();

    });

});

describe('copyTask', () => {

    test('can make a copy', () => {

        const value = {name: "foo"};
        const copyOfValue : Task = copyTask(value);
        expect(copyOfValue).toStrictEqual({name: "foo"});

        // @ts-ignore
        copyOfValue.name = "bar";

        expect(copyOfValue).toStrictEqual({name: "bar"});
        expect(value).toStrictEqual({name: "foo"});

    });

});
