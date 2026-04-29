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

### 3.2 JSDoc 渐进类型化

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

### 3.3 `tsconfig.json` 互操作配置

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

### 3.4 从 JS 源码自动生成 `.d.ts`

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

### 3.5 双包风险（Dual-Package Hazard）与互操作

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

### 3.6 常见误区

| 误区 | 正确理解 |
|------|---------|
| JS 文件无法拥有类型安全 | `// @ts-check` 或 `checkJs` 启用完整 TS 检查 |
| `.d.ts` 必须与 JS 同名同目录 | 可通过 `types`/`typings` 字段在 `package.json` 指定路径 |
| `any` 是互操作的最佳选择 | 使用 `unknown` + 窄化比 `any` 更安全 |

### 3.7 扩展阅读

- [TypeScript: Creating .d.ts Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [TypeScript: JSDoc Supported Types](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [TypeScript: Migrating from JavaScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
- [DefinitelyTyped Contribution Guide](https://github.com/DefinitelyTyped/DefinitelyTyped#readme)
- [dts-gen: .d.ts 生成器](https://github.com/microsoft/dts-gen)
- [Node.js Dual Package Hazard](https://nodejs.org/api/packages.html#dual-package-hazard) — Node.js 官方双包风险说明
- [TSConfig allowJs / checkJs](https://www.typescriptlang.org/tsconfig#allowJs) — 官方编译器选项参考
- [Sindre Sorhus: ESM Packages](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) — ESM 迁移最佳实践
- [TypeScript Handbook: Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html) — 模块解析与声明文件
- `10-fundamentals/10.2-type-system/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
