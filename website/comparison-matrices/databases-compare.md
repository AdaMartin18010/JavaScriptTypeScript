---
title: 数据库选型对比矩阵
description: 2025-2026 年 JavaScript/TypeScript 生态主流数据库选型对比，覆盖关系型、NoSQL、向量、Edge 数据库
---

# 数据库选型对比矩阵

> 最后更新: 2026-05-01 | 数据截至: 2026-04

---

## 核心维度总览

| 数据库 | 类型 | Stars | TS 支持 | Edge 就绪 | 实时 | 向量搜索 | 托管/自托管 |
|--------|------|-------|:-------:|:---------:|:----:|:--------:|------------|
| **PostgreSQL** | 关系型 | - | ✅ @types/pg | ⚠️ Neon | ❌ | ✅ pgvector | 均可 |
| **MongoDB** | 文档 | 26K (mongoose) | ✅ | ❌ | ⚠️ Change Streams | ⚠️ Atlas | 均可 |
| **Redis** | KV | 13K (ioredis) | ✅ | ⚠️ Upstash | ✅ Pub/Sub | ❌ | 均可 |
| **Turso** | SQLite/Edge | 12K | ✅ | ✅ | ❌ | ❌ | 均可 |
| **Cloudflare D1** | SQLite/Edge | - | ✅ | ✅ | ❌ | ❌ | 托管 |
| **Supabase** | PG+平台 | 78K | ✅ | ✅ | ✅ | ✅ pgvector | 均可 |
| **Pinecone** | 向量 | - | ✅ | ✅ | ❌ | ✅ | 托管 |
| **Neon** | PG/Serverless | 14K | ✅ | ✅ | ❌ | ✅ pgvector | 托管 |

---

## 关系型数据库深度对比

| 维度 | PostgreSQL | MySQL | SQLite | Turso |
|------|-----------|-------|--------|-------|
| **适用规模** | 任意 | 任意 | 小型/本地 | 小型/Edge |
| **并发能力** | 极高 | 高 | 低 | 中 |
| **扩展性** | 读写分离、分片 | 主从复制 | 无 | 全球复制 |
| **JSON 支持** | ✅ JSONB | ✅ JSON | ⚠️ 文本 | ⚠️ 文本 |
| **全文搜索** | ✅ | ✅ | ❌ | ❌ |
| **向量搜索** | ✅ pgvector | ❌ | ❌ | ❌ |
| **Edge 延迟** | 50-100ms | 50-100ms | < 1ms | < 10ms |

---

## 选型决策树

```
需要事务 + 复杂查询?
├─ 是 → PostgreSQL（通用）或 Neon（Serverless）
│   └─ 需要向量搜索? → PostgreSQL + pgvector
├─ 文档模型 + 灵活 schema? → MongoDB 或 Supabase
├─ KV + 缓存? → Redis 或 Upstash
├─ Edge/Serverless 优先? → Turso / D1 / Neon
├─ AI/RAG 应用? → PostgreSQL + pgvector 或 Pinecone
└─ 全栈平台（Auth + 实时）? → Supabase 或 Firebase
```

---

## 2026 趋势

1. **PostgreSQL 统一化**：通过扩展（pgvector、pg_graphql）满足多种需求
2. **Edge 数据库成为默认**：新项目首选 Turso/D1/Neon
3. **向量搜索内置化**：独立向量数据库面临整合压力
