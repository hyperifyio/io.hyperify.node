// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { ChildProcess, SerializationType, spawn, SpawnOptions, StdioOptions } from "child_process";

import { filter } from "../core/functions/filter";
import { map } from "../core/functions/map";
import { forEach } from "../core/functions/forEach";
import { LogService } from "../core/LogService";
import { LogLevel } from "../core/types/LogLevel";
import { isNumber, parseInteger } from "../core/types/Number";
import { ChildProcessService, CommandOptions, CommandResponse } from "../core/ChildProcessService";
import { ChildProcessError, isChildProcessError } from "../core/types/ChildProcessError";

const LOG = LogService.createLogger('NodeChildProcessService');

interface StoredChild {
    readonly name : string,
    readonly args : readonly string[],
    child ?: ChildProcess;
    stdout : Buffer[];
    stderr : Buffer[];
    pid: number | undefined;
    abort: boolean;
    running: boolean;
    streamsOpen: boolean;
    initializing: boolean;
    exitCode ?: number | null;
    exitSignal ?: number | string | null;
    killSignal ?: number | string;
    promise ?: Promise<CommandResponse>;
}

/**
 * Implementation to run child processes in the system using NodeJS APIs.
 *
 * @see {@link ChildProcessService}
 */
export class NodeChildProcessService implements ChildProcessService {

    /**
     * Set service log level
     * @param level
     */
    public static setLogLevel (level: LogLevel) : void {
        LOG.setLogLevel(level);
    }

    /**
     * Array of any started child processes
     */
    private _children : StoredChild[];

    private _destroyed : boolean;

    /**
     * Construct the service
     */
    protected constructor () {
        this._destroyed = false;
        this._children = [];
    }

    public static create () : ChildProcessService {
        return new NodeChildProcessService();
    }

    public isDestroyed () : boolean {
        return this._destroyed;
    }

    /**
     * @see {@link ChildProcessService.destroy}
     * @inheritdoc
     */
    public destroy () : void {
        if (!this._destroyed) {
            this._destroyed = true;
            LOG.debug(`destroying ${this._children?.length} children: ${map(this._children, item => item?.child?.pid).join(', ')}`);
            this._shutdownChildProcesses().catch((err: any) => {
                LOG.error(`Error happened when shutting down the service: `, err);
            });
        } else {
            LOG.warn(`The service was already destroyed.`);
        }
    }

    /**
     * @see {@link ChildProcessService.countRunningChildren}
     * @inheritdoc
     */
    public async countChildProcesses () : Promise<number> {
        LOG.debug(`countChildProcesses: ${this._children?.length}: ${map(this._children, item => item?.child?.pid).join(', ')}`);
        return this._children.length;
    }

    /**
     * @see {@link ChildProcessService.waitUntilDown}
     * @inheritdoc
     */
    public async waitAllChildProcessesStopped () : Promise<void> {

        if (this._children?.length) {
            LOG.debug(`start: waitAllChildProcessesStopped: ${map(this._children, item => item?.child?.pid).join(', ')}`);
            // Collect children's promises
            const children = this._children;
            const promises : Promise<void>[] = map(
                children,
                async (item : StoredChild) : Promise<void> => {
                    try {
                        if (item.promise) {
                            await item.promise;
                        }
                    } catch (err) {
                        if (isChildProcessError(err) && err.signal === (item.killSignal ?? 'SIGTERM')) {
                            const { name, pid, running, abort, initializing, streamsOpen, exitSignal, exitCode } = item;
                            LOG.debug(`Child #${pid} (name=${name}, running=${running}, initializing=${initializing}, abort=${abort}, streamsOpen=${streamsOpen}, exitCode=${exitCode}, exitSignal=${exitSignal}) successfully shutdown with signal ${err.signal}`);
                        } else {
                            const { name, pid, running, abort, initializing, streamsOpen, exitSignal, exitCode } = item;
                            LOG.debug(`Child #${pid} (name=${name}, running=${running}, initializing=${initializing}, abort=${abort}, streamsOpen=${streamsOpen}, exitCode=${exitCode}, exitSignal=${exitSignal}) failed to shutdown: `, err);
                        }
                    }
                }
            );
            LOG.debug(`Waiting for ${promises.length} children to shutdown: ${map(this._children, item => item?.child?.pid).join(', ')}`);
            // Wait for the children to shut down
            await Promise.allSettled(promises);
            LOG.debug(`end: waitAllChildProcessesStopped: ${map(this._children, item => item?.child?.pid).join(', ')}`);

            const count = this._children?.length ?? 0;
            if (count) {
                LOG.warn(`Warning! ${count} children detected at the end of waitAllChildProcessesStopped(): ${map(this._children, item => item?.child?.pid).join(', ')}`);
            }
        } else {
            LOG.debug(`waitAllChildProcessesStopped: No children detected.`);
        }

    }

