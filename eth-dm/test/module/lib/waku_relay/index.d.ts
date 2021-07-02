import Libp2p from 'libp2p';
import Gossipsub from 'libp2p-gossipsub';
import { AddrInfo, MessageIdFunction } from 'libp2p-gossipsub/src/interfaces';
import { MessageCache } from 'libp2p-gossipsub/src/message-cache';
import { RPC } from 'libp2p-gossipsub/src/message/rpc';
import { PeerScoreParams, PeerScoreThresholds } from 'libp2p-gossipsub/src/score';
import { InMessage } from 'libp2p-interfaces/src/pubsub';
import { CreateOptions } from '../waku';
import { WakuMessage } from '../waku_message';
import { DefaultPubsubTopic, RelayCodec } from './constants';
import { RelayHeartbeat } from './relay_heartbeat';
export { RelayCodec, DefaultPubsubTopic };
/**
 * See constructor libp2p-gossipsub [API](https://github.com/ChainSafe/js-libp2p-gossipsub#api).
 */
export interface GossipOptions {
    emitSelf: boolean;
    gossipIncoming: boolean;
    fallbackToFloodsub: boolean;
    floodPublish: boolean;
    doPX: boolean;
    msgIdFn: MessageIdFunction;
    messageCache: MessageCache;
    scoreParams: Partial<PeerScoreParams>;
    scoreThresholds: Partial<PeerScoreThresholds>;
    directPeers: AddrInfo[];
    D: number;
    Dlo: number;
    Dhi: number;
    Dscore: number;
    Dout: number;
    Dlazy: number;
}
/**
 * Implements the [Waku v2 Relay protocol]{@link https://rfc.vac.dev/spec/11/}.
 * Must be passed as a `pubsub` module to a {Libp2p} instance.
 *
 * @implements {Pubsub}
 * @noInheritDoc
 */
export declare class WakuRelay extends Gossipsub {
    heartbeat: RelayHeartbeat;
    pubsubTopic: string;
    /**
     * observers called when receiving new message.
     * Observers under key "" are always called.
     */
    observers: {
        [contentTopic: string]: Set<(message: WakuMessage) => void>;
    };
    constructor(libp2p: Libp2p, options?: Partial<CreateOptions & GossipOptions>);
    /**
     * Mounts the gossipsub protocol onto the libp2p node
     * and subscribes to the default topic.
     *
     * @override
     * @returns {void}
     */
    start(): void;
    /**
     * Send Waku message.
     *
     * @param {WakuMessage} message
     * @returns {Promise<void>}
     */
    send(message: WakuMessage): Promise<void>;
    /**
     * Register an observer of new messages received via waku relay
     *
     * @param callback called when a new message is received via waku relay
     * @param contentTopics Content Topics for which the callback with be called,
     * all of them if undefined, [] or ["",..] is passed.
     * @returns {void}
     */
    addObserver(callback: (message: WakuMessage) => void, contentTopics?: string[]): void;
    /**
     * Remove an observer of new messages received via waku relay.
     * Useful to ensure the same observer is not registered several time
     * (e.g when loading React components)
     */
    deleteObserver(callback: (message: WakuMessage) => void, contentTopics?: string[]): void;
    /**
     * Return the relay peers we are connected to and we would publish a message to
     */
    getPeers(): Set<string>;
    /**
     * Subscribe to a pubsub topic and start emitting Waku messages to observers.
     *
     * @override
     */
    subscribe(pubsubTopic: string): void;
    /**
     * Join pubsub topic.
     * This is present to override the behavior of Gossipsub and should not
     * be used by API Consumers
     *
     * @internal
     * @param {string} topic
     * @returns {void}
     * @override
     */
    join(topic: string): void;
    /**
     * Publish messages.
     * This is present to override the behavior of Gossipsub and should not
     * be used by API Consumers
     *
     * @ignore
     * @override
     * @param {InMessage} msg
     * @returns {void}
     */
    _publish(msg: InMessage): Promise<void>;
    /**
     * Emits gossip to peers in a particular topic.
     *
     * This is present to override the behavior of Gossipsub and should not
     * be used by API Consumers
     *
     * @ignore
     * @override
     * @param {string} topic
     * @param {Set<string>} exclude peers to exclude
     * @returns {void}
     */
    _emitGossip(topic: string, exclude: Set<string>): void;
    /**
     * Make a PRUNE control message for a peer in a topic.
     * This is present to override the behavior of Gossipsub and should not
     * be used by API Consumers
     *
     * @ignore
     * @override
     * @param {string} id
     * @param {string} topic
     * @param {boolean} doPX
     * @returns {RPC.IControlPrune}
     */
    _makePrune(id: string, topic: string, doPX: boolean): RPC.IControlPrune;
}
