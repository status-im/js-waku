import { Reader } from 'protobufjs/minimal';
import * as proto from '../../proto/chat/v2/chat_message';
/**
 * ChatMessage is used by the various show case waku apps that demonstrates
 * waku used as the network layer for chat group applications.
 *
 * This is included to help building PoC and MVPs. Apps that aim to be
 * production ready should use a more appropriate data structure.
 */
export class ChatMessage {
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
        const protoMsg = proto.ChatMessage.decode(Reader.create(bytes));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL2NoYXRfbWVzc2FnZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFNUMsT0FBTyxLQUFLLEtBQUssTUFBTSxrQ0FBa0MsQ0FBQztBQUUxRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQU8sV0FBVztJQUN0QixZQUEwQixLQUF3QjtRQUF4QixVQUFLLEdBQUwsS0FBSyxDQUFtQjtJQUFHLENBQUM7SUFFdEQ7O09BRUc7SUFDSCxNQUFNLENBQUMsY0FBYyxDQUNuQixTQUFlLEVBQ2YsSUFBWSxFQUNaLElBQVk7UUFFWixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvRCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUUzQyxPQUFPLElBQUksV0FBVyxDQUFDO1lBQ3JCLFNBQVMsRUFBRSxlQUFlO1lBQzFCLElBQUk7WUFDSixPQUFPO1NBQ1IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBaUI7UUFDN0IsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU07UUFDSixPQUFPLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7YUFDbEMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDWixPQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2QsQ0FBQztDQUNGIn0=