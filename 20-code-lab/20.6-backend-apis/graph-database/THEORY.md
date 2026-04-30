# 图数据库理论：从关系到图

> **目标读者**：关注复杂关系数据的后端工程师、数据架构师
> **关联文档**：``30-knowledge-base/30.2-categories/graph-database.md`` (Legacy) [Legacy link]
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

## 4. 选型：Neo4j vs Dgraph 深度对比

| 维度 | Neo4j | Dgraph |
|------|-------|--------|
| **数据模型** | 属性图（Labeled Property Graph） | 原生分布式图（RDF+） |
| **查询语言** | Cypher | GraphQL+- / DQL |
| **扩展性** | 垂直扩展为主，Neo4j Fabric 横向 | **原生水平分片** |
| **一致性** | ACID | **RAFT 分布式一致性** |
| **部署模式** | 单机 / 集群 / Aura（托管） | 自托管 / Slash GraphQL（已停服） |
| **最佳场景** | 复杂关系分析、推荐系统 | 超大规模知识图谱、社交网络 |
| **最大节点数** | 数十亿级（企业版） | **万亿级** |
| **社区 Stars** | ~13K (neo4j/neo4j) | ~20K (dgraph-io/dgraph) |
| **TS/JS 驱动** | `neo4j-driver`（官方） | `dgraph-js`（官方） |

---

## 5. Cypher 查询代码示例

### 5.1 基础 CRUD

```cypher
// 创建节点和关系
CREATE (alice:Person {name: 'Alice', age: 30})
CREATE (bob:Person {name: 'Bob', age: 25})
CREATE (carol:Person {name: 'Carol', age: 28})
CREATE (alice)-[:KNOWS {since: 2020}]->(bob)
CREATE (bob)-[:KNOWS {since: 2021}]->(carol)
CREATE (alice)-[:WORKS_WITH]->(carol);

// 查询 Alice 的所有朋友
MATCH (alice:Person {name: 'Alice'})-[:KNOWS]->(friend)
RETURN friend.name, friend.age;

// 朋友的朋友（FoF）推荐
MATCH (alice:Person {name: 'Alice'})-[:KNOWS]->()-[:KNOWS]->(fof:Person)
WHERE NOT (alice)-[:KNOWS]->(fof) AND alice <> fof
RETURN fof.name, count(*) AS mutualFriends
ORDER BY mutualFriends DESC;
```

### 5.2 最短路径查询

```cypher
// 查找 Alice 到 Carol 的最短路径
MATCH path = shortestPath(
  (alice:Person {name: 'Alice'})-[:KNOWS|WORKS_WITH*]-(carol:Person {name: 'Carol'})
)
RETURN path;

// 带权重最短路径（基于 since 属性）
MATCH path = shortestPath(
  (alice:Person {name: 'Alice'})-[r:KNOWS*]-(target:Person {name: 'Carol'})
)
WITH path, reduce(total = 0, rel IN relationships(path) | total + (2026 - rel.since)) AS weight
RETURN path, weight
ORDER BY weight ASC
LIMIT 1;
```

### 5.3 推荐系统：共同兴趣

```cypher
// 基于共同兴趣的商品推荐
MATCH (user:User {id: 'u-123'})-[:BOUGHT]->(product:Product)<-[:BOUGHT]-(other:User)
MATCH (other)-[:BOUGHT]->(recommendation:Product)
WHERE NOT (user)-[:BOUGHT]->(recommendation)
RETURN recommendation.name,
       count(DISTINCT other) AS buyerCount,
       avg(other.age) AS avgBuyerAge
ORDER BY buyerCount DESC
LIMIT 10;
```

---

## 6. TypeScript 图数据库客户端示例

