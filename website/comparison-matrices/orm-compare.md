---
title: ORM 对比矩阵
description: "2025-2026 年 ORM 对比矩阵 对比矩阵，覆盖主流方案选型数据与工程实践建议"
---

# ORM 对比矩阵

> 最后更新：2026年4月

## 核心对比表

| 特性 | Prisma | Drizzle | TypeORM |
|------|--------|---------|---------|
| **GitHub Stars** | 41k | 24k | 34k |
| **包大小** | 中 (~15MB CLI) | 小 (~500KB) | 大 (~1MB+) |
| **TypeScript 支持** | ⭐⭐⭐ 最佳 | ⭐⭐⭐ 优秀 | ⭐⭐ 良好 |
| **学习曲线** | ⭐⭐ 中 | ⭐ 低 | ⭐⭐⭐ 高 |
| **性能** | ⭐⭐ 中 | ⭐⭐⭐ 高 | ⭐⭐ 中 |
| **查询 DSL** | 声明式 Schema | SQL-like | Decorator / Repository |
| **迁移系统** | ⭐⭐⭐ 优秀 | ⭐⭐ 良好 | ⭐⭐ 良好 |
| **可视化工具** | ✅ Prisma Studio | ❌ | ❌ |
| **多数据库** | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| **边缘计算** | ❌ | ✅ | ❌ |
| **生态成熟度** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 详细分析

### Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

- **定位**: 下一代 Node.js 和 TypeScript ORM
- **核心设计**: Schema 定义 → 生成类型安全客户端
- **优势**:
  - 类型安全级别最高
  - 自动迁移生成
  - Prisma Studio 可视化工具
  - 优秀的开发者体验
- **劣势**: 运行时无法动态查询、不支持边缘计算
- **适用场景**: 传统服务端应用、需要强类型保证的项目

#### Prisma 生态深度组件

| 组件 | 定位 | 版本状态 | 适用场景 |
|------|------|----------|----------|
| **Prisma Accelerate** | 全球连接池 + 查询缓存 | GA (2024) | 高并发、Serverless 场景 |
| **Prisma Pulse** | 实时数据库事件流 | GA (2024) | 实时推送、事件驱动架构 |
| **Prisma Optimize** | AI 驱动查询优化 | Preview (2025) | 性能调优、查询分析 |

**Prisma Accelerate** 通过在全球边缘节点缓存连接池，解决了 Prisma 在 Serverless 环境中的冷启动和连接数限制问题。它支持自动查询缓存（TTL 可调），可将重复查询的延迟降低 50%-90%。

**Prisma Pulse** 基于数据库逻辑复制（Logical Replication）实现实时事件订阅，支持 PostgreSQL 的 `LISTEN/NOTIFY` 机制。与 Supabase Realtime 类似，但深度集成 Prisma Schema，类型安全级别更高。

**Prisma Optimize** 分析查询模式并提供索引建议和 Schema 优化提示，集成在 Prisma Studio 中，目前支持 PostgreSQL 和 MySQL。


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

### Drizzle

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit
```

- **定位**: 类型安全的 SQL-like ORM
- **核心设计**: SQL 优先，类型推导完善
- **优势**:
  - SQL-like 语法，直观
  - 包体积小
  - 支持边缘计算 (Edge)
  - 无运行时开销
- **劣势**: 较新，生态不如 Prisma 成熟
- **适用场景**: 性能敏感、边缘计算、喜欢 SQL 的开发者

#### Drizzle 生态深度组件

| 组件 | 定位 | 版本状态 | 适用场景 |
|------|------|----------|----------|
| **Drizzle Kit** | 迁移与 Schema 管理工具 | GA (v0.30+) | 数据库迁移、Schema 同步 |
| **drizzle-zod** | Schema → Zod 验证推导 | Stable | 表单验证、API 输入校验 |
| **drizzle-valibot** | Schema → Valibot 验证推导 | Stable | 轻量验证场景 |

**Drizzle Kit** 支持多模式迁移工作流：

- `generate` — 从 TypeScript Schema 生成 SQL 迁移文件
- `push` — 直接将 Schema 变更推送到数据库（开发环境）
- `pull` — 从现有数据库反向生成 TypeScript Schema
- `check` — 校验 Schema 与数据库一致性
- `up` / `down` — 执行或回滚迁移

与 Prisma Migrate 不同，Drizzle Kit 生成的是可审计的纯 SQL 文件，允许 DBA 审查和手动调整。它支持事务性迁移和分步迁移（step-by-step）。

**drizzle-zod** 利用 Drizzle 的列类型定义自动推导 Zod Schema，实现"单源真相"（Single Source of Truth）：

```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { users } from './schema'

