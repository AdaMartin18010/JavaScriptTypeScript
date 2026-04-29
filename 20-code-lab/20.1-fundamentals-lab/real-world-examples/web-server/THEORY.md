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

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| 中间件顺序不重要 | 中间件按注册顺序执行，错误顺序导致异常 |
| 错误处理放在最后即可 | 异步错误需要专门的错误处理中间件 |

### 3.4 扩展阅读

- [Node.js HTTP 模块](https://nodejs.org/api/http.html)
- [Express.js 文档](https://expressjs.com/en/4x/api.html)
- [Fastify 文档](https://fastify.dev/docs/latest/)
- [Hono 文档](https://hono.dev/docs/)
- [Hono Middleware](https://hono.dev/docs/concepts/middleware)
- [WinterCG (Web-interoperable Runtimes)](https://wintercg.org/)
- `30-knowledge-base/30.4-backend`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
