# 数据库性能优化

> 文件: `database-optimization.ts` | 难度: ⭐⭐⭐⭐ (高级)

---

## 优化层次

```
应用层      → 查询优化、ORM 调优、N+1 消除
├── 索引层   → B-Tree、覆盖索引、复合索引、部分索引
├── SQL层    → 执行计划分析、重写慢查询
├── 架构层   → 读写分离、分库分表、CQRS
└── 缓存层   → 查询缓存、Redis、CDN、应用级缓存
```

---

## 查询优化

### EXPLAIN 分析要点

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;
```

| 指标 | 健康值 | 危险信号 |
|------|--------|----------|
| cost | < 1000 | > 10000 |
| rows | 接近实际返回 | 扫描行数 >> 返回行数 |
| scan type | index / index-only | seq scan (大表) |
| sort | 无 | 内存/磁盘排序 |

### N+1 问题

```typescript
// ❌ N+1: 1 次查用户 + N 次查订单
const users = await db.users.findAll();
for (const user of users) {
  user.orders = await db.orders.find({ userId: user.id }); // N 次查询
}

// ✅ JOIN / 预加载
const users = await db.users.findAll({
  include: [{ model: db.orders }], // 1 次 JOIN 查询
});

// ✅ DataLoader 批处理
const ordersLoader = new DataLoader(async (userIds) => {
  const orders = await db.orders.find({ userId: { $in: userIds } });
  return userIds.map((id) => orders.filter((o) => o.userId === id));
});
```

---

## 索引设计原则

### 选择性 (Selectivity)

```
选择性 = 不同值数量 / 总行数

username: 100000 / 100000 = 1.0      ✅ 高选择性，适合索引
gender:   2 / 100000 = 0.00002        ❌ 低选择性，不适合单独索引
status:   5 / 100000 = 0.00005        ⚠️ 视查询模式决定
```

### 复合索引列顺序

```sql
-- 最优：将等值查询列放在前面，范围查询列放在后面
CREATE INDEX idx_orders ON orders (status, created_at, user_id);
-- WHERE status = 'x' AND created_at > '2024-01-01' AND user_id = ?
```

### 覆盖索引 (Index-Only Scan)

```sql
-- 索引包含查询所需的所有列，无需回表
CREATE INDEX idx_orders_cover ON orders (status, created_at, id, total);
-- SELECT id, total FROM orders WHERE status = ? ORDER BY created_at;
-- → 完全在索引内完成，不回表读取数据页
```

---

## 连接池调优

```
连接数公式:
connections = ((core_count * 2) + effective_spindle_count) * 服务实例数

PostgreSQL 示例:
- 4 核 CPU, SSD, 4 个应用实例
- 推荐: ((4 * 2) + 1) / 4 ≈ 2-3 连接/实例
- 总连接池: 10-12
```

### 关键参数

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| min | 最小连接数 | 2-5 |
| max | 最大连接数 | 10-20 (CPU 核数 × 2) |
| idleTimeout | 空闲超时 | 30s |
| acquireTimeout | 获取连接超时 | 5s |

---

## 缓存策略

### 多级缓存架构

```
用户请求
   │
   ▼
┌─────────────┐  L1: 应用内存 (1-5ms)
│ App Cache   │  → 进程内 LRU，热点数据
└──────┬──────┘
       │ miss
       ▼
┌─────────────┐  L2: Redis (5-15ms)
│ Redis       │  → 分布式缓存，跨实例共享
└──────┬──────┘
       │ miss
       ▼
┌─────────────┐  L3: 数据库 (15-100ms)
│ Database    │  → 回源查询 + 回填缓存
└─────────────┘
```

### 缓存更新策略

| 策略 | 描述 | 适用场景 |
|------|------|----------|
| Cache-Aside | 应用负责读写缓存 | 读多写少 |
| Write-Through | 写时同步更新缓存 | 强一致性 |
| Write-Behind | 异步批量写缓存 | 高吞吐 |
| TTL | 过期自动失效 | 容忍短暂不一致 |

---

## 参考资源

- [PostgreSQL 性能优化官方文档](https://www.postgresql.org/docs/current/performance-tips.html)
- [Use The Index, Luke!](https://use-the-index-luke.com/)
- [High Performance MySQL](https://www.oreilly.com/library/view/high-performance-mysql/9781492080503/)
- [Redis 缓存模式](https://redis.io/docs/manual/client-side-caching/)
