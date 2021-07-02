import * as proto from '../proto/waku/v2/message';
export declare const DefaultContentTopic = "/waku/2/default-content/proto";
export declare class WakuMessage {
    proto: proto.WakuMessage;
    constructor(proto: proto.WakuMessage);
    /**
     * Create Message with a utf-8 string as payload.
     */
    static fromUtf8String(utf8: string, contentTopic?: string, timestamp?: Date): WakuMessage;
    /**
     * Create Message with a byte array as payload.
     */
    static fromBytes(payload: Uint8Array, contentTopic?: string, timestamp?: Date): WakuMessage;
    static decode(bytes: Uint8Array): WakuMessage;
    encode(): Uint8Array;
    get payloadAsUtf8(): string;
    get payload(): Uint8Array | undefined;
    get contentTopic(): string | undefined;
    get version(): number | undefined;
    get timestamp(): Date | undefined;
}
