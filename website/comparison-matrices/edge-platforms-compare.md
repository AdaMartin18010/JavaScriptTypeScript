---
title: Edge 平台对比矩阵 2026
description: 'Cloudflare Workers、Vercel Edge、Deno Deploy、Netlify Edge、AWS Lambda@Edge、Fly.io、Wasmer Edge、Supabase Edge Functions、Google Cloud Run Functions、Azure Functions 等边缘计算平台全面选型对比'
---

# Edge 平台对比矩阵 2026

> 最后更新: 2026-05-01 | 覆盖: 延迟、成本、功能、DX、生态、安全、数据库、AI、WebSocket、Cron
> 涵盖平台: Cloudflare Workers、Vercel Edge、Deno Deploy、Netlify Edge、AWS Lambda@Edge、Fly.io、Wasmer Edge、Supabase Edge Functions、Google Cloud Run Functions、Azure Functions

---

## 概述

边缘计算平台在 2024-2026 年经历了爆发式增长。从简单的 CDN 边缘脚本演进为完整的无服务器运行时，支持数据库、AI 推理、WebSocket、Cron 等全栈能力。本矩阵覆盖 2026 年主流 Edge 平台的全面选型对比，新增 Wasmer Edge、Supabase Edge Functions、Google Cloud Run Functions、Azure Functions 等平台，并深度对比 V8 Isolates、Firecracker VM、Linux Containers、gVisor 等运行时技术。

---

## 核心指标

### 性能对比

| 平台 | 冷启动 | 热启动 | CPU 限制/请求 | 内存限制 | 全球节点 | 运行时 | 2026 采用率 |
|------|--------|--------|--------------|----------|----------|--------|------------|
| **Cloudflare Workers** | **<1ms** | **<0.5ms** | 50ms (免费) / 30s (付费) | 128MB | **300+** | V8 Isolates | 32% |
| **Vercel Edge Functions** | <5ms | <2ms | 30s | 128MB / 1024MB | 50+ | V8 Isolates | 25% |
| **Deno Deploy** | <1ms | <1ms | 50ms / 200ms | — | 35+ | Deno (V8) | 7% |
| **Netlify Edge** | <10ms | <5ms | 30s | 128MB | 100+ | Deno | 6% |
| **AWS Lambda@Edge** | 50-100ms | 5-10ms | 30s | 128MB | 400+ (CloudFront) | Node.js 22 | 12% |
| **Fly.io** | ~100ms | ~10ms | 无限制 | 512MB+ | 30+ | Firecracker VM | 5% |
| **Wasmer Edge** | <1ms | <0.5ms | 100ms | 128MB | 20+ | WebAssembly (Wasmer) | 1% |
| **Supabase Edge Functions** | <50ms | <5ms | 400s ( wall time ) | 256MB | 10+ | Deno | 4% |
| **Google Cloud Run Functions** | 100-500ms | 10-50ms | 60m (HTTP) | 32GB (max) | 35+ | Linux Containers (gVisor) | 3% |
| **Azure Functions** | 100-500ms | 10-50ms | 10m (Consumption) | 1.5GB | 60+ | Linux Containers | 4% |

📊 **数据来源**: 各平台官方文档（2026-04）; Cloudflare 官方博客 "Workers Performance Update"（2025-11）; Vercel 官方文档 Edge Runtime Limits（2026-03）; AWS Lambda@Edge 官方文档（2026-01）; Fly.io 官方文档 Firecracker 性能基准（2025-09）; State of JS 2025 调查（2026-04）

> 💡 **关键洞察**: V8 Isolates 平台（Workers、Vercel Edge、Deno Deploy）冷启动通常在 1ms 以内，而基于容器/Lambda 的平台冷启动在 100ms-500ms 量级。但容器方案在长时间运行和复杂计算场景中更具成本优势。

### 运行时对比

| 平台 | 运行时 | Node API 兼容 | ESM | TypeScript | WASM | Web API 完整度 |
|------|--------|:-------------:|:---:|:----------:|:----:|:-------------:|
| **Cloudflare Workers** | V8 Isolates | ⚠️ 部分 (nodejs_compat/v2) | ✅ | ✅ (transpile) | ✅ | ⭐⭐⭐⭐⭐ |
| **Vercel Edge** | V8 Isolates | ⚠️ 部分 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Deno Deploy** | Deno (V8) | ✅ 内置 | ✅ | ✅ 原生 | ✅ | ⭐⭐⭐⭐⭐ |
| **Netlify Edge** | Deno (V8) | ✅ 内置 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **AWS Lambda@Edge** | Node.js 22 | ✅ 完整 | ✅ | ⚠️ 需构建 | ✅ | ⭐⭐⭐⭐ |
| **Fly.io** | Node.js/Deno/Go/any | ✅ 完整 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Wasmer Edge** | WebAssembly | ❌ | ✅ | ⚠️ 编译为 WASM | ✅ 原生 | ⭐⭐⭐ |
| **Supabase Edge Functions** | Deno (V8) | ✅ 内置 | ✅ | ✅ 原生 | ✅ | ⭐⭐⭐⭐⭐ |
| **Google Cloud Run Functions** | Linux Containers | ✅ 完整 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Azure Functions** | Linux Containers | ✅ 完整 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |

