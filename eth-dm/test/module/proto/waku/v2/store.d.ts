import _m0 from 'protobufjs/minimal';
import { WakuMessage } from '../../waku/v2/message';
export declare const protobufPackage = "waku.v2";
export interface Index {
    digest: Uint8Array;
    receivedTime: number;
}
export interface PagingInfo {
    pageSize: number;
    cursor: Index | undefined;
    direction: PagingInfo_Direction;
}
export declare enum PagingInfo_Direction {
    DIRECTION_BACKWARD_UNSPECIFIED = 0,
    DIRECTION_FORWARD = 1,
    UNRECOGNIZED = -1
}
export declare function pagingInfo_DirectionFromJSON(object: any): PagingInfo_Direction;
export declare function pagingInfo_DirectionToJSON(object: PagingInfo_Direction): string;
export interface ContentFilter {
    contentTopic: string;
}
export interface HistoryQuery {
    pubsubTopic?: string | undefined;
    contentFilters: ContentFilter[];
    pagingInfo?: PagingInfo | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
}
export interface HistoryResponse {
    messages: WakuMessage[];
    pagingInfo: PagingInfo | undefined;
}
export interface HistoryRPC {
    requestId: string;
    query: HistoryQuery | undefined;
    response: HistoryResponse | undefined;
}
export declare const Index: {
    encode(message: Index, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): Index;
    fromJSON(object: any): Index;
    toJSON(message: Index): unknown;
    fromPartial(object: DeepPartial<Index>): Index;
};
export declare const PagingInfo: {
    encode(message: PagingInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): PagingInfo;
    fromJSON(object: any): PagingInfo;
    toJSON(message: PagingInfo): unknown;
    fromPartial(object: DeepPartial<PagingInfo>): PagingInfo;
};
export declare const ContentFilter: {
    encode(message: ContentFilter, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): ContentFilter;
    fromJSON(object: any): ContentFilter;
    toJSON(message: ContentFilter): unknown;
    fromPartial(object: DeepPartial<ContentFilter>): ContentFilter;
};
export declare const HistoryQuery: {
    encode(message: HistoryQuery, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): HistoryQuery;
    fromJSON(object: any): HistoryQuery;
    toJSON(message: HistoryQuery): unknown;
    fromPartial(object: DeepPartial<HistoryQuery>): HistoryQuery;
};
export declare const HistoryResponse: {
    encode(message: HistoryResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): HistoryResponse;
    fromJSON(object: any): HistoryResponse;
    toJSON(message: HistoryResponse): unknown;
    fromPartial(object: DeepPartial<HistoryResponse>): HistoryResponse;
};
export declare const HistoryRPC: {
    encode(message: HistoryRPC, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number | undefined): HistoryRPC;
    fromJSON(object: any): HistoryRPC;
    toJSON(message: HistoryRPC): unknown;
    fromPartial(object: DeepPartial<HistoryRPC>): HistoryRPC;
};
declare type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
