---
dimension: 综合
sub-dimension: Fullstack patterns
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Fullstack patterns 核心概念与工程实践。

## 包含内容

- 本模块聚焦 fullstack patterns 核心概念与工程实践。
- BFF（Backend-for-Frontend）模式、API Gateway 编排、端到端类型安全、数据流模式。

## 子模块总览

| 子模块 | 说明 | 文件 |
|--------|------|------|
| BFF Pattern | 为前端定制的后端聚合层，减少请求往返 | `bff-pattern.ts` / `bff-pattern.test.ts` |
| API Gateway | 统一入口、路由、鉴权与限流 | `api-gateway.ts` |
| End-to-End Types | 前后端共享 Schema，实现端到端类型安全 | `end-to-end-types.ts` / `end-to-end-types.test.ts` |
| Data Flow Patterns | 全栈数据流设计：SSR、CSR、islands 架构 | `data-flow-patterns.ts` |

## 代码示例：BFF 聚合层

```typescript
// bff-pattern.ts — 为移动端聚合多个微服务接口
export async function getUserDashboard(userId: string) {
  const [profile, orders, notifications] = await Promise.all([
    fetch(`/users/${userId}`).then(r => r.json()),
    fetch(`/orders?userId=${userId}`).then(r => r.json()),
    fetch(`/notifications?userId=${userId}`).then(r => r.json()),
  ]);
  return { profile, orders, notifications };
}
```

## 代码示例：API Gateway 路由与中间件

```typescript
// api-gateway.ts — 极简 API Gateway 路由编排
interface Route {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  upstream: string;
  middleware?: ((req: Request) => Promise<Request | Response>)[];
}

class ApiGateway {
  private routes: Route[] = [];

  register(route: Route) {
    this.routes.push(route);
  }

  async handle(req: Request): Promise<Response> {
    const route = this.routes.find(
      r => r.path === new URL(req.url).pathname && r.method === req.method
    );
    if (!route) return new Response('Not Found', { status: 404 });

    // 执行前置中间件
    let currentReq: Request | Response = req;
    for (const mw of route.middleware ?? []) {
      currentReq = await mw(currentReq as Request);
      if (currentReq instanceof Response) return currentReq; // 中间件拦截
    }

    // 代理到上游服务
    return fetch(route.upstream + new URL(req.url).pathname, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
  }
}

// 使用示例：带鉴权的 Gateway
const gateway = new ApiGateway();
gateway.register({
  path: '/api/users',
  method: 'GET',
  upstream: 'http://user-service:3001',
  middleware: [
    async (req) => {
      const token = req.headers.get('Authorization');
      if (!token) return new Response('Unauthorized', { status: 401 });
      return req;
    },
  ],
});
```

## 代码示例：端到端类型安全（tRPC 风格）

```typescript
// end-to-end-types.ts — 前后端共享 Router 定义
import { z } from 'zod';

// 共享 Schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
});

export const CreateUserInput = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserInput>;

// 后端 Router 定义
export const appRouter = {
  user: {
    create: {
      input: CreateUserInput,
      output: UserSchema,
    },
    getById: {
      input: z.object({ id: z.string().uuid() }),
      output: UserSchema.nullable(),
    },
  },
};

export type AppRouter = typeof appRouter;
```

## 代码示例：数据流模式 — Islands 架构

```typescript
// data-flow-patterns.ts — Islands 架构：静态 HTML + 可交互岛屿
interface Island {
  component: string;   // 组件名称
  props: Record<string, unknown>;
  selector: string;    // DOM 挂载点
}

function renderIslands(html: string, islands: Island[]): string {
  // 服务端渲染：将岛屿序列化为 data-island 属性
  const islandScripts = islands.map(island => `
    <script type="application/json" data-island="${island.component}">
      ${JSON.stringify(island.props)}
    </script>
  `).join('');

  return html.replace('</body>', `${islandScripts}</body>`);
}

// 客户端水合：只激活带有 data-island 的 DOM 区域
function hydrateIslands() {
  document.querySelectorAll('script[data-island]').forEach(script => {
    const componentName = script.getAttribute('data-island')!;
    const props = JSON.parse(script.textContent || '{}');
    const target = document.querySelector(`[data-island-target="${componentName}"]`);
    if (target) {
      // 挂载交互组件（如 React/Vue/Preact）
      mountComponent(componentName, target, props);
    }
  });
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 api-gateway.ts
- 📄 bff-pattern.test.ts
- 📄 bff-pattern.ts
- 📄 data-flow-patterns.ts
- 📄 end-to-end-types.test.ts
- 📄 end-to-end-types.ts
- 📄 index.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Patterns.dev — BFF | 文章 | [patterns.dev/posts/bff](https://www.patterns.dev/posts/bff/) |
| Martin Fowler — BFF | 文章 | [martinfowler.com/bliki/BackendForFrontend.html](https://martinfowler.com/bliki/BackendForFrontend.html) |
| tRPC Documentation | 文档 | [trpc.io/docs](https://trpc.io/docs) |
| GraphQL Best Practices | 文档 | [graphql.org/learn/best-practices](https://graphql.org/learn/best-practices/) |
| Next.js Data Fetching | 文档 | [nextjs.org/docs/app/building-your-application/data-fetching](https://nextjs.org/docs/app/building-your-application/data-fetching) |
| Zod Schema Validation | 文档 | [zod.dev](https://zod.dev/) |
| Astro Islands Architecture | 文档 | [docs.astro.build/en/concepts/islands](https://docs.astro.build/en/concepts/islands/) |
| API Gateway Pattern (AWS) | 指南 | [docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/api-gateway.html](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/api-gateway.html) |
| OpenAPI Specification | 规范 | [spec.openapis.org](https://spec.openapis.org/) |

---

*最后更新: 2026-04-29*
