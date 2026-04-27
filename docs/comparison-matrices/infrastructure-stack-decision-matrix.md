---
last-updated: 2026-04-27
review-cycle: 3 months
next-review: 2026-07-27
status: current
---

# 基础设施栈决策矩阵（Infrastructure Stack Decision Matrix）

> **定位**：为 JavaScript/TypeScript 项目提供跨维度的基础设施综合选型框架。覆盖构建工具、测试策略、部署平台、数据库和认证方案五大核心领域。
>
> **使用方式**：每个维度独立决策，最终组合成完整技术栈。建议结合 [`docs/infrastructure-index.md`](../infrastructure-index.md) 深入了解各工具细节。

---

## 1. 构建工具选型

### 1.1 决策矩阵

| 维度 | Vite | Webpack | Rollup | esbuild | Bun | Rspack | Rolldown |
|------|:----:|:-------:|:------:|:-------:|:---:|:------:|:--------:|
| **冷启动速度** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **生产构建速度** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **配置复杂度** | 低 | 高 | 中 | 低 | 低 | 中 | 低 |
| **生态插件丰富度** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **TypeScript 支持** | 原生 | 需配置 | 需插件 | 原生 | 原生 | 原生 | 原生 |
| **库打包适用性** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **应用打包适用性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **微前端支持** | ⚠️ 实验性 | ✅ 成熟 | ❌ | ❌ | ❌ | ✅ | ⚠️ |
| **团队学习成本** | 低 | 高 | 中 | 低 | 低 | 中 | 低 |

### 1.2 选型决策树

```
项目类型？
├── 现代 Web 应用 (SPA/MPA)
│   ├── 使用 React/Vue/Svelte？ → Vite（首选）
│   ├── 使用 Next.js？ → Turbopack（Next.js 内置）
│   └── 需要极致构建缓存？ → Rspack / Vite + Rolldown
├── 库 / 组件 / npm 包
│   ├── 需要多格式输出 (CJS/ESM/UMD)？ → Rollup / tsup / Rolldown
│   └── 追求极简配置？ → tsup（基于 esbuild）/ unbuild
├── 企业级遗留项目
│   ├── 已有 Webpack 配置？ → 保留 Webpack 或迁移至 Rspack（兼容）
│   └── 需要微前端？ → Webpack Module Federation
├── 全栈 / 工具链脚本
│   ├── 需要一体化（构建+运行+包管理）？ → Bun
│   └── 仅需极速编译？ → esbuild
└── CI / 构建脚本
    └── 追求极速且无 HMR 需求？ → esbuild / Bun build
```

### 1.3 2026 年推荐组合

| 场景 | 推荐栈 | 理由 |
|------|--------|------|
| 新项目（2026）| **Vite 6+**（默认 Rolldown） | 统一 dev/prod 引擎，配置极简 |
| 库开发 | **tsup** 或 **Rolldown** | 多格式输出，零配置 |
| Webpack 迁移 | **Rspack** | 配置兼容，性能提升 5-10 倍 |
| 边缘/Serverless 构建 | **esbuild** / **Bun** | 极速冷启动，单文件可执行 |
| Monorepo 统一构建 | **Turborepo + Vite/Rolldown** | 远程缓存 + 极速构建 |

---

## 2. 测试策略选型

### 2.1 决策矩阵

| 维度 | Vitest | Jest | Playwright | Cypress | node:test |
|------|:------:|:----:|:----------:|:-------:|:---------:|
| **单元测试** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ❌ | ⭐⭐⭐⭐ |
| **集成测试** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **E2E 测试** | ❌ | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ |
| **组件测试** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ |
| **执行速度** | 极快 | 中等 | 慢（浏览器） | 慢（浏览器） | 快 |
| **TypeScript 支持** | 原生 | 需配置 | 原生 | 原生 | 需 tsx |
| **ESM 支持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mock 能力** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **浏览器覆盖** | ❌ | ❌ | Chromium/Firefox/WebKit | Chromium 系 | ❌ |
| **CI 友好度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 2.2 选型决策树

