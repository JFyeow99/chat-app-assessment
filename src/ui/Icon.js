import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable } from 'react-native';

/**
 * @param {import('react').ComponentProps<typeof MaterialCommunityIcons> & { contStyle?: import('react-native').StyleProp<import('react-native').ViewStyle> }} props
 */
export default function Icon({ contStyle, disabled, ...props }) {
  return (
    <Pressable
      onPress={props.onPress}
      disabled={disabled}
      style={[contStyle, disabled && { opacity: 0.5 }]}
    >
      <MaterialCommunityIcons size={20} {...props} />
    </Pressable>
  );
}
