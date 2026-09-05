import { useQuery } from '@tanstack/react-query';

import { getPosts } from '@/api';
import { toMessage } from '@/lib/mappers';

export const previewIndexKey = ['messages', 'previewIndex'];

export default function usePreviewIndex() {
  return useQuery({
    queryKey: previewIndexKey,
    queryFn: ({ signal }) => getPosts({ limit: 100, offset: 0, signal }),
    select: (data) => {
      const map = new Map();
      for (const post of data.results) {
        map.set(post.userId, toMessage(post));
      }
      return map;
    },
  });
}
