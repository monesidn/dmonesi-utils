import { hasMethod } from './members';

/**
 * Type guard to check whatever the given object is a Promise object.
 * This method checks if the object expose the `then`, `catch`, and `finally` methods.
 * @param obj - The object to check.
 * @returns
 */
export const isPromise = (obj: any): obj is Promise<any> => {
    return hasMethod(obj, 'then') && hasMethod(obj, 'catch') && hasMethod(obj, 'finally');
};

/**
 * Check if the given object is a promise. If so returns it otherwise wraps it into a resolved
 * Promise.
 * @param obj - The object to return or wrap.
 * @returns
 */
export const toPromise = <T>(obj: T | Promise<T>): Promise<any> => {
    if (isPromise(obj)) {
        return obj;
    }
    return Promise.resolve(obj);
};
