import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import { PushResponse } from '../../proto/waku/v2/light_push';
import { WakuMessage } from '../waku_message';
export declare const LightPushCodec = "/vac/waku/lightpush/2.0.0-beta1";
export { PushResponse };
export interface CreateOptions {
    /**
     * The PubSub Topic to use. Defaults to {@link DefaultPubsubTopic}.
     *
     * The usage of the default pubsub topic is recommended.
     * See [Waku v2 Topic Usage Recommendations](https://rfc.vac.dev/spec/23/) for details.
     *
     * @default {@link DefaultPubsubTopic}
     */
    pubsubTopic?: string;
}
export interface PushOptions {
    peerId?: PeerId;
    pubsubTopic?: string;
}
/**
 * Implements the [Waku v2 Light Push protocol](https://rfc.vac.dev/spec/19/).
 */
export declare class WakuLightPush {
    libp2p: Libp2p;
    pubsubTopic: string;
    constructor(libp2p: Libp2p, options?: CreateOptions);
    push(message: WakuMessage, opts?: PushOptions): Promise<PushResponse | null>;
}
