---
title: 数据库选型对比矩阵
description: 'PostgreSQL、MySQL、MongoDB、Redis、SQLite、Turso、Supabase、Neon、Pinecone、D1、CockroachDB、PlanetScale、FaunaDB 等关系型/NoSQL/向量/Edge 数据库全面选型对比'
---

# 数据库选型对比矩阵

> 最后更新: 2026-05-01 | 覆盖: OLTP/OLAP/Edge/向量/时序/图数据库 | 目标读者: 架构师/全栈开发者

---

## 核心维度总览

| 数据库 | 类型 | Stars | TS 支持 | Edge 就绪 | 实时 | 向量搜索 | 托管/自托管 |
|--------|------|-------|:-------:|:---------:|:----:|:--------:|------------|
| **PostgreSQL** | 关系型 | - | ✅ @types/pg | ⚠️ Neon | ❌ | ✅ pgvector | 均可 |
| **MySQL 8.4** | 关系型 | - | ✅ mysql2 | ❌ | ❌ | ❌ | 均可 |
| **SQLite** | 嵌入式 | - | ✅ better-sqlite3 | ✅ | ❌ | ❌ | 自托管 |
| **MongoDB** | 文档 | 26K (mongoose) | ✅ | ❌ | ⚠️ Change Streams | ⚠️ Atlas | 均可 |
| **Redis 8** | KV | 13K (ioredis) | ✅ | ⚠️ Upstash | ✅ Pub/Sub | ❌ | 均可 |
| **Turso** | SQLite/Edge | 12K | ✅ | ✅ | ❌ | ❌ | 均可 |
| **Cloudflare D1** | SQLite/Edge | - | ✅ | ✅ | ❌ | ❌ | 托管 |
| **Supabase** | PG+平台 | 78K | ✅ | ✅ | ✅ | ✅ pgvector | 均可 |
| **Neon** | PG/Serverless | 14K | ✅ | ✅ | ❌ | ✅ pgvector | 托管 |
| **Pinecone** | 向量 | - | ✅ | ✅ | ❌ | ✅ | 托管 |
| **TimescaleDB** | 时序 | 18K | ✅ | ❌ | ❌ | ❌ | 均可 |
| **CockroachDB** | 分布式SQL | 30K | ✅ | ❌ | ❌ | ⚠️ 扩展 | 均可 |
| **PlanetScale** | MySQL/Serverless | - | ✅ | ✅ | ❌ | ❌ | 托管 |
| **FaunaDB** | 文档/关系 | - | ✅ | ✅ | ✅ | ❌ | 托管 |
| **WeeDB** | 嵌入式/Edge | 2.1K | ✅ | ✅ | ❌ | ❌ | 自托管 |

📊 数据来源: GitHub Stars (2026-05), npm 下载量, DB-Engines 排名, 官方基准测试报告

---

## 关系型数据库深度对比

| 维度 | PostgreSQL 17 | MySQL 8.4 | SQLite | Turso | Neon | CockroachDB | PlanetScale |
|------|---------------|-----------|--------|-------|------|-------------|-------------|
| **适用规模** | 任意 | 任意 | 小型/本地 | 小型/Edge | 任意/Serverless | 全球分布式 | 任意/Serverless |
| **并发** | 极高 | 高 | 低 | 中 | 高 | 极高 | 高 |
| **扩展性** | 读写分离、分片 | 主从复制 | 无 | 全球复制 | 自动扩展 | 水平线性扩展 | 分支式扩展 |
| **JSON** | ✅ JSONB | ✅ JSON | ⚠️ 文本 | ⚠️ 文本 | ✅ JSONB | ✅ JSONB | ✅ JSON |
| **全文搜索** | ✅ | ✅ | ❌ | ❌ | ✅ | ⚠️ 有限 | ✅ |
| **向量搜索** | ✅ pgvector | ❌ | ❌ | ❌ | ✅ pgvector | ⚠️ 扩展 | ❌ |
| **GIS** | ✅ PostGIS | ⚠️ 有限 | ❌ | ❌ | ✅ | ⚠️ 有限 | ⚠️ 有限 |
| **Edge 延迟** | 50-100ms | 50-100ms | <1ms | <10ms | <20ms | 100-300ms | 20-50ms |
| **成本/月** | $10+ | $10+ | 免费 | 免费起 | 免费起 | $0-计费 | 免费起 |
| **最大连接数** | 10,000+ | 2,000+ | 1 | 1,000+ | 10,000+ | 50,000+ | 10,000+ |
| **存储上限** | 无限制 | 64TB/表 | 281TB | 500GB-2TB | 500GB-无限制 | 无限制 | 500GB-无限制 |

