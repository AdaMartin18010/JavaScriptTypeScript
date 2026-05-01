---
title: Edge-First 架构实战指南
description: 从理论到落地的 Edge-First 架构完全指南，覆盖 Cloudflare Workers、Vercel Edge、Durable Objects、Edge 数据库与缓存策略
---

# Edge-First 架构实战指南

> 最后更新: 2026-05-01 | 状态: 🔥 行业转型期 | 对齐: Cloudflare Workers 2025、Vercel Edge 2026

---

## 1. 为什么 Edge-First？

### 传统架构的问题

```
用户请求 → CDN → 源站(美西) → 数据库(美西) → 响应
                  ↓
            往返延迟 200ms+
            冷启动 500ms+
            数据库连接池耗尽
```

### Edge-First 架构

```
用户请求 → Edge Node(最近) → 计算 + 缓存 + 数据库
                  ↓
            往返延迟 < 50ms
            零冷启动
            全球复制
```

| 指标 | 传统架构 | Edge-First | 提升 |
|------|---------|-----------|------|
| **全球平均延迟** | 150-300ms | 20-50ms | **5-10x** |
| **冷启动** | 100-500ms | 0ms | **即时** |
| **并发成本** | $$$（服务器） | $（请求计费） | **10-100x** |
| **数据合规** | 复杂 | 自动就近 | **简化** |

---

## 2. Edge 运行时对比

| 平台 | 运行时 | 冷启动 | 最大执行时间 | 语言支持 | 2026 采用率 |
|------|--------|--------|-------------|----------|------------|
| **Cloudflare Workers** | V8 Isolates | 0ms | 30s (Paid) | JS/TS/Rust/WASM | 35%+ |
| **Vercel Edge** | Node.js Edge | < 5ms | 30s | JS/TS | 25%+ |
| **Netlify Edge** | Deno | < 5ms | 10s | JS/TS | 8% |
| **Deno Deploy** | Deno | < 5ms | 无限制 | JS/TS | 5% |
| **Fly.io** | Firecracker | < 100ms | 无限制 | 任意容器 | 10% |

### Cloudflare Workers 深度解析

**V8 Isolates 架构**：

- 不是容器，不是 VM，是 V8 引擎中的轻量级上下文
- 启动时间 < 1ms，内存占用 < 5MB
- 进程复用：一个 Isolate 可以处理多个请求的多个阶段

```typescript
// Cloudflare Worker 示例
export interface Env {
  MY_KV: KVNamespace;
  MY_DURABLE_OBJECT: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // KV 缓存
    const cached = await env.MY_KV.get(request.url);
    if (cached) return new Response(cached);

    // Durable Object 状态管理
    const id = env.MY_DURABLE_OBJECT.idFromName('counter');
    const stub = env.MY_DURABLE_OBJECT.get(id);
    const count = await stub.fetch('/increment');

    const response = new Response(`Count: ${await count.text()}`);
    ctx.waitUntil(env.MY_KV.put(request.url, await response.clone().text(), { expirationTtl: 60 }));
    return response;
  }
};
```

---

## 3. Edge 架构模式

### 3.1 Islands Architecture（群岛架构）

Islands Architecture 由 Katie Sylor-Miller 和 Jason Miller 提出，核心理念是：**页面大部分区域为静态 HTML，仅在交互性区域注入 JavaScript"岛屿"**。

在 Edge-First 场景下，群岛架构的优势被进一步放大：

```
┌─────────────────────────────────────────────┐
│  Header (Static HTML)                       │
├─────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ Island  │  │ Island  │  │ Static  │     │
│  │Search🔍 │  │Cart 🛒  │  │Content  │     │
│  │+JS      │  │+JS      │  │(no JS)  │     │
│  └─────────┘  └─────────┘  └─────────┘     │
├─────────────────────────────────────────────┤
│  Footer (Static HTML)                       │
└─────────────────────────────────────────────┘
       ↓ Edge 节点直接返回静态 HTML
       ↓ 仅对 Island 区域进行 Hydration
```

**Astro on Edge 实现示例**：

```typescript
// astro.config.mjs — 适配 Cloudflare Workers
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    mode: 'advanced',        // 使用 Workers 而非 Pages
    functionPerRoute: false, // 单一 Worker 处理所有路由
  }),
});
```

```astro
---
// src/pages/index.astro
// 此代码在 Edge 节点执行
const products = await fetch('https://api.example.com/products')
  .then(r => r.json()); // 从最近的 Edge 缓存或源站获取
---

<html>
  <body>
    <!-- 静态区域：零 JS -->
    <header>My Store</header>

    <!-- Island 1：交互式搜索 -->
    <Search client:idle />

    <!-- 静态内容 -->
    <main>
      {products.map(p => <ProductCard {...p} />)}
    </main>

    <!-- Island 2：购物车状态 -->
    <Cart client:visible />
  </body>
</html>
```

**Hydration 指令对照表**：

| 指令 | 触发时机 | 适用场景 | Edge 优势 |
|------|---------|---------|----------|
| `client:load` | DOM 就绪立即执行 | 首屏关键交互 | Edge 预渲染减少阻塞 |
| `client:idle` | `requestIdleCallback` | 非关键组件 | 静态 HTML 已可交互 |
| `client:visible` | Intersection Observer | 长列表/页脚 | 减少初始 JS 体积 |
| `client:media` | 媒体查询匹配 | 响应式组件 | Edge 根据 UA 预筛选 |
| `client:only` | 跳过 SSR | 浏览器专属 API | Edge 不执行，节省 CPU |

> 数据来源：Astro Docs 2025, [Islands Architecture](https://docs.astro.build/en/concepts/islands/)

### 3.2 Partial Hydration（部分水合）

Partial Hydration 是 Islands Architecture 的技术实现基础。在 Edge 环境中，我们可以根据用户请求特征动态决定水合策略：

```typescript
// Edge Worker 动态选择 Hydration 策略
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const isBot = request.headers.get('user-agent')?.match(/bot|crawler/i);
    const prefersReducedMotion = request.headers.get('prefer-reduced-motion');

    // 对爬虫：返回纯静态 HTML，零水合
    // 对低功耗设备：减少动画组件的水合
    // 对普通用户：完整 Islands 体验
    const hydrationProfile = isBot
      ? 'none'
      : prefersReducedMotion
        ? 'minimal'
        : 'full';

    // 将策略注入 HTML，前端框架据此决定水合范围
    const html = await renderApp(url.pathname, { hydrationProfile });

    return new Response(html, {
      headers: { 'content-type': 'text/html' }
    });
  }
};
```

**Next.js 14+ Partial Prerendering (PPR) on Edge**：

```typescript
// app/page.tsx — PPR 自动将 Suspense 边界作为 Streaming 切分点
import { Suspense } from 'react';
import { ProductListSkeleton, ProductList } from '@/components/products';

export const runtime = 'edge';      // 在 Edge 运行
export const experimental_ppr = true; // 启用 PPR

export default function Page() {
  return (
    <main>
      {/* 静态部分：Edge 立即返回 */}
      <h1>产品目录</h1>

      {/* 动态部分：Streaming 填充 */}
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList /> {/* 内部异步数据获取 */}
      </Suspense>
    </main>
  );
}
```

> 数据来源：Next.js 15 Documentation, [Partial Prerendering](https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering)

### 3.3 Streaming SSR

Streaming SSR 允许 Edge 节点在完整数据就绪前就开始向客户端发送 HTML，显著改善**首字节时间 (TTFB)** 和**可交互时间 (TTI)**。

```
传统 SSR                    Streaming SSR
─────────────────          ─────────────────────────
  请求                        请求
    ↓                          ↓
  数据获取 (200ms)            <html><head>...</head>
    ↓                          ↓ ──→ 客户端立即开始解析
  渲染 (100ms)                <body>
    ↓                          ↓ ──→ 静态内容已可渲染
  发送完整 HTML               <Suspense fallback>
    ↓                          ↓ ──→ 骨架屏提升感知性能
  客户端解析                  </Suspense>
                              ↓ ──→ 数据就绪后填充
                            动态内容 chunk
                              ↓
                            </body></html>
```

**React 18 Streaming on Cloudflare Workers**：

```typescript
// worker.tsx
import { renderToReadableStream } from 'react-dom/server';
import App from './App';

export default {
  async fetch(request: Request): Promise<Response> {
    const stream = await renderToReadableStream(
      <App url={request.url} />,
      {
        // 错误边界：单个 Suspense 失败不影响整体流
        onError(error, errorInfo) {
          console.error('Streaming error:', error);
        },
      }
    );

    // 等待 Suspense 边界解析完成，或设置超时
    await stream.allReady;

    return new Response(stream, {
      headers: {
        'content-type': 'text/html',
        // 明确启用流式传输
        'transfer-encoding': 'chunked',
      },
    });
  }
};
```

**数据加载与 Streaming 协作模式**：

```typescript
// 组件级别异步数据获取，配合 Suspense
async function ProductReviews({ productId }: { productId: string }) {
  // 此 Promise 在服务端开始执行，但不阻塞流
  const reviews = await fetch(
    `https://api.example.com/products/${productId}/reviews`,
    { cache: 'no-store' }
  ).then(r => r.json());

  return (
    <ul>
      {reviews.map((r: any) => (
        <li key={r.id}>{r.rating}⭐ {r.comment}</li>
      ))}
    </ul>
  );
}

