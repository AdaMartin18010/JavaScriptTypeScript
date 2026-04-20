/**
 * Card 组件
 * 基于 NativeWind 的通用卡片组件，支持图片、标题、描述和评分展示
 */

import React from 'react';
import { Pressable, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { type CardProps } from '@/types';

/**
 * 可交互的卡片组件
 *
 * 使用 NativeWind 工具类实现响应式布局与主题适配。
 * 在 iOS 与 Android 上均保持一致的外观与交互反馈。
 */
export function Card({
  title,
  description,
  imageUrl,
  category,
  rating,
  onPress,
}: CardProps) {
  const surfaceColor = useThemeColor('surface');
  const borderColor = useThemeColor('border');

  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`查看 ${title} 详情`}
    >
      <View
        className="rounded-xl p-4 mb-3 shadow-sm"
        style={{
          backgroundColor: surfaceColor,
          borderColor,
          borderWidth: 1,
        }}
      >
        {/* 顶部区域：分类标签 + 评分 */}
        <View className="flex-row justify-between items-center mb-2">
          {category && (
            <ThemedText
              type="caption"
              className="px-2 py-1 rounded-md bg-primary/10 text-primary"
            >
              {category}
            </ThemedText>
          )}
          {typeof rating === 'number' && (
            <ThemedText type="caption">⭐ {rating.toFixed(1)}</ThemedText>
          )}
        </View>

        {/* 标题 */}
        <ThemedText type="subtitle" className="mb-1">
          {title}
        </ThemedText>

        {/* 描述文本 */}
        {description && (
          <ThemedText type="caption" className="leading-5">
            {description}
          </ThemedText>
        )}

        {/* 图片占位区 */}
        {imageUrl ? (
          <View
            className="mt-3 w-full h-32 rounded-lg bg-muted/20 items-center justify-center"
            accessibilityLabel={`${title} 封面图`}
          >
            <ThemedText type="caption">[图片] {title}</ThemedText>
          </View>
        ) : (
          <View
            className="mt-3 w-full h-32 rounded-lg items-center justify-center"
            style={{ backgroundColor: borderColor }}
          >
            <ThemedText type="caption">暂无图片</ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}
