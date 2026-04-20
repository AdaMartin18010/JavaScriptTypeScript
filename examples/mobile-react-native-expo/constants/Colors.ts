/**
 * 主题色彩系统
 * 提供浅色/深色两套配色，与 tailwind.config.js 中的扩展颜色保持一致
 */

import { type ResolvedTheme } from '@/types';

/** 浅色模式配色 */
export const LightColors = {
  // 主色调
  primary: '#007AFF',
  primaryMuted: '#5AC8FA',

  // 背景色
  background: '#FFFFFF',
  surface: '#F2F2F7',
  surfaceHighlight: '#E5E5EA',

  // 文本色
  text: '#000000',
  textSecondary: '#3C3C43',
  textMuted: '#8E8E93',

  // 边框与分割线
  border: '#E5E5EA',
  divider: '#C6C6C8',

  // 功能色
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#5AC8FA',
} as const;

/** 深色模式配色 */
export const DarkColors = {
  // 主色调
  primary: '#0A84FF',
  primaryMuted: '#64D2FF',

  // 背景色
  background: '#000000',
  surface: '#1C1C1E',
  surfaceHighlight: '#2C2C2E',

  // 文本色
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textMuted: '#8E8E93',

  // 边框与分割线
  border: '#38383A',
  divider: '#48484A',

  // 功能色
  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF453A',
  info: '#64D2FF',
} as const;

/** 颜色类型推导 */
export type ColorKey = keyof typeof LightColors;

/**
 * 根据当前主题返回对应的颜色对象
 * @param theme - 已解析的主题（light | dark）
 * @returns 对应主题的颜色常量对象
 */
export function getColors(theme: ResolvedTheme) {
  'worklet';
  return theme === 'dark' ? DarkColors : LightColors;
}

/**
 * 获取指定主题下的单个颜色值
 * @param theme - 已解析的主题
 * @param key - 颜色键名
 * @returns 十六进制颜色字符串
 */
export function getColor(theme: ResolvedTheme, key: ColorKey): string {
  return getColors(theme)[key];
}
