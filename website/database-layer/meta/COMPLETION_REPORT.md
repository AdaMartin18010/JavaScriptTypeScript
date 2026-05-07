# 数据库层与 ORM 专题完成报告

## 专题概述

TypeScript-first 的数据库工具链全景，覆盖 Drizzle、Prisma、Kysely 三大主流工具的生产实践。

## 文档清单 (8 篇)

| # | 文档 | 状态 | 核心内容 |
|---|------|------|----------|
| 01 | [ORM 全景对比与选型](../01-orm-landscape.md) | ✅ | 五大工具对比、选型决策 |
| 02 | [Drizzle 深度解析](../02-drizzle-deep-dive.md) | ✅ | Schema、查询、Edge 部署 |
| 03 | [Prisma 生产级实践](../03-prisma-in-production.md) | ✅ | Schema、迁移、Accelerate |
| 04 | [Kysely 类型安全 SQL](../04-kysely-type-safe-sql.md) | ✅ | Query Builder、类型推断 |
| 05 | [Edge 环境 ORM 模式](../05-edge-orm-patterns.md) | ✅ | HTTP 驱动、连接池、缓存架构 |
| 06 | [Schema 设计最佳实践](../06-schema-design-patterns.md) | ✅ | 命名规范、软删除、N+1 |
| 07 | [迁移策略与版本控制](../07-migration-strategies.md) | ✅ | 零停机迁移、CI/CD |
| 08 | [查询性能优化](../08-query-optimization.md) | ✅ | EXPLAIN、批量操作、连接池 |

## 交叉引用

- [Edge Runtime](../../edge-runtime/) — Edge 数据库连接
- [React + Next.js App Router](../../react-nextjs-app-router/) — Next.js ORM 集成

## 待补充

- [ ] 性能基准测试数据
- [ ] MikroORM 覆盖
- [ ] NoSQL (MongoDB) 方案
