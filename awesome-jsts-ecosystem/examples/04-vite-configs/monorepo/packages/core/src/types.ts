/**
 * 核心类型定义
 */

/** 应用配置 */
export interface Config {
  /** 应用名称 */
  appName: string;
  /** API 基础地址 */
  apiBaseURL: string;
  /** 超时时间 (ms) */
  timeout: number;
  /** 主题模式 */
  theme: Theme;
  /** 调试模式 */
  debug: boolean;
}

/** 主题类型 */
export type Theme = 'light' | 'dark' | 'system';

/** 应用状态 */
export interface AppState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  theme: Theme;
}

/** 应用上下文 */
export interface AppContext {
  config: Config;
  state: AppState;
  setState: (state: Partial<AppState>) => void;
}

/** 用户 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
}

/** API 响应 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

/** 主题配置 */
export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}