// 骨架屏组件
function ReviewsSkeleton() {
  return <div className="skeleton">加载评价中...</div>;
}

// 页面组装
function ProductPage({ productId }: { productId: string }) {
  return (
    <>
      <ProductInfo productId={productId} /> {/* 同步渲染 */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={productId} /> {/* 流式填充 */}
      </Suspense>
    </>
  );
}
```

---

## 4. Edge 数据层

### 挑战：传统数据库不适合 Edge

问题：Edge 函数运行在全球 300+ 节点，无法维持到单个数据库的长连接。

### 解决方案矩阵

| 方案 | 产品 | 一致性 | 延迟 | 适用场景 |
|------|------|--------|------|---------|
| **Edge 数据库** | D1 / Turso / Neon | 强一致 | < 10ms | 事务型数据 |
| **KV 存储** | Workers KV / Vercel KV | 最终一致 | < 5ms | 缓存、配置 |
| **对象存储** | R2 / S3 | 最终一致 | < 20ms | 文件、图片 |
| **Durable Objects** | Cloudflare | 强一致 | < 50ms | 状态、协作 |
| **Global Cache** | Upstash Redis / Vercel KV | 最终一致 | < 5ms | 会话、速率限制 |

### Turso 实战：SQLite on the Edge

```typescript
import { createClient } from '@libsql/client/web';

const client = createClient({
  url: 'libsql://your-db.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// 在 Edge Worker 中执行 SQL
export async function getUser(id: string) {
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id],
  });
  return result.rows[0];
}
```

### Durable Objects：有状态 Edge 计算

```typescript
export class Counter implements DurableObject {
  private state: DurableObjectState;
  private value: number = 0;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<number>('value');
      this.value = stored || 0;
    });
  }

  async fetch(request: Request): Promise<Response> {
    this.value++;
    await this.state.storage.put('value', this.value);
    return new Response(String(this.value));
  }
}
```

### 4.1 数据一致性模型

Edge 分布式环境对数据一致性提出了独特挑战。理解不同一致性模型是设计 Edge 数据层的关键。

#### 最终一致 vs 强一致

```
┌─────────────────────────────────────────────────────────────┐
│                    一致性光谱                                │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   最终一致    │  因果一致     │  会话一致     │    强一致       │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ Workers KV   │  Yjs CRDT    │  Neon Read   │ D1 / Turso     │
│ Vercel KV    │  AutoMerge   │  Replica     │ Durable Objects│
│ R2           │              │              │                │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ 延迟 < 5ms   │  延迟 < 10ms │  延迟 < 20ms │   延迟 < 50ms  │
│ 全局复制     │  本地合并    │  读写路由    │   单点协调     │
│ 配置/缓存    │  协作编辑    │  用户会话    │   金融交易     │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

**一致性选择决策树**：

```typescript
// Edge Worker 中根据操作类型选择存储后端
export async function handleWrite(
  operation: 'config' | 'session' | 'transaction' | 'collab',
  data: any,
  env: Env
) {
  switch (operation) {
    case 'config':
      // 最终一致：全局快速传播，允许短暂不一致
      return env.KV.put(`config:${data.key}`, JSON.stringify(data.value));

    case 'session':
      // 会话一致：绑定到用户地理位置的副本
      return env.SESSIONS.put(data.sessionId, JSON.stringify(data), {
        expirationTtl: 3600,
      });

    case 'transaction':
      // 强一致：通过 Durable Object 单点序列化
      const txId = env.TRANSACTIONS.idFromName(data.txKey);
      const stub = env.TRANSACTIONS.get(txId);
      return stub.fetch(new Request('http://internal/execute', {
        method: 'POST',
        body: JSON.stringify(data),
      }));

    case 'collab':
      // 因果一致：CRDT 本地操作，后台同步
      return applyLocalCRDT(data.docId, data.operation, env);
  }
}
```

