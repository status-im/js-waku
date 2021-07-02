/**
 * @hidden
 * @module
 */
import { Heartbeat } from 'libp2p-gossipsub/src/heartbeat';
import { shuffle } from 'libp2p-gossipsub/src/utils';
import * as constants from './constants';
import { getRelayPeers } from './get_relay_peers';
export class RelayHeartbeat extends Heartbeat {
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
            heartbeat();
            this._heartbeatTimer?.runPeriodically(heartbeat, constants.RelayHeartbeatInterval);
        }, constants.RelayHeartbeatInitialDelay);
        this._heartbeatTimer = {
            _intervalId: undefined,
            runPeriodically: (fn, period) => {
                // this._heartbeatTimer cannot be null, it is being assigned.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this._heartbeatTimer._intervalId = setInterval(fn, period);
            },
            cancel: () => {
                clearTimeout(timeout);
                clearInterval(this._heartbeatTimer?._intervalId);
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
                const peersSet = getRelayPeers(this.gossipsub, topic, ineed, (id) => {
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
                    .concat(shuffle(peersArray.slice(Dscore)));
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
                    getRelayPeers(this.gossipsub, topic, ineed, (id) => {
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
                    const peersToGraft = getRelayPeers(this.gossipsub, topic, constants.RelayOpportunisticGraftPeers, (id) => {
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
                if (!topicPeers?.has(id) ||
                    getScore(id) <
                        this.gossipsub._options.scoreThresholds.publishThreshold) {
                    fanoutPeers.delete(id);
                }
            });
            // do we need more peers?
            if (fanoutPeers.size < D) {
                const ineed = D - fanoutPeers.size;
                const peersSet = getRelayPeers(this.gossipsub, topic, ineed, (id) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsYXlfaGVhcnRiZWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi93YWt1X3JlbGF5L3JlbGF5X2hlYXJ0YmVhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFHSCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDM0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRXJELE9BQU8sS0FBSyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVsRCxNQUFNLE9BQU8sY0FBZSxTQUFRLFNBQVM7SUFDM0M7OztPQUdHO0lBQ0gsWUFBWSxTQUFvQjtRQUM5QixLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDeEIsT0FBTztTQUNSO1FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFN0MsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUM5QixTQUFTLEVBQUUsQ0FBQztZQUNaLElBQUksQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUNuQyxTQUFTLEVBQ1QsU0FBUyxDQUFDLHNCQUFzQixDQUNqQyxDQUFDO1FBQ0osQ0FBQyxFQUFFLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxlQUFlLEdBQUc7WUFDckIsV0FBVyxFQUFFLFNBQVM7WUFDdEIsZUFBZSxFQUFFLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBUSxFQUFFO2dCQUNwQyw2REFBNkQ7Z0JBQzdELG9FQUFvRTtnQkFDcEUsSUFBSSxDQUFDLGVBQWdCLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxFQUFFLEVBQUUs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