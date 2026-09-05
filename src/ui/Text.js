import { StyleSheet, Text as RNText } from 'react-native';

import { colors, fontFamily } from '@/theme/tokens';

const FAMILY_BY_WEIGHT = {
  normal: fontFamily.regular,
  400: fontFamily.regular,

  600: fontFamily.semibold,

  700: fontFamily.bold,
  bold: fontFamily.bold,
};

/**
 * @param {import("react-native").TextProps} props
 */
export default function Text({ style, ...rest }) {
  const flat = StyleSheet.flatten([styles.base, style]);
  flat.fontFamily = FAMILY_BY_WEIGHT[String(flat.fontWeight)] ?? fontFamily.regular;
  delete flat.fontWeight;
  return <RNText {...rest} style={flat} />;
}

const styles = StyleSheet.create({
  base: { fontSize: 14, color: colors.mocha900 },
});