```
测试层级？
├── 单元/集成测试
│   ├── 使用 Vite？ → Vitest（零配置，共享配置）
│   ├── 已有 Jest + 大量快照？ → 保留 Jest 或评估迁移成本
│   ├── 追求极致速度？ → Vitest / node:test + c8
│   └── 需要浏览器环境(jsdom/happy-dom)？ → Vitest / Jest
├── E2E / 跨浏览器测试
│   ├── 需要多浏览器(FF/Safari)？ → Playwright（唯一选择）
│   ├── 前端开发者主导，重视调试体验？ → Cypress
│   ├── 需要 API 测试 + E2E 统一？ → Playwright
│   └── 需要视觉回归？ → Playwright + 截图对比 / Chromatic
└── 组件级测试
    ├── React/Vue/Angular？ → Testing Library + Vitest
    └── 需要独立组件环境？ → Storybook + Chromatic
```

### 2.3 2026 年推荐组合

| 项目类型 | 推荐组合 | 占比建议 |
|----------|----------|----------|
| 现代前端（Vite/React/Vue）| **Vitest**（单元/集成）+ **Playwright**（E2E） | 70% / 20% / 10% |
| Next.js 全栈 | **Vitest** + **Playwright** | 同上 |
| 传统 Node.js 项目 | **Vitest** / **Jest** + **Playwright** | 灵活调整 |
| 快速原型/MVP | **Vitest** 单工具 | 100% 单元/集成 |
| 设计系统 | **Vitest** + **Storybook** + **Chromatic** | 组件测试为主 |

---

## 3. 部署平台选型

### 3.1 决策矩阵

| 维度 | Vercel | Cloudflare Workers/Pages | Netlify | Render | Fly.io | Railway | AWS |
|------|:------:|:------------------------:|:-------:|:------:|:------:|:-------:|:---:|
| **静态托管** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Serverless/Edge** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **长运行服务** | ❌ | ❌ | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **全球边缘网络** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ |
| **冷启动** | 低 | 极低(0ms) | 低 | 低 | 低 | 中 | 中-高 |
| **Next.js 支持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **数据库原生集成** | ❌ | D1/KV/R2 | ❌ | PostgreSQL/Redis | PostgreSQL/Redis | 多数据库 | 全生态 |
| **免费额度慷慨度** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **供应商锁定** | 高 | 中 | 中 | 低 | 低 | 中 | 高 |
| **Docker 支持** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

### 3.2 选型决策树

```
应用类型？
├── Next.js App Router / SSR
│   └── → Vercel（首选，框架作者运营）
├── 边缘优先 / 全球低延迟 API
│   ├── Cloudflare 生态？ → Cloudflare Workers + D1/KV
│   └── 通用边缘？ → Vercel Edge / Fly.io
├── 全栈（前端 + API + 数据库）
│   ├── 需要托管数据库？ → Railway / Render / Fly.io
│   └── 已有 AWS 生态？ → AWS Amplify / ECS
├── 静态站点 / JAMstack
│   ├── 需要 Edge Functions？ → Cloudflare Pages / Vercel
│   └── 简单静态？ → Netlify / Cloudflare Pages
├── 容器化微服务
│   ├── 需要全球边缘容器？ → Fly.io
│   └── 传统 K8s？ → AWS EKS / GKE / Azure AKS
└── 实时/WebSocket 应用
    └── → Render / Railway / Fly.io（避免 Serverless 冷启动）
```

### 3.3 2026 年推荐组合

| 场景 | 推荐平台 | 备选 |
|------|----------|------|
| Next.js 全栈 | **Vercel** | Cloudflare Pages |
| 边缘 API / 低延迟 | **Cloudflare Workers** | Vercel Edge |
| 全栈 + 数据库 | **Railway** / **Render** | Fly.io |
| 容器化部署 | **Fly.io** | Railway, Render |
| 企业级 AWS 生态 | **AWS** (ECS/Lambda/Amplify) | — |
| 预算优先 / 个人项目 | **Cloudflare Pages** | Vercel Hobby |

---

## 4. 数据库选型

### 4.1 决策矩阵

