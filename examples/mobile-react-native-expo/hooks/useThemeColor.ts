/**
 * 主题颜色 Hook
 * 根据当前系统/应用主题返回对应的颜色值
 */

import { useColorScheme } from 'react-native';
import { getColor, type ColorKey } from '@/constants/Colors';
import { type ThemeMode } from '@/types';

/**
 * 获取当前实际生效的主题颜色
 * @param colorName - 颜色键名
 * @param overrideTheme - 可选的主题覆盖（用于强制指定主题预览）
 * @returns 十六进制颜色字符串
 *
 * @example
 * const primaryColor = useThemeColor('primary');
 * const backgroundColor = useThemeColor('background');
 */
export function useThemeColor(
  colorName: ColorKey,
  overrideTheme?: ThemeMode
): string {
  // 获取系统当前配色方案
  const systemTheme = useColorScheme();

  // 解析最终主题：优先使用 override，其次系统值，兜底为 light
  const resolvedTheme =
    overrideTheme === 'system' || overrideTheme === undefined
      ? systemTheme ?? 'light'
      : overrideTheme;

  return getColor(resolvedTheme, colorName);
}
