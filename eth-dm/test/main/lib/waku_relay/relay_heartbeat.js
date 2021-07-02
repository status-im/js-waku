"use strict";
/**
 * @hidden
 * @module
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayHeartbeat = void 0;
const heartbeat_1 = require("libp2p-gossipsub/src/heartbeat");
const utils_1 = require("libp2p-gossipsub/src/utils");
const constants = __importStar(require("./constants"));
const get_relay_peers_1 = require("./get_relay_peers");
class RelayHeartbeat extends heartbeat_1.Heartbeat {
    /**
     * @param {Object} gossipsub
     * @constructor
     */
    constructor(gossipsub) {
        super(gossipsub);
    }
    start() {
        if (this._heartbeatTimer) {
            return;
        }
        const heartbeat = this._heartbeat.bind(this);
        const timeout = setTimeout(() => {
            var _a;
            heartbeat();
            (_a = this._heartbeatTimer) === null || _a === void 0 ? void 0 : _a.runPeriodically(heartbeat, constants.RelayHeartbeatInterval);
        }, constants.RelayHeartbeatInitialDelay);
        this._heartbeatTimer = {
            _intervalId: undefined,
            runPeriodically: (fn, period) => {
                // this._heartbeatTimer cannot be null, it is being assigned.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this._heartbeatTimer._intervalId = setInterval(fn, period);
            },
            cancel: () => {
                var _a;
                clearTimeout(timeout);
                clearInterval((_a = this._heartbeatTimer) === null || _a === void 0 ? void 0 : _a._intervalId);
            },
        };
    }
    /**
     * Unmounts the gossipsub protocol and shuts down every connection
     * @override
     * @returns {void}
     */
    stop() {
        if (!this._heartbeatTimer) {
            return;
        }
        this._heartbeatTimer.cancel();
        this._heartbeatTimer = null;
    }
    /**
     * Maintains the mesh and fanout maps in gossipsub.
     *
     * @returns {void}
     */
    _heartbeat() {
        const { D, Dlo, Dhi, Dscore, Dout } = this.gossipsub._options;
        this.gossipsub.heartbeatTicks++;
        // cache scores through the heartbeat
        const scores = new Map();
        const getScore = (id) => {
            let s = scores.get(id);
            if (s === undefined) {
                s = this.gossipsub.score.score(id);
                scores.set(id, s);
            }
            return s;
        };
        // peer id => topic[]
        const toGraft = new Map();
        // peer id => topic[]
        const toPrune = new Map();
        // peer id => don't px
        const noPX = new Map();
        // clean up expired backoffs
        this.gossipsub._clearBackoff();
        // clean up peerhave/iasked counters
        this.gossipsub.peerhave.clear();
        this.gossipsub.iasked.clear();
        // apply IWANT request penalties
        this.gossipsub._applyIwantPenalties();
        // ensure direct peers are connected
        this.gossipsub._directConnect();
        // maintain the mesh for topics we have joined
        this.gossipsub.mesh.forEach((peers, topic) => {
            // prune/graft helper functions (defined per topic)
            const prunePeer = (id) => {
                this.gossipsub.log('HEARTBEAT: Remove mesh link to %s in %s', id, topic);
                // update peer score
                this.gossipsub.score.prune(id, topic);
                // add prune backoff record
                this.gossipsub._addBackoff(id, topic);
                // remove peer from mesh
                peers.delete(id);
                // add to toPrune
                const topics = toPrune.get(id);
                if (!topics) {
                    toPrune.set(id, [topic]);
                }
                else {
                    topics.push(topic);
                }
            };
            const graftPeer = (id) => {
                this.gossipsub.log('HEARTBEAT: Add mesh link to %s in %s', id, topic);
                // update peer score
                this.gossipsub.score.graft(id, topic);
                // add peer to mesh
                peers.add(id);
                // add to toGraft
                const topics = toGraft.get(id);
                if (!topics) {
                    toGraft.set(id, [topic]);
                }
                else {
                    topics.push(topic);
                }
            };
            // drop all peers with negative score, without PX
            peers.forEach((id) => {
                const score = getScore(id);
                if (score < 0) {
                    this.gossipsub.log('HEARTBEAT: Prune peer %s with negative score: score=%d, topic=%s', id, score, topic);
                    prunePeer(id);
                    noPX.set(id, true);
                }
            });
            // do we have enough peers?
            if (peers.size < Dlo) {
                const backoff = this.gossipsub.backoff.get(topic);
                const ineed = D - peers.size;
                const peersSet = get_relay_peers_1.getRelayPeers(this.gossipsub, topic, ineed, (id) => {
                    // filter out mesh peers, direct peers, peers we are backing off, peers with negative score
                    return (!peers.has(id) &&
                        !this.gossipsub.direct.has(id) &&
                        (!backoff || !backoff.has(id)) &&
                        getScore(id) >= 0);
                });
                peersSet.forEach(graftPeer);
            }
            // do we have to many peers?
            if (peers.size > Dhi) {
                let peersArray = Array.from(peers);
                // sort by score
                peersArray.sort((a, b) => getScore(b) - getScore(a));
                // We keep the first D_score peers by score and the remaining up to D randomly
                // under the constraint that we keep D_out peers in the mesh (if we have that many)
                peersArray = peersArray
                    .slice(0, Dscore)
                    .concat(utils_1.shuffle(peersArray.slice(Dscore)));
                // count the outbound peers we are keeping
                let outbound = 0;
                peersArray.slice(0, D).forEach((p) => {
                    if (this.gossipsub.outbound.get(p)) {
                        outbound++;
                    }
                });
                // if it's less than D_out, bubble up some outbound peers from the random selection
                if (outbound < Dout) {
                    const rotate = (i) => {
                        // rotate the peersArray to the right and put the ith peer in the front
                        const p = peersArray[i];
                        for (let j = i; j > 0; j--) {
                            peersArray[j] = peersArray[j - 1];
                        }
                        peersArray[0] = p;
                    };
                    // first bubble up all outbound peers already in the selection to the front
                    if (outbound > 0) {
                        let ihave = outbound;
                        for (let i = 1; i < D && ihave > 0; i++) {
                            if (this.gossipsub.outbound.get(peersArray[i])) {
                                rotate(i);
                                ihave--;
                            }
                        }
                    }
                    // now bubble up enough outbound peers outside the selection to the front
                    let ineed = D - outbound;
                    for (let i = D; i < peersArray.length && ineed > 0; i++) {
                        if (this.gossipsub.outbound.get(peersArray[i])) {
                            rotate(i);
                            ineed--;
                        }
                    }
                }
                // prune the excess peers
                peersArray.slice(D).forEach(prunePeer);
            }
            // do we have enough outbound peers?
            if (peers.size >= Dlo) {
                // count the outbound peers we have
                let outbound = 0;
                peers.forEach((p) => {
                    if (this.gossipsub.outbound.get(p)) {
                        outbound++;
                    }
                });
                // if it's less than D_out, select some peers with outbound connections and graft them
                if (outbound < Dout) {
                    const ineed = Dout - outbound;
                    const backoff = this.gossipsub.backoff.get(topic);
                    get_relay_peers_1.getRelayPeers(this.gossipsub, topic, ineed, (id) => {
                        // filter our current mesh peers, direct peers, peers we are backing off, peers with negative score
                        return (!peers.has(id) &&
                            !this.gossipsub.direct.has(id) &&
                            (!backoff || !backoff.has(id)) &&
                            getScore(id) >= 0);
                    }).forEach(graftPeer);
                }
            }
            // should we try to improve the mesh with opportunistic grafting?
            if (this.gossipsub.heartbeatTicks %
                constants.RelayOpportunisticGraftTicks ===
                0 &&
                peers.size > 1) {
                // Opportunistic grafting works as follows: we check the median score of peers in the
                // mesh; if this score is below the opportunisticGraftThreshold, we select a few peers at
                // random with score over the median.
                // The intention is to (slowly) improve an under performing mesh by introducing good
                // scoring peers that may have been gossiping at us. This allows us to get out of sticky
                // situations where we are stuck with poor peers and also recover from churn of good peers.
                // now compute the median peer score in the mesh
                const peersList = Array.from(peers).sort((a, b) => getScore(a) - getScore(b));
                const medianIndex = peers.size / 2;
                const medianScore = getScore(peersList[medianIndex]);
                // if the median score is below the threshold, select a better peer (if any) and GRAFT
                if (medianScore <
                    this.gossipsub._options.scoreThresholds.opportunisticGraftThreshold) {
                    const backoff = this.gossipsub.backoff.get(topic);
                    const peersToGraft = get_relay_peers_1.getRelayPeers(this.gossipsub, topic, constants.RelayOpportunisticGraftPeers, (id) => {
                        // filter out current mesh peers, direct peers, peers we are backing off, peers below or at threshold
                        return (peers.has(id) &&
                            !this.gossipsub.direct.has(id) &&
                            (!backoff || !backoff.has(id)) &&
                            getScore(id) > medianScore);
                    });
                    peersToGraft.forEach((id) => {
                        this.gossipsub.log('HEARTBEAT: Opportunistically graft peer %s on topic %s', id, topic);
                        graftPeer(id);
                    });
                }
            }
            // 2nd arg are mesh peers excluded from gossip. We have already pushed
            // messages to them, so its redundant to gossip IHAVEs.
            this.gossipsub._emitGossip(topic, peers);
        });
        // expire fanout for topics we haven't published to in a while
        const now = this.gossipsub._now();
        this.gossipsub.lastpub.forEach((lastpub, topic) => {
            if (lastpub + constants.RelayFanoutTTL < now) {
                this.gossipsub.fanout.delete(topic);
                this.gossipsub.lastpub.delete(topic);
            }
        });
        // maintain our fanout for topics we are publishing but we have not joined
        this.gossipsub.fanout.forEach((fanoutPeers, topic) => {
            // checks whether our peers are still in the topic and have a score above the publish threshold
            const topicPeers = this.gossipsub.topics.get(topic);
            fanoutPeers.forEach((id) => {
                if (!(topicPeers === null || topicPeers === void 0 ? void 0 : topicPeers.has(id)) ||
                    getScore(id) <
                        this.gossipsub._options.scoreThresholds.publishThreshold) {
                    fanoutPeers.delete(id);
                }
            });
            // do we need more peers?
            if (fanoutPeers.size < D) {
                const ineed = D - fanoutPeers.size;
                const peersSet = get_relay_peers_1.getRelayPeers(this.gossipsub, topic, ineed, (id) => {
                    // filter out existing fanout peers, direct peers, and peers with score above the publish threshold
                    return (!fanoutPeers.has(id) &&
                        !this.gossipsub.direct.has(id) &&
                        getScore(id) >=
                            this.gossipsub._options.scoreThresholds.publishThreshold);
                });
                peersSet.forEach((id) => {
                    fanoutPeers.add(id);
                });
            }
            // 2nd arg are fanout peers excluded from gossip.
            // We have already pushed messages to them, so its redundant to gossip IHAVEs
            this.gossipsub._emitGossip(topic, fanoutPeers);
        });
        // send coalesced GRAFT/PRUNE messages (will piggyback gossip)
        this.gossipsub._sendGraftPrune(toGraft, toPrune, noPX);
        // flush pending gossip that wasn't piggybacked above
        this.gossipsub._flush();
        // advance the message history window
        this.gossipsub.messageCache.shift();
        this.gossipsub.emit('gossipsub:heartbeat');
    }
}
exports.RelayHeartbeat = RelayHeartbeat;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsYXlfaGVhcnRiZWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi93YWt1X3JlbGF5L3JlbGF5X2hlYXJ0YmVhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0gsOERBQTJEO0FBQzNELHNEQUFxRDtBQUVyRCx1REFBeUM7QUFDekMsdURBQWtEO0FBRWxELE1BQWEsY0FBZSxTQUFRLHFCQUFTO0lBQzNDOzs7T0FHRztJQUNILFlBQVksU0FBb0I7UUFDOUIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFFRCxLQUFLO1FBQ0gsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3hCLE9BQU87U0FDUjtRQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTdDLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7O1lBQzlCLFNBQVMsRUFBRSxDQUFDO1lBQ1osTUFBQSxJQUFJLENBQUMsZUFBZSwwQ0FBRSxlQUFlLENBQ25DLFNBQVMsRUFDVCxTQUFTLENBQUMsc0JBQXNCLENBQ2pDLENBQUM7UUFDSixDQUFDLEVBQUUsU0FBUyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFFekMsSUFBSSxDQUFDLGVBQWUsR0FBRztZQUNyQixXQUFXLEVBQUUsU0FBUztZQUN0QixlQUFlLEVBQUUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFRLEVBQUU7Z0JBQ3BDLDZEQUE2RDtnQkFDN0Qsb0VBQW9FO2dCQUNwRSxJQUFJLENBQUMsZUFBZ0IsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5RCxDQUFDO1lBQ0QsTUFBTSxFQUFFLEdBQVMsRUFBRTs7Z0JBQ2pCLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFD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