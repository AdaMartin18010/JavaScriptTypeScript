import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@hooks/useAuthStore';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { formatNumber } from '@utils/formatters';

export function MyProfileScreen(): JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const stats = [
    { label: '帖子', value: 42 },
    { label: '粉丝', value: 1280 },
    { label: '关注', value: 356 },
  ];

  const menuItems = [
    {
      icon: 'bookmark-outline' as const,
      label: '收藏',
      onPress: () => {},
    },
    {
      icon: 'time-outline' as const,
      label: '历史记录',
      onPress: () => {},
    },
    {
      icon: 'settings-outline' as const,
      label: '设置',
      onPress: () => navigation.navigate('Settings' as never),
    },
    {
      icon: 'help-circle-outline' as const,
      label: '帮助与反馈',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>我的</Text>
        </View>

        <View style={styles.profileSection}>
          <View
            style={[styles.avatar, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.displayName, { color: colors.text }]}>
            {user?.displayName || '用户'}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.email || ''}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatNumber(stat.value)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={22} color={colors.text} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.logoutSection}>
          <Button
            title="退出登录"
            variant="outline"
            onPress={logout}
            style={{ borderColor: colors.error }}
            textStyle={{ color: colors.error }}
          />
        </View>
      </ScrollView>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  menuSection: {
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutSection: {
    padding: 24,
    marginTop: 8,
  },
});
