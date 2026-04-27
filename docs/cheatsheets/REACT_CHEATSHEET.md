---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# React 19+ 速查表 (React 19+ Cheatsheet)

> 💡 本速查表针对 React 19+ / React Compiler 时代编写，覆盖 Hooks、Server/Client Components、Suspense 及新特性。

---

## 目录

1. [Hooks 总览](#hooks-总览)
2. [React Compiler](#react-compiler)
3. [Server Components vs Client Components](#server-components-vs-client-components)
4. [Suspense 模式](#suspense-模式)
5. [React 19 新特性](#react-19-新特性)
6. [快速代码片段](#快速代码片段)

---

## Hooks 总览

### 状态管理 (State Management)

| Hook | 用途 | 基本用法 |
|------|------|----------|
| `useState` | 组件状态 | `const [count, setCount] = useState(0)` |
| `useReducer` | 复杂状态逻辑 | `const [state, dispatch] = useReducer(reducer, init)` |
| `useContext` | 跨层级共享数据 | `const value = useContext(MyContext)` |
| `useRef` | 持久化可变值 / DOM 引用 | `const ref = useRef(null)` |

```tsx
// useState 函数式更新
setCount(prev => prev + 1);

// useReducer 示例
function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    default: return state;
  }
}
```

> ⚠️ `useState` 的初始值若依赖复杂计算，应使用懒加载：`useState(() => compute())`。

### 副作用与生命周期 (Side Effects & Lifecycle)

| Hook | 用途 | 注意事项 |
|------|------|----------|
| `useEffect` | 副作用处理 | 依赖数组 (`dependency array`) 必须完整 |
| `useLayoutEffect` | 同步布局副作用 | 阻塞绘制，谨慎使用 |
| `useEffectEvent` | React 19 实验性：在 effect 中读取最新 props/state 而不触发重新执行 | 见 [React 19 新特性](#react-19-新特性) |

```tsx
useEffect(() => {
  const handler = () => console.log('resize');
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

> ⚠️ 忘记清理事件订阅/定时器会导致内存泄漏。

### 性能优化 (Performance)

| Hook | 用途 | 适用场景 |
|------|------|----------|
| `useCallback` | 缓存函数引用 | 子组件依赖函数 prop 时 |
| `useMemo` | 缓存计算结果 | 复杂计算、对象/数组稳定引用 |
| `useTransition` | 标记非紧急更新 | 大量列表过滤、路由切换 |
| `useDeferredValue` | 延迟更新部分 UI | 搜索输入 + 结果列表 |

```tsx
const memoizedValue = useMemo(() => compute(a, b), [a, b]);
const memoizedFn = useCallback(() => doSomething(a), [a]);

// useTransition
const [isPending, startTransition] = useTransition();
startTransition(() => setQuery(newQuery));
```

> 💡 React Compiler 自动处理大量 `useMemo` / `useCallback` 场景，未来可能减少手动使用。

### 高级 Hooks

| Hook | 用途 | 示例 |
|------|------|------|
| `useId` | 生成唯一稳定 ID（SSR 安全） | `const id = useId();` |
| `useSyncExternalStore` | 订阅外部 store | `const snapshot = useSyncExternalStore(subscribe, getSnapshot)` |
| `useActionState` | React 19：表单 action 状态管理 | 见下方 |
| `useOptimistic` | React 19：乐观更新 | 见下方 |
| `use` | React 19：读取 Promise / Context | `const data = use(promise)` |

```tsx
// useId
const inputId = useId();
<label htmlFor={inputId}>Name</label>
<input id={inputId} />

// useSyncExternalStore
const width = useSyncExternalStore(
  callback => {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
  },
  () => window.innerWidth
);
```

---

## React Compiler

React Compiler 是新一代编译时优化工具，自动为组件和 Hooks 添加记忆化（memoization）。

| 项目 | 说明 |
|------|------|
| 目标 | 自动消除不必要的重渲染 |
| 前提 | 代码遵循 React 规则（Rule of React） |
| 配置 | Babel 插件或 Vite/Rspack 插件 |
| 兼容性 | 支持 React 17+，最佳体验在 React 19+ |

```bash
# 安装
npm install -D babel-plugin-react-compiler

# babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', { target: '19' }],
  ],
};
```

> 💡 启用 Compiler 后，大量手动 `useMemo` / `useCallback` 可被移除，但保留也无害。

> ⚠️ 若代码不遵循 Rules of React（如在渲染阶段修改 ref、条件调用 Hook），Compiler 会报告错误。

---

## Server Components vs Client Components

### 对比表

| 特性 | Server Components (RSC) | Client Components |
|------|------------------------|-------------------|
| 运行环境 | 服务端 | 浏览器 |
| 包体积 | 零 JS  bundle 体积 | 计入 bundle |
| 数据源 | 直接访问数据库 / API | 通过 fetch / 客户端请求 |
| 状态/交互 | 不支持 useState / 事件 | 完整支持所有 Hooks |
| 使用方式 | 默认（App Router） | 文件顶部加 `'use client'` |
| 子组件 | 可嵌套 Server / Client | 只可嵌套 Client |

```tsx
// Server Component (默认)
import { db } from '@/db';

export default async function ProductList() {
  const products = await db.query('SELECT * FROM products');
  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}

// Client Component
'use client';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

> 💡 优先使用 Server Component，只在需要交互/浏览器 API 时降级为 Client Component。

> ⚠️ 不要把 `'use client'` 放在根布局或高频复用组件上，否则子树全部变为客户端组件。

---

## Suspense 模式

Suspense 让你在组件等待异步数据时显示 fallback UI。

| 场景 | 用法 |
|------|------|
| 数据获取 | `<Suspense fallback={<Spinner />}><ProfileData /></Suspense>` |
| 懒加载组件 | `const Heavy = lazy(() => import('./Heavy'));` |
| Streaming SSR | Next.js App Router 自动流式传输 Suspense 边界 |

```tsx
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Comments />
    </Suspense>
  );
}

// 配合 React 19 use()
function Comments() {
  const comments = use(fetchComments()); // 在 Client Component 中亦可使用
  return comments.map(c => <p key={c.id}>{c.body}</p>);
}
```

> 💡 在 Next.js App Router 中，异步 Server Component 会自动被 Suspense 包裹处理。

> ⚠️ `use` 不同于 `await`，它可以在常规函数（非 async）和条件语句中调用，但必须在 Component 或 Hook 内。

---

## React 19 新特性

### 1. Activity (以前叫 Offscreen)

保持组件状态的同时隐藏 UI，适用于标签页切换、模态框堆栈等场景。

```tsx
import { Activity } from 'react';

function Tabs({ activeTab }) {
  return (
    <>
      <Activity mode={activeTab === 'home' ? 'visible' : 'hidden'}>
        <HomeTab />
      </Activity>
      <Activity mode={activeTab === 'settings' ? 'visible' : 'hidden'}>
        <SettingsTab />
      </Activity>
    </>
  );
}
```

> 💡 `mode="hidden"` 时组件状态保留，但不渲染到 DOM；切换回来时无需重新初始化。

### 2. useEffectEvent (实验性)

解决 effect 中依赖频繁变化导致重复执行的问题。

```tsx
import { useEffect, useEffectEvent } from 'react';

function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    // 始终读取最新 theme，但不会导致 effect 重新订阅
    console.log(theme);
  });

  useEffect(() => {
    const conn = createConnection(roomId);
    conn.connect();
    onConnected();
    return () => conn.disconnect();
  }, [roomId]); // theme 不需要加入依赖数组
}
```

> ⚠️ `useEffectEvent` 返回的函数只能在 `useEffect` 内部调用，不可在 JSX 事件处理器中使用。

### 3. Form Actions

原生表单与 React 深度集成，无需 `onSubmit` + `preventDefault` 样板代码。

```tsx
// Server Action (Server Component 或独立文件)
async function createUser(formData: FormData) {
  'use server';
  const name = formData.get('name');
  await db.user.create({ name });
}

// Client
export default function Form() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 4. useActionState

管理表单 action 的提交状态和返回结果。

```tsx
import { useActionState } from 'react';

async function increment(prevState, formData) {
  return prevState + 1;
}

function Counter() {
  const [state, formAction, isPending] = useActionState(increment, 0);

  return (
    <form action={formAction}>
      <p>Count: {state}</p>
      <button type="submit" disabled={isPending}>+1</button>
    </form>
  );
}
```

> 💡 `isPending` 自动反映 action 执行状态，无需手动维护 `useState`。

### 5. useOptimistic

在执行异步操作前立即更新 UI，失败时自动回滚。

```tsx
import { useOptimistic, useState } from 'react';

function Messages({ messages }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { ...newMessage, sending: true }]
  );

  async function sendMessage(formData) {
    const message = formData.get('message');
    addOptimisticMessage({ text: message });
    await api.sendMessage(message);
  }

  return (
    <>
      {optimisticMessages.map(m => (
        <div key={m.id} style={{ opacity: m.sending ? 0.5 : 1 }}>
          {m.text}
        </div>
      ))}
      <form action={sendMessage}>
        <input name="message" />
        <button type="submit">发送</button>
      </form>
    </>
  );
}
```

> ⚠️ 乐观更新只应在用户可感知的即时反馈场景使用，确保失败时有重试或提示机制。

---

## 快速代码片段

### 自定义 Hook 模板

```tsx
function useCustomHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 副作用
    return () => {
      // 清理
    };
  }, [value]);

  return { value, setValue, ref };
}
```

### Context + Hook 组合

```tsx
const ThemeContext = createContext('light');

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### Ref 转发

```tsx
import { forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input ref={ref} {...props} />
);
Input.displayName = 'Input';
```

### Error Boundary (类组件)

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack);
  }

  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
```

---

## 版本速查

| 版本 | 关键特性 |
|------|----------|
| React 18 | Concurrent Rendering, Suspense on server, Transitions, new useId/useSyncExternalStore/useDeferredValue/useTransition |
| React 19 | Compiler, Server Actions, useActionState, useOptimistic, use, Activity, useEffectEvent, Form Actions |

---

*最后更新：2026-04*
