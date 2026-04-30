# 缓存策略深度理论：从本地缓存到分布式缓存

> **目标读者**：后端工程师、性能工程师、关注系统扩展性的架构师
> **关联文档**：``30-knowledge-base/30.2-categories/caching-strategies.md`` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 3,200 字

---

## 1. 缓存的核心价值

### 1.1 为什么需要缓存

缓存的本质是**用空间换时间**，通过存储昂贵计算的结果来加速后续访问。

| 场景 | 无缓存延迟 | 有缓存延迟 | 加速比 |
|------|-----------|-----------|--------|
| 数据库查询 | 10-100ms | 0.1ms (Redis) | 100-1000x |
| API 响应 | 500ms | 5ms (CDN) | 100x |
| 复杂计算 | 10s | 1ms (内存) | 10000x |

### 1.2 缓存层次架构

```
L1: 浏览器缓存 (Cache-Control)
  ↓
L2: CDN 边缘缓存 (Cloudflare / Akamai)
  ↓
L3: 反向代理缓存 (Nginx / Varnish)
  ↓
L4: 应用本地缓存 (LRU / LFU)
  ↓
L5: 分布式缓存 (Redis / Memcached)
  ↓
L6: 数据库 (最终数据源)
```

---

## 2. 缓存模式

### 2.1 读写策略

| 模式 | 读流程 | 写流程 | 一致性 | 复杂度 |
|------|--------|--------|--------|--------|
| **Cache-Aside** | 先读缓存，miss 读 DB 写入缓存 | 写 DB，删缓存 | 中 | 低 |
| **Read-Through** | 读缓存，miss 由缓存层读 DB | 写 DB | 中 | 中 |
| **Write-Through** | 读缓存 | 同时写缓存和 DB | 高 | 中 |
| **Write-Behind** | 读缓存 | 写缓存，异步写 DB | 低 | 高 |

**推荐**：大多数场景使用 **Cache-Aside**（简单、灵活）。

### 2.2 缓存穿透、击穿、雪崩

| 问题 | 现象 | 解决方案 |
|------|------|---------|
| **穿透** | 查询不存在的数据，每次都穿透到 DB | 布隆过滤器 / 缓存空值 |
| **击穿** | 热点 key 过期，大量请求打到 DB | 互斥锁 / 逻辑过期 |
| **雪崩** | 大量 key 同时过期，DB 压力骤增 | 随机过期时间 / 预热 |

---

## 3. 分布式缓存

### 3.1 Redis 核心数据结构

| 结构 | 适用场景 | 时间复杂度 |
|------|---------|-----------|
| **String** | 简单 KV、计数器 | O(1) |
| **Hash** | 对象存储 | O(1) |
| **List** | 队列、时间线 | O(1) 头尾 |
| **Set** | 标签、关系 | O(1) |
| **Sorted Set** | 排行榜、延迟队列 | O(logN) |
| **Bitmap** | 签到、在线状态 | O(1) |
| **Stream** | 消息队列 | O(1) |
| **JSON** | 文档存储 | O(1) 访问 |

### 3.2 缓存一致性策略

```
方案 1: 延迟双删
  写 DB → 删缓存 → 延迟 500ms → 再删缓存

方案 2: 监听 Binlog
  DB Binlog → Canal/Debezium → 异步删缓存

方案 3: 分布式锁
  写操作加锁 → 写 DB → 更新缓存 → 释放锁
```

---

## 4. 性能优化

### 4.1 缓存预热

```typescript
// 应用启动时加载热点数据
async function warmupCache() {
  const hotProducts = await db.products.findHot(100);
  for (const product of hotProducts) {
    await redis.setex(`product:${product.id}`, 3600, JSON.stringify(product));
  }
}
```

### 4.2 大 Key 治理

| 阈值 | 影响 | 解决方案 |
|------|------|---------|
| > 1MB | 阻塞 Redis 单线程 | 拆分 Hash / 压缩 |
| > 10MB | 网络传输慢 | 走对象存储 |
| > 100MB | 内存占用高 | 重新设计数据结构 |

