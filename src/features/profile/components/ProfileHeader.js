import { StyleSheet, View } from 'react-native';

import { HeaderScrim } from '@/navigation/HeaderScrim';
import { colors, space } from '@/theme/tokens';
import { Icon, Text } from '@/ui';

export function ProfileHeader({ navigation, title }) {
  return (
    <HeaderScrim>
      {(insets) => (
        <View style={[styles.main, { marginTop: insets.top + space.sm }]}>
          <Icon
            name={'chevron-left'}
            contStyle={styles.backIcon}
            size={24}
            color={colors.mocha900}
            onPress={() => navigation.goBack()}
          />
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
      )}
    </HeaderScrim>
  );
}

const styles = StyleSheet.create({
  main: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginHorizontal: space.lg },
  backIcon: {
    padding: space.sm,
    backgroundColor: colors.mocha100,
    borderRadius: space.xxxl,
    elevation: 1,
  },
  title: { fontSize: 18, fontWeight: '600', color: colors.mocha900 },
});
