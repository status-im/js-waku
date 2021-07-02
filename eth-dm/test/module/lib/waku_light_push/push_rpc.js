import { Reader } from 'protobufjs/minimal';
import { v4 as uuid } from 'uuid';
import * as proto from '../../proto/waku/v2/light_push';
import { DefaultPubsubTopic } from '../waku_relay';
export class PushRPC {
    constructor(proto) {
        this.proto = proto;
    }
    static createRequest(message, pubsubTopic = DefaultPubsubTopic) {
        return new PushRPC({
            requestId: uuid(),
            request: {
                message: message.proto,
                pubsubTopic,
            },
            response: undefined,
        });
    }
    static decode(bytes) {
        const res = proto.PushRPC.decode(Reader.create(bytes));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVzaF9ycGMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3dha3VfbGlnaHRfcHVzaC9wdXNoX3JwYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDNUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxJQUFJLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFbEMsT0FBTyxLQUFLLEtBQUssTUFBTSxnQ0FBZ0MsQ0FBQztBQUV4RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFbkQsTUFBTSxPQUFPLE9BQU87SUFDbEIsWUFBMEIsS0FBb0I7UUFBcEIsVUFBSyxHQUFMLEtBQUssQ0FBZTtJQUFHLENBQUM7SUFFbEQsTUFBTSxDQUFDLGFBQWEsQ0FDbEIsT0FBb0IsRUFDcEIsY0FBc0Isa0JBQWtCO1FBRXhDLE9BQU8sSUFBSSxPQUFPLENBQUM7WUFDakIsU0FBUyxFQUFFLElBQUksRUFBRTtZQUNqQixPQUFPLEVBQUU7Z0JBQ1AsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLO2dCQUN0QixXQUFXO2FBQ1o7WUFDRCxRQUFRLEVBQUUsU0FBUztTQUNwQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFpQjtRQUM3QixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdkQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsTUFBTTtRQUNKLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBQzVCLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0lBQzdCLENBQUM7Q0FDRiJ9