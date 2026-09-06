import { Pressable, StyleSheet, View } from 'react-native';

import { useContact } from '@/features/chats/hooks';
import { HeaderScrim } from '@/navigation/HeaderScrim';
import { space } from '@/theme/tokens';
import { Avatar, BackButton, Text } from '@/ui';

export default function ChatHeader({ route, navigation }) {
  const contact = useContact(route.params?.contactId);

  return (
    <HeaderScrim>
      {(insets) => (
        <View style={[styles.main, { marginTop: insets.top + space.sm }]}>
          <BackButton />
          <Pressable
            style={styles.userNameCont}
            onPress={() => navigation.navigate('Profile', { contactId: route.params.contactId })}
          >
            <Avatar source={contact?.avatar} size={32} />
            <Text style={styles.title} numberOfLines={1}>
              {contact?.name ?? ''}
            </Text>
          </Pressable>
        </View>
      )}
    </HeaderScrim>
  );
}

const styles = StyleSheet.create({
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    marginHorizontal: space.lg,
  },
  userNameCont: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  title: { fontSize: 22, fontWeight: '500', flexShrink: 1 },
});
