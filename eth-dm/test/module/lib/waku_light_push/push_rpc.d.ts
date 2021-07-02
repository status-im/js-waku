import * as proto from '../../proto/waku/v2/light_push';
import { WakuMessage } from '../waku_message';
export declare class PushRPC {
    proto: proto.PushRPC;
    constructor(proto: proto.PushRPC);
    static createRequest(message: WakuMessage, pubsubTopic?: string): PushRPC;
    static decode(bytes: Uint8Array): PushRPC;
    encode(): Uint8Array;
    get query(): proto.PushRequest | undefined;
    get response(): proto.PushResponse | undefined;
}
