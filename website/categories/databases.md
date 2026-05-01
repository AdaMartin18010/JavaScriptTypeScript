---
title: 数据库与存储
description: JavaScript/TypeScript 生态数据库与存储完全指南，覆盖 PostgreSQL、Redis、MongoDB、向量数据库、Edge 数据库与 2026 选型趋势
---

# 数据库与存储

> 最后更新: 2026-05-01 | 状态: 🚀 高速演进中 | 对齐: Edge-First 架构、AI 应用爆发

---

## 📊 整体概览

2025-2026 年，JS/TS 生态的数据库领域呈现三大趋势：**Edge 数据库崛起**（Turso/D1/Neon）、**向量数据库爆发**（AI Embedding 存储需求）、**Serverless 数据库成熟**（Supabase/Convex）。传统 ORM 之外，类型安全的查询构建器（Drizzle、Prisma）正在重新定义数据库开发体验。

| 趋势 | 2024 | 2026 |
|------|------|------|
| **部署位置** | 中心化（AWS RDS） | Edge（D1/Turso/Neon） |
| **查询方式** | SQL + ORM | 类型安全查询构建器 |
| **AI 支持** | 手动集成 | 原生向量搜索 |
| **实时同步** | WebSocket 自建 | 原生实时订阅 |

---

## 🐘 关系型数据库

### PostgreSQL 生态

| 工具/驱动 | Stars | 周下载量 | TS 支持 | 特点 |
|-----------|-------|---------|--------|------|
| **pg** | 12,000+ | 500万+ | ✅ @types/pg | 原生 Node.js 驱动 |
| **postgres.js** | 6,000+ | 80万+ | ✅ 原生 | 现代、高性能 |
| **Drizzle ORM** | 24,000+ | 150万+ | ✅ 原生 | 类型安全、SQL-like |
| **Prisma** | 40,000+ | 300万+ | ✅ 原生 | 全功能、迁移强大 |
| **Kysely** | 12,000+ | 40万+ | ✅ 原生 | 类型安全查询构建器 |

### MySQL 生态

| 工具 | Stars | TS 支持 | 特点 |
|------|-------|--------|------|
| **mysql2** | 8,000+ | ✅ | 性能优于 mysql |
| **PlanetScale** | - | ✅ | Serverless MySQL + 分支 |

---

## 📦 NoSQL 数据库

### Redis

| 驱动 | Stars | 特点 |
|------|-------|------|
| **ioredis** | 13,000+ | 集群、Sentinel 支持 |
| **redis** (官方) | 8,000+ | 现代 API、Promise 优先 |

### MongoDB

| 工具 | Stars | 特点 |
|------|-------|------|
| **mongoose** | 26,000+ | Schema 定义、中间件 |
| **Prisma** | 40,000+ | 统一 ORM，支持 Mongo |
| **MongoDB Node Driver** | 10,000+ | 官方驱动 |

---

## 🔷 向量数据库

AI 应用（RAG、语义搜索）推动向量数据库成为 2026 年最热领域之一。

| 数据库 |  Stars | TS 支持 | 部署方式 | 特点 |
|--------|-------|--------|---------|------|
| **pgvector** | 14,000+ | ✅ | PostgreSQL 扩展 | 与现有 PG 集成 |
| **Pinecone** | - | ✅ | 托管 SaaS | 专为向量设计 |
| **Weaviate** | 11,000+ | ✅ | 自托管/SaaS | GraphQL 接口 |
| **Chroma** | 15,000+ | ✅ | 自托管 | 轻量、易用 |
| **Qdrant** | 20,000+ | ✅ | 自托管/SaaS | Rust 编写、高性能 |

```typescript
// pgvector + Drizzle 实现语义搜索
import { vector } from 'drizzle-orm/pg-core';
import { cosineDistance } from 'drizzle-orm';

const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
});

// 执行相似度搜索
const similar = await db
  .select({
    content: documents.content,
    distance: cosineDistance(documents.embedding, queryVector),
  })
  .from(documents)
  .orderBy(cosineDistance(documents.embedding, queryVector))
  .limit(5);
```

---

## 🌐 Edge 数据库

Edge 数据库是 2025-2026 年最革命性的趋势，专为 Cloudflare Workers、Vercel Edge 等无服务器边缘环境设计。

| 数据库 |  Stars | 技术 | 部署 | 特点 |
|--------|-------|------|------|------|
| **Turso (libSQL)** | 12,000+ | SQLite 分支 | Edge/本地 | Fly.io 出品，全球复制 |
| **Cloudflare D1** | - | SQLite | Cloudflare | Workers 原生集成 |
| **Neon** | 14,000+ | PostgreSQL | Serverless | 存储计算分离、分支 |
| **Supabase** | 78,000+ | PostgreSQL | 托管/自托管 | 开源 Firebase 替代 |
| **Convex** | 8,000+ | 专有 | Serverless | 实时同步、类型安全 |

### Edge 数据库选型决策

```
部署平台?
├─ Cloudflare Workers → D1（原生）或 Turso（全球复制）
├─ Vercel Edge → Neon（PG 兼容）或 Turso
├─ 多平台 → Supabase（PG + 实时）或 Turso
└─ 本地优先 → SQLite + libSQL/Turso
```

