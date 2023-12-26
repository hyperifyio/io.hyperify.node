// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import { EmailAuthMessageService } from "../core/auth/EmailAuthMessageService";
import { EmailTokenService } from "../core/auth/EmailTokenService";
import { EmailVerificationService } from "../core/auth/EmailVerificationService";
import { JwtDecodeService } from "../core/jwt/JwtDecodeService";
import { ResponseEntity } from "../core/request/types/ResponseEntity";
import { Language } from "../core/types/Language";
import { LogLevel } from "../core/types/LogLevel";
import { EmailAuthControllerImpl } from "./EmailAuthControllerImpl";

describe('EmailAuthControllerImpl', () => {

    beforeAll(() => {
        EmailAuthControllerImpl.setLogLevel(LogLevel.NONE);
    });

    let emailTokenService: EmailTokenService;
    let emailVerificationService: EmailVerificationService;
    let emailAuthMessageService: EmailAuthMessageService;
    let jwtDecodeService: JwtDecodeService;
    let controller: EmailAuthControllerImpl;

    beforeEach(() => {
        // Reset the mocks before each test
        jest.resetAllMocks();

        emailTokenService = {
            verifyToken: jest.fn(),
            verifyValidTokenForSubject: jest.fn(),
            isTokenValid: jest.fn(),
            verifyTokenOnly: jest.fn(),
            createUnverifiedEmailToken: jest.fn(),
            createVerifiedEmailToken: jest.fn(),
        };
        emailVerificationService = {
            destroy: jest.fn(),
            verifyCode: jest.fn(),
            removeVerificationCode: jest.fn(),
            createVerificationCode: jest.fn(),
        };
        emailAuthMessageService = {
            sendAuthenticationCode: jest.fn()
        };
        jwtDecodeService = {
            setLogLevel: jest.fn(),
            decodePayload: jest.fn(),
            decodePayloadAudience: jest.fn(),
            decodePayloadSubject: jest.fn(),
            decodePayloadVerified: jest.fn(),
        };

        controller = EmailAuthControllerImpl.create(
            Language.ENGLISH,
            emailTokenService,
            emailVerificationService,
            emailAuthMessageService,
            jwtDecodeService,
        );

    });

    describe('authenticateEmail', () => {

        it('should return bad request if the body is not an AuthenticateEmailDTO', async () => {
            // Given
            const body = {};
            const langString = '';

            // When
            const result = await controller.authenticateEmail(body, langString);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(400);
        });

        it('should return bad request if the email is missing in the body', async () => {
            // Given
            const body = {
                notEmail: 'Not an email'
            };
            const langString = 'ENGLISH';

            // When
            const result = await controller.authenticateEmail(body, langString);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(400);
        });

        it('should return internal server error if the email sending fails', async () => {
            // Given
            const body = {
                email: 'test@email.com'
            };
            const langString = 'ENGLISH';

            (emailVerificationService.createVerificationCode as jest.Mock).mockReturnValue('123456');
            (emailTokenService.createUnverifiedEmailToken as jest.Mock).mockReturnValue({
                token: 'random_token',
                email: 'test@email.com',
                verified: false
            });
            (emailAuthMessageService.sendAuthenticationCode as jest.Mock).mockImplementation(() => {
                throw new Error('Email sending failed');
            });

            // When
            const result = await controller.authenticateEmail(body, langString);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(500);
        });

        it('should return an email token if everything is okay', async () => {
            // Given
            const body = {
                email: 'test@email.com'
            };
            const langString = 'ENGLISH';

            (emailVerificationService.createVerificationCode as jest.Mock).mockReturnValue('123456');
            (emailTokenService.createUnverifiedEmailToken as jest.Mock).mockReturnValue({
                token: 'random_token',
                email: 'test@email.com',
                verified: false
            });
            (emailAuthMessageService.sendAuthenticationCode as jest.Mock).mockResolvedValue(undefined);

            // When
            const result = await controller.authenticateEmail(body, langString);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(200);
            expect(result.getBody()).toEqual({
                token: 'random_token',
                email: 'test@email.com',
                verified: false
            });
        });

    });

    describe('verifyEmailCode', () => {

        it('should return bad request if the body is not an VerifyEmailCodeDTO', async () => {
            // Given
            const body = {};

            // When
            const result = await controller.verifyEmailCode(body);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(400);
        });

        it('should return bad request if the code or email is missing in the body', async () => {
            // Given
            const body = {
                email: 'test@email.com'
                // Missing code
            };

            // When
            const result = await controller.verifyEmailCode(body);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(400);
        });

        it('should return unauthorized if the code is not correct', async () => {
            // Given
            const body = {
                token: {
                    email: 'test@email.com',
                    token: 'token'
                },
                code: '123456'
            };

            (emailVerificationService.verifyCode as jest.Mock).mockReturnValue(false);

            // When
            const result = await controller.verifyEmailCode(body);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(403);
        });

        it('should return an verified email token if the code is correct', async () => {
            // Given
            const body = {
                token: {
                    email: 'test@email.com',
                    token: 'token'
                },
                code: '123456'
            };

            (emailVerificationService.verifyCode as jest.Mock).mockReturnValue(true);
            (emailTokenService.verifyToken as jest.Mock).mockReturnValue(true);
            (emailTokenService.createVerifiedEmailToken as jest.Mock).mockReturnValue({
                token: 'verified_token',
                email: 'test@email.com',
                verified: true
            });

            // When
            const result = await controller.verifyEmailCode(body);

            // Then
            expect(emailVerificationService.verifyCode).toHaveBeenCalledTimes(1);
            expect(emailVerificationService.verifyCode).toHaveBeenCalledWith(
                'test@email.com',
                '123456',
            );

            expect(emailTokenService.verifyToken).toHaveBeenCalledTimes(1);
            expect(emailTokenService.verifyToken).toHaveBeenCalledWith(
                'test@email.com',
                'token',
                false
            );

            expect(emailTokenService.createVerifiedEmailToken).toHaveBeenCalledTimes(1);
            expect(emailTokenService.createVerifiedEmailToken).toHaveBeenCalledWith(
                'test@email.com',
            );

            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(200);
            expect(result.getBody()).toEqual({
                token: 'verified_token',
                email: 'test@email.com',
                verified: true
            });
        });

    });

    describe('verifyEmailToken', () => {

        it('should return bad request if the token is not provided', async () => {
            // Given
            const token = '';

            // When
            const result = await controller.verifyEmailToken(token);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(400);
        });

        it('should return unauthorized if the token is not valid', async () => {
            // Given
            const token = {
                token: {
                    email: 'test@email.com',
                    token: 'invalid_token'
                }
            };

            (emailTokenService.verifyToken as jest.Mock).mockReturnValue(false);

            // When
            const result = await controller.verifyEmailToken(token);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(403);
        });

        it('should return token information if the token is valid', async () => {
            // Given
            const token = {
                token: {
                    email: 'test@email.com',
                    token: 'valid_token'
                }
            };

            const tokenInfo = {
                email: 'test@email.com',
                verified: true,
            };

            (emailTokenService.verifyToken as jest.Mock).mockReturnValue(true);
            (jwtDecodeService.decodePayload as jest.Mock).mockReturnValue(tokenInfo);
            (emailTokenService.createVerifiedEmailToken as jest.Mock).mockReturnValue(tokenInfo);

            // When
            const result = await controller.verifyEmailToken(token);

            expect(emailTokenService.verifyToken).toHaveBeenCalledTimes(1);
            expect(emailTokenService.verifyToken).toHaveBeenCalledWith('test@email.com', 'valid_token', true);

            expect(emailTokenService.createVerifiedEmailToken).toHaveBeenCalledTimes(1);
            expect(emailTokenService.createVerifiedEmailToken).toHaveBeenCalledWith('test@email.com');

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(200);
            expect(result.getBody()).toEqual(tokenInfo);
        });

    });

    describe('verifyTokenAndReturnSubject', () => {

        it('should have error if the token is not provided', async () => {
            // Given
            const token = '';

            // Then
            await expect(controller.verifyTokenAndReturnSubject(token)).rejects.toThrow('Token was invalid: ');

        });

        it('should have error if the token is not valid', async () => {
            // Given
            const token = 'invalid_token';

            (emailTokenService.verifyToken as jest.Mock).mockReturnValue(false);

            // When
            await expect(controller.verifyTokenAndReturnSubject(token)).rejects.toThrow('Token was invalid: ');

        });

        it('should return subject information if the token is valid', async () => {
            // Given
            const token = 'valid_token';
            const subjectInfo = 'test@email.com';

            (emailTokenService.isTokenValid as jest.Mock).mockReturnValue(true);
            (jwtDecodeService.decodePayloadSubject as jest.Mock).mockReturnValue(subjectInfo);

            // When
            const result = await controller.verifyTokenAndReturnSubject(token);

            expect(emailTokenService.isTokenValid).toHaveBeenCalledTimes(1);
            expect(emailTokenService.isTokenValid).toHaveBeenCalledWith(token);

            expect(jwtDecodeService.decodePayloadSubject).toHaveBeenCalledTimes(1);
            expect(jwtDecodeService.decodePayloadSubject).toHaveBeenCalledWith(token);

            // Then
            expect(result).toBe(subjectInfo);
        });

    });

});