> 数据来源：Cloudflare Docs 2025, [Consistency and Durability](https://developers.cloudflare.com/workers/learning/integrations/databases/); Turso Docs 2025

#### CRDT 基础与 Edge 协作

CRDT（Conflict-free Replicated Data Types，无冲突复制数据类型）是 Edge 协作场景的核心技术。在 Edge 环境中，每个用户的操作先在本地区域应用，再通过 WebSocket 或长轮询异步同步到其他区域。

```typescript
// Yjs 风格 CRDT 在 Durable Objects 中的简化实现
interface CRDTOperation {
  type: 'insert' | 'delete' | 'update';
  clock: number;        // Lamport 时间戳
  nodeId: string;       // 唯一节点标识
  key: string;
  value: any;
}

export class CollaborativeDoc implements DurableObject {
  private state: DurableObjectState;
  private operations: CRDTOperation[] = [];
  private vectorClock: Map<string, number> = new Map();
  private clients: WebSocket[] = [];

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      // WebSocket 升级：实时协作通道
      const [client, server] = Object.values(new WebSocketPair());
      this.clients.push(server);

      server.accept();

      // 新客户端接入：发送全量操作历史
      server.send(JSON.stringify({
        type: 'init',
        operations: this.operations,
        vectorClock: Object.fromEntries(this.vectorClock),
      }));

      server.addEventListener('message', (msg) => {
        const op: CRDTOperation = JSON.parse(msg.data as string);
        this.applyOperation(op);
        // 广播给其他客户端
        this.broadcast(op, server);
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname === '/op') {
      // HTTP 方式提交操作
      const op: CRDTOperation = await request.json();
      this.applyOperation(op);
      this.broadcast(op, null);
      return new Response('OK');
    }

    return new Response('Not Found', { status: 404 });
  }

  private applyOperation(op: CRDTOperation) {
    // Lamport 时钟更新
    const current = this.vectorClock.get(op.nodeId) || 0;
    if (op.clock > current) {
      this.vectorClock.set(op.nodeId, op.clock);
    }

    // 去重：基于 (nodeId, clock) 唯一键
    const exists = this.operations.some(
      o => o.nodeId === op.nodeId && o.clock === op.clock
    );
    if (!exists) {
      this.operations.push(op);
      // 持久化到 storage
      this.state.storage.put('ops', this.operations);
    }
  }

  private broadcast(op: CRDTOperation, except: WebSocket | null) {
    const msg = JSON.stringify({ type: 'op', operation: op });
    for (const client of this.clients) {
      if (client !== except && client.readyState === WebSocket.READY_STATE_OPEN) {
        client.send(msg);
      }
    }
  }
}
```

**LWW-Register（Last-Write-Wins 寄存器）简单实现**：

```typescript
// 最简单的 CRDT：带时间戳的寄存器
interface LWWRegister<T> {
  value: T;
  timestamp: number;  // 物理时钟或逻辑时钟
  nodeId: string;     // 解决时钟回拨冲突
}

function mergeLWW<T>(a: LWWRegister<T>, b: LWWRegister<T>): LWWRegister<T> {
  if (a.timestamp > b.timestamp) return a;
  if (b.timestamp > a.timestamp) return b;
  // 时间戳相同：按 nodeId 字典序决定（确定性冲突解决）
  return a.nodeId > b.nodeId ? a : b;
}

// Edge 场景：用户偏好设置跨设备同步
async function syncUserPreference(
  env: Env,
  userId: string,
  local: LWWRegister<string>
): Promise<LWWRegister<string>> {
  const remoteRaw = await env.KV.get(`pref:${userId}`);
  const remote: LWWRegister<string> | null = remoteRaw ? JSON.parse(remoteRaw) : null;

  const merged = remote ? mergeLWW(local, remote) : local;

  // 写回全局（最终一致）
  await env.KV.put(`pref:${userId}`, JSON.stringify(merged));

  return merged;
}
```

> 数据来源：Shapiro et al. 2011, "Conflict-Free Replicated Data Types"; Yjs Documentation 2025

#### 事件溯源（Event Sourcing）在 Edge

事件溯源将状态变更建模为不可变事件序列，天然适合 Edge 的追加型存储特性。

```typescript
// Edge 事件溯源架构
// ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
// │  Edge Node  │────→│ Event Store  │────→│  Projector  │
// │ (Command)   │     │ (D1/R2 Log)  │     │ (Materialize)│
// └─────────────┘     └──────────────┘     └─────────────┘
//                              │
//                              ↓
//                       ┌──────────────┐
//                       │  Read Model  │
//                       │  (Workers KV)│
//                       └──────────────┘

interface DomainEvent {
  eventId: string;      // UUID v4
  aggregateId: string;  // 实体标识
  eventType: string;    // 'OrderCreated' | 'PaymentReceived'
  version: number;      // 乐观并发控制
  payload: Record<string, unknown>;
  timestamp: string;    // ISO 8601
  metadata: {
    edgeNode: string;   // 产生事件的 Edge 节点
    userAgent: string;
  };
}

// Command 处理：在 Edge Worker 中执行
async function handleCommand(
  command: CreateOrderCommand,
  env: Env
): Promise<Result> {
  const aggregateId = command.orderId;

  // 1. 读取当前版本（从 Read Model 或 Event Store）
  const current = await env.EVENTS.list({ prefix: `order:${aggregateId}:` });
  const version = current.objects.length;

  // 2. 业务规则验证
  if (command.amount <= 0) {
    return { success: false, error: 'Invalid amount' };
  }

  // 3. 生成事件
  const event: DomainEvent = {
    eventId: crypto.randomUUID(),
    aggregateId,
    eventType: 'OrderCreated',
    version: version + 1,
    payload: {
      items: command.items,
      amount: command.amount,
      currency: command.currency,
    },
    timestamp: new Date().toISOString(),
    metadata: {
      edgeNode: env.COLO,  // Cloudflare 数据中心代码
      userAgent: command.userAgent,
    },
  };

  // 4. 追加到 Event Store（R2 对象存储适合不可变日志）
  await env.R2.put(
    `events/${aggregateId}/${event.version}.json`,
    JSON.stringify(event)
  );

  // 5. 异步投影到 Read Model
  env.QUEUE.send({ type: 'project', event });

  return { success: true, eventId: event.eventId };
}

// Read Model 投影器（由 Queue Consumer 触发）
async function projectEvent(event: DomainEvent, env: Env) {
  switch (event.eventType) {
    case 'OrderCreated': {
      const orderView = {
        id: event.aggregateId,
        status: 'created',
        amount: event.payload.amount,
        createdAt: event.timestamp,
      };
      await env.KV.put(`order-view:${event.aggregateId}`, JSON.stringify(orderView));
      break;
    }
    case 'PaymentReceived': {
      const key = `order-view:${event.aggregateId}`;
      const existing = await env.KV.get(key);
      if (existing) {
        const view = JSON.parse(existing);
        view.status = 'paid';
        view.paidAt = event.timestamp;
        await env.KV.put(key, JSON.stringify(view));
      }
      break;
    }
  }
}
```

> 数据来源：Martin Fowler 2005, "Event Sourcing"; Cloudflare R2 Documentation 2025

---

## 5. 缓存策略

### Edge 缓存金字塔

```
L1: 内存 (Map/变量) — 进程内，< 1μs
L2: KV (Workers KV) — 全球复制，< 5ms
L3: Cache API — HTTP 缓存，< 10ms
L4: 源站数据库 — 最终兜底，< 50ms
```

```typescript
// 多级缓存实现
export async function cachedFetch(
  request: Request,
  env: Env
): Promise<Response> {
  // L1: 内存缓存（同一 Isolate 内）
  const cacheKey = request.url;
  if (memoryCache.has(cacheKey)) {
    return new Response(memoryCache.get(cacheKey));
  }

  // L2: KV 缓存
  const kvCached = await env.KV.get(cacheKey);
  if (kvCached) {
    memoryCache.set(cacheKey, kvCached); // 回填 L1
    return new Response(kvCached);
  }

  // L3: Cache API
  const cache = await caches.open('v1');
  const cached = await cache.match(request);
  if (cached) return cached;

  // L4: 源站获取
  const response = await fetch(request);
  const body = await response.text();

  // 回填各级缓存
  ctx.waitUntil(env.KV.put(cacheKey, body, { expirationTtl: 300 }));
  ctx.waitUntil(cache.put(request, new Response(body)));

  return new Response(body);
}
```

---

## 6. Edge 安全架构

Edge 节点位于用户与源站之间，是实施安全策略的理想位置。将安全控制前移到 Edge 可以显著降低源站攻击面。

### 6.1 JWT 验证在 Edge

Edge 环境无状态、低延迟的特性使其成为 JWT 验证的绝佳场景。验证可在用户最近的节点完成，无需回源。

```
┌──────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐
│  Client  │───→│  Edge Node  │───→│  JWKS Cache │    │  Origin  │
│ + Bearer │    │ Verify JWT  │    │  (KV)       │    │  (Safe)  │
└──────────┘    └─────────────┘    └─────────────┘    └──────────┘
                     │
                     ↓ 无效 Token
                ┌──────────┐
                │  403 响应 │  ← 源站无感知
                └──────────┘
```

**Cloudflare Workers JWT 验证实现**：

```typescript
import { jwtVerify, createRemoteJWKSet } from 'jose';

// JWKS 缓存到 KV，避免每次请求回源获取公钥
async function getJWKS(env: Env) {
  const cached = await env.JWKS_KV.get('jwks', 'json');
  if (cached) return cached;

  // 从身份提供商获取（如 Auth0、Clerk、Firebase）
  const jwks = await fetch('https://your-auth-domain/.well-known/jwks.json')
    .then(r => r.json());

  // 缓存 6 小时（JWKS 轮换周期通常 > 24h）
  await env.JWKS_KV.put('jwks', JSON.stringify(jwks), { expirationTtl: 21600 });
  return jwks;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Bearer' }
      });
    }

    try {
      const jwks = await getJWKS(env);
      const JWKS = createRemoteJWKSet(new URL('https://dummy/jwks'));
      // 实际使用本地缓存的 JWKS 构造密钥集

      const { payload } = await jwtVerify(token, async (header) => {
        const key = jwks.keys.find((k: any) => k.kid === header.kid);
        if (!key) throw new Error('Unknown key ID');
        return await jose.importJWK(key, header.alg);
      }, {
        issuer: 'https://your-auth-domain/',
        audience: 'your-api-id',
        clockTolerance: 60, // 允许 60 秒时钟偏移
      });

      // 将解析后的 claims 注入请求头，传递给后端
      const modifiedRequest = new Request(request, {
        headers: {
          ...Object.fromEntries(request.headers),
          'x-user-id': payload.sub as string,
          'x-user-role': (payload.role as string) || 'user',
        }
      });

      return fetch(modifiedRequest);

    } catch (error) {
      return new Response(`Invalid token: ${(error as Error).message}`, {
        status: 403
      });
    }
  }
};
```

**EdDSA / ES256 算法选择**：Edge 环境中 EdDSA (Ed25519) 签名验证比 RS256 快约 10 倍。若身份提供商支持，优先选择 EdDSA。

> 数据来源：Cloudflare Workers Docs 2025, [Cryptographic Signing](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/); jose library benchmarks

### 6.2 CORS 策略在 Edge

Edge 是实施精细化 CORS 控制的最佳位置，可按区域、按客户端类型动态调整策略。

```typescript
// Edge CORS 中间件：支持动态来源白名单
interface CORSConfig {
  allowedOrigins: string[];      // 精确匹配
  allowedPatterns: RegExp[];     // 正则匹配（如 *.vercel.app）
  allowedMethods: string[];
  allowedHeaders: string[];
  maxAge: number;
  credentials: boolean;
}

const defaultConfig: CORSConfig = {
  allowedOrigins: ['https://app.example.com', 'https://admin.example.com'],
  allowedPatterns: [/^https:\/\/[a-z-]+\.example\.com$/],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['content-type', 'authorization', 'x-request-id'],
  maxAge: 86400,
  credentials: true,
};

function isOriginAllowed(origin: string, config: CORSConfig): boolean {
  if (config.allowedOrigins.includes(origin)) return true;
  return config.allowedPatterns.some(p => p.test(origin));
}

export function handleCORS(
  request: Request,
  config: CORSConfig = defaultConfig
): Response | null {
  const origin = request.headers.get('origin') || '';

  // Preflight 请求
  if (request.method === 'OPTIONS') {
    if (!isOriginAllowed(origin, config)) {
      return new Response('Origin not allowed', { status: 403 });
    }

    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': config.allowedMethods.join(', '),
        'Access-Control-Allow-Headers': config.allowedHeaders.join(', '),
        'Access-Control-Max-Age': String(config.maxAge),
        ...(config.credentials && { 'Access-Control-Allow-Credentials': 'true' }),
      },
    });
  }

  // 实际请求：继续处理，但记录需要添加的 CORS 头
  return null;
}

// Worker 中使用
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 根据环境动态加载 CORS 配置（如开发环境允许 localhost）
    const config: CORSConfig = env.ENV === 'development'
      ? { ...defaultConfig, allowedOrigins: [...defaultConfig.allowedOrigins, 'http://localhost:3000'] }
      : defaultConfig;

    const corsResponse = handleCORS(request, config);
    if (corsResponse) return corsResponse;

    const response = await fetch(request);
    const origin = request.headers.get('origin') || '';

    const newHeaders = new Headers(response.headers);
    if (isOriginAllowed(origin, config)) {
      newHeaders.set('Access-Control-Allow-Origin', origin);
      if (config.credentials) {
        newHeaders.set('Access-Control-Allow-Credentials', 'true');
      }
    }

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders
    });
  }
};
```

### 6.3 速率限制（Rate Limiting）

Edge 速率限制相比源站实现有两个数量级的效率优势：在请求到达源站前即被拒绝，且基于全球共享的 KV/Durable Objects 状态。

```typescript
// 滑动窗口速率限制：基于 Durable Objects 实现全局一致计数
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}

export class RateLimiter implements DurableObject {
  private state: DurableObjectState;
  private requests: number[] = []; // 时间戳数组

  constructor(state: DurableObjectState) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<number[]>('requests');
      if (stored) this.requests = stored;
    });
  }

  async checkLimit(
    windowMs: number = 60000,    // 1 分钟窗口
    maxRequests: number = 100     // 每分钟最多 100 请求
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;

    // 清理过期时间戳
    this.requests = this.requests.filter(t => t > windowStart);

    const currentCount = this.requests.length;
    const allowed = currentCount < maxRequests;

    if (allowed) {
      this.requests.push(now);
      await this.state.storage.put('requests', this.requests);
    }

    // 计算重置时间：窗口中最早请求的过期时间
    const resetTime = this.requests.length > 0
      ? this.requests[0] + windowMs
      : now + windowMs;

    return {
      allowed,
      remaining: Math.max(0, maxRequests - currentCount - (allowed ? 1 : 0)),
      resetTime,
      limit: maxRequests,
    };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const windowMs = parseInt(url.searchParams.get('window') || '60000');
    const maxRequests = parseInt(url.searchParams.get('limit') || '100');

    const result = await this.checkLimit(windowMs, maxRequests);

    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' },
    });
  }
}

// Worker 入口：分层速率限制
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const clientId = getClientIdentifier(request); // IP + User-Agent 哈希

    // L1: 本地内存快速检查（同一 Isolate 内）
    if (isLocalBlocked(clientId)) {
      return new Response('Too Many Requests', { status: 429 });
    }

    // L2: Durable Object 全局精确计数
    const limiterId = env.RATE_LIMITER.idFromName(clientId);
    const limiter = env.RATE_LIMITER.get(limiterId);

    const check = await limiter.fetch(
      `http://internal/check?window=60000&limit=100`
    );
    const result: RateLimitResult = await check.json();

    if (!result.allowed) {
      // 本地标记，减少 DO 调用
      blockLocally(clientId, result.resetTime);

      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
          'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
        },
      });
    }

    // 请求通过，继续处理
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-RateLimit-Limit', String(result.limit));
    newResponse.headers.set('X-RateLimit-Remaining', String(result.remaining));
    return newResponse;
  }
};

