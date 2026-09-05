import { Pressable, StyleSheet, View } from 'react-native';

import { colors, space } from '@/theme/tokens';
import { Icon, Text } from '@/ui';

export default function SettingsRow({ label, value, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {onPress ? <Icon name={'chevron-right'} size={16} color={colors.mocha300} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  pressed: { backgroundColor: colors.mocha100 },
  label: { fontSize: 16, color: colors.mocha900 },
  right: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  value: { fontSize: 14, color: colors.mocha700 },
});
