import concat from 'it-concat';
import lp from 'it-length-prefixed';
import pipe from 'it-pipe';
import { selectRandomPeer } from '../select_peer';
import { WakuMessage } from '../waku_message';
import { DefaultPubsubTopic } from '../waku_relay';
import { Direction, HistoryRPC } from './history_rpc';
export const StoreCodec = '/vac/waku/store/2.0.0-beta3';
export { Direction };
/**
 * Implements the [Waku v2 Store protocol](https://rfc.vac.dev/spec/13/).
 */
export class WakuStore {
    constructor(libp2p, options) {
        this.libp2p = libp2p;
        if (options?.pubsubTopic) {
            this.pubsubTopic = options.pubsubTopic;
        }
        else {
            this.pubsubTopic = DefaultPubsubTopic;
        }
    }
    /**
     * Query given peer using Waku Store.
     *
     * @param options
     * @param options.peerId The peer to query.Options
     * @param options.contentTopics The content topics to pass to the query, leave empty to
     * retrieve all messages.
     * @param options.pubsubTopic The pubsub topic to pass to the query. Defaults
     * to the value set at creation. See [Waku v2 Topic Usage Recommendations](https://rfc.vac.dev/spec/23/).
     * @param options.callback Callback called on page of stored messages as they are retrieved
     * @throws If not able to reach the peer to query.
     */
    async queryHistory(options) {
        const opts = Object.assign({
            pubsubTopic: this.pubsubTopic,
            direction: Direction.BACKWARD,
            pageSize: 10,
        }, options);
        let peer;
        if (opts.peerId) {
            peer = this.libp2p.peerStore.get(opts.peerId);
            if (!peer)
                throw 'Peer is unknown';
        }
        else {
            peer = selectRandomPeer(this.libp2p, StoreCodec);
        }
        if (!peer)
            throw 'No peer available';
        if (!peer.protocols.includes(StoreCodec))
            throw 'Peer does not register waku store protocol';
        const connection = this.libp2p.connectionManager.get(peer.id);
        if (!connection)
            throw 'Failed to get a connection to the peer';
        const messages = [];
        let cursor = undefined;
        while (true) {
            try {
                const { stream } = await connection.newStream(StoreCodec);
                try {
                    const queryOpts = Object.assign(opts, { cursor });
                    const historyRpcQuery = HistoryRPC.createQuery(queryOpts);
                    const res = await pipe([historyRpcQuery.encode()], lp.encode(), stream, lp.decode(), concat);
                    try {
                        const reply = HistoryRPC.decode(res.slice());
                        const response = reply.response;
                        if (!response) {
                            console.log('No response in HistoryRPC');
                            return null;
                        }
                        if (!response.messages || !response.messages.length) {
                            // No messages left (or stored)
                            console.log('No messages present in HistoryRPC response');
                            return messages;
                        }
                        const pageMessages = response.messages.map((protoMsg) => {
                            return new WakuMessage(protoMsg);
                        });
                        if (opts.callback) {
                            // TODO: Test the callback feature
                            opts.callback(pageMessages);
                        }
                        pageMessages.forEach((wakuMessage) => {
                            messages.push(wakuMessage);
                        });
                        const responsePageSize = response.pagingInfo?.pageSize;
                        const queryPageSize = historyRpcQuery.query?.pagingInfo?.pageSize;
                        if (responsePageSize &&
                            queryPageSize &&
                            responsePageSize < queryPageSize) {
                            // Response page size smaller than query, meaning this is the last page
                            return messages;
                        }
                        cursor = response.pagingInfo?.cursor;
                        if (cursor === undefined) {
                            // If the server does not return cursor then there is an issue,
                            // Need to abort or we end up in an infinite loop
                            console.log('No cursor returned by peer.');
                            return messages;
                        }
                    }
                    catch (err) {
                        console.log('Failed to decode store reply', err);
                    }
                }
                catch (err) {
                    console.log('Failed to send waku store query', err);
                }
            }
            catch (err) {
                console.log('Failed to negotiate waku store protocol stream with peer', err);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3dha3Vfc3RvcmUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3BDLE9BQU8sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUkzQixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDOUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRW5ELE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXRELE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyw2QkFBNkIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUM7QUF1QnJCOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFNBQVM7SUFHcEIsWUFBbUIsTUFBYyxFQUFFLE9BQXVCO1FBQXZDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDL0IsSUFBSSxPQUFPLEVBQUUsV0FBVyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztTQUN4QzthQUFNO1lBQ0wsSUFBSSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQztTQUN2QztJQUNILENBQUM7SUFFRDs7Ozs7Ozs7Ozs7T0FXRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBcUI7UUFDdEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FDeEI7WUFDRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsU0FBUyxFQUFFLFNBQVMsQ0FBQyxRQUFRO1lBQzdCLFFBQVEsRUFBRSxFQUFFO1NBQ2IsRUFDRCxPQUFPLENBQ1IsQ0FB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