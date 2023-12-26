// Copyright (c) 2021-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { createTransport } from 'nodemailer';
import { uniq } from "../core/functions/uniq";
import { trim } from "../core/functions/trim";
import { LogService } from "../core/LogService";
import { isArray } from "../core/types/Array";
import { LogLevel } from "../core/types/LogLevel";
import { parseBoolean } from "../core/types/Boolean";
import { parseNonEmptyString } from "../core/types/String";

import { EmailMessage } from "../core/email/types/EmailMessage";
import { EmailService } from "../core/email/EmailService";

const LOG = LogService.createLogger('EmailServiceImpl');

/**
 * Email service implemented using "nodemailer" module.
 */
export class EmailServiceImpl implements EmailService {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private _from        : string | undefined;
    private _transporter : any | undefined;

    /**
     *
     * @param from
     * @param transporter
     */
    protected constructor (
        from         : string,
        transporter ?: any | undefined
    ) {
        this._from = from;
        this._transporter = transporter;
    }

    public static create (
        from         : string,
        transporter ?: any | undefined
    ) : EmailServiceImpl {
        return new EmailServiceImpl(
            from,
            transporter
        );
    }

    public setDefaultFrom (from: string) {
        this._from = from;
        LOG.info(`Default from address defined as `, this._from);
    }

    public initialize ( config  ?: string ) : void {

        config = trim(config ?? '');

        if (config === '') {
            LOG.debug(`No config defined. Using localhost:25.`);
            this._transporter = createTransport({
                host: 'localhost',
                port: 25,
                secure: false
            });
            return;
        }

        const u = new URL(config);

        function parseBooleanParam (u: URL, key: string) : boolean | undefined {
            return u?.searchParams?.has(key) ? parseBoolean( u?.searchParams?.get(key) ) : undefined;
        }

        function parseNonEmptyStringParam (u: URL, key: string) : string | undefined {
            return u?.searchParams?.has(key) ? parseNonEmptyString( u?.searchParams?.get(key) ) : undefined;
        }

        const username : string | undefined = u?.username || undefined;
        const password : string | undefined = u?.password || undefined;
        const hostname : string  = u?.hostname || 'localhost';
        const port     : number  = parseInt(u?.port || '25', 10);
        const secure   : boolean | undefined = parseBooleanParam(u, 'secure');
        const ignoreTLS : boolean | undefined = parseBooleanParam(u, 'ignore-tls');
        const requireTLS : boolean | undefined = parseBooleanParam(u, 'require-tls');
        const tlsServerName : string | undefined = parseNonEmptyStringParam(u, 'tls-server-name');
        const tlsRejectUnauthorized : boolean | undefined = parseBooleanParam(u, 'tls-server-name');

        LOG.debug(`Config "${config}" parsed as ${hostname}:${port} ${
            username && password ? `with '${username}':'${password}'` : `without auth`
        } with secure=${secure}, ignoreTLS=${ignoreTLS}, requireTLS=${requireTLS}, tlsServerName='${tlsServerName}', tlsRejectUnauthorized=${tlsRejectUnauthorized}`)

        this._transporter = createTransport({
            host: hostname,
            port: port,
            ...( secure !== undefined ? { secure } : {}),
            ...( ignoreTLS !== undefined ? { ignoreTLS } : {}),
            ...( requireTLS !== undefined ? { requireTLS } : {}),
            ...( tlsServerName !== undefined || tlsRejectUnauthorized !== undefined ? {
                tls: {
                    ...(tlsServerName !== undefined ? {servername: tlsServerName} : {}),
                    ...(tlsRejectUnauthorized !== undefined ? {rejectUnauthorized: tlsRejectUnauthorized} : {}),
                }
            } : {}),
            ...(
                username !== undefined && password !== undefined
                ? {
                        auth: {
                            user: decodeURIComponent(username),
                            pass: decodeURIComponent(password)
                        }
                } : {}
            ),
        });

    }

    public async sendEmailMessage (message: EmailMessage) {

        if (!this._transporter) throw new TypeError('EmailServiceImpl not initialized');

        const to : string[] | string = message?.to;
        const cc : string[] | string = message?.cc ?? [];

        const toList : string[] = isArray(to) ? to : [to];
        const ccList : string[] = isArray(cc) ? cc : [cc];

        const recipientList : string[] = uniq([
            ...toList,
            ...ccList
        ]);

        const from    : string = message?.from ?? this._from ?? '';
        if (!from) throw new TypeError('"from" must be defined');
        const recipientString : string = recipientList.join(', ');
        const subject : string = message?.subject ?? '';

        const content : string = message?.content ?? '';

        const contentHtml : string = message?.htmlContent ?? content;

        LOG.debug(`Sending message "${subject}" to "${recipientString}" from "${from}"`);

        await this._transporter.sendMail({
            from    : from,
            to      : recipientString,
            subject : subject,
            text    : content,
            html    : contentHtml,
        });

    }

}
