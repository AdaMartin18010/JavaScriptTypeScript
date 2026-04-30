# 后端框架

> JavaScript/TypeScript 后端框架选型矩阵。

---

## 主流框架对比

| 维度 | Express | Fastify | NestJS | Hono | Elysia |
|------|---------|---------|--------|------|--------|
| **定位** | 极简经典 | 高性能 Node.js | 企业级架构 | 边缘优先 | 类型安全 Bun 优先 |
| **吞吐量** | 低（~15K req/s） | 高（500K+ req/s） | 中 | 极高（840K req/s） | 极高（~700K req/s） |
| **TypeScript** | 需配置 | 插件 | 原生 | 原生 | 原生 |
| **中间件模型** | 回调函数 | 钩子 + 插件 | 装饰器 + IoC | 内置中间件 | 编译时宏 |
| **校验** | 手动 / Joi | JSON Schema | class-validator | Zod / Validator | 类型推导校验 |
| **生态成熟度** | 最丰富 | 快速增长 | 丰富 | 快速增长 | 新兴 |
| **运行环境** | Node.js | Node.js | Node.js | Node.js / Edge / Deno | Bun / Node.js |
| **学习曲线** | 极低 | 低 | 高 | 极低 | 低 |
| **2026 状态** | ⚠️ 维护放缓 | ✅ 活跃 | ✅ 活跃 | ✅ 快速增长 | ✅ 快速增长 |

---

## 代码示例

### Fastify + TypeScript（TypeBox）

```typescript
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

const app = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

const UserSchema = Type.Object({
  id: Type.Number(),
  name: Type.String({ minLength: 1 }),
  email: Type.String({ format: 'email' }),
});

app.get('/users/:id', {
  schema: {
    params: Type.Object({ id: Type.Number() }),
    response: { 200: UserSchema },
  },
}, async (request) => {
  return { id: request.params.id, name: 'Alice', email: 'alice@example.com' };
});

async function bootstrap() {
  await app.listen({ port: 3000, host: '0.0.0.0' });
}
bootstrap();
```

### NestJS 控制器 + 依赖注入

```typescript
import { Controller, Get, Param, Injectable } from '@nestjs/common';

@Injectable()
class UserService {
  findById(id: number) {
    return { id, name: 'Alice', email: 'alice@example.com' };
  }
}

@Controller('users')
class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.findById(Number(id));
  }
}
```

### Hono — Cloudflare Workers 边缘函数

```typescript
import { Hono } from 'hono';

const app = new Hono();

app.get('/api/users/:id', (c) => {
  const id = c.req.param('id');
  return c.json({ id, name: 'Alice', source: 'edge' });
});

app.post('/api/users', async (c) => {
  const body = await c.req.json<{ name: string; email: string }>();
  return c.json({ created: true, ...body }, 201);
});

export default app;
```

### Elysia — 端到端类型安全

```typescript
import { Elysia, t } from 'elysia';

const app = new Elysia()
  .get('/users/:id', ({ params: { id } }) => ({ id: Number(id), name: 'Alice' }), {
    params: t.Object({ id: t.Numeric() }),
    response: t.Object({ id: t.Number(), name: t.String() }),
  })
  .listen(3000);

type App = typeof app;
// Eden Treaty 客户端可完全推导路由类型
```

### Express — 中间件与错误处理

```typescript
import express, { Request, Response, NextFunction } from 'express';

const app = express();
app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: err.message });
});

app.listen(3000);
```

### Fastify + tRPC 类型安全路由

```typescript
import { initTRPC } from '@trpc/server';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';
import { z } from 'zod';

const t = initTRPC.create();
const appRouter = t.router({
  user: t.procedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => ({ id: input.id, name: 'Alice' })),
});

const app = Fastify();
app.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter },
});

// 客户端可直接推导 appRouter 类型
export type AppRouter = typeof appRouter;
```

### NestJS 全局异常过滤器 + 拦截器

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
    });
  }
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    console.log(`Incoming: ${req.method} ${req.url}`);
    const now = Date.now();
    return next.handle().pipe(
      tap(() => console.log(`Handled in ${Date.now() - now}ms`)),
    );
  }
}
```

### Hono — 中间件组合与 CORS

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { bearerAuth } from 'hono/bearer-auth';

const app = new Hono();

app.use(logger());
app.use(cors({ origin: ['https://app.example.com'] }));

// 受保护路由
const api = new Hono();
api.use('/admin/*', bearerAuth({ token: 'secret-token' }));
api.get('/admin/dashboard', (c) => c.json({ data: 'sensitive' }));

app.route('/api', api);
export default app;
```

---

### Elysia Eden Treaty 端到端类型安全客户端

```typescript
// server.ts
import { Elysia, t } from 'elysia';

const app = new Elysia()
  .get('/users/:id', ({ params: { id } }) => ({ id: Number(id), name: 'Alice' }), {
    params: t.Object({ id: t.Numeric() }),
    response: t.Object({ id: t.Number(), name: t.String() }),
  })
  .post('/users', ({ body }) => ({ created: true, id: 1, ...body }), {
    body: t.Object({ name: t.String(), email: t.String({ format: 'email' }) }),
    response: t.Object({ created: t.Boolean(), id: t.Number() }),
  })
  .listen(3000);

export type App = typeof app;
```

