// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

export enum FileControllerAction {
    MKDIR          = "mkdir",
    READ           = "read",
    READ_OR_CREATE = "read/create",
    WRITE          = "write"
}

export function isFileControllerAction (value: any): value is FileControllerAction {
    switch (value) {
        case FileControllerAction.MKDIR:
        case FileControllerAction.READ:
        case FileControllerAction.READ_OR_CREATE:
        case FileControllerAction.WRITE:
            return true;
    }
    return false;
}

export default FileControllerAction;
