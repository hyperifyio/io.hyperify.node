// Copyright (c) 2022-2023. <info@heusalagroup.fi>. All rights reserved.

import { TwilioMessageClient } from "../core/twilio/TwilioMessageClient";
import { Language } from "../core/types/Language";
import { TranslationService } from "../core/i18n/TranslationService";
import {
    T_M_AUTH_CODE_BODY_HTML,
    T_M_AUTH_CODE_BODY_TEXT,
    T_M_AUTH_CODE_FOOTER_HTML,
    T_M_AUTH_CODE_FOOTER_TEXT,
    T_M_AUTH_CODE_HEADER_HTML,
    T_M_AUTH_CODE_HEADER_TEXT,
    T_M_AUTH_CODE_SUBJECT
} from "../core/auth/sms/sms-auth-translations";
import { BackendTranslationServiceImpl } from "./BackendTranslationServiceImpl";
import { SmsAuthMessageService } from "../core/auth/SmsAuthMessageService";
import { LogService } from "../core/LogService";
import { LogLevel } from "../core/types/LogLevel";

const LOG = LogService.createLogger('SmsAuthMessageServiceImpl');

export class SmsAuthMessageServiceImpl implements SmsAuthMessageService {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private readonly _smsService : TwilioMessageClient;
    private readonly _backendTranslationService : TranslationService;

    /**
     *
     * @param smsService
     * @param backendTranslationService
     */
    protected constructor (
        smsService: TwilioMessageClient,
        backendTranslationService: TranslationService,
    ) {
        this._smsService = smsService;
        this._backendTranslationService = backendTranslationService;
    }

    public static create (
        smsService: TwilioMessageClient,
        backendTranslationService : TranslationService = BackendTranslationServiceImpl,
    ) {
        return new SmsAuthMessageServiceImpl(
            smsService,
            backendTranslationService,
        );
    }

    public async sendAuthenticationCode (
        lang: Language,
        sms: string,
        code: string
    ): Promise<void> {

        const translationParams = {
            CODE: code
        };

        const translations = await this._backendTranslationService.translateKeys(
            lang,
            [
                T_M_AUTH_CODE_SUBJECT,
                T_M_AUTH_CODE_HEADER_TEXT,
                T_M_AUTH_CODE_BODY_TEXT,
                T_M_AUTH_CODE_FOOTER_TEXT,
                T_M_AUTH_CODE_HEADER_HTML,
                T_M_AUTH_CODE_BODY_HTML,
                T_M_AUTH_CODE_FOOTER_HTML
            ],
            translationParams
        );

        const contentText: string = translations[T_M_AUTH_CODE_HEADER_TEXT] + translations[T_M_AUTH_CODE_BODY_TEXT] + translations[T_M_AUTH_CODE_FOOTER_TEXT];

        await this._smsService.sendSms(
            contentText,
            sms,
        );

        LOG.info(`sendAuthenticationCode: Sent successfully to ${sms}`);

    }

}
