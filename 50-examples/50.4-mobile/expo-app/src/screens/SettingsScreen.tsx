import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '@hooks/useTheme';
import { Card } from '@components/Card';

interface SettingItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  type: 'toggle' | 'select' | 'navigate';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  description?: string;
}

export function SettingsScreen(): JSX.Element {
  const { colors, mode, setMode, isDark } = useTheme();
  const [notifications, setNotifications] = React.useState(true);
  const [dataSaver, setDataSaver] = React.useState(false);

  const themeOptions: { label: string; value: ThemeMode; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: '浅色', value: 'light', icon: 'sunny-outline' },
    { label: '深色', value: 'dark', icon: 'moon-outline' },
    { label: '跟随系统', value: 'system', icon: 'phone-portrait-outline' },
  ];

  const generalSettings: SettingItem[] = [
    {
      icon: 'notifications-outline',
      label: '推送通知',
      type: 'toggle',
      value: notifications,
      onValueChange: setNotifications,
      description: '接收新消息和互动提醒',
    },
    {
      icon: 'cellular-outline',
      label: '省流量模式',
      type: 'toggle',
      value: dataSaver,
      onValueChange: setDataSaver,
      description: '减少图片和视频自动加载',
    },
  ];

  const aboutSettings: SettingItem[] = [
    {
      icon: 'information-circle-outline',
      label: '关于',
      type: 'navigate',
      onPress: () => {},
    },
    {
      icon: 'document-text-outline',
      label: '隐私政策',
      type: 'navigate',
      onPress: () => {},
    },
    {
      icon: 'shield-checkmark-outline',
      label: '服务条款',
      type: 'navigate',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>设置</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            外观
          </Text>
          <Card style={styles.themeCard}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.themeOption,
                  mode === option.value && {
                    backgroundColor: colors.primary + '15',
                    borderColor: colors.primary,
                  },
                  { borderColor: colors.border },
                ]}
                onPress={() => setMode(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={22}
                  color={mode === option.value ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.themeLabel,
                    {
                      color:
                        mode === option.value ? colors.primary : colors.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {mode === option.value && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            通用
          </Text>
          <Card>
            {generalSettings.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.settingRow,
                  index < generalSettings.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.settingInfo}>
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={colors.text}
                    style={{ marginRight: 12 }}
                  />
                  <View>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      {item.label}
                    </Text>
                    {item.description && (
                      <Text
                        style={[
                          styles.settingDescription,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.description}
                      </Text>
                    )}
                  </View>
                </View>
                {item.type === 'toggle' && (
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{ false: colors.border, true: colors.primary + '80' }}
                    thumbColor={item.value ? colors.primary : '#f4f3f4'}
                  />
                )}
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            关于
          </Text>
          <Card>
            {aboutSettings.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.settingRow,
                  index < aboutSettings.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={item.onPress}
              >
                <View style={styles.settingInfo}>
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={colors.text}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {item.label}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        <Text style={[styles.version, { color: colors.textSecondary }]}>
          版本 1.0.0 (Build 100)
        </Text>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  themeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    gap: 8,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 32,
  },
});
