import { describe, test, expect } from '@jest/globals';
import { DynamoDBCommandBuilder } from '../../../src/backend/dynamodb';

const testTableName = 'TEST';

describe('GetItem commands', () => {
    test('Simple get', () => {
        const getItem = DynamoDBCommandBuilder
            .onTable(testTableName)
            .havingKey('id', 12345)
            .addFilter('foo = :bar')
            .withSimpleAttributeValue(':bar', 1234)
            .toGetItem();


        expect(getItem.TableName).toBe(testTableName);
        expect(getItem.Key).toBeDefined();
        expect(getItem.Key!['id']).toEqual({ 'N': '12345' });
        expect((getItem as any).FilterExpression).toBeUndefined();
        expect((getItem as any).ExpressionAttributeValues).toBeUndefined();
    });

    test('Composite key get', () => {
        const getItem = DynamoDBCommandBuilder
            .onTable(testTableName)
            .havingKey('id', 12345)
            .havingKey('id2', '123456')
            .addFilter('foo = :bar')
            .withSimpleAttributeValue(':bar', 1234)
            .toGetItem();


        expect(getItem.TableName).toBe(testTableName);
        expect(getItem.Key).toBeDefined();
        expect(getItem.Key!['id']).toEqual({ 'N': '12345' });
        expect(getItem.Key!['id2']).toEqual({ 'S': '123456' });
        expect((getItem as any).FilterExpression).toBeUndefined();
        expect((getItem as any).ExpressionAttributeValues).toBeUndefined();
    });
});


describe('Query commands', () => {
    test('Simple query', () => {
        const query = DynamoDBCommandBuilder
            .onTable(testTableName)
            .havingKey('id', 12345)
            .addFilter('foo = :bar')
            .withSimpleAttributeValue(':bar', 1234)
            .toQuery();


        expect(query.TableName).toBe(testTableName);
        expect(query.KeyConditionExpression).toBeDefined();
        expect(query.KeyConditionExpression).toEqual('#id = :id');
        expect(query.FilterExpression).toEqual('foo = :bar');
        expect(query.ExpressionAttributeValues).toEqual({
            ':id': { 'N': '12345' },
            ':bar': { 'N': '1234' }
        });
        expect(query.ExpressionAttributeNames).toEqual({
            '#id': 'id'
        });
    });

    test('Composite key query', () => {
        const query = DynamoDBCommandBuilder
            .onTable(testTableName)
            .havingKey('id', 12345)
            .havingKey('id2', '123456')
            .addFilter('foo = :bar')
            .withSimpleAttributeValue(':bar', 1234)
            .toQuery();


        expect(query.TableName).toBe(testTableName);
        expect(query.KeyConditionExpression).toBeDefined();
        expect(query.KeyConditionExpression).toEqual('#id = :id AND #id2 = :id2');
        expect(query.FilterExpression).toEqual('foo = :bar');
        expect(query.ExpressionAttributeValues).toEqual({
            ':id': { 'N': '12345' },
            ':id2': { 'S': '123456' },
            ':bar': { 'N': '1234' }
        });
        expect(query.ExpressionAttributeNames).toEqual({
            '#id': 'id',
            '#id2': 'id2'
        });
    });

    test('Simple query on secondary index', () => {
        const query = DynamoDBCommandBuilder
            .onTable(testTableName)
            .usingIndex('index2')
            .havingKey('id', 12345)
            .addFilter('foo = :bar')
            .withSimpleAttributeValue(':bar', 1234)
            .toQuery();


        expect(query.TableName).toBe(testTableName);
        expect(query.KeyConditionExpression).toBeDefined();
        expect(query.KeyConditionExpression).toEqual('#id = :id');
        expect(query.FilterExpression).toEqual('foo = :bar');
        expect(query.ExpressionAttributeValues).toEqual({
            ':id': { 'N': '12345' },
            ':bar': { 'N': '1234' }
        });
        expect(query.ExpressionAttributeNames).toEqual({
            '#id': 'id'
        });
        expect(query.IndexName).toBe('index2');
    });
});

describe('Update commands', () => {
    test('Simple update', () => {
        const update = DynamoDBCommandBuilder
            .onTable(testTableName)
            .havingKey('id', 12345)
            .addFilter('foo = :bar')
            .withSimpleAttributeValue(':bar', 1234)
            .addUpdate('foo = :bar2')
            .withSimpleAttributeValue(':bar2', 12345)
            .toUpdate();


        expect(update.TableName).toBe(testTableName);
        expect(update.Key).toBeDefined();
        expect(update.Key).toBeDefined();
        expect(update.UpdateExpression).toBe('foo = :bar2');
        expect(update.ConditionExpression).toBe('');
        expect((update as any).FilterExpression).toBeUndefined();
        expect(update.ExpressionAttributeValues).toEqual({
            ':bar': { 'N': '1234' },
            ':bar2': { 'N': '12345' }
        });
        expect(update.ExpressionAttributeNames).toEqual({});
    });

    test('Simple update with version', () => {
        const update = DynamoDBCommandBuilder
            .onTable(testTableName)
            .havingKey('id', 12345)
            .addFilter('foo = :bar')
            .withSimpleAttributeValue(':bar', 1234)
            .addUpdate('foo = :bar2')
            .withSimpleAttributeValue(':bar2', 12345)
            .havingVersion(1)
            .toUpdate();


        expect(update.TableName).toBe(testTableName);
        expect(update.Key).toBeDefined();
        expect(update.Key).toBeDefined();
        expect(update.UpdateExpression).toBe('foo = :bar2');
        expect(update.ConditionExpression).toBe('#version = :version');
        expect((update as any).FilterExpression).toBeUndefined();
        expect(update.ExpressionAttributeValues).toEqual({
            ':bar': { 'N': '1234' },
            ':bar2': { 'N': '12345' },
            ':version': { 'N': '1' }
        });
        expect(update.ExpressionAttributeNames).toEqual({
            '#version': 'version'
        });
    });
});
