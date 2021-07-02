import * as proto from '../../proto/chat/v2/chat_message';
/**
 * ChatMessage is used by the various show case waku apps that demonstrates
 * waku used as the network layer for chat group applications.
 *
 * This is included to help building PoC and MVPs. Apps that aim to be
 * production ready should use a more appropriate data structure.
 */
export declare class ChatMessage {
    proto: proto.ChatMessage;
    constructor(proto: proto.ChatMessage);
    /**
     * Create Chat Message with a utf-8 string as payload.
     */
    static fromUtf8String(timestamp: Date, nick: string, text: string): ChatMessage;
    /**
     * Decode a protobuf payload to a ChatMessage.
     * @param bytes The payload to decode.
     */
    static decode(bytes: Uint8Array): ChatMessage;
    /**
     * Encode this ChatMessage to a byte array, to be used as a protobuf payload.
     * @returns The encoded payload.
     */
    encode(): Uint8Array;
    get timestamp(): Date;
    get nick(): string;
    get payloadAsUtf8(): string;
}
