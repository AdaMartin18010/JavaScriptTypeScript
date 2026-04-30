# Web 服务器

> **定位**：`20-code-lab/20.1-fundamentals-lab/real-world-examples/web-server`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 HTTP 服务器的构建问题。涵盖路由、中间件、错误处理和并发请求管理。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 中间件 | 请求处理管道的可插拔组件 | middleware.ts |
| 路由 | URL 到处理函数的映射机制 | router.ts |

---

## 二、设计原理

### 2.1 为什么存在

HTTP 是互联网应用的事实标准通信协议。Web 服务器作为请求的入口，负责路由分发、中间件处理和响应组装，是整个后端架构的基石。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 微框架 | 轻量、灵活 | 需自行组装 | 定制化 API |
| 全功能框架 | 开箱即用 | 体积与耦合 | 快速原型 |

### 2.3 特性对比表：Express vs Fastify vs Hono

| 特性 | Express (v5) | Fastify (v5) | Hono (v4) |
|------|-------------|-------------|-----------|
| 体积 (min) | ~60 KB | ~50 KB | ~15 KB |
| 性能 (req/sec) | 基准 | ~2x Express | ~5x Express |
| 中间件模型 | 洋葱 / 线形 | 洋葱 | 洋葱 |
| 类型安全 | 需 @types/express | 原生 TypeScript | 原生 TypeScript |
| Schema 校验 | 需额外库 (Joi/Zod) | 内置 JSON Schema | 需适配器 (Zod) |
| 异步错误捕获 | 有限 | 原生支持 | 原生支持 |
| 插件生态 | 最丰富 | 丰富 | 快速增长 |
| 运行时 | Node.js | Node.js / Deno / Bun | Node.js / Deno / Bun / Edge |
| Edge/Serverless | 需适配 | 部分支持 | 原生优化 |
| 启动速度 | 中 | 快 | 极快 |

### 2.4 与相关技术的对比

与 Serverless 对比：传统服务器可控性强，Serverless 弹性更好。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 Web 服务器 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：Hono 路由与中间件

```typescript
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';

// ===== 应用实例 =====
const app = new Hono();

// ===== 全局中间件：日志与请求 ID =====
app.use(logger());
app.use(async (c, next) => {
  c.header('X-Request-Id', crypto.randomUUID());
  await next();
});

// ===== 路由组：用户 API =====
const user = new Hono();

user.get('/', (c) => {
  return c.json({ users: ['alice', 'bob'] });
});

user.get('/:id', (c) => {
  const id = c.req.param('id');
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new HTTPException(400, { message: 'Invalid user id format' });
  }
  return c.json({ id, name: `User ${id}` });
});

user.post('/', async (c) => {
  const body = await c.req.json<{ name: string }>();
  if (!body?.name || typeof body.name !== 'string') {
    throw new HTTPException(422, { message: 'Field "name" is required' });
  }
  return c.json({ id: crypto.randomUUID(), name: body.name }, 201);
});

// 挂载路由组
app.route('/users', user);

// ===== 全局错误处理中间件 =====
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message, status: err.status }, err.status);
  }
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// ===== 404 兜底 =====
app.notFound((c) => {
  return c.json({ error: `Route ${c.req.url} not found` }, 404);
});

// ===== 启动 =====
// Bun: Bun.serve({ fetch: app.fetch, port: 3000 });
// Deno: Deno.serve({ port: 3000 }, app.fetch);
// Node: import { serve } from '@hono/node-server'; serve({ fetch: app.fetch, port: 3000 });

export default app;
```

### 3.3 代码示例：纯 Node.js HTTP 中间件模式实现

```typescript
// middleware-pattern.ts — 不依赖框架的洋葱模型中间件
import { createServer, IncomingMessage, ServerResponse } from "http";

type NextFn = () => Promise<void> | void;
type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFn
) => Promise<void> | void;

function compose(middlewares: Middleware[]): Middleware {
  return async (req, res, next) => {
    let index = -1;

    async function dispatch(i: number): Promise<void> {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;
      const fn = middlewares[i] ?? next;
      if (!fn) return;
      await fn(req, res, () => dispatch(i + 1));
    }

    await dispatch(0);
  };
}

// 中间件实现
const loggerMiddleware: Middleware = async (req, res, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${req.method} ${req.url} — ${res.statusCode} (${duration}ms)`);
};

const authMiddleware: Middleware = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }
  (req as any).user = { id: "user-123", role: "admin" };
  await next();
};

const routeHandler: Middleware = async (req, res) => {
  if (req.url === "/health") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ status: "ok", timestamp: Date.now() }));
    return;
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ error: "Not Found" }));
};

// 组合并启动
const app = compose([loggerMiddleware, authMiddleware, routeHandler]);

const server = createServer((req, res) => {
  app(req, res, () => {
    res.statusCode = 404;
    res.end();
  });
});

server.listen(3000, () => console.log("Server on http://localhost:3000"));
```

### 3.4 代码示例：速率限制中间件（Token Bucket）

```typescript
// rate-limiter.ts — Token Bucket 算法实现

interface Bucket {
  tokens: number;
  lastRefill: number;
}

class TokenBucketRateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private capacity: number,
    private refillRate: number // tokens per ms
  ) {}

  isAllowed(key: string): { allowed: boolean; remaining: number; resetAfter: number } {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    // 补充令牌
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetAfter: Math.ceil((1 - bucket.tokens) / this.refillRate),
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetAfter: Math.ceil(1 / this.refillRate),
    };
  }
}

// 使用：Hono 中间件
import { MiddlewareHandler } from "hono";

const rateLimiter = new TokenBucketRateLimiter(100, 0.1); // 100 tokens, 10/sec refill

export const rateLimit: MiddlewareHandler = async (c, next) => {
  const key = c.req.header("x-forwarded-for") || "anonymous";
  const result = rateLimiter.isAllowed(key);

  c.header("X-RateLimit-Remaining", String(result.remaining));
  c.header("X-RateLimit-Reset", String(result.resetAfter));

  if (!result.allowed) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  await next();
};
```

### 3.5 代码示例：WebSocket 升级与 HTTP 共存

```typescript
// websocket-server.ts — Node.js 原生 HTTP + WebSocket 升级
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`Client connected. Total: ${clients.size}`);

  ws.on("message", (data) => {
    const message = data.toString();
    // 广播给所有客户端
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "broadcast", data: message }));
      }
    });
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`Client disconnected. Total: ${clients.size}`);
  });
});

httpServer.listen(3000, () =>
  console.log("HTTP + WebSocket server on port 3000")
);
```

### 3.6 代码示例：Graceful Shutdown 与 Keep-Alive 管理

```typescript
// graceful-shutdown.ts
import { createServer } from 'http';

const server = createServer((req, res) => {
  res.end('OK');
});

server.listen(3000, () => console.log('Server running'));

function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  // 停止接受新连接
  server.close((err) => {
    if (err) {
      console.error('Error during server close:', err);
      process.exit(1);
    }
    console.log('HTTP server closed. Exiting.');
    process.exit(0);
  });

  // 强制退出兜底（10 秒后）
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

### 3.7 代码示例：Node.js Cluster 模式利用多核

```typescript
// cluster-mode.ts
import cluster from 'cluster';
import { createServer } from 'http';
import os from 'os';

const numCPUs = os.availableParallelism();

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Forking new one...`);
    cluster.fork();
  });
} else {
  const server = createServer((req, res) => {
    res.writeHead(200);
    res.end(`Hello from worker ${process.pid}\n`);
  });

  server.listen(3000, () => {
    console.log(`Worker ${process.pid} started`);
  });
}
```

### 3.8 代码示例：CORS 中间件实现

```typescript
// cors-middleware.ts
import { MiddlewareHandler } from 'hono';

interface CorsOptions {
  origin?: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export function cors(options: CorsOptions = {}): MiddlewareHandler {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = false,
    maxAge = 86400,
  } = options;

  return async (c, next) => {
    const reqOrigin = c.req.header('origin') || '*';

    let allowOrigin: string;
    if (typeof origin === 'string') {
      allowOrigin = origin;
    } else if (Array.isArray(origin)) {
      allowOrigin = origin.includes(reqOrigin) ? reqOrigin : '';
    } else {
      allowOrigin = origin(reqOrigin) ? reqOrigin : '';
    }

    c.header('Access-Control-Allow-Origin', allowOrigin);
    c.header('Access-Control-Allow-Methods', methods.join(', '));
    c.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    c.header('Access-Control-Max-Age', String(maxAge));
    if (credentials) {
      c.header('Access-Control-Allow-Credentials', 'true');
    }

    if (c.req.method === 'OPTIONS') {
      return c.text('', 204);
    }

    await next();
  };
}
```

### 3.9 常见误区

| 误区 | 正确理解 |
|------|---------|
| 中间件顺序不重要 | 中间件按注册顺序执行，错误顺序导致异常 |
| 错误处理放在最后即可 | 异步错误需要专门的错误处理中间件 |
| 单进程即可应对高并发 | Node.js 单线程，CPU 密集型需 Cluster 或 Worker Threads |
| WebSocket 与 HTTP 不能共享端口 | 可通过 `upgrade` 事件在同端口共存 |

### 3.10 扩展阅读

- [Node.js HTTP 模块](https://nodejs.org/api/http.html)
- [Node.js HTTPS 模块](https://nodejs.org/api/https.html)
- [Node.js Cluster 模块](https://nodejs.org/api/cluster.html)
- [Node.js Stream 模块](https://nodejs.org/api/stream.html)
- [Express.js 文档](https://expressjs.com/en/4x/api.html)
- [Fastify 文档](https://fastify.dev/docs/latest/)
- [Hono 文档](https://hono.dev/docs/)
- [Hono Middleware](https://hono.dev/docs/concepts/middleware)
- [WinterCG (Web-interoperable Runtimes)](https://wintercg.org/)
- [MDN — HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [MDN — WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [MDN — Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [RFC 7230 — HTTP/1.1 Message Syntax](https://datatracker.ietf.org/doc/html/rfc7230)
- [RFC 7540 — HTTP/2](https://datatracker.ietf.org/doc/html/rfc7540)
- [RFC 9113 — HTTP/2 (更新)](https://datatracker.ietf.org/doc/html/rfc9113)
- [RFC 6455 — WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [OWASP — Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- `30-knowledge-base/30.4-backend`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
