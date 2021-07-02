import _m0 from 'protobufjs/minimal';
export declare const protobufPackage = "waku.v2";
export interface WakuMessage {
    payload?: Uint8Array | undefined;
    contentTopic?: string | undefined;
    version?: number | undefined;
    timestamp?: number | undefined;
}
export declare const WakuMessage: {
    encode(message: WakuMessage, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): WakuMessage;
    fromJSON(object: any): WakuMessage;
    toJSON(message: WakuMessage): unknown;
    fromPartial(object: DeepPartial<WakuMessage>): WakuMessage;
};
declare type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
