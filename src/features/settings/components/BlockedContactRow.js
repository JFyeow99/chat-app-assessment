import { Image } from 'expo-image';
import { StyleSheet, Switch, View } from 'react-native';

import { useBlockStore } from '@/store/blockStore';
import { AVATAR_PLACEHOLDER, colors, space } from '@/theme/tokens';
import { Text } from '@/ui';

const AVATAR_SIZE = 48;

const BlockedContactRow = ({ contact }) => {
  const toggleBlocked = useBlockStore((s) => s.toggleBlocked);

  return (
    <View style={styles.row}>
      <Image
        source={contact.avatar}
        placeholder={AVATAR_PLACEHOLDER}
        style={styles.avatar}
        contentFit={'cover'}
        transition={150}
      />
      <View style={styles.text}>
        <Text style={styles.name}>{contact.name}</Text>
        {Boolean(contact.username) && <Text style={styles.username}>@{contact.username}</Text>}
      </View>
      <Switch
        value={true}
        onValueChange={() => toggleBlocked(contact.id)}
        trackColor={{ false: colors.mocha300, true: colors.red }}
        thumbColor={colors.warmWhite}
      />
    </View>
  );
};

export default BlockedContactRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 9999,
    backgroundColor: colors.mocha300,
  },
  text: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '600', color: colors.mocha900 },
  username: { fontSize: 14, color: colors.mocha500 },
});