---

## 🗄️ 全栈/Serverless 数据库

| 数据库 | Stars | 核心特性 | 适用场景 |
|--------|-------|---------|---------|
| **Supabase** | 78,000+ | PG + 实时订阅 + Auth + 存储 | 全栈应用 |
| **Firebase** | - | 实时 + Auth + 托管 | 移动/Web 快速开发 |
| **Convex** | 8,000+ | 实时同步 + 类型安全 | 协作应用 |
| **Xata** | - | PG + AI 搜索 + 分支 | 内容/搜索应用 |

---

## 🔍 搜索数据库

| 数据库 | Stars | 特点 | 适用场景 |
|--------|-------|------|---------|
| **Typesense** | 22,000+ | 轻量、容错、即时搜索 | 电商搜索 |
| **Meilisearch** | 48,000+ | 开发者友好、 typo 容忍 | 站内搜索 |
| **Elasticsearch** | 72,000+ | 功能最全面 | 企业级日志/搜索 |

---

## ⏱️ 时序数据库

时序数据库（Time-Series Database, TSDB）专为带时间戳的数据优化，在 IoT、监控、金融、可观测性场景中是核心基础设施。

### TimescaleDB

TimescaleDB 是 PostgreSQL 的扩展，将 PG 转变为完整的时序数据库，完全兼容 PG 生态。

| 特性 | 说明 |
|------|------|
| **Hypertable** | 自动按时间分区，对应用透明 |
| **连续聚合** | 实时物化视图，自动刷新 |
| **压缩** | 列式压缩，节省 90%+ 存储 |
| **retention** | 自动数据降采样和过期 |
| **TS 支持** | 通过 `pg` / `postgres.js` / Drizzle 直接访问 |

```typescript
// TimescaleDB + Drizzle 定义 Hypertable
import { sql } from 'drizzle-orm';
import { pgTable, serial, timestamp, doublePrecision } from 'drizzle-orm/pg-core';

const metrics = pgTable('metrics', {
  time: timestamp('time', { withTimezone: true }).notNull(),
  deviceId: serial('device_id').notNull(),
  temperature: doublePrecision('temperature').notNull(),
  humidity: doublePrecision('humidity').notNull(),
});

// 创建 Hypertable（在迁移中执行）
// SELECT create_hypertable('metrics', 'time');

// 时序查询：最近 1 小时按 5 分钟聚合
const result = await db
  .select({
    bucket: sql`time_bucket('5 minutes', ${metrics.time})`,
    avgTemp: sql`avg(${metrics.temperature})`,
    maxTemp: sql`max(${metrics.temperature})`,
  })
  .from(metrics)
  .where(sql`${metrics.time} > now() - interval '1 hour'`)
  .groupBy(sql`time_bucket('5 minutes', ${metrics.time})`)
  .orderBy(sql`time_bucket('5 minutes', ${metrics.time})`);
```

### InfluxDB

InfluxDB 是专为时序数据设计的原生数据库，提供专门的查询语言 InfluxQL 和 Flux。

| 版本 | 特点 | JS/TS 支持 |
|------|------|-----------|
| **InfluxDB 3.0** | Apache Arrow + Parquet 核心，向量化查询 | `@influxdata/influxdb-client` |
| **InfluxDB 1.x/2.x** | TSM 存储引擎，成熟稳定 | 同上 |

```typescript
// InfluxDB 2.x + 官方 JS 客户端
import { InfluxDB, Point } from '@influxdata/influxdb-client';

const influxDB = new InfluxDB({ url: 'http://localhost:8086', token });
const writeApi = influxDB.getWriteApi(org, bucket);

const point = new Point('temperature')
  .tag('device', 'sensor-001')
  .floatField('value', 23.5)
  .timestamp(new Date());

writeApi.writePoint(point);
await writeApi.close();

// 查询
const queryApi = influxDB.getQueryApi(org);
const fluxQuery = `
  from(bucket: "${bucket}")
    |> range(start: -1h)
    |> filter(fn: (r) => r._measurement == "temperature")
    |> aggregateWindow(every: 5m, fn: mean)
`;
```

### 时序数据库选型

| 场景 | 推荐 | 理由 |
|------|------|------|
| 已有 PG 基础设施 | **TimescaleDB** | 零迁移成本，SQL 原生 |
| 独立时序平台 | **InfluxDB 3.0** | 极高写入吞吐，列式分析 |
| 云托管 | **Timescale Cloud / InfluxDB Cloud** | 免运维，自动扩缩容 |

---

## 🕸️ 图数据库

图数据库以节点和边的形式存储数据，在社交网络、推荐系统、知识图谱、欺诈检测等场景中具有天然优势。

### Neo4j

Neo4j 是最成熟的属性图数据库，拥有活跃的 JS 生态。

| 特性 | 说明 |
|------|------|
| **Cypher 查询语言** | 声明式图查询，直观表达关系遍历 |
| **Bolt 协议** | 二进制高效通信协议 |
| **OGM** | `neode` / `@neo4j/graphql` 提供对象图映射 |
| **AuraDB** | 全托管云版本 |

