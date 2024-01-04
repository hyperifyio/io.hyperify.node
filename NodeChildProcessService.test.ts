// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import { NodeChildProcessService } from "./NodeChildProcessService";
import { LogLevel } from "../core/types/LogLevel";
import { ChildProcessService } from "../core/ChildProcessService";

describe('NodeChildProcessService', () => {

    let service : ChildProcessService;

    beforeEach( () => {
        NodeChildProcessService.setLogLevel(LogLevel.NONE);
        service = NodeChildProcessService.create();
    });

    afterEach( async () => {
        try {
            if (!service.isDestroyed()) {
                await service.shutdownChildProcesses();
                if (!service.isDestroyed()) {
                    service.destroy();
                }
            }
            service = undefined as unknown as NodeChildProcessService;
        } catch (err) {
            console.error(`AfterEach failed: `, err);
            throw err;
        }
    });

    describe('#destroy', () => {
        it('can destroy the service', async () => {
            expect.assertions(1);
            const sleepPromise = service.executeCommand('sleep', ['11']);
            service.destroy();
            try {
                await sleepPromise;
            } catch (err) {
                expect(`${err}`).toContain('Signal SIGTERM');
            }
        });
    });

    describe('#waitAllChildProcessesStopped', () => {
        it('can wait until all children are down', async () => {
            expect.assertions(2);
            const promise = service.executeCommand('sleep', ['12']);
            service.sendShutdownToChildProcesses();
            await service.waitAllChildProcessesStopped();
            try {
                await promise;
            } catch (err) {
                expect(`${err}`).toContain('Signal SIGTERM');
            }
            expect( await service.countChildProcesses() ).toBe(0);
        });
    });

    describe('#countChildProcesses', () => {
        it('can count running children', async () => {
            expect.assertions(3);
            expect( await service.countChildProcesses() ).toBe(0);
            const promise = service.executeCommand('ls');
            expect( await service.countChildProcesses() ).toBe(1);
            await promise;
            expect( await service.countChildProcesses() ).toBe(0);
        });
    });

    describe('#shutdownChildProcesses', () => {
        it('can shutdown child processes', async () => {
            expect.assertions(1);
            const promise = service.executeCommand('sleep', ['13']);
            await service.shutdownChildProcesses();
            try {
                await promise;
            } catch (err) {
                expect(`${err}`).toContain('Signal SIGTERM');
            }
        });
    });

    describe('#executeCommand', () => {
        it(`can execute 'ls' command`, async () => {
            expect.assertions(4);
            const result = await service.executeCommand('ls');
            expect(result).toBeDefined();
            expect(result.name).toBe('ls');
            expect(result.args).toStrictEqual([]);
            expect(result.output).toContain('README.md');
        });
    });

});
