import _m0 from 'protobufjs/minimal';
export declare const protobufPackage = "chat.v2";
export interface ChatMessage {
    timestamp: number;
    nick: string;
    payload: Uint8Array;
}
export declare const ChatMessage: {
    encode(message: ChatMessage, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): ChatMessage;
    fromJSON(object: any): ChatMessage;
    toJSON(message: ChatMessage): unknown;
    fromPartial(object: DeepPartial<ChatMessage>): ChatMessage;
};
declare type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
