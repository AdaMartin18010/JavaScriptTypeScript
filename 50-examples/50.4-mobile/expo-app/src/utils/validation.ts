import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(8, '密码至少需要8个字符')
    .max(128, '密码不能超过128个字符')
    .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字'),
});

export const registerSchema = loginSchema.extend({
  displayName: z
    .string()
    .min(2, '昵称至少需要2个字符')
    .max(50, '昵称不能超过50个字符'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

export const postSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(200, '标题不能超过200个字符'),
  body: z
    .string()
    .min(1, '内容不能为空')
    .max(10000, '内容不能超过10000个字符'),
  tags: z.array(z.string()).max(10, '标签不能超过10个').optional(),
});

export const profileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PostFormData = z.infer<typeof postSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
