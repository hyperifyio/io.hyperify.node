// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
// Copyright (C) 2011-2017 by Jaakko-Heikki Heusala <jheusala@iki.fi>

import { stringify as queryStringify } from "querystring";
import { HttpService } from "../../../../core/HttpService";
import { ContentType } from "../../../../core/request/types/ContentType";
import { LogService } from "../../../../core/LogService";
import { isBoolean } from "../../../../core/types/Boolean";
import { map } from "../../../../core/functions/map";
import { reduce } from "../../../../core/functions/reduce";
import { split } from "../../../../core/functions/split";
import { startsWith } from "../../../../core/functions/startsWith";
import { trim } from "../../../../core/functions/trim";
import { JokerPrivacyType } from "../../../../core/com/joker/dmapi/types/JokerPrivacyType";
import { JokerRequestArgumentObject } from "../../../../core/com/joker/dmapi/types/JokerRequestArgumentObject";
import { JokerStringObject } from "../../../../core/com/joker/dmapi/types/JokerStringObject";
import { JokerDomainResult } from "../../../../core/com/joker/dmapi/types/JokerDomainResult";
import { JokerDMAPIResponseObject } from "../../../../core/com/joker/dmapi/types/JokerDMAPIResponseObject";
import { createJokerComApiLoginDTO, JokerComApiLoginDTO } from "../../../../core/com/joker/dmapi/types/JokerComApiLoginDTO";
import { createJokerComApiDomainListDTO, JokerComApiDomainListDTO } from "../../../../core/com/joker/dmapi/types/JokerComApiDomainListDTO";
import { createJokerComApiWhoisDTO, JokerComApiWhoisDTO } from "../../../../core/com/joker/dmapi/types/JokerComApiWhoisDTO";
import { createJokerComApiRegisterDTO, JokerComApiRegisterDTO } from "../../../../core/com/joker/dmapi/types/JokerComApiRegisterDTO";
import { createJokerComApiWhoisContactDTO, JokerComApiWhoisContactDTO } from "../../../../core/com/joker/dmapi/types/JokerComApiWhoisContactDTO";
import { explainJokerComApiDomainPriceType, JokerComApiDomainPriceType, parseJokerComApiDomainPriceType } from "../../../../core/com/joker/dmapi/types/JokerComApiDomainPriceType";
import { JokerComApiPeriodType } from "../../../../core/com/joker/dmapi/types/JokerComApiPeriodType";
import { createJokerComApiDomainCheckDTO, JokerComApiDomainCheckDTO } from "../../../../core/com/joker/dmapi/types/JokerComApiDomainCheckDTO";
import { parseJokerComApiDomainStatus } from "../../../../core/com/joker/dmapi/types/JokerComApiDomainStatus";
import { createJokerComApiPriceListDTO, JokerComApiPriceListDTO } from "../../../../core/com/joker/dmapi/types/JokerComApiPriceListDTO";
import { parseJokerComApiPriceListItemListFromString} from "../../../../core/com/joker/dmapi/types/JokerComApiPriceListItem";
import { createJokerComApiDomainPrice, JokerComApiDomainPrice } from "../../../../core/com/joker/dmapi/types/JokerComApiDomainPrice";
import { explainJokerComApiPriceAmount, parseJokerComApiPriceAmount } from "../../../../core/com/joker/dmapi/types/JokerComApiPriceAmount";
import { explainJokerComApiCurrency, parseJokerComApiCurrency } from "../../../../core/com/joker/dmapi/types/JokerComApiCurrency";
import { explainJokerComApiDomainPeriod, parseJokerComApiDomainPeriod } from "../../../../core/com/joker/dmapi/types/JokerComApiDomainPeriod";
import { FiHgComJokerDomainManagementAPI } from "../../../../core/com/joker/dmapi/FiHgComJokerDomainManagementAPI";
import { createJokerComApiProfileDTO, JokerComApiProfileDTO } from "../../../../core/com/joker/dmapi/types/JokerComApiProfileDTO";
import { explainJokerComApiUserAccess, parseJokerComApiUserAccess } from "../../../../core/com/joker/dmapi/types/JokerComApiUserAccess";
import { isString } from "../../../../core/types/String";
import { parseInteger } from "../../../../core/types/Number";
import { keys } from "../../../../core/functions/keys";

const LOG = LogService.createLogger('FiHgComJokerDomainManagementService');

const MINIMUM_TIMEOUT_THRESHOLD = 300;

/**
 * Joker.com DMAPI client library for NodeJS
 */
export class FiHgComJokerDomainManagementService implements FiHgComJokerDomainManagementAPI {

    private readonly _url : string;

    private _authSID : string | undefined;
    private _time    : number | undefined;
    private _ttl     : number | undefined;

    /**
     * Creates a client service for Joker.com DMAPI
     *
     * @param url For testing purposes, you may use `https://dmapi.ote.joker.com`
     * @param authId Previously saved auth-sid
     * @param loginTime Previously saved auth-sid creation time
     * @param ttl Previously saved auth-sid time to life
     */
    public constructor (
        url            : string = 'https://dmapi.joker.com',
        authId         : string | undefined = undefined,
        loginTime      : number | undefined = undefined,
        ttl            : number | undefined = undefined
    ) {
        this._url = url;
        this._authSID = authId;
        this._time = loginTime;
        this._ttl = ttl;
    }

