// Copyright (c) 2021-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { randomInt } from 'crypto';
import { find } from "../core/functions/find";
import { forEach } from "../core/functions/forEach";
import { remove } from "../core/functions/remove";
import { LogService } from "../core/LogService";
import { clearTimeout } from "timers";
import { Disposable } from "../core/types/Disposable";
import { LogLevel } from "../core/types/LogLevel";
import { SmsVerificationService } from "../core/auth/SmsVerificationService";

const DEFAULT_VERIFICATION_TIMEOUT : number = 5*60*1000;

interface InternalSmsCode {
    readonly code  : string;
    readonly sms : string;
    timer : any | undefined;
}

const LOG = LogService.createLogger('SmsVerificationServiceImpl');

export class SmsVerificationServiceImpl
    implements Disposable, SmsVerificationService {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private _codes : InternalSmsCode[];
    private readonly _verificationTimeout : number;

    protected constructor (
        verificationTimeout : number = DEFAULT_VERIFICATION_TIMEOUT
    ) {
        this._codes = [];
        this._verificationTimeout = verificationTimeout;
    }

    public static create (
        verificationTimeout : number = DEFAULT_VERIFICATION_TIMEOUT
    ) : SmsVerificationServiceImpl {
        return new SmsVerificationServiceImpl(
            verificationTimeout
        );
    }

    public destroy () {
        forEach(
            this._codes,
            (item: InternalSmsCode) => {
                try {
                    const timer = item?.timer;
                    if (timer !== undefined) {
                        clearTimeout(timer);
                        item.timer = undefined;
                    }
                } catch (err) {
                    LOG.error(`Could not remove timer: `, err);
                }
            }
        );
        this._codes = [];
    }

    public verifyCode (
        sms : string,
        code  : string
    ) : boolean {
        LOG.debug(`verifyCode: "${code}" for sms "${sms}" `);
        if (!sms) return false;
        if (!code) return false;
        const itemMatcher = (item : InternalSmsCode) => {
            return item?.sms === sms && item?.code === code;
        };
        const item : InternalSmsCode | undefined = find(this._codes, itemMatcher);
        if (!item) return false;
        if (item?.timer) {
            clearTimeout(item.timer);
            item.timer = undefined;
        }
        remove(this._codes, itemMatcher);
        LOG.debug(`Verified & removed "${code}" for sms "${sms}"`);
        return true;
    }

    public removeVerificationCode (
        sms : string,
        code  : string
    ) {
        if (!sms) throw new TypeError('sms is required');
        if (!code) throw new TypeError('code is required');
        const itemMatcher = (item : InternalSmsCode) => {
            return item.sms === sms && item.code === code;
        };
        const item : InternalSmsCode | undefined = find(this._codes, itemMatcher);
        if (item) {
            if (item?.timer) {
                clearTimeout(item.timer);
                item.timer = undefined;
            }
            remove(this._codes, itemMatcher);
            LOG.debug(`Removed "${code}" for sms "${sms}"`);
        }
    }

    public createVerificationCode (
        sms: string
    ) : string {
        const code = `${randomInt(0, 9999)}`.padStart(4, "0");
        const timer = setTimeout(() => {
            this.removeVerificationCode(sms, code);
        }, this._verificationTimeout);
        remove(this._codes, (item: InternalSmsCode) => item.sms === sms);
        this._codes.push({
            sms,
            code,
            timer
        });
        LOG.debug(`Added "${code}" for sms "${sms}"`)
        return code;
    }

}
