# 边缘计算 — 理论基础

## 1. 边缘计算定义

边缘计算是一种分布式计算范式，将计算和数据存储放置在靠近数据源的网络边缘，而非集中式云数据中心。核心目标是**降低延迟**、**减少带宽消耗**、**提高可用性**。

## 2. 边缘运行时架构

### 2.1 V8 Isolate 模型

现代边缘平台（Cloudflare Workers、Vercel Edge Functions）使用 V8 Isolate 而非完整容器：

- **启动时间**: < 1ms（容器为 100ms+）
- **内存开销**: 每个 Isolate 约 5-10MB（容器为 100MB+）
- **冷启动**: 几乎为零（Isolate 复用）
- **限制**: 无文件系统、无原生模块、CPU 时间限制（50ms/请求）

### 2.2 请求生命周期

```
用户请求 → CDN 边缘节点 → V8 Isolate 执行 → 缓存/状态存储 → 响应
         ↑                    ↓
    DNS 路由（Anycast）    Durable Objects/KV
```

## 3. 边缘运行时深度对比

| 维度 | V8 Isolate | WASM | QuickJS |
|------|-----------|------|---------|
| **运行时** | Chrome V8（无浏览器外壳） | 沙箱字节码 VM | 轻量 JS 引擎 |
| **启动时间** | < 1ms | < 10ms | < 5ms |
| **内存占用** | 5-10MB | 视模块而定 | < 1MB |
| **语言支持** | JavaScript/TypeScript | Rust/C/Go/C++ 编译 | JavaScript/TypeScript |
| **标准库** | 完整 Web API（fetch, URL, crypto） | 需宿主暴露 API | 简化 ES2020 子集 |
| **安全模型** | 进程级隔离（Spectre 缓解） | 内存安全 + 能力沙箱 | 纯软件沙箱 |
| **典型平台** | Cloudflare Workers, Deno Deploy, Vercel Edge | Cloudflare Workers, Fastly Compute | 嵌入式设备、游戏脚本 |
| **适用场景** | 高并发 HTTP 边缘函数 | 计算密集型任务（图像处理、加密） | IoT、插件系统、资源极度受限 |

## 4. 代码示例

### 4.1 Cloudflare Worker（中间件 + KV + Durable Objects）

```typescript
// src/index.ts — Cloudflare Worker with middleware pattern
export interface Env {
  KV_NAMESPACE: KVNamespace;
  DURABLE_OBJECTS: DurableObjectNamespace;
}

// 响应缓存中间件
const withCache = async (
  request: Request,
  handler: () => Promise<Response>
): Promise<Response> => {
  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await handler();
  ctx.waitUntil(cache.put(request, response.clone()));
  return response;
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // A/B 测试逻辑（边缘执行，零客户端延迟）
    if (url.pathname === '/experiment') {
      const cookie = request.headers.get('Cookie') || '';
      let variant = cookie.match(/ab_test=(\w)/)?.[1];

      if (!variant) {
        variant = Math.random() > 0.5 ? 'A' : 'B';
      }

      const content = variant === 'A'
        ? '<h1>Variant A: 红色主题</h1>'
        : '<h1>Variant B: 蓝色主题</h1>';

      return new Response(content, {
        headers: {
          'Content-Type': 'text/html',
          'Set-Cookie': `ab_test=${variant}; Path=/; Max-Age=86400`,
          'Cache-Control': 'private, no-store'
        }
      });
    }

    // KV 缓存读取
    if (url.pathname === '/config') {
      return withCache(request, async () => {
        const config = await env.KV_NAMESPACE.get('app:config', { type: 'json' });
        return Response.json(config ?? { default: true });
      });
    }

    // Durable Object：WebSocket 协同编辑房间
    if (url.pathname.startsWith('/room/')) {
      const id = url.pathname.split('/')[2];
      const durableId = env.DURABLE_OBJECTS.idFromName(id);
      const stub = env.DURABLE_OBJECTS.get(durableId);
      return stub.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
```

### 4.2 Vercel Edge Function（Geo + JWT 验证）

```typescript
// middleware.ts — Vercel Edge Middleware
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  const country = request.geo?.country || 'UNKNOWN';
  const token = request.cookies.get('auth')?.value;

  // 地区限制示例
  if (country === 'CN') {
    return NextResponse.json({ error: 'Service unavailable in this region' }, { status: 451 });
  }

  // 轻量 JWT 验证（边缘无状态）
  if (request.nextUrl.pathname.startsWith('/api/protected')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      await jwtVerify(token, SECRET, { clockTolerance: 30 });
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }
  }

  // 注入 Geo 头供下游使用
  const response = NextResponse.next();
  response.headers.set('x-geo-country', country);
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
```

### 4.3 WebAssembly on Edge（Rust + Cloudflare Workers）

```rust
// src/lib.rs — Rust 模块编译为 WASM
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn blur_hash_encode(image: &[u8], width: u32, height: u32) -> String {
    // 使用 blurhash 算法生成占位符（计算密集型任务）
    blurhash::encode(4, 3, width, height, image).unwrap_or_default()
}
```

```typescript
// worker.ts — 在 Worker 中调用 WASM 模块
import blurhashInit from './blurhash_bg.wasm';

// Cloudflare Workers 支持直接导入 WASM 模块（module 模式）
import * as blurhash from './blurhash.js';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/blurhash') {
      const image = await request.arrayBuffer();
      // 将 heavy computation 下沉到 WASM
      const hash = blurhash.blur_hash_encode(
        new Uint8Array(image),
        800,
        600
      );
      return Response.json({ blurHash: hash });
    }
    return new Response('Not Found', { status: 404 });
  }
};
```

## 5. 边缘状态管理

| 存储类型 | 一致性 | 延迟 | 适用场景 |
|---------|--------|------|---------|
| **KV 存储** | 最终一致性 | 全球 < 50ms | 配置、缓存 |
| **Durable Objects** | 强一致性 | 区域 < 10ms | 协作编辑、游戏状态 |
| **SQLite (D1)** | ACID | 区域 < 20ms | 关系型数据 |
| **Cache API** | 最终一致性 | 边缘 < 1ms | HTTP 响应缓存 |

## 6. 边缘渲染策略

- **SSR at Edge**: 在边缘节点执行 React/Vue SSR，减少 TTFB
- **ISR (Incremental Static Regeneration)**: 边缘缓存 + 后台重新生成
- **Streaming**: 边缘流式传输 HTML，渐进式渲染

## 7. 关键挑战

- **调试困难**: 边缘环境难以本地复现
- **供应商锁定**: 各平台 API 差异大（Workers vs Edge Functions）
- **执行限制**: CPU/内存/时间严格受限
- **冷数据**: 跨区域数据访问延迟高

## 8. 与相邻模块的关系

- **93-deployment-edge-lab**: 边缘部署的实践与工具
- **31-serverless**: FaaS 与边缘函数的架构对比
- **96-orm-modern-lab**: 边缘环境下的 ORM 适配

## 参考链接

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Deno Deploy Documentation](https://docs.deno.com/deploy/)
- [Fastly Compute Documentation](https://www.fastly.com/documentation/guides/compute/)
- [WebAssembly on the Edge — Cloudflare](https://developers.cloudflare.com/workers/runtime-apis/webassembly/)
- [WinterCG — Web-interoperable Runtimes Community Group](https://wintercg.org/)
- [MDN: Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [QuickJS Documentation](https://bellard.org/quickjs/)
- [The Edge Computing Landscape — Deno Blog](https://deno.com/blog/the-edge-computing-landscape)
