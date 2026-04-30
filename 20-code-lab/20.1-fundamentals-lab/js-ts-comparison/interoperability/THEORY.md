# JS 与 TS 互操作性

> **定位**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/interoperability`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

互操作性解决 JavaScript 与 TypeScript 在混合项目中的无缝协作问题，涵盖类型声明、模块解析、运行时行为一致性，以及渐进类型化的工程路径。

### 1.2 形式化基础

设 JS 模块的值为空间 `V`，TS 类型空间为 `T`。互操作机制提供一个映射 `φ: V → T`（通过 `.d.ts` 或 JSDoc），使得 TS 类型检查器能在 `T` 空间内对 `V` 的调用点进行一致性验证。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| `.d.ts` 声明文件 | 为 JS 库提供外部类型契约 | `declare module` |
| JSDoc 类型 | 通过注释将 TS 类型嵌入 JS 源码 | `@type`, `@param` |
| `allowJs`/`checkJs` | 在 TS 编译器中解析并检查 JS 文件 | `tsconfig.json` |
| 渐进类型化 | 逐步为无类型代码库添加约束 | `any` → `unknown` |

---

## 二、设计原理

### 2.1 为什么存在

JavaScript 生态拥有数百万未类型化的 npm 包，TypeScript 必须通过这些互操作机制与现有资产共存。没有互操作，TS 的采用成本将不可接受。

### 2.2 互操作模式对比表

| 模式 | 类型来源 | 构建步骤 | 维护成本 | 适用场景 |
|------|---------|---------|---------|---------|
| `.d.ts` 声明文件 | 手写或自动生成 | 无（纯类型） | 中（需随 API 更新） | 第三方库、内部 JS 模块 |
| JSDoc 注释 | 嵌入 JS 源码 | 无 | 低（与代码同位置） | 小型项目、JS 优先团队 |
| `allowJs` + `checkJs` | TS 推断 + JSDoc | tsc 检查 | 低 | 迁移过渡期 |
| `dts-gen` / `dtslint` | 自动生成 | 生成工具 | 低（一次性） | 快速原型 |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| DefinitelyTyped (`@types/*`) | 社区维护、覆盖广 | 版本可能滞后 | 主流第三方库 |
| 内联 JSDoc | 无需额外文件 | 复杂泛型表达困难 | 简单函数/模块 |
| `satisfies` operator | 推断 + 约束双重保障 | TS 4.9+ | 配置对象校验 |

---

## 三、实践映射

### 3.1 `.d.ts` 声明文件生成

```ts
// math-utils.d.ts —— 为纯 JS 库 math-utils.js 提供类型

// 声明模块入口
declare module 'math-utils' {
  /** 计算两个数的最大公约数 */
  export function gcd(a: number, b: number): number;

  /** 判断是否为素数 */
  export function isPrime(n: number): boolean;

  /** 常量 PI 的更高精度版本 */
  export const PI: 3.141592653589793;

  /** 数值范围类 */
  export class NumericRange {
    constructor(min: number, max: number);
    contains(value: number): boolean;
    intersect(other: NumericRange): NumericRange | null;
  }
}

// 使用侧（TS 项目）
import { gcd, NumericRange } from 'math-utils';
const r = new NumericRange(0, 100);
console.log(r.contains(50)); // true
```

### 3.2 模块扩充（Module Augmentation）

```ts
// 为第三方库扩展类型声明（不修改源码）
// types/express-augmentation.d.ts
import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: 'admin' | 'user';
    };
  }
}

// 使用：中间件注入 user 后，类型安全访问
app.get('/profile', (req, res) => {
  if (req.user) {
    res.json({ email: req.user.email }); // ✅ 类型推断正确
  } else {
    res.status(401).send('Unauthorized');
  }
});
```

### 3.3 JSDoc 渐进类型化

```js
// @ts-check 在文件顶部启用 TS 类型检查
// @ts-check

/**
 * @template T
 * @param {T[]} array
 * @param {(item: T) => boolean} predicate
 * @returns {T | undefined}
 */
