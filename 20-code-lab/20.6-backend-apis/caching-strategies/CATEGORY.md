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

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Redis — Caching Strategies | 官方缓存模式 | [redis.io/docs/management/optimization](https://redis.io/docs/management/optimization/) |
| AWS — Caching Best Practices | 云架构缓存指南 | [docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis](https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/) |
| IETF HTTP Caching (RFC 9111) | HTTP 缓存协议标准 | [datatracker.ietf.org/doc/html/rfc9111](https://datatracker.ietf.org/doc/html/rfc9111) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*
