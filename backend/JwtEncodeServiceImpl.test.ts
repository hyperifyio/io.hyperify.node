// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { JwtEngine } from "../core/jwt/JwtEngine";
import { JwtEncodeServiceImpl } from './JwtEncodeServiceImpl';
import { sign as mockJwsSign, verify as mockJwsVerify } from 'jws';

jest.mock('jws', () => ({
    sign: jest.fn(),
    verify: jest.fn()
}));

describe('JwtEncodeService', () => {
    let service: JwtEncodeServiceImpl;
    const secret = 'secret';
    const defaultAlgorithm = 'HS256';

    beforeEach(() => {
        service = JwtEncodeServiceImpl.create();
    });

    describe('getDefaultAlgorithm', () => {
        it('should return the default algorithm', () => {
            expect(service.getDefaultAlgorithm()).toEqual(defaultAlgorithm);
        });
    });

    describe('setDefaultAlgorithm', () => {
        it('should set the default algorithm', () => {
            const newAlgorithm = 'RS256';
            service.setDefaultAlgorithm(newAlgorithm);
            expect(service.getDefaultAlgorithm()).toEqual(newAlgorithm);
        });
    });

    describe('createJwtEngine', () => {
        let engine : JwtEngine;

        beforeEach(() => {
            engine = service.createJwtEngine(secret);
        });

        it('should create a JwtEngine', () => {
            expect(engine).toBeTruthy();
        });

        describe('JwtEngine', () => {
            const payload = {
                aud: 'testAud',
                exp: 123456,
            };

            describe('getDefaultAlgorithm', () => {
                it('should return the default algorithm', () => {
                    expect(engine.getDefaultAlgorithm()).toEqual(defaultAlgorithm);
                });
            });

            describe('setDefaultAlgorithm', () => {
                it('should set the default algorithm', () => {
                    const newAlgorithm = 'RS256';
                    engine.setDefaultAlgorithm(newAlgorithm);
                    expect(engine.getDefaultAlgorithm()).toEqual(newAlgorithm);
                });
            });

            describe('sign', () => {

                it('should sign the payload with the secret and the default algorithm', () => {
                    (mockJwsSign as any).mockReturnValue('token');
                    const token = engine.sign(payload);
                    expect(mockJwsSign).toHaveBeenCalledWith({
                        header: { alg: defaultAlgorithm },
                        payload: payload,
                        secret: secret,
                    });
                    expect(token).toBeTruthy(); // replace with actual expected result
                });

                it('should sign the payload with the secret and a specified algorithm', () => {
                    (mockJwsSign as any).mockReturnValue('token');
                    const newAlgorithm = 'RS256';
                    const token = engine.sign(payload, newAlgorithm);
                    expect(mockJwsSign).toHaveBeenCalledWith({
                        header: { alg: newAlgorithm },
                        payload: payload,
                        secret: secret,
                    });
                    expect(token).toBeTruthy(); // replace with actual expected result
                });

            });

            describe('verify', () => {
                const token = 'mockToken'; // replace with actual mock token

                it('should verify the token with the secret and the default algorithm', () => {
                    (mockJwsVerify as any).mockReturnValue(true);
                    const result = engine.verify(token);
                    expect(mockJwsVerify).toHaveBeenCalledWith(token, defaultAlgorithm, secret);
                    expect(result).toBeTruthy(); // replace with actual expected result
                });

                it('should verify the token with the secret and a specified algorithm', () => {
                    (mockJwsVerify as any).mockReturnValue(true);
                    const newAlgorithm = 'RS256';
                    const result = engine.verify(token, newAlgorithm);
                    expect(mockJwsVerify).toHaveBeenCalledWith(token, newAlgorithm, secret);
                    expect(result).toBeTruthy(); // replace with actual expected result
                });

            });

        });

    });

});
