# 动态导入配置

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/06-modules/dynamic-import/config`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块探讨动态导入在不同运行环境（浏览器、Node.js、Deno/Bun）下的配置策略与加载器设计。解决条件加载、代码分割、SSR/CSR 同构等场景下的模块导入问题。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 静态分析 | 编译期确定模块依赖图 | static-analysis.md |
| 命名空间导入 | 整体模块作为单一对象导入 | namespace-import.ts |
| 条件加载 | 根据运行时环境选择导入路径 | conditional-loading.ts |

---

## 二、设计原理

### 2.1 为什么存在

随着应用规模增长，代码组织成为核心挑战。模块系统将全局命名空间隔离为独立的可复用单元，是大型项目可维护性的基础。动态导入配置决定了模块在不同环境下的加载行为。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| ESM | 静态分析、tree-shaking | 旧环境需适配 | 现代项目 |
| CJS | 生态成熟 | 运行时加载、体积大 | Node.js 历史项目 |

### 2.3 特性对比表：动态导入策略

| 策略 | 浏览器 | Node.js | 同构 | 编译时优化 | 运行时开销 |
|------|--------|---------|------|-----------|-----------|
| `import()` (原生 ESM) | ✅ | ✅ (v12.20+) | ✅ | tree-shaking 支持 | 低 |
| `require()` (CJS) | ❌ | ✅ | ❌ | 无静态分析 | 中 |
| Webpack `import()` | ✅ | 需配置 | 需 shim | 代码分割 + 预加载 | 低 |
| Vite `import()` | ✅ | 需 SSR 配置 | ✅ | 按需编译 | 极低 |
| `import.meta.glob` (Vite) | ✅ | ❌ | ❌ | 编译期扫描 | 低 |
| `createRequire` (Node ESM) | ❌ | ✅ | 部分 | 无 | 中 |

### 2.4 与相关技术的对比

与 Python/Java 模块对比：JS 模块系统经历了多次演进，ESM 是最终方向。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 配置模块 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：条件动态导入与加载器封装

```typescript
// 策略一：根据环境条件加载配置
async function loadConfig(env: 'development' | 'production' | 'test') {
  const configModule = await import(`./configs/${env}.config.js`);
  return configModule.default;
}

