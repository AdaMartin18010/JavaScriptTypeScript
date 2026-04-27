# JS/TS 技术雷达 2026 Q2

> 采用 ThoughtWorks Tech Radar 四象限模型：Adopt / Trial / Assess / Hold
> 生成日期: 2026-04-27（前瞻草案）
> 状态: 待 Q2 数据填充

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

**Q2 预期新增**: tsgo (若 GA)、Node.js 24 LTS (若 strip-types 稳定)

---

## 🧪 Trial（建议试验）

| 技术 | 理由 | 风险 |
|------|------|------|
| TypeScript 7.0 (tsgo) | 10x 构建速度 | API 断裂 |
| Node.js 24 strip-types | 原生 TS 执行 | 实验性限制 |
| A2A Protocol | Agent 协作标准 | 生态早期 |
| LangGraph | 复杂 Agent 编排 | 学习曲线 |
| Rolldown | Vite 8 默认 bundler | 插件迁移 |
| Oxc 全链路 | Rust 工具链统一 | 功能完整性 |
| CrewAI | 多 Agent 编排 | 快速迭代中 |

---

## 🔍 Assess（建议评估）

| 技术 | 理由 | 观察指标 |
|------|------|---------|
| Mastra | 现代 AI 应用框架 | 下载量、案例 |
| OpenAI Agents SDK | 官方 Agent 框架 | 社区规模 |
| Deno 2.x | 完全 npm 兼容 | 企业采用 |
| Bun 1.3 | 一体化运行时 | Windows 稳定 |
| Vue Vapor Mode | 编译时信号化 | 正式发布 |
| Svelte 5 Runes | 显式信号系统 | 社区接受度 |
| Import Defer | 延迟加载 | TC39 进度 |

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
| Moment.js | 维护模式 | date-fns / Temporal |

---

## 📊 待 Q2 完成后填充

- [ ] State of JS 2025 数据更新
- [ ] npm 下载量趋势变化 >30% 的技术
- [ ] GitHub Stars 增速 >20% 的项目
- [ ] TC39 Stage 4 新特性
- [ ] 框架安全事件影响评级调整

---

> 本文件为 Q2 前瞻模板，待 2026-07 实际数据填充后正式发布