    /**
     * Returns `true` if has session key saved
     */
    public hasSession() : boolean {
        if (this.isTimeoutReached()) {
            this._authSID = undefined;
            return false;
        }
        return this._authSID !== undefined;
    }

    public getTimeoutThreshold () : number {
        if (this._ttl === undefined) {
            return 0;
        }
        const ttl = this._ttl;
        if ( ttl <= MINIMUM_TIMEOUT_THRESHOLD ) {
            return Math.ceil( this._ttl / 4 * 3 )
        }
        return MINIMUM_TIMEOUT_THRESHOLD;
    }

    public isTimeoutThresholdReached () : boolean {
        if (this._authSID === undefined) return true;
        if (this._ttl === undefined) return true;
        if (this._time === undefined) return true;
        const threshold = this.getTimeoutThreshold();
        const now = Date.now();
        return now >= (this._time + this._ttl - threshold);
    }

    public isTimeoutReached () : boolean {
        if (this._authSID === undefined) return true;
        if (this._ttl === undefined) return true;
        if (this._time === undefined) return true;
        const now = Date.now();
        return now >= (this._time + this._ttl);
    }

    /**
     * Returns `true` if session is OK.
     *
     * This method will test the connection by fetching the profile.
     */
    public async isReady() : Promise<boolean> {
        if (this._authSID === undefined) return false;
        try {

            // Check if timeout has passed
            if (this.isTimeoutReached()) {
                this._authSID = undefined;
                return false;
            }

            // Check if we need to re-login
            if (this.isTimeoutThresholdReached()) {
                await this.logout();
                return false;
            }

            await this.queryProfile();

            return true;
        } catch (err) {
            LOG.warn(`isReady: Received error: `, err);
            return false;
        }
    }

    /** Login using api key
     * @see https://joker.com/faq/content/26/14/en/login.html
     */
    public async loginWithApiKey (apiKey : string) : Promise<JokerComApiLoginDTO> {
        return await this._login(undefined, undefined, apiKey);
    }

    /** Login using username and password
     * @see https://joker.com/faq/content/26/14/en/login.html
     */
    public async loginWithUsername (
        username : string,
        password : string
    ) : Promise<JokerComApiLoginDTO> {
        return await this._login(username, password);
    }

    /** Login implementation
     * @see https://joker.com/faq/content/26/14/en/login.html
     */
    private async _login (
        username : string | undefined,
        password : string | undefined,
        apiKey   : string | undefined = undefined
    ) : Promise<JokerComApiLoginDTO> {
        if ( apiKey && (username || password) ) {
            throw new Error(`FiHgComJokerDomainManagementService._login: Use "api-key" or "username" and "password"; not both`);
        }
        if ( !apiKey && !(username && password) ) {
            throw new Error(`FiHgComJokerDomainManagementService._login: "username" or "password" missing`);
        }
        const args = {
            ...(username !== undefined ? {username: username} : {}),
            ...(password !== undefined ? {password: password} : {}),
            ...(apiKey !== undefined ? {'api-key': apiKey} : {})
        };
        const response = await jokerPostRequest(this._url,'login', args);
        const headers = response?.headers ?? {};

        const uid                    = headers['uid'];
        const userLogin              = headers['user-login'];

        const authSID                = headers['auth-sid'];
        const sessionTimeout         = parseInteger(headers['session-timeout']) ?? 0;

        const userAccessString = headers['user-access'];
        const userAccess             = parseJokerComApiUserAccess( userAccessString );
        if (!userAccess) {
            throw new TypeError(`FiHgComJokerDomainManagementService._login: Could not parse user-access "${userAccessString}": ${explainJokerComApiUserAccess(userAccessString)}`);
        }

        const accountCurrencyString = headers['account-currency'];
        const accountCurrency        = parseJokerComApiCurrency( accountCurrencyString );
        if (!accountCurrency) {
            throw new TypeError(`FiHgComJokerDomainManagementService._login: Could not parse account-currency "${accountCurrencyString}": ${explainJokerComApiCurrency(accountCurrencyString)}`);
        }

        const accountBalance         = parseJokerComApiPriceAmount (headers['account-balance'] ) ?? 0;
        const accountPendingAmount   = parseJokerComApiPriceAmount( headers['account-pending_amount'] ) ?? 0;
        const accountRebate          = parseFloat(headers['account-rebate']);
        const accountContractDate    = headers['account-contract_date'];
        const statsNumberOfDomains   = parseInteger(headers['stats-number-of-domains']) ?? 0;
        const statsLastLogin         = headers['stats-last-login'];
        const statsLastIp            = headers['stats-last-ip'];
        const statsLastError         = headers['stats-last-error'];
        const statsLastErrorIp       = headers['stats-last-error-ip'];
        const statsNumberOfAutoRenew = parseInteger(headers['stats-number-of-autorenew']) ?? 0;

        const tldList = split(response?.body, "\n");

        this._authSID = authSID;
        this._time = Date.now();
        this._ttl = sessionTimeout;

        return createJokerComApiLoginDTO(
            headers,
            authSID,
            uid,
            userLogin,
            sessionTimeout,
            userAccess,
            accountCurrency,
            accountBalance,
            accountPendingAmount,
            accountRebate,
            accountContractDate,
            statsNumberOfDomains,
            statsLastLogin,
            statsLastIp,
            statsLastError,
            statsLastErrorIp,
            statsNumberOfAutoRenew,
            tldList
        );
    }

