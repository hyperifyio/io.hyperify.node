// Copyright (c) 2021-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { EmailTokenDTO } from "../core/auth/email/types/EmailTokenDTO";
import { JwtDecodeService } from "../core/jwt/JwtDecodeService";
import { LogService } from "../core/LogService";
import { EmailTokenService, EmailTokenServiceAlgorithm } from "../core/auth/EmailTokenService";
import { JwtEngine } from "../core/jwt/JwtEngine";
import { JwtDecodeServiceImpl } from "./JwtDecodeServiceImpl";
import { LogLevel } from "../core/types/LogLevel";
import { JwtUtils } from "../core/jwt/JwtUtils";
import { isString } from "../core/types/String";

const UNVERIFIED_JWT_TOKEN_EXPIRATION_MINUTES = 5;
const VERIFIED_JWT_TOKEN_EXPIRATION_DAYS = 365;

const LOG = LogService.createLogger('EmailTokenServiceImpl');

export class EmailTokenServiceImpl implements EmailTokenService {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private readonly _jwtEngine: JwtEngine;
    private readonly _jwtDecodeService: JwtDecodeService;
    private readonly _unverifiedJwtTokenExpirationMinutes: number;
    private readonly _verifiedJwtTokenExpirationDays: number;

    /**
     *
     * @param jwtEngine
     * @param jwtDecodeService
     * @param unverifiedJwtTokenExpirationMinutes
     * @param verifiedJwtTokenExpirationDays
     */
    protected constructor (
        jwtEngine : JwtEngine,
        jwtDecodeService : JwtDecodeService,
        unverifiedJwtTokenExpirationMinutes : number = UNVERIFIED_JWT_TOKEN_EXPIRATION_MINUTES,
        verifiedJwtTokenExpirationDays      : number = VERIFIED_JWT_TOKEN_EXPIRATION_DAYS,
    ) {
        this._jwtEngine = jwtEngine;
        this._jwtDecodeService = jwtDecodeService;
        this._unverifiedJwtTokenExpirationMinutes = unverifiedJwtTokenExpirationMinutes;
        this._verifiedJwtTokenExpirationDays = verifiedJwtTokenExpirationDays;
    }

    public static create (
        jwtEngine: JwtEngine,
        unverifiedJwtTokenExpirationMinutes : number = UNVERIFIED_JWT_TOKEN_EXPIRATION_MINUTES,
        verifiedJwtTokenExpirationDays      : number = VERIFIED_JWT_TOKEN_EXPIRATION_DAYS,
        jwtDecodeService: JwtDecodeService = JwtDecodeServiceImpl,
    ) : EmailTokenServiceImpl {
        return new EmailTokenServiceImpl(
            jwtEngine,
            jwtDecodeService,
            unverifiedJwtTokenExpirationMinutes,
            verifiedJwtTokenExpirationDays,
        );
    }

    /**
     *
     * @param email
     * @param token
     * @param requireVerifiedToken
     * @param alg
     */
    public verifyToken (
        email: string,
        token: string,
        requireVerifiedToken: boolean,
        alg                  ?: EmailTokenServiceAlgorithm
    ): boolean {

        try {

            LOG.debug(`verifyToken: email "${email}", "${token}", ${requireVerifiedToken}`);

            if ( !email ) {
                LOG.debug(`verifyToken: No email provided: `, email);
                return false;
            }

            if ( !token ) {
                LOG.debug(`verifyToken: No token provided: `, token);
                return false;
            }

            if ( !this._jwtEngine.verify(token, alg) ) {
                LOG.debug(`verifyToken: Token was invalid: `, token);
                return false;
            }

            const payload = this._jwtDecodeService.decodePayload(token);
            LOG.debug(`payload : ${typeof payload} = `, payload);

            if ( requireVerifiedToken ) {

                if ( payload?.sub !== email ) {
                    LOG.debug(`verifyToken: "sub" did not match: `, payload?.sub, email);
                    return false;
                }

            } else {

                if ( payload?.aud !== email ) {
                    LOG.debug(`verifyToken: "aud" did not match: `, payload?.aud, email);
                    return false;
                }

            }

            LOG.debug(`verifyToken: Success: `, payload);

            return true;

        } catch (err) {
            LOG.error(`verifyToken: Could not verify token: `, err, token, email, requireVerifiedToken);
            return false;
        }

    }

