/**
 * 设置页（Settings）
 * 提供主题切换、偏好设置等功能
 */

import React, { useState } from 'react';
import { Pressable, View, Switch } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { type ThemeMode } from '@/types';

/**
 * 设置页面组件
 *
 * 展示主题模式切换、通知开关等偏好设置项。
 * 使用 React Native 的 Switch 组件实现原生交互体验。
 */
export default function SettingsScreen() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const surfaceColor = useThemeColor('surface');
  const primaryColor = useThemeColor('primary');
  const borderColor = useThemeColor('border');

  /**
   * 主题模式选项配置
   */
  const themeOptions: { label: string; value: ThemeMode }[] = [
    { label: '跟随系统', value: 'system' },
    { label: '浅色模式', value: 'light' },
    { label: '深色模式', value: 'dark' },
  ];

  return (
    <ThemedView className="flex-1">
      {/* 页面标题 */}
      <View className="px-4 pt-14 pb-4">
        <ThemedText type="title">设置</ThemedText>
        <ThemedText type="caption">自定义应用外观与行为</ThemedText>
      </View>

      {/* 设置分组：外观 */}
      <View className="px-4 mb-6">
        <ThemedText
          type="caption"
          className="uppercase tracking-wider mb-2 px-1"
        >
          外观
        </ThemedText>

        <View
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: surfaceColor, borderColor, borderWidth: 1 }}
        >
          {themeOptions.map((option, index) => (
            <Pressable
              key={option.value}
              onPress={() => setThemeMode(option.value)}
              className={`flex-row items-center justify-between px-4 py-3.5 ${
                index < themeOptions.length - 1 ? 'border-b' : ''
              }`}
              style={{
                borderBottomColor:
                  index < themeOptions.length - 1 ? borderColor : undefined,
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: themeMode === option.value }}
              accessibilityLabel={`切换为${option.label}`}
            >
              <ThemedText type="default">{option.label}</ThemedText>
              {themeMode === option.value && (
                <ThemedText style={{ color: primaryColor }}>✓</ThemedText>
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* 设置分组：偏好 */}
      <View className="px-4 mb-6">
        <ThemedText
          type="caption"
          className="uppercase tracking-wider mb-2 px-1"
        >
          偏好
        </ThemedText>

        <View
          className="rounded-xl px-4 py-3.5 flex-row items-center justify-between"
          style={{ backgroundColor: surfaceColor, borderColor, borderWidth: 1 }}
        >
          <ThemedText type="default">启用通知</ThemedText>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: primaryColor }}
            accessibilityLabel="切换通知开关"
          />
        </View>
      </View>

      {/* 设置分组：关于 */}
      <View className="px-4">
        <ThemedText
          type="caption"
          className="uppercase tracking-wider mb-2 px-1"
        >
          关于
        </ThemedText>

        <View
          className="rounded-xl px-4 py-3.5"
          style={{ backgroundColor: surfaceColor, borderColor, borderWidth: 1 }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <ThemedText type="default">应用版本</ThemedText>
            <ThemedText type="caption">v1.0.0</ThemedText>
          </View>
          <View className="flex-row justify-between items-center">
            <ThemedText type="default">Expo SDK</ThemedText>
            <ThemedText type="caption">52.0.0</ThemedText>
          </View>
        </View>
      </View>

      {/* 底部版权信息 */}
      <View className="mt-auto py-6 items-center">
        <ThemedText type="caption">© 2026 JSTS Code Lab</ThemedText>
      </View>
    </ThemedView>
  );
}