    /**
     * @see {@link ChildProcessService.shutdown}
     * @inheritdoc
     */
    /** @inheritdoc */
    public async shutdownChildProcesses () : Promise<void> {
        if (this._destroyed) throw new TypeError(`shutdownChildProcesses: Service already destroyed`);
        await this._shutdownChildProcesses();
    }

    private async _shutdownChildProcesses () : Promise<void> {
        LOG.debug(`start: shutdownChildProcesses: `, this._children);
        this._sendShutdownToChildProcesses();
        await this.waitAllChildProcessesStopped();
        LOG.debug(`end: shutdownChildProcesses: `, this._children);
    }

    /**
     * @see {@link ChildProcessService.executeCommand}
     * @inheritdoc
     */
    public async executeCommand (
        name  : string,
        args ?: readonly string[],
        opts ?: CommandOptions
    ) : Promise<CommandResponse> {
        if (this._destroyed) throw new TypeError(`The service has been destroyed`);
        LOG.debug(`start: executeCommand: `, name, args, opts, `Running: ${map(this._children, item => item?.child?.pid).join(', ')}`);
        const p = await this._execFile(name, args, opts);
        LOG.debug(`end: executeCommand: `, name, args, opts, `Running: ${map(this._children, item => item?.child?.pid).join(', ')}`);
        return p;
    }