### Edge Runtime 深度对比

| 维度 | V8 Isolates | Firecracker VM | Linux Containers | gVisor | WebAssembly |
|------|-------------|----------------|------------------|--------|-------------|
| **代表平台** | Cloudflare Workers、Vercel Edge | Fly.io | Azure Functions、AWS Lambda | Google Cloud Run | Wasmer Edge、Fastly Compute |
| **隔离级别** | 进程内 (Isolate) | 轻量 VM (microVM) | 进程/命名空间隔离 | 用户态内核 (syscall 拦截) | 沙箱 (能力模型) |
| **启动延迟** | **<1ms** | ~100ms | 100-500ms | 100-500ms | **<1ms** |
| **内存开销** | **极低 (~KB)** | 低 (~10MB) | 中 (~50-100MB) | 中 (~50MB) | **极低 (~KB)** |
| **CPU 开销** | 极低 | 低 (KVM 虚拟化) | 中 | 高 (syscall 拦截) | 低 (JIT/AOT) |
| **冷启动** | 可忽略 | 快 | 慢 | 较慢 | 可忽略 |
| **多语言支持** | JS/TS/WASM 为主 | 任意 | 任意 | 任意 | 编译为 WASM 即可 |
| **状态保持** | ❌ 无状态 | ✅ 可持久化 | ✅ 可持久化 | ✅ 可持久化 | ❌ 无状态 |
| **自定义系统调用** | ❌ 受限 | ✅ 完整 | ✅ 完整 | ⚠️ 受限 | ❌ 受限 |
| **安全模型** | 进程沙箱 | 硬件虚拟化 | 命名空间/cgroups | 双重隔离 (用户态内核) | 能力模型 + 线性内存 |

📊 **数据来源**: Cloudflare 博客 "How Workers Works"（2024-12）; AWS Firecracker 官方文档（2025-08）; Google gVisor 架构文档（2025-10）; Wasmer Edge 文档（2026-02）

---

## 功能对比

### 存储与数据库（原生/集成）

| 特性 | Workers | Vercel Edge | Deno Deploy | Netlify Edge | Lambda@Edge | Fly.io | Wasmer Edge | Supabase Edge | Cloud Run | Azure Functions |
|------|---------|-------------|-------------|--------------|-------------|--------|-------------|---------------|-----------|-----------------|
| **KV 存储** | ✅ KV | ✅ Edge Config / Vercel KV | ✅ Deno KV | ✅ Blobs | ❌ | ⚠️ Redis (外部) | ⚠️ 外部 | ❌ | ⚠️ 外部 | ✅ Azure Cache |
| **关系数据库** | ✅ D1 (SQLite) | ⚠️ 外部连接 | ❌ 原生 | ❌ | ❌ | ✅ 任意 | ❌ | ✅ Postgres (原生) | ✅ Cloud SQL | ✅ Azure SQL |
| **对象存储** | ✅ R2 (S3兼容) | ❌ | ❌ | ❌ | ❌ | ✅ 任意 | ❌ | ✅ Storage | ✅ Cloud Storage | ✅ Blob Storage |
| **Vector DB** | ✅ Vectorize | ❌ | ❌ | ❌ | ❌ | ⚠️ 外部 | ❌ | ⚠️ 外部 (pgvector) | ⚠️ Vertex AI | ⚠️ Azure AI Search |
| **Cache API** | ✅ 原生 | ❌ | ❌ | ❌ | ❌ | ⚠️ 外部 | ❌ | ❌ | ⚠️ Memorystore | ✅ Redis Cache |
| **文件系统** | ❌ 无 | ❌ 无 | ⚠️ 有限 | ❌ 无 | ❌ 只读 /tmp | ✅ 完整 | ❌ 无 | ❌ 无 | ✅ 可写 /tmp | ✅ 可写 |

### KV 存储深度对比

| KV 服务 | 所属平台 | 一致性模型 | 全局复制 | 延迟 | 免费额度 | 价格模型 |
|---------|----------|-----------|----------|------|----------|----------|
| **Cloudflare KV** | Cloudflare | 最终一致性 | ✅ 全球 | <50ms (缓存命中) | 10GB/天读取 | $0.50/百万读取 |
| **Vercel KV** | Vercel (Upstash) | 强一致性 | ✅ 多区域 | <5ms | 3万命令/天 | 按 Upstash 定价 |
| **Deno KV** | Deno | 强一致性 | ✅ 全球 | <10ms | 100万请求/天 | $0.50/百万请求 |
| **Upstash Redis** | 独立 | 强一致性 | ✅ 多区域 | <5ms | 10万命令/天 | $0.40/百万命令 |
| **Fly.io Redis** | Fly.io (Upstash) | 强一致性 | ✅ 区域 | <1ms (同区域) | 无免费 | 按实例规格 |