```typescript
// neo4j-client.ts
import neo4j, { Driver, Session } from "neo4j-driver";

interface Person {
  name: string;
  age: number;
}

interface KnowledgeGraphConfig {
  uri: string;
  username: string;
  password: string;
}

class KnowledgeGraph {
  private driver: Driver;

  constructor(config: KnowledgeGraphConfig) {
    this.driver = neo4j.driver(
      config.uri,
      neo4j.auth.basic(config.username, config.password)
    );
  }

  async verifyConnectivity(): Promise<void> {
    await this.driver.verifyConnectivity();
    console.log("Neo4j connection established");
  }

  async createPerson(person: Person): Promise<string> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `CREATE (p:Person {name: $name, age: $age})
         RETURN elementId(p) AS id`,
        person
      );
      return result.records[0].get("id");
    } finally {
      await session.close();
    }
  }

  async createRelationship(
    fromName: string,
    toName: string,
    type: string,
    props: Record<string, unknown> = {}
  ): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `MATCH (a:Person {name: $fromName}), (b:Person {name: $toName})
         CREATE (a)-[r:${type} $props]->(b)`,
        { fromName, toName, props }
      );
    } finally {
      await session.close();
    }
  }

  async findFriendsOfFriends(name: string): Promise<Array<{ name: string; mutual: number }>> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `MATCH (p:Person {name: $name})-[:KNOWS]->()-[:KNOWS]->(fof:Person)
         WHERE p <> fof AND NOT (p)-[:KNOWS]->(fof)
         RETURN fof.name AS name, count(*) AS mutual
         ORDER BY mutual DESC`,
        { name }
      );
      return result.records.map((r) => ({
        name: r.get("name"),
        mutual: r.get("mutual").toNumber(),
      }));
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
}

// 使用示例
const kg = new KnowledgeGraph({
  uri: "bolt://localhost:7687",
  username: "neo4j",
  password: "password",
});

await kg.verifyConnectivity();
await kg.createPerson({ name: "Alice", age: 30 });
await kg.createPerson({ name: "Bob", age: 25 });
await kg.createRelationship("Alice", "Bob", "KNOWS", { since: 2020 });
const recommendations = await kg.findFriendsOfFriends("Alice");
console.log(recommendations);
await kg.close();
```

### Dgraph TypeScript 客户端示例

```typescript
// dgraph-client.ts — Dgraph DQL 查询与变更
import { DgraphClient, DgraphClientStub } from 'dgraph-js';
import grpc from '@grpc/grpc-js';

const stub = new DgraphClientStub('localhost:9080', grpc.credentials.createInsecure());
const dgraph = new DgraphClient(stub);

async function upsertUser(uid: string, name: string, email: string) {
  const txn = dgraph.newTxn();
  try {
    const mu = new (await import('dgraph-js')).Mutation();
    mu.setSetJson({
      uid: `_:${uid}`,
      'dgraph.type': 'User',
      name,
      email,
    });
    await txn.mutate(mu);
    await txn.commit();
  } finally {
    await txn.discard();
  }
}

async function queryFriends(uid: string) {
  const query = `
    query friends($uid: string) {
      user(func: uid($uid)) {
        name
        friend { name email }
      }
    }
  `;
  const res = await dgraph.newTxn({ readOnly: true }).queryWithVars(query, { $uid: uid });
  return res.getJson();
}
```

### 内存中图算法：拓扑排序（Kahn 算法）

```typescript
// topological-sort.ts — 用邻接表实现有向无环图（DAG）排序
class DAG<T> {
  private adj = new Map<T, Set<T>>();
  private inDegree = new Map<T, number>();

  addEdge(from: T, to: T): void {
    if (!this.adj.has(from)) this.adj.set(from, new Set());
    if (!this.adj.has(to)) this.adj.set(to, new Set());
    this.adj.get(from)!.add(to);
    this.inDegree.set(to, (this.inDegree.get(to) || 0) + 1);
    this.inDegree.set(from, this.inDegree.get(from) || 0);
  }

  topologicalSort(): T[] | null {
    const queue: T[] = [];
    const result: T[] = [];
    const inDegree = new Map(this.inDegree);

    for (const [node, deg] of inDegree) {
      if (deg === 0) queue.push(node);
    }

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);
      for (const neighbor of this.adj.get(node) || []) {
        const newDeg = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, newDeg);
        if (newDeg === 0) queue.push(neighbor);
      }
    }

    return result.length === this.adj.size ? result : null; // null = cycle detected
  }
}

// 使用：任务依赖排序
const dag = new DAG<string>();
dag.addEdge('build', 'test');
dag.addEdge('lint', 'build');
dag.addEdge('test', 'deploy');
console.log(dag.topologicalSort()); // ['lint', 'build', 'test', 'deploy']
```

---

## 7. 图数据库适用性决策树

