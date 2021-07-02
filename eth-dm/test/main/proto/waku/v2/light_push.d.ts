import _m0 from 'protobufjs/minimal';
import { WakuMessage } from '../../waku/v2/message';
export declare const protobufPackage = "waku.v2";
export interface PushRequest {
    pubsubTopic: string;
    message: WakuMessage | undefined;
}
export interface PushResponse {
    isSuccess: boolean;
    info: string;
}
export interface PushRPC {
    requestId: string;
    request: PushRequest | undefined;
    response: PushResponse | undefined;
}
export declare const PushRequest: {
    encode(message: PushRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): PushRequest;
    fromJSON(object: any): PushRequest;
    toJSON(message: PushRequest): unknown;
    fromPartial(object: DeepPartial<PushRequest>): PushRequest;
};
export declare const PushResponse: {
    encode(message: PushResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): PushResponse;
    fromJSON(object: any): PushResponse;
    toJSON(message: PushResponse): unknown;
    fromPartial(object: DeepPartial<PushResponse>): PushResponse;
};
export declare const PushRPC: {
    encode(message: PushRPC, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): PushRPC;
    fromJSON(object: any): PushRPC;
    toJSON(message: PushRPC): unknown;
    fromPartial(object: DeepPartial<PushRPC>): PushRPC;
};
declare type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