function findLast(array, predicate) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) return array[i];
  }
  return undefined;
}

/** @type {Record<string, number>} */
const scores = {
  alice: 95,
  bob: 87,
};

// TS 会报错：类型 'string' 不能赋值给 'number'
// scores.carol = 'ninety';

// 复杂对象类型
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {'admin' | 'user'} role
 */

/** @type {User[]} */
const users = [{ id: '1', name: 'A', role: 'admin' }];
```

### 3.4 `tsconfig.json` 互操作配置

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "./types",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

### 3.5 `satisfies` 运算符：推断 + 约束

```ts
// TS 4.9+ —— 保留推断类型同时检查结构约束
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
} satisfies {
  apiUrl: string;
  timeout: number;
  retries: number;
};

// config 的推断类型为 { apiUrl: 'https://api.example.com'; timeout: 5000; retries: 3 }
// 而不是宽泛的 { apiUrl: string; timeout: number; retries: number }
const exactUrl = config.apiUrl; // 类型：'https://api.example.com'（字面量保留）
```

### 3.6 从 JS 源码自动生成 `.d.ts`

```bash
# 使用 tsc 从带 JSDoc 的 JS 文件生成声明文件
npx tsc --allowJs --declaration --emitDeclarationOnly --outDir types src/**/*.js
```

```ts
// 为无类型的 npm 包编写全局声明
// types/untyped-lib.d.ts
declare module 'legacy-logger' {
  interface LoggerOptions {
    level: 'debug' | 'info' | 'warn' | 'error';
    prefix?: string;
  }
  export default function createLogger(opts: LoggerOptions): {
    debug(msg: string): void;
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
  };
}
```

### 3.7 双包风险（Dual-Package Hazard）与互操作

```ts
// 当库同时提供 CJS 与 ESM 导出时，可能出现两份实例
// package.json 中 "exports" 字段的正确配置示例
{
  "name": "my-lib",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/esm/index.d.ts",
        "default": "./dist/esm/index.js"
      },
      "require": {
        "types": "./dist/cjs/index.d.ts",
        "default": "./dist/cjs/index.js"
      }
    }
  }
}
```

### 3.8 渐进迁移：从 `any` 到 `unknown`

```ts
// ❌ 旧代码：any 绕过所有类型检查
function parseJSONUnsafe(input: string): any {
  return JSON.parse(input);
}
const data = parseJSONUnsafe('{}');
data.foo.bar; // 编译通过，运行时可能崩溃

// ✅ 迁移后：unknown 强制窄化
function parseJSONSafe(input: string): unknown {
  return JSON.parse(input);
}
const safe = parseJSONSafe('{}');
// safe.foo; // ❌ 编译错误：Object is of type 'unknown'

if (typeof safe === 'object' && safe !== null && 'foo' in safe) {
  console.log((safe as { foo: string }).foo); // ✅ 窄化后访问
}
```

### 3.9 代码示例：`declare` 关键字与全局扩展

```typescript
// ============================================
// declare 关键字：在不执行代码的情况下声明类型
// ============================================

// 声明全局变量（如由 HTML script 标签注入）
declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: number;

// 声明全局函数（如旧版 jQuery 或第三方 SDK）
declare function trackEvent(name: string, payload?: Record<string, unknown>): void;

// 扩展全局 Window 接口
declare global {
  interface Window {
    analytics?: {
      track: (event: string, props?: object) => void;
    };
  }
}

// 使用：window.analytics?.track('page_view');

// ============================================
// 命名空间 vs ES Module 的互操作
// ============================================

// 将遗留 UMD 库适配为 ES Module 类型
// types/legacy-lib.d.ts
declare namespace LegacyLib {
  export interface Options {
    debug: boolean;
  }
  export function init(options: Options): void;
}

// 作为 ES Module 导出
declare module 'legacy-lib' {
  export = LegacyLib;
}

