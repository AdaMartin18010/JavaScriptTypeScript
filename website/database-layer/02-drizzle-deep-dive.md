# 02. Drizzle 深度解析

## 设计哲学

> "If you know SQL, you know Drizzle." — Drizzle Team

Drizzle 的核心设计原则：**不做魔法**。每个 ORM 调用都对应一条可预测的 SQL。

## 快速开始

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit
```

```typescript
// db/schema.ts
import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  age: integer('age'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema: { users } });
```

## 查询模式

### 基础 CRUD

```typescript
import { eq, and, gt, like } from 'drizzle-orm';

// Create
const newUser = await db.insert(users).values({
  name: 'Alice',
  email: 'alice@example.com',
  age: 25,
}).returning();

// Read
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.id, 1));

// Update
await db.update(users)
  .set({ age: 26 })
  .where(eq(users.id, 1));

// Delete
await db.delete(users).where(eq(users.id, 1));
```

### 关系查询

```typescript
// 定义关系
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title').notNull(),
  userId: integer('user_id').references(() => users.id),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

// 查询关系
const usersWithPosts = await db.query.users.findMany({
  with: { posts: true },
});
```

## Edge 部署

```typescript
// 使用 @neondatabase/serverless (PostgreSQL over HTTP)
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Vercel Edge Function
export const runtime = 'edge';
export async function GET() {
  const result = await db.select().from(users);
  return Response.json(result);
}
```

## 迁移管理

```bash
# 生成迁移
npx drizzle-kit generate

# 执行迁移
npx drizzle-kit migrate

# 查看迁移状态
npx drizzle-kit check
```

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## 与 Prisma 的关键差异

| 维度 | Drizzle | Prisma |
|------|---------|--------|
| 查询语法 | SQL-like | 对象嵌套 |
| Bundle Size | ~15KB | ~2MB (含引擎) |
| Edge 原生 | ✅ | 需 Accelerate |
| 迁移 | 手动/Kit | 自动生成 |
| 学习曲线 | SQL 用户友好 | 需学习新 DSL |

## 延伸阅读

- [Drizzle ORM 文档](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit 迁移指南](https://orm.drizzle.team/kit-docs/overview)
