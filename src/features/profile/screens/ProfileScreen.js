import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_BAR_HEIGHT } from '@/navigation/HeaderScrim';
import { AVATAR_PLACEHOLDER, colors, space } from '@/theme/tokens';
import { Icon, Text } from '@/ui';
import { BlockUserSwitch } from '../components/BlockUserSwitch';
import { useProfile } from '../hooks';

const AVATAR_SIZE = 96;

const FIELDS = [
  { key: 'email', icon: 'email' },
  { key: 'phone', icon: 'phone' },
  { key: 'website', icon: 'web' },
  { key: 'city', icon: 'city' },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const contact = useProfile();
  const fields = FIELDS.filter(({ key }) => contact[key]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + APP_BAR_HEIGHT, paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={contact.avatar}
          placeholder={AVATAR_PLACEHOLDER}
          style={styles.avatar}
          contentFit={'cover'}
          transition={150}
        />
        <Text style={styles.name}>{contact.name}</Text>
        {Boolean(contact.username) && <Text style={styles.username}>@{contact.username}</Text>}
      </View>
      <View style={styles.card}>
        {fields.map(({ key, icon }, i) => (
          <View key={key}>
            {i > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.row}>
              <Icon name={icon} color={colors.mocha500} />
              <Text style={styles.value}>{contact[key]}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={[styles.card, styles.blockCard]}>
        <BlockUserSwitch {...contact} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mocha100,
  },
  content: { paddingHorizontal: space.lg },
  header: { alignItems: 'center', gap: space.md, marginBottom: space.xl },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 9999,
    backgroundColor: colors.mocha300,
  },
  name: { fontSize: 22, fontWeight: '600', color: colors.mocha900 },
  username: { fontSize: 14, fontWeight: '400', color: colors.mocha300 },
  card: {
    backgroundColor: colors.warmWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.mocha300,
    overflow: 'hidden',
  },
  blockCard: { marginTop: space.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.mocha300 },
  value: { color: colors.mocha900, flexShrink: 1, textAlign: 'right' },
});
