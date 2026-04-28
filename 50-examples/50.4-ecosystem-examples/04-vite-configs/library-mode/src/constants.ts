import type { Config } from './types';

/**
 * 库版本号
 */
export const VERSION = '1.0.0';

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: Config = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retryCount: 3,
  enableCache: true,
};

/**
 * 日志级别
 */
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

/**
 * 正则表达式
 */
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  PHONE: /^1[3-9]\d{9}$/,
} as const;
