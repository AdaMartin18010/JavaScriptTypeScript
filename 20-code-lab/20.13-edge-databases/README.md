# 边缘数据库代码实验室

> **定位**：`20-code-lab/20.13-edge-databases/`
> **目标**：掌握在边缘计算环境中使用轻量级数据库的架构设计与实战编码。
>
> 边缘计算要求数据尽可能靠近用户。本模块覆盖 Cloudflare D1、Turso (libSQL)、
> Vercel Postgres、Neon Serverless 以及 KV 存储，提供可直接运行的 TypeScript 示例。

---

## 一、什么是边缘数据库？

### 1.1 边缘计算的数据挑战

传统的三层架构中，数据库位于中心区域：

```
用户 (东京) → CDN 边缘 → 源站 (us-east-1) → 数据库 (us-east-1)
                                    ↑
                              往返延迟 150-300ms
```

边缘数据库将数据层下沉到离用户更近的位置：

```
用户 (东京) → CDN 边缘 → 边缘数据库 (东京区域)
                    ↑
              延迟 < 50ms
```

这种架构对以下场景至关重要：
- **实时协作应用**：低延迟读写决定用户体验
- **全球电商**：库存查询需要快速响应
- **IoT 数据收集**：设备数据就近聚合
- **Serverless 函数**：冷启动时快速连接数据库

### 1.2 边缘数据库的分类

| 类型 | 代表产品 | 数据模型 | 一致性 | 适用场景 |
|------|---------|---------|--------|---------|
| 边缘 SQLite | Cloudflare D1, Turso | 关系型 | 强一致（单区域） | 读多写少的应用 |
| Serverless Postgres | Neon, Vercel Postgres | 关系型 | 强一致 | 需要完整 SQL 的应用 |
| KV 存储 | Cloudflare KV, Vercel KV | 键值 | 最终一致 | 会话、配置、缓存 |
| 边缘原生 | Deno KV, Fly.io SQLite | 键值/关系 | 最终一致 | 特定运行时生态 |

### 1.3 核心权衡

**延迟 vs 一致性**：
- 强一致数据库（D1、Neon）保证读取最新数据，但跨区域同步有延迟
- 最终一致存储（KV）提供极低延迟，但可能存在短暂的数据不一致窗口

**功能 vs 轻量**：
- Postgres（Neon/Vercel）提供完整 SQL、事务、复杂查询
- SQLite（D1/Turso）轻量快速，但并发写入受限
- KV 最简单，仅支持键值读写

---

## 二、Cloudflare D1 — 边缘原生 SQLite

### 2.1 架构定位

D1 是 Cloudflare 基于 SQLite 的 Serverless 边缘数据库：

- **存储引擎**：SQLite（单文件数据库）
- **部署模式**：与 Cloudflare Workers 同区域部署
- **复制策略**：快照复制到全球区域（读可就近，写回源）
- **限制**：单数据库 500MB-2GB（根据计划），单区域写入

### 2.2 最佳实践

- **批量操作**：使用 `db.batch()` 减少往返
- **参数化查询**：始终使用绑定参数防止 SQL 注入
- **索引优化**：边缘环境资源有限，查询必须命中索引
- **读写分离**：读操作可路由到最近副本，写操作需考虑延迟

### 2.3 与 Drizzle ORM 集成

D1 配合 Drizzle ORM 可实现完整的类型安全查询：

```typescript
import { drizzle } from "drizzle-orm/d1";
const orm = drizzle(db, { schema });
const users = await orm.select().from(schema.users).where(eq(schema.users.active, true));
```

---

## 三、Turso (libSQL) — 全球边缘 SQLite

### 3.1 架构定位

Turso 是 libSQL（SQLite 分支）的托管服务，专为全球分布设计：

- **嵌入式副本**：可在本地/边缘节点维护同步副本，实现亚毫秒级读取
- **远程同步**：通过 libSQL 协议与中心数据库同步
- **多语言 SDK**：TypeScript、Go、Rust、Python
- **部署灵活**：托管服务或自托管

