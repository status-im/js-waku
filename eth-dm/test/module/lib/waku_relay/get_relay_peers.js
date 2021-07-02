import { shuffle } from 'libp2p-gossipsub/src/utils';
import { RelayCodec } from './index';
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
export function getRelayPeers(router, topic, count, filter = () => true) {
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
        if (peerStreams.protocol == RelayCodec && filter(id)) {
            peers.push(id);
        }
    });
    // Pseudo-randomly shuffles peers
    peers = shuffle(peers);
    if (count > 0 && peers.length > count) {
        peers = peers.slice(0, count);
    }
    return new Set(peers);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0X3JlbGF5X3BlZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi93YWt1X3JlbGF5L2dldF9yZWxheV9wZWVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFckQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUVyQzs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxVQUFVLGFBQWEsQ0FDM0IsTUFBaUIsRUFDakIsS0FBYSxFQUNiLEtBQWEsRUFDYixTQUFrQyxHQUFZLEVBQUUsQ0FBQyxJQUFJO0lBRXJELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlDLElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDakIsT0FBTyxJQUFJLEdBQUcsRUFBRSxDQUFDO0tBQ2xCO0lBRUQsb0NBQW9DO0lBQ3BDLHFDQUFxQztJQUNyQyxJQUFJLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDekIsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQVUsRUFBRSxFQUFFO1FBQ2xDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDaEIsT0FBTztTQUNSO1FBQ0QsSUFBSSxXQUFXLENBQUMsUUFBUSxJQUFJLFVBQVUsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDcEQsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNoQjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsaUNBQWlDO0lBQ2pDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxFQUFFO1FBQ3JDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUMvQjtJQUVELE9BQU8sSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDeEIsQ0FBQyJ9