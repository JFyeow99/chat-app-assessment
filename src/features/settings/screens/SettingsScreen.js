import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { ScrollView, StyleSheet } from 'react-native';

import { ProfileCard, SettingsRow, SettingsSection } from '../components';
import { useTabScreenPadding } from '@/navigation/tab/useTabScreenPadding';
import { useBlockStore } from '@/store/blockStore';
import { colors } from '@/theme/tokens';

export function SettingsScreen() {
  const navigation = useNavigation();
  const contentPadding = useTabScreenPadding();
  const blockedCount = useBlockStore((s) => s.blockedIds.length);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={contentPadding}>
      <ProfileCard />

      <SettingsSection title={'Preferences'}>
        <SettingsRow
          label={'Blocked contacts'}
          value={String(blockedCount)}
          onPress={() => navigation.navigate('BlockedContacts')}
        />
      </SettingsSection>

      <SettingsSection title={'About'}>
        <SettingsRow label={'Version'} value={Constants.expoConfig?.version ?? '—'} />
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mocha100 },
});