const insertUserSchema = createInsertSchema(users)
// 自动推导: { email: string, name?: string | null }

const selectUserSchema = createSelectSchema(users)
// 自动推导: { id: number, email: string, name: string | null }
```

**Drizzle ORM 性能**：在 2024-2025 年的独立基准测试中，Drizzle 的查询速度比 Prisma 快 2-5 倍（简单查询），内存占用仅为 Prisma Client 的 1/5 到 1/10。这得益于其无引擎、无代码生成的轻量架构。


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

const user = await db.query.users.findFirst({
  where: eq(users.email, 'user@example.com'),
  with: { posts: true }
})

// 或使用 SQL-like 语法
const result = await db.select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .where(eq(users.email, 'user@example.com'))
```

### TypeORM

```bash
npm install typeorm reflect-metadata pg
```

- **定位**: 受 Java Hibernate 启发的 ORM
- **核心设计**: Decorator / Repository 模式
- **优势**:
  - 成熟的生态
  - Active Record / Data Mapper 双模式
  - 装饰器语法熟悉感
  - 查询构建器强大
- **劣势**: 类型安全不够完善、装饰器元数据开销
- **适用场景**: 熟悉 Java ORM 的开发者、遗留项目

```typescript
// entity/User.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Post } from './Post'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  name: string

  @OneToMany(() => Post, post => post.author)
  posts: Post[]
}

// entity/Post.ts
@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @ManyToOne(() => User, user => user.posts)
  author: User
}
```

```typescript
// 使用示例
const userRepository = AppDataSource.getRepository(User)

const user = await userRepository.save({
  email: 'user@example.com',
  posts: [{ title: 'Hello World' }]
})

const userWithPosts = await userRepository.findOne({
  where: { email: 'user@example.com' },
  relations: { posts: true }
})
```

## 功能对比详解

| 功能 | Prisma | Drizzle | TypeORM | Kysely | MikroORM | Sequelize |
|------|--------|---------|---------|--------|----------|-----------|
| **数据库支持** | PostgreSQL, MySQL, SQLite, SQL Server, MongoDB | PostgreSQL, MySQL, SQLite, 更多 | PostgreSQL, MySQL, SQLite, MongoDB, Oracle, MSSQL | PostgreSQL, MySQL, SQLite, 更多 | PostgreSQL, MySQL, SQLite, MongoDB | PostgreSQL, MySQL, SQLite, MSSQL, MariaDB, DB2, Snowflake |
| **迁移方式** | 命令行自动生成 | Drizzle Kit (SQL/代码) | 命令行 / 代码生成 | 无官方工具 (kysely-ctl) | 命令行自动生成 | Sequelize CLI / Umzug |
| **关系处理** | 声明式，自动关联 | SQL-like 或 ORM 风格 | Decorator 定义 | 手动 JOIN | Decorator / 配置文件 | Model 定义 |
| **原始 SQL** | `$queryRaw` / `$executeRaw` | `db.execute()` | `query()` | 原生构建器 | `em.createQueryBuilder()` | `sequelize.query()` |
| **事务** | 嵌套事务支持 | 标准事务 | 标准事务 | 标准事务 | 嵌套事务支持 | 标准事务 |
| **连接池** | 内置 | 依赖驱动 | 内置 | 依赖驱动 | 内置 | 内置 |
| **订阅/监听** | Pulse (付费) | 不支持 | 支持 | 不支持 | EventManager | 支持 |
| **Unit of Work** | ❌ | ❌ | ⚠️ 有限 | ❌ | ✅ 原生 | ❌ |
| **Identity Map** | ❌ | ❌ | ❌ | ❌ | ✅ 原生 | ❌ |
| **查询缓存** | Accelerate | 依赖外部 | 依赖外部 | 无 | 内置二级缓存 | 无 |

