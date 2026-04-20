/**
 * 探索页（Explore）
 * 以卡片网格布局展示分类内容
 */

import React, { useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MOCK_ITEMS, CATEGORIES } from '@/constants/MockData';

/**
 * 探索页面组件
 *
 * 使用两列网格布局展示项目卡片，顶部提供分类快捷筛选。
 * 展示 NativeWind 在响应式布局中的应用。
 */
export default function ExploreScreen() {
  const surfaceColor = useThemeColor('surface');
  const primaryColor = useThemeColor('primary');
  const borderColor = useThemeColor('border');

  // 按分类聚合数据
  const categorizedItems = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      category: cat,
      items: MOCK_ITEMS.filter((item) => item.category === cat).slice(0, 3),
    }));
  }, []);

  return (
    <ThemedView className="flex-1">
      {/* 页面标题 */}
      <View className="px-4 pt-14 pb-4">
        <ThemedText type="title">探索</ThemedText>
        <ThemedText type="caption">按分类浏览热门工具与库</ThemedText>
      </View>

      {/* 分类横向滚动列表 */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <Pressable
            className="px-4 py-2 rounded-full mr-3 active:opacity-70"
            style={{ backgroundColor: surfaceColor, borderColor, borderWidth: 1 }}
          >
            <ThemedText type="caption">{item}</ThemedText>
          </Pressable>
        )}
      />

      {/* 分类区块列表 */}
      <FlatList
        data={categorizedItems}
        keyExtractor={(item) => item.category}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: section }) => (
          <View className="mb-6">
            {/* 分类标题 */}
            <View className="flex-row items-center mb-3">
              <View
                className="w-1.5 h-5 rounded-full mr-2"
                style={{ backgroundColor: primaryColor }}
              />
              <ThemedText type="subtitle">{section.category}</ThemedText>
            </View>

            {/* 两列网格 */}
            <View className="flex-row flex-wrap">
              {section.items.map((cardItem) => (
                <Pressable
                  key={cardItem.id}
                  onPress={() => router.push(`/${cardItem.id}`)}
                  className="w-[48%] mr-[4%] mb-3 rounded-xl p-3 active:opacity-80"
                  style={{
                    backgroundColor: surfaceColor,
                    borderColor,
                    borderWidth: 1,
                    // 每行第二个元素去除右边距
                    marginRight:
                      section.items.indexOf(cardItem) % 2 === 1 ? 0 : '4%',
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`查看 ${cardItem.title} 详情`}
                >
                  <ThemedText type="subtitle" className="mb-1">
                    {cardItem.title}
                  </ThemedText>
                  <ThemedText type="caption" className="leading-4">
                    ⭐ {cardItem.rating.toFixed(1)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      />
    </ThemedView>
  );
}
