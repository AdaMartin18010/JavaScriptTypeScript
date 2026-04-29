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


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Drizzle ORM | 官方文档 | [orm.drizzle.team](https://orm.drizzle.team/) |
| Prisma Docs | 官方文档 | [prisma.io/docs](https://www.prisma.io/docs) |
| Turso (libSQL) | 官方文档 | [turso.tech](https://turso.tech/) |
| Edge Database Decision Guide | 社区指南 | [vercel.com/docs/storage](https://vercel.com/docs/storage) |

---

*最后更新: 2026-04-29*
