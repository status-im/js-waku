"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WakuRelay = exports.DefaultPubsubTopic = exports.RelayCodec = void 0;
const libp2p_gossipsub_1 = __importDefault(require("libp2p-gossipsub"));
const utils_1 = require("libp2p-gossipsub/src/utils");
const signature_policy_1 = require("libp2p-interfaces/src/pubsub/signature-policy");
const peer_id_1 = __importDefault(require("peer-id"));
const waku_message_1 = require("../waku_message");
const constants = __importStar(require("./constants"));
const constants_1 = require("./constants");
Object.defineProperty(exports, "DefaultPubsubTopic", { enumerable: true, get: function () { return constants_1.DefaultPubsubTopic; } });
Object.defineProperty(exports, "RelayCodec", { enumerable: true, get: function () { return constants_1.RelayCodec; } });
const get_relay_peers_1 = require("./get_relay_peers");
const relay_heartbeat_1 = require("./relay_heartbeat");
/**
 * Implements the [Waku v2 Relay protocol]{@link https://rfc.vac.dev/spec/11/}.
 * Must be passed as a `pubsub` module to a {Libp2p} instance.
 *
 * @implements {Pubsub}
 * @noInheritDoc
 */
class WakuRelay extends libp2p_gossipsub_1.default {
    constructor(libp2p, options) {
        super(libp2p, Object.assign(options, {
            // Ensure that no signature is included nor expected in the messages.
            globalSignaturePolicy: signature_policy_1.SignaturePolicy.StrictNoSign,
        }));
        this.heartbeat = new relay_heartbeat_1.RelayHeartbeat(this);
        this.observers = {};
        const multicodecs = [constants.RelayCodec];
        Object.assign(this, { multicodecs });
        if (options === null || options === void 0 ? void 0 : options.pubsubTopic) {
            this.pubsubTopic = options.pubsubTopic;
        }
        else {
            this.pubsubTopic = constants.DefaultPubsubTopic;
        }
    }
    /**
     * Mounts the gossipsub protocol onto the libp2p node
     * and subscribes to the default topic.
     *
     * @override
     * @returns {void}
     */
    start() {
        super.start();
        this.subscribe(this.pubsubTopic);
    }
    /**
     * Send Waku message.
     *
     * @param {WakuMessage} message
     * @returns {Promise<void>}
     */
    async send(message) {
        const msg = message.encode();
        await super.publish(this.pubsubTopic, Buffer.from(msg));
    }
    /**
     * Register an observer of new messages received via waku relay
     *
     * @param callback called when a new message is received via waku relay
     * @param contentTopics Content Topics for which the callback with be called,
     * all of them if undefined, [] or ["",..] is passed.
     * @returns {void}
     */
    addObserver(callback, contentTopics = []) {
        if (contentTopics.length === 0) {
            if (!this.observers['']) {
                this.observers[''] = new Set();
            }
            this.observers[''].add(callback);
        }
        else {
            contentTopics.forEach((contentTopic) => {
                if (!this.observers[contentTopic]) {
                    this.observers[contentTopic] = new Set();
                }
                this.observers[contentTopic].add(callback);
            });
        }
    }
    /**
     * Remove an observer of new messages received via waku relay.
     * Useful to ensure the same observer is not registered several time
     * (e.g when loading React components)
     */
    deleteObserver(callback, contentTopics = []) {
        if (contentTopics.length === 0) {
            if (this.observers['']) {
                this.observers[''].delete(callback);
            }
        }
        else {
            contentTopics.forEach((contentTopic) => {
                if (this.observers[contentTopic]) {
                    this.observers[contentTopic].delete(callback);
                }
            });
        }
    }
    /**
     * Return the relay peers we are connected to and we would publish a message to
     */
    getPeers() {
        return get_relay_peers_1.getRelayPeers(this, this.pubsubTopic, this._options.D, (id) => {
            // Filter peers we would not publish to
            return (this.score.score(id) >= this._options.scoreThresholds.publishThreshold);
        });
    }
    /**
     * Subscribe to a pubsub topic and start emitting Waku messages to observers.
     *
     * @override
     */
    subscribe(pubsubTopic) {
        this.on(pubsubTopic, (event) => {
            const wakuMsg = waku_message_1.WakuMessage.decode(event.data);
            if (this.observers['']) {
                this.observers[''].forEach((callbackFn) => {
                    callbackFn(wakuMsg);
                });
            }
            if (wakuMsg.contentTopic) {
                if (this.observers[wakuMsg.contentTopic]) {
                    this.observers[wakuMsg.contentTopic].forEach((callbackFn) => {
                        callbackFn(wakuMsg);
                    });
                }
            }
        });
        super.subscribe(pubsubTopic);
    }
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
    join(topic) {
        var _a;
        if (!this.started) {
            throw new Error('WakuRelayPubsub has not started');
        }
        const fanoutPeers = this.fanout.get(topic);
        if (fanoutPeers) {
            // these peers have a score above the publish threshold, which may be negative
            // so drop the ones with a negative score
            fanoutPeers.forEach((id) => {
                if (this.score.score(id) < 0) {
                    fanoutPeers.delete(id);
                }
            });
            if (fanoutPeers.size < this._options.D) {
                // we need more peers; eager, as this would get fixed in the next heartbeat
                get_relay_peers_1.getRelayPeers(this, topic, this._options.D - fanoutPeers.size, (id) => {
                    // filter our current peers, direct peers, and peers with negative scores
                    return (!fanoutPeers.has(id) &&
                        !this.direct.has(id) &&
                        this.score.score(id) >= 0);
                }).forEach((id) => fanoutPeers.add(id));
            }
            this.mesh.set(topic, fanoutPeers);
            this.fanout.delete(topic);
            this.lastpub.delete(topic);
        }
        else {
            const peers = get_relay_peers_1.getRelayPeers(this, topic, this._options.D, (id) => {
                // filter direct peers and peers with negative score
                return !this.direct.has(id) && this.score.score(id) >= 0;
            });
            this.mesh.set(topic, peers);
        }
        (_a = this.mesh.get(topic)) === null || _a === void 0 ? void 0 : _a.forEach((id) => {
            this.log('JOIN: Add mesh link to %s in %s', id, topic);
            this._sendGraft(id, topic);
        });
    }
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
    async _publish(msg) {
        if (msg.receivedFrom !== this.peerId.toB58String()) {
            this.score.deliverMessage(msg);
            this.gossipTracer.deliverMessage(msg);
        }
        const msgID = this.getMsgId(msg);
        const msgIdStr = utils_1.messageIdToString(msgID);
        // put in seen cache
        this.seenCache.put(msgIdStr);
        this.messageCache.put(msg);
        const toSend = new Set();
        msg.topicIDs.forEach((topic) => {
            const peersInTopic = this.topics.get(topic);
            if (!peersInTopic) {
                return;
            }
            // direct peers
            this.direct.forEach((id) => {
                toSend.add(id);
            });
            let meshPeers = this.mesh.get(topic);
            if (!meshPeers || !meshPeers.size) {
                // We are not in the mesh for topic, use fanout peers
                meshPeers = this.fanout.get(topic);
                if (!meshPeers) {
                    // If we are not in the fanout, then pick peers in topic above the publishThreshold
                    const peers = get_relay_peers_1.getRelayPeers(this, topic, this._options.D, (id) => {
                        return (this.score.score(id) >=
                            this._options.scoreThresholds.publishThreshold);
                    });
                    if (peers.size > 0) {
                        meshPeers = peers;
                        this.fanout.set(topic, peers);
                    }
                    else {
                        meshPeers = new Set();
                    }
                }
                // Store the latest publishing time
                this.lastpub.set(topic, this._now());
            }
            meshPeers === null || meshPeers === void 0 ? void 0 : meshPeers.forEach((peer) => {
                toSend.add(peer);
            });
        });
        // Publish messages to peers
        const rpc = utils_1.createGossipRpc([libp2p_gossipsub_1.default.utils.normalizeOutRpcMessage(msg)]);
        toSend.forEach((id) => {
            if (id === msg.from) {
                return;
            }
            this._sendRpc(id, rpc);
        });
    }
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
    _emitGossip(topic, exclude) {
        const messageIDs = this.messageCache.getGossipIDs(topic);
        if (!messageIDs.length) {
            return;
        }
        // shuffle to emit in random order
        utils_1.shuffle(messageIDs);
        // if we are emitting more than GossipsubMaxIHaveLength ids, truncate the list
        if (messageIDs.length > constants.RelayMaxIHaveLength) {
            // we do the truncation (with shuffling) per peer below
            this.log('too many messages for gossip; will truncate IHAVE list (%d messages)', messageIDs.length);
        }
        // Send gossip to GossipFactor peers above threshold with a minimum of D_lazy
        // First we collect the peers above gossipThreshold that are not in the exclude set
        // and then randomly select from that set
        // We also exclude direct peers, as there is no reason to emit gossip to them
        const peersToGossip = [];
        const topicPeers = this.topics.get(topic);
        if (!topicPeers) {
            // no topic peers, no gossip
            return;
        }
        topicPeers.forEach((id) => {
            const peerStreams = this.peers.get(id);
            if (!peerStreams) {
                return;
            }
            if (!exclude.has(id) &&
                !this.direct.has(id) &&
                peerStreams.protocol == constants.RelayCodec &&
                this.score.score(id) >= this._options.scoreThresholds.gossipThreshold) {
                peersToGossip.push(id);
            }
        });
        let target = this._options.Dlazy;
        const factor = constants.RelayGossipFactor * peersToGossip.length;
        if (factor > target) {
            target = factor;
        }
        if (target > peersToGossip.length) {
            target = peersToGossip.length;
        }
        else {
            utils_1.shuffle(peersToGossip);
        }
        // Emit the IHAVE gossip to the selected peers up to the target
        peersToGossip.slice(0, target).forEach((id) => {
            let peerMessageIDs = messageIDs;
            if (messageIDs.length > constants.RelayMaxIHaveLength) {
                // shuffle and slice message IDs per peer so that we emit a different set for each peer
                // we have enough redundancy in the system that this will significantly increase the message
                // coverage when we do truncate
                peerMessageIDs = utils_1.shuffle(peerMessageIDs.slice()).slice(0, constants.RelayMaxIHaveLength);
            }
            this._pushGossip(id, {
                topicID: topic,
                messageIDs: peerMessageIDs,
            });
        });
    }
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
    _makePrune(id, topic, doPX) {
        // backoff is measured in seconds
        // RelayPruneBackoff is measured in milliseconds
        const backoff = constants.RelayPruneBackoff / 1000;
        const px = [];
        if (doPX) {
            // select peers for Peer eXchange
            const peers = get_relay_peers_1.getRelayPeers(this, topic, constants.RelayPrunePeers, (xid) => {
                return xid !== id && this.score.score(xid) >= 0;
            });
            peers.forEach((p) => {
                // see if we have a signed record to send back; if we don't, just send
                // the peer ID and let the pruned peer find them in the DHT -- we can't trust
                // unsigned address records through PX anyways
                // Finding signed records in the DHT is not supported at the time of writing in js-libp2p
                const peerId = peer_id_1.default.createFromB58String(p);
                px.push({
                    peerID: peerId.toBytes(),
                    signedPeerRecord: this._libp2p.peerStore.addressBook.getRawEnvelope(peerId),
                });
            });
        }
        return {
            topicID: topic,
            peers: px,
            backoff: backoff,
        };
    }
}
exports.WakuRelay = WakuRelay;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3dha3VfcmVsYXkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHdFQUF5QztBQVF6QyxzREFJb0M7QUFFcEMsb0ZBQWdGO0FBQ2hGLHNEQUE2QjtBQUc3QixrREFBOEM7QUFFOUMsdURBQXlDO0FBQ3pDLDJDQUE2RDtBQUl4QyxtR0FKWiw4QkFBa0IsT0FJWTtBQUE5QiwyRkFKb0Isc0JBQVUsT0FJcEI7QUFIbkIsdURBQWtEO0FBQ2xELHVEQUFtRDtBQTRCbkQ7Ozs7OztHQU1HO0FBQ0gsTUFBYSxTQUFVLFNBQVEsMEJBQVM7SUFXdEMsWUFDRSxNQUFjLEVBQ2QsT0FBZ0Q7UUFFaEQsS0FBSyxDQUNILE1BQU0sRUFDTixNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNyQixxRUFBcUU7WUFDckUscUJBQXFCLEVBQUUsa0NBQWUsQ0FBQyxZQUFZO1NBQ3BELENBQUMsQ0FDSCxDQUFDO1FBRUYsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLGdDQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFFcEIsTUFBTSxXQUFXLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFM0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBRXJDLElBQUksT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFdBQVcsRUFBRTtZQUN4QixJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7U0FDeEM7YUFBTTtZQUNMLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLGtCQUFrQixDQUFDO1NBQ2pEO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7T0FNRztJ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