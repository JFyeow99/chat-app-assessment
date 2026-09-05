// Deep imports so Metro bundles only these three weights, not all 18 Inter faces.
import { useFonts } from '@expo-google-fonts/inter/useFonts';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/lib/queryClient';
import { Navigation, navTheme } from '@/navigation/RootNavigator';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync(colors.mocha100);

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <KeyboardProvider navigationBarTranslucent statusBarTranslucent>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={'dark'} />
          <Navigation theme={navTheme} />
        </QueryClientProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
