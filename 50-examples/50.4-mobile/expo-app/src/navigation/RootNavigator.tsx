import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@types';
import { useAuthStore } from '@hooks/useAuthStore';
import { MainTabNavigator } from './MainTabNavigator';
import { AuthNavigator } from './AuthNavigator';
import { PostDetailScreen } from '@screens/PostDetailScreen';
import { ProfileScreen } from '@screens/ProfileScreen';
import { SettingsScreen } from '@screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): JSX.Element {
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = status === 'authenticated';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="PostDetail"
            component={PostDetailScreen}
            options={{
              headerShown: true,
              title: '帖子详情',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerShown: true,
              title: '个人资料',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: true,
              title: '设置',
              animation: 'slide_from_right',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
