---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# Serverless 与边缘计算（Application Domain）

> **维度**: 应用领域 | **边界**: 本文档聚焦 Serverless 应用架构与边缘部署模式，通用 CI/CD、容器编排和云平台基础设施请参见 `13-ci-cd.md` 和 `26-deployment-hosting.md`。

---

## 分类概览

| 类别 | 代表技术 | 适用场景 |
|------|----------|----------|
| Serverless 框架 | Vercel Functions, Netlify Functions, AWS Lambda | 无服务器 API、事件处理 |
| 边缘运行时 | Cloudflare Workers, Vercel Edge, Deno Deploy | 全球低延迟、A/B 测试 |
| 边缘存储 | Cloudflare KV, Durable Objects, Vercel Edge Config | 边缘状态、配置分发 |
| 边缘 AI | Cloudflare Workers AI, Vercel AI SDK Edge | 边缘推理、实时预测 |
| Serverless 数据库 | Turso, PlanetScale, Neon, Supabase | 边缘数据库、无服务器 SQL |

---

## 核心框架

### Cloudflare Workers

- **Stars**: 不适用（平台）
- **官网**: [workers.cloudflare.com](https://workers.cloudflare.com/)
- **TS支持**: ✅ 原生

在 Cloudflare 全球边缘节点运行 JavaScript/TypeScript，V8 Isolate 架构，冷启动 < 1ms。

**特点**:

- 🌍 全球 300+ 节点就近执行
- ⚡ 毫秒级冷启动
- 🔒 默认安全沙箱
- 📦 KV、R2、D1、Durable Objects 生态

---

### Vercel Edge Functions

- **官网**: [vercel.com/docs/functions](https://vercel.com/docs/functions/edge-functions)
- **TS支持**: ✅ 原生

Vercel 边缘运行时，兼容 WinterCG 标准，支持 Edge Config 和 AI SDK 边缘推理。

---

### Deno Deploy

- **官网**: [deno.com/deploy](https://deno.com/deploy)
- **TS支持**: ✅ 原生

Deno 的边缘部署平台，原生 TypeScript，内置权限模型。

---

## 与基础设施的边界

```
应用领域 (本文档)                     基础设施层
├─ 边缘应用架构模式                    ├─ CI/CD 流水线
├─ Serverless 函数设计                 ├─ 容器编排 (K8s)
├─ 边缘状态管理                        ├─ 云虚拟机 / VPC
└─ 冷启动优化策略                      └─ 负载均衡 / CDN 原理
```

---

## 关联资源

- `jsts-code-lab/31-serverless/` — Serverless 代码模式
- `jsts-code-lab/32-edge-computing/` — 边缘运行时与架构
- `jsts-code-lab/93-deployment-edge-lab/` — 部署与边缘实战
- `docs/categories/30-edge-databases.md` — 边缘数据库分类
- `examples/edge-observability-starter/` — 边缘可观测性示例

---

> 📅 最后更新: 2026-04-27
