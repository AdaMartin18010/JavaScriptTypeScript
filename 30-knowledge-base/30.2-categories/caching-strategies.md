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

---

*最后更新: 2026-04-29*