```typescript
// client.ts
import { treaty } from '@elysiajs/eden';
import type { App } from './server';

const client = treaty<App>('http://localhost:3000');

// 类型安全调用：参数和返回值完全推导
const { data: user } = await client.users({ id: '42' }).get();
// user 类型为 { id: number; name: string } | null

const { data: created } = await client.users.post({
  name: 'Bob',
  email: 'bob@example.com',
});
// created 类型为 { created: boolean; id: number } | null
```

---

## 选型建议

| 场景 | 推荐框架 |
|------|----------|
| 快速原型 / 小型 API | Express / Hono |
| 高吞吐 API / 微服务 | Fastify / Elysia |
| 企业级 / 复杂业务 | NestJS |
| 边缘函数 / Cloudflare Workers | Hono |
| 类型安全极致追求 | Elysia (Bun) |

---

## 权威参考链接

- [Express 官方文档](https://expressjs.com/)
- [Fastify 官方文档](https://fastify.dev/)
- [NestJS 官方文档](https://nestjs.com/)
- [Hono 官方文档](https://hono.dev/)
- [Elysia 官方文档](https://elysiajs.com/)
- [Node.js 官方文档](https://nodejs.org/docs/latest/api/)
- [Bun 运行时文档](https://bun.sh/docs)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [tRPC 文档](https://trpc.io/docs)
- [WinterTC / Ecma TC55 规范](https://wintertc.org/)
- [TechEmpower Web Framework Benchmarks](https://www.techempower.com/benchmarks/)
- [TypeScript Handbook — Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Fastify Benchmarks 与性能调优](https://github.com/fastify/benchmarks)
- [NestJS Providers 与依赖注入](https://docs.nestjs.com/providers)
- [Hono Middleware 官方指南](https://hono.dev/docs/guides/middleware)
- [Express 5.x 迁移指南](https://expressjs.com/en/guide/migrating-5.html)
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [MDN — HTTP 状态码参考](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Elysia Eden Treaty — End-to-End Type Safety](https://elysiajs.com/eden/overview.html) — Elysia 官方客户端类型推导文档
- [Hono Zod OpenAPI](https://hono.dev/examples/zod-openapi) — Hono 类型安全 OpenAPI 集成
- [Fastify Type Providers](https://fastify.dev/docs/latest/Reference/Type-Providers/) — Fastify 官方类型提供者指南
- [NestJS OpenAPI (Swagger)](https://docs.nestjs.com/openapi/introduction) — NestJS 自动生成 API 文档
- [Express 5.x Beta Documentation](https://expressjs.com/en/5x/api.html) — Express 下一代版本 API 参考

## 进阶代码示例

### Fastify 生命周期钩子与插件

```typescript
import Fastify from 'fastify';

const app = Fastify({ logger: true });

// 全局生命周期钩子
app.addHook('onRequest', async (request, reply) => {
  request.log.info(`Incoming ${request.method} ${request.url}`);
});

app.addHook('onSend', async (_request, reply, payload) => {
  reply.header('x-response-time', reply.elapsedTime);
  return payload;
});

// 注册插件
app.register(import('@fastify/compress'), { global: true });
app.register(import('@fastify/cors'), { origin: '*' });

app.get('/health', async () => ({ status: 'ok' }));

await app.listen({ port: 3000 });
```

### NestJS 守卫与拦截器组合

```typescript
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { LoggingInterceptor } from './logging.interceptor';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('users')
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor, CacheInterceptor)
export class UserController {
  @Get(':id')
  getUser(@Param('id') id: string) {
    return { id, name: 'Alice' };
  }
}
```

### Hono OpenAPI + Zod 类型安全文档

```typescript
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { swaggerUI } from '@hono/swagger-ui';

const app = new Hono();

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
});

app.get('/api/users/:id', zValidator('param', z.object({ id: z.string() })), (c) => {
  const id = c.req.param('id');
  return c.json({ id: Number(id), name: 'Alice' });
});

app.get('/ui', swaggerUI({ url: '/doc' }));
export default app;
```

### Elysia WebSocket 实时推送

```typescript
import { Elysia } from 'elysia';

const app = new Elysia()
  .ws('/ws', {
    open(ws) {
      ws.subscribe('broadcast');
      ws.send({ type: 'connected', id: ws.id });
    },
    message(ws, message) {
      ws.publish('broadcast', message);
    },
  })
  .listen(3000);
```

### Express 安全中间件组合

```typescript
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get('/', (_req, res) => res.json({ ok: true }));
app.listen(3000);
```

---

## 扩展参考链接

- [Fastify Lifecycle Hooks](https://fastify.dev/docs/latest/Reference/Hooks/) — 官方生命周期文档
- [NestJS Guards](https://docs.nestjs.com/guards) — 守卫机制详解
- [Hono OpenAPI Example](https://hono.dev/examples/zod-openapi) — Hono 类型安全 OpenAPI 集成
- [Elysia WebSocket](https://elysiajs.com/patterns/websocket.html) — Elysia 官方 WebSocket 指南
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html) — Express 官方安全建议
- [Helmet.js Documentation](https://helmetjs.github.io/) — 安全 HTTP 头中间件
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [MDN — HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [TechEmpower Benchmarks](https://www.techempower.com/benchmarks/) — Web 框架性能基准

---

*最后更新: 2026-04-29*
