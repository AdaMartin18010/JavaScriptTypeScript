---
dimension: 综合
sub-dimension: Graphql
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 GraphQL 核心概念与工程实践。

## 包含内容

- Schema 优先设计与类型安全构建
- Resolver 组合与数据加载器（DataLoader）
- 查询复杂度分析与持久化查询
- 订阅（Subscription）与实时 GraphQL

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `schema-builder.ts` | 类型安全 Schema 构建器与代码生成 | `schema-builder.test.ts` |
| `index.ts` | 模块统一导出 | — |
| `README.md` | 模块概述与快速开始 | — |
| `THEORY.md` | GraphQL 类型系统与执行模型理论 | — |

## 代码示例

### 类型安全 Schema 构建

```typescript
// schema-builder.ts
import { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLList } from 'graphql';

export function buildUserSchema() {
  const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: GraphQLString },
      name: { type: GraphQLString },
      email: { type: GraphQLString },
      friends: { type: new GraphQLList(UserType) },
    }),
  });

  const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
      user: {
        type: UserType,
        args: { id: { type: GraphQLString } },
        resolve: (_root, { id }, { loaders }) => loaders.user.load(id),
      },
    },
  });

  return new GraphQLSchema({ query: QueryType });
}
```

### DataLoader 批量加载器

```typescript
import DataLoader from 'dataloader';

export function createUserLoader(db: { findUsersByIds(ids: string[]): Promise<User[]> }) {
  return new DataLoader<string, User>(async (ids) => {
    const users = await db.findUsersByIds(ids as string[]);
    const map = new Map(users.map((u) => [u.id, u]));
    return ids.map((id) => map.get(id) ?? new Error(`User ${id} not found`));
  });
}
```

### 持久化查询哈希校验

```typescript
export function persistedQueryMiddleware(
  queryMap: Map<string, string>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { extensions } = req.body;
    const hash = extensions?.persistedQuery?.sha256Hash;

    if (hash && queryMap.has(hash)) {
      req.body.query = queryMap.get(hash);
    }

    next();
  };
}
```

### GraphQL 订阅与 WebSocket

```typescript
import { GraphQLObjectType, GraphQLString, GraphQLSchema } from 'graphql';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
const MESSAGE_ADDED = 'MESSAGE_ADDED';

const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    messageAdded: {
      type: new GraphQLObjectType({
        name: 'Message',
        fields: {
          id: { type: GraphQLString },
          content: { type: GraphQLString },
          roomId: { type: GraphQLString },
        },
      }),
      args: { roomId: { type: GraphQLString } },
      subscribe: (_root, { roomId }) => pubsub.asyncIterator(`${MESSAGE_ADDED}.${roomId}`),
    },
  },
});

// 发布消息
export function publishMessage(roomId: string, message: { id: string; content: string }) {
  pubsub.publish(`${MESSAGE_ADDED}.${roomId}`, { messageAdded: { ...message, roomId } });
}
```

### Pothos（GraphQL Code-First）类型安全 Schema

```typescript
import SchemaBuilder from '@pothos/core';

const builder = new SchemaBuilder<{
  Objects: { User: { id: string; name: string; email: string } };
  Context: { userLoader: DataLoader<string, { id: string; name: string; email: string }> };
}>();

builder.objectType('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    email: t.exposeString('email'),
  }),
});

builder.queryType({
  fields: (t) => ({
    user: t.field({
      type: 'User',
      args: { id: t.arg.id({ required: true }) },
      resolve: (_root, args, ctx) => ctx.userLoader.load(args.id),
    }),
  }),
});

export const schema = builder.toSchema();
```

### GraphQL Codegen 配置

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
  documents: ['./src/**/*.tsx'],
  generates: {
    './src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        scalars: { DateTime: 'string' },
      },
    },
  },
};

export default config;
```

### GraphQL Armor 安全配置

```typescript
// graphql-armor.ts — 生产环境安全中间件
import { ApolloServer } from '@apollo/server';
import { ApolloArmor } from '@escape.tech/graphql-armor';