function getClientIdentifier(request: Request): string {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const ua = request.headers.get('user-agent') || '';
  // 简单哈希：生产环境使用更稳定的算法
  return `${ip}:${ua.slice(0, 20)}`;
}
```

**分层速率限制架构**：

| 层级 | 实现 | 范围 | 延迟 | 用途 |
|------|------|------|------|------|
| L1 | 内存 Map | Isolate 本地 | < 1μs | 拦截明显滥用 |
| L2 | Workers KV | 区域近似 | < 5ms | 中等精度限制 |
| L3 | Durable Object | 全局精确 | < 50ms | 严格业务限制 |
| L4 | Origin API | 应用级别 | < 100ms | 计费/配额控制 |

> 数据来源：Cloudflare Blog 2024, [Rate Limiting](https://blog.cloudflare.com/how-we-built-rate-limiting/); Vercel Docs 2025

### 6.4 DDoS 防护与 WAF

Edge 原生集成了多层 DDoS 防护。作为开发者，你可以在 Worker 中实现应用层防护逻辑。

```typescript
// Edge DDoS / Bot 检测层
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. Cloudflare 原生信号（自动注入的请求头）
    const threatScore = parseInt(request.headers.get('cf-threat-score') || '0');
    const botManagement = request.headers.get('cf-bot-management'); // 'true' | 'false'
    const verifiedBot = request.headers.get('cf-verified-bot');     // 搜索引擎等合法爬虫

    // 威胁分数 > 50：直接拒绝（Cloudflare 已识别为恶意）
    if (threatScore > 50) {
      return new Response('Access Denied', { status: 403 });
    }

    // 2. 应用层行为分析
    const clientFingerprint = generateFingerprint(request);
    const behavior = await analyzeBehavior(clientFingerprint, env);

    // 检测模式：过于规律的请求间隔（自动化特征）
    if (behavior.regularityScore > 0.95 && behavior.requestCount > 10) {
      await env.BLOCKLIST.put(clientFingerprint, 'true', { expirationTtl: 3600 });
      return new Response('Automated access detected', { status: 403 });
    }

    // 3. 路径级速率限制（API vs 静态资源不同阈值）
    const isApi = url.pathname.startsWith('/api/');
    const limitConfig = isApi
      ? { window: 60000, limit: 100 }    // API: 100/min
      : { window: 60000, limit: 1000 };  // 静态: 1000/min

    // 4. 请求大小限制（防止 Payload 攻击）
    const contentLength = parseInt(request.headers.get('content-length') || '0');
    if (contentLength > 10 * 1024 * 1024) { // 10MB
      return new Response('Payload Too Large', { status: 413 });
    }

    // 通过所有检查，继续处理
    return fetch(request);
  }
};

function generateFingerprint(request: Request): string {
  // 基于 TLS指纹、Accept 头、IP 等生成设备指纹
  const signals = [
    request.headers.get('cf-connecting-ip'),
    request.headers.get('accept-language'),
    request.headers.get('sec-ch-ua'),
    request.headers.get('sec-ch-ua-platform'),
  ].join('|');

  // 简化：实际生产使用更复杂的指纹算法
  return btoa(signals).slice(0, 32);
}

interface BehaviorAnalysis {
  regularityScore: number;  // 请求间隔规律性 0-1
  requestCount: number;     // 最近窗口内请求数
}

async function analyzeBehavior(
  fingerprint: string,
  env: Env
): Promise<BehaviorAnalysis> {
  const key = `behavior:${fingerprint}`;
  const raw = await env.KV.get(key);

  if (!raw) return { regularityScore: 0, requestCount: 0 };

  return JSON.parse(raw) as BehaviorAnalysis;
}
```

> 数据来源：Cloudflare DDoS Report 2025; OWASP Edge Security Cheat Sheet 2025

---

## 7. 调试与可观测性

Edge 分布式环境的可观测性比传统单体应用更复杂。请求可能在多个节点间跳转，状态分散在全球。

### 7.1 Edge Log 收集模式

Edge 环境没有持久化文件系统，日志必须通过流式方式外发。

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Edge Node   │───→│ Worker Log  │───→│ Log Gateway │───→│  Analytics  │
│ (console)   │    │ tail/stream │    │ (Worker)    │    │  Platform   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                            │
                                            ↓
                                     ┌─────────────┐
                                     │ R2 / Logpush│ ← 长期归档
                                     └─────────────┘
```

**结构化日志实现**：

```typescript
// 统一日志格式：兼容 OpenTelemetry 语义约定
interface EdgeLogEntry {
  timestamp: string;           // ISO 8601
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  traceId: string;             // W3C Trace Context
  spanId: string;
  service: string;             // 服务名
  region: string;              // Edge 节点区域
  duration_ms: number;         // 请求处理耗时
  request: {
    method: string;
    path: string;
    host: string;
    clientIp: string;
    userAgent: string;
  };
  response: {
    status: number;
    size_bytes: number;
  };
  custom: Record<string, unknown>; // 业务字段
}

class EdgeLogger {
  private traceId: string;
  private spanId: string;
  private startTime: number;
  private service: string;
  private region: string;

  constructor(request: Request, service: string) {
    // 继承上游 Trace Context，或生成新的
    this.traceId = request.headers.get('traceparent')?.split('-')[1]
      || crypto.randomUUID().replace(/-/g, '');
    this.spanId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    this.startTime = performance.now();
    this.service = service;
    this.region = request.cf?.colo as string || 'unknown'; // Cloudflare 数据中心
  }

  private log(level: EdgeLogEntry['level'], message: string, custom: Record<string, unknown> = {}) {
    const entry: EdgeLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      traceId: this.traceId,
      spanId: this.spanId,
      service: this.service,
      region: this.region,
      duration_ms: Math.round(performance.now() - this.startTime),
      request: {
        method: 'unknown',
        path: 'unknown',
        host: 'unknown',
        clientIp: 'unknown',
        userAgent: 'unknown',
      },
      response: { status: 0, size_bytes: 0 },
      custom,
    };

    // Edge 环境：输出到 stdout/stderr，由平台收集
    console.log(JSON.stringify(entry));
  }

  info(msg: string, meta?: Record<string, unknown>) { this.log('info', msg, meta); }
  warn(msg: string, meta?: Record<string, unknown>) { this.log('warn', msg, meta); }
  error(msg: string, meta?: Record<string, unknown>) { this.log('error', msg, meta); }

  // 请求完成时调用，记录完整请求/响应信息
  finish(request: Request, response: Response) {
    this.log('info', 'Request completed', {
      requestMethod: request.method,
      requestPath: new URL(request.url).pathname,
      requestHost: new URL(request.url).host,
      responseStatus: response.status,
      responseSize: response.headers.get('content-length'),
    });
  }
}

// Worker 中使用
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const logger = new EdgeLogger(request, 'api-gateway');
    logger.info('Request started', { path: new URL(request.url).pathname });

    try {
      const response = await handleRequest(request, env, logger);
      logger.finish(request, response);
      return response;
    } catch (error) {
      logger.error('Unhandled exception', {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      return new Response('Internal Error', { status: 500 });
    }
  }
};
```