> 💡 **选型建议**: 需要全球分布式 ACID 事务选 CockroachDB；MySQL 生态 Serverless 选 PlanetScale；通用关系型首选 PostgreSQL。

---

## NoSQL 数据库对比

| 维度 | MongoDB 8 | Redis 8 | DynamoDB | Cassandra | FaunaDB |
|------|-----------|---------|----------|-----------|---------|
| **数据模型** | 文档 | KV | KV+文档 | 宽列 | 文档+关系 |
| **Schema** | 灵活 | 无 | 弱 | 预定义 | 灵活+可选 |
| **查询能力** | 丰富 | 简单键 | 键+部分二级 | CQL | FQL (GraphQL风格) |
| **事务** | ✅ 多文档 | ✅ Lua | ✅ | ✅ LWT | ✅ 全局 ACID |
| **水平扩展** | ✅ Sharding | ✅ Cluster | ✅ 自动 | ✅ 原生 | ✅ 自动 |
| **适用场景** | 内容/日志 | 缓存/队列 | AWS 生态 | 大数据 | 边缘/无服务器 |
| **TS 支持** | ✅ Mongoose | ✅ ioredis | ⚠️ 有限 | ⚠️ | ✅ 官方驱动 |
| **最大连接数** | 64,000 | 10,000 | 无限制 | 无限制 | 无限制 |

---

## Edge 数据库对比

| 平台 | 类型 | 全球复制 | 免费额度 | 延迟 | ORM | 连接模式 |
|------|------|:--------:|:--------:|:----:|-----|----------|
| **Cloudflare D1** | SQLite | ✅ | 5GB + 10万/天 | <10ms | Drizzle/Prisma | HTTP/JSON |
| **Turso** | SQLite | ✅ | 500DB + 10亿读 | <10ms | libsql/drizzle | HTTP/gRPC |
| **Neon** | PostgreSQL | ✅ | 0.5GB + 190h | <20ms | Prisma/Drizzle | 标准 TCP |
| **Supabase** | PostgreSQL | ✅ | 500MB + 2GB 出口 | 20-50ms | Prisma/Drizzle | 连接池/PostgREST |
| **PlanetScale** | MySQL | ✅ | 5GB + 10亿读 | 20-50ms | Prisma | 连接池 |
| **FaunaDB** | 文档/关系 | ✅ | 100K 读 + 50K 写 | <50ms | 官方驱动 | HTTP/GraphQL |

> ⚠️ **注意**: Edge 数据库普遍采用 HTTP 连接模式以绕过 TCP 冷启动，但牺牲了长连接事务能力。

---

## 向量数据库对比

| 数据库 | 开源 | 托管 | 本地部署 | 相似度算法 | 混合搜索 |
|--------|:----:|:----:|:--------:|:----------:|:--------:|
| **pgvector** | ✅ | ⚠️ | ✅ | L2/IP/Cosine | ✅ |
| **Pinecone** | ❌ | ✅ | ❌ | 多种 | ✅ |
| **Weaviate** | ✅ | ✅ | ✅ | 多种 | ✅ |
| **Chroma** | ✅ | ✅ | ✅ | Cosine | ⚠️ |
| **Milvus** | ✅ | ✅ | ✅ | 多种 | ✅ |
| **Qdrant** | ✅ | ✅ | ✅ | Cosine | ✅ |

---

## ORM 与驱动兼容性矩阵

### 关系型数据库 ORM 支持

