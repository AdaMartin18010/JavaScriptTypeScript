# 后端与 API：理论基础

> **定位**：`20-code-lab/20.6-backend-apis/`
> **对齐版本**：tRPC v11 | oRPC Stable | Next.js 15 Server Actions | OpenAPI 3.1
> **权威来源**：tRPC 官方文档、LogRocket tRPC vs oRPC、ChristAdrian 2026-01、Birjob 2026-03
> **最后更新**：2026-04

---

## 一、核心理论

### 1.1 问题域定义

Node.js 生态的后端开发涵盖 HTTP 服务器、API 设计、数据库交互、认证授权等。2026 年的关键趋势：

1. **类型安全端到端**（tRPC、oRPC、GraphQL Codegen）——编译期消灭 API 契约不匹配
2. **边缘优先部署**（Cloudflare Workers、Vercel Edge、Deno Deploy）——冷启动 <50ms
3. **Server Actions 范式**——Next.js App Router 中直接调用服务端函数，无需显式 API 路由
4. **Zod 作为通用验证层**——Schema 即类型，一次定义、前后端共享

### 1.2 API 范式深度对比

| 范式 | 类型安全 | 灵活性 | 公开 API | 适用场景 | 2026 状态 |
|------|---------|--------|---------|---------|----------|
| **REST** | 手动（OpenAPI 3.1 + Zod） | 高 | ✅ 最适合 | 通用、公开 API、第三方集成 | OpenAPI 3.1 + JSON Schema 2020-12 标准 |
| **GraphQL** | 自动（Schema） | 极高 | ✅ | 复杂查询、聚合、前端驱动数据获取 | v16+，@defer/@stream 稳定 |
| **tRPC** | 完全自动 | 中 | ❌ 仅限 TS | 全栈 TS 项目（同仓库） | v11 稳定，`httpSubscription` (SSE) |
| **oRPC** | 完全自动 | 中 | ✅ 自动生成 OpenAPI | 全栈 TS + 需公开 REST 文档 | 双模式：RPC + OpenAPI 3.1 |
| **gRPC** | 完全自动 | 低 | ⚠️ 需网关 | 内部微服务、高吞吐 | HTTP/3 传输实验性 |
| **Server Actions** | 自动 | 中 | ❌ 框架耦合 | Next.js App Router 全栈 | React 19 + Next.js 15 原生支持 |

> **关键洞察**：2026 年出现的新趋势是 **oRPC**——在 tRPC 的端到端类型安全基础上，自动生成 OpenAPI 3.1 规范和 Swagger UI，解决 tRPC"无法对外开放"的痛点。

---

## 二、设计原理

### 2.1 类型安全 API 的经济学

```
传统 REST 开发成本流：
  后端定义接口 → 手写 OpenAPI 文档 → 前端手动对接
  → 运行时发现类型错误 → 修复循环（平均 3-5 轮）
  隐性成本：文档维护、类型不匹配 bug、联调时间

tRPC/oRPC 开发成本流：
  后端定义路由（Zod Schema = 运行时验证 + 编译期类型）
  → 前端直接调用（函数式 API，IDE 自动补全）
  → 编译期捕获 100% 类型不匹配
  节省：API 文档维护 + 类型 bug 修复 + 联调时间（约 30-50%）
```

**Zod 作为统一验证层**：

```typescript
import { z } from 'zod'

// 一次定义，三重用：运行时验证 + TS 类型 + OpenAPI Schema
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'admin']),
  createdAt: z.date(),
})

type User = z.infer<typeof UserSchema>  // TypeScript 类型自动推导
```

### 2.2 Server Actions 与 RSC 的 API 范式变革

Next.js App Router 引入的 Server Actions（React Server Components 的补充）正在重塑 API 设计：

```tsx
// app/page.tsx — Server Component
import { createUser } from './actions'

export default function Page() {
  // 直接调用服务端函数，无需 fetch/API 路由
  return (
    <form action={createUser}>
      <input name="email" type="email" required />
      <button type="submit">创建用户</button>
    </form>
  )
}

// app/actions.ts — 'use server'
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const CreateUserSchema = z.object({
  email: z.string().email(),
})

export async function createUser(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = CreateUserSchema.parse(data)
  // 直接操作数据库，无 HTTP 往返
  await db.user.create({ data: parsed })
  revalidatePath('/users')
}
```

