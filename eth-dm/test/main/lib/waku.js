"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Waku = void 0;
const libp2p_1 = __importDefault(require("libp2p"));
const libp2p_mplex_1 = __importDefault(require("libp2p-mplex"));
const noise_1 = require("libp2p-noise/dist/src/noise");
const libp2p_websockets_1 = __importDefault(require("libp2p-websockets"));
const filters_1 = __importDefault(require("libp2p-websockets/src/filters"));
const ping_1 = __importDefault(require("libp2p/src/ping"));
const multiaddr_1 = require("multiaddr");
const peer_id_1 = __importDefault(require("peer-id"));
const waku_light_push_1 = require("./waku_light_push");
const waku_relay_1 = require("./waku_relay");
const waku_store_1 = require("./waku_store");
const websocketsTransportKey = libp2p_websockets_1.default.prototype[Symbol.toStringTag];
class Waku {
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
        var _a, _b, _c;
        // Get an object in case options or libp2p are undefined
        const libp2pOpts = Object.assign({}, options === null || options === void 0 ? void 0 : options.libp2p);
        // Default for Websocket filter is `all`:
        // Returns all TCP and DNS based addresses, both with ws or wss.
        libp2pOpts.config = Object.assign({
            transport: {
                [websocketsTransportKey]: {
                    filter: filters_1.default.all,
                },
            },
        }, (_a = options === null || options === void 0 ? void 0 : options.libp2p) === null || _a === void 0 ? void 0 : _a.config);
        // Pass pubsub topic to relay
        if (options === null || options === void 0 ? void 0 : options.pubsubTopic) {
            libp2pOpts.config.pubsub = Object.assign({ pubsubTopic: options.pubsubTopic }, libp2pOpts.config.pubsub);
        }
        libp2pOpts.modules = Object.assign({}, (_b = options === null || options === void 0 ? void 0 : options.libp2p) === null || _b === void 0 ? void 0 : _b.modules);
        // Default transport for libp2p is Websockets
        libp2pOpts.modules = Object.assign({
            transport: [libp2p_websockets_1.default],
        }, (_c = options === null || options === void 0 ? void 0 : options.libp2p) === null || _c === void 0 ? void 0 : _c.modules);
        // streamMuxer, connection encryption and pubsub are overridden
        // as those are the only ones currently supported by Waku nodes.
        libp2pOpts.modules = Object.assign(libp2pOpts.modules, {
            streamMuxer: [libp2p_mplex_1.default],
            connEncryption: [new noise_1.Noise(options === null || options === void 0 ? void 0 : options.staticNoiseKey)],
            pubsub: waku_relay_1.WakuRelay,
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: modules property is correctly set thanks to voodoo
        const libp2p = await libp2p_1.default.create(libp2pOpts);
        const wakuStore = new waku_store_1.WakuStore(libp2p, {
            pubsubTopic: options === null || options === void 0 ? void 0 : options.pubsubTopic,
        });
        const wakuLightPush = new waku_light_push_1.WakuLightPush(libp2p);
        await libp2p.start();
        return new Waku(options ? options : {}, libp2p, wakuStore, wakuLightPush);
    }
    /**
     * Dials to the provided peer.
     *
     * @param peer The peer to dial
     */
    async dial(peer) {
        return this.libp2p.dialProtocol(peer, [waku_relay_1.RelayCodec, waku_store_1.StoreCodec]);
    }
    /**
     * Add peer to address book, it will be auto-dialed in the background.
     */
    addPeerToAddressBook(peerId, multiaddrs) {
        let peer;
        if (typeof peerId === 'string') {
            peer = peer_id_1.default.createFromB58String(peerId);
        }
        else {
            peer = peerId;
        }
        const addresses = multiaddrs.map((addr) => {
            if (typeof addr === 'string') {
                return multiaddr_1.multiaddr(addr);
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
            ping_1.default(this.libp2p, peerId);
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
exports.Waku = Waku;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FrdS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvd2FrdS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxvREFBMEU7QUFDMUUsZ0VBQWlDO0FBRWpDLHVEQUFvRDtBQUNwRCwwRUFBMkM7QUFDM0MsNEVBQW9EO0FBQ3BELDJEQUFtQztBQUNuQyx5Q0FBaUQ7QUFDakQsc0RBQTZCO0FBRTdCLHVEQUFrRDtBQUNsRCw2Q0FBcUQ7QUFDckQsNkNBQXFEO0FBRXJELE1BQU0sc0JBQXNCLEdBQUcsMkJBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBMEN4RSxNQUFhLElBQUk7SUFVZixZQUNFLE9BQXNCLEVBQ3RCLE1BQWMsRUFDZCxLQUFnQixFQUNoQixTQUF3QjtRQUV4QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUE4QixDQUFDO1FBQ25ELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBRTFCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFM0UsSUFBSSxTQUFTLEtBQUssQ0FBQyxFQUFFO1lBQ25CLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsVUFBc0IsRUFBRSxFQUFFO2dCQUNyRSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDeEQsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsaUJBQWlCLENBQUMsRUFBRSxD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