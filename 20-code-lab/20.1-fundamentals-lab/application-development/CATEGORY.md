---
dimension: 应用领域
sub-dimension: 应用开发
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「应用领域」** 维度，聚焦 应用开发 核心概念与工程实践。

## 包含内容

- 全栈应用开发实践、业务逻辑组织、领域建模、CRUD 与复杂交互实现。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `domain-modeling/` | 领域驱动设计（DDD）基础模型 | `domain-model.ts` |
| `crud-patterns/` | 增删改查通用模式与验证 | `crud-patterns.ts` |
| `error-handling/` | 统一错误处理与结果类型 | `error-handling.ts`, `error-handling.test.ts` |
| `api-design/` | RESTful / RPC API 设计实践 | `api-design.ts` |
| `state-management/` | 客户端状态管理策略 | `state-management.ts` |
| `form-complexity/` | 复杂表单与动态校验 | `form-engine.ts` |

## 代码示例

### Result 类型与错误处理

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) return err(new Error(`HTTP ${res.status}`));
    return ok(await res.json());
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

// 使用
const result = await fetchUser('123');
if (!result.ok) {
  console.error('Failed:', result.error.message);
} else {
  console.log('User:', result.value.name);
}
```

### 轻量领域模型

```typescript
class Order {
  private constructor(
    public readonly id: string,
    public readonly items: OrderItem[],
    public status: 'pending' | 'paid' | 'shipped' = 'pending'
  ) {}

  static create(items: OrderItem[]): Order {
    if (items.length === 0) throw new Error('Order must have items');
    return new Order(crypto.randomUUID(), items);
  }

  total(): number {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  pay(): void {
    if (this.status !== 'pending') throw new Error('Invalid status transition');
    this.status = 'paid';
  }
}
```

### 状态管理：轻量级可观察 Store

```typescript
// state-management.ts — 无依赖的轻量状态管理

type Listener<T> = (state: T, prev: T) => void;

class Store<T> {
  private listeners = new Set<Listener<T>>();
  private state: T;

  constructor(initial: T) {
    this.state = initial;
  }

  getState(): T {
    return this.state;
  }

  setState(updater: (prev: T) => T): void {
    const prev = this.state;
    this.state = updater(prev);
    this.listeners.forEach((fn) => fn(this.state, prev));
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// 使用：类型安全的全局状态
interface AppState {
  user: { id: string; name: string } | null;
  theme: "light" | "dark";
  notifications: string[];
}

const appStore = new Store<AppState>({
  user: null,
  theme: "light",
  notifications: [],
});

// 订阅变更
const unsubscribe = appStore.subscribe((state, prev) => {
  if (state.theme !== prev.theme) {
    document.documentElement.setAttribute("data-theme", state.theme);
  }
});

// 更新状态
appStore.setState((prev) => ({
  ...prev,
  theme: prev.theme === "light" ? "dark" : "light",
}));
```

### RESTful API 设计模式

```typescript
// api-design.ts — 类型安全的 REST API 封装

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface EndpointConfig<P, B, R> {
  path: string;
  method: HttpMethod;
}

class ApiClient {
  constructor(private baseURL: string) {}

  async request<P, B, R>(
    config: EndpointConfig<P, B, R>,
    params?: P,
    body?: B
  ): Promise<R> {
    const url = new URL(config.path, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([k, v]) =>
        url.searchParams.set(k, String(v))
      );
    }

    const response = await fetch(url, {
      method: config.method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    return response.json();
  }
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// 类型安全的端点定义
const UserEndpoints = {
  list: { path: "/users", method: "GET" } as EndpointConfig<
    { page?: number; limit?: number },
    never,
    { users: User[]; total: number }
  >,
  create: { path: "/users", method: "POST" } as EndpointConfig<
    never,
    Omit<User, "id">,
    User
  >,
};

// 使用
const api = new ApiClient("https://api.example.com");
const { users } = await api.request(UserEndpoints.list, { page: 1, limit: 10 });
```

### 复杂表单验证引擎

```typescript
// form-engine.ts — 基于 Zod 的动态表单校验
import { z, ZodType } from "zod";

interface FieldConfig<T> {
  label: string;
  schema: ZodType<T>;
  defaultValue: T;
}

class FormEngine<T extends Record<string, unknown>> {
  private values: T;
  private errors: Partial<Record<keyof T, string>> = {};

  constructor(private config: { [K in keyof T]: FieldConfig<T[K]> }) {
    this.values = Object.fromEntries(
      Object.entries(config).map(([k, v]) => [k, v.defaultValue])
    ) as T;
  }

  setValue<K extends keyof T>(key: K, value: T[K]): void {
    this.values = { ...this.values, [key]: value };
    this.validateField(key);
  }

  private validateField<K extends keyof T>(key: K): boolean {
    const result = this.config[key].schema.safeParse(this.values[key]);
    if (!result.success) {
      this.errors = {
        ...this.errors,
        [key]: result.error.errors[0].message,
      };
      return false;
    }
    const { [key]: _, ...rest } = this.errors;
    this.errors = rest;
    return true;
  }

  validateAll(): boolean {
    let valid = true;
    for (const key of Object.keys(this.config) as Array<keyof T>) {
      valid = this.validateField(key) && valid;
    }
    return valid;
  }

  getValues(): T {
    return { ...this.values };
  }

  getErrors(): Partial<Record<keyof T, string>> {
    return { ...this.errors };
  }
}

// 使用
const loginForm = new FormEngine({
  email: {
    label: "Email",
    schema: z.string().email("Invalid email format"),
    defaultValue: "",
  },
  password: {
    label: "Password",
    schema: z.string().min(8, "Password must be at least 8 characters"),
    defaultValue: "",
  },
});

loginForm.setValue("email", "test@example.com");
console.log(loginForm.validateAll()); // true/false
console.log(loginForm.getErrors());
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 error-handling.test.ts
- 📄 error-handling.ts
- 📄 index.ts

## 权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| Node.js Best Practices | 社区指南 | [github.com/goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices) |
| Clean Architecture | 书籍参考 | [blog.cleancoder.com](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) |
| Result Type Pattern | 文章 | [www.learningtypescript.com/articles/result-type](https://www.learningtypescript.com/articles/result-type) |
| Zod 验证库 | 官方文档 | [zod.dev](https://zod.dev/) |
| Effect-TS | 函数式错误处理 | [effect.website](https://effect.website/) |
| Redux Style Guide | 状态管理 | [redux.js.org/style-guide](https://redux.js.org/style-guide/) |
| TanStack Query | 服务端状态 | [tanstack.com/query](https://tanstack.com/query/latest) |
| NestJS Documentation | 后端框架 | [docs.nestjs.com](https://docs.nestjs.com/) |
| Fastify Best Practices | 性能指南 | [fastify.dev/docs/latest/Guides/Best-Practices/](https://fastify.dev/docs/latest/Guides/Best-Practices/) |
| MDN Web API | 前端 API | [developer.mozilla.org/en-US/docs/Web/API](https://developer.mozilla.org/en-US/docs/Web/API) |

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*
