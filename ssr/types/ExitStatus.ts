// Copyright (c) 2021. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import {
    isNumber,
    parseInteger,
} from "../../../core/types/Number";

export enum ExitStatus {

    /** Standard successful termination */
    OK                              = 0,

    // From Advanced Bash scripting guide
    GENERAL_ERRORS                  = 1,
    MISUSE_OF_SHELL_BUILTINS        = 2,

    // Our custom errors
    ARGUMENT_PARSE_ERROR            = 3,
    UNKNOWN_ARGUMENT                = 4,
    UNIMPLEMENTED_FEATURE           = 5,
    FATAL_ERROR                     = 6,
    CONFLICT                        = 7,

    // From Linux sysexits.h
    USAGE                           = 64,      /* command line usage error */
    DATAERR                         = 65,      /* data format error */
    NOINPUT                         = 66,      /* cannot open input */
    NOUSER                          = 67,      /* addressee unknown */
    NOHOST                          = 68,      /* host name unknown */
    UNAVAILABLE                     = 69,      /* service unavailable */
    SOFTWARE                        = 70,      /* internal software error */
    OSERR                           = 71,      /* system error (e.g., can't fork) */
    OSFILE                          = 72,      /* critical OS file missing */
    CANTCREAT                       = 73,      /* can't create (user) output file */
    IOERR                           = 74,      /* input/output error */
    TEMPFAIL                        = 75,      /* temp failure; user is invited to retry */
    PROTOCOL                        = 76,      /* remote error in protocol */
    NOPERM                          = 77,      /* permission denied */
    CONFIG                          = 78,      /* configuration error */

    // From Advanced Bash scripting guide

    COMMAND_INVOKED_CANNOT_EXECUTE  = 126,
    COMMAND_NOT_FOUND               = 127,
    INVALID_ARGUMENT_TO_EXIT        = 128,
    FATAL_SIGNAL_RANGE_START        = 129,
    FATAL_SIGNAL_RANGE_END          = 254,
    EXIT_STATUS_OUT_OF_RANGE        = 255

}

/**
 *
 * @param value
 * @__PURE__
 * @nosideeffects
 */
export function isRunnerExitStatus (value: any): value is ExitStatus {

    if (!isNumber(value)) return false;
    if (value < 0) return false;
    if (value > 255) return false;

    if ( value >= ExitStatus.FATAL_SIGNAL_RANGE_START
        && value <= ExitStatus.FATAL_SIGNAL_RANGE_END
    ) {
        return true;
    }

    switch (value) {

        case ExitStatus.OK:
        case ExitStatus.GENERAL_ERRORS:
        case ExitStatus.MISUSE_OF_SHELL_BUILTINS:
        case ExitStatus.ARGUMENT_PARSE_ERROR:
        case ExitStatus.UNKNOWN_ARGUMENT:
        case ExitStatus.UNIMPLEMENTED_FEATURE:
        case ExitStatus.FATAL_ERROR:
        case ExitStatus.USAGE:
        case ExitStatus.DATAERR:
        case ExitStatus.NOINPUT:
        case ExitStatus.NOUSER:
        case ExitStatus.NOHOST:
        case ExitStatus.UNAVAILABLE:
        case ExitStatus.SOFTWARE:
        case ExitStatus.OSERR:
        case ExitStatus.OSFILE:
        case ExitStatus.CANTCREAT:
        case ExitStatus.IOERR:
        case ExitStatus.TEMPFAIL:
        case ExitStatus.PROTOCOL:
        case ExitStatus.NOPERM:
        case ExitStatus.CONFIG:
        case ExitStatus.COMMAND_INVOKED_CANNOT_EXECUTE:
        case ExitStatus.COMMAND_NOT_FOUND:
        case ExitStatus.INVALID_ARGUMENT_TO_EXIT:
        case ExitStatus.FATAL_SIGNAL_RANGE_START:
        case ExitStatus.FATAL_SIGNAL_RANGE_END:
        case ExitStatus.EXIT_STATUS_OUT_OF_RANGE:
        case ExitStatus.CONFLICT:
            return true;

        default:
            return false;

    }

}

/**
 *
 * @param value
 * @__PURE__
 * @nosideeffects
 */
