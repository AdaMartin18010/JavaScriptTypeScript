---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# ORM 对比矩阵

> 最后更新：2026-04

---

## 核心对比表

| 特性 | Prisma 7 | Drizzle ORM | ZenStack | TypeORM | Sequelize |
|------|----------|-------------|----------|---------|-----------|
| **Stars (2026.04)** | 48k+ | 40k+ | 4k+ | 36k+ | 29k+ |
| **Schema Definition** | Prisma Schema (DSL) | TypeScript-native | Prisma-compatible + `@@allow` | Decorator / Entity | Model definition |
| **Query Syntax** | 声明式对象 API | SQL-like Fluent API | 复用 Prisma Client | Repository / QueryBuilder | Chainable API |
| **Bundle Size** | ~5MB (WASM) | ~7KB gzipped | +~50KB (Prisma 之上) | ~1MB+ | ~800KB |
| **Cold Start** | ⭐⭐⭐ 快 (无二进制) | ⭐⭐⭐ 极快 | ⭐⭐⭐ 快 | ⭐⭐ 中 | ⭐⭐ 中 |
| **Edge Support** | ✅ Native | ✅ Native | ✅ Native | ❌ | ❌ |
| **Migration Tooling** | Prisma Migrate | Drizzle Kit | 复用 Prisma | TypeORM CLI / 代码 | Sequelize CLI |
| **Raw SQL** | `$queryRaw` / `$executeRaw` | `db.execute()` / `db.run()` | 复用 Prisma | `query()` | `query()` |
| **Access Control** | ❌ 需自行实现 | ❌ 需自行实现 | ✅ `@@allow` / `@@deny` | ❌ 需自行实现 | ❌ 需自行实现 |
| **维护状态** | 🟢 活跃 | 🟢 活跃 | 🟢 活跃 | 🟡 维护模式 | 🟡 维护模式 |

---

## Prisma 7 (2025.11 发布)

```bash
npm install prisma @prisma/client
```

- **定位**: 下一代 Node.js 和 TypeScript ORM，v7 彻底移除 Rust Query Engine 二进制依赖
- **核心设计**: Schema 定义 → WASM Query Engine → 类型安全客户端
- **关键升级（v7）**:
  - **WASM 引擎**: Query Engine 改用 TypeScript/WASM 实现（取代 Rust 二进制），bundle 从 ~14MB 降至 ~5MB
  - **原生 Edge 支持**: 彻底解决 Edge Runtime 兼容性问题，无需数据代理，直接运行在 Cloudflare Workers、Vercel Edge、Deno Deploy
  - **启动时间**: 冷启动从数百毫秒降至数十毫秒
  - **类型检查加速**: Schema 编译与类型生成速度提升约 70%
  - **零二进制依赖**: 单一代码库部署，容器/Serverless 镜像体积大幅缩小
- **v7 仍存痛点**:
  - **Bundle 体积**: ~5MB 的 WASM bundle 在极端边缘场景仍是体积痛点（对比 Drizzle 的 ~7KB）
- **优势**:
  - 类型安全级别最高
  - 自动迁移生成（Prisma Migrate）
  - Prisma Studio 可视化工具
  - 优秀的开发者体验与生态
- **劣势**: 运行时无法动态查询 schema、Access Control 需外部方案
- **适用场景**: 传统服务端应用、全栈框架（Next.js/NestJS）、需要强类型保证的项目

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
```

```typescript
// 使用示例
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    posts: {
      create: { title: 'Hello World' }
    }
  },
  include: { posts: true }
})
```

---

## Drizzle ORM

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit
```

- **定位**: SQL-like、TypeScript-native 的现代 ORM，2026 年持续爆发式增长，Serverless/Edge 首选
- **核心设计**: 用 TypeScript 写 Schema，用 SQL 风格链式查询，零生成步骤
- **关键特性**:
  - **极致轻量**: ~7KB gzipped，可 Tree Shaking
  - **零生成步骤**: Schema 即 TypeScript，无需预编译或代码生成
  - **原生数据库适配**: 内置 Neon、Turso、PlanetScale 等边缘数据库原生适配器
  - **明确 join 语法**: 无 N+1 隐患（如正确使用 `leftJoin` + `groupBy`）
  - **RLS 支持**: 原生支持 PostgreSQL Row Level Security 策略映射
  - **Drizzle Kit**: 开源迁移工具，支持 `generate` / `migrate` / `push`
  - **Drizzle Studio**: 内置 GUI 数据库管理工具
