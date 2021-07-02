"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusFleetNodes = exports.Environment = exports.Protocol = void 0;
/**
 * Returns multiaddrs (inc. ip) of nim-waku nodes ran by Status.
 * Used as a temporary discovery helper until more parties run their own nodes.
 */
const axios_1 = __importDefault(require("axios"));
var Protocol;
(function (Protocol) {
    Protocol["websocket"] = "websocket";
    Protocol["tcp"] = "tcp";
})(Protocol = exports.Protocol || (exports.Protocol = {}));
var Environment;
(function (Environment) {
    Environment["Test"] = "test";
    Environment["Prod"] = "prod";
})(Environment = exports.Environment || (exports.Environment = {}));
async function getStatusFleetNodes(env = Environment.Prod, protocol = Protocol.websocket) {
    const res = await axios_1.default.get('https://fleets.status.im/', {
        headers: { 'Content-Type': 'application/json' },
    });
    const wakuFleet = res.data.fleets[`wakuv2.${env}`];
    switch (protocol) {
        case Protocol.tcp:
            return Object.values(wakuFleet['waku']);
        default:
            return Object.values(wakuFleet['waku-websocket']);
    }
}
exports.getStatusFleetNodes = getStatusFleetNodes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY292ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2Rpc2NvdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILGtEQUEwQjtBQUUxQixJQUFZLFFBR1g7QUFIRCxXQUFZLFFBQVE7SUFDbEIsbUNBQXVCLENBQUE7SUFDdkIsdUJBQVcsQ0FBQTtBQUNiLENBQUMsRUFIVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQUduQjtBQUVELElBQVksV0FHWDtBQUhELFdBQVksV0FBVztJQUNyQiw0QkFBYSxDQUFBO0lBQ2IsNEJBQWEsQ0FBQTtBQUNmLENBQUMsRUFIVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQUd0QjtBQUVNLEtBQUssVUFBVSxtQkFBbUIsQ0FDdkMsTUFBbUIsV0FBVyxDQUFDLElBQUksRUFDbkMsV0FBcUIsUUFBUSxDQUFDLFNBQVM7SUFFdkMsTUFBTSxHQUFHLEdBQUcsTUFBTSxlQUFLLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFO1FBQ3ZELE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRTtLQUNoRCxDQUFDLENBQUM7SUFFSCxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFFbkQsUUFBUSxRQUFRLEVBQUU7UUFDaEIsS0FBSyxRQUFRLENBQUMsR0FBRztZQUNmLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMxQztZQUNFLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0tBQ3JEO0FBQ0gsQ0FBQztBQWhCRCxrREFnQkMifQ==