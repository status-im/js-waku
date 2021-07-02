"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayMaxIHaveLength = exports.RelayOpportunisticGraftPeers = exports.RelayOpportunisticGraftTicks = exports.RelayFanoutTTL = exports.RelayPruneBackoff = exports.RelayPrunePeers = exports.RelayHeartbeatInterval = exports.RelayHeartbeatInitialDelay = exports.RelayGossipFactor = exports.DefaultPubsubTopic = exports.RelayCodec = exports.minute = exports.second = void 0;
exports.second = 1000;
exports.minute = 60 * exports.second;
/**
 * RelayCodec is the libp2p identifier for the waku relay protocol
 */
exports.RelayCodec = '/vac/waku/relay/2.0.0-beta2';
/**
 * RelayDefaultTopic is the default gossipsub topic to use for waku relay
 */
exports.DefaultPubsubTopic = '/waku/2/default-waku/proto';
/**
 * RelayGossipFactor affects how many peers we will emit gossip to at each heartbeat.
 * We will send gossip to RelayGossipFactor * (total number of non-mesh peers), or
 * RelayDlazy, whichever is greater.
 */
exports.RelayGossipFactor = 0.25;
/**
 * GossipsubHeartbeatInitialDelay is the short delay before the heartbeat timer begins
 * after the router is initialized.
 */
exports.RelayHeartbeatInitialDelay = 100;
/**
 * RelayHeartbeatInterval controls the time between heartbeats.
 */
exports.RelayHeartbeatInterval = exports.second;
/**
 * RelayPrunePeers controls the number of peers to include in prune Peer eXchange.
 * When we prune a peer that's eligible for PX (has a good score, etc), we will try to
 * send them signed peer records for up to RelayPrunePeers other peers that we
 * know of.
 */
exports.RelayPrunePeers = 16;
/**
 * RelayPruneBackoff controls the backoff time for pruned peers. This is how long
 * a peer must wait before attempting to graft into our mesh again after being pruned.
 * When pruning a peer, we send them our value of RelayPruneBackoff so they know
 * the minimum time to wait. Peers running older versions may not send a backoff time,
 * so if we receive a prune message without one, we will wait at least RelayPruneBackoff
 * before attempting to re-graft.
 */
exports.RelayPruneBackoff = exports.minute;
/**
 * RelayFanoutTTL controls how long we keep track of the fanout state. If it's been
 * RelayFanoutTTL since we've published to a topic that we're not subscribed to,
 * we'll delete the fanout map for that topic.
 */
exports.RelayFanoutTTL = exports.minute;
/**
 * RelayOpportunisticGraftTicks is the number of heartbeat ticks for attempting to improve the mesh
 * with opportunistic grafting. Every RelayOpportunisticGraftTicks we will attempt to select some
 * high-scoring mesh peers to replace lower-scoring ones, if the median score of our mesh peers falls
 * below a threshold
 */
exports.RelayOpportunisticGraftTicks = 60;
/**
 * RelayOpportunisticGraftPeers is the number of peers to opportunistically graft.
 */
exports.RelayOpportunisticGraftPeers = 2;
/**
 * RelayMaxIHaveLength is the maximum number of messages to include in an IHAVE message.
 * Also controls the maximum number of IHAVE ids we will accept and request with IWANT from a
 * peer within a heartbeat, to protect from IHAVE floods. You should adjust this value from the
 * default if your system is pushing more than 5000 messages in GossipsubHistoryGossip heartbeats;
 * with the defaults this is 1666 messages/s.
 */
exports.RelayMaxIHaveLength = 5000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi93YWt1X3JlbGF5L2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBYSxRQUFBLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDZCxRQUFBLE1BQU0sR0FBRyxFQUFFLEdBQUcsY0FBTSxDQUFDO0FBRWxDOztHQUVHO0FBQ1UsUUFBQSxVQUFVLEdBQUcsNkJBQTZCLENBQUM7QUFFeEQ7O0dBRUc7QUFDVSxRQUFBLGtCQUFrQixHQUFHLDRCQUE0QixDQUFDO0FBRS9EOzs7O0dBSUc7QUFDVSxRQUFBLGlCQUFpQixHQUFHLElBQUksQ0FBQztBQUV0Qzs7O0dBR0c7QUFDVSxRQUFBLDBCQUEwQixHQUFHLEdBQUcsQ0FBQztBQUU5Qzs7R0FFRztBQUNVLFFBQUEsc0JBQXNCLEdBQUcsY0FBTSxDQUFDO0FBRTdDOzs7OztHQUtHO0FBQ1UsUUFBQSxlQUFlLEdBQUcsRUFBRSxDQUFDO0FBRWxDOzs7Ozs7O0dBT0c7QUFDVSxRQUFBLGlCQUFpQixHQUFHLGNBQU0sQ0FBQztBQUV4Qzs7OztHQUlHO0FBQ1UsUUFBQSxjQUFjLEdBQUcsY0FBTSxDQUFDO0FBRXJDOzs7OztHQUtHO0FBQ1UsUUFBQSw0QkFBNEIsR0FBRyxFQUFFLENBQUM7QUFFL0M7O0dBRUc7QUFDVSxRQUFBLDRCQUE0QixHQUFHLENBQUMsQ0FBQztBQUU5Qzs7Ozs7O0dBTUc7QUFDVSxRQUFBLG1CQUFtQixHQUFHLElBQUksQ0FBQyJ9