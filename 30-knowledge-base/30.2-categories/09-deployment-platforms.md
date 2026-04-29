# 部署平台 (Deployment Platforms)

> JavaScript/TypeScript 应用部署平台的全景对比，覆盖边缘部署、无服务器与容器化方案。

---

## 核心概念

2026 年部署平台按**运行时模型**分为三类：

| 模型 | 特点 | 代表平台 |
|------|------|---------|
| **边缘部署** | V8 Isolates，全球 CDN，极低冷启动 | Vercel Edge, Cloudflare Pages, Deno Deploy |
| **无服务器函数** | 事件驱动，按需计费，自动扩缩容 | Vercel Serverless, Netlify Functions, AWS Lambda |
| **容器化部署** | 完整 Node.js 运行时，持久化支持 | Railway, Render, Fly.io, DigitalOcean |

> **关键认知**：没有"最好的平台"，只有"最适合你业务模型"的平台。

---

## 主流平台对比矩阵

| 维度 | Vercel | Netlify | Cloudflare Pages | Railway | Render |
|------|--------|---------|------------------|---------|--------|
| **核心优势** | Next.js 原生，最佳 DX | 多框架支持，商业免费 | 无限带宽，边缘优先 | 全栈一体，数据库原生 | Docker 原生，Heroku 替代 |
| **Next.js App Router** | ✅ 完美支持 | ✅（Next Runtime） | ⚠️ 部分支持 | ✅ | ✅ |
| **ISR** | ✅ 原生 | ✅ | ⚠️ 需配置 | ⚠️ | ⚠️ |
| **Edge Middleware** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Preview Deployments** | ✅（PR 自动预览） | ✅ | ✅ | ❌ | ❌ |
| **冷启动** | 无 | 无 | ~12ms | 无（持续运行） | 30–60s（免费 tier） |
| **免费构建分钟** | 6,000/月 | 300/月 | 500/月 | 500/月 | 500/月 |
| **带宽（免费）** | 100 GB | 100 GB | 无限 | 100 GB | 100 GB |
| **商业使用（免费 tier）** | ❌ 禁止 | ✅ 允许 | ✅ 允许 | ✅ 允许 | ✅ 允许 |
| **数据库原生** | ❌（需外部） | ❌（需外部） | D1 / KV | ✅ Postgres/Redis/MySQL | ✅ Postgres/Redis |
| **定价（Pro）** | $20/用户/月 | $19/用户/月 | $5/月 | $20/月（固定） | 按服务计费 |

---

## 深度对比

### Vercel vs Netlify

| 指标 | Vercel | Netlify |
|------|--------|---------|
| TTFB（平均） | ~70ms | ~90ms |
| Edge Function 冷启动 | ~12ms | ~28ms |
| Serverless 冷启动 | ~1s | ~3s+ |
| 边缘节点数 | 100+ | 16+ |
| Turborepo 集成 | 原生 | 插件 |

> **实测数据**：Social Animal 团队运行 91K+ ISR 页面，Vercel Pro 为主力平台，Netlify 处理 Astro 静态站点。

### Cloudflare Pages 的独特价值

- **无限带宽**：高流量场景下成本显著低于 Vercel/Netlify
- **Workers 集成**：同一平台部署静态页面 + 边缘函数 + D1 数据库
- **D1 边缘数据库**：SQLite 兼容，全球复制，查询延迟 <50ms
- **限制**：Next.js App Router 部分功能（如 Server Actions）需适配

### Railway 与 Render 的全栈定位

| 特性 | Railway | Render |
|------|---------|--------|
| 定价模式 | 用量计费 + 固定 Pro | 按服务计费 |
| 数据库 | 一键创建 Postgres/Redis | 一键创建 Postgres/Redis |
| Docker | 原生支持 | 原生支持 |
| 后台任务 | 原生支持 | 原生支持（Cron） |
| 预览部署 | ❌ | ❌ |
| 最佳场景 | 全栈 Next.js + 数据库 | Heroku 迁移，Docker 部署 |

---

## 选型决策树

```
项目需求？
├── Next.js + 前沿功能优先 → Vercel
├── 多框架 / 商业免费 tier → Netlify
├── 高流量 / 成本控制优先 → Cloudflare Pages
├── 全栈（前端 + 数据库 + 后端）→ Railway
├── Heroku 迁移 / Docker 原生 → Render
└── 全球边缘 + 低延迟 API → Cloudflare Workers / Deno Deploy
```

---

## 2026 新兴趋势

### 边缘数据库崛起

- **Cloudflare D1**：SQLite 兼容，全球边缘复制，零配置
- **Turso**：libSQL  fork，基于 Fly.io 全球部署，嵌入式 SQLite
- **Vercel Postgres / KV**：与 Next.js 深度集成，Vercel Dashboard 统一管理

### ISR 与 Partial Prerendering (PPR)

Next.js 14+ 的 PPR 允许页面同时包含静态和动态部分：

- **Vercel**：原生支持，零配置
- **Netlify**：通过 Next Runtime 支持
- **自托管**：需自定义缓存策略和 CDN 配置

### 部署平台 MCP Server

2026 年多个平台推出 **MCP（Model Context Protocol）Server**，允许 AI Agent 直接执行部署、回滚、日志查询等操作：

- Vercel MCP：通过 AI 触发部署和预览
- Cloudflare MCP：管理 Workers 和 KV 存储
- Railway MCP：创建数据库实例和服务

---

## 最佳实践

1. **分离构建与部署**：CI 负责构建 Artifact，部署平台仅负责分发
2. **环境一致性**：开发 / 预览 / 生产使用相同 Node.js 版本和构建参数
3. **健康检查**：部署后自动探测 `/health` 端点，失败自动回滚
4. **带宽监控**：设置告警阈值，避免意外超额费用（Vercel $0.15/GB，Netlify 更贵）
5. **边缘安全**：敏感 API 使用边缘鉴权（JWT + Cloudflare Access / Vercel Edge Config）

---

## 参考资源

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel vs Netlify vs Cloudflare (2026)](https://socialanimal.dev/blog/best-deployment-stack-nextjs-vercel-netlify-cloudflare/)
- [Best Next.js Hosting 2026](https://thesoftwarescout.com/best-hosting-for-next-js-apps-in-2026-where-to-deploy-your-project/)

---

## 关联文档

- `30-knowledge-base/30.2-categories/13-ci-cd.md`
- `30-knowledge-base/30.2-categories/08-monorepo-tools.md`
- `20-code-lab/20.8-edge-serverless/`
- `40-ecosystem/comparison-matrices/deployment-platforms-compare.md`

---

*最后更新: 2026-04-29*
