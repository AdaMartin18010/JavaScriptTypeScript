import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@hooks/useTheme';
import { useDebounce } from '@hooks/useDebounce';
import { usePosts } from '@hooks/usePosts';
import { PostCard } from '@components/PostCard';
import { PostCardSkeleton } from '@components/LoadingSkeleton';

const POPULAR_TAGS = ['React Native', 'TypeScript', 'Expo', '移动端', '性能优化', '架构'];

export function ExploreScreen(): JSX.Element {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const debouncedSearch = useDebounce(searchQuery, 500);

  const filters = {
    search: debouncedSearch || undefined,
    tag: selectedTag,
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePosts(filters);

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>探索</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="搜索帖子..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tagsContainer}>
        <FlashList
          data={POPULAR_TAGS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          estimatedItemSize={80}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tag,
                {
                  backgroundColor:
                    selectedTag === item ? colors.primary : colors.surface,
                },
              ]}
              onPress={() =>
                setSelectedTag(selectedTag === item ? undefined : item)
              }
            >
              <Text
                style={[
                  styles.tagText,
                  {
                    color: selectedTag === item ? '#ffffff' : colors.text,
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {isLoading ? (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      ) : (
        <FlashList
          data={posts}
          renderItem={({ item }) => <PostCard post={item} />}
          keyExtractor={(item) => item.id}
          estimatedItemSize={280}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  tagsContainer: {
    marginTop: 12,
    marginBottom: 8,
    height: 40,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