    /**
     *
     * @param name
     * @param args
     * @param opts
     * @private
     */
    private async _execFile (
        name  : string,
        args ?: readonly string[],
        opts ?: CommandOptions
    ) : Promise<CommandResponse> {

        if (this._destroyed) throw new TypeError(`_execFile: Service already destroyed`);

        LOG.debug(`_execFile: `, name, args, opts, `Running: ${map(this._children, item => item?.child?.pid).join(', ')}`);
        if (!args) args = [];
        if (!opts) opts = {};

        const {
            cwd,
            env,
            argv0,
            serialization,
            timeout,
            uid,
            gid,
            killSignal,
            stdio,
            detached
        } = opts;

        const storedItem : StoredChild = {
            name,
            args,
            pid: undefined,
            abort: false,
            initializing: true,
            streamsOpen: false,
            running: false,
            child: undefined,
            stdout: [],
            stderr: [],
            killSignal
        };
        this._children.push(storedItem);

        const nodeOpts : SpawnOptions = {
            ...(cwd !== undefined ? staticSpawnOptionsTypeGuard({cwd}) : {}),
            ...(env !== undefined ? staticSpawnOptionsTypeGuard({env}) : {}),
            ...(argv0 !== undefined ? staticSpawnOptionsTypeGuard({argv0}) : {}),
            ...(serialization !== undefined ? staticSpawnOptionsTypeGuard({serialization: serialization as SerializationType}) : {}),
            ...(detached !== undefined ? staticSpawnOptionsTypeGuard({detached}) : {}),
            ...(timeout !== undefined ? staticSpawnOptionsTypeGuard({timeout}) : {}),
            ...(uid !== undefined ? staticSpawnOptionsTypeGuard({uid}) : {}),
            ...(gid !== undefined ? staticSpawnOptionsTypeGuard({gid}) : {}),
            ...(stdio !== undefined ? staticSpawnOptionsTypeGuard({stdio: stdio as StdioOptions}) : {}),
            ...(killSignal !== undefined ? staticSpawnOptionsTypeGuard({killSignal: killSignal as NodeJS.Signals|number}) : {}),
        };

        return storedItem.promise = new Promise<CommandResponse>(
            (resolve, reject) => {
                try {
                    if ( this._destroyed ) {
                        reject(new TypeError(`Service destroyed`));
                        storedItem.promise = undefined;
                        return;
                    }

                    if ( storedItem?.child ) {
                        reject(new TypeError(`Child is already created`));
                        storedItem.promise = undefined;
                        return;
                    }

                    storedItem.running = false;
                    storedItem.streamsOpen = false;
                    const child: ChildProcess = spawn(name, args ?? [], nodeOpts);
                    storedItem.child = child;
                    storedItem.pid = child?.pid;

                    child.on('spawn', () => {
                        storedItem.initializing = false;
                        storedItem.running = true;
                        storedItem.streamsOpen = true;
                        if (storedItem.pid === undefined) {
                            storedItem.pid = child?.pid;
                        }

                        if (storedItem.abort) {
                            storedItem.abort = false;
                            this._stopChild(storedItem);
                        }

                    });

                    child.on('error', (error: any) => {
                        if ( storedItem.running ) {
                            LOG.warn(`Unexpected error: `, error);
                            if (error) {
                                reject(error);
                            } else {
                                reject(new TypeError(`Event "error" without error information detected`));
                            }
                        } else {
                            LOG.warn(`The child process could not be spawned: `, error);
                        }
                    });

                    if ( child.stdout ) {
                        child.stdout.on('data', (chunk: Buffer) => {
                            if ( this._destroyed ) {
                                LOG.debug(`Event 'data': Service already destroyed; stdout data ignored.`);
                                return;
                            }

                            const { child, running, streamsOpen, initializing } = storedItem;
                            const pid = child?.pid;
                            LOG.debug(`stdout data on: child #${pid}, running=${running}, streamsOpen=${streamsOpen}, initializing=${initializing}`);
                            storedItem.stdout.push(chunk);
                        });
                    }

                    if ( child.stderr ) {
                        child.stderr.on('data', (chunk: Buffer) => {
                            if ( this._destroyed ) {
                                LOG.debug(`Event 'data' on stderr: Service already destroyed; stderr data ignored.`);
                                return;
                            }
                            const { child, running, streamsOpen, initializing } = storedItem;
                            const pid = child?.pid;
                            LOG.debug(`stderr data on: child #${pid}, running=${running}, streamsOpen=${streamsOpen}, initializing=${initializing}`);
                            storedItem.stderr.push(chunk);
                        });
                    }

                    child.on('exit', (code, signal) => {
                        storedItem.running = false;
                        storedItem.exitCode = code;
                        storedItem.exitSignal = signal;
                    });

                    child.on('close', () => {
                        storedItem.running = false;
                        storedItem.streamsOpen = false;
                        if ( this._destroyed ) {
                            const { child, running, streamsOpen, initializing } = storedItem;
                            const pid = child?.pid;
                            LOG.debug(`close on destroyed service item: child #${pid}, running=${running}, streamsOpen=${streamsOpen}, initializing=${initializing}`);
                        } else {
                            const { child, running, streamsOpen, initializing } = storedItem;
                            const pid = child?.pid;
                            LOG.debug(`close on item: child #${pid}, running=${running}, streamsOpen=${streamsOpen}, initializing=${initializing}`);
                        }
                        this._onStoredChildClose(
                            name,
                            args ?? [],
                            storedItem,
                            parseInteger(storedItem.exitCode) ?? parseInteger(child.exitCode) ?? undefined,
                            storedItem.exitSignal ?? child.signalCode ?? undefined
                        ).then((value) => {
                            resolve(value);
                            storedItem.promise = undefined;
                        }, (err: any) => {
                            reject(err);
                            storedItem.promise = undefined;
                        });
                    });

                } catch (err) {
                    LOG.warn(`Exception handled from command "${name}${args?.length ? ' ' : ''}${(args ?? []).join(' ')}": `, err);
                    reject(new ChildProcessError(name, args ?? [], -4));
                    storedItem.promise = undefined;
                }
            }
        );
    }

    public sendShutdownToChildProcesses () : void {
        if (this._destroyed) throw new TypeError(`sendShutdownToChildProcesses: Service already destroyed`);
        return this._sendShutdownToChildProcesses();
    }

