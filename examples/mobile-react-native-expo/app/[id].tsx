/**
 * 详情页（动态路由）
 * 通过 [id].tsx 实现 Expo Router 的动态路由
 */

import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { findItemById } from '@/constants/MockData';

/**
 * 详情页面组件
 *
 * 接收路由参数 id，查询并展示对应项目的详细信息。
 * 若未找到对应数据，展示友好的空状态提示。
 */
export default function DetailScreen() {
  // 获取路由参数
  const { id } = useLocalSearchParams<{ id: string }>();

  // 根据 ID 查找数据
  const item = id ? findItemById(id) : undefined;

  const surfaceColor = useThemeColor('surface');
  const borderColor = useThemeColor('border');
  const primaryColor = useThemeColor('primary');

  // 数据未找到时的空状态
  if (!item) {
    return (
      <ThemedView className="flex-1 items-center justify-center px-6">
        <ThemedText type="title" className="mb-2">
          未找到内容
        </ThemedText>
        <ThemedText type="caption" className="text-center mb-6">
          该条目可能已被删除或 ID 参数不正确
        </ThemedText>
        <Pressable
          onPress={() => router.back()}
          className="px-6 py-3 rounded-xl active:opacity-80"
          style={{ backgroundColor: primaryColor }}
        >
          <ThemedText className="text-white font-semibold">返回上一页</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      {/* 顶部返回栏 */}
      <View className="flex-row items-center px-4 pt-14 pb-4">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 p-2 rounded-full active:opacity-60"
          style={{ backgroundColor: surfaceColor }}
          accessibilityRole="button"
          accessibilityLabel="返回"
        >
          <ThemedText>←</ThemedText>
        </Pressable>
        <ThemedText type="subtitle">详情</ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 封面图占位区 */}
        <View
          className="w-full h-48 rounded-2xl mb-6 items-center justify-center"
          style={{ backgroundColor: surfaceColor, borderColor, borderWidth: 1 }}
        >
          <ThemedText type="caption" className="text-lg">
            📷 {item.title} 封面
          </ThemedText>
        </View>

        {/* 标题与分类 */}
        <View className="flex-row items-center justify-between mb-3">
          <ThemedText type="title" className="flex-1 mr-3">
            {item.title}
          </ThemedText>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: primaryColor + '20' }}
          >
            <ThemedText
              type="caption"
              style={{ color: primaryColor }}
            >
              {item.category}
            </ThemedText>
          </View>
        </View>

        {/* 评分 */}
        <View className="flex-row items-center mb-5">
          <ThemedText className="text-yellow-500 mr-1">⭐</ThemedText>
          <ThemedText type="subtitle">{item.rating.toFixed(1)}</ThemedText>
          <ThemedText type="caption" className="ml-2">
            / 5.0
          </ThemedText>
        </View>

        {/* 分割线 */}
        <View
          className="h-px w-full mb-5"
          style={{ backgroundColor: borderColor }}
        />

        {/* 描述 */}
        <ThemedText type="subtitle" className="mb-2">
          简介
        </ThemedText>
        <ThemedText type="default" className="leading-6 mb-5">
          {item.description}
        </ThemedText>

        {/* 分割线 */}
        <View
          className="h-px w-full mb-5"
          style={{ backgroundColor: borderColor }}
        />

        {/* 元信息 */}
        <ThemedText type="subtitle" className="mb-2">
          元信息
        </ThemedText>
        <View
          className="rounded-xl p-4"
          style={{ backgroundColor: surfaceColor, borderColor, borderWidth: 1 }}
        >
          <View className="flex-row justify-between mb-2">
            <ThemedText type="caption">ID</ThemedText>
            <ThemedText type="caption">{item.id}</ThemedText>
          </View>
          <View className="flex-row justify-between">
            <ThemedText type="caption">创建时间</ThemedText>
            <ThemedText type="caption">
              {new Date(item.createdAt).toLocaleDateString('zh-CN')}
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
