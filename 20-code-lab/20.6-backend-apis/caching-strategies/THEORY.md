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

---

## 5. 总结

缓存是**性能优化的第一手段**。

**核心原则**：
1. 缓存不应该是数据一致性的依赖，而是性能优化手段
2.  always 考虑缓存失效策略
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
- [Caching at Scale](https://aws.amazon.com/caching/)

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

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-27
