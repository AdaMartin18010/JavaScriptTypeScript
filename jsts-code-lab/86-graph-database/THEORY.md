# 图数据库理论：从关系到图

> **目标读者**：关注复杂关系数据的后端工程师、数据架构师
> **关联文档**：[`docs/categories/86-graph-database.md`](../../docs/categories/86-graph-database.md)
> **版本**：2026-04
> **字数**：约 2,800 字

---

## 1. 为什么需要图数据库

### 1.1 关系型 vs 图数据库

| 查询 | SQL | Cypher (Neo4j) |
|------|-----|---------------|
| 朋友的朋友 | 多层 JOIN | `()-[:FRIEND]->()-[:FRIEND]->()` |
| 最短路径 | 复杂递归 CTE | `shortestPath()` |
| 推荐 | 聚合 + 排序 | 图遍历算法 |

**图数据库在关系查询上快 100-1000 倍**。

---

## 2. 图模型基础

### 2.1 属性图模型

```
(Alice:Person {name: 'Alice', age: 30})-[:KNOWS {since: 2020}]->(Bob:Person)
```

**核心概念**：
- **节点 (Node)**：实体，有标签和属性
- **关系 (Relationship)**：有方向的边，有类型和属性
- **属性 (Property)**：键值对

---

## 3. 查询语言

### 3.1 Cypher vs Gremlin vs GQL

| 语言 | 风格 | 适用 |
|------|------|------|
| **Cypher** | 声明式 | Neo4j |
| **Gremlin** | 命令式 | Apache TinkerPop |
| **GQL** | ISO 标准 | 未来统一 |

---

## 4. 选型

| 数据库 | 特点 | 适用 |
|--------|------|------|
| **Neo4j** | 最成熟 | 企业级图应用 |
| **Amazon Neptune** | 托管 | AWS 生态 |
| **Dgraph** | 水平扩展 | 大规模图 |
| **Memgraph** | 内存优先 | 实时分析 |

---

## 5. 总结

当数据的核心价值在于**关系**而非实体时，选择图数据库。

---

## 参考资源

- [Neo4j 文档](https://neo4j.com/docs/)
- [Graph Databases (Book)](https://neo4j.com/book-graph-databases/)
