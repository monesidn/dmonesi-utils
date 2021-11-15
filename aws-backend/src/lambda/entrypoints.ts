import loggerManager from 'dmonesi-utils.quick-logger';

const log = loggerManager.getLogger('aws.lambda.entrypoint');

export interface EventWithField {
    field: string;
};

export const createLambdaEntrypoint = (targetApi: any) => {
    return async (event: EventWithField, ctx: any) => {
        const method = targetApi[event.field];
        log.debugEnabled() && console.log('Resolved method:', method);
        if (!method)
            throw new Error(`Unknown API (field), unable to resolve "${event.field}"`);
        try {
            const result = await method.apply(targetApi, [event, ctx]);

            log.debugEnabled() && console.log('Method successfully executed', result);
            return result;
        } catch (err) {
            log.debugEnabled() && console.log('Got an error from method', err);
            throw err;
        }
    };
};