    /** Logout
     * @see https://joker.com/faq/content/26/15/en/logout.html
     */
    public async logout () {
        if (!this._authSID) throw new Error("FiHgComJokerDomainManagementService.logout: No authSID. Try login first.");
        await jokerPostRequest(
            this._url,
            'logout',
            {
                'auth-sid': this._authSID
            }
        );
        this._authSID = undefined;
    }

    /** query-domain-list
     * @params pattern Pattern to match (glob-like)
     * @params from Pattern to match (glob-like)
     * @params to End by this
     * @params showStatus
     * @params showGrants
     * @params showJokerNS
     * @see https://joker.com/faq/content/27/20/en/query_domain_list.html
     */
    public async queryDomainList (
        pattern     ?: string | undefined,
        from        ?: string | undefined,
        to          ?: string | undefined,
        showStatus  ?: boolean | undefined,
        showGrants  ?: boolean | undefined,
        showJokerNS ?: boolean | undefined
    ) : Promise<JokerComApiDomainListDTO> {
        if (!this._authSID) {
            throw new Error("FiHgComJokerDomainManagementService.queryDomainList: No authSID. Try login first.");
        }
        const opts = {
            'auth-sid': this._authSID,
            ...(pattern? {pattern} : {}),
            ...(from ? {from} : {}),
            ...(to ? {to} : {}),
            ...(showStatus  !== undefined ? {'showstatus' : showStatus  ? '1' : '0'} : {}),
            ...(showGrants  !== undefined ? {'showgrants' : showGrants  ? '1' : '0'} : {}),
            ...(showJokerNS !== undefined ? {'showjokerns': showJokerNS ? '1' : '0'} : {})
        };
        const response = await jokerPostRequest(this._url,'query-domain-list', opts);
        const domains = trim(response.body);
        if (domains === '') {
            return createJokerComApiDomainListDTO([]);
        }
        const domainList = split(domains, '\n').map(
            (line: string) => parseDomainLine(
                line,
                showStatus ?? false,
                showJokerNS ?? false,
                showGrants ?? false
            )
        );
        return createJokerComApiDomainListDTO(domainList);
    }

    /** query-whois for domains
     * At least one of the arguments must be specified
     * @see https://joker.com/faq/content/79/455/en/query_whois.html
     * @param domain
     */
    public async queryWhoisByDomain (
        domain : string
    ) : Promise<JokerComApiWhoisDTO> {
        return this._queryWhois(domain);
    }

    /** query-whois for contacts
     * At least one of the arguments must be specified
     * @see https://joker.com/faq/content/79/455/en/query_whois.html
     * @param contact Contact handle
     */
    public async queryWhoisByContact (
        contact : string
    ) : Promise<JokerComApiWhoisContactDTO> {
        const dto = await this._queryWhois(undefined, contact);
        // LOG.debug(`queryWhoisByContact: dto: `, dto);
        const body = dto.body;
        const address1 = body['contact.address-1'];
        const address2 = body['contact.address-2'];
        const contactDto = createJokerComApiWhoisContactDTO(
            body['contact.name'],
            body['contact.organization'],
            [
                ...(address1 !== undefined ? [address1] : []),
                ...(address2 !== undefined ? [address2] : [])
            ],
            body['contact.city'],
            body['contact.postal-code'],
            body['contact.country'],
            body['contact.email'],
            body['contact.phone'],
            body['contact.handle'],
            body['contact.created.date'],
            body['contact.modified.date'],
            dto.headers,
            body
        );
        // LOG.debug(`queryWhoisByContact: contactDto: `, contactDto);
        return contactDto;
    }

    /** query-whois for nameservers
     * At least one of the arguments must be specified
     * @see https://joker.com/faq/content/79/455/en/query_whois.html
     * @param host
     */
    public async queryWhoisByHost (
        host : string
    ) : Promise<JokerComApiWhoisDTO> {
        return this._queryWhois(undefined, undefined, host);
    }

    /** query-whois
     * At least one of the arguments must be specified
     * @see https://joker.com/faq/content/79/455/en/query_whois.html
     * @param domain
     * @param contact
     * @param host
     */
    private async _queryWhois (
        domain  ?: string | undefined,
        contact ?: string | undefined,
        host    ?: string | undefined
    ) : Promise<JokerComApiWhoisDTO> {
        if (!this._authSID) throw new Error("FiHgComJokerDomainManagementService.queryWhois: No auth_id. Try login first.");
        if ( domain === undefined && contact === undefined && host === undefined ) {
            throw new TypeError('FiHgComJokerDomainManagementService.queryWhois: Exactly one of accepted options must be specified.');
        }
        const opts = {
            'auth-sid': this._authSID,
            ...( domain !== undefined ? {domain} : {}),
            ...( contact !== undefined ? {contact} : {}),
            ...( host !== undefined ? {host} : {})
        };
        const response = await jokerPostRequest(this._url,'query-whois', opts);
        const body = parseJokerStringObjectResponse(response.body);
        return createJokerComApiWhoisDTO(
            response.headers,
            body
        );
    }

