import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { postSchema, PostFormData } from '@utils/validation';
import { useCreatePost } from '@hooks/usePosts';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Card } from '@components/Card';

export function CreateScreen(): JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const createPost = useCreatePost();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      body: '',
      tags: [],
    },
  });

  const onSubmit = async (data: PostFormData) => {
    try {
      await createPost.mutateAsync(data);
      reset();
      navigation.navigate('Home' as never);
    } catch (error) {
      console.error('Failed to create post:', error);
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
          <Text style={[styles.title, { color: colors.text }]}>创建帖子</Text>

          <Card style={styles.formCard}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="标题"
                  placeholder="输入帖子标题"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="body"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.textAreaContainer}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    内容
                  </Text>
                  <View
                    style={[
                      styles.textAreaWrapper,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.body ? colors.error : colors.border,
                      },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.textArea,
                        { color: colors.text },
                      ]}
                      placeholder="分享你的想法..."
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={8}
                      textAlignVertical="top"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </View>
                  {errors.body && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {errors.body.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Button
              title="发布"
              onPress={handleSubmit(onSubmit)}
              loading={createPost.isPending}
              style={{ marginTop: 16 }}
            />
          </Card>
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
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  formCard: {
    padding: 20,
  },
  textAreaContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  textAreaWrapper: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    minHeight: 160,
  },
  textArea: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 136,
  },
  errorText: {
    fontSize: 13,
    marginTop: 4,
  },
});
