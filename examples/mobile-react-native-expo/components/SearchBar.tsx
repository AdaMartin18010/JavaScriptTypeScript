/**
 * SearchBar 组件
 * 受控搜索输入框，支持清空按钮与主题适配
 */

import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { type SearchBarProps } from '@/types';

/**
 * 搜索栏组件
 *
 * 使用 NativeWind 进行样式处理，自动适配当前主题。
 * 包含搜索图标占位区、输入框和清空按钮。
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = '搜索...',
}: SearchBarProps) {
  const surfaceColor = useThemeColor('surface');
  const textColor = useThemeColor('text');
  const mutedColor = useThemeColor('textMuted');
  const borderColor = useThemeColor('border');

  return (
    <View
      className="flex-row items-center px-4 py-2.5 rounded-xl mx-4 mb-4"
      style={{
        backgroundColor: surfaceColor,
        borderColor,
        borderWidth: 1,
      }}
    >
      {/* 搜索图标（文本占位） */}
      <View className="mr-2">
        <TextInput
          editable={false}
          className="text-muted w-5"
          style={{ color: mutedColor }}
          value="🔍"
        />
      </View>

      {/* 输入框 */}
      <TextInput
        className="flex-1 text-base"
        style={{ color: textColor }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={mutedColor}
        accessibilityRole="search"
        accessibilityLabel="搜索输入框"
      />

      {/* 清空按钮 */}
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          className="ml-2 px-2 py-1 rounded-full"
          style={{ backgroundColor: borderColor }}
          accessibilityLabel="清空搜索内容"
          accessibilityRole="button"
        >
          <TextInput
            editable={false}
            className="text-sm"
            style={{ color: mutedColor }}
            value="✕"
          />
        </Pressable>
      )}
    </View>
  );
}
