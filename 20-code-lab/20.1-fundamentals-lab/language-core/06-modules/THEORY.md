# 模块系统

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/06-modules`
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

### 2.3 特性对比表：JS 模块系统演进

| 模块系统 | 年代 | 环境 | 加载方式 | 静态分析 | 当前状态 |
|----------|------|------|----------|----------|----------|
| 全局脚本 | 1995+ | 浏览器 | 标签顺序加载 | ❌ | 遗留/反面模式 |
| IIFE | 2010+ | 浏览器 | 脚本标签 | ❌ | 过渡方案 |
| AMD (RequireJS) | 2011+ | 浏览器 | 异步、运行时 | ❌ | 已淘汰 |
| UMD | 2012+ | 通用 | 兼容多种格式 | ❌ | 库打包过渡 |
| CommonJS (CJS) | 2009+ | Node.js | 同步、运行时 | ❌ | Node 历史存量 |
| ESM (ES Modules) | 2015+ | 通用 | 静态解析 + 动态加载 | ✅ | 现代标准 |
| Bun 内置模块 | 2022+ | Bun | 原生 ESM + CJS 混用 | ✅ | Bun 生态 |

### 2.4 与相关技术的对比

与 Python/Java 模块对比：JS 模块系统经历了多次演进，ESM 是最终方向。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 模块系统 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：四种模块风格的等价实现

```typescript
// ===== 1. IIFE (Immediately Invoked Function Expression) =====
// 浏览器时代：避免全局污染
const MathIIFE = (function () {
  const PI = 3.14159;
  function add(a: number, b: number) { return a + b; }
  return { PI, add };
})();

// ===== 2. CommonJS (Node.js 传统) =====
// math-cjs.js
const PI = 3.14159;
function add(a: number, b: number) { return a + b; }
module.exports = { PI, add };
// consumer-cjs.js
// const { add } = require('./math-cjs.js');

// ===== 3. AMD (RequireJS — 已淘汰，仅作了解) =====
// define('math', [], function() {
//   return { PI: 3.14159, add: function(a, b) { return a + b; } };
// });

// ===== 4. ESM (现代标准) =====
// math-esm.ts
export const PI = 3.14159;
export function add(a: number, b: number) { return a + b; }
// consumer-esm.ts
// import { PI, add } from './math-esm.js';

// ===== UMD 模式（库的通用打包格式） =====
// (function (root, factory) {
//   if (typeof define === 'function' && define.amd) define([], factory);
//   else if (typeof module === 'object' && module.exports) module.exports = factory();
//   else root.MyLib = factory();
// }(typeof self !== 'undefined' ? self : this, function () { return { version: '1.0.0' }; }));

// ===== 现代最佳实践：Dual Package (同时支持 ESM + CJS) =====
// package.json
// {
//   "type": "module",
//   "main": "./dist/index.cjs",
//   "module": "./dist/index.mjs",
//   "exports": {
//     ".": { "import": "./dist/index.mjs", "require": "./dist/index.cjs" }
//   }
// }
```

### 3.3 代码示例：ESM 命名空间导入与重导出

```typescript
// utils/index.ts — 聚合导出（Barrel File）
export * from './string.js';
export * from './number.js';
export { default as deepClone } from './clone.js';

// 带命名的重导出
export { formatDate as fmtDate, parseDate } from './date.js';

// 消费者使用命名空间导入
import * as Utils from './utils/index.js';
Utils.fmtDate(new Date());

// 或使用具名导入进行 Tree-shaking
import { fmtDate, deepClone } from './utils/index.js';
```

### 3.4 代码示例：循环依赖诊断与解决

```typescript
// a.ts
import { b } from './b.js';
console.log('Loading a');
export const a = 'A';
export function useB() {
  return b; // 在函数内部引用，避免顶层同步访问
}

// b.ts
import { a } from './a.js';
console.log('Loading b');
export const b = 'B';
export function useA() {
  return a; // 延迟到调用时，此时 a 已初始化
}

// 诊断技巧：Node.js 中检测循环依赖
// node --inspect 或使用 require.cache 分析
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
console.log(Object.keys(require.cache).filter((k) => k.includes('a.ts') || k.includes('b.ts')));

