import { VERSION } from './constants';
import EventBus from './event-bus';
import Validator from './validator';
import { formatDate, deepClone, throttle, debounce } from './utils';
import type { Config, User, Logger, EventHandler, ValidationResult, ValidationRule } from './types';

/**
 * 主类 - 库的核心入口
 */
class MyLibrary {
  version: string;
  eventBus: EventBus;
  config: Config;

  constructor(config?: Partial<Config>) {
    this.version = VERSION;
    this.eventBus = new EventBus();
    this.config = {
      baseURL: 'https://api.example.com',
      timeout: 10000,
      retryCount: 3,
      enableCache: true,
      ...config,
    };
  }

  /**
   * 获取版本信息
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * 更新配置
   * @param config - 配置项
   */
  setConfig(config: Partial<Config>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): Config {
    return deepClone(this.config);
  }

  /**
   * 创建验证器
   */
  createValidator<T extends Record<string, unknown>>(): Validator<T> {
    return new Validator<T>();
  }

  /**
   * 格式化日期
   */
  formatDate = formatDate;

  /**
   * 深克隆
   */
  deepClone = deepClone;

  /**
   * 节流
   */
  throttle = throttle;

  /**
   * 防抖
   */
  debounce = debounce;
}

export default MyLibrary;

// 导出类型
export type {
  Config,
  User,
  Logger,
  EventHandler,
  ValidationResult,
  ValidationRule,
};