**Cloudflare Logpush 配置（长期归档到 R2）**：

```bash
# 使用 wrangler 配置日志推送
wrangler tail --format=json | jq -c 'select(.level == "error")' > errors.log

# 或通过 Logpush API 配置自动归档
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/logpush/jobs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dataset": "workers_logs",
    "destination_conf": "r2://logs-bucket/workers-logs/{DATE}?account-id=<account_id>&access-key-id=<id>&secret-access-key=<secret>",
    "logpull_options": {"fields": ["timestamp", "level", "message", "traceId", "duration_ms"]},
    "frequency": "high"
  }'
```

> 数据来源：Cloudflare Workers Observability Docs 2025; OpenTelemetry Semantic Conventions 1.24

### 7.2 分布式追踪

在 Edge + Origin 混合架构中，分布式追踪是定位性能瓶颈的唯一有效手段。

```typescript
// W3C Trace Context 在 Edge 中的传播
// traceparent: 00-<trace-id>-<span-id>-<flags>
// tracestate: 平台特定的补充信息

interface TraceContext {
  traceId: string;      // 128-bit hex
  parentSpanId: string; // 64-bit hex（来自上游）
  spanId: string;       // 本段 span
  flags: number;        // 采样标志
}

function parseTraceparent(header: string | null): TraceContext | null {
  if (!header) return null;
  const parts = header.split('-');
  if (parts.length !== 4 || parts[0] !== '00') return null;

  return {
    traceId: parts[1],
    parentSpanId: parts[2],
    spanId: generateSpanId(),
    flags: parseInt(parts[3], 16),
  };
}

function generateSpanId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 创建带追踪信息的子请求
async function tracedFetch(
  request: Request,
  env: Env,
  traceCtx: TraceContext,
  spanName: string
): Promise<Response> {
  const spanId = generateSpanId();
  const start = performance.now();

  const headers = new Headers(request.headers);
  // 向下游传播 Trace Context
  headers.set('traceparent',
    `00-${traceCtx.traceId}-${spanId}-${traceCtx.flags.toString(16).padStart(2, '0')}`
  );

  try {
    const response = await fetch(new Request(request, { headers }));

    // 上报 span 数据（异步，不阻塞响应）
    const duration = performance.now() - start;
    reportSpan({
      traceId: traceCtx.traceId,
      spanId,
      parentSpanId: traceCtx.parentSpanId,
      name: spanName,
      startTime: start,
      duration,
      tags: {
        'http.method': request.method,
        'http.url': request.url,
        'http.status_code': response.status,
        'edge.region': request.cf?.colo as string,
      },
    }, env);

    return response;
  } catch (error) {
    reportSpan({
      traceId: traceCtx.traceId,
      spanId,
      parentSpanId: traceCtx.parentSpanId,
      name: spanName,
      startTime: start,
      duration: performance.now() - start,
      error: (error as Error).message,
      tags: { 'error': 'true' },
    }, env);
    throw error;
  }
}

// 批量上报 span 到 OpenTelemetry Collector 或 Honeycomb/Jaeger
async function reportSpan(span: any, env: Env) {
  // 使用 waitUntil 确保不阻塞响应
  env.CTX?.waitUntil?.(
    fetch(env.OTEL_COLLECTOR_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ resourceSpans: [span] }),
    }).catch(() => {})
  );
}
```

**Honeycomb + Cloudflare Workers 集成**：

```typescript
// 使用 Honeycomb OTLP endpoint 直接上报
const HONEYCOMB_API_KEY = env.HONEYCOMB_API_KEY;
const HONEYCOMB_DATASET = env.HONEYCOMB_DATASET;

async function sendToHoneycomb(spans: any[]) {
  const response = await fetch(
    `https://api.honeycomb.io/v1/traces/${HONEYCOMB_DATASET}`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-honeycomb-team': HONEYCOMB_API_KEY,
      },
      body: JSON.stringify({ resourceSpans: spans }),
    }
  );

  if (!response.ok) {
    console.error('Failed to send traces:', await response.text());
  }
}
```

> 数据来源：W3C Trace Context Specification; OpenTelemetry Docs 2025; Honeycomb Integration Guide

### 7.3 错误监控与告警

Edge 环境的错误处理需要区分：平台错误（Worker 异常退出）、应用错误（业务逻辑异常）、网络错误（上游超时）。

```typescript
// Edge 错误分类与上报
enum ErrorCategory {
  PLATFORM = 'platform',     // Worker runtime 错误
  APPLICATION = 'application', // 业务异常
  NETWORK = 'network',       // 上游服务错误
  TIMEOUT = 'timeout',       // 执行超时
  RATE_LIMIT = 'rate_limit', // 被限流
}

interface ErrorReport {
  errorId: string;
  category: ErrorCategory;
  message: string;
  stack?: string;
  traceId: string;
  timestamp: string;
  context: {
    url: string;
    method: string;
    headers: Record<string, string>;
    cf: Record<string, unknown>; // Cloudflare 特定元数据
  };
}

class EdgeErrorReporter {
  constructor(private env: Env, private service: string) {}

  async report(error: Error, category: ErrorCategory, request: Request) {
    const report: ErrorReport = {
      errorId: crypto.randomUUID(),
      category,
      message: error.message,
      stack: error.stack,
      traceId: request.headers.get('traceparent')?.split('-')[1] || 'unknown',
      timestamp: new Date().toISOString(),
      context: {
        url: request.url,
        method: request.method,
        headers: this.sanitizeHeaders(request.headers),
        cf: request.cf as any,
      },
    };

    // 立即输出到日志
    console.error(JSON.stringify(report));

    // 关键错误：同步上报到 Sentry（或异步通过 Queue）
    if (category === ErrorCategory.APPLICATION || category === ErrorCategory.PLATFORM) {
      await this.sendToSentry(report);
    }

    // 聚合统计写入 KV（用于实时监控大盘）
    const dateKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const errorKey = `errors:${this.service}:${dateKey}:${category}`;
    const current = parseInt(await this.env.ANALYTICS_KV.get(errorKey) || '0');
    await this.env.ANALYTICS_KV.put(errorKey, String(current + 1));
  }

  private sanitizeHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    const sensitive = ['authorization', 'cookie', 'x-api-key'];

    headers.forEach((value, key) => {
      result[key] = sensitive.includes(key.toLowerCase())
        ? '[REDACTED]'
        : value;
    });

    return result;
  }

  private async sendToSentry(report: ErrorReport) {
    const sentryEvent = {
      event_id: report.errorId,
      timestamp: report.timestamp,
      level: 'error',
      platform: 'node',
      culprit: this.service,
      message: { formatted: report.message },
      exception: [{
        type: report.category,
        value: report.message,
        stacktrace: report.stack ? { frames: this.parseStack(report.stack) } : undefined,
      }],
      contexts: {
        trace: { trace_id: report.traceId },
        edge: {
          region: report.context.cf?.colo,
          country: report.context.cf?.country,
        },
      },
      request: {
        url: report.context.url,
        method: report.context.method,
        headers: report.context.headers,
      },
    };

    await fetch(`https://sentry.io/api/${this.env.SENTRY_PROJECT_ID}/store/`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-sentry-auth': `Sentry sentry_key=${this.env.SENTRY_KEY}`,
      },
      body: JSON.stringify(sentryEvent),
    });
  }

  private parseStack(stack: string): any[] {
    // 简化栈帧解析
    return stack.split('\n').slice(1).map(line => ({
      function: line.match(/at\s+(.*?)\s+\(/)?.[1] || 'unknown',
      filename: line.match(/\((.*?):\d+:\d+\)/)?.[1] || 'unknown',
    }));
  }
}

