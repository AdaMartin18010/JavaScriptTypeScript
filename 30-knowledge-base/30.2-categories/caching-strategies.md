# 缓存策略

> Web 应用缓存分层、缓存模式对比与选型指南。

---

## 缓存分层

| 层级 | 技术 | TTL | 说明 |
|------|------|-----|------|
| **浏览器** | Cache-Control | 用户控制 | 静态资源长期缓存 |
| **CDN** | Cloudflare/Vercel Edge | 秒–小时 | 全局边缘缓存 |
| **应用** | Redis / Memcached | 分钟–小时 | 会话、热点数据 |
| **数据库** | PostgreSQL Buffer Pool | 自动 | 查询结果缓存 |

---

## 缓存模式深度对比

| 模式 | 写入策略 | 一致性 | 复杂度 | 适用场景 |
|------|---------|--------|--------|---------|
| **Cache-Aside (Lazy Loading)** | 应用手动写缓存 | 最终一致 | ⭐ 低 | 读多写少、通用场景 |
| **Read-Through** | 缓存代理 DB 查询 | 最终一致 | ⭐⭐ 中 | ORM 集成、透读缓存 |
| **Write-Through** | 写 DB 同步写缓存 | 强一致 | ⭐⭐ 中 | 读多写多、低延迟读 |
| **Write-Behind (Write-Back)** | 先写缓存，异步批量写 DB | 弱一致 | ⭐⭐⭐ 高 | 极高吞吐、可容忍短暂丢失 |

### 模式交互图

```
Cache-Aside          Read-Through          Write-Through        Write-Behind
─────────────────────────────────────────────────────────────────────────────
App ──→ Cache        App ──→ Cache         App ──→ Cache ──→ DB   App ──→ Cache
  ←────── miss?        ←────── miss?        ↑                      │
  └─→ DB               │  └─→ DB            └←── DB 同步更新        └─→ Async Queue
     → Cache           │     → Cache                              → DB (batch)
```

---

## 代码示例：Redis Cache-Aside (Node.js / ioredis)

```ts
// lib/cache/CacheAside.ts
import Redis from 'ioredis';

export class CacheAside<T> {
  constructor(
    private redis: Redis,
    private ttlSeconds: number,
    private loader: (key: string) => Promise<T>,
    private serializer = JSON
  ) {}

  async get(key: string): Promise<T> {
    const cacheKey = `cache:${key}`;
    const cached = await this.redis.get(cacheKey);

    if (cached !== null) {
      return this.serializer.parse(cached) as T; // Cache hit
    }

    // Cache miss: load from primary source
    const value = await this.loader(key);
    await this.redis.setex(cacheKey, this.ttlSeconds, this.serializer.stringify(value));
    return value;
  }

  async invalidate(key: string): Promise<void> {
    await this.redis.del(`cache:${key}`);
  }

  async update(key: string, value: T): Promise<void> {
    // Write-through cache: update DB then refresh cache
    await this.redis.setex(`cache:${key}`, this.ttlSeconds, this.serializer.stringify(value));
  }
}

// Usage
const userCache = new CacheAside(
  new Redis({ host: 'localhost', port: 6379 }),
  300, // 5 min TTL
  async (id: string) => {
    // Primary source: PostgreSQL
    return db.query('SELECT * FROM users WHERE id = $1', [id]);
  }
);

const user = await userCache.get('user:42');
```

### 带双重检查锁定的 Cache-Aside (高并发防击穿)

```ts
async getWithLock(key: string): Promise<T> {
  const cacheKey = `cache:${key}`;
  const lockKey = `lock:${key}`;
  const cached = await this.redis.get(cacheKey);
  if (cached) return this.serializer.parse(cached);

  // Try acquire lock (Redis SETNX)
  const acquired = await this.redis.set(lockKey, '1', 'EX', 10, 'NX');
  if (!acquired) {
    // Another process is loading; wait and retry
    await new Promise((r) => setTimeout(r, 50));
    return this.getWithLock(key);
  }

  try {
    const value = await this.loader(key);
    await this.redis.setex(cacheKey, this.ttlSeconds, this.serializer.stringify(value));
    return value;
  } finally {
    await this.redis.del(lockKey);
  }
}
```

### Write-Through 缓存（强一致性）

