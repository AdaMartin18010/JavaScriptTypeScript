# 全栈模式 — 理论基础

## 1. T3 栈

现代 TypeScript 全栈的标准组合：

- **Next.js**: React 框架，支持 SSR/SSG/API Routes
- **tRPC**: 端到端类型安全的 API
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Prisma**: 类型安全的 ORM
- **NextAuth.js**: 认证方案

核心优势：**全栈类型安全**，从前端到数据库的类型自动推断。

## 2. 全栈类型安全

```typescript
// 服务端定义 API
const appRouter = router({
  post: { list: publicProcedure.query(() => db.post.findMany()) }
})

// 客户端自动获得类型
const posts = trpc.post.list.useQuery() // posts.data 类型为 Post[]
```

## 3. 数据流模式

- **Server Components**: 服务端直接查询数据库，零客户端 JS
- **Client Components**: 交互式组件，通过 tRPC/GraphQL 获取数据
- **Server Actions**: 表单直接提交到服务端函数

## 4. 与相邻模块的关系

- **18-frontend-frameworks**: 前端框架
- **19-backend-development**: 后端开发
- **20-database-orm**: 数据库与 ORM
