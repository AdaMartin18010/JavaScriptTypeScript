# 边缘优先模式

> **定位**：`20-code-lab/20.8-edge-serverless/edge-computing/edge-first-patterns`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决边缘计算架构的设计模式问题。通过边缘优先策略降低延迟、提升可用性并优化带宽。

### 1.2 形式化基础

边缘优先架构满足以下约束：

- **延迟约束**: `T_response < T_budget`（通常 < 50ms）
- **一致性约束**: 边缘副本满足最终一致性 `∃t: ∀replica, data_t ≡ data_master`
- **可用性约束**: 单边缘节点故障不影响全局服务 `P(available) ≥ 99.99%`

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 边缘渲染 | 在 CDN 节点执行 SSR 的策略 | edge-ssr.ts |
| 地理路由 | 基于用户位置的最近节点调度 | geo-routing.ts |
| 边缘缓存失效 | 主动/被动缓存刷新策略 | cache-invalidation.ts |
| 局部一致性 | 边缘副本的最终一致性模型 | local-consistency.ts |

---

## 二、设计原理

### 2.1 为什么存在

传统中心化架构难以满足全球用户的低延迟需求。边缘优先模式将计算和数据推向离用户最近的节点，是新一代 Web 应用的核心架构思想。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 边缘渲染 | 低延迟 | 计算受限 | 全球用户 |
| 中心渲染 | 算力充沛 | 网络延迟 | 区域用户 |

### 2.3 与相关技术的对比

| 维度 | 边缘优先 | 云原生 | 传统单体 |
|------|---------|--------|---------|
| 延迟 | < 50ms（边缘） | 20-100ms（区域） | 100-500ms（中心） |
| 状态管理 | 局部/最终一致 | 集中强一致 | 集中强一致 |
| 可扩展性 | 全球自动分发 | 水平扩展集群 | 垂直扩展 |
| 冷启动 | 毫秒级 | 秒级 | 分钟级 |
| 运维复杂度 | 中（多节点管理） | 高（K8s 栈） | 低（单节点） |
| 安全边界 | 分布式零信任 | 边界防火墙 | 边界防火墙 |

---

## 三、实践映射

### 3.1 地理感知边缘路由

```typescript
// edge-first-patterns/geo-routing.ts — 地理感知边缘路由
interface GeoRouteConfig {
  defaultOrigin: string;
  regions: Record<string, { origin: string; weight: number }[]>;
}

class GeoRouter {
  constructor(private config: GeoRouteConfig) {}

  resolve(cfCountry: string | null): string {
    const region = this.config.regions[cfCountry ?? 'default'];
    if (!region) return this.config.defaultOrigin;

    // 加权随机选择
    const total = region.reduce((s, r) => s + r.weight, 0);
    let pick = Math.random() * total;
    for (const r of region) {
      pick -= r.weight;
      if (pick <= 0) return r.origin;
    }
    return region[0].origin;
  }
}

// 使用示例
const router = new GeoRouter({
  defaultOrigin: 'https://us-east.example.com',
  regions: {
    CN: [{ origin: 'https://cn.example.com', weight: 100 }],
    DE: [
      { origin: 'https://eu-central.example.com', weight: 70 },
      { origin: 'https://eu-west.example.com', weight: 30 },
    ],
  },
});
```

### 3.2 边缘缓存失效策略

```typescript
// edge-first-patterns/cache-invalidation.ts
interface CacheTag {
  tag: string;
  ttlSeconds: number;
}

class EdgeCacheManager {
  async purgeByTag(tag: string, zoneId: string, apiToken: string): Promise<void> {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags: [tag] }),
    });
    if (!res.ok) throw new Error(`Purge failed: ${await res.text()}`);
  }

  // 基于版本号的被动失效（immutable URL 模式）
  versionedAsset(path: string, version: string): string {
    return `${path}?v=${version}`;
  }
}

// Cloudflare Worker 中的缓存控制
export default {
  async fetch(request: Request): Promise<Response> {
    const cache = caches.default;
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetchOrigin(request);
    const cloned = response.clone();

    // 仅缓存 GET 请求且状态码 200
    if (request.method === 'GET' && response.status === 200) {
      cloned.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
      await cache.put(request, cloned);
    }
    return response;
  },
};
```