### 4.3 布隆过滤器防穿透

```typescript
import { BloomFilter } from 'bloom-filters';

// 初始化布隆过滤器（预计 100 万元素，误报率 0.1%）
const filter = BloomFilter.create(1_000_000, 0.001);

// 预热：将所有有效商品 ID 加入过滤器
const allProductIds = await db.products.getAllIds();
allProductIds.forEach(id => filter.add(id));

async function getProduct(id: string) {
  // 快速拒绝不存在的数据
  if (!filter.has(id)) {
    return null; // 避免缓存穿透
  }

  const cached = await redis.get(`product:${id}`);
  if (cached) return JSON.parse(cached);

  const product = await db.products.findById(id);
  if (product) {
    await redis.setex(`product:${id}`, 3600, JSON.stringify(product));
  } else {
    // 缓存空值（短过期时间）
    await redis.setex(`product:${id}:null`, 60, '1');
  }
  return product;
}
```

### 4.4 Redis Pipeline 批量操作

```typescript
// 使用 Pipeline 减少 RTT，提升批量读取性能
async function batchGetProducts(ids: string[]) {
  const pipeline = redis.pipeline();
  ids.forEach(id => pipeline.get(`product:${id}`));
  const results = await pipeline.exec();

  const missingIds: string[] = [];
  const products = results.map((result, index) => {
    const [err, data] = result;
    if (data) return JSON.parse(data);
    missingIds.push(ids[index]);
    return null;
  });

  // 批量回填缺失数据
  if (missingIds.length > 0) {
    const fromDb = await db.products.findByIds(missingIds);
    const refillPipeline = redis.pipeline();
    fromDb.forEach(p => {
      refillPipeline.setex(`product:${p.id}`, 3600, JSON.stringify(p));
    });
    await refillPipeline.exec();
  }

  return products;
}
```

### 4.5 Stale-While-Revalidate 策略

```typescript
// 允许在缓存过期后的短时间内返回旧数据，同时异步刷新
async function getWithSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
  staleSeconds: number
): Promise<T> {
  const data = await redis.get(key);
  const ttl = await redis.ttl(key);

  if (data && ttl >= -staleSeconds) {
    const parsed = JSON.parse(data);
    // 如果在 stale 窗口内，异步刷新
    if (ttl < 0) {
      fetcher().then(fresh => {
        redis.setex(key, ttlSeconds, JSON.stringify(fresh));
      });
    }
    return parsed;
  }

  // 缓存未命中或完全过期，同步获取
  const fresh = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(fresh));
  return fresh;
}
```

### 4.6 本地 LRU 缓存实现

在应用层使用内存 LRU 缓存可避免高频访问 Redis，降低网络 RTT：

```typescript
// lru-local.ts
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private capacity: number) {}

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    // 移动到最新
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// 实际项目中可直接使用 node-lru-cache
import { LRUCache as NodeLRU } from 'lru-cache';
const cache = new NodeLRU<string, any>({ max: 500, ttl: 1000 * 60 * 5 });
```

### 4.7 缓存雪崩与 Stampede 防护

热点 key 过期时的大量并发回源（Cache Stampede）可通过**互斥锁**或**概率提前刷新**缓解：

```typescript
// 互斥锁防止 stampede
async function getWithLock<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const lockKey = `lock:${key}`;
  const lock = await redis.set(lockKey, '1', 'EX', 10, 'NX');
  if (!lock) {
    // 未获取锁，短暂等待后重试读缓存
    await new Promise(r => setTimeout(r, 50));
    return getWithLock(key, fetcher, ttl);
  }

  try {
    const fresh = await fetcher();
    await redis.setex(key, ttl, JSON.stringify(fresh));
    return fresh;
  } finally {
    await redis.del(lockKey);
  }
}
```

### 4.8 Write-Through 缓存实现

