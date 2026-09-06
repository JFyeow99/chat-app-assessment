import { Children } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';

/**
 * Grouped-row surface: warmWhite fill, hairline border, rounded, with a
 * hairline divider auto-inserted between children.
 */
export default function Card({ style, children }) {
  const items = Children.toArray(children);
  return (
    <View style={[styles.card, style]}>
      {items.map((child, i) => (
        <View key={child.key ?? i}>
          {i > 0 ? <View style={styles.divider} /> : null}
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.warmWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.mocha300,
    overflow: 'hidden',
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.mocha300 },
});
