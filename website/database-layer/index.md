# 🗄️ 数据库层与 ORM 深度专题

> TypeScript-first 的数据库工具链全景 —— 从类型安全的查询构造到生产级 Schema 演化，从 Edge 环境适配到查询性能优化。

## 为什么关注数据库层？

数据库层是 TypeScript 全栈应用中最容易产生「类型断层」的环节。一个好的 ORM/查询构建器能让数据库 schema 和 TypeScript 类型保持同步，消除运行时错误。

## 主流工具全景

| 工具 | 类型 | 类型安全 | 迁移 | Edge 支持 | 学习曲线 | 适用场景 |
|------|------|---------|------|----------|----------|----------|
| **Drizzle** | ORM + SQL-like | ⭐⭐⭐⭐⭐ | ✅ 原生 | ✅ | 低 | 现代全栈、Edge |
| **Prisma** | ORM (代码生成) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ 需加速 | 中 | 复杂关系、团队 |
| **Kysely** | Query Builder | ⭐⭐⭐⭐⭐ | ❌ (用 Migrator) | ✅ | 中 | 复杂 SQL、性能敏感 |
| **TypeORM** | ORM (装饰器) | ⭐⭐⭐ | ✅ | ❌ | 高 | 传统企业应用 |
| **MikroORM** | ORM (数据映射) | ⭐⭐⭐⭐ | ✅ | ❌ | 高 | DDD、复杂领域 |

> **Drizzle vs Prisma vs Kysely** 是当前 TypeScript 社区最热门的三选一问题。

## 学习路径

```mermaid
flowchart LR
    A[ORM选型] --> B[Drizzle]
    B --> C[Prisma]
    C --> C2[Kysely]
    C2 --> D[Edge ORM]
    D --> E[Schema设计]
    E --> F[性能优化]
```

### Phase 1: 工具对比与选型

- [01. ORM 全景对比与选型](./01-orm-landscape)
- [02. Drizzle 深度解析](./02-drizzle-deep-dive)

### Phase 2: 生产实践

- [03. Prisma 生产级实践](./03-prisma-in-production)
- [04. Kysely 类型安全 SQL](./04-kysely-type-safe-sql)

### Phase 3: 架构与优化

- [05. Edge 环境 ORM 模式](./05-edge-orm-patterns)
- [06. Schema 设计最佳实践](./06-schema-design-patterns)
- [07. 迁移策略与版本控制](./07-migration-strategies)
- [08. 查询性能优化](./08-query-optimization)

## 核心决策矩阵

```
需要关系型数据库?
├── 否 → 考虑 MongoDB (Prisma 支持) / Redis / DynamoDB
└── 是 → 需要 Edge 支持?
    ├── 是 → Drizzle (推荐) / Kysely
    └── 否 → 团队规模?
        ├── 大型团队 → Prisma (生态成熟)
        └── 小型/个人 → Drizzle (简单、零依赖)
```

## 与其他专题的关系

- [Edge Runtime](../edge-runtime/) — Edge 数据库连接与 ORM 适配
- [React + Next.js App Router](../react-nextjs-app-router/) — Next.js + ORM 集成
- [服务器优先前端](../server-first-frontend/) — 服务端模板 + 原始 SQL

## 相关专题

| 专题 | 关联点 |
|------|--------|
| [Edge Runtime](../edge-runtime/) | [边缘数据库与存储](../edge-runtime/04-edge-databases.md) |
| [AI-Native Development](../ai-native-development/) | RAG Vector DB：pgvector, Pinecone |
| [TypeScript 类型系统深度掌握](../typescript-type-mastery/) | Drizzle/Prisma 的类型推断机制 |
| [移动端跨平台](../mobile-cross-platform/) | 移动端本地数据库：SQLite、WatermelonDB、Realm |
| [WebAssembly](../webassembly/) | Wasm 数据库引擎：duckdb-wasm、sql.js |
| [测试工程](../testing-engineering/) | 数据库测试、TestContainers、契约测试 |
| [性能工程](../performance-engineering/) | 查询性能优化、ORM N+1 问题与连接池 |
| [应用设计](../application-design/) | DDD 聚合设计、CQRS 与事件溯源架构 |

## 参考资源

- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Prisma 文档](https://www.prisma.io/docs/)
- [Kysely 文档](https://kysely.dev/)
- [State of JS 2024 — ORM 满意度](https://stateofjs.com/)