### 3.3 边缘 SSR（流式渲染）

```typescript
// edge-first-patterns/edge-ssr.ts — Cloudflare Worker 流式 SSR
import { renderToReadableStream } from 'react-dom/server';
import App from './App';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // 流式渲染 React 应用
    const stream = await renderToReadableStream(<App url={url} />, {
      bootstrapScripts: ['/client.js'],
      onError(error: unknown) {
        console.error('SSR Error:', error);
      },
    });

    await stream.allReady;

    return new Response(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  },
};
```

### 3.4 局部一致性模式（读写分离）

```typescript
// edge-first-patterns/local-consistency.ts
interface ReplicatedStore<T> {
  readLocal(key: string): Promise<T | null>;
  writeGlobal(key: string, value: T): Promise<void>;
  reconcile(): Promise<void>;
}

class EdgeKVStore implements ReplicatedStore<string> {
  constructor(
    private local: KVNamespace,   // Cloudflare KV（边缘读取）
    private global: DurableObjectStub // Durable Object（强一致写入）
  ) {}

  async readLocal(key: string): Promise<string | null> {
    return this.local.get(key, { cacheTtl: 60 });
  }

  async writeGlobal(key: string, value: string): Promise<void> {
    await this.global.fetch('http://do/write', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  }

  // 定期从全局同步到边缘 KV
  async reconcile(): Promise<void> {
    // 通过 Durable Object 的 alarm 机制触发
  }
}
```

### 3.5 Stale-While-Revalidate 边缘模式

```typescript
// stale-while-revalidate.ts — 缓存优先 + 后台更新
export default {
  async fetch(request: Request, env: { CACHE: Cache }): Promise<Response> {
    const cache = caches.default;
    const cacheKey = new Request(request.url, { method: 'GET' });
    const cached = await cache.match(cacheKey);

    // 如果缓存未过期，直接返回
    if (cached && !isStale(cached)) {
      return cached;
    }

    // 如果缓存已过期但存在，返回 stale 版本并在后台更新
    if (cached) {
      // 不 await，让请求在后台完成
      fetchAndCache(request, cache, cacheKey);
      return cached;
    }

    // 无缓存，同步获取
    return fetchAndCache(request, cache, cacheKey);
  },
};

function isStale(response: Response, maxAgeSec = 60): boolean {
  const date = response.headers.get('date');
  if (!date) return true;
  return Date.now() - new Date(date).getTime() > maxAgeSec * 1000;
}

async function fetchAndCache(request: Request, cache: Cache, cacheKey: Request): Promise<Response> {
  const response = await fetch(request);
  const clone = response.clone();
  clone.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
  await cache.put(cacheKey, clone);
  return response;
}
```

### 3.6 边缘速率限制器（基于 KV）

```typescript
// edge-rate-limiter.ts — 分布式令牌桶（Cloudflare Workers）
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  kv: KVNamespace
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
  const data = await kv.getWithMetadata<{ count: number; window: number }>(key);

  if (!data.value || data.metadata?.window !== windowStart) {
    // 新窗口
    await kv.put(key, String(1), {
      expirationTtl: Math.ceil(config.windowMs / 1000),
      metadata: { count: 1, window: windowStart },
    });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime: windowStart + config.windowMs };
  }

  const count = parseInt(data.value, 10);
  if (count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: windowStart + config.windowMs };
  }

  await kv.put(key, String(count + 1), {
    expirationTtl: Math.ceil(config.windowMs / 1000),
    metadata: { count: count + 1, window: windowStart },
  });

  return {
    allowed: true,
    remaining: config.maxRequests - count - 1,
    resetTime: windowStart + config.windowMs,
  };
}
```

