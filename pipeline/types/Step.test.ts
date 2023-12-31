// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { isStep } from "./Step";
import { parseStep } from "../parseStep";
import PipelineDefaults from "../PipelineDefaults";
PipelineDefaults.registerControllers();

describe('isStep', () => {

    test( 'can detect Steps', () => {

        expect( isStep({
            name: 'get_date',
            command: 'date'
        }) ).toBe(true);

    });

    test( 'can detect invalid values', () => {

        expect( isStep(undefined) ).toBe(false);
        expect( isStep(null) ).toBe(false);
        expect( isStep(false) ).toBe(false);
        expect( isStep(true) ).toBe(false);
        expect( isStep(NaN) ).toBe(false);
        expect( isStep(() => {}) ).toBe(false);
        expect( isStep(0) ).toBe(false);
        expect( isStep(Symbol()) ).toBe(false);
        expect( isStep(1628078651664) ).toBe(false);
        expect( isStep(new Date('2021-08-04T12:04:00.844Z')) ).toBe(false);
        expect( isStep(1) ).toBe(false);
        expect( isStep(12) ).toBe(false);
        expect( isStep(-12) ).toBe(false);
        expect( isStep(123) ).toBe(false);
        expect( isStep(123.99999) ).toBe(false);
        expect( isStep(-123.99999) ).toBe(false);
        expect( isStep("123") ).toBe(false);
        expect( isStep("hello") ).toBe(false);
        expect( isStep("") ).toBe(false);
        expect( isStep([]) ).toBe(false);
        expect( isStep([123]) ).toBe(false);
        expect( isStep(["123"]) ).toBe(false);
        expect( isStep(["Hello world", "foo"]) ).toBe(false);
        expect( isStep({}) ).toBe(false);
        expect( isStep({"foo":"bar"}) ).toBe(false);
        expect( isStep({"foo":1234}) ).toBe(false);

    });

});

describe('parseStep', () => {

    test( 'can parse Steps', () => {

        expect( parseStep({
            name: 'get_date',
            command: 'date'
        }) ).toStrictEqual({
            name: 'get_date',
            command: 'date'
        });

    });

    test( 'returns undefined for invalid values', () => {

        expect( parseStep(undefined) ).toBeUndefined();
        expect( parseStep(null) ).toBeUndefined();
        expect( parseStep(false) ).toBeUndefined();
        expect( parseStep(true) ).toBeUndefined();
        expect( parseStep(NaN) ).toBeUndefined();
        expect( parseStep(() => {}) ).toBeUndefined();
        expect( parseStep(0) ).toBeUndefined();
        expect( parseStep(Symbol()) ).toBeUndefined();
        expect( parseStep(1628078651664) ).toBeUndefined();
        expect( parseStep(new Date('2021-08-04T12:04:00.844Z')) ).toBeUndefined();
        expect( parseStep(1) ).toBeUndefined();
        expect( parseStep(12) ).toBeUndefined();
        expect( parseStep(-12) ).toBeUndefined();
        expect( parseStep(123) ).toBeUndefined();
        expect( parseStep(123.99999) ).toBeUndefined();
        expect( parseStep(-123.99999) ).toBeUndefined();
        expect( parseStep("123") ).toBeUndefined();
        expect( parseStep("hello") ).toBeUndefined();
        expect( parseStep("") ).toBeUndefined();
        expect( parseStep([]) ).toBeUndefined();
        expect( parseStep([123]) ).toBeUndefined();
        expect( parseStep(["123"]) ).toBeUndefined();
        expect( parseStep(["Hello world", "foo"]) ).toBeUndefined();
        expect( parseStep({}) ).toBeUndefined();
        expect( parseStep({"foo":"bar"}) ).toBeUndefined();
        expect( parseStep({"foo":1234}) ).toBeUndefined();

    });

});
