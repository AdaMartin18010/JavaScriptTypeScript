# 构建工具全景

> 数据更新时间：2026 年 4 月
> 本次更新：补充 Rolldown 生产就绪状态、Oxlint 与 Biome 1.x 最新进展。

JavaScript/TypeScript 生态的构建工具经历了从 Webpack 一统天下到百花齐放的发展过程。现代构建工具追求**极速构建**、**原生 ESM 支持**和**TypeScript 开箱即用**。

---

## 主流构建工具对比

| 工具 | ⭐ Stars | 语言 | TS支持 | 定位 | 适用场景 |
|------|---------|------|--------|------|----------|
| [Vite](https://vitejs.dev/) | 72k+ | TypeScript | ✅ 原生 | 下一代前端工具 | 现代 Web 应用 |
| [Webpack](https://webpack.js.org/) | 65k+ | JavaScript | ⚠️ 需配置 | 模块打包器 | 复杂企业级项目 |
| [Rollup](https://rollupjs.org/) | 26k+ | JavaScript | ⚠️ 需插件 | ES模块打包器 | 库/组件开发 |
| [esbuild](https://esbuild.github.io/) | 39k+ | Go | ✅ 内置 | 极速打包器 | 构建脚本、CI |
| [Turbopack](https://turbo.build/) | 27.5k+ | Rust | ✅ 原生 | Next.js 御用 | Next.js 项目 |
| [Parcel](https://parceljs.org/) | 43k+ | JavaScript | ✅ 零配置 | 零配置打包器 | 快速原型开发 |
| [Rspack](https://www.rspack.dev/) | 11.5k+ | Rust | ✅ 内置 | Webpack 替代 | 迁移 Webpack 项目 |
| [Farm](https://www.farmfe.org/) | 8k+ | Rust | ✅ 内置 | 极速构建引擎 | 现代化项目 |
| [Bun](https://bun.sh/) | 88k+ | Zig | ✅ 原生 | 全功能 JS 运行时 | 全栈开发 |
| [Rolldown](https://rolldown.rs/) | 16k+ | Rust | ✅ 内置 | Vite 6+ 底层打包器 | Vite 生态生产构建 |

---

## 主流构建工具详解

### Vite ⚡

> ⭐ 72k+ | 下一代前端工具链

**核心优势：**

- 开发时使用原生 ESM，无需打包，冷启动极快
- 生产构建基于 Rollup，输出高度优化
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

**适用场景：** 现代 Web 应用、SPA、SSR 项目

---

### Webpack 📦

> ⭐ 65k+ | 模块打包器鼻祖

**核心优势：**

- 生态最成熟，插件/加载器丰富
- 高度可配置，灵活处理各种资源
- Webpack 5 引入持久缓存和 Module Federation
- 企业级项目首选

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

**适用场景：** 复杂企业级应用、需要精细控制的场景

---

### Rollup 📜

> ⭐ 26k+ | ES 模块打包专家

**核心优势：**

- 输出更简洁、更高效的 ES 模块
- Tree Shaking 效果更好
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

> ⭐ 39k+ | 极速 Go 编写打包器

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

**适用场景：** 构建脚本、CI/CD、工具开发

---

### Turbopack ⚡

> ⭐ 27.5k+ | Vercel 出品，Next.js 御用

**核心优势：**

- Rust 编写，号称比 Webpack 快 700 倍
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

> ⭐ 43k+ | 零配置打包器

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

---

### Rspack 🦀

> ⭐ 11.5k+ | 字节跳动出品，Webpack 替代

**核心优势：**

- Rust 编写，性能媲美 esbuild
- 兼容 Webpack 配置和生态
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

---

### Farm 🌾

> ⭐ 8k+ | Rust 编写极速构建

**核心优势：**

- 基于 Rust 的极速编译
- 兼容 Vite 插件生态
- 支持增量构建

**TS 支持度：** ⭐⭐⭐⭐⭐ 完美

- 原生 TypeScript 支持

```bash
# 快速开始
npm create farm@latest
```

**适用场景：** 追求极致构建速度的现代化项目

---

### Bun 🥯

> ⭐ 88k+ | 全功能 JS 运行时 + 构建

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

> ⭐ 16k+ | Vite 生态的 Rust 统一打包器

**核心优势：**

- Rust 编写，底层依托 Oxc 解析器与转译器，结合 Rollup 的 API 和 esbuild 的速度
- Vite 6+ 的默认生产构建引擎，统一 dev/prod 构建管道
- 单一引擎替代 esbuild + Rollup 的双引擎架构，消除构建行为差异
- Stage 3 装饰器 lowering 与类型擦除语义已达生产水准

**TS 支持度：** ⭐⭐⭐⭐⭐ 完美

- 原生 TypeScript 支持，无需插件
- Source Map 列级精确

```bash
# Vite 6+ 默认使用 Rolldown（无需额外配置）
npm create vite@latest my-app -- --template react-ts
```

**适用场景：** Vite 生态的现代 Web 应用、需要统一构建管道的项目

---

### Oxlint 🦀

> ⭐ 14k+ | Rust 编写的 JavaScript/TypeScript Linter

**核心优势：**

- 由 Oxc 团队出品，与 Rolldown / Oxc 共享 Rust 解析内核
- 比 ESLint 快 **50-100 倍**（无需插件解析开销）
- 内置 400+ 规则，覆盖 ESLint 推荐规则与 TypeScript 特定规则
- 零配置开箱即用，支持 `.eslintignore` 兼容模式

**TS 支持度：** ⭐⭐⭐⭐⭐ 完美

- 原生解析 TypeScript、TSX、JSX
- 类型感知规则（如 `no-floating-promises`）正在快速补充

```bash
# 零配置扫描整个项目
npx oxlint .

# 集成到 CI（并行执行，通常 <1s）
npx oxlint . --format github
```

**适用场景：** CI 快速 Lint、替代 ESLint 的纯校验场景、与 Biome 搭配使用

---

### Biome 1.x 🛠️

> ⭐ 18k+ | Rust 编写的统一工具链（Format + Lint + Import Sort）

**核心优势：**

- **All-in-One**：格式化（Prettier 兼容）、Lint、Import 排序、代码修复，单一配置
- 比 Prettier 快 **10-15 倍**，比 ESLint 快 **20-30 倍**
- 原生支持 TypeScript、TSX、JSON、CSS、GraphQL
- 1.x 版本（2025 年发布）引入**插件系统**（基于 WASM/GJS），弥补早期扩展性不足

**TS 支持度：** ⭐⭐⭐⭐⭐ 完美

- 格式化与 Lint 均原生支持 TypeScript 最新语法（含 Stage 3 装饰器）
- 类型感知 Lint 规则（`noUnusedVariables`、`useExhaustiveDependencies`）

```bash
# 初始化配置
npx @biomejs/biome init

# 格式化 + Lint + 自动修复
npx @biomejs/biome check --write .

# 仅作为 Prettier 替代
npx @biomejs/biome format --write .
```

**适用场景：** 追求极简工具链的项目（用 Biome 替代 Prettier + ESLint）、Monorepo 统一代码风格

---

## 转译工具对比

| 工具 | ⭐ Stars | 语言 | 特点 | TS支持 |
|------|---------|------|------|--------|
| [SWC](https://swc.rs/) | 30k+ | Rust | 极速编译，Babel 替代 | ✅ 原生 |
| [Babel](https://babeljs.io/) | 43k+ | JavaScript | 生态成熟，可配置性强 | ✅ 插件 |
| [Sucrase](https://github.com/alangpierce/sucrase) | 6k+ | JavaScript | 超快开发构建，放弃旧浏览器支持 | ✅ 内置 |

### SWC 🦀

> ⭐ 30k+ | Rust 编写的下一代编译器

**核心优势：**

- 比 Babel 快 20-70 倍
- 由 Vercel 赞助，Next.js 默认使用
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

## 选型建议

### 新项目选型

| 项目类型 | 推荐工具 | 理由 |
|---------|---------|------|
| 现代 Web 应用 | **Vite** | 开发体验最佳，生态成熟 |
| Next.js 项目 | **Turbopack** | 官方支持，性能最优 |
| 库/组件开发 | **tsup** / **Rollup** | 输出质量高，配置简单 |
| Node.js 工具 | **esbuild** / **Bun** | 构建速度极快 |
| 全栈应用 | **Bun** | 一体化工具链 |

### 迁移建议

| 现状 | 推荐迁移目标 | 迁移成本 |
|------|-------------|---------|
| Webpack 项目 | **Rspack** | 低（配置兼容） |
| CRA 项目 | **Vite** | 中 |
| Rollup 项目 | **Rolldown**（未来） | 待定 |

### TypeScript 项目配置建议

1. **开发环境**：使用 Vite + SWC（最快 HMR）
2. **生产构建**：Vite 默认使用 Rollup，可替换为 Rolldown（未来）
3. **库发布**：使用 tsup 或 unbuild 进行多格式输出
4. **类型检查**：独立运行 `tsc --noEmit`，不阻塞构建
5. **Monorepo**：pnpm + Turborepo 是 2025 年黄金组合

---

## 趋势展望

1. **Rust 化**：Rspack、Farm、Rolldown、Turbopack 均采用 Rust 编写，追求极致性能
2. **原生 TS 支持**：所有现代工具都内置 TypeScript 支持，无需额外配置
3. **统一工具链**：Bun 代表的一体化趋势，减少工具碎片化
4. **ESM 优先**：原生 ESM 支持成为标配
5. **Vite 生态**：Rolldown 未来将成为 Vite 底层，带来更大性能提升

## 相关阅读

- [JS/TS 编译器与转译器对比矩阵](../comparison-matrices/js-ts-compilers-compare.md)
- [JS_TS_语言语义模型全面分析](../../JSTS全景综述/JS_TS_语言语义模型全面分析.md)
