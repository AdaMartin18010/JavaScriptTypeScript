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

---

*最后更新: 2026-04-29*
