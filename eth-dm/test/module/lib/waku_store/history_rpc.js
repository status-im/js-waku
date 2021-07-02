import { Reader } from 'protobufjs/minimal';
import { v4 as uuid } from 'uuid';
import * as proto from '../../proto/waku/v2/store';
export var Direction;
(function (Direction) {
    Direction["BACKWARD"] = "backward";
    Direction["FORWARD"] = "forward";
})(Direction || (Direction = {}));
export class HistoryRPC {
    constructor(proto) {
        this.proto = proto;
    }
    /**
     * Create History Query.
     */
    static createQuery(options) {
        const direction = directionToProto(options.direction);
        const pagingInfo = {
            pageSize: options.pageSize,
            cursor: options.cursor,
            direction,
        };
        const contentFilters = options.contentTopics.map((contentTopic) => {
            return { contentTopic };
        });
        return new HistoryRPC({
            requestId: uuid(),
            query: {
                pubsubTopic: options.pubsubTopic,
                contentFilters,
                pagingInfo,
                startTime: undefined,
                endTime: undefined,
            },
            response: undefined,
        });
    }
    static decode(bytes) {
        const res = proto.HistoryRPC.decode(Reader.create(bytes));
        return new HistoryRPC(res);
    }
    encode() {
        return proto.HistoryRPC.encode(this.proto).finish();
    }
    get query() {
        return this.proto.query;
    }
    get response() {
        return this.proto.response;
    }
}
function directionToProto(direction) {
    switch (direction) {
        case Direction.BACKWARD:
            return proto.PagingInfo_Direction.DIRECTION_BACKWARD_UNSPECIFIED;
        case Direction.FORWARD:
            return proto.PagingInfo_Direction.DIRECTION_FORWARD;
        default:
            return proto.PagingInfo_Direction.DIRECTION_BACKWARD_UNSPECIFIED;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeV9ycGMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3dha3Vfc3RvcmUvaGlzdG9yeV9ycGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxFQUFFLElBQUksSUFBSSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRWxDLE9BQU8sS0FBSyxLQUFLLE1BQU0sMkJBQTJCLENBQUM7QUFFbkQsTUFBTSxDQUFOLElBQVksU0FHWDtBQUhELFdBQVksU0FBUztJQUNuQixrQ0FBcUIsQ0FBQTtJQUNyQixnQ0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBSFcsU0FBUyxLQUFULFNBQVMsUUFHcEI7QUFVRCxNQUFNLE9BQU8sVUFBVTtJQUNyQixZQUEwQixLQUF1QjtRQUF2QixVQUFLLEdBQUwsS0FBSyxDQUFrQjtJQUFHLENBQUM7SUFFckQ7O09BRUc7SUFDSCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQWdCO1FBQ2pDLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0RCxNQUFNLFVBQVUsR0FBRztZQUNqQixRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7WUFDMUIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1lBQ3RCLFNBQVM7U0FDVixDQUFDO1FBRUYsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtZQUNoRSxPQUFPLEVBQUUsWUFBWSxFQUFFLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksVUFBVSxDQUFDO1lBQ3BCLFNBQVMsRUFBRSxJQUFJLEVBQUU7WUFDakIsS0FBSyxFQUFFO2dCQUNMLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztnQkFDaEMsY0FBYztnQkFDZCxVQUFVO2dCQUNWLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixPQUFPLEVBQUUsU0FBUzthQUNuQjtZQUNELFFBQVEsRUFBRSxTQUFTO1NBQ3BCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWlCO1FBQzdCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMxRCxPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxNQUFNO1FBQ0osT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDdEQsQ0FBQztJQUVELElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVELElBQUksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7SUFDN0IsQ0FBQztDQUNGO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxTQUFvQjtJQUM1QyxRQUFRLFNBQVMsRUFBRTtRQUNqQixLQUFLLFNBQVMsQ0FBQyxRQUFRO1lBQ3JCLE9BQU8sS0FBSyxDQUFDLG9CQUFvQixDQUFDLDhCQUE4QixDQUFDO1FBQ25FLEtBQUssU0FBUyxDQUFDLE9BQU87WUFDcEIsT0FBTyxLQUFLLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUM7UUFDdEQ7WUFDRSxPQUFPLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyw4QkFBOEIsQ0FBQztLQUNwRTtBQUNILENBQUMifQ==