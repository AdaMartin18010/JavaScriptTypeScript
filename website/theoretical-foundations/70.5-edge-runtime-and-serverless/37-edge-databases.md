---
title: 'Edge 数据库与状态管理'
description: 'Turso, Cloudflare D1, PlanetScale, Fauna, CAP theorem, and edge consistency models'
---

# Edge 数据库与状态管理

> 理论深度: 高级 | 目标读者: 后端架构师、数据库工程师、SaaS 开发者

## 核心观点

1. **边缘数据库不是小型传统数据库**：它们是从第一性原理设计的分布式系统，假设计算是短暂的、网络是不稳定的、TCP 连接是无法持久维持的。

2. **SQLite 是边缘的意外赢家**：Turso 和 Cloudflare D1 将 SQLite 的单文件特性转化为架构优势——文件级复制、嵌入式副本、Git 式分支，实现了亚毫秒级本地读取和 O(1) 租户创建。

3. **一致性-延迟权衡是物理定律**：光速从纽约到东京需 ~40ms，全球强一致的写入不可能低于此物理下限。边缘架构必须按业务需求分级数据的一致性等级。

4. **连接池是 Serverless 的反模式**：边缘函数存活毫秒级，无法维持 TCP 连接池。HTTP 原生协议（libSQL HTTP、D1 binding、Fauna FQL）才是 Serverless 的正解。

5. **混合家族架构是生产现实**：SQLite 副本处理读取缓存和轻量查询，PlanetScale/Vitess 处理高并发写入和复杂关系操作，Fauna 处理需要全球 ACID 的关键协调状态。

## 关键概念

### 四大 Edge 数据库

**Turso (libSQL)**：SQLite 的现代分支，由 ChiselStrike 发起。核心扩展包括：
- **虚拟 WAL**：复制层拦截 WAL 帧并通过 HTTP 传输，解耦存储引擎与底层文件系统
- **嵌入式副本**：libSQL 客户端在边缘函数内维护本地数据库文件副本，同步后可在离线状态下执行读取
- **Git 式分支**：数据库级别的分支、合并和快照，支持安全的 schema 迁移工作流
- **Database-per-tenant**：单文件模型使租户 = 文件，创建租户是 O(1) 文件操作，复制到新区是文件拷贝

限制：单写入者瓶颈（SQLite 架构决定），不适合高频并发写入。

**Cloudflare D1**：深度集成 Workers 生态的托管 SQLite：
- 通过 `wrangler.toml` 绑定，零连接字符串，零 TLS 握手开销
- 最终一致性读取，单主异步复制到全球
- 查询 API 返回结构化 JSON，完全 serverless

限制：平台锁定（仅 Workers）；早期版本缺乏外键约束（已逐步改善）；复杂 join 性能因存储层延迟而与本地 SQLite 差异显著。

**PlanetScale**：基于 Vitess 的托管 MySQL：
- **Deploy Request 工作流**：分支生产数据库 → 应用 schema 变更 → 自动化验证 → 评审 → 部署。Vitess Online DDL 通过影子表方式实现零停机 `ALTER TABLE`
- **连接多路复用**：vtgate 代理维持到后端 MySQL 的持久连接，将数千个 ephemeral 客户端连接多路复用到少量服务器端连接
- MySQL 兼容：现有 schema、ORM、工具链可直接使用

限制：操作复杂度高（需理解 Vitess 拓扑、分片管理）；TCP 连接仍有 TLS 握手延迟。

**Fauna**：文档-关系混合模型，原生全球 ACID：
- **Calvin 风格事务协议**：通过时间戳排序、乐观并发控制和复制日志协调，实现全球序列化事务
- **FQL（Fauna Query Language）**：函数式、可组合查询语言，查询作为表达式树传输，天然防注入
- **Temporal 查询**：每个文档维护完整版本历史，可查询任意时间点的状态，无需软删除或版本字段

限制：TCU（Transaction Compute Unit）计费模型成本高且难以预测；全球协调延迟显著。

### CAP 定理在边缘的重新诠释

传统 CAP 假设静态对称网络拓扑，但边缘网络是分层、地理分散、连通性变化的。分区容错不是选择而是环境常数。有意义的权衡在于**一致性粒度**与**可用性延迟**之间：

