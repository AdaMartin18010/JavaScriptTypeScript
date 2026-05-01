import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@hooks/useTheme';
import { registerSchema, RegisterFormData } from '@utils/validation';
import { Button } from '@components/Button';
import { Input } from '@components/Input';

export function RegisterScreen(): JSX.Element {
  const { colors } = useTheme();
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      displayName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      console.log('Register data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.text }]}>创建账号</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            填写以下信息开始使用
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="昵称"
                  placeholder="请输入昵称"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.displayName?.message}
                  leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="邮箱"
                  placeholder="请输入邮箱地址"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="密码"
                  placeholder="请输入密码"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry={secureText}
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                      <Ionicons
                        name={secureText ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="确认密码"
                  placeholder="请再次输入密码"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  secureTextEntry={secureConfirmText}
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setSecureConfirmText(!secureConfirmText)}>
                      <Ionicons
                        name={secureConfirmText ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  }
                />
              )}
            />

            <Button
              title="注册"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={{ marginTop: 8 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  form: {
    gap: 0,
  },
});
