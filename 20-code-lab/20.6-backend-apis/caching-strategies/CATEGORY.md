---
dimension: 综合
sub-dimension: Caching strategies
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Caching strategies 核心概念与工程实践。

## 包含内容

- 本模块聚焦 caching strategies 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 cache-aside.test.ts
- 📄 cache-aside.ts
- 📄 cache-consistency.test.ts
- 📄 cache-consistency.ts
- 📄 cache-patterns.test.ts
- 📄 cache-patterns.ts
- 📄 cache-protection.test.ts
- 📄 cache-protection.ts
- 📄 distributed-cache.test.ts
- 📄 distributed-cache.ts
- 📄 index.ts
- 📄 lru-cache.test.ts
- ... 等 5 个条目


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块速查

| 子模块 | 核心能力 | 关联文件 |
|--------|----------|----------|
| Cache Aside | 旁路缓存：应用层显式管理 DB ↔ Cache 读写 | `cache-aside.ts` |
| Cache Patterns | Read-Through / Write-Through / Write-Behind 模式实现 | `cache-patterns.ts` |
| LRU Cache | 内存 LRU 淘汰策略实现与复杂度验证 | `lru-cache.ts` |
| Cache Consistency | 缓存与数据库最终一致性方案 | `cache-consistency.ts` |
| Cache Protection | 缓存穿透、击穿、雪崩防护（布隆过滤器、互斥锁） | `cache-protection.ts` |
| Distributed Cache | 分布式缓存一致性协议与分片策略 | `distributed-cache.ts` |

## 代码示例：Cache-Aside + 防击穿互斥锁

```typescript
interface CacheStore<K, V> {
  get(key: K): Promise<V | undefined>;
  set(key: K, value: V, ttlMs?: number): Promise<void>;
  delete(key: K): Promise<void>;
}

class CacheAside<K, V> {
  private locks = new Map<K, Promise<V | undefined>>();

  constructor(
    private cache: CacheStore<K, V>,
    private loader: (key: K) => Promise<V | undefined>
  ) {}

  async get(key: K): Promise<V | undefined> {
    // 1. 先读缓存
    const cached = await this.cache.get(key);
    if (cached !== undefined) return cached;

    // 2. 防击穿：同一 key 只触发一次回源
    const existing = this.locks.get(key);
    if (existing) return existing;

    const loadPromise = this.loadAndStore(key).finally(() => {
      this.locks.delete(key);
    });
    this.locks.set(key, loadPromise);
    return loadPromise;
  }

  private async loadAndStore(key: K): Promise<V | undefined> {
    const value = await this.loader(key);
    if (value !== undefined) {
      await this.cache.set(key, value, 60_000); // TTL 60s
    } else {
      // 缓存空值，防止穿透
      await this.cache.set(key, value as V, 10_000);
    }
    return value;
  }

  async invalidate(key: K): Promise<void> {
    await this.cache.delete(key);
  }
}

// 使用：Redis/Memory 实现 CacheStore 接口即可接入
```

## 代码示例：Write-Behind 异步批量写入

```typescript
// cache-patterns.ts — Write-Behind 降低 DB 写压力
class WriteBehindCache<K, V> {
  private writeBuffer = new Map<K, V>();
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private cache: CacheStore<K, V>,
    private dbWriter: (batch: Map<K, V>) => Promise<void>,
    private flushIntervalMs = 5000,
    private maxBufferSize = 100
  ) {
    this.startFlushTimer();
  }

  async set(key: K, value: V, ttlMs?: number): Promise<void> {
    // 1. 立即更新缓存（读操作立即可见）
    await this.cache.set(key, value, ttlMs);
    // 2. 缓冲写操作
    this.writeBuffer.set(key, value);

    if (this.writeBuffer.size >= this.maxBufferSize) {
      await this.flush();
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.writeBuffer.size > 0) this.flush();
    }, this.flushIntervalMs);
  }

  private async flush(): Promise<void> {
    const batch = new Map(this.writeBuffer);
    this.writeBuffer.clear();
    try {
      await this.dbWriter(batch);
    } catch {
      // 回滚到缓冲区，带退避重试
      for (const [k, v] of batch) {
        if (!this.writeBuffer.has(k)) this.writeBuffer.set(k, v);
      }
    }
  }

  stop(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
  }
}
```

## 代码示例：布隆过滤器防缓存穿透

