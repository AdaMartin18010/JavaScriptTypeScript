import type { Config, AppState, User } from './types';
import { DEFAULT_CONFIG } from './constants';

/**
 * 应用管理器
 */
export class AppManager {
  private config: Config;
  private state: AppState;
  private listeners: Set<(state: AppState) => void>;

  constructor(config: Partial<Config> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      isLoading: false,
      isAuthenticated: false,
      user: null,
      theme: this.config.theme,
    };
    this.listeners = new Set();
  }

  /**
   * 获取配置
   */
  getConfig(): Config {
    return { ...this.config };
  }

  /**
   * 获取当前状态
   */
  getState(): AppState {
    return { ...this.state };
  }

  /**
   * 更新状态
   */
  setState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  /**
   * 设置用户
   */
  setUser(user: User | null): void {
    this.setState({
      user,
      isAuthenticated: !!user,
    });
  }

  /**
   * 设置加载状态
   */
  setLoading(isLoading: boolean): void {
    this.setState({ isLoading });
  }

  /**
   * 切换主题
   */
  toggleTheme(): void {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(this.state.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.setState({ theme: nextTheme });
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }
}
