# SQLite at the Edge: A Deployment Guide

> **English Summary** of `30-knowledge-base/30.2-categories/30-edge-databases.md` and `20-code-lab/20.13-edge-databases/README.md`

---

## One-Sentence Summary

Edge databases—led by Turso, Cloudflare D1, and Deno KV—are redefining data locality by placing SQLite-compatible storage at the network edge, reducing latency from 100-300ms to 10-50ms while introducing new trade-offs around consistency, capacity, and cross-region write coordination.

---

## Key Points

- **Latency Revolution**: Moving data storage from centralized regions to edge nodes eliminates cross-region round-trips, achieving sub-50ms query latency for global user bases.
- **SQL at the Edge**: Turso (libSQL fork) and Cloudflare D1 bring full relational semantics to edge functions, unlike simpler Key-Value stores that force schema denormalization.
- **Platform Lock-In Spectrum**: D1 is tightly coupled to Cloudflare Workers; Deno KV to Deno Deploy; Turso and Neon Serverless offer platform-agnostic deployment at the cost of self-management.
- **Consistency Models Matter**: D1 and Neon provide strong consistency for transactional workloads, while Turso and Deno KV adopt eventual consistency to optimize for global replication speed.
- **Not a Silver Bullet**: Capacity limits (typically <10GB per instance), multi-region write conflicts, and complex cross-edge transactions require architectural patterns such as single-primary writes and Saga compensation workflows.

---

## Edge Database Comparison

