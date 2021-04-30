import { ChatMessage } from 'waku-chat/chat_message';
import { copyMergeUniqueReplace } from './App';

test('Merging of old and current messages', () => {
  const oldMsgs = [
    new ChatMessage(new Date(10_000), 'alice', 'Here is the first message'),
    new ChatMessage(new Date(13_000), 'carol', 'Here is a fourth message'),
    new ChatMessage(new Date(11_000), 'bob', 'Here is a second message'),
  ];

  const newMsgs = [
    // Here is a dupe
    new ChatMessage(new Date(11_000), 'bob', 'Here is a second message'),
    new ChatMessage(new Date(12_000), 'alice', 'Here is a third message'),
  ];

  const expectedResult = [
    new ChatMessage(new Date(10_000), 'alice', 'Here is the first message'),
    new ChatMessage(new Date(11_000), 'bob', 'Here is a second message'),
    new ChatMessage(new Date(12_000), 'alice', 'Here is a third message'),
    new ChatMessage(new Date(13_000), 'carol', 'Here is a fourth message'),
  ];

  const setter = (msgs: ChatMessage[]) => {
    expect(msgs).toEqual(expectedResult);
  };

  copyMergeUniqueReplace(newMsgs, oldMsgs, setter);
});