### 3.7 边缘 A/B 测试与特性标志

```typescript
// edge-feature-flags.ts — 基于请求头的边缘特性开关
interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  targeting?: {
    countries?: string[];
    userAgents?: RegExp[];
  };
}

class EdgeFeatureFlags {
  constructor(private flags: FeatureFlag[]) {}

  isEnabled(flagName: string, request: Request): boolean {
    const flag = this.flags.find((f) => f.name === flagName);
    if (!flag || !flag.enabled) return false;

    // 国家 targeting
    const country = request.headers.get('CF-IPCountry');
    if (flag.targeting?.countries && country && !flag.targeting.countries.includes(country)) {
      return false;
    }

    // 基于用户 ID 的一致性哈希分桶
    const userId = request.headers.get('x-user-id') || request.headers.get('cf-connecting-ip');
    if (!userId) return false;

    const bucket = this.hashToBucket(userId, flagName);
    return bucket < flag.rolloutPercentage;
  }

  private hashToBucket(input: string, salt: string): number {
    let hash = 0;
    const combined = input + salt;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % 100;
  }
}
```

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 边缘优先模式 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.8 常见误区

| 误区 | 正确理解 |
|------|---------|
| 边缘计算取代云计算 | 边缘与中心是协同关系，各有分工 |
| 边缘函数无状态限制 | 边缘函数通常有 CPU/内存/时长限制 |

### 3.9 扩展阅读

- [Cloudflare Patterns](https://developers.cloudflare.com/workers/reference/how-workers-works/)
- `20.8-edge-serverless/`

---

## 四、权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| Cloudflare Workers Patterns | 官方文档 | [developers.cloudflare.com/workers/reference/how-workers-works](https://developers.cloudflare.com/workers/reference/how-workers-works/) |
| Web Vitals & Edge Performance | 指南 | [web.dev/edge-performance](https://web.dev/edge-performance/) |
| The Edge Computing Landscape | 论文 | [arxiv.org/abs/2008.11266](https://arxiv.org/abs/2008.11266) |
| Fastly Edge Architecture | 官方文档 | [developer.fastly.com/learning/concepts/design-considerations](https://developer.fastly.com/learning/concepts/design-considerations/) |
| Vercel Edge Network | 官方文档 | [vercel.com/docs/edge-network/overview](https://vercel.com/docs/edge-network/overview) |
| Akamai Edge Platform | 官方文档 | [developer.akamai.com/edge](https://developer.akamai.com/) |
| Cloudflare Cache API | 官方文档 | [developers.cloudflare.com/workers/runtime-apis/cache](https://developers.cloudflare.com/workers/runtime-apis/cache/) |
| React Streaming SSR | 官方文档 | [react.dev/reference/react-dom/server/renderToReadableStream](https://react.dev/reference/react-dom/server/renderToReadableStream) |
| WinterCG Runtime APIs | 规范 | [wintercg.org/work](https://wintercg.org/work) |
| RFC 5861 — HTTP Cache-Control Extensions | RFC | [datatracker.ietf.org/doc/html/rfc5861](https://datatracker.ietf.org/doc/html/rfc5861) |
| Deno Deploy — Edge Runtime | 官方文档 | [deno.com/deploy/docs](https://deno.com/deploy/docs) |
| AWS Lambda@Edge | 官方文档 | [docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html) |
| Netlify Edge Functions | 官方文档 | [docs.netlify.com/edge-functions/overview](https://docs.netlify.com/edge-functions/overview/) |
| Fly.io — Edge Applications | 官方文档 | [fly.io/docs](https://fly.io/docs/) |
| Cloudflare Durable Objects | 官方文档 | [developers.cloudflare.com/durable-objects](https://developers.cloudflare.com/durable-objects/) |
| Hono — Lightweight Edge Framework | 源码 | [hono.dev](https://hono.dev) |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
