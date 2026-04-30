# 现代 ORM 实验室 — 理论基础

## 1. ORM 的本质

对象关系映射（ORM）是面向对象编程与关系型数据库之间的**阻抗匹配层**。核心问题：如何将继承、多态、集合等 OOP 概念映射到表、行、外键等关系模型。

## 2. 两种设计哲学

### 2.1 Active Record（以 Django、Rails、Prisma 早期为代表）

- 模型类即数据访问层
- 简洁直观，适合简单 CRUD
- 风险：业务逻辑与数据访问耦合

### 2.2 Data Mapper（以 TypeORM、Drizzle、SQLAlchemy 为代表）

- 实体（Entity）与仓储（Repository）分离
- 领域模型纯净，不依赖持久化细节
- 适合复杂业务领域

## 3. 现代 ORM 对比

| 维度 | Prisma | Drizzle | TypeORM | MikroORM |
|------|--------|---------|---------|----------|
| **设计哲学** | Active Record + Schema 优先 | Data Mapper + SQL-like | Data Mapper + Active Record 混合 | Data Mapper + Unit of Work |
| **类型安全** | **生成式**（Prisma Client 生成 TS 类型） | **推断式**（基于 Schema 推断） | **装饰器**（`@Entity()` + 反射） | **装饰器**（`@Entity()` + 元数据） |
| **运行时开销** | 查询引擎（Rust/GO） | **零**（纯 TS，编译为 SQL） | 中（元数据反射） | 中（Identity Map 缓存） |
| **查询风格** | 链式 API（声明式） | SQL-like 函数式 | Repository / QueryBuilder | EntityManager + QB |
| **Schema 定义** | Prisma Schema（DSL） | TS Schema（`pgTable`） | TS 装饰器 / 配置文件 | TS 装饰器 |
| **迁移工具** | Prisma Migrate（声明式） | Drizzle Kit（命令式/声明式） | TypeORM CLI（混合式） | MikroORM Migrator（混合式） |
| **关系加载** | 自动包含（`include`） | 显式选择（`with` / `leftJoin`） | `relations` / `eager` / `lazy` | 显式 `populate` |
| **边缘计算** | ✅ Prisma Accelerate / Driver Adapters | ✅ LibSQL / HTTP 驱动 | ⚠️ 需社区适配 | ❌ 不支持 |
| **原生 SQL** | `$queryRaw` / `$executeRaw` | `db.execute(sql``)` | `query()` / `QueryBuilder` | `createQueryBuilder()` |
| **连接池** | 内置（二进制引擎管理） | 依赖底层驱动（`pg`, `better-sqlite3`） | 内置（TypeORM 管理） | 内置（Knex / 原生） |
| **生态成熟度** | **极高**（最大社区、最多教程） | 高（增长最快，2024 GitHub Stars 增速第一） | 高（最老牌，企业采用广） | 中（TypeScript 优先， niche） |
| **学习曲线** | 低（Schema 直观） | 中（需理解底层 SQL） | 高（API 面宽，配置复杂） | 高（Unit of Work 心智负担） |
| **最佳场景** | 快速开发、全栈框架（Next.js） | 性能敏感、SQL 透明、边缘部署 | 企业级复杂领域、遗留系统 | 复杂领域模型、批量操作优化 |

> **选型建议**：
>
> - **快速原型 / Next.js 全栈** → Prisma（生态最佳，Vercel 深度集成）
> - **性能优先 / 边缘函数 / SQL 透明** → Drizzle（零运行时开销，SQL 即代码）
> - **企业级 DDD / 复杂关系图** → MikroORM（Unit of Work + Identity Map）
> - **遗留 Node.js 项目 / Nest.js 默认** → TypeORM（Nest 官方支持，但考虑迁移到 Prisma/Drizzle）

## 4. 代码示例：Prisma Schema + 类型安全查询

### 4.1 Prisma Schema 定义（声明式 DSL）

```prisma
// schema.prisma
// 数据源配置
 datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ========== 模型定义 ==========
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // 关系定义
  posts     Post[]
  profile   Profile?

  @@map("users")
}

model Post {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(255)
  content     String?  @db.Text
  published   Boolean  @default(false)
  viewCount   Int      @default(0) @map("view_count")
  createdAt   DateTime @default(now()) @map("created_at")

  // 外键关系
  authorId    Int      @map("author_id")
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  // 多对多：文章 ↔ 标签
  tags        Tag[]

  @@index([authorId])
  @@index([published, createdAt]) // 复合索引：已发布文章的时间线查询
  @@map("posts")
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String? @db.Text
  avatar String?

  userId Int     @unique @map("user_id")
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]

  @@map("tags")
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### 4.2 Prisma Client 类型安全查询

```typescript
// prisma-queries.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// ===== 基础 CRUD =====

