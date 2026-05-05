import re

filepath = '70-theoretical-foundations/70.5-edge-runtime-and-serverless/39-rpc-frameworks.md'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update frontmatter date
content = content.replace('last-updated: 2026-05-05', 'last-updated: 2026-05-06')

# 2. Add tRPC v11 info in section 2.1
old_trpc_intro = 'tRPC 的设计理念是**"不要分割你的类型系统"**：前后端共享同一个 TypeScript 类型定义，通过类型推断自动同步 API 契约。'
new_trpc_intro = (
    'tRPC 的设计理念是**"不要分割你的类型系统"**：前后端共享同一个 TypeScript 类型定义，通过类型推断自动同步 API 契约。\n\n'
    '**tRPC v11** 于 2026 年 3 月正式发布，带来两大核心升级：\n\n'
    '- **TanStack Query v5 深度集成**：官方 `@trpc/tanstack-react-query` 包实现 query/mutation/infiniteQuery 的全面类型同步，缓存策略与失效逻辑原生互通\n'
    '- **原生 React Server Components（RSC）支持**：通过 `createTRPCReact` 的 RSC 适配层，Server Component 可直接调用 tRPC 路由而无需客户端 JavaScript 开销'
)
content = content.replace(old_trpc_intro, new_trpc_intro)

# 3. Update code example 1 header
content = content.replace(
    '### 示例 1：tRPC 路由类型提取器',
    '### 示例 1：tRPC v11 路由类型提取器'
)

# 4. Insert Hono RPC and oRPC after tRPC section
hono_orpc_section = """---

## 3. Hono RPC：Edge 场景下的零开销 RPC

### 3.1 `hc` 类型安全客户端

Hono RPC 是 Hono 框架的配套类型安全客户端，通过 `hc`（Hono Client）实现端到端类型推断。

**核心特性**：

- **零运行时开销**：`hc` 客户端仅在编译时提供类型，运行时是普通 `fetch` 调用
- **Edge Runtime 原生**：在 Cloudflare Workers、Deno Deploy、Vercel Edge 等环境中无额外依赖
- **轻量高效**：Hono 生态目前达到 **2.8M 周下载量**，是构建轻量级 Edge API 的首选

**服务端定义**：

```typescript
import { Hono } from 'hono';

const app = new Hono()
  .get('/api/user/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ id, name: 'Alice' });
  })
  .post('/api/order', async (c) => {
    const body = await c.req.json<{ item: string; qty: number }>();
    return c.json({ orderId: crypto.randomUUID(), ...body });
  });

export type AppType = typeof app;
```

**客户端调用**：

```typescript
import { hc } from 'hono/client';

const client = hc<AppType>('http://localhost:8787');

// 完全类型安全：URL 参数、请求体、响应体均自动推断
const user = await client.api.user[':id'].$get({ param: { id: '123' } });
const order = await client.api.order.$post({ json: { item: 'book', qty: 2 } });
```

### 3.2 与 tRPC 的差异化定位

| 维度 | tRPC v11 | Hono RPC |
|------|---------|----------|
| 运行时开销 | 需要 tRPC 运行时（序列化、链路） | 零运行时，纯 `fetch` |
| 类型推断层级 | 路由器级深度推断 | 路由级推断 |
| Edge 适配 | 良好（需配置 Link） | 原生零依赖 |
| 生态规模 | 大型全栈框架 | 2.8M 周下载，轻量专注 |
| 适用场景 | 复杂全栈 TypeScript 应用 | 轻量 Edge API、微服务网关 |

---

## 4. oRPC：OpenAPI 与类型安全的融合

### 4.1 中间件架构与多 Schema 支持

oRPC 是 2025–2026 年崛起的 RPC 新 challenger，设计目标是**同时提供端到端类型安全与自动 OpenAPI 文档生成**。

**核心特性**：

- **OpenAPI 3.1 自动生成**：无需手动维护 Swagger 文档，schema 变更自动同步
- **多验证库支持**：原生支持 Zod、Valibot、ArkType，不绑定单一 schema 库
- **中间件架构**：类似 tRPC 的 `.use()` 中间件链，支持上下文注入与权限校验
- **类型安全**：客户端通过类型导出实现编译时契约验证

### 4.2 代码示例与定位

```typescript
import { os } from '@orpc/server';
import { z } from 'zod';

const router = os.router({
  user: os.router({
    getById: os
      .input(z.object({ id: z.string() }))
      .output(z.object({ id: z.string(), name: z.string() }))
      .handler(({ input }) => ({ id: input.id, name: 'Alice' })),
  }),
});

// 自动生成 OpenAPI 3.1 文档
const openAPIDoc = generateOpenAPI(router, { version: '3.1.0' });
```

**与 tRPC 的对比**：

- **tRPC v11**：专注全栈 TypeScript 体验，TanStack Query 深度集成，React Server Components 原生支持
- **oRPC**：当你**既需要类型安全又需要 OpenAPI 文档**时的最佳选择，适合对外暴露 API 的场景

"""

content = content.replace(
    '---\n\n## 3. Connect RPC：Protobuf 与 HTTP/2 的融合',
    hono_orpc_section + '---\n\n## 5. Connect RPC：Protobuf 与 HTTP/2 的融合'
)

# 5. Renumber remaining sections in headings: 3->5, 4->6, 5->7, 6->8, 7->9, 8->10, 9->11, 10->12, 11->13
# For ## headings
def renum_section(match):
    num = int(match.group(1))
    return f'## {num + 2}.'

content = re.sub(r'^## ([3-9]|10|11)\.', renum_section, content, flags=re.MULTILINE)

