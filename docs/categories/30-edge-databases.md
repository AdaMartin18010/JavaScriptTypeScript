---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

> **⚠️ 维度边界说明**
>
> 本文档属于 **技术基础设施（Technical Infrastructure）** 维度，聚焦边缘数据库与 Serverless 数据存储基础设施。
>
> - ✅ **属于本文档范围**：边缘数据库平台（Turso、D1、Neon）、Serverless 数据库驱动、ORM 边缘适配、连接模型与冷启动优化。
> - ❌ **不属于本文档范围**：具体应用的数据模型设计、业务查询优化、数据迁移策略、数据库架构模式。
> - 🔗 **相关索引**：[`docs/infrastructure-index.md`](../infrastructure-index.md)

# 边缘数据库（Edge Databases）

> 本文档梳理 2025-2026 年面向边缘计算场景的数据库解决方案，覆盖 SQLite at the Edge 范式、全球分布式 SQLite、Serverless Postgres 及选型决策框架。

---

## 📊 整体概览

| 数据库 | 底层引擎 | 架构模式 | Edge 原生 | 免费额度 | 最佳适用 |
|--------|----------|----------|-----------|----------|----------|
| **Turso** | libSQL (SQLite fork) | 全球复制，写主读副 | ✅ 极佳 | 500 DB | 读多写少、多租户 SaaS |
| **Cloudflare D1** | SQLite | Workers 绑定，全球分布 | ✅ 极佳 | 5GB | Cloudflare 生态全栈应用 |
| **Neon** | PostgreSQL | 存储计算分离，Serverless | ✅ 优秀 | 永久 Free Tier | 需要完整 PG 功能的全栈应用 |
| **SQLite Cloud** | SQLite | 边缘节点托管 SQLite | ✅ 良好 | 有限 | 轻量级边缘缓存、IoT |
| **PlanetScale** | Vitess (MySQL) | 存储计算分离，分支工作流 | ✅ 良好 | 无免费 tier | 已有 MySQL 生态迁移 |
| **Supabase** | PostgreSQL | PG + Realtime + Auth | ✅ 良好 | generous | 实时应用、全栈 Firebase 替代 |

---

## 1. SQLite at the Edge 范式背景

### 1.1 为什么 SQLite 适合边缘？

传统数据库客户端-服务器架构在边缘环境面临根本性挑战：

| 挑战 | 传统数据库 | SQLite at the Edge |
|------|-----------|-------------------|
| **连接管理** | 需要持久 TCP 连接 + 连接池 | 无连接，文件或 HTTP 协议 |
| **部署复杂度** | 需单独数据库服务器/集群 | 单文件或托管服务，零运维 |
| **冷启动** | 连接建立耗时（数十至数百 ms） | 毫秒级（文件打开或 HTTP 请求） |
| **边缘节点适配** | TCP 在 Workers/Edge 受限 | HTTP 或本地文件完全兼容 |
| **数据本地性** | 数据集中在中心区域 | 可复制到边缘节点，就近读取 |
| **资源占用** | 内存中维护连接池和缓存 | 极低内存 footprint |

### 1.2 "SQLite at the Edge" 的核心命题

> 将 SQLite 的极致简单性与边缘计算的全球分布式架构结合，实现**数据跟用户走**。

三大技术路径：

1. **libSQL + Turso**：SQLite 的分支版本，增加远程同步协议、加密、WASM 支持，由 Turso 提供全球托管
2. **Cloudflare D1**：Cloudflare 官方在 Workers 运行时内嵌 SQLite，通过原生绑定暴露
3. **SQLite Cloud**：第三方在边缘节点托管 SQLite 实例，提供 HTTP API

### 1.3 边缘数据库 vs 传统 Serverless 数据库

| 维度 | 边缘数据库（SQLite） | Serverless Postgres（Neon） |
|------|---------------------|----------------------------|
| **协议** | HTTP / 文件系统 | TCP / WebSocket |
| **事务** | 本地事务（单节点） | 完整 ACID（分布式日志） |
| **复制** | 异步主从复制 | 存储层复制（Page Server） |
| **查询能力** | SQLite 语法（大部分 SQL） | 完整 PostgreSQL |
| **扩展性** | 垂直扩展（单文件限制） | 自动扩缩容（计算 + 存储分离） |
| **适用数据量** | GB 级别 | TB 级别 |
| **边缘延迟** | < 10ms（本地副本） | < 100ms（冷启动后） |

---

## 2. Turso / libSQL：全球分布式 SQLite

### 2.1 libSQL 是什么？

libSQL 是 SQLite 的开源分支，由 Turso 团队维护，在保持 100% SQLite 兼容性的基础上增加：