    /** query-profile */
    public async queryProfile () : Promise<JokerComApiProfileDTO> {
        if (!this._authSID) throw new Error("FiHgComJokerDomainManagementService.queryProfile: No auth_id. Try login first.");
        const response = await jokerPostRequest(
            this._url,
            'query-profile',
            {
                'auth-sid': this._authSID
            }
        );
        const headers = response.headers;
        const body = parseJokerStringObjectResponse(response.body);
        const customerId   = body['customer-id']    ?? '';
        const firstName    = body['fname']          ?? '';
        const lastName     = body['lname']          ?? '';
        const organization = body['organization']   ?? '';
        const city         = body['city']           ?? '';
        const address1     = body['address-1']      ?? '';
        const address2     = body['address-2']      ?? '';
        const postalCode   = body['postal-code']    ?? '';
        const state        = body['state']          ?? '';
        const phone        = body['phone']          ?? '';
        const fax          = body['fax']            ?? '';
        const balance      = body['balance']        ?? '';
        const vatId        = body['vat-id']         ?? '';
        const lastPayment  = body['last-payment']   ?? '';
        const lastAccess   = body['last-access']    ?? '';
        const adminEmail   = body['admin_email']    ?? '';
        const robotEmail   = body['robot_email']    ?? '';
        const checkdIp     = body['checkd_ip']      ?? '';
        const http         = body['http']           ?? '';
        const url          = body['url']            ?? '';
        const whois1       = body['whois1']         ?? '';
        const whois2       = body['whois2']         ?? '';
        const whois3       = body['whois3']         ?? '';
        const whois4       = body['whois4']         ?? '';
        return createJokerComApiProfileDTO(
            headers,
            body,
            customerId,
            firstName,
            lastName,
            organization,
            city,
            [address1, address2],
            postalCode,
            state,
            phone,
            fax,
            parseJokerComApiPriceAmount(balance) ?? 0,
            vatId,
            lastPayment,
            lastAccess,
            adminEmail,
            robotEmail,
            split(checkdIp, ','),
            http,
            url,
            [ whois1, whois2, whois3, whois4 ],
        );
    }

    /** query-price-list
     * @see https://joker.com/faq/content/79/509/en/query_price_list.html
     */
    public async queryPriceList () : Promise<JokerComApiPriceListDTO> {
        if (!this._authSID) throw new Error("FiHgComJokerDomainManagementService.queryPriceList: No auth_id. Try login first.");
        const response = await jokerGetRequest(
            this._url,
            'query-price-list',
            {
                'auth-sid': this._authSID
            },
            ["0", "1000"]
        );
        const headers = response.headers;
        const columns = headers?.columns;
        const body = parseJokerComApiPriceListItemListFromString(
            response.body,
            columns ? trim(columns).split(',') : []
        );
        return createJokerComApiPriceListDTO(
            headers,
            body
        );
    }

    /** domain-renew
     * @see https://joker.com/faq/content/27/22/en/domain_renew.html
     */
    public async domainRenew (
        domain: string,
        period: number | undefined,
        expyear: string | undefined,
        privacy: JokerPrivacyType | undefined,
        maxPrice: number
    ) {
        if ( !this._authSID ) throw new Error(`FiHgComJokerDomainManagementService.domainRenew: No auth_id. Try login first.`);
        if ( !domain ) throw new TypeError('FiHgComJokerDomainManagementService.domainRenew: Option "domain" is required.');
        if ( period === undefined && !expyear ) {
            throw new TypeError('FiHgComJokerDomainManagementService.domainRenew: One of "period" or "expyear" is required.');
        }
        if ( period !== undefined && expyear ) {
            throw new TypeError('FiHgComJokerDomainManagementService.domainRenew: Only one of "period" or "expyear" may be used, but not both.');
        }
        if ( maxPrice <= 0 ) {
            throw new TypeError('FiHgComJokerDomainManagementService.domainRenew: "max-price" must be above 0')
        }
        const opts : JokerRequestArgumentObject = {
            'auth-sid': this._authSID,
            domain,
            ...(period ? {period: period.toFixed(0)} : {}),
            ...(expyear ? {expyear} : {}),
            ...(privacy ? {privacy}: {}),
            ...(maxPrice !== undefined ? {'max-price': maxPrice.toFixed(2)}: {})
        };
        await jokerPostRequest(this._url,'domain-renew', opts);
    }

