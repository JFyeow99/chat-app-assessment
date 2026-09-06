import { colors } from '@/theme/tokens';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

const AVATAR_PLACEHOLDER = 'https://placehold.net/avatar-4.svg';

/**
 * @param {import('expo-image').ImageProps & { size?: number }} props
 */
function Avatar({ size = 48, ...props }) {
  return (
    <Image
      placeholder={AVATAR_PLACEHOLDER}
      style={[styles.avatar, { width: size, height: size }]}
      contentFit={'cover'}
      placeholderContentFit={'cover'}
      transition={150}
      {...props}
    />
  );
}

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 9999,
    backgroundColor: colors.mocha300,
  },
});