## 类型安全对比

| 场景 | Prisma | Drizzle | TypeORM | Kysely | MikroORM | Sequelize |
|------|--------|---------|---------|--------|----------|-----------|
| **自动生成类型** | ✅ 完整 | ✅ 完整 | ⚠️ 部分 | ✅ 完整 | ⚠️ 部分 | ❌ 手动 |
| **查询返回值类型** | ⭐⭐⭐ 精确 | ⭐⭐⭐ 精确 | ⭐⭐ 良好 | ⭐⭐⭐ 精确 | ⭐⭐ 良好 | ⭐ 弱 |
| **关系类型** | ⭐⭐⭐ 自动 | ⭐⭐⭐ 自动 | ⭐⭐ 需配置 | ❌ 手动 | ⭐⭐ 需配置 | ⭐ 弱 |
| **部分选择类型** | ⭐⭐⭐ 支持 | ⭐⭐ 部分支持 | ⭐⭐ 需手动 | ⭐⭐⭐ 支持 | ⭐⭐ 需手动 | ❌ 不支持 |
| **聚合函数类型** | ⭐⭐⭐ 精确 | ⭐⭐⭐ 精确 | ⭐⭐ 一般 | ⭐⭐⭐ 精确 | ⭐⭐ 一般 | ⭐ 弱 |
| **编译时列名校验** | ✅ 支持 | ✅ 支持 | ⚠️ 部分 | ✅ 支持 | ⚠️ 部分 | ❌ 不支持 |

## 性能对比

| 指标 | Prisma | Drizzle | TypeORM | Kysely | MikroORM | Sequelize |
|------|--------|---------|---------|--------|----------|-----------|
| **查询速度** | 中 (引擎开销) | ⭐⭐⭐ 快 (轻量) | 中 | ⭐⭐⭐ 极快 | 中 | 慢 (冗余封装) |
| **内存占用** | 中 (~30MB) | 低 (~5MB) | 高 (~40MB+) | 极低 (~2MB) | 中 (~15MB) | 高 (~35MB) |
| **冷启动** | 慢 (300-800ms) | 快 (50-150ms) | 中 (150-300ms) | 极快 (<50ms) | 中 (200-400ms) | 慢 (300-600ms) |
| **边缘运行** | ❌ (需 Accelerate) | ✅ 原生 | ❌ | ✅ 原生 | ⚠️ 实验性 | ❌ |
| **并发连接处理** | ⭐⭐⭐ (Accelerate) | ⭐⭐ 依赖驱动 | ⭐⭐ 内置池 | ⭐⭐ 依赖驱动 | ⭐⭐⭐ | ⭐⭐ |

> **数据来源**: 基于 2024-2025 年独立基准测试（drizzle-team/benchmarks、 prisma/benchmarks 社区复刻版），实际数据因 Node.js 版本、数据库类型、查询复杂度而异。内存占用为加载 ORM 并执行 100 次简单 SELECT 后的 RSS 增量估算。

## 选型建议

| 场景 | 推荐 |
|------|------|
| 追求极致类型安全 | Prisma |
| 边缘计算 / Serverless | Drizzle |
| 性能敏感 | Drizzle |
| 复杂企业应用 | Prisma 或 TypeORM |
| 喜欢 SQL | Drizzle |
| 熟悉 Java Hibernate | TypeORM |
| 需要可视化工具 | Prisma |
| 新项目启动 | Prisma 或 Drizzle |

## 其他 ORM / 查询构建器

### Kysely

```bash
npm install kysely pg
```

**定位**: 类型安全的 SQL 查询构建器

- **优势**: 完全类型安全、SQL 优先、无运行时开销、Edge 兼容
- **劣势**: 无迁移工具、无关系自动处理
- **适用**: 喜欢 SQL、需要极致控制

#### Kysely 类型安全查询构建器深度

Kysely 是目前 TypeScript 生态中类型安全级别最高的查询构建器。它通过泛型 `Database` 接口实现表名、列名、类型的三重校验：

```typescript
interface Database {
  users: {
    id: Generated<number>
    email: string
    name: string | null
    created_at: ColumnType<Date, string | undefined, never>
  }
  posts: {
    id: Generated<number>
    title: string
    author_id: number
  }
}
```

