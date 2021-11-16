import { Transform, TransformCallback } from 'stream';
import { createHash } from 'crypto';

export class Md5PassThroughStrean extends Transform {
    hash = createHash('md5');

    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
        this.hash.update(chunk);
        this.push(chunk, encoding);
        callback();
    }
};
