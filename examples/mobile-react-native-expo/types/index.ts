/**
 * TypeScript 类型定义中心
 * 所有跨模块共享的类型均在此定义并统一导出
 */

import { type ColorSchemeName } from 'react-native';

// ============================================
// 主题相关类型
// ============================================

/** 主题模式：跟随系统、浅色、深色 */
export type ThemeMode = 'system' | 'light' | 'dark';

/** 实际生效的主题方案（仅 light | dark） */
export type ResolvedTheme = NonNullable<ColorSchemeName>;

// ============================================
// 数据模型类型
// ============================================

/** 示例项目数据模型 */
export interface Item {
  /** 唯一标识 */
  id: string;
  /** 标题 */
  title: string;
  /** 描述文本 */
  description: string;
  /** 封面图片 URL */
  imageUrl?: string;
  /** 分类标签 */
  category: string;
  /** 评分（0-5） */
  rating: number;
  /** 创建时间戳 */
  createdAt: number;
}

/** 用户偏好设置 */
export interface UserPreferences {
  /** 主题模式 */
  theme: ThemeMode;
  /** 是否开启通知 */
  notificationsEnabled: boolean;
  /** 字体大小缩放比例 */
  fontScale: number;
}

// ============================================
// 组件 Props 类型
// ============================================

/** ThemedText 组件属性 */
export interface ThemedTextProps {
  /** 文本内容 */
  children: React.ReactNode;
  /** 语义化样式类型 */
  type?: 'default' | 'title' | 'subtitle' | 'caption' | 'link';
  /** 自定义类名 */
  className?: string;
  /** 点击回调 */
  onPress?: () => void;
}

/** ThemedView 组件属性 */
export interface ThemedViewProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

/** Card 组件属性 */
export interface CardProps {
  /** 卡片标题 */
  title: string;
  /** 卡片描述 */
  description?: string;
  /** 封面图 URL */
  imageUrl?: string;
  /** 分类标签 */
  category?: string;
  /** 评分 */
  rating?: number;
  /** 点击回调 */
  onPress?: () => void;
}

/** SearchBar 组件属性 */
export interface SearchBarProps {
  /** 当前搜索值 */
  value: string;
  /** 搜索值变化回调 */
  onChangeText: (text: string) => void;
  /** 占位提示文本 */
  placeholder?: string;
}
