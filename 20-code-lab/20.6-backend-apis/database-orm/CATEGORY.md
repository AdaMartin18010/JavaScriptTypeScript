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

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Prisma Docs | ORM 官方文档 | [prisma.io/docs](https://www.prisma.io/docs) |
| Drizzle ORM Docs | 轻量 ORM 文档 | [orm.drizzle.team/docs/overview](https://orm.drizzle.team/docs/overview) |
| TypeORM — Advanced Queries | 装饰器模式 ORM 参考 | [typeorm.io](https://typeorm.io/) |
| SQL Performance Explained | 索引与查询优化经典 | [sql-performance-explained.com](https://sql-performance-explained.com/) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*
