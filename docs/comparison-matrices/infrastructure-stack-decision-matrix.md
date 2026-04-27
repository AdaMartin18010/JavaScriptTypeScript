# 技术基础设施决策矩阵

> 覆盖构建工具、测试策略、部署平台、数据库、认证方案的系统性选型参考。

---

## 1. 构建工具选型矩阵

| 工具 | 速度 | 配置复杂度 | 生态成熟度 | HMR | 最佳场景 |
|------|------|-----------|-----------|-----|---------|
| **Vite** | ⭐⭐⭐⭐⭐ | 低 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 现代前端项目首选 |
| **Webpack** | ⭐⭐⭐ | 高 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 遗留项目、复杂定制 |
| **esbuild** | ⭐⭐⭐⭐⭐ | 低 | ⭐⭐⭐ | ⭐⭐⭐ | 库开发、快速打包 |
| **Rollup** | ⭐⭐⭐⭐ | 中 | ⭐⭐⭐⭐ | ⭐⭐⭐ | 库/组件打包 |
| **Rolldown** | ⭐⭐⭐⭐⭐ | 低 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Vite 8 底层，未来方向 |
| **Oxc** | ⭐⭐⭐⭐⭐ | 低 | ⭐⭐ | ⭐⭐ | 全链路 Rust 工具链 |
| **Farm** | ⭐⭐⭐⭐⭐ | 低 | ⭐⭐ | ⭐⭐⭐⭐ | Rust 构建，Webpack 兼容 |

---

## 2. 测试策略选型矩阵

| 工具 | 类型 | 速度 | 浏览器模拟 | 最佳场景 |
|------|------|------|-----------|---------|
| **Vitest** | 单元测试 | ⭐⭐⭐⭐⭐ | ❌ | Vite 项目首选 |
| **Jest** | 单元测试 | ⭐⭐⭐⭐ | ❌ | 非 Vite 传统项目 |
| **Playwright** | E2E 测试 | ⭐⭐⭐⭐ | 真浏览器 | 跨浏览器 E2E |
| **Cypress** | E2E 测试 | ⭐⭐⭐ | 真浏览器 | 前端团队友好 |
| **Storybook Test** | 组件测试 | ⭐⭐⭐⭐ | 虚拟 | UI 组件可视化测试 |

**推荐组合**：
- 现代项目：Vitest（单元）+ Playwright（E2E）
- 传统项目：Jest（单元）+ Cypress（E2E）

---

## 3. 部署平台选型矩阵

| 平台 | 类型 | 冷启动 | 全球边缘 | 成本模型 | 最佳场景 |
|------|------|--------|---------|---------|---------|
| **Vercel** | Serverless | 中 | ✅ | 按请求+带宽 | Next.js 全栈 |
| **Cloudflare** | Edge Worker | 极低 | ✅ | 按请求+CPU | 边缘 API / 静态 |
| **Fly.io** | Container | 低 | ✅ | 按 VM+带宽 | 有状态服务 |
| **Railway** | Container | 低 | ❌ | 按资源 | 快速原型 |
| **AWS Lambda** | Serverless | 高 | ❌ | 按请求+时长 | 企业 AWS 生态 |
| **Netlify** | Static/Jamstack | 无 | ✅ | 按请求+带宽 | 静态站点 |

---

## 4. 数据库选型矩阵

| 数据库 | 类型 | 边缘支持 | 全局复制 | 最佳场景 |
|--------|------|---------|---------|---------|
| **PostgreSQL** | 关系型 | ❌ | 手动 | 传统应用、复杂查询 |
| **Neon** | Serverless Postgres | ✅ | 分支 | 全栈应用、开发环境 |
| **Turso** | SQLite (边缘) | ✅ | ✅ | 移动/边缘应用 |
| **Cloudflare D1** | SQLite (边缘) | ✅ | 区域 | Workers 应用 |
| **MongoDB Atlas** | 文档型 | ❌ | ✅ | 灵活 schema |
| **Redis** | 缓存/KV | ❌ | ✅ | 会话、缓存、实时 |
| **PlanetScale** | MySQL (Serverless) | ✅ | 分支 | MySQL 兼容需求 |

---

## 5. 认证方案选型矩阵

| 方案 | 类型安全 | Passkeys | OAuth 2.1 | 企业 SSO | 自托管 | 最佳场景 |
|------|---------|----------|-----------|---------|--------|---------|
| **better-auth** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | 插件 | ✅ | 新 TS 项目首选 |
| **Auth.js v5** | ⭐⭐⭐⭐ | ✅ | ✅ | 企业版 | ❌ | Next.js 生态 |
| **Clerk** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ✅ | ❌ | 快速启动、多平台 |
| **WorkOS** | ⭐⭐⭐⭐ | ❌ | ✅ | ✅ | ❌ | B2B SaaS |
| **Stack Auth** | ⭐⭐⭐⭐ | ✅ | ✅ | ❌ | ✅ | 开源友好 |

---

## 6. 基础设施栈推荐

### 现代全栈 TS 项目（2026 推荐栈）

```
构建: Vite + Rolldown
测试: Vitest + Playwright
部署: Vercel / Cloudflare
数据库: PostgreSQL (Neon) / Turso (边缘)
认证: better-auth
可观测性: OpenTelemetry + Sentry
AI: Vercel AI SDK + MCP
```

### 极简边缘项目

```
构建: 原生 TypeScript (Node 24 strip-types)
框架: Hono
部署: Cloudflare Workers
数据库: D1
认证: OAuth 2.1 (自定义)
```

---

> 📊 以上矩阵数据基于 2026-04 生态状态，建议每季度通过 [trend-monitor.js](../../scripts/trend-monitor.js) 验证数据时效性。

*最后更新: 2026-04-27*
*review-cycle: 3 months*
*next-review: 2026-07-27*
*status: current*