```typescript
// cache-protection.ts — 布隆过滤器 + Redis
class BloomFilter {
  private bits: Uint8Array;
  private size: number;
  private hashCount: number;

  constructor(expectedItems: number, falsePositiveRate = 0.01) {
    this.size = Math.ceil(-(expectedItems * Math.log(falsePositiveRate)) / (Math.LN2 ** 2));
    this.hashCount = Math.ceil((this.size / expectedItems) * Math.LN2);
    this.bits = new Uint8Array(Math.ceil(this.size / 8));
  }

  add(item: string): void {
    for (let i = 0; i < this.hashCount; i++) {
      const idx = this.hash(item, i) % this.size;
      this.bits[Math.floor(idx / 8)] |= 1 << (idx % 8);
    }
  }

  mightContain(item: string): boolean {
    for (let i = 0; i < this.hashCount; i++) {
      const idx = this.hash(item, i) % this.size;
      if ((this.bits[Math.floor(idx / 8)] & (1 << (idx % 8))) === 0) {
        return false;
      }
    }
    return true;
  }

  private hash(item: string, seed: number): number {
    let h = seed;
    for (let i = 0; i < item.length; i++) {
      h = (h * 31 + item.charCodeAt(i)) >>> 0;
    }
    return h % this.size;
  }
}

// 使用：写入 Redis 前先检查布隆过滤器，不存在则直接返回 null
async function getWithBloomFilter(
  key: string,
  bloom: BloomFilter,
  cache: CacheStore<string, unknown>,
  db: (k: string) => Promise<unknown>
): Promise<unknown> {
  if (!bloom.mightContain(key)) return null; // 一定不存在
  return cache.get(key) ?? db(key);
}
```

## 代码示例：Redis 分布式缓存分片

```typescript
// distributed-cache.ts — 一致性哈希分片
class ConsistentHashRing {
  private ring = new Map<number, string>();
  private nodes: string[] = [];
  private replicas = 150;

  addNode(node: string): void {
    this.nodes.push(node);
    for (let i = 0; i < this.replicas; i++) {
      const hash = this.hash(`${node}:${i}`);
      this.ring.set(hash, node);
    }
  }

  removeNode(node: string): void {
    this.nodes = this.nodes.filter((n) => n !== node);
    for (let i = 0; i < this.replicas; i++) {
      this.ring.delete(this.hash(`${node}:${i}`));
    }
  }

  getNode(key: string): string | undefined {
    if (this.ring.size === 0) return undefined;
    const hash = this.hash(key);
    const sorted = Array.from(this.ring.keys()).sort((a, b) => a - b);
    const target = sorted.find((h) => h >= hash) ?? sorted[0];
    return this.ring.get(target);
  }

  private hash(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    return h;
  }
}
```

## 代码示例：缓存雪崩防护 — 随机 TTL + 互斥锁

```typescript
// cache-avalanche-protection.ts — 防止热点 key 同时过期导致雪崩
class AvalancheProtectedCache<K, V> {
  constructor(
    private cache: CacheStore<K, V>,
    private loader: (key: K) => Promise<V>,
    private baseTtlMs = 60_000,
    private jitterPercent = 0.25 // TTL 随机浮动 ±25%
  ) {}

  async get(key: K): Promise<V> {
    const cached = await this.cache.get(key);
    if (cached !== undefined) return cached;

    // 互斥锁：同一时刻只有一个请求回源
    const lockKey = `lock:${String(key)}`;
    const acquired = await this.cache.set(lockKey, true as unknown as V, 5000);
    if (!acquired) {
      // 等待其他请求回填缓存后重试
      await new Promise((r) => setTimeout(r, 100));
      const retry = await this.cache.get(key);
      if (retry !== undefined) return retry;
      throw new Error('Cache lock timeout');
    }

    try {
      const value = await this.loader(key);
      const jitter = this.baseTtlMs * this.jitterPercent * (Math.random() * 2 - 1);
      const ttl = Math.max(1000, Math.floor(this.baseTtlMs + jitter));
      await this.cache.set(key, value, ttl);
      return value;
    } finally {
      await this.cache.delete(lockKey as unknown as K);
    }
  }
}
```

## 代码示例：Read-Through 缓存装饰器

```typescript
// read-through.ts — 透明缓存装饰器模式
function withReadThroughCache<K, V>(
  fn: (key: K) => Promise<V>,
  cache: CacheStore<K, V>,
  ttlMs: number
): (key: K) => Promise<V> {
  return async (key: K): Promise<V> => {
    const cached = await cache.get(key);
    if (cached !== undefined) return cached;
    const value = await fn(key);
    await cache.set(key, value, ttlMs);
    return value;
  };
}

// 使用：透明地为任意异步函数加上缓存层
const getUserCached = withReadThroughCache(
  (id: string) => db.users.findById(id),
  redisCache,
  30_000
);
```