**编译时类型检查示例**：

```typescript
// ❌ 编译错误: 'emial' 不存在于 'users' 表
await db.selectFrom('users').select('emial').execute()

// ❌ 编译错误: 'users' 表没有 'content' 列
await db.selectFrom('users').innerJoin('posts', 'posts.id', 'users.content')

// ✅ 返回类型自动推导为 { id: number; email: string } | undefined
const user = await db.selectFrom('users')
  .where('email', '=', 'test@example.com')
  .select(['id', 'email'])
  .executeTakeFirst()
```

**Kysely vs Drizzle 对比**

| 维度 | Kysely | Drizzle ORM |
|------|--------|-------------|
| **定位** | 查询构建器 | ORM |
| **关系处理** | 手动 JOIN | 自动关系（relations API） |
| **迁移工具** | 无官方工具（可用 kysely-ctl） | Drizzle Kit |
| **Schema 定义** | 接口 / 类型 | 运行时 Schema 对象 |
| **查询风格** | 链式方法 | SQL-like / ORM 风格 |
| **包大小** | ~100KB | ~500KB |
| **Edge 支持** | ✅ 原生 | ✅ 原生 |
| **冷启动** | 极快 | 快 |

Kysely 适合"我想写类型安全的 SQL"的开发者；Drizzle 适合"我想要 ORM 的便利但保持 SQL 透明"的开发者。


```ts
import { Kysely, PostgresDialect } from 'kysely'

const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
})

const user = await db.selectFrom('users')
  .where('email', '=', 'test@example.com')
  .selectAll()
  .executeTakeFirst()
```

### MikroORM

```bash
npm install @mikro-orm/core @mikro-orm/postgresql
```

**定位**: 受 PHP Doctrine 启发的 ORM

- **优势**: Data Mapper 模式、Unit of Work、Identity Map
- **劣势**: 学习曲线陡峭、社区较小

#### MikroORM 核心模式深度

**Unit of Work（工作单元）**

MikroORM 实现经典的 Unit of Work 模式，所有实体变更在 `flush()` 调用前被延迟执行。这允许 ORM 自动批处理写入、检测变更（Change Tracking）并优化 SQL 生成：

```typescript
const author = await em.findOne(Author, 1)
author.name = 'Updated Name'        // 仅标记变更，不发 SQL
const newBook = new Book('New Book')
author.books.add(newBook)          // 仅关联变更，不发 SQL

await em.flush()                   // 批量执行: UPDATE + INSERT
```

这种延迟写入在复杂事务中可显著减少数据库往返次数，但也要求开发者显式管理 `flush()` 时机。

**Identity Map（标识映射）**

在同一 `EntityManager` 会话内，MikroORM 保证同一主键只对应一个实体实例。这避免了"同一行数据多个对象"的不一致问题：

```typescript
const a1 = await em.findOne(Author, 1)
const a2 = await em.findOne(Author, 1)
console.log(a1 === a2) // true — 同一引用
```

**复杂关系支持**

MikroORM 在关系处理上比 Drizzle/Prisma 更灵活，支持：

- 多态关联（Polymorphic Associations）
- 嵌入实体（Embeddables）
- 级联持久化与孤儿删除的细粒度控制
- 懒加载与贪婪加载的策略配置
- 命名策略自定义（Naming Strategy）

| 特性 | MikroORM | Prisma | Drizzle |
|------|----------|--------|---------|
| Unit of Work | ✅ 原生 | ❌ | ❌ |
| Identity Map | ✅ 原生 | ❌ | ❌ |
| 变更跟踪 | ✅ 自动 | ❌ 手动 flush | ❌ 立即执行 |
| 多态关联 | ✅ 支持 | ⚠️ 有限 | ⚠️ 有限 |


### Sequelize

```bash
npm install sequelize pg
```

**定位**: 老牌 Node.js ORM

- **优势**: 历史悠久、文档丰富、支持多数据库
- **劣势**: 类型安全差、维护模式、新功能缓慢

#### Sequelize 历史地位与现状

**历史地位**

Sequelize 是 Node.js 生态最早的成熟 ORM 之一（v1.0 发布于 2010 年），长期占据 npm 周下载量榜首（峰值超过 200 万/周）。它定义了 Node.js ORM 的基础范式：

