# GraphQL 完全指南

> 基于 TypeScript + Apollo Server/Client 的完整实战指南

---

## 目录

- [GraphQL 完全指南](#graphql-完全指南)
  - [目录](#目录)
  - [1. GraphQL 基础](#1-graphql-基础)
    - [1.1 概念解释](#11-概念解释)
    - [1.2 SDL 定义](#12-sdl-定义)
    - [1.3 Resolver 实现](#13-resolver-实现)
    - [1.4 客户端查询](#14-客户端查询)
  - [2. Queries 和 Mutations 设计](#2-queries-和-mutations-设计)
    - [2.1 概念解释](#21-概念解释)
    - [2.2 SDL 定义](#22-sdl-定义)
    - [2.3 Resolver 实现](#23-resolver-实现)
    - [2.4 客户端查询](#24-客户端查询)
  - [3. Subscriptions 实时数据](#3-subscriptions-实时数据)
    - [3.1 概念解释](#31-概念解释)
    - [3.2 SDL 定义](#32-sdl-定义)
    - [3.3 Resolver 实现](#33-resolver-实现)
    - [3.4 客户端查询](#34-客户端查询)
  - [4. Schema Stitching 和 Federation](#4-schema-stitching-和-federation)
    - [4.1 概念解释](#41-概念解释)
    - [4.2 SDL 定义](#42-sdl-定义)
    - [4.3 Resolver 实现](#43-resolver-实现)
    - [4.4 客户端查询](#44-客户端查询)
  - [5. DataLoader 解决 N+1 问题](#5-dataloader-解决-n1-问题)
    - [5.1 概念解释](#51-概念解释)
    - [5.2 SDL 定义](#52-sdl-定义)
    - [5.3 Resolver 实现](#53-resolver-实现)
    - [5.4 客户端查询](#54-客户端查询)
  - [6. 缓存策略](#6-缓存策略)
    - [6.1 概念解释](#61-概念解释)
    - [6.2 SDL 定义](#62-sdl-定义)
    - [6.3 Resolver 实现](#63-resolver-实现)
    - [6.4 客户端缓存](#64-客户端缓存)
  - [7. 认证和授权](#7-认证和授权)
    - [7.1 概念解释](#71-概念解释)
    - [7.2 SDL 定义](#72-sdl-定义)
    - [7.3 Resolver 实现](#73-resolver-实现)
    - [7.4 客户端查询](#74-客户端查询)
  - [8. 文件上传](#8-文件上传)
    - [8.1 概念解释](#81-概念解释)
    - [8.2 SDL 定义](#82-sdl-定义)
    - [8.3 Resolver 实现](#83-resolver-实现)
    - [8.4 客户端查询](#84-客户端查询)
  - [9. 错误处理](#9-错误处理)
    - [9.1 概念解释](#91-概念解释)
    - [9.2 SDL 定义](#92-sdl-定义)
    - [9.3 Resolver 实现](#93-resolver-实现)
    - [9.4 客户端查询](#94-客户端查询)
  - [10. 性能优化](#10-性能优化)
    - [10.1 概念解释](#101-概念解释)
    - [10.2 SDL 定义](#102-sdl-定义)
    - [10.3 Resolver 实现](#103-resolver-实现)
    - [10.4 客户端优化](#104-客户端优化)
  - [附录](#附录)
    - [A. 完整项目结构](#a-完整项目结构)
    - [B. 推荐依赖](#b-推荐依赖)
    - [C. Codegen 配置](#c-codegen-配置)

---

## 1. GraphQL 基础

### 1.1 概念解释

GraphQL 是一种用于 API 的查询语言，它允许客户端精确请求所需的数据。核心概念包括：

- **Schema**: 定义 API 的类型系统和能力
- **Types**: 描述数据结构的类型（Scalar、Object、Enum、Input 等）
- **Resolvers**: 实现字段获取逻辑的函数

### 1.2 SDL 定义

```graphql
# schema.graphql

# Scalar 类型
scalar DateTime
scalar EmailAddress

# 枚举类型
enum UserRole {
  ADMIN
  USER
  GUEST
}

# 接口
interface Node {
  id: ID!
}

# 对象类型
type User implements Node {
  id: ID!
  email: EmailAddress!
  name: String!
  role: UserRole!
  posts: [Post!]!
  createdAt: DateTime!
}

type Post implements Node {
  id: ID!
  title: String!
  content: String!
  author: User!
  published: Boolean!
  tags: [String!]!
  viewCount: Int!
}

# 输入类型
input CreateUserInput {
  email: EmailAddress!
  name: String!
  password: String!
}

input UpdateUserInput {
  name: String
  role: UserRole
}

# 查询类型
type Query {
  # 单个查询
  user(id: ID!): User
  post(id: ID!): Post

  # 列表查询（带分页）
  users(
    first: Int = 20
    after: String
    filter: UserFilter
  ): UserConnection!

  posts(
    first: Int = 20
    after: String
    publishedOnly: Boolean = true
  ): PostConnection!

  # 当前用户
  me: User!
}

# 变更类型
type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!

  createPost(input: CreatePostInput!): CreatePostPayload!
  updatePost(id: ID!, input: UpdatePostInput!): UpdatePostPayload!
  publishPost(id: ID!): Post!
}

# 订阅类型
type Subscription {
  userCreated: User!
  postPublished: Post!
}

# 分页连接类型
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# 过滤类型
input UserFilter {
  role: UserRole
  search: String
  createdAfter: DateTime
}

input CreatePostInput {
  title: String!
  content: String!
  tags: [String!]
}

input UpdatePostInput {
  title: String
  content: String
  published: Boolean
  tags: [String!]
}

# 载荷类型
type CreateUserPayload {
  user: User!
}

type UpdateUserPayload {
  user: User!
}

type DeleteUserPayload {
  success: Boolean!
  deletedId: ID!
}

type CreatePostPayload {
  post: Post!
}

type UpdatePostPayload {
  post: Post!
}

# 错误类型
interface Error {
  message: String!
  code: String!
}

type ValidationError implements Error {
  message: String!
  code: String!
  field: String!
}
```

### 1.3 Resolver 实现

```typescript
// types/context.ts
export interface Context {
  userId?: string;
  userRole?: string;
  dataSources: DataSources;
  pubsub: PubSub;
}

interface DataSources {
  userAPI: UserDataSource;
  postAPI: PostDataSource;
}

// types/models.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'GUEST';
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  published: boolean;
  tags: string[];
  viewCount: number;
  createdAt: Date;
}
```

```typescript
// resolvers/scalars.ts
import { DateTimeResolver, EmailAddressResolver } from 'graphql-scalars';

export const scalars = {
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
};
```

```typescript
// resolvers/user.ts
import { GraphQLError } from 'graphql';
import type { Context } from '../types/context';

export const userResolvers = {
  Query: {
    async user(
      _: unknown,
      { id }: { id: string },
      { dataSources }: Context
    ) {
      const user = await dataSources.userAPI.findById(id);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return user;
    },

    async users(
      _: unknown,
      args: { first?: number; after?: string; filter?: any },
      { dataSources }: Context
    ) {
      return dataSources.userAPI.findMany({
        first: Math.min(args.first ?? 20, 100),
        after: args.after,
        filter: args.filter,
      });
    },

    async me(_: unknown, __: unknown, { userId, dataSources }: Context) {
      if (!userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      const user = await dataSources.userAPI.findById(userId);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return user;
    },
  },

  Mutation: {
    async createUser(
      _: unknown,
      { input }: { input: any },
      { dataSources, pubsub }: Context
    ) {
      const existing = await dataSources.userAPI.findByEmail(input.email);
      if (existing) {
        throw new GraphQLError('Email already exists', {
          extensions: { code: 'CONFLICT', field: 'email' },
        });
      }

      const user = await dataSources.userAPI.create({
        ...input,
        role: 'USER',
        createdAt: new Date(),
      });

      await pubsub.publish('USER_CREATED', { userCreated: user });
      return { user };
    },

    async updateUser(
      _: unknown,
      { id, input }: { id: string; input: any },
      { dataSources }: Context
    ) {
      const user = await dataSources.userAPI.update(id, input);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return { user };
    },

    async deleteUser(
      _: unknown,
      { id }: { id: string },
      { dataSources }: Context
    ) {
      const success = await dataSources.userAPI.delete(id);
      return { success, deletedId: id };
    },
  },

  User: {
    async posts(
      parent: { id: string },
      _: unknown,
      { dataSources }: Context
    ) {
      return dataSources.postAPI.findByAuthorId(parent.id);
    },
  },
};
```

```typescript
// resolvers/post.ts
import { GraphQLError } from 'graphql';
import type { Context } from '../types/context';

export const postResolvers = {
  Query: {
    async post(
      _: unknown,
      { id }: { id: string },
      { dataSources }: Context
    ) {
      const post = await dataSources.postAPI.findById(id);
      if (!post) {
        throw new GraphQLError('Post not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return post;
    },

    async posts(
      _: unknown,
      args: { first?: number; after?: string; publishedOnly?: boolean },
      { dataSources }: Context
    ) {
      return dataSources.postAPI.findMany({
        first: Math.min(args.first ?? 20, 100),
        after: args.after,
        publishedOnly: args.publishedOnly ?? true,
      });
    },
  },

  Mutation: {
    async createPost(
      _: unknown,
      { input }: { input: any },
      { userId, dataSources }: Context
    ) {
      if (!userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const post = await dataSources.postAPI.create({
        ...input,
        authorId: userId,
        published: false,
        viewCount: 0,
        createdAt: new Date(),
      });

      return { post };
    },

    async publishPost(
      _: unknown,
      { id }: { id: string },
      { dataSources, pubsub }: Context
    ) {
      const post = await dataSources.postAPI.update(id, { published: true });
      if (!post) {
        throw new GraphQLError('Post not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await pubsub.publish('POST_PUBLISHED', { postPublished: post });
      return post;
    },
  },

  Post: {
    async author(
      parent: { authorId: string },
      _: unknown,
      { dataSources }: Context
    ) {
      return dataSources.userAPI.findById(parent.authorId);
    },
  },
};
```

### 1.4 客户端查询

```typescript
// client/queries/user.ts
import { gql } from '@apollo/client';

// 查询单个用户
export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
      role
      createdAt
      posts {
        id
        title
        published
        viewCount
      }
    }
  }
`;

// 查询用户列表（带分页）
export const GET_USERS = gql`
  query GetUsers($first: Int, $after: String, $filter: UserFilter) {
    users(first: $first, after: $after, filter: $filter) {
      edges {
        node {
          id
          name
          email
          role
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

// 查询当前用户
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      role
      posts {
        id
        title
        published
      }
    }
  }
`;
```

```typescript
// client/mutations/user.ts
import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      user {
        id
        email
        name
        role
        createdAt
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      user {
        id
        name
        role
      }
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      deletedId
    }
  }
`;
```

```typescript
// client/components/UserList.tsx
import { useQuery } from '@apollo/client';
import { GET_USERS } from '../queries/user';

function UserList() {
  const { data, loading, error, fetchMore } = useQuery(GET_USERS, {
    variables: { first: 20 },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { edges, pageInfo, totalCount } = data.users;

  const loadMore = () => {
    if (pageInfo.hasNextPage) {
      fetchMore({
        variables: { after: pageInfo.endCursor },
      });
    }
  };

  return (
    <div>
      <p>Total: {totalCount} users</p>
      <ul>
        {edges.map(({ node }: any) => (
          <li key={node.id}>
            {node.name} ({node.email})
          </li>
        ))}
      </ul>
      {pageInfo.hasNextPage && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
}
```

---

## 2. Queries 和 Mutations 设计

### 2.1 概念解释

- **Query**: 用于读取数据，类似于 REST 的 GET 请求
- **Mutation**: 用于修改数据（创建、更新、删除），类似于 REST 的 POST/PUT/DELETE

设计原则：

1. **幂等性**: Query 应该是幂等的，多次执行结果相同
2. **原子性**: Mutation 应该是原子的
3. **乐观响应**: 客户端可以先显示预期结果，等待服务端确认
4. **输入/输出分离**: 使用 Input 类型作为参数，使用 Payload 类型作为返回

### 2.2 SDL 定义

```graphql
# schema.graphql

# ==================== Query 设计 ====================

type Query {
  # 单个资源查询 - 返回可为 null
  user(id: ID!): User

  # 使用 Node 接口查询任意资源
  node(id: ID!): Node
  nodes(ids: [ID!]!): [Node]!

  # 列表查询 - 必须返回 Connection
  users(
    first: Int = 20
    after: String
    where: UserWhereInput
    orderBy: UserOrderByInput
  ): UserConnection!

  # 搜索查询
  searchUsers(query: String!, first: Int = 10): UserConnection!

  # 聚合查询
  userStats: UserStats!
}

# ==================== Mutation 设计 ====================

type Mutation {
  # 创建 - 使用 CreateXXXInput 和 CreateXXXPayload
  createUser(input: CreateUserInput!): CreateUserPayload!

  # 批量创建
  createUsers(inputs: [CreateUserInput!]!): CreateUsersPayload!

  # 更新 - 使用 UpdateXXXInput（字段可选）
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!

  # 批量更新
  updateManyUsers(
    where: UserWhereInput!
    data: UpdateUserInput!
  ): BatchPayload!

  # 删除
  deleteUser(id: ID!): DeleteUserPayload!

  # 批量删除
  deleteManyUsers(where: UserWhereInput!): BatchPayload!

  # 复杂业务操作
  transferPostOwnership(
    postId: ID!
    newAuthorId: ID!
  ): TransferPostOwnershipPayload!
}

# ==================== 输入类型设计 ====================

input UserWhereInput {
  id: IDFilter
  email: StringFilter
  name: StringFilter
  role: UserRoleFilter
  createdAt: DateTimeFilter
  AND: [UserWhereInput!]
  OR: [UserWhereInput!]
  NOT: [UserWhereInput!]
}

input IDFilter {
  equals: ID
  in: [ID!]
  notIn: [ID!]
}

input StringFilter {
  equals: String
  in: [String!]
  notIn: [String!]
  contains: String
  startsWith: String
  endsWith: String
  mode: QueryMode
}

enum QueryMode {
  DEFAULT
  INSENSITIVE
}

input UserRoleFilter {
  equals: UserRole
  in: [UserRole!]
  notIn: [UserRole!]
}

input DateTimeFilter {
  equals: DateTime
  lt: DateTime
  lte: DateTime
  gt: DateTime
  gte: DateTime
}

input UserOrderByInput {
  id: SortOrder
  name: SortOrder
  createdAt: SortOrder
}

enum SortOrder {
  ASC
  DESC
}

# ==================== Payload 类型设计 ====================

# 创建结果
type CreateUserPayload {
  user: User!
}

type CreateUsersPayload {
  users: [User!]!
}

# 更新结果
type UpdateUserPayload {
  user: User!
}

# 删除结果
type DeleteUserPayload {
  success: Boolean!
  deletedId: ID!
}

# 批量操作结果
type BatchPayload {
  count: Int!
}

# 业务操作结果
type TransferPostOwnershipPayload {
  post: Post!
  previousAuthor: User!
  newAuthor: User!
}
```

### 2.3 Resolver 实现

```typescript
// resolvers/advanced-queries.ts
import type { Context } from '../types/context';
import { GraphQLError } from 'graphql';

export const advancedQueryResolvers = {
  Query: {
    // Node 接口查询（Relay 规范）
    async node(
      _: unknown,
      { id }: { id: string },
      { dataSources }: Context
    ) {
      // 解析全局 ID: type:id
      const [type, entityId] = decodeGlobalId(id);

      switch (type) {
        case 'User':
          return dataSources.userAPI.findById(entityId);
        case 'Post':
          return dataSources.postAPI.findById(entityId);
        default:
          return null;
      }
    },

    async nodes(
      _: unknown,
      { ids }: { ids: string[] },
      { dataSources }: Context
    ) {
      return Promise.all(
        ids.map(id => {
          const [type, entityId] = decodeGlobalId(id);
          switch (type) {
            case 'User':
              return dataSources.userAPI.findById(entityId);
            case 'Post':
              return dataSources.postAPI.findById(entityId);
            default:
              return null;
          }
        })
      );
    },

    // 复杂过滤查询
    async users(
      _: unknown,
      args: {
        first?: number;
        after?: string;
        where?: any;
        orderBy?: any;
      },
      { dataSources }: Context
    ) {
      return dataSources.userAPI.findWithFilter({
        first: Math.min(args.first ?? 20, 100),
        after: args.after,
        where: args.where,
        orderBy: args.orderBy,
      });
    },

    // 搜索查询
    async searchUsers(
      _: unknown,
      { query, first }: { query: string; first?: number },
      { dataSources }: Context
    ) {
      return dataSources.userAPI.search({
        query,
        first: Math.min(first ?? 10, 50),
      });
    },

    // 聚合查询
    async userStats(_: unknown, __: unknown, { dataSources }: Context) {
      return dataSources.userAPI.getStats();
    },
  },

  Mutation: {
    // 批量创建
    async createUsers(
      _: unknown,
      { inputs }: { inputs: any[] },
      { dataSources }: Context
    ) {
      // 验证所有输入
      const emails = inputs.map(i => i.email);
      const existing = await dataSources.userAPI.findByEmails(emails);
      if (existing.length > 0) {
        throw new GraphQLError(
          `Emails already exist: ${existing.map(u => u.email).join(', ')}`,
          { extensions: { code: 'CONFLICT' } }
        );
      }

      const users = await dataSources.userAPI.createMany(
        inputs.map(input => ({
          ...input,
          role: 'USER',
          createdAt: new Date(),
        }))
      );

      return { users };
    },

    // 批量更新
    async updateManyUsers(
      _: unknown,
      { where, data }: { where: any; data: any },
      { dataSources }: Context
    ) {
      const count = await dataSources.userAPI.updateMany(where, data);
      return { count };
    },

    // 批量删除
    async deleteManyUsers(
      _: unknown,
      { where }: { where: any },
      { dataSources }: Context
    ) {
      const count = await dataSources.userAPI.deleteMany(where);
      return { count };
    },

    // 复杂业务操作
    async transferPostOwnership(
      _: unknown,
      { postId, newAuthorId }: { postId: string; newAuthorId: string },
      { dataSources }: Context
    ) {
      const post = await dataSources.postAPI.findById(postId);
      if (!post) {
        throw new GraphQLError('Post not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const previousAuthor = await dataSources.userAPI.findById(post.authorId);
      const newAuthor = await dataSources.userAPI.findById(newAuthorId);

      if (!newAuthor) {
        throw new GraphQLError('New author not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const updatedPost = await dataSources.postAPI.update(postId, {
        authorId: newAuthorId,
      });

      return {
        post: updatedPost,
        previousAuthor,
        newAuthor,
      };
    },
  },
};

// 全局 ID 编码/解码
function encodeGlobalId(type: string, id: string): string {
  return Buffer.from(`${type}:${id}`).toString('base64');
}

function decodeGlobalId(globalId: string): [string, string] {
  const decoded = Buffer.from(globalId, 'base64').toString('utf-8');
  const [type, ...idParts] = decoded.split(':');
  return [type, idParts.join(':')];
}
```

### 2.4 客户端查询

```typescript
// client/queries/advanced.ts
import { gql } from '@apollo/client';

// Node 查询
export const GET_NODE = gql`
  query GetNode($id: ID!) {
    node(id: $id) {
      id
      ... on User {
        name
        email
      }
      ... on Post {
        title
        content
      }
    }
  }
`;

// 复杂过滤查询
export const GET_FILTERED_USERS = gql`
  query GetFilteredUsers(
    $first: Int
    $after: String
    $where: UserWhereInput
    $orderBy: UserOrderByInput
  ) {
    users(
      first: $first
      after: $after
      where: $where
      orderBy: $orderBy
    ) {
      edges {
        node {
          id
          name
          email
          role
          createdAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

// 搜索查询
export const SEARCH_USERS = gql`
  query SearchUsers($query: String!, $first: Int) {
    searchUsers(query: $query, first: $first) {
      edges {
        node {
          id
          name
          email
        }
        cursor
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;
```

```typescript
// client/mutations/advanced.ts
import { gql } from '@apollo/client';

// 批量创建
export const CREATE_USERS = gql`
  mutation CreateUsers($inputs: [CreateUserInput!]!) {
    createUsers(inputs: $inputs) {
      users {
        id
        name
        email
      }
    }
  }
`;

// 批量更新
export const UPDATE_MANY_USERS = gql`
  mutation UpdateManyUsers($where: UserWhereInput!, $data: UpdateUserInput!) {
    updateManyUsers(where: $where, data: $data) {
      count
    }
  }
`;

// 批量删除
export const DELETE_MANY_USERS = gql`
  mutation DeleteManyUsers($where: UserWhereInput!) {
    deleteManyUsers(where: $where) {
      count
    }
  }
`;

// 复杂业务操作
export const TRANSFER_POST_OWNERSHIP = gql`
  mutation TransferPostOwnership($postId: ID!, $newAuthorId: ID!) {
    transferPostOwnership(postId: $postId, newAuthorId: $newAuthorId) {
      post {
        id
        title
        author {
          id
          name
        }
      }
      previousAuthor {
        id
        name
      }
      newAuthor {
        id
        name
      }
    }
  }
`;
```

```typescript
// client/components/AdvancedUserSearch.tsx
import { useLazyQuery } from '@apollo/client';
import { GET_FILTERED_USERS } from '../queries/advanced';

function AdvancedUserSearch() {
  const [getUsers, { data, loading }] = useLazyQuery(GET_FILTERED_USERS);

  const handleSearch = (searchText: string, role: string) => {
    getUsers({
      variables: {
        first: 20,
        where: {
          OR: [
            { name: { contains: searchText, mode: 'INSENSITIVE' } },
            { email: { contains: searchText, mode: 'INSENSITIVE' } },
          ],
          role: role !== 'ALL' ? { equals: role } : undefined,
        },
        orderBy: { createdAt: 'DESC' },
      },
    });
  };

  return (
    <div>
      {/* 搜索表单 */}
      {loading && <div>Loading...</div>}
      {data && (
        <ul>
          {data.users.edges.map(({ node }: any) => (
            <li key={node.id}>{node.name} - {node.email}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 3. Subscriptions 实时数据

### 3.1 概念解释

Subscriptions 用于实现实时数据推送，基于 WebSocket 协议。常见使用场景：

- 实时通知
- 聊天消息
- 实时数据更新
- 进度跟踪

### 3.2 SDL 定义

```graphql
# schema.graphql

type Subscription {
  # 用户相关订阅
  userCreated: User!
  userUpdated(id: ID!): User!
  userDeleted: UserDeletedEvent!

  # 文章相关订阅
  postCreated(authorId: ID): Post!
  postPublished: Post!
  postUpdated(id: ID!): Post!

  # 实时通知
  notificationReceived: Notification!
  notificationRead: Notification!

  # 打字指示器
  typingIndicator(chatId: ID!): TypingEvent!

  # 计数器更新
  viewCountUpdated(postId: ID!): ViewCountUpdate!

  # 进度跟踪
  jobProgress(jobId: ID!): JobProgress!

  # 心跳
  heartbeat: DateTime!
}

# 事件类型
type UserDeletedEvent {
  deletedId: ID!
  deletedAt: DateTime!
}

type ViewCountUpdate {
  postId: ID!
  viewCount: Int!
}

type JobProgress {
  jobId: ID!
  status: JobStatus!
  progress: Float!  # 0-100
  message: String
  result: JSON
  error: String
}

enum JobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

type TypingEvent {
  userId: ID!
  chatId: ID!
  isTyping: Boolean!
  timestamp: DateTime!
}

type Notification {
  id: ID!
  type: NotificationType!
  title: String!
  message: String!
  data: JSON
  createdAt: DateTime!
  read: Boolean!
}

enum NotificationType {
  INFO
  WARNING
  ERROR
  SUCCESS
}

scalar JSON
```

### 3.3 Resolver 实现

```typescript
// resolvers/subscriptions.ts
import { withFilter } from 'graphql-subscriptions';
import type { Context } from '../types/context';
import { GraphQLError } from 'graphql';

// 定义事件常量
const EVENTS = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  POST_CREATED: 'POST_CREATED',
  POST_PUBLISHED: 'POST_PUBLISHED',
  POST_UPDATED: 'POST_UPDATED',
  NOTIFICATION_RECEIVED: 'NOTIFICATION_RECEIVED',
  NOTIFICATION_READ: 'NOTIFICATION_READ',
  TYPING_INDICATOR: 'TYPING_INDICATOR',
  VIEW_COUNT_UPDATED: 'VIEW_COUNT_UPDATED',
  JOB_PROGRESS: 'JOB_PROGRESS',
} as const;

export const subscriptionResolvers = {
  Subscription: {
    // 简单订阅 - 所有用户都会收到
    userCreated: {
      subscribe: (_: unknown, __: unknown, { pubsub }: Context) => {
        return pubsub.asyncIterator([EVENTS.USER_CREATED]);
      },
    },

    // 带过滤的订阅 - 只有特定用户会收到
    userUpdated: {
      subscribe: withFilter(
        (_: unknown, __: unknown, { pubsub }: Context) => {
          return pubsub.asyncIterator([EVENTS.USER_UPDATED]);
        },
        (payload, variables) => {
          return payload.userUpdated.id === variables.id;
        }
      ),
    },

    userDeleted: {
      subscribe: (_: unknown, __: unknown, { pubsub }: Context) => {
        return pubsub.asyncIterator([EVENTS.USER_DELETED]);
      },
    },

    // 带可选参数的订阅
    postCreated: {
      subscribe: withFilter(
        (_: unknown, __: unknown, { pubsub }: Context) => {
          return pubsub.asyncIterator([EVENTS.POST_CREATED]);
        },
        (payload, variables) => {
          // 如果没有指定 authorId，接收所有创建事件
          if (!variables.authorId) return true;
          return payload.postCreated.authorId === variables.authorId;
        }
      ),
    },

    postPublished: {
      subscribe: (_: unknown, __: unknown, { pubsub }: Context) => {
        return pubsub.asyncIterator([EVENTS.POST_PUBLISHED]);
      },
    },

    postUpdated: {
      subscribe: withFilter(
        (_: unknown, __: unknown, { pubsub }: Context) => {
          return pubsub.asyncIterator([EVENTS.POST_UPDATED]);
        },
        (payload, variables) => {
          return payload.postUpdated.id === variables.id;
        }
      ),
    },

    // 通知订阅 - 只发送给当前用户
    notificationReceived: {
      subscribe: withFilter(
        (_: unknown, __: unknown, { pubsub }: Context) => {
          return pubsub.asyncIterator([EVENTS.NOTIFICATION_RECEIVED]);
        },
        (payload, _variables, context) => {
          return payload.notificationReceived.userId === context.userId;
        }
      ),
    },

    notificationRead: {
      subscribe: withFilter(
        (_: unknown, __: unknown, { pubsub }: Context) => {
          return pubsub.asyncIterator([EVENTS.NOTIFICATION_READ]);
        },
        (payload, _variables, context) => {
          return payload.notificationRead.userId === context.userId;
        }
      ),
    },

    // 打字指示器 - 发送给聊天室的其他成员
    typingIndicator: {
      subscribe: withFilter(
        (_: unknown, __: unknown, { pubsub }: Context) => {
          return pubsub.asyncIterator([EVENTS.TYPING_INDICATOR]);
        },
        (payload, variables, context) => {
          // 同一个聊天室，但不是发送者自己
          return (
            payload.typingIndicator.chatId === variables.chatId &&
            payload.typingIndicator.userId !== context.userId
          );
        }
      ),
    },

    // 观看计数更新
    viewCountUpdated: {
      subscribe: withFilter(
        (_: unknown, __: unknown, { pubsub }: Context) => {
          return pubsub.asyncIterator([EVENTS.VIEW_COUNT_UPDATED]);
        },
        (payload, variables) => {
          return payload.viewCountUpdated.postId === variables.postId;
        }
      ),
    },

    // 任务进度订阅
    jobProgress: {
      subscribe: withFilter(
        (_: unknown, __: unknown, { pubsub }: Context) => {
          return pubsub.asyncIterator([EVENTS.JOB_PROGRESS]);
        },
        (payload, variables) => {
          return payload.jobProgress.jobId === variables.jobId;
        }
      ),
    },

    // 心跳
    heartbeat: {
      subscribe: async function* () {
        while (true) {
          yield { heartbeat: new Date() };
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      },
    },
  },
};
```

```typescript
// server.ts - Apollo Server 配置
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { PubSub } from 'graphql-subscriptions';

const app = express();
const httpServer = http.createServer(app);

// 创建 PubSub 实例
const pubsub = new PubSub();

// 创建 schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// 创建 WebSocket 服务器
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// 使用 graphql-ws
const serverCleanup = useServer(
  {
    schema,
    context: async (ctx) => {
      // 从连接参数中获取认证信息
      const token = ctx.connectionParams?.token as string;
      const user = token ? await authenticate(token) : null;

      return {
        userId: user?.id,
        userRole: user?.role,
        pubsub,
        dataSources,
      };
    },
  },
  wsServer
);

// 创建 Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();

// HTTP 中间件
app.use(
  '/graphql',
  cors(),
  json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const user = token ? await authenticate(token) : null;

      return {
        userId: user?.id,
        userRole: user?.role,
        pubsub,
        dataSources,
      };
    },
  })
);

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}/graphql`);
  console.log(`Subscriptions ready at ws://localhost:${PORT}/graphql`);
});
```

```typescript
// mutations with subscriptions
export const postMutations = {
  Mutation: {
    async createPost(
      _: unknown,
      { input }: { input: any },
      { userId, dataSources, pubsub }: Context
    ) {
      if (!userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const post = await dataSources.postAPI.create({
        ...input,
        authorId: userId,
        published: false,
        createdAt: new Date(),
      });

      // 发布订阅事件
      await pubsub.publish(EVENTS.POST_CREATED, {
        postCreated: post,
      });

      return { post };
    },

    async updatePost(
      _: unknown,
      { id, input }: { id: string; input: any },
      { dataSources, pubsub }: Context
    ) {
      const post = await dataSources.postAPI.update(id, input);
      if (!post) {
        throw new GraphQLError('Post not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // 发布更新事件
      await pubsub.publish(EVENTS.POST_UPDATED, {
        postUpdated: post,
      });

      return { post };
    },

    async publishPost(
      _: unknown,
      { id }: { id: string },
      { dataSources, pubsub }: Context
    ) {
      const post = await dataSources.postAPI.update(id, { published: true });
      if (!post) {
        throw new GraphQLError('Post not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await pubsub.publish(EVENTS.POST_PUBLISHED, {
        postPublished: post,
      });

      return post;
    },

    // 设置打字指示器
    async setTypingIndicator(
      _: unknown,
      { chatId, isTyping }: { chatId: string; isTyping: boolean },
      { userId, pubsub }: Context
    ) {
      if (!userId) {
        throw new GraphQLError('Unauthorized');
      }

      await pubsub.publish(EVENTS.TYPING_INDICATOR, {
        typingIndicator: {
          userId,
          chatId,
          isTyping,
          timestamp: new Date(),
        },
      });

      return true;
    },
  },
};
```

### 3.4 客户端查询

```typescript
// client/subscriptions/posts.ts
import { gql } from '@apollo/client';

// 订阅新文章
export const ON_POST_CREATED = gql`
  subscription OnPostCreated($authorId: ID) {
    postCreated(authorId: $authorId) {
      id
      title
      content
      author {
        id
        name
      }
      createdAt
    }
  }
`;

// 订阅文章发布
export const ON_POST_PUBLISHED = gql`
  subscription OnPostPublished {
    postPublished {
      id
      title
      published
      publishedAt
    }
  }
`;

// 订阅文章更新
export const ON_POST_UPDATED = gql`
  subscription OnPostUpdated($id: ID!) {
    postUpdated(id: $id) {
      id
      title
      content
      published
      updatedAt
    }
  }
`;

// 订阅通知
export const ON_NOTIFICATION_RECEIVED = gql`
  subscription OnNotificationReceived {
    notificationReceived {
      id
      type
      title
      message
      data
      createdAt
      read
    }
  }
`;

// 订阅打字指示器
export const ON_TYPING_INDICATOR = gql`
  subscription OnTypingIndicator($chatId: ID!) {
    typingIndicator(chatId: $chatId) {
      userId
      isTyping
      timestamp
    }
  }
`;

// 订阅观看计数
export const ON_VIEW_COUNT_UPDATED = gql`
  subscription OnViewCountUpdated($postId: ID!) {
    viewCountUpdated(postId: $postId) {
      postId
      viewCount
    }
  }
`;

// 订阅任务进度
export const ON_JOB_PROGRESS = gql`
  subscription OnJobProgress($jobId: ID!) {
    jobProgress(jobId: $jobId) {
      jobId
      status
      progress
      message
      result
      error
    }
  }
`;
```

```typescript
// client/components/RealTimePostList.tsx
import { useSubscription, useQuery } from '@apollo/client';
import { GET_POSTS } from '../queries/posts';
import { ON_POST_CREATED, ON_POST_PUBLISHED } from '../subscriptions/posts';

function RealTimePostList() {
  const { data, loading, subscribeToMore } = useQuery(GET_POSTS);

  // 订阅新文章
  useSubscription(ON_POST_CREATED, {
    onData: ({ client, data }) => {
      const newPost = data.data.postCreated;

      // 更新缓存
      client.cache.modify({
        fields: {
          posts(existingPosts = {}) {
            const newPostRef = client.cache.writeFragment({
              data: newPost,
              fragment: gql`
                fragment NewPost on Post {
                  id
                  title
                  content
                }
              `,
            });
            return {
              ...existingPosts,
              edges: [
                { node: newPostRef, __typename: 'PostEdge' },
                ...existingPosts.edges,
              ],
            };
          },
        },
      });
    },
  });

  // 订阅文章发布
  useSubscription(ON_POST_PUBLISHED, {
    onData: ({ client, data }) => {
      const publishedPost = data.data.postPublished;

      // 更新缓存中的文章状态
      client.cache.modify({
        id: client.cache.identify(publishedPost),
        fields: {
          published() {
            return true;
          },
        },
      });
    },
  });

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {data.posts.edges.map(({ node }: any) => (
        <li key={node.id}>
          {node.title} {node.published ? '(Published)' : '(Draft)'}
        </li>
      ))}
    </ul>
  );
}
```

```typescript
// client/components/TypingIndicator.tsx
import { useSubscription, useMutation } from '@apollo/client';
import { ON_TYPING_INDICATOR } from '../subscriptions/posts';
import { SET_TYPING_INDICATOR } from '../mutations/posts';
import { useEffect, useState } from 'react';

function TypingIndicator({ chatId }: { chatId: string }) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const { data } = useSubscription(ON_TYPING_INDICATOR, {
    variables: { chatId },
  });

  useEffect(() => {
    if (data) {
      const { userId, isTyping } = data.typingIndicator;
      setTypingUsers(prev =>
        isTyping
          ? [...new Set([...prev, userId])]
          : prev.filter(id => id !== userId)
      );
    }
  }, [data]);

  // 清除不再打字的状态
  useEffect(() => {
    if (typingUsers.length === 0) return;

    const timeout = setTimeout(() => {
      setTypingUsers([]);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [typingUsers]);

  if (typingUsers.length === 0) return null;

  return (
    <div className="typing-indicator">
      {typingUsers.length === 1
        ? 'Someone is typing...'
        : `${typingUsers.length} people are typing...`}
    </div>
  );
}

// 输入框组件
function ChatInput({ chatId }: { chatId: string }) {
  const [setTyping] = useMutation(SET_TYPING_INDICATOR);
  const [isTyping, setIsTyping] = useState(false);

  const handleInput = () => {
    if (!isTyping) {
      setIsTyping(true);
      setTyping({ variables: { chatId, isTyping: true } });

      // 3秒后自动停止
      setTimeout(() => {
        setTyping({ variables: { chatId, isTyping: false } });
        setIsTyping(false);
      }, 3000);
    }
  };

  return <input onInput={handleInput} placeholder="Type a message..." />;
}
```

```typescript
// client/apollo-client.ts
import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// HTTP 链接
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  headers: {
    authorization: localStorage.getItem('token')
      ? `Bearer ${localStorage.getItem('token')}`
      : '',
  },
});

// WebSocket 链接
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
    connectionParams: () => ({
      token: localStorage.getItem('token'),
    }),
    reconnect: true,
    retryAttempts: 5,
  })
);

// 分割链接：订阅使用 WebSocket，其他使用 HTTP
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

---

## 4. Schema Stitching 和 Federation

### 4.1 概念解释

- **Schema Stitching**: 将多个独立的 GraphQL Schema 合并成一个统一的 Schema
- **Federation (Apollo Federation)**: 分布式 GraphQL 架构，允许多个服务共同组成一个完整的 GraphQL API

主要区别：

| 特性 | Schema Stitching | Federation |
|------|------------------|------------|
| 服务类型 | 任何 GraphQL 服务 | 必须是联邦兼容服务 |
| 类型扩展 | 有限支持 | 原生支持实体引用 |
| 网关 | 手动配置 | 自动路由 |
| 适用场景 | 简单合并 | 微服务架构 |

### 4.2 SDL 定义

```graphql
# ==================== 用户服务 (User Service) ====================
# schema.graphql

type User @key(fields: "id") {
  id: ID!
  email: String!
  name: String!
  posts: [Post!]! @external
}

extend type Post @key(fields: "id") {
  id: ID! @external
  author: User! @provides(fields: "id")
}

type Query {
  user(id: ID!): User
  users: [User!]!
  me: User
}

# ==================== 文章服务 (Post Service) ====================
# schema.graphql

type Post @key(fields: "id") {
  id: ID!
  title: String!
  content: String!
  authorId: ID!
  author: User! @provides(fields: "id")
  published: Boolean!
}

type User @key(fields: "id") @extends {
  id: ID! @external
  posts: [Post!]!
}

type Query {
  post(id: ID!): Post
  posts: [Post!]!
  postsByAuthor(authorId: ID!): [Post!]!
}

# ==================== 评论服务 (Comment Service) ====================
# schema.graphql

type Comment @key(fields: "id") {
  id: ID!
  content: String!
  postId: ID!
  post: Post! @provides(fields: "id")
  authorId: ID!
  author: User! @provides(fields: "id")
}

type Post @key(fields: "id") @extends {
  id: ID! @external
  comments: [Comment!]!
}

type User @key(fields: "id") @extends {
  id: ID! @external
  comments: [Comment!]!
}

type Query {
  comment(id: ID!): Comment
  commentsByPost(postId: ID!): [Comment!]!
}

# ==================== 网关 Schema ====================
# 由 Apollo Gateway 自动生成

type Query {
  user(id: ID!): User
  users: [User!]!
  me: User
  post(id: ID!): Post
  posts: [Post!]!
  postsByAuthor(authorId: ID!): [Post!]!
  comment(id: ID!): Comment
  commentsByPost(postId: ID!): [Comment!]!
}

type User {
  id: ID!
  email: String!
  name: String!
  posts: [Post!]!
  comments: [Comment!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  authorId: ID!
  author: User!
  published: Boolean!
  comments: [Comment!]!
}

type Comment {
  id: ID!
  content: String!
  postId: ID!
  post: Post!
  authorId: ID!
  author: User!
}
```

### 4.3 Resolver 实现

```typescript
// ==================== 用户服务 (services/user/src/resolvers.ts) ====================
import { GraphQLError } from 'graphql';

const users = [
  { id: '1', email: 'alice@example.com', name: 'Alice' },
  { id: '2', email: 'bob@example.com', name: 'Bob' },
];

export const userResolvers = {
  Query: {
    user(_: unknown, { id }: { id: string }) {
      return users.find(u => u.id === id);
    },
    users() {
      return users;
    },
    me(_: unknown, __: unknown, context: any) {
      const userId = context.userId;
      return users.find(u => u.id === userId);
    },
  },

  User: {
    // 解析引用（用于 Federation）
    __resolveReference(user: { id: string }) {
      return users.find(u => u.id === user.id);
    },

    // posts 字段由 Post 服务提供
    posts() {
      // 返回空，实际数据由其他服务解析
      return [];
    },
  },

  Post: {
    // 解析 Post.author 字段
    async author(post: { authorId: string }, _: unknown, context: any) {
      // 返回引用，让网关路由到 User 服务
      return { __typename: 'User', id: post.authorId };
    },
  },
};
```

```typescript
// ==================== 文章服务 (services/post/src/resolvers.ts) ====================
const posts = [
  {
    id: '1',
    title: 'Hello GraphQL',
    content: 'GraphQL is great!',
    authorId: '1',
    published: true
  },
  {
    id: '2',
    title: 'Apollo Federation',
    content: 'Federation allows distributed GraphQL.',
    authorId: '1',
    published: true
  },
  {
    id: '3',
    title: 'Draft Post',
    content: 'This is a draft.',
    authorId: '2',
    published: false
  },
];

export const postResolvers = {
  Query: {
    post(_: unknown, { id }: { id: string }) {
      return posts.find(p => p.id === id);
    },
    posts() {
      return posts;
    },
    postsByAuthor(_: unknown, { authorId }: { authorId: string }) {
      return posts.filter(p => p.authorId === authorId);
    },
  },

  Post: {
    __resolveReference(post: { id: string }) {
      return posts.find(p => p.id === post.id);
    },

    author(post: { authorId: string }) {
      // 返回实体引用
      return { __typename: 'User', id: post.authorId };
    },
  },

  User: {
    // 解析 User.posts 字段
    async posts(user: { id: string }) {
      return posts.filter(p => p.authorId === user.id);
    },
  },
};
```

```typescript
// ==================== 评论服务 (services/comment/src/resolvers.ts) ====================
const comments = [
  { id: '1', content: 'Great post!', postId: '1', authorId: '2' },
  { id: '2', content: 'Thanks for sharing.', postId: '1', authorId: '1' },
  { id: '3', content: 'Looking forward to more.', postId: '2', authorId: '2' },
];

export const commentResolvers = {
  Query: {
    comment(_: unknown, { id }: { id: string }) {
      return comments.find(c => c.id === id);
    },
    commentsByPost(_: unknown, { postId }: { postId: string }) {
      return comments.filter(c => c.postId === postId);
    },
  },

  Comment: {
    __resolveReference(comment: { id: string }) {
      return comments.find(c => c.id === comment.id);
    },

    post(comment: { postId: string }) {
      return { __typename: 'Post', id: comment.postId };
    },

    author(comment: { authorId: string }) {
      return { __typename: 'User', id: comment.authorId };
    },
  },

  Post: {
    async comments(post: { id: string }) {
      return comments.filter(c => c.postId === post.id);
    },
  },

  User: {
    async comments(user: { id: string }) {
      return comments.filter(c => c.authorId === user.id);
    },
  },
};
```

```typescript
// ==================== Apollo Gateway (gateway/src/index.ts) ====================
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: 'http://localhost:4001/graphql' },
      { name: 'posts', url: 'http://localhost:4002/graphql' },
      { name: 'comments', url: 'http://localhost:4003/graphql' },
    ],
    // 轮询间隔（开发环境）
    pollIntervalInMs: 10000,
  }),
});

const server = new ApolloServer({
  gateway,
  // 关闭默认的 Apollo Studio 遥测
  apollo: {
    key: undefined,
  },
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    // 从请求头中提取用户信息，传递给子服务
    const userId = req.headers['x-user-id'];
    return { userId };
  },
});

console.log(`Gateway ready at ${url}`);
```

```typescript
// ==================== 使用 @apollo/subgraph 构建子服务 ====================
// services/user/src/index.ts
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag';
import { userResolvers } from './resolvers';

const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    email: String!
    name: String!
    posts: [Post!]! @external
  }

  extend type Post @key(fields: "id") {
    id: ID! @external
    author: User! @provides(fields: "id")
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
    me: User
  }
`;

const server = new ApolloServer({
  schema: buildSubgraphSchema({
    typeDefs,
    resolvers: userResolvers,
  }),
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4001 },
});

console.log(`User service ready at ${url}`);
```

### 4.4 客户端查询

```typescript
// client/queries/federation.ts
import { gql } from '@apollo/client';

// 跨服务查询 - 一次请求获取所有数据
export const GET_USER_WITH_POSTS_AND_COMMENTS = gql`
  query GetUserWithPostsAndComments($id: ID!) {
    user(id: $id) {
      id
      name
      email
      posts {
        id
        title
        content
        published
        comments {
          id
          content
          author {
            id
            name
          }
        }
      }
      comments {
        id
        content
        post {
          id
          title
        }
      }
    }
  }
`;

// 查询分布式数据
export const GET_FEED = gql`
  query GetFeed {
    posts {
      id
      title
      content
      author {
        id
        name
        email
      }
      comments {
        id
        content
        author {
          id
          name
        }
      }
    }
  }
`;
```

```typescript
// client/components/FederatedData.tsx
import { useQuery } from '@apollo/client';
import { GET_USER_WITH_POSTS_AND_COMMENTS } from '../queries/federation';

function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useQuery(
    GET_USER_WITH_POSTS_AND_COMMENTS,
    { variables: { id: userId } }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const user = data.user;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>

      <h2>Posts</h2>
      {user.posts.map((post: any) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <div>
            Comments: {post.comments.length}
            {post.comments.map((comment: any) => (
              <p key={comment.id}>
                {comment.author.name}: {comment.content}
              </p>
            ))}
          </div>
        </div>
      ))}

      <h2>Comments</h2>
      {user.comments.map((comment: any) => (
        <p key={comment.id}>
          On "{comment.post.title}": {comment.content}
        </p>
      ))}
    </div>
  );
}
```

---

## 5. DataLoader 解决 N+1 问题

### 5.1 概念解释

**N+1 问题**: 当查询嵌套关系时，Resolver 会为每个父对象单独查询子对象，导致数据库查询数量暴增。

例如：查询 100 个用户及其文章：

- 1 次查询获取 100 个用户
- 100 次查询获取每个用户的文章
- 总共 101 次查询

**DataLoader** 解决方案：

- 批量加载：将多次单个查询合并为一次批量查询
- 缓存：在同一请求中缓存已加载的数据
- 去重：自动合并重复的 ID 请求

### 5.2 SDL 定义

```graphql
# schema.graphql

type Query {
  users: [User!]!
  posts: [Post!]!
}

type User {
  id: ID!
  name: String!
  posts: [Post!]!  # 可能触发 N+1
  recentComments: [Comment!]!  # 可能触发 N+1
  stats: UserStats!  # 可能触发 N+1
}

type Post {
  id: ID!
  title: String!
  author: User!  # 可能触发 N+1
  comments: [Comment!]!  # 可能触发 N+1
  tags: [Tag!]!  # 可能触发 N+1
}

type Comment {
  id: ID!
  content: String!
  author: User!  # 可能触发 N+1
  post: Post!  # 可能触发 N+1
}

type Tag {
  id: ID!
  name: String!
}

type UserStats {
  postCount: Int!
  commentCount: Int!
  totalViews: Int!
}
```

### 5.3 Resolver 实现

```typescript
// dataloaders/userLoader.ts
import DataLoader from 'dataloader';
import { User } from '../types/models';

export function createUserLoader(userRepository: UserRepository) {
  return new DataLoader<string, User | null>(async (ids) => {
    // 批量查询用户
    const users = await userRepository.findByIds(ids as string[]);

    // 按照传入的 ID 顺序返回
    const userMap = new Map(users.map(u => [u.id, u]));
    return ids.map(id => userMap.get(id) || null);
  });
}

// dataloaders/postLoader.ts
import DataLoader from 'dataloader';
import { Post } from '../types/models';

export function createPostLoader(postRepository: PostRepository) {
  return {
    // 按 ID 批量加载
    byId: new DataLoader<string, Post | null>(async (ids) => {
      const posts = await postRepository.findByIds(ids as string[]);
      const postMap = new Map(posts.map(p => [p.id, p]));
      return ids.map(id => postMap.get(id) || null);
    }),

    // 按作者 ID 批量加载（一对多）
    byAuthorId: new DataLoader<string, Post[]>(async (authorIds) => {
      const posts = await postRepository.findByAuthorIds(authorIds as string[]);

      // 按 authorId 分组
      const postsByAuthor = new Map<string, Post[]>();
      for (const post of posts) {
        if (!postsByAuthor.has(post.authorId)) {
          postsByAuthor.set(post.authorId, []);
        }
        postsByAuthor.get(post.authorId)!.push(post);
      }

      return authorIds.map(id => postsByAuthor.get(id as string) || []);
    }),

    // 批量获取统计信息
    statsByAuthorId: new DataLoader<string, { postCount: number; totalViews: number }>(
      async (authorIds) => {
        const stats = await postRepository.getStatsByAuthorIds(authorIds as string[]);
        const statsMap = new Map(stats.map(s => [s.authorId, s]));

        return authorIds.map(id => ({
          postCount: statsMap.get(id as string)?.postCount || 0,
          totalViews: statsMap.get(id as string)?.totalViews || 0,
        }));
      }
    ),
  };
}

// dataloaders/commentLoader.ts
import DataLoader from 'dataloader';
import { Comment } from '../types/models';

export function createCommentLoader(commentRepository: CommentRepository) {
  return {
    // 按 ID 加载
    byId: new DataLoader<string, Comment | null>(async (ids) => {
      const comments = await commentRepository.findByIds(ids as string[]);
      const commentMap = new Map(comments.map(c => [c.id, c]));
      return ids.map(id => commentMap.get(id) || null);
    }),

    // 按文章 ID 加载评论
    byPostId: new DataLoader<string, Comment[]>(async (postIds) => {
      const comments = await commentRepository.findByPostIds(postIds as string[]);

      const commentsByPost = new Map<string, Comment[]>();
      for (const comment of comments) {
        if (!commentsByPost.has(comment.postId)) {
          commentsByPost.set(comment.postId, []);
        }
        commentsByPost.get(comment.postId)!.push(comment);
      }

      return postIds.map(id => commentsByPost.get(id as string) || []);
    }),

    // 按用户 ID 加载最近评论
    recentByUserId: new DataLoader<string, Comment[]>(async (userIds) => {
      const comments = await commentRepository.findRecentByUserIds(
        userIds as string[],
        5 // 最近 5 条
      );

      const commentsByUser = new Map<string, Comment[]>();
      for (const comment of comments) {
        if (!commentsByUser.has(comment.authorId)) {
          commentsByUser.set(comment.authorId, []);
        }
        commentsByUser.get(comment.authorId)!.push(comment);
      }

      return userIds.map(id => commentsByUser.get(id as string) || []);
    }),

    // 批量获取评论数量
    countByUserId: new DataLoader<string, number>(async (userIds) => {
      const counts = await commentRepository.countByUserIds(userIds as string[]);
      const countMap = new Map(counts.map(c => [c.userId, c.count]));
      return userIds.map(id => countMap.get(id as string) || 0);
    }),
  };
}

// dataloaders/tagLoader.ts
import DataLoader from 'dataloader';
import { Tag } from '../types/models';

export function createTagLoader(tagRepository: TagRepository) {
  return {
    // 按文章 ID 加载标签
    byPostId: new DataLoader<string, Tag[]>(async (postIds) => {
      const tags = await tagRepository.findByPostIds(postIds as string[]);

      const tagsByPost = new Map<string, Tag[]>();
      for (const tag of tags) {
        if (!tagsByPost.has(tag.postId)) {
          tagsByPost.set(tag.postId, []);
        }
        tagsByPost.get(tag.postId)!.push(tag);
      }

      return postIds.map(id => tagsByPost.get(id as string) || []);
    }),
  };
}
```

```typescript
// context.ts
import { createUserLoader } from './dataloaders/userLoader';
import { createPostLoader } from './dataloaders/postLoader';
import { createCommentLoader } from './dataloaders/commentLoader';
import { createTagLoader } from './dataloaders/tagLoader';
import { repositories } from './repositories';

export interface Context {
  userId?: string;
  loaders: {
    user: ReturnType<typeof createUserLoader>;
    post: ReturnType<typeof createPostLoader>;
    comment: ReturnType<typeof createCommentLoader>;
    tag: ReturnType<typeof createTagLoader>;
  };
}

export function createContext({ req }: { req: any }): Context {
  const userId = req.headers['x-user-id'];

  return {
    userId,
    loaders: {
      user: createUserLoader(repositories.user),
      post: createPostLoader(repositories.post),
      comment: createCommentLoader(repositories.comment),
      tag: createTagLoader(repositories.tag),
    },
  };
}
```

```typescript
// resolvers/index.ts
import type { Context } from '../context';

export const resolvers = {
  Query: {
    async users(_: unknown, __: unknown, { loaders }: Context) {
      // 这里假设从某个地方获取用户列表
      const userIds = await getAllUserIds();
      return loaders.user.loadMany(userIds);
    },

    async posts(_: unknown, __: unknown, { loaders }: Context) {
      const postIds = await getAllPostIds();
      return loaders.post.byId.loadMany(postIds);
    },
  },

  User: {
    // 使用 DataLoader 解决 N+1
    async posts(parent: { id: string }, _: unknown, { loaders }: Context) {
      return loaders.post.byAuthorId.load(parent.id);
    },

    async recentComments(parent: { id: string }, _: unknown, { loaders }: Context) {
      return loaders.comment.recentByUserId.load(parent.id);
    },

    async stats(parent: { id: string }, _: unknown, { loaders }: Context) {
      const [postStats, commentCount] = await Promise.all([
        loaders.post.statsByAuthorId.load(parent.id),
        loaders.comment.countByUserId.load(parent.id),
      ]);

      return {
        postCount: postStats.postCount,
        commentCount,
        totalViews: postStats.totalViews,
      };
    },
  },

  Post: {
    async author(parent: { authorId: string }, _: unknown, { loaders }: Context) {
      return loaders.user.load(parent.authorId);
    },

    async comments(parent: { id: string }, _: unknown, { loaders }: Context) {
      return loaders.comment.byPostId.load(parent.id);
    },

    async tags(parent: { id: string }, _: unknown, { loaders }: Context) {
      return loaders.tag.byPostId.load(parent.id);
    },
  },

  Comment: {
    async author(parent: { authorId: string }, _: unknown, { loaders }: Context) {
      return loaders.user.load(parent.authorId);
    },

    async post(parent: { postId: string }, _: unknown, { loaders }: Context) {
      return loaders.post.byId.load(parent.postId);
    },
  },
};
```

```typescript
// 对比：不使用 DataLoader（N+1 问题）
const resolversWithoutDataLoader = {
  User: {
    // 每个用户都会触发一次数据库查询
    async posts(parent: { id: string }) {
      return db.posts.findMany({ where: { authorId: parent.id } });
    },
  },
};

// 使用 DataLoader（批量查询）
const resolversWithDataLoader = {
  User: {
    // 同一 tick 内的所有用户会合并为一次批量查询
    async posts(parent: { id: string }, _: unknown, { loaders }: Context) {
      return loaders.post.byAuthorId.load(parent.id);
    },
  },
};
```

### 5.4 客户端查询

```typescript
// 会触发 N+1 的典型查询
const GET_USERS_WITH_POSTS = gql`
  query GetUsersWithPosts {
    users {
      id
      name
      posts {
        id
        title
        comments {
          id
          content
          author {
            id
            name
          }
        }
        tags {
          id
          name
        }
      }
      recentComments {
        id
        content
      }
      stats {
        postCount
        commentCount
        totalViews
      }
    }
  }
`;

// 使用 DataLoader 后，上述查询的执行过程：
// 1. Query.users -> 1 次查询获取所有用户 ID
// 2. User.posts -> 1 次批量查询获取所有用户的文章
// 3. Post.comments -> 1 次批量查询获取所有文章的评论
// 4. Comment.author -> 1 次批量查询获取所有评论作者
// 5. Post.tags -> 1 次批量查询获取所有文章标签
// 6. User.recentComments -> 1 次批量查询获取用户最近评论
// 7. User.stats -> 1 次批量查询获取用户统计
//
// 总共 7 次查询，而不是 N+1 次的数百次查询
```

---

## 6. 缓存策略

### 6.1 概念解释

GraphQL 缓存分为两个层面：

**服务端缓存**:

- **响应缓存**: 缓存整个 GraphQL 响应
- **字段级缓存**: 缓存单个 Resolver 的结果
- **数据加载器缓存**: 同一请求内的数据缓存

**客户端缓存 (Apollo Client)**:

- **内存缓存**: 自动缓存查询结果
- **持久化缓存**: 将缓存保存到 localStorage/IndexedDB
- **乐观更新**: 先更新 UI，再同步服务器

### 6.2 SDL 定义

```graphql
# schema.graphql

# 指令定义（用于缓存控制）
directive @cacheControl(
  maxAge: Int
  scope: CacheControlScope
) on FIELD_DEFINITION | OBJECT | INTERFACE

enum CacheControlScope {
  PUBLIC
  PRIVATE
}

# 默认缓存策略的 Schema
type Query {
  # 公开数据 - 可长期缓存
  posts: [Post!]! @cacheControl(maxAge: 300)  # 5分钟

  # 个人数据 - 私有缓存
  me: User! @cacheControl(maxAge: 60, scope: PRIVATE)

  # 实时数据 - 不缓存
  notifications: [Notification!]! @cacheControl(maxAge: 0)

  # 配置数据 - 长期缓存
  appConfig: AppConfig! @cacheControl(maxAge: 3600)  # 1小时
}

type Post @cacheControl(maxAge: 300) {
  id: ID!
  title: String!
  content: String!
  author: User! @cacheControl(maxAge: 60)
  viewCount: Int! @cacheControl(maxAge: 0)  # 不缓存
  createdAt: DateTime! @cacheControl(maxAge: 86400)  # 24小时
}

type User @cacheControl(maxAge: 60, scope: PRIVATE) {
  id: ID!
  name: String!
  email: String! @cacheControl(maxAge: 0)
  posts: [Post!]!
}

type AppConfig {
  theme: String!
  features: [String!]!
  version: String!
}

type Notification @cacheControl(maxAge: 0) {
  id: ID!
  message: String!
  read: Boolean!
  createdAt: DateTime!
}
```

### 6.3 Resolver 实现

```typescript
// server.ts - Apollo Server 缓存配置
import { ApolloServer } from '@apollo/server';
import { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { RedisCache } from 'apollo-server-cache-redis';
import responseCachePlugin from '@apollo/server-plugin-response-cache';

// Redis 缓存实例
const redisCache = new RedisCache({
  host: 'localhost',
  port: 6379,
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: redisCache,
  plugins: [
    responseCachePlugin({
      // 默认缓存时间
      defaultMaxAge: 300,

      // 生成缓存键
      generateCacheKey: (requestContext, keyData) => {
        const { request } = requestContext;
        const userId = request.http?.headers.get('x-user-id');
        return `apollo:${userId || 'anon'}:${keyData}`;
      },

      // 是否缓存此请求
      shouldReadFromCache: (requestContext) => {
        // 不缓存包含 mutations 的请求
        const { operation } = requestContext;
        return operation?.operation !== 'mutation';
      },

      // 额外缓存键因子
      sessionId: (requestContext) => {
        return requestContext.request.http?.headers.get('x-user-id') || null;
      },
    }),
  ],
  context: async ({ req }) => {
    return {
      userId: req.headers['x-user-id'],
      cache: redisCache,
    };
  },
});
```

```typescript
// resolvers/with-cache.ts
import type { Context } from '../context';

// 自定义缓存包装器
function withCache<T>(
  resolver: (...args: any[]) => Promise<T>,
  options: {
    key: string;
    ttl: number;
    invalidateOn?: string[];
  }
) {
  return async (
    parent: any,
    args: any,
    context: Context,
    info: any
  ): Promise<T> => {
    const cacheKey = `${options.key}:${JSON.stringify(args)}:${parent?.id || ''}`;

    // 尝试从缓存获取
    const cached = await context.cache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${cacheKey}`);
      return JSON.parse(cached);
    }

    // 执行 resolver
    const result = await resolver(parent, args, context, info);

    // 存入缓存
    await context.cache.set(cacheKey, JSON.stringify(result), {
      ttl: options.ttl,
    });

    return result;
  };
}

export const resolversWithCache = {
  Query: {
    // 带缓存的 posts 查询
    posts: withCache(
      async (_: unknown, __: unknown, { dataSources }: Context) => {
        return dataSources.postAPI.findAll();
      },
      {
        key: 'posts:all',
        ttl: 300, // 5分钟
        invalidateOn: ['CREATE_POST', 'UPDATE_POST', 'DELETE_POST'],
      }
    ),

    // 带缓存的单个 post 查询
    post: withCache(
      async (_: unknown, { id }: { id: string }, { dataSources }: Context) => {
        return dataSources.postAPI.findById(id);
      },
      {
        key: 'post',
        ttl: 600, // 10分钟
        invalidateOn: ['UPDATE_POST', 'DELETE_POST'],
      }
    ),

    // 配置数据 - 长期缓存
    appConfig: withCache(
      async (_: unknown, __: unknown, { dataSources }: Context) => {
        return dataSources.configAPI.getConfig();
      },
      {
        key: 'app:config',
        ttl: 3600, // 1小时
      }
    ),
  },

  Mutation: {
    // 创建文章后清除相关缓存
    async createPost(
      _: unknown,
      { input }: { input: any },
      { dataSources, cache }: Context
    ) {
      const post = await dataSources.postAPI.create(input);

      // 清除 posts 列表缓存
      await cache.delete('posts:all:*');

      return { post };
    },

    // 更新文章后清除缓存
    async updatePost(
      _: unknown,
      { id, input }: { id: string; input: any },
      { dataSources, cache }: Context
    ) {
      const post = await dataSources.postAPI.update(id, input);

      // 清除特定文章缓存
      await cache.delete(`post:${JSON.stringify({ id })}:*`);
      await cache.delete('posts:all:*');

      return { post };
    },
  },
};
```

```typescript
// cache/inmemory-cache.ts - 服务端内存缓存
import NodeCache from 'node-cache';

class InMemoryCache implements KeyValueCache {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 默认 5 分钟
      checkperiod: 60, // 每分钟检查过期
    });
  }

  async get(key: string): Promise<string | undefined> {
    return this.cache.get(key);
  }

  async set(
    key: string,
    value: string,
    options?: { ttl?: number }
  ): Promise<void> {
    this.cache.set(key, value, options?.ttl);
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.del(key) > 0;
  }

  // 支持模式删除
  async deletePattern(pattern: string): Promise<void> {
    const keys = this.cache.keys();
    const regex = new RegExp(pattern.replace('*', '.*'));
    const matchingKeys = keys.filter(k => regex.test(k));
    this.cache.del(matchingKeys);
  }
}
```

### 6.4 客户端缓存

```typescript
// client/apollo-client.ts
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  defaultDataIdFromObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';

// 配置缓存
const cache = new InMemoryCache({
  // 自定义数据 ID
  dataIdFromObject(responseObject) {
    const { __typename, id } = responseObject;

    // 自定义 ID 生成规则
    switch (__typename) {
      case 'User':
        return `User:${id}`;
      case 'Post':
        return `Post:${id}`;
      default:
        return defaultDataIdFromObject(responseObject);
    }
  },

  // 类型策略
  typePolicies: {
    Query: {
      fields: {
        // 合并 posts 查询结果
        posts: {
          keyArgs: ['filter', 'sort'],
          merge(existing = [], incoming, { args }) {
            if (args?.offset === 0) {
              return incoming;
            }
            return [...existing, ...incoming];
          },
          read(existing, { args }) {
            // 实现客户端分页
            if (!existing) return undefined;
            const { offset = 0, limit = 20 } = args || {};
            return existing.slice(offset, offset + limit);
          },
        },

        // 单个对象缓存
        post: {
          read(_, { args, toReference }) {
            return toReference({
              __typename: 'Post',
              id: args?.id,
            });
          },
        },

        // 不缓存的字段
        notifications: {
          // 不从缓存读取，始终发起请求
          read() {
            return undefined;
          },
        },
      },
    },

    Post: {
      fields: {
        // viewCount 不缓存，始终为最新
        viewCount: {
          read(_, { readField }) {
            // 可以在这里实现自定义读取逻辑
            return undefined; // 不缓存
          },
        },
      },
    },

    User: {
      fields: {
        // posts 引用缓存
        posts: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

// 持久化缓存到 localStorage
async function setupPersistentCache() {
  await persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
    key: 'apollo-cache',
    maxSize: 1048576, // 1MB
  });
}

// HTTP 链接
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

// 认证链接
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
    },
  },
});

setupPersistentCache();
```

```typescript
// client/hooks/useCachedQuery.ts
import { useQuery, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

export function useCachedQuery(query: any, options?: any) {
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery(query, {
    ...options,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-and-network',
  });

  // 手动刷新缓存
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // 清除特定查询缓存
  const clearCache = useCallback(() => {
    client.cache.evict({ fieldName: options?.fieldName || 'posts' });
    client.cache.gc();
  }, [client, options?.fieldName]);

  // 预加载数据
  const preload = useCallback(
    async (preloadOptions: any) => {
      await client.query({
        query,
        variables: preloadOptions.variables,
        fetchPolicy: 'cache-first',
      });
    },
    [client, query]
  );

  return {
    data,
    loading,
    error,
    refetch,
    refresh,
    clearCache,
    preload,
  };
}
```

```typescript
// client/components/CacheManagement.tsx
import { useApolloClient } from '@apollo/client';

function CacheManagement() {
  const client = useApolloClient();

  // 清除所有缓存
  const clearAllCache = () => {
    client.cache.reset();
  };

  // 清除特定类型缓存
  const clearPostCache = () => {
    client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'posts' });
    client.cache.evict({ fieldName: 'post' });
    client.cache.gc();
  };

  // 更新缓存中的数据
  const updateCache = (postId: string, newData: any) => {
    client.cache.modify({
      id: client.cache.identify({ __typename: 'Post', id: postId }),
      fields: {
        title() {
          return newData.title;
        },
        content() {
          return newData.content;
        },
      },
    });
  };

  return (
    <div>
      <button onClick={clearAllCache}>Clear All Cache</button>
      <button onClick={clearPostCache}>Clear Post Cache</button>
    </div>
  );
}
```

---

## 7. 认证和授权

### 7.1 概念解释

**认证 (Authentication)**: 验证用户身份

- JWT Token
- Session Cookie
- OAuth

**授权 (Authorization)**: 决定用户能做什么

- Role-Based Access Control (RBAC)
- Attribute-Based Access Control (ABAC)
- Policy-Based Access Control (PBAC)

### 7.2 SDL 定义

```graphql
# schema.graphql

directive @auth(
  requires: Role = ADMIN
) on FIELD_DEFINITION

directive @owner(
  field: String = "userId"
) on FIELD_DEFINITION

enum Role {
  ADMIN
  USER
  GUEST
}

type Query {
  # 公开访问
  posts: [Post!]!

  # 需要登录
  me: User! @auth(requires: USER)

  # 仅管理员
  allUsers: [User!]! @auth(requires: ADMIN)

  # 需要所有者权限
  myPosts: [Post!]! @owner(field: "authorId")
}

type Mutation {
  # 公开
  login(input: LoginInput!): AuthPayload!
  register(input: RegisterInput!): AuthPayload!

  # 需要登录
  createPost(input: CreatePostInput!): Post! @auth(requires: USER)

  # 需要所有者权限
  updatePost(id: ID!, input: UpdatePostInput!): Post! @owner(field: "authorId")
  deletePost(id: ID!): Boolean! @owner(field: "authorId")

  # 需要管理员权限
  deleteUser(id: ID!): Boolean! @auth(requires: ADMIN)
  updateUserRole(id: ID!, role: Role!): User! @auth(requires: ADMIN)
}

input LoginInput {
  email: String!
  password: String!
}

input RegisterInput {
  email: String!
  password: String!
  name: String!
}

type AuthPayload {
  token: String!
  user: User!
}

type User {
  id: ID!
  email: String!
  name: String!
  role: Role!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  authorId: ID!
  author: User!
}
```

### 7.3 Resolver 实现

```typescript
// auth/jwt.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

```typescript
// auth/directives.ts
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLError } from 'graphql';
import type { GraphQLSchema } from 'graphql';
import type { Context } from '../context';

export function authDirective(directiveName: string) {
  return {
    authDirectiveTypeDefs: `
      directive @${directiveName}(requires: Role = ADMIN) on FIELD_DEFINITION
      enum Role {
        ADMIN
        USER
        GUEST
      }
    `,
    authDirectiveTransformer: (schema: GraphQLSchema) => {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

          if (authDirective) {
            const { requires } = authDirective;
            const { resolve = defaultFieldResolver } = fieldConfig;

            fieldConfig.resolve = async (
              source,
              args,
              context: Context,
              info
            ) => {
              // 检查用户是否登录
              if (!context.userId) {
                throw new GraphQLError('Unauthorized', {
                  extensions: { code: 'UNAUTHENTICATED' },
                });
              }

              // 检查角色权限
              const roleHierarchy = ['GUEST', 'USER', 'ADMIN'];
              const userRoleIndex = roleHierarchy.indexOf(context.userRole || 'GUEST');
              const requiredRoleIndex = roleHierarchy.indexOf(requires);

              if (userRoleIndex < requiredRoleIndex) {
                throw new GraphQLError('Forbidden', {
                  extensions: { code: 'FORBIDDEN' },
                });
              }

              return resolve(source, args, context, info);
            };
          }

          return fieldConfig;
        },
      });
    },
  };
}

export function ownerDirective(directiveName: string) {
  return {
    ownerDirectiveTypeDefs: `
      directive @${directiveName}(field: String = "userId") on FIELD_DEFINITION
    `,
    ownerDirectiveTransformer: (schema: GraphQLSchema) => {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const ownerDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

          if (ownerDirective) {
            const { field: ownerField = 'userId' } = ownerDirective;
            const { resolve = defaultFieldResolver } = fieldConfig;

            fieldConfig.resolve = async (
              source,
              args,
              context: Context,
              info
            ) => {
              if (!context.userId) {
                throw new GraphQLError('Unauthorized', {
                  extensions: { code: 'UNAUTHENTICATED' },
                });
              }

              // 先获取资源
              const result = await resolve(source, args, context, info);

              // 检查所有权
              const resourceOwnerId = result?.[ownerField] || result?.authorId;

              // 管理员可以访问所有资源
              if (context.userRole === 'ADMIN') {
                return result;
              }

              if (resourceOwnerId !== context.userId) {
                throw new GraphQLError('Forbidden: Not the owner', {
                  extensions: { code: 'FORBIDDEN' },
                });
              }

              return result;
            };
          }

          return fieldConfig;
        },
      });
    },
  };
}
```

```typescript
// context.ts
import { verifyToken } from './auth/jwt';
import type { Request } from 'express';

export interface Context {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  dataSources: DataSources;
}

export async function createContext({ req }: { req: Request }): Promise<Context> {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  let userId: string | undefined;
  let userEmail: string | undefined;
  let userRole: string | undefined;

  if (token) {
    try {
      const payload = verifyToken(token);
      userId = payload.userId;
      userEmail = payload.email;
      userRole = payload.role;
    } catch (error) {
      // Token 无效，不设置用户信息
    }
  }

  return {
    userId,
    userEmail,
    userRole,
    dataSources: createDataSources(),
  };
}
```

```typescript
// resolvers/auth.ts
import { GraphQLError } from 'graphql';
import type { Context } from '../context';
import {
  generateToken,
  hashPassword,
  comparePassword,
} from '../auth/jwt';

export const authResolvers = {
  Query: {
    async me(_: unknown, __: unknown, { userId, dataSources }: Context) {
      if (!userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await dataSources.userAPI.findById(userId);
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return user;
    },

    async allUsers(_: unknown, __: unknown, { dataSources }: Context) {
      return dataSources.userAPI.findAll();
    },

    async myPosts(_: unknown, __: unknown, { userId, dataSources }: Context) {
      if (!userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return dataSources.postAPI.findByAuthorId(userId);
    },
  },

  Mutation: {
    async login(
      _: unknown,
      { input }: { input: { email: string; password: string } },
      { dataSources }: Context
    ) {
      const user = await dataSources.userAPI.findByEmail(input.email);
      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const valid = await comparePassword(input.password, user.password);
      if (!valid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    },

    async register(
      _: unknown,
      { input }: { input: { email: string; password: string; name: string } },
      { dataSources }: Context
    ) {
      const existing = await dataSources.userAPI.findByEmail(input.email);
      if (existing) {
        throw new GraphQLError('Email already exists', {
          extensions: { code: 'CONFLICT' },
        });
      }

      const hashedPassword = await hashPassword(input.password);
      const user = await dataSources.userAPI.create({
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: 'USER',
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    },

    async createPost(
      _: unknown,
      { input }: { input: any },
      { userId, dataSources }: Context
    ) {
      if (!userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const post = await dataSources.postAPI.create({
        ...input,
        authorId: userId,
      });

      return post;
    },

    async updatePost(
      _: unknown,
      { id, input }: { id: string; input: any },
      { userId, userRole, dataSources }: Context
    ) {
      if (!userId) {
        throw new GraphQLError('Unauthorized');
      }

      const post = await dataSources.postAPI.findById(id);
      if (!post) {
        throw new GraphQLError('Post not found');
      }

      // 检查所有权
      if (userRole !== 'ADMIN' && post.authorId !== userId) {
        throw new GraphQLError('Forbidden: Not the owner');
      }

      return dataSources.postAPI.update(id, input);
    },

    async deletePost(
      _: unknown,
      { id }: { id: string },
      { userId, userRole, dataSources }: Context
    ) {
      if (!userId) {
        throw new GraphQLError('Unauthorized');
      }

      const post = await dataSources.postAPI.findById(id);
      if (!post) {
        throw new GraphQLError('Post not found');
      }

      if (userRole !== 'ADMIN' && post.authorId !== userId) {
        throw new GraphQLError('Forbidden');
      }

      await dataSources.postAPI.delete(id);
      return true;
    },

    async deleteUser(
      _: unknown,
      { id }: { id: string },
      { userRole, dataSources }: Context
    ) {
      if (userRole !== 'ADMIN') {
        throw new GraphQLError('Forbidden: Admin required');
      }

      await dataSources.userAPI.delete(id);
      return true;
    },

    async updateUserRole(
      _: unknown,
      { id, role }: { id: string; role: string },
      { userRole, dataSources }: Context
    ) {
      if (userRole !== 'ADMIN') {
        throw new GraphQLError('Forbidden: Admin required');
      }

      const user = await dataSources.userAPI.update(id, { role });
      return user;
    },
  },
};
```

```typescript
// server.ts - 整合认证
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { authDirective, ownerDirective } from './auth/directives';

const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth');
const { ownerDirectiveTypeDefs, ownerDirectiveTransformer } = ownerDirective('owner');

// 合并 typeDefs
const typeDefs = [
  authDirectiveTypeDefs,
  ownerDirectiveTypeDefs,
  baseTypeDefs,
];

// 创建 schema
let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// 应用指令转换器
schema = authDirectiveTransformer(schema);
schema = ownerDirectiveTransformer(schema);

const server = new ApolloServer({
  schema,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: createContext,
});
```

### 7.4 客户端查询

```typescript
// client/auth/auth.ts
import { client } from '../apollo-client';

const TOKEN_KEY = 'auth_token';

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
```

```typescript
// client/queries/auth.ts
import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      role
      posts {
        id
        title
      }
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    allUsers {
      id
      email
      name
      role
    }
  }
`;
```

```typescript
// client/components/LoginForm.tsx
import { useMutation } from '@apollo/client';
import { LOGIN } from '../queries/auth';
import { setToken } from '../auth/auth';

function LoginForm() {
  const [login, { loading, error }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      setToken(data.login.token);
      // 刷新页面或重定向
      window.location.href = '/dashboard';
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    login({
      variables: {
        input: {
          email: formData.get('email'),
          password: formData.get('password'),
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </form>
  );
}
```

```typescript
// client/components/ProtectedRoute.tsx
import { useQuery } from '@apollo/client';
import { GET_ME } from '../queries/auth';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { data, loading } = useQuery(GET_ME);

  if (loading) return <div>Loading...</div>;

  if (!data?.me) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && data.me.role !== requiredRole) {
    return <div>Access denied</div>;
  }

  return <>{children}</>;
}

// 使用
function AdminPanel() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>Admin Panel</div>
    </ProtectedRoute>
  );
}
```

```typescript
// client/components/ErrorBoundary.tsx
import { onError } from '@apollo/client/link/error';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Apollo 错误处理链接
export const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      switch (err.extensions?.code) {
        case 'UNAUTHENTICATED':
          // 清除 token 并重定向到登录页
          removeToken();
          window.location.href = '/login';
          break;
        case 'FORBIDDEN':
          console.error('Access denied');
          break;
        default:
          console.error(`GraphQL error: ${err.message}`);
      }
    }
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
  }
});
```

---

## 8. 文件上传

### 8.1 概念解释

GraphQL 文件上传使用 `multipart/form-data` 协议。常用规范：

- **GraphQL Multipart Request Spec**: 标准文件上传协议
- **Apollo Upload Client**: 客户端文件上传支持

### 8.2 SDL 定义

```graphql
# schema.graphql

scalar Upload

enum FileType {
  IMAGE
  DOCUMENT
  VIDEO
  AUDIO
  OTHER
}

type File {
  id: ID!
  filename: String!
  mimetype: String!
  encoding: String!
  url: String!
  thumbnailUrl: String
  size: Int!
  type: FileType!
  uploadedAt: DateTime!
  uploadedBy: User!
}

type UploadProgress {
  loaded: Int!
  total: Int!
  percentage: Float!
}

type Query {
  file(id: ID!): File
  filesByUser(userId: ID!): [File!]!
  myFiles: [File!]!
}

type Mutation {
  # 单文件上传
  uploadFile(
    file: Upload!
    type: FileType
  ): File!

  # 多文件上传
  uploadFiles(
    files: [Upload!]!
    type: FileType
  ): [File!]!

  # 带元数据的文件上传
  uploadFileWithMeta(
    file: Upload!
    title: String
    description: String
    tags: [String!]
  ): File!

  # 图片上传（自动生成缩略图）
  uploadImage(
    file: Upload!
    maxWidth: Int
    maxHeight: Int
  ): File!

  # 删除文件
  deleteFile(id: ID!): Boolean!
}

type Subscription {
  # 上传进度订阅
  uploadProgress(uploadId: ID!): UploadProgress!
}
```

### 8.3 Resolver 实现

```typescript
// server.ts - 文件上传配置
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import cors from 'cors';

const app = express();

// 配置文件上传中间件
app.use(
  '/graphql',
  cors(),
  graphqlUploadExpress({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
  })
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => {
      return {
        userId: req.headers['x-user-id'],
        fileStorage: createFileStorage(),
      };
    },
  })
);
```

```typescript
// resolvers/upload.ts
import { GraphQLError } from 'graphql';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import type { Context } from '../context';

interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}

// 存储服务接口
interface FileStorage {
  upload(stream: NodeJS.ReadableStream, filename: string): Promise<string>;
  delete(url: string): Promise<void>;
  getUrl(key: string): string;
}

// 本地文件存储实现
class LocalFileStorage implements FileStorage {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.baseUrl = process.env.BASE_URL || 'http://localhost:4000';
  }

  async upload(stream: NodeJS.ReadableStream, filename: string): Promise<string> {
    const key = `${uuidv4()}-${filename}`;
    const filepath = path.join(this.uploadDir, key);

    const writeStream = createWriteStream(filepath);
    await pipeline(stream, writeStream);

    return key;
  }

  async delete(key: string): Promise<void> {
    const filepath = path.join(this.uploadDir, key);
    await fs.promises.unlink(filepath);
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/uploads/${key}`;
  }
}

// S3 存储实现
class S3FileStorage implements FileStorage {
  private s3Client: AWS.S3;
  private bucket: string;

  constructor() {
    this.s3Client = new AWS.S3({
      region: process.env.AWS_REGION,
    });
    this.bucket = process.env.S3_BUCKET!;
  }

  async upload(stream: NodeJS.ReadableStream, filename: string): Promise<string> {
    const key = `uploads/${uuidv4()}-${filename}`;

    await this.s3Client.upload({
      Bucket: this.bucket,
      Key: key,
      Body: stream,
      ContentType: this.getContentType(filename),
    }).promise();

    return key;
  }

  async delete(key: string): Promise<void> {
    await this.s3Client.deleteObject({
      Bucket: this.bucket,
      Key: key,
    }).promise();
  }

  getUrl(key: string): string {
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export const uploadResolvers = {
  Upload: GraphQLUpload,

  Mutation: {
    async uploadFile(
      _: unknown,
      { file, type }: { file: Promise<FileUpload>; type?: string },
      { userId, fileStorage }: Context
    ) {
      if (!userId) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const { createReadStream, filename, mimetype, encoding } = await file;

      // 验证文件类型
      if (!isValidFileType(mimetype, type)) {
        throw new GraphQLError('Invalid file type', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const stream = createReadStream();
      const key = await fileStorage.upload(stream, filename);

      // 保存文件记录到数据库
      const fileRecord = await saveFileRecord({
        id: uuidv4(),
        filename,
        mimetype,
        encoding,
        key,
        url: fileStorage.getUrl(key),
        size: await getFileSize(key),
        type: type || inferFileType(mimetype),
        uploadedBy: userId,
        uploadedAt: new Date(),
      });

      return fileRecord;
    },

    async uploadFiles(
      _: unknown,
      { files, type }: { files: Promise<FileUpload>[]; type?: string },
      { userId, fileStorage }: Context
    ) {
      if (!userId) {
        throw new GraphQLError('Unauthorized');
      }

      // 并行处理多个文件上传
      const uploadedFiles = await Promise.all(
        files.map(async (filePromise) => {
          const { createReadStream, filename, mimetype, encoding } = await filePromise;
          const stream = createReadStream();
          const key = await fileStorage.upload(stream, filename);

          return saveFileRecord({
            id: uuidv4(),
            filename,
            mimetype,
            encoding,
            key,
            url: fileStorage.getUrl(key),
            size: await getFileSize(key),
            type: type || inferFileType(mimetype),
            uploadedBy: userId,
            uploadedAt: new Date(),
          });
        })
      );

      return uploadedFiles;
    },

    async uploadImage(
      _: unknown,
      { file, maxWidth, maxHeight }: {
        file: Promise<FileUpload>;
        maxWidth?: number;
        maxHeight?: number;
      },
      { userId, fileStorage }: Context
    ) {
      if (!userId) {
        throw new GraphQLError('Unauthorized');
      }

      const { createReadStream, filename, mimetype, encoding } = await file;

      // 验证是图片
      if (!mimetype.startsWith('image/')) {
        throw new GraphQLError('File must be an image');
      }

      let buffer = await streamToBuffer(createReadStream());

      // 图片处理
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // 调整尺寸
      if (maxWidth || maxHeight) {
        buffer = await image
          .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
          .toBuffer();
      }

      // 生成缩略图
      const thumbnailBuffer = await sharp(buffer)
        .resize(200, 200, { fit: 'cover' })
        .toBuffer();

      // 保存原图
      const key = await fileStorage.upload(bufferToStream(buffer), filename);

      // 保存缩略图
      const thumbnailKey = await fileStorage.upload(
        bufferToStream(thumbnailBuffer),
        `thumb-${filename}`
      );

      return saveFileRecord({
        id: uuidv4(),
        filename,
        mimetype,
        encoding,
        key,
        url: fileStorage.getUrl(key),
        thumbnailUrl: fileStorage.getUrl(thumbnailKey),
        size: buffer.length,
        type: 'IMAGE',
        uploadedBy: userId,
        uploadedAt: new Date(),
      });
    },

    async deleteFile(
      _: unknown,
      { id }: { id: string },
      { userId, userRole, fileStorage }: Context
    ) {
      if (!userId) {
        throw new GraphQLError('Unauthorized');
      }

      const file = await getFileById(id);
      if (!file) {
        throw new GraphQLError('File not found');
      }

      // 检查权限
      if (userRole !== 'ADMIN' && file.uploadedBy !== userId) {
        throw new GraphQLError('Forbidden');
      }

      // 删除存储
      await fileStorage.delete(file.key);
      if (file.thumbnailKey) {
        await fileStorage.delete(file.thumbnailKey);
      }

      // 删除记录
      await deleteFileRecord(id);

      return true;
    },
  },

  Query: {
    async file(_: unknown, { id }: { id: string }) {
      return getFileById(id);
    },

    async filesByUser(_: unknown, { userId }: { userId: string }) {
      return getFilesByUserId(userId);
    },

    async myFiles(_: unknown, __: unknown, { userId }: Context) {
      if (!userId) {
        throw new GraphQLError('Unauthorized');
      }
      return getFilesByUserId(userId);
    },
  },
};

// 辅助函数
function isValidFileType(mimetype: string, type?: string): boolean {
  if (!type) return true;

  const allowedTypes: Record<string, string[]> = {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'text/plain', 'application/msword'],
    VIDEO: ['video/mp4', 'video/webm'],
    AUDIO: ['audio/mpeg', 'audio/wav'],
  };

  return allowedTypes[type]?.includes(mimetype) ?? true;
}

function inferFileType(mimetype: string): string {
  if (mimetype.startsWith('image/')) return 'IMAGE';
  if (mimetype.startsWith('video/')) return 'VIDEO';
  if (mimetype.startsWith('audio/')) return 'AUDIO';
  if (mimetype.includes('pdf') || mimetype.includes('word')) return 'DOCUMENT';
  return 'OTHER';
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function bufferToStream(buffer: Buffer): NodeJS.ReadableStream {
  const { Readable } = require('stream');
  return Readable.from([buffer]);
}
```

### 8.4 客户端查询

```typescript
// client/apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

// 使用 apollo-upload-client 替代普通 http link
const uploadLink = createUploadLink({
  uri: 'http://localhost:4000/graphql',
  headers: {
    'apollo-require-preflight': 'true',
  },
});

export const client = new ApolloClient({
  link: uploadLink,
  cache: new InMemoryCache(),
});
```

```typescript
// client/queries/upload.ts
import { gql } from '@apollo/client';

export const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!, $type: FileType) {
    uploadFile(file: $file, type: $type) {
      id
      filename
      url
      mimetype
      size
      type
      uploadedAt
    }
  }
`;

export const UPLOAD_FILES = gql`
  mutation UploadFiles($files: [Upload!]!, $type: FileType) {
    uploadFiles(files: $files, type: $type) {
      id
      filename
      url
      mimetype
      size
      type
    }
  }
`;

export const UPLOAD_IMAGE = gql`
  mutation UploadImage($file: Upload!, $maxWidth: Int, $maxHeight: Int) {
    uploadImage(file: $file, maxWidth: $maxWidth, maxHeight: $maxHeight) {
      id
      filename
      url
      thumbnailUrl
      mimetype
      size
      uploadedAt
    }
  }
`;

export const DELETE_FILE = gql`
  mutation DeleteFile($id: ID!) {
    deleteFile(id: $id)
  }
`;
```

```typescript
// client/components/FileUpload.tsx
import { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { UPLOAD_FILE, UPLOAD_IMAGE } from '../queries/upload';

interface FileUploadProps {
  onUploadComplete?: (file: any) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // MB
  type?: 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'AUDIO';
}

function FileUpload({
  onUploadComplete,
  accept = '*',
  multiple = false,
  maxSize = 10,
  type,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [uploadFile] = useMutation(UPLOAD_FILE);
  const [uploadImage] = useMutation(UPLOAD_IMAGE);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        // 验证文件大小
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds ${maxSize}MB limit`);
        }

        // 模拟上传进度
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90));
        }, 100);

        // 选择上传方式
        const mutation = type === 'IMAGE' ? uploadImage : uploadFile;
        const variables = type === 'IMAGE'
          ? { file, maxWidth: 1920, maxHeight: 1080 }
          : { file, type };

        const { data } = await mutation({ variables });

        clearInterval(progressInterval);
        setProgress(100);

        onUploadComplete?.(data?.uploadFile || data?.uploadImage);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [uploadFile, uploadImage, type, maxSize, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = files;
      handleFileSelect({ target: input } as any);
    }
  }, [handleFileSelect]);

  return (
    <div
      className="upload-area"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {uploading && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <p>Drag & drop files here, or click to select</p>
      <p>Max size: {maxSize}MB</p>
    </div>
  );
}

// 图片预览组件
function ImageUploadWithPreview() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  const handleUploadComplete = (file: any) => {
    setUploadedFile(file);
    setPreview(file.thumbnailUrl || file.url);
  };

  return (
    <div>
      <FileUpload
        type="IMAGE"
        accept="image/*"
        onUploadComplete={handleUploadComplete}
      />

      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" style={{ maxWidth: 200 }} />
          <p>{uploadedFile?.filename}</p>
          <p>{(uploadedFile?.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}
    </div>
  );
}
```

---

## 9. 错误处理

### 9.1 概念解释

GraphQL 错误分类：

- **请求错误**: 语法错误、验证错误
- **解析错误**: Resolver 执行过程中的错误
- **业务错误**: 业务逻辑错误（如权限不足、资源不存在）

最佳实践：

- 使用错误扩展提供结构化错误信息
- 区分用户错误和系统错误
- 记录详细错误日志

### 9.2 SDL 定义

```graphql
# schema.graphql

# 错误接口
interface Error {
  message: String!
  code: String!
  path: [String!]
}

# 具体错误类型
type ValidationError implements Error {
  message: String!
  code: String!
  path: [String!]
  field: String!
  constraints: [String!]!
}

type NotFoundError implements Error {
  message: String!
  code: String!
  path: [String!]
  resourceType: String!
  resourceId: String!
}

type AuthenticationError implements Error {
  message: String!
  code: String!
  path: [String!]
}

type AuthorizationError implements Error {
  message: String!
  code: String!
  path: [String!]
  requiredPermission: String!
}

type ConflictError implements Error {
  message: String!
  code: String!
  path: [String!]
  conflictingField: String!
}

# 统一响应类型
union UserResult = User | NotFoundError | AuthorizationError
union PostResult = Post | NotFoundError | AuthorizationError
union CreateUserResult = User | ValidationError | ConflictError
union CreatePostResult = Post | ValidationError | AuthorizationError

# 查询类型
type Query {
  user(id: ID!): UserResult!
  post(id: ID!): PostResult!
}

# 变更类型
type Mutation {
  createUser(input: CreateUserInput!): CreateUserResult!
  createPost(input: CreatePostInput!): CreatePostResult!
}
```

### 9.3 Resolver 实现

```typescript
// errors/codes.ts
export const ErrorCodes = {
  // 认证/授权错误
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',

  // 输入错误
  BAD_USER_INPUT: 'BAD_USER_INPUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // 资源错误
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // 系统错误
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // 业务错误
  RATE_LIMITED: 'RATE_LIMITED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
```

```typescript
// errors/custom-errors.ts
import { GraphQLError } from 'graphql';
import { ErrorCodes, ErrorCode } from './codes';

interface ErrorExtensions {
  code: ErrorCode;
  [key: string]: any;
}

export class AppError extends GraphQLError {
  constructor(
    message: string,
    code: ErrorCode,
    extensions: Record<string, any> = {}
  ) {
    super(message, {
      extensions: {
        code,
        ...extensions,
      },
    });
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    field: string,
    constraints: string[] = []
  ) {
    super(message, ErrorCodes.VALIDATION_ERROR, {
      field,
      constraints,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(
    resourceType: string,
    resourceId: string
  ) {
    super(
      `${resourceType} with id '${resourceId}' not found`,
      ErrorCodes.NOT_FOUND,
      { resourceType, resourceId }
    );
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, ErrorCodes.UNAUTHENTICATED);
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Access denied',
    requiredPermission?: string
  ) {
    super(message, ErrorCodes.FORBIDDEN, {
      requiredPermission,
    });
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string,
    conflictingField: string
  ) {
    super(message, ErrorCodes.CONFLICT, {
      conflictingField,
    });
  }
}
```

```typescript
// middleware/error-handler.ts
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';
import { ErrorCodes } from '../errors/codes';

export function formatError(error: GraphQLError) {
  // 记录错误日志
  console.error('GraphQL Error:', {
    message: error.message,
    path: error.path,
    locations: error.locations,
    extensions: error.extensions,
    stack: error.stack,
  });

  // 生产环境隐藏内部错误详情
  if (process.env.NODE_ENV === 'production') {
    if (error.extensions?.code === ErrorCodes.INTERNAL_SERVER_ERROR) {
      return {
        message: 'Internal server error',
        extensions: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
        },
      };
    }
  }

  // 返回结构化的错误信息
  return {
    message: error.message,
    extensions: {
      code: error.extensions?.code || ErrorCodes.INTERNAL_SERVER_ERROR,
      ...error.extensions,
    },
  };
}

export function errorPlugin() {
  return {
    async requestDidStart() {
      return {
        async didEncounterErrors(requestContext) {
          const { errors, operation, contextValue } = requestContext;

          for (const error of errors) {
            // 记录到错误追踪服务
            await logError({
              error,
              operation: operation?.name?.value,
              userId: contextValue?.userId,
              query: requestContext.request.query,
              variables: requestContext.request.variables,
            });
          }
        },
      };
    },
  };
}
```

```typescript
// resolvers/with-error-handling.ts
import { GraphQLError } from 'graphql';
import {
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
} from '../errors/custom-errors';
import type { Context } from '../context';

export const resolvers = {
  Query: {
    async user(
      _: unknown,
      { id }: { id: string },
      { userId, dataSources }: Context
    ) {
      try {
        const user = await dataSources.userAPI.findById(id);

        if (!user) {
          throw new NotFoundError('User', id);
        }

        // 检查权限
        if (user.id !== userId && !await isAdmin(userId)) {
          throw new AuthorizationError(
            'Cannot access other user\'s profile',
            'VIEW_OTHER_USER'
          );
        }

        return user;
      } catch (error) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch user', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    async post(
      _: unknown,
      { id }: { id: string },
      { dataSources }: Context
    ) {
      const post = await dataSources.postAPI.findById(id);

      if (!post) {
        throw new NotFoundError('Post', id);
      }

      return post;
    },
  },

  Mutation: {
    async createUser(
      _: unknown,
      { input }: { input: any },
      { dataSources }: Context
    ) {
      // 输入验证
      const errors = validateUserInput(input);
      if (errors.length > 0) {
        throw new ValidationError(
          'Invalid input',
          errors[0].field,
          errors.map(e => e.message)
        );
      }

      // 检查邮箱唯一性
      const existing = await dataSources.userAPI.findByEmail(input.email);
      if (existing) {
        throw new ConflictError(
          'Email already registered',
          'email'
        );
      }

      try {
        const user = await dataSources.userAPI.create(input);
        return user;
      } catch (error) {
        console.error('Create user error:', error);
        throw new GraphQLError('Failed to create user', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    async createPost(
      _: unknown,
      { input }: { input: any },
      { userId, dataSources }: Context
    ) {
      if (!userId) {
        throw new AuthenticationError('Login required to create posts');
      }

      // 验证输入
      if (!input.title || input.title.length < 3) {
        throw new ValidationError(
          'Title must be at least 3 characters',
          'title',
          ['minLength']
        );
      }

      try {
        const post = await dataSources.postAPI.create({
          ...input,
          authorId: userId,
        });
        return post;
      } catch (error) {
        console.error('Create post error:', error);
        throw new GraphQLError('Failed to create post');
      }
    },
  },

  // 结果类型解析器
  UserResult: {
    __resolveType(obj: any) {
      if (obj.code === 'NOT_FOUND') return 'NotFoundError';
      if (obj.code === 'FORBIDDEN') return 'AuthorizationError';
      return 'User';
    },
  },

  PostResult: {
    __resolveType(obj: any) {
      if (obj.code === 'NOT_FOUND') return 'NotFoundError';
      if (obj.code === 'FORBIDDEN') return 'AuthorizationError';
      return 'Post';
    },
  },

  CreateUserResult: {
    __resolveType(obj: any) {
      if (obj.code === 'VALIDATION_ERROR') return 'ValidationError';
      if (obj.code === 'CONFLICT') return 'ConflictError';
      return 'User';
    },
  },
};

// 输入验证函数
function validateUserInput(input: any) {
  const errors: Array<{ field: string; message: string }> = [];

  if (!input.email || !isValidEmail(input.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!input.password || input.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  if (!input.name || input.name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  return errors;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

```typescript
// server.ts
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { formatError, errorPlugin } from './middleware/error-handler';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError,
  plugins: [errorPlugin()],
});
```

### 9.4 客户端查询

```typescript
// client/errors/error-handler.ts
import { onError } from '@apollo/client/link/error';
import { Observable } from '@apollo/client';

export const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const error of graphQLErrors) {
        const { code, field, resourceType } = error.extensions || {};

        switch (code) {
          case 'UNAUTHENTICATED':
            // 清除 token 并重定向
            localStorage.removeItem('token');
            window.location.href = '/login';
            break;

          case 'FORBIDDEN':
            // 显示权限不足提示
            showNotification('Access denied', 'error');
            break;

          case 'VALIDATION_ERROR':
            // 表单验证错误，会在组件中处理
            break;

          case 'NOT_FOUND':
            // 导航到 404 页面
            window.location.href = '/404';
            break;

          case 'CONFLICT':
            showNotification(error.message, 'warning');
            break;

          case 'RATE_LIMITED':
            showNotification('Too many requests, please try again later', 'warning');
            break;

          default:
            console.error(`GraphQL error: ${error.message}`);
            showNotification('Something went wrong', 'error');
        }
      }
    }

    if (networkError) {
      console.error(`Network error: ${networkError}`);
      showNotification('Network error, please check your connection', 'error');
    }
  }
);

function showNotification(message: string, type: 'error' | 'warning' | 'success') {
  // 实现通知显示逻辑
  console.log(`[${type.toUpperCase()}] ${message}`);
}
```

```typescript
// client/hooks/useMutationWithError.ts
import { useMutation, ApolloError } from '@apollo/client';
import { useState, useCallback } from 'react';

interface FieldError {
  field: string;
  message: string;
}

export function useMutationWithError(mutation: any, options?: any) {
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [mutate, { loading, data }] = useMutation(mutation, {
    ...options,
    onError: (error: ApolloError) => {
      setFieldErrors([]);
      setGlobalError(null);

      error.graphQLErrors.forEach((err) => {
        const { code, field, constraints } = err.extensions || {};

        if (code === 'VALIDATION_ERROR' && field) {
          setFieldErrors(prev => [
            ...prev,
            {
              field: field as string,
              message: err.message,
            },
          ]);
        } else {
          setGlobalError(err.message);
        }
      });

      options?.onError?.(error);
    },
    onCompleted: (data) => {
      setFieldErrors([]);
      setGlobalError(null);
      options?.onCompleted?.(data);
    },
  });

  const execute = useCallback(
    async (variables: any) => {
      setFieldErrors([]);
      setGlobalError(null);
      return mutate({ variables });
    },
    [mutate]
  );

  return {
    execute,
    loading,
    data,
    fieldErrors,
    globalError,
  };
}

// 使用示例
function CreateUserForm() {
  const { execute, loading, fieldErrors, globalError } = useMutationWithError(
    CREATE_USER
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    await execute({
      input: {
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
      },
    });
  };

  const getFieldError = (field: string) => {
    return fieldErrors.find(e => e.field === field)?.message;
  };

  return (
    <form onSubmit={handleSubmit}>
      {globalError && <div className="error">{globalError}</div>}

      <div>
        <input name="email" placeholder="Email" />
        {getFieldError('email') && (
          <span className="field-error">{getFieldError('email')}</span>
        )}
      </div>

      <div>
        <input name="password" type="password" placeholder="Password" />
        {getFieldError('password') && (
          <span className="field-error">{getFieldError('password')}</span>
        )}
      </div>

      <div>
        <input name="name" placeholder="Name" />
        {getFieldError('name') && (
          <span className="field-error">{getFieldError('name')}</span>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

---

## 10. 性能优化

### 10.1 概念解释

GraphQL 性能优化策略：

- **查询复杂度限制**: 防止深度/宽度嵌套查询
- **持久化查询**: 预注册查询，减少解析开销
- **查询批处理**: 合并多个查询
- **深度限制**: 限制查询深度
- **速率限制**: 限制请求频率

### 10.2 SDL 定义

```graphql
# schema.graphql

# 性能优化相关的 Schema
type Query {
  # 复杂度控制示例
  users(
    first: Int @constraint(max: 100)
    depth: Int @constraint(max: 5)
  ): UserConnection!

  posts(
    first: Int @constraint(max: 50)
  ): PostConnection!

  # 支持查询计划的字段
  _service: _Service!
}

type User {
  id: ID!
  name: String!
  posts(first: Int @constraint(max: 20)): [Post!]!
  friends(first: Int @constraint(max: 50)): [User!]!
}

type Post {
  id: ID!
  title: String!
  comments(first: Int @constraint(max: 100)): [Comment!]!
}

type _Service {
  sdl: String!
}

# 指令约束
directive @constraint(
  min: Int
  max: Int
  minLength: Int
  maxLength: Int
  pattern: String
  format: String
) on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION
```

### 10.3 Resolver 实现

```typescript
// plugins/complexity-plugin.ts
import { createComplexityLimitRule } from 'graphql-validation-complexity';
import type { ApolloServerPlugin } from '@apollo/server';

interface ComplexityOptions {
  maxComplexity: number;
  maxDepth: number;
  maxAliases?: number;
}

export function complexityPlugin(options: ComplexityOptions): ApolloServerPlugin {
  const complexityRule = createComplexityLimitRule(options.maxComplexity, {
    onComplete: (complexity: number) => {
      console.log(`Query complexity: ${complexity}`);
    },
  });

  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ request, document }) {
          // 计算查询复杂度
          const complexity = calculateComplexity(document, options.maxDepth);

          if (complexity > options.maxComplexity) {
            throw new GraphQLError(
              `Query too complex: ${complexity}. Maximum allowed: ${options.maxComplexity}`,
              {
                extensions: {
                  code: 'QUERY_TOO_COMPLEX',
                  complexity,
                },
              }
            );
          }
        },
      };
    },
  };
}

// 自定义复杂度计算
function calculateComplexity(document: any, maxDepth: number): number {
  let complexity = 0;
  let depth = 0;

  function traverse(node: any, currentDepth: number) {
    if (currentDepth > depth) depth = currentDepth;
    if (currentDepth > maxDepth) {
      throw new GraphQLError(`Query depth exceeds maximum of ${maxDepth}`);
    }

    // 字段复杂度权重
    const fieldWeights: Record<string, number> = {
      users: 10,
      posts: 10,
      comments: 5,
      friends: 20,
    };

    if (node.kind === 'Field') {
      complexity += fieldWeights[node.name.value] || 1;
    }

    if (node.selectionSet) {
      node.selectionSet.selections.forEach((selection: any) => {
        traverse(selection, currentDepth + 1);
      });
    }
  }

  document.definitions.forEach((definition: any) => {
    if (definition.selectionSet) {
      definition.selectionSet.selections.forEach((selection: any) => {
        traverse(selection, 1);
      });
    }
  });

  return complexity;
}
```

```typescript
// plugins/persisted-queries.ts
import type { ApolloServerPlugin } from '@apollo/server';
import { createHash } from 'crypto';

interface PersistedQueriesOptions {
  cache: Map<string, string>;
}

// 自动持久化查询 (APQ)
export function persistedQueriesPlugin(
  options: PersistedQueriesOptions
): ApolloServerPlugin {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ request, document }) {
          // 如果提供了 query，计算其 hash 并缓存
          if (request.query) {
            const hash = createHash('sha256')
              .update(request.query)
              .digest('hex');
            options.cache.set(hash, request.query);
          }
        },
        async responseForOperation({ request }) {
          // 如果只提供了 hash，从缓存获取 query
          if (request.extensions?.persistedQuery?.sha256Hash && !request.query) {
            const hash = request.extensions.persistedQuery.sha256Hash;
            const query = options.cache.get(hash);

            if (!query) {
              return {
                http: {
                  status: 200,
                },
                body: {
                  data: null,
                  errors: [
                    {
                      message: 'PersistedQueryNotFound',
                      extensions: { code: 'PERSISTED_QUERY_NOT_FOUND' },
                    },
                  ],
                },
              };
            }

            // 替换 request.query
            request.query = query;
          }
        },
      };
    },
  };
}
```

```typescript
// plugins/batch-plugin.ts
import type { ApolloServerPlugin } from '@apollo/server';
import DataLoader from 'dataloader';

// 查询批处理
export function batchRequestsPlugin(): ApolloServerPlugin {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ request, document }) {
          // 记录查询开始时间
          const startTime = Date.now();

          return {
            async willSendResponse(requestContext) {
              const duration = Date.now() - startTime;

              // 记录查询性能指标
              console.log({
                operation: requestContext.operation?.name?.value,
                duration,
                query: request.query?.slice(0, 100),
              });
            },
          };
        },
      };
    },
  };
}
```

```typescript
// middleware/rate-limit.ts
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import type { Request, Response, NextFunction } from 'express';

const redisClient = new Redis();

// 基于用户 ID 的限流
const userRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'graphql_user',
  points: 100, // 每窗口 100 次请求
  duration: 60, // 60 秒窗口
});

// 基于 IP 的限流
const ipRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'graphql_ip',
  points: 50,
  duration: 60,
});

export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.headers['x-user-id'] as string;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // 已登录用户使用用户级限流
    if (userId) {
      await userRateLimiter.consume(userId);
    } else {
      // 未登录用户使用 IP 级限流
      await ipRateLimiter.consume(clientIp);
    }

    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too Many Requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000),
    });
  }
}

// 基于查询复杂度的动态限流
export async function dynamicRateLimit(
  complexity: number,
  userId?: string
) {
  const basePoints = 1;
  const points = Math.ceil(complexity / 10) || basePoints;

  const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'graphql_complexity',
    points: 1000,
    duration: 60,
  });

  try {
    await limiter.consume(userId || 'anonymous', points);
    return true;
  } catch {
    return false;
  }
}
```

```typescript
// resolvers/optimized.ts
import type { Context } from '../context';

export const optimizedResolvers = {
  Query: {
    // 使用投影优化，只查询需要的字段
    async users(
      _: unknown,
      args: { first?: number },
      { dataSources }: Context,
      info: any
    ) {
      // 解析查询中的字段
      const requestedFields = getRequestedFields(info);

      // 只查询需要的字段
      return dataSources.userAPI.findMany({
        first: args.first,
        select: requestedFields,
      });
    },

    // 使用游标分页优化
    async posts(
      _: unknown,
      args: { first?: number; after?: string },
      { dataSources }: Context
    ) {
      return dataSources.postAPI.findWithCursor({
        first: Math.min(args.first ?? 20, 50),
        after: args.after,
      });
    },
  },

  User: {
    // 延迟加载 - 只在需要时查询
    async posts(
      parent: { id: string },
      args: { first?: number },
      { dataSources }: Context
    ) {
      // 使用 DataLoader 批量加载
      return dataSources.postLoader.byAuthorId.load(parent.id);
    },

    // 计算字段缓存
    async postCount(
      parent: { id: string },
      _: unknown,
      { dataSources }: Context
    ) {
      // 使用 Redis 缓存计算结果
      const cacheKey = `user:${parent.id}:postCount`;
      let count = await dataSources.redis.get(cacheKey);

      if (count === null) {
        count = await dataSources.postAPI.countByAuthorId(parent.id);
        await dataSources.redis.setex(cacheKey, 60, count.toString());
      }

      return parseInt(count, 10);
    },
  },
};

// 解析请求字段
function getRequestedFields(info: any): string[] {
  const fields: string[] = [];
  const selections = info.fieldNodes[0].selectionSet.selections;

  for (const selection of selections) {
    if (selection.kind === 'Field') {
      fields.push(selection.name.value);
    }
  }

  return fields;
}
```

### 10.4 客户端优化

```typescript
// client/apollo-client-optimized.ts
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  Observable,
} from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { onError } from '@apollo/client/link/error';

// 1. 查询批处理 - 合并短时间内多个查询
const batchLink = new BatchHttpLink({
  uri: 'http://localhost:4000/graphql',
  batchMax: 10, // 最多 10 个查询一批
  batchInterval: 20, // 20ms 窗口
});

// 2. 自动持久化查询 (APQ)
const persistedQueriesLink = new ApolloLink((operation, forward) => {
  // 计算查询 hash
  const query = operation.query;
  const hash = computeQueryHash(query);

  operation.extensions = {
    ...operation.extensions,
    persistedQuery: {
      version: 1,
      sha256Hash: hash,
    },
  };

  return new Observable((observer) => {
    forward(operation).subscribe({
      next: (result) => {
        // 如果返回 PersistedQueryNotFound，重发完整 query
        if (
          result.errors?.some(
            (e) => e.extensions?.code === 'PERSISTED_QUERY_NOT_FOUND'
          )
        ) {
          // 重发完整 query
          return forward(operation);
        }
        observer.next(result);
      },
      error: observer.error.bind(observer),
      complete: observer.complete.bind(observer),
    });
  });
});

// 3. 查询去重 - 相同查询同时只发一次
const dedupLink = new ApolloLink((operation, forward) => {
  const key = operation.toKey();

  if (pendingQueries.has(key)) {
    return pendingQueries.get(key)!;
  }

  const observable = forward(operation);
  pendingQueries.set(key, observable);

  return new Observable((observer) => {
    const subscription = observable.subscribe({
      next: observer.next.bind(observer),
      error: (err) => {
        pendingQueries.delete(key);
        observer.error(err);
      },
      complete: () => {
        pendingQueries.delete(key);
        observer.complete();
      },
    });

    return () => subscription.unsubscribe();
  });
});

const pendingQueries = new Map<string, Observable<any>>();

// 4. 缓存优先策略
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        posts: {
          keyArgs: ['filter'],
          merge(existing = { edges: [] }, incoming, { args }) {
            if (args?.after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            }
            return incoming;
          },
          read(existing, { args }) {
            if (!existing) return undefined;
            return existing;
          },
        },
      },
    },
  },
});

// 组合链接
const link = ApolloLink.from([
  errorLink,
  dedupLink,
  persistedQueriesLink,
  batchLink,
]);

export const optimizedClient = new ApolloClient({
  link,
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-only',
    },
    query: {
      fetchPolicy: 'cache-first',
    },
  },
});

// 计算查询 hash
function computeQueryHash(query: any): string {
  // 简化实现，实际应使用 SHA256
  return btoa(JSON.stringify(query));
}
```

```typescript
// client/hooks/useOptimizedQuery.ts
import { useQuery, useApolloClient } from '@apollo/client';
import { useCallback, useRef } from 'react';

export function useOptimizedQuery(query: any, options?: any) {
  const client = useApolloClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data, loading, error, fetchMore, refetch } = useQuery(query, {
    ...options,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
    notifyOnNetworkStatusChange: true,
  });

  // 取消之前的请求
  const cancelPrevious = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
  }, []);

  // 优化的 fetchMore
  const optimizedFetchMore = useCallback(
    async (variables: any) => {
      cancelPrevious();

      return fetchMore({
        variables,
        context: {
          fetchOptions: {
            signal: abortControllerRef.current?.signal,
          },
        },
      });
    },
    [fetchMore, cancelPrevious]
  );

  // 预加载数据
  const preload = useCallback(
    async (preloadVariables: any) => {
      // 先检查缓存
      const cached = client.readQuery({
        query,
        variables: preloadVariables,
      });

      if (cached) return cached;

      // 缓存未命中，后台获取
      return client.query({
        query,
        variables: preloadVariables,
        fetchPolicy: 'cache-first',
      });
    },
    [client, query]
  );

  return {
    data,
    loading,
    error,
    fetchMore: optimizedFetchMore,
    refetch,
    preload,
  };
}
```

```typescript
// client/components/VirtualizedList.tsx
import { useEffect, useRef, useState } from 'react';
import { useOptimizedQuery } from '../hooks/useOptimizedQuery';
import { GET_POSTS } from '../queries/posts';

function VirtualizedPostList() {
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, loading, fetchMore } = useOptimizedQuery(GET_POSTS, {
    variables: { first: 20 },
  });

  // 无限滚动
  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const endCursor = data?.posts?.pageInfo?.endCursor;
          if (endCursor) {
            fetchMore({ first: 20, after: endCursor });
          } else {
            setHasMore(false);
          }
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [data, loading, fetchMore, hasMore]);

  // 预加载下一页
  useEffect(() => {
    if (data?.posts?.pageInfo?.hasNextPage) {
      const endCursor = data.posts.pageInfo.endCursor;
      // 提前加载下一页到缓存
      fetchMore({ first: 20, after: endCursor });
    }
  }, [data]);

  const posts = data?.posts?.edges || [];

  return (
    <div className="post-list">
      {posts.map(({ node }: any, index: number) => (
        <PostItem
          key={node.id}
          post={node}
          // 只渲染可视区域附近的内容
          style={{
            contentVisibility: index > 50 ? 'auto' : undefined,
          }}
        />
      ))}

      {loading && <div>Loading...</div>}

      <div ref={loadMoreRef} style={{ height: 20 }} />
    </div>
  );
}

function PostItem({ post, style }: { post: any; style?: any }) {
  return (
    <div className="post-item" style={style}>
      <h3>{post.title}</h3>
      <p>{post.content?.slice(0, 200)}...</p>
    </div>
  );
}
```

---

## 附录

### A. 完整项目结构

```
graphql-project/
├── src/
│   ├── server.ts                 # 服务器入口
│   ├── schema.graphql            # Schema 定义
│   ├── context.ts                # Context 创建
│   ├── types/
│   │   ├── context.ts            # Context 类型
│   │   ├── models.ts             # 数据模型类型
│   │   └── generated.ts          # 生成的类型
│   ├── resolvers/
│   │   ├── index.ts              # Resolver 合并
│   │   ├── scalars.ts            # Scalar 类型
│   │   ├── user.ts               # 用户 Resolver
│   │   ├── post.ts               # 文章 Resolver
│   │   ├── auth.ts               # 认证 Resolver
│   │   ├── upload.ts             # 上传 Resolver
│   │   └── subscriptions.ts      # 订阅 Resolver
│   ├── dataloaders/
│   │   ├── userLoader.ts         # 用户 DataLoader
│   │   ├── postLoader.ts         # 文章 DataLoader
│   │   └── commentLoader.ts      # 评论 DataLoader
│   ├── auth/
│   │   ├── jwt.ts                # JWT 工具
│   │   ├── directives.ts         # 认证指令
│   │   └── permissions.ts        # 权限检查
│   ├── errors/
│   │   ├── codes.ts              # 错误码
│   │   └── custom-errors.ts      # 自定义错误
│   ├── middleware/
│   │   ├── error-handler.ts      # 错误处理
│   │   └── rate-limit.ts         # 限流
│   ├── plugins/
│   │   ├── complexity-plugin.ts  # 复杂度插件
│   │   ├── persisted-queries.ts  # 持久化查询
│   │   └── batch-plugin.ts       # 批处理插件
│   ├── repositories/
│   │   ├── userRepository.ts     # 用户数据访问
│   │   └── postRepository.ts     # 文章数据访问
│   └── utils/
│       ├── file-storage.ts       # 文件存储
│       └── validators.ts         # 验证工具
├── client/
│   ├── src/
│   │   ├── apollo-client.ts      # Apollo Client 配置
│   │   ├── queries/
│   │   │   ├── user.ts           # 用户查询
│   │   │   ├── post.ts           # 文章查询
│   │   │   └── auth.ts           # 认证查询
│   │   ├── mutations/
│   │   │   ├── user.ts           # 用户变更
│   │   │   └── post.ts           # 文章变更
│   │   ├── subscriptions/
│   │   │   └── posts.ts          # 文章订阅
│   │   ├── components/
│   │   │   ├── UserList.tsx      # 用户列表
│   │   │   ├── PostList.tsx      # 文章列表
│   │   │   └── LoginForm.tsx     # 登录表单
│   │   └── hooks/
│   │       └── useOptimizedQuery.ts
│   └── package.json
├── codegen.ts                    # GraphQL Codegen 配置
├── tsconfig.json
└── package.json
```

### B. 推荐依赖

```json
{
  "dependencies": {
    "@apollo/server": "^4.x",
    "@apollo/subgraph": "^2.x",
    "@apollo/gateway": "^2.x",
    "graphql": "^16.x",
    "graphql-upload-minimal": "^1.x",
    "dataloader": "^2.x",
    "graphql-subscriptions": "^2.x",
    "graphql-ws": "^5.x",
    "ws": "^8.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "graphql-scalars": "^1.x",
    "graphql-upload": "^16.x"
  },
  "devDependencies": {
    "@graphql-codegen/cli": "^5.x",
    "@graphql-codegen/typescript": "^4.x",
    "@graphql-codegen/typescript-resolvers": "^4.x",
    "@types/node": "^20.x",
    "typescript": "^5.x"
  }
}
```

### C. Codegen 配置

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/schema.graphql',
  generates: {
    './src/types/generated.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: './context#Context',
        mappers: {
          User: './models#User',
          Post: './models#Post',
        },
        scalars: {
          DateTime: 'Date',
          EmailAddress: 'string',
          Upload: 'Promise<FileUpload>',
        },
      },
    },
  },
};

export default config;
```

---

> **文档结束**
>
> 本文档涵盖了 GraphQL 从基础到高级的全部内容，建议结合实际项目进行练习。