// 解决策略一：将共享状态抽取到独立模块
// shared-state.ts
export const shared = { config: null as any };
// a.ts 和 b.ts 都导入 shared-state.ts，而非互相导入

// 解决策略二：使用动态导入打破循环
// a.ts
export const a = 'A';
export async function useB() {
  const { b } = await import('./b.js'); // 运行时加载，循环被打破
  return b;
}
```

### 3.5 代码示例：`package.json` 导出映射高级配置

```json
{
  "name": "@mylib/core",
  "version": "2.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "default": "./dist/index.mjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    },
    "./package.json": "./package.json"
  },
  "imports": {
    "#internal/*": "./src/internal/*.ts",
    "#config": {
      "development": "./src/config/dev.ts",
      "production": "./src/config/prod.ts",
      "default": "./src/config/default.ts"
    }
  },
  "typesVersions": {
    "*": {
      "utils": ["./dist/utils.d.ts"]
    }
  }
}
```

```typescript
// consumer.ts — 使用 self-reference imports
import { helper } from '#internal/helper.js';
import config from '#config'; // 根据 NODE_ENV 自动解析
```

### 3.6 代码示例：TypeScript 模块解析策略

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "paths": {
      "@app/*": ["./src/*"],
      "@shared/*": ["../shared/src/*"]
    },
    "baseUrl": "."
  }
}

// src/services/user.ts
import { db } from '@app/db/connection.js';
import { validateEmail } from '@shared/validators.js';

// 使用 TypeScript 的 import assertion（JSON 模块）
import config from './config.json' assert { type: 'json' };
// TypeScript 5.3+ 支持 with 语法
import configNew from './config.json' with { type: 'json' };
```

### 3.7 代码示例：Node.js 检测模块系统类型

```typescript
// detect-module-system.ts

// 在 ESM 中：import.meta.url 存在
function isESM(): boolean {
  return typeof import.meta !== 'undefined' && !!import.meta.url;
}

// 在 CJS 中：require 存在，module 存在
function isCJS(): boolean {
  return typeof require !== 'undefined' && typeof module !== 'undefined' && !!module.exports;
}

// 条件导出工具：根据模块系统返回不同实现
function createUniversalExport<T>(esmImpl: T, cjsImpl: T): T {
  if (isESM()) return esmImpl;
  return cjsImpl;
}

// 实际应用：条件加载路径解析器
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export function resolveRelative(path: string): string {
  if (typeof __dirname !== 'undefined') {
    // CJS 环境
    return join(__dirname, path);
  }
  // ESM 环境
  return join(dirname(fileURLToPath(import.meta.url)), path);
}
```

### 3.8 常见误区

| 误区 | 正确理解 |
|------|---------|
| ESM 和 CJS 可以随意混用 | 互操作需要特定加载器和转换规则 |
| 循环依赖会自动解决 | 循环依赖可能导致未初始化访问 |
| `.js` 扩展名在 ESM 中可省略 | Node.js ESM 要求显式写出 `.js` 或完整路径 |
| `exports` 字段仅影响外部消费者 | `exports` 同样限制包内部子路径的访问 |

---

## 四、扩展阅读

- [MDN JavaScript 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [MDN：export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)
- [MDN：import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
- [Node.js：模块系统对比](https://nodejs.org/api/esm.html#introduction)
- [Node.js：Package.json 导出配置](https://nodejs.org/api/packages.html#package-entry-points)
- [Node.js：Subpath imports](https://nodejs.org/api/packages.html#subpath-imports)
- [Node.js：Self-referencing a package using its name](https://nodejs.org/api/packages.html#self-referencing-a-package-using-its-name)
- [RequireJS (AMD) 文档](https://requirejs.org/docs/whyamd.html)
- [UMD 模式](https://github.com/umdjs/umd)
- [TypeScript: Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution)
- [TypeScript: NodeNext Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/reference.html#node16-nodenext)
- [ESM 双包风险 (Dual Package Hazard)](https://nodejs.org/api/packages.html#dual-package-hazard) — Node.js 官方指南
- [Pure ESM Package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) — Sindre Sorhus 的 ESM 迁移指南
- [ECMAScript® 2025 — Modules](https://tc39.es/ecma262/#sec-modules)
- `10-fundamentals/10.1-language-semantics/06-modules/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
