# ESM 基础

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/06-modules/esm-basics`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 JavaScript 模块化演进中的代码组织问题。从 IIFE、CommonJS 到 ESM，分析不同模块系统的加载语义与静态分析能力。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 静态分析 | 编译期确定模块依赖图 | static-analysis.md |
| 命名空间导入 | 整体模块作为单一对象导入 | namespace-import.ts |

---

## 二、设计原理

### 2.1 为什么存在

随着应用规模增长，代码组织成为核心挑战。模块系统将全局命名空间隔离为独立的可复用单元，是大型项目可维护性的基础。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| ESM | 静态分析、tree-shaking | 旧环境需适配 | 现代项目 |
| CJS | 生态成熟 | 运行时加载、体积大 | Node.js 历史项目 |

### 2.3 特性对比表：ESM vs CJS

| 特性 | ESM (`import` / `export`) | CJS (`require` / `module.exports`) |
|------|---------------------------|-----------------------------------|
| 加载时机 | 编译时解析依赖，运行时执行 | 完全运行时加载 |
| 执行模式 | 严格模式 (`'use strict'`) 默认 | 非严格模式默认 |
| 顶级 `this` | `undefined` | `module.exports` |
| 导出绑定 | 实时绑定 (live bindings) | 值拷贝（对象引用除外） |
| 循环依赖 | 支持，导出在求值前已绑定 | 返回已完成的部分导出 |
| 静态分析 | 支持 tree-shaking、死码消除 | 不支持 |
| 浏览器原生 | ✅ | ❌ |
| 文件扩展名 | `.mjs` 或 `"type": "module"` | `.cjs` 或默认 |
| 条件导入 | `import()` 动态表达式 | `require()` 任意表达式 |
| `__dirname` / `__filename` | 需通过 `import.meta.url` 计算 | 直接可用 |

### 2.4 与相关技术的对比

与 Python/Java 模块对比：JS 模块系统经历了多次演进，ESM 是最终方向。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 ESM 基础 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：ESM 导入导出语法全景

```typescript
// ===== math-utils.ts：命名导出 =====
export const PI = 3.14159;
export function add(a: number, b: number): number {
  return a + b;
}
export class Calculator {
  value = 0;
  increment() { this.value++; }
}

// ===== logger.ts：默认导出 =====
export default class Logger {
  log(msg: string) { console.log(`[LOG] ${msg}`); }
}

// ===== main.ts：消费模块 =====
// 1. 命名导入（推荐用大括号）
import { PI, add, Calculator } from './math-utils.js';

// 2. 默认导入
import Logger from './logger.js';

// 3. 命名空间导入（整体导入为对象）
import * as MathUtils from './math-utils.js';
console.log(MathUtils.PI);

// 4. 混合导入（默认 + 命名）
import LoggerDefault, { PI as MATH_PI } from './combined-module.js';

// 5. 副作用导入（执行模块顶层代码）
import './polyfills.js';

// 6. 重新导出（ Barrel 模式）
export { PI, add } from './math-utils.js';
export { default as Logger } from './logger.js';
export * from './types.js';

// 7. 实时绑定演示：导出值变化会反映到导入方
// counter.ts
export let count = 0;
export function increment() { count++; }

// consumer.ts
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1（实时绑定，非拷贝）
```

### 3.3 高级代码示例

#### Node.js ESM 配置与 `import.meta`

```json
// package.json — 启用 ESM
{
  "name": "my-esm-project",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": "./dist/utils.mjs"
  }
}
```

```typescript
// node-esm-utils.ts — 在 ESM 中获取 __dirname / __filename
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// import.meta.url 也可用于解析相对路径资源
const configPath = join(__dirname, '../config.json');

// import.meta.resolve 解析模块路径（Node.js 20.6+）
const lodashPath = import.meta.resolve('lodash-es');
console.log(lodashPath); // file:///.../node_modules/lodash-es/lodash.js

// import.meta.main — 判断当前模块是否为主入口（Deno / 部分 Node 版本）
if (import.meta.main) {
  console.log('Running as main module');
}
```

#### ESM 与 CJS 互操作模式

```typescript
// dual-package.ts — 同时支持 ESM 与 CJS 的双模式包
// ESM 入口 (index.mjs)
export { add, subtract } from './math.mjs';
export { default as config } from './config.mjs';

// CJS 入口 (index.cjs)
const { add, subtract } = require('./math.cjs');
const config = require('./config.cjs').default;
module.exports = { add, subtract, config };

// package.json 中的 exports 字段配置双模式
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.cjs"
    }
  }
}
```

```typescript
// cjs-consumer-in-esm.ts — 在 ESM 中消费 CJS 模块
import { createRequire } from 'module';

// 创建相对于当前模块的 require
const require = createRequire(import.meta.url);

// 现在可以像 CJS 一样 require 旧模块
const legacy = require('some-old-cjs-lib');
const pkg = require('some-old-cjs-lib/package.json');

// 注意：CJS 的默认导出在 ESM 中变为 .default
import cjsDefault from 'cjs-lib';
// 等价于 CJS 中的 const cjsDefault = require('cjs-lib');

// 命名导入需要 CJS 模块有对应的 exports.__esModule = true
import { namedExport } from 'cjs-with-esmodule-flag';
```

#### 循环依赖处理与实时绑定

```typescript
// a.ts
import { b } from './b.js';
console.log('Evaluating a.ts, b =', b);
export const a = 'A';
export function useB() {
  return b.toUpperCase();
}

