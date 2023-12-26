// Copyright (c) 2022-2023. <info@heusalagroup.fi>. All rights reserved.

import { EmailAuthController } from "../core/auth/EmailAuthController";
import { JsonAny, ReadonlyJsonAny } from "../core/Json";
import { JwtDecodeService } from "../core/jwt/JwtDecodeService";
import { ResponseEntity } from "../core/request/types/ResponseEntity";
import { createErrorDTO, ErrorDTO } from "../core/types/ErrorDTO";
import { Language, parseLanguage } from "../core/types/Language";
import { EmailAuthMessageService } from "../core/auth/EmailAuthMessageService";
import { EmailTokenService } from "../core/auth/EmailTokenService";
import { EmailVerificationService } from "../core/auth/EmailVerificationService";
import { LogService } from "../core/LogService";
import { isAuthenticateEmailDTO } from "../core/auth/email/types/AuthenticateEmailDTO";
import { isVerifyEmailTokenDTO } from "../core/auth/email/types/VerifyEmailTokenDTO";
import {
    createVerifyEmailCodeDTO,
    isVerifyEmailCodeDTO,
    VerifyEmailCodeDTO
} from "../core/auth/email/types/VerifyEmailCodeDTO";
import { createEmailTokenDTO, EmailTokenDTO } from "../core/auth/email/types/EmailTokenDTO";
import { JwtDecodeServiceImpl } from "./JwtDecodeServiceImpl";
import { isString } from "../core/types/String";
import { LogLevel } from "../core/types/LogLevel";
import { createSendEmailCodeDTO, sendEmailCodeDTO } from "../core/auth/email/types/SendEmailCodeDTO";

const LOG = LogService.createLogger('EmailAuthControllerImpl');

/**
 * This HTTP backend controller can be used to validate the ownership of user's
 * email address.
 *
 *  1. Call .authenticateEmail(body, lang) to send the authentication email
 *  2. Call .verifyEmailCode(body) to verify user supplied code from the email and create a session JWT
 *  3. Call .verifyEmailToken(body) to verify validity of the previously created session JWT and to refresh the session
 *
 * The .verifyTokenAndReturnSubject(token) can be used to validate internally API calls in your own APIs.
 */
export class EmailAuthControllerImpl implements EmailAuthController {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private _defaultLanguage   : Language;
    private _emailTokenService : EmailTokenService;
    private _emailVerificationService : EmailVerificationService;
    private _emailAuthMessageService : EmailAuthMessageService;
    private _jwtDecodeService: JwtDecodeService;

    protected constructor (
        defaultLanguage: Language = Language.ENGLISH,
        emailTokenService: EmailTokenService,
        emailVerificationService: EmailVerificationService,
        emailAuthMessageService: EmailAuthMessageService,
        jwtDecodeService: JwtDecodeService,
    ) {
        this._defaultLanguage = defaultLanguage;
        this._emailTokenService = emailTokenService;
        this._emailVerificationService = emailVerificationService;
        this._emailAuthMessageService = emailAuthMessageService;
        this._jwtDecodeService = jwtDecodeService;
    }

    public static create (
        defaultLanguage: Language = Language.ENGLISH,
        emailTokenService: EmailTokenService,
        emailVerificationService: EmailVerificationService,
        emailAuthMessageService: EmailAuthMessageService,
        jwtDecodeService: JwtDecodeService = JwtDecodeServiceImpl,
    ) {
        return new EmailAuthControllerImpl(
            defaultLanguage,
            emailTokenService,
            emailVerificationService,
            emailAuthMessageService,
            jwtDecodeService,
        );
    }

    /**
     * Set default language for messages sent to the user by email.
     * @param value
     */
    public setDefaultLanguage (value: Language) {
        this._defaultLanguage = value;
    }

    /**
     * Handles POST HTTP request to initiate an email address authentication by
     * sending one time code to the user as a email message.
     *
     * The message should be in format `AuthenticateEmailDTO`.
     *
     * @param body {AuthenticateEmailDTO}
     * @param langString {Language} The optional language of the message
     */
    public async authenticateEmail (
        body: ReadonlyJsonAny,
        langString: string = ""
    ): Promise<ResponseEntity<EmailTokenDTO | ErrorDTO>> {

        try {

            const lang: Language = parseLanguage(langString) ?? this._defaultLanguage;

            if ( !isAuthenticateEmailDTO(body) ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not AuthenticateEmailDTO`, 400)
                ).status(400);
            }

            LOG.debug('authenticateEmail: body = ', body);
            const email = body.email;
            if ( !email ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`body.email required`, 400)
                ).status(400);
            }

            const code: string = this._emailVerificationService.createVerificationCode(email);
            const emailToken: EmailTokenDTO = this._emailTokenService.createUnverifiedEmailToken(email);

            try {
                await this._emailAuthMessageService.sendAuthenticationCode(lang, email, code);
            } catch (err) {
                LOG.error(`authenticateEmail: Could not send email to '${email}': `, err);
                return ResponseEntity.internalServerError<ErrorDTO>().body(
                    createErrorDTO('Internal error', 500)
                ).status(500);
            }

            return ResponseEntity.ok<EmailTokenDTO>(emailToken);

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
     * @param body {VerifyEmailCodeDTO}
     */
    public async verifyEmailCode (
        body: ReadonlyJsonAny
    ): Promise<ResponseEntity<EmailTokenDTO | ErrorDTO>> {

        try {
            if ( !isVerifyEmailCodeDTO(body) ) {
                LOG.debug(`Access denied:`, body);
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not VerifyEmailCodeDTO`, 400)
                ).status(400);
            }
            LOG.debug('verifyEmailCode: body = ', body);