- **优势**:
  - SQL-like 语法，直观且透明
  - 包体积极小，冷启动极快
  - 全平台支持（Node.js / Bun / Deno / Edge Runtime）
  - 无隐藏查询，开发者完全掌控 SQL
- **劣势**: 较新，大型复杂关联查询代码量多于 Prisma；生态插件数量在追赶
- **适用场景**: 性能敏感、边缘计算、喜欢 SQL 的开发者、Serverless 函数

```typescript
// schema.ts
import { pgTable, serial, varchar, integer, text } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  authorId: integer('author_id').references(() => users.id),
})

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}))
```

```typescript
// 使用示例
import { eq } from 'drizzle-orm'

// ORM 风格关系查询
const user = await db.query.users.findFirst({
  where: eq(users.email, 'user@example.com'),
  with: { posts: true }
})

// SQL-like 显式查询
const result = await db.select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .where(eq(users.email, 'user@example.com'))
```

---

## Turso / libSQL

```bash
npm install @libsql/client drizzle-orm
```

- **定位**: SQLite at the Edge，由 libSQL (SQLite fork) 驱动，Turso 提供托管服务
- **核心设计**: 在边缘节点部署 SQLite 数据库实例，支持全球复制与低延迟读取
- **关键特性**:
  - **全球复制**: 35+ 区域，写主库，读最近副本，延迟 < 50ms
  - **SQLite 兼容**: 完全兼容 SQLite 文件格式与 SQL 语法
  - **边缘原生**: 与 Cloudflare Workers、Deno Deploy、Vercel Edge 无缝集成
  - **免费额度**: 500 个免费数据库，适合原型和小型应用
  - **嵌入式副本 (Embedded Replicas)**: 支持在本地/边缘节点创建只读副本，实现本地速度读取
  - **libSQL 扩展**: 支持加密、WASM 运行时、远程同步协议
- **优势**:
  - 无连接池开销，单文件部署
  - 与 Drizzle ORM、MikroORM 深度集成
  - 适合读多写少的边缘场景
- **劣势**: 写吞吐受限于单主库；复杂事务不如 Postgres 成熟
- **适用场景**: Edge/Serverless 应用、IoT/移动端本地同步、全球分布的读密集型应用

```typescript
import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://your-database.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN
})

const result = await client.execute({
  sql: 'SELECT * FROM users WHERE email = ?',
  args: ['test@example.com']
})
```

---

## Neon (Serverless PostgreSQL)

```bash
npm install @neondatabase/serverless drizzle-orm
# 或 Prisma: datasource db { provider = "postgresql" url = env("DATABASE_URL") }
```

- **定位**：Serverless PostgreSQL 托管服务，2026 年 1 月被 Databricks 收购
- **核心设计**：按需计费的 PostgreSQL 计算 + 存储分离架构
- **2026 关键更新**:
  - **Databricks 收购**: 2026 年 1 月宣布收购，生态整合加速
  - **成本优化**: 计算成本降低 15-25%
  - **免费 tier 永久**: 免费额度永久保留，对开发者友好
- **优势**:
  - 真正的 Serverless：无连接数限制，按需启动
  - 分支数据库：类似 Git 的数据库分支，便于开发与预览
  - 与 Prisma 7、Drizzle ORM 深度集成
- **劣势**: 写吞吐受限于单节点；复杂分析查询性能一般
- **适用场景**: Serverless/Edge 应用、需要 Postgres 兼容性的全栈项目

```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)
```

---

## PlanetScale (Vitess-based MySQL)

```bash
# 使用 Drizzle ORM 或 Prisma 的标准 MySQL 驱动即可
npm install drizzle-orm mysql2
```

- **定位**：基于 Vitess 的 Serverless MySQL 数据库，Git 式分支工作流
- **核心设计**：MySQL-compatible，支持数据库分支与部署流水线
- **2026 关键事实**:
  - **无免费 tier**: 自 2024 年起取消免费 tier，最低 $39/月
  - **定价门槛**: 对 side project 和个人开发者不够友好
- **优势**:
  - 强大的数据库分支与合并工作流
  - MySQL 兼容性（兼容现有 MySQL 工具链）
  - 自动扩缩容