| ORM | PostgreSQL | MySQL | SQLite | Turso | Neon | CockroachDB | PlanetScale |
|-----|:----------:|:-----:|:------:|:-----:|:----:|:-----------:|:-----------:|
| **Prisma** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ✅ | ✅ | ✅ 实验 | ✅ |
| **Drizzle** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ✅ libsql | ✅ | ✅ | ✅ |
| **TypeORM** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ⚠️ 需适配 | ✅ | ⚠️ 部分 | ✅ |
| **Kysely** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ✅ | ✅ | ⚠️ 部分 | ✅ |
| **Knex** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ❌ | ✅ | ⚠️ 部分 | ✅ |
| **Sequelize** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ❌ | ✅ | ❌ | ✅ |
| **MikroORM** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ⚠️ | ✅ | ⚠️ | ✅ |

### NoSQL / Edge 数据库 ORM 支持

| ORM | MongoDB | Redis | FaunaDB | Supabase | D1 |
|-----|:-------:|:-----:|:-------:|:--------:|:---:|
| **Prisma** | ✅ | ⚠️ 预览 | ❌ | ✅ 间接 | ✅ |
| **Drizzle** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **TypeORM** | ✅ | ⚠️ | ❌ | ⚠️ | ❌ |
| **Mongoose** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **ioredis** | ❌ | ✅ 原生 | ❌ | ❌ | ❌ |

> 📚 **说明**: Drizzle 优先支持 libSQL (Turso 原生协议)；Prisma 对 CockroachDB 支持仍处于实验阶段，部分高级类型不支持。

---

## 性能对比

### 读写 QPS (单实例)

| 数据库 | 读 QPS | 写 QPS | 延迟 P99 | 连接数限制 | 测试环境 |
|--------|--------|--------|----------|:----------:|----------|
| **PostgreSQL** | 50,000+ | 10,000+ | 5ms | 10,000+ | 16C/64GB SSD |
| **MySQL** | 40,000+ | 8,000+ | 5ms | 2,000+ | 16C/64GB SSD |
| **MongoDB** | 100,000+ | 20,000+ | 10ms | 64,000 | 16C/64GB SSD |
| **Redis** | 1,000,000+ | 100,000+ | 1ms | 10,000 | 16C/64GB |
| **SQLite** | 100,000+ | 50,000+ | 0.1ms | 1 | 本地 SSD |
| **D1** | 10,000+ | 5,000+ | 20ms | HTTP | Cloudflare Edge |
| **Turso** | 15,000+ | 8,000+ | 15ms | 1,000+ | Fly.io Edge |
| **Neon** | 40,000+ | 10,000+ | 15ms | 10,000+ | Serverless PG |
| **CockroachDB** | 80,000+ | 30,000+ | 20ms | 50,000+ | 3 节点集群 |
| **PlanetScale** | 35,000+ | 8,000+ | 18ms | 10,000+ | Serverless MySQL |
| **FaunaDB** | 25,000+ | 12,000+ | 80ms | 无限制 | 全球多区域 |

> 📊 数据来源: 各厂商官方基准测试 (2025-2026), sysbench, pgbench, YCSB。实际性能受网络、数据模型、索引设计影响显著。

### 延迟分布 (P50/P95/P99)

| 数据库 | P50 | P95 | P99 | 备注 |
|--------|-----|-----|-----|------|
| **SQLite (本地)** | 0.05ms | 0.1ms | 0.5ms | 文件锁竞争时恶化 |
| **Redis** | 0.5ms | 1ms | 2ms | 内存操作 |
| **PostgreSQL** | 2ms | 4ms | 8ms | 复杂查询可达 50ms+ |
| **MySQL** | 2ms | 4ms | 10ms | InnoDB Buffer Pool 命中时 |
| **Neon** | 5ms | 12ms | 25ms | 包含网络往返 |
| **Turso** | 3ms | 8ms | 20ms | 就近 Edge 节点 |
| **D1** | 5ms | 15ms | 30ms | Worker 同区域最优 |
| **FaunaDB** | 30ms | 60ms | 150ms | 跨区域因果一致性代价 |
| **CockroachDB** | 5ms | 15ms | 40ms | 分布式共识延迟 |

---

## 成本对比 (2026-05)

### 免费额度与付费阶梯

