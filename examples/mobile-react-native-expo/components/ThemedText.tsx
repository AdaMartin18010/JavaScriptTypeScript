/**
 * ThemedText 组件
 * 支持自动适配深色模式的文本组件，提供多种语义化预设样式
 */

import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { type ThemedTextProps } from '@/types';

/**
 * 根据语义类型返回对应的 Tailwind 类名字符串
 * @param type - 语义化类型
 * @returns NativeWind 类名字符串
 */
function getTypeStyles(type: ThemedTextProps['type']): string {
  switch (type) {
    case 'title':
      return 'text-2xl font-bold';
    case 'subtitle':
      return 'text-lg font-semibold';
    case 'caption':
      return 'text-sm text-muted';
    case 'link':
      return 'text-base text-primary';
    case 'default':
    default:
      return 'text-base';
  }
}

/**
 * 支持深色模式的文本组件
 *
 * 自动根据当前主题应用对应文本颜色，并支持语义化样式预设。
 * 使用 NativeWind 进行样式处理，确保跨平台一致性。
 */
export function ThemedText({
  children,
  type = 'default',
  className = '',
  onPress,
  ...rest
}: ThemedTextProps & Omit<TextProps, 'className' | 'children' | 'onPress'>) {
  // 获取当前主题下的文本颜色
  const textColor = useThemeColor('text');
  const mutedColor = useThemeColor('textMuted');
  const primaryColor = useThemeColor('primary');

  // 针对特定类型使用对应颜色
  const colorStyle =
    type === 'caption'
      ? { color: mutedColor }
      : type === 'link'
        ? { color: primaryColor }
        : { color: textColor };

  return (
    <Text
      className={`${getTypeStyles(type)} ${className}`}
      style={colorStyle}
      onPress={onPress}
      {...rest}
    >
      {children}
    </Text>
  );
}
