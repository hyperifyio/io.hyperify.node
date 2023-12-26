// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import { LogLevel } from "../core/types/LogLevel";
import { SmsVerificationServiceImpl } from "./SmsVerificationServiceImpl";

jest.useFakeTimers();

beforeAll(() => {
    SmsVerificationServiceImpl.setLogLevel(LogLevel.NONE);
});

describe('SmsVerificationServiceImpl', () => {

    describe('create', () => {
        it('creates a new instance with default verification timeout', () => {
            const service = SmsVerificationServiceImpl.create();
            expect(service).toBeInstanceOf(SmsVerificationServiceImpl);
            // Test if default timeout is set, using any method to access it.
        });

        it('creates a new instance with provided verification timeout', () => {
            const customTimeout = 10 * 60 * 1000;
            const service = SmsVerificationServiceImpl.create(customTimeout);
            expect(service).toBeInstanceOf(SmsVerificationServiceImpl);
            // Test if custom timeout is set, using any method to access it.
        });
    });

    describe('destroy', () => {
        it('clears all timers and codes', () => {
            const service = SmsVerificationServiceImpl.create();
            /*const code = */service.createVerificationCode('+358409970704');
            service.destroy();
            // Check the timer is cleared and codes array is empty
        });
    });

    describe('verifyCode', () => {
        it('verifies a valid code and removes it', () => {
            const service = SmsVerificationServiceImpl.create();
            const sms = '+358409970704';
            const code = service.createVerificationCode(sms);

            expect(service.verifyCode(sms, code)).toBeTruthy();
            expect(service.verifyCode(sms, code)).toBeFalsy();
        });

        it('does not verify an invalid code', () => {
            const service = SmsVerificationServiceImpl.create();
            const sms = '+358409970704';
            service.createVerificationCode(sms);

            expect(service.verifyCode(sms, '0000')).toBeFalsy();
        });
    });

    describe('removeVerificationCode', () => {
        it('removes a valid code', () => {
            const service = SmsVerificationServiceImpl.create();
            const sms = '+358409970704';
            const code = service.createVerificationCode(sms);

            service.removeVerificationCode(sms, code);
            expect(service.verifyCode(sms, code)).toBeFalsy();
        });

        it('throws an error when sms or code are not provided', () => {
            const service = SmsVerificationServiceImpl.create();
            const sms = '+358409970704';
            const code = service.createVerificationCode(sms);

            expect(() => service.removeVerificationCode('', code)).toThrow(TypeError);
            expect(() => service.removeVerificationCode(sms, '')).toThrow(TypeError);
        });
    });

    describe('createVerificationCode', () => {
        it('creates a new code for a given sms and removes old ones', () => {
            const service = SmsVerificationServiceImpl.create();
            const sms = '+358409970704';
            const code1 = service.createVerificationCode(sms);
            const code2 = service.createVerificationCode(sms);

            expect(service.verifyCode(sms, code1)).toBeFalsy();
            expect(service.verifyCode(sms, code2)).toBeTruthy();
        });

        it('automatically removes the code after timeout', () => {
            const timeout = 1000;
            const service = SmsVerificationServiceImpl.create(timeout);
            const sms = '+358409970704';
            const code = service.createVerificationCode(sms);

            jest.runAllTimers();

            expect(service.verifyCode(sms, code)).toBeFalsy();
        });
    });

});