    /**
     * Send kill signals to all children
     *
     * @private
     */
    private _sendShutdownToChildProcesses () : void {
        const children = this._children;
        LOG.debug(`Sending shutdown to ${children.length} children: ${map(this._children, item => item?.child?.pid).join(', ')}`);
        forEach(
            children,
            (item: StoredChild) : void => {
                try {
                    const { child, initializing, abort } = item;
                    LOG.debug(`#${child?.pid}: initializing=${initializing}, abort=${abort}`)
                    if ( initializing ) {
                        if (!abort) {
                            LOG.debug(`The child #${child?.pid} will be aborted later`);
                            item.abort = true;
                        } else {
                            LOG.debug(`The child #${child?.pid} was already aborting later`);
                        }
                    } else {
                        this._stopChild(item);
                    }
                } catch (err) {
                    LOG.warn(`Warning! Could not send shutdown signal to child: `, err);
                }
            }
        );
    }

    private _stopChild (
        item: StoredChild
    ) {
        const { child, killSignal, running } = item;
        LOG.debug(`#${child?.pid}: killSignal=${killSignal}, running=${running}`)
        if ( child && running ) {
            LOG.debug(`Sending ${killSignal??'default signal'} to child #${child?.pid}`);
            let status : boolean;
            if (killSignal) {
                status = child.kill(killSignal as number|NodeJS.Signals);
            } else {
                status = child.kill();
            }
            if (!status) {
                LOG.warn(`Warning! Could not signal child process ${child?.pid} to stop`);
            }
        } else {
            if (!child) LOG.warn(`Warning! The child was not yet created`);
            else if (!running) LOG.warn(`Warning! The child #${child?.pid} was not running`);
        }
    }

    private async _onStoredChildClose (
        name: string,
        args: readonly string[],
        storedItem: StoredChild,
        exitCode   ?: number,
        signalCode ?: string | number
    ) : Promise<CommandResponse> {
        const { child, running, streamsOpen, initializing } = storedItem;
        const pid = child?.pid;
        LOG.debug(`_onStoredChildClose on child #${pid}, running=${running}, streamsOpen=${streamsOpen}, initializing=${initializing}`);
        const stderr : string = Buffer.concat(storedItem.stderr).toString('utf8');
        const stdout : string = Buffer.concat(storedItem.stdout).toString('utf8');
        try {
            return await this._onChildProcessClose(name, args, exitCode, signalCode, stdout, stderr);
        } catch (err) {
            if (isChildProcessError(err)) {
                throw err;
            }
            LOG.warn(`Unexpected exception handled: "${name} ${(args??[]).join(' ')}": `, err);
            throw new ChildProcessError(name, args ?? [], -3, undefined, stderr);
        } finally {
            try {
                // Remove child from running children if found
                if (storedItem) {
                    this._children = filter(this._children, (item) => item !== storedItem);
                    storedItem.child = undefined;
                    storedItem.killSignal = undefined;
                }
            } catch (err) {
                LOG.warn(`Error when removing the child from internal array: `, err);
            }
        }
    }

    private async _onChildProcessClose (
        name        : string,
        args        : readonly string[],
        exitCode   ?: number,
        signalCode ?: string | number,
        stdout     ?: string,
        stderr     ?: string
    ) : Promise<CommandResponse> {

        if ( signalCode !== undefined ) {
            LOG.debug(`Command failed: "${name}${args?.length?' ':''}${(args??[]).join(' ')}": Signal received: ${signalCode}: `, stdout, stderr);
            throw new ChildProcessError(name, args ?? [], -2, signalCode as string|number, stderr);
        }

        if ( exitCode !== undefined && exitCode !== 0 ) {
            const status = isNumber(exitCode) ? exitCode : -1;

            if (status >= 0) {
                LOG.debug(`Command failed: "${name}${args?.length?' ':''}${(args??[]).join(' ')}": Exit code: ${status}: `, stdout, stderr);
                throw new ChildProcessError(name, args ?? [], status, undefined, stderr);
            }

            LOG.debug(`Command failed: "${name}${args?.length?' ':''}${(args??[]).join(' ')}": `, stdout, stderr);
            throw new ChildProcessError(name, args ?? [], status, undefined, stderr);
        }

        LOG.debug(`Command succeed: "${name}${args?.length?' ':''}${(args??[]).join(' ')}": `, stdout, stderr);
        return {
            name,
            args,
            output: stdout ?? '',
            ...(stderr ? {errors: stderr} : {})
        };
    }

}

function staticSpawnOptionsTypeGuard (
    value: SpawnOptions
) : SpawnOptions {
    return value;
}
