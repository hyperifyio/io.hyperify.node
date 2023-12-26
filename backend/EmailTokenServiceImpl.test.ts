// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import { JwtDecodeService } from "../core/jwt/JwtDecodeService";
import { JwtEngine } from "../core/jwt/JwtEngine";
import { LogLevel } from "../core/types/LogLevel";
import { EmailTokenServiceImpl } from "./EmailTokenServiceImpl";

describe('EmailTokenServiceImpl', () => {

    beforeAll(() => {
        EmailTokenServiceImpl.setLogLevel(LogLevel.NONE);
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

    const service = EmailTokenServiceImpl.create(
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
            const email = 'foo@example.fi';
            const token = 'token';
            const requireVerifiedToken = true;
            const alg = 'HS256';

            (jwtDecodeService.decodePayload as any).mockReturnValue({
                sub: email,
                exp: 123
            });

            // Execute
            const result = service.verifyToken(email, token, requireVerifiedToken, alg);

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
            const email = 'foo@example.fi';
            const token = 'token';
            const alg = 'HS256';

            (jwtDecodeService.decodePayload as any).mockReturnValue({
                sub: email,
                exp: 123
            });

            // Execute
            const result = service.verifyValidTokenForSubject(token, email, alg);

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
            const email = 'foo@example.fi';
            const token = 'token';
            const requireVerifiedToken = true;
            const alg = 'HS256';

            (jwtDecodeService.decodePayload as any).mockReturnValue({
                sub: email,
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

    describe('createUnverifiedEmailToken', () => {
        it('creates an unverified email token', () => {
            // Prepare
            const email = 'foo@example.fi';
            const alg = 'HS256';

            // Execute
            const result = service.createUnverifiedEmailToken(email, alg);

            // Assert
            expect(result).toBeDefined();
            expect(result.token).toBeDefined();
            expect(result.email).toBe(email);

            expect(jwtEngine.sign).toHaveBeenCalledTimes(1);
            expect(jwtEngine.sign).toHaveBeenCalledWith(
                {
                    aud: email,
                    exp: expect.any(Number)
                },
                alg
            );

        });
    });

    describe('createVerifiedEmailToken', () => {
        it('creates a verified email token', () => {
            // Prepare
            const email = 'foo@example.fi';
            const alg = 'HS256';

            // Execute
            const result = service.createVerifiedEmailToken(email, alg);

            // Assert
            expect(result).toBeDefined();
            expect(result.token).toBe('signature');
            expect(result.email).toBe(email);
            expect(result.verified).toBe(true);

            expect(jwtEngine.sign).toHaveBeenCalledTimes(1);
            expect(jwtEngine.sign).toHaveBeenCalledWith(
                {
                    exp: expect.any(Number),
                    sub: email
                },
                alg
            );

        });
    });

});
