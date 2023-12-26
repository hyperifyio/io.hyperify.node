// Copyright (c) 2021-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { randomInt } from "crypto";
import { CryptoService } from "../core/crypto/CryptoService";

export class CryptoServiceImpl implements CryptoService {

    protected constructor () {
    }

    public static create () : CryptoService {
        return CryptoServiceImpl;
    }

    /**
     * Creates random string containing numbers between 0 and 9.
     *
     * Eg. `size=2` gives values between 0 and 99.
     * Eg. `size=4` gives values between 0 and 9999.
     *
     * @param size
     */
    public static createRandomInteger (
        size: number
    ) : number {
        if (size <= 0) {
            throw new TypeError(`CryptoService.createRandomNumberString: size must be over 0: ${size} provided`);
        }
        return randomInt(0, Math.pow(10, size)-1 );
    }

    /**
     * Creates random string containing numbers between 0 and 9.
     *
     * Eg. `size=2` gives values between "00" and "99".
     * Eg. `size=4` gives values between "0000" and "9999".
     *
     * @param size
     */
    public static createRandomIntegerString (
        size: number
    ) : string {
        return `${CryptoServiceImpl.createRandomInteger(size)}`.padStart(size, "0");
    }

    /**
     * @inheritDoc
     */
    public createRandomInteger (size: number): number {
        return CryptoServiceImpl.createRandomInteger(size);
    }

    /**
     * @inheritDoc
     */
    public createRandomIntegerString (size: number): string {
        return CryptoServiceImpl.createRandomIntegerString(size);
    }

}

