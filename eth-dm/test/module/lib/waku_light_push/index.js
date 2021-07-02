import concat from 'it-concat';
import lp from 'it-length-prefixed';
import pipe from 'it-pipe';
import { PushResponse } from '../../proto/waku/v2/light_push';
import { selectRandomPeer } from '../select_peer';
import { DefaultPubsubTopic } from '../waku_relay';
import { PushRPC } from './push_rpc';
export const LightPushCodec = '/vac/waku/lightpush/2.0.0-beta1';
export { PushResponse };
/**
 * Implements the [Waku v2 Light Push protocol](https://rfc.vac.dev/spec/19/).
 */
export class WakuLightPush {
    constructor(libp2p, options) {
        this.libp2p = libp2p;
        if (options?.pubsubTopic) {
            this.pubsubTopic = options.pubsubTopic;
        }
        else {
            this.pubsubTopic = DefaultPubsubTopic;
        }
    }
    async push(message, opts) {
        let peer;
        if (opts?.peerId) {
            peer = this.libp2p.peerStore.get(opts.peerId);
            if (!peer)
                throw 'Peer is unknown';
        }
        else {
            peer = selectRandomPeer(this.libp2p, LightPushCodec);
        }
        if (!peer)
            throw 'No peer available';
        if (!peer.protocols.includes(LightPushCodec))
            throw 'Peer does not register waku light push protocol';
        const connection = this.libp2p.connectionManager.get(peer.id);
        if (!connection)
            throw 'Failed to get a connection to the peer';
        const { stream } = await connection.newStream(LightPushCodec);
        try {
            const pubsubTopic = opts?.pubsubTopic
                ? opts.pubsubTopic
                : this.pubsubTopic;
            const query = PushRPC.createRequest(message, pubsubTopic);
            const res = await pipe([query.encode()], lp.encode(), stream, lp.decode(), concat);
            try {
                const response = PushRPC.decode(res.slice()).response;
                if (!response) {
                    console.log('No response in PushRPC');
                    return null;
                }
                return response;
            }
            catch (err) {
                console.log('Failed to decode push reply', err);
            }
        }
        catch (err) {
            console.log('Failed to send waku light push request', err);
        }
        return null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3dha3VfbGlnaHRfcHVzaC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sTUFBTSxXQUFXLENBQUM7QUFDL0IsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDcEMsT0FBTyxJQUFJLE1BQU0sU0FBUyxDQUFDO0FBSTNCLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUM5RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFbkQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVyQyxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsaUNBQWlDLENBQUM7QUFDaEUsT0FBTyxFQUFFLFlBQVksRUFBRSxDQUFDO0FBbUJ4Qjs7R0FFRztBQUNILE1BQU0sT0FBTyxhQUFhO0lBR3hCLFlBQW1CLE1BQWMsRUFBRSxPQUF1QjtRQUF2QyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQy9CLElBQUksT0FBTyxFQUFFLFdBQVcsRUFBRTtZQUN4QixJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7U0FDeEM7YUFBTTtZQUNMLElBQUksQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLENBQUM7U0FDdkM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FDUixPQUFvQixFQUNwQixJQUFrQjtRQUVsQixJQUFJLElBQUksQ0FBQztRQUNULElBQUksSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUNoQixJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsSUFBSTtnQkFBRSxNQUFNLGlCQUFpQixDQUFDO1NBQ3BDO2FBQU07WUFDTCxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztTQUN0RDtRQUNELElBQUksQ0FBQyxJQUFJO1lBQUUsTUFBTSxtQkFBbUIsQ0FBQztRQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO1lBQzFDLE1BQU0saURBQWlELENBQUM7UUFFMUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxVQUFVO1lBQUUsTUFBTSx3Q0FBd0MsQ0FBQztRQUVoRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxVQUFVLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlELElBQUk7WUFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLEVBQUUsV0FBVztnQkFDbkMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXO2dCQUNsQixDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNyQixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUMxRCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FDcEIsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFDaEIsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUNYLE1BQU0sRUFDTixFQUFFLENBQUMsTUFBTSxFQUFFLEVBQ1gsTUFBTSxDQUNQLENBQUM7WUFDRixJQUFJO2dCQUNGLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDO2dCQUV0RCxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztvQkFDdEMsT0FBTyxJQUFJLENBQUM7aUJBQ2I7Z0JBRUQsT0FBTyxRQUFRLENBQUM7YUFDakI7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ2pEO1NBQ0Y7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDNUQ7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRiJ9