import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, glass } from '@/theme/tokens';
import { Icon, Text } from '@/ui';

const BAR_HEIGHT = 64;
const BAR_OFFSET = 12;

export const FLOATING_TAB_BAR_TOTAL_HEIGHT = BAR_HEIGHT + BAR_OFFSET;

const ICONS = {
  Chats: 'chat',
  Settings: 'account-cog',
};

export function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents={'box-none'} style={[styles.host, { bottom: insets.bottom + BAR_OFFSET }]}>
      <View style={styles.bar}>
        <View pointerEvents={'none'} style={[StyleSheet.absoluteFill, styles.barFill]} />
        <View pointerEvents={'none'} style={[StyleSheet.absoluteFill, styles.barBorder]} />
        {state.routes.map((route, index) => {
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return <TabItem key={route.key} name={route.name} focused={focused} onPress={onPress} />;
        })}
      </View>
    </View>
  );
}

function TabItem({ name, focused, onPress }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const icons = ICONS[name];
  const tint = focused ? colors.mocha700 : colors.mocha300;

  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
    >
      <Animated.View style={[styles.stack, animatedStyle]}>
        <Icon name={`${icons}${focused ? '' : '-outline'}`} size={22} color={tint} />
        <Text style={{ fontSize: 11, fontWeight: '600', color: tint }}>{name}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginHorizontal: 16,
  },
  bar: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  barFill: { backgroundColor: glass.tint, borderRadius: 9999 },
  barBorder: { borderWidth: 1, borderColor: glass.border, borderRadius: 9999 },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  stack: {
    alignItems: 'center',
    gap: 2,
  },
});
