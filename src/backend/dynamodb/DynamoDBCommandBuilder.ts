import { AttributeValue, DeleteItemCommandInput, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { QueryCommandInput, UpdateItemCommandInput } from '@aws-sdk/client-dynamodb';
import { toDynamoDBList, toDynamoDBSet, toDynamoDBValue } from './toDynamoDBTypes';


export class DynamoDBCommandBuilder {
    table: string = '';
    index?: string;
    keyCriteria: Record<string, AttributeValue> = {};
    limit?: number;
    nextToken?: any;

    filterExpression: string[] = [];
    conditionExpression: string[] = [];
    updateExpression: string[] = [];

    attributeValues: Record<string, AttributeValue> = {};
    attributeNames: Record<string, string> = {};

    static onTable(table: string) {
        const builder = new DynamoDBCommandBuilder();
        builder.table = table;
        return builder;
    }

    private addToExpression(condition: string, expr: string[], operator: string) {
        if (expr.length > 0)
            condition = operator + ' ' + condition;
        expr.push(condition);
    }

    private addAttributeValue(name: string, value: AttributeValue) {
        if (!name.startsWith(':'))
            throw new Error(`Attribute values must start with ':'`);
        this.attributeValues[name] = value;
        return this;
    }

    private keyCriteriaToExpression() {
        const exprBuilder = [];
        const attributeValues: Record<string, AttributeValue> = {};
        const attributeNames: Record<string, string> = {};

        for (const key of Object.keys(this.keyCriteria)) {
            exprBuilder.push(`#${key} = :${key}`);
            attributeValues[`:${key}`] = this.keyCriteria[key];
            attributeNames[`#${key}`] = key;
        }

        return {
            expression: exprBuilder.join(' AND '),
            attributeValues,
            attributeNames
        };
    }

    private assembleExpression(expr: string[]) {
        return expr.join(' ');
    }

    havingKey(name: string, value: string | number | boolean | null) {
        this.keyCriteria[name] = toDynamoDBValue(value as any);
        return this;
    }

    addFilter(condition: string, operator = 'AND') {
        this.addToExpression(condition, this.filterExpression, operator);
        return this;
    }

    addCondition(condition: string, operator = 'AND') {
        this.addToExpression(condition, this.conditionExpression, operator);
        return this;
    }

    addUpdate(condition: string) {
        this.addToExpression(condition, this.updateExpression, '');
        return this;
    }

    withRawAttributeValue(name: string, value: AttributeValue) {
        this.addAttributeValue(name, value);
        return this;
    }

    withSimpleAttributeValue(name: string, value: any) {
        this.addAttributeValue(name, toDynamoDBValue(value));
        return this;
    }

    withListAttributeValue(name: string, value: any[]) {
        this.addAttributeValue(name, toDynamoDBList(value));
        return this;
    }

    withSetAttributeValue(name: string, value: any[]) {
        this.addAttributeValue(name, toDynamoDBSet(value));
        return this;
    }

    withAttributeName(name: string, value: string) {
        if (!name.startsWith('#'))
            throw new Error(`Attribute names must start with ':'`);
        this.attributeNames[name] = value;
        return this;
    }

    usingIndex(name: string) {
        this.index = name;
        return this;
    }

    withLimit(limit: number) {
        this.limit = limit;
        return this;
    }

    withNextToken(nextToken: any) {
        this.nextToken = nextToken;
        return this;
    }

    withVersionFilter(version: number) {
        this.addFilter('#version = :expectedVersion');
        this.withSimpleAttributeValue(':expectedVersion', version);
        this.withAttributeName('#version', 'version');
        return this;
    }

    havingVersion(version: number) {
        this.addCondition('#version = :version');
        this.withSimpleAttributeValue(':version', version);
        this.withAttributeName('#version', 'version');
        return this;
    }

    toUpdate(): UpdateItemCommandInput {
        return {
            TableName: this.table,
            Key: this.keyCriteria,
            UpdateExpression: this.assembleExpression(this.updateExpression),
            ConditionExpression: this.assembleExpression(this.conditionExpression),
            ExpressionAttributeValues: this.attributeValues,
            ExpressionAttributeNames: this.attributeNames
        };
    };

    toGetItem(): GetItemCommandInput {
        return {
            TableName: this.table,
            Key: this.keyCriteria
        };
    }

    toQuery(): QueryCommandInput {
        const { expression, attributeNames, attributeValues } = this.keyCriteriaToExpression();
        const result: QueryCommandInput = {
            TableName: this.table,
            KeyConditionExpression: expression,
            FilterExpression: this.assembleExpression(this.filterExpression),
            ExpressionAttributeValues: {
                ...this.attributeValues,
                ...attributeValues
            },
            ExpressionAttributeNames: {
                ...this.attributeNames,
                ...attributeNames
            },
            IndexName: (this.index || '')
        };

        if (this.limit)
            result.Limit = this.limit;

        if (this.nextToken)
            result.ExclusiveStartKey = this.nextToken;

        return result;
    }

    toDeleteItem(): DeleteItemCommandInput {
        return {
            TableName: this.table,
            Key: this.keyCriteria,
            ConditionExpression: this.assembleExpression(this.conditionExpression),
            ExpressionAttributeValues: this.attributeValues,
            ExpressionAttributeNames: this.attributeNames
        };
    }
}
