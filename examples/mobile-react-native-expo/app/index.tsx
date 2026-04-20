/**
 * 入口页 / 欢迎页
 * 应用启动后的第一个页面，提供导航到主应用的入口
 */

import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

/**
 * 欢迎页面组件
 *
 * 展示项目 Logo、简介和进入主应用的按钮。
 * 用户点击按钮后通过 Expo Router 跳转到 Tab 导航主界面。
 */
export default function IndexScreen() {
  const primaryColor = useThemeColor('primary');

  return (
    <ThemedView className="flex-1 items-center justify-center px-6">
      <StatusBar style="auto" />

      {/* Logo 占位区 */}
      <View
        className="w-24 h-24 rounded-2xl items-center justify-center mb-6"
        style={{ backgroundColor: primaryColor }}
      >
        <ThemedText className="text-3xl font-bold text-white">JS</ThemedText>
      </View>

      {/* 标题 */}
      <ThemedText type="title" className="mb-2 text-center">
        JSTS 移动示例
      </ThemedText>

      {/* 副标题 */}
      <ThemedText type="caption" className="text-center mb-8 leading-6">
        基于 Expo SDK 52 + React Native New Architecture + NativeWind{'\n'}
        的跨平台移动应用示例项目
      </ThemedText>

      {/* 功能亮点列表 */}
      <View className="w-full mb-8 space-y-2">
        {['Expo Router 文件系统路由', 'NativeWind 样式系统', '深色模式支持', 'TypeScript 严格类型'].map(
          (feature) => (
            <View key={feature} className="flex-row items-center">
              <ThemedText style={{ color: primaryColor }} className="mr-2">
                ✓
              </ThemedText>
              <ThemedText type="caption">{feature}</ThemedText>
            </View>
          )
        )}
      </View>

      {/* 进入主应用按钮 */}
      <Pressable
        onPress={() => router.replace('/(tabs)/home')}
        className="w-full py-4 rounded-xl items-center active:opacity-80"
        style={{ backgroundColor: primaryColor }}
        accessibilityRole="button"
        accessibilityLabel="进入主应用"
      >
        <ThemedText className="text-white text-lg font-semibold">
          开始体验 →
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}