// 策略二：带超时与降级策略的动态加载器
async function safeImport<T>(path: string, timeoutMs = 5000, fallback?: T): Promise<T> {
  const timer = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Import timeout: ${path}`)), timeoutMs)
  );
  try {
    const mod = await Promise.race([import(path), timer]);
    return (mod as any).default ?? mod;
  } catch (err) {
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

// 策略三：SSR/CSR 同构加载（Next.js/Nuxt 风格）
async function loadClientOnlyModule() {
  if (typeof window === 'undefined') {
    // SSR 环境返回 mock 或跳过
    return { default: () => null };
  }
  // 浏览器环境真实加载
  return import('heavy-charting-library');
}

// 策略四：批量条件预加载
async function preloadModules(conditions: Record<string, boolean>) {
  const imports = Object.entries(conditions)
    .filter(([, load]) => load)
    .map(([path]) => import(/* webpackPrefetch: true */ `./features/${path}.ts`));
  return Promise.all(imports);
}
```

### 3.3 代码示例：Import Maps 与浏览器模块解析

```typescript
// import-map-config.html
// <script type="importmap">
// {
//   "imports": {
//     "vue": "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js",
//     "lodash/": "https://cdn.jsdelivr.net/npm/lodash-es/"
//   }
// }
// </script>

// browser-dynamic-import.ts
async function loadWithImportMap() {
  // 浏览器原生支持 import map 时直接解析
  const { createApp } = await import('vue');
  const { debounce } = await import('lodash/debounce.js');

  const app = createApp({
    setup() {
      const save = debounce((data: string) => {
        console.log('Saving:', data);
      }, 300);
      return { save };
    },
  });
  app.mount('#app');
}
```

### 3.4 代码示例：Node.js ESM 互操作配置

```typescript
// node-esm-interop.ts
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 在 ESM 中加载 CJS 包
const legacyCjs = require('some-cjs-package');

// 读取 package.json（ESM 中无 __dirname 时）
import { readFileSync } from 'node:fs';
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

// 动态解析模块路径（用于插件系统）
async function resolvePlugin(name: string): Promise<any> {
  const resolved = await import.meta.resolve?.(name) ?? require.resolve(name);
  return import(resolved);
}
```

### 3.5 代码示例：Vite `import.meta.glob` 批量加载

```typescript
// vite-glob-patterns.ts

// 批量加载组件（编译期扫描）
const components = import.meta.glob('../../components/*.vue');
// 结果：{ '../../components/Button.vue': () => import('./Button.vue'), ... }

async function loadComponent(name: string) {
  const matcher = `../../components/${name}.vue`;
  const loader = components[matcher];
  if (!loader) throw new Error(`Component ${name} not found`);
  const module = await loader();
  return module.default;
}

// 贪婪加载（直接导入所有模块，不推荐用于大量文件）
const eagerModules = import.meta.glob('../../locales/*.json', { eager: true });
// 结果：{ '../../locales/en.json': { default: {...} }, ... }

// 带查询参数的导入
const rawFiles = import.meta.glob('../../snippets/*', { as: 'raw' });
// 以字符串形式返回文件内容

// 类型安全的 glob（使用 Vite 客户端类型）
/// <reference types="vite/client" />
interface GlobModules {
  [path: string]: () => Promise<{ default: unknown }>;
}
```

### 3.6 代码示例：Webpack / Rspack Magic Comments

```typescript
// webpack-magic-comments.ts

// 预加载关键分块
const AdminPanel = lazy(() => import(
  /* webpackChunkName: "admin" */
  /* webpackPrefetch: true */
  /* webpackPreload: true */
  './AdminPanel'
));

// 动态上下文（条件加载一组模块）
function loadLocaleData(locale: string) {
  return import(
    /* webpackInclude: /\.(json|js)$/ */
    /* webpackExclude: /\_test\./ */
    /* webpackChunkName: "locale-[request]" */
    /* webpackMode: "lazy" */
    `./locales/${locale}`
  );
}

// 运行时上下文映射（用于微前端或插件系统）
const context = require.context('./plugins', true, /\.plugin\.ts$/);
const pluginModules = context.keys().map(context);
```

### 3.7 代码示例：Deno / Bun 原生动态导入

```typescript
// deno-dynamic-import.ts
// Deno 原生支持 ESM 与 URL 导入
const { serve } = await import('https://deno.land/std@0.200.0/http/server.ts');

// Deno 权限控制下的条件加载
if (Deno.permissions.querySync({ name: 'read', path: './config.ts' }).state === 'granted') {
  const config = await import('./config.ts');
  console.log(config.default);
}

// bun-dynamic-import.ts
// Bun 支持同步 require 与异步 import 无缝混用
const syncMod = require('./legacy.cjs'); // 同步
const asyncMod = await import('./modern.ts'); // 异步

// Bun 的模块解析缓存控制
const freshMod = await import('./hot-reload.ts?bust=' + Date.now());
```

### 3.8 常见误区

| 误区 | 正确理解 |
|------|---------|
| ESM 和 CJS 可以随意混用 | 互操作需要特定加载器和转换规则 |
| 循环依赖会自动解决 | 循环依赖可能导致未初始化访问 |
| `import()` 可以在模板字符串中任意拼接 | 大部分打包器要求模板字符串前缀可静态分析 |
| 动态导入一定比静态导入好 | 动态导入失去编译时优化机会，应谨慎使用 |

---

## 四、扩展阅读

- [MDN 动态 import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [MDN：import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta)
- [MDN：JavaScript 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Vite：动态导入](https://vitejs.dev/guide/features.html#dynamic-import)
- [Vite：Glob Import](https://vitejs.dev/guide/features.html#glob-import)
- [Webpack：Module Methods — import()](https://webpack.js.org/api/module-methods/#import-1)
- [Webpack：Magic Comments](https://webpack.js.org/api/module-methods/#magic-comments)
- [Node.js ESM：import specifiers](https://nodejs.org/api/esm.html#import-specifiers)
- [Node.js ESM：Interoperability with CommonJS](https://nodejs.org/api/esm.html#interoperability-with-commonjs)
- [Node.js：createRequire](https://nodejs.org/api/module.html#modulecreaterequirefilename)
- [Deno Manual: Modules](https://docs.deno.com/runtime/fundamentals/modules/) — Deno 模块系统指南
- [Bun Docs: Runtime](https://bun.sh/docs/runtime/modules) — Bun 模块加载器
- [Import Maps Proposal](https://github.com/WICG/import-maps) — WICG 标准提案
- [ECMAScript® 2025 — Import Calls](https://tc39.es/ecma262/#sec-import-calls)
- `10-fundamentals/10.1-language-semantics/06-modules/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