- 模型定义 API（`sequelize.define` / `class extends Model`）
- 查询链式接口（`.where()`、`.include()`）
- 迁移系统（Sequelize CLI / Umzug）
- 作用域（Scopes）与钩子（Hooks）

**维护模式分析**

自 2022 年起，Sequelize 进入"社区维护"状态：

- v7（代号 "Snowflake"）开发停滞，TypeScript 重写计划未完成
- 核心贡献者流失，Issue 和 PR 积压严重
- 新功能开发几乎停止，以 bug 修复和安全补丁为主
- 周下载量从峰值 200 万+ 回落至约 80 万（2026 年数据）

**迁移建议**

| 原系统 | 目标 | 迁移路径 | 难度 |
|--------|------|----------|------|
| Sequelize + JavaScript | Prisma | 先用 `prisma db pull` 生成 Schema，再逐模型替换 | 中 |
| Sequelize + TypeScript | Drizzle | Drizzle Kit `pull` + 手动调整类型映射 | 中 |
| Sequelize 复杂关联 | TypeORM | 模式最接近，迁移成本较低 | 低-中 |

对于大型遗留项目，建议采用"绞杀者模式"（Strangler Fig Pattern）：新功能使用新 ORM，旧模型逐步替换，而非一次性重写。


### Waterline

```bash
npm install waterline sails-disk
```

**定位**: Sails.js 框架默认 ORM，数据库适配器架构

| 指标 | 数据 |
|------|------|
| **GitHub Stars** | 5.3k+ (sailsjs/waterline) |
| **版本状态** | v0.15.x，维护模式 |
| **适用场景** | 遗留 Sails.js 项目 |

- **优势**: 适配器模式支持多种数据库（MongoDB、MySQL、PostgreSQL、Redis），与 Sails.js 深度集成
- **劣势**: 类型安全缺失，社区活跃度低，已不被推荐用于新项目
- **趋势**: 随着 Sails.js 使用量下降，Waterline 生态萎缩，建议迁移至 Prisma 或 Drizzle

### Objection.js

```bash
npm install objection knex
```

**定位**: 基于 Knex 的层级 ORM（Layered ORM）

| 指标 | 数据 |
|------|------|
| **GitHub Stars** | 9k+ |
| **版本状态** | v3.1.x，稳定维护 |
| **适用场景** | 喜欢 Knex 但需要关系模型的项目 |

- **优势**: 构建于 Knex 之上，继承其查询能力；支持 GraphQL 风格的嵌套关系查询；模型验证（JSON Schema / Joi / Yup）
- **劣势**: 需要同时理解 Knex 和 Objection 两层 API；TypeScript 支持良好但不如 Drizzle 精确
- **关系查询示例**:

```typescript
const people = await Person.query()
  .withGraphFetched('[pets(selectName), children.[pets, movies]]')
  .modifiers({
    selectName(builder) { builder.select('name') }
  })
```

### Bookshelf

```bash
npm install bookshelf knex
```

**定位**: 基于 Knex 的轻量 ORM，灵感来自 Backbone.js

| 指标 | 数据 |
|------|------|
| **GitHub Stars** | 6.3k+ |
| **版本状态** | v1.2.x，维护模式 |
| **适用场景** | 小型遗留项目 |

- **优势**: API 简洁，基于 Promise，熟悉 Backbone.js 的开发者容易上手
- **劣势**: TypeScript 支持薄弱（依赖社区类型定义），无官方迁移工具，活跃维护停滞
- **趋势**: 被 Objection.js 和 Drizzle 取代，不建议新项目采用

---

## ORM 生态全景

