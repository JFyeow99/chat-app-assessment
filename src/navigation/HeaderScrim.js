import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';

export const APP_BAR_HEIGHT = 56;

export function HeaderScrim({ children }) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents={'box-none'} style={styles.host}>
      <LinearGradient
        pointerEvents={'none'}
        colors={[colors.mocha300, colors.mocha100, `${colors.mocha100}00`]}
        locations={[0, 0.8, 1]}
        style={[styles.gradient, { height: insets.top + APP_BAR_HEIGHT }]}
      />
      {children(insets)}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0 },
});
