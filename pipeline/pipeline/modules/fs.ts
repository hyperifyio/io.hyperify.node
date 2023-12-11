// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { readFile as READ_FILE } from "src/io/hyperify/node/pipeline/pipeline/modules/fs";
import { isString } from "../../../../core/types/String";

export interface ReadFileOptions {

    /**
     * Defaults to null
     */
    readonly encoding ?: BufferEncoding | null;

    /**
     * Defaults to 'r'
     */
    readonly flag ?: string;

}

export async function readFile (
    path     : string,
    options ?: ReadFileOptions
) : Promise<string|Buffer> {

    return await new Promise((resolve, reject) => {
        try {
            READ_FILE(path, options, (err : any, data: string | Buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        } catch (err) {
            reject(err);
        }
    })

}

export async function readFileString (
    path     : string,
    options ?: ReadFileOptions
) : Promise<string> {

    const result = await readFile(path, options);

    if (isString(result)) return result;

    return result.toString('utf8' );

}