📊 **数据来源**: Cloudflare KV 定价页（2026-04）; Upstash 官方文档（2026-03）; Deno KV 文档（2026-01）

### Edge 数据库集成矩阵

| 数据库 | 平台支持 | Edge 就绪 | 连接协议 | 延迟特征 | 适用场景 |
|--------|----------|:---------:|----------|----------|----------|
| **Cloudflare D1** | Workers 原生 | ✅ | SQLite over HTTP | <10ms (边缘节点) | 轻量级关系数据、用户配置、内容管理 |
| **Turso (libSQL)** | Workers、Vercel、Deno、Netlify | ✅ | HTTP / libsql | <20ms (边缘副本) | 边缘 SQLite、多区域复制、IoT 数据 |
| **Neon** | Vercel、Netlify、Fly.io | ⚠️ 需连接池 | Postgres Wire | 10-50ms (最近区域) | 无服务器 Postgres、自动扩缩容 |
| **PlanetScale** | Vercel、Netlify、AWS | ⚠️ 需连接池 | MySQL Wire | 10-50ms | 无服务器 MySQL、分支数据库 |
| **Supabase Postgres** | Supabase Edge、任何平台 | ⚠️ 需连接池 | Postgres Wire | 10-50ms | 完整 Postgres、RLS、实时订阅 |
| **FaunaDB** | 任何平台 | ✅ | GraphQL / FQL | <50ms (全球复制) | 文档数据库、ACID、全球一致性 |

📊 **数据来源**: Turso 官方文档 "Edge SQLite"（2025-10）; Neon 无服务器架构文档（2026-02）; PlanetScale 连接池指南（2025-11）

> 💡 **最佳实践**: 在 V8 Isolates 环境中，优先选择 HTTP-based 数据库（D1、Turso、FaunaDB）或使用连接池代理（Neon、PlanetScale）。传统 TCP Postgres/MySQL 连接在 Isolate 中无法保持长连接。

### WebSocket 支持

| 平台 | WebSocket 支持 | 实现方式 | 连接限制 | 持久化状态 | 适用场景 |
|------|:--------------:|----------|----------|:----------:|----------|
| **Cloudflare Workers** | ✅ 完整 | Durable Objects + Hibernation | 无硬性限制 | ✅ DO 状态 | 实时聊天、协作编辑、游戏服务器 |
| **Vercel Edge** | ❌ 不支持 | — | — | ❌ | — |
| **Deno Deploy** | ✅ 完整 | 原生 WebSocket | 10万/应用 | ⚠️ 需外部存储 | 实时通知、Live reload |
| **Netlify Edge** | ❌ 不支持 | — | — | ❌ | — |
| **AWS Lambda@Edge** | ❌ 不支持 | — | — | ❌ | — |
| **Fly.io** | ✅ 完整 | 原生 TCP/WS | 无限制 | ✅ 磁盘/内存 | 任意 WebSocket 应用 |
| **Wasmer Edge** | ⚠️ 有限 | 实验性 | 未知 | ❌ | 简单推送 |
| **Supabase Edge** | ✅ 完整 | 原生 Deno WebSocket | 1万/函数 | ⚠️ 需外部存储 | 实时数据推送 |
| **Google Cloud Run** | ✅ 完整 | 原生 (容器内) | 无限制 | ✅ 可附加磁盘 | 复杂实时应用 |
| **Azure Functions** | ✅ 完整 | SignalR / 原生 | 无限制 | ✅ 可绑定存储 | 企业实时协作 |

📊 **数据来源**: Cloudflare Durable Objects 文档（2026-03）; Deno Deploy WebSocket 文档（2026-01）; Fly.io TCP 服务文档（2025-09）

### AI 推理对比

