import Libp2p, { Libp2pModules, Libp2pOptions } from 'libp2p';
import { bytes } from 'libp2p-noise/dist/src/@types/basic';
import { Multiaddr } from 'multiaddr';
import PeerId from 'peer-id';
import { WakuLightPush } from './waku_light_push';
import { WakuRelay } from './waku_relay';
import { WakuStore } from './waku_store';
export interface CreateOptions {
    /**
     * The PubSub Topic to use. Defaults to {@link DefaultPubsubTopic}.
     *
     * One and only one pubsub topic is used by Waku. This is used by:
     * - WakuRelay to receive, route and send messages,
     * - WakuLightPush to send messages,
     * - WakuStore to retrieve messages.
     *
     * The usage of the default pubsub topic is recommended.
     * See [Waku v2 Topic Usage Recommendations](https://rfc.vac.dev/spec/23/) for details.
     *
     * @default {@link DefaultPubsubTopic}
     */
    pubsubTopic?: string;
    /**
     * Set keep alive frequency in seconds: Waku will send a ping request to each peer
     * after the set number of seconds. Set to 0 to disable the keep alive feature
     *
     * @default 10
     */
    keepAlive?: number;
    /**
     * You can pass options to the `Libp2p` instance used by {@link Waku} using the {@link CreateOptions.libp2p} property.
     * This property is the same type than the one passed to [`Libp2p.create`](https://github.com/libp2p/js-libp2p/blob/master/doc/API.md#create)
     * apart that we made the `modules` property optional and partial,
     * allowing its omission and letting Waku set good defaults.
     * Notes that some values are overridden by {@link Waku} to ensure it implements the Waku protocol.
     */
    libp2p?: Omit<Libp2pOptions & import('libp2p').CreateOptions, 'modules'> & {
        modules?: Partial<Libp2pModules>;
    };
    /**
     * Byte array used as key for the noise protocol used for connection encryption
     * by [`Libp2p.create`](https://github.com/libp2p/js-libp2p/blob/master/doc/API.md#create)
     * This is only used for test purposes to not run out of entropy during CI runs.
     */
    staticNoiseKey?: bytes;
}
export declare class Waku {
    libp2p: Libp2p;
    relay: WakuRelay;
    store: WakuStore;
    lightPush: WakuLightPush;
    private keepAliveTimers;
    private constructor();
    /**
     * Create new waku node
     *
     * @param options Takes the same options than `Libp2p`.
     */
    static create(options?: CreateOptions): Promise<Waku>;
    /**
     * Dials to the provided peer.
     *
     * @param peer The peer to dial
     */
    dial(peer: PeerId | Multiaddr | string): Promise<{
        stream: import('libp2p-interfaces/src/stream-muxer/types').MuxedStream;
        protocol: string;
    }>;
    /**
     * Add peer to address book, it will be auto-dialed in the background.
     */
    addPeerToAddressBook(peerId: PeerId | string, multiaddrs: Multiaddr[] | string[]): void;
    stop(): Promise<void>;
    /**
     * Return the local multiaddr with peer id on which libp2p is listening.
     * @throws if libp2p is not listening on localhost
     */
    getLocalMultiaddrWithID(): string;
    private startKeepAlive;
    private stopKeepAlive;
}
