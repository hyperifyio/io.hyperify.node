// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { readFile } from "fs";
import { LogService } from "../../../../core/LogService";
import ErrnoException = NodeJS.ErrnoException;

const LOG = LogService.createLogger('FileSystemService');

export class FileSystemService {

    public static async readTextFile (fileName : string) : Promise<string> {
        LOG.debug(`Reading file: `, fileName);
        return await new Promise((resolve, reject) => {
            readFile(fileName, {encoding: 'utf8'}, (err: ErrnoException | null, data : string) => {
                if ( err ) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

}
