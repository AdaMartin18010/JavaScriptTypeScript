import type { Theme, ThemeConfig } from './types';
import { LIGHT_THEME, DARK_THEME } from './constants';

/**
 * 主题提供者
 */
export class ThemeProvider {
  private currentTheme: Theme;
  private listeners: Set<(config: ThemeConfig) => void>;

  constructor(initialTheme: Theme = 'light') {
    this.currentTheme = initialTheme;
    this.listeners = new Set();
  }

  /**
   * 获取当前主题
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * 获取主题配置
   */
  getThemeConfig(): ThemeConfig {
    switch (this.currentTheme) {
      case 'dark':
        return DARK_THEME;
      case 'system':
        return this.getSystemTheme() === 'dark' ? DARK_THEME : LIGHT_THEME;
      case 'light':
      default:
        return LIGHT_THEME;
    }
  }

  /**
   * 设置主题
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.notifyListeners();
  }

  /**
   * 订阅主题变化
   */
  subscribe(listener: (config: ThemeConfig) => void): () => void {
    this.listeners.add(listener);
    // 立即通知当前主题
    listener(this.getThemeConfig());
    return () => this.listeners.delete(listener);
  }

  private getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private notifyListeners(): void {
    const config = this.getThemeConfig();
    this.listeners.forEach((listener) => listener(config));
  }
}