| 工具 | Stars | 类型 | 包大小 | Edge | 2026 状态 |
|------|-------|------|--------|:----:|:---------:|
| **Prisma** | 41k+ | Schema-first | ~15MB | ❌ | 🟢 首选 |
| **Drizzle** | 24k+ | SQL-first | ~500KB | ✅ | 🟢 增长 |
| **TypeORM** | 34k+ | Decorator | ~1MB | ❌ | 🟡 存量 |
| **Kysely** | 12k+ | Query Builder | ~100KB | ✅ | 🟢 增长 |
| **MikroORM** | 8k+ | Data Mapper | ~500KB | ⚠️ | 🟡 小众 |
| **Sequelize** | 29k+ | Active Record | ~1MB | ❌ | 🟡 维护 |
| **Knex** | 18k+ | Query Builder | ~200KB | ✅ | 🟡 稳定 |
| **Objection.js** | 9k+ | Layered ORM | ~100KB + Knex | ✅ | 🟡 稳定 |
| **Waterline** | 5.3k+ | Adapter ORM | ~300KB | ❌ | 🔴 萎缩 |
| **Bookshelf** | 6.3k+ | Active Record | ~50KB + Knex | ✅ | 🔴 维护 |

---

## Edge ORM 支持详解

Edge Runtime（Cloudflare Workers、Vercel Edge Functions、Deno Deploy）对 ORM 有特殊限制：无 Node.js 原生模块、无文件系统、严格的包大小限制。

| ORM | Edge 兼容性 | 实现方式 | 限制 | 适用平台 |
|-----|:-----------:|----------|------|----------|
| **Prisma** | ⚠️ 间接 | Prisma Accelerate (代理) | 查询需走网络代理，增加延迟 | Vercel Edge, Cloudflare Workers |
| **Drizzle** | ✅ 原生 | 纯 JS/TS，无原生依赖 | 无 | Cloudflare Workers, Vercel Edge, Deno Deploy |
| **Kysely** | ✅ 原生 | 纯 JS/TS，无原生依赖 | 无 | Cloudflare Workers, Vercel Edge, Deno Deploy |
| **TypeORM** | ❌ | 依赖 reflect-metadata 和驱动原生模块 | 无法运行在 Edge | — |
| **MikroORM** | ⚠️ 实验性 | 部分驱动支持 WebSocket | 不稳定 | 有限平台 |

**Drizzle Edge 最佳实践**：

```typescript
import { drizzle } from 'drizzle-orm/neon-serverless'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

// 在 Cloudflare Worker 中直接使用
export default {
  async fetch(request) {
    const users = await db.select().from(usersTable)
    return Response.json(users)
  }
}
```

**Prisma Edge 方案**：Prisma Client 本身无法在 Edge 运行，必须通过 Prisma Accelerate 的 HTTP 代理层转发查询。这增加了约 20-50ms 的网络延迟，但保持了 Prisma 的类型安全和 API 体验。

---

## 查询构建器 vs ORM 深度对比

| 维度 | Raw SQL | Kysely (Query Builder) | Knex (Query Builder) | Drizzle ORM | Prisma ORM |
|------|---------|------------------------|----------------------|-------------|------------|
| **类型安全** | ❌ 无 | ✅ 编译时列名/类型检查 | ⚠️ 运行时为主 | ✅ 编译时检查 | ✅ 生成式类型 |
| **SQL 透明度** | ⭐⭐⭐ 完全 | ⭐⭐⭐ 高 | ⭐⭐ 中 | ⭐⭐⭐ 高 | ⭐⭐ 中 (引擎封装) |
| **关系处理** | 手动 JOIN | 手动 JOIN | 手动 JOIN | 自动 / 手动 | 自动 |
| **迁移支持** | 手动 / 外部工具 | kysely-ctl | Knex migrations | Drizzle Kit | Prisma Migrate |
| **学习曲线** | 低 | 低-中 | 低 | 低-中 | 中 |
| **生态成熟度** | — | ⭐⭐ 增长中 | ⭐⭐⭐ 成熟 | ⭐⭐ 增长中 | ⭐⭐⭐ 成熟 |
| **Edge 兼容** | ✅ | ✅ | ✅ | ✅ | ⚠️ 间接 |

**选型公式**：

- 团队 SQL 强 + 控制欲高 → **Kysely** 或 **Raw SQL**
- 团队 SQL 强 + 想要 ORM 便利 → **Drizzle**
- 团队 SQL 弱 + 追求类型安全 → **Prisma**
- 遗留项目 / 快速原型 → **Knex** 或 **TypeORM**

---

## 性能基准测试详情

> 以下数据综合自社区基准测试（drizzle-team/benchmarks、 prisma-community/benchmarks）及 2025 年独立评测，执行环境：Node.js 22, PostgreSQL 16, 本地连接。

