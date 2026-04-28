import type { Config, ThemeConfig } from './types';

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: Config = {
  appName: 'MyApp',
  apiBaseURL: 'https://api.example.com',
  timeout: 10000,
  theme: 'light',
  debug: false,
};

/**
 * 主题模式
 */
export const THEME_MODES = ['light', 'dark', 'system'] as const;

/**
 * 浅色主题配置
 */
export const LIGHT_THEME: ThemeConfig = {
  primaryColor: '#1890ff',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  borderColor: '#e8e8e8',
};

/**
 * 深色主题配置
 */
export const DARK_THEME: ThemeConfig = {
  primaryColor: '#1890ff',
  backgroundColor: '#141414',
  textColor: '#ffffff',
  borderColor: '#333333',
};