async function createUser(data: Prisma.UserCreateInput) {
  // 返回类型自动推断为 User（含所有 scalar 字段）
  return prisma.user.create({ data });
}

// ===== 关系查询（自动类型展开）=====

async function getUserWithPosts(userId: number) {
  // 返回类型：User & { posts: Post[], profile: Profile | null }
  // TypeScript 在编译时即知道 posts 和 profile 的类型结构
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          tags: true, // 嵌套关系自动展开
        },
      },
      profile: true,
    },
  });
}

// ===== 聚合与分组 =====

async function getPostStatistics() {
  // 返回类型由 Prisma 生成器自动推断
  return prisma.post.groupBy({
    by: ['published'],
    _count: { id: true },
    _avg: { viewCount: true },
    _sum: { viewCount: true },
  });
}

// ===== 事务与乐观锁 =====

async function transferViewCount(fromPostId: number, toPostId: number, amount: number) {
  return prisma.$transaction(async (tx) => {
    const [from, to] = await Promise.all([
      tx.post.findUnique({ where: { id: fromPostId } }),
      tx.post.findUnique({ where: { id: toPostId } }),
    ]);

    if (!from || !to) throw new Error('Post not found');
    if (from.viewCount < amount) throw new Error('Insufficient views');

    await tx.post.update({
      where: { id: fromPostId },
      data: { viewCount: { decrement: amount } },
    });

    await tx.post.update({
      where: { id: toPostId },
      data: { viewCount: { increment: amount } },
    });
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}

// ===== 原始 SQL（类型安全的 Raw Query）=====

async function searchPostsRaw(query: string) {
  // $queryRaw 支持模板标签，自动参数化防 SQL 注入
  const results = await prisma.$queryRaw<
    Array<{ id: number; title: string; rank: number }>
  >`
    SELECT id, title, ts_rank(search_vector, plainto_tsquery('chinese', ${query})) as rank
    FROM posts
    WHERE search_vector @@ plainto_tsquery('chinese', ${query})
    ORDER BY rank DESC
    LIMIT 20
  `;
  return results;
}

// ===== 边缘计算：Prisma Accelerate（连接池代理）=====

import { withAccelerate } from '@prisma/extension-accelerate';

const prismaEdge = new PrismaClient()
  .$extends(withAccelerate({
    cacheStrategy: { ttl: 60, swr: 300 }, // 60s 缓存 + 300s 陈旧刷新
  }));

// 在边缘函数（Vercel Edge / Cloudflare Workers）中使用
async function getCachedUser(userId: number) {
  return prismaEdge.user.findUnique({
    where: { id: userId },
    cacheStrategy: { ttl: 60 },
  });
}
```

### 4.3 Drizzle 等效查询（对比参考）

```typescript
// drizzle-equivalent.ts
import { eq, desc, sql } from 'drizzle-orm';
import { users, posts, tags, postTags } from './schema';

// Drizzle 查询风格：更接近 SQL 的函数式组合
async function getUserWithPostsDrizzle(userId: number) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      posts: {
        where: eq(posts.published, true),
        orderBy: [desc(posts.createdAt)],
        limit: 10,
        with: {
          tags: true,
        },
      },
      profile: true,
    },
  });
}

// Drizzle 原始 SQL（类型安全）
async function searchPostsDrizzle(query: string) {
  return db.execute(sql`
    SELECT id, title, ts_rank(search_vector, plainto_tsquery('chinese', ${query})) as rank
    FROM ${posts}
    WHERE search_vector @@ plainto_tsquery('chinese', ${query})
    ORDER BY rank DESC
    LIMIT 20
  `);
}
```

### 4.4 MikroORM Unit of Work 模式

```typescript
// mikro-orm-example.ts — DDD 友好的 ORM
import { Entity, PrimaryKey, Property, OneToMany, Collection,
         EntityManager, Cascade } from '@mikro-orm/core';

@Entity()
class User {
  @PrimaryKey()
  id!: number;

  @Property()
  email!: string;

  @Property({ nullable: true })
  name?: string;

  @OneToMany(() => Post, post => post.author, { cascade: [Cascade.ALL] })
  posts = new Collection<Post>(this);
}

@Entity()
class Post {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  @ManyToOne(() => User)
  author!: User;
}

// Unit of Work 自动追踪变更
async function createUserWithPosts(em: EntityManager) {
  const user = new User();
  user.email = 'alice@example.com';
  user.name = 'Alice';

  const post = new Post();
  post.title = 'Hello MikroORM';
  post.author = user;
  user.posts.add(post);

  // 只需 persist 根实体，级联自动处理关联实体
  await em.persistAndFlush(user);

  // 修改实体后，flush 自动检测 dirty checking
  user.name = 'Alice Updated';
  await em.flush(); // 只更新 name 字段
}
```

### 4.5 TypeORM QueryBuilder 复杂查询

```typescript
// typeorm-querybuilder.ts — 复杂 SQL 构造
import { DataSource } from 'typeorm';

