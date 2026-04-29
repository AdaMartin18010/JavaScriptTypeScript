# 后端开发 — 架构设计

## 1. 架构概述

本模块实现了完整的 HTTP 服务端架构，涵盖路由分发、中间件管道、认证授权、错误处理和数据库访问。展示从请求接收到响应发送的完整生命周期。架构采用经典的洋葱模型（Onion Model），请求像穿过一层层洋葱皮一样经过多个中间件处理，每一层都可以对请求进行前置处理、调用下一层、并对响应进行后置处理。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         客户端 (Client)                                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    HTTP Request (REST / JSON)                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      传输层 (Transport Layer)                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │         Node.js http / Bun / Deno / uWS (WebSocket)              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      中间件管道 (Middleware Pipeline)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  CORS /  │  │  Rate    │  │   Auth   │  │   Body   │  │   Log    │  │
│  │  Security│→ │  Limiter │→ │ (JWT/   │→ │  Parser  │→ │ / Trace  │  │
│  │  Headers │  │          │  │ Session) │  │          │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────┬─────┘  │
│                                                                 │        │
│  ┌──────────────────────────────────────────────────────────────┘        │
│  │                          Error Handler (Catch)                         │
│  └───────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      路由与处理层 (Routing & Handler)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │    Router    │  │  Controller  │  │   Service    │  │  Validator  │ │
│  │  (Path/Meth. │  │  (HTTP Resp. │  │  (Business  │  │  (Zod/Joi   │ │
│  │   Dispatch)  │  │   Transform) │  │   Logic)    │  │   Schema)   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      数据访问层 (Data Access Layer)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  Repository  │  │    Model     │  │ Query Builder│                   │
│  │  (Abstract   │  │  (Domain     │  │ (Type-safe   │                   │
│  │   Interface) │  │   Entity)    │  │   SQL/NoSQL) │                   │
│  └──────┬───────┘  └──────────────┘  └──────────────┘                   │
└─────────┼─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      持久化层 (Persistence)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   PostgreSQL │  │    Redis     │  │    MongoDB   │                   │
│  │   (Primary)  │  │   (Cache/    │  │   (Document) │                   │
│  │              │  │   Session)   │  │              │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 HTTP 服务器

| 组件 | 职责 | 实现选项 | 性能特征 |
|------|------|----------|----------|
| Server | 基于 Node.js http 模块或原生 TCP | `node:http`, `Bun.serve`, `Deno.serve` | 取决于运行时 |
| Router | 路径匹配与 HTTP 方法分发 | 前缀树 (Trie) / 正则 | O(path length) |
| Request/Response | 请求解析与响应封装 | 流式解析 / 对象封装 | — |

### 3.2 中间件管道

| 组件 | 职责 | 执行顺序 | 错误处理 |
|------|------|----------|----------|
| Middleware Stack | 洋葱模型，先进后出执行 | FIFO 进入，LIFO 退出 | 抛出到 Error Middleware |
| Error Middleware | 统一错误捕获和格式化 | 管道末端 | 统一格式化 |
| Auth Middleware | JWT 验证和权限检查 | 早期 | 401/403 响应 |

### 3.3 数据访问层

| 组件 | 职责 | 设计模式 | 测试策略 |
|------|------|----------|----------|
| Repository | 数据访问抽象，隔离数据库细节 | 仓储模式 | In-Mem 替换 |
| Model | 领域实体定义 | 贫血/充血模型 | 单元测试 |
| Query Builder | 类型安全的查询构建 | 建造者模式 | 集成测试 |

## 4. 数据流

```
Request → Parser → Router → Middleware Stack → Handler → Service → Repository → Database
                                    ↓
                              Error Handler → Response
```

## 5. 技术栈对比

