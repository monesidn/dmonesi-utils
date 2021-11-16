import { DynamoDBClient, AttributeValue } from '@aws-sdk/client-dynamodb';
import { QueryCommand, QueryCommandInput, QueryCommandOutput } from '@aws-sdk/client-dynamodb';
import { DynamoDBRecord } from './util';


/**
 * Utility to easily perform DynamoDB queries with paginations.
 */
export class PaginatedQuery {
    private _hasNext = true;
    private _LastEvaluatedKey?: DynamoDBRecord;
    private _lastResult?: QueryCommandOutput;
    private _lastPage?: DynamoDBRecord[];
    private _completed = false;

    constructor(
        private client: DynamoDBClient,
        private baseQuery: QueryCommandInput) {
    };

    /**
     * Should we call next again?
     */
    get hasNext() {
        return this._hasNext;
    }

    /**
     * The last object received from the DB.
     */
    get lastResult() {
        return this._lastResult;
    }

    /**
     * The last page of items received from the DB. This is the same
     * value that `next()` returned last time.
     */
    get lastPage() {
        return this._lastPage;
    }

    /**
     * Performs the query to retrieve the next page.
     */
    async next() {
        if (this._completed) {
            console.warn('next() called after completing. This should never happen!');
            return [];
        }
        const query = Object.assign({}, this.baseQuery);
        if (this._LastEvaluatedKey) {
            query.ExclusiveStartKey = this._LastEvaluatedKey;
        };
        const result = await this.client.send(new QueryCommand(query));
        if (result.LastEvaluatedKey) {
            this._LastEvaluatedKey = result.LastEvaluatedKey;
            this._hasNext = true;
        } else {
            this._LastEvaluatedKey = undefined;
            this._hasNext = false;
            this._completed = true;
        }
        this._lastResult = result;
        this._lastPage = result.Items;

        return result.Items;
    }
};
