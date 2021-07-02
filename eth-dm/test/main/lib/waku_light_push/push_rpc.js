"use strict";
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
exports.PushRPC = void 0;
const minimal_1 = require("protobufjs/minimal");
const uuid_1 = require("uuid");
const proto = __importStar(require("../../proto/waku/v2/light_push"));
const waku_relay_1 = require("../waku_relay");
class PushRPC {
    constructor(proto) {
        this.proto = proto;
    }
    static createRequest(message, pubsubTopic = waku_relay_1.DefaultPubsubTopic) {
        return new PushRPC({
            requestId: uuid_1.v4(),
            request: {
                message: message.proto,
                pubsubTopic,
            },
            response: undefined,
        });
    }
    static decode(bytes) {
        const res = proto.PushRPC.decode(minimal_1.Reader.create(bytes));
        return new PushRPC(res);
    }
    encode() {
        return proto.PushRPC.encode(this.proto).finish();
    }
    get query() {
        return this.proto.request;
    }
    get response() {
        return this.proto.response;
    }
}
exports.PushRPC = PushRPC;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVzaF9ycGMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3dha3VfbGlnaHRfcHVzaC9wdXNoX3JwYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsZ0RBQTRDO0FBQzVDLCtCQUFrQztBQUVsQyxzRUFBd0Q7QUFFeEQsOENBQW1EO0FBRW5ELE1BQWEsT0FBTztJQUNsQixZQUEwQixLQUFvQjtRQUFwQixVQUFLLEdBQUwsS0FBSyxDQUFlO0lBQUcsQ0FBQztJQUVsRCxNQUFNLENBQUMsYUFBYSxDQUNsQixPQUFvQixFQUNwQixjQUFzQiwrQkFBa0I7UUFFeEMsT0FBTyxJQUFJLE9BQU8sQ0FBQztZQUNqQixTQUFTLEVBQUUsU0FBSSxFQUFFO1lBQ2pCLE9BQU8sRUFBRTtnQkFDUCxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUs7Z0JBQ3RCLFdBQVc7YUFDWjtZQUNELFFBQVEsRUFBRSxTQUFTO1NBQ3BCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWlCO1FBQzdCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdkQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsTUFBTTtRQUNKLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBQzVCLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0lBQzdCLENBQUM7Q0FDRjtBQWpDRCwwQkFpQ0MifQ==