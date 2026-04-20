/**
 * Tab 导航布局
 * 使用 Expo Router 的 Tab 导航配置底部标签栏
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { getColors } from '@/constants/Colors';

/**
 * Tab 导航布局组件
 *
 * 定义底部 Tab 栏的样式、图标和标题。
 * 根据当前主题自动切换颜色。
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme ?? 'light');

  return (
    <Tabs
      screenOptions={{
        // Tab 栏激活颜色
        tabBarActiveTintColor: colors.primary,
        // Tab 栏非激活颜色
        tabBarInactiveTintColor: colors.textMuted,
        // Tab 栏背景色
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        // 页面头部样式
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        // 隐藏顶部标题（让页面自己控制）
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color}>🏠</TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '探索',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color}>🔍</TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color}>⚙️</TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

/**
 * 简单的 Tab 图标组件（使用 Emoji 作为占位）
 */
function TabIcon({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <React.Fragment>
      {/* 实际项目中应使用 @expo/vector-icons */}
      <span style={{ color, fontSize: 20 }}>{children}</span>
    </React.Fragment>
  );
}
