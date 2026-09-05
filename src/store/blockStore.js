import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * @typedef {object} BlockStore
 * @property {Array<number | string>} blockedIds
 * @property {(id: number | string) => void} toggleBlocked
 * @property {(id: number | string) => boolean} isBlocked
 */

export const useBlockStore = create(
  persist(
    /** @returns {BlockStore} */
    (set, get) => ({
      blockedIds: [],
      toggleBlocked: (id) =>
        set((state) => ({
          blockedIds: state.blockedIds.includes(id)
            ? state.blockedIds.filter((x) => x !== id)
            : [...state.blockedIds, id],
        })),
      isBlocked: (id) => get().blockedIds.includes(id),
    }),
    {
      name: 'blocked-contacts',
      storage: createJSONStorage(() => Storage),
    },
  ),
);
