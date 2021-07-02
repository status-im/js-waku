/**
 * Returns multiaddrs (inc. ip) of nim-waku nodes ran by Status.
 * Used as a temporary discovery helper until more parties run their own nodes.
 */
import axios from 'axios';
export var Protocol;
(function (Protocol) {
    Protocol["websocket"] = "websocket";
    Protocol["tcp"] = "tcp";
})(Protocol || (Protocol = {}));
export var Environment;
(function (Environment) {
    Environment["Test"] = "test";
    Environment["Prod"] = "prod";
})(Environment || (Environment = {}));
export async function getStatusFleetNodes(env = Environment.Prod, protocol = Protocol.websocket) {
    const res = await axios.get('https://fleets.status.im/', {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY292ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2Rpc2NvdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUNILE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUxQixNQUFNLENBQU4sSUFBWSxRQUdYO0FBSEQsV0FBWSxRQUFRO0lBQ2xCLG1DQUF1QixDQUFBO0lBQ3ZCLHVCQUFXLENBQUE7QUFDYixDQUFDLEVBSFcsUUFBUSxLQUFSLFFBQVEsUUFHbkI7QUFFRCxNQUFNLENBQU4sSUFBWSxXQUdYO0FBSEQsV0FBWSxXQUFXO0lBQ3JCLDRCQUFhLENBQUE7SUFDYiw0QkFBYSxDQUFBO0FBQ2YsQ0FBQyxFQUhXLFdBQVcsS0FBWCxXQUFXLFFBR3RCO0FBRUQsTUFBTSxDQUFDLEtBQUssVUFBVSxtQkFBbUIsQ0FDdkMsTUFBbUIsV0FBVyxDQUFDLElBQUksRUFDbkMsV0FBcUIsUUFBUSxDQUFDLFNBQVM7SUFFdkMsTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFO1FBQ3ZELE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRTtLQUNoRCxDQUFDLENBQUM7SUFFSCxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFFbkQsUUFBUSxRQUFRLEVBQUU7UUFDaEIsS0FBSyxRQUFRLENBQUMsR0FBRztZQUNmLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMxQztZQUNFLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0tBQ3JEO0FBQ0gsQ0FBQyJ9