const armor = new ApolloArmor({
  maxDepth: { n: 10 },           // 限制查询深度
  maxAliases: { n: 5 },          // 限制别名数量
  costLimit: { enabled: true, maxCost: 5000 }, // 查询成本限制
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  ...armor.protect(),
});
```

### GraphQL Yoga + 现代订阅（GraphQL over SSE）

```typescript
// yoga-server.ts — 基于 graphql-yoga 的现代 GraphQL 服务器
import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';

const yoga = createYoga({
  schema,
  // 内置 GraphQL over SSE、Multipart Subscriptions、Defer/Stream
  graphiql: {
    subscriptionsProtocol: 'GRAPHQL_SSE',
  },
});

const server = createServer(yoga);
server.listen(4000, () => console.log('Yoga at http://localhost:4000/graphql'));
```

### Relay 风格分页（Connection Spec）

```typescript
// relay-pagination.ts — 符合 GraphQL Cursor Connections Specification 的分页
interface Edge<T> {
  node: T;
  cursor: string;
}

interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}

function encodeCursor(id: string): string {
  return Buffer.from(id).toString('base64');
}

function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf-8');
}

async function paginateUsers(
  first: number,
  after?: string
): Promise<{ users: User[]; hasNextPage: boolean }> {
  const afterId = after ? decodeCursor(after) : undefined;
  const users = await db.users.findMany({
    take: first + 1, // 多取一条判断 hasNextPage
    cursor: afterId ? { id: afterId } : undefined,
    skip: afterId ? 1 : 0,
    orderBy: { id: 'asc' },
  });

  const hasNextPage = users.length > first;
  const nodes = hasNextPage ? users.slice(0, -1) : users;

  return { users: nodes, hasNextPage };
}
```

### Apollo Federation Gateway（子图聚合）

```typescript
// federation-gateway.ts — Apollo Federation v2 网关配置
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: 'http://localhost:4001/graphql' },
      { name: 'orders', url: 'http://localhost:4002/graphql' },
    ],
  }),
});

const server = new ApolloServer({ gateway });
startStandaloneServer(server, { listen: { port: 4000 } });
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| GraphQL Specification | 规范 | [spec.graphql.org](https://spec.graphql.org) |
| GraphQL — Learn | 文档 | [graphql.org/learn](https://graphql.org/learn) |
| Apollo Server Docs | 文档 | [apollographql.com/docs/apollo-server](https://www.apollographql.com/docs/apollo-server) |
| DataLoader | 文档 | [github.com/graphql/dataloader](https://github.com/graphql/dataloader) |
| GraphQL Code Generator | 文档 | [the-guild.dev/graphql/codegen](https://the-guild.dev/graphql/codegen) |
| Relay — Persisted Queries | 指南 | [relay.dev/docs/guides/persisted-queries](https://relay.dev/docs/guides/persisted-queries) |
| Pothos — GraphQL Schema Builder | 文档 | [pothos-graphql.dev](https://pothos-graphql.dev/) |
| GraphQL WS — Subscriptions | 文档 | [the-guild.dev/graphql/ws](https://the-guild.dev/graphql/ws) |
| Apollo Client — Caching | 文档 | [apollographql.com/docs/react/caching/overview](https://www.apollographql.com/docs/react/caching/overview) |
| GraphQL Query Complexity | 指南 | [howtographql.com/advanced/4-security](https://www.howtographql.com/advanced/4-security/) |
| GraphQL Armor | 安全中间件 | [escape.tech/graphql-armor](https://escape.tech/graphql-armor/) |
| GraphQL Yoga | 现代 GraphQL 服务器 | [the-guild.dev/graphql/yoga-server](https://the-guild.dev/graphql/yoga-server) |
| GraphQL Hive | Schema Registry | [the-guild.dev/graphql/hive](https://the-guild.dev/graphql/hive) |
| GraphQL Cursor Connections Spec | 规范 | [relay.dev/graphql/connections.htm](https://relay.dev/graphql/connections.htm) |
| Apollo Federation | 文档 | [apollographql.com/docs/federation](https://www.apollographql.com/docs/federation/) |
| gql.tada — TypeScript GraphQL | 文档 | [gql-tada.0no.co](https://gql-tada.0no.co/) |

---

*最后更新: 2026-04-30*
