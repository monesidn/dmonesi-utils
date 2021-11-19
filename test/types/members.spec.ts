import { hasMember, hasMethod } from '../../src/types';
import { describe, test, expect } from '@jest/globals';

describe('hasMember() - utility', () => {
    test('Works with existing ownProperties', () => {
        const item = { foo: 'bar' };

        expect(hasMember(item, 'foo')).toBe(true);
    });

    test('Works with non-existing property', () => {
        const item = { foo: 'bar' };

        expect(hasMember(item, 'foo2')).toBe(false);
    });

    test('Works with properties from prototype ', () => {
        const item = { foo: 'bar' };
        const item2 = {};
        (item2 as any).__proto__ = item;

        expect(hasMember(item2, 'foo')).toBe(true);
    });

    test('Works with properties having undefined as value', () => {
        const item = { foo: undefined };

        expect(hasMember(item, 'foo')).toBe(true);
    });
});

describe('hasMethod() - utility', () => {
    test('Works with own methods', () => {
        const item = { foo() { } };

        expect(hasMethod(item, 'foo')).toBe(true);
    });

    test('Works with non-esiting method', () => {
        const item = { foo() { } };

        expect(hasMethod(item, 'foo2')).toBe(false);
    });

    test('Works with methods from prototype ', () => {
        const item = { foo() { } };
        const item2 = {};
        (item2 as any).__proto__ = item;

        expect(hasMember(item2, 'foo')).toBe(true);
    });

    test('Works with es6 class', () => {
        class TestClass {
            foo() {

            }
        }

        expect(hasMember(new TestClass(), 'foo')).toBe(true);
    });

    test('Works with es6 class hierarchy', () => {
        class TestClass {
            foo() {

            }
        }

        class TestClass2 extends TestClass {
        }

        expect(hasMember(new TestClass2(), 'foo')).toBe(true);
    });
});
