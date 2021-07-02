import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import { WakuMessage } from '../waku_message';
import { Direction } from './history_rpc';
export declare const StoreCodec = "/vac/waku/store/2.0.0-beta3";
export { Direction };
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
export interface QueryOptions {
    peerId?: PeerId;
    contentTopics: string[];
    pubsubTopic?: string;
    direction?: Direction;
    pageSize?: number;
    callback?: (messages: WakuMessage[]) => void;
}
/**
 * Implements the [Waku v2 Store protocol](https://rfc.vac.dev/spec/13/).
 */
export declare class WakuStore {
    libp2p: Libp2p;
    pubsubTopic: string;
    constructor(libp2p: Libp2p, options?: CreateOptions);
    /**
     * Query given peer using Waku Store.
     *
     * @param options
     * @param options.peerId The peer to query.Options
     * @param options.contentTopics The content topics to pass to the query, leave empty to
     * retrieve all messages.
     * @param options.pubsubTopic The pubsub topic to pass to the query. Defaults
     * to the value set at creation. See [Waku v2 Topic Usage Recommendations](https://rfc.vac.dev/spec/23/).
     * @param options.callback Callback called on page of stored messages as they are retrieved
     * @throws If not able to reach the peer to query.
     */
    queryHistory(options: QueryOptions): Promise<WakuMessage[] | null>;
}