**Server Actions 的优势**：

- 零 API 路由样板代码
- 表单提交直接映射到服务端函数
- 内置渐进增强（JS 禁用时仍可工作）
- 与 `useFormStatus`、`useActionState` 配合实现 Pending UI 和错误处理

**Server Actions 的边界**：

- 仅限 Next.js / React 生态
- 不适合公开 API、第三方集成、跨平台客户端
- 复杂验证和授权逻辑仍需显式处理

### 2.3 tRPC + React Server Components 集成模式

2026 年的最佳实践是将 tRPC 与 RSC 结合——服务器端直接调用（跳过 HTTP）：

```tsx
// app/page.tsx — Server Component 直接调用 tRPC
import { api, HydrateClient } from '~/trpc/server'

export default async function Page() {
  // 服务器端直接执行，无 HTTP 请求
  const hello = await api.greeting.hello({ text: 'from RSC' })

  // 预取并序列化到客户端缓存
  void api.post.list.prefetch()

  return (
    <HydrateClient>
      <h1>{hello.greeting}</h1>
      <PostList /> {/* 客户端组件，消费已预取数据 */}
    </HydrateClient>
  )
}
```

**模式要点**：

- `api.greeting.hello()` 在服务器端直接执行函数调用（无网络往返）
- `prefetch()` + `HydrateClient` 将状态序列化到客户端，避免瀑布请求
- 客户端组件使用 `useSuspenseQuery` 消费已水合的数据

---

## 三、tRPC vs oRPC：选型指南

| 维度 | tRPC v11 | oRPC |
|------|---------|------|
| **类型安全** | 端到端，编译期推断 | 端到端，编译期推断 |
| **OpenAPI 生成** | ❌ 需插件 (trpc-openapi) | ✅ 原生自动生成 |
| **REST 端点** | ❌ 仅限 RPC | ✅ 同一代码库输出 RPC + REST |
| **公开 API** | 不推荐 | ✅ 推荐 |
| **性能** | ~2-3K req/s（单进程） | 同量级 |
| **错误标准化** | 自定义 JS Error | `ORPCError` → 自动映射到 OpenAPI |
| **适用团队** | 小团队、全栈同仓库 | 中大型团队、需对外开放 API |

> *"oRPC's dual-handler architecture lets it serve both RPC and REST requests through the same Express instance. You can power internal TypeScript clients and external REST consumers from a single router."* — LogRocket, 2025-12

---

## 四、运行时选型

```
后端服务类型
├── I/O 密集型 API
│   └── → Node.js 24 / Bun 1.2（事件循环优势）
├── 计算密集型
│   └── → Worker Threads / Rust/WASM 扩展
├── 边缘部署
│   └── → Hono + Cloudflare Workers / Deno Deploy
├── 实时通信
│   └── → Bun uWebSockets / Node.js + Socket.io
└── 全栈 Next.js
    └── → Server Actions + tRPC/oRPC 混合
```

---

## 五、2026 API 设计检查清单

```
□ 是否使用 Zod 统一前后端验证？
□ 是否采用类型安全 RPC（tRPC/oRPC）减少联调成本？
□ 是否需要对外公开 API？是 → 优先考虑 oRPC 或 REST + OpenAPI 3.1
□ 是否使用 Next.js App Router？是 → 评估 Server Actions 减少样板代码
□ 错误响应是否遵循 RFC 7807 (Problem Details)？
□ 是否实现幂等性（Idempotency Keys）用于写操作？
□ 是否使用 SSE / WebSocket 处理实时推送？
□ 是否开启 HTTP/2 或 HTTP/3 服务端推送？
□ API 版本策略：URL (/v1/) vs Header (Accept-Version) vs 无版本（Server Actions）
```

---

## 六、扩展阅读

- `30-knowledge-base/30.4-decision-trees/runtime-selection.md` — 运行时选型决策树
- `40-ecosystem/40.3-trends/ECOSYSTEM_TRENDS_2026.md` — 后端生态趋势
- `30-knowledge-base/30.3-comparison-matrices/backend-frameworks-compare.md` — 后端框架对比
- [tRPC Server Components 官方指南](https://trpc.io/docs/client/react/server-components)

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
