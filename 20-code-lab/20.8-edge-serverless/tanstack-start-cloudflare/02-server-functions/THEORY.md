# 服务端函数

> **定位**：`20-code-lab/20.8-edge-serverless/tanstack-start-cloudflare/02-server-functions`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 TanStack Start 在 Cloudflare 边缘平台的服务端函数设计与实现问题。涵盖 RPC 风格服务端函数、环境变量安全访问与边缘数据库集成。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| createServerFn | 类型安全的服务端函数工厂 | server-fn.ts |
| 环境绑定 | Cloudflare 平台绑定（KV/D1/R2） | bindings.ts |
| RPC 调用 | 编译时生成客户端存根 | rpc-client.ts |

---

## 二、设计原理

### 2.1 为什么存在

服务端函数让前端开发者无需维护独立的 API 路由文件，通过类型安全的 RPC 调用直接复用服务端逻辑，降低全栈开发的心智负担。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| createServerFn | 类型安全、同文件编写 | 框架耦合 | TanStack Start 项目 |
| 传统 REST API | 通用、解耦 | 类型不同步、样板多 | 多客户端项目 |
| tRPC | 端到端类型 | 需额外配置适配器 | 已有 tRPC 项目 |

### 2.3 与相关技术的对比

| 维度 | createServerFn (TanStack) | Next.js Server Actions | tRPC | Remix Actions |
|------|--------------------------|----------------------|------|---------------|
| 调用方式 | RPC（自动客户端） | RPC（React useTransition） | RPC（React Query） | Form POST |
| 类型安全 | 端到端（编译时） | 端到端（编译时） | 端到端（编译时） | 运行时 Zod |
| 序列化 | SuperJSON | 原生（限制多） | SuperJSON | 原生 |
| 流式响应 | 支持 | 支持 | 支持 | 有限 |
| 边缘兼容 | Cloudflare/Deno/Node | Vercel/Node | 需适配器 | Cloudflare/Node |
| 错误处理 | 类型化错误 | 原生 Error | TRPCError | 原生 Error |

---

## 三、实践映射

### 3.1 从理论到代码

```typescript
// server-functions/todo.ts — 类型安全服务端函数
import { createServerFn } from '@tanstack/react-start';

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

// 读取 — 自动暴露为 HTTP POST /api/todo/list
export const listTodos = createServerFn({ method: 'GET' })
  .handler(async () => {
    const env = process.env as unknown as Env;
    const { results } = await env.DB.prepare(
      'SELECT * FROM todos ORDER BY created_at DESC'
    ).all<Todo>();
    return results ?? [];
  });

// 创建 — 带输入校验
export const createTodo = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (typeof data !== 'string' || data.length === 0) {
      throw new Error('Todo text is required');
    }
    return data;
  })
  .handler(async ({ data: text }) => {
    const env = process.env as unknown as Env;
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO todos (id, text, done) VALUES (?, ?, ?)')
      .bind(id, text, 0)
      .run();
    return { id, text, done: false };
  });

// 客户端调用（完全类型安全）
// const todos = await listTodos(); // inferred: Todo[]
```

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 服务端函数 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 边缘 SSR 总是比 CSR 快 | 首次加载快，但交互复杂度影响体验 |
| TanStack Start 是元框架 | Start 是路由+数据层，需配合 UI 框架 |

### 3.3 扩展阅读

- [TanStack Start](https://tanstack.com/start/latest)
- `20.8-edge-serverless/`

---

## 四、权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| TanStack Start Server Functions | 官方文档 | [tanstack.com/start/latest/docs/framework/react/server-functions](https://tanstack.com/start/latest/docs/framework/react/server-functions) |
| Cloudflare D1 Database | 官方文档 | [developers.cloudflare.com/d1](https://developers.cloudflare.com/d1/) |
| SuperJSON | 源码 | [github.com/flightcontrolhq/superjson](https://github.com/flightcontrolhq/superjson) |
| tRPC Server Actions | 官方文档 | [trpc.io/docs/client/react/server-components](https://trpc.io/docs/client/react/server-components) |
| Remix Action & Loader | 官方文档 | [remix.run/docs/en/main/discussion/data-flow](https://remix.run/docs/en/main/discussion/data-flow) |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
