/**
 * My Library
 * 
 * 这是一个示例 TypeScript 库，展示了如何使用 Vite 构建和发布。
 */

// 类型导出
export type { User, Config, Logger } from './types';

// 工具函数导出
export { formatDate, deepClone, throttle, debounce } from './utils';

// 核心类导出
export { default as EventBus } from './event-bus';
export { default as Validator } from './validator';

// 常量导出
export { VERSION, DEFAULT_CONFIG } from './constants';

// 默认导出
export { default } from './main';
