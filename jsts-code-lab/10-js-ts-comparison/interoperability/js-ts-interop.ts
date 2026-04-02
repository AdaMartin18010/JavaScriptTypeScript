/**
 * @file JavaScript 与 TypeScript 互操作性指南
 * @category JS/TS Comparison → Interoperability
 * @difficulty hard
 * @tags interoperability, declaration-files, migration, compatibility
 * 
 * @description
 * 详细的 JS/TS 互操作方案：
 * - 在 TS 中使用 JS 模块
 * - 声明文件 (.d.ts) 编写
 * - 渐进式迁移策略
 * - 类型断言与类型守卫
 * - 第三方库类型定义
 */

// ============================================================================
// 1. 在 TypeScript 中使用 JavaScript
// ============================================================================

/**
 * 场景 1: 引入没有类型定义的 JavaScript 模块
 * 
 * 方案 A: 使用 declare module (快速但类型不安全)
 * 方案 B: 编写 .d.ts 声明文件 (推荐)
 */

// 假设有一个 JavaScript 模块: legacy-utils.js
// module.exports = {
//   formatDate: (date) => { ... },
//   parseJSON: (str) => { ... }
// };

// 方案 A: 快速声明 (any 类型)
declare module 'legacy-utils' {
  const content: any;
  export = content;
}

// 方案 B: 精确声明 (推荐)
declare module 'legacy-utils' {
  export function formatDate(date: Date | string, format?: string): string;
  export function parseJSON<T = unknown>(jsonString: string): T;
  export const VERSION: string;
}

// 使用方式
// import { formatDate, parseJSON } from 'legacy-utils';
// const dateStr: string = formatDate(new Date());
// const data: MyType = parseJSON<MyType>(jsonString);

// ============================================================================
// 2. 类型断言与类型守卫
// ============================================================================

/**
 * 处理来自 JavaScript 的不确定类型数据
 */

// 类型断言 (Type Assertion) - 告诉编译器"相信我"
function processJSData(data: unknown): string {
  // 危险: 如果 data 不是字符串，运行时出错
  return (data as string).toUpperCase();
}

// 类型守卫 (Type Guard) - 运行时检查
function processJSDataSafe(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase(); // TypeScript 知道这里是 string
  }
  throw new TypeError('Expected string, got ' + typeof data);
}

// 自定义类型守卫
interface User {
  name: string;
  age: number;
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    'age' in obj &&
    typeof (obj as User).name === 'string' &&
    typeof (obj as User).age === 'number'
  );
}

function greetUser(maybeUser: unknown): string {
  if (isUser(maybeUser)) {
    return `Hello, ${maybeUser.name}!`; // TypeScript 知道这里是 User
  }
  return 'Hello, stranger!';
}

// ============================================================================
// 3. 渐进式迁移策略
// ============================================================================

/**
 * 从 JavaScript 迁移到 TypeScript 的步骤：
 * 
 * Step 1: 允许 JS 文件 (tsconfig.json)
 *   "allowJs": true
 * 
 * Step 2: 添加 JSDoc 类型注释
 *   /**
 *    * @param {string} name
 *    * @returns {number}
 *    * /
 *   function getLength(name) { return name.length; }
 * 
 * Step 3: 重命名为 .ts
 * 
 * Step 4: 添加显式类型
 *   function getLength(name: string): number { ... }
 * 
 * Step 5: 启用严格模式
 *   "strict": true
 */

// 渐进式迁移示例

// 阶段 1: JavaScript + JSDoc
/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {number} price
 */

/**
 * @param {Product} product
 * @returns {string}
 */
function formatProductJS(product) {
  return `${product.name}: $${product.price}`;
}

// 阶段 2: TypeScript (自动从 JSDoc 转换)
interface Product {
  id: string;
  name: string;
  price: number;
}

function formatProductTS(product: Product): string {
  return `${product.name}: $${product.price}`;
}

// ============================================================================
// 4. 第三方库类型定义
// ============================================================================

/**
 * 处理没有 @types 的第三方库
 */

// 创建 types/library-name/index.d.ts

declare module 'untyped-library' {
  // 主要导出
  export function init(options: InitOptions): Promise<Client>;
  export const version: string;
  
  // 接口定义
  export interface InitOptions {
    apiKey: string;
    endpoint?: string;
    timeout?: number;
  }
  
