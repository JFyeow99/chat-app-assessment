import { useInfiniteQuery } from '@tanstack/react-query';

import { getUsers } from '@/api';
import { toContact } from '@/lib/mappers';

const PAGE_SIZE = 10;

export default function useUsers() {
  return useInfiniteQuery({
    queryKey: ['contacts', 'list'],
    queryFn: ({ pageParam, signal }) => getUsers({ limit: PAGE_SIZE, offset: pageParam, signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const next = lastPage.offset + lastPage.limit;
      return next < lastPage.total ? next : undefined;
    },
    placeholderData: {
      pages: [],
      pageParams: [],
    },
    select: (data) => {
      const contacts = data.pages.flatMap((p) => p.results.map(toContact));
      return {
        pages: data.pages,
        pageParams: data.pageParams,
        contacts,
        contactsById: new Map(contacts.map((c) => [c.id, c])),
      };
    },
  });
}

// Every field Profile/Chat need (name, avatar, phone) is already in the list
// response, and a contact can only be reached by tapping an already-loaded
// row — so read it out of this same cache instead of a dedicated fetch.
export function useContact(id) {
  const { data } = useUsers();
  return data?.contactsById.get(id) ?? null;
}
