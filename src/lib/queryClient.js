import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))),
);

AppState.addEventListener('change', (status) => {
  focusManager.setFocused(status === 'active');
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 45_000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});