### 简单查询（SELECT 单条记录）

| ORM | 吞吐量 (ops/sec) | 相对倍数 |
|-----|------------------|----------|
| **pg (raw)** | ~45,000 | 1.0x |
| **Kysely** | ~42,000 | 0.93x |
| **Drizzle** | ~40,000 | 0.89x |
| **MikroORM** | ~18,000 | 0.40x |
| **Prisma** | ~15,000 | 0.33x |
| **TypeORM** | ~12,000 | 0.27x |
| **Sequelize** | ~8,000 | 0.18x |

### 复杂查询（3 表 JOIN + 聚合）

| ORM | 吞吐量 (ops/sec) | 相对倍数 |
|-----|------------------|----------|
| **pg (raw)** | ~12,000 | 1.0x |
| **Drizzle** | ~11,000 | 0.92x |
| **Kysely** | ~10,500 | 0.88x |
| **Prisma** | ~6,000 | 0.50x |
| **TypeORM** | ~4,500 | 0.38x |
| **MikroORM** | ~4,000 | 0.33x |
| **Sequelize** | ~2,500 | 0.21x |

### 冷启动时间（首次 import + 简单查询）

| ORM | 时间 | 说明 |
|-----|------|------|
| **Kysely** | ~15ms | 无代码生成，纯导入 |
| **Drizzle** | ~25ms | 无引擎，Schema 对象导入 |
| **Knex** | ~40ms | 轻量初始化 |
| **TypeORM** | ~180ms | reflect-metadata + 元数据扫描 |
| **MikroORM** | ~220ms | 元数据发现 + 缓存构建 |
| **Prisma** | ~500ms | Query Engine 二进制启动 |
| **Sequelize** | ~350ms | 模型初始化 + 连接建立 |

> **数据标注**: 冷启动在 Serverless 场景至关重要。Prisma 的 ~500ms 冷启动可通过 Accelerate 的边缘缓存降至 <50ms（网络延迟另计）。Drizzle/Kysely 的原生 Edge 支持使其在 Workers 环境无需额外优化。

---

## 2026 趋势

| 趋势 | 描述 | 影响度 |
|------|------|:------:|
| **Drizzle 持续崛起** | Stars 增速位列 ORM 第一（2025 年 +12k），Edge 原生 + SQL-like 语法成为全栈框架默认选择（如 Astro DB、Nuxt Hub）。Drizzle Kit 迁移体验逼近 Prisma。 | 🔥 高 |
| **Prisma 地位稳固** | 企业级市场首选，Prisma Accelerate 和 Pulse 形成付费护城河。但 Edge 场景依赖代理方案，成本与延迟劣势明显。社区对"开源核心 + 付费周边"模式的接受度良好。 | 🔥 高 |
| **Kysely 差异化增长** | 不争夺 ORM 市场，专注"类型安全 SQL"。在微服务架构和复杂报表场景中获得专业开发者青睐。与 Drizzle 的竞争/互补关系逐渐清晰。 | 🚀 中 |
| **TypeORM 存量维护** | 无重大版本更新计划，v0.3.x 进入 LTS 状态。新项目采用率持续下降，但存量企业项目体量依然庞大。 | 📉 中 |
| **Sequelize 衰退加速** | 周下载量持续下滑，无 v7 明确时间表。社区 forks（如 Sequelize-TS）未能形成主流。长期将被现代 ORM 完全替代。 | 📉 高 |
| **MikroORM 小众深耕** | Unit of Work 和 Identity Map 模式吸引来自 Java/.NET 背景的企业开发者。社区虽小但粘性极高，月下载量稳定在 15 万+。 | 📊 低 |
| **Edge ORM 成为标配** | Cloudflare Workers、Vercel Edge 的采用率上升推动 Drizzle/Kysely 成为边缘计算默认数据库方案。Prisma 的 Edge 代理方案难以扭转劣势。 | 🚀 高 |
| **ORM + 验证一体化** | drizzle-zod、prisma-zod-schema 等工具推动"Schema 即验证"趋势，减少重复类型定义。2026 年预计成为新 ORM 的标配能力。 | 🚀 中 |
| **AI 辅助查询优化** | Prisma Optimize 引入 AI 索引建议，类似工具将扩展到其他 ORM。查询性能优化从经验驱动转向数据驱动。 | 📊 低-中 |