| 维度 | PostgreSQL + Prisma 7 | PostgreSQL + Drizzle | Turso (libSQL) | Cloudflare D1 | Neon | Supabase |
|------|:---------------------:|:--------------------:|:--------------:|:-------------:|:----:|:--------:|
| **TypeScript 类型安全** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Edge/Serverless 原生** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **包体积** | ~1.6MB (WASM) | ~7KB | ~7KB + driver | 绑定 | ~7KB + driver | 中等 |
| **冷启动** | 中 | 极低 | 极低 | 极低 | 低 | 低 |
| **完整 SQL 功能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **全球分布/复制** | 需配置 | 需配置 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **实时订阅** | ❌ | ❌ | ❌ | ❌ | ❌ | ⭐⭐⭐⭐⭐ |
| **Auth 集成** | 需自建 | 需自建 | 需自建 | 需自建 | 需自建 | ⭐⭐⭐⭐⭐ |
| **免费额度** | 依赖托管商 | 依赖托管商 | 500 DB + 10GB | 5GB + 25M读 | 永久 Free | 500MB |
| **适用数据量** | 无上限 | 无上限 | < 10GB | < 10GB | 无上限 | 无上限 |

### 4.2 选型决策树

```
部署环境？
├── 边缘 / Serverless（Cloudflare/Vercel Edge）
│   ├── Cloudflare Workers？ → D1 + Drizzle（原生绑定）
│   ├── 读多写少 / 多租户？ → Turso + Drizzle（500 免费 DB）
│   └── 需要完整 PG？ → Neon + Drizzle/Prisma 7
├── 传统后端 / Node.js 服务
│   ├── 追求开发体验 + 类型安全？ → PostgreSQL + Prisma 7
│   ├── 追求 SQL 灵活 + 轻量？ → PostgreSQL + Drizzle
│   └── 复杂领域模型 / Unit of Work？ → PostgreSQL + MikroORM
├── 实时应用（聊天/协作）
│   └── → Supabase（PostgreSQL + Realtime + Auth）
├── MongoDB 生态
│   └── → Mongoose（传统）或 Prisma MongoDB Connector
└── 缓存 / 会话 / 实时
    └── → Redis（ioredis）/ Upstash Redis
```

### 4.3 2026 年推荐组合

| 场景 | 推荐组合 | 理由 |
|------|----------|------|
| 现代全栈 TypeScript | **PostgreSQL + Prisma 7** 或 **Drizzle** | 生态最成熟，类型安全 |
| Cloudflare Workers | **D1 + Drizzle** | 原生绑定，零网络开销 |
| 多租户 SaaS | **Turso + Drizzle** | 每租户独立 DB，全球副本 |
| 实时应用 | **Supabase** | PG + Realtime + Auth 一体化 |
| 边缘优先 | **Neon + Drizzle** | Serverless PG，存储计算分离 |
| 复杂后端 | **PostgreSQL + Prisma 7** | Schema-first，迁移成熟 |

---

## 5. 认证方案选型

### 5.1 决策矩阵

| 维度 | better-auth | Auth.js v5 | Clerk | Supabase Auth | WorkOS | Stack Auth |
|------|:-----------:|:----------:|:-----:|:-------------:|:------:|:----------:|
| **自托管 / 零锁定** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ⚠️ 平台绑定 | ❌ | ⚠️ |
| **TypeScript 类型安全** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **快速集成（分钟级）** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **预构建 UI** | ❌ | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ | ⭐⭐⭐⭐⭐ |
| **Passkeys / WebAuthn** | ✅ 插件 | ✅ | ✅ | ✅ | ❌ | ✅ |
| **多因素认证 (2FA)** | ✅ 插件 | ✅ | ✅ Pro | ✅ | ❌ | ✅ |
| **组织/多租户 (B2B)** | ✅ 插件 | ⚠️ 需自建 | ✅ Pro | ⚠️ RLS | ⭐⭐⭐⭐⭐ | ✅ |
| **企业 SSO (SAML)** | ⚠️ 需自建 | ⚠️ 需自建 | ✅ Pro | ✅ | ⭐⭐⭐⭐⭐ | ⚠️ |
| **边缘运行时兼容** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ Next.js |
| **定价** | 开源免费 | 开源免费 | 按 MAU | 免费起步 | 按企业客户 | 开源+托管 |

### 5.2 选型决策树

