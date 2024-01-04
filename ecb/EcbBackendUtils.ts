// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { createCurrencyRates, CurrencyRates } from "../../core/types/CurrencyRates";
import { fetch } from "ecb-euro-exchange-rates";

export class EcbBackendUtils {

    /**
     * Fetch ECB rates
     */
    static async fetchEuroRates () : Promise<CurrencyRates> {
        const result = await fetch();
        return createCurrencyRates(
            result.rates.USD,
            result.rates.GBP
        );
    }

}