- **远程同步协议**：支持边缘节点与中心数据库的异步同步
- **WASM 运行时**：可在浏览器和边缘运行时中运行
- **加密支持**：内置数据库级加密
- **嵌入式副本（Embedded Replicas）**：在本地/边缘节点创建只读副本，实现本地速度读取

### 2.2 Turso 托管服务

| 特性 | 说明 |
|------|------|
| **全球区域** | 35+ 边缘区域 |
| **复制模型** | 单一写入端点（Primary），多区域读取副本（Replica） |
| **延迟** | 读取 < 50ms（边缘副本），写入依赖主库位置 |
| **免费额度** | 500 个数据库，每月 10GB 传输，适合原型和小型应用 |
| **协议** | libSQL 协议（兼容 SQLite，扩展远程同步） |
| **连接方式** | `@libsql/client`（支持 Node.js / Edge / 浏览器） |

### 2.3 核心使用模式

```typescript
import { createClient } from '@libsql/client'

// 远程 Turso 数据库
const client = createClient({
  url: 'libsql://your-database.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN
})

// 嵌入式副本（本地缓存 + 远程同步）
const clientWithReplica = createClient({
  url: 'file:local.db',
  syncUrl: 'libsql://your-database.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
})
await clientWithReplica.sync() // 手动触发同步
```

### 2.4 与 Drizzle ORM 集成

```typescript
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

const client = createClient({ url: 'libsql://...', authToken: '...' })
const db = drizzle(client)

const users = sqliteTable('users', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
})

const result = await db.select().from(users).limit(10)
```

### 2.5 适用场景

- **多租户 SaaS**：每个租户一个 SQLite 数据库，Turso 管理数千个数据库
- **边缘缓存**：读取密集型数据复制到边缘，减少中心数据库压力
- **IoT / 移动端**：嵌入式副本实现离线-first 数据同步
- **Serverless 函数**：无连接池开销，HTTP 协议天然适合 Workers

---

## 3. Cloudflare D1：Workers 原生数据库

### 3.1 定位与架构

Cloudflare D1 是 Cloudflare 官方的边缘 SQLite 数据库，与 Workers 运行时深度集成：

- **2026 年状态**：正式 GA（General Availability），脱离 Beta
- **集成方式**：通过 Wrangler 配置绑定，无需管理连接字符串
- **数据分布**：自动复制到 Cloudflare 全球网络（300+ 城市）
- **访问方式**：`env.DB` 原生绑定，零网络开销

### 3.2 核心特性

| 特性 | 说明 |
|------|------|
| **存储限制** | 免费 tier 5GB，付费 tier 500MB-500GB |
| **查询语言** | SQLite 兼容 |
| **绑定方式** | Wrangler / C3 配置 `[[d1_databases]]` |
| **迁移工具** | Wrangler CLI `d1 migrations` |
| **ORM 支持** | Drizzle ORM（推荐）、Prisma 7（实验性） |

### 3.3 使用示例

```typescript
// wrangler.toml
// [[d1_databases]]
// binding = "DB"
// database_name = "my-db"
// database_id = "xxx"

export default {
  async fetch(request: Request, env: { DB: D1Database }) {
    // 参数化查询
    const { results } = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(1).all()

    // 批量操作
    const insert = await env.DB.prepare(
      'INSERT INTO users (email) VALUES (?)'
    )
    await env.DB.batch([
      insert.bind('a@example.com'),
      insert.bind('b@example.com'),
    ])

    return Response.json(results)
  }
}
```

### 3.4 Drizzle ORM + D1

```typescript
import { drizzle } from 'drizzle-orm/d1'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').notNull(),
})

export default {
  async fetch(request: Request, env: { DB: D1Database }) {
    const db = drizzle(env.DB)
    const allUsers = await db.select().from(users)
    return Response.json(allUsers)
  }
}
```

### 3.5 限制与注意事项

- **仅限 Cloudflare 生态**：无法从 Workers 外部直接访问
- **写吞吐**：单主库模型，高并发写入需排队
- **事务**：支持标准 SQLite 事务，但跨请求事务不保持
- **数据导出**：通过 Wrangler CLI 或 REST API 导出

---

## 4. Neon Serverless Postgres

### 4.1 架构特点

Neon 是存储计算分离的 Serverless PostgreSQL：

- **Page Server**：共享存储层，多计算节点访问同一份数据
- **Serverless Driver**：通过 HTTP/WebSocket 连接，无需持久 TCP
- **数据库分支**：类似 Git 的分支工作流，一键创建开发/预览环境
- **2026 更新**：被 Databricks 收购，计算成本降低 15-25%，免费 tier 永久保留