| 平台/服务 | 模型类型 | 延迟 | 定价 | 免费额度 | 集成方式 |
|-----------|----------|------|------|----------|----------|
| **Cloudflare Workers AI** | Llama、Mistral、BGE、Whisper | <100ms (小模型) | $0.001/1K neurons | 10K neurons/天 | 原生绑定 |
| **Vercel AI SDK** | OpenAI、Anthropic、Google 等 | 取决于提供商 | 按提供商 | 无 (SDK 免费) | npm 包 |
| **OpenAI Edge** | GPT-4o、GPT-4o-mini、o3 | 200-500ms | $0.15-5.00/1M tokens | $5 试用额度 | HTTP API |
| **Replicate Edge** | 开源模型 (Llama、SDXL 等) | 2-10s (冷启动) | 按秒计费 | $5 试用额度 | HTTP API |
| **Azure AI Inference** | GPT-4、Phi、Llama | 200-500ms | 按 token | 免费层 | SDK / REST |
| **Google Vertex AI** | Gemini、PaLM、Imagen | 200-800ms | 按 token / 请求 | $300 试用 | SDK / REST |
| **Supabase Edge AI** | 外部 API 代理 | 取决于模型 | 按调用 | 无 | Edge Function 调用 |
| **Fly.io GPU** | 自定义模型 | 取决于模型 | $2.50/GPU/hr | 无 | 容器部署 |

📊 **数据来源**: Cloudflare Workers AI 定价（2026-04）; Vercel AI SDK 文档（2026-03）; OpenAI API 定价（2026-04）; Replicate 定价页（2026-02）

```typescript
// Cloudflare Workers AI 示例
export default {
  async fetch(request, env) {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is edge computing?' }
      ]
    });
    return new Response(JSON.stringify(response));
  }
};

// Vercel AI SDK 示例 (Next.js)
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
  });
  return result.toDataStreamResponse();
}
```

### Cron / 定时任务支持

| 平台 | Cron 支持 | 精度 | 最小间隔 | 最大任务数 | 失败重试 | 时区支持 |
|------|:---------:|------|----------|:----------:|:--------:|:--------:|
| **Cloudflare Workers** | ✅ 原生 | 1分钟 | 1分钟 | 100 (免费) / 500 (付费) | ✅ 自动 | ❌ UTC |
| **Vercel Edge** | ✅ 原生 | 1分钟 | 1分钟 | 40 (Pro) | ✅ 自动 | ❌ UTC |
| **Deno Deploy** | ⚠️ 有限 | 1小时 | 1小时 | 10 (免费) | ❌ 手动 | ❌ UTC |
| **Netlify Edge** | ❌ 不支持 | — | — | — | — | — |
| **AWS Lambda@Edge** | ❌ 不支持 | — | — | — | — | — |
| **Fly.io** | ✅ 原生 | 秒级 | 秒级 | 无限制 | ✅ 自定义 | ✅ 任意 |
| **Supabase Edge** | ✅ 原生 (pg_cron) | 1分钟 | 1分钟 | 无限制 | ✅ 自动 | ✅ 任意 |
| **Google Cloud Run** | ✅ Cloud Scheduler | 1分钟 | 1分钟 | 无限制 | ✅ 自动 | ✅ 任意 |
| **Azure Functions** | ✅ Timer Trigger | 1秒 | 1秒 | 无限制 | ✅ 自动 | ✅ 任意 |

📊 **数据来源**: Cloudflare Cron Triggers 文档（2026-03）; Vercel Cron Jobs 文档（2026-02）; Deno Deploy Cron 限制（2025-12）

### 高级功能汇总

| 特性 | Workers | Vercel Edge | Deno Deploy | Netlify Edge | Lambda@Edge | Fly.io | Wasmer Edge | Supabase Edge | Cloud Run | Azure Functions |
|------|---------|-------------|-------------|--------------|-------------|--------|-------------|---------------|-----------|-----------------|
| **Queue / 消息队列** | ✅ Queues | ❌ | ❌ | ❌ | ❌ | ✅ 任意 | ❌ | ⚠️ (外部) | ✅ Pub/Sub | ✅ Service Bus |
| **Durable State** | ✅ Durable Objects | ❌ | ❌ | ❌ | ❌ | ✅ 磁盘 | ❌ | ❌ | ✅ 磁盘 | ✅ 持久化 |
| **自定义域** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **mTLS** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **流式响应** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ 有限 | ✅ | ✅ | ✅ |
| **HTTP/3 (QUIC)** | ✅ | ⚠️ 部分 | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ⚠️ 部分 | ⚠️ 部分 |
| **边缘缓存控制** | ✅ 精细 | ⚠️ 基础 | ❌ | ⚠️ 基础 | ✅ CloudFront | ✅ 自定义 | ❌ | ❌ | ⚠️ CDN | ⚠️ CDN |


---

## 开发者体验 (DX)

### 工具链与本地开发

