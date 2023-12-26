// Copyright (c) 2021-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { init as i18nInit, changeLanguage, Resource } from "i18next";
import { Language } from "../core/types/Language";
import { ReadonlyJsonObject } from "../core/Json";
import { LogService } from "../core/LogService";
import { TranslationResourceObject } from "../core/types/TranslationResourceObject";
import { TranslatedObject } from "../core/types/TranslatedObject";
import { TranslationUtils } from "../core/TranslationUtils";
import { LogLevel } from "../core/types/LogLevel";
import { TranslationFunction } from "../core/types/TranslationFunction";
import { TranslationService } from "../core/i18n/TranslationService";

const LOG = LogService.createLogger('BackendTranslationService');

export class BackendTranslationServiceImpl implements TranslationService {

    protected constructor () {
    }

    public static create () : TranslationService {
        return BackendTranslationServiceImpl;
    }

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    public static async initialize (
        defaultLanguage : Language,
        resources       : TranslationResourceObject
    ) : Promise<void> {
        const languageResources : Resource = TranslationUtils.getConfig(resources);
        return await new Promise((resolve, reject) => {
            i18nInit(
                {
                    resources: languageResources,
                    lng: defaultLanguage,
                    interpolation: {
                        escapeValue: true
                    }
                }
            ).then(() => {
                resolve();
            }).catch(err => {
                LOG.error(`Error in init: `, err);
                reject(err);
            });
        });
    }

    public static async translateKeys (
        lang              : Language,
        keys              : string[],
        translationParams : ReadonlyJsonObject
    ): Promise<TranslatedObject> {
        const t = await changeLanguage(lang);
        return TranslationUtils.translateKeys(t as TranslationFunction, keys, translationParams);
    }

    public static async translateJob<T> (
        lang     : Language,
        callback : ((t: TranslationFunction) => T)
    ) : Promise<T> {
        const t = await changeLanguage(lang);
        return callback(t as TranslationFunction);
    }

    public async initialize (defaultLanguage: Language, resources: TranslationResourceObject): Promise<void> {
        return await BackendTranslationServiceImpl.initialize(defaultLanguage, resources);
    }

    public setLogLevel (level: LogLevel): void {
        BackendTranslationServiceImpl.setLogLevel(level);
    }

    public async translateJob<T> (lang: Language, callback: (t: TranslationFunction) => T): Promise<T> {
        return await BackendTranslationServiceImpl.translateJob<T>(lang, callback);
    }

    public async translateKeys (lang: Language, keys: string[], translationParams: ReadonlyJsonObject): Promise<TranslatedObject> {
        return await BackendTranslationServiceImpl.translateKeys(lang, keys, translationParams);
    }

}