- **劣势**: 无免费 tier；相比 Neon/Turso 在 Edge 场景集成度稍弱
- **适用场景**: 已有 MySQL 生态、需要分支工作流的中大型团队

---

## Cloudflare D1

```bash
# Cloudflare Workers 原生绑定，无需 npm install
# Drizzle ORM 支持: npm install drizzle-orm
```

- **定位**：Cloudflare 官方边缘 SQLite 数据库，与 Workers 深度集成
- **核心设计**: SQLite at the Edge，数据自动复制到 Cloudflare 全球网络
- **2026 关键更新**:
  - **GA 发布**: 2026 年正式 GA，脱离 Beta
  - **免费 tier**: 5GB 存储免费，与 Workers 生态无缝集成
  - **原生绑定**: 通过 Wrangler / `env.DB` 直接绑定，零网络开销
- **优势**:
  - 与 Cloudflare Workers / Pages 原生集成，无需管理连接字符串
  - 边缘节点就近读取，延迟极低
  - 零运维，自动备份
- **劣势**: 仅限 Cloudflare 生态；复杂查询和事务能力弱于 PostgreSQL
- **适用场景**: 纯 Cloudflare Workers 生态、读多写少的边缘应用

```typescript
// wrangler.toml / wrangler.json 绑定后
export default {
  async fetch(request: Request, env: { DB: D1Database }) {
    const { results } = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(1)
      .all()
    return Response.json(results)
  },
}
```

---

## ZenStack

```bash
npm install zenstack
```

- **定位**: Prisma-compatible schema + 内置访问控制（Access Control）层
- **核心设计**: 在 Prisma Schema 之上扩展 `@@allow` / `@@deny` 策略，自动生成安全的 CRUD API
- **关键特性**:
  - **Prisma 兼容**: 复用 Prisma Schema 和 Client，学习成本低
  - **声明式权限**: 在模型层定义 `@@allow('read', auth() != null)` 等规则
  - **自动 API 生成**: 可生成 tRPC、REST、GraphQL 的安全端点
  - **服务端与前端共享**: 同一份 Schema 定义驱动前后端数据权限
- **优势**:
  - 不牺牲 Prisma 的类型安全与生态
  - 权限与数据模型同处一地，易于审计
  - 减少手写鉴权 boilerplate
- **劣势**: 在 Prisma 之上增加一层抽象；社区规模小于 Prisma/Drizzle
- **适用场景**: B2B 多租户应用、需要复杂数据权限控制的 SaaS、快速搭建安全 CRUD 后端

```prisma
// schema.zmodel (ZenStack 扩展语法)
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int

  // 访问控制策略
  @@allow('all', auth() == author)
  @@allow('read', published == true)
  @@deny('read', auth() == null && published == false)
}
```

---

## TypeORM / Sequelize

> ⚠️ **维护模式声明**：截至 2026年，TypeORM 和 Sequelize 核心团队活动显著减少，主要进入 bug fix 与社区 PR 维护阶段。新项目不推荐选用。

### TypeORM

```bash
npm install typeorm reflect-metadata pg
```

- **定位**: 受 Java Hibernate 启发的 ORM
- **现状**: 社区维护为主，重大新特性开发停滞；TypeScript 装饰器方案在现代化项目中逐渐被 Schema-first 替代
- **适用场景**: 仅建议遗留项目维护或团队已具备大量 TypeORM 资产

### Sequelize

```bash
npm install sequelize pg
```

- **定位**: 老牌 Node.js ORM，链式 API 风格
- **现状**: 同样处于维护模式，Sequelize v7 (TypeScript 重写) 进展缓慢，社区关注度持续下降
- **适用场景**: 仅建议遗留项目维护

---

## 功能对比详解

