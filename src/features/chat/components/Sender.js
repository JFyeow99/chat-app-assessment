import { colors, space } from '@/theme/tokens';
import { Icon } from '@/ui';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Sender({ onSend }) {
  const insets = useSafeAreaInsets();

  const [msg, setMsg] = useState('');

  const onSending = () => {
    if (!msg) return;
    onSend(msg);
    setMsg('');
  };

  return (
    <View style={[styles.main, { paddingBottom: insets.bottom + space.lg }]}>
      <View style={styles.inputCont}>
        <TextInput
          style={styles.input}
          cursorColor={colors.mocha500}
          value={msg}
          onChangeText={setMsg}
        />
      </View>
      <Icon name={'send'} contStyle={styles.sendIcon} color={colors.white} onPress={onSending} />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  inputCont: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    flex: 1,
    borderWidth: 1,
    borderRadius: space.xxl,
    borderColor: colors.mocha300,
    elevation: 1,
    backgroundColor: colors.mocha100,
  },
  input: {
    fontSize: 15,
    color: colors.mocha700,
  },
  sendIcon: {
    backgroundColor: colors.mocha500,
    padding: space.lg,
    borderRadius: space.xxl,
  },
});
