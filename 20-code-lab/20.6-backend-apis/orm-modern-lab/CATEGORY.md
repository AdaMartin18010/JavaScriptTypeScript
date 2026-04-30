---
dimension: 综合
sub-dimension: Orm modern lab
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Orm modern lab 核心概念与工程实践。

## 包含内容

- 本模块聚焦 orm modern lab 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 96-orm-modern-lab.test.ts
- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 drizzle-kit-guide.ts
- 📄 drizzle-query-patterns.ts
- 📄 drizzle-schema.ts
- 📄 edge-database-decision-tree.ts
- 📄 prisma-7-edge.ts
- 📄 prisma-7-wasm-analysis.ts
- 📄 turso-connection.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `drizzle-schema/` | Drizzle ORM 类型安全 Schema 定义 | `drizzle-schema.ts`, `drizzle-kit-guide.ts` |
| `drizzle-query-patterns/` | 关系查询、聚合与动态条件 | `drizzle-query-patterns.ts` |
| `prisma-7-edge/` | Prisma 7 Edge 运行时与驱动适配器 | `prisma-7-edge.ts`, `prisma-7-wasm-analysis.ts` |
| `turso-connection/` | Turso (libSQL) 连接与边缘部署 | `turso-connection.ts` |
| `edge-database-decision-tree/` | 边缘数据库选型决策矩阵 | `edge-database-decision-tree.ts` |

## 代码示例

### Drizzle ORM 类型安全查询

```typescript
import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  age: integer('age'),
});

// 类型安全的查询
const result = await db.select().from(users).where(eq(users.name, 'Alice'));
// result 类型自动推断为 { id: number; name: string; age: number | null }[]
```

### Prisma Edge 驱动适配器

```typescript
import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });
```

### Drizzle 关系查询与聚合

```typescript
// drizzle-query-patterns.ts
import { pgTable, serial, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { eq, desc, sql, count } from 'drizzle-orm';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  authorId: integer('author_id').notNull(),
  publishedAt: timestamp('published_at'),
  content: text('content'),
});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));

// 动态条件构建
function buildPostQuery(filters: { authorId?: number; keyword?: string }) {
  const conditions = [];
  if (filters.authorId !== undefined) conditions.push(eq(posts.authorId, filters.authorId));
  if (filters.keyword) conditions.push(sql`${posts.title} ILIKE ${`%${filters.keyword}%`}`);

  return db
    .select()
    .from(posts)
    .where(conditions.length ? sql.join(conditions, sql` AND `) : undefined)
    .orderBy(desc(posts.publishedAt))
    .limit(20);
}

// 聚合查询：每个作者的文章数
const postCountByAuthor = await db
  .select({ authorId: posts.authorId, total: count(posts.id) })
  .from(posts)
  .groupBy(posts.authorId);
```

### Turso (libSQL) 边缘连接

```typescript
// turso-connection.ts
import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

// 在 Cloudflare Worker / Vercel Edge 中使用
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const edgeClient = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });
    const edgeDb = drizzle(edgeClient);
    const allUsers = await edgeDb.select().from(users);
    return Response.json(allUsers);
  },
};
```

### Prisma Accelerate 连接池

```typescript
// prisma-accelerate.ts — 边缘环境中的连接池与缓存
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

// 查询缓存策略
const cachedUsers = await prisma.user.findMany({
  cacheStrategy: { ttl: 60, swr: 300 }, // 60s TTL, 300s stale-while-revalidate
});
```

## 代码示例：Drizzle ORM 事务与批量插入

```typescript
// drizzle-transaction-batch.ts — 原子操作与批量写入

import { db } from './db';
import { users, posts } from './schema';

// 显式事务
async function createUserWithPosts(
  userData: { name: string; email: string },
  postTitles: string[]
) {
  return await db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values(userData).returning();

    if (postTitles.length > 0) {
      await tx.insert(posts).values(
        postTitles.map(title => ({
          title,
          authorId: user.id,
          publishedAt: new Date(),
        }))
      );
    }

    return user;
  });
}

// 批量 upsert（插入或更新）
async function bulkUpsertUsers(
  userList: { id: number; name: string; email: string }[]
) {
  return await db.insert(users)
    .values(userList)
    .onConflictDoUpdate({
      target: users.id,
      set: { name: sql`excluded.name`, email: sql`excluded.email` },
    });
}
```