    /** domain-check
     * @param domain
     * @param checkPrice
     * @param periodType
     * @param periods
     * @param language
     * @see https://joker.com/faq/content/27/497/en/domain_check.html
     */
    public async domainCheck (
        domain      : string,
        checkPrice ?: JokerComApiDomainPriceType | undefined,
        periods    ?: number | undefined,
        periodType ?: JokerComApiPeriodType,
        language   ?: string | undefined
    ) : Promise<JokerComApiDomainCheckDTO> {
        if ( !this._authSID ) throw new Error(`FiHgComJokerDomainManagementService.domainRenew: No auth_id. Try login first.`);
        if ( !domain ) throw new TypeError('FiHgComJokerDomainManagementService.domainRenew: Option "domain" is required.');
        if ( periods !== undefined ) {
            if (periodType === JokerComApiPeriodType.YEARS) {
                if ( periods > 10 || periods <= 0 ) {
                    throw new TypeError('FiHgComJokerDomainManagementService.domainRenew: Option "periods" must be 1-10 when specified as years.');
                }
            } else {
                if (periods < 12) {
                    throw new TypeError('FiHgComJokerDomainManagementService.domainRenew: Option "periods" must be over 12 when specified as months.');
                }
            }
        }
        const opts : JokerRequestArgumentObject = {
            'auth-sid': this._authSID,
            domain,
            ...(checkPrice ? {'check-price': checkPrice} : {}),
            ...(periods ? {period: periods.toFixed(0)} : {}),
            ...(language ? {language}: {})
        };
        const response = await jokerPostRequest(
            this._url,
            'domain-check',
            opts,
            ['0', '1000']
        );
        // LOG.debug(`domainCheck: response= `, response);
        const headers = response.headers;
        const body = parseJokerStringObjectResponse(response.body);
        const domainStatus = parseJokerComApiDomainStatus(body['domain-status']);
        if (!domainStatus) throw new TypeError('domainCheck: Could not parse domain status');

        const prices : readonly JokerComApiDomainPrice[] | undefined = parseJokerComDomainPrices(body);

        return createJokerComApiDomainCheckDTO(
            domain,
            headers,
            body,
            domainStatus,
            body['domain-status-reason'],
            body['domain-class'],
            prices
        );
    }

    /** domain-register
     * @see https://joker.com/faq/content/27/21/en/domain_register.html
     * @param domain
     * @param period Registration period in months, not years!
     * @param status
     * @param ownerContact
     * @param billingContact
     * @param adminContact
     * @param techContact
     * @param nsList
     * @param autoRenew Optional
     * @param language Optional
     * @param registrarTag Only needed for .xxx domains
     * @param privacy Optional
     * @param maxPrice Optional
     */
    public async domainRegister (
        domain         : string,
        period         : number,
        ownerContact   : string,
        billingContact : string,
        adminContact   : string,
        techContact    : string,
        nsList         : readonly string[],
        autoRenew     ?: boolean  | undefined,
        language      ?: string | undefined,
        registrarTag  ?: string | undefined,
        privacy       ?: JokerPrivacyType | undefined,
        maxPrice      ?: number | undefined
    ) : Promise<JokerComApiRegisterDTO> {
        if ( !this._authSID ) throw new Error(`FiHgComJokerDomainManagementService.domainRegister: No auth_id. Try login first.`);
        if ( !domain ) throw new TypeError('FiHgComJokerDomainManagementService.domainRegister: Option "domain" is required.');
        if ( !period ) throw new TypeError('FiHgComJokerDomainManagementService.domainRegister: Option "period" is required.');
        if ( period < 1 ) throw new TypeError('FiHgComJokerDomainManagementService.domainRegister: Option "period" must be at least 1.');
        if ( !ownerContact ) throw new TypeError('FiHgComJokerDomainManagementService.domainRegister: Option "ownerContact" is required.');
        if ( !billingContact ) throw new TypeError('FiHgComJokerDomainManagementService.domainRegister: Option "billingContact" is required.');
        if ( !adminContact ) throw new TypeError('FiHgComJokerDomainManagementService.domainRegister: Option "adminContact" is required.');
        if ( !techContact ) throw new TypeError('FiHgComJokerDomainManagementService.domainRegister: Option "techContact" is required.');
        if ( !nsList ) throw new TypeError('FiHgComJokerDomainManagementService.domainRegister: Option "nsList" is required.');
        if ( (nsList?.length ?? 0) < 2) throw new TypeError('FiHgComJokerDomainManagementService.domainModify: Option "nsList" must have at least 2 nameservers.');
        if ( maxPrice !== undefined && maxPrice <= 0 ) {
            throw new TypeError('FiHgComJokerDomainManagementService.domainRegister: "max-price" must be above 0')
        }
        const opts : JokerRequestArgumentObject = {
            'auth-sid': this._authSID,
            domain,
            period: period.toFixed(0),
            status: 'production',
            'owner-c': ownerContact,
            'billing-c': billingContact,
            'admin-c': adminContact,
            'tech-c': techContact,
            'ns-list': nsList.join(':'),
            ...( autoRenew !== undefined ? {autorenew: autoRenew?'1':'0'}: {}),
            ...( language ? {language}: {}),
            ...( registrarTag ? {'registrar-tag': registrarTag}: {}),
            ...( privacy ? {privacy}: {}),
            ...( maxPrice !== undefined ? {'max-price': maxPrice.toFixed(2)}: {})
        };
        const response = await jokerPostRequest(this._url,'domain-register', opts);
        const headers = response.headers;
        return createJokerComApiRegisterDTO(
            headers['tracking-id'],
            headers
        );
    }