```typescript
// lib/cache/WriteThroughCache.ts
import Redis from 'ioredis';

export class WriteThroughCache<T> {
  constructor(
    private redis: Redis,
    private db: { update: (id: string, value: T) => Promise<void> },
    private ttlSeconds: number
  ) {}

  async set(key: string, value: T): Promise<void> {
    // 1. 先更新数据库（主数据源）
    await this.db.update(key, value);
    // 2. 同步更新缓存
    await this.redis.setex(`cache:${key}`, this.ttlSeconds, JSON.stringify(value));
  }

  async get(key: string, loader: (k: string) => Promise<T>): Promise<T> {
    const cached = await this.redis.get(`cache:${key}`);
    if (cached) return JSON.parse(cached);

    const value = await loader(key);
    await this.redis.setex(`cache:${key}`, this.ttlSeconds, JSON.stringify(value));
    return value;
  }
}
```

### Write-Behind 缓存（异步批量写入）

```typescript
// lib/cache/WriteBehindCache.ts
import Redis from 'ioredis';

interface WriteOp<T> { key: string; value: T; timestamp: number }

export class WriteBehindCache<T> {
  private pending: WriteOp<T>[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(
    private redis: Redis,
    private flushIntervalMs: number = 5000,
    private batchWrite: (ops: WriteOp<T>[]) => Promise<void>
  ) {}

  async set(key: string, value: T): Promise<void> {
    // 立即写缓存
    await this.redis.setex(`cache:${key}`, 3600, JSON.stringify(value));
    // 入队异步批量写
    this.pending.push({ key, value, timestamp: Date.now() });
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => this.flush(), this.flushIntervalMs);
  }

  private async flush(): Promise<void> {
    const batch = this.pending.splice(0);
    this.flushTimer = null;
    if (batch.length === 0) return;

    try {
      await this.batchWrite(batch);
    } catch (err) {
      // 写入失败时回放到队列（或记录死信）
      this.pending.unshift(...batch);
      console.error('Write-behind flush failed:', err);
    }
  }
}
```

### HTTP Cache-Control 策略（Express / Fastify）

```typescript
// middleware/cacheControl.ts
import type { Request, Response, NextFunction } from 'express';

export function cacheControl(options: {
  maxAge?: number;
  staleWhileRevalidate?: number;
  immutable?: boolean;
  private?: boolean;
}) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const directives: string[] = [];

    if (options.private) {
      directives.push('private');
    } else {
      directives.push('public');
    }

    if (options.maxAge !== undefined) {
      directives.push(`max-age=${options.maxAge}`);
    }

    if (options.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
    }

    if (options.immutable) {
      directives.push('immutable');
    }

    res.setHeader('Cache-Control', directives.join(', '));
    next();
  };
}

// Usage
app.use('/api/products', cacheControl({ maxAge: 60, staleWhileRevalidate: 300 }));
app.use('/static/*', cacheControl({ maxAge: 31536000, immutable: true }));
```

### CDN 边缘缓存配置（Cloudflare Workers）

```typescript
// workers/cdn-cache.ts
export default {
  async fetch(request: Request): Promise<Response> {
    const cache = caches.default;
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    const modified = new Response(response.body, response);

    // 边缘缓存 5 分钟，浏览器缓存 1 分钟
    modified.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=300'
    );

    ctx.waitUntil(cache.put(request, modified.clone()));
    return modified;
  },
};
```

---

## 选型决策树

```
读多写少？
  ├─ Yes → Cache-Aside（最简单、最常用）
  └─ No（读写均衡或写多读少）
       ├─ 需要强一致？
       │    ├─ Yes → Write-Through
       │    └─ No  → Write-Behind（最高吞吐）
       └─ ORM 集成 / 不想改业务代码？
            └─ Yes → Read-Through（透明缓存）
```

---

## 权威链接

- [Redis — Caching Patterns](https://redis.io/docs/manual/patterns/)
- [AWS — Caching Best Practices](https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html)
- [Microsoft — Cache-Aside Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [Martin Kleppmann — Designing Data-Intensive Applications (Ch. 5)](https://dataintensive.net/)
- [Cloudflare — Edge Caching Strategies](https://developers.cloudflare.com/cache/)
- [MDN — HTTP Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [RFC 9111 — HTTP Caching](https://datatracker.ietf.org/doc/html/rfc9111)
- [Redis — ioredis Documentation](https://redis.github.io/ioredis/)
- [Stripe — Caching and Cache Invalidation](https://stripe.com/blog/caching-and-cache-invalidation)
- [Instagram — Memcached at Scale](https://instagram-engineering.com/memcached-at-scale-6e5c0561b77e)
- [Cloudflare — Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)
- [Vercel — Edge Config & Caching](https://vercel.com/docs/concepts/edge-network/caching)
- [HighScalability — Caching Strategies](http://highscalability.com/blog/2016/1/25/design-of-a-modern-cache.html)
- [Node.js — Performance Best Practices](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/)

---

*最后更新: 2026-04-29*
