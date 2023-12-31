
// Hijack require for TypeScript ES2020 interop
import { Module } from 'module';

const {require: oldRequire} = Module.prototype;

// @ts-ignore
Module.prototype.require = function hijacked (file: string) {
    // console.debug(`Loading 2: "${file}"`);
    // noinspection JSVoidFunctionReturnValueUsed
    const result = oldRequire.apply(this, [file]);
    return result?.default ?? result;
};
