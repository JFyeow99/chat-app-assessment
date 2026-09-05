import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUsers } from '@/features/chats/hooks';
import { APP_BAR_HEIGHT } from '@/navigation/HeaderScrim';
import { useBlockStore } from '@/store/blockStore';
import { colors } from '@/theme/tokens';
import { List } from '@/ui';

import { BlockedContactRow } from '../components/index';

const keyExtractor = (contact) => String(contact.id);
const renderItem = ({ item }) => <BlockedContactRow contact={item} />;
const Separator = () => <View style={styles.separator} />;

export function BlockedContactsScreen() {
  const { data } = useUsers();
  const blockedIds = useBlockStore((s) => s.blockedIds);
  const insets = useSafeAreaInsets();

  const blocked = useMemo(
    () => blockedIds.map((id) => data?.contactsById.get(id)).filter(Boolean),
    [blockedIds, data]
  );

  return (
    <List
      data={blocked}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={Separator}
      emptyText={'No blocked contacts.'}
      showFooterText={blocked.length > 0}
      paddingTop={insets.top + APP_BAR_HEIGHT}
    />
  );
}

const styles = StyleSheet.create({
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.mocha300 },
});
