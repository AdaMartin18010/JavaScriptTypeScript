---
dimension: 综合
sub-dimension: Graph database
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Graph database 核心概念与工程实践。

## 包含内容

- 本模块聚焦 graph database 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 graph-bipartite.test.ts
- 📄 graph-bipartite.ts
- 📄 graph-connected-components.test.ts
- 📄 graph-connected-components.ts
- 📄 graph-dijkstra.test.ts
- 📄 graph-dijkstra.ts
- 📄 graph-engine.test.ts
- 📄 graph-engine.ts
- 📄 graph-mst.test.ts
- 📄 graph-mst.ts
- 📄 graph-topological-sort.test.ts
- 📄 graph-topological-sort.ts
- 📄 index.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `graph-engine/` | 图存储引擎（邻接表/矩阵）与遍历 | `graph-engine.ts`, `graph-engine.test.ts` |
| `graph-dijkstra/` | 单源最短路径算法 | `graph-dijkstra.ts`, `graph-dijkstra.test.ts` |
| `graph-mst/` | 最小生成树（Prim/Kruskal） | `graph-mst.ts`, `graph-mst.test.ts` |
| `graph-topological-sort/` | 有向无环图拓扑排序 | `graph-topological-sort.ts`, `graph-topological-sort.test.ts` |
| `graph-connected-components/` | 连通分量检测 | `graph-connected-components.ts`, `graph-connected-components.test.ts` |
| `graph-bipartite/` | 二分图判定 | `graph-bipartite.ts`, `graph-bipartite.test.ts` |

## 代码示例

### 内存图数据库与 Cypher-like 查询

```typescript
type Node = { id: string; labels: string[]; props: Record<string, unknown> };
type Edge = { from: string; to: string; rel: string; props: Record<string, unknown> };

class InMemoryGraphDB {
  private nodes = new Map<string, Node>();
  private edges: Edge[] = [];

  addNode(n: Node) { this.nodes.set(n.id, n); }
  addEdge(e: Edge) { this.edges.push(e); }

  neighbors(id: string, rel?: string) {
    return this.edges
      .filter((e) => e.from === id && (!rel || e.rel === rel))
      .map((e) => this.nodes.get(e.to)!);
  }
}
```


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Neo4j Documentation | 官方文档 | [neo4j.com/docs](https://neo4j.com/docs/) |
| Cypher Query Language | 查询语言参考 | [neo4j.com/docs/cypher-manual](https://neo4j.com/docs/cypher-manual/current/) |
| Graph Databases (O'Reilly) | 经典书籍 | [neo4j.com/graph-databases-book](https://neo4j.com/graph-databases-book/) |
| Apache AGE | 图数据库扩展 | [age.apache.org](https://age.apache.org/) |

---

*最后更新: 2026-04-29*
