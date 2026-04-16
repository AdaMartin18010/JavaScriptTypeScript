/**
 * @file Singleton 模式迁移: JavaScript -> TypeScript
 * @category JS/TS Comparison → Pattern Migration
 * @difficulty easy
 * @tags migration, singleton, generic, private-constructor
 *
 * @description
 * 展示如何将 JavaScript 的闭包/IIFE 单例迁移到 TypeScript 的泛型单例类。
 */

// ============================================================================
// JavaScript 版本: 闭包 / IIFE 单例
// ============================================================================

/*
const SingletonJS = (function () {
  let instance;

  function createInstance() {
    return { value: 0, increment() { this.value++; } };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

const a = SingletonJS.getInstance();
const b = SingletonJS.getInstance();
console.log(a === b); // true
// a.value = 'anything'; // 运行时无类型保护
*/

// ============================================================================
// TypeScript 版本: Singleton<T> 泛型单例 + private constructor
// ============================================================================

export class Singleton<T> {
  private static instances = new Map<string, Singleton<unknown>>();
  private value: T;

  private constructor(value: T) {
    this.value = value;
  }

  static getInstance<T>(key: string, initializer: () => T): Singleton<T> {
    if (!Singleton.instances.has(key)) {
      Singleton.instances.set(key, new Singleton<T>(initializer()) as Singleton<unknown>);
    }
    return Singleton.instances.get(key) as Singleton<T>;
  }

  static reset(key: string): void {
    Singleton.instances.delete(key);
  }

  getValue(): T {
    return this.value;
  }

  setValue(value: T): void {
    this.value = value;
  }
}

// 具体单例类示例
export class ConfigManager {
  private static instance: ConfigManager | null = null;
  private config = new Map<string, unknown>();

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  set<T>(key: string, value: T): void {
    this.config.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.config.get(key) as T | undefined;
  }
}

// ============================================================================
// 迁移收益
// ============================================================================

/**
 * 1. private constructor 在编译期阻止外部 new，比 JS 的闭包约定更强。
 * 2. 泛型 Singleton<T> 可复用于任意类型，无需重复写样板代码。
 * 3. 类型推导让 get/set 保持一致，避免运行时类型污染。
 */
