import { AttributeValue } from '@aws-sdk/client-dynamodb';

/**
 * Transform a Javascript value into a DynamoDB AttributeValue. This method
 * covers most common type conversion. Some types have a dedicated method
 * to handle them.
 * @param value - The value to transform
 * @returns A DynamoDB AttributeValue object.
 */
export function toDynamoDBValue(value: boolean): AttributeValue.BOOLMember
export function toDynamoDBValue(value: object): AttributeValue.MMember
export function toDynamoDBValue(value: number): AttributeValue.NMember
export function toDynamoDBValue(value: null): AttributeValue.NULLMember
export function toDynamoDBValue(value: string): AttributeValue.SMember
export function toDynamoDBValue(value: undefined): undefined
export function toDynamoDBValue(value: any): AttributeValue | undefined {
    if (!value)
        return undefined;

    if (typeof value === 'boolean')
        return { 'BOOL': value };
    if (typeof value === 'object') {
        const result: Record<string, AttributeValue> = {};
        for (const p of Object.keys(value)) {
            result[p] = toDynamoDBValue(value[p]);
        }
        return { 'M': result };
    }
    if (typeof value === 'number')
        return { 'N': ''+value };
    if (value === null)
        return { 'NULL': true };
    if (typeof value === 'string')
        return { 'S': value };
};


/**
 * Transform a Javascript array into a list DynamoDB AttributeValue.
 * @param value - The array to transform
 * @returns A DynamoDB AttributeValue object.
 */
export function toDynamoDBList(items: any[]): AttributeValue.LMember
export function toDynamoDBList(value: undefined): undefined
export function toDynamoDBList(items: any[] | undefined): AttributeValue.LMember | undefined {
    if (!items)
        return undefined;

    return { 'L': items.map((i) => toDynamoDBValue(i)) };
}

/**
 * Transform a Javascript array into a DynamoDB Number or String Set AttributeValue.
 * The resulting type depends on the type of elements in the array. If array is empty
 * defaults to SS.
 * @param value - The array to transform
 * @returns A DynamoDB AttributeValue object.
 */
export function toDynamoDBSet(items: string[]): AttributeValue.SSMember
export function toDynamoDBSet(items: number[]): AttributeValue.NSMember
export function toDynamoDBSet(value: undefined): undefined
export function toDynamoDBSet(items: any[] | undefined): AttributeValue | undefined {
    if (!items)
        return undefined;

    if (items.length === 0) {
        return { 'SS': [] };
    }

    if (typeof items[0] === 'string') {
        return { 'SS': items as string[] };
    } else {
        return { 'NS': items.map((i) => '' + i) };
    }
}
