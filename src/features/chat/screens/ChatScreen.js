import { StyleSheet, View } from 'react-native';

import { colors, space } from '@/theme/tokens';
import { List } from '@/ui';
import { useMessages, useSendMessage } from '../hooks';
import { Message, Sender } from '../components';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useTabScreenPadding } from '@/navigation/tab/useTabScreenPadding';

export function ChatScreen() {
  const { data } = useMessages();
  const { send, retry } = useSendMessage();

  const { paddingTop } = useTabScreenPadding();

  const renderItem = ({ item }) => <Message {...item} onRetry={() => retry(item)} />;

  return (
    <KeyboardAvoidingView behavior={'padding'} style={styles.screen}>
      <List
        data={data}
        paddingTop={paddingTop}
        paddingBottom={space.lg}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: space.xl }} />}
        emptyText={'No message yet.'}
      />
      <Sender onSend={send} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: space.lg,
  },
  text: { color: colors.mocha700, textAlign: 'center' },
});
