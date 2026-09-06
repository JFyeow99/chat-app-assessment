import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_BAR_HEIGHT } from '@/navigation/HeaderScrim';
import { colors, space } from '@/theme/tokens';
import { Avatar, Card, Icon, Text } from '@/ui';
import { BlockUserSwitch } from '../components/BlockUserSwitch';
import { useProfile } from '../hooks';

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
        <Avatar source={contact.avatar} size={96} />
        <Text style={styles.name}>{contact.name}</Text>
        {Boolean(contact.username) && <Text style={styles.username}>@{contact.username}</Text>}
      </View>
      <Card>
        {fields.map(({ key, icon }) => (
          <View key={key} style={styles.row}>
            <Icon name={icon} color={colors.mocha500} />
            <Text style={styles.value}>{contact[key]}</Text>
          </View>
        ))}
      </Card>
      <Card style={styles.blockCard}>
        <BlockUserSwitch {...contact} />
      </Card>
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
  name: { fontSize: 22, fontWeight: '600', color: colors.mocha900 },
  username: { fontSize: 14, fontWeight: '400', color: colors.mocha300 },
  blockCard: { marginTop: space.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  value: { color: colors.mocha900, flexShrink: 1, textAlign: 'right' },
});
