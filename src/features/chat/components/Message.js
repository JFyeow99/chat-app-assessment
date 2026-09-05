import { formatRelativeTime } from '@/lib';
import { colors, space } from '@/theme/tokens';
import { Icon, Text } from '@/ui';
import { StyleSheet, View } from 'react-native';

export default function Message({ text, createdAt, direction, status, onRetry }) {
  const outgoing = direction === 'outgoing';
  const failed = status === 'failed';

  return (
    <View style={[styles.row, outgoing && styles.rowOutgoing]}>
      <View
        style={[
          styles.bubble,
          outgoing ? styles.outgoing : styles.incoming,
          failed && styles.failed,
        ]}
      >
        <Text style={[styles.text, outgoing && styles.textOutgoing]}>{text}</Text>
        <View style={styles.footer}>
          <Text
            style={[
              styles.dateTime,
              outgoing && styles.dateTimeOutgoing,
              status === 'sending' && styles.sending,
            ]}
          >
            {formatRelativeTime(createdAt)}
          </Text>
          {outgoing && status === 'sent' && (
            <Icon name={'check-all'} size={14} color={colors.mocha100} />
          )}
        </View>
      </View>
      {failed && (
        <Text style={styles.retry} onPress={onRetry}>
          Failed to send · Tap to retry
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'flex-start' },
  rowOutgoing: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    padding: space.md,
    borderRadius: space.lg,
    gap: space.sm,
  },
  incoming: { backgroundColor: colors.gray },
  outgoing: { backgroundColor: colors.mocha500 },
  failed: { borderWidth: 1, borderColor: colors.red },
  text: { fontSize: 15, color: colors.mocha900 },
  textOutgoing: { color: colors.white },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: space.xs },
  dateTime: { fontSize: 12, letterSpacing: 0.5, color: colors.mocha500 },
  dateTimeOutgoing: { color: colors.mocha100 },
  sending: { color: colors.mocha300 },
  retry: { marginTop: space.xs, fontSize: 12, color: colors.red },
});
