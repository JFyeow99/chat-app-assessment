import { useMemo } from 'react';
import { RefreshControl } from 'react-native';

import { useTabScreenPadding } from '@/navigation/tab/useTabScreenPadding';
import { useBlockStore } from '@/store/blockStore';
import { colors } from '@/theme/tokens';
import { List } from '@/ui';

import { ChatRow } from '../components/index';
import { usePreviewIndex, useUsers } from '../hooks';

const keyExtractor = (contact) => String(contact.id);
const renderItem = ({ item }) => <ChatRow contact={item} />;

export function ChatsScreen() {
  const { data, isPending, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUsers();
  const { data: previewIndex } = usePreviewIndex();
  const blockedIds = useBlockStore((s) => s.blockedIds);
  const { paddingTop, paddingBottom } = useTabScreenPadding();

  const contacts = data?.contacts;
  const rows = useMemo(() => {
    const blocked = new Set(blockedIds);
    return (contacts ?? [])
      .filter((contact) => !blocked.has(contact.id))
      .map((contact) => ({
        ...contact,
        preview: previewIndex?.get(contact.id) ?? null,
      }));
  }, [contacts, previewIndex, blockedIds]);

  return (
    <List
      data={rows}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      onEndReachedThreshold={0.15}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.mocha500} />
      }
      emptyText={isPending ? undefined : 'No conversations yet. Pull to refresh.'}
      loading={isPending}
      showFooterText={!hasNextPage && rows.length > 0}
      footerText={isFetchingNextPage ? 'Loading…' : undefined}
    />
  );
}
