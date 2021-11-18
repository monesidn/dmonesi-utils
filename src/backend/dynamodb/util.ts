import { AttributeValue } from '@aws-sdk/client-dynamodb';


export type DynamoDBRecord = Record<string, AttributeValue>;


/**
 * Transform a plain value to a DynamoDB JSON object.
 * @param value - The value to wrap
 * @returns A javascript object which is the wrapped value representation.
 */
export function toDynamoDBJson(value: null): AttributeValue.NULLMember
export function toDynamoDBJson(value: boolean): AttributeValue.BOOLMember
export function toDynamoDBJson(value: string): AttributeValue.SMember
export function toDynamoDBJson(value: number): AttributeValue.NMember
export function toDynamoDBJson(value: object): Record<string, AttributeValue>
export function toDynamoDBJson(value: undefined): undefined
export function toDynamoDBJson(value: any) {
    if (!value)
        return undefined;

    if (value === null)
        return { 'NULL': true };
    if (typeof value === 'string')
        return { 'S': value };
    if (typeof value === 'number')
        return { 'N': ''+value };
    if (typeof value === 'boolean')
        return { 'BOOL': value };

    if (typeof value === 'object') {
        const result: Record<string, AttributeValue> = {};
        for (const p of Object.keys(value)) {
            result[p] = toDynamoDBJson(value[p]);
        }
        return result;
    }
};

/**
 * Unwraps a single DynamoDB value.
 * @param value - The wrapped value.
 * @returns The unwrapped value as a javascript value.
 */
exports.unwrapDynamoDBValue = (value: any) => {
    if (!value)
        return undefined;

    if (value.NULL === true)
        return true;
    if (value.S)
        return value.S;
    if (value.N)
        return +value.N;
    if (value.B)
        return !!value.B;

    throw new Error(`Don't know how to unwrap DynamoDB value ${JSON.stringify(value)}`);
};

/**
 * Unwraps a DynamoDB composite object.
 * @param value - The DynamoDB json.
 * @returns A Javascript object.
 */
exports.unwrapDynamoDBJson = (value: any) => {
    if (!value)
        return undefined;

    const result: Record<string, any> = {};
    for (const i of Object.keys(value)) {
        result[i] = exports.unwrapDynamoDBValue(value[i]);
    }
    return result;
};

/**
 * Utility method to assemble a DynamoDB update document.
 * @param updateObject - An object holding the values that needs to be updated.
 * @param ownerId - Optional convenience parameter which adds a condition on the ownerId attribute.
 * @returns An object containing fields that needs to be included in the document.
 */
exports.constructUpdate = (updateObject: Record<string, any>, ownerId?: string) => {
    const expressionBuilder = [];
    const conditionBuilder = [];
    const attributeValues: Record<string, any> = {};

    for (const key of Object.keys(updateObject)) {
        const value = updateObject[key];
        if (!value) continue;

        expressionBuilder.push(`${key} = :${key}`);
        attributeValues[`:${key}`] = exports.toDynamoDBJson(value);
    }

    if (ownerId) {
        attributeValues[`:ownerId`] = exports.toDynamoDBJson(ownerId);
        conditionBuilder.push('ownerId = :ownerId');
    }

    return {
        updateExpression: `SET ${expressionBuilder.join(', ')}`,
        conditionExpression: conditionBuilder.length ? conditionBuilder.join(' AND ') : undefined,
        values: attributeValues
    };
};