| 框架/运行时 | 中间件模型 | 路由性能 | 类型安全 | 生态 | 冷启动 | 适用场景 |
|-------------|-----------|----------|----------|------|--------|----------|
| 本实验室 | 洋葱模型 | 中 | ★★★★★ | 教学 | 快 | 学习/原型 |
| Express.js | 线性栈 | 中 | ★★ | ★★★★★ | 快 | 传统 Web |
| Fastify | 钩子 + 插件 | 高 | ★★★★ | ★★★★ | 快 | 高性能 API |
| Hono | 线性 + 兼容 | 很高 | ★★★★ | ★★★ | 很快 | 边缘/全平台 |
| Elysia | 编译时优化 | 很高 | ★★★★★ | ★★ | 很快 | Bun 生态 |
| NestJS | 洋葱 + 装饰器 | 中 | ★★★★★ | ★★★★★ | 慢 | 企业级 |
| tRPC | 直接调用 | 高 | ★★★★★ | ★★★ | 中 | 全栈 TS |

## 6. 代码示例

### 6.1 洋葱中间件引擎

```typescript
// backend-development/src/core/Application.ts
type Middleware = (
  ctx: Context,
  next: () => Promise<void>
) => Promise<void>;

interface Context {
  request: Request;
  response: Response;
  state: Record<string, any>;
}

class Application {
  private middlewares: Middleware[] = [];

  use(mw: Middleware): void {
    this.middlewares.push(mw);
  }

  async handle(req: Request): Promise<Response> {
    const ctx: Context = { request: req, response: new Response(), state: {} };

    const dispatch = (i: number): Promise<void> => {
      if (i >= this.middlewares.length) return Promise.resolve();
      const mw = this.middlewares[i];
      return mw(ctx, () => dispatch(i + 1));
    };

    try {
      await dispatch(0);
    } catch (err) {
      ctx.response = new Response(
        JSON.stringify({ error: (err as Error).message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return ctx.response;
  }
}

// 使用示例
const app = new Application();

app.use(async (ctx, next) => {
  console.log(`→ ${ctx.request.method} ${ctx.request.url}`);
  await next();
  console.log(`← ${ctx.response.status}`);
});

app.use(async (ctx, next) => {
  if (ctx.request.url === '/health') {
    ctx.response = new Response(JSON.stringify({ status: 'ok' }));
    return;
  }
  await next();
});
```

### 6.2 类型安全路由定义

```typescript
// backend-development/src/core/Router.ts
type RouteHandler = (ctx: Context) => Promise<Response> | Response;

interface Route {
  method: string;
  path: string;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

class Router {
  private routes: Route[] = [];

  get(path: string, handler: RouteHandler): void {
    this.addRoute('GET', path, handler);
  }

  post(path: string, handler: RouteHandler): void {
    this.addRoute('POST', path, handler);
  }

  private addRoute(method: string, path: string, handler: RouteHandler): void {
    const paramNames: string[] = [];
    const regexPattern = path.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    this.routes.push({
      method,
      path,
      pattern: new RegExp(`^${regexPattern}$`),
      paramNames,
      handler,
    });
  }

  match(method: string, url: string): { handler: RouteHandler; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== method) continue;
      const match = url.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        return { handler: route.handler, params };
      }
    }
    return null;
  }
}
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 中间件模型 | 洋葱圈模型 | 支持前置/后置处理 |
| 错误处理 | 集中式错误中间件 | 统一格式，避免泄漏敏感信息 |
| 数据库访问 | Repository 模式 | 便于测试和更换数据库 |

## 8. 质量属性

- **可扩展性**: 中间件和路由的插件式扩展
- **安全性**: 输入验证、认证、授权分层防护
- **可观测性**: 请求日志、性能指标、错误追踪

## 9. 参考链接

- [Node.js HTTP Module](https://nodejs.org/api/http.html) — Node.js 官方 HTTP 文档
- [Express.js Guide](https://expressjs.com/en/guide/routing.html) — Express 路由与中间件指南
- [Fastify Documentation](https://fastify.dev/docs/latest/) — Fastify 高性能框架文档
- [Hono - Ultrafast Web Framework](https://hono.dev/) — 跨平台边缘优先框架
- [NestJS Architecture](https://docs.nestjs.com/) — 企业级 Node.js 框架架构
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/) — API 安全权威清单
