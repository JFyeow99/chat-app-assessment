import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatRelativeTime } from '@/lib/time';
import { AVATAR_PLACEHOLDER, colors, space } from '@/theme/tokens';
import { Text } from '@/ui';

const AVATAR_SIZE = 48;

const ChatRow = ({ contact }) => {
  const navigation = useNavigation();
  const { preview } = contact;

  const onPress = () => {
    navigation.navigate('Chat', { contactId: contact.id });
  };

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Image
        source={contact.avatar}
        placeholder={AVATAR_PLACEHOLDER}
        style={styles.avatar}
        contentFit={'cover'}
        transition={150}
        recyclingKey={String(contact.id)}
        placeholderContentFit={'cover'}
      />
      <View style={styles.rowText}>
        <View style={styles.topLine}>
          <Text style={styles.name} numberOfLines={1}>
            {contact.name}
          </Text>
          {preview && <Text style={styles.time}>{formatRelativeTime(preview.createdAt)}</Text>}
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {preview ? preview.text : 'No messages yet'}
        </Text>
      </View>
    </Pressable>
  );
};

export default ChatRow;

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
  rowText: { flex: 1, gap: space.xs },
  topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '600', color: colors.mocha900, flexShrink: 1 },
  time: { fontSize: 12, color: colors.mocha500 },
  preview: { fontSize: 14, color: colors.mocha500 },
});
