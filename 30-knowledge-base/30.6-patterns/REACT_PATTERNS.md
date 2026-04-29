# React 设计模式（2026 版）

> React 生态常用设计模式与最佳实践速查。
> **权威参考**: [React Patterns](https://reactpatterns.com/) | [Patterns.dev — React](https://www.patterns.dev/react/) | [React Documentation](https://react.dev/learn/thinking-in-react) | [Epic React by Kent C. Dodds](https://epicreact.dev/)

---

## 组件模式

| 模式 | 说明 | 示例 | 适用版本 |
|------|------|------|----------|
| **Compound Components** | 相关组件共享隐式状态 | `<Select><Option /></Select>` | 全版本 |
| **Render Props** | 通过 props 传递渲染逻辑 | `<Mouse render={pos => <div />} />` | 全版本 |
| **HOC** | 高阶组件复用逻辑 | `withAuth(Component)` | 全版本 |
| **Custom Hooks** | 提取可复用状态逻辑 | `useLocalStorage`, `useFetch` | 16.8+ |
| **Container/Presentational** | 分离数据与展示 | Container 获取数据，Presentational 渲染 | 全版本 |
| **Server Components** | 服务端渲染 + 客户端水合 | `async function Page()` + `'use client'` | 19+ |
| **Server Actions** | 服务端函数直接绑定表单 | `<form action={submitAction}>` | 19+ |

---

## 模式对比：Container/Presentational vs Hooks vs RSC

| 维度 | Container/Presentational | Hooks Pattern | React Server Components |
|------|-------------------------|---------------|------------------------|
| **数据获取位置** | Container (Class Component) | Hook 内部 (`useEffect`) | 服务端直接获取 |
| **代码复用方式** | HOC / Render Props | Custom Hook | Server function import |
| **测试难度** | Presentational 易测 | Hook 需 `renderHook` | Server 部分 Node 测试 |
| **性能特点** | 两棵树渲染 | 函数重执行 + memo | 零客户端 JS（静态部分） |
| **心智负担** | 低（清晰分层） | 中（依赖数组陷阱） | 中（网络边界意识） |
| **2026 推荐度** | ⭐⭐（被 Hooks 替代） | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐（React 19 主推） |
| **适用场景** | 遗留项目维护 | 客户端交互组件 | 数据展示、SEO、静态内容 |

> 📖 参考：[Presentational vs Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) | [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)

---

## 性能模式

| 模式 | 说明 | 2026 建议 |
|------|------|----------|
| **React.memo** | 纯组件 props 不变跳过渲染 | 配合 React Compiler 自动处理 |
| **useMemo / useCallback** | 缓存 expensive 计算和回调 | React 19 Compiler 逐步淘汰手动使用 |
| **Virtualization** | 仅渲染视口内列表项（react-window） | 大数据列表必备 |
| **Code Splitting** | 动态导入减少初始包（React.lazy + Suspense） | 路由级分割标配 |
| **Streaming SSR** | `<Suspense>` 流式传输，渐进渲染 | Next.js App Router 默认 |
| **Server Components** | 静态部分服务端渲染，无客户端 JS | 优先用于数据展示 |

---

## 状态模式

| 模式 | 适用场景 | 2026 推荐 |
|------|---------|----------|
| **Lifting State Up** | 兄弟组件共享状态 | 简单场景 |
| **State Reducer** | 复杂状态逻辑，需外部控制 | `useReducer` + Immer |
| **Provider Pattern** | 深层组件树共享状态 | Zustand / Jotai 替代原生 Context |
| **Signals** | 细粒度响应式，避免 Virtual DOM 开销 | Preact Signals / 外部库 |
| **URL as State** | 可分享、可回退的 UI 状态 | TanStack Router / Nuqs |

---

## 代码示例

### Container/Presentational Pattern（经典分层）

```tsx
// components/UserList.tsx — Presentational Component
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserListProps {
  users: User[];
  loading: boolean;
  onSelect: (id: number) => void;
}

export function UserList({ users, loading, onSelect }: UserListProps) {
  if (loading) return <div>Loading users...</div>;
  return (
    <ul className="user-list">
      {users.map(user => (
        <li key={user.id} onClick={() => onSelect(user.id)}>
          {user.name} — {user.email}
        </li>
      ))}
    </ul>
  );
}

// containers/UserListContainer.tsx — Container Component
import { useState, useEffect } from 'react';
import { UserList } from '../components/UserList';

export function UserListContainer() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false); });
  }, []);

  const handleSelect = (id: number) => {
    console.log('Selected user:', id);
  };

  return <UserList users={users} loading={loading} onSelect={handleSelect} />;
}
```

> 📖 参考：[Container Components](https://medium.com/@learnreact/container-components-c0e67432e005)

### Custom Hook Pattern（现代替代方案）

```tsx
// hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}

// components/UserListModern.tsx
import { useUsers } from '../hooks/useUsers';

export function UserListModern() {
  const { users, loading, error, refetch } = useUsers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message} <button onClick={refetch}>Retry</button></div>;

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

> 📖 参考：[Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) | [React Use Hooks](https://usehooks.com/)

### React Server Components + Client Components（2026 最佳实践）

```tsx
// app/page.tsx — Server Component (default)
import { UserListClient } from './UserListClient';

async function fetchUsers(): Promise<User[]> {
  const res = await fetch('https://api.example.com/users', { next: { revalidate: 60 } });
  return res.json();
}

export default async function UsersPage() {
  const users = await fetchUsers(); // 服务端直接获取，无客户端 JS

  return (
    <main>
      <h1>Users</h1>
      <p>Server-rendered at {new Date().toISOString()}</p>
      {/* Client Component for交互部分 */}
      <UserListClient initialUsers={users} />
    </main>
  );
}

// app/UserListClient.tsx — Client Component
'use client';

import { useState } from 'react';

interface UserListClientProps {
  initialUsers: User[];
}

export function UserListClient({ initialUsers }: UserListClientProps) {
  const [users] = useState(initialUsers);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <ul>
      {users.map(user => (
        <li
          key={user.id}
          onClick={() => setSelectedId(user.id)}
          style={{ fontWeight: selectedId === user.id ? 'bold' : 'normal' }}
        >
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

> 📖 参考：[Server Components](https://react.dev/reference/react/use-server) | [Client Components](https://react.dev/reference/react/use-client) | [Next.js App Router](https://nextjs.org/docs/app)

---

## 模式演进时间线

```
2013 ─── 2015 ─── 2016 ─── 2018 ─── 2019 ─── 2020 ─── 2023 ─── 2024 ─── 2026
 │        │        │        │        │        │        │        │        │
Mixins   HOC      Class    Render   Hooks    Context  RSC      Server   React
(anti)   (peak)   Compo-   Props    (v16.8)  + Redux  (beta)   Actions  Compiler
         │        nents           (peak)   → Zustand         (v19)
         │        (peak)
         │
2026 推荐: Server Components 优先 → Client Components 补充交互 → Custom Hooks 复用逻辑
```

---

*最后更新: 2026-04-29*
