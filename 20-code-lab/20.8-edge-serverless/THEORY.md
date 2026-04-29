# 边缘与 Serverless：理论基础

> **定位**：`20-code-lab/20.8-edge-serverless/`
> **关联**：`30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/边缘优先架构设计方法论.md`

---

## 一、核心理论

### 1.1 问题域定义

边缘计算将计算推送到离用户最近的物理节点，JavaScript 因其**轻量级运行时**和**V8 Isolates**技术，成为边缘计算的事实标准语言。

### 1.2 边缘优先架构方法论

```
传统架构：
  用户 → CDN(静态) → 中心服务器(逻辑+数据) → 数据库
  延迟：100-300ms

边缘优先架构：
  用户 → 边缘节点(逻辑+缓存) → 中心服务器(核心数据)
  延迟：10-50ms
```

### 1.3 边缘约束

| 约束 | 限制 | 应对策略 |
|------|------|---------|
| **CPU 时间** | 50ms-300ms | 预计算、缓存、异步化 |
| **内存** | 128MB-1GB | 流式处理、状态外置 |
| **代码体积** | 1-5MB | Tree shaking、动态导入 |
| **持久化** | 无本地文件 | KV 存储、边缘数据库 |

---

## 二、设计原理

### 2.1 V8 Isolates 的革命性

- **毫秒级冷启动**：无需容器初始化
- **进程级隔离**：安全沙箱
- **高密度部署**：单节点数千 Isolate

### 2.2 边缘数据库选型

| 产品 | 一致性 | 平台锁定 | 适用场景 |
|------|--------|---------|---------|
| Turso | 最终一致 | 无 | 通用边缘 SQL |
| Cloudflare D1 | 强一致 | Cloudflare | Workers 生态 |
| Deno KV | 最终一致 | Deno | Deno Deploy |

---

## 三、边缘平台深度对比

| 平台 | 运行时 | 冷启动 | 全球节点 | 语言支持 | 最大内存 | 最大执行时间 | 价格模型 | 生态锁定 |
|------|--------|--------|---------|---------|---------|-------------|---------|---------|
| **Cloudflare Workers** | V8 Isolate | <1ms | 300+ | JS/TS/WASM/Rust | 128MB | 30s-5min | 每百万请求 | 中（Workers 生态） |
| **Vercel Edge** | V8 Isolate | <1ms | 100+ | JS/TS/WASM | 1024MB | 30s | 按执行时间 | 高（Next.js 生态） |
| **Netlify Edge** | Deno Deploy | <5ms | 100+ | JS/TS | 512MB | 50s | 按执行时间 | 高（Netlify 生态） |
| **AWS Lambda@Edge** | Node.js | 50-200ms | 400+ | JS/Python | 128MB | 5s (viewer) / 30s (origin) | 按请求+时间 | 高（AWS 生态） |
| **AWS CloudFront Functions** | V8 Isolate | <1ms | 400+ | JS | 2MB | <1ms | 每百万请求 | 高（AWS 生态） |
| **Deno Deploy** | Deno | <10ms | 35+ | JS/TS | 512MB | 30s | 按请求+时间 | 中（Deno 生态） |
| **Fastly Compute** | WASM (SpiderMonkey) | <50μs | 70+ | JS/Rust/Go | 256MB | 2min | 按请求+时间 | 中（Fastly 生态） |

---

## 四、代码示例：Cloudflare Edge Function

```typescript
// worker.ts — Cloudflare Workers Edge Function
export interface Env {
  KV_CACHE: KVNamespace;
  RATE_LIMIT: DurableObjectNamespace;
}

// 基于 IP 的速率限制中间件
async function rateLimit(
  request: Request,
  env: Env,
  limit: number = 100,
  window: number = 60
): Promise<Response | null> {
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rate:${clientIP}`;

  const current = await env.KV_CACHE.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= limit) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await env.KV_CACHE.put(key, String(count + 1), { expirationTtl: window });
  return null;
}

// 边缘缓存 + 回源处理
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const cacheKey = `api:${url.pathname}:${url.search}`;

    // 1. 速率限制检查
    const blocked = await rateLimit(request, env);
    if (blocked) return blocked;

    // 2. 边缘缓存读取
    const cached = await env.KV_CACHE.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    // 3. 回源处理（模拟 API 调用）
    const data = await fetch(`https://api.origin.com${url.pathname}`, {
      cf: { cacheTtl: 60 },
    });
    const body = await data.json();
    const response = JSON.stringify(body);

    // 4. 异步写入边缘缓存
    ctx.waitUntil(env.KV_CACHE.put(cacheKey, response, { expirationTtl: 300 }));

    return new Response(response, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=60',
      },
    });
  },
};
```

---

## 五、代码示例：Vercel Edge Middleware

```typescript
// middleware.ts — Next.js Edge Middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};

export function middleware(request: NextRequest) {
  const country = request.geo?.country || 'US';
  const token = request.cookies.get('auth-token')?.value;

  // 地域路由：欧盟用户路由到 GDPR 合规端点
  if (country === 'DE' || country === 'FR') {
    const url = request.nextUrl.clone();
    url.pathname = `/api/eu${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 认证检查
  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 添加安全响应头
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}
```

---

## 六、扩展阅读

- `20-code-lab/20.13-edge-databases/README.md`
- ``30-knowledge-base/30.2-categories/30-edge-databases.md`` (Legacy)

---

## 七、权威参考与外部链接

| 资源 | 描述 | 链接 |
|------|------|------|
| **Cloudflare Workers Docs** | 边缘计算平台官方文档 | [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/) |
| **Vercel Edge Runtime** | Next.js 边缘运行时文档 | [nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes) |
| **AWS Lambda@Edge** | CloudFront 边缘 Lambda 文档 | [docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html) |
| **Deno Deploy** | Deno 边缘部署平台 | [deno.com/deploy](https://deno.com/deploy) |
| **Fastly Compute** | WASM 边缘计算平台 | [developer.fastly.com/learning/compute](https://developer.fastly.com/learning/compute/) |
| **The Edge Computing Opportunity** | Cloudflare 边缘计算白皮书 | [cloudflare.com/learning/serverless/what-is-edge-computing](https://www.cloudflare.com/learning/serverless/what-is-edge-computing/) |
| **Winter CG** | 边缘运行时标准化组织 | [wintercg.org](https://wintercg.org/) |
| **Edge-first Architecture** | Vercel 边缘优先架构指南 | [vercel.com/blog/edge-functions-generally-available](https://vercel.com/blog/edge-functions-generally-available) |

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
