import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, space } from '@/theme/tokens';

import Skeleton from './Skeleton';
import Text from './Text';

const CAUGHT_UP_TEXT = "You're all caught up";
const EMPTY_IMAGE = require('@assets/empty-box.webp');
const SKELETON_ROWS = 7;

const List = forwardRef(function List(
  {
    style,
    showFooterText,
    footerText,
    emptyText,
    paddingTop = 0,
    paddingBottom,
    loading = false,
    ...props
  },
  ref,
) {
  const footerContent = footerText ?? (showFooterText ? CAUGHT_UP_TEXT : null);
  const contentPadding = { paddingTop };

  if (loading) {
    return (
      <View style={[styles.screen, style, styles.content, contentPadding]}>
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <View key={i}>
            {i > 0 && <Separator />}
            <SkeletonRow />
          </View>
        ))}
      </View>
    );
  }

  return (
    <FlashList
      ref={ref}
      style={[styles.screen, style]}
      contentContainerStyle={[styles.content, contentPadding]}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={<ListEmpty>{emptyText}</ListEmpty>}
      ListFooterComponent={<ListFooter paddingBottom={paddingBottom}>{footerContent}</ListFooter>}
      {...props}
    />
  );
});

export default List;

const SkeletonRow = () => (
  <View style={styles.skeletonRow}>
    <Skeleton style={styles.skeletonAvatar} />
    <View style={styles.skeletonLines}>
      <Skeleton style={styles.skeletonLine} />
      <Skeleton style={[styles.skeletonLine, styles.skeletonLineShort]} />
    </View>
  </View>
);

const ListFooter = ({ children, paddingBottom = space.lg }) => {
  if (!children) return <View style={{ paddingBottom }} />;
  return <Text style={[styles.footer, { paddingBottom }]}>{children}</Text>;
};

const Separator = () => <View style={styles.separator} />;

const ListEmpty = ({ children }) => {
  if (!children) return null;
  return (
    <View style={styles.empty}>
      <Image source={EMPTY_IMAGE} style={styles.emptyImage} contentFit={'contain'} />
      <Text style={styles.emptyText}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mocha100 },
  content: { paddingHorizontal: space.lg, flexGrow: 1 },
  separator: { height: space.xs },
  footer: { textAlign: 'center', color: colors.mocha500, paddingTop: space.lg },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    paddingVertical: space.xxxl,
  },
  emptyImage: { width: 120, height: 120 },
  emptyText: { textAlign: 'center', color: colors.mocha500 },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
  },
  skeletonAvatar: { width: 48, height: 48, borderRadius: 9999 },
  skeletonLines: { flex: 1, gap: space.sm },
  skeletonLine: { height: 12, width: '60%', borderRadius: 6 },
  skeletonLineShort: { width: '35%' },
});