```typescript
// Neo4j 官方 JS 驱动
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
);

const session = driver.session();

// 创建节点和关系
await session.run(`
  CREATE (u:User {id: $userId, name: $name})
  CREATE (p:Post {id: $postId, title: $title})
  CREATE (u)-[:AUTHORED]->(p)
`, { userId: '1', name: 'Alice', postId: '101', title: 'Hello Graph' });

// 查询：找出用户的朋友的朋友（2 度关系）
const result = await session.run(`
  MATCH (u:User {id: $userId})-[:FRIENDS_WITH*1..2]->(fof:User)
  RETURN DISTINCT fof.name, fof.id
`, { userId: '1' });

// TypeScript 类型安全封装
interface UserNode {
  identity: number;
  labels: string[];
  properties: { id: string; name: string };
}
```

### Dgraph

Dgraph 是原生分布式图数据库，采用 GraphQL+- 查询语言，适合超大规模图数据。

| 特性 | 说明 |
|------|------|
| **水平扩展** | 原生分布式，自动分片 |
| **GraphQL+-** | 类 GraphQL 查询语法 |
| **Dgo / Dgraph-js** | 官方 JS gRPC 客户端 |
| **Raft 共识** | 内置高可用 |

```typescript
// Dgraph JS gRPC 客户端
import { DgraphClient, DgraphClientStub } from 'dgraph-js';

const stub = new DgraphClientStub('localhost:9080');
const client = new DgraphClient(stub);

// 使用 GraphQL+- 查询
const query = `
  query {
    users(func: type(User)) @filter(eq(name, "Alice")) {
      name
      friends {
        name
      }
    }
  }
`;

const response = await client.newTxn().query(query);
const users = response.getJson();
```

### 图数据库在 JS 生态中的集成模式

```
应用层 (Node.js/TS)
  ├─ 业务逻辑
  ├─ Neo4j Driver / Dgraph-js
  └─ 图数据库 (Neo4j/Dgraph)

常见架构：
- 主数据在 PostgreSQL，图关系在 Neo4j（CQRS 模式）
- 实时推荐：Neo4j 处理图遍历，Redis 缓存热点结果
- 知识图谱：Dgraph 存储实体关系，Elasticsearch 全文检索
```

---

## ⚡ 缓存层方案

缓存是高性能系统的核心组件。除了 Redis，2025-2026 年出现了多个值得关注的 Redis 替代方案。

### Redis 生态

| 驱动 | Stars | 特点 |
|------|-------|------|
| **ioredis** | 13,000+ | 集群、Sentinel、Pipeline 支持 |
| **redis** (官方) | 8,000+ | 现代 API、Promise 优先、Redis Stack |

### Dragonfly

Dragonfly 是 Redis 和 Memcached 的现代化替代，单节点可达 4M ops/sec，支持多线程。

| 特性 | 说明 |
|------|------|
| **完全兼容 Redis 协议** | 零代码迁移成本 |
| **单节点高性能** | 多线程架构，突破单核限制 |
| **快照 + AOF** | 持久化兼容 |
| **集群模式** | Dragonfly Cluster 实现水平扩展 |

```typescript
// Dragonfly 完全兼容 Redis 协议，直接使用 redis 客户端
import { createClient } from 'redis';

const client = createClient({ url: 'redis://dragonfly:6379' });
await client.connect();

// 所有 Redis 命令直接可用
await client.set('key', 'value', { EX: 3600 });
const value = await client.get('key');

// Dragonfly 特有：单节点支持多 DB 无限制
// 支持复杂数据结构：Stream、JSON、Search（Redis Stack API）
```

### KeyDB

KeyDB 是 Redis 的多线程分支，由 Snapchat 维护，完全兼容 Redis。

| 特性 | 说明 |
|------|------|
| **多线程** | 真正的多线程处理，非 Redis 的单线程 |
| **MVCC** | 无锁读取，提高并发 |
| **FLASH 后端** | 支持 SSD 作为存储后端 |
| **Active Replication** | 多主复制 |

### 缓存方案对比

| 方案 | 性能 | 兼容性 | 适用场景 |
|------|------|--------|---------|
| **Redis** | 高 | 标准 | 通用缓存，生态最成熟 |
| **Dragonfly** | 极高 | 完全兼容 Redis | 高吞吐单节点，降本替代 |
| **KeyDB** | 极高 | 完全兼容 Redis | 多线程场景，Active Replication |
| **Valkey** | 高 | 兼容 Redis | AWS/Google 主导的开源替代 |

### Node.js 缓存架构最佳实践

```typescript
// 多级缓存架构：L1 (内存) → L2 (Redis/Dragonfly)
import { LRUCache } from 'lru-cache';
import { createClient } from 'redis';

const localCache = new LRUCache<string, unknown>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 分钟
});

const remoteCache = createClient({ url: process.env.REDIS_URL });
await remoteCache.connect();

async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl = 3600): Promise<T> {
  // L1 本地缓存
  const local = localCache.get(key) as T | undefined;
  if (local !== undefined) return local;

  // L2 远程缓存
  const remote = await remoteCache.get(key);
  if (remote) {
    const parsed = JSON.parse(remote) as T;
    localCache.set(key, parsed);
    return parsed;
  }

  // 回源
  const data = await fetcher();
  localCache.set(key, data);
  await remoteCache.setEx(key, ttl, JSON.stringify(data));
  return data;
}
```

