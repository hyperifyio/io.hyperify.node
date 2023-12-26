// Copyright (c) 2022-2023. <info@heusalagroup.fi>. All rights reserved.

import { SmsAuthController } from "../core/auth/SmsAuthController";
import { trim } from "../core/functions/trim";
import { ReadonlyJsonAny } from "../core/Json";
import { JwtDecodeService } from "../core/jwt/JwtDecodeService";
import { PhoneNumberUtils } from "../core/PhoneNumberUtils";
import { ResponseEntity } from "../core/request/types/ResponseEntity";
import { createErrorDTO, ErrorDTO } from "../core/types/ErrorDTO";
import { Language, parseLanguage } from "../core/types/Language";
import { SmsAuthMessageService } from "../core/auth/SmsAuthMessageService";
import { SmsTokenService } from "../core/auth/SmsTokenService";
import { SmsVerificationService } from "../core/auth/SmsVerificationService";
import { LogService } from "../core/LogService";
import { isAuthenticateSmsDTO } from "../core/auth/sms/types/AuthenticateSmsDTO";
import { isVerifySmsTokenDTO } from "../core/auth/sms/types/VerifySmsTokenDTO";
import { isVerifySmsCodeDTO } from "../core/auth/sms/types/VerifySmsCodeDTO";
import { SmsTokenDTO } from "../core/auth/sms/types/SmsTokenDTO";
import { JwtDecodeServiceImpl } from "./JwtDecodeServiceImpl";
import { isString } from "../core/types/String";
import { LogLevel } from "../core/types/LogLevel";

const LOG = LogService.createLogger('SmsAuthControllerImpl');

/**
 * This HTTP backend controller can be used to validate the ownership of user's
 * sms address.
 *
 *  1. Call .authenticateSms(body, lang) to send the authentication sms
 *  2. Call .verifySmsCode(body) to verify user supplied code from the sms and create a session JWT
 *  3. Call .verifySmsToken(body) to verify validity of the previously created session JWT and to refresh the session
 *
 * The .verifyTokenAndReturnSubject(token) can be used to validate internally API calls in your own APIs.
 */
export class SmsAuthControllerImpl implements SmsAuthController {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private _defaultLanguage : Language;
    private _defaultPhonePrefix : string;
    private _smsTokenService : SmsTokenService;
    private _smsVerificationService : SmsVerificationService;
    private _smsAuthMessageService : SmsAuthMessageService;
    private _jwtDecodeService: JwtDecodeService;

    protected constructor (
        defaultLanguage: Language = Language.ENGLISH,
        defaultPhonePrefix: string,
        smsTokenService: SmsTokenService,
        smsVerificationService: SmsVerificationService,
        smsAuthMessageService: SmsAuthMessageService,
        jwtDecodeService: JwtDecodeService,
    ) {
        this._defaultLanguage = defaultLanguage;
        this._defaultPhonePrefix = defaultPhonePrefix;
        this._smsTokenService = smsTokenService;
        this._smsVerificationService = smsVerificationService;
        this._smsAuthMessageService = smsAuthMessageService;
        this._jwtDecodeService = jwtDecodeService;
    }

    public static create (
        defaultLanguage: Language = Language.ENGLISH,
        defaultPhonePrefix: string,
        smsTokenService: SmsTokenService,
        smsVerificationService: SmsVerificationService,
        smsAuthMessageService: SmsAuthMessageService,
        jwtDecodeService: JwtDecodeService = JwtDecodeServiceImpl,
    ) {
        return new SmsAuthControllerImpl(
            defaultLanguage,
            defaultPhonePrefix,
            smsTokenService,
            smsVerificationService,
            smsAuthMessageService,
            jwtDecodeService,
        );
    }

    /**
     * Set default language for messages sent to the user by sms.
     * @param value
     */
    public setDefaultLanguage (value: Language) {
        this._defaultLanguage = value;
    }

    /**
     * @inheritDoc
     */
    public setDefaultPhonePrefix (value: string) : void {
        this._defaultPhonePrefix = value;
    }