```typescript
// write-through.ts — 写操作同步更新缓存与数据库
class WriteThroughCache<T> {
  constructor(
    private redis: any,
    private db: { upsert: (id: string, data: T) => Promise<void> },
    private ttl: number
  ) {}

  async set(id: string, data: T): Promise<void> {
    // 先写 DB，再写缓存（或并行）
    await this.db.upsert(id, data);
    await this.redis.setex(`entity:${id}`, this.ttl, JSON.stringify(data));
  }

  async get(id: string, fetcher: () => Promise<T | null>): Promise<T | null> {
    const cached = await this.redis.get(`entity:${id}`);
    if (cached) return JSON.parse(cached);

    const data = await fetcher();
    if (data) {
      await this.redis.setex(`entity:${id}`, this.ttl, JSON.stringify(data));
    }
    return data;
  }
}
```

---

## 5. HTTP 缓存控制

```typescript
// http-cache-headers.ts — 精确控制浏览器与 CDN 缓存行为

function setCacheHeaders(
  res: Response,
  options: {
    maxAge?: number;      // 秒
    staleWhileRevalidate?: number;
    immutable?: boolean;
    private?: boolean;
    noStore?: boolean;
  }
): Response {
  const headers = new Headers(res.headers);

  if (options.noStore) {
    headers.set('Cache-Control', 'no-store');
    return new Response(res.body, { ...res, headers });
  }

  const directives: string[] = [];
  if (options.private) directives.push('private');
  else directives.push('public');

  if (options.maxAge !== undefined) directives.push(`max-age=${options.maxAge}`);
  if (options.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }
  if (options.immutable) directives.push('immutable');

  headers.set('Cache-Control', directives.join(', '));
  return new Response(res.body, { ...res, headers });
}

// 使用示例
// 静态资源：长期缓存
setCacheHeaders(response, { maxAge: 31536000, immutable: true });

// API 响应：短时间缓存 + stale-while-revalidate
setCacheHeaders(response, { maxAge: 60, staleWhileRevalidate: 300 });

// 用户敏感数据：不缓存
setCacheHeaders(response, { private: true, maxAge: 0 });
```

---

## 6. 代码示例：CDN 缓存键自定义与边缘逻辑

```typescript
// cdn-cache-key.ts — 基于请求特征构造缓存键
function generateCacheKey(req: Request): string {
  const url = new URL(req.url);
  const parts = [url.pathname];

  // 按 Accept-Language 分区缓存
  const lang = req.headers.get('accept-language')?.split(',')[0] ?? 'en';
  parts.push(`lang=${lang}`);

  // 按设备类型分区（通过 User-Agent 推断）
  const ua = req.headers.get('user-agent') ?? '';
  const device = /Mobile/.test(ua) ? 'mobile' : 'desktop';
  parts.push(`device=${device}`);

  return parts.join('|');
}

// Cloudflare Workers 边缘缓存示例
export default {
  async fetch(req: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const cacheKey = generateCacheKey(req);
    const cache = caches.default;

    // 尝试读取边缘缓存
    let response = await cache.match(new Request(cacheKey));
    if (response) {
      response = new Response(response.body, {
        ...response,
        headers: { ...Object.fromEntries(response.headers), 'X-Cache': 'HIT' },
      });
      return response;
    }

    // 回源
    response = await fetch(req);
    ctx.waitUntil(cache.put(new Request(cacheKey), response.clone()));
    return response;
  },
};
```

---

## 7. 总结

缓存是**性能优化的第一手段**。

**核心原则**：

1. 缓存不应该是数据一致性的依赖，而是性能优化手段
2. always 考虑缓存失效策略
3. 监控缓存命中率（目标 > 90%）

**选型建议**：

- 本地缓存：lru-cache / quick-lru
- 分布式缓存：Redis（首选）/ Valkey（Redis 分支）
- CDN：Cloudflare / Vercel Edge

---

## 参考资源

