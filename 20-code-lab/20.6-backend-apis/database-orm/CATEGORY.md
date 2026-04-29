---
dimension: 综合
sub-dimension: Database orm
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Database orm 核心概念与工程实践。

## 包含内容

- 本模块聚焦 database orm 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 connection-pool.test.ts
- 📄 connection-pool.ts
- 📄 drizzle-patterns.ts
- 📄 index.ts
- 📄 migration-system.test.ts
- 📄 migration-system.ts
- 📄 prisma-patterns.test.ts
- 📄 prisma-patterns.ts
- 📄 schema-builder.ts
- 📄 sql-query-builder.test.ts
- 📄 sql-query-builder.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块速查

| 子模块 | 核心能力 | 关联文件 |
|--------|----------|----------|
| Prisma Patterns | Schema-first、类型安全查询、迁移工作流 | `prisma-patterns.ts` |
| Drizzle Patterns | SQL-like 查询构造器、轻量无代码生成 | `drizzle-patterns.ts` |
| SQL Query Builder | 类型安全 SQL 拼接与参数化防注入 | `sql-query-builder.ts` |
| Schema Builder | 运行时 Schema 定义与校验 | `schema-builder.ts` |
| Connection Pool | 数据库连接池管理与超时/重试策略 | `connection-pool.ts` |
| Migration System | 版本化迁移、回滚、哈希校验 | `migration-system.ts` |

## 代码示例：类型安全 SQL Query Builder 骨架

```typescript
// sql-query-builder.ts — 编译时类型推断的查询构造器
type TableSchema = Record<string, unknown>;

class QueryBuilder<T extends TableSchema> {
  private _select: (keyof T)[] = [];
  private _where: string[] = [];
  private _params: unknown[] = [];

  constructor(private tableName: string) {}

  select<K extends keyof T>(...columns: K[]): QueryBuilder<Pick<T, K>> {
    this._select = columns as string[];
    return this as unknown as QueryBuilder<Pick<T, K>>;
  }

  where<K extends keyof T>(column: K, op: '=' | '<' | '>' | '<>', value: T[K]): this {
    this._where.push(`${String(column)} ${op} ?`);
    this._params.push(value);
    return this;
  }

  toSQL(): { sql: string; params: unknown[] } {
    const columns = this._select.length ? this._select.join(', ') : '*';
    let sql = `SELECT ${columns} FROM ${this.tableName}`;
    if (this._where.length) sql += ` WHERE ${this._where.join(' AND ')}`;
    return { sql, params: this._params };
  }
}

// ── 使用示例 ──
interface User { id: number; name: string; email: string; age: number; }

const qb = new QueryBuilder<User>('users')
  .select('id', 'name', 'email')
  .where('age', '>', 18)
  .where('name', '=', 'Alice');

const { sql, params } = qb.toSQL();
// sql  => SELECT id, name, email FROM users WHERE age > ? AND name = ?
// params => [18, 'Alice']
```

### Prisma 类型安全查询

```typescript
// prisma-patterns.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

// 关系查询与嵌套选择
export async function getUserWithPosts(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, title: true, createdAt: true },
      },
      _count: { select: { posts: true } },
    },
  });
}

// 事务批量操作
export async function transferCredits(
  fromId: string,
  toId: string,
  amount: number
) {
  return prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },
    });
    await tx.account.update({
      where: { id: toId },
      data: { balance: { increment: amount } },
    });
  });
}
```

### Drizzle ORM 关系查询

```typescript
// drizzle-patterns.ts
import { eq, and, gte, desc } from 'drizzle-orm';
import { users, posts } from './schema';

// 类型安全 SQL-like 查询
export async function getActiveUsersWithRecentPosts(db: DbClient) {
  return db
    .select({
      id: users.id,
      name: users.name,
      postTitle: posts.title,
    })
    .from(users)
    .innerJoin(posts, eq(users.id, posts.authorId))
    .where(and(eq(users.active, true), gte(posts.createdAt, new Date('2024-01-01'))))
    .orderBy(desc(posts.createdAt))
    .limit(50);
}

// 原始 SQL 混合（用于复杂查询）
export async function getUserStats(db: DbClient) {
  return db.execute(sql`
    SELECT u.id, COUNT(p.id) as post_count
    FROM ${users} u
    LEFT JOIN ${posts} p ON u.id = p.author_id
    GROUP BY u.id
    HAVING COUNT(p.id) > 5
  `);
}
```

### 连接池与超时重试

```typescript
// connection-pool.ts
interface PoolConfig {
  maxConnections: number;
  acquireTimeoutMs: number;
  idleTimeoutMs: number;
  retryAttempts: number;
}

export function createConnectionPool(config: PoolConfig) {
  let active = 0;
  const queue: Array<(conn: unknown) => void> = [];
  const pool: unknown[] = [];

  return {
    async acquire(): Promise<unknown> {
      if (pool.length > 0) return pool.pop()!;
      if (active < config.maxConnections) {
        active++;
        return createNewConnection();
      }
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Connection acquire timeout'));
        }, config.acquireTimeoutMs);
        queue.push((conn) => {
          clearTimeout(timer);
          resolve(conn);
        });
      });
    },
    release(conn: unknown) {
      if (queue.length > 0) {
        const next = queue.shift()!;
        next(conn);
      } else {
        pool.push(conn);
      }
    },
  };
}

function createNewConnection(): unknown {
  // 数据库驱动连接创建
  return {};
}
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Prisma Docs | ORM 官方文档 | [prisma.io/docs](https://www.prisma.io/docs) |
| Drizzle ORM Docs | 轻量 ORM 文档 | [orm.drizzle.team/docs/overview](https://orm.drizzle.team/docs/overview) |
| TypeORM — Advanced Queries | 装饰器模式 ORM 参考 | [typeorm.io](https://typeorm.io/) |
| SQL Performance Explained | 索引与查询优化经典 | [sql-performance-explained.com](https://sql-performance-explained.com/) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Knex.js 查询构造器 | 文档 | [knexjs.org](https://knexjs.org/) |
| SQLite 官方文档 | 文档 | [sqlite.org/docs.html](https://www.sqlite.org/docs.html) |
| PostgreSQL 官方文档 | 文档 | [postgresql.org/docs](https://www.postgresql.org/docs/) |
| PlanetScale — Database branching | 指南 | [planetscale.com/docs/concepts/branching](https://planetscale.com/docs/concepts/branching) |
| Node.js — Event Loop 与 I/O | 文档 | [nodejs.org/en/learn/asynchronous-work/event-loop-explained](https://nodejs.org/en/learn/asynchronous-work/event-loop-explained) |

---

*最后更新: 2026-04-29*