---

## 🛠️ ORM vs 查询构建器 vs 原始 SQL

JS/TS 生态中存在三种主要的数据库访问模式，各有明确的适用边界。

### 模式对比

| 维度 | 原始 SQL | 查询构建器 (Kysely/Drizzle) | ORM (Prisma/TypeORM) |
|------|---------|---------------------------|---------------------|
| **类型安全** | ❌ 手动维护 | ✅ 编译时类型检查 | ✅ 自动生成模型类型 |
| **学习曲线** | 低（需懂 SQL） | 中（SQL-like API） | 高（DSL + 概念） |
| **性能控制** | 完全可控 | 高（生成预期 SQL） | 中（查询优化器隐藏细节） |
| **迁移支持** | 手动 / 外部工具 | Drizzle Kit / 手动 | Prisma Migrate / 内置 |
| **关系查询** | 手动 JOIN | 流畅的链式 API | 自动预加载 / 懒加载 |
| **代码量** | 多（重复模板） | 中 | 少（生成代码） |
| **运行时开销** | 无 | 极小 | 较大（查询引擎） |

### 原始 SQL 场景

```typescript
// postgres.js - 极简高性能
import postgres from 'postgres';
const sql = postgres({ host, port, database, username, password });

// 标签模板字面量，自动参数化防注入
const users = await sql<User[]>`
  SELECT id, name, email
  FROM users
  WHERE active = ${true}
  ORDER BY created_at DESC
  LIMIT ${10}
`;

// 事务
await sql.begin(async (sql) => {
  const [user] = await sql`INSERT INTO users ... RETURNING id`;
  await sql`INSERT INTO profiles (user_id) VALUES (${user.id})`;
});
```

**适用场景**：超复杂报表查询、极致性能优化、已有 DBA 团队维护 SQL。

### 查询构建器场景

```typescript
// Kysely - 类型安全查询构建器
import { Kysely, PostgresDialect } from 'kysely';

interface Database {
  users: UserTable;
  posts: PostTable;
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool: new Pool({ connectionString }) }),
});

// 类型安全的链式查询
const result = await db
  .selectFrom('users')
  .innerJoin('posts', 'posts.author_id', 'users.id')
  .select(['users.id', 'users.name', 'posts.title'])
  .where('users.active', '=', true)
  .where('posts.published_at', '>', new Date('2026-01-01'))
  .execute();

// 原始 SQL 逃生舱
const raw = await sql`SELECT complex_aggregate()`.execute(db);
```

**适用场景**：需要类型安全但不接受 ORM 开销、团队熟悉 SQL、复杂动态查询构建。

### ORM 场景

```typescript
// Prisma - 全功能 ORM
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    profile: { create: { bio: 'Hello' } },
  },
  include: { profile: true, posts: true },
});

// Drizzle ORM - SQL-like ORM
const result = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .where(and(eq(users.active, true), gte(posts.createdAt, new Date('2026-01-01'))));
```

**适用场景**：快速开发、CRUD 密集型应用、需要强类型关联导航、团队不熟悉 SQL。

### 选型决策树

```
需要类型安全?
├─ 否 → 原始 SQL (postgres.js/pg)
└─ 是
    ├─ 团队熟悉 SQL 且追求性能? → 查询构建器 (Drizzle/Kysely)
    └─ 快速开发 / 复杂关联? → ORM (Prisma/Drizzle ORM)

注意: Drizzle ORM 模糊了 ORM 和查询构建器的边界，
      它既是 ORM 也是查询构建器。
```

---

## 🔄 数据库迁移工具对比

数据库迁移（Migration）是 schema 版本控制的核心实践。

### 工具对比

| 工具 | 技术栈 | 特点 | 适用场景 |
|------|--------|------|---------|
| **Prisma Migrate** | 专用 DSL (Prisma Schema) | 自动生成/执行迁移，Dev/Prod 工作流完善 | Prisma 用户 |
| **Drizzle Kit** | TypeScript / SQL | 轻量、SQL 透明、推模式/迁移模式双支持 | Drizzle 用户 |
| **node-pg-migrate** | SQL/JS | 纯 JS/TS 编写迁移，无 DSL | 原始 SQL 用户 |
| **dbmate** | Go / SQL | 语言无关，纯 SQL 迁移 | 多语言团队 |
| **Flyway** | Java / SQL | 企业级，成熟稳定 | 企业环境 |

### Prisma Migrate

```bash
# 开发：根据 schema 变更生成迁移
npx prisma migrate dev --name add_user_profile

# 生产：执行待处理迁移
npx prisma migrate deploy

# 生成客户端
npx prisma generate
```

```prisma
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  profile   Profile?
  createdAt DateTime @default(now())
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  userId Int    @unique
  user   User   @relation(fields: [userId], references: [id])
}
```

### Drizzle Kit

```bash
# 从数据库拉取 schema（已有项目接入）
npx drizzle-kit introspect

# 生成迁移（基于 schema 变更）
npx drizzle-kit generate

# 执行迁移
npx drizzle-kit migrate

# 开发快速迭代（推模式，仅限开发环境）
npx drizzle-kit push
```

