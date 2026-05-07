---
title: 09 边缘部署
description: 掌握 Next.js 的边缘部署：Vercel Edge Runtime、自托管、Docker 部署、Edge Functions 和全球 CDN 配置。
---

# 09 边缘部署

> **前置知识**：Next.js App Router、基础运维知识
>
> **目标**：能够将 Next.js 应用部署到边缘节点，优化全球访问延迟

---

## 1. Edge Runtime 基础

### 1.1 什么是 Edge Runtime？

Edge Runtime 是轻量级的 JavaScript 运行时，运行在 CDN 边缘节点：

| 特性 | Node.js Runtime | Edge Runtime |
|------|----------------|--------------|
| 启动时间 | 100-500ms | 0ms（冷启动消除） |
| 运行位置 | 单一区域 | 全球 100+ 边缘节点 |
| 内存限制 | 1024MB+ | 128MB |
| 支持模块 | 全部 Node.js API | Web API 子集 |
| 适用场景 | 复杂计算、数据库连接 | 轻量计算、A/B 测试、认证 |

### 1.2 Edge API Routes

```typescript
// app/api/geo/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip') || request.headers.get('x-forwarded-for');

  // 边缘节点直接响应
  return Response.json({
    ip,
    city: request.geo?.city,
    country: request.geo?.country,
    region: request.geo?.region,
  });
}
```

---

## 2. Vercel 部署

### 2.1 基础配置

```javascript
// vercel.json
{
  "regions": ["hkg1", "sin1", "sfo1", "iad1"],
  "functions": {
    "app/api/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 2.2 Edge Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};

export function middleware(request: NextRequest) {
  // 根据地理位置重定向
  const country = request.geo?.country || 'US';

  if (country === 'CN' && !request.nextUrl.pathname.startsWith('/zh')) {
    return NextResponse.redirect(new URL('/zh' + request.nextUrl.pathname, request.url));
  }

  // A/B 测试
  const bucket = request.cookies.get('ab-test')?.value ||
    Math.random() > 0.5 ? 'a' : 'b';

  const response = NextResponse.next();
  response.cookies.set('ab-test', bucket);

  return response;
}
```

---

## 3. 自托管

### 3.1 Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 运行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
};
```

### 3.2 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

---

## 4. 全球 CDN 配置

### 4.1 缓存策略

```typescript
// app/api/content/route.ts
export const runtime = 'edge';

export async function GET() {
  const data = await getContent();

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'CDN-Cache-Control': 'max-age=60',
      'Vercel-CDN-Cache-Control': 'max-age=3600',
    },
  });
}
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **Edge Runtime 不支持 Node.js API** | fs、path 等不可用 | 使用 Web API 或切换到 Node Runtime |
| **数据库连接问题** | Edge 无法直接连接传统数据库 | 使用连接池代理或 Edge 数据库 |
| **内存限制** | Edge 只有 128MB | 将复杂计算移到 Node Runtime |

---

## 延伸阅读

- [Vercel Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions)
- [Next.js Self-Hosting](https://nextjs.org/docs/app/building-your-application/deploying#self-hosting)
