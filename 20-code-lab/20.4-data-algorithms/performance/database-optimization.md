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

## 代码示例：执行计划分析与慢查询诊断

```typescript
// database-optimization.ts — 自动分析 PostgreSQL 慢查询
import { Pool } from 'pg';

interface SlowQuery {
  query: string;
  meanTimeMs: number;
  calls: number;
  rowsPerCall: number;
}

async function findSlowQueries(pool: Pool, thresholdMs = 100): Promise<SlowQuery[]> {
  const { rows } = await pool.query(`
    SELECT
      query,
      ROUND(mean_exec_time::numeric, 2) as mean_time_ms,
      calls,
      ROUND(rows::numeric / NULLIF(calls, 0), 2) as rows_per_call
    FROM pg_stat_statements
    WHERE mean_exec_time > $1
    ORDER BY mean_exec_time DESC
    LIMIT 20
  `, [thresholdMs]);

  return rows;
}

async function analyzeQueryPlan(pool: Pool, query: string, params: unknown[]) {
  const { rows } = await pool.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`, params);
  const plan = rows[0]['QUERY PLAN'][0];
  return {
    executionTimeMs: plan['Execution Time'],
    planningTimeMs: plan['Planning Time'],
    sharedHitBlocks: plan['Buffers']?.['Shared Hit'],
    sharedReadBlocks: plan['Buffers']?.['Shared Read'],
    nodes: plan['Plan'],
  };
}
```

## 代码示例：Prepared Statements 与参数化查询

```typescript
// database-optimization.ts — 预编译语句防止 SQL 注入并提升重复查询性能
import { Pool } from 'pg';

class UserRepository {
  private findByEmailStmt: Promise<ReturnType<Pool['prepare']>>;

  constructor(private pool: Pool) {
    // 预编译高频查询
    this.findByEmailStmt = pool.query(`
      PREPARE find_user_by_email (text) AS
      SELECT id, email, name, created_at FROM users WHERE email = $1
    `);
  }

  async findByEmail(email: string) {
    const { rows } = await this.pool.query('EXECUTE find_user_by_email($1)', [email]);
    return rows[0] ?? null;
  }

  // 批量插入使用 COPY 或 unnest 比多条 INSERT 快 10-100 倍
  async bulkInsert(users: Array<{ email: string; name: string }>) {
    const emails = users.map(u => u.email);
    const names = users.map(u => u.name);
    const { rows } = await this.pool.query(`
      INSERT INTO users (email, name)
      SELECT * FROM unnest($1::text[], $2::text[])
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [emails, names]);
    return rows;
  }
}
```

## 代码示例：通用连接池封装

```typescript
// database-optimization.ts — 带健康检查与重试的连接池封装
import { Pool, PoolConfig } from 'pg';

function createRobustPool(config: PoolConfig) {
  const pool = new Pool({
    ...config,
    max: config.max ?? 20,
    idleTimeoutMillis: config.idleTimeoutMillis ?? 30000,
    connectionTimeoutMillis: config.connectionTimeoutMillis ?? 5000,
    // 连接错误时自动重连
    allowExitOnIdle: false,
  });

  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
  });

  // 健康检查：定期执行轻量查询
  const healthCheckInterval = setInterval(async () => {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
    } catch (err) {
      console.error('Database health check failed:', err);
    }
  }, 30000);

  // 优雅关闭
  const originalEnd = pool.end.bind(pool);
  pool.end = async () => {
    clearInterval(healthCheckInterval);
    return originalEnd();
  };

  return pool;
}
```

## 代码示例：Cursor 流式查询大结果集

```typescript
// database-optimization.ts — 避免一次性加载百万行到内存
import { Pool } from 'pg';
import { Readable } from 'stream';

async function* queryAsStream<T>(
  pool: Pool,
  query: string,
  params: unknown[],
  batchSize = 1000
): AsyncGenerator<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cursorName = `cursor_${Date.now()}`;
    await client.query(`DECLARE ${cursorName} CURSOR FOR ${query}`, params);

    while (true) {
      const { rows } = await client.query(`FETCH ${batchSize} FROM ${cursorName}`);
      if (rows.length === 0) break;
      for (const row of rows) yield row as T;
    }

    await client.query(`CLOSE ${cursorName}`);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// 使用示例：流式导出百万级订单
for await (const order of queryAsStream<Order>(pool, 'SELECT * FROM orders WHERE status = $1', ['shipped'])) {
  csvWriter.write(order);
}
```

## 参考资源

- [PostgreSQL 性能优化官方文档](https://www.postgresql.org/docs/current/performance-tips.html)
- [Use The Index, Luke!](https://use-the-index-luke.com/)
- [High Performance MySQL](https://www.oreilly.com/library/view/high-performance-mysql/9781492080503/)
- [Redis 缓存模式](https://redis.io/docs/manual/client-side-caching/)
- [PostgreSQL EXPLAIN Documentation](https://www.postgresql.org/docs/current/sql-explain.html) — 执行计划权威参考
- [MySQL EXPLAIN Output Format](https://dev.mysql.com/doc/refman/8.4/en/explain-output.html) — MySQL 执行计划解析
- [MongoDB Indexing Strategies](https://www.mongodb.com/docs/manual/applications/indexes/) — MongoDB 索引指南
- [node-postgres Documentation](https://node-postgres.com/) — Node.js PostgreSQL 客户端
- [pg-pool Configuration](https://node-postgres.com/apis/pool) — PostgreSQL 连接池配置
- [Sequelize Query Optimization](https://sequelize.org/docs/v6/advanced-association-concepts/eager-loading/) — ORM 预加载与 N+1
- [Prisma Query Optimization](https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance) — Prisma 性能优化
- [AWS RDS Performance Insights](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights.html) — 云数据库性能分析