| 维度 | Workers | Vercel Edge | Deno Deploy | Netlify Edge | Lambda@Edge | Fly.io | Wasmer Edge | Supabase Edge | Cloud Run | Azure Functions |
|------|---------|-------------|-------------|--------------|-------------|--------|-------------|---------------|-----------|-----------------|
| **CLI 工具** | Wrangler 3.x | Vercel CLI 39.x | `deno` CLI | Netlify CLI 17.x | AWS CLI v2 + SAM | `flyctl` v2 | `wasmer` CLI | Supabase CLI | gcloud CLI | Azure Functions Core Tools |
| **本地开发** | `wrangler dev` (Miniflare) | `next dev` / `vercel dev` | `deno run` | `netlify dev` | `sam local` / `docker` | `fly deploy --local` | `wasmer run` | `supabase functions serve` | `gcloud emulators` / Docker | `func start` |
| **实时重载** | ✅ | ✅ | ✅ | ✅ | ⚠️ 手动 | ✅ (dev) | ✅ | ✅ | ⚠️ 手动 | ⚠️ 手动 |
| **类型安全** | ✅ 自动生成 (`.d.ts`) | ⚠️ 手动配置 | ✅ 内置 Deno types | ⚠️ 手动 | ❌ | ❌ | ⚠️ 有限 | ✅ Deno types | ⚠️ 手动 | ⚠️ 手动 |
| **部署速度** | **<10s** | <30s | **<10s** | <30s | 1-5min | <60s | <10s | <20s | 1-3min | 1-3min |
| **预览环境** | ✅ 分支预览 | ✅ 分支预览 | ❌ | ✅ 分支预览 | ⚠️ 手动 | ✅ 多环境 | ❌ | ✅ 分支预览 | ⚠️ 手动 | ✅ 槽位部署 |

### 本地开发代码示例

```bash
# Cloudflare Workers (Wrangler)
npm create cloudflare@latest my-app
cd my-app
npx wrangler dev --local --persist

# Vercel Edge (Next.js)
npx create-next-app@latest my-app
cd my-app
npm run dev  # 自动启用 Edge Runtime (export const runtime = 'edge')

# Deno Deploy
deno init my-app
cd my-app
deno run --watch main.ts
# 部署: deno deploy --project=my-project main.ts

# Supabase Edge Functions
npx supabase init
npx supabase functions new hello
npx supabase start  # 本地 Supabase 栈
npx supabase functions serve --env-file .env

# Fly.io
npm init -y
npx flyctl launch
npx flyctl deploy
npx flyctl logs
```

---

## 部署流程对比

| 维度 | Workers | Vercel Edge | Deno Deploy | Netlify Edge | Lambda@Edge | Fly.io | Supabase Edge | Cloud Run | Azure Functions |
|------|---------|-------------|-------------|--------------|-------------|--------|---------------|-----------|-----------------|
| **Git 集成** | ✅ GitHub/GitLab | ✅ GitHub/GitLab/Bitbucket | ✅ GitHub | ✅ GitHub/GitLab | ⚠️ CodePipeline / 手动 | ✅ GitHub Actions | ✅ GitHub (通过 Supabase) | ✅ Cloud Build | ✅ GitHub Actions / DevOps |
| **CI/CD** | ✅ GitHub Actions 模板 | ✅ 内置 (零配置) | ⚠️ 需配置 GitHub Actions | ✅ 内置 | ⚠️ 需配置 CodePipeline | ✅ 推荐 GitHub Actions | ✅ 内置 | ✅ Cloud Build | ✅ Azure DevOps |
| **预览部署** | ✅ 分支预览 (*.pages.dev) | ✅ 分支预览 (Vercel Preview) | ❌ | ✅ 分支预览 (Deploy Preview) | ❌ | ✅ 多应用 / 蓝绿 | ✅ 分支预览 | ⚠️ 修订版本 | ✅ 槽位交换 |
| **回滚** | ✅ 一键回滚 | ✅ 一键回滚 | ⚠️ 手动重部署 | ✅ 一键回滚 | ⚠️ 手动 | ✅ `flyctl deploy --image` | ✅ 历史版本 | ✅ 修订版本 | ✅ 槽位交换 |
| **蓝绿部署** | ✅ 灰度发布 | ✅ 渐进式 | ❌ | ✅ 灰度发布 | ⚠️ CloudFront | ✅ 原生支持 | ❌ | ✅ 流量拆分 | ✅ 槽位 |
| **环境变量管理** | ✅ Wrangler Secrets / Vars | ✅ Dashboard / CLI | ⚠️ 手动配置 | ✅ Dashboard / TOML | ⚠️ Parameter Store | ✅ `fly secrets set` | ✅ Dashboard / CLI | ✅ Secrets Manager | ✅ Key Vault |
| **基础设施即代码** | ✅ Wrangler.toml | ⚠️ 有限 (vercel.json) | ⚠️ 手动 | ✅ netlify.toml | ✅ CloudFormation / SAM / TF | ✅ fly.toml | ⚠️ config.toml | ✅ Terraform / CDK | ✅ ARM / Bicep / TF |

---

## 成本对比

### 免费额度

