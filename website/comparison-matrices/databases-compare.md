---
title: 数据库选型对比矩阵
description: 'PostgreSQL、MySQL、MongoDB、Redis、SQLite、Turso、Supabase、Neon、Pinecone、D1 等关系型/NoSQL/向量/Edge 数据库全面选型对比'
---

# 数据库选型对比矩阵

> 最后更新: 2026-05-01 | 覆盖: OLTP/OLAP/Edge/向量/时序/图数据库

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

📊 数据来源: GitHub Stars (2026-05), npm 下载量, DB-Engines 排名

---

## 关系型数据库深度对比

| 维度 | PostgreSQL 17 | MySQL 8.4 | SQLite | Turso | Neon |
|------|---------------|-----------|--------|-------|------|
| **适用规模** | 任意 | 任意 | 小型/本地 | 小型/Edge | 任意/Serverless |
| **并发** | 极高 | 高 | 低 | 中 | 高 |
| **扩展性** | 读写分离、分片 | 主从复制 | 无 | 全球复制 | 自动扩展 |
| **JSON** | ✅ JSONB | ✅ JSON | ⚠️ 文本 | ⚠️ 文本 | ✅ JSONB |
| **全文搜索** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **向量搜索** | ✅ pgvector | ❌ | ❌ | ❌ | ✅ pgvector |
| **GIS** | ✅ PostGIS | ⚠️ 有限 | ❌ | ❌ | ✅ |
| **Edge 延迟** | 50-100ms | 50-100ms | <1ms | <10ms | <20ms |
| **成本/月** | $10+ | $10+ | 免费 | 免费起 | 免费起 |

---

## NoSQL 数据库对比

| 维度 | MongoDB 8 | Redis 8 | DynamoDB | Cassandra |
|------|-----------|---------|----------|-----------|
| **数据模型** | 文档 | KV | KV+文档 | 宽列 |
| **Schema** | 灵活 | 无 | 弱 | 预定义 |
| **查询能力** | 丰富 | 简单键 | 键+部分二级 | CQL |
| **事务** | ✅ 多文档 | ✅ Lua | ✅ | ✅ LWT |
| **水平扩展** | ✅ Sharding | ✅ Cluster | ✅ 自动 | ✅ 原生 |
| **适用场景** | 内容/日志 | 缓存/队列 | AWS 生态 | 大数据 |
| **TS 支持** | ✅ Mongoose | ✅ ioredis | ⚠️ 有限 | ⚠️ |

---

## Edge 数据库对比

| 平台 | 类型 | 全球复制 | 免费额度 | 延迟 | ORM |
|------|------|:--------:|:--------:|:----:|-----|
| **Cloudflare D1** | SQLite | ✅ | 5GB + 10万/天 | <10ms | Drizzle/Prisma |
| **Turso** | SQLite | ✅ | 500DB + 10亿读 | <10ms | libsql/drizzle |
| **Neon** | PostgreSQL | ✅ | 0.5GB + 190h | <20ms | Prisma/Drizzle |
| **Supabase** | PostgreSQL | ✅ | 500MB + 2GB 出口 | 20-50ms | Prisma/Drizzle |
| **PlanetScale** | MySQL | ✅ | 5GB + 10亿读 | 20-50ms | Prisma |

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

## ORM 与驱动对比

| ORM | PostgreSQL | MySQL | SQLite | MongoDB | Redis | Edge |
|-----|:----------:|:-----:|:------:|:-------:|:-----:|:----:|
| **Prisma** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| **Drizzle** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **TypeORM** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **Mongoose** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Kysely** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## 性能对比

### 读写 QPS (单实例)

| 数据库 | 读 QPS | 写 QPS | 延迟 P99 |
|--------|--------|--------|----------|
| **PostgreSQL** | 50,000+ | 10,000+ | 5ms |
| **MySQL** | 40,000+ | 8,000+ | 5ms |
| **MongoDB** | 100,000+ | 20,000+ | 10ms |
| **Redis** | 1,000,000+ | 100,000+ | 1ms |
| **SQLite** | 100,000+ | 50,000+ | 0.1ms |
| **D1** | 10,000+ | 5,000+ | 20ms |

---

## 选型决策树

```
需要事务 + 复杂查询?
├── 是
│   ├── 需要向量搜索? → PostgreSQL + pgvector
│   ├── Serverless/自动扩展? → Neon / Supabase
│   ├── Edge 优先? → D1 / Turso
│   └── 通用 → PostgreSQL
└── 否
    ├── 文档模型? → MongoDB / Supabase
    ├── KV + 缓存? → Redis / Upstash
    ├── 时序数据? → TimescaleDB / InfluxDB
    ├── 图数据? → Neo4j / ArangoDB
    ├── AI/RAG? → pgvector / Pinecone / Weaviate
    └── 全栈平台? → Supabase / Firebase
```

| 场景 | 推荐 |
|------|------|
| 通用 Web 应用 | PostgreSQL |
| 边缘/Serverless | D1 / Turso / Neon |
| 缓存/会话 | Redis |
| 文档存储 | MongoDB |
| AI/RAG | pgvector / Pinecone |
| 实时应用 | Supabase (Realtime) |
| 时序数据 | TimescaleDB |
| 图数据库 | Neo4j |

---

## 2026 趋势

| 趋势 | 描述 |
|------|------|
| **PostgreSQL 统一化** | 通过扩展满足向量/图/时序需求 |
| **Edge 数据库默认** | 新项目首选 D1/Turso/Neon |
| **Serverless Postgres** | Neon/Supabase 成为标准 |
| **向量搜索内置化** | pgvector 挑战独立向量数据库 |
| **AI 原生数据库** | 内置 Embedding、自动 RAG |

---

## 参考资源

- [PostgreSQL 文档](https://www.postgresql.org/docs/) 📚
- [Prisma 文档](https://www.prisma.io/docs/) 📚
- [Drizzle ORM](https://orm.drizzle.team/) 📚
- [Supabase](https://supabase.com/) 📚
- [Neon](https://neon.tech/) 📚
- [Turso](https://turso.tech/) 📚