// Worker 全局错误边界
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const reporter = new EdgeErrorReporter(env, 'api-gateway');

    try {
      return await handleRequest(request, env);
    } catch (error) {
      const cat = (error as Error).message.includes('timeout')
        ? ErrorCategory.TIMEOUT
        : ErrorCategory.APPLICATION;

      await reporter.report(error as Error, cat, request);

      // 用户-facing 响应（不暴露内部细节）
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          reference: reporter['report'].name, // errorId 可放入响应让用户反馈
        }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      );
    }
  }
};
```

> 数据来源：Sentry Edge SDK Docs 2025; Cloudflare Workers Error Handling Best Practices

---

## 8. 成本分析：Edge 计算 vs 传统服务器 TCO

Edge 计算采用按请求计费模型，与传统服务器的预留/包年包月模式在成本结构上有本质差异。

### 8.1 成本模型对比

```
传统云服务器 (AWS EC2 / 阿里云 ECS)
─────────────────────────────────────
固定成本：
  ├─ 计算实例：$50-500/月（按配置）
  ├─ 负载均衡：$20-50/月
  ├─ 带宽：$0.08-0.12/GB
  └─ 运维人力：$2000+/月

变动成本：
  └─ 流量突增需手动扩容，或过度预留

Edge 计算 (Cloudflare Workers / Vercel Edge)
────────────────────────────────────────────
固定成本：
  └─ 接近零（无服务器维护）

变动成本：
  ├─ 请求计费：$0.50 / 百万请求
  ├─ CPU 时间：$0.02 / 百万毫秒-GB
  ├─ KV 操作：$0.50 / 百万读，$5 / 百万写
  └─ 出站带宽：通常包含在请求费用中
```

### 8.2 TCO 场景分析

| 场景 | 月均请求量 | 传统架构 (EC2+ALB) | Edge 架构 (Workers+KV) | 节省比例 |
|------|-----------|-------------------|----------------------|---------|
| **个人博客** | 10 万 | $45 | $2 | **95%** |
| **SaaS API** | 5000 万 | $850 | $45 | **95%** |
| **电商大促** | 10 亿（峰值）| $12,000（需预留）| $580（按量）| **95%** |
| **WebSocket 实时应用** | 持久连接 | $300 | ❌ 不适用 | — |
| **视频转码** | 长时计算 | $500 | ❌ 超出限制 | — |

**计算示例：中型 SaaS 平台**

```typescript
// 假设月流量规模：
const monthlyStats = {
  requests: 50_000_000,           // 5000 万请求/月
  avgCpuMs: 50,                   // 平均 CPU 时间 50ms
  kvReads: 100_000_000,           // 1 亿 KV 读
  kvWrites: 10_000_000,           // 1000 万 KV 写
  bandwidthGB: 5000,              // 5TB 出站流量
};

// Cloudflare Workers 定价 (2026, Paid Plan $5/月包含额度)
const edgeCost = {
  basePlan: 5,                                        // $5 基础套餐
  requests: Math.max(0, (monthlyStats.requests - 10_000_000) / 1_000_000 * 0.30),
  // 超出 1000 万部分：$0.30/百万

  cpuTime: Math.max(0, (monthlyStats.requests * monthlyStats.avgCpuMs - 400_000_000) / 1_000_000 * 12.50),
  // 超出 4 亿 ms-GB 部分：$12.50/百万 ms

  kvReads: Math.max(0, (monthlyStats.kvReads - 10_000_000) / 1_000_000 * 0.50),
  kvWrites: monthlyStats.kvWrites / 1_000_000 * 5.00,
  // Workers KV 写：$5/百万

  bandwidth: 0, // Workers 出站流量免费
};

const totalEdgeCost = Object.values(edgeCost).reduce((a, b) => a + b, 0);
// 估算结果：约 $55-75/月

// 对比 AWS (t3.medium × 2 + ALB + Data Transfer)
const traditionalCost = {
  ec2: 2 * 30.37,        // 2× t3.medium
  alb: 16.43 + 0.008 * monthlyStats.requests / 1_000_000, // 基础 + LCU
  dataTransfer: monthlyStats.bandwidthGB * 0.09, // $0.09/GB
  cloudwatch: 50,
};
// 估算结果：约 $600-900/月
```

### 8.3 隐性成本考量

| 成本项 | 传统架构 | Edge 架构 | 备注 |
|--------|---------|----------|------|
| **运维人力** | 高（需维护服务器、补丁、扩容） | 低（平台托管） | Edge 节省主要人力成本 |
| **冷启动调优** | N/A | 中（需优化代码包大小） | Edge 有 Bundle 大小限制 |
| **多区域部署** | 高（需在每个区域部署实例） | 零（自动全球分布） | Edge 核心优势 |
| **供应商锁定** | 中（容器相对可移植） | 高（Workers API 特定） | 可考虑 WinterCG 兼容层 |
| **调试工具** | 成熟 | 发展中 | Logpush、Tail 已较完善 |
| **供应商溢价** | 低（标准化产品） | 中（便利性的代价） | 规模越大溢价越明显 |

**成本优化策略**：

```typescript
// 1. 使用 Cache API 减少重复计算（免费缓存）
const cache = await caches.open('compute-cache');
const cached = await cache.match(request);
if (cached) return cached;

// 2. 减少 KV 写操作：批量写入，使用本地聚合
// 坏：每次请求写 KV
// 好：内存聚合，定期刷盘

// 3. 使用 R2 替代 KV 存储大对象（R2 无操作费用，仅存储费）
// KV 适合小键值（< 25MB），R2 适合文件/日志

// 4. Durable Objects 按需创建，避免长期空置
const id = env.DO.idFromName(docId); // 仅在需要时获取 stub
```

> 数据来源：Cloudflare Pricing 2026; Vercel Pricing 2026; AWS Pricing Calculator 2026

---

## 9. 案例研究

### 9.1 Vercel.com 的 Edge 架构演进

Vercel 自身平台是 Edge-First 架构的最大规模实践之一。其架构经历了从传统 SSR 到 Edge-Native 的完整演进。

```
Vercel.com 架构演进 (2022 → 2026)
─────────────────────────────────────────────────────────

2022: 传统 Next.js SSR
  用户 → Vercel CDN → US-East Lambda → PlanetScale (US)
  全球平均延迟: 180ms
  基础设施成本: $$$$

2024: Edge 混合架构
  用户 → Edge Middleware → Edge Functions → Vercel KV + Postgres
  静态内容: Edge Cache (即时)
  动态内容: Edge Functions (< 50ms)
  全球平均延迟: 45ms

2026: Full Edge-Native
  用户 → Edge Compute → Turso (Global) + Vercel Blob + AI SDK
  ├─ 营销页面: ISR + Edge Cache
  ├─ Dashboard: Edge Functions + RSC
  ├─ 实时预览: Edge Streaming + WebSocket
  └─ AI 功能: Edge AI SDK → vLLM on GPU Workers
  全球平均延迟: 25ms
```

**关键技术决策**：

| 决策 | 选择 | 原因 |
|------|------|------|
| 数据库 | Turso (libSQL) | SQLite 协议，全球复制，Edge 延迟 < 10ms |
| 认证 | Auth.js + Edge | JWT 在 Edge 验证，无需会话状态 |
| AI 推理 | AI SDK + Mistral@Edge | 小模型 (< 8B) 在 Edge 运行，大模型回源 |
| 图片优化 | Vercel Edge + R2 | 动态格式转换 (AVIF/WebP) 在请求时完成 |

**性能数据**（来源：Vercel 官方工程博客 2025）：

- 首字节时间 (TTFB)：从 280ms → 35ms（全球平均）
- API P99 延迟：从 1.2s → 180ms
- 月度基础设施成本：降低 87%
- 黑色星期五峰值：300,000 RPM 零故障

> 数据来源：Vercel Engineering Blog 2025, "How We Built v0"; Next.js Conf 2025 Keynote

### 9.2 Cloudflare Workers AI 架构

Cloudflare 的 Workers AI 将机器学习推理下沉到全球 300+ Edge 节点，代表了 AI @ Edge 的最前沿实践。

```
Workers AI 推理架构
─────────────────────────────────────────────────────────

用户请求 ("翻译这段文字")
  ↓
Edge Worker (最近节点, 如 HKG 香港)
  ├─ 检查缓存 (Workers KV): 是否命中相似请求？
  ├─ 未命中 → 本地推理？
  │   ├─ 模型大小 < 1B: 直接在 Worker 运行 (WASM/TensorFlow.js)
  │   └─ 模型大小 1B-8B: 调用 Workers AI GPU 节点（同数据中心）
  └─ 模型大小 > 8B: 回源到 Core AI 数据中心
  ↓
响应（流式输出）
```

**代码实现**：

```typescript
// Workers AI 推理示例
export interface Env {
  AI: Ai; // Cloudflare Workers AI 绑定
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { prompt, model = '@cf/meta/llama-3.1-8b-instruct' } = await request.json();

    // 1. 缓存检查：相同 prompt 直接返回缓存结果
    const cacheKey = `ai:${model}:${await sha256(prompt)}`;
    const cached = await env.AI_KV?.get(cacheKey);
    if (cached) return new Response(cached);

    // 2. 流式推理
    const stream = await env.AI.run(model, {
      prompt,
      stream: true, // 启用流式输出
      max_tokens: 512,
    });

    // 3. 双工处理：一边流式输出给用户，一边缓存完整结果
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const chunks: string[] = [];

