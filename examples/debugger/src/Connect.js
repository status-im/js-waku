import { useEffect, useState } from 'react';
import { TextField } from '@material-ui/core';

export default function Connect(props) {
  const [peer, setPeer] = useState();
  const waku = props.waku;

  useEffect(() => {
    if (!waku) return;

    waku.libp2p.peerStore.on(
      'change:protocols',
      handleProtocolChange.bind({}, waku)
    );

    return () => {
      waku?.libp2p.peerStore.removeListener(
        'change:protocols',
        handleProtocolChange.bind({}, waku)
      );
    };
  }, [waku]);

  useEffect(() => {
    if (!waku) return;

    waku.libp2p.connectionManager.on('peer:connect', (connection) => {
      handlePeerConnect.bind({}, connection);
    });

    waku.libp2p.connectionManager.on('peer:disconnect', (connection) => {
      handlePeerDisconnect.bind({}, connection);
    });

    return () => {
      waku?.libp2p.connectionManager.removeListener(
        'peer:connect',
        handlePeerConnect.bind({}, waku)
      );
      waku?.libp2p.connectionManager.removeListener(
        'peer:disconnect',
        handlePeerDisconnect.bind({}, waku)
      );
    };
  }, [waku]);

  const handlePeerChange = (event) => {
    setPeer(event.target.value);
  };

  const keyDownHandler = async (event) => {
    if (event.key === 'Enter') {
      if (!waku) return;
      if (!peer) return;

      console.log(`Dialing ${peer}`);
      waku.dial(peer).then(() => {
        console.log(`Dial successful`);
      });
    }
  };

  return (
    <div
      id="connect"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <TextField
        id="peer-input"
        label="Peer"
        variant="filled"
        onChange={handlePeerChange}
        onKeyDown={keyDownHandler}
        value={peer}
        disabled={!waku}
      />
    </div>
  );
}

function handleProtocolChange(waku, { peerId, protocols }) {
  console.log(`Peer ${peerId} supports the following protocols: ${protocols}`);
}

function handlePeerConnect(connection) {
  console.log(`Connected to ${connection.remotePeer}`);
}

function handlePeerDisconnect(connection) {
  console.log(`Disconnected from ${connection.remotePeer}`);
}