| 平台 | 免费请求/月 | 免费 CPU 时间 | 免费带宽 | 免费存储 | 其他限制 |
|------|------------|--------------|---------|----------|----------|
| **Cloudflare Workers** | 100,000/天 (300万/月) | 10ms/请求 | 无限制 | KV 1GB | 子请求 50/请求 |
| **Vercel Edge** | 1,000,000 | 无限制 (30s 墙时间) | 100GB | Edge Config 8KB | 构建时间 6000min/月 |
| **Deno Deploy** | 500,000 | 无限制 | 无限制 | KV 1GB | — |
| **Netlify Edge** | 125,000 | 无限制 | 100GB | 100MB blobs | 构建时间 300min/月 |
| **AWS Lambda@Edge** | 无 | 无 | 无 | 无 | — |
| **Fly.io** | 无 | 无 | 3GB/月 (VM 出网) | 无 | 免费 VM: shared-cpu-1x 256MB |
| **Supabase Edge** | 500,000 | 2M GB-seconds | 2GB (数据库出网) | 500MB DB | 函数 2 vCPU / 1GB RAM |
| **Google Cloud Run** | 200万请求 | 360,000 vCPU-seconds | 1GB | 无 | — |
| **Azure Functions** | 100万请求 | 400,000 GB-s | 5GB | 5GB (临时) | 消费层免费 |

### 付费模型对比

| 平台 | 计费维度 | 起步价 | 1000万请求/月估算 | 备注 |
|------|----------|--------|-------------------|------|
| **Cloudflare Workers** | 请求数 + CPU 时间 ($12.50/百万CPU-ms) | $5/月 | **$5** | Workers Paid 计划，性价比最高 |
| **Vercel Edge** | 请求数 + 带宽 + 构建时间 | $20/月 (Pro) | $20-50 | Pro 计划包含 1000万请求 |
| **Deno Deploy** | 请求数 + 计算时间 | 按量 | $10-20 | 无最低消费 |
| **Netlify** | 席位 + 带宽 + 构建时间 | $19/月 (Pro) | $19-40 | 按席位计费 |
| **AWS Lambda@Edge** | 请求费 ($0.60/百万) + 计算费 ($0.00005001/GB-s) | 无 | $15-30 | 不含 CloudFront 带宽费 |
| **Fly.io** | VM 规格 ($1.94/月 shared-cpu) + 带宽 | 按量 | $5+ | 长时间运行 VM 更划算 |
| **Supabase Edge** | 计算时间 ($2/百万秒) + 出网带宽 | $25/月 (Pro) | $25-40 | 包含数据库服务 |
| **Google Cloud Run** | 请求 ($0.40/百万) + vCPU + 内存 + 带宽 | 按量 | $10-30 | 容器启动时间影响成本 |
| **Azure Functions** | 请求 ($0.20/百万) + GB-s + 带宽 | 按量 | $10-25 | 消费层最经济 |

📊 **数据来源**: Cloudflare 定价页（2026-04）; Vercel 定价（2026-04）; Deno Deploy 定价（2026-03）; AWS Lambda 定价（2026-04）; Fly.io 定价（2026-04）; Google Cloud Run 定价（2026-03）; Azure Functions 定价（2026-04）

---

## 安全与合规

### 安全能力矩阵

| 平台 | SOC 2 | GDPR | HIPAA | ISO 27001 | DDoS 防护 | WAF |  secrets 管理 |
|------|:-----:|:----:|:-----:|:---------:|:---------:|:---:|:------------:|
| **Cloudflare Workers** | ✅ Type II | ✅ | ⚠️ BAA 可选 | ✅ | ✅ 内置 (不限流量) | ✅ 企业级 | ✅ Workers Secrets |
| **Vercel Edge** | ✅ Type II | ✅ | ❌ | ✅ | ✅ 基础 | ⚠️ 企业版 | ✅ Environment Variables |
| **Deno Deploy** | ❌ | ✅ | ❌ | ❌ | ⚠️ 有限 | ❌ | ⚠️ 手动 |
| **Netlify Edge** | ✅ Type II | ✅ | ❌ | ✅ | ✅ 基础 | ⚠️ 企业版 | ✅ Environment Variables |
| **AWS Lambda@Edge** | ✅ Type II | ✅ | ✅ | ✅ | ✅ AWS Shield Advanced | ✅ AWS WAF | ✅ AWS Secrets Manager |
| **Fly.io** | ⚠️ 进行中 | ✅ | ❌ | ⚠️ 进行中 | ⚠️ 需配置 (Anycast) | ❌ | ⚠️ 手动 / fly secrets |
| **Supabase Edge** | ✅ Type II | ✅ | ⚠️ BAA 可选 | ⚠️ 进行中 | ✅ 基础 | ⚠️ 数据库 RLS | ✅ Vault + Secrets |
| **Google Cloud Run** | ✅ Type II | ✅ | ✅ | ✅ | ✅ Google Cloud Armor | ✅ Cloud Armor | ✅ Secret Manager |
| **Azure Functions** | ✅ Type II | ✅ | ✅ | ✅ | ✅ DDoS Protection | ✅ Front Door WAF | ✅ Key Vault |

