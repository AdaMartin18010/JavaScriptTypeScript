# 图数据库

> JavaScript/TypeScript 生态图数据库选型。

---

## 主流方案对比

| 维度 | Neo4j | Dgraph | Amazon Neptune | Memgraph |
|------|-------|--------|----------------|----------|
| **查询语言** | Cypher | DQL (GraphQL+-) | Gremlin / SPARQL / openCypher | Cypher |
| **部署模式** | 自托管 / AuraDB | 自托管 / Slash GraphQL | AWS 托管 | 自托管 / Memgraph Cloud |
| **开源协议** | GPL-3（社区版） | Apache-2.0 | 托管服务 | BSL（社区版） |
| **数据模型** | 属性图 (Labeled Property Graph) | 原生图 + RDF | 属性图 / RDF | 属性图 |
| **横向扩展** | 商业版支持因果集群 | 原生分片 + 集群 | 自动扩展 | 单节点 / 高可用 |
| **ACID 支持** | 完整 ACID | 完整 ACID | 完整 ACID | 完整 ACID |
| **性能特点** | 成熟稳定 | 分布式高性能 | 云原生弹性 | 内存优先，极高吞吐 |
| **JS/TS 驱动** | neo4j-driver | dgraph-js-http | gremlin-javascript | mgclient / memgraph-js |
| **适用规模** | 中大型企业 | 超大规模分布式 | AWS 生态企业 | 实时分析 / 流处理 |
| **2026 状态** | ✅ 活跃 | ✅ 活跃 | ✅ 活跃 | ✅ 活跃 |

---

## 查询示例：Neo4j Cypher + TypeScript

```typescript
import neo4j, { Driver, Session } from 'neo4j-driver';

const driver: Driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
);

async function createGraphSchema() {
  const session: Session = driver.session();
  try {
    // 创建约束与索引
    await session.run(`
      CREATE CONSTRAINT user_id_unique IF NOT EXISTS
      FOR (u:User) REQUIRE u.id IS UNIQUE
    `);
    await session.run(`
      CREATE INDEX product_category_index IF NOT EXISTS
      FOR (p:Product) ON (p.category)
    `);
  } finally {
    await session.close();
  }
}

async function seedData() {
  const session = driver.session();
  try {
    await session.run(`
      CREATE (alice:User {id: 'u1', name: 'Alice', age: 30})
      CREATE (bob:User {id: 'u2', name: 'Bob', age: 25})
      CREATE (iphone:Product {id: 'p1', name: 'iPhone 16', category: 'Phone'})
      CREATE (mac:Product {id: 'p2', name: 'MacBook Pro', category: 'Laptop'})
      CREATE (alice)-[:BOUGHT {date: '2025-11-01'}]->(iphone)
      CREATE (alice)-[:FOLLOWS]->(bob)
      CREATE (bob)-[:BOUGHT {date: '2025-12-10'}]->(mac)
    `);
  } finally {
    await session.close();
  }
}

async function recommendProducts(userId: string) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})-[:FOLLOWS]->(friend:User)-[:BOUGHT]->(product:Product)
      WHERE NOT (u)-[:BOUGHT]->(product)
      RETURN product.name AS recommendation, product.category AS category, count(friend) AS score
      ORDER BY score DESC, product.name
      LIMIT 10
      `,
      { userId }
    );
    return result.records.map((r) => ({
      recommendation: r.get('recommendation'),
      category: r.get('category'),
      score: r.get('score').toNumber(),
    }));
  } finally {
    await session.close();
  }
}

(async () => {
  await createGraphSchema();
  await seedData();
  const recommendations = await recommendProducts('u1');
  console.table(recommendations);
  await driver.close();
})();
```

---

## 使用场景

- 社交网络关系
- 推荐引擎
- 知识图谱
- 权限模型（RBAC/ABAC）
- 欺诈检测
- 供应链溯源

---

## 权威参考链接

- [Neo4j 官方文档](https://neo4j.com/docs/)
- [Dgraph 官方文档](https://dgraph.io/docs)
- [Amazon Neptune 官方文档](https://docs.aws.amazon.com/neptune/)
- [Memgraph 官方文档](https://memgraph.com/docs)
- [Cypher Query Language Reference](https://neo4j.com/docs/cypher-manual/current/)
- [neo4j-driver npm](https://www.npmjs.com/package/neo4j-driver)

---

*最后更新: 2026-04-29*