```typescript
// schema.ts - TypeScript 定义
import { pgTable, serial, varchar, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
});

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  bio: text('bio'),
  userId: integer('user_id').notNull().references(() => users.id),
});

export const userRelations = relations(users, ({ one }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
}));
```

### node-pg-migrate

```typescript
// migrations/001_create_users.ts
import { MigrationBuilder } from 'node-pg-migrate';

export const shorthands = {
  id: { type: 'serial', primaryKey: true },
  createdAt: { type: 'timestamp', default: 'now()' },
};

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('users', {
    id: 'id',
    email: { type: 'varchar(255)', notNull: true, unique: true },
    created_at: 'createdAt',
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('users');
}
```

### 迁移最佳实践

1. **不可变迁移**：迁移文件一旦提交到生产，永远不改，出错用新迁移修复
2. **兼容性变更**：先加列（兼容旧代码）→ 部署新代码 → 删旧列
3. **大表变更**：使用 `pt-online-schema-change` 或类似工具避免锁表
4. **环境一致性**：本地 → CI → Staging → Prod，使用相同迁移流程
5. **版本控制**：迁移文件纳入 Git，与代码版本对齐

---

## 🔗 Connection Pooling 最佳实践

Node.js 应用与数据库之间的连接管理直接影响吞吐量和稳定性。

### 为什么需要连接池

- 数据库连接是昂贵资源（TCP + 认证 + 内存）
- 无服务器环境（Vercel/Cloudflare）连接数容易爆炸
- 直接连接在高并发下导致数据库拒绝服务

### 方案对比

| 方案 | 层级 | 特点 | 适用场景 |
|------|------|------|---------|
| **应用内 Pool** (pg Pool) | 应用层 | 每个实例独立管理 | 传统 Node.js 服务 |
| **PgBouncer** | 中间件 | 事务级/语句级/会话级池化 | 自托管 PG 集群 |
| **Supabase Pooler** | 托管层 | 自动多路复用，Serverless 优化 | Supabase/Vercel/Edge |
| **Neon Serverless Driver** | 驱动层 | 通过 WebSocket 连接，自动池化 | Neon + Edge Functions |
| **RDS Proxy** | AWS 托管 | IAM 认证，故障转移 | AWS Lambda/RDS |

### 应用内 Pool 配置

```typescript
// pg (node-postgres) Pool 配置
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST,
  port: 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  // 连接池核心参数
  max: 20,                // 最大连接数（根据实例规格调整）
  min: 5,                 // 最小保持连接
  idleTimeoutMillis: 30000, // 连接空闲 30s 释放
  connectionTimeoutMillis: 2000, // 获取连接超时 2s
  // 生产建议启用 SSL
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 优雅关闭
process.on('SIGTERM', async () => {
  await pool.end();
});
```

### PgBouncer 配置

```ini
; pgbouncer.ini
[databases]
mydb = host=localhost port=5432 dbname=mydb

[pgbouncer]
listen_port = 6439
listen_addr = 0.0.0.0
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt

; 池化模式
pool_mode = transaction      ; transaction / session / statement
max_client_conn = 10000
default_pool_size = 25
reserve_pool_size = 5
```

```typescript
// 应用连接 PgBouncer（端口 6439）
const pool = new Pool({
  host: 'pgbouncer.internal',
  port: 6439,
  // PgBouncer transaction 模式下避免使用 prepared statement
  // pg 驱动: preparedStatements: false
});
```

### Supabase Pooler (Serverless)

```typescript
// Supabase 事务池化连接字符串（用于 Serverless/Edge）
// postgresql://postgres.xxx:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

// 使用 @supabase/supabase-js 或 postgres.js
import postgres from 'postgres';

const sql = postgres(connectionString, {
  max: 10,
  prepare: false, // Serverless 环境建议禁用 prepared statement
});
```

### Connection Pooling 决策矩阵

```
部署环境?
├─ 传统 VPS/K8s → 应用内 Pool (pg Pool) + 可选 PgBouncer
├─ AWS Lambda → RDS Proxy 或 PgBouncer
├─ Vercel Edge / Cloudflare Workers → Supabase Pooler / Neon Serverless
└─ Supabase 托管 → 直接使用 Pooler 连接串（端口 6543）
```

---

## 🏗️ 多数据库架构

复杂业务系统常采用多数据库架构解决单一数据库的瓶颈。

### CQRS（命令查询职责分离）

CQRS 将写模型和读模型分离，写库使用规范化结构（OLTP），读库使用反规范化结构（OLAP/投影）。

```
        ┌─────────────┐
        │   命令端     │  ← Node.js API
        │  (写入)      │    PostgreSQL (OLTP)
        └──────┬──────┘
               │ 领域事件
               ▼
        ┌─────────────┐
        │  事件总线    │  ← Kafka / Redis Streams / RabbitMQ
        │ (Event Bus) │
        └──────┬──────┘
               │
               ▼
        ┌─────────────┐
        │   查询端     │  ← Node.js Read API
        │  (读取)      │    Elasticsearch / ClickHouse / 物化视图
        └─────────────┘
```

