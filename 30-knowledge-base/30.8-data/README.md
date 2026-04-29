# 数据层知识中枢

> **路径**: `30-knowledge-base/30.8-data/`
> **定位**: JavaScript/TypeScript 应用数据持久化、访问与治理的系统性知识索引。本目录涵盖 ORM、查询构建器、缓存策略、数据验证、迁移管理及流处理等核心主题，为开发者构建可靠、高性能的数据层提供完整参考。

---

## 目录

- [数据层知识中枢](#数据层知识中枢)
  - [目录](#目录)
  - [核心主题](#核心主题)
    - [1. ORM 对象关系映射](#1-orm-对象关系映射)
    - [2. 查询构建器](#2-查询构建器)
    - [3. 缓存策略与实现](#3-缓存策略与实现)
    - [4. 数据验证与序列化](#4-数据验证与序列化)
    - [5. 数据库迁移与版本控制](#5-数据库迁移与版本控制)
    - [6. 流处理与大数据](#6-流处理与大数据)
  - [数据库选型参考](#数据库选型参考)
  - [关联文档](#关联文档)

---

## 核心主题

### 1. ORM 对象关系映射

ORM 在类型安全与开发效率之间提供平衡，2026 年主流选择呈现清晰分化：

| ORM | 风格 | 类型安全 | 性能 | 适用场景 |
|-----|------|---------|------|---------|
| **Prisma** | 声明式 Schema | ⭐⭐⭐ 极强 | 中 | 快速开发、团队协作、需要可视化工具 |
| **Drizzle ORM** | SQL-like 代码 | ⭐⭐⭐ 极强 | 高 | 熟悉 SQL 的开发者、性能敏感场景 |
| **TypeORM** | 装饰器/Active Record | ⭐⭐ 强 | 中 | 传统 OOP 背景、复杂关系建模 |
| **MikroORM** | Data Mapper | ⭐⭐⭐ 极强 | 高 | 领域驱动设计（DDD）、Unit of Work |
| **Sequelize** | Active Record | ⭐⭐ 强 | 中 | 遗留项目维护、丰富插件生态 |
| **Mongoose** | Schema-based | ⭐⭐ 强 | 高 | MongoDB 专属、文档型数据建模 |

选型建议：新项目首选 Drizzle（轻量、SQL 透明）或 Prisma（工具链完善）；需要 DDD 模式时选 MikroORM。

### 2. 查询构建器

查询构建器在原始 SQL 与 ORM 之间提供灵活中间层：

- **Kysely**：TypeScript 原生类型安全查询构建器，编译时推断查询返回类型，支持 PostgreSQL、MySQL、SQLite。
- **Knex.js**：历史悠久、功能全面的链式查询构建器，支持事务、连接池、迁移、种子数据。
- **Kysely vs Knex**：Kysely 类型安全更强；Knex 生态更成熟，学习资料更丰富。

对于复杂报表、性能敏感查询，查询构建器是 ORM 的良好补充，允许开发者精确控制生成的 SQL。

### 3. 缓存策略与实现

缓存是提升数据层性能的核心手段，需根据一致性要求选择合适策略：

| 策略 | 一致性 | 复杂度 | 适用场景 |
|------|--------|--------|---------|
| **Cache-Aside** | 最终一致 | 低 | 通用场景，应用层自主管理 |
| **Read-Through** | 最终一致 | 中 | 统一缓存访问模式 |
| **Write-Through** | 强一致 | 中 | 读多写少，接受写延迟 |
| **Write-Behind** | 最终一致 | 高 | 高写入吞吐量，容忍短暂不一致 |

**Node.js 缓存工具**：

- **Redis**：ioredis / node-redis 提供最通用的分布式缓存；支持 Pub/Sub、Stream、Bloom Filter。
- **Keyv**：极简键值存储接口，支持 Redis、MongoDB、SQLite、Postgres 等多种后端。
- **Node-Cache / LRU-Cache**：进程内内存缓存，适合单机高频热数据。
- **Cachified**：基于 Keyv 的声明式缓存工具，支持 stale-while-revalidate 与缓存失效策略。

### 4. 数据验证与序列化

类型安全的数据验证是防御性编程的基石：

- **Zod**：TypeScript 优先的模式声明与验证库，支持静态类型推断、嵌套对象、联合类型、自定义校验。2026 年已成为社区事实标准。
- **Valibot**：Zod 的轻量替代，树摇友好，体积更小。
- **Yup**：基于模式的验证库，React 生态传统选择。
- **Joi**：Hapi 框架官方验证库，功能全面但无原生 TypeScript 类型推导。
- **Superstruct**：可组合的接口定义与验证，API 简洁。

> 推荐在 API 边界（请求入参、响应结构）、配置加载、环境变量解析处统一使用 Zod/Valibot 进行运行时校验。

### 5. 数据库迁移与版本控制

 schema 变更的版本化管理是团队协作的关键：

- **Prisma Migrate**：基于 Prisma Schema 的声明式迁移，自动生成 SQL，支持 shadow database 校验。
- **Drizzle Kit**：Drizzle ORM 配套 CLI，支持生成、执行、回滚迁移，SQL 透明可控。
- **Knex Migrations**：基于 JavaScript/TypeScript 的迁移脚本，灵活性高。
- **node-pg-migrate**：PostgreSQL 专用迁移工具，纯 SQL 导向。
- **Flyway / Liquibase**：JVM 生态成熟方案，适合异构技术栈统一迁移管理。

### 6. 流处理与大数据

- **Node.js Streams**：原生 `stream` 模块处理大文件读写、HTTP 响应流、转换管道（Transform Streams）。
- **RxJS**：响应式编程库，基于 Observable 处理异步数据流，适合复杂事件组合与背压控制。
- **BullMQ / Agenda**：基于 Redis 的队列与任务调度，实现异步流处理与分布式任务。
- **Apache Kafka + KafkaJS**：高吞吐分布式流平台，适合日志聚合、事件溯源、实时分析。

---

## 数据库选型参考

| 类型 | 代表产品 | Node.js 驱动 | 特点 |
|------|---------|-------------|------|
| 关系型 | PostgreSQL | `pg` | 功能最丰富，支持 JSONB、向量扩展 |
| 关系型 | MySQL | `mysql2` | 生态广泛，运维资料丰富 |
| 文档型 | MongoDB | `mongodb` / Mongoose | 灵活 Schema，水平扩展能力强 |
| 键值型 | Redis | `ioredis` | 超高性能，多功能数据结构 |
| 向量型 | pgvector / Pinecone | `pg` / SDK | AI 应用嵌入向量存储与相似度检索 |
| 时序型 | TimescaleDB / InfluxDB | `pg` / `@influxdata/influxdb-client` | 物联网、监控指标存储 |
| 搜索型 | Elasticsearch / Meilisearch | `@elastic/elasticsearch` / `meilisearch` | 全文检索与聚合分析 |

---

## 关联文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 知识库总览 | [../README.md](../README.md) | `30-knowledge-base` 根目录索引 |
| 后端知识中枢 | [../30.4-backend/README.md](../30.4-backend/README.md) | 服务端架构、API 设计 |
| 网络知识中枢 | [../30.5-networking/README.md](../30.5-networking/README.md) | 数据传输协议与性能优化 |
| 安全知识中枢 | [../30.6-security/README.md](../30.6-security/README.md) | 数据安全、加密与合规 |
| 生态全景 | [../../40-ecosystem/README.md](../../40-ecosystem/README.md) | Awesome JS/TS 生态库导航（含数据库工具） |
| 对比矩阵 | [../30.3-comparison-matrices/](../30.3-comparison-matrices/) | ORM 与数据库工具横向对比 |

---

*最后更新: 2026-04-29*
