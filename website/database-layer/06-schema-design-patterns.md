# 06. Schema 设计最佳实践

## 原则 1: 类型即契约

Schema 是数据库和代码之间的唯一契约。使用 TypeScript 类型确保两端一致。

```typescript
// shared/schema.ts —— 前后端共用
import { pgTable, serial, varchar, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['USER', 'ADMIN', 'MODERATOR']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').notNull().default('USER'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 导出类型供前端使用
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

## 原则 2: 命名规范

| 对象 | 规范 | 示例 |
|------|------|------|
| 表名 | 小写复数 | `users`, `order_items` |
| 列名 | 小写下划线 | `created_at`, `user_id` |
| 主键 | `id` 或 `{table}_id` | `id` |
| 外键 | `{table}_id` | `user_id`, `order_id` |
| 枚举 | 单数 | `user_role`, `order_status` |
| 索引 | `idx_{table}_{columns}` | `idx_users_email` |

## 原则 3: 软删除 vs 硬删除

```typescript
export const users = pgTable('users', {
  // ...
  deletedAt: timestamp('deleted_at'), // NULL = 未删除
});

// 查询时总是过滤
await db.select().from(users).where(isNull(users.deletedAt));
```

## 原则 4: 时间戳规范

```typescript
export const baseTable = {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

// 使用触发器或 ORM 钩子自动更新 updatedAt
```

## 原则 5: 避免 N+1

```typescript
// ❌ N+1 查询
const users = await db.select().from(usersTable);
for (const user of users) {
  const posts = await db.select().from(postsTable).where(eq(postsTable.userId, user.id));
  // 100 个用户 = 101 次查询
}

// ✅ JOIN 一次查询
const result = await db
  .select({
    userId: usersTable.id,
    userName: usersTable.name,
    postTitle: postsTable.title,
  })
  .from(usersTable)
  .leftJoin(postsTable, eq(usersTable.id, postsTable.userId));
  // 1 次查询
```

## 原则 6: 索引策略

```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  age: integer('age'),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  nameIdx: index('idx_users_name').on(table.name),
  ageIdx: index('idx_users_age').on(table.age), // 范围查询
}));
```

## 延伸阅读

- [PostgreSQL 索引类型](https://www.postgresql.org/docs/current/indexes-types.html)
- [Database Schema Design Guide](https://www.prisma.io/dataguide/datamodeling)