    // 消费流
    const reader = (stream as ReadableStream).getReader();

    ctx.waitUntil((async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        chunks.push(text);
        await writer.write(value);
      }
      writer.close();

      // 缓存完整响应（TTL 1 小时）
      await env.AI_KV?.put(cacheKey, chunks.join(''), { expirationTtl: 3600 });
    })());

    return new Response(readable, {
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
      },
    });
  }
};

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

**Workers AI 模型分层策略**：

| 模型规模 | 示例 | 运行位置 | 延迟 | 适用场景 |
|----------|------|---------|------|---------|
| < 500M | BERT, DistilBERT | Edge CPU (WASM) | < 50ms | 分类、Embedding |
| 1B - 8B | Llama 3.1 8B, Mistral 7B | Edge GPU | 100-500ms | 文本生成、对话 |
| 70B+ | Llama 3 70B, GPT-4 级 | Core DC (集中式) | 1-5s | 复杂推理、代码生成 |

> 数据来源：Cloudflare Workers AI Docs 2025; "AI on Cloudflare" Blog Series 2025

---

## 10. 反模式：不适合 Edge 的场景

Edge 并非银弹。以下场景若强行迁移到 Edge，将导致性能下降、成本激增或架构复杂度失控。

### 10.1 长连接应用（WebSocket / SSE 大量并发）

**问题**：虽然 Cloudflare Durable Objects 支持 WebSocket，但 Edge 函数的计费模型和生命周期设计不适合大量持久连接。

```
❌ 反模式：在 Edge 运行大型聊天服务器

  每个 WebSocket 连接占用一个 Durable Object 实例
  10,000 并发连接 → 10,000 个 DO 实例
  问题：
    - DO 有单实例消息速率限制（~1000 msg/s）
    - 跨 DO 广播需要 O(n) 消息传递
    - 成本随连接数线性增长

✅ 正确做法：
  Edge: 认证 + 初始握手 → 路由到最近的 Socket.io/Pusher 集群
  Origin: 专用 WebSocket 服务器处理长连接
```

```typescript
// Edge 层仅做 WebSocket 认证和路由
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/ws/connect') {
      // 1. Edge 验证 JWT
      const token = url.searchParams.get('token');
      const user = await verifyJWT(token, env);
      if (!user) return new Response('Unauthorized', { status: 401 });

      // 2. 选择最近的 WebSocket 集群
      const region = request.cf?.colo as string;
      const cluster = selectCluster(region); // 'wss://ws-us.example.com' | 'wss://ws-eu.example.com'

      // 3. 返回重定向（或代理连接）
      return Response.json({
        endpoint: cluster,
        authToken: await generateScopedToken(user, env), // 短期有效令牌
      });
    }

    return fetch(request);
  }
};
```

### 10.2 大量状态持有

**问题**：Edge 函数是无状态的。虽有 Durable Objects 提供状态，但其设计目标是"协调"而非"存储"。

```
❌ 反模式：在 DO 中维护大型会话状态

  class SessionStore implements DurableObject {
    private sessions: Map<string, UserSession>; // 100MB+ 数据
    // DO storage 有单实例限制，大状态导致：
    // - 序列化/反序列化延迟高
    // - 内存占用超标被终止
    // - 迁移成本高
  }

✅ 正确做法：
  DO: 仅维护会话元数据（userId → 区域映射）
  KV/R2: 会话数据存储
  DO 在需要时从 KV 懒加载
```

```typescript
// 正确的状态分离模式
export class SessionCoordinator implements DurableObject {
  private state: DurableObjectState;

  // 内存中只保留索引，不保留完整数据
  private sessionIndex: Map<string, { region: string; lastSeen: number }> = new Map();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (url.pathname === '/get') {
      const index = this.sessionIndex.get(userId!);
      if (!index) return new Response('Not found', { status: 404 });

      // 从 KV 获取完整会话数据（大对象在 KV，不在 DO）
      const sessionData = await this.state.storage.get<string>(`session:${userId}`);
      return new Response(sessionData);
    }

    if (url.pathname === '/set') {
      const body = await request.text();
      // 索引在内存（快速）
      this.sessionIndex.set(userId!, { region: 'us-east', lastSeen: Date.now() });
      // 数据在 storage（可序列化，但控制大小）
      await this.state.storage.put(`session:${userId}`, body);
      return new Response('OK');
    }

    return new Response('Not found', { status: 404 });
  }
}
```

### 10.3 复杂事务与分布式协调

**问题**：Edge 的全球分布特性与 ACID 事务的集中式协调本质矛盾。两阶段提交、分布式锁在 Edge 环境中延迟极高且不可靠。

```
❌ 反模式：在 Edge 实现分布式事务

  try {
    await beginTransaction();
    await deductInventory();      // Edge 节点 A
    await chargePayment();        // 支付网关（外部）
    await createOrder();          // Edge 节点 B
    await commit();               // 需要跨节点协调
  } catch {
    await rollback();             // 某个节点可能已不可达
  }

  问题：
    - 跨节点网络分区导致事务悬挂
    - 补偿逻辑复杂，Saga 模式在 Edge 难以实现
    - 超时阈值难以设定（全球延迟差异大）

✅ 正确做法：
  Edge: 接收请求 → 验证 → 放入队列
  Origin: 可靠消息队列 → Saga 编排器 → 各服务
```

```typescript
// Edge 层：快速接收 + 持久化到队列
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const orderRequest = await request.json();

    // 1. 快速验证（Edge 完成）
    if (!isValidOrder(orderRequest)) {
      return Response.json({ error: 'Invalid order' }, { status: 400 });
    }

    // 2. 生成订单 ID，写入队列（非阻塞）
    const orderId = crypto.randomUUID();
    const message = {
      orderId,
      payload: orderRequest,
      traceId: request.headers.get('traceparent') || generateTraceId(),
      receivedAt: new Date().toISOString(),
      edgeNode: request.cf?.colo,
    };

    // 使用 Cloudflare Queues 或回源到 Kafka/SQS
    await env.ORDER_QUEUE.send(message);

    // 3. 立即返回 202 Accepted
    return Response.json({
      orderId,
      status: 'pending',
      checkStatus: `https://api.example.com/orders/${orderId}`,
    }, { status: 202 });
  }
};

// Origin 层：可靠处理（在核心数据中心运行）
// queue-consumer.ts
export async function processOrder(message: OrderMessage, env: Env) {
  const saga = new OrderSaga(message.orderId);

  try {
    await saga.step('reserveInventory', () => inventoryService.reserve(message.payload.items));
    await saga.step('chargePayment', () => paymentService.charge(message.payload.payment));
    await saga.step('createOrder', () => orderService.create(message));
    await saga.step('confirmInventory', () => inventoryService.confirm());

    await notifyCustomer(message.orderId, 'confirmed');
  } catch (error) {
    // Saga 自动补偿
    await saga.compensate();
    await notifyCustomer(message.orderId, 'failed');
  }
}
```

**不适合 Edge 的场景总结**：

| 场景 | 原因 | 替代方案 |
|------|------|---------|
| **大量长连接** (> 1000/DO) | DO 单实例限制 | Socket.io 集群 + Edge 认证路由 |
| **大状态持有** (> 128MB/DO) | 内存/序列化限制 | KV/R2 存储 + DO 索引 |
| **复杂事务** (2PC/Saga) | 网络分区风险 | 消息队列 + Origin Saga 编排 |
| **长时计算** (> 30s) | Workers 执行时间限制 | 提交到队列，由 Origin Worker 处理 |
| **重 IO 操作** (大量文件读写) | 无本地文件系统 | R2/S3 对象存储 |
| **精确调度** (cron 秒级) | Workers Cron 最小 1 分钟 | Origin 定时任务服务 |

> 数据来源：Cloudflare Workers Limits Docs 2025; Durable Objects Best Practices

---

## 11. 混合架构：Edge + Origin 协作模式

生产级系统几乎全是混合架构：Edge 处理边缘计算，Origin 处理重型任务，两者通过明确的协议协作。

### 11.1 架构模式图

```
┌─────────────────────────────────────────────────────────────────┐
│                        混合架构全景                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   用户层                                                          │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                        │
│   │ Web App │  │ Mobile  │  │  Bot    │                        │
│   └────┬────┘  └────┬────┘  └────┬────┘                        │
│        └─────────────┴─────────────┘                            │
│                      │                                          │
│   Edge 层（全球 300+ 节点）                                        │
│   ┌──────────────────┴──────────────────┐                      │
│   │  ┌─────────┐  ┌─────────┐  ┌────────┐ │                    │
│   │  │ CDN/Cache│  │  WAF    │  │  Auth  │ │  ← 毫秒级处理      │
│   │  └─────────┘  └─────────┘  └────────┘ │                    │
│   │  ┌─────────┐  ┌─────────┐  ┌────────┐ │                    │
│   │  │ A/B Test│  │ Bot Detect│ │ GeoRoute│ │                    │
│   │  └─────────┘  └─────────┘  └────────┘ │                    │
│   │  ┌─────────┐  ┌─────────┐            │                    │
│   │  │ ISR/SSR │  │ AI推理(<8B)│           │  ← 需要计算但轻量  │
│   │  └─────────┘  └─────────┘            │                    │
│   └──────────────────┬──────────────────┘                      │
│                      │  部分请求在此返回                          │
│                      │  部分请求继续向下                          │
│                      ↓                                          │
│   Origin 层（核心数据中心）                                        │
│   ┌─────────────────────────────────────┐                      │
│   │  ┌─────────┐  ┌─────────┐  ┌────────┐ │                    │
│   │  │ Core API│  │ Workers │  │ Message│ │  ← 业务逻辑核心    │
│   │  │ (Node.js)│  │ Queue  │  │ Queue  │ │                    │
│   │  └─────────┘  └─────────┘  └────────┘ │                    │
│   │  ┌─────────┐  ┌─────────┐  ┌────────┐ │                    │
│   │  │ Postgres│  │ Redis   │  │ Elastic│ │  ← 状态存储        │
│   │  │ (主从)  │  │ (Cluster)│  │ Search │ │                    │
│   │  └─────────┘  └─────────┘  └────────┘ │                    │
│   │  ┌─────────┐  ┌─────────┐            │                    │
│   │  │ ML训练  │  │ 大数据   │            │  ← 重型计算        │
│   │  │ (GPU集群)│  │ (Spark) │            │                    │
│   │  └─────────┘  └─────────┘            │                    │
│   └─────────────────────────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Fallback 策略

