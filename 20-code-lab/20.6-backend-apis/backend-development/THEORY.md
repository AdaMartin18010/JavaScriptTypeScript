# 后端开发 — 理论基础

## 1. HTTP 服务端架构

### 1.1 请求处理流程

```
请求 → 路由匹配 → 中间件栈 → 处理器 → 响应
```

### 1.2 中间件模式

每个中间件函数接收 `(req, res, next)`：

- 可以修改请求/响应对象
- 可以终止请求（不调用 next）
- 可以调用 next() 将控制权传递给下一个中间件
- 应用：认证、日志、错误处理、压缩、CORS

---

## 2. 认证授权体系

### 2.1 认证（Authentication）—— 确认你是谁

- **Session + Cookie**: 服务端存储会话状态，Cookie 传递 Session ID
- **JWT**: 无状态令牌，包含签名防止篡改，服务端无需存储会话
- **OAuth 2.0**: 第三方授权框架，委托访问权限
- **Passkeys**: 基于 WebAuthn 的无密码认证

### 2.2 授权（Authorization）—— 确认你能做什么

- **RBAC**: 基于角色的访问控制（用户→角色→权限）
- **ABAC**: 基于属性的访问控制（动态策略评估）
- **ACL**: 访问控制列表（直接绑定用户与资源权限）

---

## 3. 数据库访问模式

- **Active Record**: 模型类直接包含 CRUD 方法
- **Repository**: 数据访问逻辑封装在仓储层
- **DAO**: 数据访问对象，更底层的数据库操作抽象
- **Unit of Work**: 跟踪对象变更，批量提交事务

---

## 4. API 设计范式对比

| 特性 | REST | GraphQL | gRPC | tRPC |
|---|---|---|---|---|
| 设计范式 | 资源导向 | 查询导向 | 服务方法导向 | 类型安全 RPC |
| 传输协议 | HTTP/1.1, HTTP/2 | HTTP/1.1, HTTP/2 | HTTP/2 | HTTP/1.1, HTTP/2 |
| 数据格式 | JSON / XML | JSON | Protocol Buffers | JSON |
| 强类型 | 弱（约定） | 模式强类型（Schema） | 强（Protobuf） | 强（TypeScript 推导） |
| 流支持 | 有限（SSE / 长轮询） | Subscription（WebSocket/SSE） | 双向流（Duplex Streaming） | 有限（Subscription） |
| 浏览器原生支持 | 是 | 是 | 需 gRPC-Web 代理 | 是 |
| 主要工具链 | Postman, OpenAPI, Swagger | GraphQL Playground, Apollo | protoc, grpcurl | Zod, React Query, Next.js |
| 适用场景 | 通用 Web API | 复杂查询、聚合数据 | 微服务内部高性能通信 | 全栈 TypeScript 项目 |

---

## 5. 代码示例

### Express 路由与中间件

```ts
import express, { Request, Response, NextFunction } from 'express';

const app = express();
app.use(express.json());

// 日志中间件
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// REST 路由
app.get('/api/users/:id', (req: Request, res: Response) => {
  const user = { id: req.params.id, name: 'Alice' };
  res.json(user);
});

app.post('/api/users', (req: Request, res: Response) => {
  const { name, email } = req.body;
  const newUser = { id: crypto.randomUUID(), name, email };
  res.status(201).json(newUser);
});

// 错误处理中间件
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

### Fastify 插件式路由

```ts
import fastify from 'fastify';

const app = fastify({ logger: true });

app.get('/api/items', async (_req, reply) => {
  return reply.send([{ id: 1, title: 'Item A' }]);
});

app.post('/api/items', async (req, reply) => {
  const item = req.body as { title: string };
  return reply.status(201).send({ id: crypto.randomUUID(), ...item });
});

app.listen({ port: 3000 });
```

### JWT 认证中间件

```typescript
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const SECRET = process.env.JWT_SECRET ?? 'dev-secret';

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, SECRET) as { id: string; role: string };
    req.user = payload;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
}

// 签发令牌
export function signToken(userId: string, role: string): string {
  return jwt.sign({ id: userId, role }, SECRET, { expiresIn: '2h' });
}
```

### Zod 验证与类型安全请求

```typescript
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).optional(),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ errors: result.error.issues });
      return;
    }
    req.body = result.data;
    next();
  };
}

// 使用
app.post('/api/users', validateBody(CreateUserSchema), (req, res) => {
  const body = req.body as CreateUserInput; // 已验证且类型安全
  res.status(201).json({ id: crypto.randomUUID(), ...body });
});
```

### Hono 边缘运行时路由

```typescript
import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';

const app = new Hono();

// 中间件：CORS + 日志
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  const start = Date.now();
  await next();
  console.log(`${c.req.method} ${c.req.path} — ${Date.now() - start}ms`);
});

// 受保护路由
app.use('/api/admin/*', bearerAuth({ token: process.env.ADMIN_TOKEN! }));

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }));

app.post('/api/echo', async (c) => {
  const body = await c.req.json();
  return c.json(body);
});

export default app;
```

---

## 6. 权威外部链接

- [Node.js 官方文档](https://nodejs.org/api/)
- [Express.js API 参考](https://expressjs.com/en/4x/api.html)
- [Fastify 文档](https://fastify.dev/docs/latest/)
- [RESTful API 设计指南 (Microsoft)](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)
- [GraphQL 官方学习文档](https://graphql.org/learn/)
- [gRPC 官方文档](https://grpc.io/docs/)
- [tRPC 文档](https://trpc.io/docs)
- [Hono 文档](https://hono.dev/docs)
- [Zod 文档](https://zod.dev/)
- [JWT.io — JSON Web Tokens 介绍](https://jwt.io/introduction)
- [MDN — HTTP Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- [OWASP — Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Node.js — stream 模块](https://nodejs.org/api/stream.html)

## 7. 与相邻模块的关系

- **21-api-security**: API 安全威胁与防御
- **20-database-orm**: 数据库设计与 ORM 使用
- **24-graphql**: GraphQL 的深层实现
