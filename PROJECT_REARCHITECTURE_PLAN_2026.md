# Awesome JS/TS Ecosystem 知识库 — 2026 全面重构规划文档

> **文档性质**: 架构级重构规划
> **版本**: v1.0
> **日期**: 2026-05-01
> **对齐趋势**: State of JS 2025, GitHub Octoverse 2025, Stack Overflow 2025, ECMAScript 2025/2026
> **目标版本**: 从 v5.0 演进至 v6.0 "AI-Native Edge-First"

---

## 目录

- [Awesome JS/TS Ecosystem 知识库 — 2026 全面重构规划文档](#awesome-jsts-ecosystem-知识库--2026-全面重构规划文档)
  - [目录](#目录)
  - [一、重构背景与驱动力](#一重构背景与驱动力)
    - [1.1 现状诊断](#11-现状诊断)
    - [1.2 重构驱动力](#12-重构驱动力)
  - [二、十大趋势 → 架构映射原理](#二十大趋势--架构映射原理)
    - [2.1 映射方法论](#21-映射方法论)
    - [2.2 逐条映射详述](#22-逐条映射详述)
      - [趋势 1: TypeScript 成为 GitHub #1 语言](#趋势-1-typescript-成为-github-1-语言)
      - [趋势 2: Vite 超越 Webpack](#趋势-2-vite-超越-webpack)
      - [趋势 3: Rust 工具链统治构建层](#趋势-3-rust-工具链统治构建层)
      - [趋势 4: AI 编码成为默认](#趋势-4-ai-编码成为默认)
      - [趋势 5: Edge 成为默认架构](#趋势-5-edge-成为默认架构)
      - [趋势 6: 框架战争结束](#趋势-6-框架战争结束)
      - [趋势 7: MCP 协议标准化](#趋势-7-mcp-协议标准化)
      - [趋势 8: tsgo 预示编译器革命](#趋势-8-tsgo-预示编译器革命)
      - [趋势 9: Cloudflare Workers 爆发](#趋势-9-cloudflare-workers-爆发)
      - [趋势 10: 开发者疲劳](#趋势-10-开发者疲劳)
  - [三、目标架构设计](#三目标架构设计)
    - [3.1 架构总览](#31-架构总览)
    - [3.2 分层职责](#32-分层职责)
    - [3.3 核心数据流](#33-核心数据流)
  - [四、框架与工具链选型](#四框架与工具链选型)
    - [4.1 选型原则](#41-选型原则)
    - [4.2 逐层选型](#42-逐层选型)
      - [文档站点层](#文档站点层)
      - [代码层](#代码层)
      - [运行时层](#运行时层)
      - [后端/服务层](#后端服务层)
      - [AI 层](#ai-层)
      - [部署层](#部署层)
    - [4.3 技术栈全景图](#43-技术栈全景图)
  - [五、内容体系重构原理](#五内容体系重构原理)
    - [5.1 重构核心思想](#51-重构核心思想)
    - [5.2 内容单元标准化](#52-内容单元标准化)
    - [5.3 六层架构演进](#53-六层架构演进)
    - [5.4 新增核心专题原理](#54-新增核心专题原理)
      - [专题: AI-Native 开发](#专题-ai-native-开发)
      - [专题: Rust 工具链](#专题-rust-工具链)
      - [专题: Edge-First 架构](#专题-edge-first-架构)
      - [专题: TypeScript 原生执行](#专题-typescript-原生执行)
  - [六、产品形态演进](#六产品形态演进)
    - [6.1 从「文档库」到「知识平台」的演进原理](#61-从文档库到知识平台的演进原理)
    - [6.2 产品形态矩阵](#62-产品形态矩阵)
    - [6.3 MCP Server 产品化原理](#63-mcp-server-产品化原理)
    - [6.4 实时趋势 Dashboard 原理](#64-实时趋势-dashboard-原理)
  - [七、实施路线图](#七实施路线图)
    - [7.1 总体节奏](#71-总体节奏)
    - [7.2 Phase A: 基础重构（Q2 2026）](#72-phase-a-基础重构q2-2026)
    - [7.3 Phase B: AI 转型（Q3 2026）](#73-phase-b-ai-转型q3-2026)
    - [7.4 Phase C: Edge 部署（Q4 2026）](#74-phase-c-edge-部署q4-2026)
    - [7.5 Phase D: 平台化（Q1 2027）](#75-phase-d-平台化q1-2027)
  - [八、风险评估与回退策略](#八风险评估与回退策略)
    - [8.1 技术风险](#81-技术风险)
    - [8.2 内容风险](#82-内容风险)
    - [8.3 回退策略](#83-回退策略)
  - [附录 A: 关键术语表](#附录-a-关键术语表)
  - [附录 B: 参考数据源](#附录-b-参考数据源)

---

## 一、重构背景与驱动力

### 1.1 现状诊断

本项目当前为「静态 Markdown 知识库 + VitePress 文档站点」形态，核心指标：

| 维度 | 现状 | 问题 |
|------|------|------|
| 技术形态 | 静态文档生成 (SSG) | 无交互、无个性化、无实时数据 |
| 构建工具 | VitePress 1.5 + Rollup/esbuild | 未利用 Rolldown/Oxc 等 Rust 工具链红利 |
| 运行时覆盖 | 仅 Node.js 22 | 缺失 Bun/Deno/Edge 三运行时 |
| 内容生产 | 100% 人工撰写 | 趋势报告滞后、对比矩阵易过时 |
| 用户交互 | 只读文档 | 无代码演练、无 AI 问答、无选型助手 |
| 部署方式 | 中心化托管 (Vercel) | 未利用 Edge 网络，全球访问延迟不均 |
| 对外接口 | 无 | AI 工具无法直接查询本知识库 |

### 1.2 重构驱动力

**外部驱动力（十大趋势）**：

1. **TypeScript 登顶 GitHub #1**：知识库必须彻底 TS-First，所有示例、所有文档以 TypeScript 为默认语言
2. **Vite/Rolldown 统治构建层**：项目自身构建必须采用最新工具链，否则失去技术公信力
3. **Rust 工具链全面崛起**：ESLint → Oxlint、Prettier → Oxfmt、tsc → tsgo 的代际更替已经开始
4. **AI 编码成为默认**：内容生产方式必须从「人工撰写」演进为「AI 辅助生成 + 人工审核」
5. **Edge 成为默认架构**：文档站点的访问体验必须通过 Edge 网络优化
6. **框架战争结束**：内容组织方式必须从「框架对比」演进为「场景选型」
7. **MCP 协议标准化**：知识库可以暴露为标准接口，成为 AI 工具的「外脑」
8. **tsgo 编译器革命**：代码实验室的编译速度将迎来 10x 提升
9. **Cloudflare Workers 爆发**：后端示例必须覆盖 Edge 运行时
10. **开发者疲劳**：用户需要「按需获取」而非「阅读全站」，AI 驱动的个性化成为刚需

**内部驱动力**：

- 43,000+ 文件的管理复杂度已超过纯人工维护的极限
- 代码实验室 87 个模块中 41% 缺少 THEORY.md，理论-实践断层严重
- 对比矩阵中的版本号、Stars 数据每月都在过时
- 网站首页的「213 个收录库」等数据为静态硬编码，无法反映实时生态

---

## 二、十大趋势 → 架构映射原理

### 2.1 映射方法论

每条趋势不只是一个「内容更新点」，而是对知识库**技术栈、内容形态、产品模式**的结构性要求。映射遵循以下原理：

```
趋势识别 → 影响面分析 → 架构响应 → 内容响应 → 产品响应
    ↑___________________________________________________↓
                        (反馈闭环)
```

### 2.2 逐条映射详述

#### 趋势 1: TypeScript 成为 GitHub #1 语言

**影响面**: 内容层 + 代码层
**架构响应**:

- 所有代码实验室示例的默认文件扩展名从 `.js` 改为 `.ts`
- 所有文档中的代码块默认使用 TypeScript 语法高亮
- 引入 Node.js v25 的 stable type stripping，展示「无编译直接运行 TS」的新范式
- 纯 JavaScript 示例标注为 `// JavaScript (legacy)`，明示其历史地位

**原理**: GitHub Octoverse 2025 显示 TS 贡献者增长 66%，Python 48%，JS 仅 24%。AI 辅助开发中，TS 的类型约束使 LLM 生成错误减少 90%。知识库作为技术风向标，必须率先完成 TS-First 转型。

#### 趋势 2: Vite 超越 Webpack

**影响面**: 构建层 + 示例层
**架构响应**:

- 文档站点构建器升级至 VitePress 1.6 + Rolldown
- 所有前端示例移除 Webpack/CRA 配置，统一为 Vite
- 引入 `rolldown-vite` 实验包，实测并展示构建速度提升数据

**原理**: State of JS 2025 显示 Vite 满意度 98% vs Webpack 26%。Vite 的周下载量已于 2025-07 超越 Webpack。知识库若继续使用 Webpack 示例，将失去对用户的参考价值。

#### 趋势 3: Rust 工具链统治构建层

**影响面**: 构建层 + CI 层 + 内容层
**架构响应**:

- Linter: ESLint → Oxlint (50-100x 提速)
- Formatter: Prettier → Oxfmt (30x 提速，待 Beta 成熟)
- Bundler: Rollup → Rolldown (10-30x 提速)
- Transformer: Babel/SWC → Oxc Transformer
- 内容层: 新增「Rust 工具链迁移」专题模块

**原理**: Rust 工具链不是「可选项」，而是「代际更替」。VoidZero (Evan You) 已融资 $17.1M，Rolldown 将成为 Vite 默认打包器。知识库必须率先完成自身工具链的 Rust 化，才能保持技术公信力。

#### 趋势 4: AI 编码成为默认

**影响面**: 内容生产层 + 产品层 + 交互层
**架构响应**:

- 内容生产: 引入 Claude API 辅助生成对比矩阵、趋势摘要、迁移指南
- 产品层: 在文档站点集成 AI 问答助手（基于知识库内容 RAG）
- 交互层: 代码实验室集成 AI 解释功能（选中代码 → AI 解释原理）

**原理**: 29% 代码由 AI 生成，开发者核心技能从「写代码」转向「审代码」。知识库的价值不再是「教语法」，而是「教判断」——判断 AI 生成的代码是否安全、可维护、架构合理。

#### 趋势 5: Edge 成为默认架构

**影响面**: 部署层 + 示例层
**架构响应**:

- 文档站点从 Vercel 迁移至 Cloudflare Pages（300+ 节点）
- 后端 API 示例必须同时提供 Node.js 版本和 Edge (WinterCG) 版本
- 引入 Cloudflare D1 (SQLite at Edge) 作为示例数据库
- 所有部署相关指南默认推荐 Edge 优先

**原理**: Edge Computing CAGR ~28%，Cloudflare Workers 使用率从 1% 跃升至 12%。传统 centralized server 的 50-300ms 延迟已无法满足现代应用要求。知识库必须将 Edge 作为「默认」而非「进阶」。

#### 趋势 6: 框架战争结束

**影响面**: 内容组织层
**架构响应**:

- 重构分类体系: 从「按框架分类」改为「按场景 + 运行时分类」
- 对比矩阵的维度从「框架 A vs 框架 B」改为「场景 X 下的最优技术栈」
- 新增「元框架选型决策树」，以 Next.js/Nuxt/Astro/SvelteKit 为选项而非对立面

**原理**: State of JS 2025 显示开发者平均职业生涯仅使用 2.6 个前端框架。「频繁切换框架」的神话已破灭。知识库应帮助开发者在正确场景选择正确工具，而非制造选择焦虑。

#### 趋势 7: MCP 协议标准化

**影响面**: 产品层 + API 层
**架构响应**:

- 将知识库暴露为 MCP Server (`@awesome-jsts/mcp-server`)
- AI 工具 (Cursor/Claude/ChatGPT) 可通过 MCP 直接查询本知识库
- 每个分类、每个对比矩阵、每个代码实验室都提供 MCP Resource 定义

**原理**: MCP 已成为 AI 与外部系统的「USB-C」。97M+ 月 SDK 下载，OpenAI/Google/Microsoft 均已采纳。知识库若不提供 MCP 接口，将被 AI 工具生态隔离。

#### 趋势 8: tsgo 预示编译器革命

**影响面**: 构建层 + 内容层
**架构响应**:

- 在独立分支测试 Microsoft 的 tsgo (Project Corsa) 预览版
- 对比 tsc vs tsgo 在代码实验室上的编译速度和内存占用
- 新增「编译器演进」专题，覆盖 tsc/Babel/SWC/esbuild/tsgo 的全谱系对比

**原理**: tsgo 提供 ~10x 类型检查速度提升，预计 2026-H2 进入更广泛测试。这是 TypeScript 编译器 10 年来最大的架构变革，知识库必须率先覆盖。

#### 趋势 9: Cloudflare Workers 爆发

**影响面**: 示例层 + 部署层
**架构响应**:

- 后端框架示例必须包含 Hono + Cloudflare Workers 版本
- 新增「Edge Database」专题 (D1/Turso/Neon/PlanetScale)
- 代码实验室新增 Workers 部署流水线示例 (wrangler + Vitest)

**原理**: Workers 使用率从 1% → 12%，冷启动 <1ms，成本降低 70%。这是 2025-2026 年增长最快的运行时，知识库必须将其提升至与 Node.js 同等的覆盖度。

#### 趋势 10: 开发者疲劳

**影响面**: 产品层 + 交互层
**架构响应**:

- 引入 AI 驱动的个性化学习路径（根据用户角色/水平推荐内容）
- 首页从「静态分类列表」改为「智能 Dashboard」（实时趋势 + 个性化推荐）
- 对比矩阵提供「一键生成决策报告」功能

**原理**: 开发者幸福感连续 5 年停滞在 3.8/5，"疲劳"成为关键词。知识库不能继续堆砌信息，必须帮助用户「少读多想」——用 AI 过滤噪音，呈现最相关的知识。

---

## 三、目标架构设计

### 3.1 架构总览

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          LAYER 4: 消费层 (Consumption)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ 浏览器访问    │  │ AI 工具查询   │  │ API 调用      │  │ IDE 插件        │  │
│  │ (Pages/SSR)  │  │ (MCP Server) │  │ (REST/JSON)  │  │ (VS Code/Cursor)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                              Edge Network
                                      │
┌──────────────────────────────────────────────────────────────────────────────┐
│                          LAYER 3: 服务层 (Services)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ VitePress    │  │ Cloudflare   │  │ AI Search    │  │ Real-time       │  │
│  │ 文档站点     │  │ Workers      │  │ Engine       │  │ Dashboard       │  │
│  │ (Rolldown)   │  │ (API/Hono)   │  │ (向量检索)   │  │ (D3 + WebSocket)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
┌──────────────────────────────────────────────────────────────────────────────┐
│                          LAYER 2: 数据层 (Data)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Markdown     │  │ Cloudflare   │  │ KV Cache     │  │ Vector DB       │  │
│  │ 内容源       │  │ D1 (SQLite)  │  │ (趋势缓存)   │  │ (AI 搜索索引)  │  │
│  │ (Git 版本化) │  │ (结构化数据) │  │ (Edge 命中)  │  │ (语义检索)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
┌──────────────────────────────────────────────────────────────────────────────┐
│                          LAYER 1: 生产层 (Production)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ 人工撰写     │  │ AI 辅助生成  │  │ 自动采集     │  │ 社区贡献       │  │
│  │ (核心内容)   │  │ (Claude API) │  │ (npm/GitHub) │  │ (PR + MCP)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 分层职责

**L1 生产层**: 内容来源多元化

- 人工撰写: 核心原理、学术分析、定理证明（不可替代）
- AI 辅助: 对比矩阵填充、趋势摘要、迁移指南草稿
- 自动采集: npm 下载量、GitHub Stars、版本号每日同步
- 社区贡献: 通过 MCP 接口或标准 PR 流程贡献知识

**L2 数据层**: 内容结构化存储

- Markdown: 保持 Git 版本化的核心内容源
- D1: 结构化存储对比矩阵数据、趋势时间序列、包元数据
- KV: Edge 缓存热门查询结果、npm 统计数据的每日快照
- Vector DB: 为 AI 搜索提供语义检索能力

**L3 服务层**: 动态服务能力

- VitePress: 静态文档生成（核心承载层）
- Workers: 动态 API（搜索、趋势查询、MCP 接口）
- AI Search: 基于向量检索的智能问答
- Dashboard: 实时数据可视化

**L4 消费层**: 多端消费

- 浏览器: 主要访问入口
- AI 工具: 通过 MCP 协议消费知识
- API: 第三方系统集成
- IDE 插件: 开发时即时查询

### 3.3 核心数据流

```
[内容生产]
    │
    ├─人工撰写 → Git → Markdown → VitePress 构建 → Cloudflare Pages
    ├─AI 生成 ─┤
    └─自动采集 → D1/KV (结构化存储)
                    │
                    ├─ 实时 Dashboard (D3.js + Workers API)
                    ├─ AI Search (Vector DB + Claude API)
                    └─ MCP Server (Resources + Tools)
```

---

## 四、框架与工具链选型

### 4.1 选型原则

1. **趋势对齐**: 优先选择 State of JS 2025 中满意度 >80% 且增长趋势明确的工具
2. **Edge 兼容**: 所有核心依赖必须能在 WinterCG 标准下运行
3. **Rust 优先**: 构建/编译/Lint/Format 层优先选择 Rust 实现
4. **AI Ready**: 框架必须易于与 LLM/向量检索/MCP 集成
5. **维护可持续**: 选择有商业支持或活跃核心团队的项目

### 4.2 逐层选型

#### 文档站点层

| 组件 | 当前 | 候选方案 | 推荐选择 | 理由 |
|------|------|---------|---------|------|
| 站点框架 | VitePress 1.5 | VitePress 1.6 / Astro 5 / Docusaurus 3 | **VitePress 1.6** | 生态最贴合 Vue/TS，Rolldown 集成最成熟 |
| 构建器 | Rollup + esbuild | Rolldown / Turbopack | **Rolldown** | Vite 官方路线，10-30x 提速 |
| 主题系统 | 自定义 Vue 组件 | 继续使用 | **继续使用** | 迁移成本过高，保持兼容 |
| 搜索 | 本地 MiniSearch | Algolia / 向量搜索 | **渐进升级** | 先保留本地搜索，Q3 引入向量搜索 |

#### 代码层

| 组件 | 当前 | 候选方案 | 推荐选择 | 理由 |
|------|------|---------|---------|------|
| 语言 | TypeScript 5.8 | TypeScript 5.9 / tsgo 预览 | **TS 5.9 + tsgo 分支** | 主分支用稳定版，tsgo 独立测试 |
| Linter | ESLint 9 + ts-eslint | Oxlint / Biome | **Oxlint** | 50-100x 提速，规则覆盖度已达 600+ |
| Formatter | Prettier 3 | Oxfmt / Biome / dprint | **Prettier 3 (过渡)** | Oxfmt 仍为 Alpha，Q3 评估迁移 |
| 测试 | Vitest | 继续使用 | **Vitest + Rolldown-Vite** | 原生支持，无需替换 |
| 类型检查 | tsc | tsgo / stc | **tsc (主) + tsgo (实验)** | tsgo 尚未生产就绪 |

#### 运行时层

| 组件 | 当前 | 候选方案 | 推荐选择 | 理由 |
|------|------|---------|---------|------|
| 主运行时 | Node.js 22 | Node 24 LTS / Bun / Deno | **Node 24 LTS** | type stripping stable，LTS 至 2028 |
| 实验运行时 | 无 | Bun 1.2 / Deno 2.3 | **Bun + Deno (CI 矩阵)** | 覆盖多运行时兼容 |
| Edge 运行时 | 无 | Cloudflare Workers / Deno Deploy | **Cloudflare Workers** | 生态最成熟，300+ 节点 |

#### 后端/服务层

| 组件 | 当前 | 候选方案 | 推荐选择 | 理由 |
|------|------|---------|---------|------|
| Web 框架 | Express (示例) | Hono / Elysia / Nitro | **Hono** | WinterCG 兼容，Edge/Node 双端一致 |
| ORM | Prisma (示例) | Drizzle / Prisma | **Drizzle** | Edge 兼容，无引擎依赖 |
| 数据库 | PostgreSQL (示例) | D1 / Turso / Neon | **D1 + Turso** | SQLite at Edge，全球复制 |
| API 风格 | REST | tRPC / GraphQL / gRPC | **REST + tRPC (渐进)** | 简单场景 REST，复杂场景 tRPC |

#### AI 层

| 组件 | 当前 | 候选方案 | 推荐选择 | 理由 |
|------|------|---------|---------|------|
| LLM 接入 | 无 | Claude / GPT-4o / Gemini | **Claude Sonnet** | 代码生成质量最高，MCP 原生支持 |
| 向量检索 | 无 | Pinecone / Weaviate / pgvector | **Cloudflare Vectorize** | 与 Workers 同生态，延迟最低 |
| MCP SDK | 无 | 官方 TS SDK | **@modelcontextprotocol/sdk** | 协议标准实现 |
| Agent 框架 | 无 | Mastra / LangChain / Vercel AI SDK | **Mastra + Vercel AI SDK** | Mastra 用于工作流，Vercel SDK 用于流式 |

#### 部署层

| 组件 | 当前 | 候选方案 | 推荐选择 | 理由 |
|------|------|---------|---------|------|
| 文档站点 | Vercel | Cloudflare Pages / Netlify | **Cloudflare Pages** | Edge 网络，与 Workers 同生态 |
| API 服务 | 无 | Workers / Deno Deploy / Vercel Edge | **Cloudflare Workers** | 最成熟的 Edge 平台 |
| 数据库 | 无 | D1 / Turso / PlanetScale | **D1 (主) + Turso (备)** | D1 免费额度高，Turso 开源友好 |
| 缓存 | 无 | KV / Redis / Upstash | **Cloudflare KV** | 全球边缘缓存，零延迟读取 |

### 4.3 技术栈全景图

```
┌─────────────────────────────────────────────────────────────┐
│  前端 (浏览器)                                               │
│  VitePress 1.6 + Vue 3.5 + Rolldown + D3.js                │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  服务 (Edge)                                                │
│  Cloudflare Workers + Hono + MCP SDK + Vectorize           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  数据                                                       │
│  D1 (SQLite) + KV + Vector DB + Git (Markdown 源)         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  开发工具链                                                 │
│  Node 24 + pnpm 10 + Oxlint + Prettier + Vitest           │
│  实验: tsgo + Oxfmt + Bun + Deno                          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  AI 层                                                      │
│  Claude API + Mastra + Vercel AI SDK                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 五、内容体系重构原理

### 5.1 重构核心思想

从「技术分类驱动」转向「场景 + 运行时双轴驱动」。

**旧范式的问题**：

- 用户想「做一个博客」，需要在「前端框架」「构建工具」「部署平台」三个分类间跳转
- 对比矩阵比较「React vs Vue」，但现代开发选择「Next.js vs Nuxt vs Astro」
- 示例只提供 Node.js 版本，但用户 increasingly 需要 Edge 版本

**新范式的原理**：

- **场景轴**: 内容型 / 交互型 / API型 / AI原生 / 实时协作
- **运行时轴**: Browser / Node / Edge / Desktop / Mobile / AI Agent
- 每个知识节点都是「场景 × 运行时」矩阵中的一个 cell

### 5.2 内容单元标准化

每个技术主题（如「构建一个博客」）输出以下标准化单元：

```
topic/
├── README.md              # 人类可读指南
├── THEORY.md              # 底层原理分析
├── DECISION.md            # 选型决策树
├── mcp-resources.json     # MCP Resource 定义
├── examples/
│   ├── browser/           # 浏览器端实现
│   ├── node/              # Node.js 实现
│   ├── edge/              # Cloudflare Workers 实现
│   └── ai-agent/          # AI Agent 集成实现
└── data/
    ├── npm-trends.json    # 实时 npm 数据
    └── github-stats.json  # 实时 GitHub 数据
```

### 5.3 六层架构演进

当前六层架构保持不变，但每层内涵升级：

| 层级 | 当前定位 | 新定位 | 升级点 |
|------|---------|--------|--------|
| L1 形式语义 | 学术理论 | **AI-Native 理论层** | 新增「LLM 语义理解」「类型约束与 AI 生成」 |
| L2 代码实验室 | 可运行示例 | **多运行时实验室** | 所有示例提供 Node/Bun/Deno/Edge 四版本 |
| L3 选型决策 | 对比矩阵 | **场景驱动决策** | 从「框架对比」改为「场景最优解」 |
| L4 生态趋势 | 静态报告 | **实时数据层** | 对接 npm/GitHub API，数据每日自动更新 |
| L5 示例项目 | 参考实现 | **生产级模板** | 可直接 `git clone` 并部署的 Starter |
| L6 元数据 | 内容管理 | **AI 生产基础设施** | AI 辅助生成、自动过时检测、MCP 接口 |

### 5.4 新增核心专题原理

#### 专题: AI-Native 开发

**为什么必须新增**:

- AI 编码已成为默认（29% 代码 AI 生成）
- MCP 协议使 AI 工具与开发环境深度集成
- 开发者需要学习「如何与 AI 协作」而非「如何替代 AI」

**内容构成**:

- MCP Server 开发（从协议原理到实现）
- Agent 工作流设计（ReAct、Plan-and-Solve、Multi-Agent）
- AI 辅助代码审查（Prompt 工程 + 类型约束）
- LLM SDK 选型（Vercel AI SDK、Mastra、LangChain）

#### 专题: Rust 工具链

**为什么必须新增**:

- Rust 正在重写 JS 生态的所有基建工具
- 开发者需要迁移指南而非单纯 benchmark
- 知识库自身就是最佳实践案例

**内容构成**:

- Rolldown 迁移（从 Webpack/Rollup/Parcel）
- Oxlint 采用（与 ESLint 的共存策略）
- Oxc 生态系统（Parser/Transformer/Minifier/Formatter）
- Biome 统一工具链（零配置启动）

#### 专题: Edge-First 架构

**为什么必须新增**:

- Edge 已从「酷炫演示」变为「现代 Web 默认架构」
- Cloudflare Workers 使用率 1%→12%，增速最快
- 传统 Node.js 后端知识已不足以指导现代开发

**内容构成**:

- WinterCG 标准详解（fetch、Request/Response、Crypto）
- Hono 全栈开发（Edge 兼容的 Web 框架）
- Edge Database（D1、Turso、Neon、PlanetScale）
- 边缘缓存策略（KV、Cache API）

#### 专题: TypeScript 原生执行

**为什么必须新增**:

- Node.js v25.2 将 type stripping 提升为 stable
- Deno/Bun 早已原生支持 TS
- 「编译步骤」正在从开发体验中消失

**内容构成**:

- Node.js type stripping 实战（erasableSyntaxOnly、--experimental-transform-types）
- tsconfig.json 最小化配置（target: esnext, module: nodenext）
- 从 ts-node/tsx 迁移至原生执行
- tsgo 预览（Project Corsa 的 Go 重写编译器）

---

## 六、产品形态演进

### 6.1 从「文档库」到「知识平台」的演进原理

静态文档库的核心假设：「用户会阅读」。但在信息过载的时代，这个假设已经失效。

知识平台的核心假设：「用户会查询」。平台提供结构化知识 + 智能检索 + 个性化推荐。

### 6.2 产品形态矩阵

| 形态 | 当前 | 目标 | 实现原理 |
|------|------|------|---------|
| **阅读** | 静态 Markdown | 交互式文档 + 代码演练 | WebContainers / StackBlitz SDK |
| **搜索** | 关键词匹配 | 语义搜索 + AI 问答 | Vector DB + Claude API RAG |
| **选型** | 对比表格 | 智能决策助手 | 结构化数据 + 规则引擎 |
| **学习** | 固定路径 | 个性化学习路径 | 用户画像 + 内容推荐 |
| **贡献** | GitHub PR | PR + MCP 接口 | 标准化知识接口 |
| **消费** | 浏览器 | 浏览器 + AI 工具 + IDE | MCP Server + API |

### 6.3 MCP Server 产品化原理

**核心洞察**: AI 工具（Cursor、Claude、ChatGPT）正在成为开发者的主要工作界面。如果知识库不能被这些工具直接消费，其价值将被大大削弱。

**MCP Server 架构**:

```
MCP Client (Cursor/Claude/ChatGPT)
    │
    ├── Resource: category://{category-id}
    │   └── 返回分类的完整知识（框架列表、对比数据、选型建议）
    │
    ├── Resource: matrix://{matrix-id}
    │   └── 返回对比矩阵的结构化数据
    │
    ├── Resource: lab://{lab-id}
    │   └── 返回代码实验室的源码和说明
    │
    ├── Tool: select_framework(scenario, runtime, constraints)
    │   └── 根据场景和约束推荐最优框架
    │
    ├── Tool: compare_packages(packages[])
    │   └── 对比多个 npm 包的下载量、Stars、版本活跃度
    │
    └── Tool: get_trend(topic, timeframe)
        └── 获取指定主题的实时趋势数据
```

**价值主张**:

- 开发者在 Cursor 中问「推荐一个 Edge 友好的 ORM」，AI 直接查询本知识库并给出 Drizzle + 理由
- 不需要开发者离开 IDE 去翻阅文档

### 6.4 实时趋势 Dashboard 原理

**核心洞察**: 生态趋势每天都在变化，静态报告在发布后就已经过时。

**数据来源**:

- npm registry API: 周下载量、版本发布
- GitHub API: Stars 增长、Contributor 活跃度、Release 频率
- State of JS: 年度调查数据（人工校验后录入）
- Stack Overflow Survey: 年度语言/工具采用率

**可视化原理**:

- D3.js 绘制时间序列趋势图
- WebSocket / Server-Sent Events 推送实时更新
- 用户在 Dashboard 上选择「时间范围」「技术领域」「运行时」，动态生成报告

---

## 七、实施路线图

### 7.1 总体节奏

```
Q2 2026 (5-7月)      Q3 2026 (8-10月)      Q4 2026 (11-1月)      Q1 2027 (2-4月)
    │                      │                      │                      │
    ▼                      ▼                      ▼                      ▼
┌─────────┐          ┌─────────┐          ┌─────────┐          ┌─────────┐
│ 基础重构 │    →     │ AI 转型  │    →     │ Edge 部署 │    →     │ 平台化  │
│ Phase A  │          │ Phase B │          │ Phase C  │          │ Phase D │
└─────────┘          └─────────┘          └─────────┘          └─────────┘
```

### 7.2 Phase A: 基础重构（Q2 2026）

**目标**: 完成技术栈升级，建立多运行时 CI 体系

| 周次 | 任务 | 产出 | 验收标准 |
|------|------|------|---------|
| W1-2 | Rolldown 构建迁移 | `website/` 使用 rolldown-vite，构建时间对比报告 | 构建速度提升 ≥30% |
| W1-2 | Oxlint 统一 | 替换 ESLint，配置规则集 | CI lint 步骤通过，零 `continue-on-error` |
| W2-3 | Node 版本统一 | 所有 CI 工作流锁定 Node 24 LTS | `node-version: '20'` 出现次数为 0 |
| W2-3 | 四运行时 CI 矩阵 | GitHub Actions 支持 Node/Bun/Deno/Edge | 后端示例在 4 个运行时上 CI 通过 |
| W3-4 | tsgo 预览分支 | 独立分支测试 tsgo 编译 | 类型检查速度对比报告 |
| W3-4 | 内容 TS-First 化 | 所有示例默认 `.ts`，JS 标注 legacy | 新示例 100% 为 `.ts` |

### 7.3 Phase B: AI 转型（Q3 2026）

**目标**: 建立 AI 辅助内容生产体系，发布 MCP Server v1

| 周次 | 任务 | 产出 | 验收标准 |
|------|------|------|---------|
| W1-2 | AI 内容生成流水线 | `scripts/ai-enhance.js` 自动调用 Claude API | 趋势报告自动生成草稿，人工审核后发布 |
| W2-3 | 新增 AI-Native 专题 | `20.14-ai-native-dev/` 4 个模块 | 每个模块含 THEORY + 示例 + 决策指南 |
| W2-3 | 新增 Rust 工具链专题 | `20.15-rust-toolchain-lab/` 3 个模块 | 含 Rolldown/Oxc/Biome 迁移实战 |
| W3-4 | MCP Server v1 | `packages/mcp-server` 发布 | Cursor/Claude 可通过 MCP 查询本知识库 |
| W4-6 | AI 搜索集成 | VitePress 站点集成向量搜索 | 用户提问 → AI 基于知识库内容回答 |

### 7.4 Phase C: Edge 部署（Q4 2026）

**目标**: 全站迁移至 Cloudflare Edge 网络，完成 Edge 内容覆盖

| 周次 | 任务 | 产出 | 验收标准 |
|------|------|------|---------|
| W1-2 | Cloudflare Pages 迁移 | 文档站点部署至 Cloudflare | 全球 TTFB < 100ms |
| W1-2 | Workers API 服务 | API 路由 (搜索/趋势/MCP) 运行在 Workers | API 响应 < 50ms |
| W2-3 | D1 数据库初始化 | 结构化数据 (对比矩阵/趋势) 存入 D1 | 支持 SQL 查询 |
| W2-4 | 新增 Edge-First 专题 | `20.16-edge-native-api/` 3 个模块 | Hono + Drizzle + D1 完整示例 |
| W4-6 | 实时 Dashboard | 首页集成 npm/GitHub 实时数据 | 数据延迟 < 24h |

### 7.5 Phase D: 平台化（Q1 2027）

**目标**: 完成从文档库到知识平台的转型

| 周次 | 任务 | 产出 | 验收标准 |
|------|------|------|---------|
| W1-2 | WebContainers 集成 | 代码实验室可在浏览器直接运行 | 10 个核心实验支持在线执行 |
| W2-4 | 个性化学习路径 | 根据用户角色推荐内容 | 首页显示个性化推荐卡片 |
| W4-6 | 社区 MCP 贡献 | 外部开发者可通过 MCP 贡献知识 | 收到第一个外部 MCP 贡献 |
| W6-8 | v6.0 发布 | "AI-Native Edge-First" 版本发布 | 全站功能验收通过 |

---

## 八、风险评估与回退策略

### 8.1 技术风险

| 风险 | 概率 | 影响 | 缓解策略 |
|------|------|------|---------|
| Rolldown 尚未稳定 | 中 | 构建失败 | 保留 Rollup 回退配置，切换开关一键回退 |
| tsgo 延期发布 | 高 | 专题内容空缺 | 用现有 tsc 数据填充，tsgo 章节标注 "预览" |
| Oxfmt 不兼容 Prettier | 中 | 格式差异导致大量 diff | 保持 Prettier 为默认，Oxfmt 仅作实验 |
| Cloudflare 服务限制 | 低 | Workers 超时 / D1 容量 | 关键 API 设计为可降级至静态 JSON |
| AI 生成内容质量不稳 | 中 | 内容错误 | 强制人工审核，AI 仅生成草稿 |

### 8.2 内容风险

| 风险 | 概率 | 影响 | 缓解策略 |
|------|------|------|---------|
| 多运行时示例维护成本过高 | 高 | 示例过时/测试失败 | 优先保证 Node + Edge 双版本，Bun/Deno 为实验性 |
| 趋势数据 API 限流 | 中 | 实时 Dashboard 数据中断 | 本地缓存 7 天数据，API 失败时展示缓存 |
| MCP 协议变更 | 低 | Server 接口不兼容 | 封装适配层，协议变更时仅改适配层 |

### 8.3 回退策略

**回退触发条件**:

- Rolldown 构建失败率 > 5% 超过 1 周 → 回退至 Rollup
- Cloudflare Pages 部署故障 > 2 次/月 → 保留 Vercel 作为备用
- AI 生成内容错误率 > 10% → 恢复纯人工撰写

---

## 附录 A: 关键术语表

| 术语 | 说明 |
|------|------|
| **Rolldown** | VoidZero 开发的 Rust 编写打包器，Vite 未来默认构建工具 |
| **Oxc** | Rust 编写的 JavaScript 氧化编译器集合，含 Oxlint/Oxfmt/Parser/Transformer |
| **tsgo** | Microsoft 将 TypeScript 编译器移植到 Go 的项目 (Project Corsa) |
| **MCP** | Model Context Protocol，Anthropic 提出的 AI 与外部系统连接标准 |
| **WinterCG** | Web-interoperable Runtimes Community Group，Edge 运行时的 Web 标准 |
| **Type Stripping** | Node.js v25+ 支持的直接运行 `.ts` 文件功能，运行时擦除类型注解 |
| **Edge Database** | 部署在 Edge 节点的数据库 (D1/Turso/Neon)，支持全球低延迟访问 |

## 附录 B: 参考数据源

- [State of JavaScript 2025](https://stateofjs.com)
- [GitHub Octoverse 2025](https://github.blog/news-insights/octoverse/)
- [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/)
- [Node.js v25 TypeScript Documentation](https://nodejs.org/api/typescript.html)
- [VoidZero / Rolldown](https://voidzero.dev)
- [Oxc Project](https://oxc.rs)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Cloudflare Workers](https://workers.cloudflare.com)

---

> **文档状态**: 规划待确认
> **下一步**: 待维护者确认后，按 Phase A → D 顺序全面执行