Edge 必须设计优雅降级路径，防止单点故障导致全局不可用。

```typescript
// 三级 Fallback 策略
export async function resilientFetch(
  request: Request,
  env: Env,
  options: {
    edgeHandler: () => Promise<Response>;
    originUrl: string;
    staleTtl: number; // 陈旧缓存有效期
  }
): Promise<Response> {
  const cache = await caches.open('fallback-v1');

  // Level 1: Edge 处理（首选）
  try {
    const edgeResponse = await options.edgeHandler();
    if (edgeResponse.ok || edgeResponse.status === 304) {
      // 成功：更新缓存
      ctx.waitUntil(cache.put(request, edgeResponse.clone()));
      return edgeResponse;
    }
    // Edge 返回 5xx：继续降级
    if (edgeResponse.status >= 500) throw new Error(`Edge error: ${edgeResponse.status}`);
    return edgeResponse; // 4xx 直接返回
  } catch (edgeError) {
    console.error('Edge handler failed:', edgeError);
  }

  // Level 2: Origin 回源
  try {
    const originRequest = new Request(options.originUrl, request);
    const originResponse = await fetch(originRequest, {
      cf: { cacheTtl: 60 }, // 即使 Origin 也利用 CDN 缓存
    });
    if (originResponse.ok) {
      ctx.waitUntil(cache.put(request, originResponse.clone()));
      return originResponse;
    }
    throw new Error(`Origin error: ${originResponse.status}`);
  } catch (originError) {
    console.error('Origin fetch failed:', originError);
  }

  // Level 3: 陈旧缓存（Stale-While-Revalidate）
  const stale = await cache.match(request);
  if (stale) {
    const headers = new Headers(stale.headers);
    headers.set('X-Cache-Status', 'STALE');
    headers.set('X-Fallback-Level', '3');
    return new Response(stale.body, {
      status: 200,
      headers,
      // 明确标记为陈旧，防止客户端误用
    });
  }

  // 全部失败：返回友好错误
  return new Response(
    JSON.stringify({
      error: 'Service Temporarily Unavailable',
      message: 'All fallback levels exhausted. Please retry later.',
      incidentId: crypto.randomUUID(),
    }),
    { status: 503, headers: { 'content-type': 'application/json' } }
  );
}
```

**Fallback 配置矩阵**：

| 场景 | 首选 (L1) | 降级 (L2) | 兜底 (L3) | 监控指标 |
|------|----------|----------|----------|---------|
| API 读取 | Edge + KV | Origin API | 陈旧 KV | fallback_rate |
| 页面渲染 | Edge SSR | Origin SSR | 静态预渲染 | stale_page_serve |
| AI 推理 | Edge 小模型 | Origin 大模型 | 缓存结果 | ai_fallback_rate |
| 认证 | Edge JWT | Origin 会话 | 匿名模式 | auth_degrade_count |

### 11.3 数据同步策略

Edge 与 Origin 之间的数据一致性需要明确的同步协议。

```typescript
// 写操作：Edge 接收 → Queue → Origin 处理 → 异步失效 Edge 缓存
// 读操作：Edge 优先 → 缓存未命中 → Origin 读取 → 回填 Edge 缓存

// 缓存失效模式：基于版本号的乐观同步
interface VersionedEntity {
  id: string;
  data: any;
  version: number;     // 单调递增版本号
  updatedAt: string;   // ISO 时间戳
  checksum: string;    // 数据校验和
}

// Edge 读取带版本校验
async function getVersionedEntity(
  id: string,
  env: Env
): Promise<VersionedEntity | null> {
  const cacheKey = `entity:${id}`;

  // 1. 读取本地缓存
  const cached = await env.KV.get(cacheKey);
  if (cached) {
    const entity: VersionedEntity = JSON.parse(cached);

    // 2. 快速校验：向 Origin 查询版本号（轻量）
    const versionCheck = await fetch(
      `${env.ORIGIN_API}/entities/${id}/version`,
      { cf: { cacheTtl: 0 } } // 绕过 CDN，直接到 Origin
    );
    const { version: originVersion } = await versionCheck.json();

    // 3. 版本一致：直接返回缓存
    if (entity.version === originVersion) {
      return entity;
    }

    // 4. 版本不一致：回源获取最新数据
    console.log(`Cache stale: ${id} local=${entity.version} origin=${originVersion}`);
  }

  // 回源获取
  const response = await fetch(`${env.ORIGIN_API}/entities/${id}`);
  const fresh: VersionedEntity = await response.json();

  // 回填缓存
  await env.KV.put(cacheKey, JSON.stringify(fresh), {
    expirationTtl: 3600, // 1 小时 TTL
  });

  return fresh;
}

// 写操作：通过 Queue 保证最终一致性
async function updateEntity(
  id: string,
  update: Partial<any>,
  env: Env
): Promise<{ success: boolean; version: number }> {
  // 1. 生成新版本号（Edge 可独立生成，使用时钟 + 随机数）
  const newVersion = Date.now() * 1000 + Math.floor(Math.random() * 1000);

  // 2. 乐观更新本地缓存（提供即时反馈）
  const cached = await env.KV.get(`entity:${id}`);
  if (cached) {
    const entity: VersionedEntity = JSON.parse(cached);
    const updated = { ...entity, ...update, version: newVersion };
    await env.KV.put(`entity:${id}`, JSON.stringify(updated), { expirationTtl: 3600 });
  }

  // 3. 异步提交到 Origin（通过 Queue）
  await env.SYNC_QUEUE.send({
    type: 'entity.update',
    id,
    update,
    version: newVersion,
    timestamp: new Date().toISOString(),
  });

  return { success: true, version: newVersion };
}
```

> 数据来源：Cloudflare Blog 2025, "Building Resilient Edge Applications"; Vercel Edge Runtime Architecture

---

## 12. 迁移路径：从传统到 Edge-First

### 渐进式迁移策略

| 阶段 | 目标 | 工作量 | 风险 |
|------|------|--------|------|
| **Phase 1** | 静态资源上 CDN | 1 天 | 无 |
| **Phase 2** | API 路由迁移到 Edge Functions | 1 周 | 低 |
| **Phase 3** | 数据库迁移到 Edge 数据库 | 2-4 周 | 中 |
| **Phase 4** | 有状态逻辑迁移到 Durable Objects | 2-4 周 | 中高 |
| **Phase 5** | 完全 Edge-Native 架构 | 1-3 月 | 高 |

### 兼容层：Node.js → Edge

```typescript
// 使用 @cloudflare/unenv-preset 兼容 Node.js API
import { createRequire } from 'node:module'; // ❌ Edge 不支持

// ✅ 替代方案
import { compat } from 'unenv';
const { createRequire } = compat.nodeModule;
```

---

## 13. 2026 趋势与展望

1. **WinterCG 标准化**：Winter Community Group 推动 Edge 运行时 API 标准化（`fetch`、`Request`、`Response` 统一）
2. **Edge 数据库成熟**：Turso、D1、Neon 免费额度持续扩大，成为新项目默认
3. **AI @ Edge**：LLM 推理下沉到 Edge（Cloudflare AI、Vercel AI SDK Streaming）
4. **边缘协作**：Yjs + Durable Objects 实现多人实时协作

---

## 延伸阅读

- [部署与托管平台对比矩阵](../comparison-matrices/deployment-platforms-compare)
- [数据库与存储分类](../categories/databases)
- [实时通信分类](../categories/real-time-communication)
