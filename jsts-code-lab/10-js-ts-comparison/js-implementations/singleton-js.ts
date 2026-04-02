/**
 * @file 单例模式 - JavaScript vs TypeScript 对比
 * @category JS/TS Comparison → Implementations
 * @difficulty medium
 * @tags comparison, singleton, javascript, typescript
 * 
 * @description
 * 对比同一设计模式在 JavaScript 和 TypeScript 中的实现差异
 * - 类型安全性
 * - 代码可维护性
 * - 编译时检查 vs 运行时检查
 */

// ============================================================================
// TypeScript 实现 (类型安全)
// ============================================================================

export class SingletonTS {
  private static instance: SingletonTS | null = null;
  private data: Map<string, unknown>;

  private constructor() {
    this.data = new Map();
  }

  static getInstance(): SingletonTS {
    if (SingletonTS.instance === null) {
      SingletonTS.instance = new SingletonTS();
    }
    return SingletonTS.instance;
  }

  set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  has(key: string): boolean {
    return this.data.has(key);
  }
}

// ============================================================================
// JavaScript 实现 (无类型)
// ============================================================================

/**
 * JavaScript 版本 - 等价实现但没有类型信息
 * 
 * 差异点:
 * 1. 缺少类型注解
 * 2. 缺少私有成员保护 (使用 _ 约定)
 * 3. 运行时可能传入错误类型
 * 4. IDE 无法提供智能提示
 */
type SingletonJSInstance = {
  data: Map<string, unknown>;
  set(key: string, value: unknown): void;
  get(key: string): unknown;
  has(key: string): boolean;
};

const SingletonJS: {
  instance: SingletonJSInstance | null;
  getInstance(): SingletonJSInstance;
} = {
  instance: null,
  
  getInstance() {
    if (this.instance === null) {
      this.instance = {
        data: new Map(),
        
        set(key: string, value: unknown) {
          this.data.set(key, value);
        },
        
        get(key: string) {
          return this.data.get(key);
        },
        
        has(key: string) {
          return this.data.has(key);
        }
      };
    }
    return this.instance;
  }
};

// JavaScript 类版本 (ES6+)
class SingletonJSClass {
  static instance: SingletonJSClass | null = null;
  data: Map<string, unknown>;
  
  constructor() {
    if (SingletonJSClass.instance) {
      return SingletonJSClass.instance;
    }
    this.data = new Map();
    SingletonJSClass.instance = this;
  }

  set(key: string, value: unknown) {
    this.data.set(key, value);
  }

  get(key: string) {
    return this.data.get(key);
  }
}

// ============================================================================
// 对比分析
// ============================================================================

/**
 * 对比维度分析:
 * 
 * 1. 类型安全
 *    TypeScript: 编译时类型检查，set/get 类型一致
 *    JavaScript: 运行时类型不确定，可能混入不同类型
 * 
 * 2. 私有成员
 *    TypeScript: private constructor，外部无法 new
 *    JavaScript: 只能依赖约定 (_ 前缀)，仍可被绕过
 * 
 * 3. 重构支持
 *    TypeScript: 重命名符号时自动更新所有引用
 *    JavaScript: 依赖全局搜索替换，容易遗漏
 * 
 * 4. 文档性
 *    TypeScript: 类型即文档，一目了然
 *    JavaScript: 需要额外 JSDoc 注释
 * 
 * 5. 运行时性能
 *    两者编译后完全相同 (类型擦除)
 */

// ============================================================================
// 类型擦除演示
// ============================================================================

/**
 * TypeScript 编译后 (概念展示):
 * 
 * 编译前:
 *   class SingletonTS {
 *     private data: Map<string, unknown>;
 *     set<T>(key: string, value: T): void { ... }
 *   }
 * 
 * 编译后 (JavaScript):
 *   class SingletonTS {
 *     constructor() {
 *       this.data = new Map();  // 类型信息被擦除
 *     }
 *     set(key, value) { ... }   // 泛型被擦除
 *   }
 * 
 * 结论: 运行时两者完全一致，类型只存在于编译期
 */

// ============================================================================
// 运行时类型检查 (JavaScript 防御式编程)
// ============================================================================

export class SingletonJSWithDefense {
  static instance: SingletonJSWithDefense | null = null;
  data: Map<string, unknown> = new Map();

  static getInstance(): SingletonJSWithDefense {
    if (!this.instance) {
      this.instance = new SingletonJSWithDefense();
    }
    return this.instance!;
  }

  /**
   * JavaScript 需要在运行时进行类型检查
   * 增加了代码复杂度，且只在运行时暴露错误
   */
  set(key: string, value: unknown) {
    if (typeof key !== 'string') {
      throw new TypeError('Key must be a string');
    }
    this.data.set(key, value);
  }

  get(key: string) {
    if (typeof key !== 'string') {
      throw new TypeError('Key must be a string');
    }
    return this.data.get(key);
  }
}

// ============================================================================
// 互操作示例
// ============================================================================

/**
 * 在 TypeScript 中使用 JavaScript 实现的单例
 * 需要类型声明文件 (.d.ts) 来提供类型信息
 */

// singleton-js.d.ts (声明文件)
// (declare module 块已移除，避免 TS2664)

// 使用方式
// import { getInstance } from 'singleton-js';
// const instance = getInstance();

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 单例模式 - JS/TS 对比 ===\n');

  // TypeScript 版本
  console.log('--- TypeScript 版本 ---');
  const tsInstance = SingletonTS.getInstance();
  tsInstance.set('config', { debug: true });
  tsInstance.set<number>('count', 42);
  
  const config = tsInstance.get<{ debug: boolean }>('config');
  const count = tsInstance.get<number>('count');
  
  console.log('Config:', config);
  console.log('Count:', count);
  // tsInstance.set<number>('count', 'wrong'); // 编译错误！

  // JavaScript 版本
  console.log('\n--- JavaScript 版本 ---');
  const jsInstance = SingletonJS.getInstance();
  jsInstance.set('config', { debug: true });
  jsInstance.set('count', 42);
  jsInstance.set('count', '可以传入任意类型'); // 运行时不会报错！
  
  console.log('Config:', jsInstance.get('config'));
  console.log('Count:', jsInstance.get('count'));

  // 对比分析
  console.log('\n--- 对比分析 ---');
  console.log('TypeScript:');
  console.log('  ✅ 编译时类型检查');
  console.log('  ✅ 智能提示和自动补全');
  console.log('  ✅ 重构支持');
  console.log('  ✅ 类型即文档');
  console.log('  ⚠️ 需要编译步骤');
  
  console.log('\nJavaScript:');
  console.log('  ✅ 无需编译');
  console.log('  ✅ 运行时灵活');
  console.log('  ⚠️ 缺少类型检查');
  console.log('  ⚠️ 需要运行时防御代码');
  console.log('  ⚠️ 重构风险高');

  console.log('\n结论: TypeScript 类型在编译后被擦除，运行时与 JS 完全一致');
}

// ============================================================================
// 导出
// ============================================================================

export { SingletonJSClass };;