---

## 迁移建议

### TypeORM → Prisma

- 使用 `prisma db pull` 从现有数据库生成 Schema
- 重写 Repository 层为 Prisma Client
- 注意：TypeORM 的 `@JoinTable` 多对多关联在 Prisma 中需显式定义连接表模型
- 迁移周期：中型项目约 2-4 周

### Prisma → Drizzle

- Drizzle Kit 支持从数据库生成 Schema：`drizzle-kit introspect`
- 查询语法需要重写为 SQL-like（Prisma 的嵌套 `include` → Drizzle 的 `with` 或手动 JOIN）
- 移除 Prisma Client 生成步骤，直接导入 Schema 对象
- 注意：Prisma 的中间表隐式处理在 Drizzle 中需显式定义
- 迁移周期：中型项目约 1-3 周

### Sequelize → 现代 ORM

- 先迁移至 Prisma (Schema 生成)
- 或逐步替换为 Drizzle/Kysely
- 建议采用"绞杀者模式"：新模块用新 ORM，旧模块包裹适配器逐步替换
- Sequelize 的 Hooks 和 Scopes 需在目标 ORM 中手动重建

### 通用迁移检查清单

- [ ] 数据库 Schema 映射与类型对齐
- [ ] 关联关系（1:N, N:M, 自关联）的等价实现
- [ ] 事务边界与隔离级别的测试验证
- [ ] 查询性能基线对比（迁移前后吞吐量测试）
- [ ] 迁移脚本与数据一致性校验
- [ ] 回滚方案准备

---

## 扩展选型决策树

```
开始选型
│
├─ 运行在 Edge (Cloudflare Workers / Vercel Edge)?
│  ├─ YES → Drizzle 或 Kysely（原生支持，零开销）
│  └─ NO → 继续
│
├─ 团队 SQL 熟练度如何?
│  ├─ 高 + 追求控制 → Kysely（查询构建器）或 Drizzle
│  ├─ 中 + 想要便利 → Drizzle（SQL-like ORM）
│  └─ 低 + 追求安全 → Prisma（Schema-first，类型最强）
│
├─ 项目类型?
│  ├─ 快速原型 / MVP → Prisma（Studio + 自动生成最快）
│  ├─ 复杂企业应用 + 遗留迁移 → TypeORM（模式最接近 Java Hibernate）
│  ├─ 微服务 + 高性能 → Drizzle 或 Kysely
│  └─ 单元测试密集 + DDD → MikroORM（Unit of Work + Identity Map）
│
├─ 是否需要可视化工具?
│  ├─ YES → Prisma Studio（唯一成熟方案）
│  └─ NO → 继续
│
├─ 是否需要实时订阅 (Realtime)?
│  ├─ YES + 预算充足 → Prisma Pulse
│  ├─ YES + 自建 → 数据库 Logical Replication + Drizzle/Kysely 消费
│  └─ NO → 继续
│
├─ 包大小敏感? (Serverless  Bundle Size)
│  ├─ YES (< 1MB) → Drizzle (~500KB) 或 Kysely (~100KB)
│  └─ NO → Prisma / TypeORM 均可
│
└─ 最终默认推荐
   ├─ 新项目 (2026) → Drizzle（全场景覆盖，增长最快）
   └─ 企业级传统后端 → Prisma（生态最成熟，团队风险最低）
```

### 按场景速查表

| 场景 | 第一选择 | 第二选择 | 避免使用 |
|------|----------|----------|----------|
| Edge / Serverless | Drizzle | Kysely | Prisma (原生), TypeORM |
| 全栈框架集成 (Next.js / Nuxt) | Drizzle | Prisma | Sequelize |
| 复杂关联 + DDD | MikroORM | TypeORM | Kysely |
| 实时数据推送 | Prisma + Pulse | 自建 + Drizzle | Sequelize |
| 高并发读密集型 | Drizzle + 连接池 | Kysely | Prisma (无 Accelerate) |
| 遗留系统维护 | TypeORM | Sequelize | — |
| 零基础快速启动 | Prisma | Drizzle | MikroORM |
