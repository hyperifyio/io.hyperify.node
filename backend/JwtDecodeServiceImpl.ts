// Copyright (c) 2021-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { decode as jwsDecode } from "jws";
import { JwtDecodeService } from "../core/jwt/JwtDecodeService";
import { isReadonlyJsonObject, ReadonlyJsonObject } from "../core/Json";
import { isBoolean } from "../core/types/Boolean";
import { LogService } from "../core/LogService";
import { isString } from "../core/types/String";
import { LogLevel } from "../core/types/LogLevel";

const LOG = LogService.createLogger('JwtDecodeServiceImpl');

/**
 * Jwt service implemented using "jws" NPM module.
 */
export class JwtDecodeServiceImpl implements JwtDecodeService {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    public static decodePayload (token: string) : ReadonlyJsonObject {
        const decoded = jwsDecode(token);
        LOG.debug(`decodePayload: Parsing decoded = `, decoded);
        const payload = decoded?.payload;
        return isReadonlyJsonObject(payload) ? payload : JSON.parse(payload);
    }

    public static decodePayloadAudience (token: string) : string {
        const payload = JwtDecodeServiceImpl.decodePayload(token);
        const aud = payload?.aud;
        if (!isString(aud)) {
            LOG.debug(`payload: `, payload);
            throw new TypeError(`decodePayloadAudience: Payload "aud" not string: ` +  token);
        }
        return aud;
    }

    public static decodePayloadSubject (token: string) : string {
        const payload = JwtDecodeServiceImpl.decodePayload(token);
        const sub = payload?.sub;
        if (!isString(sub)) {
            LOG.debug(`payload: `, payload);
            throw new TypeError(`decodePayloadSubject: Payload "sub" not string: ` +  token);
        }
        return sub;
    }

    public static decodePayloadVerified (token: string) : boolean {
        const payload = JwtDecodeServiceImpl.decodePayload(token);
        const verified = payload?.verified;
        if (!isBoolean(verified)) {
            LOG.debug(`payload: `, payload);
            throw new TypeError(`decodePayloadVerified: Payload "verified" not boolean: ` +  token);
        }
        return verified;
    }

    protected constructor (
    ) {
    }

    public static create (
    ) : JwtDecodeService {
        return JwtDecodeServiceImpl;
    }

    public decodePayload (token: string): ReadonlyJsonObject {
        return JwtDecodeServiceImpl.decodePayload(token);
    }

    public decodePayloadAudience (token: string): string {
        return JwtDecodeServiceImpl.decodePayloadAudience(token);
    }

    public decodePayloadSubject (token: string): string {
        return JwtDecodeServiceImpl.decodePayloadSubject(token);
    }

    public decodePayloadVerified (token: string): boolean {
        return JwtDecodeServiceImpl.decodePayloadVerified(token);
    }

    public setLogLevel (level: LogLevel): void {
        return JwtDecodeServiceImpl.setLogLevel(level);
    }

}