| 平台 | 免费额度 | 起步价/月 | 计费模式 | 隐藏成本 |
|------|----------|:---------:|----------|----------|
| **Neon** | 0.5GB + 190 计算小时 | $19 | 存储 + 计算小时 | 长连接空闲计费, 自动扩展 |
| **Supabase** | 500MB + 2GB 出口 | $25 | 固定档位 | 实时连接数超额, Auth MAU |
| **PlanetScale** | 5GB + 10亿读 | $39 | 读写次数 + 存储 | 分支合并收费, 部署请求 |
| **Turso** | 500DB + 10亿读 | $29 | 读取操作 + 存储 | 多区域复制额外计费 |
| **D1** | 5GB + 10万读/天 | $5/百万行 | 操作次数 | Worker 调用次数叠加 |
| **FaunaDB** | 100K 读 + 50K 写 | $25 | 操作次数 | 复合查询按读次数倍数计费 |
| **Upstash Redis** | 10K 命令/天 | $30 | 命令数 + 存储 | 大 Value 传输费 |
| **Pinecone** | 2GB + 10万查询 | $70 |  pod 小时 | 元数据过滤额外计费 |
| **CockroachDB Serverless** | 5GB + 25M 请求 | $0 | 请求数 + 存储 | 出口流量, 专用集群 $1500+/月 |
| **AWS RDS PG** | 无 | $15 | 实例规格 | IOPS 计费, 备份存储, 出口 |

> 💰 **成本提示**: Serverless 数据库的"免费额度"陷阱在于自动扩展导致的突发计费。建议设置告警阈值。

---

## 迁移难度评估

### 从 MySQL/PostgreSQL 到 Edge DB

| 迁移方向 | 难度 | 预计工时 | 主要挑战 | 工具支持 |
|----------|:----:|:--------:|----------|----------|
| **MySQL → PlanetScale** | ⭐ 低 | 1-3 天 | 语法兼容, 分支切换 | `pscale` CLI, 自动 Schema 导入 |
| **PostgreSQL → Neon** | ⭐ 低 | 1-3 天 | 连接池调整, pg_dump 导入 | `pg_dump`/`pg_restore`, 分支克隆 |
| **PostgreSQL → Supabase** | ⭐⭐ 中低 | 3-7 天 | RLS 策略重写, Auth 集成 | Supabase CLI, 迁移向导 |
| **MySQL/PostgreSQL → Turso** | ⭐⭐⭐ 中 | 1-2 周 | SQLite 方言差异, 类型映射 | `turso db shell`, `libsql-migrate` |
| **MySQL/PostgreSQL → D1** | ⭐⭐⭐⭐ 中高 | 2-4 周 | 事务限制, ALTER TABLE 受限 | `wrangler d1`, 手动迁移脚本 |
| **PostgreSQL → CockroachDB** | ⭐⭐ 中低 | 3-7 天 | 方言差异 (LIMIT), 序列处理 | `IMPORT PGDUMP`, Schema 转换器 |
| **任意 → FaunaDB** | ⭐⭐⭐⭐⭐ 高 | 4-8 周 | 范式转换 (文档→关系), FQL 重写 | 无自动工具, 需手动建模 |

> 🛠️ **迁移策略**: 建议采用"双写 + 增量同步"方式降低风险。对于 SQLite Edge 数据库，需特别注意 SQLite 不支持 `ALTER TABLE DROP COLUMN` 等操作。

---

## 事务支持矩阵