### 3.2 嵌入式副本模式

这是 Turso 区别于 D1 的核心特性：

```typescript
const client = createClient({
  url: "file:local.db",           // 本地副本
  syncUrl: "libsql://remote-db.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await client.sync(); // 显式同步远程数据到本地
```

这种模式特别适合：
- 移动应用（本地 SQLite + 云端同步）
- 边缘函数（读取本地副本，写入远程）
- 离线优先应用

### 3.3 与 D1 的对比

| 维度 | Cloudflare D1 | Turso (libSQL) |
|------|---------------|----------------|
| 部署绑定 | Workers 生态 | 通用，任何平台 |
| 本地副本 | ❌ | ✅ 嵌入式副本 |
| 自托管 | ❌ | ✅ |
| 最大存储 | 500MB-2GB | 取决于计划 |
| ORM 支持 | Drizzle, Prisma | Drizzle, Prisma |
| 边缘延迟 | <50ms | <50ms（含本地副本 <1ms） |

---

## 四、Neon Serverless Postgres

### 4.1 架构创新

Neon 将 Postgres 存储与计算分离：

- **存储引擎**：基于 PostgreSQL 的自定义存储层（Pagederver）
- **Serverless 驱动**：通过 WebSocket 或 HTTP 连接，无需持久 TCP
- **分支特性**：可像 Git 一样分支数据库（开发/测试/生产隔离）
- **自动暂停**：无活动时暂停计算节点，节省成本

### 4.2 Serverless 驱动

传统 Postgres 驱动（如 `pg`）需要持久 TCP 连接，不适合 Serverless/边缘环境。
Neon 的 `@neondatabase/serverless` 使用 HTTP/WebSocket：

```typescript
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
const users = await sql`SELECT * FROM users WHERE active = true`;
```

### 4.3 适用场景

- 需要完整 Postgres 特性（JSONB、全文搜索、窗口函数）
- 已有 Postgres 生态迁移
- 复杂查询和报表场景
- 需要数据库分支进行开发测试

---

## 五、Vercel Postgres

### 5.1 架构定位

Vercel Postgres 由 Neon 提供技术支持，深度集成 Vercel 生态：

- **零配置**：在 Vercel Dashboard 中一键创建
- **环境变量自动注入**：`POSTGRES_URL` 等变量自动配置
- **Edge 兼容**：配合 `@vercel/postgres` 在 Edge Runtime 使用
- **Serverless 优化**：连接池自动管理

### 5.2 Edge Runtime 支持

Vercel Edge Functions 不支持传统 TCP 连接，但 `@vercel/postgres` 提供了兼容层：

```typescript
import { sql } from "@vercel/postgres";
// 在 Edge Runtime 中通过 HTTP 协议访问 Postgres
const { rows } = await sql`SELECT * FROM products LIMIT 10`;
```

---

## 六、KV 存储 — 边缘缓存与会话

### 6.1 Cloudflare KV

- **数据模型**：全局键值存储，键为字符串，值为任意二进制数据
- **一致性**：最终一致（写入后全球传播需要秒级时间）
- **适用场景**：配置、A/B 测试标志、会话状态、缓存
- **限制**：单次读取值大小最大 25MB，每日写入有上限

### 6.2 Vercel KV

基于 Upstash Redis，提供：

- **Redis 兼容 API**：`get`、`set`、`hget`、`lpush` 等
- **REST 协议**：通过 HTTP 访问，兼容 Edge Runtime
- **全球复制**：低延迟读取，适合会话和速率限制

### 6.3 KV vs 数据库选型

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 用户会话 | KV | 低延迟、TTL 支持、无需结构化查询 |
| 产品目录 | D1 / Turso | 需要关系查询、过滤、排序 |
| 配置/标志 | KV | 读取极快、全球一致足够 |
| 订单/交易 | Neon / Vercel Postgres | 强一致、事务支持、复杂查询 |
| 分析/报表 | Neon Postgres | 窗口函数、聚合、JSONB |

