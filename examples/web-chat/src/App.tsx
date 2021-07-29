import { useEffect, useReducer, useState } from 'react';
import './App.css';
import {
  Direction,
  Environment,
  getStatusFleetNodes,
  StoreCodec,
  Waku,
  WakuMessage,
} from 'js-waku';
import handleCommand from './command';
import Room from './Room';
import { WakuContext } from './WakuContext';
import { ThemeProvider } from '@livechat/ui-kit';
import { generate } from 'server-name-generator';
import { Message } from './Message';

const themes = {
  AuthorName: {
    css: {
      fontSize: '1.1em',
    },
  },
  Message: {
    css: {
      margin: '0em',
      padding: '0em',
      fontSize: '0.83em',
    },
  },
  MessageText: {
    css: {
      margin: '0em',
      padding: '0.1em',
      paddingLeft: '1em',
      fontSize: '1.1em',
    },
  },
  MessageGroup: {
    css: {
      margin: '0em',
      padding: '0.2em',
    },
  },
};

export const ChatContentTopic = '/toy-chat/2/huilong/proto';

async function retrieveStoreMessages(
  waku: Waku,
  setArchivedMessages: (value: Message[]) => void
): Promise<number> {
  const callback = (wakuMessages: WakuMessage[]): void => {
    const messages: Message[] = [];
    wakuMessages
      .map((wakuMsg) => Message.fromWakuMessage(wakuMsg))
      .forEach((message) => {
        if (message) {
          messages.push(message);
        }
      });
    setArchivedMessages(messages);
  };

  const res = await waku.store.queryHistory({
    contentTopics: [ChatContentTopic],
    pageSize: 5,
    direction: Direction.FORWARD,
    callback,
  });

  return res ? res.length : 0;
}

export default function App() {
  const [messages, dispatchMessages] = useReducer(reduceMessages, []);
  const [waku, setWaku] = useState<Waku | undefined>(undefined);
  const [nick, setNick] = useState<string>(() => {
    const persistedNick = window.localStorage.getItem('nick');
    return persistedNick !== null ? persistedNick : generate();
  });
  const [
    historicalMessagesRetrieved,
    setHistoricalMessagesRetrieved,
  ] = useState(false);

  useEffect(() => {
    localStorage.setItem('nick', nick);
  }, [nick]);

  useEffect(() => {
    initWaku(setWaku)
      .then(() => console.log('Waku init done'))
      .catch((e) => console.log('Waku init failed ', e));
  }, []);

  useEffect(() => {
    if (!waku) return;
    // Let's retrieve previous messages before listening to new messages
    if (!historicalMessagesRetrieved) return;

    const handleRelayMessage = (wakuMsg: WakuMessage) => {
      console.log('Message received: ', wakuMsg);
      const msg = Message.fromWakuMessage(wakuMsg);
      if (msg) {
        dispatchMessages([msg]);
      }
    };

    waku.relay.addObserver(handleRelayMessage, [ChatContentTopic]);

    return function cleanUp() {
      waku?.relay.deleteObserver(handleRelayMessage, [ChatContentTopic]);
    };
  }, [waku, historicalMessagesRetrieved]);

  useEffect(() => {
    if (!waku) return;
    if (historicalMessagesRetrieved) return;

    const connectedToStorePeer = new Promise((resolve) =>
      waku.libp2p.peerStore.once(
        'change:protocols',
        ({ peerId, protocols }) => {
          if (protocols.includes(StoreCodec)) {
            resolve(peerId);
          }
        }
      )
    );

    connectedToStorePeer.then(() => {
      console.log(`Retrieving archived messages}`);
      setHistoricalMessagesRetrieved(true);

      try {
        retrieveStoreMessages(waku, dispatchMessages).then((length) =>
          console.log(`Messages retrieved:`, length)
        );
      } catch (e) {
        console.log(`Error encountered when retrieving archived messages`, e);
      }
    });
  }, [waku, historicalMessagesRetrieved]);

  return (
    <div
      className="chat-app"
      style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}
    >
      <WakuContext.Provider value={{ waku: waku }}>
        <ThemeProvider theme={themes}>
          <Room
            nick={nick}
            messages={messages}
            commandHandler={(input: string) => {
              const { command, response } = handleCommand(input, waku, setNick);
              const commandMessages = response.map((msg) => {
                return Message.fromUtf8String(command, msg);
              });
              dispatchMessages(commandMessages);
            }}
          />
        </ThemeProvider>
      </WakuContext.Provider>
    </div>
  );
}

async function initWaku(setter: (waku: Waku) => void) {
  try {
    const waku = await Waku.create({
      libp2p: {
        config: {
          pubsub: {
            enabled: true,
            emitSelf: true,
          },
        },
      },
    });

    setter(waku);

    const nodes = await getStatusFleetNodes(selectFleetEnv());
    await Promise.all(
      nodes.map((addr) => {
        return waku.dial(addr);
      })
    );
  } catch (e) {
    console.log('Issue starting waku ', e);
  }
}

function selectFleetEnv() {
  // Works with react-scripts
  if (process?.env?.NODE_ENV === 'development') {
    return Environment.Test;
  } else {
    return Environment.Prod;
  }
}

function reduceMessages(state: Message[], newMessages: Message[]) {
  return state.concat(newMessages);
}
