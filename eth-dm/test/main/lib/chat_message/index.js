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
exports.ChatMessage = void 0;
const minimal_1 = require("protobufjs/minimal");
const proto = __importStar(require("../../proto/chat/v2/chat_message"));
/**
 * ChatMessage is used by the various show case waku apps that demonstrates
 * waku used as the network layer for chat group applications.
 *
 * This is included to help building PoC and MVPs. Apps that aim to be
 * production ready should use a more appropriate data structure.
 */
class ChatMessage {
    constructor(proto) {
        this.proto = proto;
    }
    /**
     * Create Chat Message with a utf-8 string as payload.
     */
    static fromUtf8String(timestamp, nick, text) {
        const timestampNumber = Math.floor(timestamp.valueOf() / 1000);
        const payload = Buffer.from(text, 'utf-8');
        return new ChatMessage({
            timestamp: timestampNumber,
            nick,
            payload,
        });
    }
    /**
     * Decode a protobuf payload to a ChatMessage.
     * @param bytes The payload to decode.
     */
    static decode(bytes) {
        const protoMsg = proto.ChatMessage.decode(minimal_1.Reader.create(bytes));
        return new ChatMessage(protoMsg);
    }
    /**
     * Encode this ChatMessage to a byte array, to be used as a protobuf payload.
     * @returns The encoded payload.
     */
    encode() {
        return proto.ChatMessage.encode(this.proto).finish();
    }
    get timestamp() {
        return new Date(this.proto.timestamp * 1000);
    }
    get nick() {
        return this.proto.nick;
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
}
exports.ChatMessage = ChatMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL2NoYXRfbWVzc2FnZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsZ0RBQTRDO0FBRTVDLHdFQUEwRDtBQUUxRDs7Ozs7O0dBTUc7QUFDSCxNQUFhLFdBQVc7SUFDdEIsWUFBMEIsS0FBd0I7UUFBeEIsVUFBSyxHQUFMLEtBQUssQ0FBbUI7SUFBRyxDQUFDO0lBRXREOztPQUVHO0lBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FDbkIsU0FBZSxFQUNmLElBQVksRUFDWixJQUFZO1FBRVosTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFM0MsT0FBTyxJQUFJLFdBQVcsQ0FBQztZQUNyQixTQUFTLEVBQUUsZUFBZTtZQUMxQixJQUFJO1lBQ0osT0FBTztTQUNSLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWlCO1FBQzdCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGdCQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDaEUsT0FBTyxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTTtRQUNKLE9BQU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3ZELENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDZixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7WUFDdkIsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUVELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQzthQUNsQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNaLE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUF6REQsa0NBeURDIn0=