### 网络与传输安全

| 平台 | TLS 终止 | 最低 TLS 版本 | 自定义证书 | 私有网络 | VPC 对等 |
|------|----------|-------------|------------|----------|----------|
| **Cloudflare Workers** | 边缘节点 | 1.0 (可配置 1.2) | ✅ 自动 + 自定义 | ❌ | ❌ |
| **Vercel Edge** | 边缘节点 | 1.2 | ✅ 自动 | ❌ | ❌ |
| **Fly.io** | 边缘 + 应用 | 1.2 | ✅ 自定义 | ✅ WireGuard | ✅ |
| **AWS Lambda@Edge** | CloudFront | 1.2 | ✅ ACM | ✅ VPC | ✅ |
| **Google Cloud Run** | 全局 LB | 1.2 | ✅ Google-managed | ✅ VPC Connector | ✅ |
| **Azure Functions** | Front Door / App GW | 1.2 | ✅ Key Vault | ✅ VNet 集成 | ✅ |

📊 **数据来源**: 各平台安全合规白皮书（2026-04）; Cloudflare Trust Center; AWS Artifact; Azure 合规文档

---

## 调试与监控

| 维度 | Workers | Vercel Edge | Deno Deploy | Netlify Edge | Lambda@Edge | Fly.io | Supabase Edge | Cloud Run | Azure Functions |
|------|---------|-------------|-------------|--------------|-------------|--------|---------------|-----------|-----------------|
| **日志查看** | Dashboard + `wrangler tail` | Vercel Dashboard (实时) | Deno Deploy Dashboard | Netlify Dashboard | CloudWatch Logs | `fly logs` + Live Tail | Supabase Dashboard (实时) | Cloud Logging | Application Insights |
| **日志保留** | 7天 (免费) / 自定义 | 1天 (Hobby) / 30天+ | 1小时 (免费) | 1天 (免费) | 无限 (付费) | 无限 (付费) | 1天 (免费) | 30天 (默认) | 90天 (默认) |
| **分布式追踪** | ✅ Workers Trace | ✅ OpenTelemetry | ⚠️ 有限 | ❌ | ✅ AWS X-Ray | ✅ 内置 (Fly) | ⚠️ 有限 | ✅ Cloud Trace | ✅ Application Insights |
| **指标 (Metrics)** | ✅ 内置 + Grafana | ✅ 内置 Analytics | ⚠️ 基础 | ⚠️ 基础 | ✅ CloudWatch | ✅ Prometheus | ⚠️ 基础 | ✅ Cloud Monitoring | ✅ Azure Monitor |
| **错误告警** | ✅ Webhook + Email | ✅ Email + Slack | ❌ | ✅ Email | ✅ SNS + PagerDuty | ✅ Email | ✅ Email + Webhook | ✅ Alerting | ✅ Azure Alerts |
| **实时调试** | ✅ Chrome DevTools | ✅ Chrome DevTools | ✅ Chrome DevTools | ⚠️ 有限 | ⚠️ CloudWatch | ✅ SSH 进入容器 | ✅ Console.log | ⚠️ Cloud Logging | ⚠️ VS Code 扩展 |
| **本地调试** | ✅ `wrangler dev --inspect` | ✅ `next dev` | ✅ `deno run --inspect` | ✅ `netlify dev` | ✅ `sam local` | ✅ Docker | ✅ `supabase functions serve` | ✅ Docker | ✅ `func start` |

📊 **数据来源**: Cloudflare Workers Observability（2026-03）; Vercel Analytics 文档（2026-02）; Deno Deploy 日志文档（2026-01）

---

## 框架集成

| 框架 | Cloudflare | Vercel | Deno | Netlify | Fly.io | Supabase | Cloud Run | Azure |
|------|:----------:|:------:|:----:|:-------:|:------:|:--------:|:---------:|:-----:|
| **Next.js** | ⚠️ 适配器 (OpenNext) | ✅ 原生 | ⚠️ 实验性 | ✅ | ✅ | ⚠️ 需适配 | ✅ | ✅ |
| **Nuxt** | ✅ Nitro preset | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SvelteKit** | ✅ Adapter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Astro** | ✅ Adapter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Hono** | ✅ 原生 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Remix** | ✅ 适配器 (Vite) | ✅ | ⚠️ 适配器 | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| **TanStack Start** | ✅ 原生 | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ | ✅ |
| **Fresh (Deno)** | ❌ | ❌ | ✅ 原生 | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Qwik** | ✅ Adapter | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |

---

## 选型决策树

