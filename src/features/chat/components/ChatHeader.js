import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { useContact } from '@/features/chats/hooks';
import { HeaderScrim } from '@/navigation/HeaderScrim';
import { AVATAR_PLACEHOLDER, colors, space } from '@/theme/tokens';
import { Icon, Text } from '@/ui';

const AVATAR_SIZE = 32;

export default function ChatHeader({ route, navigation }) {
  const contact = useContact(route.params?.contactId);

  return (
    <HeaderScrim>
      {(insets) => (
        <View style={[styles.main, { marginTop: insets.top + space.sm }]}>
          <Icon
            name={'chevron-left'}
            contStyle={styles.backIconCont}
            size={24}
            color={colors.mocha900}
            onPress={() => navigation.goBack()}
          />
          <Pressable
            style={styles.userNameCont}
            onPress={() => navigation.navigate('Profile', { contactId: route.params.contactId })}
          >
            <Image
              source={contact?.avatar}
              placeholder={AVATAR_PLACEHOLDER}
              style={styles.avatar}
              contentFit={'cover'}
              transition={150}
            />
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
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 9999,
    backgroundColor: colors.mocha300,
  },
  title: { fontSize: 22, fontWeight: '500', flexShrink: 1 },
  backIconCont: {
    padding: space.sm,
    backgroundColor: colors.mocha100,
    borderRadius: space.xxxl,
    elevation: 1,
  },
});
