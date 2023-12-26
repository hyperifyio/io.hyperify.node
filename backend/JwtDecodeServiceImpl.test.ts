// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import { decode as jwsDecode } from 'jws';
import { LogLevel } from "../core/types/LogLevel";
import { JwtDecodeServiceImpl } from "./JwtDecodeServiceImpl";

// Mock the 'jws' module
jest.mock('jws', () => ({
    decode: jest.fn(),
}));

beforeAll(() => {
    JwtDecodeServiceImpl.setLogLevel(LogLevel.NONE);
});

describe('JwtDecodeServiceImpl', () => {
    const mockToken = 'mock.token';
    const mockPayload = { aud: 'audience', sub: 'subject', verified: true };

    beforeEach(() => {
        // Set up the mock jws decode function to return our mock payload
        (jwsDecode as jest.Mock).mockReturnValue({
            payload: JSON.stringify(mockPayload)
        });
    });

    afterEach(() => {
        // Clear the mock after each test
        (jwsDecode as jest.Mock).mockClear();
    });

    test('decodePayload returns decoded payload', () => {
        const service = JwtDecodeServiceImpl.create();
        const result = service.decodePayload(mockToken);
        expect(result).toEqual(mockPayload);
        expect(jwsDecode).toHaveBeenCalledWith(mockToken);
    });

    test('decodePayloadAudience returns audience from payload', () => {
        const service = JwtDecodeServiceImpl.create();
        const result = service.decodePayloadAudience(mockToken);
        expect(result).toBe(mockPayload.aud);
    });

    test('decodePayloadSubject returns subject from payload', () => {
        const service = JwtDecodeServiceImpl.create();
        const result = service.decodePayloadSubject(mockToken);
        expect(result).toBe(mockPayload.sub);
    });

    test('decodePayloadVerified returns verified from payload', () => {
        const service = JwtDecodeServiceImpl.create();
        const result = service.decodePayloadVerified(mockToken);
        expect(result).toBe(mockPayload.verified);
    });

    test('decodePayloadAudience throws error if payload has no aud field', () => {
        (jwsDecode as jest.Mock).mockReturnValueOnce({
            payload: JSON.stringify({ sub: 'subject', verified: true })
        });

        const service = JwtDecodeServiceImpl.create();
        expect(() => service.decodePayloadAudience(mockToken)).toThrow(TypeError);
    });

    // More tests...
});
