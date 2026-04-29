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

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| ESM 和 CJS 可以随意混用 | 互操作需要特定加载器和转换规则 |
| 循环依赖会自动解决 | 循环依赖可能导致未初始化访问 |

### 3.4 扩展阅读

- [MDN 动态 import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [Vite：动态导入](https://vitejs.dev/guide/features.html#dynamic-import)
- [Webpack：Module Methods — import()](https://webpack.js.org/api/module-methods/#import-1)
- [Node.js ESM：import specifiers](https://nodejs.org/api/esm.html#import-specifiers)
- [ECMAScript® 2025 — Import Calls](https://tc39.es/ecma262/#sec-import-calls)
- `10-fundamentals/10.1-language-semantics/06-modules/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
