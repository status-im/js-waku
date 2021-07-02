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
exports.WakuMessage = exports.DefaultContentTopic = void 0;
// Ensure that this class matches the proto interface while
const minimal_1 = require("protobufjs/minimal");
// Protecting the user from protobuf oddities
const proto = __importStar(require("../proto/waku/v2/message"));
exports.DefaultContentTopic = '/waku/2/default-content/proto';
const DefaultVersion = 0;
class WakuMessage {
    constructor(proto) {
        this.proto = proto;
    }
    /**
     * Create Message with a utf-8 string as payload.
     */
    static fromUtf8String(utf8, contentTopic = exports.DefaultContentTopic, timestamp = new Date()) {
        const payload = Buffer.from(utf8, 'utf-8');
        return new WakuMessage({
            payload,
            version: DefaultVersion,
            contentTopic,
            timestamp: timestamp.valueOf() / 1000,
        });
    }
    /**
     * Create Message with a byte array as payload.
     */
    static fromBytes(payload, contentTopic = exports.DefaultContentTopic, timestamp = new Date()) {
        return new WakuMessage({
            payload,
            timestamp: timestamp.valueOf() / 1000,
            version: DefaultVersion,
            contentTopic,
        });
    }
    static decode(bytes) {
        const wakuMsg = proto.WakuMessage.decode(minimal_1.Reader.create(bytes));
        return new WakuMessage(wakuMsg);
    }
    encode() {
        return proto.WakuMessage.encode(this.proto).finish();
    }
    get payloadAsUtf8() {
        if (!this.proto.payload) {
            return '';
        }
        return Array.from(this.proto.payload)
            .map((char) => {
            return String.fromCharCode(char);
        })
            .join('');
    }
    get payload() {
        return this.proto.payload;
    }
    get contentTopic() {
        return this.proto.contentTopic;
    }
    get version() {
        return this.proto.version;
    }
    get timestamp() {
        if (this.proto.timestamp) {
            return new Date(this.proto.timestamp * 1000);
        }
        return;
    }
}
exports.WakuMessage = WakuMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FrdV9tZXNzYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi93YWt1X21lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJEQUEyRDtBQUMzRCxnREFBNEM7QUFFNUMsNkNBQTZDO0FBQzdDLGdFQUFrRDtBQUVyQyxRQUFBLG1CQUFtQixHQUFHLCtCQUErQixDQUFDO0FBQ25FLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQztBQUV6QixNQUFhLFdBQVc7SUFDdEIsWUFBMEIsS0FBd0I7UUFBeEIsVUFBSyxHQUFMLEtBQUssQ0FBbUI7SUFBRyxDQUFDO0lBRXREOztPQUVHO0lBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FDbkIsSUFBWSxFQUNaLGVBQXVCLDJCQUFtQixFQUMxQyxZQUFrQixJQUFJLElBQUksRUFBRTtRQUU1QixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQyxPQUFPLElBQUksV0FBVyxDQUFDO1lBQ3JCLE9BQU87WUFDUCxPQUFPLEVBQUUsY0FBYztZQUN2QixZQUFZO1lBQ1osU0FBUyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJO1NBQ3RDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU0sQ0FBQyxTQUFTLENBQ2QsT0FBbUIsRUFDbkIsZUFBdUIsMkJBQW1CLEVBQzFDLFlBQWtCLElBQUksSUFBSSxFQUFFO1FBRTVCLE9BQU8sSUFBSSxXQUFXLENBQUM7WUFDckIsT0FBTztZQUNQLFNBQVMsRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSTtZQUNyQyxPQUFPLEVBQUUsY0FBYztZQUN2QixZQUFZO1NBQ2IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBaUI7UUFDN0IsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMvRCxPQUFPLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxNQUFNO1FBQ0osT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDdkQsQ0FBQztJQUVELElBQUksYUFBYTtRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUN2QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO2FBQ2xDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ1osT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNkLENBQUM7SUFFRCxJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBQzVCLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBQzVCLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDWCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ3hCLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDOUM7UUFDRCxPQUFPO0lBQ1QsQ0FBQztDQUNGO0FBM0VELGtDQTJFQyJ9