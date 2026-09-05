import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme/tokens';

export default function Skeleton({ style }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.gray, colors.mocha300]),
  }));

  return <Animated.View style={[styles.base, style, animatedStyle]} />;
}

const styles = StyleSheet.create({
  base: { borderRadius: 8 },
});
