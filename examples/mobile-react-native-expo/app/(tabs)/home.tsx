/**
 * 首页（Home）
 * 展示项目列表，支持搜索过滤和点击进入详情
 */

import React, { useState, useCallback } from 'react';
import {
  FlatList,
  Pressable,
  View,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SearchBar } from '@/components/SearchBar';
import { Card } from '@/components/Card';
import { useDebounce } from '@/hooks/useDebounce';
import { MOCK_ITEMS, filterItems } from '@/constants/MockData';
import { useThemeColor } from '@/hooks/useThemeColor';

/**
 * 首页组件
 *
 * 包含搜索栏和项目列表，使用 FlatList 实现高性能长列表渲染。
 * 搜索功能通过 useDebounce 避免频繁过滤导致的性能问题。
 */
export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 400);

  // 根据防抖后的关键词过滤数据
  const filteredItems = filterItems(MOCK_ITEMS, debouncedQuery);

  const primaryColor = useThemeColor('primary');

  // 使用 useCallback 缓存渲染函数，避免不必要的重渲染
  const renderItem = useCallback(
    ({ item }: { item: (typeof MOCK_ITEMS)[0] }) => (
      <Card
        title={item.title}
        description={item.description}
        category={item.category}
        rating={item.rating}
        onPress={() => router.push(`/${item.id}`)}
      />
    ),
    []
  );

  // 列表项唯一 key 提取函数
  const keyExtractor = useCallback(
    (item: (typeof MOCK_ITEMS)[0]) => item.id,
    []
  );

  return (
    <ThemedView className="flex-1">
      {/* 页面标题 */}
      <View className="px-4 pt-14 pb-4">
        <ThemedText type="title">项目列表</ThemedText>
        <ThemedText type="caption">
          共 {filteredItems.length} 个结果
        </ThemedText>
      </View>

      {/* 搜索栏 */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="搜索项目名称、分类..."
      />

      {/* 项目列表 */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        // 空状态展示
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <ThemedText type="subtitle" className="mb-2">
              未找到匹配结果
            </ThemedText>
            <ThemedText type="caption">
              请尝试更换关键词后重试
            </ThemedText>
          </View>
        }
        // 性能优化：固定项高度（估算值）
        getItemLayout={(_, index) => ({
          length: 180,
          offset: 180 * index,
          index,
        })}
        // 初次渲染数量
        initialNumToRender={8}
        // 窗口大小（同时渲染的屏幕数）
        windowSize={5}
      />
    </ThemedView>
  );
}
