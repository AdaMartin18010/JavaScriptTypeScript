# JS/TS 技术雷达 2026 Q2

> 采用 ThoughtWorks Tech Radar 四象限模型：Adopt / Trial / Assess / Hold
> 生成日期: 2026-04-27
> 状态: Q2 数据已填充

---

## 📡 技术雷达概览

```
                        采用 (Adopt)
                           ▲
                           │
         评估 (Assess) ◄───┼───► 试验 (Trial)
                           │
                           ▼
                        暂缓 (Hold)
```

---

## ✅ Adopt（建议采纳）

| 技术 | 理由 | 进入 Adopt 时间 |
|------|------|----------------|
| TypeScript 5.8+ | 稳定版本，类型系统成熟 | 2024 Q4 |
| React 19 | Stable，Compiler 生产就绪 | 2025 Q4 |
| Vite 6/7/8 | 构建速度标杆 | 2023 Q2 |
| Tailwind CSS v4 | Oxide 引擎，CSS-first | 2026 Q1 |
| Drizzle ORM | Serverless/Edge 首选 | 2025 Q3 |
| Hono | 轻量高性能 Edge 框架 | 2025 Q2 |
| Vitest | Vite 原生测试 | 2024 Q2 |
| Biome | 统一 linter + formatter | 2026 Q1 |
| MCP | AI 工具集成标准 | 2026 Q1 |
| Passkeys | 现代认证标准 | 2025 Q4 |
| **Node.js 24 LTS** | 原生 TypeScript 执行（strip-types）稳定；npm v11 安装速度提升 65% | 2026 Q2 |
| **Rolldown** | Vite 8 默认 bundler，Rust 核心生产就绪 | 2026 Q2 |

**Q2 新增说明**:
- **Node.js 24 LTS**（2026-03 进入 LTS）默认支持 `.ts` 文件 type-stripping，开发工作流可移除 ts-node；State of JS 2025 显示 Node.js 后端使用率仍达 90%。
- **Rolldown** 随 Vite 8 进入稳定通道，VoidZero 生态统一 Rust 工具链的基石已成型。

---

## 🧪 Trial（建议试验）

| 技术 | 理由 | 风险 |
|------|------|------|
| **TypeScript 7.0 (tsgo)** | 10x 构建速度（Go 重写），Beta 已于 2026-04 发布 | Compiler API 断裂；部分插件需迁移 |
| **Node.js 24 strip-types** | 原生 TS 执行，开发体验质变 | 仅支持 erasable syntax（enum/namespace 需转换）；生产构建仍建议 tsc/bundler |
| A2A Protocol | Agent 协作标准 | 生态早期 |
| LangGraph | 复杂 Agent 编排 | 学习曲线 |
| Oxc 全链路 | Rust 工具链统一（parser/linter/minifier） | 功能完整性仍在追赶 |
| CrewAI | 多 Agent 编排 | 快速迭代中 |
| **Deno 2.x** | 完全 npm 兼容，WinterTC 对齐度高 | 企业采用率有限（State of JS 2025 仅 11%） |

**Q2 更新说明**:
- **tsgo Beta**（2026-04-22 发布）实测 VS Code 仓库编译从 77.8s 降至 7.5s，Playwright 从 11.1s 降至 1.1s。建议 CI 流水线开始预研 `@typescript/native-preview`。
- **Node.js strip-types** 在 v22.18+ 已默认启用，v24 LTS 移除实验性警告，但 `--erasableSyntaxOnly` 限制要求代码基清理 enum/namespace。
- Deno 2.7 已支持 Temporal API 与 Windows ARM，但社区份额增长缓慢，维持 Trial。

---

## 🔍 Assess（建议评估）