```
预算敏感？
├── 是
│   ├── 需要数据库 → Cloudflare Workers (D1 + KV 免费，300万请求/月)
│   ├── 需要 AI 推理 → Cloudflare Workers AI (1万 neurons/天免费)
│   ├── 需要 Deno 生态 → Deno Deploy (50万请求/月免费)
│   └── 纯 API / 静态增强 → Cloudflare Workers / Deno Deploy
└── 否
    ├── 使用 Next.js → Vercel Edge (原生集成，最佳 DX)
    ├── 使用 Deno / Fresh → Deno Deploy / Supabase Edge (生态一致)
    ├── 需要 AWS 生态 / HIPAA → Lambda@Edge / Cloud Run Functions
    ├── 需要 Azure 生态 / 企业集成 → Azure Functions
    ├── 需要 WebSocket + 持久状态 → Cloudflare Workers (Durable Objects) / Fly.io
    ├── 需要 GPU / AI 推理 (大模型) → Fly.io GPU / Google Vertex AI / Azure AI
    ├── 需要完整 Node.js / 文件系统 → Fly.io / Cloud Run / Azure Functions
    ├── 需要 WebAssembly (WASM) 原生 → Wasmer Edge / Cloudflare Workers
    ├── 需要 Postgres + Edge Functions 一体化 → Supabase Edge Functions
    └── 需要边缘 SQLite (全球复制) → Cloudflare D1 / Turso
```

---

## 2026 趋势

| 趋势 | 描述 | 代表平台/技术 |
|------|------|--------------|
| **Edge Database 普及** | SQLite at the Edge 成为标准。D1、Turso、Deno KV 让边缘关系数据库和 KV 成为默认选择，取代传统远程数据库连接。 | Cloudflare D1、Turso、Deno KV |
| **AI at the Edge** | 边缘 AI 推理从实验走向生产。Cloudflare Workers AI 支持 50+ 模型；Vercel AI SDK 统一多提供商接口；小模型 (SLM) 在边缘运行成为常态。 | Workers AI、Vercel AI SDK、Ollama |
| **WebAssembly at the Edge** | WASM 在边缘的采用加速。Fastly Compute、Wasmer Edge 推动多语言边缘计算；Rust、Go、C++ 编译为 WASM 在 V8 Isolates 外运行。 | Wasmer Edge、Fastly Compute、WASM Component Model |
| **Workers 统治力持续** | Cloudflare Workers 在功能广度、成本、生态上持续领先。Durable Objects、Queues、Vectorize、R2 构建完整边缘云平台。 | Cloudflare Workers |
| **Vercel AI SDK 差异化** | Vercel 通过 AI SDK + 流式 UI + 多模型提供商抽象，在 Edge AI 应用开发中建立差异化优势。 | Vercel AI SDK、v0、AI RSC |
| **Durable Objects 模式扩散** | 有状态边缘计算从 Cloudflare 扩散到其他平台。Fly.io Machines、Deno Deploy 的持久化尝试，让边缘状态管理成为新战场。 | Durable Objects、Fly Machines |
| **WinterCG 标准化** | WinterCG 推动边缘运行时 API 标准化。`fetch`、`Request`/`Response`、`WebCrypto` 等 API 跨平台一致性提升，降低厂商锁定。 | WinterCG、Node.js、Deno |
| **边缘到中心的数据同步** | Electric SQL、PowerSync 等同步引擎让边缘 SQLite 与中心 Postgres 实时同步，实现"本地优先"架构。 | Electric SQL、PowerSync、Replicache |

---

## 参考资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/) 📚
- [Cloudflare Workers AI 文档](https://developers.cloudflare.com/workers-ai/) 🤖
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/) 🗄️
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions) 📚
- [Vercel AI SDK](https://sdk.vercel.ai/docs) 🤖
- [Deno Deploy](https://deno.com/deploy) 📚
- [Deno KV](https://docs.deno.com/deploy/kv/) 🗄️
- [Netlify Edge Functions](https://docs.netlify.com/edge-functions/overview/) 📚
- [AWS Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html) 📚
- [Fly.io 文档](https://fly.io/docs/) 📚
- [Fly.io Machines (Firecracker)](https://fly.io/docs/machines/) 🔥
- [Wasmer Edge](https://docs.wasmer.io/edge) 📚
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions) 📚
- [Google Cloud Run](https://cloud.google.com/run/docs) 📚
- [Azure Functions](https://docs.microsoft.com/azure/azure-functions/) 📚
- [Turso (Edge SQLite)](https://turso.tech/) 🗄️
- [Neon (Serverless Postgres)](https://neon.tech/) 🗄️
- [PlanetScale](https://planetscale.com/) 🗄️
- [WinterCG](https://wintercg.org/) 🌐
- [Upstash (Redis/Kafka)](https://upstash.com/) 🗄️
- [State of JS 2025](https://stateofjs.com/) 📊
