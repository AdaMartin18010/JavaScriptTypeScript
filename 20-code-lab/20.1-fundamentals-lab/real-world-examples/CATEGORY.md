---
dimension: 应用领域
sub-dimension: 真实案例
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「应用领域」** 维度，聚焦 真实案例 核心概念与工程实践。

## 包含内容

- 生产级项目拆解、架构决策复盘、性能优化实战、故障排查案例。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 子模块一览

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| api-client | HTTP API 客户端设计与实现 | `THEORY.md`, `*.ts` |
| auth-system | JWT 认证与权限中间件 | `THEORY.md`, `*.ts` |
| cli-tools | 命令行工具开发实践 | `*.ts` |
| data-processing | 数据处理流水线 | `*.ts` |
| event-bus | 发布订阅与事件总线 | `THEORY.md`, `*.ts` |
| state-management | 状态管理方案 | `*.ts` |
| validation | 数据校验与 Schema | `*.ts` |
| web-server | Web 服务器与中间件 | `THEORY.md`, `*.ts` |

## 代码示例：模块化架构入口

```typescript
// index.ts：统一导出所有真实案例模块
export { createHttpClient } from './api-client';
export { createAuthMiddleware } from './auth-system';
export { TypedEventBus } from './event-bus';
export { createServer } from './web-server';
export { validateSchema } from './validation';
export { createPipeline } from './data-processing';

// 快速组合示例：带认证的 API 客户端 + 事件总线
import { createHttpClient } from './api-client';
import { TypedEventBus } from './event-bus';

interface AppEvents {
  'api:error': (err: Error) => void;
  'api:success': (endpoint: string, latency: number) => void;
}

const bus = new TypedEventBus<AppEvents>();
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  onError: (err) => bus.emit('api:error', err),
  onSuccess: (ep, latency) => bus.emit('api:success', ep, latency),
});
```

### JWT 认证中间件模式

```typescript
// auth-system/auth-middleware.ts — Express 风格 JWT 验证中间件
import { createHash, randomBytes } from 'crypto';

interface JWTPayload {
  sub: string;
  exp: number;
  roles: string[];
}

function verifyToken(token: string, secret: string): JWTPayload {
  // 简化示例：实际应使用 jose 或 jsonwebtoken 库
  const [header, payload, signature] = token.split('.');
  const expected = createHash('sha256').update(`${header}.${payload}${secret}`).digest('base64url');
  if (signature !== expected) throw new Error('Invalid signature');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as JWTPayload;
  if (decoded.exp < Date.now() / 1000) throw new Error('Token expired');
  return decoded;
}

function createAuthMiddleware(secret: string) {
  return (req: { headers: { authorization?: string } }, res: unknown, next: (err?: Error) => void) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return next(new Error('Missing token'));
    }
    try {
      const payload = verifyToken(auth.slice(7), secret);
      (req as Record<string, unknown>).user = payload;
      next();
    } catch (e) {
      next(e as Error);
    }
  };
}
```

### Schema 校验组合子

```typescript
// validation/schema.ts — 可组合的运行时校验器

interface Validator<T> {
  validate: (value: unknown) => T;
}

const string: Validator<string> = {
  validate: (v) => {
    if (typeof v !== 'string') throw new TypeError('Expected string');
    return v;
  },
};

const number: Validator<number> = {
  validate: (v) => {
    if (typeof v !== 'number' || Number.isNaN(v)) throw new TypeError('Expected number');
    return v;
  },
};

function object<T extends Record<string, Validator<unknown>>>(
  shape: T
): Validator<{ [K in keyof T]: T[K] extends Validator<infer U> ? U : never }> {
  return {
    validate: (v) => {
      if (typeof v !== 'object' || v === null) throw new TypeError('Expected object');
      const result = {} as Record<string, unknown>;
      for (const [key, validator] of Object.entries(shape)) {
        result[key] = (validator as Validator<unknown>).validate((v as Record<string, unknown>)[key]);
      }
      return result;
    },
  } as Validator<{ [K in keyof T]: T[K] extends Validator<infer U> ? U : never }>;
}

// 使用
const userValidator = object({ name: string, age: number });
const user = userValidator.validate({ name: 'Alice', age: 30 });
```

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📁 api-client
- 📁 auth-system
- 📁 cli-tools
- 📁 data-processing
- 📁 event-bus
- 📄 index.ts
- 📁 state-management
- 📁 validation
- 📁 web-server

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Node.js Design Patterns | 书籍 | [nodejsdesignpatterns.com](https://nodejsdesignpatterns.com/) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Express.js 官方文档 | 框架文档 | [expressjs.com](https://expressjs.com/) |
| Fastify 官方文档 | 框架文档 | [fastify.dev](https://fastify.dev/) |
| JSON Web Tokens (JWT) | 规范 | [jwt.io](https://jwt.io/) |
| Zod 文档 | Schema 校验库 | [zod.dev](https://zod.dev/) |
| commander.js | CLI 框架 | [github.com/tj/commander.js](https://github.com/tj/commander.js) |
|oclif | CLI 框架 | [oclif.io](https://oclif.io/) |
| Node.js Streams | API 文档 | [nodejs.org/api/stream.html](https://nodejs.org/api/stream.html) |

---

*最后更新: 2026-04-29*