```
数据关系复杂度评估
├── 主要是键值/文档查询？
│   └── → 使用 MongoDB / PostgreSQL JSONB
├── 多层 JOIN > 3 层？
│   ├── 数据量 < 1 亿节点？
│   │   └── → Neo4j（成熟生态、Cypher 易用）
│   └── 数据量 > 1 亿节点 / 需全球分布？
│       └── → Dgraph（原生分布式、水平扩展）
├── 需要复杂图算法（PageRank、社区发现）？
│   └── → Neo4j Graph Data Science 库
└── 已有 GraphQL 技术栈？
    └── → Dgraph（原生 GraphQL+- 支持）
```

---

## 8. 总结

当数据的核心价值在于**关系**而非实体时，选择图数据库。

| 数据特征 | 推荐数据库 |
|---------|-----------|
| 社交网络、关系图谱 | Neo4j / Dgraph |
| 推荐引擎 | Neo4j + GDS |
| 知识图谱（超大规模） | Dgraph |
| 欺诈检测（实时） | Neo4j（Bloom 可视化） |
| 网络/IT 运维拓扑 | Neo4j |

---

## 参考资源

- [Neo4j 文档](https://neo4j.com/docs/)
- [Neo4j Cypher 手册](https://neo4j.com/docs/cypher-manual/current/)
- [Dgraph 文档](https://dgraph.io/docs/)
- [Dgraph Query Language (DQL)](https://dgraph.io/docs/query-language/)
- [Graph Databases (Book)](https://neo4j.com/book-graph-databases/)
- [GraphQL+- 规范](https://dgraph.io/docs/query-language/)
- [Apache TinkerPop / Gremlin](https://tinkerpop.apache.org/)
- [GQL ISO 标准进展](https://www.gqlstandards.org/)
- [Neo4j JavaScript Driver](https://github.com/neo4j/neo4j-javascript-driver)
- [Neo4j Graph Data Science](https://neo4j.com/docs/graph-data-science/current/) — 图算法库（PageRank、Louvain、Betweenness）
- [Dgraph JavaScript Client](https://github.com/dgraph-io/dgraph-js) — gRPC 驱动的 TS 客户端
- [ArangoDB Documentation](https://www.arangodb.com/documentation/) — 多模型数据库（文档+图+KV）
- [Memgraph Documentation](https://memgraph.com/docs/) — 兼容 Cypher 的高性能内存图数据库
- [Amazon Neptune](https://aws.amazon.com/neptune/) — 托管图数据库（支持 Gremlin / openCypher / SPARQL）
- [TigerGraph Documentation](https://docs.tigergraph.com/) — 原生并行图分析平台
- [Graphileon](https://graphileon.com/) — 图数据库可视化与管理工具
- [Cytoscape.js](https://js.cytoscape.org/) — 浏览器端图数据可视化库

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `graph-bipartite.ts`
- `graph-connected-components.ts`
- `graph-dijkstra.ts`
- `graph-engine.ts`
- `graph-mst.ts`
- `graph-topological-sort.ts`
- `index.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括：

1. **图遍历模式 (Graph Traversal)**：深度优先（DFS）与广度优先（BFS）是所有图算法的基础原语，邻接表表示法兼顾空间效率与遍历速度。
2. **属性图模式 (Property Graph Model)**：将实体建模为节点、关系建模为有向边，两者均可携带属性。此模型天然映射社交网络、推荐系统和知识图谱。
3. **连接池与事务模式 (Connection Pooling & Transactions)**：图数据库查询往往涉及多跳遍历，会话（Session）和事务（Transaction）的显式管理是生产环境的必备实践。

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | `20-code-lab/20.4-data-algorithms/` — 图论基础算法（DFS、BFS、Dijkstra、拓扑排序） |
| 前置依赖 | `20-code-lab/20.6-backend-apis/analytics/` — 事件数据建模，图数据库常用于用户行为路径分析 |
| 后续进阶 | `30-knowledge-base/30.2-categories/graph-database.md` — 图数据库分类索引与选型矩阵 |
| 后续进阶 | `20-code-lab/20.6-backend-apis/realtime-analytics/` — 将图查询结果流式推送到实时分析仪表盘 |

---

> 📅 理论深化更新：2026-04-30