```typescript
// Node.js 中实现 CQRS 简化版
// Command Side
class OrderCommandService {
  async createOrder(cmd: CreateOrderCommand) {
    const order = await db.transaction(async (trx) => {
      const o = await trx.insert(orders).values(cmd).returning();
      await eventBus.publish('OrderCreated', { orderId: o.id, items: cmd.items });
      return o;
    });
    return order;
  }
}

// Query Side - 消费事件构建读模型
class OrderProjection {
  async handleOrderCreated(event: OrderCreatedEvent) {
    await readDb.insert(orderViews).values({
      orderId: event.orderId,
      totalAmount: calculateTotal(event.items),
      itemCount: event.items.length,
      // 反规范化：直接存储计算结果
    });
  }
}
```

### 读写分离

PostgreSQL 原生支持流复制，Node.js 应用可实现自动读写分离。

```typescript
// 主从分离连接配置
import { Pool } from 'pg';

const primaryPool = new Pool({
  host: process.env.PG_PRIMARY_HOST, // 写操作
  max: 10,
});

const replicaPool = new Pool({
  host: process.env.PG_REPLICA_HOST, // 读操作
  max: 50, // 读库可承载更多连接
});

// 封装路由层
async function query<T>(sql: string, params: unknown[], isWrite = false): Promise<T[]> {
  const pool = isWrite ? primaryPool : replicaPool;
  return pool.query(sql, params).then((r) => r.rows);
}

// 自动根据 Drizzle 操作类型路由（高级封装）
// 或通过 Prisma 的 readReplicas 扩展实现
```

### 分片（Sharding）

当单库数据量超过 TB 级或 QPS 超过单节点极限时，需要水平分片。

```typescript
// 基于哈希的分片路由（简化示例）
class ShardRouter {
  private shards: Pool[];

  constructor(shardConfigs: PoolConfig[]) {
    this.shards = shardConfigs.map((c) => new Pool(c));
  }

  getShard(key: string): Pool {
    const hash = this.hashCode(key);
    const index = Math.abs(hash) % this.shards.length;
    return this.shards[index];
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}

// 用户数据按 userId 分片
const router = new ShardRouter([shard0Config, shard1Config, shard2Config]);
const userShard = router.getShard(userId);
await userShard.query('SELECT * FROM users WHERE id = $1', [userId]);
```

**JS/TS 生态分片方案**：

- **应用层分片**：手动实现（如上），灵活但复杂
- **Vitess/PlanetScale**：MySQL 生态的托管分片方案
- **Citus** (PG)：PostgreSQL 扩展，分布式表透明分片
- **YugabyteDB**：PG 兼容的分布式 SQL

---

## 🔒 TypeScript 类型安全的数据库访问模式

类型安全是现代 TS 数据库开发的核心诉求，可从多个层面实现。

### 层面 1：Schema 即类型（Drizzle / Prisma）

```typescript
// Drizzle: TypeScript 定义即 Schema
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 推断出 Select/Insert/Update 类型
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// 全链路类型安全
const result: User[] = await db.select().from(users);
```

### 层面 2：zod 运行时验证 + 类型推断

```typescript
import { z } from 'zod';
import { users } from './schema';

const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  createdAt: z.date(),
});

// 结合 Drizzle 查询结果做运行时校验
const raw = await db.select().from(users);
const validated = raw.map((r) => userSchema.parse(r)); // User[]
```

### 层面 3：tRPC + Prisma/Drizzle 全栈类型安全

```typescript
// server/router.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();
export const appRouter = t.router({
  userCreate: t.procedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      // input 类型自动推断为 { email: string }
      return db.insert(users).values(input).returning();
    }),
});

export type AppRouter = typeof appRouter;

// client.ts - 自动生成类型安全客户端
import { createTRPCProxyClient } from '@trpc/client';
import type { AppRouter } from './server/router';

const client = createTRPCProxyClient<AppRouter>({/* ... */});

// 类型安全的 API 调用，自动补全和类型检查
const user = await client.userCreate.mutate({ email: 'test@example.com' });
```

### 层面 4：Kysely 泛型驱动

```typescript
import { Kysely, Generated, PostgresDialect } from 'kysely';

interface UserTable {
  id: Generated<number>;
  email: string;
  createdAt: Generated<Date>;
}

interface Database {
  users: UserTable;
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});

// 所有查询完全类型安全
const user = await db
  .selectFrom('users')
  .select(['id', 'email'])
  .where('id', '=', 1)
  .executeTakeFirst();

// user 类型: { id: number; email: string } | undefined
```

### 类型安全选型建议

| 架构 | 推荐组合 | 类型覆盖率 |
|------|---------|-----------|
| 全栈 Next.js | tRPC + Drizzle + Zod | 100% 端到端 |
| 分离前后端 | OpenAPI + Drizzle + Zod | API 契约 + DB |
| 微服务 | gRPC/Protobuf + Kysely | 服务间 + DB |
| 快速原型 | Prisma + Zod | 自动生成 |

---

## ⚖️ Drizzle vs Prisma 深度对比

Drizzle 和 Prisma 是 2025-2026 年 JS/TS 生态最主流的两个数据库工具，设计理念截然不同。

### 核心理念差异

