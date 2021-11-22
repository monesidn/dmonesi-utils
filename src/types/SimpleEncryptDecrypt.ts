import { createCipheriv, createDecipheriv } from 'crypto';

export class SimpleEncryptDecrypt {
    constructor(
        public readonly key: string,
        public readonly iv: string,
        public readonly alghoritm = 'aes-128-ccm'
    ) {
    }

    encrypt(plaintext: string) {
        const cypher = createCipheriv(this.alghoritm, this.key, this.iv);

        cypher.update(plaintext, 'utf-8');
        return cypher.final('base64');
    }

    decrypt(encrypted: string) {
        const decypher = createDecipheriv(this.alghoritm, this.key, this.iv);
        decypher.update(encrypted, 'base64');
        return decypher.final('utf-8');
    }
}