            const tokenDto: EmailTokenDTO = body?.token;
            const token: string = tokenDto?.token;
            const email: string = tokenDto?.email;
            const code: string = body?.code;

            if ( !(email && code && this._emailVerificationService.verifyCode(email, code)) ) {
                LOG.info(`Access denied for "${email}" since code is not correct`);
                return ResponseEntity.internalServerError<ErrorDTO>().body(
                    createErrorDTO('Access denied', 403)
                ).status(403);
            }

            if ( !(token && email && this._emailTokenService.verifyToken(email, token, false)) ) {
                LOG.info(`Access denied for "${email}" since token is not valid`);
                return ResponseEntity.internalServerError<ErrorDTO>().body(
                    createErrorDTO('Access denied', 403)
                ).status(403);
            }

            const emailToken: EmailTokenDTO = this._emailTokenService.createVerifiedEmailToken(email);
            LOG.debug('verifyEmailCode: emailToken = ', emailToken);
            return ResponseEntity.ok<EmailTokenDTO>(emailToken);

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
     * @param body {VerifyEmailTokenDTO}
     */
    public async verifyEmailToken (
        body: ReadonlyJsonAny
    ): Promise<ResponseEntity<EmailTokenDTO | ErrorDTO>> {

        try {

            if ( !isVerifyEmailTokenDTO(body) ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not VerifyEmailTokenDTO`, 400)
                ).status(400);
            }

            LOG.debug('verifyEmailToken: body = ', body);
            const token: string = body?.token?.token ?? '';
            const email: string = body?.token?.email ?? '';

            if ( !(token && email && this._emailTokenService.verifyToken(email, token, true)) ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO('Access denied', 403)
                ).status(403);
            }

            const emailToken: EmailTokenDTO = this._emailTokenService.createVerifiedEmailToken(email);

            return ResponseEntity.ok<EmailTokenDTO>(emailToken);

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
            throw new TypeError('EmailAuthController.verifyTokenAndReturnSubject: Argument must be string');
        }
        if ( !this._emailTokenService.isTokenValid(token) ) {
            throw new TypeError('EmailAuthController.verifyTokenAndReturnSubject: Token was invalid: ' + token);
        }
        const subject : string = this._jwtDecodeService.decodePayloadSubject(token);
        if (!subject) {
            throw new TypeError(`EmailAuthController.verifyTokenAndReturnSubject: Token was not verified: ${token}`);
        }
        return subject;
    }

    /**
     * Handles POST HTTP request to initiate an email address authentication by
     * sending one time code to the user as a email message.
     *
     * The message should be in format `AuthenticateEmailDTO`.
     *
     * Returns {sendEmailCodeDTO}
     *
     * @param body {AuthenticateEmailDTO}
     * @param langString {Language} The optional language of the message
     */
    public async authenticateEmailWithoutLogin (
        body: ReadonlyJsonAny,
        langString: string = ""
    ): Promise<sendEmailCodeDTO|ResponseEntity<ErrorDTO>> {

        try {

            if ( !isAuthenticateEmailDTO(body) ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not AuthenticateEmailDTO`, 400)
                ).status(400);
            }

            LOG.debug('authenticateEmail: body = ', body);
            const email = body.email;
            if ( !email ) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`body.email required`, 400)
                ).status(400);
            }
            const lang: Language = parseLanguage(langString) ?? this._defaultLanguage;
            const code: string = this._emailVerificationService.createVerificationCode(email);
            const emailToken: EmailTokenDTO = this._emailTokenService.createUnverifiedEmailToken(email);

            const emailResponse = createSendEmailCodeDTO(
                emailToken,
                code,
                lang
            );

            return emailResponse

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<ErrorDTO>().body(
                createErrorDTO('Internal Server Error', 500)
            ).status(500);
        }

    }

}
