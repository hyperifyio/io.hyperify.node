// Copyright (c) 2022-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
// Copyright (c) 2020-2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { parse as queryParse } from "querystring";
import { Readable } from "stream";
import { JsonAny } from "../core/Json";

/**
 * The type definitions for Node were inciting to use strict type list, even though NodeJS manual
 * tells just "string".
 */
export type BufferEncodingString = "utf-8" | "ascii" | "utf8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" | undefined;

export class NodeStreamUtils {

    /**
     * Read stream data as Buffer object.
     *
     * @param request
     * @return The request input data
     */
    public static async getStreamDataAsBuffer (
        request : Readable
    ) : Promise<Buffer> {
        return new Promise( (resolve, reject) => {
            const chunks : Buffer[] = [];
            request.on('data', (chunk : Buffer) => {
                try {
                    chunks.push(chunk);
                } catch(err) {
                    reject(err);
                }
            });
            request.on('end', () => {
                try {
                    resolve( Buffer.concat(chunks) );
                } catch(err) {
                    reject(err);
                }
            });
        });
    }

    /**
     * Read stream data as string.
     *
     * @param request
     * @param encoding
     * @return The request input data
     */
    public static async getStreamDataAsString (
        request  : Readable,
        encoding : BufferEncodingString = 'utf8'
    ) : Promise<string> {
        const buffer = await NodeStreamUtils.getStreamDataAsBuffer(request);
        return buffer.toString(encoding);
    }

    /**
     * Read stream data as "application/x-www-form-urlencoded".
     *
     * @param request
     * @return The request input data. If request data is an empty string, an `undefined` will be
     *     returned.
     */
    public static async getStreamDataAsFormUrlEncoded (
        request : Readable
    ) : Promise<JsonAny | undefined> {
        const dataString = await NodeStreamUtils.getStreamDataAsString(request);
        if (dataString === "") {
            return undefined;
        }
        return queryParse(dataString);
    }

    /**
     * Read stream data as JSON.
     *
     * @param request
     * @return The request input data. If request data is an empty string, an `undefined` will be
     *     returned.
     */
    public static async getStreamDataAsJson (
        request : Readable
    ) : Promise<JsonAny | undefined> {
        const dataString = await NodeStreamUtils.getStreamDataAsString(request);
        if (dataString === "") {
            return undefined;
        }
        return JSON.parse(dataString);
    }

}
