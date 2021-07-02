import Libp2p from 'libp2p';
import { Peer } from 'libp2p/src/peer-store';
/**
 * Returns a pseudo-random peer that supports the given protocol.
 * Useful for protocols such as store and light push
 */
export declare function selectRandomPeer(libp2p: Libp2p, protocol: string): Peer | undefined;