---

## 七、统一访问层设计

在实际项目中，建议封装统一的数据访问接口：

```typescript
// 统一接口
interface Database {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<{ rowsAffected: number }>;
}

// 根据环境选择实现
function createDatabase(): Database {
  if (process.env.D1_DATABASE) return new D1Adapter();
  if (process.env.TURSO_DATABASE_URL) return new TursoAdapter();
  if (process.env.POSTGRES_URL) return new PostgresAdapter();
  throw new Error("No database configured");
}
```

这种抽象允许：
- 本地开发使用 SQLite/Turso
- 生产环境使用 D1 或 Postgres
- 测试时注入内存实现

---

## 八、本地开发策略

边缘数据库的本地开发需要模拟云端环境：

### 8.1 D1 本地开发

```bash
# 使用 wrangler CLI 进行本地开发
npx wrangler d1 create my-db
npx wrangler d1 execute my-db --local --file=./schema.sql
npx wrangler dev --local
```

### 8.2 Turso 本地开发

```bash
# 安装 Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 创建本地数据库
turso db create local-dev --local

# 获取连接 URL 用于开发
```

### 8.3 Neon 本地开发

Neon 提供分支功能，推荐开发流程：

```bash
# 为功能开发创建数据库分支
neonctl branches create --name feature-x --parent main

# 获取分支连接字符串用于本地开发
neonctl connection-string --branch feature-x
```

---

## 九、ORM 与类型安全

### 9.1 Drizzle ORM

Drizzle 是类型安全的关系型 ORM，对边缘数据库支持最好：

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/d1";

const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("email").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

const db = drizzle(platformDB, { schema: { users } });
const result = await db.select().from(users).where(eq(users.email, "alice@example.com"));
```

### 9.2 Prisma Accelerate

对于 Postgres 数据库，Prisma + Accelerate 扩展提供边缘缓存：

```typescript
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

// 自动边缘缓存，TTL 控制
const user = await prisma.user.findUnique({
  where: { id },
  cacheStrategy: { ttl: 60, swr: 300 },
});
```

---

## 十、选型决策矩阵

| 数据库 | 延迟 | 一致性 | SQL 完整度 | 边缘原生 | 本地副本 | 推荐场景 |
|--------|------|--------|-----------|---------|---------|---------|
| Cloudflare D1 | 低 | 强一致 | SQLite 子集 | ✅ | ❌ | Workers 全栈应用 |
| Turso | 极低 | 强一致 | SQLite 扩展 | ✅ | ✅ | 全球边缘、移动应用 |
| Neon Postgres | 低 | 强一致 | 完整 Postgres | ❌ | ❌ | 复杂查询、分析 |
| Vercel Postgres | 低 | 强一致 | 完整 Postgres | ✅ | ❌ | Vercel 生态应用 |
| Cloudflare KV | 极低 | 最终一致 | N/A | ✅ | ❌ | 配置、会话、缓存 |
| Vercel KV | 极低 | 最终一致 | Redis API | ✅ | ❌ | 速率限制、排行榜 |

---

## 十一、代码文件导航

- [`01-d1-sqlite.ts`](./01-d1-sqlite.ts) — Cloudflare D1 基础操作与 Drizzle ORM 集成
- [`02-turso-libsql.ts`](./02-turso-libsql.ts) — Turso 边缘数据库与嵌入式副本
- [`03-vercel-postgres.ts`](./03-vercel-postgres.ts) — Vercel Postgres 在 Edge Runtime 的使用
- [`04-neon-serverless.ts`](./04-neon-serverless.ts) — Neon Serverless 驱动与类型安全查询
- [`05-kv-storage.ts`](./05-kv-storage.ts) — Cloudflare KV 与 Vercel KV 的键值模式

---

*本模块为 L2 代码实验室的边缘数据库专项。*
*最后更新: 2026-05-01*


---

## 附录：边缘数据库运维与监控

### 连接池配置

在 Serverless 环境中，数据库连接管理是关键挑战：

```typescript
// 连接池最佳实践
interface PoolConfig {
  min: number;           // 最小连接数（保持热连接）
  max: number;           // 最大连接数（防止耗尽）
  idleTimeoutMillis: number; // 空闲连接超时
  connectionTimeoutMillis: number; // 连接建立超时
}

