import { StyleSheet, View } from 'react-native';

import { colors, space } from '@/theme/tokens';
import { Text } from '@/ui';

const ME = { name: 'Yeow Jun Foong', email: 'junfoong.work@gmail.com' };

export default function ProfileCard() {
  return (
    <View style={styles.profile}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>JF</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.name}>{ME.name}</Text>
        <Text style={styles.sub}>{ME.email}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: colors.mocha500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 20, fontWeight: '600' },
  text: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '600', color: colors.mocha900 },
  sub: { fontSize: 14, color: colors.mocha700 },
});
