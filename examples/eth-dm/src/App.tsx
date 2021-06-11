import 'react-native-get-random-values';

import '@ethersproject/shims';

import React, { useEffect, useState } from 'react';
import './App.css';
import { Environment, getStatusFleetNodes, Waku, WakuMessage } from 'js-waku';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import {
  createPublicKeyMessage,
  PublicKeyMessage,
  generateEthDmKeyPair,
  KeyPair,
  validatePublicKeyMessage,
} from './crypto';

const PublicKeyContentTopic = '/eth-dm/1/public-key/json';

declare let window: any;

function App() {
  const [waku, setWaku] = useState<Waku>();
  const [provider, setProvider] = useState<Web3Provider>();
  const [ethDmKeyPair, setEthDmKeyPair] = useState<KeyPair>();
  const [publicKeyMsg, setPublicKeyMsg] = useState<PublicKeyMessage>();

  useEffect(() => {
    if (provider) return;
    try {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(_provider);
    } catch (e) {
      console.error('No web3 provider available');
    }
  }, [provider]);

  useEffect(() => {
    if (waku) return;
    initWaku()
      .then((wakuNode) => {
        console.log('waku: ready');
        setWaku(wakuNode);
      })
      .catch((e) => {
        console.error('Failed to initiate Waku', e);
      });
  }, [waku]);

  const generateKeyPair = () => {
    if (ethDmKeyPair) return;
    if (!provider) return;

    generateEthDmKeyPair(provider.getSigner())
      .then((keyPair) => {
        setEthDmKeyPair(keyPair);
      })
      .catch((e) => {
        console.error('Failed to generate Key Pair', e);
      });
  };

  useEffect(() => {
    if (!waku) return;
    waku.relay.addObserver(handlePublicKeyMessage, [PublicKeyContentTopic]);
  });

  const broadcastPublicKey = () => {
    if (!ethDmKeyPair) return;
    if (!provider) return;
    if (!waku) return;

    if (publicKeyMsg) {
      const wakuMsg = createWakuMessage(publicKeyMsg);
      waku.relay.send(wakuMsg).catch((e) => {
        console.error('Failed to send Public Key Message');
      });
    } else {
      createPublicKeyMessage(provider.getSigner(), ethDmKeyPair.publicKey)
        .then((msg) => {
          setPublicKeyMsg(msg);
          const wakuMsg = createWakuMessage(msg);
          waku.relay.send(wakuMsg).catch((e) => {
            console.error('Failed to send Public Key Message');
          });
        })
        .catch((e) => {
          console.error('Failed to creat Eth-Dm Publication message', e);
        });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={generateKeyPair} disabled={!provider}>
          Generate Eth-DM Key Pair
        </button>
        <button onClick={broadcastPublicKey} disabled={!ethDmKeyPair || !waku}>
          Broadcast Eth-DM Public Key
        </button>
      </header>
    </div>
  );
}

export default App;

async function initWaku(): Promise<Waku> {
  const waku = await Waku.create({});

  const nodes = await getNodes();
  await Promise.all(
    nodes.map((addr) => {
      return waku.dial(addr);
    })
  );

  return waku;
}

function getNodes() {
  // Works with react-scripts
  if (process?.env?.NODE_ENV === 'development') {
    return getStatusFleetNodes(Environment.Test);
  } else {
    return getStatusFleetNodes(Environment.Prod);
  }
}

function createWakuMessage(ethDmMsg: PublicKeyMessage): WakuMessage {
  const payload = encode(ethDmMsg);
  return WakuMessage.fromBytes(payload, PublicKeyContentTopic);
}

function handlePublicKeyMessage(msg: WakuMessage) {
  if (msg.payload) {
    const publicKeyMsg = decode(msg.payload);
    console.log('publicKeyMsg', publicKeyMsg);
    const res = validatePublicKeyMessage(publicKeyMsg);
    console.log(`Public Key Message Received, valid: ${res}`, publicKeyMsg);
  }
}

function encode(msg: PublicKeyMessage): Buffer {
  const jsonStr = JSON.stringify(msg);
  return Buffer.from(jsonStr, 'utf-8');
}

function decode(bytes: Uint8Array): PublicKeyMessage {
  const buf = Buffer.from(bytes);
  const str = buf.toString('utf-8');
  return JSON.parse(str);
}
