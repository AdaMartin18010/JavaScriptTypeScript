---
title: 02 RSC 深度解析
description: 深入理解 React Server Components 的渲染流程、RSC Payload 格式、服务端与客户端组件边界、以及混合架构设计模式。
---

# 02 React Server Components (RSC) 深度解析

> **前置知识**：React 组件生命周期、JSX、Next.js App Router 基础
>
> **目标**：理解 RSC 的完整渲染流程、Payload 格式、组件边界决策，以及 RSC 对应用架构的影响

---

## 1. RSC 的核心概念

### 1.1 什么是 Server Component？

```tsx
// Server Component（默认）— 只在服务端运行
// ✅ 可以直接访问数据库
// ✅ 不发送组件代码到客户端
// ❌ 不能使用 useState、useEffect 等 Hooks
// ❌ 不能监听浏览器事件

async function UserProfile({ userId }: { userId: string }) {
  const user = await db.users.findById(userId);  // 直接访问数据库
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

```tsx
// Client Component — 在服务端预渲染 + 客户端激活
// ✅ 可以使用所有 Hooks
// ✅ 可以监听浏览器事件
// ❌ 不能直接访问数据库
// 'use client' 指令标记

'use client';

import { useState } from 'react';

function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  return <button onClick={() => setLikes(l => l + 1)}>♥ {likes}</button>;
}
```

### 1.2 两种组件的对比

| 特性 | Server Component | Client Component |
|------|-----------------|------------------|
| 运行环境 | 服务端 only | 服务端（预渲染）+ 客户端 |
| 发送到客户端的代码 | 不发送 JS | 发送完整组件代码 |
| 数据获取 | 直接访问 DB/API | 通过 useEffect / SWR |
| 状态管理 | 不支持 useState | 支持所有 Hooks |
| 浏览器 API | 不可用 | 可用 |
| 包体积影响 | 零（服务端代码不打包） | 增加 bundle 体积 |
| SEO | 完美（完整 HTML） | 依赖预渲染 |

---

## 2. RSC 渲染流程

### 2.1 请求-响应完整流程

```
┌─────────────┐      ┌─────────────────┐      ┌─────────────┐
│   Browser   │ ──1─> │  Next.js Server │ ──2─> │   Database  │
│             │       │                 │       │             │
│  1. 请求 URL │       │  2. 获取数据     │       │             │
│             │ <─3── │                 │       │             │
│  3. 接收     │       │  4. 渲染 RSC     │       │             │
│  RSC Payload │       │  5. 生成 HTML    │       │             │
│             │       │  6. 返回响应      │       │             │
└─────────────┘       └─────────────────┘       └─────────────┘
```

### 2.2 RSC Payload 格式

RSC Payload 是一种紧凑的二进制格式，包含：

- **服务端组件渲染结果**（HTML 或虚拟 DOM 描述）
- **客户端组件引用**（占位符，由客户端 Hydrate）
- **插槽引用**（子组件的位置标记）

```tsx
// 服务端渲染后的 RSC Payload 简化示意
{
  "type": "div",
  "props": {
    "children": [
      { "type": "h1", "props": { "children": "Alice" } },
      { "type": "p", "props": { "children": "alice@example.com" } },
      // Client Component 占位符
      { "type": "$L1", "props": { "initialLikes": 42 } }
    ]
  }
}
```

---

## 3. 服务端-客户端边界

### 3.1 边界规则

```tsx
// app/page.tsx — Server Component
import { UserProfile } from './UserProfile';      // Server Component
import { LikeButton } from './LikeButton';        // Client Component

export default function Page() {
  return (
    <div>
      <UserProfile userId="123" />   {/* 服务端渲染 */}
      <LikeButton initialLikes={42} /> {/* 客户端激活 */}
    </div>
  );
}
```

**关键规则**：

1. Server Component 可以导入 Client Component
2. Client Component **不能**导入 Server Component（但可以作为 children 传入）
3. 通过 props 传递 Server Component 渲染结果为 Client Component 的 children

### 3.2 组合模式：Server Component 作为 Children

```tsx
// app/Card.tsx — Client Component
'use client';

