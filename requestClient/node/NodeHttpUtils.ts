// Copyright (c) 2022-2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
// Copyright (c) 2020-2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { JsonAny } from "../../../core/Json";
import { BufferEncodingString, NodeStreamUtils } from "../../NodeStreamUtils";
import { IncomingMessage } from "http";

export class NodeHttpUtils {

    /**
     * Get request body data as Buffer object.
     *
     * @param request
     * @return The request input data
     */
    public static async getRequestDataAsBuffer (
        request : IncomingMessage
    ) : Promise<Buffer> {
        return NodeStreamUtils.getStreamDataAsBuffer(request);
    }

    /**
     * Get request body data as string.
     *
     * @param request
     * @param encoding
     * @return The request input data
     */
    public static async getRequestDataAsString (
        request  : IncomingMessage,
        encoding : BufferEncodingString = 'utf8'
    ) : Promise<string> {
        return await NodeStreamUtils.getStreamDataAsString(request, encoding);
    }

    /**
     * Get request body data as "application/x-www-form-urlencoded".
     *
     * @param request
     * @return The request input data. If request data is an empty string, an `undefined` will be
     *     returned.
     */
    public static async getRequestDataAsFormUrlEncoded (
        request : IncomingMessage
    ) : Promise<JsonAny | undefined> {
        return await NodeStreamUtils.getStreamDataAsFormUrlEncoded(request);
    }

    /**
     * Get request body data as JSON.
     *
     * @param request
     * @return The request input data. If request data is an empty string, an `undefined` will be
     *     returned.
     */
    public static async getRequestDataAsJson (
        request : IncomingMessage
    ) : Promise<JsonAny | undefined> {
        return await NodeStreamUtils.getStreamDataAsJson(request);
    }

}
