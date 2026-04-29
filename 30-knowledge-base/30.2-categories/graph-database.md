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

## 扩展代码示例

### Dgraph + TypeScript（dgraph-js-http）

```typescript
import { DgraphClient, DgraphClientStub } from 'dgraph-js-http';

const stub = new DgraphClientStub('http://localhost:8080');
const client = new DgraphClient(stub);

async function setupSchema() {
  const schema = `
    name: string @index(exact) .
    age: int .
    friend: [uid] .
    bought: [uid] .
  `;
  await client.alter({ schema });
}

async function mutateData() {
  const txn = client.newTxn();
  try {
    const mu = {
      set: [
        { name: 'Alice', age: 30, friend: [{ name: 'Bob', age: 25 }] },
      ],
    };
    await txn.mutate(mu);
    await txn.commit();
  } finally {
    await txn.discard();
  }
}

async function queryFriends(name: string) {
  const query = `
    query friends($name: string) {
      user(func: eq(name, $name)) {
        name
        friend { name age }
      }
    }
  `;
  const vars = { $name: name };
  const res = await client.newTxn().queryWithVars(query, vars);
  return res.data.user;
}

(async () => {
  await setupSchema();
  await mutateData();
  console.log(await queryFriends('Alice'));
  await stub.close();
})();
```

### Amazon Neptune（Gremlin）+ TypeScript

```typescript
import { driver, process as gprocess } from 'gremlin';

const traversal = gprocess.statics;
const connection = new driver.DriverRemoteConnection(
  'wss://your-neptune-endpoint:8182/gremlin'
);
const g = gprocess.traversal().withRemote(connection);

async function addVertex(label: string, properties: Record<string, unknown>) {
  let t = g.addV(label);
  for (const [key, value] of Object.entries(properties)) {
    t = t.property(key, value);
  }
  return await t.next();
}

async function findFriends(name: string) {
  return await g
    .V()
    .has('name', name)
    .out('knows')
    .values('name')
    .toList();
}

(async () => {
  await addVertex('person', { name: 'Alice', age: 30 });
  await addVertex('person', { name: 'Bob', age: 25 });
  // 建立关系...
  console.log(await findFriends('Alice'));
  await connection.close();
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
- [Neo4j Cypher Query Language Reference](https://neo4j.com/docs/cypher-manual/current/)
- [neo4j-driver npm](https://www.npmjs.com/package/neo4j-driver)
- [Dgraph 官方文档](https://dgraph.io/docs)
- [dgraph-js-http npm](https://www.npmjs.com/package/dgraph-js-http)
- [Amazon Neptune 官方文档](https://docs.aws.amazon.com/neptune/)
- [Apache TinkerPop Gremlin Documentation](https://tinkerpop.apache.org/gremlin.html)
- [gremlin-javascript npm](https://www.npmjs.com/package/gremlin)
- [Memgraph 官方文档](https://memgraph.com/docs)
- [Memgraph JS Client](https://www.npmjs.com/package/memgraph-js)
- [GraphQL.org](https://graphql.org/)（DQL 概念来源）
- [DB-Engines Graph DBMS Ranking](https://db-engines.com/en/ranking/graph+dbms)
- [Gartner: Graph Database Market Guide](https://www.gartner.com/)

---

*最后更新: 2026-04-29*
