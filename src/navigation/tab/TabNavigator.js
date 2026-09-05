import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ChatsScreen } from '@/features/chats/screens/ChatsScreen';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';
import { AppBar } from '../AppBar';
import { TabBar } from './TabBar';

function renderTabBar(props) {
  return <TabBar {...props} />;
}

function renderHeader(props) {
  return <AppBar {...props} />;
}

export const TabNavigator = createBottomTabNavigator({
  tabBar: renderTabBar,
  screenOptions: {
    headerTransparent: true,
    header: renderHeader,
    animation: 'fade',
  },
  screens: {
    Chats: ChatsScreen,
    Settings: SettingsScreen,
  },
});