// Neon Serverless 自动管理连接
// Vercel Postgres 内置连接池
// D1 无需连接池（HTTP API）
// Turso 支持连接复用
```

### 查询性能监控

```typescript
// 简单的查询性能包装器
async function timedQuery<T>(
  label: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await queryFn();
    console.log(`[${label}] ${(performance.now() - start).toFixed(2)}ms`);
    return result;
  } catch (err) {
    console.error(`[${label}] FAILED after ${(performance.now() - start).toFixed(2)}ms`);
    throw err;
  }
}
```

### 边缘数据库限制速查

| 平台 | 最大连接数 | 查询超时 | 最大结果集 | 事务支持 |
|------|-----------|---------|-----------|---------|
| Cloudflare D1 | N/A (HTTP) | 5s | 无明确限制 | ✅ |
| Turso | 1000 | 30s | 无明确限制 | ✅ |
| Neon | 无限制 (Serverless) | 无限制 | 无明确限制 | ✅ |
| Vercel Postgres | 100 (Pooling) | 无限制 | 无明确限制 | ✅ |
| Cloudflare KV | N/A (HTTP) | 5s | 25MB/value | ❌ |
| Vercel KV | 1000 | 5s | 512MB/key | ✅ (Redis事务) |

### 数据迁移策略

边缘数据库的 schema 迁移应使用专门的工具：

```bash
# D1: 使用 wrangler migrations
npx wrangler d1 migrations create my-db add_users_table
npx wrangler d1 migrations apply my-db --local
npx wrangler d1 migrations apply my-db --remote

# Turso: 使用 Turso CLI
# 原生 SQLite，可直接执行 .sql 文件
turso db shell my-db < migration.sql

# Neon: 使用 Prisma 或 Drizzle migrate
npx prisma migrate dev --name add_users
npx drizzle-kit generate
npx drizzle-kit migrate

# Vercel Postgres: 同上，兼容标准 Postgres 迁移工具
```

### 备份与恢复

| 平台 | 自动备份 | 手动导出 | 恢复方式 |
|------|---------|---------|---------|
| D1 | 快照 | `wrangler d1 export` | `wrangler d1 import` |
| Turso | 连续复制 | `turso db dump` | `turso db restore` |
| Neon | 自动 (PITR) | pg_dump | pg_restore |
| Vercel Postgres | 自动 | pg_dump | pg_restore |

---

## 十二、扩展阅读

### 官方文档

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Turso / LibSQL Documentation](https://docs.turso.tech/)
- [LibSQL Embedded Replicas](https://docs.turso.tech/features/embedded-replicas)
- [Neon Documentation](https://neon.tech/docs/)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [Cloudflare KV](https://developers.cloudflare.com/kv/)

### ORM 与工具

- [Drizzle ORM](https://orm.drizzle.team/)
- [Prisma ORM](https://www.prisma.io/)
- [Prisma Accelerate](https://www.prisma.io/docs/accelerate)
- [Kysely](https://kysely.dev/) — 类型安全 SQL 查询构建器

### 架构参考

- [Edge Database Patterns](https://blog.cloudflare.com/tag/d1/)
- [Local-First Software](https://www.inkandswitch.com/local-first/)
- [Electric SQL](https://electric-sql.com/)
- [Fly.io SQLite at the Edge](https://fly.io/blog/all-in-on-sqlite-litestream/)

---

*附录最后更新: 2026-05-01*


---

## 十二、边缘数据库设计模式

### 12.1 读副本模式（Read Replica Pattern）

在全球分布的应用中，将写操作路由到主数据库，读操作路由到边缘副本：

```typescript
// 读写分离的抽象层
interface DatabaseRouter {
  readonly reader: DatabaseClient;
  readonly writer: DatabaseClient;
}