    /**
     *
     * @param token
     * @param email
     * @param alg
     */
    public verifyValidTokenForSubject (
        token: string,
        email: string,
        alg   ?: EmailTokenServiceAlgorithm
    ): boolean {
        try {
            LOG.debug(`verifyValidTokenForSubject: email "${email}", "${token}"`);

            if ( !(email && isString(email)) ) {
                LOG.debug(`verifyValidTokenForSubject: No email provided: `, email);
                return false;
            }

            if ( !token ) {
                LOG.debug(`verifyValidTokenForSubject: No token provided: `, token);
                return false;
            }

            if ( !this._jwtEngine.verify(token, alg) ) {
                LOG.debug(`verifyValidTokenForSubject: Token was invalid: `, token);
                return false;
            }

            const payload = this._jwtDecodeService.decodePayload(token);
            if ( payload?.sub !== email ) {
                LOG.debug(`verifyValidTokenForSubject: "sub" did not match: `, payload?.sub, email);
                return false;
            }
            LOG.debug(`verifyValidTokenForSubject: Success: `, payload);
            return true;

        } catch (err) {
            LOG.error(`verifyValidTokenForSubject: Could not verify token: `, err, token, email);
            return false;
        }
    }

    /**
     *
     * @param token
     * @param alg
     */
    public isTokenValid (
        token: string,
        alg   ?: EmailTokenServiceAlgorithm
    ): boolean {
        try {

            if ( !token ) {
                LOG.debug(`verifyValidToken: No token provided: `, token);
                return false;
            }

            if ( !this._jwtEngine.verify(token, alg) ) {
                LOG.debug(`verifyValidToken: Token was invalid: `, token);
                return false;
            }

            LOG.debug(`verifyValidToken: Success: `, token);
            return true;

        } catch (err) {
            LOG.error(`verifyValidToken: Exception: Could not verify token: `, err, token);
            return false;
        }
    }

    /**
     *
     * @param token
     * @param requireVerifiedToken
     * @param alg
     */
    public verifyTokenOnly (
        token                : string,
        requireVerifiedToken : boolean,
        alg                  ?: EmailTokenServiceAlgorithm
    ): boolean {

        try {

            LOG.debug(`verifyTokenOnly: "${token}", ${requireVerifiedToken}`);

            if ( !token ) {
                LOG.debug(`verifyTokenOnly: No token provided: `, token);
                return false;
            }

            if ( !this._jwtEngine.verify(token, alg) ) {
                LOG.debug(`verifyTokenOnly: Token was invalid: `, token);
                return false;
            }

            const payload = this._jwtDecodeService.decodePayload(token);

            if ( requireVerifiedToken ) {

                if ( !payload?.sub ) {
                    LOG.debug(`verifyTokenOnly: Property "sub" did not exists`, payload?.sub);
                    return false;
                }

            } else {

                if ( !payload?.aud ) {
                    LOG.debug(`verifyTokenOnly: Property "aud" did not exist: `, payload?.aud);
                    return false;
                }

            }

            LOG.debug(`verifyTokenOnly: Success: `, payload);

            return true;

        } catch (err) {
            LOG.error(`verifyTokenOnly: Could not verify token: `, err, token, requireVerifiedToken);
            return false;
        }

    }

    public createUnverifiedEmailToken (
        email: string,
        alg                  ?: EmailTokenServiceAlgorithm
    ): EmailTokenDTO {

        try {

            const signature = this._jwtEngine.sign(
                JwtUtils.createAudPayloadExpiringInMinutes(email, this._unverifiedJwtTokenExpirationMinutes),
                alg
            );

            return {
                token: signature,
                email
            };

        } catch (err) {
            LOG.error(`createUnverifiedEmailToken: "${email}": Could not sign JWT: `, err);
            throw new TypeError(`Could not sign JWT for "${email}"`);
        }

    }

    public createVerifiedEmailToken (
        email: string,
        alg ?: EmailTokenServiceAlgorithm
    ): EmailTokenDTO {
        try {
            const signature = this._jwtEngine.sign(
                JwtUtils.createSubPayloadExpiringInDays(email, this._verifiedJwtTokenExpirationDays),
                alg
            );
            return {
                token: signature,
                email,
                verified: true
            };
        } catch (err) {
            LOG.error(`createVerifiedEmailToken: "${email}": Could not sign JWT: `, err);
            throw new TypeError(`Could not sign JWT for "${email}"`);
        }
    }

}
