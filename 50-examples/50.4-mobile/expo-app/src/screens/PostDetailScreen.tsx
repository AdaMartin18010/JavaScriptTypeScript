import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@hooks/useTheme';
import { usePost } from '@hooks/usePosts';
import { Card } from '@components/Card';
import { LoadingSkeleton } from '@components/LoadingSkeleton';
import { formatDate, formatNumber } from '@utils/formatters';

export function PostDetailScreen(): JSX.Element {
  const route = useRoute();
  const { colors } = useTheme();
  const { postId } = route.params as { postId: string };
  const { data, isLoading } = usePost(postId);
  const post = data?.pages?.[0];

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSkeleton width="90%" height={24} style={{ margin: 16 }} />
        <LoadingSkeleton width="60%" height={16} style={{ marginHorizontal: 16 }} />
        <LoadingSkeleton width="100%" height={120} style={{ margin: 16 }} />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            帖子未找到
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.authorRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {post.author.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {post.author.displayName}
              </Text>
              <Text style={[styles.date, { color: colors.textSecondary }]}>
                {formatDate(post.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{post.body}</Text>

        {post.tags.length > 0 && (
          <View style={styles.tags}>
            {post.tags.map((tag) => (
              <View
                key={tag}
                style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
              >
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Card style={styles.actionsCard}>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={24} color={colors.textSecondary} />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                {formatNumber(post.likes)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                评论
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={22} color={colors.textSecondary} />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                收藏
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={22} color={colors.textSecondary} />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                分享
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  authorInfo: {
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    marginTop: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsCard: {
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
  },
});
