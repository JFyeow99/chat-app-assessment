import { Children } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, space } from '@/theme/tokens';
import { Text } from '@/ui';

export default function SettingsSection({ title, children }) {
  const rows = Children.toArray(children);
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      <View style={styles.group}>
        {rows.map((row, i) => (
          <View key={row.key ?? i}>
            {i > 0 ? <View style={styles.divider} /> : null}
            {row}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: space.xl },
  title: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.mocha700,
    marginBottom: space.sm,
    marginHorizontal: space.lg,
  },
  group: {
    marginHorizontal: space.lg,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.warmWhite,
    borderWidth: 1,
    borderColor: colors.mocha300,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.mocha300 },
});