export function Card({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div className="card" onClick={onClick}>
      {children}
    </div>
  );
}

// app/page.tsx — Server Component
import { Card } from './Card';

async function UserInfo({ userId }: { userId: string }) {
  const user = await db.users.findById(userId);
  return (
    <>
      <h2>{user.name}</h2>
      <p>Joined: {user.createdAt.toLocaleDateString()}</p>
    </>
  );
}

export default function Page() {
  return (
    <Card>
      {/* ✅ Server Component 作为 Client Component 的 children */}
      <UserInfo userId="123" />
    </Card>
  );
}
```

### 3.3 Context 跨越边界

```tsx
// app/providers.tsx — Client Provider
'use client';

import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

// app/layout.tsx — Server Layout 包裹 Client Provider
import { ThemeProvider } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**最佳实践**：

- 在 Server Layout 中包裹 Client Provider
- 将 Context 使用下沉到需要的子树，避免全树 Client Component 化

---

## 4. 数据获取模式

### 4.1 服务端直接获取

```tsx
// ✅ 推荐：在需要数据的组件内部获取
async function PostList() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 },  // ISR：每 60 秒重新验证
  });
  const data = await posts.json();

  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### 4.2 避免请求瀑布

```tsx
// ❌ 瀑布请求：串行获取
async function Page() {
  const user = await getUser();      // 请求 1
  const posts = await getPosts();    // 请求 2（等待请求 1 完成）
  const comments = await getComments(); // 请求 3（等待请求 2 完成）
  return <div>...</div>;
}

// ✅ 并行获取：Promise.all
async function Page() {
  const [user, posts, comments] = await Promise.all([
    getUser(),
    getPosts(),
    getComments(),
  ]);
  return <div>...</div>;
}

// ✅ 更优：让子组件各自获取（利用 Streaming）
export default function Page() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <PostList />
      </Suspense>
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentList />
      </Suspense>
    </div>
  );
}
```

---

## 5. RSC 架构设计模式

### 5.1 叶子组件为 Client Component

```
Page (Server)
├── Header (Server)
│   └── NavButton (Client)  ← 最小化的交互组件
├── Content (Server)
│   ├── Article (Server)
│   └── LikeButton (Client) ← 最小化的交互组件
└── Footer (Server)
```

**原则**：只在真正需要交互的地方使用 Client Component，其余保持 Server Component。

### 5.2 组件树分析

```tsx
// 分析你的组件树，标记 Client Component 边界
// 🟢 Server Component（默认）
// 🔴 Client Component（需要 'use client'）

// app/page.tsx 🟢
import { Header } from './Header';           // 🟢
import { ProductGrid } from './ProductGrid'; // 🟢
import { NewsletterForm } from './NewsletterForm'; // 🔴（需要表单状态）

export default function HomePage() {
  return (
    <div>
      <Header />           {/* 🟢 纯展示 */}
      <ProductGrid />      {/* 🟢 服务端获取数据 */}
      <NewsletterForm />   {/* 🔴 客户端表单交互 */}
    </div>
  );
}
```

---

## 6. 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **滥用 'use client'** | 在顶层导入 Client Component 导致整个子树客户端化 | 将 'use client' 限制在最小必要范围 |
| **Server Component 中不能用 Hooks** | 尝试在 Server Component 中使用 useState | 将状态逻辑提取到 Client Component |
| **fetch 默认缓存** | Next.js 15 中 fetch 默认不缓存 | 显式设置 `{ cache: 'force-cache' }` 或 `next: { revalidate }` |
| **Server Action 在 RSC 中直接调用** | RSC 中调用 Server Action 需要在 Client Component 中触发 | 使用表单或事件处理器间接调用 |

---

## 练习

1. 设计一个电商页面：商品列表（Server Component）+ 购物车按钮（Client Component）+ 添加到购物车 Server Action。
2. 实现一个博客系统：文章列表 Server Component，搜索框 Client Component，搜索结果通过 URL query 参数触发服务端重新渲染。
3. 分析一个现有 React 应用，画出其 Server/Client 组件边界图。

---

## 延伸阅读

- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Dan Abramov — The Two Reacts](https://overreacted.io/the-two-reacts/)
