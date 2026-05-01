import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '@types';
import { useTheme } from '@hooks/useTheme';
import { HomeScreen } from '@screens/HomeScreen';
import { ExploreScreen } from '@screens/ExploreScreen';
import { CreateScreen } from '@screens/CreateScreen';
import { NotificationsScreen } from '@screens/NotificationsScreen';
import { MyProfileScreen } from '@screens/MyProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator(): JSX.Element {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Explore':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Create':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'MyProfile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: '探索' }} />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{ title: '创建', tabBarLabel: '' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: '通知' }}
      />
      <Tab.Screen name="MyProfile" component={MyProfileScreen} options={{ title: '我的' }} />
    </Tab.Navigator>
  );
}