| 功能 | Prisma 7 | Drizzle ORM | ZenStack | TypeORM | Sequelize |
|------|----------|-------------|----------|---------|-----------|
| **数据库支持** | PostgreSQL, MySQL, SQLite, MongoDB, SQL Server, CockroachDB | PostgreSQL, MySQL, SQLite, 更多 | 同 Prisma | PostgreSQL, MySQL, SQLite, MongoDB, Oracle, MSSQL | PostgreSQL, MySQL, SQLite, MSSQL |
| **Schema 方式** | DSL (`.prisma`) | TypeScript Code | DSL (`.zmodel`) | Decorator / Entity | Model definition |
| **代码生成步骤** | 必需 (`prisma generate`) | 零生成 | 必需 (`zenstack generate`) | 无需 | 无需 |
| **迁移方式** | Prisma Migrate (自动生成) | Drizzle Kit (SQL / 代码) | 复用 Prisma Migrate | CLI / 代码生成 | Sequelize CLI |
| **关系处理** | 声明式，自动关联 | 显式 join 或 ORM 风格 | 复用 Prisma | Decorator 定义 | `belongsTo` / `hasMany` |
| **原始 SQL** | `$queryRaw` / `$executeRaw` | `db.execute()` / `db.run()` | 复用 Prisma | `query()` | `query()` |
| **事务** | 嵌套事务支持 | 标准事务 | 复用 Prisma | 标准事务 | 标准事务 |
| **连接池** | 内置 | 依赖驱动 | 复用 Prisma | 内置 | 内置 |
| **Access Control** | ❌ | ❌ | ✅ 声明式 | ❌ | ❌ |

---

## 类型安全对比

| 场景 | Prisma 7 | Drizzle ORM | ZenStack | TypeORM | Sequelize |
|------|----------|-------------|----------|---------|-----------|
| **自动生成类型** | ✅ 完整 | ✅ 完整（从 TS Schema） | ✅ 完整 | ⚠️ 部分 | ⚠️ 部分 |
| **查询返回值类型** | ⭐⭐⭐ 精确 | ⭐⭐⭐ 精确 | ⭐⭐⭐ 精确 | ⭐⭐ 良好 | ⭐⭐ 良好 |
| **关系类型** | ⭐⭐⭐ 自动 | ⭐⭐⭐ 自动 | ⭐⭐⭐ 自动 | ⭐⭐ 需配置 | ⭐⭐ 需配置 |
| **部分选择类型** | ⭐⭐⭐ 支持 | ⭐⭐⭐ 支持 | ⭐⭐⭐ 支持 | ⭐⭐ 需手动 | ⭐⭐ 需手动 |
| **select * 类型推导** | ⭐⭐⭐ 支持 | ⭐⭐⭐ 支持 | ⭐⭐⭐ 支持 | ⭐⭐ 部分 | ⭐⭐ 部分 |

---

## 性能对比

| 指标 | Prisma 7 | Drizzle ORM | ZenStack | TypeORM | Sequelize |
|------|----------|-------------|----------|---------|-----------|
| **查询速度** | 快 (WASM 引擎) | 快 (轻量) | 同 Prisma | 中 | 中 |
| **内存占用** | 低 (~1.6MB) | 极低 (~7KB) | 同 Prisma | 高 | 中 |
| **冷启动** | 快 (无二进制) | 极快 | 快 | 中 | 中 |
| **边缘运行** | ✅ Native | ✅ Native | ✅ Native | ❌ | ❌ |
| **Bundle 体积** | ~5MB | ~7KB gzipped | +~50KB | ~1MB+ | ~800KB |

---

## 选型建议

| 场景 | 推荐方案 |
|------|----------|
| 追求极致类型安全 + 开发体验 | **Prisma 7** |
| 边缘计算 / Serverless / 极小体积 | **Drizzle ORM + Turso/D1** |
| 性能敏感、喜欢 SQL 透明性 | **Drizzle ORM** |
| 复杂数据权限控制 (SaaS/多租户) | **ZenStack + Prisma 7** |
| 需要可视化工具 + 自动迁移 | **Prisma 7** |
| 复杂领域模型 + Unit of Work | **MikroORM** |
| 传统后端 + Postgres 托管 | **Prisma 7 + Neon** / **Drizzle + Neon** |
| 传统后端 + MySQL 托管 | **Drizzle + PlanetScale**（注意无免费 tier）|
| 新项目启动 (2026年) | **Prisma 7** 或 **Drizzle ORM** |
| 遗留项目维护 | 保持现有 ORM |
| **不推荐新项目使用** | TypeORM、Sequelize |

---

## 边缘数据库 + ORM 组合推荐

