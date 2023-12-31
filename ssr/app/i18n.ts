// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { use } from "i18next";
import { initReactI18next } from "react-i18next";
import { LogService } from "../../../core/LogService";
import { TRANSLATIONS, FRONTEND_DEFAULT_LANGUAGE } from "../../../../App";
import { TranslationUtils } from "../../../core/TranslationUtils";

const LOG = LogService.createLogger('ssr/i18n');

use(initReactI18next).init(
    {
        resources: TranslationUtils.getConfig(TRANSLATIONS),
        lng: FRONTEND_DEFAULT_LANGUAGE,
        interpolation: {
            escapeValue: false
        }
    }
).catch(err => {
    LOG.error(`Translation init failed: `, err);
});
