# 现代 ORM 实验室 — 架构设计

## 1. 架构概述

本模块实现了现代 ORM 的核心引擎，包括 Schema 定义、查询构建器、迁移系统和边缘适配层。展示从类型定义到数据库查询的完整类型安全链路。架构采用"类型即 Schema"的设计哲学，通过 TypeScript 的类型系统驱动数据库元数据生成，使编译时类型检查与运行时查询执行形成闭环。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         开发者接口层 (Developer API)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Schema     │  │    Query     │  │   Migration  │  │   Seed /    │ │
│  │   Builder    │  │   Builder    │  │   Runner     │  │   Fixture   │ │
│  │ (Type-safe)  │  │ (Chain/Raw)  │  │ (Up/Down)    │  │   Builder   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         编译时层 (Compile-time Layer)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  Type Parser │  │   Query AST  │  │   Schema     │                   │
│  │  (Reflect /  │  │   Builder    │  │   Diff       │                   │
│  │   TS AST)    │  │   (Typed)    │  │   Engine     │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         代码生成层 (Code Generation)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  Migration   │  │   Client     │  │    Type      │                   │
│  │   SQL Gen    │  │   Types      │  │   Defs Gen   │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         运行时层 (Runtime Layer)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Connection  │  │  Transaction │  │    SQL       │  │   Edge      │ │
│  │    Pool      │  │   Manager    │  │  Generator   │  │  Adapter    │ │
│  │              │  │  (ACID)      │  │ (Multi-dialect│ │(HTTP-based) │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      数据库适配层 (Database Adapters)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  PostgreSQL  │  │   SQLite     │  │    MySQL     │  │   Edge DB   │ │
│  │   (pg/libpq) │  │  (better-sqlite3)│  │  (mysql2)  │  │ (Turso/D1)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 Schema 引擎

| 组件 | 职责 | 关键技术 | 输出 |
|------|------|----------|------|
| Type Parser | TypeScript 类型反射和解析 | `reflect-metadata` / TS Compiler API | 表元数据 |
| Schema Validator | 字段类型、约束、关系的验证 | Zod / 自定义校验器 | 验证报告 |
| Migration Generator | 基于 Schema 差异的迁移脚本生成 | Schema Diff 算法 | SQL 迁移文件 |

### 3.2 查询构建器

| 组件 | 职责 | 关键技术 | 类型安全 |
|------|------|----------|----------|
| Query AST | 查询的抽象语法树表示 | 访问者模式 | 编译时 |
| SQL Generator | AST 到 SQL 的转换（多方言支持） | 模板方法模式 | — |
| Type Inferencer | 查询结果的 TypeScript 类型推断 | 条件类型映射 | 编译时 |

### 3.3 运行时层

| 组件 | 职责 | 关键技术 | 性能特征 |
|------|------|----------|----------|
| Connection Pool | 数据库连接池管理 | 通用池模式 | 复用连接 |
| Transaction Manager | 事务的 ACID 保证 | 两阶段提交（可选）| 一致性 |
| Edge Adapter | HTTP 协议数据库适配（Turso、D1）| HTTP/1.1 持久连接 | 边缘低延迟 |

### 3.4 迁移系统

| 组件 | 职责 | 关键技术 | 回滚策略 |
|------|------|----------|----------|
| Migration Runner | 版本化迁移的顺序执行 | 版本表锁 | 事务包裹 |
| Rollback Engine | 迁移回滚和基线重置 | 反向 SQL 生成 | down 脚本 |
| Schema Diff | 目标 Schema 与当前数据库的差异分析 | AST 对比 | 增量生成 |

## 4. 数据流

```
TypeScript Schema → Validation → Migration Plan → Database → Query Builder → SQL → Result (Typed)
```

## 5. 技术栈对比

| ORM / 工具 | 类型安全 | 查询 API | 边缘支持 | 迁移 | 包体积 | 适用场景 |
|------------|----------|----------|----------|------|--------|----------|
| 本实验室 | ★★★★★ | 链式 + 原始 SQL | ★★★★ | 内置 | ~5KB | 学习/原型 |
| Prisma | ★★★★★ | 生成型 Client | ★★★★★ | 优秀 | ~15MB* | 企业级全栈 |
| Drizzle | ★★★★★ | SQL-like | ★★★★ | 良好 | ~100KB | 现代全栈 |
| TypeORM | ★★★★ | 装饰器 + Repository | ★★ | 良好 | ~500KB | 传统 Node.js |
| Kysely | ★★★★★ | 类型安全 builder | ★★★ | 外部 | ~50KB | 查询构建 |
| Sequelize | ★★ | 链式 | ★ | 良好 | ~300KB | 传统项目 |
| Zod + raw SQL | ★★★★ | 原始 SQL | ★★★ | 手动 | ~10KB | 简单查询 |

*Prisma 体积含生成引擎，运行时 Client 较小

## 6. 代码示例

### 6.1 类型安全 Schema 定义

```typescript
// orm-modern-lab/src/schema/SchemaBuilder.ts
type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'json';

interface ColumnDef {
  type: ColumnType;
  nullable?: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  default?: any;
  references?: { table: string; column: string };
}

interface TableSchema {
  name: string;
  columns: Record<string, ColumnDef>;
  indexes?: { columns: string[]; unique?: boolean }[];
}

// 类型推断辅助类型
type InferType<T extends ColumnDef> =
  T['type'] extends 'string' ? string :
  T['type'] extends 'number' ? number :
  T['type'] extends 'boolean' ? boolean :
  T['type'] extends 'date' ? Date :
  T['type'] extends 'json' ? object :
  never;

type InferRow<T extends TableSchema> = {
  [K in keyof T['columns']]: T['columns'][K] extends ColumnDef
    ? T['columns'][K]['nullable'] extends true
      ? InferType<T['columns'][K]> | null
      : InferType<T['columns'][K]>
    : never;
};

// 使用示例
const userSchema = {
  name: 'users',
  columns: {
    id: { type: 'number', primaryKey: true, autoIncrement: true },
    email: { type: 'string', nullable: false },
    name: { type: 'string', nullable: false },
    createdAt: { type: 'date', default: () => new Date() },
    profile: { type: 'json', nullable: true },
  },
  indexes: [{ columns: ['email'], unique: true }],
} as const satisfies TableSchema;

type User = InferRow<typeof userSchema>;
// User = { id: number; email: string; name: string; createdAt: Date; profile: object | null }
```

### 6.2 类型安全查询构建器

```typescript
// orm-modern-lab/src/query/QueryBuilder.ts
class QueryBuilder<T extends Record<string, any>> {
  private tableName: string;
  private _where: Array<{ column: string; op: string; value: any }> = [];
  private _select: string[] = ['*'];
  private _orderBy?: { column: string; direction: 'ASC' | 'DESC' };
  private _limit?: number;
  private _offset?: number;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select<K extends keyof T>(...columns: K[]): QueryBuilder<Pick<T, K>> {
    this._select = columns as string[];
    return this as any;
  }

  where<K extends keyof T>(
    column: K,
    op: '=' | '!=' | '>' | '<' | '>=' | '<=',
    value: T[K]
  ): this {
    this._where.push({ column: column as string, op, value });
    return this;
  }

  orderBy<K extends keyof T>(column: K, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this._orderBy = { column: column as string, direction };
    return this;
  }

  limit(n: number): this {
    this._limit = n;
    return this;
  }

  offset(n: number): this {
    this._offset = n;
    return this;
  }

  toSQL(): { sql: string; params: any[] } {
    const params: any[] = [];
    let sql = `SELECT ${this._select.join(', ')} FROM ${this.tableName}`;

    if (this._where.length > 0) {
      const conditions = this._where.map(w => {
        params.push(w.value);
        return `${w.column} ${w.op} ?`;
      });
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (this._orderBy) {
      sql += ` ORDER BY ${this._orderBy.column} ${this._orderBy.direction}`;
    }

    if (this._limit) sql += ` LIMIT ${this._limit}`;
    if (this._offset) sql += ` OFFSET ${this._offset}`;

    return { sql, params };
  }
}

// 使用示例
const users = new QueryBuilder<User>('users');
const { sql, params } = users
  .select('id', 'email', 'name')
  .where('createdAt', '>', new Date('2024-01-01'))
  .orderBy('createdAt', 'DESC')
  .limit(10)
  .toSQL();

// sql: SELECT id, email, name FROM users WHERE createdAt > ? ORDER BY createdAt DESC LIMIT 10
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 查询 API | 链式 + 原始 SQL 混合 | 灵活性与类型安全兼顾 |
| 迁移策略 | 声明式 + 手动调整 | 自动化与可控性平衡 |
| 边缘适配 | HTTP 驱动器 | 无持久连接的边缘环境 |

## 8. 质量属性

- **类型安全**: 编译时查询验证和结果推断
- **性能**: 查询优化和连接池管理
- **可移植性**: 多数据库方言和边缘环境支持

## 9. 参考链接

- [Prisma Documentation](https://www.prisma.io/docs/) — 现代 TypeScript ORM 标杆
- [Drizzle ORM](https://orm.drizzle.team/) — SQL-like 类型安全 ORM
- [Kysely Query Builder](https://kysely.dev/) — 类型安全 SQL 查询构建器
- [SQLite WASM](https://sqlite.org/wasm/doc/trunk/index.md) — 浏览器端 SQLite
- [Turso Documentation](https://docs.turso.tech/) — 边缘 SQLite 数据库
- [Cloudflare D1](https://developers.cloudflare.com/d1/) — Cloudflare 边缘 SQL 数据库
