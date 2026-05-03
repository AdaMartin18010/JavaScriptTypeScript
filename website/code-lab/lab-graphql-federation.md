---
title: "GraphQL 联邦实验：多服务Schema合并"
description: "使用 Apollo Federation 构建分布式GraphQL架构：子服务定义、网关合并、实体解析与跨服务查询"
date: 2026-05-03
tags: ["实验", "GraphQL", "Federation", "微服务", "Apollo"]
category: "code-lab"
---

# GraphQL 联邦实验：多服务 Schema 合并

> 预计用时：90 分钟 | 难度：🌿 中级

## 实验目标

1. 理解 GraphQL Federation 的核心概念
2. 创建多个子服务（User Service、Product Service、Order Service）
3. 配置 Apollo Gateway 合并 Schema
4. 实现跨服务实体解析

## 架构概览

```mermaid
flowchart TB
    A[客户端] -->|统一查询| B[Apollo Gateway]
    B -->|路由| C[User Subgraph]
    B -->|路由| D[Product Subgraph]
    B -->|路由| E[Order Subgraph]
    C -->|@key(id)| F[实体解析]
    D -->|@key(id)| F
    E -->|@key(id)| F
```

## 环境准备

```bash
mkdir graphql-federation-lab
cd graphql-federation-lab
npm init -y
npm install @apollo/server @apollo/subgraph @apollo/gateway graphql
npm install -D typescript ts-node @types/node
```

## 子服务实现

### User Subgraph

```typescript
// services/user/index.ts
import &#123; ApolloServer &#125; from '@apollo/server';
import &#123; startStandaloneServer &#125; from '@apollo/server/standalone';
import &#123; buildSubgraphSchema &#125; from '@apollo/subgraph';
import gql from 'graphql-tag';

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key", "@shareable"])

  type User @key(fields: "id") &#123;
    id: ID!
    name: String!
    email: String!
    orders: [Order!]! @external
  &#125;

  type Query &#123;
    user(id: ID!): User
    users: [User!]!
  &#125;
`;

const users = [
  &#123; id: '1', name: 'Alice', email: 'alice@example.com' &#125;,
  &#123; id: '2', name: 'Bob', email: 'bob@example.com' &#125;,
];

const resolvers = &#123;
  Query: &#123;
    user: (_, &#123; id &#125;) => users.find(u => u.id === id),
    users: () => users,
  &#125;,
  User: &#123;
    __resolveReference(user) &#123;
      return users.find(u => u.id === user.id);
    &#125;,
  &#125;,
&#125;;

const server = new ApolloServer(&#123;
  schema: buildSubgraphSchema([&#123; typeDefs, resolvers &#125;]),
&#125;);

startStandaloneServer(server, &#123; listen: &#123; port: 4001 &#125; &#125;).then((&#123; url &#125;) => &#123;
  console.log(`🚀 User subgraph ready at $&#123;url&#125;`);
&#125;);
```

### Product Subgraph

```typescript
// services/product/index.ts
const typeDefs = gql`
  type Product @key(fields: "id") &#123;
    id: ID!
    name: String!
    price: Float!
    inStock: Boolean!
  &#125;

  type Query &#123;
    product(id: ID!): Product
    products: [Product!]!
  &#125;
`;
```

### Order Subgraph（跨服务引用）

```typescript
// services/order/index.ts
const typeDefs = gql`
  type Order &#123;
    id: ID!
    user: User! @external
    products: [Product!]!
    total: Float!
  &#125;

  extend type User @key(fields: "id") &#123;
    id: ID! @external
    orders: [Order!]!
  &#125;

  extend type Product @key(fields: "id") &#123;
    id: ID! @external
  &#125;
`;
```

## Gateway 配置

```typescript
// gateway.ts
import &#123; ApolloGateway, IntrospectAndCompose &#125; from '@apollo/gateway';
import &#123; ApolloServer &#125; from '@apollo/server';
import &#123; startStandaloneServer &#125; from '@apollo/server/standalone';

const gateway = new ApolloGateway(&#123;
  supergraphSdl: new IntrospectAndCompose(&#123;
    subgraphs: [
      &#123; name: 'users', url: 'http://localhost:4001/graphql' &#125;,
      &#123; name: 'products', url: 'http://localhost:4002/graphql' &#125;,
      &#123; name: 'orders', url: 'http://localhost:4003/graphql' &#125;,
    ],
  &#125;),
&#125;);

const server = new ApolloServer(&#123; gateway &#125;);

startStandaloneServer(server, &#123; listen: &#123; port: 4000 &#125; &#125;).then((&#123; url &#125;) => &#123;
  console.log(`🚀 Gateway ready at $&#123;url&#125;`);
&#125;);
```

## 联合查询测试

```graphql
query GetUserWithOrders &#123;
  user(id: "1") &#123;
    name
    email
    orders &#123;
      id
      total
      products &#123;
        name
        price
      &#125;
    &#125;
  &#125;
&#125;
```

## 验证清单

- [ ] 三个子服务独立启动成功
- [ ] Gateway 成功合并 Schema
- [ ] 跨服务查询返回正确结果
- [ ] `@key` 实体解析正常工作
- [ ] 错误处理 graceful degradation

## 参考资源

| 资源 | 链接 |
|------|------|
| Apollo Federation | <https://www.apollographql.com/docs/federation/> |
| Subgraph Spec | <https://specs.apollo.dev/federation/v2.3/> |

---

 [← 返回代码实验室首页](/code-lab/)