    /**
     * Handles POST HTTP request to initiate an sms address authentication by
     * sending one time code to the user as a sms message.
     *
     * The message should be in format `AuthenticateSmsDTO`.
     *
     * @param body {AuthenticateSmsDTO}
     * @param langString {Language} The optional language of the message
     */
    public async authenticateSms (
        body: ReadonlyJsonAny,
        langString: string = ""
    ): Promise<ResponseEntity<SmsTokenDTO | ErrorDTO>> {
        try {

            const lang: Language = parseLanguage(langString) ?? this._defaultLanguage;

            if ( !isAuthenticateSmsDTO(body) ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not AuthenticateSmsDTO`, 400)
                ).status(400);
            }

            let sms : string = trim(body.sms);
            LOG.debug('authenticateSms: body = ', body);
            if ( !sms ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`body.sms required`, 400)
                ).status(400);
            }
            sms = PhoneNumberUtils.normalizePhoneAddress(sms, this._defaultPhonePrefix);

            const code: string = this._smsVerificationService.createVerificationCode(sms);
            const smsToken: SmsTokenDTO = this._smsTokenService.createUnverifiedSmsToken(sms);

            try {
                await this._smsAuthMessageService.sendAuthenticationCode(lang, sms, code);
            } catch (err) {
                LOG.error(`authenticateSms: Could not send sms to '${sms}': `, err);
                return ResponseEntity.internalServerError<ErrorDTO>().body(
                    createErrorDTO('Internal error', 500)
                ).status(500);
            }

            return ResponseEntity.ok<SmsTokenDTO>(smsToken);

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<ErrorDTO>().body(
                createErrorDTO('Internal Server Error', 500)
            ).status(500);
        }

    }

    /**
     * Handles HTTP POST request which validates the user supplied code and
     * generates a valid JWT token, which can be used to keep the session active.
     *
     * @param body {VerifySmsCodeDTO}
     */
    public async verifySmsCode (
        body: ReadonlyJsonAny
    ): Promise<ResponseEntity<SmsTokenDTO | ErrorDTO>> {

        try {

            if ( !isVerifySmsCodeDTO(body) ) {
                LOG.debug(`Access denied:`, body);
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not VerifySmsCodeDTO`, 400)
                ).status(400);
            }
            LOG.debug('verifySmsCode: body = ', body);

            const tokenDto: SmsTokenDTO = body?.token;
            const token: string = tokenDto?.token;
            const sms: string = tokenDto?.sms;
            const code: string = body?.code;

            if ( !(sms && code && this._smsVerificationService.verifyCode(sms, code)) ) {
                LOG.info(`Access denied for "${sms}" since code is not correct`);
                return ResponseEntity.internalServerError<ErrorDTO>().body(
                    createErrorDTO('Access denied', 403)
                ).status(403);
            }

            if ( !(token && sms && this._smsTokenService.verifyToken(sms, token, false)) ) {
                LOG.info(`Access denied for "${sms}" since token is not valid`);
                return ResponseEntity.internalServerError<ErrorDTO>().body(
                    createErrorDTO('Access denied', 403)
                ).status(403);
            }

            const smsToken: SmsTokenDTO = this._smsTokenService.createVerifiedSmsToken(sms);
            LOG.debug('verifySmsCode: smsToken = ', smsToken);
            return ResponseEntity.ok<SmsTokenDTO>(smsToken);

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<ErrorDTO>().body(
                createErrorDTO('Internal Server Error', 500)
            ).status(500);
        }

    }

    /**
     * Handles HTTP POST request which validates previously validated session and
     * if valid, generates a new refreshed session token.
     *
     * @param body {VerifySmsTokenDTO}
     */
    public async verifySmsToken (
        body: ReadonlyJsonAny
    ): Promise<ResponseEntity<SmsTokenDTO | ErrorDTO>> {

        try {

            if ( !isVerifySmsTokenDTO(body) ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not VerifySmsTokenDTO`, 400)
                ).status(400);
            }

            LOG.debug('verifySmsToken: body = ', body);
            const token: string = body?.token?.token ?? '';
            const sms: string = body?.token?.sms ?? '';

            if ( !(token && sms && this._smsTokenService.verifyToken(sms, token, true)) ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO('Access denied', 403)
                ).status(403);
            }

            const smsToken: SmsTokenDTO = this._smsTokenService.createVerifiedSmsToken(sms);

            return ResponseEntity.ok<SmsTokenDTO>(smsToken);

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<ErrorDTO>().body(
                createErrorDTO('Internal Server Error', 500)
            ).status(500);
        }

    }

    /**
     * Can be used internally in APIs to validate and return the subject of this token.
     */
    public async verifyTokenAndReturnSubject (
        token: string
    ): Promise<string> {
        LOG.debug('verifyTokenAndReturnSubject: token = ', token);
        if ( !isString(token) ) {
            throw new TypeError('SmsAuthController.verifyTokenAndReturnSubject: Argument must be string');
        }
        if ( !this._smsTokenService.isTokenValid(token) ) {
            throw new TypeError('SmsAuthController.verifyTokenAndReturnSubject: Token was invalid: ' + token);
        }
        const subject : string = this._jwtDecodeService.decodePayloadSubject(token);
        if (!subject) {
            throw new TypeError(`SmsAuthController.verifyTokenAndReturnSubject: Token was not verified: ${token}`);
        }
        return subject;
    }

}