| 数据库 | ACID | 隔离级别 | 分布式事务 | Saga 支持 | 乐观锁 | 悲观锁 |
|--------|:----:|----------|:----------:|:---------:|:------:|:------:|
| **PostgreSQL** | ✅ | 全级别 | ⚠️ 外部协调 | ⚠️ 应用层 | ✅ | ✅ |
| **MySQL (InnoDB)** | ✅ | RC/RR/S | ❌ | ⚠️ 应用层 | ✅ | ✅ |
| **SQLite** | ✅ | 串行化 | ❌ | ❌ | ❌ | 文件锁 |
| **MongoDB** | ✅ | 读未提交/快照 | ⚠️ 4.2+ 多副本 | ⚠️ 应用层 | ✅ | ✅ 文档级 |
| **Redis** | ✅ 单命令 | - | ❌ | ❌ | ✅ WATCH | ❌ |
| **CockroachDB** | ✅ | 串行化 (默认) | ✅ 原生 | ⚠️ 应用层 | ✅ | ⚠️ 不同实现 |
| **FaunaDB** | ✅ | 串行化 (全局) | ✅ 原生 | ❌ | ✅ | 无 |
| **Neon** | ✅ | 全级别 | ⚠️ 外部协调 | ⚠️ 应用层 | ✅ | ✅ |
| **PlanetScale** | ✅ | RC/RR | ❌ | ⚠️ 应用层 | ✅ | ✅ |
| **D1** | ⚠️ 有限 | 串行化 | ❌ | ❌ | ❌ | 文件锁 |
| **Turso** | ✅ | 串行化 | ❌ | ❌ | ❌ | 文件锁 |

> 📖 **Saga 模式**: 目前仅 CockroachDB 和 FaunaDB 在协议层原生支持跨文档/跨表 Saga 语义。其他数据库需通过 Temporal、Camunda 或应用层状态机实现。

---

## 备份与恢复

### RPO/RTO 与 PITR 支持

| 平台 | RPO | RTO | PITR | 跨区域复制 | 备份类型 |
|------|-----|-----|:----:|:----------:|----------|
| **Neon** | 0 (WAL 归档) | 秒级 | ✅ 7 天 | ✅ 自动 | 增量/连续 |
| **Supabase** | 0 (WAL) | 分钟级 | ✅ 7-28 天 | ✅ 手动配置 | 逻辑/物理 |
| **PlanetScale** | 0 (Binlog) | 秒级 | ✅ 7 天 | ✅ 内置 | 分支快照 |
| **Turso** | 小时级 | 分钟级 | ⚠️ 按时间点恢复有限 | ✅ 全球复制 | 逻辑导出 |
| **D1** | 小时级 | 分钟级 | ❌ | ✅ 自动 | 快照 |
| **CockroachDB** | 0 (Raft) | 秒级 | ⚠️ 需配置 | ✅ 原生 | 增量 |
| **AWS RDS** | 0-5 分钟 | 分钟-小时 | ✅ 35 天 | ✅ 跨区域 | 自动快照 |
| **MongoDB Atlas** | 0 (Oplog) | 分钟级 | ✅ 7-30 天 | ✅ 区域部署 | 连续备份 |
| **FaunaDB** | 0 | 秒级 | ❌ | ✅ 原生多活 | 事件溯源 |

> ⏱️ **RPO/RTO 定义**: RPO = 可接受的数据丢失窗口；RTO = 恢复服务所需时间。PITR (Point-in-Time Recovery) 对于误操作回滚至关重要。

---

## 2026 新数据库与生态

### WeeDB

| 特性 | 说明 |
|------|------|
| **定位** | 嵌入式 TypeScript 数据库，对标 better-sqlite3 |
| **Stars** | 2.1K (GitHub, 2026-05) |
| **特点** | 原生 TS 类型推断，零序列化开销，Worker 线程安全 |
| **适用** | 桌面应用 (Electron/Tauri)，边缘 Worker |
| **局限** | 单进程写入，无网络协议，社区生态早期 |

### libSQL 生态

| 组件 | 说明 |
|------|------|
| **libSQL** | SQLite 开源分支，由 Turso 维护，添加原生 WASM、HTTP 协议支持 |
| **Turso** | libSQL 的托管服务，全球边缘复制 |
| **Drizzle + libSQL** | 最佳实践组合，类型安全 + Edge 就绪 |
| **SQLocal** | 浏览器内 SQLite (OPFS)，基于 libSQL WASM |
| **进展** | 2026 年 libSQL 3.0 引入行列混存，OLAP 性能提升 3-5 倍 |

### Neon 分支与 Serverless Postgres 演进

| 特性 | 说明 |
|------|------|
| **Neon Branching** | 数据库分支如 Git 分支，CI/CD 集成测试标配 |
| **Autoscaling** | 计算资源 0 → 8 CU 自动弹性，空闲计费降为 0 |
| **Neon Serverless Driver** | 支持 HTTP 和 WebSocket 双协议，Vercel/Cloudflare 最优 |
| **2026 新功能** | Neon Analytics (列存扩展)，单集群 HTAP 成为可能 |