| 维度 | Drizzle | Prisma |
|------|---------|--------|
| **哲学** | SQL 优先，TypeScript 是 SQL 的超集 | DSL 优先，抽象掉 SQL |
| **Schema 定义** | TypeScript / SQL | 专用 Prisma Schema |
| **查询风格** | SQL-like 链式 API | 对象导航式 API |
| **运行时** | 极小（~20KB） | 较大（Rust 引擎二进制） |
| **生态锁定** | 低（标准 SQL） | 中（Prisma 生态） |
| **学习曲线** | 会 SQL 即可上手 | 需学习 Prisma DSL 和概念 |

### 查询语法对比

```typescript
// Prisma: 声明式对象查询
const usersWithPosts = await prisma.user.findMany({
  where: { active: true },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
  },
  skip: 0,
  take: 10,
});

// Drizzle: SQL-like 链式查询
const usersWithPosts = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .where(and(eq(users.active, true), eq(posts.published, true)))
  .orderBy(desc(posts.createdAt))
  .limit(10);

// Drizzle 关系查询（使用 relations）
const result = await db.query.users.findMany({
  where: eq(users.active, true),
  with: {
    posts: {
      where: eq(posts.published, true),
      orderBy: [desc(posts.createdAt)],
      limit: 5,
    },
  },
  limit: 10,
});
```

### 性能对比

| 指标 | Drizzle | Prisma |
|------|---------|--------|
| **启动时间** | 即时（纯 TS） | 需加载 Query Engine 二进制 |
| **内存占用** | 低 | 中（Rust 引擎） |
| **查询生成** | 轻量 TS 函数 | Rust 引擎编译优化 |
| **Bundle 大小** | ~20KB | ~15MB（引擎二进制，不计入 bundle） |
| **复杂查询** | 直接写 SQL | 部分场景需 `$queryRaw` |

### 迁移工具对比

| 特性 | Drizzle Kit | Prisma Migrate |
|------|-------------|----------------|
| **迁移生成** | 基于 TS Schema 变更 | 基于 Prisma Schema 变更 |
| **SQL 可见性** | 生成 `.sql` 文件，完全透明 | 生成 `.sql` 文件 |
| **开发模式** | `push` 快速迭代 | `dev` 交互式迁移 |
| **生产部署** | `migrate` 执行 | `deploy` 执行 |
| **回滚** | 手动编写 down 迁移 | 自动生成 shadow DB 对比 |
| **多数据库** | PG、MySQL、SQLite | PG、MySQL、SQLite、SQL Server、CockroachDB、MongoDB |

### 适用场景建议

```
选择 Drizzle 如果：
✅ 团队熟悉 SQL，希望 SQL 能力不受限
✅ 追求极致启动速度和 Bundle 体积
✅ 部署到 Edge/Serverless（无二进制依赖）
✅ 需要与现有 SQL/DBA 流程深度整合

选择 Prisma 如果：
✅ 快速启动新项目，CRUD 密集型
✅ 需要 MongoDB 支持（Drizzle 不支持）
✅ 团队不熟悉 SQL，偏好对象操作
✅ 需要 Prisma Studio（可视化数据管理）
✅ 复杂关联查询，自动预加载
```

### 2026 趋势观察

- **Drizzle 增速**：npm 周下载量 2025-2026 年增长率超过 300%，在边缘计算场景成为首选
- **Prisma 稳定**：企业级项目持续采用，ORM 心智占有率仍领先
- **融合趋势**：两者都在吸收对方优点（Drizzle 增加关系查询 API，Prisma 推出 Driver Adapters 减少二进制依赖）

---

## 🚀 Supabase 生态专题

Supabase 是开源 Firebase 替代，以 PostgreSQL 为核心构建全栈后端平台，2026 年生态已极为成熟。

### 核心架构

```
┌─────────────────────────────────────────────┐
│                 Supabase Platform            │
├─────────────┬─────────────┬─────────────────┤
│  PostgreSQL │    Auth     │    Storage      │
│  (主数据库)  │  (GoTrue)   │  (S3 API)       │
├─────────────┼─────────────┼─────────────────┤
│  Realtime   │ Edge Functions│  Vector (pgvector)│
│  (WebSocket)│  (Deno/JS)  │  (AI Embedding) │
├─────────────┴─────────────┴─────────────────┤
│           PostgREST (自动 REST API)           │
└─────────────────────────────────────────────┘
```

### Auth 认证

Supabase Auth（基于 GoTrue）提供完整的身份验证和用户管理。

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 邮箱密码注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
});

// OAuth（GitHub / Google / 等多提供商）
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
});

// 行级安全（RLS）策略 —— 在数据库层控制权限
// CREATE POLICY "Users can only see their own data"
// ON orders FOR SELECT
// USING (auth.uid() = user_id);
```

| Auth 特性 | 支持 |
|-----------|------|
| 邮箱/密码 | ✅ 含邮箱验证 |
| OAuth 2.0 | ✅ 20+ 提供商 |
| SSO / SAML | ✅ 企业版 |
| MFA | ✅ TOTP |
| 匿名登录 | ✅ |
| Phone OTP | ✅ Twilio / MessageBird |

### Storage 存储

Supabase Storage 提供 S3 兼容的对象存储，内置图像转换和 CDN。

```typescript
// 上传文件
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`public/${userId}.png`, file, {
    cacheControl: '3600',
    upsert: true,
  });

