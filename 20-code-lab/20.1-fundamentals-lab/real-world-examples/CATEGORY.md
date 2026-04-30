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

### 数据处理流水线（函数式组合）

```typescript
// data-processing/pipeline.ts — 可组合的流式处理

type Transform<T, U> = (input: T) => U;

function pipe<T>(input: T): T;
function pipe<T, U>(input: T, f1: Transform<T, U>): U;
function pipe<T, U, V>(input: T, f1: Transform<T, U>, f2: Transform<U, V>): V;
function pipe(input: unknown, ...fns: Transform<unknown, unknown>[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), input);
}

// 可复用的转换函数
const filterAdults = (users: { age: number }[]) => users.filter(u => u.age >= 18);
const extractNames = (users: { name: string }[]) => users.map(u => u.name);
const sortAlphabetically = (names: string[]) => [...names].sort();
const joinWithComma = (names: string[]) => names.join(', ');

// 组合流水线
const formatAdultNames = (users: { age: number; name: string }[]) =>
  pipe(users, filterAdults, extractNames, sortAlphabetically, joinWithComma);

// 使用
const users = [
  { name: 'Charlie', age: 17 },
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];
console.log(formatAdultNames(users)); // "Alice, Bob"
```

### CLI 工具参数解析与着色输出

```typescript
// cli-tools/runner.ts — 带帮助信息的命令行入口
import { parseArgs } from 'node:util';

interface CLIOptions {
  port: number;
  verbose: boolean;
  config?: string;
}

function parseCLI(): CLIOptions {
  const { values } = parseArgs({
    options: {
      port: { type: 'string', short: 'p', default: '3000' },
      verbose: { type: 'boolean', short: 'v', default: false },
      config: { type: 'string', short: 'c' },
    },
    allowPositionals: false,
  });
  return {
    port: parseInt(values.port as string, 10),
    verbose: values.verbose as boolean,
    config: values.config as string | undefined,
  };
}

// ANSI 颜色辅助
const color = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
};

export { parseCLI, color };
```

### 轻量级状态管理（发布订阅模式）

```typescript
// state-management/pubsub-store.ts — 无依赖状态管理

class Store<TState> {
  private state: TState;
  private listeners = new Set<(state: TState, prev: TState) => void>();

  constructor(initial: TState) {
    this.state = initial;
  }

  getState(): TState {
    return this.state;
  }

  setState(partial: Partial<TState> | ((s: TState) => Partial<TState>)) {
    const prev = this.state;
    const patch = typeof partial === 'function' ? partial(this.state) : partial;
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(fn => fn(this.state, prev));
  }

  subscribe(fn: (state: TState, prev: TState) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

// 使用
interface AppState {
  count: number;
  user: string | null;
}

const store = new Store<AppState>({ count: 0, user: null });
store.subscribe((s, p) => console.log('changed:', p, '→', s));
store.setState({ count: 1 });
store.setState(s => ({ count: s.count + 1 }));
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
| oclif | CLI 框架 | [oclif.io](https://oclif.io/) |
| Node.js Streams | API 文档 | [nodejs.org/api/stream.html](https://nodejs.org/api/stream.html) |
| Node.js util.parseArgs | API 文档 | [nodejs.org/api/util.html#utilparseargsconfig](https://nodejs.org/api/util.html#utilparseargsconfig) |
| OWASP Cheat Sheet | 安全 | [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/) |
| jose (JWT library) | 库 | [github.com/panva/jose](https://github.com/panva/jose) |
| Effect-TS | 函数式编程 | [effect.website](https://effect.website/) |
| fp-ts | 函数式编程 | [gcanti.github.io/fp-ts](https://gcanti.github.io/fp-ts/) |
| Node.js Best Practices | 指南 | [github.com/goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices) |

---

*最后更新: 2026-04-30*
