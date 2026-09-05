import { getUser } from '@/api';
import { useContact } from '@/features/chats/hooks';
import { toContact } from '@/lib/mappers';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

export const profileKey = (id) => ['profile', id];

export const useProfile = () => {
  const { params } = useRoute();

  const id = params?.contactId || '';

  const cached = useContact(id);

  const { data, isError } = useQuery({
    queryKey: profileKey(id),
    queryFn: () => getUser(id),
    enabled: Boolean(id),
    select: toContact,
  });

  if (isError) return cached ?? {};
  return data ?? {};
};
