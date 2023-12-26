// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import { LogLevel } from "../core/types/LogLevel";
import { EmailVerificationServiceImpl } from "./EmailVerificationServiceImpl";

jest.useFakeTimers();

beforeAll(() => {
    EmailVerificationServiceImpl.setLogLevel(LogLevel.NONE);
});

describe('EmailVerificationServiceImpl', () => {

    describe('create', () => {
        it('creates a new instance with default verification timeout', () => {
            const service = EmailVerificationServiceImpl.create();
            expect(service).toBeInstanceOf(EmailVerificationServiceImpl);
            // Test if default timeout is set, using any method to access it.
        });

        it('creates a new instance with provided verification timeout', () => {
            const customTimeout = 10 * 60 * 1000;
            const service = EmailVerificationServiceImpl.create(customTimeout);
            expect(service).toBeInstanceOf(EmailVerificationServiceImpl);
            // Test if custom timeout is set, using any method to access it.
        });
    });

    describe('destroy', () => {
        it('clears all timers and codes', () => {
            const service = EmailVerificationServiceImpl.create();
            // const code = service.createVerificationCode('test@example.com');
            service.destroy();
            // Check the timer is cleared and codes array is empty
        });
    });

    describe('verifyCode', () => {
        it('verifies a valid code and removes it', () => {
            const service = EmailVerificationServiceImpl.create();
            const email = 'test@example.com';
            const code = service.createVerificationCode(email);

            expect(service.verifyCode(email, code)).toBeTruthy();
            expect(service.verifyCode(email, code)).toBeFalsy();
        });

        it('does not verify an invalid code', () => {
            const service = EmailVerificationServiceImpl.create();
            const email = 'test@example.com';
            service.createVerificationCode(email);

            expect(service.verifyCode(email, '0000')).toBeFalsy();
        });
    });

    describe('removeVerificationCode', () => {
        it('removes a valid code', () => {
            const service = EmailVerificationServiceImpl.create();
            const email = 'test@example.com';
            const code = service.createVerificationCode(email);

            service.removeVerificationCode(email, code);
            expect(service.verifyCode(email, code)).toBeFalsy();
        });

        it('throws an error when email or code are not provided', () => {
            const service = EmailVerificationServiceImpl.create();
            const email = 'test@example.com';
            const code = service.createVerificationCode(email);

            expect(() => service.removeVerificationCode('', code)).toThrow(TypeError);
            expect(() => service.removeVerificationCode(email, '')).toThrow(TypeError);
        });
    });

    describe('createVerificationCode', () => {
        it('creates a new code for a given email and removes old ones', () => {
            const service = EmailVerificationServiceImpl.create();
            const email = 'test@example.com';
            const code1 = service.createVerificationCode(email);
            const code2 = service.createVerificationCode(email);

            expect(service.verifyCode(email, code1)).toBeFalsy();
            expect(service.verifyCode(email, code2)).toBeTruthy();
        });

        it('automatically removes the code after timeout', () => {
            const timeout = 1000;
            const service = EmailVerificationServiceImpl.create(timeout);
            const email = 'test@example.com';
            const code = service.createVerificationCode(email);

            jest.runAllTimers();

            expect(service.verifyCode(email, code)).toBeFalsy();
        });
    });

});
