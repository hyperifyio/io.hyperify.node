// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import {
    isMatrixRoomVersion,
    MatrixRoomVersion,
} from "../../../../../../core/matrix/types/MatrixRoomVersion";
import {
    isMatrixVisibility,
    MatrixVisibility,
} from "../../../../../../core/matrix/types/request/createRoom/types/MatrixVisibility";
import { hasNoOtherKeys } from "../../../../../../core/types/OtherKeys";
import { isString } from "../../../../../../core/types/String";
import { isRegularObject } from "../../../../../../core/types/RegularObject";

export interface Room {

    /**
     * Internal database ID.
     * Same as local part of the Matrix Room ID.
     * Unique per hostname.
     */
    readonly id : string;

    readonly version : MatrixRoomVersion;

    readonly visibility : MatrixVisibility;

}

export function createRoom (
    id: string,
    version: MatrixRoomVersion,
    visibility: MatrixVisibility
): Room {
    return {
        id,
        version,
        visibility
    };
}

export function isRoom (value: any): value is Room {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'id',
            'version',
            'visibility'
        ])
        && isString(value?.id)
        && isMatrixRoomVersion(value?.version)
        && isMatrixVisibility(value?.visibility)
    );
}

export function stringifyRoom (value: Room): string {
    return `Room(${value})`;
}

export function parseRoom (value: any): Room | undefined {
    if ( isRoom(value) ) return value;
    return undefined;
}
