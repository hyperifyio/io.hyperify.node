// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { T_M_AUTH_CODE_BODY_HTML, T_M_AUTH_CODE_BODY_TEXT, T_M_AUTH_CODE_FOOTER_HTML, T_M_AUTH_CODE_FOOTER_TEXT, T_M_AUTH_CODE_HEADER_HTML, T_M_AUTH_CODE_HEADER_TEXT, T_M_AUTH_CODE_SUBJECT } from "../core/auth/sms/sms-auth-translations";
import { TranslationService } from "../core/i18n/TranslationService";
import { TwilioMessageClient } from "../core/twilio/TwilioMessageClient";
import { Language } from "../core/types/Language";
import { LogLevel } from "../core/types/LogLevel";
import { SmsAuthMessageServiceImpl } from './SmsAuthMessageServiceImpl';

describe('SmsAuthMessageServiceImpl', () => {
    let mockSmsService : TwilioMessageClient;
    let mockTranslationService : TranslationService;

    beforeAll(() => {
        SmsAuthMessageServiceImpl.setLogLevel(LogLevel.NONE);
    });

    beforeEach(() => {
        // Create mocks
        mockSmsService = {
            sendSms: jest.fn().mockResolvedValue({})
        } as unknown as TwilioMessageClient;
        mockTranslationService = {
            translateKeys: jest.fn().mockResolvedValue({})
        } as unknown as TranslationService;
    });

    describe('sendAuthenticationCode', () => {

        it('calls the translation service with the correct parameters', async () => {
            const service = SmsAuthMessageServiceImpl.create(mockSmsService, mockTranslationService);
            const lang : Language = Language.ENGLISH;
            const sms = 'test@example.com';
            const code = '1234';
            const translationKeys = [
                "sms.m.authCode.subject",
                "sms.m.authCode.headerText",
                "sms.m.authCode.bodyText",
                "sms.m.authCode.footerText",
                "sms.m.authCode.headerHtml",
                "sms.m.authCode.bodyHtml",
                "sms.m.authCode.footerHtml",
            ];
            const translationParams = { CODE: code };

            await service.sendAuthenticationCode(lang, sms, code);
            expect(mockTranslationService.translateKeys).toHaveBeenCalledWith(
                lang, translationKeys, translationParams
            );

        });

        it('sends an sms with the correct parameters', async () => {
            const service = SmsAuthMessageServiceImpl.create(mockSmsService, mockTranslationService);
            const lang : Language = Language.ENGLISH;
            const sms = 'test@example.com';
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

            await service.sendAuthenticationCode(lang, sms, code);

            const expectedSms = {
                to: sms,
                subject: translations[T_M_AUTH_CODE_SUBJECT],
                content: translations[T_M_AUTH_CODE_HEADER_TEXT] + translations[T_M_AUTH_CODE_BODY_TEXT] + translations[T_M_AUTH_CODE_FOOTER_TEXT],
                htmlContent: translations[T_M_AUTH_CODE_HEADER_HTML] + translations[T_M_AUTH_CODE_BODY_HTML] + translations[T_M_AUTH_CODE_FOOTER_HTML]
            };

            expect(mockSmsService.sendSms).toHaveBeenCalledWith(
                expectedSms.content,
                expectedSms.to
            );
        });
    });

});
