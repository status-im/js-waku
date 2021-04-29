import { useState } from 'react';
import { ChatMessage } from 'waku-chat/chat_message';
import { WakuMessage } from 'waku/waku_message';
import { ChatContentTopic } from './App';
import ChatList from './ChatList';
import MessageInput from './MessageInput';
import { useWaku } from './WakuContext';
import { TitleBar, MessageList } from '@livechat/ui-kit';

interface Props {
  lines: ChatMessage[];
  commandHandler: (cmd: string) => void;
  nick: string;
}

export default function Room(props: Props) {
  let [messageToSend, setMessageToSend] = useState<string>('');
  const { waku } = useWaku();

  return (
    <div
      className="chat-container"
      style={{ height: '98vh', display: 'flex', flexDirection: 'column' }}
    >
      <TitleBar title="Waku v2 chat app" />
      <MessageList active containScrollInSubtree>
        <ChatList messages={props.lines} />
      </MessageList>
      <MessageInput
        messageHandler={setMessageToSend}
        sendMessage={
          waku
            ? async () => {
                return handleMessage(
                  messageToSend,
                  props.nick,
                  props.commandHandler,
                  waku.relay.send.bind(waku.relay)
                );
              }
            : undefined
        }
      />
    </div>
  );
}

async function handleMessage(
  message: string,
  nick: string,
  commandHandler: (cmd: string) => void,
  messageSender: (msg: WakuMessage) => Promise<void>
) {
  if (message.startsWith('/')) {
    commandHandler(message);
  } else {
    const chatMessage = new ChatMessage(new Date(), nick, message);
    const wakuMsg = WakuMessage.fromBytes(
      chatMessage.encode(),
      ChatContentTopic
    );
    return messageSender(wakuMsg);
  }
}
