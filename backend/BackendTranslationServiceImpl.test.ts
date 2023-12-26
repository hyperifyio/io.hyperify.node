// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { init as i18nInit, changeLanguage } from "i18next";
import { Language } from "../core/types/Language";
import { TranslationFunction } from "../core/types/TranslationFunction";
import { TranslationResourceObject } from "../core/types/TranslationResourceObject";
import { BackendTranslationServiceImpl } from "./BackendTranslationServiceImpl";

jest.mock('i18next', () => ({
    changeLanguage: jest.fn(),
    init: jest.fn().mockResolvedValue(undefined),
}));

describe('BackendTranslationServiceImpl', () => {
    const service = BackendTranslationServiceImpl.create();

    describe('initialize', () => {
        it('should initialize the service', async () => {
            const defaultLanguage = Language.ENGLISH;
            const resources : TranslationResourceObject = {
                en: {
                    'en.foo.bar': 'En Foo Bar'
                },
                fi: {
                    'fi.foo.bar': 'Fi Foo Bar'
                }
            };
            await service.initialize(defaultLanguage, resources);
            expect(i18nInit).toHaveBeenCalled();
        });
    });

    describe('translateKeys', () => {
        it('should translate keys', async () => {
            const lang = Language.ENGLISH;
            const keys = ['key1', 'key2'];
            const translationParams = { key: 'value' };
            const translatedKeys = { key1: 'key1:value', key2: 'key2:value' };
            const t = jest.fn().mockImplementation((key, params) => `${key}:${params.key}`);

            (changeLanguage as jest.Mock).mockResolvedValueOnce(t);

            const result = await service.translateKeys(lang, keys, translationParams);

            expect(changeLanguage).toHaveBeenCalledWith(lang);
            expect(result).toEqual(translatedKeys);
        });
    });

    describe('translateJob', () => {
        it('should execute translation job', async () => {
            const lang = Language.ENGLISH;
            const callback = jest.fn((
                // @ts-ignore
                t: TranslationFunction) => 'translation_result');

            (changeLanguage as jest.Mock).mockResolvedValueOnce('translator');

            const result = await service.translateJob(lang, callback);

            expect(changeLanguage).toHaveBeenCalledWith(lang);
            expect(callback).toHaveBeenCalledWith('translator');
            expect(result).toEqual('translation_result');
        });
    });

});
