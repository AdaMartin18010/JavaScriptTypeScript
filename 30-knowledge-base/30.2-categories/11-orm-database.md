---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
> **⚠️ 维度边界说明**
>
> 本文档属于 **技术基础设施（Technical Infrastructure）** 维度，聚焦 ORM、查询构建器与数据库客户端工具链。
>
> - ✅ **属于本文档范围**：ORM 框架（Prisma、Drizzle、TypeORM）、查询构建器（Kysely、Knex）、数据库驱动（pg、mysql2）、边缘数据库客户端。
> - ❌ **不属于本文档范围**：具体应用的数据库 Schema 设计、领域模型定义、业务数据访问层实现。
> - 🔗 **相关索引**：[`docs/infrastructure-index.md`](../infrastructure-index.md)

# ORM 与数据库库

> 本文档梳理 TypeScript/JavaScript 生态中的 ORM、查询构建器和数据库工具，数据参考自 GitHub Stars 及官方文档（2026年4月）

---

## 📊 整体概览

| 类别 | 库 | Stars | 特点 |
|------|-----|-------|------|
| **TypeScript ORM** | Prisma 7 | 48k+ | ⭐ 下一代ORM，WASM引擎，原生Edge支持 |
| | Drizzle ORM | 40k+ | 🔥 SQL风格，~7KB，零生成步骤 |
| | ZenStack | 4k+ | 🔐 Prisma兼容 + 声明式访问控制 |
| | MikroORM | 8k+ | 📦 数据映射模式，Unit of Work |
| | TypeORM | 36k+ | 🏢 企业级，装饰器驱动（维护模式）|
| | Sequelize | 29k+ | ⛓️ 老牌ORM（维护模式，新项目不推荐）|
| **MongoDB ODM** | Mongoose | 27k+ | 🍃 MongoDB官方ODM |
| **查询构建器** | Knex.js | 19k+ | 🔧 灵活SQL构建 |
| | Kysely | 10k+ | 📝 类型安全SQL |
| | Objection.js | 15k+ | ⚡ 基于Knex的ORM |
| **数据库客户端** | pg | 14k+ | 🐘 PostgreSQL官方 |
| | mysql2 | 5k+ | 🐬 MySQL高性能 |
| | ioredis | 14k+ | ⚡ Redis客户端 |
| **Edge/嵌入式** | better-sqlite3 | 8k+ | 🪶 同步SQLite |
| | @libsql/client | 3k+ | 🌐 Turso SQLite at Edge |

---

## 1. TypeScript ORM

### 1.1 Prisma 7

