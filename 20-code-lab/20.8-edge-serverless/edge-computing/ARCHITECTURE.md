# 边缘计算 — 架构设计

## 1. 架构概述

本模块实现了边缘计算环境下的应用架构，包括边缘函数、全局状态同步、请求路由和缓存策略。展示如何在资源受限的边缘节点上构建高性能应用。架构采用"请求就近处理"的地理分布式设计，利用 Anycast 路由将用户请求引导至最近的边缘节点，结合多层缓存和状态管理策略，实现亚 50ms 的响应延迟。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         用户层 (User Layer)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Mobile     │  │   Desktop    │  │    IoT       │  │   API       │ │
│  │   Client     │  │   Browser    │  │   Device     │  │   Client    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          └─────────────────┼─────────────────┘                 │
                            │                                   │
                            ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      全球路由层 (Global Routing)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Anycast    │  │   Geo        │  │   Latency    │                   │
│  │   DNS        │  │   Router     │  │   Based LB   │                   │
│  │ (Route 53 /  │  │ (GeoIP       │  │ (Real-time   │                   │
│  │  Cloudflare) │  │  Routing)    │  │  Measurement)│                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      边缘节点层 (Edge Node Layer)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Edge       │  │   Middleware │  │   Asset      │  │   Cache     │ │
│  │   Function   │  │   Chain      │  │   Pipeline   │  │   Layer     │ │
│  │   Handler    │  │ (Auth/Geo/   │  │ (Static Opt) │  │ (Multi-tier)│ │
│  │              │  │  A/B Test)   │  │              │  │             │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          └─────────────────┼─────────────────┘                 │
                            │                                   │
                            ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      状态管理层 (State Management)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │     KV       │  │   Durable    │  │   Session    │                   │
│  │   Cache      │  │   Object     │  │   Store      │                   │
│  │ (Eventual    │  │ (Strong      │  │ (Distributed │                   │
│  │  Consistent) │  │  Consistent) │  │  Sessions)   │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      源站层 (Origin Layer)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Origin     │  │   Database   │  │   Object     │                   │
│  │   Server     │  │   (Primary)  │  │   Storage    │                   │
│  │ (Cache Miss) │  │              │  │              │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 边缘运行时

| 组件 | 职责 | 运行时限制 | 设计模式 |
|------|------|------------|----------|
| Edge Function Handler | 请求处理入口，适配 V8 Isolate 限制 | CPU: 50ms, Memory: 128MB | 无服务器函数 |
| Middleware Chain | 边缘中间件（认证、地理路由、A/B 测试）| 每层 < 5ms | 责任链 |
| Asset Pipeline | 静态资源边缘缓存和优化 | 无限制 | 编译时优化 |

### 3.2 状态管理层

| 组件 | 职责 | 一致性模型 | 延迟 |
|------|------|------------|------|
| KV Cache | 键值缓存，最终一致性 | 最终一致 | < 1ms 读 |
| Durable Object | 有状态对象，强一致性 | 强一致 | < 50ms 读写 |
| Session Store | 分布式会话管理 | 会话亲和 | < 10ms |

### 3.3 全球路由

| 组件 | 职责 | 算法 | 精度 |
|------|------|------|------|
| Geo Router | 基于用户地理位置的路由决策 | GeoIP + 最近邻 | 城市级 |
| Latency-based LB | 实时延迟感知负载均衡 | 主动探测 + EWMA | 节点级 |
| Failover Handler | 边缘节点故障时的自动切换 | 健康检查 + DNS TTL | 秒级 |

## 4. 数据流

```
User Request -> DNS (Anycast) -> Edge Node -> Middleware -> Handler -> Cache/State -> Response
                                                    |
                                              Origin (Cache Miss)
```

## 5. 边缘计算平台对比

| 平台 | 运行时 | 状态能力 | 全球节点 | 冷启动 | 定价模式 | 最佳场景 |
|------|--------|----------|----------|--------|----------|----------|
| Cloudflare Workers | V8 Isolate | KV + DO + D1 | 300+ | < 1ms | 每请求 | 通用边缘 |
| Vercel Edge | V8 Isolate | Edge Config + KV | 100+ | < 50ms | 带宽 + 请求 | Next.js |
| Deno Deploy | V8 Isolate | Deno KV | 35+ | < 10ms | 请求 + 带宽 | Deno 生态 |
| AWS Lambda@Edge | Node.js | CloudFront only | 400+ | 10-100ms | 请求 + 带宽 | AWS 集成 |
| Fastly Compute | WebAssembly | Edge Dictionary | 100+ | < 50ms | 请求 + 带宽 | 低延迟 API |
| Fly.io | Firecracker | SQLite / Postgres | 30+ | < 300ms | VM 时间 | 有状态边缘 |

## 6. 代码示例

### 6.1 边缘函数入口与中间件链

