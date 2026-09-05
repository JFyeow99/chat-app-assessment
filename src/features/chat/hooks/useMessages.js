import { useQuery } from '@tanstack/react-query';

import { getPosts } from '@/api';
import { toMessage } from '@/lib/mappers';
import { useRoute } from '@react-navigation/native';

export const messagesByContactKey = (contactId) => ['messages', contactId || ''];

const useMessages = () => {
  const { params } = useRoute();

  return useQuery({
    queryKey: messagesByContactKey(params?.contactId),
    queryFn: ({ signal }) => getPosts({ userId: params?.contactId, limit: 10, signal }),
    select: (data) =>
      data.results.map(toMessage).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    enabled: Boolean(params?.contactId),
  });
};

export default useMessages;
