"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WakuStore = exports.Direction = exports.StoreCodec = void 0;
const it_concat_1 = __importDefault(require("it-concat"));
const it_length_prefixed_1 = __importDefault(require("it-length-prefixed"));
const it_pipe_1 = __importDefault(require("it-pipe"));
const select_peer_1 = require("../select_peer");
const waku_message_1 = require("../waku_message");
const waku_relay_1 = require("../waku_relay");
const history_rpc_1 = require("./history_rpc");
Object.defineProperty(exports, "Direction", { enumerable: true, get: function () { return history_rpc_1.Direction; } });
exports.StoreCodec = '/vac/waku/store/2.0.0-beta3';
/**
 * Implements the [Waku v2 Store protocol](https://rfc.vac.dev/spec/13/).
 */
class WakuStore {
    constructor(libp2p, options) {
        this.libp2p = libp2p;
        if (options === null || options === void 0 ? void 0 : options.pubsubTopic) {
            this.pubsubTopic = options.pubsubTopic;
        }
        else {
            this.pubsubTopic = waku_relay_1.DefaultPubsubTopic;
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
        var _a, _b, _c, _d;
        const opts = Object.assign({
            pubsubTopic: this.pubsubTopic,
            direction: history_rpc_1.Direction.BACKWARD,
            pageSize: 10,
        }, options);
        let peer;
        if (opts.peerId) {
            peer = this.libp2p.peerStore.get(opts.peerId);
            if (!peer)
                throw 'Peer is unknown';
        }
        else {
            peer = select_peer_1.selectRandomPeer(this.libp2p, exports.StoreCodec);
        }
        if (!peer)
            throw 'No peer available';
        if (!peer.protocols.includes(exports.StoreCodec))
            throw 'Peer does not register waku store protocol';
        const connection = this.libp2p.connectionManager.get(peer.id);
        if (!connection)
            throw 'Failed to get a connection to the peer';
        const messages = [];
        let cursor = undefined;
        while (true) {
            try {
                const { stream } = await connection.newStream(exports.StoreCodec);
                try {
                    const queryOpts = Object.assign(opts, { cursor });
                    const historyRpcQuery = history_rpc_1.HistoryRPC.createQuery(queryOpts);
                    const res = await it_pipe_1.default([historyRpcQuery.encode()], it_length_prefixed_1.default.encode(), stream, it_length_prefixed_1.default.decode(), it_concat_1.default);
                    try {
                        const reply = history_rpc_1.HistoryRPC.decode(res.slice());
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
                            return new waku_message_1.WakuMessage(protoMsg);
                        });
                        if (opts.callback) {
                            // TODO: Test the callback feature
                            opts.callback(pageMessages);
                        }
                        pageMessages.forEach((wakuMessage) => {
                            messages.push(wakuMessage);
                        });
                        const responsePageSize = (_a = response.pagingInfo) === null || _a === void 0 ? void 0 : _a.pageSize;
                        const queryPageSize = (_c = (_b = historyRpcQuery.query) === null || _b === void 0 ? void 0 : _b.pagingInfo) === null || _c === void 0 ? void 0 : _c.pageSize;
                        if (responsePageSize &&
                            queryPageSize &&
                            responsePageSize < queryPageSize) {
                            // Response page size smaller than query, meaning this is the last page
                            return messages;
                        }
                        cursor = (_d = response.pagingInfo) === null || _d === void 0 ? void 0 : _d.cursor;
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
exports.WakuStore = WakuStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3dha3Vfc3RvcmUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMERBQStCO0FBQy9CLDRFQUFvQztBQUNwQyxzREFBMkI7QUFJM0IsZ0RBQWtEO0FBQ2xELGtEQUE4QztBQUM5Qyw4Q0FBbUQ7QUFFbkQsK0NBQXNEO0FBSTdDLDBGQUpBLHVCQUFTLE9BSUE7QUFGTCxRQUFBLFVBQVUsR0FBRyw2QkFBNkIsQ0FBQztBQXlCeEQ7O0dBRUc7QUFDSCxNQUFhLFNBQVM7SUFHcEIsWUFBbUIsTUFBYyxFQUFFLE9BQXVCO1FBQXZDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDL0IsSUFBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsV0FBVyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztTQUN4QzthQUFNO1lBQ0wsSUFBSSxDQUFDLFdBQVcsR0FBRywrQkFBa0IsQ0FBQztTQUN2QztJQUNILENBQUM7SUFFRDs7Ozs7Ozs7Ozs7T0FXRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBcUI7O1FBQ3RDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQ3hCO1lBQ0UsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLFNBQVMsRUFBRSx1QkFBUyxDQUFDLFFBQVE7WUFDN0IsUUFBUSxFQUFFLEVBQUU7U0FDYixFQUNELE9BQU8sQ0FDUixDQUFDO1FBRUYsSUFBSSxJQUFJLENBQUM7UUFDVCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsSUFBSTtnQkFBRSxNQUFNLGlCQUFpQixDQUFDO1NBQ3BD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