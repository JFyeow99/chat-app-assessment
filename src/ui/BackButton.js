import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

import { colors, space } from '@/theme/tokens';

import Icon from './Icon';

export default function BackButton() {
  const navigation = useNavigation();
  return (
    <Icon
      name={'chevron-left'}
      contStyle={styles.chip}
      size={24}
      color={colors.mocha900}
      onPress={() => navigation.goBack()}
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    padding: space.sm,
    backgroundColor: colors.mocha100,
    borderRadius: space.xxxl,
    elevation: 1,
  },
});
