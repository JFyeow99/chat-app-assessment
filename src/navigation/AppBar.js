import { getHeaderTitle } from '@react-navigation/elements';
import { StyleSheet } from 'react-native';

import { useContact } from '@/features/chats/hooks';
import { space } from '@/theme/tokens';
import { Text } from '@/ui';
import { APP_BAR_HEIGHT, HeaderScrim } from './HeaderScrim';

export { APP_BAR_HEIGHT };

export function AppBar({ route, options }) {
  const contact = useContact(route.params?.contactId);
  const title = contact?.name ?? getHeaderTitle(options, route.name);

  return (
    <HeaderScrim>
      {(insets) => (
        <Text style={[styles.title, { marginTop: insets.top + space.sm }]}>{title}</Text>
      )}
    </HeaderScrim>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: space.lg,
    marginBottom: space.md,
  },
});