| Dimension | SQLite (Local) | Turso (libSQL) | Cloudflare D1 | PlanetScale (Vitess) |
|-----------|---------------|----------------|---------------|----------------------|
| **Hosting Model** | Embedded / File | Edge-native (Fly.io, AWS) | Cloudflare Workers 绑定 | Global MySQL 平台 |
| **SQL Dialect** | SQLite 3 | libSQL (SQLite 超集) | SQLite 3 | MySQL 8 |
| **Consistency** | 强一致性 | 最终一致性 (默认) | 强一致性 | 强一致性 |
| **Multi-Region** | ❌ 单文件 | ✅ 全球只读副本 | ✅ Cloudflare PoP | ✅ 全球路由 |
| **Max Capacity** | ~281 TB (理论) | 10 GB / DB (免费) | 500 MB – 500 GB | TB 级 |
| **Pricing Model** | Free (自托管成本) | 按查询 + 存储 | 按请求 + 存储 | 按行读取 + 存储 |
| **Edge Latency** | 0 ms (同进程) | 10–50 ms | <50 ms | 20–100 ms |
| **ORM 兼容性** | 任意 SQLite ORM | Drizzle, Prisma (预览) | Drizzle, Prisma, Knex | Prisma, Drizzle, Rails |
| **Transactions** | FULL ACID | 单写者多读者 | ACID (单区域) | ACID + 分布式事务 |
| **Platform Lock-in** | 无 | 低 (开源 libSQL) | 高 (Workers 生态) | 中 (MySQL 协议) |
| **Auth / Connection** | 文件权限 | Token-based HTTP | Workers Binding | Connection String |
| **官方文档** | [sqlite.org](https://sqlite.org/docs.html) | [turso.tech/docs](https://docs.turso.tech/) | [developers.cloudflare.com/d1](https://developers.cloudflare.com/d1/) | [planetscale.com/docs](https://planetscale.com/docs) |

> 💡 **选型建议**: 若已深度使用 Cloudflare Workers → D1; 若需要平台无关的 SQLite 边缘复制 → Turso; 若需要 TB 级关系型负载 + MySQL 兼容性 → PlanetScale; 若仅在单节点/边缘容器内运行 → SQLite。

---

## Drizzle ORM Edge Query Example

```typescript
// schema.ts — 跨平台兼容的表定义
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  published: integer('published', { mode: 'boolean' }).default(false),
});
```

```typescript
// turso-edge.ts — Turso (libSQL) 边缘查询
import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';
import { users, posts } from './schema';
import { eq, and } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

// 边缘函数中的事务查询 (单写者模型)
export async function getPublishedPostsByUser(userEmail: string) {
  const result = await db
    .select({
      userName: users.name,
      postTitle: posts.title,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(posts, eq(users.id, posts.userId))
    .where(and(eq(users.email, userEmail), eq(posts.published, true)));

  return result;
}

// 批量插入 + 边缘缓存失效标记
export async function seedPosts(userId: number, titles: string[]) {
  const values = titles.map((t) => ({ userId, title: t, published: true }));
  return db.insert(posts).values(values).returning();
}
```

```typescript
// d1-edge.ts — Cloudflare D1 Workers 绑定
import { drizzle } from 'drizzle-orm/d1';
import { users, posts } from './schema';
import { eq } from 'drizzle-orm';

export interface Env {
  DB: D1Database; // Workers binding
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const db = drizzle(env.DB);

    const allUsers = await db.select().from(users).all();

    return Response.json({
      region: request.cf?.colo, // 边缘节点代码
      users: allUsers,
    });
  },
};
```

---

## Deno KV Edge Example

```typescript
// deno-kv-edge.ts — Deno KV 原子操作与条件写入
import { load } from 'https://deno.land/std/dotenv/mod.ts';

const kv = await Deno.openKv();

// 原子递增计数器（边缘全局状态）
export async function incrementViewCount(postId: string): Promise<number> {
  const key = ['posts', postId, 'views'];
  const res = await kv.atomic()
    .sum(key, 1n)
    .commit();

  if (!res.ok) throw new Error('Concurrent write conflict');

  const entry = await kv.get<{ value: bigint }>(key);
  return Number(entry.value?.value ?? 0n);
}

// 条件写入：仅当版本匹配时更新（乐观锁）
export async function updatePost(
  postId: string,
  newTitle: string,
  expectedVersion: string
) {
  const key = ['posts', postId];
  const current = await kv.get<{ title: string; version: string }>(key);

  const ok = await kv.atomic()
    .check(current) // 校验版本未被修改
    .set(key, { title: newTitle, version: crypto.randomUUID() })
    .commit();

  return ok;
}

// 队列 + 定时任务（Deno KV Queue）
export async function enqueueEmailJob(to: string, subject: string) {
  await kv.enqueue(
    { type: 'send-email', to, subject, createdAt: Date.now() },
    { delay: 60_000 } // 延迟 60 秒执行
  );
}
```

> 📖 Reference: [Deno KV Manual](https://docs.deno.com/deploy/kv/manual/) | [Deno KV Atomic Operations](https://docs.deno.com/deploy/kv/manual/atomic_operations/)

---

## Raw SQL Edge Patterns

```typescript
// raw-d1.ts — Cloudflare D1 原始 SQL 与批量写入
export interface Env { DB: D1Database; }

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    // 参数化查询（防 SQL 注入）
    const { results } = await env.DB.prepare(
      'SELECT * FROM posts WHERE published = ? AND user_id = ? ORDER BY created_at DESC LIMIT ?'
    )
      .bind(1, url.searchParams.get('userId'), 20)
      .all();

    // 批量插入（D1 支持参数化绑定）
    if (req.method === 'POST') {
      const body = await req.json<{ titles: string[]; userId: number }>();
      const stmt = env.DB.prepare('INSERT INTO posts (user_id, title) VALUES (?, ?)');

      // D1 批处理 API
      await env.DB.batch(
        body.titles.map((title) => stmt.bind(body.userId, title))
      );
    }

    return Response.json({ posts: results });
  },
};
```

---

## Architecture Patterns for Edge Databases

| 模式 | 适用场景 | 实现要点 |
|------|----------|----------|
| **Single-Primary Writes** | 全局读多写少 | 一个可写主库 + 全球只读边缘副本; 写操作路由至主库 |
| **Shard-by-Region** | 数据天然分区 (用户地域隔离) | 每个边缘节点持有该区域数据的 SQLite 文件; 跨区域访问通过中心总线 |
| **Event Sourcing + CQRS** | 强一致性写 + 边缘读 | 写命令追加至全局事件日志; 边缘节点投影只读视图 |
| **Saga Compensation** | 跨边缘分布式事务 | 每个局部事务定义 compensate 操作; 失败时执行回滚链 |
| **Cache-Aside with Stale-After** | 读密集型, 容忍短暂不一致 | 边缘节点本地缓存 + TTL; 回源查询 D1/Turso |

---

## Detailed Explanation

The "SQLite at the Edge" movement represents a geographic reorganization of data architecture driven by the Serverless and edge-computing paradigms. In traditional three-tier architecture, data lives in a single centralized region—US-East, EU-West—forcing users in Asia-Pacific to endure 150-300ms round-trips for every database query. Edge databases invert this topology by replicating lightweight SQLite instances to hundreds of Points of Presence (PoPs) globally, placing storage within milliseconds of end users. This is not merely a caching strategy; it is a fundamental shift in where data authority resides.

The 2026 product landscape offers three primary architectural flavors. **Turso** extends SQLite into a distributed edge-native database via its libSQL fork, providing eventual consistency and platform independence ideal for applications requiring SQL semantics without vendor lock-in. **Cloudflare D1** offers strong consistency and deep integration with Workers, making it the optimal choice for applications already committed to the Cloudflare ecosystem. **Deno KV** simplifies the model to a typed Key-Value store with atomic transactions, trading relational expressiveness for operational simplicity on Deno Deploy. **Neon Serverless** provides Postgres compatibility at the edge for teams unwilling to abandon the full SQL standard, though at higher per-query cost.

Deploying edge databases successfully requires acknowledging their structural constraints. The most significant limitation is **write coordination**: when two users on different continents simultaneously modify the same record, the database must reconcile conflicting versions. Systems like Turso handle this through single-primary architecture (one writable replica per database, many read replicas), while D1 leverages Cloudflare's distributed consensus layer. Capacity constraints also demand data lifecycle discipline—edge instances are designed for hot working sets, not archival storage, necessitating automated tiering to central warehouses. Despite these constraints, the latency and compliance benefits (data residency for GDPR) make edge databases an essential component of the 2026 full-stack toolkit, particularly for real-time collaborative applications, IoT ingestion pipelines, and privacy-sensitive consumer products.

---

## References

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Turso (libSQL) Documentation](https://docs.turso.tech/)
- [Deno KV Manual](https://docs.deno.com/deploy/kv/)
- [PlanetScale Docs](https://planetscale.com/docs)
- [Drizzle ORM — SQLite](https://orm.drizzle.team/docs/get-started-sqlite)
- [Fly.io — SQLite at the Edge](https://fly.io/docs/reference/sqlite-at-the-edge/)
- [Cloudflare Blog — D1 GA](https://blog.cloudflare.com/d1-ga/)
- [Neon Serverless Postgres](https://neon.tech/docs/introduction)
- [libSQL GitHub Repository](https://github.com/tursodatabase/libsql)
- [SQLite FTS5 Full-Text Search](https://sqlite.org/fts5.html)
- [D1 Pricing & Limits](https://developers.cloudflare.com/d1/platform/limits/)
- [Turso Edge Replication Deep Dive](https://docs.turso.tech/features/edge-replication)
- [W3C Web SQL Database (Historical Context)](https://www.w3.org/TR/webdatabase/)
- [Cloudflare Workers KV vs D1](https://developers.cloudflare.com/workers/platform/storage-options/)
- [Deno Deploy Edge Regions](https://docs.deno.com/deploy/manual/regions/)
- [Prisma Edge Compatibility](https://www.prisma.io/docs/orm/prisma-client/deployment/edge)
- [Vercel Edge Config](https://vercel.com/docs/storage/edge-config)

---

*English summary. Full Chinese documentation: `../../30-knowledge-base/30.2-categories/30-edge-databases.md`*
