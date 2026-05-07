# 01. ORM 全景对比与选型

## 什么是 TypeScript-first ORM？

TypeScript-first ORM 的核心理念：**数据库 schema 是 TypeScript 类型的唯一真实来源**，或反之。消除「数据库改了但类型没改」的常见问题。

## 五大主流工具深度对比

### Drizzle ORM

```typescript
import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

// Schema 即代码
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  age: integer('age'),
});

// 类型安全的查询 —— 看起来像 SQL
db.select().from(users).where(eq(users.age, 21));
// SELECT "id", "name", "email", "age" FROM "users" WHERE "age" = 21
```

**优势**: SQL-like API、零依赖、Bundle 小、Edge 原生支持
**劣势**: 生态较新、复杂关系查询需手动处理

### Prisma

```typescript
// schema.prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
  age   Int?
  posts Post[]
}

// 生成的客户端
const user = await prisma.user.create({
  data: { name: 'Alice', email: 'alice@example.com' },
  include: { posts: true },
});
```

**优势**: 代码生成确保 100% 类型安全、迁移系统最成熟、生态丰富
**劣势**: 查询引擎二进制文件较大、Edge 需 Prisma Accelerate

### Kysely

```typescript
import { Kysely, sql } from 'kysely';

// 纯 Query Builder，无 schema 定义
db.selectFrom('users')
  .select(['id', 'name'])
  .where('age', '>=', 18)
  .orderBy('name', 'asc')
  .execute();
```

**优势**: 极致的 SQL 控制、类型推断完美、Edge 兼容
**劣势**: 无内置迁移、需手写 schema 类型

## 选型决策表

| 场景 | 推荐工具 | 理由 |
|------|----------|------|
| Next.js + Vercel Edge | Drizzle | 原生 Edge 支持，无额外服务 |
| 大型团队 + 复杂关系 | Prisma | 代码生成 + 成熟迁移 |
| 性能敏感 + 复杂 SQL | Kysely | 无抽象层，直接控制 SQL |
| 已有 TypeORM 项目 | MikroORM | 数据映射模式，渐进迁移 |
| 快速原型 | Drizzle | 学习成本低，配置简单 |

## 生态趋势 (2024-2025)

- **Drizzle 增长最快**: GitHub stars 增速超过 Prisma
- **Prisma ORM 4.x → 5.x**: 性能大幅提升，加速地址痛点
- **Kysely 稳定**: 作为「类型安全 SQL」定位稳固
- **Edge ORM 兴起**: 专为 Edge Runtime 设计的新工具出现

## 延伸阅读

- [Drizzle vs Prisma 官方对比](https://orm.drizzle.team/docs/comparisons/prisma)
- [Why I Switched From Prisma to Drizzle](https://www.youtube.com/watch?v=...) (YouTube)
