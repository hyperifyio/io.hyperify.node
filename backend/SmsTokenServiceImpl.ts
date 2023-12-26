// Copyright (c) 2021-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { SmsTokenDTO } from "../core/auth/sms/types/SmsTokenDTO";
import { JwtDecodeService } from "../core/jwt/JwtDecodeService";
import { LogService } from "../core/LogService";
import { SmsTokenService, SmsTokenServiceAlgorithm } from "../core/auth/SmsTokenService";
import { JwtEngine } from "../core/jwt/JwtEngine";
import { JwtDecodeServiceImpl } from "./JwtDecodeServiceImpl";
import { LogLevel } from "../core/types/LogLevel";
import { JwtUtils } from "../core/jwt/JwtUtils";
import { isString } from "../core/types/String";

const UNVERIFIED_JWT_TOKEN_EXPIRATION_MINUTES = 5;
const VERIFIED_JWT_TOKEN_EXPIRATION_DAYS = 365;

const LOG = LogService.createLogger('SmsTokenServiceImpl');

export class SmsTokenServiceImpl implements SmsTokenService {

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
    ) : SmsTokenServiceImpl {
        return new SmsTokenServiceImpl(
            jwtEngine,
            jwtDecodeService,
            unverifiedJwtTokenExpirationMinutes,
            verifiedJwtTokenExpirationDays,
        );
    }

    /**
     *
     * @param sms
     * @param token
     * @param requireVerifiedToken
     * @param alg
     */
    public verifyToken (
        sms: string,
        token: string,
        requireVerifiedToken: boolean,
        alg                  ?: SmsTokenServiceAlgorithm
    ): boolean {

        try {

            LOG.debug(`verifyToken: sms "${sms}", "${token}", ${requireVerifiedToken}`);

            if ( !sms ) {
                LOG.debug(`verifyToken: No sms provided: `, sms);
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

                if ( payload?.sub !== sms ) {
                    LOG.debug(`verifyToken: "sub" did not match: `, payload?.sub, sms);
                    return false;
                }

            } else {

                if ( payload?.aud !== sms ) {
                    LOG.debug(`verifyToken: "aud" did not match: `, payload?.aud, sms);
                    return false;
                }

            }

            LOG.debug(`verifyToken: Success: `, payload);

            return true;

        } catch (err) {
            LOG.error(`verifyToken: Could not verify token: `, err, token, sms, requireVerifiedToken);
            return false;
        }

    }

    /**
     *
     * @param token
     * @param sms
     * @param alg
     */
    public verifyValidTokenForSubject (
        token: string,
        sms: string,
        alg   ?: SmsTokenServiceAlgorithm
    ): boolean {
        try {
            LOG.debug(`verifyValidTokenForSubject: sms "${sms}", "${token}"`);

            if ( !(sms && isString(sms)) ) {
                LOG.debug(`verifyValidTokenForSubject: No sms provided: `, sms);
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
            if ( payload?.sub !== sms ) {
                LOG.debug(`verifyValidTokenForSubject: "sub" did not match: `, payload?.sub, sms);
                return false;
            }
            LOG.debug(`verifyValidTokenForSubject: Success: `, payload);
            return true;

        } catch (err) {
            LOG.error(`verifyValidTokenForSubject: Could not verify token: `, err, token, sms);
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
        alg   ?: SmsTokenServiceAlgorithm
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
        alg                  ?: SmsTokenServiceAlgorithm
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

    public createUnverifiedSmsToken (
        sms: string,
        alg                  ?: SmsTokenServiceAlgorithm
    ): SmsTokenDTO {

        try {

            const signature = this._jwtEngine.sign(
                JwtUtils.createAudPayloadExpiringInMinutes(sms, this._unverifiedJwtTokenExpirationMinutes),
                alg
            );

            return {
                token: signature,
                sms
            };

        } catch (err) {
            LOG.error(`createUnverifiedSmsToken: "${sms}": Could not sign JWT: `, err);
            throw new TypeError(`Could not sign JWT for "${sms}"`);
        }

    }

    public createVerifiedSmsToken (
        sms: string,
        alg ?: SmsTokenServiceAlgorithm
    ): SmsTokenDTO {
        try {
            const signature = this._jwtEngine.sign(
                JwtUtils.createSubPayloadExpiringInDays(sms, this._verifiedJwtTokenExpirationDays),
                alg
            );
            return {
                token: signature,
                sms,
                verified: true
            };
        } catch (err) {
            LOG.error(`createVerifiedSmsToken: "${sms}": Could not sign JWT: `, err);
            throw new TypeError(`Could not sign JWT for "${sms}"`);
        }
    }

}