## 代码示例：缓存与数据库最终一致性（延迟双删）

```typescript
// cache-consistency.ts — 延迟双删模式保证最终一致性
async function updateWithDelayDoubleDelete<K, V>(
  key: K,
  updater: () => Promise<V>,
  cache: CacheStore<K, V>,
  delayMs = 500
): Promise<V> {
  // 1. 先删缓存
  await cache.delete(key);

  // 2. 更新数据库
  const value = await updater();

  // 3. 延迟再次删除缓存（覆盖并发读导致的旧值回填）
  setTimeout(() => cache.delete(key), delayMs);

  return value;
}
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Redis — Caching Strategies | 官方缓存模式 | [redis.io/docs/management/optimization](https://redis.io/docs/management/optimization/) |
| AWS — Caching Best Practices | 云架构缓存指南 | [docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis](https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/) |
| IETF HTTP Caching (RFC 9111) | HTTP 缓存协议标准 | [datatracker.ietf.org/doc/html/rfc9111](https://datatracker.ietf.org/doc/html/rfc9111) |
| Memcached — Architecture | 分布式内存缓存 | [github.com/memcached/memcached/wiki](https://github.com/memcached/memcached/wiki) |
| DragonflyDB — Redis Alternative | 现代多线程 KV 存储 | [dragonflydb.io/docs](https://www.dragonflydb.io/docs) |
| KeyDB — Multithreaded Redis Fork | 高性能 Redis 分支 | [docs.keydb.dev](https://docs.keydb.dev/) |
| Cache-Aside Pattern | Microsoft Azure 架构中心 | [learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside) |
| Caching at Netflix | 技术博客 | [netflixtechblog.com/tagged/caching](https://netflixtechblog.com/tagged/caching) |
| MDN — Cache API | Service Worker 缓存 | [developer.mozilla.org/en-US/docs/Web/API/Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache) |
| web.dev — HTTP Cache | 浏览器缓存最佳实践 | [web.dev/articles/http-cache](https://web.dev/articles/http-cache) |
| Redis University — Caching Data | 免费课程 | [university.redis.io](https://university.redis.io/) |
| Martin Kleppmann — Designing Data-Intensive Applications | 经典书籍 | [dataintensive.net](https://dataintensive.net/) — 第 11 章缓存深度分析 |
| AWS — ElastiCache Best Practices | 托管缓存指南 | [docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/BestPractices.html](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/BestPractices.html) |
| Google Cloud — Memorystore Best Practices | 托管 Redis | [cloud.google.com/memorystore/docs/redis/best-practices](https://cloud.google.com/memorystore/docs/redis/best-practices) |
| System Design Primer — Caching | 开源系统设计 | [github.com/donnemartin/system-design-primer#caching](https://github.com/donnemartin/system-design-primer#caching) |
| Redis — Key Eviction Policies | 内存淘汰策略 | [redis.io/docs/reference/eviction/](https://redis.io/docs/reference/eviction/) |

---

## 进阶缓存模式

### 多级缓存架构（L1 / L2）

```typescript
// multi-level-cache.ts
interface CacheStore<K, V> {
  get(key: K): Promise<V | undefined>;
  set(key: K, value: V, ttlMs?: number): Promise<void>;
  delete(key: K): Promise<void>;
}

class MultiLevelCache<K, V> {
  constructor(private l1: CacheStore<K, V>, private l2: CacheStore<K, V>) {}
  async get(key: K): Promise<V | undefined> {
    const v1 = await this.l1.get(key);
    if (v1 !== undefined) return v1;
    const v2 = await this.l2.get(key);
    if (v2 !== undefined) { await this.l1.set(key, v2, 10_000); return v2; }
    return undefined;
  }
  async set(key: K, value: V, ttlMs?: number): Promise<void> {
    await Promise.all([this.l1.set(key, value, ttlMs), this.l2.set(key, value, ttlMs)]);
  }
  async delete(key: K): Promise<void> {
    await Promise.all([this.l1.delete(key), this.l2.delete(key)]);
  }
}
```

> L1 通常为内存（如 Node.js Map + TTL），L2 为 Redis / Memcached。

---

## 更多权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| IETF RFC 9111 — HTTP Caching | 协议标准 | <https://datatracker.ietf.org/doc/html/rfc9111> |
| Martin Kleppmann — Designing Data-Intensive Applications | 书籍 | <https://dataintensive.net/> |
| System Design Primer — Caching | 开源 | <https://github.com/donnemartin/system-design-primer#caching> |
| web.dev — HTTP Cache | 最佳实践 | <https://web.dev/articles/http-cache> |

*最后更新: 2026-04-30*