export function stringifyRunnerExitStatus (value: ExitStatus): string {

    if (value >= ExitStatus.FATAL_SIGNAL_RANGE_START && value <= ExitStatus.FATAL_SIGNAL_RANGE_END) {
        return `FATAL_SIGNAL_${ value - ExitStatus.FATAL_SIGNAL_RANGE_START }`;
    }

    switch (value) {

        case ExitStatus.OK                              : return 'OK';
        case ExitStatus.GENERAL_ERRORS                  : return 'GENERAL_ERRORS';
        case ExitStatus.MISUSE_OF_SHELL_BUILTINS        : return 'MISUSE_OF_SHELL_BUILTINS';
        case ExitStatus.ARGUMENT_PARSE_ERROR            : return 'ARGUMENT_PARSE_ERROR';
        case ExitStatus.UNKNOWN_ARGUMENT                : return 'UNKNOWN_ARGUMENT';
        case ExitStatus.UNIMPLEMENTED_FEATURE           : return 'UNIMPLEMENTED_FEATURE';
        case ExitStatus.FATAL_ERROR                     : return 'FATAL_ERROR';
        case ExitStatus.USAGE                           : return 'USAGE';
        case ExitStatus.DATAERR                         : return 'DATAERR';
        case ExitStatus.NOINPUT                         : return 'NOINPUT';
        case ExitStatus.NOUSER                          : return 'NOUSER';
        case ExitStatus.NOHOST                          : return 'NOHOST';
        case ExitStatus.UNAVAILABLE                     : return 'UNAVAILABLE';
        case ExitStatus.SOFTWARE                        : return 'SOFTWARE';
        case ExitStatus.OSERR                           : return 'OSERR';
        case ExitStatus.OSFILE                          : return 'OSFILE';
        case ExitStatus.CANTCREAT                       : return 'CANTCREAT';
        case ExitStatus.IOERR                           : return 'IOERR';
        case ExitStatus.TEMPFAIL                        : return 'TEMPFAIL';
        case ExitStatus.PROTOCOL                        : return 'PROTOCOL';
        case ExitStatus.NOPERM                          : return 'NOPERM';
        case ExitStatus.CONFIG                          : return 'CONFIG';
        case ExitStatus.COMMAND_INVOKED_CANNOT_EXECUTE  : return 'COMMAND_INVOKED_CANNOT_EXECUTE';
        case ExitStatus.COMMAND_NOT_FOUND               : return 'COMMAND_NOT_FOUND';
        case ExitStatus.INVALID_ARGUMENT_TO_EXIT        : return 'INVALID_ARGUMENT_TO_EXIT';
        case ExitStatus.FATAL_SIGNAL_RANGE_START        : return 'FATAL_SIGNAL_RANGE_START';
        case ExitStatus.FATAL_SIGNAL_RANGE_END          : return 'FATAL_SIGNAL_RANGE_END';
        case ExitStatus.EXIT_STATUS_OUT_OF_RANGE        : return 'EXIT_STATUS_OUT_OF_RANGE';
        case ExitStatus.CONFLICT        : return 'CONFLICT';

    }

    throw new TypeError(`Unsupported RunnerExitStatus value: ${value}`);

}

/**
 *
 * @param value
 * @__PURE__
 * @nosideeffects
 */
export function parseRunnerExitStatus (value: any): ExitStatus | undefined {

    if (value === undefined) return undefined;

    if (isRunnerExitStatus(value)) return value;

    const valueString = `${value}`.toUpperCase();

    if (valueString.startsWith('FATAL_SIGNAL_')) {

        const int = parseInteger( value.substr(0, 'FATAL_SIGNAL_'.length) );

        if (int === undefined) return undefined;

        if ( int >= 0 && int < (ExitStatus.FATAL_SIGNAL_RANGE_END - ExitStatus.FATAL_SIGNAL_RANGE_START) ) {
            return int + ExitStatus.FATAL_SIGNAL_RANGE_START;
        } else {
            return undefined;
        }

    }

    switch (valueString) {

        case 'OK'                              : return ExitStatus.OK;
        case 'GENERAL_ERRORS'                  : return ExitStatus.GENERAL_ERRORS;
        case 'MISUSE_OF_SHELL_BUILTINS'        : return ExitStatus.MISUSE_OF_SHELL_BUILTINS;
        case 'ARGUMENT_PARSE_ERROR'            : return ExitStatus.ARGUMENT_PARSE_ERROR;
        case 'UNKNOWN_ARGUMENT'                : return ExitStatus.UNKNOWN_ARGUMENT;
        case 'UNIMPLEMENTED_FEATURE'           : return ExitStatus.UNIMPLEMENTED_FEATURE;
        case 'FATAL_ERROR'                     : return ExitStatus.FATAL_ERROR;
        case 'USAGE'                           : return ExitStatus.USAGE;
        case 'DATAERR'                         : return ExitStatus.DATAERR;
        case 'NOINPUT'                         : return ExitStatus.NOINPUT;
        case 'NOUSER'                          : return ExitStatus.NOUSER;
        case 'NOHOST'                          : return ExitStatus.NOHOST;
        case 'UNAVAILABLE'                     : return ExitStatus.UNAVAILABLE;
        case 'SOFTWARE'                        : return ExitStatus.SOFTWARE;
        case 'OSERR'                           : return ExitStatus.OSERR;
        case 'OSFILE'                          : return ExitStatus.OSFILE;
        case 'CANTCREAT'                       : return ExitStatus.CANTCREAT;
        case 'IOERR'                           : return ExitStatus.IOERR;
        case 'TEMPFAIL'                        : return ExitStatus.TEMPFAIL;
        case 'PROTOCOL'                        : return ExitStatus.PROTOCOL;
        case 'NOPERM'                          : return ExitStatus.NOPERM;
        case 'CONFIG'                          : return ExitStatus.CONFIG;
        case 'COMMAND_INVOKED_CANNOT_EXECUTE'  : return ExitStatus.COMMAND_INVOKED_CANNOT_EXECUTE;
        case 'COMMAND_NOT_FOUND'               : return ExitStatus.COMMAND_NOT_FOUND;
        case 'INVALID_ARGUMENT_TO_EXIT'        : return ExitStatus.INVALID_ARGUMENT_TO_EXIT;
        case 'FATAL_SIGNAL_RANGE_START'        : return ExitStatus.FATAL_SIGNAL_RANGE_START;
        case 'FATAL_SIGNAL_RANGE_END'          : return ExitStatus.FATAL_SIGNAL_RANGE_END;
        case 'EXIT_STATUS_OUT_OF_RANGE'        : return ExitStatus.EXIT_STATUS_OUT_OF_RANGE;
        case 'CONFLICT'        : return ExitStatus.CONFLICT;

        default:
            return undefined;

    }

}


