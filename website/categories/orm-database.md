---
title: ORM 与数据库库
description: JavaScript/TypeScript ORM 与数据库库 完整指南
---

## 🧪 关联代码实验室

> **2** 个关联模块 · 平均成熟度：**🌳**

| 模块 | 成熟度 | 实现文件 | 测试文件 |
|------|--------|----------|----------|
| [20-database-orm](../../jsts-code-lab/20-database-orm/) | 🌳 | 5 | 4 |
| [96-orm-modern-lab](../../jsts-code-lab/96-orm-modern-lab/) | 🌿 | 4 | 1 |



> 本文档梳理 TypeScript/JavaScript 生态中的 ORM、查询构建器和数据库工具，数据参考自 GitHub Stars 及官方文档（2025年4月）

---

## 📊 整体概览

| 类别 | 库 | Stars | 特点 |
|------|-----|-------|------|
| **TypeScript ORM** | Prisma | 45.6k+ | ⭐ 下一代ORM，类型安全 |
| | Drizzle ORM | 24k+ | 🔥 SQL风格，轻量级 |
| | TypeORM | 36k+ | 🏢 企业级，装饰器驱动 |
| | MikroORM | 8k+ | 📦 数据映射模式 |
| **MongoDB ODM** | Mongoose | 27k+ | 🍃 MongoDB官方ODM |
| **查询构建器** | Knex.js | 19k+ | 🔧 灵活SQL构建 |
| | Kysely | 10k+ | 📝 类型安全SQL |
| | Objection.js | 15k+ | ⚡ 基于Knex的ORM |
| **数据库客户端** | pg | 14k+ | 🐘 PostgreSQL官方 |
| | mysql2 | 5k+ | 🐬 MySQL高性能 |
| | ioredis | 14k+ | ⚡ Redis客户端 |
| **Edge/嵌入式** | better-sqlite3 | 8k+ | 🪶 同步SQLite |
| | libsql | 3k+ | 🌐 Turso SQLite |

---

## 1. TypeScript ORM

### 1.1 Prisma

