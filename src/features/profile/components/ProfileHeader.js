import { StyleSheet, View } from 'react-native';

import { HeaderScrim } from '@/navigation/HeaderScrim';
import { colors, space } from '@/theme/tokens';
import { BackButton, Text } from '@/ui';

export function ProfileHeader({ title }) {
  return (
    <HeaderScrim>
      {(insets) => (
        <View style={[styles.main, { marginTop: insets.top + space.sm }]}>
          <BackButton />
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
      )}
    </HeaderScrim>
  );
}

const styles = StyleSheet.create({
  main: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginHorizontal: space.lg },
  title: { fontSize: 18, fontWeight: '600', color: colors.mocha900 },
});