    /** grants-list
     * @see https://joker.com/faq/content/76/448/en/grants_list.html
     */
    public async grantsList (
        domain: string,
        showKey: string
    ) : Promise<string> {
        if ( !this._authSID ) throw new Error(`FiHgComJokerDomainManagementService.grantsList: No auth_id. Try login first.`);
        if ( !domain ) throw new TypeError('Option "domain" is required.');
        const opts = {
            'auth-sid': this._authSID,
            domain,
            ...(showKey ? {showkey: showKey} : {}),
        };
        const response = await jokerPostRequest(this._url,'grants-list', opts);
        const grants = response.body;
        // FIXME: Prepare into array
        return grants;
    }

    /** grants-invite
     * @see https://joker.com/faq/content/76/449/en/grants_invite.html
     */
    public async grantsInvite (
        domain: string,
        email: string,
        clientUid: string,
        role: string,
        nickname: string
    ) :Promise<boolean> {
        if ( !this._authSID ) throw new Error(`FiHgComJokerDomainManagementService.grantsInvite: No auth_id. Try login first.`);
        if ( !domain ) throw new TypeError('FiHgComJokerDomainManagementService.grantsInvite: Option "domain" is required.');
        if ( !email ) throw new TypeError('FiHgComJokerDomainManagementService.grantsInvite: Option "email" is required.');
        if ( !role ) throw new TypeError('FiHgComJokerDomainManagementService.grantsInvite: Option "role" is required.');
        const opts = {
            'auth-sid': this._authSID,
            domain,
            email,
            role,
            ...(clientUid ? {'client-uid': clientUid} : {}),
            ...(nickname ? {'nick-name': nickname} : {})
        };
        const response = await jokerPostRequest(this._url,'grants-invite', opts);
        return ''+response.body === 'ok';
    }

    /** domain-modify
     * @see https://joker.com/faq/content/27/24/en/domain_modify.html
     */
    public async domainModify (
        domain          : string,
        billingContact ?: string | undefined,
        adminContact   ?: string | undefined,
        techContact    ?: string | undefined,
        nsList         ?: readonly string[] | undefined,
        registerTag    ?: string | undefined,
        dnssec         ?: boolean | undefined,
        ds             ?: readonly string[] | undefined,
    ) {
        if (!this._authSID) throw new Error("FiHgComJokerDomainManagementService.domainModify: No auth_id. Try login first.");
        if (!domain) throw new TypeError('FiHgComJokerDomainManagementService.domainModify: Option "domain" is required.');
        if (dnssec === true && !ds) throw new TypeError('FiHgComJokerDomainManagementService.domainModify: Option "ds" is required when "dnssec" enabled.');
        if (dnssec === true && (ds?.length ?? 0) < 2) throw new TypeError('FiHgComJokerDomainManagementService.domainModify: Option "ds" must have at least 2 items.');
        if (nsList !== undefined && (nsList?.length ?? 0) < 2) throw new TypeError('FiHgComJokerDomainManagementService.domainModify: Option "nsList" must have at least 2 nameservers.');
        const opts = {
            'auth-sid': this._authSID,
            domain,
            ...(billingContact ? {'billing-c': billingContact} : {}),
            ...(adminContact ? {'admin-c': adminContact} : {}),
            ...(techContact ? {'tech-c': techContact} : {}),
            ...(nsList !== undefined ? {'ns-list': nsList.join(':')} : {}),
            ...(registerTag ? {'registrar-tag': registerTag} : {}),
            ...(dnssec !== undefined ? {'dnssec': dnssec ? '1' : '0'} : {}),
            ...(dnssec !== undefined && ds !== undefined && ds.length >= 1 ? {'ds-1': ds[0]} : {}),
            ...(dnssec !== undefined && ds !== undefined && ds.length >= 2 ? {'ds-2': ds[1]} : {}),
            ...(dnssec !== undefined && ds !== undefined && ds.length >= 3 ? {'ds-3': ds[2]} : {}),
            ...(dnssec !== undefined && ds !== undefined && ds.length >= 4 ? {'ds-4': ds[3]} : {}),
            ...(dnssec !== undefined && ds !== undefined && ds.length >= 5 ? {'ds-5': ds[4]} : {}),
            ...(dnssec !== undefined && ds !== undefined && ds.length >= 6 ? {'ds-6': ds[5]} : {}),
        };
        await jokerPostRequest(this._url,'domain-modify', opts);
    }

}

/**
 * Performs POST request to the Joker.com's Domain Management API
 *
 * @param baseUrl for Joker.com's Domain Management API
 * @param name The name of the operation
 * @param args The request body
 * @param acceptedStatusCodes Optional array of accepted `status-code` response statuses. By default `["0"]`.
 */
