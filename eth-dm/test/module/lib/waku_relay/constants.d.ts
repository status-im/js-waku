export declare const second = 1000;
export declare const minute: number;
/**
 * RelayCodec is the libp2p identifier for the waku relay protocol
 */
export declare const RelayCodec = "/vac/waku/relay/2.0.0-beta2";
/**
 * RelayDefaultTopic is the default gossipsub topic to use for waku relay
 */
export declare const DefaultPubsubTopic = "/waku/2/default-waku/proto";
/**
 * RelayGossipFactor affects how many peers we will emit gossip to at each heartbeat.
 * We will send gossip to RelayGossipFactor * (total number of non-mesh peers), or
 * RelayDlazy, whichever is greater.
 */
export declare const RelayGossipFactor = 0.25;
/**
 * GossipsubHeartbeatInitialDelay is the short delay before the heartbeat timer begins
 * after the router is initialized.
 */
export declare const RelayHeartbeatInitialDelay = 100;
/**
 * RelayHeartbeatInterval controls the time between heartbeats.
 */
export declare const RelayHeartbeatInterval = 1000;
/**
 * RelayPrunePeers controls the number of peers to include in prune Peer eXchange.
 * When we prune a peer that's eligible for PX (has a good score, etc), we will try to
 * send them signed peer records for up to RelayPrunePeers other peers that we
 * know of.
 */
export declare const RelayPrunePeers = 16;
/**
 * RelayPruneBackoff controls the backoff time for pruned peers. This is how long
 * a peer must wait before attempting to graft into our mesh again after being pruned.
 * When pruning a peer, we send them our value of RelayPruneBackoff so they know
 * the minimum time to wait. Peers running older versions may not send a backoff time,
 * so if we receive a prune message without one, we will wait at least RelayPruneBackoff
 * before attempting to re-graft.
 */
export declare const RelayPruneBackoff: number;
/**
 * RelayFanoutTTL controls how long we keep track of the fanout state. If it's been
 * RelayFanoutTTL since we've published to a topic that we're not subscribed to,
 * we'll delete the fanout map for that topic.
 */
export declare const RelayFanoutTTL: number;
/**
 * RelayOpportunisticGraftTicks is the number of heartbeat ticks for attempting to improve the mesh
 * with opportunistic grafting. Every RelayOpportunisticGraftTicks we will attempt to select some
 * high-scoring mesh peers to replace lower-scoring ones, if the median score of our mesh peers falls
 * below a threshold
 */
export declare const RelayOpportunisticGraftTicks = 60;
/**
 * RelayOpportunisticGraftPeers is the number of peers to opportunistically graft.
 */
export declare const RelayOpportunisticGraftPeers = 2;
/**
 * RelayMaxIHaveLength is the maximum number of messages to include in an IHAVE message.
 * Also controls the maximum number of IHAVE ids we will accept and request with IWANT from a
 * peer within a heartbeat, to protect from IHAVE floods. You should adjust this value from the
 * default if your system is pushing more than 5000 messages in GossipsubHistoryGossip heartbeats;
 * with the defaults this is 1666 messages/s.
 */
export declare const RelayMaxIHaveLength = 5000;