### 4.2 Edge 环境使用

```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

// 在 Cloudflare Workers / Vercel Edge 中直接查询
const result = await db.select().from(users).limit(10)
```

### 4.3 与边缘数据库的对比

| 维度 | Neon | Turso / D1 |
|------|------|-----------|
| **SQL 兼容性** | 完整 PostgreSQL | SQLite 子集 |
| **扩展功能** | JSONB、数组、PostGIS、向量扩展 | 基础 SQL + libSQL 扩展 |
| **冷启动** | ~100-300ms（连接建立） | ~10-50ms |
| **连接模型** | Serverless HTTP 驱动 | HTTP / 文件绑定 |
| **免费 tier** | 永久保留 | Turso 500 DB / D1 5GB |
| **数据量** | 无上限 | GB 级别（SQLite 限制） |

---

## 5. SQLite Cloud

### 5.1 定位

SQLite Cloud 是在边缘节点托管 SQLite 实例的第三方服务，提供：

- 全球边缘节点上的托管 SQLite 实例
- REST API 和 WebSocket 实时订阅
- 内置用户认证和行级安全
- 与 Vercel、Netlify 等平台的一键集成

### 5.2 适用场景

- 需要 SQLite 简单性但不想自行管理同步的项目
- 轻量级实时应用（利用 WebSocket 订阅）
- 作为传统后端数据库的边缘缓存层

---

## 6. 边缘数据库 vs 传统数据库决策树

```
是否需要边缘部署？
├── 是 → 数据量和查询复杂度如何？
│   ├── 小型应用 / 简单 CRUD / 读多写少
│   │   ├── 使用 Cloudflare Workers？ → Cloudflare D1
│   │   ├── 需要多租户 / 全球低延迟？ → Turso
│   │   └── 需要实时订阅 / 轻量缓存？ → SQLite Cloud
│   └── 中型应用 / 复杂查询 / 需要完整 SQL
│       ├── 需要 PostgreSQL 生态？ → Neon
│       ├── 需要 MySQL 兼容？ → PlanetScale（注意无免费 tier）
│       └── 需要全栈平台（Auth + Realtime）？ → Supabase
└── 否 → 传统部署
    ├── 需要极致类型安全 + 开发体验？ → Prisma 7 + PostgreSQL
    ├── 需要复杂领域模型 / Unit of Work？ → MikroORM + PostgreSQL
    └── 需要 SQL 灵活性 + 轻量？ → Drizzle ORM + PostgreSQL
```

### 6.1 决策维度详解

| 决策维度 | 边缘数据库优先 | 传统数据库优先 |
|----------|---------------|---------------|
| **部署环境** | Cloudflare Workers、Vercel Edge、Deno Deploy | AWS EC2、K8s、传统 VPS |
| **数据量** | < 10GB | > 10GB 或快速增长 |
| **查询复杂度** | 简单 CRUD、轻度 JOIN | 复杂聚合、CTE、窗口函数 |
| **事务需求** | 单记录或轻量事务 | 多表复杂事务、SERIALIZABLE |
| **团队规模** | 小团队 / 个人项目 | 中大型团队 / 企业级 |
| **合规要求** | 一般 | SOC 2、HIPAA、强审计 |
| **延迟敏感度** | 全球用户、< 50ms 要求 | 区域集中用户 |

---

## 7. Drizzle ORM 与边缘数据库的集成

### 7.1 为什么 Drizzle 是边缘数据库的最佳搭档？

| 特性 | Drizzle ORM 优势 |
|------|-----------------|
| **包体积** | ~7KB gzipped，不增加边缘函数体积压力 |
| **零生成** | 纯 TypeScript Schema，无需预编译，适合边缘构建流程 |
| **多 dialect** | 同一套 API 支持 sqlite（D1/Turso）、pg（Neon）、mysql |
| **Driver 无关** | 通过统一接口适配 libSQL、D1、Neon serverless driver |
| **RLS 支持** | 原生支持 PostgreSQL RLS 策略（Neon/Supabase） |

### 7.2 多边缘数据库统一抽象

```typescript
// 统一的 Drizzle 数据库类型
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless'

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// 共享 Schema（SQLite dialect 兼容 D1 和 Turso）
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').notNull(),
})

// 按平台初始化
type EdgeDB = 'd1' | 'turso' | 'neon'

function createEdgeDB(platform: EdgeDB, connection: any) {
  switch (platform) {
    case 'd1': return drizzleD1(connection)
    case 'turso': return drizzleLibsql(connection)
    case 'neon': return drizzleNeon(connection)
  }
}
```

---

## 8. 成本模型与冷启动分析

### 8.1 边缘数据库成本对比（2026）

