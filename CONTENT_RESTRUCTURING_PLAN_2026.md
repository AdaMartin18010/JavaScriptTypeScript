# JavaScript/TypeScript 全景知识库 — 内容梳理与重构方案

> **方案性质**: 纯内容梳理（零代码实现）
> **梳理日期**: 2026-04-27
> **梳理范围**: 36,813 文件，四层内容架构
> **对齐来源**: TC39、TypeScript Blog、React/Vite 官方、State of JS 2025、MCP/A2A 官方等

---

## 一、现有四层内容架构地图

本项目内容按深度分为四层，每层职责不同。梳理发现各层的**覆盖度、时效性、完整度差异极大**。

```
┌─────────────────────────────────────────────────────────────────┐
│  L4 生态导航层      awesome-jsts-ecosystem/                      │
│  职责: 工具收录、Stars/下载量追踪、快速入口                       │
├─────────────────────────────────────────────────────────────────┤
│  L3 文档体系层      docs/ + 学习路径/决策树/对比矩阵               │
│  职责: 选型决策、最佳实践、迁移指南、速查表                        │
├─────────────────────────────────────────────────────────────────┤
│  L2 代码实验室层    jsts-code-lab/                               │
│  职责: 可运行示例、从理论到实践的桥梁                             │
├─────────────────────────────────────────────────────────────────┤
│  L1 语言核心层      JSTS全景综述/ + jsts-language-core-system/   │
│  职责: 形式化语义、学术前沿、语言机制深度分析                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、逐层内容质量评估

### L1 语言核心层 — ⭐⭐⭐⭐⭐ 优秀，但分布不均

| 子系统 | 文件数 | 覆盖度 | 时效性 | 主要问题 |
|--------|--------|--------|--------|---------|
| **JSTS全景综述/** | 82+ MD | 95% | 2026-04 ✅ | 无重大缺口，ES2025/2026 已全面覆盖 |
| **jsts-language-core-system/01-type-system/** | 12 MD + 10 TS | 90% | 2026-04 ✅ | 编号缺 07/09/11 |
| **jsts-language-core-system/02-variable-system/** | 9 MD + 7 TS | 90% | 2025 ✅ | 完整 |
| **jsts-language-core-system/03-control-flow/** | 9 MD + 7 TS | 85% | 2025 ✅ | 模式匹配仅作"未来提案" |
| **jsts-language-core-system/04-execution-model/** | 11 MD + 5 TS | 80% | 2025 ✅ | 编号缺 10 |
| **jsts-language-core-system/05-execution-flow/** | 6 MD + 4 TS | 85% | 2025 ✅ | 完整 |
| **jsts-language-core-system/06-ecmascript-spec-foundation/** | 4 MD + 4 TS | **60%** ⚠️ | 2025 | **最薄弱环节：仅4文件，部分<5000字节** |
| **jsts-language-core-system/07-js-ts-symmetric-difference/** | 6 MD + 6 TS | 90% | 2025 ✅ | 独特学术贡献 |

**L1 层核心结论**: 整体是项目最强 layer，但存在两个**结构性缺口**（无独立专题）：

1. ❌ **模块系统**（ESM/CJS 互操作、加载语义、循环依赖、Import Attributes/Defer）
2. ❌ **对象模型与原型链**（`[[Prototype]]`、属性描述符、Proxy/Reflect、Private Fields）

---

### L2 代码实验室层 — ⭐⭐⭐☆☆ 中等，理论-实践断层严重

| 指标 | 现状 | 健康标准 | 差距 |
|------|------|---------|------|
| 模块总数 | 87（编号 00-96，含冲突） | — | — |
| 含 THEORY.md | **36 / 87 = 41%** | 100% | **-51 模块** |
| 含 ARCHITECTURE.md | **2 / 87 = 2%** | 100% | **-85 模块** |
| 含 README.md | **24 / 87 = 28%** | 100% | **-63 模块** |
| 极薄弱模块（≤3文件） | **23 / 87 = 26%** | <10% | **-14 模块** |
| 丰富模块（≥20文件） | **13 / 87 = 15%** | — | — |

**L2 层核心问题分类**:

#### 问题 A: 编号体系混乱

- `86-graph-database` 与 `86-tanstack-start-cloudflare` **编号冲突**
- 模块 28 实际是 `28-testing-advanced`，但 `CROSS-REFERENCE.md` 错误写成 `28-ai-agent-infrastructure`
- `compiler-api` 等引用指向不存在的模块

#### 问题 B: 内容厚度两极分化

**极薄弱模块（需合并或大幅扩充）**:

| 模块 | 文件数 | 建议 |
|------|--------|------|
| `11-benchmarks` | 3 | 合并到 `08-performance` 或 `60-developer-experience` |
| `13-code-organization` | 3 | 合并到 `23-toolchain-configuration` |
| `14-execution-flow` | 3 | 与 `15-data-flow` 合并为 `14-15-data-and-execution-flow` |
| `16-application-development` | 3 | 内容过于笼统，建议拆分至各专项模块 |
| `25-microservices` | 3 | 合并到 `70-distributed-systems` 或删除（docs/ 已有完整指南） |
| `26-event-sourcing` | 3 | 合并到 `70-distributed-systems` |
| `30-real-time-communication` | 3 | 需大幅扩充（WebSocket/SSE/WebRTC/PartyKit） |
| `31-serverless` | 3 | 与 `32-edge-computing` 合并为 `31-serverless-and-edge` |
| `34-blockchain-web3` | 3 | 与 `83-blockchain-advanced` 合并 |
| `35-accessibility-a11y` | 3 | 需扩充（WCAG 2.2、ARIA、自动化测试） |
| `36-web-assembly` | 3 | 与 `guides/webassembly-guide.md` 联动扩充 |
| `39-performance-monitoring` | 3 | 合并到 `74-observability` |
| `68-plugin-system` | 3 | 合并到 `78-metaprogramming` |
| `72-container-orchestration` | 3 | 删除或迁移（超出 JS/TS 知识库范围） |
| `73-service-mesh-advanced` | 3 | 删除或迁移（超出 JS/TS 知识库范围） |
| `83-blockchain-advanced` | 3 | 与 `34-blockchain-web3` 合并 |
| `87-realtime-analytics` | 3 | 合并到 `65-analytics` 或 `74-observability` |
| `91-nodejs-core-lab` | 3 | 与 `90-web-apis-lab` 合并或扩充 |
| `93-deployment-edge-lab` | 3 | 需大幅扩充（应覆盖 Vercel/Cloudflare/AWS/CDN） |

#### 问题 C: AI / 新兴领域模块厚度不足但定位正确

| 模块 | 当前状态 | 需补充内容（纯内容，非代码） |
|------|---------|---------------------------|
| `33-ai-integration` | 12 文件，MODERATE | 需补充：AI-Native Development Workflow、Cursor/Claude Code 工作流、Prompt Engineering |
| `94-ai-agent-lab` | 12 文件，MODERATE | 需补充：A2A 协议、CrewAI、LangGraph、OpenAI Agents SDK、AI 可观测性 |
| `95-auth-modern-lab` | 7 文件，THIN | 需补充：Passkeys 深度指南、OAuth 2.1、FedCM、组织/团队管理 |
| `96-orm-modern-lab` | 6 文件，THIN | 需补充：Prisma 7 WASM 分析、边缘数据库决策树、Drizzle Kit 完整指南 |

#### 问题 D: 关键新兴领域**完全缺失**代码实验室模块

| 应新增模块 | 理由 | 参考来源 |
|-----------|------|---------|
| `92-mcp-protocol/`（或调整编号） | MCP 已成为 AI 基础设施事实标准 | modelcontextprotocol.io |
| `97-build-free-typescript/` | Type Stripping 范式是 2026 年真正范式转移 | Node.js 24 / Deno 2.7 / Bun 1.3 |
| `98-rust-unified-toolchain/` | VoidZero 统一 AST 是工具链架构变革 | Vite 8 + Rolldown + Oxc |
| `99-edge-databases/` | SQLite at the Edge 是独立类别 | Turso / D1 / SQLite Cloud |

---

### L3 文档体系层 — ⭐⭐⭐☆☆ 中等，时效性与一致性差

#### 3.1 文档数量统计（纠正过时索引）

| 子目录 | 声称数量 | 实际数量 | 偏差 |
|--------|---------|---------|------|
| `docs/guides/` | 1（INDEX 说1） | **20** | 低估 20 倍 |
| `docs/categories/` | 21 | **30** | 低估 43% |
| `docs/comparison-matrices/` | 9（README说9） | **16** | 低估 78% |
| `docs/decision-trees.md` | 14 | **15** | 低估 7% |
| `docs/diagrams/` | 21 | **17**（仅.mmd） | 高估 24% |

#### 3.2 内容纠错清单（事实性错误）

| 文件 | 错误内容 | 纠正方案 | 优先级 |
|------|---------|---------|--------|
| `guides/react-server-components-security.md` | 引用虚构 CVE `CVE-2025-55182 (React2Shell)` | **删除整段或标注为"模拟场景"** | 🔴 P0 |
| `guides/typescript-7-migration.md` | 声称 TS 7.0 "2025年12月GA" | **修正为"2026年4月发布Beta，稳定版预计2026年中"** | 🔴 P0 |
| `guides/ai-coding-workflow.md` | 推荐栈写 `React 18` + `TypeScript 5.3` | **更新为 React 19 + TypeScript 5.8/6.0** | 🔴 P0 |
| `guides/CSS_IN_JS_STYLING.md` | 流式 SSR 章节标注 React 18 | **更新为 React 19 + RSC 语境** | 🟠 P1 |
| `guides/mcp-guide.md` | 可能仍写 Vercel AI SDK v4/v5 | **更新为 v6** | 🔴 P0 |
| `categories/29-authentication.md` | 提及 `NextAuth.js v4` | **更新为 Auth.js v5 或 better-auth** | 🟠 P1 |
| `patterns/REACT_PATTERNS.md` | React 18 Suspense 标注 | **更新为 React 19 语境** | 🟡 P2 |
| `categories/01-frontend-frameworks.md` | Vue 2 仍占较多篇幅 | **精简 Vue 2 内容（2023年底已EOL）** | 🟡 P2 |
| `comparison-matrices/README.md` | 声称 9 个矩阵 | **重写为 16 个矩阵的完整导航** | 🟠 P1 |

#### 3.3 内容重复 / 应合并的文件对

| 文件 A | 文件 B | 合并建议 |
|--------|--------|---------|
| `categories/04-data-visualization.md` | `platforms/DATA_VISUALIZATION.md` | **合并为单一权威文档**，platforms/ 作为入口，categories/ 删除或改为摘要 |
| `categories/16-mobile-development.md` | `platforms/MOBILE_DEVELOPMENT.md` | **同上** |
| `categories/10-styling.md` | `guides/CSS_IN_JS_STYLING.md` | **保留 guides/ 版本**（更详细），categories/ 改为摘要+链接 |
| `categories/21-webassembly.md` | `guides/webassembly-guide.md` | **合并为 guides/ 版本**，categories/ 精简 |
| `categories/12-testing.md` | `categories/13-testing-ecosystem.md` | **合并为单一文件** `12-testing-ecosystem.md`，删除 13 |
| `categories/23-error-monitoring-logging.md` | `comparison-matrices/observability-tools-compare.md` | 保留矩阵（更结构化），categories/ 改为场景指南 |

#### 3.4 完全缺失的指南/文档（需新建）

| 应新建文档 | 理由 | 预估篇幅 |
|-----------|------|---------|
| `docs/guides/a2a-protocol-guide.md` | A2A 是 2026 年最重要的新协议之一，项目完全空白 | 300+ 行 |
| `docs/guides/ai-observability-guide.md` | AI 可观测性是生产级 Agent 刚需 | 400+ 行 |
| `docs/guides/build-free-typescript-guide.md` | Type Stripping 范式是全新开发模式 | 300+ 行 |
| `docs/guides/llm-security-guide.md` | Prompt Injection / Model Extraction / PII 过滤 | 400+ 行 |
| `docs/guides/rust-toolchain-migration-guide.md` | Biome/Oxc/Rolldown 迁移指南（现有 but 需确认） | 300+ 行 |
| `docs/categories/30-edge-databases.md` | SQLite at the Edge 作为独立类别 | 500+ 行 |
| `docs/research/ai-agent-architecture-patterns.md` | ReAct / Plan-and-Solve / Multi-Agent / Reflection | 600+ 行 |
| `docs/cheatsheets/REACT_CHEATSHEET.md` | 现有仅 TS 速查表，React 是最大生态 | 200+ 行 |
| `docs/cheatsheets/NODEJS_CHEATSHEET.md` | Node.js 核心模块速查 | 200+ 行 |
| `docs/cheatsheets/REGEX_CHEATSHEET.md` | 正则表达式速查（已有完整指南但无速查表） | 150+ 行 |

#### 3.5 决策树更新需求

`docs/decision-trees.md` 现有 15 棵树，需新增/更新：

| 决策树 | 现状 | 更新需求 |
|--------|------|---------|
| AI 框架选型 | ✅ 存在 | **需扩展**：从仅 Vercel AI SDK / LangChain / Mastra，增加 CrewAI、OpenAI Agents SDK、LangGraph |
| 认证方案选型 | ✅ 存在 | **需更新**：better-auth / Auth.js v5 / Passkeys / OAuth 2.1 |
| 数据库选型 | ✅ 存在 | **需新增分支**：Edge 数据库（Turso/D1/Neon）vs 传统 Postgres |
| 运行时选型 | ✅ 存在 | **需更新**：Node.js 24 Type Stripping / Deno 2.7 / Bun 1.3 |
| **AI Coding Workflow 选型** | ❌ 缺失 | **新增**：Cursor vs Claude Code vs Copilot Workspace vs Windsurf |
| **Type Stripping 策略决策** | ❌ 缺失 | **新增**：何时用 tsx / 何时用原生 strip-types / 何时用 Bun |

---

### L4 生态导航层 — ⭐⭐⭐⭐☆ 良好，数据需更新

`awesome-jsts-ecosystem/` 是项目的"门面"，收录标准和数据准确性直接影响可信度。

**需更新的关键数据**:

| 项目 | 项目当前数据 | 2026-04 实际数据 | 操作 |
|------|------------|-----------------|------|
| Hono | 25K stars, 200万周下载 | **28K+ stars, 900万+ 周下载** | 更新 |
| MCP SDK | 9700万月下载 | **97M+ 月下载** | 更新 |
| Mastra | 未标注或旧数据 | **22K stars, 300K 周下载** | 更新 |
| Drizzle ORM | 30K stars, 150万周下载 | 需核实最新 | 核实并更新 |
| tRPC | 未标注或旧数据 | **v11 稳定** | 更新版本 |
| Vite | 旧版本 | **v8.0** | 更新 |
| React Compiler | Beta | **1.0 稳定（2025-10）** | 更新状态 |
| Next.js | 旧版本 | **v16** | 更新 |

**需新增收录的项目**:

| 项目 | 类别 | Stars/下载量 | 理由 |
|------|------|-------------|------|
| LangGraph | AI Agent | 25K stars, 34.5M 月下载 | Uber/LinkedIn 生产使用 |
| CrewAI | AI Agent | 46K stars | 原生 MCP + A2A |
| OpenAI Agents SDK | AI Agent | 19K stars | OpenAI 官方 Agent 框架 |
| Langfuse | AI 可观测性 | 8K stars | 开源 LLM Tracing |
| Oxc (全链路) | 工具链 | 14K stars | Parser+Linter+Minifier+Transformer |
| Rolldown | 构建工具 | 12K stars | Vite 8 默认 bundler |

---

## 三、内容梳理任务清单（按优先级）

### 🔴 P0 — 立即执行（事实纠错 + 关键更新）

| # | 任务 | 目标文件 | 内容动作 |
|---|------|---------|---------|
| P0-1 | **删除/修正虚构 CVE** | `guides/react-server-components-security.md` | 删除 `CVE-2025-55182` 段落，或明确标注为"模拟演练场景" |
| P0-2 | **修正 TS 7.0 发布时间** | `guides/typescript-7-migration.md` | 将"2025年12月GA"改为"2026年4月Beta，稳定版预计2026年Q2-Q3" |
| P0-3 | **更新 AI SDK 版本号** | `guides/ai-sdk-guide.md`, `guides/mcp-guide.md` | 统一将 Vercel AI SDK 写为 v6 |
| P0-4 | **更新 React/TS 版本引用** | `guides/ai-coding-workflow.md`, `guides/CSS_IN_JS_STYLING.md` | React 18→19, TypeScript 5.3→5.8/6.0 |
| P0-5 | **修正模块编号冲突** | `jsts-code-lab/` | `86-tanstack-start-cloudflare` → `88-tanstack-start-cloudflare`（或重新编号） |
| P0-6 | **修正 CROSS-REFERENCE.md** | `jsts-code-lab/CROSS-REFERENCE.md` | 修复 5+ 处 broken references（文件名漂移） |
| P0-7 | **修正决策树数量** | `README.md`, `COMPLETE_DOCUMENTATION_INDEX.md` | 14→15 棵决策树 |
| P0-8 | **修正对比矩阵数量** | `comparison-matrices/README.md` | 重写为 16 个矩阵的完整导航 |
| P0-9 | **更新关键生态数据** | `awesome-jsts-ecosystem/README.md` | Hono、MCP、Mastra、Vite、Next.js 数据更新 |

### 🟠 P1 — 核心补充（新特性 + 新协议 + 框架更新）

| # | 任务 | 目标文件/位置 | 内容动作 |
|---|------|-------------|---------|
| P1-1 | **新建 A2A 协议指南** | `docs/guides/a2a-protocol-guide.md` | 撰写完整指南：Agent Cards、JSON-RPC 2.0、gRPC、多 Agent 协作 |
| P1-2 | **新建 AI 可观测性指南** | `docs/guides/ai-observability-guide.md` | OpenTelemetry LLM Semantic Conventions、Langfuse、Token 成本追踪 |
| P1-3 | **新建 Build-Free TypeScript 指南** | `docs/guides/build-free-typescript-guide.md` | Node.js 24 / Deno 2.7 / Bun 1.3 原生 TS 执行对比 |
| P1-4 | **新建 LLM 安全指南** | `docs/guides/llm-security-guide.md` | Prompt Injection、Model Extraction、Output Validation、PII 过滤 |
| P1-5 | **更新前端框架对比矩阵** | `comparison-matrices/frontend-frameworks-compare.md` | 新增 Vue 3.6 Vapor、Astro v6+Cloudflare、Next.js v16、Svelte 5 Runes |
| P1-6 | **更新构建工具对比矩阵** | `comparison-matrices/build-tools-compare.md` | 新增 Vite 8 + Rolldown 1.0、Oxc 全链路、Rspack v2 |
| P1-7 | **更新编译器对比矩阵** | `comparison-matrices/js-ts-compilers-compare.md` | 新增 tsgo Beta 实测数据、TS 6.0 特性 |
| P1-8 | **更新后端框架对比矩阵** | `comparison-matrices/backend-frameworks-compare.md` | Hono 最新数据、WinterTC→Ecma TC55、tRPC v11 |
| P1-9 | **更新 ORM 对比矩阵** | `comparison-matrices/orm-compare.md` | Prisma 7 WASM、Neon 被 Databricks 收购、PlanetScale 定价变化 |
| P1-10 | **扩展 AI Agent 基础设施分类** | `categories/28-ai-agent-infrastructure.md` | 新增 LangGraph、CrewAI、OpenAI Agents SDK、A2A 协议 |
| P1-11 | **更新认证分类** | `categories/29-authentication.md` | better-auth v1.6、Auth.js v5、Passkeys、FedCM |
| P1-12 | **新增收购/治理事件分析** | `ECOSYSTEM_TRENDS_2026.md` | Bun/Anthropic、Astro/Cloudflare、Neon/Databricks、VoidZero/NuxtLabs |
| P1-13 | **更新 L1 层 ES2026 状态** | `JSTS全景综述/ES2026_FEATURES_PREVIEW.md` | 确认 Temporal API Stage 4（2026-03）、Error.isError、Math.sumPrecise、Uint8Array Base64 |
| P1-14 | **更新 State of JS 2025 数据** | 全局所有引用旧数据的文档 | 统一替换为 State of JS 2025（13,002受访者，29%AI代码，TS 40%独占） |

### 🟡 P2 — 结构优化（合并、扩充、新增类别）

| # | 任务 | 目标位置 | 内容动作 |
|---|------|---------|---------|
| P2-1 | **合并重复内容** | `categories/` vs `platforms/` vs `guides/` | 按"单一事实来源"原则合并 6+ 对重复文件 |
| P2-2 | **合并/删除薄弱模块** | `jsts-code-lab/` | 将 18+ 个≤3文件的薄弱模块合并为 8-10 个综合模块 |
| P2-3 | **新增 L1 模块系统专题** | `jsts-language-core-system/08-module-system/` | 新建 8-10 个 MD + TS 文件：ESM/CJS、循环依赖、Import Attributes/Defer、动态导入、Node.js 模块解析 |
| P2-4 | **新增 L1 对象模型专题** | `jsts-language-core-system/09-object-model/` | 新建 6-8 个 MD + TS：原型链、属性描述符、Proxy/Reflect、Private Fields、对象冻结/密封 |
| P2-5 | **扩充规范基础专题** | `jsts-language-core-system/06-ecmascript-spec-foundation/` | 从 4 个文件扩充至 8-10 个，达到其他专题的厚度标准 |
| P2-6 | **新增边缘数据库类别** | `docs/categories/30-edge-databases.md` | 新建分类文档：Turso/libSQL、Cloudflare D1、Neon Serverless、SQLite Cloud、决策树 |
| P2-7 | **新增 AI Agent 架构模式研究** | `docs/research/ai-agent-architecture-patterns.md` | ReAct、Plan-and-Solve、Reflection、Multi-Agent Orchestration、Human-in-the-Loop |
| P2-8 | **新增 Rust 统一工具链研究** | `docs/research/rust-unified-toolchains.md` | VoidZero 架构、统一 AST 设计、企业迁移决策矩阵 |
| P2-9 | **补全速查表** | `docs/cheatsheets/` | 新增 React、Node.js、正则表达式速查表 |
| P2-10 | **补全 diagrams/ 索引** | `docs/diagrams/` | 为 17 个 .mmd 文件各写对应的说明文档，并在 docs/ 根目录建立索引 |

### 🟢 P3 — 长期深化（理论补完 + 国际化 + 自动化）

| # | 任务 | 目标位置 | 内容动作 |
|---|------|---------|---------|
| P3-1 | **THEORY.md 补完计划** ✅ | `jsts-code-lab/` | 90/90 模块已覆盖，全部添加了代码文件索引与理论深化 |
| P3-2 | **ARCHITECTURE.md 补完计划** ✅ | `jsts-code-lab/` | 20 个关键模块已创建（AI/安全/基础设施/架构等），共 22 个 |
| P3-3 | **README.md 补完计划** ✅ | `jsts-code-lab/` | 58 个缺失模块已补全，90/90 全覆盖 |
| P3-4 | **英文摘要扩展** ✅ | `docs/en/` | 新增 5 篇英文摘要：README、A2A、AI-Observability、Build-Free-TS、LLM-Security |
| P3-5 | **建立季度内容审计机制** ✅ | `docs/` | 创建 `QUARTERLY_AUDIT_CHECKLIST.md`，定义五维度审计流程与自动化工具清单 |
| P3-6 | **学术前沿补完** ✅ | `JSTS全景综述/` | 创建 `academic-frontiers-index.md`，索引 8 篇核心论文与会议跟踪日历 |

---

## 四、内容梳理后的理想架构（目标态）

### L1 语言核心层（目标）

```
jsts-language-core-system/
├── 01-type-system/          (12→15 文件，补齐编号)
├── 02-variable-system/       (9 文件，保持)
├── 03-control-flow/          (9→11 文件，扩充异常处理、模式匹配)
├── 04-execution-model/       (11→13 文件，补齐编号)
├── 05-execution-flow/        (6 文件，保持)
├── 06-ecmascript-spec-foundation/  (4→10 文件，大幅扩充)
├── 07-js-ts-symmetric-difference/  (6 文件，保持)
├── 08-module-system/         (❌ 新增，8-10 文件)
└── 09-object-model/          (❌ 新增，6-8 文件)

