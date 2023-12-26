// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import { SmsAuthMessageService } from "../core/auth/SmsAuthMessageService";
import { SmsTokenService } from "../core/auth/SmsTokenService";
import { SmsVerificationService } from "../core/auth/SmsVerificationService";
import { JwtDecodeService } from "../core/jwt/JwtDecodeService";
import { ResponseEntity } from "../core/request/types/ResponseEntity";
import { Language } from "../core/types/Language";
import { LogLevel } from "../core/types/LogLevel";
import { SmsAuthControllerImpl } from "./SmsAuthControllerImpl";

describe('SmsAuthControllerImpl', () => {

    beforeAll(() => {
        SmsAuthControllerImpl.setLogLevel(LogLevel.NONE);
    });

    let smsTokenService: SmsTokenService;
    let smsVerificationService: SmsVerificationService;
    let smsAuthMessageService: SmsAuthMessageService;
    let jwtDecodeService: JwtDecodeService;
    let controller: SmsAuthControllerImpl;

    beforeEach(() => {
        // Reset the mocks before each test
        jest.resetAllMocks();

        smsTokenService = {
            verifyToken: jest.fn(),
            verifyValidTokenForSubject: jest.fn(),
            isTokenValid: jest.fn(),
            verifyTokenOnly: jest.fn(),
            createUnverifiedSmsToken: jest.fn(),
            createVerifiedSmsToken: jest.fn(),
        };
        smsVerificationService = {
            destroy: jest.fn(),
            verifyCode: jest.fn(),
            removeVerificationCode: jest.fn(),
            createVerificationCode: jest.fn(),
        };
        smsAuthMessageService = {
            sendAuthenticationCode: jest.fn()
        };
        jwtDecodeService = {
            setLogLevel: jest.fn(),
            decodePayload: jest.fn(),
            decodePayloadAudience: jest.fn(),
            decodePayloadSubject: jest.fn(),
            decodePayloadVerified: jest.fn(),
        };

        controller = SmsAuthControllerImpl.create(
            Language.ENGLISH,
            '+358',
            smsTokenService,
            smsVerificationService,
            smsAuthMessageService,
            jwtDecodeService,
        );

    });

    describe('authenticateSms', () => {

        it('should return bad request if the body is not an AuthenticateSmsDTO', async () => {
            // Given
            const body = {};
            const langString = '';

            // When
            const result = await controller.authenticateSms(body, langString);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(400);
        });

        it('should return bad request if the sms is missing in the body', async () => {
            // Given
            const body = {
                notSms: 'Not an sms'
            };
            const langString = 'ENGLISH';

            // When
            const result = await controller.authenticateSms(body, langString);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(400);
        });

        it('should return internal server error if the sms sending fails', async () => {
            // Given
            const body = {
                sms: 'test@sms.com'
            };
            const langString = 'ENGLISH';

            (smsVerificationService.createVerificationCode as jest.Mock).mockReturnValue('123456');
            (smsTokenService.createUnverifiedSmsToken as jest.Mock).mockReturnValue({
                token: 'random_token',
                sms: 'test@sms.com',
                verified: false
            });
            (smsAuthMessageService.sendAuthenticationCode as jest.Mock).mockImplementation(() => {
                throw new Error('Sms sending failed');
            });

            // When
            const result = await controller.authenticateSms(body, langString);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(500);
        });

        it('should return an sms token if everything is okay', async () => {
            // Given
            const body = {
                sms: 'test@sms.com'
            };
            const langString = 'ENGLISH';

            (smsVerificationService.createVerificationCode as jest.Mock).mockReturnValue('123456');
            (smsTokenService.createUnverifiedSmsToken as jest.Mock).mockReturnValue({
                token: 'random_token',
                sms: 'test@sms.com',
                verified: false
            });
            (smsAuthMessageService.sendAuthenticationCode as jest.Mock).mockResolvedValue(undefined);

            // When
            const result = await controller.authenticateSms(body, langString);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(200);
            expect(result.getBody()).toEqual({
                token: 'random_token',
                sms: 'test@sms.com',
                verified: false
            });
        });

    });

    describe('verifySmsCode', () => {

        it('should return bad request if the body is not an VerifySmsCodeDTO', async () => {
            // Given
            const body = {};

            // When
            const result = await controller.verifySmsCode(body);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(400);
        });

        it('should return bad request if the code or sms is missing in the body', async () => {
            // Given
            const body = {
                sms: 'test@sms.com'
                // Missing code
            };

            // When
            const result = await controller.verifySmsCode(body);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(400);
        });

        it('should return unauthorized if the code is not correct', async () => {
            // Given
            const body = {
                token: {
                    sms: 'test@sms.com',
                    token: 'token'
                },
                code: '123456'
            };

            (smsVerificationService.verifyCode as jest.Mock).mockReturnValue(false);

            // When
            const result = await controller.verifySmsCode(body);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(403);
        });

        it('should return an verified sms token if the code is correct', async () => {
            // Given
            const body = {
                token: {
                    sms: 'test@sms.com',
                    token: 'token'
                },
                code: '123456'
            };

            (smsVerificationService.verifyCode as jest.Mock).mockReturnValue(true);
            (smsTokenService.verifyToken as jest.Mock).mockReturnValue(true);
            (smsTokenService.createVerifiedSmsToken as jest.Mock).mockReturnValue({
                token: 'verified_token',
                sms: 'test@sms.com',
                verified: true
            });

            // When
            const result = await controller.verifySmsCode(body);

            // Then
            expect(smsVerificationService.verifyCode).toHaveBeenCalledTimes(1);
            expect(smsVerificationService.verifyCode).toHaveBeenCalledWith(
                'test@sms.com',
                '123456',
            );

            expect(smsTokenService.verifyToken).toHaveBeenCalledTimes(1);
            expect(smsTokenService.verifyToken).toHaveBeenCalledWith(
                'test@sms.com',
                'token',
                false
            );

            expect(smsTokenService.createVerifiedSmsToken).toHaveBeenCalledTimes(1);
            expect(smsTokenService.createVerifiedSmsToken).toHaveBeenCalledWith(
                'test@sms.com',
            );

            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(200);
            expect(result.getBody()).toEqual({
                token: 'verified_token',
                sms: 'test@sms.com',
                verified: true
            });
        });

    });

    describe('verifySmsToken', () => {

        it('should return bad request if the token is not provided', async () => {
            // Given
            const token = '';

            // When
            const result = await controller.verifySmsToken(token);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(400);
        });

        it('should return unauthorized if the token is not valid', async () => {
            // Given
            const token = {
                token: {
                    sms: 'test@sms.com',
                    token: 'invalid_token'
                }
            };

            (smsTokenService.verifyToken as jest.Mock).mockReturnValue(false);

            // When
            const result = await controller.verifySmsToken(token);

            // Then
            expect(result).toBeInstanceOf(ResponseEntity);
            expect(result.getStatusCode()).toBe(403);
        });

        it('should return token information if the token is valid', async () => {
            // Given
            const token = {
                token: {
                    sms: 'test@sms.com',
                    token: 'valid_token'
                }
            };

            const tokenInfo = {
                sms: 'test@sms.com',
                verified: true,
            };

            (smsTokenService.verifyToken as jest.Mock).mockReturnValue(true);
            (jwtDecodeService.decodePayload as jest.Mock).mockReturnValue(tokenInfo);
            (smsTokenService.createVerifiedSmsToken as jest.Mock).mockReturnValue(tokenInfo);

            // When
            const result = await controller.verifySmsToken(token);

            expect(smsTokenService.verifyToken).toHaveBeenCalledTimes(1);
            expect(smsTokenService.verifyToken).toHaveBeenCalledWith('test@sms.com', 'valid_token', true);

            expect(smsTokenService.createVerifiedSmsToken).toHaveBeenCalledTimes(1);
            expect(smsTokenService.createVerifiedSmsToken).toHaveBeenCalledWith('test@sms.com');

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

            (smsTokenService.verifyToken as jest.Mock).mockReturnValue(false);

            // When
            await expect(controller.verifyTokenAndReturnSubject(token)).rejects.toThrow('Token was invalid: ');

        });

        it('should return subject information if the token is valid', async () => {
            // Given
            const token = 'valid_token';
            const subjectInfo = 'test@sms.com';

            (smsTokenService.isTokenValid as jest.Mock).mockReturnValue(true);
            (jwtDecodeService.decodePayloadSubject as jest.Mock).mockReturnValue(subjectInfo);

            // When
            const result = await controller.verifyTokenAndReturnSubject(token);

            expect(smsTokenService.isTokenValid).toHaveBeenCalledTimes(1);
            expect(smsTokenService.isTokenValid).toHaveBeenCalledWith(token);

            expect(jwtDecodeService.decodePayloadSubject).toHaveBeenCalledTimes(1);
            expect(jwtDecodeService.decodePayloadSubject).toHaveBeenCalledWith(token);

            // Then
            expect(result).toBe(subjectInfo);
        });

    });

});
