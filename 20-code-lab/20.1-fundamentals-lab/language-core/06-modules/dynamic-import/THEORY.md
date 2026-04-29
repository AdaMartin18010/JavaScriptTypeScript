# 动态导入

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/06-modules/dynamic-import`
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

### 2.3 特性对比表：`import()` vs `require()`

| 特性 | `import()` (ESM Dynamic) | `require()` (CJS) |
|------|-------------------------|-------------------|
| 返回类型 | `Promise<Module>` | 同步直接返回模块对象 |
| 执行阶段 | 运行时异步加载 | 运行时同步加载 |
| 路径表达式 | 支持部分动态模板字符串 | 完全动态字符串 |
| 顶层 await | 可在模块顶层使用 | 不支持（阻塞事件循环） |
| 作用域 | 模块作用域 | 函数作用域 |
| 缓存机制 | 模块加载缓存 | `require.cache` 可手动清除 |
| tree-shaking | 静态分支支持 | 不支持 |
| 循环依赖处理 | 更好的顶层绑定支持 | 返回已完成的部分导出 |
| 浏览器支持 | 原生支持 | 需打包工具转换 |

### 2.4 与相关技术的对比

与 Python/Java 模块对比：JS 模块系统经历了多次演进，ESM 是最终方向。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 动态导入 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：动态导入与条件加载

```typescript
// ===== import() — 异步动态导入（ESM） =====
async function loadUtils() {
  // 返回 Promise，模块在运行时异步加载
  const { default: lodash, debounce } = await import('lodash-es');
  return { lodash, debounce };
}

// 支持代码分割：构建工具会为动态导入创建独立 chunk
async function openModal() {
  const { Modal } = await import('./components/Modal.js');
  new Modal().show();
}

// ===== require() — 同步动态加载（CJS，Node.js 传统方式） =====
function loadConfigSync(path: string) {
  // 同步阻塞加载，返回模块对象
  const config = require(path);
  return config;
}

// 清除 require 缓存（热更新场景）
delete require.cache[require.resolve('./config.json')];

// ===== 对比：错误处理 =====
async function safeImportESM(path: string) {
  try {
    const mod = await import(path);
    return mod.default ?? mod;
  } catch (err) {
    console.error('ESM import failed:', err);
    return null;
  }
}

function safeRequireCJS(path: string) {
  try {
    return require(path);
  } catch (err) {
    console.error('CJS require failed:', err);
    return null;
  }
}

// ===== 动态导入实现路由懒加载（典型应用） =====
const routeMap = {
  '/dashboard': () => import('./pages/Dashboard.js'),
  '/settings': () => import('./pages/Settings.js'),
} as const;

async function navigateTo(path: keyof typeof routeMap) {
  const pageModule = await routeMap[path]();
  pageModule.default.render();
}
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| ESM 和 CJS 可以随意混用 | 互操作需要特定加载器和转换规则 |
| 循环依赖会自动解决 | 循环依赖可能导致未初始化访问 |

### 3.4 扩展阅读

- [MDN 动态 import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [MDN：import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
- [Node.js：ECMAScript Modules](https://nodejs.org/api/esm.html)
- [Node.js：Modules CommonJS](https://nodejs.org/api/modules.html)
- [ECMAScript® 2025 — Import Calls](https://tc39.es/ecma262/#sec-import-calls)
- `10-fundamentals/10.1-language-semantics/06-modules/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
