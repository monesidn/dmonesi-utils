
/**
 * Creates a lazy value. A lazy value is initialized (by calling the
 * provided generator) the first time it is used. Use this wrapper to
 * save computation for values that are not always used.
 * @param generator - A function responsible for providing the value when it will be needed.
 * @returns A function that when invoked returns the generated value.
 */
export const lazyValue = <T>(generator: () => T) => {
    let item: T | undefined = undefined;
    return () => {
        if (!item)
            item = generator();
        return item;
    };
};