```
项目阶段与需求？
├── 快速上线 / MVP / PoC
│   ├── 使用 Next.js 且希望预构建 UI？ → Stack Auth / Clerk
│   └── 框架无关，快速集成？ → Clerk
├── 自托管 / 零供应商锁定
│   ├── 2026 新项目，TS-first？ → better-auth（推荐）
│   ├── 已有 NextAuth v4？ → 评估迁移至 Auth.js v5 或 better-auth
│   └── 需要插件化架构？ → better-auth
├── 已有 Supabase 生态
│   └── → Supabase Auth（RLS 与数据库权限无缝结合）
├── B2B SaaS / 企业客户对接
│   ├── 需要 SSO / SCIM / 目录同步？ → WorkOS
│   └── 自托管 B2B？ → better-auth + organization 插件
├── 认证方式需求
│   ├── 需要 Passkeys + 2FA + OAuth + Magic Link？ → better-auth（插件化）
│   ├── 需要 100+ OAuth Provider？ → Auth.js v5
│   └── 基础邮箱/密码 + OAuth？ → 任意方案均可
└── 边缘部署
    ├── Cloudflare Workers / Hono？ → better-auth
    └── Next.js Edge？ → Auth.js v5 / better-auth / Clerk
```

### 5.3 2026 年推荐组合

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| 2026 新项目（通用）| **better-auth** | 插件架构，零锁定，TS-first |
| Next.js 快速上线 | **Stack Auth** 或 **Clerk** | 预构建 UI，深度集成 |
| 已有 Auth.js v4 | **Auth.js v5**（迁移）或 **better-auth** | 官方继任者 |
| Supabase 全栈 | **Supabase Auth** | RLS 一体化 |
| B2B 企业 SaaS | **WorkOS** | SSO/SCIM 原生 |
| 自托管 + 多认证方式 | **better-auth** | 插件按需组合 |

---

## 6. 综合技术栈推荐（2026）

### 6.1 按项目规模

| 规模 | 构建 | 测试 | 部署 | 数据库 | 认证 | 可观测性 |
|------|------|------|------|--------|------|----------|
| **个人/原型** | Vite | Vitest | Vercel / Cloudflare Pages | Turso / D1 | better-auth | Sentry Free |
| **初创（<10人）** | Vite + Turborepo | Vitest + Playwright | Vercel / Railway | PostgreSQL + Drizzle | better-auth / Clerk | Sentry + OpenTelemetry |
| **中型（10-50人）** | Vite + Turborepo/Nx | Vitest + Playwright + Chromatic | Vercel + Railway / AWS | PostgreSQL + Prisma 7 | better-auth + Org 插件 | Sentry + Grafana |
| **企业（50+人）** | Nx + Rspack/Vite | 多层测试体系 | AWS / GCP / Azure | PostgreSQL + Prisma 7 / Oracle | WorkOS + better-auth | 全链路 OTel + 自建 |

### 6.2 按技术偏好

| 偏好 | 技术栈组合 |
|------|------------|
| **边缘优先 (Edge-First)** | Vite · Vitest · Cloudflare Workers · D1/Turso · better-auth · OpenTelemetry |
| **Vercel 生态** | Vite · Vitest · Vercel · PostgreSQL + Prisma 7 · Auth.js v5 · Sentry |
| **极简工具链** | Bun · node:test · Railway · SQLite + Drizzle · better-auth · pino |
| **企业级全栈** | Nx · Vitest + Playwright · AWS EKS · PostgreSQL + Prisma 7 · WorkOS · Datadog |
| **开源优先** | Rolldown · Vitest · Fly.io · PostgreSQL + Drizzle · better-auth · OpenTelemetry |

---

## 7. 关键约束检查清单

在最终确定基础设施栈前，请确认以下约束：

- [ ] **构建工具**是否与团队现有配置兼容？迁移成本是否可接受？
- [ ] **测试工具**是否覆盖单元/集成/E2E 三层？CI 执行时间是否可接受？
- [ ] **部署平台**是否支持目标运行时（Node.js / Edge / Workers）？
- [ ] **数据库**的冷启动时间是否满足 SLA？连接模型是否适配 Serverless？
- [ ] **认证方案**是否支持所有必要的登录方式？是否满足合规要求（SOC 2 / GDPR）？
- [ ] **可观测性**是否覆盖日志、指标、链路追踪三支柱？
- [ ] **安全**是否包含依赖扫描（SCA）、静态分析（SAST）和运行时防护？

---

> 📅 本文档最后更新：2026年4月
>
> 🔗 相关索引：[技术基础设施总索引](../infrastructure-index.md)