async function jokerPostRequest (
    baseUrl: string,
    name : string,
    args : JokerRequestArgumentObject,
    acceptedStatusCodes : readonly string[] = ['0']
) : Promise<JokerDMAPIResponseObject> {
    const url = `${baseUrl}/request/${name}`;
    LOG.debug(`jokerRequest: url: "${url}"`);
    const body = queryStringify(args);
    LOG.debug(`jokerRequest: body: "${body}"`);
    const responseString = await HttpService.postText(
        url,
        body,
        {
            'Content-Type': ContentType.X_WWW_FORM_URLENCODED
        }
    );
    LOG.debug(`jokerRequest: responseString = "${responseString}"`);
    const response = parseResponseObject(responseString ?? '', acceptedStatusCodes);
    // LOG.debug(`jokerRequest: response = `, response);
    return response;
}

/**
 * Performs GET request to the Joker.com's Domain Management API
 *
 * @param baseUrl for Joker.com's Domain Management API
 * @param name The name of the operation
 * @param opts Optional query parameters
 * @param acceptedStatusCodes Optional array of accepted `status-code` response statuses. By default `["0"]`.
 */
async function jokerGetRequest (
    baseUrl             : string,
    name                : string,
    opts                : JokerStringObject | undefined,
    acceptedStatusCodes : readonly string[] = ['0']
) : Promise<JokerDMAPIResponseObject> {
    const url = `${baseUrl}/request/${name}${ opts !== undefined ? `?${queryStringify(opts)}` : '' }`;
    LOG.debug(`jokerGetRequest: url: "${url}"`);
    const responseString = await HttpService.getText(
        url,
        {
            'Content-Type': ContentType.X_WWW_FORM_URLENCODED
        }
    );
    LOG.debug(`jokerGetRequest: responseString = "${responseString}"`);
    const response = parseResponseObject(responseString ?? '', acceptedStatusCodes);
    LOG.debug(`jokerGetRequest: response = `, response);
    return response;
}

/** Parse DMAPI response body */
function parseResponseObject (
    data: string,
    acceptedStatusCodes : readonly string[] = ['0']
) : JokerDMAPIResponseObject {
    const parts = split(data, '\n\n');
    // LOG.debug(`jokerRequest: parts = `, parts);
    const headersString = parts.shift();
    if (headersString === undefined) {
        throw new TypeError(`parseResponseBody: Could not parse headers from: "${data}"`);
    }
    // LOG.debug(`jokerRequest: headersString = "${headersString}"`);
    const headers = parseResponseHeaders(headersString);
    // LOG.debug(`jokerRequest: headers: `, headers);

    const error = headers?.error;
    const warning = headers?.warning;
    const statusCode = headers['status-code'];
    const statusText = headers['status-text'];

    if (error !== undefined) {
        throw new Error(`FiHgComJokerDomainManagementService: Request failed: ${statusCode}: "${statusText}": ${error}`);
    }

    if (warning !== undefined) {
        LOG.warn(`FiHgComJokerDomainManagementService: DMAPI Warning: "${warning}"`)
    }

    if (statusCode !== undefined && !acceptedStatusCodes.includes(statusCode)) {
        throw new Error(`FiHgComJokerDomainManagementService: Request failed: ${statusCode}: "${statusText}"`);
    }

    const bodyString = parts.join('\n\n');
    // LOG.debug(`jokerRequest: bodyString = "${bodyString}"`);
    return {
        headers: headers,
        body: bodyString
    };
}

function parseResponseHeaders (headersString: string) : JokerStringObject {
    const headerLines = split(headersString, "\n");
    return reduce(
        headerLines,
        (obj: JokerStringObject, line: string) : JokerStringObject => {
            if (line.trim() && line.indexOf(': ') < 0) {
                throw new TypeError(`parseResponseHeaders: Could not parse line: "${line}"`);
            }
            const parts = split(line, ': ');
            const name = parts.shift();
            if (!name) throw new TypeError(`parseResponseHeaders: Could not parse name and value: "${line}"`);
            const value = parts.join(': ');
            return {
                ...obj,
                [name.toLowerCase()]: value
            };
        },
        {}
    );
}

/** Parse single line */
function parseJokerNS (line : string) : boolean {
    if (! ((line === '1') || (line === '0')) ) {
        throw new TypeError(`FiHgComJokerDomainManagementService.parseJokerNS: Could not parse "jokerns": "${line}"`);
    }
    return line === '1';
}

/** Parse single line
 */