| 一致性等级 | 保证 | 适用场景 | 代表系统 |
|-----------|------|----------|----------|
| 线性一致性 | 全局总序，所有节点看到相同顺序 | 金融交易、库存扣减 | Fauna |
| 因果一致性 | 因果相关操作有序，无关操作可乱序 | 协作编辑、评论线程 | 部分 CRDT |
| 有界陈旧性 | 数据不超过 N 秒/版本旧 | 用户配置、产品目录 | Turso 嵌入式副本 |
| 最终一致性 | 无新写入时收敛 | 分析、日志、社交动态 | Cloudflare KV, D1 |

边缘系统 increasingly 采用 **read-your-writes** 和 **bounded staleness** 作为实用中间地带：用户看到自己最近的写入，但允许其他用户的写入有短暂延迟。

### Serverless 连接危机与解决方案

从东京边缘函数连接 `us-east-1` 的 PostgreSQL：TCP 握手（1 RTT）+ TLS 握手（2–3 RTT）= **3–5 个往返 = 200–400ms 延迟**在首条查询前。数千并发函数可能耗尽数据库连接上限。

解决方案谱系：

1. **连接无化（Connectionless）**：每个查询是独立 HTTP 请求
   - Turso HTTP 接口、Cloudflare D1 binding、Fauna FQL
   - 无连接状态，无池管理，无泄漏风险
   - 事务通过单请求批量语句实现

2. **连接池代理**：PgBouncer、ProxySQL、Supavisor 维持到数据库的长连接
   - 暴露轻量协议给 Serverless 客户端
   - 代理本身必须部署在边缘附近，否则延迟优势丧失

3. **WebSocket 多路复用**：持久双向通道
   - 减少后续查询的握手开销
   - 重引入连接状态管理，函数终止时可能意外关闭

### 边缘查询缓存策略

即使使用边缘优化数据库，计算层到存储层的网络跳仍是延迟下限。

**缓存键设计**：`hash(normalizedQuerySchema, sortedParams, userId)`。必须规范化空白、排序参数、剥离跟踪参数。原始 SQL 字符串不能直接作为键（等价查询可能因空白不同而失配）。

**失效策略对比**：

| 策略 | 机制 | 优点 | 缺点 |
|------|------|------|------|
| TTL | 固定过期时间 | 简单、无协调 | 更新不可见直至到期 |
| 写穿失效 | 写入时显式删缓存 | 即时一致 | 边缘分布式下广播困难 |
| 标签失效 | 缓存项关联语义标签 | 批量清除 | 需反向索引 |
| 版本失效 | 键中嵌入版本号 | 无需推送 | 应用层复杂性 |

**SWR（Stale-While-Revalidate）**是边缘最广泛采用的 pragmatic 策略：立即返回缓存（即使略过期），同时异步刷新。HTTP `Cache-Control: stale-while-revalidate=300` 直接支持。

## 工程决策矩阵

| 场景 | 推荐方案 | 理由 | 风险 |
|------|---------|------|------|
| 读密集型 Edge API（简单写入） | **Turso** 嵌入式副本 | 本地 SQLite 零网络读取，亚毫秒级 | 单写入者瓶颈 |
| 大规模 SaaS + 频繁 schema 变更 | **PlanetScale** | Deploy request 安全变更，Vitess 分片路径清晰 | 操作复杂度高 |
| 金融/协作（全球正确性） | **Fauna** | 全球序列化事务，Temporal 查询 | 成本高，延迟大 |
| 现场/离线数据收集 | **Electric SQL** / CRDT | 本地写，恢复时自动合并 | 复杂约束难自动解决 |
| 多租户严格隔离 | **Turso** | 文件级隔离，O(1) 租户创建 | 全局 schema 变更是编排挑战 |
| 已锁定 Cloudflare 生态 | **D1** | 零配置绑定，Workers 原生 | 平台锁定，复杂查询性能 |
| 需要 MySQL 兼容 + 水平扩展 | **PlanetScale** | 熟悉 dialect， enormous 工具生态 | 需 Vitess 专业知识 |