// 消费侧
import * as LegacyLib from 'legacy-lib';
LegacyLib.init({ debug: true });
```

### 3.10 代码示例：路径映射与条件类型导入

```typescript
// tsconfig.json 中配置路径别名，实现跨包类型共享
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/src/*"],
      "@types/*": ["./types/*"]
    }
  }
}

// ============================================
// 条件类型导入（inline type import）
// ============================================

// TS 4.5+ 支持 import type 的独立语法，避免运行时依赖
import type { UserDTO } from '@shared/user';
import { validateUser } from '@shared/user'; // 运行时导入

// TS 4.9+ 支持在 import 语句中内联 type 标记
import { type UserDTO, validateUser } from '@shared/user';
// 编译后：仅保留 validateUser 的导入

// ============================================
// ts-node / tsx 运行 TS 与 ESM 互操作
// ============================================

// package.json 中配置 ts-node 的 ESM loader
{
  "scripts": {
    "dev": "node --loader ts-node/esm src/index.ts",
    "build": "tsc"
  }
}

// tsconfig.json 配合 ESM
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022"
  }
}
```

### 3.11 代码示例：从 JavaScript 到 TypeScript 的迁移阶段

```typescript
// ============================================
// 阶段 1：仅添加 @ts-check 和 JSDoc（零构建改动）
// ============================================

// utils.js
// @ts-check
/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function add(a, b) {
  return a + b;
}

// ============================================
// 阶段 2：允许 TS 检查 JS，启用严格模式项逐个升级
// ============================================

// tsconfig.json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "strict": false,
    "noImplicitAny": true,   // 先开启 any 警告
    "strictNullChecks": false // 后续再开启
  }
}

// ============================================
// 阶段 3：文件级迁移，保留 .js 后缀通过 d.ts 过渡
// ============================================

// utils.d.ts —— 为尚未改写的 utils.js 提供类型
declare module './utils.js' {
  export function add(a: number, b: number): number;
}

// ============================================
// 阶段 4：完全 TypeScript 化
// ============================================

// utils.ts
export function add(a: number, b: number): number {
  return a + b;
}
```

### 3.12 常见误区

| 误区 | 正确理解 |
|------|---------|
| JS 文件无法拥有类型安全 | `// @ts-check` 或 `checkJs` 启用完整 TS 检查 |
| `.d.ts` 必须与 JS 同名同目录 | 可通过 `types`/`typings` 字段在 `package.json` 指定路径 |
| `any` 是互操作的最佳选择 | 使用 `unknown` + 窄化比 `any` 更安全 |
| ESM 与 CJS 类型可以混用 | `moduleResolution` 需与运行时一致，否则解析出错 |

### 3.13 扩展阅读

- [TypeScript: Creating .d.ts Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [TypeScript: JSDoc Supported Types](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [TypeScript: Migrating from JavaScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
- [DefinitelyTyped Contribution Guide](https://github.com/DefinitelyTyped/DefinitelyTyped#readme)
- [dts-gen: .d.ts 生成器](https://github.com/microsoft/dts-gen)
- [Node.js Dual Package Hazard](https://nodejs.org/api/packages.html#dual-package-hazard) — Node.js 官方双包风险说明
- [TSConfig allowJs / checkJs](https://www.typescriptlang.org/tsconfig#allowJs) — 官方编译器选项参考
- [Sindre Sorhus: ESM Packages](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) — ESM 迁移最佳实践
- [TypeScript Handbook: Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html) — 模块解析与声明文件
- [TypeScript: Module Augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) — 官方模块扩充指南
- [TypeScript `satisfies` Operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) — TS 4.9 发布说明
- [TypeScript: ESM in Node.js](https://www.typescriptlang.org/docs/handbook/esm-node.html) — Node.js ESM 互操作指南
- [ts-node ESM Loader](https://typestrong.org/ts-node/docs/imports/) — ts-node 的 ESM 加载器配置
- [TypeScript: Type-Only Imports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export) — 纯类型导入导出
- [TypeScript: Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) — 大型仓库互操作策略
- [Node.js: TypeScript Type Stripping](https://nodejs.org/api/typescript.html) — Node.js 22+ 原生 TS 支持

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
