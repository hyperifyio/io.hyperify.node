/*
 * Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
 * Copyright (c) 2013, Mahmud Ridwan <m@hjr265.me>. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those
 * of the authors and should not be interpreted as representing official policies,
 * either expressed or implied, of the FreeBSD Project.
 */

import { connect, Socket, NetConnectOpts } from "net";
import { toASCII } from 'punycode';
import { startsWith } from "../../../core/functions/startsWith";
import { LogService } from "../../../core/LogService";
import { WhoisService } from "../../../core/whois/WhoisService";
import { createWhoisLookupResult, WhoisLookupResult } from "../../../core/whois/types/WhoisLookupResult";
import { WhoisServerOptions } from "../../../core/whois/types/WhoisServerOptions";
import { WhoisLookupOptions } from "../../../core/whois/types/WhoisLookupOptions";
import { isString } from "../../../core/types/String";
import { parseInteger } from "../../../core/types/Number";

const LOG = LogService.createLogger('NodeWhoisService');

/**
 * Performs query on whois server
 *
 * @see example at https://github.com/heusalagroup/whois.hg.fi/blob/main/src/main.ts#L58
 */
export class NodeWhoisService implements WhoisService {

    /**
     *
     */
    public constructor () {}

    /**
     *
     * @param addr
     * @param options
     */
    async whoisLookup (
        addr: string,
        options?: WhoisLookupOptions
    ): Promise<readonly WhoisLookupResult[]> {

        LOG.debug(`whoisLookup: addr = "${addr}"; options = `, options);

        const _options: WhoisLookupOptions = {
            responseEncoding: 'utf8',
            follow: 2,
            timeout: 60000, // 60 seconds in ms
            ...(options ?? {})
        };

        if (!_options.server) {
            throw new TypeError('options.server missing');
        }

        const server: WhoisServerOptions | undefined = NodeWhoisService._parseServerOptions(_options.server);
        if ( !server ) {
            throw new Error(`whoisLookup: no whois server is known for this kind of object: ${_options.server}`);
        }
        LOG.debug(`server = `, server);

        if (!server.port) {
            throw new TypeError('server.port missing');
        }

        const sockOpts: NetConnectOpts = {
            host: server.host,
            port: server.port
        };

        if ( _options.bind ) {
            sockOpts.localAddress = _options.bind;
        }

        LOG.debug(`sockOpts = `, sockOpts);

        const socket = connect(sockOpts);
        if ( _options.timeout ) {
            socket.setTimeout(_options.timeout);
        }
        if ( _options.encoding ) {
            socket.setEncoding(_options.encoding);
        }

        if (!server.query) {
            throw new TypeError('server.query missing');
        }

        const buffer = await NodeWhoisService._whoisSocketQuery(
            socket,
            server.punycode !== false && _options.punycode !== false ? toASCII(addr) : addr,
            server.query
        );

        const data = buffer.toString(_options.responseEncoding);
        LOG.debug(`data = `, data);

        if (startsWith(data, 'ERROR:')) {
            throw Error(data.substring('ERROR:'.length).trim());
        }

        if (!_options.follow) {
            throw new TypeError('options.follow missing');
        }

        if (!server.host) {
            throw new TypeError('server.host missing');
        }
        if ( _options.follow > 0 ) {
            const nextServer = NodeWhoisService._parseNextServer(data);
            if ( nextServer && nextServer !== server.host ) {
                return [
                    createWhoisLookupResult(server.host, data)
                ].concat(
                    await this.whoisLookup(
                        addr,
                        {
                            ..._options,
                            follow: _options.follow - 1,
                            server: nextServer
                        }
                    )
                );
            }
        }

        return [
            createWhoisLookupResult(server.host, data)
        ];

    }

    /**
     *
     * @param server
     * @private
     */
    private static _parseServerOptions (
        server: string | WhoisServerOptions | undefined
    ) : WhoisServerOptions | undefined {
        if ( !server ) {
            return undefined;
        }
        if ( isString(server) ) {
            const parts = server.split(':');
            server = {
                host: parts[0],
                port: parts.length >= 2 ? parseInteger(parts[1]) : 43
            };
        }
        const host = server.host;
        if ( !host ) {
            return undefined;
        }
        if (!server.port) {
            server = {
                ...server,
                port: 43
            };
        }
        if (!server.query) {
            server = {
                ...server,
                query: "$addr\r\n",
            };
        }
        return {
            ...server,
            host: host.trim()
        };
    }

    /**
     *
     * @param data
     * @private
     */
    private static _parseNextServer (
        data: string
    ): string | undefined {
        const match = data.replace(/\r/gm, '').match(/(ReferralServer|Registrar Whois|Whois Server|WHOIS Server|Registrar WHOIS Server):[^\S\n]*((?:r?whois|https?):\/\/)?(.*)/);
        return match != null ? NodeWhoisService._cleanParsingErrors(match[3].trim()) : undefined;
    }

    /**
     *
     * @param string
     * @private
     */
    private static _cleanParsingErrors (string: string) {
        return string.replace(/^[:\s]+/, '').replace(/^https?[:\/]+/, '') || string;
    }

    /**
     *
     * @param socket
     * @param idn
     * @param query
     * @private
     */
    private static async _whoisSocketQuery (
        socket: Socket,
        idn: string,
        query: string
    ): Promise<Buffer> {
        if (!idn) throw new TypeError(`_whoisSocketQuery: No idn param: ${idn}`);
        if (!query) throw new TypeError(`_whoisSocketQuery: No query param: ${query}`);
        return await new Promise(
            (resolve, reject) => {
                try {
                    const chunks: Buffer[] = [];
                    socket.write(query.replace('$addr', idn));
                    socket.on('data', (chunk) => {
                        chunks.push(chunk);
                    });
                    socket.on('timeout', () => {
                        socket.destroy();
                        reject(new Error('_whoisSocketQuery: timeout'));
                    });
                    socket.on('error', (err) => {
                        reject(err);
                    });
                    return socket.on('close', () => {
                        resolve(Buffer.concat(chunks));
                    });
                } catch (err) {
                    reject(err);
                }
            }
        );
    }

}