class EdgeDatabaseRouter implements DatabaseRouter {
  constructor(
    private primaryUrl: string,    // Neon / Vercel Postgres
    private replicaUrl: string     // Turso Embedded Replica / D1
  ) {}

  get reader(): DatabaseClient {
    // 根据地理位置选择最近副本
    return new DatabaseClient(this.replicaUrl);
  }

  get writer(): DatabaseClient {
    return new DatabaseClient(this.primaryUrl);
  }
}

// 使用
const db = new EdgeDatabaseRouter(neonUrl, tursoUrl);

// 读操作 → 边缘副本（低延迟）
const users = await db.reader.query("SELECT * FROM users LIMIT 10");

// 写操作 → 主数据库（强一致）
await db.writer.execute("INSERT INTO users (email) VALUES (?)", [email]);
```

### 12.2 写后读一致性（Read-Your-Write Consistency）

边缘数据库的最终一致性可能导致用户写入后读取不到自己的数据：

```typescript
class ConsistentReadManager {
  private recentWrites = new Map<string, number>(); // userId -> timestamp

  async read<T>(
    db: DatabaseClient,
    userId: string,
    query: string,
    params: unknown[]
  ): Promise<T[]> {
    const lastWrite = this.recentWrites.get(userId);

    // 如果用户最近有写入，强制从主库读取
    if (lastWrite && Date.now() - lastWrite < 5000) {
      return this.primaryDb.query<T>(query, params);
    }

    // 否则从边缘副本读取
    return db.query<T>(query, params);
  }

  trackWrite(userId: string): void {
    this.recentWrites.set(userId, Date.now());
  }
}
```

### 12.3 边缘缓存失效模式

当数据变更时，需要使边缘缓存失效：

```typescript
// 使用 Cloudflare Workers + KV 实现缓存标签
interface CacheTagInvalidator {
  invalidate(tags: string[]): Promise<void>;
}

class TaggedCache {
  private kv: KVNamespace;

  async get<T>(key: string, tags: string[]): Promise<T | null> {
    const cached = await this.kv.get<{
      value: T;
      tags: string[];
      version: number;
    }>(key, "json");

    if (!cached) return null;

    // 验证缓存版本（通过 KV 元数据）
    for (const tag of tags) {
      const tagVersion = await this.kv.get<number>(`tag-version:${tag}`);
      if (tagVersion && tagVersion > cached.version) {
        return null; // 缓存已失效
      }
    }

    return cached.value;
  }

  async set<T>(key: string, value: T, tags: string[], ttlSeconds: number): Promise<void> {
    const maxVersion = Math.max(
      0,
      ...(await Promise.all(
        tags.map(async (tag) => {
          const v = await this.kv.get<number>(`tag-version:${tag}`);
          return v ?? 0;
        })
      ))
    );

    await this.kv.put(
      key,
      JSON.stringify({ value, tags, version: maxVersion }),
      { expirationTtl: ttlSeconds }
    );
  }

  async invalidateTag(tag: string): Promise<void> {
    const current = await this.kv.get<number>(`tag-version:${tag}`);
    await this.kv.put(`tag-version:${tag}`, String((current ?? 0) + 1));
  }
}
```

### 12.4 Saga 模式与边缘事务

在边缘环境中实现分布式事务：

```typescript
interface SagaStep {
  name: string;
  execute: () => Promise<void>;
  compensate: () => Promise<void>; // 回滚操作
}

