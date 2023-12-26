// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import { JwtDecodeService } from "../core/jwt/JwtDecodeService";
import { JwtEngine } from "../core/jwt/JwtEngine";
import { LogLevel } from "../core/types/LogLevel";
import { SmsTokenServiceImpl } from "./SmsTokenServiceImpl";

describe('SmsTokenServiceImpl', () => {

    beforeAll(() => {
        SmsTokenServiceImpl.setLogLevel(LogLevel.NONE);
    });

    // Initial setup
    const jwtEngine : JwtEngine = {
        getDefaultAlgorithm: jest.fn(),
        setDefaultAlgorithm: jest.fn(),
        sign: jest.fn(),
        verify: jest.fn(),
    };

    const jwtDecodeService : JwtDecodeService = {
        setLogLevel: jest.fn(),
        decodePayload: jest.fn(),
        decodePayloadAudience: jest.fn(),
        decodePayloadSubject: jest.fn(),
        decodePayloadVerified: jest.fn(),
    };

    const service = SmsTokenServiceImpl.create(
        jwtEngine,
        5,
        365,
        jwtDecodeService,
    );

    beforeEach( () => {
        (jwtEngine.getDefaultAlgorithm as any).mockReturnValue('HS256');
        (jwtEngine.verify as any).mockReturnValue(true);
        (jwtEngine.sign as any).mockReturnValue('signature');
        (jwtDecodeService.decodePayload as any).mockReturnValue({
            sub: '',
            aud: '',
            exp: 123
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('verifyToken', () => {
        it('verifies the token', () => {
            // Prepare
            const sms = 'foo@example.fi';
            const token = 'token';
            const requireVerifiedToken = true;
            const alg = 'HS256';

            (jwtDecodeService.decodePayload as any).mockReturnValue({
                sub: sms,
                exp: 123
            });

            // Execute
            const result = service.verifyToken(sms, token, requireVerifiedToken, alg);

            // Assert
            expect(result).toBeDefined();
            expect(result).toBe(true);

            expect(jwtDecodeService.decodePayload).toHaveBeenCalledTimes(1);
            expect(jwtDecodeService.decodePayload).toHaveBeenCalledWith("token");

            expect(jwtEngine.verify).toHaveBeenCalledTimes(1);
            expect(jwtEngine.verify).toHaveBeenCalledWith(token, alg);

        });
    });

    describe('verifyValidTokenForSubject', () => {

        it('verifies the token for a subject', () => {
            // Prepare
            const sms = 'foo@example.fi';
            const token = 'token';
            const alg = 'HS256';

            (jwtDecodeService.decodePayload as any).mockReturnValue({
                sub: sms,
                exp: 123
            });

            // Execute
            const result = service.verifyValidTokenForSubject(token, sms, alg);

            // Assert
            expect(result).toBeDefined();
            expect(result).toBe(true);

            expect(jwtDecodeService.decodePayload).toHaveBeenCalledTimes(1);
            expect(jwtDecodeService.decodePayload).toHaveBeenCalledWith(token);

            expect(jwtEngine.verify).toHaveBeenCalledTimes(1);
            expect(jwtEngine.verify).toHaveBeenCalledWith(token, alg);

        });

    });

    describe('isTokenValid', () => {
        it('checks if the token is valid', () => {
            // Prepare
            const token = 'token';
            const alg = 'HS256';

            // Execute
            const result = service.isTokenValid(token, alg);

            // Assert
            expect(result).toBeDefined();
            expect(result).toBe(true);

            expect(jwtEngine.verify).toHaveBeenCalledTimes(1);
            expect(jwtEngine.verify).toHaveBeenCalledWith(token, alg);

        });
    });

    describe('verifyTokenOnly', () => {
        it('verifies the token only', () => {
            // Prepare
            const sms = 'foo@example.fi';
            const token = 'token';
            const requireVerifiedToken = true;
            const alg = 'HS256';

            (jwtDecodeService.decodePayload as any).mockReturnValue({
                sub: sms,
                exp: 123
            });

            // Execute
            const result = service.verifyTokenOnly(token, requireVerifiedToken, alg);

            // Assert
            expect(jwtDecodeService.decodePayload).toHaveBeenCalledTimes(1);
            expect(jwtDecodeService.decodePayload).toHaveBeenCalledWith(token);

            expect(jwtEngine.verify).toHaveBeenCalledTimes(1);
            expect(jwtEngine.verify).toHaveBeenCalledWith(
                token,
                alg
            );

            expect(result).toBeDefined();
            expect(result).toBe(true);

        });
    });

    describe('createUnverifiedSmsToken', () => {
        it('creates an unverified sms token', () => {
            // Prepare
            const sms = 'foo@example.fi';
            const alg = 'HS256';

            // Execute
            const result = service.createUnverifiedSmsToken(sms, alg);

            // Assert
            expect(result).toBeDefined();
            expect(result.token).toBeDefined();
            expect(result.sms).toBe(sms);

            expect(jwtEngine.sign).toHaveBeenCalledTimes(1);
            expect(jwtEngine.sign).toHaveBeenCalledWith(
                {
                    aud: sms,
                    exp: expect.any(Number)
                },
                alg
            );

        });
    });

    describe('createVerifiedSmsToken', () => {
        it('creates a verified sms token', () => {
            // Prepare
            const sms = 'foo@example.fi';
            const alg = 'HS256';

            // Execute
            const result = service.createVerifiedSmsToken(sms, alg);

            // Assert
            expect(result).toBeDefined();
            expect(result.token).toBe('signature');
            expect(result.sms).toBe(sms);
            expect(result.verified).toBe(true);

            expect(jwtEngine.sign).toHaveBeenCalledTimes(1);
            expect(jwtEngine.sign).toHaveBeenCalledWith(
                {
                    exp: expect.any(Number),
                    sub: sms
                },
                alg
            );

        });
    });

});
