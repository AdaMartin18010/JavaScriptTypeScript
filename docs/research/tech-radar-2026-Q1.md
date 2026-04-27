# JS/TS 技术雷达 2026 Q1

> 采用 ThoughtWorks Tech Radar 四象限模型：Adopt / Trial / Assess / Hold
> 生成日期: 2026-04-27
> 下次回顾: 2026-07-27

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

| 技术 | 理由 | 替代方案 |
|------|------|---------|
| **TypeScript 5.8+** | 稳定版本，类型系统成熟，生态完全兼容 | - |
| **React 19** | Stable 发布，Compiler 1.0 生产就绪，RSC 架构稳定 | Vue 3 / Angular 17 |
| **Vite 6/7** | 构建速度标杆，生态插件丰富 | Webpack / Parcel |
| **Tailwind CSS v4** | Oxide 引擎性能飞跃，CSS-first 配置成为主流 | Bootstrap / Styled Components |
| **Drizzle ORM** | Serverless/Edge 首选，类型安全，SQL-like 语法 | Prisma (复杂场景) |
| **Hono** | 轻量、高性能、WinterTC 兼容，Edge 运行时首选 | Express / Fastify |
| **Vitest** | Vite 原生测试运行器，替代 Jest 已成趋势 | Jest |
| **Biome** | Rust 重写，统一 linter + formatter，速度极快 | ESLint + Prettier |
| **MCP (Model Context Protocol)** | AI 工具集成事实标准，97M+ 月下载 | 自定义 API 集成 |
| **Passkeys / WebAuthn** | 现代认证标准，消除密码依赖 | 传统密码 + SMS 2FA |

---

## 🧪 Trial（建议试验）

| 技术 | 理由 | 风险 |
|------|------|------|
| **TypeScript 7.0 (tsgo)** | Go 重写编译器，10x 构建速度提升 | Compiler API 断裂，工具链迁移成本 |
| **Node.js 24 `--strip-types`** | 原生 TS 执行，减少构建步骤 | 实验性，类型导入语法限制 |
| **React Compiler** | 自动 memoization，减少手动优化 | 与手动 `useMemo` 的边界情况 |
| **A2A Protocol** | Agent 间协作标准，Linux Foundation 托管 | 生态早期，工具链不成熟 |
| **LangGraph** | 复杂 Agent 工作流编排，Uber/LinkedIn 生产使用 | 学习曲线陡峭 |
| **Oxc 全链路工具** | Parser + Linter + Minifier + Transformer | 部分功能尚未完全替代 Babel |
| **Rolldown** | Vite 8 默认 bundler，Rollup 的 Rust 替代 | 插件生态迁移中 |
| **Cloudflare D1 + Drizzle** | Edge 原生数据库，零冷启动 | 功能集相比 Postgres 有限 |
| **OpenTelemetry LLM Semantic Conventions** | AI 可观测性行业标准 | 规范快速演进中 |

---

## 🔍 Assess（建议评估）

| 技术 | 理由 | 观察指标 |
|------|------|---------|
| **CrewAI** | 原生 MCP + A2A 支持，多 Agent 编排 | Stars 增速、企业采用案例 |
| **OpenAI Agents SDK** | OpenAI 官方 Agent 框架，与模型深度集成 | 社区规模、第三方集成 |
| **Mastra** | 现代 AI 应用框架，TypeScript 优先 | 周下载量、文档完善度 |
| **Bun 1.3** | 一体化运行时（包管理+测试+执行） | Windows 稳定性、npm 兼容度 |
| **Deno 2.x** | 完全 npm 兼容，JSR 注册表 | 企业采用率、框架支持 |
| **Vue 3.6 Vapor Mode** | 编译时信号化，性能接近 SolidJS | 正式发布时间、生态迁移 |
| **Svelte 5 Runes** | 显式信号系统，简化响应式 | 社区接受度、迁移成本 |
| **Temporal API** | Date 的现代化替代（ES2026 Stage 4） | 浏览器支持度（Firefox 已 ship） |
| **Import Defer** | 延迟加载提案，优化首屏性能 | TC39 进度 |
| **tsgo (Beta)** | TypeScript Go 编译器预览 | 实际项目构建速度、bug 数量 |

---

## 🛑 Hold（建议暂缓）

| 技术 | 理由 | 替代方案 |
|------|------|---------|
| **Vue 2** | 2023 年底已 EOL，不再接收安全更新 | Vue 3 |
| **Recoil** | Meta 官方归档，不再维护 | Jotai / Zustand |
| **Lerna** | Monorepo 工具链已死，社区维护停滞 | Nx / Turborepo / pnpm workspaces |
| **Create React App (CRA)** | React 团队已放弃维护 | Vite + React / Next.js |
| **Material UI v5** | 样式方案过时，v6 重构中 | shadcn/ui / Radix UI |
| **NextAuth.js v4** | 已迁移至 Auth.js v5，v4 不再更新 | Auth.js v5 / better-auth |
| **TSLint** | 已废弃多年 | ESLint / Biome |
| **Gulp / Grunt** | 构建工具链过时 | Vite / esbuild / swc |
| **Moment.js** | 已进入维护模式，包体积过大 | date-fns / dayjs / Temporal API |
| **PhantomJS** |  headless 浏览器已死 | Playwright / Puppeteer |

---

## 📊 变化趋势（vs 2025 Q4）

| 技术 | 上季度 | 本季度 | 变化原因 |
|------|--------|--------|---------|
| MCP | Assess | **Adopt** | 97M+ 月下载，Linux Foundation 托管 |
| tsgo | Hold | **Trial** | 10x 构建速度，Beta 可用 |
| React Compiler | Trial | **Adopt** | 1.0 Stable 发布 |
| Tailwind v4 | Trial | **Adopt** | Oxide 引擎成熟，生态迁移完成 |
| Biome | Assess | **Adopt** | 1.x 稳定，完全替代 ESLint+Prettier |
| A2A Protocol | - | **Trial** | Google 发布 + Linux Foundation 托管 |
| Bun 1.3 | Assess | **Assess** | Windows 稳定，但企业采用仍谨慎 |
| Deno 2.x | Assess | **Assess** | npm 兼容完成，但生态仍小众 |

---

> 由 `docs/research/tech-radar-YYYY-QX.md` 系列维护
> 更新频率: 每季度
> 下次更新: 2026 Q2
