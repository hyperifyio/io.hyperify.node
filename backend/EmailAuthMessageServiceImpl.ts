// Copyright (c) 2022-2023. <info@heusalagroup.fi>. All rights reserved.

import { EmailMessage } from "../core/email/types/EmailMessage";
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
} from "../core/auth/email/email-auth-translations";
import { BackendTranslationServiceImpl } from "./BackendTranslationServiceImpl";
import { EmailAuthMessageService } from "../core/auth/EmailAuthMessageService";
import { LogService } from "../core/LogService";
import { LogLevel } from "../core/types/LogLevel";
import { EmailService } from "../core/email/EmailService";

const LOG = LogService.createLogger('EmailAuthMessageServiceImpl');

export class EmailAuthMessageServiceImpl implements EmailAuthMessageService {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private readonly _emailService : EmailService;
    private readonly _backendTranslationService : TranslationService;

    /**
     *
     * @param emailService
     */
    protected constructor (
        emailService: EmailService,
        backendTranslationService: TranslationService,
    ) {
        this._emailService = emailService;
        this._backendTranslationService = backendTranslationService;
    }

    public static create (
        emailService: EmailService,
        backendTranslationService : TranslationService = BackendTranslationServiceImpl,
    ) {
        return new EmailAuthMessageServiceImpl(
            emailService,
            backendTranslationService,
        );
    }

    public async sendAuthenticationCode (
        lang: Language,
        email: string,
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

        const subject: string = translations[T_M_AUTH_CODE_SUBJECT];
        const contentText: string = translations[T_M_AUTH_CODE_HEADER_TEXT] + translations[T_M_AUTH_CODE_BODY_TEXT] + translations[T_M_AUTH_CODE_FOOTER_TEXT];
        const contentHtml: string = translations[T_M_AUTH_CODE_HEADER_HTML] + translations[T_M_AUTH_CODE_BODY_HTML] + translations[T_M_AUTH_CODE_FOOTER_HTML];

        await this._emailService.sendEmailMessage(
            {
                to: email,
                subject,
                content: contentText,
                htmlContent: contentHtml
            } as EmailMessage
        );

        LOG.info(`sendAuthenticationCode: Sent successfully to ${email}`);

    }

}
