import { StyleSheet, View } from 'react-native';

import { colors, space } from '@/theme/tokens';
import { Card, Text } from '@/ui';

export default function SettingsSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      <Card style={styles.group}>{children}</Card>
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
  group: { marginHorizontal: space.lg },
});
