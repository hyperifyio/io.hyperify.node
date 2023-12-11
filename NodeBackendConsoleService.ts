// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { BackendConsoleService } from "./BackendConsoleService";
import { Interface, createInterface } from "node:readline/promises"; // "promises" version only supported in NodeJS v17 and up
import { split } from "../core/functions/split";
import { trim } from "../core/functions/trim";
import { LogService } from "../core/LogService";

const LOG = LogService.createLogger('NodeBackendConsoleService');

export abstract class NodeBackendConsoleService implements BackendConsoleService {

    private readonly _input        : NodeJS.ReadableStream;
    private readonly _output       : NodeJS.WritableStream;
    private readonly _prompt       : string;
    private readonly _exitCommands : readonly string[];

    private _rl     : Interface | undefined;

    protected constructor (
        input         : NodeJS.ReadableStream,
        output        : NodeJS.WritableStream,
        prompt        : string = 'api# ',
        exitCommands  : string[] = ['exit', 'quit']
    ) {
        this._input = input;
        this._output = output;
        this._prompt = prompt;
        this._exitCommands = exitCommands ?? ['exit', 'quit'];
    }

    public async run () : Promise<void> {
        if (this._rl) throw new TypeError('Service already running');
        this._rl = createInterface({ input: this._input, output: this._output });
        let command : string = '';
        while ( !this._exitCommands.includes(command) ) {
            const line = await this._rl.question(this._prompt);
            const args = split(trim(line), / +/).map(trim);
            command = args.shift() ?? '';
            try {
                await this.execute(command, args);
            } catch (err) {
                LOG.error(`Error: `, err);
            }
        }
    }

    public stop (): void {
        if (this._rl) {
            this._rl.close();
            this._rl = undefined;
        }
    }

    public destroy (): void {
        this.stop();
    }

    abstract execute (command: string, args: readonly string[]) : Promise<void>;

}
