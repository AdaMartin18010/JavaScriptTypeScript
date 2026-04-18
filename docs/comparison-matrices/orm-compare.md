# ORM 对比矩阵

> 最后更新：2026年4月

## 核心对比表

| 特性 | Prisma | Drizzle | TypeORM |
|------|--------|---------|---------|
| **GitHub Stars** | 46k | 34k | 36k |
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

| 功能 | Prisma | Drizzle | TypeORM |
|------|--------|---------|---------|
| **数据库支持** | PostgreSQL, MySQL, SQLite, SQL Server, MongoDB | PostgreSQL, MySQL, SQLite, 更多 | PostgreSQL, MySQL, SQLite, MongoDB, Oracle, MSSQL |
| **迁移方式** | 命令行自动生成 | SQL 文件 / 代码生成 | 命令行 / 代码生成 |
| **关系处理** | 声明式，自动关联 | SQL-like 或 ORM 风格 | Decorator 定义 |
| **原始 SQL** | `$queryRaw` / `$executeRaw` | `db.execute()` | `query()` |
| **事务** | 嵌套事务支持 | 标准事务 | 标准事务 |
| **连接池** | 内置 | 依赖驱动 | 内置 |
| **订阅/监听** | 不支持 | 不支持 | 支持 |

## 类型安全对比

| 场景 | Prisma | Drizzle | TypeORM |
|------|--------|---------|---------|
| **自动生成类型** | ✅ 完整 | ✅ 完整 | ⚠️ 部分 |
| **查询返回值类型** | ⭐⭐⭐ 精确 | ⭐⭐⭐ 精确 | ⭐⭐ 良好 |
| **关系类型** | ⭐⭐⭐ 自动 | ⭐⭐⭐ 自动 | ⭐⭐ 需配置 |
| **部分选择类型** | ⭐⭐⭐ 支持 | ⭐⭐ 部分支持 | ⭐⭐ 需手动 |

## 性能对比

| 指标 | Prisma | Drizzle | TypeORM |
|------|--------|---------|---------|
| **查询速度** | 中 (引擎开销) | 快 (轻量) | 中 |
| **内存占用** | 中 | 低 | 高 |
| **冷启动** | 慢 (引擎) | 快 | 中 |
| **边缘运行** | ❌ | ✅ | ❌ |

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

## 迁移建议

### TypeORM → Prisma

- 使用 `prisma db pull` 从现有数据库生成 Schema
- 重写 Repository 层为 Prisma Client

### Prisma → Drizzle

- Drizzle Kit 支持从数据库生成 Schema
- 查询语法需要重写为 SQL-like
