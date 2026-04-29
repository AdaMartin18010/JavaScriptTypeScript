---
category: frameworks
dimension: 框架生态
sub-dimension: 后端框架
module: 19-backend-development
---

# 模块归属声明

本模块归属 **「框架（Frameworks）」** 维度，聚焦 JavaScript/TypeScript 后端框架与服务端开发模式。

## 包含内容

- Express / Fastify / NestJS / Hono 框架模式
- RESTful API 与 RPC API 设计
- WebSocket 实时通信
- 中间件机制与请求处理管线
- 服务端架构设计

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `express-patterns.ts` | Express 中间件管线与错误边界 | `express-patterns.test.ts` |
| `api-design.ts` | RESTful / RPC / OpenAPI 设计规范 | `api-design.test.ts` |
| `websocket-patterns.ts` | WebSocket 服务端房间管理与广播 | `websocket-patterns.test.ts` |
| `ARCHITECTURE.md` | 服务端架构设计文档 | — |
| `index.ts` | 模块统一导出 | — |

## 代码示例

### 函数式中间件管线

```typescript
// express-patterns.ts
import type { Request, Response, NextFunction } from 'express';

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export function compose(...middlewares: Middleware[]): Middleware {
  return (req, res, next) => {
    let index = -1;

    function dispatch(i: number): void | Promise<void> {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      const fn = middlewares[i] ?? next;
      return fn(req, res, () => dispatch(i + 1));
    }

    return dispatch(0);
  };
}
```

### RESTful 路由工厂

```typescript
// api-design.ts
export function createResourceRouter<T>(
  resource: string,
  handlers: {
    list(req: Request, res: Response): Promise<T[]>;
    get(req: Request, res: Response): Promise<T>;
    create(req: Request, res: Response): Promise<T>;
    update(req: Request, res: Response): Promise<T>;
    remove(req: Request, res: Response): Promise<void>;
  }
) {
  const router = require('express').Router();

  router.get(`/${resource}`, wrap(handlers.list));
  router.get(`/${resource}/:id`, wrap(handlers.get));
  router.post(`/${resource}`, wrap(handlers.create));
  router.put(`/${resource}/:id`, wrap(handlers.update));
  router.delete(`/${resource}/:id`, wrap(handlers.remove));

  return router;
}

function wrap(handler: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}
```

### 类型安全 WebSocket 房间广播

```typescript
// websocket-patterns.ts
import { WebSocketServer, WebSocket } from 'ws';

export class TypedRoom<TMessage extends { type: string; payload: unknown }> {
  private clients = new Set<WebSocket>();

  join(ws: WebSocket) {
    this.clients.add(ws);
    ws.on('close', () => this.clients.delete(ws));
  }

  broadcast(message: TMessage, exclude?: WebSocket) {
    const data = JSON.stringify(message);
    this.clients.forEach((ws) => {
      if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }
}
```

### Fastify 插件与生命周期钩子

```typescript
// fastify-patterns.ts — Fastify 的插件系统与性能优势
import fastify, { FastifyInstance, FastifyPluginAsync } from 'fastify';

const metricsPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('onResponse', async (request, reply) => {
    console.log(`${request.method} ${request.url} — ${reply.statusCode} in ${reply.elapsedTime}ms`);
  });
};

const userRoutes: FastifyPluginAsync = async (app) => {
  app.get('/users', async () => {
    return [{ id: 1, name: 'Alice' }];
  });

  app.get('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = await findUserById(id);
    if (!user) {
      reply.status(404);
      return { error: 'Not found' };
    }
    return user;
  });
};

async function bootstrap() {
  const app = fastify({ logger: true });
  await app.register(metricsPlugin);
  await app.register(userRoutes, { prefix: '/api' });
  await app.listen({ port: 3000, host: '0.0.0.0' });
}
```

### OpenAPI 3.1 + Zod 类型安全校验

```typescript
// openapi-validation.ts — 使用 zod-openapi 生成规范并校验
import { extendZodWithOpenApi, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

extendZodWithOpenApi(z);

const UserSchema = z.object({
  id: z.string().openapi({ example: 'usr_123' }),
  email: z.string().email().openapi({ example: 'alice@example.com' }),
  role: z.enum(['admin', 'user']).openapi({ example: 'user' }),
}).openapi('User');

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }
    (req as any).validatedBody = parsed.data;
    next();
  };
}

// 使用
app.post('/users', validateBody(UserSchema.omit({ id: true })), (req, res) => {
  const body = (req as any).validatedBody;
  res.status(201).json(createUser(body));
});
```

## 相关索引

- [30-knowledge-base/30.2-categories/README.md](../../../30-knowledge-base/30.2-categories/README.md)
- [30-knowledge-base/30.2-categories/14-backend-frameworks.md](../../../30-knowledge-base/30.2-categories/14-backend-frameworks.md)

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Express.js Docs | 文档 | [expressjs.com](https://expressjs.com) |
| Fastify Docs | 文档 | [fastify.dev](https://fastify.dev) |
| NestJS Docs | 文档 | [docs.nestjs.com](https://docs.nestjs.com) |
| Hono — Ultrafast Web Framework | 文档 | [hono.dev](https://hono.dev) |
| OpenAPI Specification | 规范 | [spec.openapis.org](https://spec.openapis.org) |
| Richardson Maturity Model | 指南 | [martinfowler.com/articles/richardsonMaturityModel.html](https://martinfowler.com/articles/richardsonMaturityModel.html) |
| Node.js Docs | 文档 | [nodejs.org/docs/latest/api](https://nodejs.org/docs/latest/api) |
| JSON Schema | 规范 | [json-schema.org](https://json-schema.org/) |
| tRPC Documentation | 类型安全 RPC | [trpc.io/docs](https://trpc.io/docs) |
| gRPC Web | 指南 | [github.com/grpc/grpc-web](https://github.com/grpc/grpc-web) |
| Zod Documentation | 校验库 | [zod.dev](https://zod.dev) |
| Node.js Design Patterns Book | 书籍 | [nodejsdp.link](https://nodejsdp.link) |
| HTTP/3 RFC 9114 | 标准 | [datatracker.ietf.org/doc/html/rfc9114](https://datatracker.ietf.org/doc/html/rfc9114) |

---

*最后更新: 2026-04-29*
