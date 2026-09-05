import { useInfiniteQuery } from '@tanstack/react-query';

import { getPosts } from '@/api';
import { toMessage } from '@/lib/mappers';
import { useRoute } from '@react-navigation/native';

export const messagesByContactKey = (contactId) => ['messages', contactId || ''];

const PAGE_SIZE = 10;

const useMessages = () => {
  const { params } = useRoute();
  const contactId = params?.contactId;

  return useInfiniteQuery({
    queryKey: messagesByContactKey(contactId),
    queryFn: ({ pageParam, signal }) =>
      getPosts({ userId: contactId, limit: PAGE_SIZE, offset: pageParam, signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const next = lastPage.offset + lastPage.limit;
      return next < lastPage.total ? next : undefined;
    },
    select: (data) =>
      data.pages
        .flatMap((p) => p.results)
        .map(toMessage)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    enabled: Boolean(contactId),
  });
};

export default useMessages;