function parseDomainLine (
    line: string,
    showStatus: boolean,
    showJokerNs: boolean,
    showGrants: boolean
) : JokerDomainResult {

    // -S-G-J ==> "example.fi 2017-06-02"
    // +S-G-J ==> "example.fi 2017-06-02 lock"
    // +S+G-J ==> "example.fi 2017-06-02 lock @creator true 0 undef"
    // -S+G-J ==> "example.fi 2017-06-02 @creator true 0 undef"
    // -S-G+J ==> "example.fi 2017-06-02 0"
    // +S+G+J ==> "example.fi 2017-06-02 lock @creator true 0 undef 0"

    const tmp = split(line, ' ');

    const domain = tmp.shift();
    if (!domain) throw new TypeError(`FiHgComJokerDomainManagementService.parse_domain: Could not parse domain name: "${line}"`);

    const exp_date = tmp.shift();
    if (!exp_date) throw new TypeError(`FiHgComJokerDomainManagementService.parse_domain: Could not parse domain exp_date: "${line}"`);

    const statusString = tmp.shift();
    if (statusString === undefined) throw new TypeError(`FiHgComJokerDomainManagementService.parse_domain: Could not parse statusString from "${line}"`);

    const status = split(statusString, ',');
    if (!isString(status)) throw new TypeError(`FiHgComJokerDomainManagementService.parse_domain: Could not parse status: "${line}"`);

    const jokerNsString = tmp.pop();
    if (jokerNsString === undefined) {
        throw new TypeError(`FiHgComJokerDomainManagementService.parse_domain: Could not parse jokerNs string: "${line}"`);
    }
    const jokerNS = parseJokerNS(jokerNsString);
    if (!isBoolean(jokerNS)) throw new TypeError(`FiHgComJokerDomainManagementService.parse_domain: Could not parse jokerNs: "${line}"`);

    const grants = tmp.join(' ');

    return {
        domain: domain,
        expiration: exp_date,
        ...(showStatus ? {status} : {}),
        ...(showJokerNs ? {jokerns: jokerNS} : {}),
        ...(showGrants ? {grants} : {})
    };
}

function parseJokerStringObjectResponse (body: string) : JokerStringObject {
    const lines = split(body, '\n');
    return reduce(
        lines,
        (data : JokerStringObject, line: string) : JokerStringObject => {
            if (!line) {
                return data;
            }
            const parts = split(line, ': ');
            const key = parts.shift();
            if (!key) throw new TypeError(`FiHgComJokerDomainManagementService.parseJokerStringObjectResponse: Could not parse key from line "${line}"`);
            const value = parts.join(': ');
            return {
                ...data,
                [key]: value
            };
        },
        {}
    );
}

function parseJokerComDomainPrices (body : JokerStringObject) : readonly JokerComApiDomainPrice[] | undefined {

    let isPromo    : boolean = false;
    let promoStart : string | undefined = undefined;
    let promoEnd   : string | undefined = undefined;

    let results : readonly JokerComApiDomainPrice[] = reduce(
        keys(body),
        (list : readonly JokerComApiDomainPrice[], key: string) : readonly JokerComApiDomainPrice[] => {

            if ( key === 'domain-price-promo' ) {
                const valueString = body[key];
                const parts = split(valueString, ' ');
                const startString = parts.shift();
                if (!startString) throw new TypeError(`FiHgComJokerDomainManagementService: parseJokerComDomainPrices: could not parse start promo date from: "${valueString}"`);
                const endString = parts.shift();
                if (!endString) throw new TypeError(`FiHgComJokerDomainManagementService: parseJokerComDomainPrices: could not parse end promo date from: "${valueString}"`);
                isPromo = true;
                promoStart = startString;
                promoEnd = endString;
                return list;
            }

            if (startsWith(key, 'domain-price-')) {
                const typeString : string = key.substring('domain-price-'.length);
                const type : JokerComApiDomainPriceType | undefined = parseJokerComApiDomainPriceType( typeString );
                if (!type) throw new TypeError(`FiHgComJokerDomainManagementService: parseJokerComDomainPrices: could not parse price type "${typeString}": ${explainJokerComApiDomainPriceType(typeString)}`);

                const valueString = body[key];
                const parts = split(valueString, ' ');

                const amountString = parts.shift();
                const amount = amountString !== undefined ? parseJokerComApiPriceAmount(amountString) : undefined;
                if (!amount) throw new TypeError(`FiHgComJokerDomainManagementService: parseJokerComDomainPrices: could not parse price amount "${amountString}": ${explainJokerComApiPriceAmount(amountString)}`);

                const currencyString = parts.shift();
                const currency = currencyString !== undefined ? parseJokerComApiCurrency(currencyString) : undefined;
                if (!currency) throw new TypeError(`FiHgComJokerDomainManagementService: parseJokerComDomainPrices: could not parse price currency "${currencyString}": ${explainJokerComApiCurrency(currencyString)}`);

                const periodString = parts.shift();
                const period = periodString !== undefined ? parseJokerComApiDomainPeriod(periodString) : undefined;
                if (!period) throw new TypeError(`FiHgComJokerDomainManagementService: parseJokerComDomainPrices: could not parse price period "${periodString}": ${explainJokerComApiDomainPeriod(periodString)}`);

                return [
                    ...list,
                    createJokerComApiDomainPrice(amount, currency, period, isPromo, promoStart, promoEnd)
                ];
            }

            return list;
        },
        []
    );

    // Make sure promo is added (in case it's in wrong order)
    results = map(
        results,
        (item: JokerComApiDomainPrice) : JokerComApiDomainPrice => {
            if (item.isPromo !== isPromo) {
                return {
                    ...item,
                    isPromo,
                    promoStart,
                    promoEnd
                };
            } else {
                return item;
            }
        }
    );

    return results.length === 0 ? undefined : results;
}
