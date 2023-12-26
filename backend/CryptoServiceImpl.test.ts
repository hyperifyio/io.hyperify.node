// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import { randomInt } from "crypto";
import { CryptoService } from "../core/crypto/CryptoService";
import { CryptoServiceImpl } from "./CryptoServiceImpl";

jest.mock('crypto', () => ({
    randomInt: jest.fn()
}));

describe('CryptoServiceImpl', () => {

    describe('createRandomInteger', () => {
        it('should throw error if size is less than or equal to 0', () => {
            const size = 0;
            expect(() => {
                CryptoServiceImpl.createRandomInteger(size)
            }).toThrow(`CryptoService.createRandomNumberString: size must be over 0: ${size} provided`);
        });

        it('should return random integer for given size', () => {
            const size = 2;
            const expectedValue = 43;
            (randomInt as jest.Mock).mockReturnValueOnce(expectedValue);
            const result = CryptoServiceImpl.createRandomInteger(size);
            expect(result).toEqual(expectedValue);
            expect(randomInt).toHaveBeenCalledWith(0, Math.pow(10, size) - 1);
        });
    });

    describe('createRandomIntegerString', () => {
        it('should return random integer string for given size', () => {
            const size = 2;
            const intValue = 7;
            const expectedValue = "07";
            jest.spyOn(CryptoServiceImpl, 'createRandomInteger').mockReturnValueOnce(intValue);
            const result = CryptoServiceImpl.createRandomIntegerString(size);
            expect(result).toEqual(expectedValue);
        });
    });

    describe('instance methods', () => {
        let service: CryptoService;

        beforeEach(() => {
            service = CryptoServiceImpl.create();
        });

        it('should call static createRandomInteger method', () => {
            const size = 2;
            const expectedValue = 43;
            jest.spyOn(CryptoServiceImpl, 'createRandomInteger').mockReturnValueOnce(expectedValue);
            const result = service.createRandomInteger(size);
            expect(result).toEqual(expectedValue);
            expect(CryptoServiceImpl.createRandomInteger).toHaveBeenCalledWith(size);
        });

        it('should call static createRandomIntegerString method', () => {
            const size = 2;
            const expectedValue = "07";
            jest.spyOn(CryptoServiceImpl, 'createRandomIntegerString').mockReturnValueOnce(expectedValue);
            const result = service.createRandomIntegerString(size);
            expect(result).toEqual(expectedValue);
            expect(CryptoServiceImpl.createRandomIntegerString).toHaveBeenCalledWith(size);
        });
    });

});
