---
title: 构建工具
description: JavaScript/TypeScript 构建工具完整指南 - Vite、Webpack、Rollup、esbuild、Rspack、Rolldown、Farm 深度对比与选型决策
---

# 构建工具

> 数据更新时间：2026年5月
>
> 数据来源：GitHub API、npm Registry、State of JavaScript 2025 Survey、Vite/Rspack/Rolldown 官方博客与 Benchmark

JavaScript/TypeScript 生态的构建工具经历了从 Webpack 一统天下到百花齐放的发展过程。现代构建工具追求**极速构建**、**原生 ESM 支持**和**TypeScript 开箱即用**。2026 年，工具链的 **Rust 化** 已进入收割期——Rolldown 成为 Vite 生产构建默认底层，Rspack 在字节跳动等头部企业承载数万应用，Farm 以 Vite 插件兼容性快速崛起。

## 🧪 关联代码实验室

> **1** 个关联模块 · 平均成熟度：**🌳**

| 模块 | 成熟度 | 实现文件 | 测试文件 |
|------|--------|----------|----------|
| [23-toolchain-configuration](../../jsts-code-lab/23-toolchain-configuration/) | 🌳 | 9 | 3 |


---

## 主流构建工具对比

| 工具 | ⭐ Stars | 最新版本 | npm 周下载量 | 语言 | TS支持 | 定位 | 适用场景 |
|------|---------|---------|-------------|------|--------|------|----------|
| [Vite](https://vitejs.dev/) | 70k+ | v6.3.0 | 1.08亿 | TypeScript | ✅ 原生 | 下一代前端工具 | 现代 Web 应用 |
| [Webpack](https://webpack.js.org/) | 65k+ | v5.99.0 | 4500万 | JavaScript | ⚠️ 需配置 | 模块打包器 | 复杂企业级项目 |
| [Rollup](https://rollupjs.org/) | 25k+ | v4.40.0 | 1.05亿 | JavaScript | ⚠️ 需插件 | ES模块打包器 | 库/组件开发 |
| [esbuild](https://esbuild.github.io/) | 40k+ | v0.25.0 | 1.95亿 | Go | ✅ 内置 | 极速打包器 | 构建脚本、CI、底层工具 |
| [Turbopack](https://turbo.build/) | 27.5k+ | v16 默认 | 1200 | Rust | ✅ 原生 | Next.js 御用 | Next.js 项目 |
| [Parcel](https://parceljs.org/) | 43k+ | v2.14.0 | 280万 | Rust + JS | ✅ 零配置 | 零配置打包器 | 快速原型开发 |
| [Rspack](https://www.rspack.dev/) | 10.5k+ | v1.3.0 / v2.0 Preview | 210万 | Rust | ✅ 内置 | Webpack 替代 | 迁移 Webpack 项目 |
| [Farm](https://www.farmfe.org/) | 8k+ | v1.7.0 | 15万 | Rust | ✅ 内置 | 极速构建引擎 | 现代化项目 |
| [Bun](https://bun.sh/) | 76k+ | v1.2.0 | 350万 | Zig | ✅ 原生 | 全功能 JS 运行时 | 全栈开发 |
| [Rolldown](https://rolldown.rs/) | 10.5k+ | v1.0.0-rc.0 | 85万 | Rust | ✅ 内置 | Rollup 替代 | 库开发 / Vite 底层 |

**关键指标来源**：GitHub Stars（2026-04）、npm Registry 周下载量（2026-04-27）、各项目官方 Release 页面。

---

## 主流构建工具详解

### Vite ⚡

> ⭐ 70k+ | v6.3.0 | npm 周下载 1.08亿 | 满意度 98%（State of JS 2025）

**核心优势：**

- 开发时使用原生 ESM，无需打包，冷启动极快（~200ms/千模块）
- 生产构建基于 Rollup（Vite 8 默认使用 Rolldown），输出高度优化
- 开箱即用的 TypeScript 支持
- 丰富的插件生态，与 Rollup 插件兼容

**TS 支持度：** ⭐⭐⭐⭐⭐ 完美

- 原生支持 `.ts` 文件
- 支持类型导入/导出
- 内置 TSX/JSX 支持
- 类型检查可配置（生产环境建议配合 `tsc --noEmit`）

```bash
# 快速开始
npm create vite@latest my-app -- --template vue-ts
npm create vite@latest my-app -- --template react-ts
npm create vite@latest my-app -- --template vanilla-ts
```

**适用场景：** 现代 Web 应用、SPA、SSR 项目、Vue/React/Svelte 生态

#### Vite 6/8 深度特性

**Environment API（Vite 6+）**

Vite 6 引入了统一的 Environment API，将原先分散的 `ssr`、`client` 构建逻辑抽象为统一的 `Environment` 接口。这使得多环境构建（如 Worker、SSR、Client 同时构建）的配置更加一致：

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  environments: {
    client: {
      build: { outDir: 'dist/client' }
    },
    ssr: {
      build: { outDir: 'dist/server' }
    },
    edge: {
      // 自定义边缘环境
      resolve: { conditions: ['edge'] }
    }
  }
})
```

**Module Federation 2.0 支持**

Vite 6 通过 `@originjs/vite-plugin-federation` 提供了对 Module Federation 2.0 的实验性支持，允许微前端架构在 Vite 生态中落地：

- 支持 `exposes` / `remotes` 声明式配置
- 与 Webpack Module Federation 的运行时兼容
- 共享依赖自动 deduplication

**SSR 改进**

- 服务端渲染模块热更新（SSR HMR）：服务端代码修改无需重启整个开发服务器
- 流式 SSR（Streaming SSR）原生支持：配合 React 18+/Vue 3.5+ 的 `renderToPipeableStream`
- 外部化依赖（Externalization）策略优化：自动识别 Node.js 内置模块

**Vite 8 + Rolldown 默认底层（2026-03）**

Vite 8.0 正式发布，Rolldown 成为默认生产构建器。这一变化带来的实际收益：

| 项目规模 | Vite 5 (Rollup) | Vite 8 (Rolldown) | 构建时间降幅 |
|---------|----------------|-------------------|-------------|
| 小型项目（<100模块） | 2.5s | 1.2s | **52%** |
| 中型项目（500-1000模块） | 12s | 4.5s | **62%** |
| 大型项目（5000+模块） | 46s | 14s | **70%** |
| 超大型项目（10000+模块） | 120s | 35s | **71%** |

*数据来源：Vite 官方 Benchmark，2026-03；测试条件：esbuild 预构建已缓存，不含类型检查*

---

### Webpack 📦

> ⭐ 65k+ | v5.99.0 | npm 周下载 4500万 | 使用率 86%（State of JS 2025）

**核心优势：**

- 生态最成熟，插件/加载器丰富（>3000 个官方/社区插件）
- 高度可配置，灵活处理各种资源
- Webpack 5 引入持久缓存和 Module Federation
- 企业级项目首选，微前端架构成熟

**TS 支持度：** ⭐⭐⭐ 良好（需配置）

- 需配置 `ts-loader` 或 `babel-loader` + `@babel/preset-typescript`
- 推荐使用 `fork-ts-checker-webpack-plugin` 进行类型检查

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
```

**适用场景：** 复杂企业级应用、需要精细控制的场景、遗留项目维护

#### Webpack 5 深度特性

**持久缓存（Persistent Caching）**

Webpack 5 引入的 `cache: { type: 'filesystem' }` 将构建缓存持久化到磁盘，二次构建速度提升 3-5 倍：

```js
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  }
};
```

- 缓存命中后大型项目构建时间从 60s 降至 8-12s
- 缓存文件默认存储于 `node_modules/.cache/webpack`
- CI 环境中可配合缓存目录复用加速流水线

**Module Federation 2.0**

Module Federation 允许运行时动态加载远程模块，是微前端架构的核心基础设施：

```js
// 宿主应用配置
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      remotes: {
        app2: 'app2@http://localhost:3002/remoteEntry.js'
      },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
    })
  ]
};
```

- 支持远程模块的类型安全（通过 `@module-federation/typescript` 插件）
- 2025-2026 年 Module Federation 从 Webpack 插件升级为独立运行时，支持 Vite/Rspack

**渐进式迁移路径**

对于仍在使用 Webpack 4 的项目，推荐迁移路径：

1. **Webpack 4 → 5**：升级 `webpack` 和 `webpack-cli`，启用持久缓存（低风险，1-2 周）
2. **Webpack 5 → Rspack**：利用配置兼容层，逐步替换 loader（中风险，2-4 周）
3. **Rspack → Vite**：仅当项目为现代 SPA 且不需要 Webpack 特有插件时（高风险，4-8 周）

---

### Rollup 📜

> ⭐ 25k+ | v4.40.0 | npm 周下载 1.05亿

**核心优势：**

- 输出更简洁、更高效的 ES 模块
- Tree Shaking 效果最好（基于 ES 模块的静态分析）
- 库开发的标准选择

**TS 支持度：** ⭐⭐⭐ 良好（需插件）

- 使用 `@rollup/plugin-typescript` 或 `rollup-plugin-ts`

```js
// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.cjs', format: 'cjs' },
    { file: 'dist/index.mjs', format: 'es' },
  ],
  plugins: [typescript()],
};
```

**适用场景：** 库/组件开发、npm 包发布

---

### esbuild 🚀

> ⭐ 40k+ | v0.25.0 | npm 周下载 1.95亿 | Go 语言编写

**核心优势：**

- 比传统工具快 10-100 倍
- 内置 TypeScript、TSX、JSX 支持
- 单一可执行文件，无依赖

**TS 支持度：** ⭐⭐⭐⭐⭐ 完美

- 原生支持 TypeScript（仅转译，不类型检查）
- 需要类型检查需配合 `tsc --noEmit`

```bash
# 命令行使用
esbuild src/index.ts --bundle --outfile=dist/index.js --platform=node

# 代码中使用
import { build } from 'esbuild';
await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  platform: 'node',
});
```

**适用场景：** 构建脚本、CI/CD、工具开发、作为其他工具的底层编译层

#### esbuild 现状：稳定维护，作为底层工具的地位

esbuild 自 2020 年发布以来，已成为 JavaScript 工具链的**基础设施层**。尽管作者 Evan Wallace 明确表示 esbuild 不会发展为完整的应用打包器（如 Webpack/Vite），但其作为**底层编译/打包引擎**的地位不可动摇：

- **Vite 开发阶段**：esbuild 负责依赖预构建（Pre-bundling）和 TypeScript/JSX 转译
- **框架生态**：Deno、Remix、SvelteKit 等均将 esbuild 作为构建管道的核心组件
- **npm 下载量 1.95 亿/周**：作为间接依赖被大量项目引入，实际使用面远超 GitHub Stars 所反映的

**局限性**：esbuild 有意保持精简，不支持完整的 AST 转换插件、不内置 HMR、不做极致的产物优化（如 advanced chunk splitting）。这些"不足"恰恰为 Rolldown 等工具留下了空间——Rolldown 在保持 esbuild 速度的同时，补全了 Rollup 级别的产物优化能力。

---

### Turbopack ⚡

> ⭐ 27.5k+ | Next.js 16 默认 | Vercel 出品

**核心优势：**

- Rust 编写，号称比 Webpack 快 700 倍（开发模式 HMR）
- 增量编译，HMR 极速
- 与 Next.js 深度集成

**TS 支持度：** ⭐⭐⭐⭐⭐ 完美

- 原生支持 TypeScript
- 内置 SWC 进行转译

```bash
# Next.js 中使用
next dev --turbo
```

**适用场景：** Next.js 项目（目前主要场景）

---

### Parcel 📦

> ⭐ 43k+ | v2.14.0 | npm 周下载 280万

**核心优势：**

- 真正零配置，开箱即用
- 内置对多种语言的转换支持
- 自动代码分割

**TS 支持度：** ⭐⭐⭐⭐⭐ 完美

- 零配置支持 TypeScript
- 自动检测 `tsconfig.json`

```bash
# 零配置启动
parcel src/index.html
```

**适用场景：** 快速原型、小型项目

#### Parcel 2：Rust 化与 WebExtension 支持

Parcel 2 的核心架构已全面 Rust 化：

- **@parcel/transformer-js**：基于 SWC 的 JavaScript/TypeScript 转换器，替代了早期的 Babel 方案
- **Lightning CSS**：Parcel 团队开发的 Rust CSS 处理器，已独立为社区广泛采用（Vercel、Shopify、Astro）
- **自动依赖图分析**：通过 Rust 实现的文件系统监听和依赖追踪，增量构建速度提升 5-10x

**WebExtension 支持**：Parcel 2 是少数原生支持浏览器扩展（Chrome Extension / Firefox Add-on）构建的打包器：

```json
// manifest.json
{
  "manifest_version": 3,
  "background": { "service_worker": "background.ts" },
  "content_scripts": [{ "js": ["content.ts"] }]
}
```

Parcel 自动处理 `manifest.json` 中的脚本引用、HMR 支持扩展开发、自动打包为 ZIP 分发格式。

**适用场景扩展**：浏览器扩展开发、快速原型、不愿投入配置成本的小型项目

---

### Rspack 🦀

> ⭐ 10.5k+ | v1.3.0 稳定 / v2.0 Preview | 字节跳动出品

**核心优势：**

- Rust 编写，性能媲美 esbuild（5-10x vs Webpack）
- 兼容 Webpack 配置和生态（配置迁移成本极低）
- 平滑迁移现有 Webpack 项目
- 内置 SWC，转译速度极快

**TS 支持度：** ⭐⭐⭐⭐⭐ 完美

- 内置 TypeScript 支持
- 兼容 `ts-loader` 配置

```js
// rspack.config.js (与 webpack 配置兼容)
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'builtin:swc-loader', // 使用内置 SWC
      },
    ],
  },
};
```

**适用场景：** 从 Webpack 迁移、追求性能的企业项目

#### Rspack：企业迁移路径详解

Rspack 的核心价值在于**"Webpack 兼容 + Rust 性能"**的折中路线——它不要求开发者重写配置，却能获得数量级的性能提升。

**配置兼容层**：

| Webpack 特性 | Rspack 支持度 | 备注 |
|-------------|-------------|------|
| `entry` / `output` | ✅ 100% | 完全兼容 |
| `module.rules` (loader) | ✅ 95% | 绝大多数 loader 直接可用 |
| `plugins` | ✅ 90% | HtmlWebpackPlugin、DefinePlugin 等原生支持 |
| `resolve` | ✅ 100% | alias、extensions 等完全兼容 |
| `optimization.splitChunks` | ✅ 100% | 代码分割策略一致 |
| `devServer` | ✅ 100% | 基于 webpack-dev-server |
| `experiments.css` | ✅ 支持 | CSS 原生导入 |
| Module Federation | ✅ 支持 | v1.3+ 原生支持 |

**企业级迁移案例**：

- **字节跳动**：内部数万应用从 Webpack 迁移至 Rspack，平均构建时间降低 60-70%
- **Discord**：大型客户端项目采用 Rspack，CI 构建时间从 15 分钟降至 4 分钟
- **Microsoft**：部分内部工具链评估 Rspack 作为 Webpack 的渐进式替代

**渐进式迁移步骤**：

```bash
# 1. 安装 Rspack 作为 Webpack 的 drop-in 替代
npm uninstall webpack webpack-cli
npm install @rspack/core @rspack/cli

# 2. 重命名配置文件（可选）
mv webpack.config.js rspack.config.js

# 3. 替换内置 loader 为 SWC（推荐）
# 将 ts-loader / babel-loader 替换为 builtin:swc-loader

# 4. 运行构建，根据兼容性报告修复剩余差异
npx rspack build
```

**Rspack v2.0 Preview（2026）**：

- 引入 Rolldown 风格的统一构建管道
- 提升对复杂 Webpack 插件的兼容性
- 进一步优化大型项目（10000+ 模块）的内存占用

---

### Farm 🌾

> ⭐ 8k+ | v1.7.0 | Rust 编写

**核心优势：**

- 基于 Rust 的极速编译（与 Rspack、Rolldown 同数量级）
- **兼容 Vite 插件生态**——关键差异化优势
- 支持增量构建
- 内置开发服务器，HMR 极速

**TS 支持度：** ⭐⭐⭐⭐⭐ 完美

- 原生 TypeScript 支持

```bash
# 快速开始
npm create farm@latest
```

**适用场景：** 追求极致构建速度的现代化项目、已有 Vite 插件生态积累的项目

#### Farm：Vite 插件兼容策略

Farm 的独特定位在于**"像 Vite 一样快，像 Webpack 一样兼容"**：

- **Vite 插件兼容层**：Farm 实现了 Vite 插件 API 的子集，允许 `@vitejs/plugin-react`、`unocss/vite` 等流行插件直接复用
- **Rust 核心 + JS 插件运行时**：核心编译管道以 Rust 实现保证速度，插件执行环境兼容 Vite 的 JavaScript 运行时
- **Webpack loader 兼容（实验性）**：v1.5+ 开始实验性支持 Webpack loader 接口

**性能数据**（官方 Benchmark，2026-03）：

| 指标 | Farm v1.7 | Vite 6 (Rollup) | Webpack 5 |
|------|-----------|-----------------|-----------|
| 冷启动（1000模块） | ~180ms | ~200ms | ~5000ms |
| HMR（修改单文件） | ~15ms | ~30ms | ~1500ms |
| 生产构建 | ~8s | ~12s | ~45s |
| 内存占用（峰值） | ~450MB | ~520MB | ~2.1GB |

*数据来源：Farm 官方 Benchmark，测试项目为 React + TypeScript 中型应用*

**适用场景细化**：

- 需要 Vite 开发体验但生产构建需更快速度
- 已有 Vite 插件投资，希望渐进式升级构建性能
- 对 Farm 的 Rust + JS 混合插件架构有接受度的团队

---

### Bun 🥯

> ⭐ 76k+ | v1.2.0 | npm 周下载 350万 | 2025-12 被 Anthropic 收购

**核心优势：**

- 一体化工具链：运行时 + 包管理器 + 测试 + 构建
- 比 Node.js 快 4-5 倍
- 内置打包器，兼容 esbuild API

**TS 支持度：** ⭐⭐⭐⭐⭐ 完美

- 原生执行 `.ts` 文件，无需转译
- 内置类型检查支持

```bash
# 直接运行 TypeScript
bun run index.ts

# 打包
bun build ./index.ts --outdir ./dist

# 作为包管理器
bun install
bun add typescript
```

**适用场景：** 全栈开发、追求极简工具链的项目

---

### Rolldown 🔄

> ⭐ 10.5k+ | v1.0.0-rc.0 | VoidZero 出品 | Vite 8 默认底层

**核心优势：**

- Rust 编写，结合 Rollup 的 API 和 esbuild 的速度
- 与 Rollup 插件 100% 兼容
- **未来已成为现在**：Vite 8 默认使用 Rolldown 作为生产构建器
- Oxc 原生集成（共享解析器、转换器、minifier）

**TS 支持度：** ⭐⭐⭐⭐⭐ 完美

- 原生 TypeScript 支持
- 通过 Oxc 实现 TypeScript 转译（速度比 tsc 快 10x+）

**适用场景：** 库开发、Vite 生态的核心底层

#### Rolldown：Vite 未来默认 bundler 的实现

Rolldown 并非简单的 Rollup Rust 重写，而是与 Vite 深度整合的**"统一生产构建器"**：

**架构定位**：

```
传统 Vite 架构：
  开发阶段 → esbuild (预构建 + 转译) + 原生 ESM
  生产阶段 → Rollup (JS) 打包 + esbuild (压缩)
  问题：dev 与 build 行为不一致，复杂 edge case

Vite 8 + Rolldown 架构：
  开发阶段 → esbuild (预构建) + 原生 ESM
  生产阶段 → Rolldown (Rust) 统一打包 + 优化
  优势：Rollup 级别的产物质量 + esbuild 级别的速度
```

**与 Rollup 的兼容性**：

| 特性 | Rollup (JS) | Rolldown | 兼容性 |
|------|-------------|----------|--------|
| 插件 API (`options`/`buildStart`/`transform`/`resolveId`) | ✅ | ✅ | 100% |
| `output.format` (es/cjs/iife/umd) | ✅ | ✅ | 100% |
| `output.manualChunks` | ✅ | ✅ | 100% |
| `preserveEntrySignatures` | ✅ | ✅ | 100% |
| `moduleSideEffects` | ✅ | ✅ | 100% |
| Sourcemap | ✅ | ✅ | 100% |
| Watch 模式 | ✅ | ✅ | 100% |
| 高级 Tree Shaking | ✅ | ✅ | 等效 |

**性能基准**（Vite 官方 Benchmark，2026-03）：

```
大型前端项目生产构建（10,000+ 模块）：
- Rollup (JS): 46s
- esbuild (bundle): 4.2s (产物优化较弱)
- Rolldown: 6s  (7.7x vs Rollup, 1.4x vs esbuild bundle)
- 内存占用降低高达 100x (Rollup 2.8GB → Rolldown 28MB)
```

**采用时间线**：

| 时间 | 里程碑 |
|------|--------|
| 2025-05 | Rolldown-Vite Beta 发布 |
| 2025-06 | Vite 7.0 引入 rolldown-vite 包 |
| 2025-11 | Vite 8 Beta 默认使用 Rolldown |
| 2026-01 | Rolldown v1.0 RC |
| 2026-H1 | 成为 Vite 默认生产打包器 ✅ |
| 2026-H2 | 独立 CLI 发布（计划中） |

---

## 转译工具对比

| 工具 | ⭐ Stars | 语言 | 特点 | TS支持 |
|------|---------|------|------|--------|
| [SWC](https://swc.rs/) | 31k+ | Rust | 极速编译，Babel 替代 | ✅ 原生 |
| [Babel](https://babeljs.io/) | 43k+ | JavaScript | 生态成熟，可配置性强 | ✅ 插件 |
| [Sucrase](https://github.com/alangpierce/sucrase) | 6k+ | JavaScript | 超快开发构建，放弃旧浏览器支持 | ✅ 内置 |

### SWC 🦀

> ⭐ 31k+ | v1.11.0 | Rust 编写的下一代编译器

**核心优势：**

- 比 Babel 快 20-70 倍
- 由 Vercel 赞助，Next.js、Rspack 默认使用
- 支持编译和压缩

**TS 支持：** 原生支持，可直接编译 TypeScript

```json
// .swcrc
{
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true
    },
    "target": "es2020"
  }
}
```

### Babel 🐠

> ⭐ 43k+ | JavaScript 编译器标准

**核心优势：**

- 生态最成熟
- 插件系统强大
- 可转换任何新特性到旧环境

**TS 支持：** 使用 `@babel/preset-typescript`

```json
// .babelrc
{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-typescript"
  ]
}
```

### Sucrase ⚡

> ⭐ 6k+ | 超快开发构建

**核心优势：**

- 比 Babel 快 20 倍
- 仅支持现代浏览器特性
- 专注 TypeScript/JSX/Flow

**TS 支持：** 内置支持

---

## 任务运行器/打包工具

| 工具 | ⭐ Stars | 用途 | TS支持 |
|------|---------|------|--------|
| [tsup](https://github.com/egoist/tsup) | 8k+ | TypeScript 库打包 | ✅ 原生 |
| [unbuild](https://github.com/unjs/unbuild) | 4k+ | 统一 JavaScript 构建系统 | ✅ 原生 |
| [tsx](https://github.com/privatenumber/tsx) | 10k+ | TypeScript 执行器 | ✅ 原生 |
| [pkgroll](https://github.com/privatenumber/pkgroll) | 2k+ | 零配置打包 | ✅ 原生 |

### tsup 📦

基于 esbuild 的 TypeScript 库打包工具：

```bash
# 零配置打包 TypeScript 库
npx tsup src/index.ts --format cjs,esm --dts
```

### unbuild 🛠️

统一的 JavaScript 构建系统，基于 Rollup：

```json
// build.config.ts
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
});
```

### tsx ⚡

Node.js 的 TypeScript 增强执行器：

```bash
# 直接执行 TypeScript（比 ts-node 快 100 倍）
npx tsx watch src/index.ts
```

---

## Monorepo 工具

| 工具 | ⭐ Stars | 定位 | TS支持 |
|------|---------|------|--------|
| [Turborepo](https://turbo.build/) | 26k+ | 智能构建系统 | ✅ 完美 |
| [Nx](https://nx.dev/) | 24k+ | 智能构建与脚手架 | ✅ 完美 |
| [pnpm](https://pnpm.io/) | 30k+ | 高效包管理器 + workspace | ✅ 完美 |
| [Lerna](https://lerna.js.org/) | 35k+ | 包管理（已维护放缓） | ✅ 良好 |
| [Rush](https://rushstack.io/) | 5k+ | 微软出品的企业级方案 | ✅ 完美 |

### Turborepo 🚀

Vercel 出品的智能构建系统：

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Nx 🧠

功能完整的 Monorepo 工具：

```bash
# 创建 Nx 工作区
npx create-nx-workspace@latest --preset=ts

# 生成 TypeScript 库
nx g @nx/js:lib my-lib
```

### pnpm workspace 📦

现代包管理器的 workspace 方案：

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

## 构建性能对比矩阵

> 测试基准：React + TypeScript 中型应用（约 1000 个模块，含 node_modules 预构建）
> 测试环境：AMD Ryzen 9 5950X, 64GB RAM, SSD
> 数据来源：各工具官方 Benchmark 与社区独立测试综合，2026-03

### 冷启动对比（Dev Server 首次启动）

| 工具 | 时间 | 相对 Webpack 倍数 |
|------|------|------------------|
| **Vite 8** | ~180ms | 28x |
| **Farm** | ~180ms | 28x |
| **Rspack** | ~400ms | 12x |
| **Turbopack** | ~250ms | 20x |
| **Parcel 2** | ~1200ms | 4x |
| **Webpack 5** | ~5000ms | 1x |

### HMR（热模块替换）对比

| 工具 | 修改 React 组件 | 修改 CSS | 修改 TypeScript 工具函数 |
|------|----------------|----------|------------------------|
| **Vite 8** | ~20ms | ~5ms | ~30ms |
| **Farm** | ~15ms | ~5ms | ~25ms |
| **Rspack** | ~80ms | ~20ms | ~120ms |
| **Turbopack** | ~10ms | ~3ms | ~15ms |
| **Parcel 2** | ~100ms | ~15ms | ~150ms |
| **Webpack 5** | ~1500ms | ~200ms | ~2000ms |

### 生产构建时间对比

| 工具 | 小型项目<br>(<100模块) | 中型项目<br>(500-1000模块) | 大型项目<br>(5000+模块) |
|------|----------------------|--------------------------|------------------------|
| **Rolldown** | 0.8s | 3.5s | 10s |
| **esbuild** | 0.5s | 2.0s | 6s |
| **Rspack** | 1.5s | 5.0s | 15s |
| **Farm** | 1.0s | 4.0s | 12s |
| **Vite 8 (Rolldown)** | 1.2s | 4.5s | 14s |
| **Vite 5 (Rollup)** | 2.5s | 12s | 46s |
| **Webpack 5** | 4.0s | 18s | 55s |
| **Parcel 2** | 3.0s | 10s | 30s |

### 内存占用对比（生产构建峰值）

| 工具 | 小型项目 | 中型项目 | 大型项目 |
|------|---------|---------|---------|
| **Rolldown** | 80MB | 180MB | 450MB |
| **esbuild** | 120MB | 300MB | 800MB |
| **Rspack** | 200MB | 500MB | 1.2GB |
| **Farm** | 150MB | 450MB | 900MB |
| **Vite 8** | 180MB | 520MB | 1.1GB |
| **Webpack 5** | 600MB | 1.5GB | 2.8GB+ |

> **注意**：esbuild 构建速度最快但产物优化较弱（代码分割、Tree Shaking 精细度不及 Rolldown/Rollup）。实际选型需在"构建速度"与"产物质量"之间权衡。Vite 8 通过 Rolldown 实现了两者的最佳平衡。

---

## 插件生态对比

### Vite 插件 vs Webpack Loader/Plugin

| 维度 | Vite 插件 | Webpack Loader/Plugin |
|------|----------|----------------------|
| **架构** | 统一的 Plugin API（基于 Rollup 插件规范） | Loader（文件转换）+ Plugin（生命周期钩子）双轨制 |
| **配置复杂度** | 低：一个 `plugins` 数组 | 高：`module.rules` + `plugins` 分开配置 |
| **执行时机** | 简洁的钩子：`config`/`buildStart`/`transform`/`load` | 丰富的生命周期：compiler/compilation 多阶段 |
| **热更新支持** | 内置 `handleHotUpdate` 钩子 | 需通过 `webpack.HotModuleReplacementPlugin` |
| **社区规模** | 500+ 官方/社区插件 | 3000+ loader + 2000+ plugin |
| **代表性插件** | `@vitejs/plugin-react`、`unocss/vite`、`vite-plugin-pwa` | `babel-loader`、`ts-loader`、`html-webpack-plugin` |
| **跨工具复用** | Rollup 插件可直接使用；Farm 兼容部分 Vite 插件 | 仅限 Webpack 生态；Rspack 提供兼容层 |

**插件编写对比**：

```js
// Vite / Rollup 插件（简洁统一）
export default function myVitePlugin() {
  return {
    name: 'my-plugin',
    transform(code, id) {
      if (id.endsWith('.ts')) {
        return { code: transformedCode, map: sourcemap };
      }
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.css')) {
        // 自定义 HMR 行为
      }
    }
  };
}

// Webpack Loader（专注于文件转换）
module.exports = function myWebpackLoader(source) {
  const callback = this.async();
  const options = this.getOptions();
  // 只能访问当前文件内容，无全局构建上下文
  callback(null, transformedSource, sourceMap);
};

// Webpack Plugin（专注于构建生命周期）
class MyWebpackPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('MyPlugin', (compilation) => {
      // 访问 compilation.assets 修改输出
    });
  }
}
```

**选型建议**：

- **新项目**：优先选择 Vite 插件生态，配置简单、HMR 友好
- **遗留项目**：Webpack 生态更丰富（特别是微前端、复杂资源处理），迁移至 Rspack 可保留插件投资
- **库开发**：Rollup/Rolldown 插件生态足够，产物质量最优

---

## 选型决策树

```
开始选型
│
├─ 项目类型？
│   │
│   ├─ 小型项目 / 快速原型 (< 50 模块)
│   │   ├─ 是否需要零配置？
│   │   │   ├─ 是 → Parcel 2（真正零配置）
│   │   │   └─ 否 → Vite 8（开发体验最佳）
│   │   └─ 是否需要浏览器扩展？
│   │       └─ 是 → Parcel 2（原生 WebExtension 支持）
│   │
│   ├─ 中型 Web 应用 (50-1000 模块)
│   │   ├─ 框架选择？
│   │   │   ├─ Next.js → Turbopack（官方默认）
│   │   │   ├─ Vue / React / Svelte → Vite 8（生态最成熟）
│   │   │   └─ 框架无关 → Vite 8 或 Farm
│   │   └─ 是否需要极致构建速度？
│   │       └─ 是 → Farm（Vite 插件兼容 + Rust 速度）
│   │
│   ├─ 大型应用 / 企业级项目 (1000+ 模块)
│   │   ├─ 现有构建工具？
│   │   │   ├─ Webpack → Rspack v2（配置兼容，5-10x 提速）
│   │   │   │   └─ 是否需要 Module Federation？
│   │   │   │       └─ 是 → Rspack（原生支持）
│   │   │   ├─ Vite → Vite 8（Rolldown 默认，70% 构建提速）
│   │   │   └─ 新项目
│   │   │       ├─ 需要 Webpack 生态兼容 → Rspack
│   │   │       └─ 接受现代工具链 → Vite 8
│   │   └─ 是否需要微前端？
│   │       └─ 是 → Rspack / Webpack 5（Module Federation 最成熟）
│   │
│   └─ 库 / npm 包开发
│       ├─ 是否需要多种输出格式 (CJS/ESM/UMD)？
│       │   ├─ 是 → tsup（基于 esbuild，零配置）或 Rollup/Rolldown
│       │   └─ 否 → Rollup / Rolldown（产物最干净）
│       └─ 是否需要 TypeScript 声明文件自动生成？
│           └─ 是 → tsup --dts 或 unbuild（基于 Rollup）
```

### 按场景速查表

| 场景 | 首选 | 次选 | 避免 |
|------|------|------|------|
| 现代 SPA 新项目 | **Vite 8** | Farm | Webpack 5（配置负担） |
| Next.js 项目 | **Turbopack** | — | — |
| 从 Webpack 迁移 | **Rspack** | Vite（重写成本高） | — |
| 库开发 | **tsup** / **Rolldown** | Rollup | Webpack（产物冗余） |
| 浏览器扩展 | **Parcel 2** | Vite + 插件 | — |
| 全栈一体化 | **Bun** | — | — |
| CI/CD 脚本 | **esbuild** | Bun | Webpack（速度太慢） |
| 微前端架构 | **Rspack** / **Webpack 5** | Vite + Module Federation | Rollup（无 MF 支持） |
| 超大型 Monorepo | **Vite 8 + Turborepo** | Nx + Rspack | 纯 Webpack |

---

## 选型建议

### 新项目选型

| 项目类型 | 推荐工具 | 理由 |
|---------|---------|------|
| 现代 Web 应用 | **Vite 8** | Rolldown 默认底层，构建时间降低 38-64%，满意度 98% |
| Next.js 项目 | **Turbopack** | 官方支持，性能最优 |
| 库/组件开发 | **tsup** / **Rolldown** | 输出质量高，配置简单 |
| Node.js 工具 | **esbuild** / **Bun** | 构建速度极快 |
| 全栈应用 | **Bun** | 一体化工具链 |
| 浏览器扩展 | **Parcel 2** | 原生 WebExtension 支持 |

### 迁移建议

| 现状 | 推荐迁移目标 | 迁移成本 | 预期收益 |
|------|-------------|---------|---------|
| Webpack 4 项目 | **Webpack 5**（先启用持久缓存） | 低 | 3-5x 二次构建提速 |
| Webpack 5 项目 | **Rspack v2** | 低（配置兼容） | 5-10x 构建提速 |
| CRA 项目 | **Vite 8** | 中 | 开发体验质变 |
| Rollup 项目 | **Rolldown**（Vite 生态） | 低-中 | 10-20x 构建提速 |
| Vite 5 项目 | **Vite 8** | 低（升级即可） | 60-70% 生产构建提速 |

### TypeScript 项目配置建议

1. **开发环境**：使用 Vite 8 + SWC（最快 HMR，~20ms）
2. **生产构建**：Vite 8 默认使用 Rolldown，无需额外配置
3. **库发布**：使用 tsup 或 unbuild 进行多格式输出
4. **类型检查**：独立运行 `tsc --noEmit` 或 `tsc --noEmit --watch`，不阻塞构建
5. **Monorepo**：pnpm 10 Catalog + Turborepo 是 2026 年黄金组合
6. **Linter/Formatter**：评估 Oxc / Biome 替代 ESLint + Prettier（50-100x 提速）

---

## 2026 趋势展望

### 1. Rolldown 取代 esbuild 成为 Vite 统一底层 ✅ 已实现

Vite 8（2026-03）已默认使用 Rolldown 替代 esbuild + Rollup 的组合。这标志着 Vite 从"开发/生产双架构"走向"统一构建管道"：

- **消除不一致**：长期存在的 "dev 正常但 build 报错" 问题大幅减少
- **性能飞跃**：大型项目生产构建时间降低 38-64%
- **内存优化**：构建峰值内存占用降低 50-70%

**对开发者的影响**：升级至 Vite 8 即可获得免费性能提升，无需修改业务代码。

### 2. Rspack 企业采用加速

Rspack 在 2026 年已从"字节跳动内部工具"发展为"企业级 Webpack 替代标准"：

- **v2.0 Preview** 发布，进一步提升复杂插件兼容性
- **Module Federation** 原生支持，成为微前端迁移首选
- **GitLab、Discord、Microsoft** 等头部企业评估或已采用
- **迁移比例**：Webpack → Rspack 的迁移成本远低于 Webpack → Vite，企业接受度更高

### 3. Farm 崛起：Vite 插件兼容的 Rust 替代

Farm 在 2026 年凭借独特的**"Vite 插件兼容 + Rust 性能"**定位快速崛起：

- v1.7 稳定版发布，HMR 速度超越 Vite 6
- 社区插件数量从 50+ 增长至 200+
- 成为"喜欢 Vite 生态但需要更快构建速度"团队的新选择

### 4. 工具链全面 Rust 化

| 领域 | JS 工具 | Rust 替代 | 2026 替代进度 |
|------|--------|----------|-------------|
| Linter | ESLint | Oxc / Biome | 60% |
| Formatter | Prettier | dprint / Biome | 55% |
| Bundler | Webpack | Rspack / Rolldown | 70% |
| Compiler | tsc | tsgo (Go) / stc | 15% |
| Minifier | Terser | SWC / esbuild | 85% |

**数据来源**：Biome 官方 Benchmark（2026-03）、Oxc GitHub Releases、Vite 官方博客（2026-01）、TypeScript 团队技术博客（2026-02）。

### 5. 构建工具满意度格局

State of JavaScript 2025 调查数据（约 12,000 名受访者）：

| 工具 | 使用率 | 满意度 | 趋势 |
|------|--------|--------|------|
| Webpack | 86% | 26% ↓ | 满意度从 36% 下降至 26% |
| **Vite** | 84% | **98%** | 满意度碾压，采用率已超越 Webpack |
| Turbopack | 28% | — | Next.js 生态内稳步增长 |
| **Rolldown** | 10% | — | 从 1% 飙升至 10%，900% YoY 增长 |

**关键信号**：

- Vite 周下载量已于 **2025 年 7 月** 超越 Webpack
- Webpack → Vite 迁移比例 **15:1**（33,966 家公司迁移，仅 2,218 家回退）
- React 团队已于 **2025 年 2 月** 正式废弃 CRA，推荐 Vite

### 6. 2027 预测

- **Rolldown 独立 CLI**：将直接与 esbuild、Rspack 竞争生产构建器市场
- **TypeScript Go 编译器（tsgo）**：预览版已发布，大型 monorepo 类型检查从分钟级降至秒级
- **Oxc 全链路**：将推出 `oxc_transform`，成为 Babel 的 Rust 替代
- **Farm v2**：计划实现 100% Vite 插件兼容，成为 Vite 的"高性能分支"

---

## 相关阅读

- [构建工具对比矩阵](../comparison-matrices/build-tools-compare.md)
- [JS/TS 编译器与转译器对比矩阵](../comparison-matrices/js-ts-compilers-compare.md)
- [Rust 工具链生态](../categories/rust-toolchain.md)
- [JS_TS_语言语义模型全面分析](https://github.com/AdaMartin18010/JavaScriptTypeScript/blob/main/JSTS全景综述/JS_TS_语言语义模型全面分析.md)

---

> **数据标注说明**
>
> - GitHub Stars：各项目官方仓库，2026-04
> - npm 周下载量：npm Registry API，2026-04-27
> - 性能 Benchmark：Vite 官方 Benchmark、Rspack 官方 Benchmark、Farm 官方 Benchmark，2026-03
> - 开发者满意度：State of JavaScript 2025 Survey（约 12,000 名受访者）
> - 企业迁移数据：StackShare、GitHub Dependency Graph 综合分析，2026-Q1
> - 版本状态：各项目官方 Release 页面与 npm latest tag，2026-04

---

## 相关专题

- [⚡ Svelte 5 Signals 编译器生态专题](/svelte-signals-stack/) — 覆盖 Svelte 5 Runes、SvelteKit 全栈、Vite 构建集成、Edge 部署的完整技术栈指南
