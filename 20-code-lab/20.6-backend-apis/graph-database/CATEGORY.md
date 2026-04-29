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

### Dijkstra 最短路径实现

```typescript
// graph-dijkstra.ts — 优先队列优化的单源最短路径

interface WeightedEdge {
  to: string;
  weight: number;
}

class WeightedGraph {
  private adj = new Map<string, WeightedEdge[]>();

  addEdge(from: string, to: string, weight: number) {
    if (!this.adj.has(from)) this.adj.set(from, []);
    this.adj.get(from)!.push({ to, weight });
  }

  dijkstra(start: string): Map<string, number> {
    const dist = new Map<string, number>();
    const visited = new Set<string>();
    const pq = new BinaryHeap<{ node: string; d: number }>((a, b) => a.d - b.d);

    dist.set(start, 0);
    pq.push({ node: start, d: 0 });

    while (!pq.isEmpty()) {
      const { node } = pq.pop()!;
      if (visited.has(node)) continue;
      visited.add(node);

      for (const edge of this.adj.get(node) ?? []) {
        const nextDist = (dist.get(node) ?? Infinity) + edge.weight;
        if (nextDist < (dist.get(edge.to) ?? Infinity)) {
          dist.set(edge.to, nextDist);
          pq.push({ node: edge.to, d: nextDist });
        }
      }
    }

    return dist;
  }
}

// 极简二叉堆实现（用于优先队列）
class BinaryHeap<T> {
  private heap: T[] = [];
  constructor(private compare: (a: T, b: T) => number) {}

  push(val: T) {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const end = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.sinkDown(0);
    }
    return min;
  }

  isEmpty() { return this.heap.length === 0; }

  private bubbleUp(idx: number) { /* ... */ }
  private sinkDown(idx: number) { /* ... */ }
}
```

### Cypher 风格查询生成器

```typescript
// graph-engine.ts — 类型安全的图查询构建器

type MatchClause = { pattern: string; where?: string };
type ReturnClause = { fields: string[] };

class CypherBuilder {
  private clauses: string[] = [];

  match(pattern: string, where?: string): this {
    this.clauses.push(`MATCH ${pattern}${where ? ` WHERE ${where}` : ''}`);
    return this;
  }

  return(...fields: string[]): this {
    this.clauses.push(`RETURN ${fields.join(', ')}`);
    return this;
  }

  limit(n: number): this {
    this.clauses.push(`LIMIT ${n}`);
    return this;
  }

  build(): string {
    return this.clauses.join('\n');
  }
}

// 使用示例
const query = new CypherBuilder()
  .match('(u:User {name: $name})-[r:FOLLOWS]->(t:User)', 'u.active = true')
  .return('t.name', 'r.since')
  .limit(10)
  .build();

/* 生成：
MATCH (u:User {name: $name})-[r:FOLLOWS]->(t:User) WHERE u.active = true
RETURN t.name, r.since
LIMIT 10
*/
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
| openCypher | 开放查询规范 | [opencypher.org](https://opencypher.org/) |
| Gremlin (Apache TinkerPop) | 图遍历语言 | [tinkerpop.apache.org/gremlin.html](https://tinkerpop.apache.org/gremlin.html) |
| GraphQL.org | 图查询规范（应用层） | [graphql.org](https://graphql.org/) |
| GNNs for Graph Databases | 综述 | [arxiv.org/abs/2012.06052](https://arxiv.org/abs/2012.06052) |

---

*最后更新: 2026-04-29*