| 部署环境 | 数据库 | ORM | 理由 |
|----------|--------|-----|------|
| Cloudflare Workers | Cloudflare D1 (GA 2026) / Turso | Drizzle ORM | D1 GA，原生绑定，体积最小 |
| Vercel Edge | Turso / Neon | Drizzle ORM / Prisma 7 | 无连接池问题，冷启动快 |
| AWS Lambda | Neon / RDS Proxy | Prisma 7 / Drizzle ORM | Prisma 7 WASM 引擎无需二进制部署 |
| 传统 VPS / K8s | PostgreSQL / MySQL | Prisma 7 / Drizzle ORM | 功能完整，监控成熟 |
| 复杂领域后端 | PostgreSQL | MikroORM | Unit of Work + Identity Map |

---

## 迁移建议

### Prisma 5/6 → Prisma 7

- 直接升级依赖版本，`prisma` 和 `@prisma/client` 升至 v7
- 移除任何 `PRISMA_QUERY_ENGINE_LIBRARY` / `PRISMA_QUERY_ENGINE_BINARY` 环境变量
- 在 Edge Runtime 中可直接移除 Data Proxy 配置，改用直连

### TypeORM / Sequelize → Prisma 7 / Drizzle

- 使用 `prisma db pull` 或 Drizzle Kit `introspect` 从现有数据库生成 Schema
- 重写 Repository 层为 Prisma Client 或 Drizzle Query
- 逐步替换装饰器实体为 Schema-first 定义

---

> 📅 本文档最后更新：2026-04
>
> 💡 提示：Stars 数据会随时间变化，建议查看 GitHub 获取最新数据；Prisma 7 为 2025.11 发布的新版本，生态正在快速演进。


---

## 2026 年数据库与 ORM 生态重大更新

> 以下更新反映 2026 年 4 月的最新生态变化，补充本文档核心对比表未覆盖的最新事件。

### Neon 被 Databricks 收购（2026-01）

- **事件**：Serverless Postgres 提供商 Neon 于 2026 年 1 月被 Databricks 收购。
- **影响**：
  - 计算成本降低 **15–25%**
  - 免费 tier（Free Tier）宣布永久保留
  - 与 Databricks 生态的集成预期增强（Delta Lake、Unity Catalog 等）
- **对开发者的意义**：Neon 的数据库分支（Branching）和 Serverless 自动扩缩容能力仍然是多租户 SaaS 的优选方案之一。

### PlanetScale 定价策略变化

- **变化**：PlanetScale 自 2024 年起**取消免费 tier**，最低付费档位为 **$39/月**。
- **影响**：对于小型项目和个人开发者，PlanetScale 的门槛显著提高；Drizzle + Turso / Cloudflare D1 成为更经济的选择。
- **适用场景**：PlanetScale 仍适合需要多区域 active-active MySQL（基于 Vitess）的企业级应用。

### Prisma 7 WASM 引擎现状

- **进展**：Prisma 7 将查询引擎从 Rust 二进制迁移到 WebAssembly（WASM），解决了 Cloudflare Workers 等边缘运行时的兼容性难题。
- **痛点**：WASM 引擎的 Bundle 体积约 **5MB**，对于极端边缘场景（如 Cloudflare Workers 免费 tier 的 1MB 限制）仍然不可行。
- **建议**：边缘部署首选 Drizzle ORM；传统服务器部署可继续使用 Prisma 7。

### Turso 与 Cloudflare D1 的 2026 进展

| 服务 | 2026 关键更新 | 适用场景 |
|------|--------------|---------|
| **Turso** | 35+ 全球区域；500 个免费数据库；Embedded Replicas 实现本地速度读取 | 多租户 SaaS、边缘优先架构、IoT 数据收集 |
| **Cloudflare D1** | 2026 年 GA（General Availability）；5GB 免费 tier；与 Workers 生态深度整合 | Cloudflare 生态内的全栈应用、轻量级 CMS |

### 边缘数据库选型建议（2026）

对于新项目，推荐以下决策路径：

1. **已在 Cloudflare 生态** → D1（零配置集成）
2. **多租户 SaaS，需要全球低延迟** → Turso（libSQL + 边缘复制）
3. **需要完整 PostgreSQL 功能 + Serverless** → Neon（被 Databricks 收购后生态增强）
4. **复杂查询、关系处理、成熟迁移工具** → Prisma 7 + 传统 PostgreSQL（非边缘部署）

> 📅 本节补充更新：2026-04-27