  export interface Client {
    request<T>(method: string, params: Record<string, unknown>): Promise<T>;
    close(): void;
  }
  
  // 类定义
  export class EventEmitter {
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
  }
  
  // 命名空间 (用于嵌套类型)
  export namespace Utils {
    export function clamp(value: number, min: number, max: number): number;
    export function debounce(fn: Function, delay: number): Function;
  }
}

// ============================================================================
// 5. 运行时类型验证
// ============================================================================

/**
 * 在 JS/TS 边界处进行运行时验证
 * 使用 io-ts, zod, 或 valibot 等库
 */

// 使用 Zod 进行运行时验证 (概念展示)
interface RuntimeValidator<T> {
  parse(data: unknown): T;
  safeParse(data: unknown): { success: true; data: T } | { success: false; error: Error };
}

// 手动实现的简单验证器
export class ObjectValidator<T> {
  constructor(private schema: Record<keyof T, (v: unknown) => boolean>) {}

  validate(data: unknown): data is T {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    for (const [key, validator] of Object.entries(this.schema)) {
      if (!(key in data) || !validator((data as Record<string, unknown>)[key])) {
        return false;
      }
    }

    return true;
  }

  assert(data: unknown): asserts data is T {
    if (!this.validate(data)) {
      throw new TypeError('Data does not match schema');
    }
  }
}

// 使用示例
const userValidator = new ObjectValidator<{ name: string; age: number }>({
  name: (v) => typeof v === 'string',
  age: (v) => typeof v === 'number' && v >= 0
});

function processUser(data: unknown): { name: string; age: number } {
  userValidator.assert(data); // 运行时验证
  return data; // TypeScript 现在知道 data 是 { name: string; age: number }
}

// ============================================================================
// 6. CommonJS 与 ES Module 互操作
// ============================================================================

/**
 * 处理模块系统差异
 */

// CommonJS 导入 ES Module (动态导入)
async function loadESM() {
  const { default: myModule } = await import('esm-module');
  return myModule;
}

// ES Module 导入 CommonJS
// import * as cjsModule from 'cjs-module';
// 或
// import cjsModule = require('cjs-module');

// 声明文件中的模块格式
declare module 'mixed-format-lib' {
  // 默认导出 (ESM: export default, CJS: module.exports)
  export default function main(): void;
  
  // 命名导出
  export const helper: () => void;
  
  // CommonJS 风格导出
  export = main; // 当模块主要导出一个函数时
}

// ============================================================================
// 7. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== JS/TS 互操作性指南 ===\n');

  // 类型守卫演示
  console.log('--- 类型守卫 ---');
  const validUser = { name: 'Alice', age: 30 };
  const invalidUser = { name: 'Bob' };
  
  console.log('Valid user:', greetUser(validUser));
  console.log('Invalid user:', greetUser(invalidUser));

  // 类型断言的风险
  console.log('\n--- 类型断言风险 ---');
  try {
    const result = processJSDataSafe(123); // 安全版本会报错
    console.log('Result:', result);
  } catch (e) {
    console.log('类型错误被捕获:', (e as Error).message);
  }

  // 运行时验证
  console.log('\n--- 运行时验证 ---');
  const validData = { name: 'Charlie', age: 25 };
  const invalidData = { name: 'David', age: 'twenty' };
  
  console.log('Valid data:', userValidator.validate(validData));
  console.log('Invalid data:', userValidator.validate(invalidData));

  // 迁移对比
  console.log('\n--- 迁移对比 ---');
  const jsProduct = { id: '1', name: 'Laptop', price: 999 };
  console.log('JS format:', formatProductJS(jsProduct));
  console.log('TS format:', formatProductTS(jsProduct));

  console.log('\n结论:');
  console.log('1. 使用类型守卫处理不确定的 JS 数据');
  console.log('2. 使用声明文件为 JS 库提供类型');
  console.log('3. 渐进式迁移: JSDoc → .ts → 严格模式');
  console.log('4. 在边界处进行运行时验证');
}

// ============================================================================
// 导出
// ============================================================================

export { processJSData, processJSDataSafe, isUser, greetUser, formatProductJS, formatProductTS, userValidator, processUser };;

export type {
  User,
  Product
};
