import * as proto from '../../proto/waku/v2/store';
export declare enum Direction {
    BACKWARD = "backward",
    FORWARD = "forward"
}
export interface Options {
    contentTopics: string[];
    cursor?: proto.Index;
    pubsubTopic: string;
    direction: Direction;
    pageSize: number;
}
export declare class HistoryRPC {
    proto: proto.HistoryRPC;
    constructor(proto: proto.HistoryRPC);
    /**
     * Create History Query.
     */
    static createQuery(options: Options): HistoryRPC;
    static decode(bytes: Uint8Array): HistoryRPC;
    encode(): Uint8Array;
    get query(): proto.HistoryQuery | undefined;
    get response(): proto.HistoryResponse | undefined;
}
