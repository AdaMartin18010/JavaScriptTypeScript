import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { Button } from '@components/Button';
import { Card } from '@components/Card';

export function ProfileScreen(): JSX.Element {
  const route = useRoute();
  const { colors } = useTheme();
  const { userId } = route.params as { userId?: string } || {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>U</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            用户 {userId || 'Unknown'}
          </Text>
          <Text style={[styles.bio, { color: colors.textSecondary }]}>
            这是一个示例用户资料页面
          </Text>
          <Button title="关注" style={{ marginTop: 16, width: 120 }} />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    width: '100%',
    alignItems: 'center',
    padding: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  bio: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
