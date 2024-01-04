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

import { isIP } from "net";
import { toASCII } from 'punycode';
import { LogService } from "../../../core/LogService";
import { WhoisServerOptions } from "../../../core/whois/types/WhoisServerOptions";
import { WhoisServerList } from "../../../core/whois/types/WhoisServerList";
import { WhoisServerRegistryService } from "../../../core/whois/WhoisServerRegistryService";
import { isNull } from "../../../core/types/Null";

const LOG = LogService.createLogger('WhoisServerRegistryService');

/**
 * Resolves whois servers from a predefined list of servers based on address
 *
 * @see example at https://github.com/heusalagroup/whois.hg.fi/blob/main/src/main.ts#L58
 */
export class NodeWhoisServerRegistryService implements WhoisServerRegistryService {

    private readonly _servers: WhoisServerList;

    public constructor (servers: WhoisServerList) {
        this._servers = servers;
    }

    public resolveServerFromAddress (
        addr: string
    ): string | WhoisServerOptions | undefined {
        let server: string | WhoisServerOptions | null | undefined = undefined;
        if (addr.indexOf('@') >= 0) {
            throw new TypeError('lookup: email addresses not supported');
        } else if (isIP(addr) !== 0) {
            server = this._servers._IP;
        } else {
            server = NodeWhoisServerRegistryService._resolveServer(this._servers, addr);
        }
        if (server) {
            LOG.debug(`"${addr}": Found: `, server);
        } else {
            LOG.debug(`"${addr}": Not found`);
        }
        if (isNull(server)) return undefined;
        return server;
    }

    private static _resolveServer (
        servers: WhoisServerList,
        address: string
    ) : string | WhoisServerOptions | undefined {
        let server;
        let tld = toASCII(address);
        while ( true ) {
            server = servers[tld];
            if ( !tld || server ) {
                break;
            }
            tld = tld.replace(/^.+?(\.|$)/, '');
        }
        if (isNull(server)) return undefined;
        return server;
    }

}

