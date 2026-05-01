import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Post } from '@types';
import { useTheme } from '@hooks/useTheme';
import { usePosts } from '@hooks/usePosts';
import { PostCard } from '@components/PostCard';
import { PostCardSkeleton } from '@components/LoadingSkeleton';

export function HomeScreen(): JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = usePosts();

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handlePostPress = useCallback(
    (post: Post) => {
      navigation.navigate('PostDetail' as never, { postId: post.id } as never);
    },
    [navigation]
  );

  const renderItem: ListRenderItem<Post> = useCallback(
    ({ item }) => (
      <PostCard
        post={item}
        onPress={handlePostPress}
        onLike={(post) => console.log('Like:', post.id)}
        onBookmark={(post) => console.log('Bookmark:', post.id)}
      />
    ),
    [handlePostPress]
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <PostCardSkeleton />
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>首页</Text>
        </View>
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            加载失败，请下拉刷新重试
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>首页</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings' as never)}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlashList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={280}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

// Need to import Text
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  settingsButton: {
    padding: 8,
  },
  footerLoader: {
    paddingVertical: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