**反模式警示：**
- 用 Turso/D1 做高频写入摄入 → 单写入者天花板无法突破
- 用 Fauna 做简单缓存 → 全球协调成本浪费
- 用 PlanetScale 做无连接池代理的边缘函数 → 连接开销主导延迟
- 用 CRDT 做有硬约束的库存管理 → 自动合并可能违反不变式（负库存）

## TypeScript 示例

### Edge HTTP 连接池

```typescript
interface PoolConfig {
  endpoint: string;
  authToken: string;
  maxConnections: number;
  requestTimeoutMs: number;
  queueTimeoutMs: number;
}

interface QueryResult<T = unknown> {
  data: T[];
  columns: string[];
  rowsAffected: number;
  latencyMs: number;
}

class EdgeConnectionPooler {
  private pool: Array<{ busy: boolean; lastUsed: number; controller: AbortController }> = [];
  private queue: Array<{
    request: { sql: string; params?: unknown[]; id: string };
    resolve: (v: QueryResult) => void;
    reject: (e: Error) => void;
    enqueuedAt: number;
  }> = [];

  constructor(private config: PoolConfig) {
    for (let i = 0; i < config.maxConnections; i++) {
      this.pool.push({ busy: false, lastUsed: Date.now(), controller: new AbortController() });
    }
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const request = { sql, params, id: crypto.randomUUID() };
    return new Promise((resolve, reject) => {
      const conn = this.pool.find(c => !c.busy);
      if (conn) {
        conn.busy = true;
        this.execute(conn, request, resolve, reject);
        return;
      }
      this.queue.push({ request, resolve, reject, enqueuedAt: Date.now() });
      setTimeout(() => {
        const idx = this.queue.findIndex(q => q.request.id === request.id);
        if (idx !== -1) {
          this.queue.splice(idx, 1);
          reject(new Error(`Queue timeout for query ${request.id}`));
        }
      }, this.config.queueTimeoutMs);
    });
  }

  private async execute(
    conn: { busy: boolean; lastUsed: number; controller: AbortController },
    req: { sql: string; params?: unknown[] },
    resolve: (v: QueryResult) => void,
    reject: (e: Error) => void
  ): Promise<void> {
    const start = Date.now();
    try {
      const res = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`,
        },
        body: JSON.stringify(req),
        signal: conn.controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      resolve({
        data: payload.results ?? [],
        columns: payload.columns ?? [],
        rowsAffected: payload.rowsAffected ?? 0,
        latencyMs: Date.now() - start,
      });
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    } finally {
      conn.busy = false;
      conn.lastUsed = Date.now();
      const next = this.queue.shift();
      if (next) {
        const c = this.pool.find(x => !x.busy);
        if (c) { c.busy = true; this.execute(c, next.request, next.resolve, next.reject); }
      }
    }
  }

  async drain(): Promise<void> {
    for (const conn of this.pool) conn.controller.abort();
    for (const item of this.queue) item.reject(new Error('Pool draining'));
    this.queue = [];
  }
}
```

### 查询缓存（SWR + 标签失效）

```typescript
interface CacheEntry<T> {
  data: T;
  createdAt: number;
  ttlSeconds: number;
  staleWhileRevalidateSeconds: number;
  tags: string[];
  version: string;
}

class EdgeQueryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private tagIndex = new Map<string, Set<string>>();

  private normalizeKey(sql: string, params: unknown[]): string {
    const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();
    const paramHash = this.hash(JSON.stringify([...params].sort()));
    return `query:${this.hash(normalized)}:${paramHash}`;
  }

  private hash(input: string): string {
    let h = 5381;
    for (let i = 0; i < input.length; i++) {
      h = ((h << 5) + h) + input.charCodeAt(i);
    }
    return (h >>> 0).toString(16);
  }

  async fetch<T>(
    sql: string, params: unknown[], tags: string[],
    fetcher: () => Promise<T>,
    ttl = 60, swr = 300
  ): Promise<{ data: T; source: 'cache' | 'stale' | 'fetch' }> {
    const key = this.normalizeKey(sql, params);
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    const now = Date.now();

    if (entry) {
      const age = (now - entry.createdAt) / 1000;
      if (age < entry.ttlSeconds) return { data: entry.data, source: 'cache' };
      if (age < entry.ttlSeconds + entry.staleWhileRevalidateSeconds) {
        this.revalidate(key, tags, fetcher, ttl, swr);
        return { data: entry.data, source: 'stale' };
      }
    }

    const data = await fetcher();
    this.set(key, data, tags, ttl, swr);
    return { data, source: 'fetch' };
  }

  private set<T>(key: string, data: T, tags: string[], ttl: number, swr: number): void {
    const entry: CacheEntry<T> = {
      data, createdAt: Date.now(), ttlSeconds: ttl,
      staleWhileRevalidateSeconds: swr, tags, version: crypto.randomUUID(),
    };
    this.store.set(key, entry as CacheEntry<unknown>);
    for (const tag of tags) {
      const set = this.tagIndex.get(tag) ?? new Set();
      set.add(key);
      this.tagIndex.set(tag, set);
    }
  }

  private async revalidate<T>(key: string, tags: string[], fetcher: () => Promise<T>, ttl: number, swr: number): Promise<void> {
    try { this.set(key, await fetcher(), tags, ttl, swr); } catch { /* stale remains */ }
  }

  invalidateTags(tags: string[]): void {
    const keys = new Set<string>();
    for (const tag of tags) {
      this.tagIndex.get(tag)?.forEach(k => keys.add(k));
      this.tagIndex.delete(tag);
    }
    for (const k of keys) this.store.delete(k);
  }
}
```

### 分布式一致性模拟器

```typescript
type ConsistencyModel = 'strong' | 'eventual' | 'causal';

interface ReplicaState {
  id: string;
  region: string;
  data: Map<string, { value: unknown; version: number; vectorClock: Map<string, number> }>;
}

class ConsistencySimulator {
  private replicas: ReplicaState[] = [];
  private origin = new Map<string, { value: unknown; version: number }>();
  private version = 0;
  private partitions = new Set<string>();

  constructor(private model: ConsistencyModel, private replicationLagMs: number, replicaCount: number) {
    for (let i = 0; i < replicaCount; i++) {
      this.replicas.push({ id: `r${i}`, region: `region-${i}`, data: new Map() });
    }
  }

  write(replicaId: string, key: string, value: unknown): number {
    this.version++;
    this.origin.set(key, { value, version: this.version });

    if (this.model === 'strong') {
      for (const r of this.replicas) {
        if (!this.partitions.has(r.id)) {
          r.data.set(key, { value, version: this.version, vectorClock: new Map() });
        }
      }
    } else {
      const replica = this.replicas.find(r => r.id === replicaId)!;
      const vc = new Map<string, number>();
      for (const r of this.replicas) vc.set(r.id, r.data.get(key)?.vectorClock.get(r.id) ?? 0);
      vc.set(replicaId, (vc.get(replicaId) ?? 0) + 1);
      replica.data.set(key, { value, version: this.version, vectorClock: vc });
      setTimeout(() => this.replicate(key), this.replicationLagMs);
    }
    return this.version;
  }

  read(replicaId: string, key: string) {
    const replica = this.replicas.find(r => r.id === replicaId)!;
    const local = replica.data.get(key);
    const originEntry = this.origin.get(key);
    if (!local || !originEntry) return { value: null, stale: false, version: 0 };
    return { value: local.value, stale: local.version < originEntry.version, version: local.version };
  }

  partition(replicaId: string): void { this.partitions.add(replicaId); }
  heal(replicaId: string): void { this.partitions.delete(replicaId); }

  private replicate(key: string): void {
    const entry = this.origin.get(key)!;
    for (const r of this.replicas) {
      if (this.partitions.has(r.id)) continue;
      r.data.set(key, { ...entry, vectorClock: new Map() });
    }
  }
}
```

## 延伸阅读

- [完整理论文档](../../70-theoretical-foundations/70.5-edge-runtime-and-serverless/37-edge-databases.md)
- [Edge KV 与缓存策略](./38-edge-kv-and-caching.md)
- [Edge Runtime 架构对比](./34-edge-runtime-architecture.md)
- [WebAssembly Edge Computing](./35-webassembly-edge.md)
- [Turso 文档](https://docs.turso.tech/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [PlanetScale Deploy Requests](https://planetscale.com/docs/concepts/deploy-requests)
- [Fauna FQL](https://docs.fauna.com/fql/current/)
- [Electric SQL](https://electric-sql.com/)