class EdgeSaga {
  private steps: SagaStep[] = [];
  private executed: string[] = [];

  addStep(step: SagaStep): this {
    this.steps.push(step);
    return this;
  }

  async execute(): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.execute();
        this.executed.push(step.name);
      } catch (err) {
        // 回滚已执行的步骤
        for (const executedName of this.executed.reverse()) {
          const executedStep = this.steps.find((s) => s.name === executedName);
          if (executedStep) {
            try {
              await executedStep.compensate();
            } catch (compensateErr) {
              console.error(`Compensation failed for ${executedName}:`, compensateErr);
            }
          }
        }
        throw err;
      }
    }
  }
}

// 使用示例：订单处理 Saga
const orderSaga = new EdgeSaga()
  .addStep({
    name: "reserveInventory",
    execute: () => d1.execute("UPDATE inventory SET reserved = reserved + ? WHERE product_id = ?", [qty, productId]),
    compensate: () => d1.execute("UPDATE inventory SET reserved = reserved - ? WHERE product_id = ?", [qty, productId]),
  })
  .addStep({
    name: "chargePayment",
    execute: () => paymentApi.charge(cardToken, amount),
    compensate: () => paymentApi.refund(cardToken, amount),
  })
  .addStep({
    name: "createOrder",
    execute: () => d1.execute("INSERT INTO orders ...", [...]),
    compensate: () => d1.execute("DELETE FROM orders WHERE id = ?", [orderId]),
  });

await orderSaga.execute();
```

---

## 十三、生产环境 checklist

### 部署前验证

- [ ] Schema 迁移已应用到所有环境
- [ ] 索引已创建并验证查询计划
- [ ] 连接池配置已调优（max connections, timeout）
- [ ] 备份策略已配置并测试恢复
- [ ] 监控告警已设置（查询延迟、错误率、连接数）
- [ ] 速率限制已配置（防止 D1/KV 写入超限）
- [ ] 数据保留策略已定义（合规要求）
- [ ] 灾难恢复计划已文档化

### 性能优化 checklist

- [ ] 常用查询命中索引（EXPLAIN QUERY PLAN）
- [ ] N+1 查询已消除（使用 JOIN 或批量查询）
- [ ] 大结果集已分页（LIMIT/OFFSET 或游标）
- [ ] 写操作已批量化（减少往返）
- [ ] 读操作已缓存（KV / 应用层缓存）
- [ ] 冷查询已预热（定期执行保持缓存热）

---

## 十四、故障排除指南

### D1 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| `SQLITE_ERROR: no such table` | Schema 未初始化 | 在 Worker 启动时执行 `db.exec(schemaSQL)` |
| `Error: too many SQL variables` | 批量插入过大 | 分批处理，每批 < 100 条 |
| 查询超时 | 复杂查询或缺少索引 | 添加索引，简化查询，使用 LIMIT |
| `D1_ERROR: Database is locked` | 并发写入冲突 | 使用 batch() 事务，减少并发写 |

### Turso 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 同步失败 | 网络问题或令牌过期 | 检查 authToken，重试同步 |
| 本地副本过期 | 长时间未同步 | 调用 `client.sync()` 强制同步 |
| `LIBSQL_ERROR: ...` | SQL 语法不兼容 | 确认使用标准 SQLite 语法 |

### Neon 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 连接超时 | 计算节点已暂停 | 首次连接有冷启动延迟，设置合理超时 |
| `too many connections` | 连接池配置不当 | 使用 Serverless 驱动或调整 pool size |
| 查询慢 | 缺少索引 | 使用 `EXPLAIN ANALYZE` 诊断 |

---

## 十五、成本分析

### 各平台定价模型

| 平台 | 免费额度 | 付费起步 | 主要计费维度 |
|------|---------|---------|------------|
| Cloudflare D1 | 5M rows read/day, 100K writes/day | $5/月 Workers Paid | 读取行数、写入行数、存储 |
| Turso | 9GB storage, 10B rows read | $29/月 | 存储、读取、写入、同步 |
| Neon | 10GB storage, 190 compute hours | $19/月 | 存储、计算时间、数据传输 |
| Vercel Postgres | 60-day trial | $14.40/月 | 存储、计算、连接数 |
| Cloudflare KV | 100K reads/day, 1K writes/day | $0.50/月 + 用量 | 操作次数、存储、带宽 |
| Vercel KV | 250MB, 3K commands/day | $15/月 | 命令数、存储、带宽 |

### 成本优化策略

1. **读写分离**：读操作使用 D1/Turso，写操作批量化
2. **缓存层**：热点数据放入 KV，减少数据库查询
3. **连接复用**：使用连接池，避免频繁创建连接
4. **查询优化**：确保所有查询命中索引，减少全表扫描
5. **数据归档**：历史数据迁移到冷存储

---

*全文完*


---

## 十六、高级查询模式

### 16.1 地理空间查询（D1 / Turso）

SQLite 支持 R*Tree 扩展用于地理空间索引：

```typescript
// 创建地理空间索引
await client.execute(`
  CREATE VIRTUAL TABLE IF NOT EXISTS location_index USING rtree(
    id,
    minLat, maxLat,
    minLng, maxLng
  )
`);

