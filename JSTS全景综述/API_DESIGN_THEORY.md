# API 设计理论全景综述

> 深入解析现代 API 架构的形式化定义、设计原则与实践模式

---

## 目录

- [API 设计理论全景综述](#api-设计理论全景综述)
  - [目录](#目录)
  - [1. RESTful API 的 Richardson 成熟度模型](#1-restful-api-的-richardson-成熟度模型)
    - [1.1 形式化定义](#11-形式化定义)
    - [1.2 设计原则](#12-设计原则)
    - [1.3 代码示例](#13-代码示例)
      - [Level 0: The Swamp of POX](#level-0-the-swamp-of-pox)
      - [Level 1: Resources](#level-1-resources)
      - [Level 2: HTTP Verbs](#level-2-http-verbs)
      - [Level 3: HATEOAS](#level-3-hateoas)
    - [1.4 优缺点分析](#14-优缺点分析)
  - [2. GraphQL 的类型系统形式化](#2-graphql-的类型系统形式化)
    - [2.1 形式化定义](#21-形式化定义)
    - [2.2 设计原则](#22-设计原则)
    - [2.3 代码示例](#23-代码示例)
      - [Schema Definition](#schema-definition)
      - [Resolver 实现 (Node.js)](#resolver-实现-nodejs)
      - [客户端查询示例](#客户端查询示例)
    - [2.4 优缺点分析](#24-优缺点分析)
  - [3. tRPC 的端到端类型安全模型](#3-trpc-的端到端类型安全模型)
    - [3.1 形式化定义](#31-形式化定义)
    - [3.2 设计原则](#32-设计原则)
    - [3.3 代码示例](#33-代码示例)
      - [服务端实现](#服务端实现)
      - [客户端实现](#客户端实现)
    - [3.4 优缺点分析](#34-优缺点分析)
  - [4. gRPC 的 Protocol Buffers 和流式通信](#4-grpc-的-protocol-buffers-和流式通信)
    - [4.1 形式化定义](#41-形式化定义)
    - [4.2 设计原则](#42-设计原则)
    - [4.3 代码示例](#43-代码示例)
      - [Protocol Buffers 定义](#protocol-buffers-定义)
      - [服务端实现 (Node.js)](#服务端实现-nodejs)
      - [客户端实现](#客户端实现-1)
    - [4.4 优缺点分析](#44-优缺点分析)
  - [5. WebSocket 的实时通信模型](#5-websocket-的实时通信模型)
    - [5.1 形式化定义](#51-形式化定义)
    - [5.2 设计原则](#52-设计原则)
    - [5.3 代码示例](#53-代码示例)
      - [服务端实现 (Node.js + ws)](#服务端实现-nodejs--ws)
      - [客户端实现](#客户端实现-2)
    - [5.4 优缺点分析](#54-优缺点分析)
  - [6. Webhook 的异步事件模型](#6-webhook-的异步事件模型)
    - [6.1 形式化定义](#61-形式化定义)
    - [6.2 设计原则](#62-设计原则)
    - [6.3 代码示例](#63-代码示例)
      - [Webhook 服务实现](#webhook-服务实现)
      - [Webhook 消费者实现](#webhook-消费者实现)
    - [6.4 优缺点分析](#64-优缺点分析)
  - [7. API 版本化策略](#7-api-版本化策略)
    - [7.1 形式化定义](#71-形式化定义)
    - [7.2 设计原则](#72-设计原则)
    - [7.3 代码示例](#73-代码示例)
      - [策略 1: URL Path 版本化](#策略-1-url-path-版本化)
      - [策略 2: Header 版本化](#策略-2-header-版本化)
      - [策略 3: Media Type 版本化](#策略-3-media-type-版本化)
      - [策略 4: 统一的版本管理器](#策略-4-统一的版本管理器)
    - [7.4 优缺点分析](#74-优缺点分析)
  - [8. 速率限制的形式化](#8-速率限制的形式化)
    - [8.1 形式化定义](#81-形式化定义)
    - [8.2 设计原则](#82-设计原则)
    - [8.3 代码示例](#83-代码示例)
      - [Token Bucket 实现](#token-bucket-实现)
      - [Sliding Window 实现](#sliding-window-实现)
      - [Express 中间件集成](#express-中间件集成)
    - [8.4 优缺点分析](#84-优缺点分析)
  - [9. API 文档的形式化](#9-api-文档的形式化)
    - [9.1 形式化定义](#91-形式化定义)
    - [9.2 设计原则](#92-设计原则)
    - [9.3 代码示例](#93-代码示例)
      - [OpenAPI 3.1 规范](#openapi-31-规范)
      - [从 TypeScript 类型生成 OpenAPI](#从-typescript-类型生成-openapi)
      - [Swagger UI 集成](#swagger-ui-集成)
    - [9.4 优缺点分析](#94-优缺点分析)
  - [10. HATEOAS 的超媒体驱动模型](#10-hateoas-的超媒体驱动模型)
    - [10.1 形式化定义](#101-形式化定义)
    - [10.2 设计原则](#102-设计原则)
    - [10.3 代码示例](#103-代码示例)
      - [HAL (Hypertext Application Language)](#hal-hypertext-application-language)
      - [JSON:API 实现](#jsonapi-实现)
      - [Siren 超媒体格式](#siren-超媒体格式)
    - [10.4 优缺点分析](#104-优缺点分析)
  - [附录：技术选型决策树](#附录技术选型决策树)

---

## 1. RESTful API 的 Richardson 成熟度模型

### 1.1 形式化定义

Richardson 成熟度模型（RMM）由 Leonard Richardson 提出，用于评估 API 与 REST 架构风格的符合程度。模型将成熟度分为四个层级：

```
RMM = {Level 0, Level 1, Level 2, Level 3}

其中每个层级满足：
Level(n) ⊂ Level(n+1)  (层级包含关系)
```

**层级结构：**

```
Level 3 (HATEOAS)
    ↑
Level 2 (HTTP Verbs)
    ↑
Level 1 (Resources)
    ↑
Level 0 (The Swamp of POX - Plain Old XML)
```

### 1.2 设计原则

| 层级 | 核心原则 | 关键特征 |
|------|----------|----------|
| Level 0 | 单一端点 | 所有操作通过 POST 发送到统一 URL |
| Level 1 | 资源识别 | 使用不同 URL 标识不同资源 |
| Level 2 | HTTP 动词 | 使用 GET/POST/PUT/DELETE 表达操作语义 |
| Level 3 | 超媒体驱动 | 响应中包含相关资源的链接（HATEOAS） |

### 1.3 代码示例

#### Level 0: The Swamp of POX

```http
POST /api HTTP/1.1
Content-Type: application/json

{
  "action": "getUser",
  "userId": 123
}
```

#### Level 1: Resources

```http
POST /users/123/get HTTP/1.1
POST /users/123/delete HTTP/1.1
```

#### Level 2: HTTP Verbs

```http
GET    /users/123          # 获取用户
POST   /users              # 创建用户
PUT    /users/123          # 更新用户
DELETE /users/123          # 删除用户
PATCH  /users/123          # 部分更新

# 响应状态码
200 OK                    # 成功
201 Created               # 创建成功
204 No Content            # 删除成功
400 Bad Request           # 请求错误
404 Not Found             # 资源不存在
409 Conflict              # 资源冲突
```

#### Level 3: HATEOAS

```json
{
  "id": 123,
  "name": "张三",
  "email": "zhangsan@example.com",
  "_links": {
    "self": { "href": "/users/123" },
    "orders": { "href": "/users/123/orders" },
    "edit": { "href": "/users/123", "method": "PUT" },
    "delete": { "href": "/users/123", "method": "DELETE" }
  }
}
```

### 1.4 优缺点分析

**优点：**

- ✅ 渐进式采用，降低迁移成本
- ✅ 清晰的评估标准，便于架构评审
- ✅ 促进无状态、可缓存的设计
- ✅ Level 3 实现自发现 API，降低客户端耦合

**缺点：**

- ❌ 达到 Level 3 需要额外的开发成本
- ❌ HATEOAS 在移动场景下增加 payload 大小
- ❌ 某些业务场景难以映射到 CRUD 操作

---

## 2. GraphQL 的类型系统形式化

### 2.1 形式化定义

GraphQL 类型系统是一个基于模式的强类型系统，可形式化定义为：

```
Schema = (Types, Queries, Mutations, Subscriptions)

Types = Scalar ∪ Object ∪ Interface ∪ Union ∪ Enum ∪ InputObject

TypeGraph = (V, E, root) 其中:
  V = 所有类型的集合
  E = {(t1, t2) | t1 包含类型为 t2 的字段}
  root = Query 类型（入口点）
```

**类型层次结构：**

```
GraphQL Type System
├── Scalars (Int, Float, String, Boolean, ID, Custom)
├── Object Types (User, Post, Comment)
├── Interfaces (Node, Entity)
├── Unions (SearchResult = User | Post | Comment)
├── Enums (Status, Role)
├── Input Objects (CreateUserInput)
└── Lists & Non-Null wrappers
```

### 2.2 设计原则

1. **精确数据获取**：客户端指定所需字段，避免过度获取
2. **强类型保证**：Schema 即契约，编译时类型检查
3. **单一端点**：所有操作通过 `/graphql` 端点
4. **内省能力**：Schema 可自我描述，支持自动生成文档

### 2.3 代码示例

#### Schema Definition

```graphql
# Schema 定义
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

# 接口定义
interface Node {
  id: ID!
}

# 标量定义
scalar DateTime

# 枚举定义
enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

# 对象类型
 type User implements Node {
  id: ID!
  name: String!
  email: String!
  status: UserStatus!
  posts(page: PaginationInput): PostConnection!
  createdAt: DateTime!
}

type Post implements Node {
  id: ID!
  title: String!
  content: String!
  author: User!
  tags: [String!]!
}

# 联合类型
union SearchResult = User | Post

# 输入类型
input PaginationInput {
  first: Int = 10
  after: String
}

input CreateUserInput {
  name: String!
  email: String!
}

# 连接类型（分页）
type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}

# Query 定义
type Query {
  user(id: ID!): User
  users(filter: UserFilter, page: PaginationInput): UserConnection!
  search(query: String!): [SearchResult!]!
  node(id: ID!): Node
}

# Mutation 定义
type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!
}

# Subscription 定义
type Subscription {
  userUpdated(id: ID!): User!
  newPost: Post!
}
```

#### Resolver 实现 (Node.js)

```typescript
// resolvers.ts
import { GraphQLResolveInfo } from 'graphql';

interface Context {
  userService: UserService;
  postService: PostService;
  loaders: DataLoaders;
}

export const resolvers = {
  // 标量解析器
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    serialize: (value: Date) => value.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast) => new Date((ast as StringValueNode).value),
  }),

  // 联合类型解析器
  SearchResult: {
    __resolveType(obj: any) {
      if (obj.email) return 'User';
      if (obj.title) return 'Post';
      return null;
    },
  },

  // Node 接口解析器
  Node: {
    __resolveType(obj: any) {
      if (obj.email) return 'User';
      if (obj.title) return 'Post';
      return null;
    },
  },

  Query: {
    async user(
      _: unknown,
      { id }: { id: string },
      { userService }: Context,
      info: GraphQLResolveInfo
    ) {
      // 字段级选择性查询
      const fields = getRequestedFields(info);
      return userService.findById(id, { select: fields });
    },

    async users(
      _: unknown,
      { filter, page }: { filter?: UserFilter; page?: PaginationInput },
      { userService }: Context
    ) {
      return userService.findMany({
        filter,
        take: page?.first ?? 10,
        cursor: page?.after ? { id: page.after } : undefined,
      });
    },

    async node(
      _: unknown,
      { id }: { id: string },
      { loaders }: Context
    ) {
      // 使用 DataLoader 进行批量加载
      return loaders.nodeLoader.load(id);
    },
  },

  User: {
    // 字段级解析器 - 延迟加载
    async posts(
      parent: User,
      { page }: { page?: PaginationInput },
      { postService }: Context
    ) {
      return postService.findByAuthor(parent.id, page);
    },
  },

  Mutation: {
    async createUser(
      _: unknown,
      { input }: { input: CreateUserInput },
      { userService }: Context
    ) {
      const user = await userService.create(input);
      return {
        user,
        clientMutationId: input.clientMutationId,
      };
    },
  },

  Subscription: {
    userUpdated: {
      subscribe: (
        _: unknown,
        { id }: { id: string },
        { pubsub }: Context
      ) => pubsub.asyncIterator(`USER_UPDATED.${id}`),
    },
  },
};
```

#### 客户端查询示例

```graphql
# 精确获取所需数据
query GetUserWithPosts($id: ID!, $page: PaginationInput) {
  user(id: $id) {
    id
    name
    email
    posts(page: $page) {
      edges {
        node {
          title
          content
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}

# 变量
{
  "id": "user-123",
  "page": {
    "first": 5,
    "after": "cursor-abc"
  }
}
```

### 2.4 优缺点分析

**优点：**

- ✅ 精确数据获取，减少网络传输
- ✅ 强类型系统，编译时错误检测
- ✅ 内省能力，自动生成文档和类型
- ✅ 单一端点简化 API 管理
- ✅ 高效的批量查询（DataLoader 模式）

**缺点：**

- ❌ 缓存策略复杂（需要 Apollo Server/Client）
- ❌ 文件上传需要额外处理
- ❌ 简单 CRUD 场景可能过度设计
- ❌ N+1 查询问题需要 DataLoader 解决
- ❌ 学习曲线较陡峭

---

## 3. tRPC 的端到端类型安全模型

### 3.1 形式化定义

tRPC 实现了一个端到端类型安全 RPC 系统，可形式化定义为：

```
tRPC System = (Router, Procedures, Context, Middlewares)

Procedure = Query ∪ Mutation ∪ Subscription

Type Safety Property:
∀p ∈ Procedures, ∀input ∈ p.input, ∀output ∈ p.output:
  ServerType(input) = ClientType(input) ∧
  ServerType(output) = ClientType(output)

即：服务端和客户端共享同一类型定义
```

**架构图：**

```
┌─────────────────────────────────────────────────────────┐
│                    Type-Safe Boundary                    │
├─────────────────────────────────────────────────────────┤
│  Client                  │  Server                      │
│  ┌──────────────────┐    │  ┌──────────────────┐       │
│  │ TypeScript React │◄───┼──┤ tRPC Router      │       │
│  │ - useQuery()     │    │  ├─ Procedures     │       │
│  │ - useMutation()  │    │  ├─ Middlewares    │       │
│  │ - Infer types    │    │  └─ Context        │       │
│  └──────────────────┘    │                              │
│           ▲              │  ┌──────────────────┐       │
│           │  HTTP/WS     │  │ Zod Validator    │       │
│           │              │  │ Runtime Type     │       │
│           └──────────────┼──┤ Check            │       │
│                          │  └──────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### 3.2 设计原则

1. **类型即契约**：共享类型定义，零代码生成
2. **渐进式采用**：可逐步迁移现有 API
3. **运行时验证**：Zod/Superstruct 进行输入验证
4. **中间件链**：可组合的认证、日志、错误处理

### 3.3 代码示例

#### 服务端实现

```typescript
// server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { createContext } from './context';
import { z } from 'zod';

// 初始化 tRPC
const t = initTRPC.context<typeof createContext>().create();

// 导出构建块
export const router = t.router;
export const publicProcedure = t.procedure;

// 认证中间件
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // 类型收窄
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

// 定义输入验证 Schema
const userCreateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).optional(),
});

const userUpdateSchema = userCreateSchema.partial().extend({
  id: z.string().uuid(),
});

const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
});

// 导出类型（供客户端使用）
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
```

```typescript
// server/routers/user.ts
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  // 查询 - 公开
  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User with id ${input.id} not found`,
        });
      }

      return user;
    }),

  // 列表查询 - 支持游标分页
  list: publicProcedure
    .input(paginationSchema)
    .query(async ({ input, ctx }) => {
      const users = await ctx.prisma.user.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: typeof input.cursor = undefined;
      if (users.length > input.limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      return {
        users,
        nextCursor,
      };
    }),

  // 创建 - 需要认证
  create: protectedProcedure
    .input(userCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.create({
        data: input,
      });

      // 触发实时更新
      ctx.ee.emit('user:created', user);

      return user;
    }),

  // 更新 - 需要认证且只能更新自己的数据
  update: protectedProcedure
    .input(userUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;

      // 权限检查
      const existing = await ctx.prisma.user.findUnique({ where: { id } });
      if (existing?.id !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.user.update({
        where: { id },
        data,
      });
    }),

  // 订阅 - 实时更新
  onCreate: publicProcedure
    .subscription(async function* ({ ctx, signal }) {
      for await (const user of ctx.ee.toAsyncIterable('user:created', signal)) {
        yield user;
      }
    }),
});
```

```typescript
// server/routers/_app.ts - 根路由
import { router } from '../trpc';
import { userRouter } from './user';
import { postRouter } from './post';

export const appRouter = router({
  user: userRouter,
  post: postRouter,
});

// 导出类型供客户端使用
export type AppRouter = typeof appRouter;
```

#### 客户端实现

```typescript
// utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/routers/_app';

// 创建类型安全的客户端
export const trpc = createTRPCReact<AppRouter>();

// 客户端配置
export const trpcClient = trpc.createClient({
  links: [
    // 批量请求优化
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: wsLink({
        client: createWSClient({
          url: 'ws://localhost:3000',
        }),
      }),
      false: httpBatchLink({
        url: '/api/trpc',
        // 请求头配置
        headers: () => ({
          Authorization: getAuthToken(),
        }),
      }),
    }),
  ],
});
```

```typescript
// components/UserList.tsx
import { trpc } from '../utils/trpc';

export function UserList() {
  // 完全类型安全 - 从服务端推断
  const { data, fetchNextPage, hasNextPage } = trpc.user.list.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const createUser = trpc.user.create.useMutation({
    onSuccess: () => {
      // 自动类型推断
      utils.user.list.invalidate();
    },
  });

  // 订阅实时更新
  trpc.user.onCreate.useSubscription(undefined, {
    onData: (user) => {
      console.log('New user:', user); // 完全类型安全
    },
  });

  return (
    <div>
      {data?.pages.map((page) =>
        page.users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))
      )}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          加载更多
        </button>
      )}

      <button
        onClick={() =>
          createUser.mutate({
            name: '新用户',
            email: 'user@example.com',
            // TypeScript 会检查所有必需字段
          })
        }
      >
        创建用户
      </button>
    </div>
  );
}
```

### 3.4 优缺点分析

**优点：**

- ✅ 端到端类型安全，重构安全
- ✅ 零代码生成，开发体验流畅
- ✅ 自动请求批处理和缓存
- ✅ 中间件系统灵活强大
- ✅ 与 React Query 深度集成

**缺点：**

- ❌ 仅限 TypeScript 生态
- ❌ 需要前后端同构架构
- ❌ 不适用于多语言环境
- ❌ 生态相对年轻，工具链有限

---

## 4. gRPC 的 Protocol Buffers 和流式通信

### 4.1 形式化定义

```
gRPC System = (Service, Methods, Channels, Stub)

Service = {Method₁, Method₂, ..., Methodₙ}

Method = UnaryMethod ∪ ServerStream ∪ ClientStream ∪ BidirectionalStream

Message = ProtobufMessage

通信协议：
- 传输层：HTTP/2
- 序列化：Protocol Buffers（二进制）
- 流控：基于 HTTP/2 的流量控制
```

**架构图：**

```
┌────────────────────────────────────────────────────────────┐
│                      gRPC Architecture                      │
├────────────────────────────────────────────────────────────┤
│  Client Side                    Server Side                │
│  ┌──────────────┐               ┌──────────────┐          │
│  │ Application  │               │ Application  │          │
│  └──────┬───────┘               └──────▲───────┘          │
│         │                              │                  │
│  ┌──────▼───────┐               ┌──────┴───────┐          │
│  │ gRPC Stub    │◄─────────────►│ gRPC Service │          │
│  │ - .proto     │  HTTP/2       │ - .proto     │          │
│  │ - generated  │               │ - generated  │          │
│  └──────┬───────┘               └──────┬───────┘          │
│         │                              │                  │
│  ┌──────▼───────┐               ┌──────┴───────┐          │
│  │ Protobuf     │               │ Protobuf     │          │
│  │ Marshal      │               │ Unmarshal    │          │
│  └──────┬───────┘               └──────┬───────┘          │
│         │                              │                  │
│  ┌──────▼───────┐               ┌──────┴───────┐          │
│  │ HTTP/2       │◄═════════════►│ HTTP/2       │          │
│  │ Multiplex    │   Streams     │ Multiplex    │          │
│  └──────────────┘               └──────────────┘          │
└────────────────────────────────────────────────────────────┘
```

### 4.2 设计原则

1. **契约优先**：使用 `.proto` 文件定义服务契约
2. **高性能**：二进制序列化 + HTTP/2 多路复用
3. **多语言支持**：生成多种语言的客户端/服务端代码
4. **流式支持**：支持四种通信模式

### 4.3 代码示例

#### Protocol Buffers 定义

```protobuf
// api/user_service.proto
syntax = "proto3";

package api;

import "google/protobuf/timestamp.proto";
import "google/protobuf/empty.proto";

option go_package = "github.com/example/api";
option java_package = "com.example.api";

// 用户服务
service UserService {
  // 一元调用
  rpc GetUser(GetUserRequest) returns (User);

  // 服务端流式
  rpc ListUsers(ListUsersRequest) returns (stream User);

  // 客户端流式
  rpc CreateUsers(stream CreateUserRequest) returns (BatchCreateResponse);

  // 双向流式
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);

  // 双向流式 - 实时同步
  rpc Sync(stream SyncRequest) returns (stream SyncResponse);
}

// 消息定义
message User {
  string id = 1;
  string name = 2;
  string email = 3;
  int32 age = 4;
  UserStatus status = 5;
  google.protobuf.Timestamp created_at = 6;
  repeated string tags = 7;

  // 嵌套消息
  Address address = 8;
}

message Address {
  string street = 1;
  string city = 2;
  string country = 3;
  string zip_code = 4;
}

enum UserStatus {
  UNKNOWN = 0;
  ACTIVE = 1;
  INACTIVE = 2;
  SUSPENDED = 3;
}

message GetUserRequest {
  string id = 1;
}

message ListUsersRequest {
  int32 page_size = 1;
  string page_token = 2;
  string filter = 3;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
  int32 age = 3;
}

message BatchCreateResponse {
  int32 created_count = 1;
  repeated string created_ids = 2;
}

message ChatMessage {
  string user_id = 1;
  string content = 2;
  google.protobuf.Timestamp timestamp = 3;
}

message SyncRequest {
  oneof action {
    CreateAction create = 1;
    UpdateAction update = 2;
    DeleteAction delete = 3;
  }
  int64 client_timestamp = 4;
}

message CreateAction {
  User user = 1;
}

message UpdateAction {
  string id = 1;
  map<string, string> fields = 2;
}

message DeleteAction {
  string id = 1;
}

message SyncResponse {
  repeated User changes = 1;
  int64 server_timestamp = 2;
}
```

#### 服务端实现 (Node.js)

```typescript
// server/user_service.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { IUserServiceServer } from './generated/user_service';

// 加载 proto 文件
const packageDefinition = protoLoader.loadSync(
  './api/user_service.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const userService = protoDescriptor.api.UserService as grpc.ServiceDefinition;

// 实现服务
const userServiceImpl: IUserServiceServer = {
  // 一元调用
  getUser: (call, callback) => {
    const { id } = call.request;

    // 数据库查询
    const user = userRepository.findById(id);

    if (!user) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: `User ${id} not found`,
      });
      return;
    }

    callback(null, user);
  },

  // 服务端流式
  listUsers: (call) => {
    const { page_size, page_token, filter } = call.request;

    // 获取用户流
    const userStream = userRepository.streamAll({
      limit: page_size,
      cursor: page_token,
      filter,
    });

    userStream.on('data', (user) => {
      call.write(user);
    });

    userStream.on('end', () => {
      call.end();
    });

    userStream.on('error', (err) => {
      call.destroy(err);
    });
  },

  // 客户端流式
  createUsers: (call, callback) => {
    const createdIds: string[] = [];

    call.on('data', async (request: CreateUserRequest) => {
      const id = await userRepository.create(request);
      createdIds.push(id);
    });

    call.on('end', () => {
      callback(null, {
        created_count: createdIds.length,
        created_ids: createdIds,
      });
    });

    call.on('error', (err) => {
      callback(err);
    });
  },

  // 双向流式 - 聊天
  chat: (call) => {
    const clientId = call.metadata.get('client-id')[0];

    // 处理收到的消息
    call.on('data', (message: ChatMessage) => {
      // 广播给其他客户端
      broadcastToAllExcept(clientId as string, message);
    });

    // 处理客户端断开
    call.on('end', () => {
      removeClient(clientId as string);
    });

    // 注册到广播列表
    registerClient(clientId as string, (msg) => {
      call.write(msg);
    });
  },

  // 双向流式 - 实时同步
  sync: (call) => {
    let clientTimestamp = 0;

    // 处理客户端发来的变更
    call.on('data', async (request: SyncRequest) => {
      const action = request.action;

      switch (action) {
        case 'create':
          await handleCreate(request.create!.user!);
          break;
        case 'update':
          await handleUpdate(request.update!.id, request.update!.fields);
          break;
        case 'delete':
          await handleDelete(request.delete!.id);
          break;
      }

      clientTimestamp = request.client_timestamp;
    });

    // 推送服务端变更
    const unsubscribe = userRepository.watchChanges((change) => {
      call.write({
        changes: [change],
        server_timestamp: Date.now(),
      });
    });

    call.on('cancelled', () => {
      unsubscribe();
    });
  },
};

// 启动服务
const server = new grpc.Server();
server.addService(userService, userServiceImpl);
server.bindAsync(
  '0.0.0.0:50051',
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`gRPC server running on port ${port}`);
  }
);
```

#### 客户端实现

```typescript
// client/grpc_client.ts
import * as grpc from '@grpc/grpc-js';
import { UserServiceClient } from './generated/user_service';

const client = new UserServiceClient(
  'localhost:50051',
  grpc.credentials.createInsecure(),
  {
    'grpc.keepalive_time_ms': 10000,
    'grpc.keepalive_timeout_ms': 5000,
  }
);

// 一元调用
async function getUser(id: string): Promise<User> {
  return new Promise((resolve, reject) => {
    client.getUser({ id }, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
}

// 服务端流式
async function* listUsers() {
  const stream = client.listUsers({ page_size: 100 });

  for await (const user of stream) {
    yield user;
  }
}

// 客户端流式
async function createUsers(users: CreateUserRequest[]) {
  const stream = client.createUsers((err, response) => {
    if (err) console.error(err);
    else console.log(`Created ${response.created_count} users`);
  });

  for (const user of users) {
    stream.write(user);
  }

  stream.end();
}

// 双向流式 - 实时同步
async function startSync() {
  const stream = client.sync();

  // 接收服务端变更
  stream.on('data', (response: SyncResponse) => {
    for (const change of response.changes) {
      applyChange(change);
    }
  });

  // 发送本地变更
  async function sendChange(action: SyncRequest) {
    stream.write(action);
  }

  return { sendChange };
}
```

### 4.4 优缺点分析

**优点：**

- ✅ 高性能二进制序列化
- ✅ HTTP/2 多路复用，低延迟
- ✅ 强类型契约，多语言支持
- ✅ 四种流式通信模式
- ✅ 内置负载均衡、健康检查、拦截器

**缺点：**

- ❌ 浏览器支持需要 gRPC-Web 代理
- ❌ 二进制格式不利于调试
- ❌ 学习曲线较陡峭
- ❌ 与 REST 相比工具链成熟度较低

---

## 5. WebSocket 的实时通信模型

### 5.1 形式化定义

```
WebSocket Protocol = (Handshake, Framing, Data Transfer)

Handshake: HTTP/1.1 Upgrade 请求 → 101 Switching Protocols

Frame Structure:
  FIN | RSV | Opcode | MASK | Payload Length | Masking Key | Payload

Connection State:
  CONNECTING → OPEN → CLOSING → CLOSED

Message Types:
  - Text Frame (0x1)
  - Binary Frame (0x2)
  - Close Frame (0x8)
  - Ping/Pong Frame (0x9/0xA)
```

**架构图：**

```
┌─────────────────────────────────────────────────────────────┐
│                    WebSocket Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Client                      Server                          │
│  ┌─────────────┐             ┌─────────────┐                │
│  │   Browser   │             │   Server    │                │
│  │   /Client   │             │   (Node.js) │                │
│  └──────┬──────┘             └──────┬──────┘                │
│         │                           │                       │
│  ┌──────▼──────┐             ┌──────▼──────┐                │
│  │ WebSocket   │◄═══════════►│ WebSocket   │                │
│  │ Connection  │  Full-Duplex│ Connection  │                │
│  │ (wss://)    │  Persistent │ Manager     │                │
│  └──────┬──────┘             └──────┬──────┘                │
│         │                           │                       │
│  ┌──────▼──────┐             ┌──────▼──────┐                │
│  │ Connection  │             │ Connection  │                │
│  │ Manager     │             │ Handler     │                │
│  │ - reconnect │             │ - rooms     │                │
│  │ - heartbeat │             │ - broadcast │                │
│  └─────────────┘             └──────┬──────┘                │
│                                     │                        │
│                              ┌──────▼──────┐                │
│                              │ Pub/Sub     │                │
│                              │ (Redis)     │                │
│                              └─────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 设计原则

1. **全双工通信**：双向同时数据传输
2. **持久连接**：长连接避免频繁握手开销
3. **轻量级帧**：最小头部开销（2-14 字节）
4. **心跳机制**：Ping/Pong 帧保持连接活性

### 5.3 代码示例

#### 服务端实现 (Node.js + ws)

```typescript
// server/websocket.ts
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';

// 定义消息协议
interface BaseMessage {
  type: string;
  timestamp: number;
  id: string;
}

interface ChatMessage extends BaseMessage {
  type: 'chat';
  roomId: string;
  userId: string;
  content: string;
}

interface PresenceMessage extends BaseMessage {
  type: 'presence';
  userId: string;
  status: 'online' | 'away' | 'offline';
}

interface SystemMessage extends BaseMessage {
  type: 'system';
  event: string;
  data: unknown;
}

type Message = ChatMessage | PresenceMessage | SystemMessage;

// 扩展 WebSocket 类型
interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  rooms?: Set<string>;
  isAlive?: boolean;
}

// 创建服务器
const server = createServer();
const wss = new WebSocketServer({ server, path: '/ws' });

// 房间管理
const roomManager = new Map<string, Set<ExtendedWebSocket>>();

// 用户连接映射
const userConnections = new Map<string, ExtendedWebSocket>();

wss.on('connection', (ws: ExtendedWebSocket, req) => {
  // 解析 URL 参数
  const { query } = parse(req.url!, true);
  const token = query.token as string;

  // 验证 token
  const user = verifyToken(token);
  if (!user) {
    ws.close(1008, 'Invalid token');
    return;
  }

  ws.userId = user.id;
  ws.rooms = new Set();
  ws.isAlive = true;
  userConnections.set(user.id, ws);

  // 心跳检测
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // 消息处理
  ws.on('message', async (data: Buffer) => {
    try {
      const message: Message = JSON.parse(data.toString());
      await handleMessage(ws, message);
    } catch (err) {
      sendError(ws, 'Invalid message format');
    }
  });

  // 断开连接
  ws.on('close', () => {
    cleanupConnection(ws);
  });

  // 发送欢迎消息
  sendMessage(ws, {
    type: 'system',
    event: 'connected',
    timestamp: Date.now(),
    id: generateId(),
    data: { userId: user.id },
  });
});

// 消息处理器
async function handleMessage(ws: ExtendedWebSocket, message: Message) {
  switch (message.type) {
    case 'chat':
      await handleChatMessage(ws, message);
      break;
    case 'presence':
      await handlePresenceMessage(ws, message);
      break;
    case 'system':
      await handleSystemMessage(ws, message);
      break;
  }
}

async function handleChatMessage(ws: ExtendedWebSocket, msg: ChatMessage) {
  // 验证用户是否在房间
  if (!ws.rooms?.has(msg.roomId)) {
    sendError(ws, 'Not in room');
    return;
  }

  // 持久化消息
  await messageRepository.save({
    roomId: msg.roomId,
    userId: msg.userId,
    content: msg.content,
    timestamp: msg.timestamp,
  });

  // 广播到房间
  broadcastToRoom(msg.roomId, msg, ws);
}

function broadcastToRoom(
  roomId: string,
  message: Message,
  exclude?: ExtendedWebSocket
) {
  const room = roomManager.get(roomId);
  if (!room) return;

  const data = JSON.stringify(message);

  room.forEach((client) => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function sendMessage(ws: ExtendedWebSocket, message: Message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws: ExtendedWebSocket, error: string) {
  sendMessage(ws, {
    type: 'system',
    event: 'error',
    timestamp: Date.now(),
    id: generateId(),
    data: { error },
  });
}

// 心跳检测定时器
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    const extWs = ws as ExtendedWebSocket;
    if (!extWs.isAlive) {
      extWs.terminate();
      return;
    }
    extWs.isAlive = false;
    extWs.ping();
  });
}, 30000);

// 多服务器支持 - Redis Pub/Sub
if (process.env.REDIS_URL) {
  const redis = new Redis(process.env.REDIS_URL);
  const sub = new Redis(process.env.REDIS_URL);

  // 订阅频道
  sub.subscribe('chat:messages', 'presence:updates');

  sub.on('message', (channel, message) => {
    const data = JSON.parse(message);
    // 广播到本地连接
    if (data.roomId) {
      broadcastToRoom(data.roomId, data);
    }
  });

  // 发布消息到 Redis
  function publishMessage(channel: string, message: Message) {
    redis.publish(channel, JSON.stringify(message));
  }
}

server.listen(8080);
```

#### 客户端实现

```typescript
// client/websocket.ts
interface WebSocketClientOptions {
  url: string;
  token: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketClientOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer?: number;
  private heartbeatTimer?: number;
  private messageQueue: string[] = [];
  private eventListeners = new Map<string, Set<Function>>();

  constructor(options: WebSocketClientOptions) {
    this.options = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 25000,
      ...options,
    };
  }

  connect(): void {
    const { url, token } = this.options;
    this.ws = new WebSocket(`${url}?token=${token}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.flushQueue();
      this.startHeartbeat();
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.stopHeartbeat();
      this.attemptReconnect();
      this.emit('disconnected', event);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  private handleMessage(message: Message): void {
    this.emit(`message:${message.type}`, message);
    this.emit('message', message);
  }

  send(message: Message): void {
    const data = JSON.stringify(message);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      this.messageQueue.push(data);
    }
  }

  private flushQueue(): void {
    while (this.messageQueue.length > 0) {
      const data = this.messageQueue.shift();
      this.ws?.send(data!);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.options.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.emit('reconnect_failed');
      return;
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
      this.emit('reconnecting', this.reconnectAttempts);
      this.connect();
    }, this.options.reconnectInterval);
  }

  on(event: string, handler: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler);
  }

  off(event: string, handler: Function): void {
    this.eventListeners.get(event)?.delete(handler);
  }

  private emit(event: string, ...args: any[]): void {
    this.eventListeners.get(event)?.forEach((handler) => {
      handler(...args);
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.stopHeartbeat();
    this.ws?.close();
  }
}

// React Hook 封装
function useWebSocket(options: WebSocketClientOptions) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const clientRef = useRef<WebSocketClient>();

  useEffect(() => {
    const client = new WebSocketClient(options);
    clientRef.current = client;

    client.on('connected', () => setConnected(true));
    client.on('disconnected', () => setConnected(false));
    client.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    client.connect();

    return () => client.disconnect();
  }, []);

  const send = useCallback((message: Message) => {
    clientRef.current?.send(message);
  }, []);

  return { connected, messages, send };
}
```

### 5.4 优缺点分析

**优点：**

- ✅ 全双工实时通信
- ✅ 低延迟（建立连接后无 HTTP 开销）
- ✅ 轻量级帧结构
- ✅ 支持二进制和文本数据

**缺点：**

- ❌ 需要处理连接状态管理
- ❌ 不支持自动重连（需自行实现）
- ❌ 防火墙/代理可能阻止连接
- ❌ 无内置认证机制（依赖初始握手）

---

## 6. Webhook 的异步事件模型

### 6.1 形式化定义

```
Webhook System = (Events, Subscriptions, Deliveries, RetryPolicy)

Event = (id, type, payload, timestamp, signature)

Subscription = (id, url, events, secret, status)

Delivery = (id, eventId, subscriptionId, attempts, status, response)

形式化流程：
Event Occurs → Match Subscriptions → Sign Payload → HTTP POST → Retry on Failure
```

**架构图：**

```
┌─────────────────────────────────────────────────────────────────┐
│                      Webhook Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                                               │
│  │   System     │                                               │
│  │   Events     │                                               │
│  │  (订单创建)   │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│  ┌──────▼───────┐                                               │
│  │  Event Bus   │         ┌───────────────────────────────┐    │
│  │   (Kafka/    │         │      Webhook Service          │    │
│  │   RabbitMQ)  │────────►│                               │    │
│  └──────────────┘         │  ┌─────────────────────────┐  │    │
│                           │  │   Subscription Store    │  │    │
│                           │  │  - URL, Events, Secret   │  │    │
│                           │  │  - Status, Metadata      │  │    │
│                           │  └─────────────────────────┘  │    │
│                           │                               │    │
│                           │  ┌─────────────────────────┐  │    │
│                           │  │    Delivery Queue       │  │    │
│                           │  │  - Pending deliveries    │  │    │
│                           │  │  - Retry scheduling      │  │    │
│                           │  └─────────────────────────┘  │    │
│                           │                               │    │
│                           │  ┌─────────────────────────┐  │    │
│                           │  │    Signature Engine     │  │    │
│                           │  │  - HMAC-SHA256 signing   │  │    │
│                           │  │  - Timestamp validation  │  │    │
│                           │  └─────────────────────────┘  │    │
│                           └───────────────────────────────┘    │
│                                      │                          │
│                                      ▼                          │
│                           ┌──────────────────────┐             │
│                           │   HTTP Delivery      │             │
│                           │   (Worker Pool)      │             │
│                           └──────────┬───────────┘             │
│                                      │                          │
│                    ┌─────────────────┼─────────────────┐       │
│                    ▼                 ▼                 ▼       │
│            ┌───────────┐    ┌───────────┐    ┌───────────┐    │
│            │ Consumer A │    │ Consumer B │    │ Consumer C │    │
│            │ (200 OK)   │    │ (Retry)   │    │ (Failed)   │    │
│            └───────────┘    └───────────┘    └───────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 设计原则

1. **事件驱动**：基于发布-订阅模式解耦系统
2. **可靠性**：重试机制 + 死信队列
3. **安全性**：HMAC 签名验证 + HTTPS
4. **幂等性**：确保重复事件不会导致重复处理

### 6.3 代码示例

#### Webhook 服务实现

```typescript
// server/webhook/service.ts
import crypto from 'crypto';
import axios, { AxiosError } from 'axios';

interface WebhookEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive';
  maxRetries: number;
  retryDelay: number;
}

interface DeliveryAttempt {
  id: string;
  eventId: string;
  subscriptionId: string;
  url: string;
  payload: string;
  signature: string;
  timestamp: Date;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  attemptNumber: number;
}

class WebhookService {
  private subscriptions: Map<string, WebhookSubscription> = new Map();
  private deliveryQueue: DeliveryAttempt[] = [];

  // 注册订阅
  async subscribe(subscription: Omit<WebhookSubscription, 'id'>): Promise<string> {
    const id = generateId();
    const newSub = { ...subscription, id };
    this.subscriptions.set(id, newSub);
    await this.persistSubscription(newSub);
    return id;
  }

  // 触发事件
  async emit(event: WebhookEvent): Promise<void> {
    // 匹配订阅
    const matchingSubs = Array.from(this.subscriptions.values()).filter(
      (sub) => sub.events.includes(event.type) && sub.status === 'active'
    );

    // 为每个订阅创建投递任务
    for (const sub of matchingSubs) {
      const payload = JSON.stringify(event);
      const signature = this.signPayload(payload, sub.secret);

      const attempt: DeliveryAttempt = {
        id: generateId(),
        eventId: event.id,
        subscriptionId: sub.id,
        url: sub.url,
        payload,
        signature,
        timestamp: new Date(),
        attemptNumber: 1,
      };

      this.deliveryQueue.push(attempt);
    }

    // 异步处理投递
    this.processQueue();
  }

  // 签名生成
  private signPayload(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  // 投递处理
  private async processQueue(): Promise<void> {
    while (this.deliveryQueue.length > 0) {
      const attempt = this.deliveryQueue.shift()!;
      await this.deliver(attempt);
    }
  }

  private async deliver(attempt: DeliveryAttempt): Promise<void> {
    const sub = this.subscriptions.get(attempt.subscriptionId);
    if (!sub) return;

    try {
      const response = await axios.post(attempt.url, attempt.payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': attempt.signature,
          'X-Webhook-Event-ID': attempt.eventId,
          'X-Webhook-Attempt': attempt.attemptNumber.toString(),
          'X-Webhook-Timestamp': attempt.timestamp.toISOString(),
          'User-Agent': 'Webhook-Service/1.0',
        },
        timeout: 30000,
        validateStatus: () => true, // 自己处理状态码
      });

      // 记录结果
      attempt.responseStatus = response.status;
      attempt.responseBody = JSON.stringify(response.data);

      if (response.status >= 200 && response.status < 300) {
        await this.logDelivery(attempt, 'success');
      } else if (attempt.attemptNumber < sub.maxRetries) {
        // 重试
        await this.scheduleRetry(attempt, sub);
      } else {
        // 超过重试次数
        await this.logDelivery(attempt, 'failed');
        await this.handleFailedDelivery(attempt);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      attempt.error = axiosError.message;

      if (attempt.attemptNumber < sub.maxRetries) {
        await this.scheduleRetry(attempt, sub);
      } else {
        await this.logDelivery(attempt, 'failed');
        await this.handleFailedDelivery(attempt);
      }
    }
  }

  // 重试调度（指数退避）
  private async scheduleRetry(
    attempt: DeliveryAttempt,
    sub: WebhookSubscription
  ): Promise<void> {
    const delay = sub.retryDelay * Math.pow(2, attempt.attemptNumber - 1);

    setTimeout(() => {
      this.deliveryQueue.push({
        ...attempt,
        attemptNumber: attempt.attemptNumber + 1,
        timestamp: new Date(),
      });
      this.processQueue();
    }, delay);
  }

  // 处理失败投递
  private async handleFailedDelivery(attempt: DeliveryAttempt): Promise<void> {
    // 发送告警
    await this.sendAlert(attempt);

    // 可选：禁用订阅
    const sub = this.subscriptions.get(attempt.subscriptionId);
    if (sub && this.shouldDisableSubscription(sub)) {
      sub.status = 'inactive';
      await this.persistSubscription(sub);
    }
  }

  // 订阅验证（challenge-response）
  async verifySubscription(subscriptionId: string): Promise<boolean> {
    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) return false;

    const challenge = crypto.randomBytes(32).toString('hex');

    try {
      const response = await axios.post(
        sub.url,
        { type: 'verification', challenge },
        {
          headers: {
            'X-Webhook-Verification': 'true',
            'X-Webhook-Secret': sub.secret.substring(0, 8) + '...',
          },
          timeout: 10000,
        }
      );

      return response.data.challenge === challenge;
    } catch {
      return false;
    }
  }

  // 持久化和日志方法（省略实现）
  private async persistSubscription(sub: WebhookSubscription): Promise<void> {}
  private async logDelivery(
    attempt: DeliveryAttempt,
    status: string
  ): Promise<void> {}
  private async sendAlert(attempt: DeliveryAttempt): Promise<void> {}
  private shouldDisableSubscription(sub: WebhookSubscription): boolean {
    return false;
  }
}
```

#### Webhook 消费者实现

```typescript
// server/webhook/consumer.ts
import { Request, Response } from 'express';
import crypto from 'crypto';

interface WebhookPayload {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

class WebhookConsumer {
  private secrets: Map<string, string> = new Map();

  // 验证签名
  private verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }

  // 处理 Webhook 请求
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['x-webhook-signature'] as string;
    const eventId = req.headers['x-webhook-event-id'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;

    // 验证必需头
    if (!signature || !eventId) {
      res.status(400).json({ error: 'Missing required headers' });
      return;
    }

    // 防重放攻击（检查时间戳）
    const eventTime = new Date(timestamp).getTime();
    const now = Date.now();
    if (Math.abs(now - eventTime) > 5 * 60 * 1000) {
      res.status(400).json({ error: 'Timestamp too old' });
      return;
    }

    // 验证签名
    const rawBody = JSON.stringify(req.body);
    const secret = this.getSecretForEvent(req.body.type);

    if (!this.verifySignature(rawBody, signature, secret)) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // 幂等性检查
    if (await this.isDuplicate(eventId)) {
      res.status(200).json({ status: 'already processed' });
      return;
    }

    // 处理事件
    try {
      await this.processEvent(req.body as WebhookPayload);
      await this.markProcessed(eventId);
      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      // 返回 500 触发重试
      res.status(500).json({ error: 'Processing failed' });
    }
  }

  // 事件处理器
  private async processEvent(event: WebhookPayload): Promise<void> {
    switch (event.type) {
      case 'order.created':
        await this.handleOrderCreated(event.payload);
        break;
      case 'payment.succeeded':
        await this.handlePaymentSucceeded(event.payload);
        break;
      case 'user.updated':
        await this.handleUserUpdated(event.payload);
        break;
      default:
        console.log('Unknown event type:', event.type);
    }
  }

  private async handleOrderCreated(payload: Record<string, unknown>): Promise<void> {
    // 实现订单创建处理
  }

  private async handlePaymentSucceeded(payload: Record<string, unknown>): Promise<void> {
    // 实现支付成功处理
  }

  private async handleUserUpdated(payload: Record<string, unknown>): Promise<void> {
    // 实现用户更新处理
  }

  // 辅助方法
  private getSecretForEvent(eventType: string): string {
    return this.secrets.get(eventType) || process.env.WEBHOOK_SECRET!;
  }

  private async isDuplicate(eventId: string): Promise<boolean> {
    // 检查 Redis 或数据库
    return false;
  }

  private async markProcessed(eventId: string): Promise<void> {
    // 存储到 Redis 或数据库
  }
}
```

### 6.4 优缺点分析

**优点：**

- ✅ 异步解耦，系统独立演进
- ✅ 实时推送，无需轮询
- ✅ 可扩展性强
- ✅ 天然支持事件驱动架构

**缺点：**

- ❌ 需要处理投递失败和重试
- ❌ 消费者必须可被公网访问
- ❌ 需要实现签名验证
- ❌ 调试困难（异步性质）

---

## 7. API 版本化策略

### 7.1 形式化定义

```
API Versioning = (Strategy, Migration, Deprecation)

Strategy ∈ {URL, Header, MediaType, Parameter}

Version Format: Semantic Versioning (MAJOR.MINOR.PATCH)

兼容性规则:
  - MAJOR: 破坏性变更
  - MINOR: 向后兼容的功能添加
  - PATCH: 向后兼容的问题修复
```

**版本策略对比：**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Versioning Strategies                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. URL Path                                                     │
│     GET /v1/users                                                │
│     GET /v2/users                                                │
│                                                                  │
│  2. Header                                                       │
│     GET /users                                                   │
│     API-Version: 2024-01-15                                      │
│                                                                  │
│  3. Media Type                                                   │
│     GET /users                                                   │
│     Accept: application/vnd.api+json;version=2                   │
│                                                                  │
│  4. Query Parameter                                              │
│     GET /users?version=2                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 设计原则

1. **向后兼容优先**：尽可能保持向后兼容
2. **显式版本标识**：明确声明 API 版本
3. **弃用窗口**：提供充足的迁移时间
4. **版本生命周期**：明确定义支持期限

### 7.3 代码示例

#### 策略 1: URL Path 版本化

```typescript
// routes/index.ts
import { Router } from 'express';
import v1Router from './v1';
import v2Router from './v2';

const router = Router();

// URL 路径版本化
router.use('/v1', v1Router);
router.use('/v2', v2Router);

export default router;
```

```typescript
// routes/v1/users.ts
import { Router } from 'express';

const router = Router();

// v1 响应格式
router.get('/', async (req, res) => {
  const users = await userService.findAll();
  res.json({
    data: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
    })),
  });
});

export default router;
```

```typescript
// routes/v2/users.ts
import { Router } from 'express';

const router = Router();

// v2 响应格式 - 包含更多字段
router.get('/', async (req, res) => {
  const { include } = req.query;
  const users = await userService.findAll({
    include: include?.toString().split(','),
  });

  res.json({
    data: users.map(u => ({
      id: u.id,
      type: 'user',
      attributes: {
        name: u.name,
        email: u.email,
        avatar: u.avatarUrl,
        createdAt: u.createdAt,
      },
      relationships: {
        orders: {
          data: u.orders?.map(o => ({ id: o.id, type: 'order' })),
        },
      },
    })),
    meta: {
      total: users.length,
      version: '2.0',
    },
  });
});

export default router;
```

#### 策略 2: Header 版本化

```typescript
// middleware/version.ts
import { Request, Response, NextFunction } from 'express';

interface VersionedRequest extends Request {
  apiVersion: string;
}

const VERSIONS = ['2024-01-01', '2024-06-01'];
const DEFAULT_VERSION = '2024-06-01';

export function versionMiddleware(
  req: VersionedRequest,
  res: Response,
  next: NextFunction
) {
  // 从 Header 获取版本
  const version = req.headers['api-version'] as string || DEFAULT_VERSION;

  // 验证版本
  if (!VERSIONS.includes(version)) {
    res.status(400).json({
      error: 'Unsupported API version',
      supportedVersions: VERSIONS,
    });
    return;
  }

  req.apiVersion = version;
  next();
}

// 版本适配器
export function versionAdapter(handlers: Record<string, Function>) {
  return (req: VersionedRequest, res: Response, next: NextFunction) => {
    const handler = handlers[req.apiVersion] || handlers[DEFAULT_VERSION];
    if (!handler) {
      res.status(500).json({ error: 'Version handler not found' });
      return;
    }
    return handler(req, res, next);
  };
}
```

```typescript
// routes/users.ts
import { Router } from 'express';
import { versionMiddleware, versionAdapter } from '../middleware/version';

const router = Router();

router.use(versionMiddleware);

router.get(
  '/',
  versionAdapter({
    '2024-01-01': async (req, res) => {
      // v1 处理逻辑
      const users = await userService.findAllV1();
      res.json({ users });
    },
    '2024-06-01': async (req, res) => {
      // v2 处理逻辑
      const users = await userService.findAllV2();
      res.json({ data: users, meta: { version: '2024-06-01' } });
    },
  })
);

export default router;
```

#### 策略 3: Media Type 版本化

```typescript
// middleware/mediaTypeVersion.ts
import { Request, Response, NextFunction } from 'express';

const VERSION_PATTERN = /application\/vnd\.(\w+)\+(\w+);version=(\d+)/;

export function mediaTypeVersionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accept = req.headers.accept || '';
  const match = accept.match(VERSION_PATTERN);

  if (match) {
    const [, vendor, format, version] = match;
    req.apiVendor = vendor;
    req.apiFormat = format;
    req.apiVersion = version;
  }

  next();
}

// 使用
app.get('/users', (req, res) => {
  const version = req.apiVersion || '1';

  res.set('Content-Type', `application/vnd.myapi+json;version=${version}`);

  switch (version) {
    case '1':
      return res.json(/* v1 format */);
    case '2':
      return res.json(/* v2 format */);
    default:
      return res.status(400).json({ error: 'Unsupported version' });
  }
});
```

#### 策略 4: 统一的版本管理器

```typescript
// services/versionManager.ts
interface VersionConfig {
  version: string;
  status: 'active' | 'deprecated' | 'sunset';
  sunsetDate?: Date;
  handler: Function;
}

class VersionManager {
  private versions = new Map<string, VersionConfig>();

  register(config: VersionConfig): void {
    this.versions.set(config.version, config);
  }

  async execute(version: string, ...args: any[]): Promise<any> {
    const config = this.versions.get(version);

    if (!config) {
      throw new Error(`Version ${version} not found`);
    }

    if (config.status === 'sunset') {
      throw new Error(`Version ${version} has been sunset`);
    }

    // 添加弃用警告头
    if (config.status === 'deprecated' && config.sunsetDate) {
      const response = args.find(arg => arg.set);
      if (response) {
        response.set('Deprecation', `true`);
        response.set('Sunset', config.sunsetDate.toUTCString());
        response.set('Link', `</docs/migration>; rel="sunset"`);
      }
    }

    return config.handler(...args);
  }

  getActiveVersions(): VersionConfig[] {
    return Array.from(this.versions.values()).filter(
      v => v.status === 'active' || v.status === 'deprecated'
    );
  }
}

// 注册版本
const versionManager = new VersionManager();

versionManager.register({
  version: 'v1',
  status: 'deprecated',
  sunsetDate: new Date('2024-12-31'),
  handler: v1Handler,
});

versionManager.register({
  version: 'v2',
  status: 'active',
  handler: v2Handler,
});
```

### 7.4 优缺点分析

| 策略 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| URL Path | 直观、可缓存、便于文档 | URL 变化、破坏书签 | 公开 API |
| Header | URL 稳定、语义清晰 | 不易调试、缓存复杂 | 内部 API |
| Media Type | RESTful、内容协商 | 复杂度高 | 严格 REST |
| Parameter | 简单易用 | 不够规范 | 快速迭代 |

---

## 8. 速率限制的形式化

### 8.1 形式化定义

```
Rate Limiting = (Algorithm, Window, Identity, Response)

Algorithm ∈ {TokenBucket, LeakyBucket, FixedWindow, SlidingWindow}

形式化描述：
  令 R 为请求序列，rᵢ 为第 i 个请求
  令 L 为限制函数，L(rᵢ) ∈ {allow, deny}

  TokenBucket:
    bucket = min(bucket + rate × Δt, capacity)
    L(rᵢ) = allow if bucket ≥ cost else deny
    bucket = bucket - cost if allowed
```

**算法对比：**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Rate Limiting Algorithms                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Token Bucket                                                    │
│  ┌──────┐  tokens/min                                           │
│  │██████│──────┐                                                 │
│  │██████│      ▼                                                 │
│  │  ██  │  ┌─────────┐                                           │
│  │  ██  │  │ Bucket  │───► Request Processing                    │
│  └──────┘  │ (burst) │                                           │
│            └─────────┘                                           │
│                                                                  │
│  Leaky Bucket                                                    │
│  ┌─────────┐  constant rate                                      │
│  │  Queue  │─────────────►                                       │
│  │ (burst) │                                                     │
│  └────▲────┘                                                     │
│       │                                                          │
│       └───── Incoming Requests                                   │
│                                                                  │
│  Sliding Window                                                  │
│  ┌─────────────────────────────────────┐                        │
│  │  |----window---->                   │                        │
│  │  [r1][r2]   [r3][r4]      [r5]     │                        │
│  │  time ─────────────────────────►    │                        │
│  └─────────────────────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 设计原则

1. **公平性**：基于用户/API Key 进行限制
2. **渐进惩罚**：超限后逐步增加惩罚
3. **透明性**：返回明确的限流信息
4. **分布式支持**：Redis 等分布式存储支持

### 8.3 代码示例

#### Token Bucket 实现

```typescript
// ratelimit/tokenBucket.ts
import Redis from 'ioredis';

interface TokenBucketConfig {
  capacity: number;      // 桶容量
  refillRate: number;    // 每秒填充速率
  key: string;           // 标识键
}

class TokenBucketRateLimiter {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async allowRequest(config: TokenBucketConfig): Promise<RateLimitResult> {
    const { capacity, refillRate, key } = config;
    const bucketKey = `ratelimit:token:${key}`;
    const now = Date.now();

    // Lua 脚本保证原子性
    const script = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])

      local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
      local tokens = tonumber(bucket[1]) or capacity
      local lastRefill = tonumber(bucket[2]) or now

      -- 计算新令牌数
      local elapsed = (now - lastRefill) / 1000
      local newTokens = math.min(capacity, tokens + elapsed * refillRate)

      if newTokens >= 1 then
        newTokens = newTokens - 1
        redis.call('HMSET', key, 'tokens', newTokens, 'lastRefill', now)
        redis.call('EXPIRE', key, 3600)
        return {1, math.floor(newTokens), math.floor(capacity)}
      else
        redis.call('HMSET', key, 'tokens', newTokens, 'lastRefill', now)
        redis.call('EXPIRE', key, 3600)
        local retryAfter = math.ceil((1 - newTokens) / refillRate)
        return {0, math.floor(newTokens), retryAfter}
      end
    `;

    const result = await this.redis.eval(
      script,
      1,
      bucketKey,
      capacity,
      refillRate,
      now
    ) as [number, number, number];

    const [allowed, remaining, retryAfter] = result;

    return {
      allowed: allowed === 1,
      remaining,
      retryAfter: allowed === 1 ? undefined : retryAfter,
      limit: capacity,
      resetTime: now + (retryAfter || 0) * 1000,
    };
  }
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
  limit: number;
  resetTime: number;
}
```

#### Sliding Window 实现

```typescript
// ratelimit/slidingWindow.ts
class SlidingWindowRateLimiter {
  private redis: Redis;

  async allowRequest(
    key: string,
    windowMs: number,
    maxRequests: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;
    const sortedSetKey = `ratelimit:sliding:${key}`;

    const script = `
      local key = KEYS[1]
      local windowStart = tonumber(ARGV[1])
      local now = tonumber(ARGV[2])
      local maxRequests = tonumber(ARGV[3])
      local windowMs = tonumber(ARGV[4])

      -- 移除窗口外的请求记录
      redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)

      -- 获取当前窗口内的请求数
      local currentCount = redis.call('ZCARD', key)

      if currentCount < maxRequests then
        -- 允许请求，添加记录
        redis.call('ZADD', key, now, now .. ':' .. math.random())
        redis.call('EXPIRE', key, math.ceil(windowMs / 1000) + 1)
        return {1, maxRequests - currentCount - 1, now + windowMs}
      else
        -- 拒绝请求，计算下次可重试时间
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local retryAfter = math.ceil((tonumber(oldest[2]) + windowMs - now) / 1000)
        return {0, 0, retryAfter}
      end
    `;

    const result = await this.redis.eval(
      script,
      1,
      sortedSetKey,
      windowStart,
      now,
      maxRequests,
      windowMs
    ) as [number, number, number];

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetTime: result[2],
      limit: maxRequests,
    };
  }
}
```

#### Express 中间件集成

```typescript
// middleware/ratelimit.ts
import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

export function rateLimit(options: RateLimitOptions) {
  const limiter = new TokenBucketRateLimiter(process.env.REDIS_URL!);

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator?.(req) || req.ip || 'anonymous';

    const result = await limiter.allowRequest({
      key,
      capacity: options.maxRequests,
      refillRate: options.maxRequests / (options.windowMs / 1000),
    });

    // 设置标准限流头 (RFC 6585)
    if (options.standardHeaders !== false) {
      res.set('RateLimit-Limit', result.limit.toString());
      res.set('RateLimit-Remaining', result.remaining.toString());
      res.set('RateLimit-Reset', new Date(result.resetTime).toUTCString());
    }

    // 传统头 (X-RateLimit-*)
    if (options.legacyHeaders !== false) {
      res.set('X-RateLimit-Limit', result.limit.toString());
      res.set('X-RateLimit-Remaining', result.remaining.toString());
      res.set('X-RateLimit-Reset', Math.floor(result.resetTime / 1000).toString());
    }

    if (!result.allowed) {
      // 429 Too Many Requests
      res.set('Retry-After', result.retryAfter?.toString() || '60');
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: result.retryAfter,
      });
      return;
    }

    // 可选：记录成功/失败请求
    if (options.skipSuccessfulRequests || options.skipFailedRequests) {
      const originalEnd = res.end.bind(res);
      res.end = function(...args: any[]) {
        res.end = originalEnd;
        res.end(...args);

        const statusCode = res.statusCode;
        if (
          (options.skipSuccessfulRequests && statusCode < 400) ||
          (options.skipFailedRequests && statusCode >= 400)
        ) {
          // 从计数中移除此次请求
          limiter.decrement(key);
        }
      };
    }

    next();
  };
}

// 分层限流策略
export function tieredRateLimit() {
  return {
    // 严格限制 - 认证端点
    strict: rateLimit({
      windowMs: 15 * 60 * 1000,  // 15 分钟
      maxRequests: 5,             // 5 次
      keyGenerator: (req) => `auth:${req.ip}`,
    }),

    // 标准限制 - API 端点
    standard: rateLimit({
      windowMs: 60 * 1000,        // 1 分钟
      maxRequests: 100,
      keyGenerator: (req) => `api:${req.user?.id || req.ip}`,
    }),

    // 宽松限制 - 公开端点
    permissive: rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 1000,
      keyGenerator: (req) => `public:${req.ip}`,
    }),
  };
}
```

### 8.4 优缺点分析

| 算法 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| Token Bucket | 支持突发流量、平滑限流 | 实现复杂 | 大多数 API |
| Leaky Bucket | 严格的速率控制 | 无突发支持 | 精确限速 |
| Fixed Window | 简单、内存友好 | 窗口边界突发 | 简单场景 |
| Sliding Window | 精确、平滑 | 内存开销大 | 严格限流 |

---

## 9. API 文档的形式化

### 9.1 形式化定义

```
OpenAPI Specification = (Info, Servers, Paths, Components, Security)

Document Structure:
  OpenAPI = {
    openapi: "3.1.0",
    info: Info,
    servers: Server[],
    paths: Paths,
    components: Components,
    security: SecurityRequirement[]
  }

Path Item = {
  get?: Operation,
  post?: Operation,
  put?: Operation,
  delete?: Operation,
  parameters?: Parameter[]
}

Operation = {
  operationId: string,
  summary: string,
  parameters: Parameter[],
  requestBody: RequestBody,
  responses: Responses
}
```

### 9.2 设计原则

1. **契约优先**：API 定义即文档
2. **自动生成**：从代码或注释生成
3. **交互式**：提供可执行的文档
4. **版本管理**：文档随 API 版本化

### 9.3 代码示例

#### OpenAPI 3.1 规范

```yaml
# openapi.yaml
openapi: 3.1.0
info:
  title: User Management API
  description: |
    A comprehensive API for user management.

    ## Features
    - User CRUD operations
    - Authentication & Authorization
    - Real-time updates
  version: 2.0.0
  contact:
    name: API Support
    email: api@example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.example.com/v2
    description: Production
  - url: https://staging-api.example.com/v2
    description: Staging

security:
  - bearerAuth: []
  - apiKeyAuth: []

paths:
  /users:
    get:
      operationId: listUsers
      summary: List all users
      description: Returns a paginated list of users with optional filtering
      tags:
        - Users
      parameters:
        - name: page
          in: query
          description: Page number
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          description: Items per page
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: filter
          in: query
          description: Filter criteria
          schema:
            $ref: '#/components/schemas/UserFilter'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserListResponse'
              examples:
                success:
                  summary: Successful response
                  value:
                    data:
                      - id: "user-123"
                        name: "John Doe"
                        email: "john@example.com"
                    meta:
                      total: 100
                      page: 1
                      limit: 20
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '429':
          $ref: '#/components/responses/RateLimitError'

    post:
      operationId: createUser
      summary: Create a new user
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
          headers:
            Location:
              description: URL of the created user
              schema:
                type: string
        '400':
          $ref: '#/components/responses/ValidationError'

  /users/{userId}:
    parameters:
      - name: userId
        in: path
        required: true
        description: User identifier
        schema:
          type: string
          pattern: '^user-[a-z0-9]+$'

    get:
      operationId: getUser
      summary: Get user by ID
      tags:
        - Users
      responses:
        '200':
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          $ref: '#/components/responses/NotFoundError'

components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
        - email
      properties:
        id:
          type: string
          readOnly: true
          example: "user-123"
        name:
          type: string
          minLength: 1
          maxLength: 100
          example: "John Doe"
        email:
          type: string
          format: email
          example: "john@example.com"
        status:
          type: string
          enum: [active, inactive, suspended]
          default: active
        createdAt:
          type: string
          format: date-time
          readOnly: true
        metadata:
          type: object
          additionalProperties: true
      discriminator:
        propertyName: userType
        mapping:
          regular: '#/components/schemas/RegularUser'
          premium: '#/components/schemas/PremiumUser'

    RegularUser:
      allOf:
        - $ref: '#/components/schemas/User'
        - type: object
          properties:
            userType:
              type: string
              enum: [regular]
            dailyQuota:
              type: integer
              default: 100

    PremiumUser:
      allOf:
        - $ref: '#/components/schemas/User'
        - type: object
          properties:
            userType:
              type: string
              enum: [premium]
            dailyQuota:
              type: integer
              default: 10000
            prioritySupport:
              type: boolean
              default: true

    CreateUserRequest:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
        userType:
          type: string
          enum: [regular, premium]
          default: regular

    UserFilter:
      type: object
      properties:
        status:
          type: string
          enum: [active, inactive, suspended]
        createdAfter:
          type: string
          format: date-time
        search:
          type: string
          description: Search in name and email

    UserListResponse:
      type: object
      required:
        - data
        - meta
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/User'
        meta:
          type: object
          required:
            - total
            - page
            - limit
          properties:
            total:
              type: integer
            page:
              type: integer
            limit:
              type: integer
            nextPage:
              type: string
              format: uri
              nullable: true

    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: array
          items:
            type: object

  responses:
    UnauthorizedError:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: UNAUTHORIZED
            message: Authentication required

    ValidationError:
      description: Invalid input
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: VALIDATION_ERROR
            message: Invalid input data
            details:
              - field: email
                message: Invalid email format

    NotFoundError:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

    RateLimitError:
      description: Rate limit exceeded
      headers:
        Retry-After:
          schema:
            type: integer
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from /auth/login

    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: API key for service-to-service communication
```

#### 从 TypeScript 类型生成 OpenAPI

```typescript
// scripts/generate-openapi.ts
import { z } from 'zod';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

// 定义 Zod Schema
const UserSchema = z.object({
  id: z.string().openapi({ example: 'user-123' }),
  name: z.string().min(1).openapi({ example: 'John Doe' }),
  email: z.string().email().openapi({ example: 'john@example.com' }),
  status: z.enum(['active', 'inactive']).openapi({ example: 'active' }),
}).openapi('User');

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
}).openapi('CreateUserRequest');

// 生成 OpenAPI 文档
const generator = new OpenApiGeneratorV3([UserSchema, CreateUserSchema]);

const docs = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API',
    description: 'API documentation generated from Zod schemas',
  },
  servers: [{ url: 'http://localhost:3000' }],
});

console.log(JSON.stringify(docs, null, 2));
```

#### Swagger UI 集成

```typescript
// app.ts
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();
const swaggerDocument = YAML.load('./openapi.yaml');

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Documentation',
}));

// JSON 格式的 OpenAPI 规范
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocument);
});
```

### 9.4 优缺点分析

**优点：**

- ✅ 标准化规范，工具生态丰富
- ✅ 生成类型、客户端 SDK、文档
- ✅ 支持代码生成和文档优先两种模式
- ✅ 支持多种认证方式定义

**缺点：**

- ❌ 复杂 API 导致文档庞大
- ❌ 维护成本（需要与代码同步）
- ❌ 学习曲线（YAML/JSON 语法）

---

## 10. HATEOAS 的超媒体驱动模型

### 10.1 形式化定义

```
HATEOAS = Hypermedia As The Engine Of Application State

REST Resource Representation:
  Resource = {
    data: DomainData,
    _links: {
      self: Link,
      related?: Link[],
      actions?: ActionLink[]
    }
  }

Link = {
  href: URI,
  rel: string,
  method?: HTTPMethod,
  title?: string,
  type?: MediaType
}

State Machine:
  CurrentState ──[link]──► NextState
```

**架构图：**

```
┌─────────────────────────────────────────────────────────────────┐
│                      HATEOAS State Machine                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     GET /orders/123      ┌─────────────────────┐ │
│  │  Start   │─────────────────────────►│     Order (pending)  │ │
│  └──────────┘                          └──────────┬──────────┘ │
│                                                   │             │
│                          _links: {                │             │
│                            "self": "/orders/123"  │             │
│                            "pay": {               │             │
│                              "href": "/orders/123/pay"
│                              "method": "POST"     │             │
│                            }                      │             │
│                            "cancel": {            │             │
│                              "href": "/orders/123/cancel"
│                              "method": "POST"     │             │
│                            }                      │             │
│                          }                        │             │
│                                                   │             │
│                                                   ▼             │
│                           POST /orders/123/pay   ┌────────────┐│
│                          ┌───────────────────────┤  Order     ││
│                          │                       │  (paid)    ││
│                          ▼                       └─────┬──────┘│
│                   ┌──────────────┐                     │        │
│                   │   Payment    │◄────────────────────┘        │
│                   │   Resource   │     _links: {                │
│                   └──────────────┘       "self": "/orders/123"  │
│                                          "ship": {              │
│                                            "href": "/orders/123/ship"
│                                            "method": "POST"     │
│                                          }                      │
│                                        }                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 设计原则

1. **自发现性**：客户端通过链接导航 API
2. **状态驱动**：可用操作由当前资源状态决定
3. **URI 解耦**：客户端不需要硬编码 URL
4. **语义化链接**：`rel` 属性描述链接关系

### 10.3 代码示例

#### HAL (Hypertext Application Language)

```typescript
// models/hal.ts
interface HalLink {
  href: string;
  templated?: boolean;
  type?: string;
  deprecation?: string;
  name?: string;
  profile?: string;
  title?: string;
  hreflang?: string;
}

interface HalResource {
  _links: {
    self: HalLink;
    [rel: string]: HalLink | HalLink[] | undefined;
  };
  _embedded?: {
    [rel: string]: HalResource | HalResource[];
  };
  [key: string]: any;
}

// HAL 响应构建器
class HalResourceBuilder {
  private resource: HalResource = {
    _links: { self: { href: '' } },
  };

  self(href: string): this {
    this.resource._links.self = { href };
    return this;
  }

  link(rel: string, href: string, options?: Partial<HalLink>): this {
    this.resource._links[rel] = { href, ...options };
    return this;
  }

  embed(rel: string, resource: HalResource | HalResource[]): this {
    if (!this.resource._embedded) {
      this.resource._embedded = {};
    }
    this.resource._embedded[rel] = resource;
    return this;
  }

  data(key: string, value: any): this {
    this.resource[key] = value;
    return this;
  }

  build(): HalResource {
    return this.resource;
  }
}

// 使用示例
function buildOrderResponse(order: Order): HalResource {
  const builder = new HalResourceBuilder()
    .self(`/orders/${order.id}`)
    .data('id', order.id)
    .data('status', order.status)
    .data('total', order.total)
    .data('createdAt', order.createdAt);

  // 根据状态添加可用操作
  if (order.status === 'pending') {
    builder
      .link('pay', `/orders/${order.id}/pay`, {
        title: 'Pay for Order',
      })
      .link('cancel', `/orders/${order.id}/cancel`, {
        title: 'Cancel Order',
      });
  }

  if (order.status === 'paid') {
    builder.link('ship', `/orders/${order.id}/ship`, {
      title: 'Mark as Shipped',
    });
  }

  if (order.status === 'shipped') {
    builder.link('track', `/orders/${order.id}/track`, {
      title: 'Track Shipment',
    });
  }

  // 嵌入用户资源
  builder.embed('customer', {
    _links: {
      self: { href: `/users/${order.userId}` },
    },
    id: order.userId,
    name: order.userName,
  });

  // 嵌入订单项
  builder.embed(
    'items',
    order.items.map((item) => ({
      _links: {
        self: { href: `/products/${item.productId}` },
      },
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }))
  );

  return builder.build();
}
```

#### JSON:API 实现

```typescript
// models/jsonapi.ts
interface JsonApiLink {
  self?: string;
  related?: string;
  first?: string;
  last?: string;
  prev?: string;
  next?: string;
}

interface JsonApiResource {
  type: string;
  id: string;
  attributes?: Record<string, any>;
  relationships?: Record<string, {
    data?: { type: string; id: string } | { type: string; id: string }[];
    links?: JsonApiLink;
  }>;
  links?: JsonApiLink;
  meta?: Record<string, any>;
}

// JSON:API 响应构建器
class JsonApiBuilder {
  buildOrderResponse(order: Order, baseUrl: string) {
    return {
      data: {
        type: 'orders',
        id: order.id,
        attributes: {
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
        },
        relationships: {
          customer: {
            data: { type: 'users', id: order.userId },
            links: {
              self: `${baseUrl}/orders/${order.id}/relationships/customer`,
              related: `${baseUrl}/orders/${order.id}/customer`,
            },
          },
          items: {
            data: order.items.map((item) => ({
              type: 'order-items',
              id: item.id,
            })),
            links: {
              self: `${baseUrl}/orders/${order.id}/relationships/items`,
              related: `${baseUrl}/orders/${order.id}/items`,
            },
          },
        },
        links: {
          self: `${baseUrl}/orders/${order.id}`,
        },
      },
      included: [
        {
          type: 'users',
          id: order.userId,
          attributes: {
            name: order.userName,
            email: order.userEmail,
          },
          links: {
            self: `${baseUrl}/users/${order.userId}`,
          },
        },
        ...order.items.map((item) => ({
          type: 'order-items',
          id: item.id,
          attributes: {
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          },
          links: {
            self: `${baseUrl}/order-items/${item.id}`,
            product: `${baseUrl}/products/${item.productId}`,
          },
        })),
      ],
      links: {
        self: `${baseUrl}/orders/${order.id}`,
        ...(order.status === 'pending' && {
          pay: `${baseUrl}/orders/${order.id}/pay`,
          cancel: `${baseUrl}/orders/${order.id}/cancel`,
        }),
      },
    };
  }
}
```

#### Siren 超媒体格式

```typescript
// 更丰富的动作描述
interface SirenAction {
  name: string;
  href: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  title?: string;
  type?: string;
  fields?: {
    name: string;
    type: string;
    value?: any;
    title?: string;
  }[];
}

interface SirenEntity {
  class: string[];
  properties: Record<string, any>;
  entities?: SirenEntity[];
  actions?: SirenAction[];
  links: { rel: string[]; href: string }[];
}

// Siren 订单响应
function buildSirenOrderResponse(order: Order): SirenEntity {
  const actions: SirenAction[] = [];

  if (order.status === 'pending') {
    actions.push(
      {
        name: 'pay-order',
        href: `/orders/${order.id}/pay`,
        method: 'POST',
        title: 'Pay for this order',
        type: 'application/json',
        fields: [
          {
            name: 'paymentMethod',
            type: 'select',
            title: 'Payment Method',
          },
          {
            name: 'cardToken',
            type: 'hidden',
          },
        ],
      },
      {
        name: 'cancel-order',
        href: `/orders/${order.id}/cancel`,
        method: 'POST',
        title: 'Cancel this order',
      }
    );
  }

  return {
    class: ['order'],
    properties: {
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
    },
    entities: [
      {
        class: ['customer', 'user'],
        rel: ['customer'],
        properties: {
          id: order.userId,
          name: order.userName,
        },
        links: [{ rel: ['self'], href: `/users/${order.userId}` }],
      },
    ],
    actions,
    links: [
      { rel: ['self'], href: `/orders/${order.id}` },
      { rel: ['collection'], href: '/orders' },
    ],
  };
}
```

### 10.4 优缺点分析

**优点：**

- ✅ API 自描述，客户端无需硬编码 URL
- ✅ 服务端可灵活调整 URL 结构
- ✅ 状态驱动的可用操作
- ✅ 支持客户端流程自动化

**缺点：**

- ❌ payload 体积增加
- ❌ 客户端实现复杂度提高
- ❌ 缓存策略复杂
- ❌ 生态工具支持有限

---

## 附录：技术选型决策树

```
                    ┌─────────────────────┐
                    │   API 技术选型决策   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌─────────┐      ┌─────────┐      ┌─────────┐
        │ 公开 API │      │ 内部 API │      │ 实时通信 │
        └────┬────┘      └────┬────┘      └────┬────┘
             │                │                │
      ┌──────┴──────┐   ┌────┴────┐     ┌────┴────┐
      ▼             ▼   ▼         ▼     ▼         ▼
 ┌─────────┐  ┌─────────┐ │    ┌────────┐ │  ┌────────┐  ┌─────────┐
 │ GraphQL │  │ REST+   │ │    │ tRPC   │ │  │ WebSocket│ │ Webhook │
 │ 复杂查询 │  │ OpenAPI │ │    │ TS生态 │ │  │ 双向实时 │ │ 事件推送 │
 └─────────┘  └─────────┘ │    └────────┘ │  └────────┘  └─────────┘
                          │               │
                    ┌─────┴─────┐   ┌─────┴─────┐
                    │  高性能   │   │ 跨语言    │
                    └─────┬─────┘   └─────┬─────┘
                          │               │
                    ┌─────┴─────┐   ┌─────┴─────┐
                    │   gRPC    │   │  RESTful  │
                    └───────────┘   └───────────┘
```

---

*文档版本: 1.0.0 | 最后更新: 2026-04-08*
