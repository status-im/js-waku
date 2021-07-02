import Gossipsub from 'libp2p-gossipsub';
import { createGossipRpc, messageIdToString, shuffle, } from 'libp2p-gossipsub/src/utils';
import { SignaturePolicy } from 'libp2p-interfaces/src/pubsub/signature-policy';
import PeerId from 'peer-id';
import { WakuMessage } from '../waku_message';
import * as constants from './constants';
import { DefaultPubsubTopic, RelayCodec } from './constants';
import { getRelayPeers } from './get_relay_peers';
import { RelayHeartbeat } from './relay_heartbeat';
export { RelayCodec, DefaultPubsubTopic };
/**
 * Implements the [Waku v2 Relay protocol]{@link https://rfc.vac.dev/spec/11/}.
 * Must be passed as a `pubsub` module to a {Libp2p} instance.
 *
 * @implements {Pubsub}
 * @noInheritDoc
 */
export class WakuRelay extends Gossipsub {
    constructor(libp2p, options) {
        super(libp2p, Object.assign(options, {
            // Ensure that no signature is included nor expected in the messages.
            globalSignaturePolicy: SignaturePolicy.StrictNoSign,
        }));
        this.heartbeat = new RelayHeartbeat(this);
        this.observers = {};
        const multicodecs = [constants.RelayCodec];
        Object.assign(this, { multicodecs });
        if (options?.pubsubTopic) {
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
        return getRelayPeers(this, this.pubsubTopic, this._options.D, (id) => {
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
            const wakuMsg = WakuMessage.decode(event.data);
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
                getRelayPeers(this, topic, this._options.D - fanoutPeers.size, (id) => {
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
            const peers = getRelayPeers(this, topic, this._options.D, (id) => {
                // filter direct peers and peers with negative score
                return !this.direct.has(id) && this.score.score(id) >= 0;
            });
            this.mesh.set(topic, peers);
        }
        this.mesh.get(topic)?.forEach((id) => {
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
        const msgIdStr = messageIdToString(msgID);
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
                    const peers = getRelayPeers(this, topic, this._options.D, (id) => {
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
            meshPeers?.forEach((peer) => {
                toSend.add(peer);
            });
        });
        // Publish messages to peers
        const rpc = createGossipRpc([Gossipsub.utils.normalizeOutRpcMessage(msg)]);
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
        shuffle(messageIDs);
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
            shuffle(peersToGossip);
        }
        // Emit the IHAVE gossip to the selected peers up to the target
        peersToGossip.slice(0, target).forEach((id) => {
            let peerMessageIDs = messageIDs;
            if (messageIDs.length > constants.RelayMaxIHaveLength) {
                // shuffle and slice message IDs per peer so that we emit a different set for each peer
                // we have enough redundancy in the system that this will significantly increase the message
                // coverage when we do truncate
                peerMessageIDs = shuffle(peerMessageIDs.slice()).slice(0, constants.RelayMaxIHaveLength);
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
            const peers = getRelayPeers(this, topic, constants.RelayPrunePeers, (xid) => {
                return xid !== id && this.score.score(xid) >= 0;
            });
            peers.forEach((p) => {
                // see if we have a signed record to send back; if we don't, just send
                // the peer ID and let the pruned peer find them in the DHT -- we can't trust
                // unsigned address records through PX anyways
                // Finding signed records in the DHT is not supported at the time of writing in js-libp2p
                const peerId = PeerId.createFromB58String(p);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3dha3VfcmVsYXkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sa0JBQWtCLENBQUM7QUFRekMsT0FBTyxFQUNMLGVBQWUsRUFDZixpQkFBaUIsRUFDakIsT0FBTyxHQUNSLE1BQU0sNEJBQTRCLENBQUM7QUFFcEMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ2hGLE9BQU8sTUFBTSxNQUFNLFNBQVMsQ0FBQztBQUc3QixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFOUMsT0FBTyxLQUFLLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDekMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUM3RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRW5ELE9BQU8sRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQztBQTBCMUM7Ozs7OztHQU1HO0FBQ0gsTUFBTSxPQUFPLFNBQVUsU0FBUSxTQUFTO0lBV3RDLFlBQ0UsTUFBYyxFQUNkLE9BQWdEO1FBRWhELEtBQUssQ0FDSCxNQUFNLEVBQ04sTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDckIscUVBQXFFO1lBQ3JFLHFCQUFxQixFQUFFLGVBQWUsQ0FBQyxZQUFZO1NBQ3BELENBQUMsQ0FDSCxDQUFDO1FBRUYsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUVwQixNQUFNLFdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUUz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