```typescript
// edge-computing/src/core/EdgeRuntime.ts
interface EdgeRequest {
  url: string;
  method: string;
  headers: Headers;
  body?: ReadableStream;
  cf?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
}

type EdgeMiddleware = (
  req: EdgeRequest,
  ctx: EdgeContext,
  next: () => Promise<Response>
) => Promise<Response>;

interface EdgeContext {
  env: Record<string, any>;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
}

class EdgeApplication {
  private middlewares: EdgeMiddleware[] = [];
  private handlers = new Map<string, (req: EdgeRequest, ctx: EdgeContext) => Promise<Response>>();

  use(mw: EdgeMiddleware): this {
    this.middlewares.push(mw);
    return this;
  }

  route(path: string, handler: (req: EdgeRequest, ctx: EdgeContext) => Promise<Response>): this {
    this.handlers.set(path, handler);
    return this;
  }

  async handle(req: EdgeRequest, ctx: EdgeContext): Promise<Response> {
    const dispatch = (i: number): Promise<Response> => {
      if (i >= this.middlewares.length) {
        const handler = this.handlers.get(req.url);
        return handler ? handler(req, ctx) : new Response('Not Found', { status: 404 });
      }
      return this.middlewares[i](req, ctx, () => dispatch(i + 1));
    };
    return dispatch(0);
  }
}

// 地理路由中间件
const geoRouter: EdgeMiddleware = async (req, ctx, next) => {
  const country = req.cf?.country ?? 'unknown';

  // GDPR 区域的数据本地化
  if (['DE', 'FR', 'IT', 'ES'].includes(country)) {
    ctx.env.dataRegion = 'eu-west';
  }

  // 地理封锁
  if (ctx.env.blockedCountries?.includes(country)) {
    return new Response('Access Denied', { status: 403 });
  }

  return next();
};

// A/B 测试中间件
const abTestMiddleware: EdgeMiddleware = async (req, ctx, next) => {
  const experiment = ctx.env.experiments?.[req.url];
  if (!experiment) return next();

  const bucket = hashString(req.headers.get('user-agent') ?? '') % 100;
  const variant = bucket < experiment.split ? 'A' : 'B';
  ctx.env.variant = variant;

  const response = await next();
  response.headers.set('X-Experiment-Variant', variant);
  return response;
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
```

### 6.2 多层缓存策略

```typescript
// edge-computing/src/cache/MultiTierCache.ts
interface CacheStrategy {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
}

class MultiTierCache {
  constructor(
    private memory: CacheStrategy,      // L1: 内存 (Node-local)
    private edge: CacheStrategy,         // L2: 边缘 KV (Region-local)
    private origin: CacheStrategy        // L3: 源站缓存
  ) {}

  async get(key: string): Promise<string | null> {
    // L1: 内存
    let value = await this.memory.get(key);
    if (value) return value;

    // L2: 边缘 KV
    value = await this.edge.get(key);
    if (value) {
      // 回填内存
      await this.memory.set(key, value, 60);
      return value;
    }

    // L3: 源站
    value = await this.origin.get(key);
    if (value) {
      // 回填边缘和内存
      await this.edge.set(key, value, 300);
      await this.memory.set(key, value, 60);
    }

    return value;
  }

  async set(key: string, value: string, options?: { memoryTtl?: number; edgeTtl?: number }): Promise<void> {
    await Promise.all([
      this.memory.set(key, value, options?.memoryTtl ?? 60),
      this.edge.set(key, value, options?.edgeTtl ?? 300),
    ]);
  }

  // 缓存失效: 级联删除
  async invalidate(key: string): Promise<void> {
    await Promise.all([
      this.memory.set(key, '', 0),
      this.edge.set(key, '', 0),
    ]);
  }
}
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 运行时 | V8 Isolate 兼容 API | 跨平台可移植 |
| 状态策略 | 读多写少用 KV，协作场景用 DO | 根据一致性需求选择 |
| 缓存策略 | stale-while-revalidate | 平衡新鲜度和性能 |

## 8. 质量属性

- **低延迟**: 全球边缘节点 < 50ms
- **高可用**: 多节点冗余，自动故障转移
- **可扩展**: 按请求自动扩展，无服务器运维

## 9. 参考链接

- [Cloudflare Workers Architecture](https://developers.cloudflare.com/workers/reference/how-workers-works/) — Workers 运行时架构
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview) — Vercel 边缘网络说明
- [Edge Computing - Cloudflare Learning](https://www.cloudflare.com/learning/serverless/what-is-edge-computing/) — 边缘计算入门
- [Fastly Edge Cloud](https://www.fastly.com/products/edge-cloud-platform) — Fastly 边缘云平台
- [State at the Edge - Fly.io](https://fly.io/docs/reference/private-networking/) — 边缘有状态服务
- [The Edge Computing Landscape](https://www.gartner.com/en/newsroom/press-releases) — Gartner 边缘计算趋势分析