// 插入位置数据
await client.execute(`
  INSERT INTO location_index (id, minLat, maxLat, minLng, maxLng)
  VALUES (?, ?, ?, ?, ?)
`, [placeId, lat, lat, lng, lng]);

// 查询附近地点（边界框查询）
const nearby = await client.execute({
  sql: `
    SELECT p.* FROM places p
    JOIN location_index li ON p.id = li.id
    WHERE li.minLat >= ? AND li.maxLat <= ?
      AND li.minLng >= ? AND li.maxLng <= ?
  `,
  args: [lat - 0.01, lat + 0.01, lng - 0.01, lng + 0.01],
});
```

### 16.2 时间序列数据（Neon / Vercel Postgres）

```typescript
// 创建 TimescaleDB 风格的分区表（Postgres）
await sql`
  CREATE TABLE IF NOT EXISTS metrics (
    time TIMESTAMPTZ NOT NULL,
    device_id TEXT NOT NULL,
    temperature NUMERIC,
    humidity NUMERIC,
    battery NUMERIC
  )
`;

// 创建 Hypertable（如果使用 TimescaleDB 扩展）
// SELECT create_hypertable('metrics', 'time');

// 批量插入时间序列数据
async function batchInsertMetrics(metrics: Array<{
  time: Date;
  deviceId: string;
  temperature: number;
  humidity: number;
  battery: number;
}>): Promise<void> {
  const values = metrics.map((m) =>
    sql`(${m.time}, ${m.deviceId}, ${m.temperature}, ${m.humidity}, ${m.battery})`
  );

  await sql`
    INSERT INTO metrics (time, device_id, temperature, humidity, battery)
    VALUES ${sql.join(values)}
  `;
}

// 降采样查询（每小时的平均值）
const hourlyAvg = await sql`
  SELECT
    date_trunc('hour', time) as hour,
    avg(temperature) as avg_temp,
    avg(humidity) as avg_humidity,
    count(*) as sample_count
  FROM metrics
  WHERE time > NOW() - INTERVAL '24 hours'
    AND device_id = ${deviceId}
  GROUP BY date_trunc('hour', time)
  ORDER BY hour DESC
`;
```

### 16.3 图数据查询（递归 CTE）

```typescript
// 使用递归 CTE 查询组织架构（Neon / D1 / Turso 均支持）
const orgTree = await client.execute({
  sql: `
    WITH RECURSIVE org_tree AS (
      -- 根节点
      SELECT id, name, manager_id, 0 as depth
      FROM employees
      WHERE manager_id IS NULL

      UNION ALL

      -- 递归子节点
      SELECT e.id, e.name, e.manager_id, ot.depth + 1
      FROM employees e
      JOIN org_tree ot ON e.manager_id = ot.id
    )
    SELECT * FROM org_tree ORDER BY depth, name
  `,
  args: [],
});
```

---

## 十七、数据同步与复制

### 17.1 Turso 同步策略

```typescript
// 主动同步模式
class SyncManager {
  private client: Client;
  private syncInterval: number;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(client: Client, syncIntervalMs = 30000) {
    this.client = client;
    this.syncInterval = syncIntervalMs;
  }

