/**
 * ThemedView 组件
 * 支持自动适配深色模式的视图容器组件
 */

import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { type ThemedViewProps } from '@/types';

/**
 * 支持深色模式的视图容器
 *
 * 自动应用当前主题下的背景色，作为页面或卡片的基础容器。
 * 与 ThemedText 配合使用可确保整体深色模式体验一致。
 */
export function ThemedView({
  children,
  className = '',
  ...rest
}: ThemedViewProps & Omit<ViewProps, 'className' | 'children'>) {
  // 获取当前主题下的背景色
  const backgroundColor = useThemeColor('background');

  return (
    <View
      className={`flex-1 ${className}`}
      style={{ backgroundColor }}
      {...rest}
    >
      {children}
    </View>
  );
}
