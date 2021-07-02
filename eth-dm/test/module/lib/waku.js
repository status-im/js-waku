import Libp2p from 'libp2p';
import Mplex from 'libp2p-mplex';
import { Noise } from 'libp2p-noise/dist/src/noise';
import Websockets from 'libp2p-websockets';
import filters from 'libp2p-websockets/src/filters';
import Ping from 'libp2p/src/ping';
import { multiaddr } from 'multiaddr';
import PeerId from 'peer-id';
import { WakuLightPush } from './waku_light_push';
import { RelayCodec, WakuRelay } from './waku_relay';
import { StoreCodec, WakuStore } from './waku_store';
const websocketsTransportKey = Websockets.prototype[Symbol.toStringTag];
export class Waku {
    constructor(options, libp2p, store, lightPush) {
        this.libp2p = libp2p;
        this.relay = libp2p.pubsub;
        this.store = store;
        this.lightPush = lightPush;
        this.keepAliveTimers = {};
        const keepAlive = options.keepAlive !== undefined ? options.keepAlive : 10;
        if (keepAlive !== 0) {
            libp2p.connectionManager.on('peer:connect', (connection) => {
                this.startKeepAlive(connection.remotePeer, keepAlive);
            });
            libp2p.connectionManager.on('peer:disconnect', (connection) => {
                this.stopKeepAlive(connection.remotePeer);
            });
        }
    }
    /**
     * Create new waku node
     *
     * @param options Takes the same options than `Libp2p`.
     */
    static async create(options) {
        // Get an object in case options or libp2p are undefined
        const libp2pOpts = Object.assign({}, options?.libp2p);
        // Default for Websocket filter is `all`:
        // Returns all TCP and DNS based addresses, both with ws or wss.
        libp2pOpts.config = Object.assign({
            transport: {
                [websocketsTransportKey]: {
                    filter: filters.all,
                },
            },
        }, options?.libp2p?.config);
        // Pass pubsub topic to relay
        if (options?.pubsubTopic) {
            libp2pOpts.config.pubsub = Object.assign({ pubsubTopic: options.pubsubTopic }, libp2pOpts.config.pubsub);
        }
        libp2pOpts.modules = Object.assign({}, options?.libp2p?.modules);
        // Default transport for libp2p is Websockets
        libp2pOpts.modules = Object.assign({
            transport: [Websockets],
        }, options?.libp2p?.modules);
        // streamMuxer, connection encryption and pubsub are overridden
        // as those are the only ones currently supported by Waku nodes.
        libp2pOpts.modules = Object.assign(libp2pOpts.modules, {
            streamMuxer: [Mplex],
            connEncryption: [new Noise(options?.staticNoiseKey)],
            pubsub: WakuRelay,
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: modules property is correctly set thanks to voodoo
        const libp2p = await Libp2p.create(libp2pOpts);
        const wakuStore = new WakuStore(libp2p, {
            pubsubTopic: options?.pubsubTopic,
        });
        const wakuLightPush = new WakuLightPush(libp2p);
        await libp2p.start();
        return new Waku(options ? options : {}, libp2p, wakuStore, wakuLightPush);
    }
    /**
     * Dials to the provided peer.
     *
     * @param peer The peer to dial
     */
    async dial(peer) {
        return this.libp2p.dialProtocol(peer, [RelayCodec, StoreCodec]);
    }
    /**
     * Add peer to address book, it will be auto-dialed in the background.
     */
    addPeerToAddressBook(peerId, multiaddrs) {
        let peer;
        if (typeof peerId === 'string') {
            peer = PeerId.createFromB58String(peerId);
        }
        else {
            peer = peerId;
        }
        const addresses = multiaddrs.map((addr) => {
            if (typeof addr === 'string') {
                return multiaddr(addr);
            }
            else {
                return addr;
            }
        });
        this.libp2p.peerStore.addressBook.set(peer, addresses);
    }
    async stop() {
        return this.libp2p.stop();
    }
    /**
     * Return the local multiaddr with peer id on which libp2p is listening.
     * @throws if libp2p is not listening on localhost
     */
    getLocalMultiaddrWithID() {
        const localMultiaddr = this.libp2p.multiaddrs.find((addr) => addr.toString().match(/127\.0\.0\.1/));
        if (!localMultiaddr || localMultiaddr.toString() === '') {
            throw 'Not listening on localhost';
        }
        return localMultiaddr + '/p2p/' + this.libp2p.peerId.toB58String();
    }
    startKeepAlive(peerId, periodSecs) {
        // Just in case a timer already exist for this peer
        this.stopKeepAlive(peerId);
        const peerIdStr = peerId.toB58String();
        this.keepAliveTimers[peerIdStr] = setInterval(() => {
            Ping(this.libp2p, peerId);
        }, periodSecs * 1000);
    }
    stopKeepAlive(peerId) {
        const peerIdStr = peerId.toB58String();
        if (this.keepAliveTimers[peerIdStr]) {
            clearInterval(this.keepAliveTimers[peerIdStr]);
            delete this.keepAliveTimers[peerIdStr];
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FrdS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvd2FrdS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQW9ELE1BQU0sUUFBUSxDQUFDO0FBQzFFLE9BQU8sS0FBSyxNQUFNLGNBQWMsQ0FBQztBQUVqQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDcEQsT0FBTyxVQUFVLE1BQU0sbUJBQW1CLENBQUM7QUFDM0MsT0FBTyxPQUFPLE1BQU0sK0JBQStCLENBQUM7QUFDcEQsT0FBTyxJQUFJLE1BQU0saUJBQWlCLENBQUM7QUFDbkMsT0FBTyxFQUFhLFNBQVMsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNqRCxPQUFPLE1BQU0sTUFBTSxTQUFTLENBQUM7QUFFN0IsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3JELE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRXJELE1BQU0sc0JBQXNCLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7QUEwQ3hFLE1BQU0sT0FBTyxJQUFJO0lBVWYsWUFDRSxPQUFzQixFQUN0QixNQUFjLEVBQ2QsS0FBZ0IsRUFDaEIsU0FBd0I7UUFFeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBOEIsQ0FBQztRQUNuRCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUUxQixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxLQUFL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