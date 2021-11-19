import { AttributeValue } from '@aws-sdk/client-dynamodb';


export function fromDynamoDBType(value: AttributeValue.BOOLMember) : boolean
export function fromDynamoDBType(value: AttributeValue.MMember) : Record<string, any>
export function fromDynamoDBType(value: AttributeValue.NMember) : number
export function fromDynamoDBType(value: AttributeValue.SMember) : string
export function fromDynamoDBType(value: AttributeValue.NULLMember) : null
export function fromDynamoDBType(value: undefined) : undefined
export function fromDynamoDBType(value: AttributeValue.LMember) : any[]
export function fromDynamoDBType(value: AttributeValue.SSMember) : string[]
export function fromDynamoDBType(value: AttributeValue.NSMember) : number[]
export function fromDynamoDBType(value: AttributeValue | undefined) : any {
    if (!value)
        return undefined;

    if (value.B)
        return !!value.B;
    if (value.M) {
        const result: Record<string, any> = {};
        for (const i of Object.keys(value.M)) {
            result[i] = fromDynamoDBType(value.M[i] as any);
        }
        return result;
    }
    if (value.N)
        return +value.N;
    if (value.S)
        return value.S;
    if (value.NULL === true)
        return true;
    if (value.L)
        return value.L.map((i) => fromDynamoDBType(i as any));
    if (value.SS)
        return value.SS;
    if (value.NS)
        return value.NS;


    throw new Error(`Don't know how to unwrap DynamoDB value ${JSON.stringify(value)}`);
}
