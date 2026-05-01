# TypeScript / JavaScript 生态技术全景梳理 2026

> **文档性质**: 技术生态全景梳理（非项目规划）
> **覆盖范围**: 语言层 → 编译层 → 构建层 → 运行时层 → 框架层 → 架构层
> **数据基准**: State of JS 2025, GitHub Octoverse 2025, Stack Overflow 2025, TC39 2025-2026
> **日期**: 2026-05-01

---

## 目录

- [TypeScript / JavaScript 生态技术全景梳理 2026](#typescript--javascript-生态技术全景梳理-2026)
  - [目录](#目录)
  - [一、语言层：TypeScript \& JavaScript](#一语言层typescript--javascript)
    - [1.1 TypeScript 历史性登顶](#11-typescript-历史性登顶)
    - [1.2 Node.js v25 Type Stripping — TypeScript 原生执行时代](#12-nodejs-v25-type-stripping--typescript-原生执行时代)
    - [1.3 tsgo / Project Corsa — TypeScript 编译器革命](#13-tsgo--project-corsa--typescript-编译器革命)
    - [1.4 ECMAScript 2025/2026 语言特性](#14-ecmascript-20252026-语言特性)
    - [1.5 TypeScript 语言演进](#15-typescript-语言演进)
  - [二、编译层：从 tsc 到 tsgo](#二编译层从-tsc-到-tsgo)
    - [2.1 编译器全景对比](#21-编译器全景对比)
    - [2.2 类型检查 vs 转译分离趋势](#22-类型检查-vs-转译分离趋势)
  - [三、构建层：Rust 工具链全面统治](#三构建层rust-工具链全面统治)
    - [3.1 构建工具格局剧变](#31-构建工具格局剧变)
    - [3.2 Rust 工具链矩阵](#32-rust-工具链矩阵)
    - [3.3 Rolldown — Vite 的未来打包器](#33-rolldown--vite-的未来打包器)
    - [3.4 Oxc — JavaScript 氧化编译器](#34-oxc--javascript-氧化编译器)
    - [3.5 Biome — 统一工具链](#35-biome--统一工具链)
    - [3.6 选型决策树](#36-选型决策树)
  - [四、运行时层：Node / Bun / Deno / Edge](#四运行时层node--bun--deno--edge)
    - [4.1 后端运行时格局](#41-后端运行时格局)
    - [4.2 Node.js — 仍是王者，但正在变化](#42-nodejs--仍是王者但正在变化)
    - [4.3 Bun — 高性能一体化运行时](#43-bun--高性能一体化运行时)
    - [4.4 Deno — 安全优先的 Web 标准运行时](#44-deno--安全优先的-web-标准运行时)
    - [4.5 Cloudflare Workers — 爆发中的 Edge 运行时](#45-cloudflare-workers--爆发中的-edge-运行时)
    - [4.6 其他 Edge 运行时](#46-其他-edge-运行时)
    - [4.7 运行时选型矩阵](#47-运行时选型矩阵)
  - [五、框架层：元框架与前端格局](#五框架层元框架与前端格局)
    - [5.1 前端框架稳定化](#51-前端框架稳定化)
    - [5.2 React 19 与生态系统](#52-react-19-与生态系统)
    - [5.3 元框架格局](#53-元框架格局)
    - [5.4 后端/全栈框架](#54-后端全栈框架)
    - [5.5 新兴框架模式](#55-新兴框架模式)
  - [六、架构层：Edge-First 与 AI-Native](#六架构层edge-first-与-ai-native)
    - [6.1 Edge-First 架构原理](#61-edge-first-架构原理)
    - [6.2 AI-Native 架构原理](#62-ai-native-架构原理)
    - [6.3 WinterCG 标准](#63-wintercg-标准)
  - [七、数据层：Edge Database 与存储](#七数据层edge-database-与存储)
    - [7.1 Edge Database 兴起](#71-edge-database-兴起)
    - [7.2 选型原理](#72-选型原理)
    - [7.3 ORM 格局](#73-orm-格局)
  - [八、AI 层：MCP 与 Agent 基础设施](#八ai-层mcp-与-agent-基础设施)
    - [8.1 MCP (Model Context Protocol)](#81-mcp-model-context-protocol)
    - [8.2 Agent 基础设施](#82-agent-基础设施)
    - [8.3 AI 编码助手格局](#83-ai-编码助手格局)
  - [九、技术栈选型矩阵](#九技术栈选型矩阵)
    - [9.1 按场景推荐](#91-按场景推荐)
    - [9.2 2026 技术雷达](#92-2026-技术雷达)
  - [附录：关键数据时间线](#附录关键数据时间线)

---

## 一、语言层：TypeScript & JavaScript

### 1.1 TypeScript 历史性登顶

**GitHub Octoverse 2025 核心数据**:

- 2025 年 8 月，TypeScript 首次超越 Python 和 JavaScript，成为 GitHub 上使用最多的语言
- TypeScript 贡献者年增长 **+66%**（增加超过 **100 万** 贡献者）
- JavaScript 贡献者增长 **+24.79%**
- Python 贡献者增长 **+48.78%**
- 三者相差仅约 **42,000** 名贡献者

**Stack Overflow 2025 数据**:

- JavaScript: **66%**（仍居第一）
- TypeScript: **43.6%**（同比 +2.5%）
- Python: **57.9%**（同比 +7%，AI 驱动）

**State of JavaScript 2025 数据**:

- **40%** 开发者现在**完全使用 TypeScript**（2024 年 34%，2022 年 28%）
- **仅 6%** 开发者只使用纯 JavaScript
- **78%** 专业开发者在 2026 年使用 TypeScript

**为什么 TypeScript 在 AI 时代胜出？**

GitHub 官方解释：
> "As AI code generation becomes the default way to write code, developers naturally gravitate towards languages that offer better determinism and less ambiguity. TypeScript gives AI the structure it needs to write higher-quality code."

- 研究表明 TypeScript 在 AI 辅助开发中：**90% 更少的 ID 混淆错误**，**3 倍更快的 LLM 收敛速度**
- 2025 年学术研究发现：**94%** 的 LLM 生成编译错误源于类型检查失败
- 所有主流框架（Next.js, Astro, SvelteKit, Angular, Remix）默认生成 TypeScript 代码库

### 1.2 Node.js v25 Type Stripping — TypeScript 原生执行时代

**核心变化**:

- Node.js v25.2.0（2025-11-11）将 TypeScript "type stripping" 提升为 **stable**
- 可直接运行 `.ts` 文件：`node app.ts`
- 无需 `tsconfig.json`，无需编译步骤（仅擦除类型注解）

**技术原理**:

```
Node.js Type Stripping:
1. 读取 .ts 文件
2. 使用 swc 定制版将类型注解替换为空白（保留行号）
3. 直接执行剩余 JavaScript
4. 不进行任何类型检查
```

**限制**:

- 仅支持 "erasable" 语法（类型注解、interface、type alias、泛型）
- 不支持 enum、namespace、parameter properties（这些需要代码生成）
- 使用 `--experimental-transform-types` 可启用非可擦除语法的转换

**TypeScript 5.8 响应**:

- 新增 `--erasableSyntaxOnly` 编译器标志
- 正式将 TypeScript 分为 "erasable TypeScript"（可原生执行）和 "full TypeScript"（需编译）

**推荐 tsconfig.json（Node 25+）**:

```json
{
  "compilerOptions": {
    "noEmit": true,
    "target": "esnext",
    "module": "nodenext",
    "rewriteRelativeImportExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true
  }
}
```

### 1.3 tsgo / Project Corsa — TypeScript 编译器革命

**项目背景**:

- Microsoft TypeScript 团队于 2025 年 11 月发布预览
- 将 TypeScript 编译器和语言服务**移植到 Go**
- 代号 "Project Corsa"，预览包 `@typescript/native-preview`

**性能提升**:

- 类型检查速度：**~10 倍** 提升
- 内存占用：大幅改善
- 编辑器加载时间：数量级改善

**现状**:

- 2026 年下半年进入更广泛测试
- 预计 2027 年可能成为默认编译器选项
- 不改变 TypeScript 语言本身，仅重写编译器实现

**影响**:

- 大型代码库（如 VS Code、Azure）类型检查从分钟级降至秒级
- CI 构建时间大幅缩短
- 与 Oxc 解析器的潜在整合（未来方向）

### 1.4 ECMAScript 2025/2026 语言特性

**ES2025 已确定特性**:

- `Object.groupBy` / `Map.groupBy`
- `Promise.withResolvers`
- `Atomics.waitAsync`
- RegExp `v` flag with set notation

**ES2026 提案中（Stage 3）**:

- **Import Attributes / Import Defer**: `import json from "./data.json" with { type: "json" }`
- **Temporal API**: 替代 Date 的现代时间 API（Chrome 144 已支持）
- **Pattern Matching**: 表达式级模式匹配
- **Records & Tuples**: 不可变数据结构
- **Decorator Metadata**: 装饰器元数据 API

### 1.5 TypeScript 语言演进

**TypeScript 5.8-5.9 关键特性**:

- `--erasableSyntaxOnly`: 强制使用可擦除语法（配合 Node 25）
- `--libReplacement`: 允许替换内置 lib 定义
- `import defer`: 延迟模块加载
- 性能优化：大型联合类型的处理速度提升

**TypeScript 7.0 展望**:

- 预计引入原生类型（非 erasable）的实验性支持
- 可能与 tc39 的类型标注提案对齐

---

## 二、编译层：从 tsc 到 tsgo

### 2.1 编译器全景对比

| 编译器 | 语言 | 定位 | 速度 | 类型检查 | 状态 |
|--------|------|------|------|---------|------|
| **tsc** | TypeScript | 官方编译器 | 基准 | ✅ 完整 | 稳定 |
| **tsgo** | Go | TypeScript 官方 Go 移植 | ~10x tsc | ✅ 完整 | 预览 |
| **Babel** | JavaScript | 转译器 | 中等 | ❌ 无 | 稳定（legacy） |
| **SWC** | Rust | 编译器/转译器 | ~20x tsc | ❌ 无（需插件） | 稳定 |
| **esbuild** | Go | 打包器/转译器 | ~100x tsc | ❌ 无 | 稳定 |
| **Oxc Transformer** | Rust | 转译器 | ~3x SWC | ❌ 无 | 稳定 |

### 2.2 类型检查 vs 转译分离趋势

**行业共识**: 类型检查和代码转译正在彻底分离。

```
传统流水线 (2015-2020):
tsc (类型检查 + 转译 + 生成 .js + .d.ts)

现代流水线 (2024-2026):
类型检查: tsc --noEmit 或 tsgo (开发/CI)
转译:     Oxc / SWC / esbuild (构建)
打包:     Rolldown / Rspack / Turbopack
```

**原因**:

1. 类型检查不需要频繁执行（开发时由 IDE 处理，CI 时一次性检查）
2. 转译需要极速反馈（每次保存都要执行）
3. 分离后每层都可以用最合适的工具

---

## 三、构建层：Rust 工具链全面统治

### 3.1 构建工具格局剧变

**State of JavaScript 2025 数据**:

| 工具 | 使用率 | 满意度 | 趋势 |
|------|--------|--------|------|
| Webpack | 86% | 26% ↓ | 满意度从 36% 下降至 26% |
| **Vite** | 84% | **98%** | 满意度碾压，即将在采用率上超越 Webpack |
| Turbopack | 28% | — | Vercel 赞助的 Rust 增量打包器 |
| **Rolldown** | 10% | — | **从 1% 飙升至 10%**，Rust 编写的 Rollup 替代品 |

**关键信号**:

- Vite 周下载量已于 **2025 年 7 月** 超越 Webpack
- Webpack → Vite 迁移比例 **15:1**（33,966 家公司迁移，仅 2,218 家回退）
- React 团队已于 **2025 年 2 月** 正式废弃 CRA，推荐 Vite

### 3.2 Rust 工具链矩阵

| 工具 | 类型 | 组织 | 状态 | 性能 vs 前身 | 关键采用者 |
|------|------|------|------|-------------|-----------|
| **Rolldown** | 打包器 | VoidZero | v1.0 RC | 10-30x vs Rollup | Vite 8 默认 |
| **Oxc** | 编译器集合 | VoidZero | 多阶段 | 50-100x vs ESLint | Preact, Shopify, ByteDance |
| **Oxlint** | Linter | VoidZero | v1.0 稳定 | 50-100x vs ESLint | Vue.js, Sentry, Hugging Face |
| **Oxfmt** | Formatter | VoidZero | Beta | 30x vs Prettier | 逐步推广 |
| **Biome** | Linter + Formatter | Biomejs | v2.0 Beta | 10x vs ESLint+Prettier | 社区广泛采用 |
| **Rspack** | 打包器 | 字节跳动 | v1.3 稳定 | 5-10x vs Webpack | TikTok, Discord, Microsoft |
| **SWC** | 编译器 | Vercel | 稳定 | 20x vs Babel | Next.js, Vercel |
| **Turbopack** | 打包器 | Vercel | 稳定 | 2-5x vs Webpack | Next.js 16 默认 |

### 3.3 Rolldown — Vite 的未来打包器

**定位**:
Rust 编写的下一代打包器，统一 Vite 的开发和生产构建管道，替代 esbuild + Rollup 组合。

**核心特性**:

- Rollup API 兼容（现有插件无缝迁移）
- esbuild 范围（支持 advanced chunk splitting、CSS bundling）
- Oxc 原生集成（共享解析器、转换器、minifier）
- 多线程并行（Rust 原生并发）

**采用时间线**:

| 时间 | 里程碑 |
|------|--------|
| 2025-05 | Rolldown-Vite Beta 发布 |
| 2025-06 | Vite 7.0 引入 rolldown-vite 包 |
| 2025-11 | Vite 8 Beta 默认使用 Rolldown |
| 2026-01 | Rolldown v1.0 RC |
| 2026-H1 | 成为 Vite 默认生产打包器 |

**性能基准**:

```
大型前端项目生产构建:
- Rollup: 46s
- Rolldown: 6s  (7.7x 提升)
- 内存占用降低高达 100x
```

### 3.4 Oxc — JavaScript 氧化编译器

**架构**:

```
Oxc 工具链
├── Parser      (3x SWC 速度)
├── Transformer (TypeScript/JSX 降级)
├── Minifier    (Alpha)
├── Resolver    (28x 竞争对手)
├── Oxlint      (50-100x ESLint, v1.0 稳定)
└── Oxfmt       (30x Prettier, Beta)
```

**Oxlint 生产采用**:

- Shopify: CI lint 时间从 31s → 499ms
- Airbnb: 126,000 文件分析 7s 完成
- ByteDance / Shopee: 大型代码库每日构建

**与 ESLint 的共存策略**:

```bash
# 大型项目推荐迁移路径
oxlint .  # 基础规则（极速）
eslint . --ext .ts,.tsx  # type-aware 规则（通过 eslint-plugin-oxlint 禁用重叠规则）
```

### 3.5 Biome — 统一工具链

**与 Oxc 的差异**:

| 维度 | Biome | Oxc |
|------|-------|-----|
| 工具形态 | 单一二进制 (linter + formatter) | 独立工具集 |
| 配置方式 | 零配置优先 | 兼容 ESLint/Prettier 配置 |
| Type-aware | Biotype (75-85% ts-eslint 覆盖) | tsgo 驱动 (开发中) |
| 插件系统 | v2.0 引入 GritQL 插件 | 支持 ESLint JS 插件 |
| 适用场景 | 新项目零配置启动 | 现有项目渐进迁移 |

### 3.6 选型决策树

```
新项目?
├── 是 → Vite + Rolldown/Oxc 工具链
│         ├── 需要零配置? → Biome
│         └── 需要最大兼容? → Oxlint + Oxfmt
└── 否 → 遗留项目迁移
          ├── 使用 Webpack? → Rspack (渐进替换)
          ├── 使用 Rollup? → Rolldown
          └── 使用 Babel? → SWC / Oxc Transformer
```

---

## 四、运行时层：Node / Bun / Deno / Edge

### 4.1 后端运行时格局

**State of JavaScript 2025 数据**:

| 运行时 | 使用率 | 变化 |
|--------|--------|------|
| Node.js | **90%** | — |
| Bun | **21%** | +4% YoY |
| Deno | **11%** | — |
| Cloudflare Workers | **12%** | 从 1% 暴增 |

### 4.2 Node.js — 仍是王者，但正在变化

**Node.js v25 关键特性**:

- Type Stripping stable（直接运行 .ts）
- `util.parseArgs` 增强
- 性能优化：Buffer 和 Stream 的内部改进
- 实验性：`import defer` 支持

**Node.js v24 LTS**（2025-11 发布）:

- 支持至 2028-04
- V8 13.6
- npm 11
- Windows 构建切换至 ClangCL

**Node.js 战略地位**:

- 仍是绝对主流（90% 使用率）
- type stripping 使其重新获得「现代感」
- 但 Edge 运行时正在侵蚀其新项目的份额

### 4.3 Bun — 高性能一体化运行时

**定位**: 极速 JavaScript 运行时，内置打包器、测试运行器、包管理器

**核心数据**:

- 周下载量持续增长
- 内置 SQLite 支持
- 与 Node.js API 兼容性持续改善

**优势**:

- 启动速度极快
- 内置 bundler + test runner（一体化）
- `bun install` 比 npm 快 10-100x

**局限**:

- 企业级采用仍谨慎
- 某些 Node.js 生态工具兼容性边缘 case

### 4.4 Deno — 安全优先的 Web 标准运行时

**Deno 2.0**（2024-10 发布）:

- 完整的 Node.js/npm 向后兼容性
- `deno.json` + `package.json` 双配置支持
- 内置权限模型（安全沙箱）

**Deno Deploy**:

- Edge 原生部署平台
- Web 标准优先（fetch、Request/Response）
- 与 Deno CLI 完全一致的开发体验

### 4.5 Cloudflare Workers — 爆发中的 Edge 运行时

**核心数据**:

- State of JS 2025 使用率从 **1% → 12%**
- 300+ 全球 Edge 节点
- 冷启动 **<1ms**（V8 Isolates 技术）

**技术原理**:

```
传统 Serverless (Lambda):
容器启动 → 加载运行时 → 执行代码 = 100ms-1s 冷启动

Cloudflare Workers:
V8 Isolate 切换 → 执行代码 = <1ms 冷启动
```

**WinterCG 标准**:

- Workers 运行时为 WinterCG 兼容
- 使用标准 Web API：fetch、Request/Response、URL、Headers、Crypto
- 不使用 Node.js 特有 API（fs、http、require）

**与 Node.js 的差异**:

| 维度 | Node.js | Cloudflare Workers |
|------|---------|-------------------|
| 冷启动 | 100ms+ | <1ms |
| 全局位置 | 单区域 | 300+ 城市 |
| API 风格 | Node.js 特有 | Web 标准 (WinterCG) |
| 执行时间 | 无限制 | 30s (付费) |
| 内存限制 | 无限制 | 128MB |
| 成本模型 | 按实例时间 | 按 CPU 时间 |

### 4.6 其他 Edge 运行时

| 平台 | 特点 |
|------|------|
| **Vercel Edge Functions** | Next.js 原生集成，V8 Isolates |
| **Deno Deploy** | Web 标准优先，50ms CPU (免费) |
| **Netlify Edge Functions** | Deno 驱动，与 Netlify 生态集成 |
| **AWS Lambda@Edge** | CloudFront 集成，Node.js 运行时 |

### 4.7 运行时选型矩阵

| 场景 | 推荐运行时 | 理由 |
|------|-----------|------|
| 传统后端 API | Node.js 24 LTS | 生态最成熟，type stripping stable |
| 高性能脚本/CLI | Bun | 启动极快，内置工具全 |
| 安全敏感应用 | Deno | 内置权限模型，Web 标准 |
| 全球低延迟 API | Cloudflare Workers | <1ms 冷启动，300+ 节点 |
| Next.js 应用 | Node.js / Edge | Next.js 支持双运行时 |
| AI 推理服务 | Edge (Workers) | 80% AI 推理正在向 Edge 迁移 |

---

## 五、框架层：元框架与前端格局

### 5.1 前端框架稳定化

**State of JavaScript 2025 数据**:

| 框架 | 使用率 | 满意度 | 评价 |
|------|--------|--------|------|
| **React** | 83.6% | 下降中 | "框架疲劳"显著 |
| **Next.js** | 59% | 17% 负面 | 复杂度剧增，Vercel 锁定争议 |
| **Astro** | — | **元框架满意度 #1** | 领先 Next.js 39 个百分点 |
| **Solid.js** | — | **连续五年最高满意度** | 性能极致 |
| **Vue** | — | 93% 留存率 | 生态稳定 |
| **Svelte** | — | 高满意度 | Svelte 5 引入 Runes |

**关键洞察**: "框架战争结束"——开发者平均职业生涯仅使用 **2.6 个前端框架**。

### 5.2 React 19 与生态系统

**React 19 核心特性**:

- Actions: 异步过渡的原生支持
- useOptimistic: 乐观更新 Hook
- useFormStatus: 表单状态追踪
- Server Components: 稳定化
- Partial Pre-rendering: 混合渲染策略

**React 战略地位**:

- 使用率仍最高（83.6%），但满意度下降
- "React 疲劳"成为社区关键词
- 开发者抱怨：学习曲线陡、概念过多（Server Components、Suspense、Cache 等）

### 5.3 元框架格局

| 元框架 | 基础框架 | 构建工具 | 部署目标 | 特点 |
|--------|---------|---------|---------|------|
| **Next.js** | React | Turbopack (Vercel) | Node/Edge | 功能最全，但复杂度最高 |
| **Nuxt** | Vue | Vite | Node/Edge | 生态完整，体验一致 |
| **SvelteKit** | Svelte | Vite | Node/Edge | 极简，性能极致 |
| **Astro** | 多框架 | Vite | Node/Edge | 内容优先，满意度最高 |
| **Remix** | React | Vite | Node/Edge | 渐进增强，React Router v7 合并 |
| **TanStack Start** | React | Vite | Node/Edge | 全类型安全，File Routes |
| **SolidStart** | Solid | Vite | Node/Edge | 性能极致 |

### 5.4 后端/全栈框架

| 框架 | 运行时 | 特点 |
|------|--------|------|
| **Hono** | Node/Bun/Deno/Edge | 超轻量，WinterCG 兼容，性能极致 |
| **Elysia** | Bun | 类型安全端到端，Bun 原生优化 |
| **Nitro** | Node/Bun/Deno/Edge | Nuxt 底层，多运行时统一 |
| **Express** | Node | 传统，使用率仍高但创新停滞 |
| **Fastify** | Node | 性能优秀，插件生态丰富 |
| **NestJS** | Node | 企业级，Angular 风格 |

**Hono 的崛起**:

- 32,000+ GitHub Stars
- 35M+ 周下载量
- 同一套代码跑在 Node/Bun/Deno/Cloudflare Workers
- 被 Cloudflare 官方推荐

### 5.5 新兴框架模式

**AI-Native 框架**:

- **v0**: Vercel 的 "提示即组件" 平台
- **Bolt.new**: StackBlitz 的 "提示即应用" 平台
- **Mastra**: TypeScript AI Agent 框架（MCP 原生支持）
- **Vercel AI SDK**: 流式 AI UI 组件

---

## 六、架构层：Edge-First 与 AI-Native

### 6.1 Edge-First 架构原理

**传统中心化架构的问题**:

```
用户(东京) → 请求 → AWS us-east-1 (弗吉尼亚)
                ← 响应 ←
往返延迟: 150-300ms
```

**Edge-First 架构**:

```
用户(东京) → 请求 → Cloudflare Edge (东京节点)
                ← 响应 ←
延迟: <50ms
```

**Edge 适用场景**:

- 认证/授权检查
- A/B 测试
- 个性化内容
- API 路由
- 地理位置服务
- 速率限制
- **AI 推理**（80% 正在向 Edge 迁移）

### 6.2 AI-Native 架构原理

**从 "AI 辅助" 到 "AI-Native" 的范式转移**:

| 维度 | AI 辅助 (2023-2024) | AI-Native (2025-2026) |
|------|-------------------|----------------------|
| 交互模式 | 代码补全 | 自主 Agent |
| 代码占比 | 10-20% | 29% 且持续增长 |
| 开发角色 | 写代码 | 审代码 + 架构设计 |
| 工具形态 | Copilot 插件 | Cursor/Claude Code IDE |
| 协议 | 各家私有 | MCP 标准化 |

**AI-Native 技术栈**:

```
应用层: React/Vue + Vercel AI SDK + 流式 UI
API 层: Hono + Cloudflare Workers + AI 推理绑定
数据层: D1 + Vectorize (向量数据库)
AI 层: Claude/GPT + MCP Server + Agent 工作流
```

### 6.3 WinterCG 标准

**定义**: Web-interoperable Runtimes Community Group，定义非浏览器环境下的 Web 标准子集。

**核心 API**:

- `fetch`, `Request`, `Response`, `Headers`
- `URL`, `URLSearchParams`
- `Crypto` (Web Crypto API)
- `structuredClone`
- `TextEncoder` / `TextDecoder`
- `console`

**意义**: 一套代码可以在 Node.js (实验性)、Deno、Cloudflare Workers、Vercel Edge 上运行。

---

## 七、数据层：Edge Database 与存储

### 7.1 Edge Database 兴起

| 数据库 | 提供商 | 类型 | 特点 |
|--------|--------|------|------|
| **Cloudflare D1** | Cloudflare | SQLite | 全球复制，Workers 原生绑定 |
| **Turso** | libSQL | SQLite | Edge 原生 SQLite 分支，Git 式复制 |
| **Neon** | Neon | PostgreSQL | 无服务器 PG，分支即复制 |
| **PlanetScale** | PlanetScale | MySQL | MySQL 兼容，无服务器 |
| **Supabase** | Supabase | PostgreSQL | PG 即服务，实时订阅 |

### 7.2 选型原理

**SQLite at Edge 的优势**:

- 零配置，单文件数据库
- 极小资源占用（适合 Workers 128MB 限制）
- 读密集型工作负载表现极佳
- 全球复制延迟低

**PostgreSQL at Edge 的优势**:

- 完整关系型数据库功能
- 向量扩展（pgvector）支持 AI 应用
- 复杂查询和事务支持

### 7.3 ORM 格局

| ORM | 特点 | Edge 兼容 |
|-----|------|----------|
| **Drizzle** | 类型安全，SQL-like API，极小体积 | ✅ 完美兼容 |
| **Prisma** | 功能最全，生态最大 | ⚠️ 需要 Prisma Accelerate |
| **Mongoose** | MongoDB 专用 | ❌ 不适合 Edge |
| **TypeORM** | 装饰器风格，企业级 | ⚠️ 体积大 |

**推荐**: Edge 场景优先 Drizzle，Node 场景 Drizzle/Prisma 均可。

---

## 八、AI 层：MCP 与 Agent 基础设施

### 8.1 MCP (Model Context Protocol)

**定义**: 由 Anthropic 于 2024 年 11 月提出的开放标准，用于统一 AI 应用与外部工具、数据源的连接方式。

**核心原语**:

```
MCP Architecture:
├── Resources (GET)  — 只读数据上下文
├── Tools (POST)     — 可执行函数（副作用）
├── Prompts          — 标准化工作流模板
├── Roots            — 客户端提供的上下文根
└── Sampling         — 服务器请求的 LLM 推理
```

**行业采纳**:

| 时间 | 里程碑 |
|------|--------|
| 2024-11 | Anthropic 发布 MCP 规范 |
| 2025-03 | OpenAI 宣布全面支持 MCP |
| 2025-12 | 捐赠至 Linux Foundation (Agentic AI Foundation) |
| 2026-04 | **97M+ 月 SDK 下载**，5800+ MCP Servers |

**价值**: AI 工具（Cursor、Claude、ChatGPT）可通过 MCP 直接查询数据库、调用 API、读取文档。

### 8.2 Agent 基础设施

**Agent 框架对比**:

| 框架 | 语言 | 特点 |
|------|------|------|
| **Mastra** | TypeScript | 工作流编排，MCP 原生，Vercel 生态 |
| **Vercel AI SDK** | TypeScript | 流式 UI，多模型支持 |
| **LangChain** | Python/TS | 生态最大，但复杂度高 |
| **CrewAI** | Python | 多 Agent 协作 |
| **OpenAI Agents SDK** | Python | OpenAI 官方，简单直接 |

**Agent 工作流模式**:

1. **ReAct**: 推理 → 行动 → 观察 → 循环
2. **Plan-and-Solve**: 先规划步骤，再执行
3. **Multi-Agent**: 多个专用 Agent 协作（如研究员 + 写手 + 审查员）

### 8.3 AI 编码助手格局

| 工具 | 2025 使用率 | 模式 | 特点 |
|------|------------|------|------|
| ChatGPT | 60% | 对话 | 通用，但代码上下文有限 |
| Claude | 44% | 对话/Agent | 代码生成质量最高 |
| Cursor | 26% | AI 原生 IDE | 跨文件编辑，终端集成 |
| GitHub Copilot | ~55% | IDE 插件 | 80% 新用户首周使用 |

**趋势**: 从"代码补全"转向"自主 Agent"（Copilot Agent 模式、Claude Code、Cursor Composer）。

---

## 九、技术栈选型矩阵

### 9.1 按场景推荐

| 场景 | 2026 推荐栈 | 关键组件 |
|------|------------|---------|
| 内容型网站 (博客/文档/营销) | Astro + Vite + Edge DB | 岛屿架构，零 JS 默认 |
| 交互式 Web 应用 | React/Next.js + Vite + TypeScript | Server Components + Actions |
| 性能关键项目 | Svelte 5 + SvelteKit | Runes 响应式，无虚拟 DOM |
| Vue 生态团队 | Nuxt + Vite + TypeScript | 全栈一致体验 |
| 全栈 API | Hono + Drizzle + Edge | WinterCG 兼容，全球低延迟 |
| AI Agent 应用 | Mastra + MCP SDK + Vercel | Agent 工作流 + 流式 UI |
| 实时协作 | PartyKit + Yjs + Edge | WebSocket 替代方案 |
| 桌面应用 | Tauri + React/Vue | Rust 后端，极小体积 |
| 移动端 | Expo + React Native | 新架构 (Fabric/TurboModules) |

### 9.2 2026 技术雷达

**采纳（Adopt）**:

- TypeScript 5.9 + Node 24 type stripping
- Vite 6/7 + Rolldown
- Oxlint
- Hono
- Drizzle ORM
- Cloudflare Workers
- MCP Protocol

**试验（Trial）**:

- tsgo / Project Corsa
- Oxfmt
- Biome v2
- AI-Native 框架 (Mastra, v0)
- Edge Database (D1, Turso)

**评估（Assess）**:

- A2A (Agent-to-Agent) 协议
- WebContainers 生产化
- 本地小模型 (Ollama + Llama 3.3)
- Temporal API 全面支持

**暂缓（Hold）**:

- Webpack（新项目）
- Create React App
- Babel（新项目转译）
- 传统 centralized serverless (Lambda)

---

## 附录：关键数据时间线

| 时间 | 事件 |
|------|------|
| 2025-08 | TypeScript 首次登顶 GitHub 语言榜 |
| 2025-11 | Node.js v25.2 type stripping stable; tsgo 预览发布 |
| 2025-11 | Deno 2.3 发布 |
| 2025-12 | MCP 捐赠 Linux Foundation |
| 2026-01 | Rolldown v1.0 RC |
| 2026-02 | State of JS 2025 结果公布 |
| 2026-03 | Vite 8 Beta (Rolldown 默认) |
| 2026-04 | 当前时间点 |

---

> **文档状态**: 技术全景梳理完成
> **用途**: 作为项目内容更新、架构选型和趋势判断的基准输入
