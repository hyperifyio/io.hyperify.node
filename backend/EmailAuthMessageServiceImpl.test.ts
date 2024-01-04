// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { jest } from '@jest/globals';
import { EmailService } from "../../core/email/EmailService";
import { TranslationService } from "../../core/i18n/TranslationService";
import { Language } from "../../core/types/Language";
import {
    T_M_AUTH_CODE_BODY_HTML,
    T_M_AUTH_CODE_BODY_TEXT,
    T_M_AUTH_CODE_FOOTER_HTML,
    T_M_AUTH_CODE_FOOTER_TEXT,
    T_M_AUTH_CODE_HEADER_HTML,
    T_M_AUTH_CODE_HEADER_TEXT,
    T_M_AUTH_CODE_SUBJECT,
} from "../../core/auth/email/email-auth-translations";
import { LogLevel } from "../../core/types/LogLevel";
import { EmailAuthMessageServiceImpl } from './EmailAuthMessageServiceImpl';

describe('EmailAuthMessageServiceImpl', () => {
    let mockEmailService : EmailService;
    let mockTranslationService : TranslationService;

    beforeAll(() => {
        EmailAuthMessageServiceImpl.setLogLevel(LogLevel.NONE);
    });

    beforeEach(() => {
        // Create mocks
        mockEmailService = {
            sendEmailMessage: jest.fn<any>().mockResolvedValue({})
        } as unknown as EmailService;
        mockTranslationService = {
            translateKeys: jest.fn<any>().mockResolvedValue({})
        } as unknown as TranslationService;
    });

    describe('sendAuthenticationCode', () => {

        it('calls the translation service with the correct parameters', async () => {
            const service = EmailAuthMessageServiceImpl.create(mockEmailService, mockTranslationService);
            const lang : Language = Language.ENGLISH;
            const email = 'test@example.com';
            const code = '1234';
            const translationKeys = [
                "m.authCode.subject",
                "m.authCode.headerText",
                "m.authCode.bodyText",
                "m.authCode.footerText",
                "m.authCode.headerHtml",
                "m.authCode.bodyHtml",
                "m.authCode.footerHtml",
            ];
            const translationParams = { CODE: code };

            await service.sendAuthenticationCode(lang, email, code);
            expect(mockTranslationService.translateKeys).toHaveBeenCalledWith(
                lang, translationKeys, translationParams
            );
        });

        it('sends an email with the correct parameters', async () => {
            const service = EmailAuthMessageServiceImpl.create(mockEmailService, mockTranslationService);
            const lang : Language = Language.ENGLISH;
            const email = 'test@example.com';
            const code = '1234';
            const translations = {
                [T_M_AUTH_CODE_SUBJECT]: 'subject',
                [T_M_AUTH_CODE_HEADER_TEXT]: 'headerText',
                [T_M_AUTH_CODE_BODY_TEXT]: 'bodyText',
                [T_M_AUTH_CODE_FOOTER_TEXT]: 'footerText',
                [T_M_AUTH_CODE_HEADER_HTML]: 'headerHtml',
                [T_M_AUTH_CODE_BODY_HTML]: 'bodyHtml',
                [T_M_AUTH_CODE_FOOTER_HTML]: 'footerHtml'
            };
            (mockTranslationService.translateKeys as any).mockResolvedValue(translations);

            await service.sendAuthenticationCode(lang, email, code);

            const expectedEmail = {
                to: email,
                subject: translations[T_M_AUTH_CODE_SUBJECT],
                content: translations[T_M_AUTH_CODE_HEADER_TEXT] + translations[T_M_AUTH_CODE_BODY_TEXT] + translations[T_M_AUTH_CODE_FOOTER_TEXT],
                htmlContent: translations[T_M_AUTH_CODE_HEADER_HTML] + translations[T_M_AUTH_CODE_BODY_HTML] + translations[T_M_AUTH_CODE_FOOTER_HTML]
            };
            expect(mockEmailService.sendEmailMessage).toHaveBeenCalledWith(expectedEmail);
        });
    });

});
