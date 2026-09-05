import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChatHeader } from '@/features/chat/components/index';
import { ChatScreen } from '@/features/chat/screens/ChatScreen';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { BlockedContactsScreen } from '@/features/settings/screens/BlockedContactsScreen';
import { colors } from '@/theme/tokens';
import { TabNavigator } from './tab/TabNavigator';

const RootStack = createNativeStackNavigator({
  screenOptions: { headerShown: false },
  screens: {
    Tabs: TabNavigator,
    Chat: {
      screen: ChatScreen,
      options: {
        headerShown: true,
        headerTransparent: true,
        header: (props) => <ChatHeader {...props} />,
      },
    },
    Profile: {
      screen: ProfileScreen,
      options: {
        headerShown: true,
        headerTransparent: true,
        header: (props) => <ProfileHeader {...props} />,
      },
    },
    BlockedContacts: {
      screen: BlockedContactsScreen,
      options: {
        headerShown: true,
        headerTransparent: true,
        header: (props) => <ProfileHeader {...props} title={'Blocked contacts'} />,
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

export const navTheme = {
  dark: false,
  colors: {
    primary: colors.mocha500,
    background: colors.mocha100,
    card: colors.mocha100,
    text: colors.mocha900,
    border: colors.mocha300,
    notification: colors.red,
  },
  fonts: {
    regular: { fontFamily: 'Inter_400Regular', fontWeight: '400' },
    medium: { fontFamily: 'Inter_500Medium', fontWeight: '500' },
    bold: { fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
    heavy: { fontFamily: 'Inter_600SemiBold', fontWeight: '700' },
  },
};