# For ### headings like ### 3.1, ### 4.2, etc.
def renum_subsection(match):
    num = int(match.group(1))
    return f'### {num + 2}.{match.group(2)}'

content = re.sub(r'^### ([3-9]|10|11)\.([0-9]+)', renum_subsection, content, flags=re.MULTILINE)

# 6. Update TOC - add Hono RPC and oRPC entries, and renumber others
toc_insertion = (
    '  - [3. Hono RPC：Edge 场景下的零开销 RPC](#3-hono-rpcedge-场景下的零开销-rpc)\n'
    '    - [3.1 `hc` 类型安全客户端](#31-hc-类型安全客户端)\n'
    '    - [3.2 与 tRPC 的差异化定位](#32-与-trpc-的差异化定位)\n'
    '  - [4. oRPC：OpenAPI 与类型安全的融合](#4-orpcopenapi-与类型安全的融合)\n'
    '    - [4.1 中间件架构与多 Schema 支持](#41-中间件架构与多-schema-支持)\n'
    '    - [4.2 代码示例与定位](#42-代码示例与定位)\n'
)
content = content.replace(
    '  - [5. Connect RPC',
    toc_insertion + '  - [5. Connect RPC'
)

toc_updates = [
    ('  - [3. Connect RPC', '  - [5. Connect RPC'),
    ('    - [3.1 Connect 的三协议支持', '    - [5.1 Connect 的三协议支持'),
    ('    - [3.2 Protobuf 与 TypeScript 的绑定', '    - [5.2 Protobuf 与 TypeScript 的绑定'),
    ('  - [4. gRPC-Web', '  - [6. gRPC-Web'),
    ('    - [4.1 gRPC-Web 的代理需求', '    - [6.1 gRPC-Web 的代理需求'),
    ('    - [4.2 流式调用的限制', '    - [6.2 流式调用的限制'),
    ('  - [5. JSON-RPC 2.0', '  - [7. JSON-RPC 2.0'),
    ('    - [5.1 协议语义', '    - [7.1 协议语义'),
    ('    - [5.2 与 tRPC/Connect 的对比', '    - [7.2 与 tRPC/Connect 的对比'),
    ('  - [6. Schema 演化与版本兼容性', '  - [8. Schema 演化与版本兼容性'),
    ('    - [6.1 Protobuf 的向后兼容性规则', '    - [8.1 Protobuf 的向后兼容性规则'),
    ('    - [6.2 TypeScript 类型的演化挑战', '    - [8.2 TypeScript 类型的演化挑战'),
    ('  - [7. Edge 场景下的 RPC 优化', '  - [9. Edge 场景下的 RPC 优化'),
    ('    - [7.1 Edge 函数的 RPC 调用模式', '    - [9.1 Edge 函数的 RPC 调用模式'),
    ('    - [7.2 流式与订阅的边缘化', '    - [9.2 流式与订阅的边缘化'),
    ('  - [8. 范畴论语义', '  - [10. 范畴论语义'),
    ('  - [9. 对称差分析', '  - [11. 对称差分析'),
    ('  - [10. 工程决策矩阵', '  - [12. 工程决策矩阵'),
    ('  - [11. 反例与局限性', '  - [13. 反例与局限性'),
    ('    - [11.1 tRPC 的版本锁定反例', '    - [13.1 tRPC 的版本锁定反例'),
    ('    - [11.2 Protobuf 的 JSON 互操作陷阱', '    - [13.2 Protobuf 的 JSON 互操作陷阱'),
    ('    - [11.3 gRPC-Web 的双向流缺失', '    - [13.3 gRPC-Web 的双向流缺失'),
    ('    - [11.4 RPC 的"本地调用幻觉"', '    - [13.4 RPC 的"本地调用幻觉"'),
]

for old, new in toc_updates:
    content = content.replace(old, new)

# 7. Update decision matrix: add Hono RPC and oRPC rows
dm_hono = '| 轻量 Edge API / 微服务网关 | Hono RPC (`hc`) | 零运行时开销，Edge 原生，2.8M 周下载 | 无内置订阅/实时支持，需自行实现 SSE |\n'
dm_orpc = '| 对外暴露 API（需 OpenAPI 文档） | oRPC | 类型安全 + OpenAPI 3.1 自动生成，多 schema 库支持 | 生态较新，社区资源少于 tRPC |\n'

content = content.replace(
    '| 实时协作应用 | tRPC Subscriptions / SSE | 内置订阅支持，类型安全 | WebSocket 在 Edge 环境受限 |',
    '| 实时协作应用 | tRPC v11 Subscriptions / SSE | 内置订阅支持，类型安全 | WebSocket 在 Edge 环境受限 |\n' + dm_hono
)

content = content.replace(
    '| 第三方 API 暴露 | REST + OpenAPI | 通用性最高，调试工具丰富 | 无编译时类型安全 |',
    '| 第三方 API 暴露 | REST + OpenAPI | 通用性最高，调试工具丰富 | 无编译时类型安全 |\n' + dm_orpc
)

# 8. Update Connect version references
old_connect_intro = 'Connect RPC 是一个相对较新的框架，独特之处在于同时支持三种传输协议：'
new_connect_intro = (
    'Connect RPC 是一个相对较新的框架，独特之处在于同时支持三种传输协议：\n\n'
    '> **2026 更新**：Connect **2.1.1** 已作为稳定版发布，提供 Next.js、Fastify、Express 的官方适配器，生产环境可用性大幅提升。'
)
content = content.replace(old_connect_intro, new_connect_intro)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Update completed successfully.')