| 服务 | 免费 tier | 付费起步 | 计费模式 | 隐藏成本 |
|------|----------|---------|----------|----------|
| **Turso** | 500 DB, 10GB/月 | $29/月 | 数据库数 + 存储 + 请求 | 跨区传输 |
| **Cloudflare D1** | 5GB, 25M 读/天 | $5/月/DB | 存储 + 请求数 | Workers 调用费 |
| **Neon** | 永久 Free Tier | $19/月 | 计算 + 存储 | 长时间连接（需用 Serverless driver） |
| **Supabase** | 500MB, 无限请求 | $25/月 | 存储 + 实时连接 |  Auth/Storage 联动计费 |
| **PlanetScale** | 无 | $39/月 | 存储 + 请求 | 分支存储额外计费 |

### 8.2 冷启动对比

冷启动 = 从函数调用到首次查询返回的时间。

| 数据库 | 冷启动时间 | 主要来源 |
|--------|-----------|----------|
| **Cloudflare D1** | ~1-5ms | 无网络开销，本地绑定 |
| **Turso (libSQL)** | ~10-30ms | HTTP 往返（边缘副本） |
| **Neon (HTTP)** | ~50-150ms | HTTP 连接 + 计算节点唤醒 |
| **Neon (WebSocket)** | ~100-300ms | TCP + TLS + 连接建立 |
| **Prisma 7 + Neon** | ~80-200ms | WASM 初始化 + HTTP 驱动 |
| **传统 RDS** | ~500ms-2s | 连接池建立 + 网络延迟 |

### 8.3 优化策略

**降低冷启动：**

1. **选择正确的驱动**：Neon 使用 `@neondatabase/serverless`（HTTP）而非传统 `pg`（TCP）
2. **保持连接预热**：Cloudflare Workers 可使用 Cron Triggers 定期预热
3. **减少 WASM bundle**：Prisma 7 的 ~1.6MB WASM 在 Workers 免费 tier（1MB 限制）仍可能超限，边缘首选 Drizzle
4. **使用边缘缓存**：对读多写少数据，配合 Cloudflare Cache API 或 Vercel Edge Config

**成本优化：**

1. **读写分离**：将读操作路由到边缘副本或缓存，写操作批量处理
2. **数据库合并**：Turso 的 500 免费数据库可支持大量微服务/多租户场景
3. **监控查询**：边缘数据库按请求计费，避免 N+1 查询（Drizzle 的显式 join 是天然解药）

---

## 📈 选型建议

### 按场景推荐

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| Cloudflare Workers 全栈应用 | **D1 + Drizzle ORM** | 原生绑定，零配置，延迟最低 |
| 多租户 SaaS（全球用户） | **Turso + Drizzle ORM** | 500 免费 DB，每租户独立数据库，全球副本 |
| 需要完整 PG 功能的 Serverless | **Neon + Drizzle/Prisma 7** | 被 Databricks 收购后生态增强，分支工作流 |
| 实时应用 + 认证 + 存储 | **Supabase** | 全栈平台，RLS 安全，实时订阅 |
| 已有 MySQL 生态迁移 | **PlanetScale** | Vitess 分片，分支工作流（注意无免费 tier） |
| 极端轻量 / 低带宽环境 | **Drizzle + D1/Turso** | 最小 bundle，最快冷启动 |

### 技术栈组合推荐（2026）

| 层级 | 边缘优先组合 | 传统全栈组合 |
|------|-------------|-------------|
| **框架** | Hono / Next.js (Edge) | Next.js / NestJS |
| **ORM** | Drizzle ORM | Prisma 7 或 Drizzle ORM |
| **数据库** | Turso / D1 / Neon | PostgreSQL / Neon |
| **验证** | Valibot (<1KB) | Zod |
| **缓存** | Cloudflare Cache API / Vercel Edge Config | Redis |

---

## 🔗 参考资源

- [Turso 文档](https://docs.turso.tech)
- [libSQL GitHub](https://github.com/tursodatabase/libsql)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1)
- [Neon 文档](https://neon.tech/docs)
- [SQLite Cloud](https://sqlitecloud.io)
- [Drizzle ORM 边缘适配文档](https://orm.drizzle.team/docs/connect-overview)
- [Supabase 文档](https://supabase.com/docs)
- [PlanetScale 文档](https://planetscale.com/docs)

---

> 📅 本文档最后更新：2026年4月
>
> 💡 提示：边缘数据库生态正在快速演进，Turso 和 D1 在 2026 年已 GA，Neon 被 Databricks 收购后将加强分析能力。建议新项目优先考虑 Drizzle ORM + 边缘数据库的组合以获得最佳性能和开发者体验。
