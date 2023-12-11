// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { writeFile, unlink, rename } from 'fs/promises';
import { LogService } from "../core/LogService";

const LOG = LogService.createLogger( 'NodeFileUtils' );

export class NodeFileUtils {

    public static async atomicWriteFile (
        name     : string,
        data     : Buffer,
        encoding : BufferEncoding = "utf8"
    ) : Promise<void> {
        const now = (new Date()).getTime();
        const tempFile = `${name}.${now}`;
        let doUnlink = true;
        try {
            await writeFile(tempFile, data, encoding);
            await rename(tempFile, name);
            doUnlink = false;
        } finally {
            if ( doUnlink ) {
                try {
                    await unlink(tempFile);
                } catch (err) {
                    LOG.warn(`Warning! Could not remove temp file: ${tempFile}`);
                }
            }
        }
    }

}
