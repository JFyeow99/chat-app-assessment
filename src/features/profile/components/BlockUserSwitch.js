import { StyleSheet, Switch, ToastAndroid, View } from 'react-native';

import { useBlockStore } from '@/store/blockStore';
import { colors, space } from '@/theme/tokens';
import { Text } from '@/ui';

export function BlockUserSwitch({ id, name }) {
  const blocked = useBlockStore((s) => s.isBlocked(id));
  const toggleBlocked = useBlockStore((s) => s.toggleBlocked);

  const onToggling = (value) => {
    ToastAndroid.show(`${name} has been ${value ? 'blocked' : 'unblocked'}`, ToastAndroid.SHORT);
    toggleBlocked(id);
  };

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>Block contact</Text>
        <Text style={styles.subtitle}>Blocked contacts will not appear in your chat list.</Text>
      </View>
      <Switch
        value={blocked}
        onValueChange={onToggling}
        trackColor={{ false: colors.mocha300, true: colors.red }}
        thumbColor={colors.warmWhite}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    gap: space.md,
  },
  text: { flex: 1, gap: space.xs },
  label: { fontSize: 16, color: colors.mocha500, fontWeight: '600' },
  subtitle: { fontSize: 13, color: colors.mocha300 },
});
