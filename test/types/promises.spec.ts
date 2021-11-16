import { isPromise, toPromise } from '../src/promises';
import { describe, test, expect } from '@jest/globals';

describe('isPromise() - utility', () => {
    test('Positive test', () => {
        const p = Promise.resolve();
        expect(isPromise(p)).toBe(true);
    });

    test('Negative test', () => {
        const item = { };
        expect(isPromise(item)).toBe(false);
    });
});

describe('toPromise() - utility', () => {
    test('Doesn\'t wrap a promise', () => {
        const p = Promise.resolve();
        expect(toPromise(p) === p).toBe(true);
    });

    test('Works with non-esiting method', () => {
        const item = { };
        expect(isPromise(toPromise(item))).toBe(true);
    });
});
