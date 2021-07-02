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
exports.HistoryRPC = exports.Direction = void 0;
const minimal_1 = require("protobufjs/minimal");
const uuid_1 = require("uuid");
const proto = __importStar(require("../../proto/waku/v2/store"));
var Direction;
(function (Direction) {
    Direction["BACKWARD"] = "backward";
    Direction["FORWARD"] = "forward";
})(Direction = exports.Direction || (exports.Direction = {}));
class HistoryRPC {
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
            requestId: uuid_1.v4(),
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
        const res = proto.HistoryRPC.decode(minimal_1.Reader.create(bytes));
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
exports.HistoryRPC = HistoryRPC;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeV9ycGMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3dha3Vfc3RvcmUvaGlzdG9yeV9ycGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdEQUE0QztBQUM1QywrQkFBa0M7QUFFbEMsaUVBQW1EO0FBRW5ELElBQVksU0FHWDtBQUhELFdBQVksU0FBUztJQUNuQixrQ0FBcUIsQ0FBQTtJQUNyQixnQ0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBSFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFHcEI7QUFVRCxNQUFhLFVBQVU7SUFDckIsWUFBMEIsS0FBdUI7UUFBdkIsVUFBSyxHQUFMLEtBQUssQ0FBa0I7SUFBRyxDQUFDO0lBRXJEOztPQUVHO0lBQ0gsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFnQjtRQUNqQyxNQUFNLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEQsTUFBTSxVQUFVLEdBQUc7WUFDakIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1lBQzFCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtZQUN0QixTQUFTO1NBQ1YsQ0FBQztRQUVGLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBWSxFQUFFLEVBQUU7WUFDaEUsT0FBTyxFQUFFLFlBQVksRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLFVBQVUsQ0FBQztZQUNwQixTQUFTLEVBQUUsU0FBSSxFQUFFO1lBQ2pCLEtBQUssRUFBRTtnQkFDTCxXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7Z0JBQ2hDLGNBQWM7Z0JBQ2QsVUFBVTtnQkFDVixTQUFTLEVBQUUsU0FBUztnQkFDcEIsT0FBTyxFQUFFLFNBQVM7YUFDbkI7WUFDRCxRQUFRLEVBQUUsU0FBUztTQUNwQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFpQjtRQUM3QixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzFELE9BQU8sSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELE1BQU07UUFDSixPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN0RCxDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUM3QixDQUFDO0NBQ0Y7QUEvQ0QsZ0NBK0NDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxTQUFvQjtJQUM1QyxRQUFRLFNBQVMsRUFBRTtRQUNqQixLQUFLLFNBQVMsQ0FBQyxRQUFRO1lBQ3JCLE9BQU8sS0FBSyxDQUFDLG9CQUFvQixDQUFDLDhCQUE4QixDQUFDO1FBQ25FLEtBQUssU0FBUyxDQUFDLE9BQU87WUFDcEIsT0FBTyxLQUFLLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUM7UUFDdEQ7WUFDRSxPQUFPLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyw4QkFBOEIsQ0FBQztLQUNwRTtBQUNILENBQUMifQ==