| 属性 | 详情 |
|------|------|
| **名称** | Prisma |
| **Stars** | ⭐ 45,600+ |
| **GitHub** | [prisma/prisma](https://github.com/prisma/prisma) |
| **官网** | [prisma.io](https://www.prisma.io) |
| **npm** | `prisma`, `@prisma/client` |
| **许可证** | Apache-2.0 |

**一句话描述**：下一代 Node.js 和 TypeScript ORM，提供声明式数据建模、自动生成的类型安全查询和强大的迁移系统。

**核心特点**：

- **Schema-first 设计**：通过 `.prisma` 文件定义数据模型，单文件数据源
- **类型安全查询**：自动生成的 Prisma Client 提供完整的 TypeScript 类型支持
- **Prisma Migrate**：声明式数据库迁移，支持版本控制
- **Prisma Studio**：可视化数据库管理 GUI
- **多数据库支持**：PostgreSQL、MySQL、MariaDB、SQLite、SQL Server、MongoDB、CockroachDB
- **Serverless & Edge**：支持 Cloudflare Workers、Vercel Edge、AWS Lambda

**适用场景**：

- 需要类型安全数据库访问的现代 TypeScript 项目
- 使用 Next.js、NestJS、Express 的全栈应用
- 追求开发体验和自动补全的团队
- 复杂关系型数据模型

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
| **Stars** | ⭐ 24,000+ |
| **GitHub** | [drizzle-team/drizzle-orm](https://github.com/drizzle-team/drizzle-orm) |
| **官网** | [orm.drizzle.team](https://orm.drizzle.team) |
| **npm** | `drizzle-orm` |
| **许可证** | Apache-2.0 |

**一句话描述**：现代 TypeScript ORM，提供 SQL 风格的查询 API 和关系型查询 API，仅 ~7.4KB，零依赖，全平台支持。

**核心特点**：

- **SQL-like API**：直接编写类似 SQL 的 TypeScript 查询
- **关系查询 API**：同时支持关系型数据获取方式
- **极致轻量**：仅 7.4KB minified+gzipped，可 Tree Shaking
- **零依赖**：无原生 Rust 二进制文件
- **全平台支持**：Node.js、Bun、Deno、Cloudflare Workers、Edge Runtime
- **Serverless 原生**：无需数据代理，直接连接数据库
- **Drizzle Kit**：开源迁移工具（2024年7月开源）
- **Drizzle Studio**：数据库浏览和编辑工具

**适用场景**：

- 需要 SQL 灵活性和类型安全的项目
- Serverless/Edge 环境
- 追求极致包体积和性能的应用
- 团队有 SQL 背景，希望保持 SQL 控制

**示例代码**：

```typescript
import { drizzle } from 'drizzle-orm/node-postgres'
import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core'
import { eq } from 'drizzle-orm'

// 定义表
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

### 1.3 TypeORM

| 属性 | 详情 |
|------|------|
| **名称** | TypeORM |
| **Stars** | ⭐ 36,000+ |
| **GitHub** | [typeorm/typeorm](https://github.com/typeorm/typeorm) |
| **官网** | [typeorm.io](https://typeorm.io) |
| **npm** | `typeorm` |
| **许可证** | MIT |

**一句话描述**：支持 TypeScript 和 JavaScript 的 ORM，采用装饰器驱动的实体定义，支持 Active Record 和 Data Mapper 模式。

**核心特点**：

- **装饰器驱动**：使用 TypeScript 装饰器定义实体和关系
- **双模式支持**：Active Record 和 Data Mapper 模式
- **多数据库支持**：MySQL、PostgreSQL、MariaDB、SQLite、SQL Server、Oracle、SAP Hana
- **丰富的功能**：实体管理器、仓库模式、查询构建器、迁移、订阅者
- **成熟稳定**：2016年发布，企业级应用验证
- **Eager/Lazy 加载**：灵活的关系数据加载策略

**适用场景**：

- 已有 TypeORM 项目维护
- 需要装饰器风格 ORM 的团队
- 复杂继承层次结构的实体模型
- 需要精细 SQL 控制的项目

**示例代码**：

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'

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

// 使用 Repository 模式
const userRepository = AppDataSource.getRepository(User)
const user = await userRepository.findOne({
  where: { id: 1 },
  relations: ['posts']
})
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

### 5.1 better-sqlite3

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

### 5.2 libsql

| 属性 | 详情 |
|------|------|
| **名称** | libsql |
| **Stars** | ⭐ 3,000+ |
| **GitHub** | [tursodatabase/libsql](https://github.com/tursodatabase/libsql) |
| **官网** | [turso.tech/libsql](https://turso.tech/libsql) |
| **npm** | `libsql` |
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
| PostgreSQL | Prisma、Drizzle ORM、pg |
| MySQL | Prisma、Drizzle ORM、mysql2 |
| SQLite | better-sqlite3、libsql、Drizzle ORM |
| MongoDB | Mongoose、Prisma |
| Redis | ioredis |

### 按使用场景

| 场景 | 推荐库 |
|------|--------|
| 现代全栈 TypeScript | Prisma、Drizzle ORM |
| 企业级大型应用 | TypeORM、MikroORM |
| Serverless/Edge | Drizzle ORM、libsql、@planetscale/database |
| SQL 灵活性优先 | Knex.js、Kysely |
| 轻量级/嵌入式 | better-sqlite3 |
| MongoDB 优先 | Mongoose |

### 按团队背景

| 团队背景 | 推荐库 |
|----------|--------|
| 有 SQL 经验 | Drizzle ORM、Kysely |
| 有 ORM 经验 | Prisma、TypeORM |
| 追求开发体验 | Prisma |
| 追求极致类型安全 | Drizzle ORM、Kysely |
| 从其他语言迁移 | TypeORM（类似 Java Hibernate）|

---

## 🔗 参考资源

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team/docs/overview)
- [TypeORM 官方文档](https://typeorm.io)
- [MikroORM 文档](https://mikro-orm.io/docs)
- [Knex.js 文档](https://knexjs.org/guide/)
- [Kysely 文档](https://kysely.dev/docs/intro)
- [Mongoose 文档](https://mongoosejs.com/docs)
- [PostgreSQL 官方 Node 驱动](https://node-postgres.com)
- [JavaScript Rising Stars 2024](https://risingstars.js.org/2024/en)

---

> 📅 本文档最后更新：2026年4月
>
> 💡 提示：Stars 数据会随时间变化，建议查看 GitHub 获取最新数据