## 代码示例：Kysely 类型安全原始 SQL

```typescript
// kysely-raw-sql.ts — 编译期类型检查的原始 SQL 查询构建器

import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

interface Database {
  users: {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
  };
  posts: {
    id: number;
    title: string;
    authorId: number;
  };
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: process.env.DATABASE_URL }),
  }),
});

// 类型安全的 join 查询
const usersWithPostCount = await db
  .selectFrom('users')
  .leftJoin('posts', 'posts.authorId', 'users.id')
  .select([
    'users.id',
    'users.name',
    (eb) => eb.fn.count('posts.id').as('postCount'),
  ])
  .groupBy('users.id')
  .having((eb) => eb.fn.count('posts.id'), '>=', 5)
  .execute();

// usersWithPostCount 类型：{ id: number; name: string; postCount: string }[]
```

## 代码示例：边缘数据库连接池与重试策略

```typescript
// edge-connection-resilience.ts — 边缘环境连接容错

import { createClient } from '@libsql/client/web';

function createResilientClient(url: string, authToken: string, maxRetries = 3) {
  const client = createClient({ url, authToken });

  return {
    async execute(query: string, args?: unknown[]) {
      let lastError: Error | undefined;
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await client.execute({ sql: query, args: args as any });
        } catch (err) {
          lastError = err as Error;
          if (i < maxRetries - 1) {
            await new Promise(r => setTimeout(r, 100 * Math.pow(2, i))); // 指数退避
          }
        }
      }
      throw lastError;
    },
  };
}

// Cloudflare Worker 中使用
export default {
  async fetch(_req: Request, env: Env) {
    const db = createResilientClient(env.TURSO_DATABASE_URL, env.TURSO_AUTH_TOKEN);
    const result = await db.execute('SELECT * FROM users LIMIT 10');
    return Response.json(result.rows);
  },
};
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Drizzle ORM | 官方文档 | [orm.drizzle.team](https://orm.drizzle.team/) |
| Prisma Docs | 官方文档 | [prisma.io/docs](https://www.prisma.io/docs) |
| Turso (libSQL) | 官方文档 | [turso.tech](https://turso.tech/) |
| Edge Database Decision Guide | 社区指南 | [vercel.com/docs/storage](https://vercel.com/docs/storage) |
| SQLite on the Edge | 文章 | [blog.cloudflare.com/sqlite-in-durable-objects](https://blog.cloudflare.com/sqlite-in-durable-objects/) |
| Neon Serverless Driver | 文档 | [neon.tech/docs/serverless/serverless-driver](https://neon.tech/docs/serverless/serverless-driver) |
| Kysely — Type-safe SQL Query Builder | 文档 | [kysely.dev](https://kysely.dev/) |
| Prisma Accelerate | 文档 | [prisma.io/data-platform/accelerate](https://www.prisma.io/data-platform/accelerate) |
| libSQL 架构文档 | 文档 | [github.com/tursodatabase/libsql](https://github.com/tursodatabase/libsql) |
| Drizzle ORM — Migrations | 文档 | [orm.drizzle.team/docs/migrations](https://orm.drizzle.team/docs/migrations) |
| Prisma Client Extensions | 文档 | [prisma.io/docs/concepts/components/prisma-client/client-extensions](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions) |
| Cloudflare D1 Documentation | 文档 | [developers.cloudflare.com/d1](https://developers.cloudflare.com/d1) |
| PlanetScale Serverless Driver | 文档 | [planetscale.com/docs/tutorials/planetscale-serverless-driver](https://planetscale.com/docs/tutorials/planetscale-serverless-driver) |

---

*最后更新: 2026-04-30*