const dataSource = new DataSource({ /* ... */ });

async function getTopAuthorsWithStats() {
  return dataSource
    .getRepository(User)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post')
    .select([
      'user.id',
      'user.name',
      'COUNT(post.id) as postCount',
      'SUM(post.viewCount) as totalViews',
    ])
    .where('post.published = :published', { published: true })
    .groupBy('user.id')
    .having('COUNT(post.id) > :minPosts', { minPosts: 5 })
    .orderBy('totalViews', 'DESC')
    .limit(10)
    .getRawMany();
}

// 子查询构造
async function getUsersWithRecentPosts() {
  const subQuery = dataSource
    .createQueryBuilder()
    .select('post.authorId')
    .from(Post, 'post')
    .where('post.createdAt > :date', { date: new Date(Date.now() - 7 * 86400000) });

  return dataSource
    .getRepository(User)
    .createQueryBuilder('user')
    .where(`user.id IN (${subQuery.getQuery()})`)
    .setParameters(subQuery.getParameters())
    .getMany();
}
```

## 5. 边缘数据库适配

边缘计算环境对 ORM 提出新要求：

- **连接池限制**: 边缘函数无持久连接，需 HTTP 协议数据库（如 Turso HTTP mode）
- **WASM 编译**: Prisma 7 将查询引擎编译为 WASM，在边缘运行
- **轻量级驱动**: LibSQL（Turso）比 SQLite 更适合边缘场景

### 5.1 Drizzle + Turso 边缘配置

```typescript
// drizzle-turso-edge.ts
import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';

// 在 Cloudflare Workers 中使用 HTTP 模式连接 Turso
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);

// 查询自动通过 HTTP 传输，无需持久 TCP 连接
export async function getPostsEdge() {
  return db.select().from(posts).all();
}
```

## 6. 迁移策略

| 策略 | 特点 | 工具 |
|------|------|------|
| **声明式** | Schema 定义即真相 | Prisma Migrate、Django Migrations |
| **命令式** | 手写迁移脚本 | Flyway、Liquibase、node-pg-migrate |
| **混合式** | 声明式生成 + 手动调整 | Alembic、TypeORM Migrations |

### 6.1 Prisma 迁移工作流

```bash
# 1. 修改 schema.prisma
# 2. 生成迁移文件
npx prisma migrate dev --name add_user_role

# 3. 生成客户端类型（CI/CD 中必须）
npx prisma generate

# 4. 部署迁移到生产
npx prisma migrate deploy
```

### 6.2 Drizzle 迁移工作流

```bash
# 1. 修改 schema.ts
# 2. 生成迁移 SQL
npx drizzle-kit generate

# 3. 应用到数据库
npx drizzle-kit migrate

# 4. 可选：类型检查
npx tsc --noEmit
```

## 7. 与相邻模块的关系

- **20-database-orm**: 数据库与 ORM 基础概念
- **32-edge-computing**: 边缘环境下的数据库访问
- **93-deployment-edge-lab**: 边缘部署中的数据持久化

## 8. 权威参考链接

- [Prisma Documentation](https://www.prisma.io/docs) — Prisma 官方文档
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference) — Schema DSL 完整参考
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview) — Drizzle 官方文档
- [Drizzle vs Prisma Comparison](https://orm.drizzle.team/docs/comparisons/prisma) — Drizzle 官方对比分析
- [TypeORM Documentation](https://typeorm.io/) — TypeORM 官方文档
- [MikroORM Documentation](https://mikro-orm.io/docs/) — MikroORM 官方文档
- [Prisma Accelerate](https://www.prisma.io/data-platform/accelerate) — 边缘连接池与缓存代理
- [Turso / LibSQL Documentation](https://docs.turso.tech/) — 边缘 SQLite 数据库
- [SQLize (Active Record vs Data Mapper)](https://sqlize.online/) — SQL 在线对比工具
- [Node.js ORM Benchmarks](https://github.com/antonk52/bench-node-orm) — Node.js ORM 性能基准测试
- [Martin Fowler — ORM Hate](https://martinfowler.com/bliki/OrmHate.html) — ORM 设计哲学经典论述
- [Unit of Work Pattern — Martin Fowler](https://martinfowler.com/eaaCatalog/unitOfWork.html) — 工作单元模式
- [Identity Map Pattern — Martin Fowler](https://martinfowler.com/eaaCatalog/identityMap.html) — 标识映射模式
- [Prisma Driver Adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers) — 数据库驱动适配器
- [Drizzle Kit Migrations](https://orm.drizzle.team/docs/kit-overview) — Drizzle 迁移工具文档
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) — PostgreSQL 官方文档
- [SQLite Documentation](https://www.sqlite.org/docs.html) — SQLite 官方文档
