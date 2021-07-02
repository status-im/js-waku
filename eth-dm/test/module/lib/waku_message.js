// Ensure that this class matches the proto interface while
import { Reader } from 'protobufjs/minimal';
// Protecting the user from protobuf oddities
import * as proto from '../proto/waku/v2/message';
export const DefaultContentTopic = '/waku/2/default-content/proto';
const DefaultVersion = 0;
export class WakuMessage {
    constructor(proto) {
        this.proto = proto;
    }
    /**
     * Create Message with a utf-8 string as payload.
     */
    static fromUtf8String(utf8, contentTopic = DefaultContentTopic, timestamp = new Date()) {
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
    static fromBytes(payload, contentTopic = DefaultContentTopic, timestamp = new Date()) {
        return new WakuMessage({
            payload,
            timestamp: timestamp.valueOf() / 1000,
            version: DefaultVersion,
            contentTopic,
        });
    }
    static decode(bytes) {
        const wakuMsg = proto.WakuMessage.decode(Reader.create(bytes));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FrdV9tZXNzYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi93YWt1X21lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMkRBQTJEO0FBQzNELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUU1Qyw2Q0FBNkM7QUFDN0MsT0FBTyxLQUFLLEtBQUssTUFBTSwwQkFBMEIsQ0FBQztBQUVsRCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRywrQkFBK0IsQ0FBQztBQUNuRSxNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFFekIsTUFBTSxPQUFPLFdBQVc7SUFDdEIsWUFBMEIsS0FBd0I7UUFBeEIsVUFBSyxHQUFMLEtBQUssQ0FBbUI7SUFBRyxDQUFDO0lBRXREOztPQUVHO0lBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FDbkIsSUFBWSxFQUNaLGVBQXVCLG1CQUFtQixFQUMxQyxZQUFrQixJQUFJLElBQUksRUFBRTtRQUU1QixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQyxPQUFPLElBQUksV0FBVyxDQUFDO1lBQ3JCLE9BQU87WUFDUCxPQUFPLEVBQUUsY0FBYztZQUN2QixZQUFZO1lBQ1osU0FBUyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJO1NBQ3RDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU0sQ0FBQyxTQUFTLENBQ2QsT0FBbUIsRUFDbkIsZUFBdUIsbUJBQW1CLEVBQzFDLFlBQWtCLElBQUksSUFBSSxFQUFFO1FBRTVCLE9BQU8sSUFBSSxXQUFXLENBQUM7WUFDckIsT0FBTztZQUNQLFNBQVMsRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSTtZQUNyQyxPQUFPLEVBQUUsY0FBYztZQUN2QixZQUFZO1NBQ2IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBaUI7UUFDN0IsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELE1BQU07UUFDSixPQUFPLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7YUFDbEMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDWixPQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2QsQ0FBQztJQUVELElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDNUIsQ0FBQztJQUVELElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7SUFDakMsQ0FBQztJQUVELElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDNUIsQ0FBQztJQUVELElBQUksU0FBUztRQUNYLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7WUFDeEIsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUM5QztRQUNELE9BQU87SUFDVCxDQUFDO0NBQ0YifQ==