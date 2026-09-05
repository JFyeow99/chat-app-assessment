import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable } from 'react-native';

/**
 * @param {import('react').ComponentProps<typeof MaterialCommunityIcons> & { contStyle?: import('react-native').StyleProp<import('react-native').ViewStyle> }} props
 */
export default function Icon({ contStyle, ...props }) {
  return (
    <Pressable onPress={props.onPress} style={contStyle}>
      <MaterialCommunityIcons size={20} {...props} />
    </Pressable>
  );
}
