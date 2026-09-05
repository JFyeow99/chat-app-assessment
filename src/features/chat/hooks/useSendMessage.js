import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';

import { createPost } from '@/api';
import { previewIndexKey } from '@/features/chats/hooks';
import { messagesByContactKey } from './useMessages';

let seq = 0;
const makeClientId = () => `pending-${Date.now()}-${seq++}`;

const upsertPending = (post) => (old) => ({
  ...old,
  results: [...(old?.results ?? []).filter((p) => p.clientId !== post.clientId), post],
});

const patchByClientId = (clientId, patch) => (old) => {
  if (!old) return old;
  return {
    ...old,
    results: old.results.map((p) => (p.clientId === clientId ? { ...p, ...patch } : p)),
  };
};

const useSendMessage = () => {
  const { params } = useRoute();
  const contactId = params?.contactId;
  const queryClient = useQueryClient();
  const key = messagesByContactKey(contactId);

  const mutation = useMutation({
    mutationFn: ({ body }) => createPost({ userId: contactId, body }),

    onMutate: async ({ clientId, body }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const pending = {
        clientId,
        userId: contactId,
        body,
        createdAt: new Date().toISOString(),
        status: 'sending',
      };
      queryClient.setQueryData(key, upsertPending(pending));
      queryClient.setQueryData(previewIndexKey, upsertPending(pending));
    },

    onError: (_err, { clientId }) => {
      queryClient.setQueryData(key, patchByClientId(clientId, { status: 'failed' }));
      queryClient.setQueryData(previewIndexKey, patchByClientId(clientId, { status: 'failed' }));
    },

    onSuccess: (response, { clientId }) => {
      const patch = { status: 'sent', serverId: response.id };
      queryClient.setQueryData(key, patchByClientId(clientId, patch));
      queryClient.setQueryData(previewIndexKey, patchByClientId(clientId, patch));
    },

    onSettled: (_data, error) => {
      if (!error) queryClient.invalidateQueries({ queryKey: key });
    },
  });

  return {
    send: (body) => mutation.mutate({ clientId: makeClientId(), body }),
    retry: (message) => mutation.mutate({ clientId: message.id, body: message.text }),
  };
};

export default useSendMessage;
