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

### 3.3 高级代码示例

#### Vite / Webpack 中的动态导入模式

```typescript
// vite-glob-import.ts — 使用 import.meta.glob 批量导入模块
// Vite 特有：编译时分析 glob 模式，生成懒加载映射
const modules = import.meta.glob('./locales/*.json');
// modules = { './locales/en.json': () => import(...), './locales/zh.json': () => import(...) }

async function loadLocale(lang: string) {
  const loader = modules[`./locales/${lang}.json`];
  if (!loader) throw new Error(`Locale ${lang} not found`);
  const mod = await loader();
  return mod.default;
}

//  eagerly: true 变体（同步导入所有匹配模块）
const eagerModules = import.meta.glob('./utils/*.ts', { eager: true });
// eagerModules 已经是解析后的模块对象
```

#### 条件 polyfill 加载策略

```typescript
// polyfill-loader.ts
async function loadPolyfills() {
  const polyfills: Promise<unknown>[] = [];

  if (!('IntersectionObserver' in window)) {
    polyfills.push(import('intersection-observer'));
  }
  if (!('ResizeObserver' in window)) {
    polyfills.push(import('resize-observer-polyfill'));
  }
  if (!Promise.withResolvers) {
    polyfills.push(
      import('./polyfills/promise-withResolvers.js')
    );
  }

  await Promise.all(polyfills);
  console.log('Polyfills loaded');
}
```

#### 构建工具中的魔法注释

```typescript
// magic-comments.ts — 控制代码分割行为
// Webpack / Vite / Rollup 支持以下注释

// 指定 chunk 名称（调试与预加载时使用）
const AdminModule = () => import(
  /* webpackChunkName: "admin" */
  /* webpackPrefetch: true */
  './AdminPanel.js'
);

// 预加载（浏览器空闲时加载）
const ChartLib = () => import(
  /* webpackChunkName: "charts" */
  /* webpackPreload: true */
  'chart.js'
);

// Vite 的注释语法
const HeavyComponent = () => import(
  /* @vite-ignore */ // 忽略对该路径的静态分析警告
  /* webpackIgnore: true */
  someDynamicPath
);
```

#### Node.js ESM 动态导入与 CJS 互操作

```typescript
// node-interop.ts
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

const require = createRequire(import.meta.url);

// 在 ESM 中读取 CJS 包的 package.json
const pkg = require('some-cjs-lib/package.json');

// 动态导入 CJS 模块（Node ESM 自动处理）
const cjsMod = await import('some-cjs-lib');
// cjsMod.default 对应 module.exports

// 从绝对路径动态导入（必须使用 file:// URL）
const absPath = '/opt/app/plugins/custom.js';
const plugin = await import(pathToFileURL(absPath).href);

// 条件导入：检测当前运行时是 ESM 还是 CJS
const isESM = typeof import.meta.url !== 'undefined';
const config = isESM
  ? await import('./config.mjs')
  : require('./config.cjs');
```

#### import.meta.resolve — 模块路径解析

```typescript
// resolve-module.ts — 解析模块绝对路径（Node.js 16+ 实验性，Node 20+ 稳定）

// 获取模块的绝对文件路径（不加载执行）
const lodashPath = await import.meta.resolve('lodash');
console.log(lodashPath); // file:///.../node_modules/lodash/lodash.js

// 解析相对路径
const utilsPath = await import.meta.resolve('./utils.js', import.meta.url);

// 降级方案（Node < 20）
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fallbackPath = require.resolve('lodash');
```

#### 带重试机制的动态导入

```typescript
// retry-import.ts — 网络不稳定场景下的导入重试

async function importWithRetry<T>(
  specifier: string,
  options: { retries?: number; delayMs?: number } = {}
): Promise<T> {
  const { retries = 3, delayMs = 1000 } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await import(specifier);
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Import attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('Unreachable');
}

// 使用：CDN 资源加载容错
const lib = await importWithRetry('https://cdn.example.com/lib.js');
```

#### 动态导入 WebAssembly 模块

```typescript
// wasm-loader.ts — ESM 动态导入 WASM

async function loadWasm(url: string) {
  const mod = await import(/* @vite-ignore */ url);
  // WebAssembly ESM 包装器通常导出 { default: WebAssembly.Module }
  const wasmModule = mod.default;
  const instance = await WebAssembly.instantiate(wasmModule, {
    env: { memory: new WebAssembly.Memory({ initial: 256 }) }
  });
  return instance.exports;
}

// 使用示例（假设 WASM 导出了 add 函数）
const { add } = await loadWasm('./math.wasm');
console.log(add(1, 2)); // 3
```

### 3.4 常见误区

| 误区 | 正确理解 |
|------|---------|
| ESM 和 CJS 可以随意混用 | 互操作需要特定加载器和转换规则 |
| 循环依赖会自动解决 | 循环依赖可能导致未初始化访问 |
| `import()` 路径可以完全动态 | 静态分析工具需要能推断至少一部分路径 |
| `require()` 在 ESM 中可用 | Node ESM 中需使用 `createRequire` |
| 动态导入绕过 tree-shaking | 构建工具仍会对被导入模块做 tree-shaking |

### 3.5 扩展阅读

- [MDN 动态 import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [MDN：import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
- [Node.js：ECMAScript Modules](https://nodejs.org/api/esm.html)
- [Node.js：Modules CommonJS](https://nodejs.org/api/modules.html)
- [Node.js: import.meta.resolve](https://nodejs.org/api/esm.html#importmetaresolvespecifier-parent)
- [ECMAScript® 2025 — Import Calls](https://tc39.es/ecma262/#sec-import-calls)
- [ECMAScript® 2025 — HostLoadImportedModule](https://tc39.es/ecma262/#sec-HostLoadImportedModule)
- [Vite: import.meta.glob](https://vitejs.dev/guide/features.html#glob-import)
- [Webpack: Code Splitting — Dynamic Imports](https://webpack.js.org/guides/code-splitting/#dynamic-imports)
- [Rollup: Dynamic Import](https://rollupjs.org/tutorial/#code-splitting)
- [Import Attributes Proposal](https://github.com/tc39/proposal-import-attributes)
- [Web.dev: Lazy Loading JavaScript](https://web.dev/articles/optimize-lcp#lazy_loading)
- [Web.dev: Reduce JavaScript payloads with code splitting](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting)
- `10-fundamentals/10.1-language-semantics/06-modules/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
