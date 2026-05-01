import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '@types';
import { useTheme } from '@hooks/useTheme';
import { formatRelativeTime, formatNumber } from '@utils/formatters';
import { Card } from './Card';
import { Image } from 'expo-image';

interface PostCardProps {
  post: Post;
  onPress?: (post: Post) => void;
  onLike?: (post: Post) => void;
  onBookmark?: (post: Post) => void;
}

export function PostCard({ post, onPress, onLike, onBookmark }: PostCardProps): JSX.Element {
  const { colors } = useTheme();

  return (
    <Card onPress={() => onPress?.(post)} style={styles.container}>
      <View style={styles.header}>
        {post.author.avatarUrl ? (
          <Image
            source={{ uri: post.author.avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {post.author.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={[styles.authorName, { color: colors.text }]}>
            {post.author.displayName}
          </Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
            {formatRelativeTime(post.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {post.title}
      </Text>
      <Text
        style={[styles.body, { color: colors.textSecondary }]}
        numberOfLines={3}
      >
        {post.body}
      </Text>

      {post.tags.length > 0 && (
        <View style={styles.tags}>
          {post.tags.slice(0, 3).map((tag) => (
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike?.(post)}
        >
          <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            {formatNumber(post.likes)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onBookmark?.(post)}
        >
          <Ionicons name="bookmark-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 13,
    marginTop: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5ea',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
});
