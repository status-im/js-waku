/**
 * @hidden
 * @module
 */
import Gossipsub from 'libp2p-gossipsub';
import { Heartbeat } from 'libp2p-gossipsub/src/heartbeat';
export declare class RelayHeartbeat extends Heartbeat {
    /**
     * @param {Object} gossipsub
     * @constructor
     */
    constructor(gossipsub: Gossipsub);
    start(): void;
    /**
     * Unmounts the gossipsub protocol and shuts down every connection
     * @override
     * @returns {void}
     */
    stop(): void;
    /**
     * Maintains the mesh and fanout maps in gossipsub.
     *
     * @returns {void}
     */
    _heartbeat(): void;
}
