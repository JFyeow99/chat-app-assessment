import { StyleSheet, Switch, View } from 'react-native';

import { useBlockStore } from '@/store/blockStore';
import { colors, space } from '@/theme/tokens';
import { Text } from '@/ui';

export function BlockUserSwitch({ contactId }) {
  const blocked = useBlockStore((s) => s.isBlocked(contactId));
  const toggleBlocked = useBlockStore((s) => s.toggleBlocked);

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>Block contact</Text>
        <Text style={styles.subtitle}>Blocked contacts will not appear in your chat list.</Text>
      </View>
      <Switch
        value={blocked}
        onValueChange={() => toggleBlocked(contactId)}
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