JSTS全景综述/
├── ES2025/2026 保持现有高水平覆盖
├── 新增：模块系统深度分析
├── 新增：对象模型与元编程语义
└── 学术前沿：2025 POPL/PLDI 论文解读扩充
```

### L2 代码实验室层（目标）

```
jsts-code-lab/
├── 00-09 基础层          (合并薄弱模块，补 THEORY.md)
├── 10-19 语言与对比层     (保持，补 THEORY.md)
├── 20-39 应用开发层       (合并/扩充薄弱模块)
├── 40-59 系统与 AI 层      (扩充 AI 模块，新增 Agent 模式)
├── 60-79 工程与基础设施层  (保持丰富模块，补 THEORY.md)
├── 80-89 前沿技术层        (保持，补 THEORY.md)
└── 90-99 实验室层          (新增 97/98/99)
```

**编号冲突解决**:

- `86-graph-database` → 保持 86
- `86-tanstack-start-cloudflare` → **改为 88**（87-realtime-analytics 合并后空出）
- `92-observability-lab` → 保持 92
- `93-deployment-edge-lab` → 保持 93
- `94-ai-agent-lab` → 保持 94
- `95-auth-modern-lab` → 保持 95
- `96-orm-modern-lab` → 保持 96
- `97-build-free-typescript/` → **新增**
- `98-rust-unified-toolchain/` → **新增**
- `99-edge-databases/` → **新增**

### L3 文档体系层（目标）

```
docs/
├── guides/                 (20→26 文件，新增 A2A/AI-Observability/Build-Free-TS/LLM-Security)
├── categories/             (30→31 文件，新增 30-edge-databases，合并 12+13)
├── comparison-matrices/    (16 文件，全部更新至 2026-04 数据)
├── decision-trees.md       (15→17 棵决策树，新增 AI Coding Workflow、Type Stripping)
├── diagrams/               (17 .mmd + 17 说明文档 + 1 索引)
├── cheatsheets/            (1→4 文件，新增 React/Node.js/Regex)
├── patterns/               (4→5 文件，新增 AI Agent Patterns)
├── research/               (4→7 文件，新增 AI 架构/Rust 工具链/学术前沿)
├── learning-paths/         (4 文件，更新数据引用)
└── en/                     (5→15 文件，逐步扩展英文化)
```

### L4 生态导航层（目标）

```
awesome-jsts-ecosystem/
├── README.md               (更新所有 Stars/下载量/版本数据)
├── categories/             (新增 AI Agent、Edge Database、Rust Toolchain 分类)
└── docs/                   (更新收录标准：MCP/A2A 协议门槛放宽)
```

---

## 五、工作量估算与执行建议

### 纯内容工作量（零代码）

| 阶段 | 任务数 | 预估总篇幅 | 预估工时 |
|------|--------|-----------|---------|
| P0 纠错 | 9 | ~5,000 字 | 8h |
| P1 核心补充 | 14 | ~30,000 字 | 40h |
| P2 结构优化 | 10 | ~25,000 字 | 35h |
| P3 长期深化 | 6 | ~50,000 字（分批） | 60h |
| **合计** | **39** | **~110,000 字** | **~143h** |

### 执行建议

1. **P0 必须一次性完成**（9 个纠错任务互不影响，可并行）
2. **P1 按主题域分批**：先完成"语言核心"（P1-13），再"AI 基础设施"（P1-1,1-2,1-10），再"框架工具链"（P1-5~1-9）
3. **P2 的合并操作需先写迁移说明**：合并文件时，保留旧路径的 README 重定向，避免外部链接断裂
4. **P3 的 THEORY.md 补完可采用模板化**：利用 `docs/templates/THEORY_TEMPLATE.md` 和 `ARCHITECTURE_TEMPLATE.md` 批量生成框架，再填充内容

---

*本方案基于 36,813 个文件的递归扫描 + 10+ 权威来源的交叉验证。*
*强调：本方案为纯内容梳理，不涉及任何代码实现、环境搭建或脚本编写。*
*最后更新: 2026-04-27*
*执行状态: P0-P3 全部完成 ✅*
