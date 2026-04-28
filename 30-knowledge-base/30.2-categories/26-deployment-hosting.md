---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
> **⚠️ 维度边界说明**
>
> 本文档属于 **技术基础设施（Technical Infrastructure）** 维度，聚焦部署平台与托管基础设施选型。
>
> - ✅ **属于本文档范围**：部署平台对比、托管服务特性、冷启动分析、定价模型、CI/CD 集成。
> - ❌ **不属于本文档范围**：具体应用的部署脚本、环境配置管理、业务发布策略、域名/CDN 配置教程。
> - 🔗 **相关索引**：[`docs/infrastructure-index.md`](../infrastructure-index.md)

# 部署与托管平台

> 本文档盘点 JavaScript/TypeScript 生态中最主流的前端/全栈应用部署与托管平台，覆盖 Serverless、边缘计算、容器化与传统 PaaS 方案。每个平台均分析其核心优势、限制、定价模型、与主流 JS 框架的集成度及冷启动表现。

---

## 📊 整体概览

| 平台 | 类型 | 边缘网络 | 冷启动 | 与 JS 框架集成 |
|------|------|:--------:|:------:|:--------------:|
| Vercel | Serverless / Edge | ✅ 全球 | 低 | ⭐⭐⭐⭐⭐ |
| Netlify | Jamstack / Edge | ✅ 全球 | 低 | ⭐⭐⭐⭐ |
| Cloudflare Pages | 静态 / Workers | ✅ 全球（300+ 节点） | 极低 | ⭐⭐⭐⭐⭐ |
| Cloudflare Workers | Edge Runtime | ✅ 全球 | 极低（0ms） | ⭐⭐⭐⭐⭐ |
| AWS Amplify | 全栈 / AWS 集成 | ⚠️ CloudFront | 中 | ⭐⭐⭐⭐ |
| Render | PaaS / 容器 | ❌ | 低 | ⭐⭐⭐⭐ |
| Fly.io | 容器 / 边缘 | ✅ 全球 | 低 | ⭐⭐⭐⭐ |
| Railway | PaaS / 容器 | ❌ | 低 | ⭐⭐⭐⭐ |
| DigitalOcean App Platform | PaaS | ❌ | 低 | ⭐⭐⭐ |

---

## 1. Vercel

