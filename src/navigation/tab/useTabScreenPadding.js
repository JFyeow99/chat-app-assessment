import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '@/theme/tokens';

import { APP_BAR_HEIGHT } from '../AppBar';
import { FLOATING_TAB_BAR_TOTAL_HEIGHT } from './TabBar';

export function useTabScreenPadding() {
  const insets = useSafeAreaInsets();
  return {
    paddingTop: insets.top + APP_BAR_HEIGHT,
    paddingBottom: FLOATING_TAB_BAR_TOTAL_HEIGHT + space.xl,
  };
}
