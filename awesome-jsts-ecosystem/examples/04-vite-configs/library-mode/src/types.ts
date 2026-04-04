/**
 * 类型定义
 */

/** 用户接口 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

/** 配置选项 */
export interface Config {
  /** 基础 URL */
  baseURL: string;
  /** 超时时间 (ms) */
  timeout: number;
  /** 重试次数 */
  retryCount: number;
  /** 是否启用缓存 */
  enableCache: boolean;
}

/** 日志级别 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 日志记录器接口 */
export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/** 事件处理器 */
export type EventHandler<T = unknown> = (payload: T) => void;

/** 验证结果 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** 验证规则 */
export type ValidationRule<T> = {
  field: keyof T;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validator?: (value: T[keyof T]) => boolean;
  message?: string;
};