| 属性 | 详情 |
|------|------|
| **名称** | Vercel |
| **类型** | Serverless Functions + Edge Network |
| **官网** | [vercel.com](https://vercel.com) |

**一句话描述**：Next.js 的缔造者与最佳运行平台，提供零配置的前端部署与 Serverless Functions，是 React 生态的首选托管商。

**核心优势**：

- **Next.js 原生优化**：App Router、Server Components、ISR、Edge Runtime 的一等公民支持
- **零配置部署**：Git 推送即部署，自动识别框架
- **Preview Deployments**：每个 PR 自动生成独立预览环境
- **Turborepo Remote Cache**：免费集成 Monorepo 构建缓存
- **Vercel Functions**：Node.js / Edge Runtime 双模式
- **图像优化**：`next/image` 自动适配

**限制**：

- Serverless Function 最长执行 300s（Hobby）/ 900s（Pro）
- Edge Runtime 不支持原生 Node.js API（fs、crypto 部分受限）
- 大文件存储需搭配外部服务（S3、Cloudflare R2）
- 数据库连接需注意 Serverless 环境下的连接池管理

**定价**（2026年4月参考）：

| 层级 | 费用 | 包含 |
|------|------|------|
| Hobby | 免费 | 无限制站点，350MB 函数，125K 边缘请求/月 |
| Pro | $20/月/成员 | 1TB 带宽，25M 边缘请求，更长函数超时 |
| Enterprise | 定制 | SLA、SSO、专属支持 |

**冷启动表现**：Node.js Serverless 约 50-200ms；Edge Runtime 接近 0ms。

---

## 2. Netlify

| 属性 | 详情 |
|------|------|
| **名称** | Netlify |
| **类型** | Jamstack + Serverless Functions |
| **官网** | [netlify.com](https://netlify.com) |

**一句话描述**：Jamstack 运动的先驱平台，以 Git-based 工作流和强大的构建插件生态闻名。

**核心优势**：

- **Git-based 工作流**：推送即部署，分支预览
- **Netlify Functions**：基于 AWS Lambda 的无服务器函数
- **Edge Functions**：基于 Deno 的边缘计算
- **Forms / Identity**：内置表单处理和用户认证
- **Split Testing**：A/B 测试原生支持
- **Build Plugins**：丰富的构建阶段插件

**限制**：

- Functions 运行时为 AWS Lambda（非最新 Node 版本）
- Edge Functions 基于 Deno，与 Node 生态有差异
- Next.js 支持度不如 Vercel（需 `next.config.js` 适配）

**定价**（2026年4月参考）：

| 层级 | 费用 | 包含 |
|------|------|------|
| Starter | 免费 | 100GB 带宽，125K 函数请求/月 |
| Pro | $19/月 | 1TB 带宽，2M 函数请求 |
| Business | $99/月 | 1.5TB 带宽，优先支持 |

**冷启动表现**：AWS Lambda 基础，约 100-300ms；Edge Functions 约 10-50ms。

---

## 3. Cloudflare Pages

| 属性 | 详情 |
|------|------|
| **名称** | Cloudflare Pages |
| **类型** | 静态托管 + Functions |
| **官网** | [pages.cloudflare.com](https://pages.cloudflare.com) |

**一句话描述**：Cloudflare 的静态站点托管服务，与 Workers 深度整合，支持边缘函数和 D1/KV/R2 原生绑定。

**核心优势**：

- **全球 300+ 边缘节点**：静态内容全球即时分发
- **Pages Functions**：基于 Cloudflare Workers 的函数支持
- **原生 Bindings**：直接访问 D1（SQLite）、KV、R2（对象存储）
- **免费额度极为慷慨**：无限请求、无限带宽（公平使用）
- **Git 集成**：GitHub/GitLab 自动构建部署
- **Preview 分支**：自动为分支创建预览 URL

**限制**：

- Functions 必须兼容 Workers Runtime（无原生 Node.js API）
- 构建时间限制（免费 20 分钟/构建）
- 大型 Monorepo 构建可能受限

**定价**（2026年4月参考）：

| 层级 | 费用 | 包含 |
|------|------|------|
| Free | 免费 | 无限请求，500 构建/月，100K 函数请求/天 |
| Pro | $5/月 | 优先图像处理，更多分析 |
| Business | $20/月 | 更多规则、分析、支持 |

**冷启动表现**：Workers Runtime 冷启动几乎为 0ms（V8 Isolate 复用）。

---

## 4. Cloudflare Workers

| 属性 | 详情 |
|------|------|
| **名称** | Cloudflare Workers |
| **类型** | Edge Runtime / Serverless |
| **官网** | [workers.cloudflare.com](https://workers.cloudflare.com) |

**一句话描述**：运行在 Cloudflare 全球边缘网络的 V8 Isolate 无服务器平台，以零冷启动和极低延迟著称。

**核心优势**：

- **零冷启动**：V8 Isolate 预热，请求响应 < 1ms
- **全球部署**：代码自动分发至 300+ 数据中心
- **Workers Runtime**：基于 WinterTC 标准，支持现代 Web API
- **Bindings 生态**：D1、Durable Objects、KV、R2、Queue、AI
- **wrangler CLI**：完善的本地开发和部署工具链
- **与 Pages 整合**：Pages Functions 即 Workers

**限制**：

- 非 Node.js 运行时（无 fs、部分 crypto 差异）
- 单次请求 CPU 时间限制（免费 10ms，付费 50ms）
- 包体积限制（免费 1MB，付费 无限制 gzip 后）
- 长时间运行任务不适合（无后台执行）

**定价**（2026年4月参考）：

| 层级 | 费用 | 包含 |
|------|------|------|
| Free | 免费 | 100K 请求/天，10ms CPU |
| Workers Paid | $0.30/百万请求 | 无限制请求，50ms CPU |
| Workers Unbound | 按 CPU + 请求 | 更长执行时间 |

**冷启动表现**：0ms（真正的无冷启动）。

---

## 5. AWS Amplify

| 属性 | 详情 |
|------|------|
| **名称** | AWS Amplify |
| **类型** | 全栈托管（前端 + 后端） |
| **官网** | [aws.amazon.com/amplify](https://aws.amazon.com/amplify) |

**一句话描述**：AWS 面向前端开发者的全栈托管平台，整合静态托管、Serverless Functions、Auth、Datastore 等 AWS 服务。

**核心优势**：

- **AWS 生态深度整合**：Cognito、AppSync、DynamoDB、S3、Lambda
- **Gen 2 架构**：基于 CDK 的基础设施即代码
- **Auth / Storage / API 一站式**：前端 SDK 直接调用
- **SSR 支持**：Next.js、Nuxt、Astro 的 SSR 部署

**限制**：

- 学习曲线陡峭，AWS 概念众多
- 冷启动受 Lambda 影响（100-500ms）
- 定价模型复杂，易产生意外费用
- 构建和部署速度不如 Vercel/Netlify

**定价**：按 AWS 服务用量计费，无固定月费。

**冷启动表现**：Lambda 基础，约 100-500ms；Provisioned Concurrency 可降低至 < 10ms（额外费用）。

---

## 6. Render

| 属性 | 详情 |
|------|------|
| **名称** | Render |
| **类型** | PaaS（Web Service + Static Site + Worker） |
| **官网** | [render.com](https://render.com) |

**一句话描述**：开发者友好的 PaaS 平台，支持 Web 服务、静态站点、后台任务和数据库一站式托管。

**核心优势**：

- **原生 Web Service**：传统长运行服务（非 Serverless）
- **自动 HTTPS 和自定义域名**
- **Blueprint（基础设施即代码）**：`render.yaml` 定义服务
- **后台 Worker 和 Cron Jobs**
- **托管 PostgreSQL 和 Redis**
- **零配置部署**：支持 Dockerfile

**限制**：

- 无全球边缘网络（美国/欧洲区域）
- 免费 tier 有休眠（15 分钟无请求进入休眠，启动约 30s）
- 大规模场景下成本可能高于专用云

**定价**（2026年4月参考）：

| 层级 | 费用 | 包含 |
|------|------|------|
| Free | 免费 | Web Service 休眠，PostgreSQL 90 天过期 |
| Starter | $7/月/服务 | 512MB RAM，永不休眠 |
| Standard | $25/月/服务 | 2GB RAM，更高性能 |

**冷启动表现**：永不休眠的实例无冷启动；免费实例从休眠恢复约 30s。

---

## 7. Fly.io

| 属性 | 详情 |
|------|------|
| **名称** | Fly.io |
| **类型** | 容器平台 / 边缘计算 |
| **官网** | [fly.io](https://fly.io) |

**一句话描述**：以容器为部署单元的全球边缘平台，将应用运行在靠近用户的数据中心，提供类似 Serverless 的体验但使用标准容器。

**核心优势**：

- **全球边缘容器**：应用运行在 30+ 区域的微型 VM（Firecracker）
- **标准 Dockerfile**：任何语言/框架，无供应商锁定
- **PostgreSQL / Redis / Tigris（S3）原生托管**
- **自动 HTTPS 和 Anycast 负载均衡**
- **Machine API**：程序化控制实例生命周期
- **Node.js / Bun 友好**：直接容器化部署

**限制**：

- 学习曲线（`fly.toml` 配置、VM 概念）
- 免费 tier 有资源限制
- 部分区域稳定性不如大云厂商

**定价**（2026年4月参考）：

| 层级 | 费用 | 包含 |
|------|------|------|
| Free | 免费 | 3 个共享 CPU 实例，160GB 出站/月 |
| Launch | 按用量 | $1.94/月/VM（最低配置），$0.15/GB 出站 |

**冷启动表现**：微 VM 启动约 300ms-2s；已运行实例无冷启动。

---

## 8. Railway

| 属性 | 详情 |
|------|------|
| **名称** | Railway |
| **类型** | PaaS / 容器化部署 |
| **官网** | [railway.app](https://railway.app) |

**一句话描述**：以开发者体验为核心设计的现代 PaaS，从代码到部署只需几分钟，自动处理基础设施。

**核心优势**：

- **极致的开发者体验**：Git 推送即部署，自动检测语言
- **自动伸缩**：按 CPU/内存用量弹性伸缩
- **托管数据库**：PostgreSQL、MySQL、Redis、MongoDB 一键创建
- **环境变量和 Secrets 管理**
- **Team 协作和 PR 预览环境**
- **Volume 持久化存储**

**限制**：

- 仅支持特定区域（北美/欧洲）
- 无边缘网络，全球用户访问延迟不均
- 长时间运行高负载成本较高

**定价**（2026年4月参考）：

| 层级 | 费用 | 包含 |
|------|------|------|
| Hobby | $5/月 | 512MB RAM，共享 CPU，3GB 磁盘 |
| Pro | $20/月 + 按用量 | 更高配额，优先支持 |

**冷启动表现**：容器启动约 5-15s；运行中实例无冷启动。

---

## 9. DigitalOcean App Platform

| 属性 | 详情 |
|------|------|
| **名称** | DigitalOcean App Platform |
| **类型** | PaaS |
| **官网** | [digitalocean.com/products/app-platform](https://www.digitalocean.com/products/app-platform) |

**一句话描述**：DigitalOcean 推出的全托管应用平台，简化容器和静态站点的部署，适合已使用 DO 生态的开发者。

**核心优势**：

- **与 DigitalOcean 生态整合**：托管数据库、Space（S3）、K8s
- **Git 推送部署**：支持 GitHub/GitLab
- **自动 HTTPS 和 CDN**
- **水平伸缩配置**
- **定价透明**：固定月费 + 按容器规格

**限制**：

- 功能相对基础，不如 Vercel/Fly.io 丰富
- 构建和部署速度一般
- 生态和第三方集成较少

**定价**（2026年4月参考）：

| 层级 | 费用 | 包含 |
|------|------|------|
| Starter | 免费 | 静态站点，构建部署 |
| Basic | $5/月/容器 | 512MB RAM，1vCPU |
| Pro | $12/月/容器 | 1GB RAM，1vCPU |

**冷启动表现**：基础容器启动约 10-30s。

---

## 10. 统一对比矩阵

| 维度 | Vercel | Netlify | Cloudflare Pages | Cloudflare Workers | AWS Amplify | Render | Fly.io | Railway | DO App Platform |
|------|:------:|:-------:|:----------------:|:------------------:|:-----------:|:------:|:------:|:-------:|:---------------:|
| **静态托管** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| **Serverless/Edge Functions** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ |
| **长运行服务** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **全球边缘网络** | ✅ | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ | ❌ | ✅ | ❌ | ⚠️ |
| **Next.js 支持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **数据库托管** | ❌ | ❌ | ✅ (D1) | ✅ (D1) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **零冷启动** | ❌ | ❌ | ✅ | ✅ | ❌ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| **免费额度慷慨度** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **供应商锁定** | 高 | 中 | 中 | 中 | 高 | 低 | 低 | 中 | 中 |
| **Docker/容器支持** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## 11. 选型建议

### 按应用类型

| 应用类型 | 推荐平台 | 备选 |
|----------|----------|------|
| Next.js App Router / SSR | **Vercel** | Cloudflare Pages, Netlify |
| React SPA / 静态站点 | **Vercel** / **Netlify** | Cloudflare Pages |
| 边缘优先 / 全球低延迟 | **Cloudflare Workers** | Vercel Edge, Fly.io |
| 全栈（前端 + API + 数据库）| **Railway** / **Render** | Fly.io |
| 容器化微服务 | **Fly.io** / **Railway** | Render, DO App Platform |
| AWS 生态深度整合 | **AWS Amplify** | — |
| 预算优先 / 个人项目 | **Cloudflare Pages** | Vercel Hobby, Render Free |

### 按技术栈

| 框架 | 首选平台 | 原因 |
|------|----------|------|
| Next.js | **Vercel** | 框架作者运营，功能最全 |
| Nuxt | **Vercel** / **Netlify** | 官方文档推荐 |
| SvelteKit | **Vercel** / **Netlify** | 适配器支持完善 |
| TanStack Start | **Cloudflare Pages** / **Vercel** | 边缘原生支持 |
| Astro | **Vercel** / **Netlify** / **Cloudflare Pages** | 静态输出 + 按需渲染 |
| Remix | **Vercel** / **Cloudflare Pages** | 官方适配器 |
| Express / NestJS | **Railway** / **Render** / **Fly.io** | 长运行服务 |
| Hono | **Cloudflare Workers** / **Vercel** | 边缘运行时优化 |

### 冷启动敏感场景

| 场景 | 推荐平台 |
|------|----------|
| 实时 WebSocket | Fly.io, Railway, Render（避免 Serverless） |
| 高频 API（< 50ms SLA）| Cloudflare Workers, Vercel Edge |
| 后台任务 / Cron | Render Worker, Fly.io Machine, Railway |
| 大规模文件处理 | AWS Lambda（Provisioned）+ S3 |

### 相关决策树与对比矩阵

- [部署平台选型决策树](../../docs/decision-trees.md#9-部署平台选型决策树)
- [部署平台对比矩阵](../comparison-matrices/deployment-platforms-compare.md)

---

## 12. 最佳实践

1. **区分静态与动态**：静态内容用 CDN 边缘托管，动态 API 用 Serverless 或长运行服务
2. **数据库连接池**：Serverless 环境使用连接池代理（Prisma Accelerate, PlanetScale Serverless）
3. **环境一致性**：使用 Docker 本地开发，减少 "在我机器上能跑"
4. **边缘运行时兼容**：使用 Web 标准 API（fetch、crypto、streams），避免 Node.js 特有模块
5. **监控与告警**：无论选择哪个平台，都要配置错误监控（Sentry）和性能监控

---

> 📅 本文档最后更新：2026年4月
>
> 💡 提示：平台定价和功能变化较快，建议查看各平台官网获取最新信息。
