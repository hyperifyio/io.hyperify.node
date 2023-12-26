// Copyright (c) 2021-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { Algorithm, sign as jwsSign, verify as jwsVerify } from "jws";
import { JwtEngine } from "../core/jwt/JwtEngine";
import { ReadonlyJsonObject } from "../core/Json";
import { LogService } from "../core/LogService";
import { LogLevel } from "../core/types/LogLevel";
import { JwtEncodeService } from "../core/jwt/JwtEncodeService";

const LOG = LogService.createLogger('JwtServiceImpl');

/**
 * Jwt service implemented using "jws" NPM module.
 */
export class JwtEncodeServiceImpl implements JwtEncodeService {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private _defaultAlgorithm: string;

    protected constructor (
        defaultAlgorithm: string = 'HS256'
    ) {
        this._defaultAlgorithm = defaultAlgorithm;
    }

    public static create (
        defaultAlgorithm: string = 'HS256'
    ) {
        return new JwtEncodeServiceImpl(defaultAlgorithm);
    }

    public getDefaultAlgorithm (): string {
        return this._defaultAlgorithm;
    }

    public setDefaultAlgorithm (value: string) {
        this._defaultAlgorithm = value;
    }

    /**
     * Creates a jwt engine which hides secret
     *
     * @param secret
     * @param defaultAlgorithm
     */
    public createJwtEngine (
        secret: string,
        defaultAlgorithm ?: string
    ): JwtEngine {
        let _defaultAlgorithm: string | undefined = defaultAlgorithm;
        return {
            getDefaultAlgorithm: (): string => _defaultAlgorithm ?? this.getDefaultAlgorithm(),
            setDefaultAlgorithm: (value: string): void => {
                _defaultAlgorithm = value;
            },
            sign: (
                payload: ReadonlyJsonObject,
                alg?: string
            ): string =>
                jwsSign(
                    {
                        header: {alg: (alg ?? this.getDefaultAlgorithm()) as unknown as Algorithm},
                        payload: payload,
                        secret: secret
                    }
                ),
            verify: (
                token: string,
                alg?: string
            ): boolean => jwsVerify(token, (alg ?? _defaultAlgorithm ?? this.getDefaultAlgorithm()) as unknown as Algorithm, secret)
        };
    }

}
