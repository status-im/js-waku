import Libp2p, { Libp2pConfig, Libp2pModules, Libp2pOptions } from 'libp2p';
import Mplex from 'libp2p-mplex';
import { bytes } from 'libp2p-noise/dist/src/@types/basic';
import { Noise } from 'libp2p-noise/dist/src/noise';
import Websockets from 'libp2p-websockets';
import filters from 'libp2p-websockets/src/filters';
import { Multiaddr, multiaddr } from 'multiaddr';
import PeerId from 'peer-id';

import { WakuLightPush } from './waku_light_push';
import { RelayCodec, WakuRelay } from './waku_relay';
import { StoreCodec, WakuStore } from './waku_store';

const transportKey = Websockets.prototype[Symbol.toStringTag];

export type CreateOptions =
  | {
      listenAddresses: string[] | undefined;
      staticNoiseKey: bytes | undefined;
      modules: Partial<Libp2pModules>;
      config: Partial<Libp2pConfig>;
      listenerOptions: { server: any } | undefined;
    }
  | (Libp2pOptions & import('libp2p').CreateOptions);

export class Waku {
  public libp2p: Libp2p;
  public relay: WakuRelay;
  public store: WakuStore;
  public lightPush: WakuLightPush;

  private constructor(
    libp2p: Libp2p,
    store: WakuStore,
    lightPush: WakuLightPush
  ) {
    this.libp2p = libp2p;
    this.relay = (libp2p.pubsub as unknown) as WakuRelay;
    this.store = store;
    this.lightPush = lightPush;
  }

  /**
   * Create new waku node
   *
   * @param options Takes the same options than `Libp2p`.
   */
  static async create(
    options: Partial<CreateOptions>,
    server?: any
  ): Promise<Waku> {
    const opts = Object.assign(
      {
        listenAddresses: [],
        staticNoiseKey: undefined,
      },
      options
    );

    opts.config = Object.assign(
      {
        transport: {
          [transportKey]: {
            filter: filters.all,
            listenerOptions: { server: server },
          },
        },
      },
      options.config
    );

    opts.modules = Object.assign({}, options.modules);

    let transport = [Websockets];
    if (opts.modules?.transport) {
      transport = transport.concat(opts.modules?.transport);
    }

    // FIXME: By controlling the creation of libp2p we have to think about what
    // needs to be exposed and what does not. Ideally, we should be able to let
    // the user create the WakuStore, WakuRelay instances and pass them when
    // creating the libp2p instance.
    const libp2p = await Libp2p.create({
      addresses: {
        listen: opts.listenAddresses,
      },
      modules: {
        transport,
        streamMuxer: [Mplex],
        connEncryption: [new Noise(opts.staticNoiseKey)],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Type needs update
        pubsub: WakuRelay,
      },
      config: opts.config,
    });

    const wakuStore = new WakuStore(libp2p);
    const wakuLightPush = new WakuLightPush(libp2p);

    await libp2p.start();

    return new Waku(libp2p, wakuStore, wakuLightPush);
  }

  /**
   * Dials to the provided peer.
   *
   * @param peer The peer to dial
   */
  async dial(
    peer: PeerId | Multiaddr | string
  ): Promise<{
    stream: import('libp2p-interfaces/src/stream-muxer/types').MuxedStream;
    protocol: string;
  }> {
    return this.libp2p.dialProtocol(peer, [RelayCodec, StoreCodec]);
  }

  /**
   * Add peer to address book, it will be auto-dialed in the background.
   */
  addPeerToAddressBook(
    peerId: PeerId | string,
    multiaddrs: Multiaddr[] | string[]
  ): void {
    let peer;
    if (typeof peerId === 'string') {
      peer = PeerId.createFromB58String(peerId);
    } else {
      peer = peerId;
    }
    const addresses = multiaddrs.map((addr: Multiaddr | string) => {
      if (typeof addr === 'string') {
        return multiaddr(addr);
      } else {
        return addr;
      }
    });
    this.libp2p.peerStore.addressBook.set(peer, addresses);
  }

  async stop(): Promise<void> {
    return this.libp2p.stop();
  }

  /**
   * Return the local multiaddr with peer id on which libp2p is listening.
   * @throws if libp2p is not listening on localhost
   */
  getLocalMultiaddrWithID(): string {
    const localMultiaddr = this.libp2p.multiaddrs.find((addr) =>
      addr.toString().match(/127\.0\.0\.1/)
    );
    if (!localMultiaddr || localMultiaddr.toString() === '') {
      throw 'Not listening on localhost';
    }
    return localMultiaddr + '/p2p/' + this.libp2p.peerId.toB58String();
  }
}
