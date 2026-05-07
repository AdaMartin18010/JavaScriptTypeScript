# 02. Vercel Edge Functions 实战

## 概述

Vercel Edge Functions 基于开源的 [Edge Runtime](https://github.com/vercel/edge-runtime)，与 Next.js App Router 深度集成。

## 两种使用方式

### 1. Next.js Route Handler (推荐)

```typescript
// app/api/geo/route.ts
export const runtime = 'edge'; // 关键声明

export async function GET(request: Request) {
  const country = request.geo?.country || 'US';
  const city = request.geo?.city || 'Unknown';
  
  return Response.json({ country, city });
}
```

### 2. Middleware (边缘中间件)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // A/B 测试
  const bucket = request.cookies.get('ab-test')?.value || 
    (Math.random() > 0.5 ? 'a' : 'b');
  
  const response = NextResponse.next();
  response.cookies.set('ab-test', bucket);
  
  if (bucket === 'b') {
    request.nextUrl.pathname = '/variant-b' + request.nextUrl.pathname;
    return NextResponse.rewrite(request.nextUrl);
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## 可用的环境变量

Vercel Edge 自动注入地理位置信息：

```typescript
// request 对象上的扩展属性
request.geo {
  city?: string;        // "San Francisco"
  country?: string;     // "US"
  region?: string;      // "CA"
  latitude?: string;    // "37.7749"
  longitude?: string;   // "-122.4194"
}

request.ip: string;      // 用户 IP
```

## Edge Config (低延迟配置存储)

```typescript
import { get } from '@vercel/edge-config';

export async function middleware(request: NextRequest) {
  // 从 Edge Config 读取，延迟 < 5ms
  const maintenanceMode = await get('maintenanceMode');
  
  if (maintenanceMode) {
    return NextResponse.json(
      { error: 'Service under maintenance' },
      { status: 503 }
    );
  }
  
  return NextResponse.next();
}
```

## 与 Node.js Runtime 混合部署

```typescript
// app/api/heavy/route.ts
export const runtime = 'nodejs'; // 默认，可省略

export async function POST(request: Request) {
  // 使用 fs, crypto 等 Node.js API
  const { createHash } = require('crypto');
  // ...
}
```

```typescript
// app/api/fast/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  // 纯 Web API，全球低延迟
  return fetch('https://api.example.com/data');
}
```

## 性能对比

| 指标 | Node.js Runtime | Edge Runtime |
|------|----------------|--------------|
| 冷启动 | ~200ms | ~0ms |
| 北京→北京延迟 | ~50ms | ~10ms |
| 北京→美国延迟 | ~300ms | ~10ms (美国节点) |
| 内存占用 | 512MB-1GB | 128MB |

## 限制与注意事项

1. **Node.js API 不可用**: 无法使用 `fs`, `path`, `http`, `net`
2. **npm 包兼容性**: 需选择 Edge-compatible 的包（如 `jose` 替代 `jsonwebtoken`）
3. **本地开发**: `next dev` 默认在 Node.js 运行 Edge 代码，需用 `--turbo` 更接近真实环境

## 延伸阅读

- [Vercel Edge Runtime 文档](https://edge-runtime.vercel.app/)
- [Next.js Edge API Routes](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
