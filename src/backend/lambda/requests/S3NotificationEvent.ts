
export interface S3NotificationEventUserIdentity {
    principalId: string;
}

export interface S3NotificationEventRequestParameters {
    sourceIPAddress: string;
}

export interface S3NotificationEventBucketInfo {
    name: string;
    ownerIdentity: S3NotificationEventUserIdentity;
    arn: string;
}

export interface S3NotificationEventObjectInfo {
    key: string;
    size: number;
    eTag: string;
    sequencer: string;
}

export interface S3Info {
    s3SchemaVersion: string;
    configurationId: string;
    bucket: S3NotificationEventBucketInfo;
    object: S3NotificationEventObjectInfo;
}

export interface S3Notification {
    eventVersion: string;
    eventSource: string;
    awsRegion: string;
    eventTime: Date;
    eventName: string;
    userIdentity: S3NotificationEventUserIdentity;
    requestParameters: S3NotificationEventRequestParameters;
    responseElements: Record<string, string>;
    s3: S3Info;
}

export interface S3NotificationEvent {
    Records: S3Notification[];
}