// b.ts
import { a } from './a.js';
console.log('Evaluating b.ts, a =', a); // undefined（循环依赖时 a 尚未赋值）
export const b = 'B';
export function useA() {
  return a?.toLowerCase() ?? 'a-not-ready';
}

// main.ts
import { a, useB } from './a.js';
import { b, useA } from './b.js';

console.log(useA()); // 'a-not-ready' 或直接 'a'（取决于求值顺序）
console.log(useB()); // 'B'

// 最佳实践：将循环依赖的共享状态提取到独立模块
// shared.ts
export let state = { count: 0 };
export function increment() { state.count++; }
```

#### TypeScript ESM 严格模式配置

```json
// tsconfig.json — 严格 ESM 解析
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "verbatimModuleSyntax": true
  }
}
```

```typescript
// typescript-esm.ts — 使用 NodeNext 模块解析时必须写 .js 扩展名
// TS 编译器会保留这些扩展名到输出
import { helper } from './helper.js'; // 即使源码是 helper.ts
import type { Config } from './types.js'; // type-only 导入

// verbatimModuleSyntax 要求显式区分值导入和类型导入
import { someValue } from './values.js';
import type { SomeType } from './types.js';
```

### 3.4 代码示例：Top-Level Await 与模块加载控制

```typescript
// db-connection.ts — 使用 top-level await 初始化模块级资源
import { createConnection } from './db-client.js';

// 模块加载时自动等待连接建立
export const db = await createConnection({
  host: process.env.DB_HOST,
  poolSize: 10,
});

// 消费模块无需手动等待
// routes.ts
import { db } from './db-connection.js';
// db 已保证连接成功
export async function getUsers() {
  return db.query('SELECT * FROM users');
}
```

```typescript
// config-loader.ts — 使用 top-level await 加载配置
const configResponse = await fetch('/api/config');
export const appConfig = await configResponse.json();

// 条件 top-level await
const isDev = process.env.NODE_ENV === 'development';
export const analytics = isDev
  ? { track: () => {} } // mock
  : await import('./analytics-prod.js').then(m => m.default);
```

### 3.5 代码示例：Import Attributes 与 JSON/CSS 模块

```typescript
// 静态导入 JSON（TypeScript 5.3+ / Node.js 18.20+ / ES2025）
import pkg from './package.json' with { type: 'json' };
console.log(pkg.version);

// 类型声明辅助（TypeScript 4.5+）
declare module '*.json' {
  const value: unknown;
  export default value;
}

// CSS 模块导入（实验性，部分浏览器支持）
import sheet from './styles.css' with { type: 'css' };
// sheet: CSSStyleSheet
document.adoptedStyleSheets.push(sheet);
```

### 3.6 代码示例：ESM 树摇优化验证

```typescript
// tree-shake-demo.ts — 验证打包器能否正确 tree-shake
// utils.ts
export function used() { return 'I am used'; }
export function unused() { return 'I should be removed'; } // 会被 tree-shake

// main.ts
import { used } from './utils.js';
console.log(used());

// 检查输出：unused 函数不应出现在最终 bundle 中
// 使用 Rollup / Webpack / esbuild 的分析工具验证
```

```typescript
// side-effect-free-marker.ts — 使用 package.json 标记无副作用
// package.json
{
  "sideEffects": false,
  // 或精确指定哪些文件有副作用
  "sideEffects": ["*.css", "./polyfills.js"]
}
```

### 3.4 常见误区

| 误区 | 正确理解 |
|------|---------|
| ESM 和 CJS 可以随意混用 | 互操作需要特定加载器和转换规则 |
| 循环依赖会自动解决 | 循环依赖可能导致未初始化访问 |
| Top-level await 会阻塞所有导入 | 仅阻塞当前模块的求值，不影响并行加载的其他模块 |
| `.js` 扩展名在 TypeScript 中写错没关系 | NodeNext 解析下必须写 `.js`，TS 会原样保留 |

### 3.5 扩展阅读

- [MDN JavaScript 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [MDN：export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)
- [MDN：import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
- [MDN：Top-level await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#top_level_await)
- [MDN：Import Attributes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with)
- [Node.js：ECMAScript Modules](https://nodejs.org/api/esm.html)
- [Node.js：Interop with CommonJS](https://nodejs.org/api/esm.html#interoperability-with-commonjs)
- [ECMAScript® 2025 — Modules](https://tc39.es/ecma262/#sec-modules)
- [ECMAScript® 2025 — Top-Level Await](https://tc39.es/ecma262/#sec-modules-evaluating)
- [Node.js：Package Entry Points (exports field)](https://nodejs.org/api/packages.html#package-entry-points)
- [TypeScript: ECMAScript Module Support in Node.js](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Web.dev: JavaScript Modules](https://web.dev/articles/modules-intro)
- [Sindre Sorhus: Pure ESM Package Guide](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
- [Rollup: Tree Shaking Guide](https://rollupjs.org/tutorial/#tree-shaking)
- [esbuild: Tree Shaking](https://esbuild.github.io/api/#tree-shaking)
- `10-fundamentals/10.1-language-semantics/06-modules/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