| 技术 | 理由 | 观察指标 |
|------|------|---------|
| **Mastra** | 现代 AI 应用框架，类型安全的工作流编排 | 下载量、企业案例、Vercel/云厂商集成 |
| OpenAI Agents SDK | 官方 Agent 框架 | 社区规模 |
| **Bun 1.3** | 一体化运行时，REPL 与 barrel 优化显著提升 | Windows 稳定度、企业采纳率（State of JS 2025: 21%，+4% YoY） |
| **Vue Vapor Mode** | 编译时信号化，无虚拟 DOM 路径 | Vue 3.6/Vapor 正式发布时间 |
| Svelte 5 Runes | 显式信号系统 | 社区接受度；Villa Plus 案例报告 40% 更新性能提升 |
| Import Defer | 延迟加载 | TC39 进度（当前 Stage 3） |
| **Solid 2.0** | 异步一等公民、计算可返回 Promise | 生态成熟度；已连续 5 年满意度第一（State of JS 2021–2025） |
| **TanStack Start** | 可组合元框架，库优先哲学 | 写入率约 4%（State of JS 2025 非正式选项），观察与 Next/Nuxt 差异化 |

**Q2 更新说明**:
- **Mastra** 进入 Assess 核心观察列表：作为 AI-Native 工作流框架，与 LangChain/LangGraph 形成差异化，需评估其类型安全承诺与边缘部署能力。
- **Bun 1.3**（2026-03 已发布 1.3.10）新增 ES decorators 支持与更快的 event loop，但 Anthropic 收购后的长期路线图仍需观察。
- Vue Vapor Mode 尚未进入稳定发布通道，维持 Assess。

---

## 🛑 Hold（建议暂缓）

| 技术 | 理由 | 替代方案 |
|------|------|---------|
| Vue 2 | 已 EOL | Vue 3 |
| Recoil | 已归档 | Jotai / Zustand |
| Lerna | 已死 | Nx / Turborepo |
| CRA | 已放弃 | Vite / Next.js |
| NextAuth.js v4 | 已迁移 | Auth.js v5 |
| TSLint | 已废弃 | ESLint / Biome |
| Moment.js | 维护模式 | date-fns / Temporal（ES2026） |
| **webpack** | 满意度净负（State of JS 2025: 14% 正面 vs 37% 负面） | Vite / Rolldown |
| **NextAuth.js v4** | 已迁移 | Auth.js v5 |

**Q2 新增说明**:
- **webpack** 正式建议 Hold：State of JS 2025 显示其使用率（86.4%）仍略高于 Vite（84.4%），但满意度差距达 78 个百分点（Vite 净 +55 vs webpack 净 -23）。新项目不应默认选择 webpack。
- Records & Tuples 提案已被 TC39 撤回，从原 Assess 区移除并归档。

---

## 📊 State of JS 2025 关键数据引用

> 来源：Devographics State of JavaScript 2025 调查（2025-09 至 11 月收集，13,002 名受访者）

| 维度 | 关键数据 | 对雷达的影响 |
|------|---------|------------|
| **TypeScript 采用** | 40% 开发者纯 TS（2024: 34%；2022: 28%）；仅 6% 纯 JS | TypeScript 7.0 进入 Trial 加速区 |
| **构建工具满意度** | Vite 98% 满意；webpack 26% 满意（↓10% YoY） | webpack 移入 Hold |
| **AI 代码生成** | 29% 代码为 AI 生成（↑45% YoY）；Claude 44%（↑2x），Cursor 26%（↑2x+） | MCP 稳固 Adopt；AI-Native 框架进入 Assess |
| **运行时份额** | Node.js 90%，Bun 21%（+4%），Deno 11% | Bun 维持 Assess；Node.js 24 进入 Adopt |
| **前端框架** | React 83.6% 使用率，但满意度下滑；Solid 连续 5 年满意度第一；Astro 满意度领先 Next.js 39 个百分点 | Solid 2.0 / Astro 进入 Assess/Trial 观察 |
| **元框架痛点** | Next.js 复杂度成首要吐槽；TanStack Start 作为可组合替代获关注 | Next.js 不降级但需审慎评估 |
| **后端框架** | Express 仍领先但满意度下降；Hono / ElysiaJS / Nitro 满意度上升 | Hono 已在 Adopt |

---

> 本文件为 2026 Q2 正式版，基于 State of JS 2025、TC39 2026-03/04 会议及行业发布数据编制。
> 下次更新：2026 Q3（预计 2026-07）
