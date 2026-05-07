# 01. Edge Runtime 核心概念

## 什么是 Edge Runtime？

Edge Runtime 是一种**轻量级 JavaScript 执行环境**，设计用于在 CDN 边缘节点上运行代码。与传统服务器不同，它利用 **V8 Isolates** 而非完整 VM/Container，实现毫秒级冷启动。

### V8 Isolates  vs  Container

```
┌─────────────────────────────────────────┐
│  传统 Container/VM 模型                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Node.js │ │ Node.js │ │ Node.js │   │
│  │ + OS    │ │ + OS    │ │ + OS    │   │
│  │ + Libs  │ │ + Libs  │ │ + Libs  │   │
│  │ = 1GB+  │ │ = 1GB+  │ │ = 1GB+  │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│  启动: 100-500ms                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  V8 Isolates 模型                        │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │Isolate│ │Isolate│ │Isolate│ │Isolate│ │
│  │= 1-5MB│ │= 1-5MB│ │= 1-5MB│ │= 1-5MB│ │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│  共享 V8 引擎，启动: 0-1ms               │
└─────────────────────────────────────────┘
```

## 核心特性

### 1. 零冷启动

Isolate 在请求到达前已预热，代码在微秒级内开始执行。

### 2. 地理分布

请求自动路由到最近的边缘节点，无需手动配置多区域部署。

### 3. 标准 API 子集

Edge Runtime 实现了 [WinterCG](https://wintercg.org/) 定义的 Web 标准子集：

```typescript
// ✅ 可用的全局 API
fetch, Request, Response, Headers
URL, URLSearchParams
TextEncoder, TextDecoder
Crypto, crypto.subtle
ReadableStream, WritableStream, TransformStream

// ❌ 不可用的 Node.js API
fs, path, http, net, child_process
```

### 4. 有限但可控的资源

| 平台 | CPU 时间 | 内存 | 请求体限制 |
|------|----------|------|-----------|
| Vercel Edge | 30s | 128MB-1024MB | 4.5MB |
| Cloudflare Workers | 10-50ms (Free) / 30min (Paid) | 128MB | 100MB |
| Deno Deploy | 无限制 | 1GB | 无限制 |

## 适用场景

| ✅ 适合 Edge | ❌ 不适合 Edge |
|-------------|---------------|
| 身份验证中间件 | 长时间计算 |
| A/B 测试路由 | 文件系统操作 |
| 地理定位内容 | 原生模块依赖 |
| 实时个性化 | 大量内存缓存 |
| API 聚合/转换 | 传统数据库连接 |

## 代码示例: 最小 Edge Function

```typescript
// Vercel Edge Function (Next.js)
export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'World';
  
  // 可在毫秒内向另一个边缘 API 发起请求
  const geo = await fetch('https://api.ipgeolocation.io/ipgeo', {
    headers: { 'Api-Key': process.env.GEO_API_KEY }
  }).then(r => r.json());

  return Response.json({
    message: `Hello ${name} from ${geo.city}!`,
    region: request.headers.get('x-vercel-ip-city')
  });
}
```

## 选型决策树

```
是否需要 Node.js API (fs, net)?
├── 是 → 传统 Node.js Serverless (Vercel Serverless, AWS Lambda)
└── 否 → 是否需要全球低延迟 (< 50ms)?
    ├── 否 → 传统 Serverless 即可
    └── 是 → 是否需要长时间运行 (> 30s)?
        ├── 是 → Deno Deploy / Cloudflare Workers Paid
        └── 否 → 
            ├── 深度集成 Next.js → Vercel Edge
            ├── 需要 Durable Objects → Cloudflare Workers
            └── 需要原生 TCP → Deno Deploy
```

## 延伸阅读

- [WinterCG 最小通用 API](https://common-min-api.proposal.wintercg.org/)
- [V8 Isolates 技术解析](https://deno.com/blog/announcing-deno-deploy)
