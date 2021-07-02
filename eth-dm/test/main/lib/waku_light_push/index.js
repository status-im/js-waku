"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WakuLightPush = exports.PushResponse = exports.LightPushCodec = void 0;
const it_concat_1 = __importDefault(require("it-concat"));
const it_length_prefixed_1 = __importDefault(require("it-length-prefixed"));
const it_pipe_1 = __importDefault(require("it-pipe"));
const light_push_1 = require("../../proto/waku/v2/light_push");
Object.defineProperty(exports, "PushResponse", { enumerable: true, get: function () { return light_push_1.PushResponse; } });
const select_peer_1 = require("../select_peer");
const waku_relay_1 = require("../waku_relay");
const push_rpc_1 = require("./push_rpc");
exports.LightPushCodec = '/vac/waku/lightpush/2.0.0-beta1';
/**
 * Implements the [Waku v2 Light Push protocol](https://rfc.vac.dev/spec/19/).
 */
class WakuLightPush {
    constructor(libp2p, options) {
        this.libp2p = libp2p;
        if (options === null || options === void 0 ? void 0 : options.pubsubTopic) {
            this.pubsubTopic = options.pubsubTopic;
        }
        else {
            this.pubsubTopic = waku_relay_1.DefaultPubsubTopic;
        }
    }
    async push(message, opts) {
        let peer;
        if (opts === null || opts === void 0 ? void 0 : opts.peerId) {
            peer = this.libp2p.peerStore.get(opts.peerId);
            if (!peer)
                throw 'Peer is unknown';
        }
        else {
            peer = select_peer_1.selectRandomPeer(this.libp2p, exports.LightPushCodec);
        }
        if (!peer)
            throw 'No peer available';
        if (!peer.protocols.includes(exports.LightPushCodec))
            throw 'Peer does not register waku light push protocol';
        const connection = this.libp2p.connectionManager.get(peer.id);
        if (!connection)
            throw 'Failed to get a connection to the peer';
        const { stream } = await connection.newStream(exports.LightPushCodec);
        try {
            const pubsubTopic = (opts === null || opts === void 0 ? void 0 : opts.pubsubTopic)
                ? opts.pubsubTopic
                : this.pubsubTopic;
            const query = push_rpc_1.PushRPC.createRequest(message, pubsubTopic);
            const res = await it_pipe_1.default([query.encode()], it_length_prefixed_1.default.encode(), stream, it_length_prefixed_1.default.decode(), it_concat_1.default);
            try {
                const response = push_rpc_1.PushRPC.decode(res.slice()).response;
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
exports.WakuLightPush = WakuLightPush;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3dha3VfbGlnaHRfcHVzaC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwREFBK0I7QUFDL0IsNEVBQW9DO0FBQ3BDLHNEQUEyQjtBQUkzQiwrREFBOEQ7QUFRckQsNkZBUkEseUJBQVksT0FRQTtBQVByQixnREFBa0Q7QUFFbEQsOENBQW1EO0FBRW5ELHlDQUFxQztBQUV4QixRQUFBLGNBQWMsR0FBRyxpQ0FBaUMsQ0FBQztBQW9CaEU7O0dBRUc7QUFDSCxNQUFhLGFBQWE7SUFHeEIsWUFBbUIsTUFBYyxFQUFFLE9BQXVCO1FBQXZDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDL0IsSUFBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsV0FBVyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztTQUN4QzthQUFNO1lBQ0wsSUFBSSxDQUFDLFdBQVcsR0FBRywrQkFBa0IsQ0FBQztTQUN2QztJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUNSLE9BQW9CLEVBQ3BCLElBQWtCO1FBRWxCLElBQUksSUFBSSxDQUFDO1FBQ1QsSUFBSSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsTUFBTSxFQUFFO1lBQ2hCLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxJQUFJO2dCQUFFLE1BQU0saUJBQWlCLENBQUM7U0FDcEM7YUFBTTtZQUNMLElBQUksR0FBRyw4QkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLHNCQUFjLENBQUMsQ0FBQztTQUN0RDtRQUNELElBQUksQ0FBQyxJQUFJO1lBQUUsTUFBTSxtQkFBbUIsQ0FBQztRQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsc0JBQWMsQ0FBQztZQUMxQyxNQUFNLGlEQUFpRCxDQUFDO1FBRTFELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsVUFBVTtZQUFFLE1BQU0sd0NBQXdDLENBQUM7UUFFaEUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sVUFBVSxDQUFDLFNBQVMsQ0FBQyxzQkFBYyxDQUFDLENBQUM7UUFDOUQsSUFBSTtZQUNGLE1BQU0sV0FBVyxHQUFHLENBQUEsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLFdBQVc7Z0JBQ25DLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFDbEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDckIsTUFBTSxLQUFLLEdBQUcsa0JBQU8sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzFELE1BQU0sR0FBRyxHQUFHLE1BQU0saUJBQUksQ0FDcEIsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFDaEIsNEJBQUUsQ0FBQyxNQUFNLEVBQUUsRUFDWCxNQUFNLEVBQ04sNEJBQUUsQ0FBQyxNQUFNLEVBQUUsRUFDWCxtQkFBTSxDQUNQLENBQUM7WUFDRixJQUFJO2dCQUNGLE1BQU0sUUFBUSxHQUFHLGtCQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQztnQkFFdEQsSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDYixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7b0JBQ3RDLE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUVELE9BQU8sUUFBUSxDQUFDO2FBQ2pCO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUNqRDtTQUNGO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzVEO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUEzREQsc0NBMkRDIn0=