import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@hooks/useTheme';
import { Card } from '@components/Card';
import { formatRelativeTime } from '@utils/formatters';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: '张三 赞了你的帖子',
    message: 'React Native 新架构详解',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    title: '李四 评论了你的帖子',
    message: '"非常详细的教程，感谢分享！"',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: '3',
    type: 'follow',
    title: '王五 关注了你',
    message: '你的新粉丝',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
  },
  {
    id: '4',
    type: 'mention',
    title: '赵六 在评论中提到了你',
    message: '"@currentUser 你觉得新架构性能如何？"',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
];

function getIconForType(type: Notification['type']): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'like':
      return 'heart';
    case 'comment':
      return 'chatbubble';
    case 'follow':
      return 'person-add';
    case 'mention':
      return 'at';
    default:
      return 'notifications';
  }
}

function getIconColor(type: Notification['type']): string {
  switch (type) {
    case 'like':
      return '#FF3B30';
    case 'comment':
      return '#007AFF';
    case 'follow':
      return '#34C759';
    case 'mention':
      return '#5856D6';
    default:
      return '#8E8E93';
  }
}

export function NotificationsScreen(): JSX.Element {
  const { colors } = useTheme();

  const renderItem = ({ item }: { item: Notification }) => (
    <Card
      style={[
        styles.notificationCard,
        !item.read && { backgroundColor: colors.primary + '08' },
      ]}
    >
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: getIconColor(item.type) + '15' },
          ]}
        >
          <Ionicons
            name={getIconForType(item.type)}
            size={20}
            color={getIconColor(item.type)}
          />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {item.message}
        </Text>
        <Text style={[styles.time, { color: colors.textSecondary }]}>
          {formatRelativeTime(item.createdAt)}
        </Text>
      </View>
      {!item.read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>通知</Text>
      </View>
      <FlatList
        data={MOCK_NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    marginLeft: 8,
  },
});