---

## 选型决策树

```
需要事务 + 复杂查询?
├── 是
│   ├── 需要全球分布式 ACID? → CockroachDB / FaunaDB
│   ├── 需要向量搜索? → PostgreSQL + pgvector / Neon
│   ├── Serverless/自动扩展? → Neon / Supabase / PlanetScale
│   ├── Edge 优先? → D1 / Turso
│   └── 通用 → PostgreSQL
└── 否
    ├── 文档模型? → MongoDB / Supabase / FaunaDB
    ├── KV + 缓存? → Redis / Upstash
    ├── 时序数据? → TimescaleDB / InfluxDB
    ├── 图数据? → Neo4j / ArangoDB
    ├── AI/RAG? → pgvector / Pinecone / Weaviate
    └── 全栈平台? → Supabase / Firebase
```

| 场景 | 推荐 | 次选 |
|------|------|------|
| 通用 Web 应用 | PostgreSQL | MySQL |
| 边缘/Serverless | D1 / Turso / Neon | Supabase |
| 缓存/会话 | Redis | Dragonfly |
| 文档存储 | MongoDB | FaunaDB |
| AI/RAG | pgvector / Pinecone | Weaviate / Qdrant |
| 实时应用 | Supabase (Realtime) | Firebase |
| 时序数据 | TimescaleDB | InfluxDB |
| 图数据库 | Neo4j | ArangoDB |
| 全球分布式 OLTP | CockroachDB | YugabyteDB |
| 无服务器 MySQL | PlanetScale | AWS Aurora Serverless |

---

## 2026 趋势

| 趋势 | 描述 | 影响 |
|------|------|------|
| **PostgreSQL 统一化** | 通过扩展满足向量/图/时序需求 | 独立专用数据库市场份额受挤压 |
| **Edge 数据库默认** | 新项目首选 D1/Turso/Neon | 传统云数据库需增加 Edge 接入点 |
| **Serverless Postgres** | Neon/Supabase 成为标准 | 按需计费模型重塑成本结构 |
| **向量搜索内置化** | pgvector 挑战独立向量数据库 | Pinecone/Weaviate 需强化差异化 |
| **AI 原生数据库** | 内置 Embedding、自动 RAG | 数据库与 AI 工程边界模糊 |
| **libSQL 标准化** | SQLite 分支成为 Edge 事实标准 | better-sqlite3 用户逐步迁移 |
| **HTAP 融合** | Neon Analytics、TiDB 等行列混存 | OLTP/OLAP 分离架构简化 |
| **Git 式数据库** | 分支、合并、PR Review Schema | PlanetScale/Neon 引领 DevOps 变革 |

---

## 参考资源与数据来源

- [PostgreSQL 文档](https://www.postgresql.org/docs/) 📚
- [Prisma 文档](https://www.prisma.io/docs/) 📚
- [Drizzle ORM](https://orm.drizzle.team/) 📚
- [Supabase](https://supabase.com/) 📚
- [Neon](https://neon.tech/) 📚
- [Turso](https://turso.tech/) 📚
- [PlanetScale](https://planetscale.com/) 📚
- [CockroachDB 文档](https://www.cockroachlabs.com/docs/) 📚
- [FaunaDB 文档](https://docs.fauna.com/) 📚
- [libSQL GitHub](https://github.com/tursodatabase/libsql) 📚
- [DB-Engines 排名](https://db-engines.com/en/ranking) 📊
- [Cloudflare D1 定价](https://developers.cloudflare.com/d1/platform/pricing/) 💰
- [Neon 基准测试](https://neon.tech/blog) 📊
- [YCSB 基准测试套件](https://github.com/brianfrankcooper/YCSB) 📊

---

> 📌 **免责声明**: 性能数据来源于各厂商官方基准测试及社区第三方测试，实际表现因负载模型、硬件配置、网络环境而异。成本数据截至 2026-05，请以各平台官方定价页为准。
