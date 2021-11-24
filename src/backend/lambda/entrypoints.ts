import { LoggerManager } from '../../logger';

const log = LoggerManager.getLogger('aws.lambda.entrypoint');

export interface EventWithField {
    field: string;
};

/**
 * Returns a function meant to be exported from the lambda index. The function
 * inspect the `field` property from the request and search the given objects
 * for a method with that name.
 * @param targetApis - One or more object where to look for the method.
 * @returns
 */
export const createLambdaEntrypoint = (...targetApis: any[]) => {
    return async (event: EventWithField, ctx: any) => {
        let method: any;
        let object: any;
        for (const api of targetApis) {
            object = api;
            method = api[event.field];
            if (method)
                break;
        }

        log.debugEnabled() && log.debug(`Resolved method: ${method} from object ${object}`);
        if (!method)
            throw new Error(`Unknown API (field), unable to resolve "${event.field}"`);
        try {
            const result = await method.apply(object, [event, ctx]);

            log.debugEnabled() && console.log('Method successfully executed', result);
            return result;
        } catch (err) {
            log.debugEnabled() && console.log('Got an error from method', err);
            throw err;
        }
    };
};
