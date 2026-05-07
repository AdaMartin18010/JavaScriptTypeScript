# 04. Kysely 类型安全 SQL

## 设计哲学

Kysely 不做 ORM 的事——它是一个**类型安全的 SQL 查询构造器**。你写 SQL，Kysely 保证类型正确。

```typescript
import { Kysely, PostgresDialect } from 'kysely';

// 1. 定义数据库接口 (类型-only)
interface Database {
  users: {
    id: number;
    name: string;
    email: string;
    age: number | null;
  };
  posts: {
    id: number;
    title: string;
    userId: number;
  };
}

// 2. 创建客户端
const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: process.env.DATABASE_URL }),
  }),
});

// 3. 类型安全的查询
db.selectFrom('users')
  .select(['id', 'name'])
  .where('age', '>=', 18)
  .orderBy('name', 'asc')
  .execute();
  // ^ 类型推断: Promise<{ id: number; name: string }[]>
```

## 高级查询

### JOIN

```typescript
const result = await db
  .selectFrom('users')
  .innerJoin('posts', 'posts.userId', 'users.id')
  .select(['users.name', 'posts.title'])
  .where('users.age', '>=', 18)
  .execute();
```

### 子查询

```typescript
const subquery = db.selectFrom('posts')
  .select('userId')
  .where('published', '=', true);

await db.selectFrom('users')
  .where('id', 'in', subquery)
  .selectAll()
  .execute();
```

### 原始 SQL 插值 (防注入)

```typescript
import { sql } from 'kysely';

await db.selectFrom('users')
  .selectAll()
  .where(sql`age > ${minAge} AND name ILIKE ${`%${search}%`}`)
  .execute();
```

## 迁移方案

Kysely 无内置迁移，需配合 `kysely-migration-cli` 或手写：

```typescript
// migrations/001-initial.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute();
}
```

## Drizzle vs Kysely

| 维度 | Drizzle | Kysely |
|------|---------|--------|
| Schema 定义 | 运行时 + 类型 | 纯类型 |
| 关系查询 | 内置 `relations` | 手动 JOIN |
| 迁移 | `drizzle-kit` | `kysely-migration-cli` |
| Bundle | ~15KB | ~20KB |
| 社区 | 快速增长 | 稳定 |

## 选型建议

- 需要**关系自动处理** → Drizzle
- 需要**完全控制 SQL** → Kysely
- 已有**复杂 SQL** 要类型化 → Kysely

## 延伸阅读

- [Kysely 文档](https://kysely.dev/docs/intro)
- [Kysely Playground](https://kysely.dev/playground)
