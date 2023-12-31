// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

export enum ControllerState {
    UNCONSTRUCTED = -1,
    CONSTRUCTED   = 0,
    STARTED       = 1,
    PAUSED        = 2,
    CANCELLED     = 3,
    FINISHED      = 4,
    FAILED        = 5
}

export function isControllerState (value: any): value is ControllerState {
    switch (value) {
        case ControllerState.UNCONSTRUCTED:
        case ControllerState.CONSTRUCTED:
        case ControllerState.STARTED:
        case ControllerState.PAUSED:
        case ControllerState.CANCELLED:
        case ControllerState.FINISHED:
        case ControllerState.FAILED:
            return true;

        default:
            return false;

    }
}

export function stringifyControllerState (value: ControllerState): string {
    switch (value) {
        case ControllerState.UNCONSTRUCTED  : return 'UNCONSTRUCTED';
        case ControllerState.CONSTRUCTED  : return 'CONSTRUCTED';
        case ControllerState.STARTED  : return 'STARTED';
        case ControllerState.PAUSED  : return 'PAUSED';
        case ControllerState.CANCELLED  : return 'CANCELLED';
        case ControllerState.FINISHED  : return 'FINISHED';
        case ControllerState.FAILED  : return 'FAILED';
    }
    throw new TypeError(`Unsupported ControllerState value: ${value}`);
}

export function parseControllerState (value: any): ControllerState | undefined {

    switch (value) {

        case 'UNCONSTRUCTED' : return ControllerState.UNCONSTRUCTED;
        case 'CONSTRUCTED' : return ControllerState.CONSTRUCTED;
        case 'STARTED' : return ControllerState.STARTED;
        case 'PAUSED' : return ControllerState.PAUSED;
        case 'CANCELLED' : return ControllerState.CANCELLED;
        case 'FINISHED' : return ControllerState.FINISHED;
        case 'FAILED' : return ControllerState.FAILED;

        default    : return undefined;

    }

}

export default ControllerState;
