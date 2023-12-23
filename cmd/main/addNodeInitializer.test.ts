// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { jest } from '@jest/globals';
import { addNodeInitializer } from './addNodeInitializer';
import { HgNode } from "../../HgNode";
import { LogLevel } from "../../../core/types/LogLevel";

jest.mock('../../HgNode', () => ({
    HgNode: {
        initialize: jest.fn()
    }
}));

describe('addNodeInitializer', () => {

    beforeEach(() => {
        addNodeInitializer.setLogLevel(LogLevel.NONE);

        jest.clearAllMocks();
    });

    it('initializes HgNode before executing method', async () => {
        class MyApp {
            @addNodeInitializer()
            public static async run (args: string[] = []) {
                return "Hello world args="+args.join(',');
            }
        }

        // Execute the method
        const result = await MyApp.run([]);

        // Assert HgNode.initialize was called
        expect(HgNode.initialize).toHaveBeenCalledTimes(1);

        // Assert method returned the expected result
        expect(result).toEqual("Hello world args=");
    });

    it('throws the error and logs a warning when an error occurs in the method', async () => {
        const err = new Error('Error in run method');
        class MyApp {
            @addNodeInitializer()
            public static async run (
                // @ts-ignore
                args: string[] = []
            ) {
                throw err;
            }
        }

        // Assert that the method throws the error
        await expect(MyApp.run([])).rejects.toThrow(err);

        // Assert HgNode.initialize was called
        expect(HgNode.initialize).toHaveBeenCalledTimes(1);
    });

});