- [Redis 官方文档](https://redis.io/documentation)
- [Valkey](https://valkey.io/) — Redis 的开源替代
- [Redis 设计与实现](http://redisbook.com/)
- [Caching at Scale — AWS](https://aws.amazon.com/caching/)
- [Cache Patterns — Martin Fowler](https://martinfowler.com/articles/data-cache-sync.html) — 缓存同步策略权威解读
- [IETF RFC 7234 — HTTP Caching](https://datatracker.ietf.org/doc/html/rfc7234) — HTTP 缓存协议标准
- [IETF RFC 9111 — HTTP Caching (RFC 9111)](https://datatracker.ietf.org/doc/html/rfc9111) — HTTP 缓存最新标准
- [Caching Strategies — Microsoft Azure](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside) — Azure 架构中心 Cache-Aside 模式
- [Redis Pipeline Documentation](https://redis.io/docs/manual/pipelining/) — Redis 官方 Pipeline 指南
- [Bloom Filters by Example](https://llimllib.github.io/bloomfilter-tutorial/) — 布隆过滤器原理与实现
- [Redis Eviction Policies](https://redis.io/docs/manual/eviction/) — Redis 官方内存淘汰策略
- [web.dev HTTP Cache](https://web.dev/articles/http-cache) — Google Web 开发者权威指南
- [Cloudflare Caching](https://www.cloudflare.com/learning/cdn/what-is-caching/) — CDN 边缘缓存深度解析
- [node-lru-cache](https://github.com/isaacs/node-lru-cache) — Node.js 应用最广泛的 LRU 缓存库
- [High Scalability Caching Articles](http://highscalability.com/) — 大规模系统缓存架构案例集
- [W3C — Edge Architecture Specification](https://www.w3.org/TR/edge-arch/) — 边缘架构规范
- [MDN — Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) — Cache-Control 头部完整参考
- [MDN — ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) — 条件请求与缓存验证
- [Redis University — Caching at Scale](https://university.redis.com/) — Redis 官方缓存课程
- [Google — Page Speed Insights](https://developers.google.com/speed/docs/insights/LeverageBrowserCaching) — 浏览器缓存优化建议
- [Fastly — Cache Control Tutorial](https://developer.fastly.com/learning/concepts/cache-freshness/) — Fastly 缓存新鲜度权威指南
- [Cloudflare Workers — Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/) — Cloudflare Workers 缓存 API 文档
- [Varnish — HTTP Cache Tutorial](https://varnish-cache.org/docs/trunk/users-guide/increasing-your-hitrate.html) — Varnish 提升命中率指南
- [AWS — ElastiCache Best Practices](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/BestPractices.html) — AWS ElastiCache 最佳实践
- [Google — Cache Optimization Patterns](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching) — Google 缓存优化模式
- [IETF — RFC 5861 — stale-while-revalidate](https://datatracker.ietf.org/doc/html/rfc5861) — stale-while-revalidate 扩展标准
- [Memcached — Official Documentation](https://memcached.org/about) — Memcached 官方文档
- [Caffeine — High Performance Java Cache](https://github.com/ben-manes/caffeine) — 高性能 Java 缓存库（设计参考）
- [W3C — Service Workers — Caching Strategies](https://w3c.github.io/ServiceWorker/#cache-addAll) — Service Worker 缓存策略规范
- [MDN — Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) — Service Worker 离线缓存 API

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `cache-aside.ts`
- `cache-consistency.ts`
- `cache-patterns.ts`
- `cache-protection.ts`
- `distributed-cache.ts`
- `index.ts`
- `lru-cache.ts`
- `ttl-cache.ts`
- `write-strategies.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括：

1. **Cache-Aside Pattern**：应用层显式管理缓存与存储，灵活性最高，适用于大多数业务场景。
2. **Write-Through / Write-Behind**：在强一致性与写性能之间权衡，金融交易偏好前者，analytics 场景偏好后者。
3. **Lease-Based Consistency**：通过互斥锁或租约（lease）防止并发回源与脏写，是分布式缓存的核心并发控制手段。

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | `20.6-backend-apis/rest-api-design`（理解 HTTP 语义与状态码对缓存控制的影响） |
| 后续进阶 | `20.8-edge-serverless`（边缘缓存与 CDN 策略的进一步深化） |

---

> 📅 理论深化更新：2026-04-27
