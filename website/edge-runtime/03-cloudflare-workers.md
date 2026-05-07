# 03. Cloudflare Workers 深度解析

## 概述

Cloudflare Workers 是 Edge Runtime 的先驱，运行在全球 300+ 城市的 Cloudflare CDN 节点上。相比 Vercel Edge，它提供更底层的控制能力和独特特性如 **Durable Objects** 和 **D1 数据库**。

## 核心架构

```
请求 → Cloudflare CDN 节点 → V8 Isolate → Worker Script
                                    ↓
                              Durable Objects (有状态)
                              KV / D1 / R2 (存储)
```

## 快速开始

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录
wrangler login

# 创建项目
npm create cloudflare@latest my-worker

# 本地开发
wrangler dev

# 部署
wrangler deploy
```

## 基础 Worker

```typescript
// src/index.ts
export interface Env {
  MY_KV_NAMESPACE: KVNamespace;
  D1_DATABASE: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/users') {
      const { results } = await env.D1_DATABASE.prepare(
        'SELECT * FROM users LIMIT 10'
      ).all();
      return Response.json(results);
    }
    
    if (url.pathname === '/api/cache') {
      // KV 存储 (全球最终一致性)
      await env.MY_KV_NAMESPACE.put('key', 'value');
      const value = await env.MY_KV_NAMESPACE.get('key');
      return new Response(value);
    }
    
    return new Response('Not Found', { status: 404 });
  },
};
```

## Durable Objects: 边缘有状态计算

Cloudflare Workers 最大的差异化能力 —— 在边缘维护状态。

```typescript
// Durable Object 定义
export class ChatRoom {
  constructor(private state: DurableObjectState, private env: Env) {}
  
  async fetch(request: Request): Promise<Response> {
    const wsPair = new WebSocketPair();
    const [client, server] = Object.values(wsPair);
    
    this.state.acceptWebSocket(server);
    
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
  
  async webSocketMessage(ws: WebSocket, message: string) {
    // 广播给所有连接的客户端
    ws.serializeAttachment({ ...ws.deserializeAttachment(), messages: [...] });
  }
}
```

## Workers 与 Vercel Edge 对比

| 维度 | Cloudflare Workers | Vercel Edge |
|------|-------------------|-------------|
| **框架集成** | 手动配置 | Next.js 原生 |
| **有状态** | Durable Objects | ❌ |
| **数据库** | D1 (SQLite), KV | 外部 (Turso, PlanetScale) |
| **对象存储** | R2 (S3-compatible) | 外部 |
| **免费额度** | 100,000 req/day | 无限制 (函数时长限制) |
| **定价** | $0.50/百万请求 | 包含在 Pro/Business 中 |

## 选型建议

| 场景 | 推荐平台 |
|------|----------|
| Next.js 全栈应用 | Vercel Edge |
| WebSocket/实时协作 | Cloudflare Workers + Durable Objects |
| 需要边缘 SQLite | Cloudflare D1 |
| 大规模 API 网关 | Cloudflare Workers (成本更低) |
| 需要原生 TCP/UDP | Deno Deploy |

## 延伸阅读

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Durable Objects 介绍](https://developers.cloudflare.com/durable-objects/)
- [Hono — 边缘优先的 Web 框架](https://hono.dev/)
