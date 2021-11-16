
export type AdditionCheckFn = (obj: any) => boolean;


/**
 * Check that `target` object has a member named `name`. If the member
 * is available calls the extraCheck function passing the member value.
 * @param target - The object to inspect.
 * @param name - The name of the property to inspect.
 * @param extraCheck - A callback invoked if the member is available on the object. It will receive the value
 * as first argument.
 * @returns `true` if the member exists.
 */
export const hasMember = (obj: any, name: string, extraCheck?: AdditionCheckFn) => {
    if (name in obj)
        return extraCheck ? extraCheck(obj[name]) : true;
    return false;
};

export const isFunction = (obj: any): obj is Function => typeof obj === 'function';

/**
 * Check that `target` object has a method (a function member) named `name`
 * @param obj -
 * @param name -
 * @returns `true` if the method exists.
 */
export const hasMethod = (obj: any, name: string) => {
    return hasMember(obj, name, isFunction);
};
