import DynamoDB from 'aws-sdk/clients/dynamodb';

/**
 * Utility to easily perform DynamoDB queries with paginations.
 */
export class PaginatedQuery {
    private _hasNext = true;
    private _LastEvaluatedKey?: DynamoDB.Key;
    private _lastResult?: DynamoDB.QueryOutput;
    private _lastPage?: DynamoDB.ItemList;
    private _completed = false;

    constructor(
        private client: DynamoDB,
        private baseQuery: DynamoDB.QueryInput) {
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
        const result = await this.client.query(query).promise();
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