// 获取带转换的公开 URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}.png`, {
    transform: { width: 100, height: 100, resize: 'cover' },
  });
```

### Realtime 实时同步

基于 WebSocket 的实时数据库订阅，支持行级监听。

```typescript
// 订阅 orders 表的变化
const channel = supabase
  .channel('orders-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('New order:', payload.new);
    }
  )
  .subscribe();

// 广播自定义消息（Presence 场景）
const room = supabase.channel('room_1');
room
  .on('broadcast', { event: 'cursor' }, (payload) => {
    updateCursorPosition(payload);
  })
  .subscribe();

room.send({
  type: 'broadcast',
  event: 'cursor',
  payload: { x: 100, y: 200 },
});
```

### Edge Functions

Supabase Edge Functions 基于 Deno，部署在全球边缘节点。

```typescript
// supabase/functions/hello/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  const { name } = await req.json();

  // 直接访问 Supabase 数据库
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data } = await supabaseClient.from('users').select('*');

  return new Response(JSON.stringify({ message: `Hello ${name}`, users: data }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

```bash
# 部署 Edge Function
supabase functions deploy hello
supabase functions serve hello --env-file .env.local
```

### Supabase 选型适用场景

| 场景 | 推荐理由 |
|------|---------|
| 快速 MVP | Auth + DB + Storage + Realtime 开箱即用 |
| 实时协作应用 | 内置 Realtime，无需自建 WebSocket |
| 开源优先团队 | 完全开源，可自托管 |
| PG 生态重度用户 | 底层就是 PostgreSQL，无锁定 |
| AI 应用 | pgvector 内置，向量搜索原生支持 |

---

## 📈 选型决策矩阵

| 场景 | 推荐 | 理由 |
|------|------|------|
| 通用 Web 应用 | **PostgreSQL + Drizzle** | 成熟、类型安全、生态丰富 |
| AI/RAG 应用 | **PostgreSQL + pgvector** | 单一数据库处理关系和向量 |
| Edge/Serverless | **Turso / D1 / Neon** | 低延迟、全球分布 |
| 实时协作 | **Supabase / Convex** | 内置实时订阅 |
| 缓存/会话 | **Redis / Dragonfly** | 高性能 KV |
| 站内搜索 | **Meilisearch** | 开箱即用、开发者体验佳 |
| 时序/IoT | **TimescaleDB / InfluxDB** | 时序优化，高性能写入 |
| 社交网络/推荐 | **Neo4j** | 图遍历性能优异 |
| 知识图谱 | **Dgraph** | 分布式图，水平扩展 |
| 全栈快速开发 | **Supabase** | BaaS 完整方案 |

---

## 🎯 2026 趋势前瞻

1. **Drizzle 超越 Prisma**：轻量、SQL-like 的 Drizzle 在 2026 年下载量增速超过 Prisma
2. **Edge 数据库成为默认**：新项目的默认选择从 RDS 转向 D1/Turso/Neon
3. **向量搜索内置化**：pgvector 成为 PG 标配，独立向量数据库面临整合压力
4. **数据库即服务（DBaaS）降价**：Neon、Supabase 的免费额度持续扩大
5. **Dragonfly/Valkey 挑战 Redis**：开源 Redis 替代方案在云厂商中普及
6. **时序数据库统一化**：TimescaleDB 凭借 PG 兼容性在 TSDB 市场扩大份额

---

## 📚 数据标注来源

本文档中的数据与信息来源于以下渠道，更新截止 2026-05-01：

- **GitHub Stars / 下载量**: [npm trends](https://npmtrends.com)、[GitHub API](https://api.github.com)、各项目官方仓库
- **数据库基准测试**: [TechEmpower Framework Benchmarks](https://www.techempower.com/benchmarks/)、官方性能白皮书
- **Edge 数据库趋势**: [State of JS 2025](https://stateofjs.com)、[State of Databases 2025](https://stateofdb.com)
- **Supabase 生态数据**: [Supabase 官方文档](https://supabase.com/docs)、[Supabase GitHub 仓库](https://github.com/supabase/supabase)
- **Drizzle / Prisma 对比**: [Drizzle 官方文档](https://orm.drizzle.team)、[Prisma 官方文档](https://www.prisma.io/docs)
- **时序数据库**: [TimescaleDB 文档](https://docs.timescale.com)、[InfluxDB 文档](https://docs.influxdata.com)
- **图数据库**: [Neo4j 官方 JS 驱动文档](https://neo4j.com/docs/javascript-manual/current)、[Dgraph 文档](https://dgraph.io/docs)
- **缓存方案**: [Dragonfly 官方文档](https://www.dragonflydb.io/docs)、[KeyDB 文档](https://docs.keydb.dev)
- **连接池**: [PgBouncer 文档](https://www.pgbouncer.org)、[Supabase Pooler 指南](https://supabase.com/docs/guides/database/connecting-to-postgres)

> 💡 **关键洞察**: 2026 年数据库选型的核心问题不再是"SQL vs NoSQL"，而是"中心化 vs Edge"。对于新项目，Edge 数据库（Turso/D1/Neon）正成为默认选择。同时，类型安全工具链（Drizzle/Prisma + tRPC + Zod）已成为 TS 全栈开发的事实标准。