| 属性 | 详情 |
|------|------|
| **名称** | Prisma |
| **Stars** | ⭐ 48,000+ |
| **GitHub** | [prisma/prisma](https://github.com/prisma/prisma) |
| **官网** | [prisma.io](https://www.prisma.io) |
| **npm** | `prisma`, `@prisma/client` |
| **许可证** | Apache-2.0 |

**一句话描述**：Prisma 7 彻底移除 Rust Query Engine 二进制依赖，改用 TypeScript/WASM 实现，bundle 从 ~14MB 降至 ~1.6MB，并原生支持 Edge Runtime。

**核心特点**：

- **WASM Query Engine（v7 重大升级）**: 无原生二进制文件，容器/Serverless 镜像显著缩小
- **类型检查加速（v7）**: Schema 编译与类型生成速度提升约 70%
- **Schema-first 设计**：通过 `.prisma` 文件定义数据模型，单文件数据源
- **类型安全查询**：自动生成的 Prisma Client 提供完整的 TypeScript 类型支持
- **Prisma Migrate**：声明式数据库迁移，支持版本控制
- **Prisma Studio**：可视化数据库管理 GUI
- **多数据库支持**：PostgreSQL、MySQL、MariaDB、SQLite、SQL Server、MongoDB、CockroachDB
- **Serverless & Edge（v7 原生）**：直接运行在 Cloudflare Workers、Vercel Edge、AWS Lambda，无需 Data Proxy

**适用场景**：

- 需要类型安全数据库访问的现代 TypeScript 项目
- 使用 Next.js、NestJS、Express 的全栈应用
- 追求开发体验和自动补全的团队
- 复杂关系型数据模型
- 2026年新项目首选 ORM 之一

**示例代码**：

```typescript
// schema.prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}

// 使用 Prisma Client
const user = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    name: 'Alice',
    posts: {
      create: { title: 'Hello World' }
    }
  },
  include: { posts: true }
})
```

---

### 1.2 Drizzle ORM

| 属性 | 详情 |
|------|------|
| **名称** | Drizzle ORM |
| **Stars** | ⭐ 40,000+ |
| **GitHub** | [drizzle-team/drizzle-orm](https://github.com/drizzle-team/drizzle-orm) |
| **官网** | [orm.drizzle.team](https://orm.drizzle.team) |
| **npm** | `drizzle-orm` |
| **许可证** | Apache-2.0 |

**一句话描述**：现代 TypeScript ORM，提供 SQL 风格的查询 API 和关系型查询 API，仅 ~7KB gzipped，零生成步骤，全平台支持。

**核心特点**：

- **SQL-like API**：直接编写类似 SQL 的 TypeScript 查询，完全透明
- **关系查询 API**：同时支持关系型数据获取方式（`db.query`）
- **极致轻量**：仅 7KB gzipped，可 Tree Shaking
- **零生成步骤**：Schema 用 TypeScript 定义，无需预编译代码生成
- **零依赖**：无原生二进制文件，纯 TypeScript/JavaScript
- **全平台支持**：Node.js、Bun、Deno、Cloudflare Workers、Edge Runtime
- **Serverless 原生**：无需数据代理，直接连接数据库
- **RLS 支持**：原生支持 PostgreSQL Row Level Security 策略
- **Drizzle Kit**：开源迁移工具（生成、推送、同步）
- **Drizzle Studio**：数据库浏览和编辑 GUI 工具
- **无 N+1（显式查询）**：join 语法明确，开发者完全掌控查询行为

**适用场景**：

- 需要 SQL 灵活性和类型安全的项目
- Serverless/Edge 环境
- 追求极致包体积和冷启动性能的应用
- 团队有 SQL 背景，希望保持 SQL 控制
- 2026年新项目首选 ORM 之一

**示例代码**：

```typescript
import { drizzle } from 'drizzle-orm/node-postgres'
import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core'
import { eq } from 'drizzle-orm'

// TypeScript Schema 定义（零生成）
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  age: integer('age')
})

const db = drizzle(client)

// SQL 风格查询
const result = await db
  .select()
  .from(users)
  .where(eq(users.age, 18))

// 关系查询
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true
  }
})
```

---

### 1.3 ZenStack

| 属性 | 详情 |
|------|------|
| **名称** | ZenStack |
| **Stars** | ⭐ 4,000+ |
| **GitHub** | [zenstackhq/zenstack](https://github.com/zenstackhq/zenstack) |
| **官网** | [zenstack.dev](https://zenstack.dev) |
| **npm** | `zenstack` |
| **许可证** | MIT |

**一句话描述**：基于 Prisma 的增强层，在 Prisma-compatible Schema 上提供声明式访问控制（`@@allow` / `@@deny`），自动生成安全的 CRUD API。

**核心特点**：

- **Prisma 兼容**：复用 Prisma Schema 语法和 Client，无缝集成
- **声明式权限**：在模型层定义 `@@allow` / `@@deny`，权限与数据模型同处一地
- **自动 API 生成**：支持生成 tRPC、REST、GraphQL 安全端点
- **前后端共享**：同一份 Schema 定义驱动前后端数据权限
- **增强 Prisma**：不牺牲 Prisma 的类型安全与生态

**适用场景**：

- B2B 多租户应用
- 需要复杂数据权限控制的 SaaS
- 快速搭建安全 CRUD 后端
- 已有 Prisma 项目，希望补充 Access Control 层

**示例代码**：

```prisma
// schema.zmodel
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  published Boolean @default(false)
  authorId  Int

  @@allow('all', auth() == author)
  @@allow('read', published == true)
}
```

---

### 1.4 MikroORM

| 属性 | 详情 |
|------|------|
| **名称** | MikroORM |
| **Stars** | ⭐ 8,000+ |
| **GitHub** | [mikro-orm/mikro-orm](https://github.com/mikro-orm/mikro-orm) |
| **官网** | [mikro-orm.io](https://mikro-orm.io) |
| **npm** | `@mikro-orm/core` |
| **许可证** | MIT |

**一句话描述**：基于 Data Mapper、Unit of Work 和 Identity Map 模式的 TypeScript ORM，支持 MongoDB 和 SQL 数据库。

**核心特点**：

- **Data Mapper 模式**：实体与数据库逻辑分离
- **Unit of Work**：自动变更追踪和批量写入
- **Identity Map**：确保同一实体在内存中只有一个实例
- **支持 libSQL**：原生支持 Turso SQLite
- **Kysely 集成**：可以使用 Kysely 进行原始查询
- **丰富的加载策略**：支持 Lazy、Eager、Joined 加载
- **Dataloader 集成**：自动解决 N+1 问题

**适用场景**：

- 复杂业务逻辑，需要对象映射的项目
- 需要 Unit of Work 模式管理事务的场景
- 使用 libSQL/Turso 的项目
- 追求数据一致性和性能的应用

**示例代码**：

```typescript
import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core'

@Entity()
export class User {
  @PrimaryKey()
  id!: number

  @Property({ unique: true })
  email!: string

  @Property({ nullable: true })
  name?: string

  @OneToMany(() => Post, post => post.author)
  posts = new Collection<Post>(this)
}

// 使用 EntityManager
const em = orm.em.fork()
const user = await em.findOne(User, 1, { populate: ['posts'] })
user.name = 'New Name'  // 自动追踪变更
await em.flush()  // 批量写入所有变更
```

---

### 1.5 TypeORM（维护模式）

| 属性 | 详情 |
|------|------|
| **名称** | TypeORM |
| **Stars** | ⭐ 36,000+ |
| **GitHub** | [typeorm/typeorm](https://github.com/typeorm/typeorm) |
| **官网** | [typeorm.io](https://typeorm.io) |
| **npm** | `typeorm` |
| **许可证** | MIT |

> ⚠️ **维护模式声明**：截至 2026年，TypeORM 核心团队活动显著减少，主要进入 bug fix 与社区 PR 维护阶段。**新项目不推荐选用**。

**一句话描述**：支持 TypeScript 和 JavaScript 的 ORM，采用装饰器驱动的实体定义，支持 Active Record 和 Data Mapper 模式。

**核心特点**：

- **装饰器驱动**：使用 TypeScript 装饰器定义实体和关系
- **双模式支持**：Active Record 和 Data Mapper 模式
- **多数据库支持**：MySQL、PostgreSQL、MariaDB、SQLite、SQL Server、Oracle、SAP Hana
- **丰富的功能**：实体管理器、仓库模式、查询构建器、迁移、订阅者
- **成熟稳定**：2016年发布，企业级应用验证
- **Eager/Lazy 加载**：灵活的关系数据加载策略

**适用场景**：

- **遗留项目维护**
- 已有大量 TypeORM 资产的团队
- **新项目请优先考虑 Prisma 7 或 Drizzle ORM**

---

### 1.6 Sequelize（维护模式）

| 属性 | 详情 |
|------|------|
| **名称** | Sequelize |
| **Stars** | ⭐ 29,000+ |
| **GitHub** | [sequelize/sequelize](https://github.com/sequelize/sequelize) |
| **官网** | [sequelize.org](https://sequelize.org) |
| **npm** | `sequelize` |
| **许可证** | MIT |

> ⚠️ **维护模式声明**：截至 2026年，Sequelize 同样处于维护模式，v7 (TypeScript 重写) 进展缓慢，社区关注度持续下降。**新项目不推荐选用**。

**适用场景**：

- **遗留项目维护**
- **新项目请优先考虑 Prisma 7 或 Drizzle ORM**

---

## 2. MongoDB ODM

### 2.1 Mongoose

| 属性 | 详情 |
|------|------|
| **名称** | Mongoose |
| **Stars** | ⭐ 27,000+ |
| **GitHub** | [Automattic/mongoose](https://github.com/Automattic/mongoose) |
| **官网** | [mongoosejs.com](https://mongoosejs.com) |
| **npm** | `mongoose` |
| **许可证** | MIT |

**一句话描述**：MongoDB 的对象数据建模（ODM）库，为 Node.js 提供优雅的 schema 验证、中间件和查询构建功能。

**核心特点**：

- **Schema 定义**：基于 Schema 的模型定义和数据验证
- **中间件支持**：Pre/Post 钩子实现自定义逻辑
- **类型转换**：自动类型转换和验证
- **查询构建**：流畅的查询 API
- **Populate**：类似 SQL join 的引用填充
- **插件系统**：丰富的社区插件生态
- **Deno 支持**：从 6.8.0 开始支持 Deno（Alpha）

**适用场景**：

- MongoDB 为主的 Node.js 项目
- 需要 schema 验证的 MongoDB 应用
- 快速原型开发和 MVP
- 已有 Mongoose 生态的项目

**示例代码**：

```typescript
import mongoose, { Schema, Document } from 'mongoose'

interface IUser extends Document {
  email: string
  name?: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: String,
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model<IUser>('User', UserSchema)

// 使用模型
const user = new User({ email: 'test@example.com', name: 'Test' })
await user.save()

// 查询
const users = await User.find({ name: /Test/i }).limit(10)
```

---

### 2.2 Prisma (MongoDB 支持)

| 属性 | 详情 |
|------|------|
| **名称** | Prisma MongoDB Connector |
| **GitHub** | [prisma/prisma](https://github.com/prisma/prisma) |
| **官网** | [prisma.io/docs/concepts/database-connectors/mongodb](https://www.prisma.io/docs/concepts/database-connectors/mongodb) |

**一句话描述**：Prisma 提供对 MongoDB 的官方支持，使用相同的 Schema 语法和类型安全 API。

**核心特点**：

- **统一 API**：与 SQL 数据库使用相同的 Prisma Client
- **类型安全**：完整的 TypeScript 类型支持
- **嵌入式文档**：支持 MongoDB 的嵌入式文档建模
- **Prisma Studio**：可视化 MongoDB 数据管理
- **Serverless 支持**：边缘和 serverless 环境兼容

**适用场景**：

- 同时使用 MongoDB 和关系型数据库的项目
- 需要类型安全 MongoDB 访问的团队
- 从 SQL 迁移到 MongoDB 的过渡项目

---

## 3. 查询构建器

### 3.1 Knex.js

| 属性 | 详情 |
|------|------|
| **名称** | Knex.js |
| **Stars** | ⭐ 19,000+ |
| **GitHub** | [knex/knex](https://github.com/knex/knex) |
| **官网** | [knexjs.org](https://knexjs.org) |
| **npm** | `knex` |
| **许可证** | MIT |

**一句话描述**：灵活、便携且有趣的 SQL 查询构建器，支持 PostgreSQL、MySQL、SQLite 等多种数据库。

**核心特点**：

- **多数据库支持**：PostgreSQL、MySQL、MariaDB、SQLite、Oracle、SQL Server
- **流式查询**：支持数据流处理
- **连接池**：内置连接池管理
- **事务支持**：支持事务和保存点
- **Promise & Callback**：双 API 设计
- **Schema 构建**：支持数据库 schema 创建和修改
- **生态丰富**：Objection.js、Bookshelf 等基于 Knex

**适用场景**：

- 需要灵活 SQL 构建的项目
- 作为 ORM 底层查询引擎
- 需要精细控制 SQL 生成的场景
- 多数据库迁移项目

**示例代码**：

```typescript
import knex from 'knex'

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL
})

// 构建查询
const users = await db('users')
  .select('id', 'name', 'email')
  .where({ active: true })
  .where('age', '>', 18)
  .orderBy('created_at', 'desc')
  .limit(10)

// 连接查询
const postsWithAuthors = await db('posts')
  .join('users', 'posts.author_id', 'users.id')
  .select('posts.*', 'users.name as author_name')
```

---

### 3.2 Kysely

| 属性 | 详情 |
|------|------|
| **名称** | Kysely |
| **Stars** | ⭐ 10,000+ |
| **GitHub** | [kysely-org/kysely](https://github.com/kysely-org/kysely) |
| **官网** | [kysely.dev](https://kysely.dev) |
| **npm** | `kysely` |
| **许可证** | MIT |

**一句话描述**：类型安全且自动补全友好的 TypeScript SQL 查询构建器，受 Knex 启发，专注于类型安全。

**核心特点**：

- **类型安全**：从数据库 schema 推断完整的查询类型
- **自动补全**：IDE 智能提示列名、表名和查询方法
- **多平台**：Node.js、Deno、Bun、浏览器
- **Kysely Codegen**：从数据库生成 TypeScript 类型
- **丰富的方言**：PostgreSQL、MySQL、SQLite、MSSQL
- **插件生态**：Prisma Kysely、PlanetScale dialect 等

**适用场景**：

- 追求极致类型安全的项目
- 需要 IDE 智能提示的 SQL 查询
- 作为 Prisma 原始查询的补充（Prisma + Kysely）
- Edge/Serverless 环境

**示例代码**：

```typescript
import { Kysely, Generated, PostgresDialect } from 'kysely'

interface Database {
  user: {
    id: Generated<number>
    email: string
    name: string | null
  }
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString })
  })
})

// 完全类型安全的查询
const user = await db
  .selectFrom('user')
  .select(['id', 'email', 'name'])
  .where('email', '=', 'test@example.com')
  .executeTakeFirst()

// 类型错误会在编译时捕获
// db.selectFrom('user').select('nonexistent_column') // ❌ 编译错误
```

---

### 3.3 Objection.js

| 属性 | 详情 |
|------|------|
| **名称** | Objection.js |
| **Stars** | ⭐ 15,000+ |
| **GitHub** | [Vincit/objection.js](https://github.com/Vincit/objection.js) |
| **官网** | [vincit.github.io/objection.js](https://vincit.github.io/objection.js) |
| **npm** | `objection` |
| **许可证** | MIT |

**一句话描述**：基于 Knex.js 构建的关系型查询构建器，提供声明式模型定义和强大的关系操作。

**核心特点**：

- **基于 Knex**：继承 Knex 的所有数据库支持
- **模型定义**：声明式定义模型和关系
- **关系操作**：强大的 Eager Loading、Graph 插入和更新
- **JSON Schema 验证**：可选的 JSON Schema 验证
- **事务支持**：简单的事务 API
- **TypeScript 支持**：完整的类型定义

**适用场景**：

- 喜欢 SQL 但需要 ORM 便利的项目
- 复杂关系数据操作
- 需要 Graph 操作（批量插入/更新关联数据）
- 基于 Knex 但需更高层抽象的迁移

**示例代码**：

```typescript
import { Model } from 'objection'

class User extends Model {
  static tableName = 'users'

  id!: number
  email!: string
  name?: string

  static relationMappings = {
    posts: {
      relation: Model.HasManyRelation,
      modelClass: Post,
      join: { from: 'users.id', to: 'posts.authorId' }
    }
  }
}

// 查询
const users = await User.query()
  .where('age', '>', 18)
  .withGraphFetched('posts')
  .orderBy('createdAt')

// Graph 插入
const inserted = await User.query().insertGraph({
  email: 'test@example.com',
  posts: [{ title: 'Hello' }, { title: 'World' }]
})
```

---

## 4. 数据库客户端

### 4.1 pg (node-postgres)

| 属性 | 详情 |
|------|------|
| **名称** | node-postgres |
| **Stars** | ⭐ 14,000+ |
| **GitHub** | [brianc/node-postgres](https://github.com/brianc/node-postgres) |
| **官网** | [node-postgres.com](https://node-postgres.com) |
| **npm** | `pg` |
| **许可证** | MIT |

**一句话描述**：PostgreSQL 的非阻塞 Node.js 客户端，纯 JavaScript 和原生 libpq 绑定两种模式。

**核心特点**：

- **纯 JS & 原生**：提供纯 JavaScript 和原生绑定两种实现
- **连接池**：内置高性能连接池
- **参数化查询**：防止 SQL 注入
- **SSL 支持**：完整 SSL/TLS 支持
- **类型解析**：自动 PostgreSQL 类型转换
- **流式查询**：支持大数据流处理
- **广泛兼容**：所有主流 PostgreSQL 版本

**适用场景**：

- 直接使用 PostgreSQL 的项目
- 需要原始 SQL 控制的高性能应用
- 作为 ORM/查询构建器的底层驱动

**示例代码**：

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// 参数化查询
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1 AND active = $2',
  ['test@example.com', true]
)

console.log(result.rows)
```

---

### 4.2 mysql2

| 属性 | 详情 |
|------|------|
| **名称** | mysql2 |
| **Stars** | ⭐ 5,000+ |
| **GitHub** | [sidorares/node-mysql2](https://github.com/sidorares/node-mysql2) |
| **官网** | [github.com/sidorares/node-mysql2](https://github.com/sidorares/node-mysql2) |
| **npm** | `mysql2` |
| **许可证** | MIT |

**一句话描述**：MySQL 客户端的快速原生绑定，支持 Promise API 和预处理语句。

**核心特点**：

- **高性能**：比 mysql 模块更快
- **Promise API**：原生 async/await 支持
- **预处理语句**：服务器端预处理语句支持
- **二进制协议**：MySQL 二进制协议实现
- **连接池**：内置连接池
- **MySQL 8**：完全支持 MySQL 8.0 认证插件

**适用场景**：

- Node.js MySQL 项目首选
- 需要高性能 MySQL 访问的应用
- 作为 ORM（如 Sequelize、TypeORM）的驱动

**示例代码**：

```typescript
import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'test'
})

// Promise API
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE id = ?',
  [1]
)

console.log(rows)
```

---

### 4.3 ioredis

| 属性 | 详情 |
|------|------|
| **名称** | ioredis |
| **Stars** | ⭐ 14,000+ |
| **GitHub** | [redis/ioredis](https://github.com/redis/ioredis) |
| **官网** | [github.com/redis/ioredis](https://github.com/redis/ioredis) |
| **npm** | `ioredis` |
| **许可证** | MIT |

**一句话描述**：健壮、高性能且功能齐全的 Redis 客户端，被阿里巴巴等公司用于生产环境。

**核心特点**：

- **集群支持**：Redis Cluster 自动故障转移
- **Sentinel 支持**：Redis Sentinel 高可用
- **管道**：自动管道批处理
- **Lua 脚本**：Lua 脚本支持
- **Pub/Sub**：发布订阅模式
- **透明 Key 前缀**：自动 Key 命名空间
- **流式 Scan**：scan、hscan 等流式迭代

**适用场景**：

- 需要 Redis 缓存的 Node.js 项目
- Redis Cluster/Sentinel 部署
- 高并发缓存和会话存储
- 实时应用（Pub/Sub）

**示例代码**：

```typescript
import Redis from 'ioredis'

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  keyPrefix: 'app:'
})

// 基本操作
await redis.set('key', 'value', 'EX', 3600)
const value = await redis.get('key')

// 管道
await redis.pipeline()
  .set('foo', 'bar')
  .get('foo')
  .exec()

// Lua 脚本
redis.defineCommand('myecho', {
  numberOfKeys: 2,
  lua: 'return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}'
})
```

---

### 4.4 @planetscale/database

| 属性 | 详情 |
|------|------|
| **名称** | PlanetScale Serverless Driver |
| **Stars** | ⭐ 500+ |
| **GitHub** | [planetscale/database-js](https://github.com/planetscale/database-js) |
| **官网** | [planetscale.com](https://planetscale.com) |
| **npm** | `@planetscale/database` |
| **许可证** | Apache-2.0 |

**一句话描述**：PlanetScale 的无服务器数据库驱动，专为 Edge 和 Serverless 环境优化。

**核心特点**：

- **HTTP 连接**：基于 HTTP 而非 TCP，适合 Serverless
- **Edge 优化**：支持 Cloudflare Workers、Vercel Edge
- **类型安全**：TypeScript 类型支持
- **事务支持**：支持数据库事务
- **Drizzle ORM 兼容**：与 Drizzle ORM 无缝集成

**适用场景**：

- PlanetScale (Vitess/MySQL) 用户
- Edge/Serverless 部署
- 需要无连接池的数据库访问

---

## 5. 嵌入式/Edge 数据库

### 5.1 边缘数据库选型对比

| 特性 | Turso (libSQL) | Neon (Postgres) | PlanetScale (MySQL) | Supabase (Postgres) | Cloudflare D1 (SQLite) |
|------|----------------|-----------------|---------------------|---------------------|------------------------|
| **底层引擎** | libSQL (SQLite fork) | PostgreSQL | Vitess (MySQL) | PostgreSQL | SQLite |
| **架构** | 全球复制，写主读副 | 存储计算分离，serverless | 存储计算分离，serverless | PostgreSQL + Realtime | 全球分布，SQLite |
| **Edge 原生** | ✅ 极佳 | ✅ 优秀 | ✅ 优秀 | ✅ 良好 | ✅ 极佳 |
| **延迟** | < 50ms (读) | < 100ms (冷启动后) | < 100ms | < 100ms | < 50ms |
| **免费 tier** | generous | generous | 有限 | generous | generous |
| **连接方式** | HTTP / libsql 协议 | TCP / 连接字符串 | HTTP (serverless driver) | TCP / 连接池 | Workers Binding |
| **ORM 推荐** | Drizzle, MikroORM | Prisma 7, Drizzle | Drizzle, Prisma 7 | Prisma 7, Drizzle | Drizzle |
| **适用场景** | 读多写少、IoT、边缘缓存 | 全栈应用、AI/向量 | 大规模MySQL迁移 | 实时应用、认证集成 | Cloudflare生态、简单CRUD |

**选型建议**：

- **Turso / libSQL**：最适合 Edge/Serverless 读多写少场景，与 Drizzle 配合体验极佳，单文件部署无连接池开销
- **Neon**：Serverless Postgres 首选，存储计算分离自动扩缩容，适合传统后端上云
- **PlanetScale**：MySQL 兼容 + Vitess 分片，适合已有 MySQL 生态且需要边缘访问的项目
- **Supabase**：PostgreSQL + 实时订阅 + Auth + Storage，全栈 Firebase 替代方案
- **Cloudflare D1**：深度绑定 Cloudflare Workers，最简单的全球 SQLite，适合 CF 生态内的轻量应用

---

### 5.2 better-sqlite3

| 属性 | 详情 |
|------|------|
| **名称** | better-sqlite3 |
| **Stars** | ⭐ 8,000+ |
| **GitHub** | [WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **官网** | [github.com/WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **npm** | `better-sqlite3` |
| **许可证** | MIT |

**一句话描述**：Node.js 最快的 SQLite3 库，采用同步 API 设计，性能远超异步替代方案。

**核心特点**：

- **同步 API**：同步操作，更简单可靠
- **高性能**：比异步 SQLite 库更快
- **简单 API**：简洁易用的接口
- **事务支持**：内置事务优化
- **用户自定义函数**：支持自定义 SQL 函数
- **预编译语句**：支持参数化查询

**适用场景**：

- 本地桌面应用
- 嵌入式系统
- 测试环境
- 需要快速 SQLite 访问的项目

**示例代码**：

```typescript
import Database from 'better-sqlite3'

const db = new Database('mydata.db')

// 预编译语句
const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)')
insert.run('Alice', 'alice@example.com')

// 事务
const insertMany = db.transaction((users) => {
  for (const user of users) insert.run(user)
})

insertMany([
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' }
])
```

---

### 5.3 libsql / Turso

| 属性 | 详情 |
|------|------|
| **名称** | libsql |
| **Stars** | ⭐ 3,000+ |
| **GitHub** | [tursodatabase/libsql](https://github.com/tursodatabase/libsql) |
| **官网** | [turso.tech](https://turso.tech) |
| **npm** | `@libsql/client` |
| **许可证** | MIT |

**一句话描述**：Turso 提供的 SQLite 分支，专为现代应用设计，支持边缘复制和加密。

**核心特点**：

- **SQLite 兼容**：完全兼容 SQLite 文件格式
- **边缘复制**：支持边缘节点数据同步
- **加密支持**：内置数据库加密
- **WASM 支持**：可在浏览器中运行
- **Serverless**：Turso 托管服务集成
- **Drizzle ORM 支持**：与 Drizzle 完美集成

**适用场景**：

- Edge/Serverless SQLite 需求
- 需要边缘缓存的项目
- 移动端和 IoT 应用
- 使用 Turso 服务的项目

**示例代码**：

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

console.log(result.rows)
```

---

## 📈 选型建议

### 按数据库类型

| 数据库 | 推荐库 |
|--------|--------|
| PostgreSQL | Prisma 7、Drizzle ORM、pg |
| MySQL | Prisma 7、Drizzle ORM、mysql2 |
| SQLite | Drizzle ORM、libsql、better-sqlite3 |
| MongoDB | Mongoose、Prisma |
| Redis | ioredis |

### 按使用场景

| 场景 | 推荐库 |
|------|--------|
| 现代全栈 TypeScript (2026新项目) | **Prisma 7** 或 **Drizzle ORM** |
| Serverless/Edge | **Drizzle ORM** + **Turso/D1/Neon** |
| 性能敏感 / 极小体积 | **Drizzle ORM** |
| 复杂数据权限 (SaaS/多租户) | **ZenStack** + **Prisma 7** |
| SQL 灵活性优先 | Knex.js、Kysely |
| 轻量级/嵌入式 | better-sqlite3、libsql |
| MongoDB 优先 | Mongoose |
| 复杂领域模型 / Unit of Work | **MikroORM** |
| 传统后端 / 托管 Postgres | **Prisma 7 + Neon** |
| 遗留项目维护 | 保持现有 ORM |

### 按部署环境

| 环境 | 推荐组合 |
|------|----------|
| Cloudflare Workers | Drizzle ORM + Cloudflare D1 / Turso |
| Vercel Edge | Drizzle ORM / Prisma 7 + Turso / Neon |
| AWS Lambda | Prisma 7 / Drizzle ORM + Neon / RDS Proxy |
| 传统 VPS / K8s | Prisma 7 / Drizzle ORM + PostgreSQL |
| 复杂领域后端 | MikroORM + PostgreSQL / Turso |

### 按团队背景

| 团队背景 | 推荐库 |
|----------|--------|
| 有 SQL 经验 | Drizzle ORM、Kysely |
| 有 ORM 经验 | Prisma 7、MikroORM |
| 追求开发体验 | Prisma 7 |
| 追求极致类型安全 | Drizzle ORM、Kysely |
| 需要快速安全 CRUD | ZenStack + Prisma 7 |
| 从其他语言迁移 | Prisma 7（Schema-first）或 Drizzle（SQL-like）|

### 配套 Schema 验证生态

ORM 通常与 Schema 验证库配合使用，实现从 API 输入到数据库的端到端类型安全：

| 验证库 | 包体积 | 特点 | 推荐搭配 |
|--------|--------|------|----------|
| **Zod** | ~12KB | 类型推导完美，生态最广（React Hook Form、tRPC、Fastify）| 通用场景 |
| **Valibot** | **<1KB** tree-shaken | Zod 轻量替代，模块化 API，边缘计算首选 | Drizzle ORM + Edge/Serverless |
| **ArkType** | ~15KB | 1ms 冷启动，TS 类型语法定义 Schema | 性能敏感场景 |

> **Valibot** 作为 Zod 的轻量替代，核心仅 <1KB（tree-shaken 后），与 Drizzle ORM 的轻量哲学高度契合，是 Cloudflare Workers、Vercel Edge 等边缘场景下 Schema 验证的首选。

---

## 🔗 参考资源

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team/docs/overview)
- [ZenStack 文档](https://zenstack.dev/docs)
- [TypeORM 官方文档](https://typeorm.io)
- [MikroORM 文档](https://mikro-orm.io/docs)
- [Knex.js 文档](https://knexjs.org/guide/)
- [Kysely 文档](https://kysely.dev/docs/intro)
- [Mongoose 文档](https://mongoosejs.com/docs)
- [PostgreSQL 官方 Node 驱动](https://node-postgres.com)
- [Turso 文档](https://docs.turso.tech)
- [Neon 文档](https://neon.tech/docs)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1)
- [JavaScript Rising Stars 2025](https://risingstars.js.org/2025/en)

---

> 📅 本文档最后更新：2026年4月
>
> 💡 提示：Stars 数据会随时间变化，建议查看 GitHub 获取最新数据。TypeORM 与 Sequelize 已进入维护模式，新项目请优先选择 Prisma 7 或 Drizzle ORM。
