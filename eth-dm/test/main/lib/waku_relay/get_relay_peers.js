"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelayPeers = void 0;
const utils_1 = require("libp2p-gossipsub/src/utils");
const index_1 = require("./index");
/**
 * Given a topic, returns up to count peers subscribed to that topic
 * that pass an optional filter function
 *
 * @param {Gossipsub} router
 * @param {String} topic
 * @param {Number} count
 * @param {Function} [filter] a function to filter acceptable peers
 * @returns {Set<string>}
 *
 */
function getRelayPeers(router, topic, count, filter = () => true) {
    const peersInTopic = router.topics.get(topic);
    if (!peersInTopic) {
        return new Set();
    }
    // Adds all peers using our protocol
    // that also pass the filter function
    let peers = [];
    peersInTopic.forEach((id) => {
        const peerStreams = router.peers.get(id);
        if (!peerStreams) {
            return;
        }
        if (peerStreams.protocol == index_1.RelayCodec && filter(id)) {
            peers.push(id);
        }
    });
    // Pseudo-randomly shuffles peers
    peers = utils_1.shuffle(peers);
    if (count > 0 && peers.length > count) {
        peers = peers.slice(0, count);
    }
    return new Set(peers);
}
exports.getRelayPeers = getRelayPeers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0X3JlbGF5X3BlZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi93YWt1X3JlbGF5L2dldF9yZWxheV9wZWVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxzREFBcUQ7QUFFckQsbUNBQXFDO0FBRXJDOzs7Ozs7Ozs7O0dBVUc7QUFDSCxTQUFnQixhQUFhLENBQzNCLE1BQWlCLEVBQ2pCLEtBQWEsRUFDYixLQUFhLEVBQ2IsU0FBa0MsR0FBWSxFQUFFLENBQUMsSUFBSTtJQUVyRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QyxJQUFJLENBQUMsWUFBWSxFQUFFO1FBQ2pCLE9BQU8sSUFBSSxHQUFHLEVBQUUsQ0FBQztLQUNsQjtJQUVELG9DQUFvQztJQUNwQyxxQ0FBcUM7SUFDckMsSUFBSSxLQUFLLEdBQWEsRUFBRSxDQUFDO0lBQ3pCLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFVLEVBQUUsRUFBRTtRQUNsQyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2hCLE9BQU87U0FDUjtRQUNELElBQUksV0FBVyxDQUFDLFFBQVEsSUFBSSxrQkFBVSxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNwRCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2hCO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxpQ0FBaUM7SUFDakMsS0FBSyxHQUFHLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2QixJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLEVBQUU7UUFDckMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQy9CO0lBRUQsT0FBTyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN4QixDQUFDO0FBL0JELHNDQStCQyJ9