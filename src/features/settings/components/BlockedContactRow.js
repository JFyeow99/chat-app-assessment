import { StyleSheet, Switch, View } from 'react-native';

import { useBlockStore } from '@/store/blockStore';
import { colors, space } from '@/theme/tokens';
import { Avatar, Text } from '@/ui';

const BlockedContactRow = ({ contact }) => {
  const toggleBlocked = useBlockStore((s) => s.toggleBlocked);

  return (
    <View style={styles.row}>
      <Avatar source={contact.avatar} />
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
  text: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '600', color: colors.mocha900 },
  username: { fontSize: 14, color: colors.mocha500 },
});
