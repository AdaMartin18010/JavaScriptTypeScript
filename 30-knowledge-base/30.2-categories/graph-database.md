# 图数据库

> JavaScript/TypeScript 生态图数据库选型。

---

## 主流方案

| 数据库 | 查询语言 | 托管服务 | 说明 |
|--------|---------|---------|------|
| **Neo4j** | Cypher | AuraDB | 最成熟，ACID |
| **Amazon Neptune** | Gremlin/SPARQL | AWS | 云原生 |
| **Dgraph** | GraphQL+- | 自托管 | 分布式 |
| **Memgraph** | Cypher | 自托管 | 高性能内存 |

## 使用场景

- 社交网络关系
- 推荐引擎
- 知识图谱
- 权限模型（RBAC/ABAC）

---

*最后更新: 2026-04-29*
