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
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@hooks/useAuthStore';
import { loginSchema, LoginFormData } from '@utils/validation';
import { Button } from '@components/Button';
import { Input } from '@components/Input';

export function LoginScreen(): JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const login = useAuthStore((state) => state.login);
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError('');
    try {
      await login(data.email, data.password);
    } catch (error) {
      setLoginError('登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>欢迎回来</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              登录以继续探索
            </Text>
          </View>

          <View style={styles.form}>
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

            {loginError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{loginError}</Text>
            ) : null}

            <Button
              title="登录"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={{ marginTop: 8 }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              还没有账号？
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>立即注册</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 0,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '600',
  },
});