  startAutoSync(): void {
    this.timer = setInterval(async () => {
      try {
        await this.client.sync();
        console.log("[Sync] Completed successfully");
      } catch (err) {
        console.error("[Sync] Failed:", err);
      }
    }, this.syncInterval);
  }

  stopAutoSync(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async forceSync(): Promise<void> {
    await this.client.sync();
  }
}
```

### 17.2 跨数据库数据迁移

```typescript
// 从 Neon Postgres 迁移到 Turso SQLite
async function migratePostgresToTurso(
  neonSql: typeof sql,
  tursoClient: Client
): Promise<{ migrated: number; errors: string[] }> {
  const errors: string[] = [];
  let migrated = 0;

  // 读取源数据
  const { rows } = await neonSql`SELECT * FROM users LIMIT 1000`;

  // 批量插入目标数据库
  const batch = rows.map((row) =>
    tursoClient.execute({
      sql: `INSERT INTO users (id, email, name, created_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              email = excluded.email,
              name = excluded.name`,
      args: [row.id, row.email, row.name, row.created_at],
    })
  );

  try {
    await tursoClient.batch(batch, "write");
    migrated += rows.length;
  } catch (err) {
    errors.push(String(err));
  }

  return { migrated, errors };
}
```

---

## 十八、监控与可观测性

### 18.1 查询性能指标收集

```typescript
interface QueryMetrics {
  query: string;
  duration: number;
  rowsAffected: number;
  timestamp: number;
  error?: string;
}

class DatabaseMetrics {
  private metrics: QueryMetrics[] = [];
  private readonly maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  record(metric: QueryMetrics): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxSize) {
      this.metrics = this.metrics.slice(-this.maxSize);
    }
  }

  getSlowQueries(thresholdMs = 100): QueryMetrics[] {
    return this.metrics
      .filter((m) => m.duration > thresholdMs)
      .sort((a, b) => b.duration - a.duration);
  }

  getErrorRate(): number {
    const total = this.metrics.length;
    if (total === 0) return 0;
    const errors = this.metrics.filter((m) => m.error).length;
    return errors / total;
  }

  getStats(): { avgDuration: number; p95: number; p99: number; total: number } {
    const durations = this.metrics.map((m) => m.duration).sort((a, b) => a - b);
    const total = durations.length;
    const avg = durations.reduce((a, b) => a + b, 0) / total;
    const p95 = durations[Math.floor(total * 0.95)] ?? 0;
    const p99 = durations[Math.floor(total * 0.99)] ?? 0;
    return { avgDuration: avg, p95, p99, total };
  }
}
```

### 18.2 健康检查端点

```typescript
// Cloudflare Worker 健康检查
async function healthCheck(env: Env): Promise<Response> {
  const checks = await Promise.all([
    checkDatabase(env.DB),
    checkExternalAPI(),
  ]);

  const allHealthy = checks.every((c) => c.status === "ok");

  return Response.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  );
}

async function checkDatabase(db: D1Database): Promise<{ name: string; status: string; latency: number }> {
  const start = performance.now();
  try {
    await db.prepare("SELECT 1").first();
    return { name: "database", status: "ok", latency: performance.now() - start };
  } catch {
    return { name: "database", status: "error", latency: performance.now() - start };
  }
}
```

---

*全文完 — 2026-05-01*
