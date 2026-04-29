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

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| ESM 和 CJS 可以随意混用 | 互操作需要特定加载器和转换规则 |
| 循环依赖会自动解决 | 循环依赖可能导致未初始化访问 |

### 3.4 扩展阅读

- [MDN JavaScript 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Node.js：模块系统对比](https://nodejs.org/api/esm.html#introduction)
- [Node.js：Package.json 导出配置](https://nodejs.org/api/packages.html#package-entry-points)
- [RequireJS (AMD) 文档](https://requirejs.org/docs/whyamd.html)
- [UMD 模式](https://github.com/umdjs/umd)
- [ECMAScript® 2025 — Modules](https://tc39.es/ecma262/#sec-modules)
- `10-fundamentals/10.1-language-semantics/06-modules/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
