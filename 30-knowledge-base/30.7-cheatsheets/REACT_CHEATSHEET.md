# React 速查表（2026）

> **定位**：`30-knowledge-base/30.7-cheatsheets/`
> **权威参考**：[react.dev](https://react.dev) | [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19) | [Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)

---

## Hooks 速查

| Hook | 用途 | 依赖 | 版本 |
|------|------|------|------|
| `useState` | 状态管理 | — | 16.8+ |
| `useReducer` | 复杂状态逻辑 | — | 16.8+ |
| `useEffect` | 副作用 | deps 数组 | 16.8+ |
| `useLayoutEffect` | 同步副作用（DOM测量） | deps 数组 | 16.8+ |
| `useRef` | 可变引用 / DOM 访问 | — | 16.8+ |
| `useMemo` | 缓存计算值 | deps 数组 | 16.8+ |
| `useCallback` | 缓存函数引用 | deps 数组 | 16.8+ |
| `useContext` | 上下文消费 | Context | 16.8+ |
| `useId` | 生成唯一 ID | — | 18.0+ |
| `useTransition` | 非紧急更新 | — | 18.0+ |
| `useDeferredValue` | 延迟值 | value | 18.0+ |
| `useActionState` | 表单状态（React 19） | action | 19.0+ |
| `useOptimistic` | 乐观更新（React 19） | — | 19.0+ |
| `use` | 读取 Promise / Context（React 19） | Promise / Context | 19.0+ |

---

## React 19 新特性

| 特性 | 说明 | 代码示例 |
|------|------|----------|
| **Server Components** | 服务端执行，减少客户端 JS | `async function Page() { const data = await fetch(...) }` |
| **Actions** | 表单自动提交 + 乐观更新 | `<form action={submitAction}>` |
| **React Compiler** | 自动记忆化，无需 useMemo | 自动优化，零配置 |
| **Document Metadata** | 原生 `<title>` / `<meta>` 支持 | 直接在组件中写 `<title>` |
| **Asset Loading** | 内置 `preload` / `prefetch` | `<link rel="preload" href={font} as="font" />` |
| **`use()` Hook** | 统一读取 Promise 和 Context | `const data = use(promise)` |

---

## Server Components vs Client Components

| 维度 | Server Component | Client Component |
|------|-----------------|------------------|
| **执行环境** | 服务端（Node.js / Edge） | 浏览器 |
| **包体积** | 零客户端代码 | 需打包到 bundle |
| **数据获取** | 直接访问 DB / API，无序列化 | `useEffect` + fetch |
| **状态/交互** | ❌ 不支持 useState、事件 | ✅ 完整 Hooks 支持 |
| **第三方库** | 服务端 Node.js 库 | 浏览器兼容库 |
| **文件指示** | 默认（无指令） | `'use client'` |
| **使用场景** | 数据展示、SEO、静态内容 | 交互、动画、DOM 操作 |

> 📖 参考：[react.dev/reference/react/use-client](https://react.dev/reference/react/use-client) | [react.dev/reference/react/use-server](https://react.dev/reference/react/use-server)

---

## 代码示例

### `use` Hook 读取异步数据

```tsx
import { use, Suspense } from 'react';

function Comments({ commentsPromise }) {
  // `use` 可以放在 if、循环中（不像 Hooks 严格限制）
  const comments = use(commentsPromise);
  return (
    <ul>
      {comments.map(c => <li key={c.id}>{c.text}</li>)}
    </ul>
  );
}

function Page({ commentsPromise }) {
  return (
    <Suspense fallback={<div>Loading comments...</div>}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  );
}
```

> 📖 参考：[react.dev/reference/react/use](https://react.dev/reference/react/use)

### Form Actions 自动提交

```tsx
import { useActionState } from 'react';

async function submitAction(prevState, formData) {
  'use server';
  const name = formData.get('name');
  await db.user.create({ name });
  return { success: true, message: `Created user: ${name}` };
}

export default function Form() {
  const [state, action, isPending] = useActionState(submitAction, null);

  return (
    <form action={action}>
      <input name="name" placeholder="Enter name" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {state?.success && <p>{state.message}</p>}
    </form>
  );
}
```

> 📖 参考：[react.dev/reference/react/useActionState](https://react.dev/reference/react/useActionState)

### `useOptimistic` 乐观更新

```tsx
import { useOptimistic, useState, useRef } from 'react';

export default function Thread({ messages, sendMessage }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { ...newMessage, sending: true }]
  );

  async function formAction(formData) {
    const text = formData.get('message');
    addOptimisticMessage({ text });
    await sendMessage(text);
  }

  return (
    <div>
      {optimisticMessages.map((msg, i) => (
        <div key={i} style={{ opacity: msg.sending ? 0.5 : 1 }}>
          {msg.text}
        </div>
      ))}
      <form action={formAction}>
        <input name="message" placeholder="Say something..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

> 📖 参考：[react.dev/reference/react/useOptimistic](https://react.dev/reference/react/useOptimistic)

### Context + memo 避免不必要的重渲染

```tsx
// optimized-context.tsx — 优化 Context 性能
import { createContext, useContext, useState, useMemo, memo } from 'react';

// 将状态和 dispatch 分离到两个 Context，避免消费 dispatch 的组件重渲染
const CountStateContext = createContext<number>(0);
const CountDispatchContext = createContext<React.Dispatch<React.SetStateAction<number>>>(() => {});

function CountProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  // 使用 useMemo 保持 dispatch 引用稳定
  const dispatch = useMemo(() => setCount, []);
  return (
    <CountStateContext.Provider value={count}>
      <CountDispatchContext.Provider value={dispatch}>
        {children}
      </CountDispatchContext.Provider>
    </CountStateContext.Provider>
  );
}

// 只读取状态
const Display = memo(function Display() {
  const count = useContext(CountStateContext);
  console.log('Display rendered');
  return <p>Count: {count}</p>;
});

// 只读取 dispatch
const Buttons = memo(function Buttons() {
  const setCount = useContext(CountDispatchContext);
  console.log('Buttons rendered');
  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      <button onClick={() => setCount((c) => c - 1)}>-</button>
    </div>
  );
});

export default function App() {
  return (
    <CountProvider>
      <Display />
      <Buttons />
    </CountProvider>
  );
}
```

### Error Boundary 类组件

```tsx
// error-boundary.tsx — 错误边界捕获子组件错误
import { Component, ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // 可上报到 Sentry 等监控服务
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 使用
<ErrorBoundary fallback={<p>Something went wrong.</p>}>
  <MyComponent />
</ErrorBoundary>
```

### React Compiler（React 19 自动记忆化）

```tsx
// React Compiler 自动处理记忆化，无需手动 useMemo/useCallback
// 安装：npm install -D babel-plugin-react-compiler
// babel.config.js:
/*
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', {}],
  ],
};
*/

// 以下代码在 React Compiler 下自动优化，无需 useMemo
function ExpensiveList({ items, filter }: { items: string[]; filter: string }) {
  // 编译器自动插入记忆化缓存
  const filtered = items.filter((item) => item.includes(filter));

  return (
    <ul>
      {filtered.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
```

> 📖 参考：[react.dev/learn/react-compiler](https://react.dev/learn/react-compiler)

### 自定义 Hook：useLocalStorage

```tsx
// use-local-storage.ts — 持久化状态 Hook
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [key]
  );

  // 监听其他标签页的 storage 变化
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStored(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  return [stored, setValue];
}

// 使用
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  return (
    <button onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}>
      Current: {theme}
    </button>
  );
}
```

### useDeferredValue + Suspense 组合模式

```tsx
// deferred-search.tsx — 搜索框输入不阻塞列表渲染
import { useState, useDeferredValue, Suspense } from 'react';

function SearchResults({ query }: { query: string }) {
  // 模拟异步搜索（实际中可能是 fetch + Suspense）
  const results = use(query); // React 19 use() Hook
  return (
    <ul>
      {results.map((r) => (
        <li key={r.id}>{r.name}</li>
      ))}
    </ul>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const isStale = query !== deferredQuery;

  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <Suspense fallback={<p>Loading results...</p>}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </div>
  );
}
```

---

## 性能优化检查清单

- [ ] 使用 React Compiler（React 19+）
- [ ] 大数据列表使用虚拟化（react-window）
- [ ] 图片懒加载 + 响应式
- [ ] Code Splitting（React.lazy + Suspense）
- [ ] 避免 Context 滥用（考虑 Signals）
- [ ] useMemo/useCallback 仅用于昂贵计算
- [ ] Server Components 优先处理数据展示层
- [ ] 使用 `<Suspense>` 包裹异步边界

---

## 权威参考与外部链接

| 资源 | 描述 | 链接 |
|------|------|------|
| React 官方文档 | React 核心文档 | [react.dev](https://react.dev) |
| React 19 发布公告 | React 19 新特性详解 | [react.dev/blog/2024/12/05/react-19](https://react.dev/blog/2024/12/05/react-19) |
| React Compiler | 自动记忆化编译器 | [react.dev/learn/react-compiler](https://react.dev/learn/react-compiler) |
| Server Components RFC | RFC 设计文档 | [github.com/reactjs/rfcs/blob/main/text/0188-server-components.md](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md) |
| React TypeScript Cheatsheet | TS + React 最佳实践 | [react-typescript-cheatsheet.netlify.app](https://react-typescript-cheatsheet.netlify.app/) |
| Next.js App Router | React 服务端组件框架 | [nextjs.org/docs/app](https://nextjs.org/docs/app) |
| Remix | 全栈 React 框架 | [remix.run](https://remix.run) |
| TanStack Query | 服务端状态管理 | [tanstack.com/query/latest](https://tanstack.com/query/latest) |
| Zustand | 轻量状态管理 | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand) |
| Jotai / Recoil | 原子化状态管理 | [jotai.org](https://jotai.org) |
| React Use — Hooks 集合 | 实用 Hooks 库 | [github.com/streamich/react-use](https://github.com/streamich/react-use) |
| React Patterns | React 设计模式 | [reactpatterns.com](https://reactpatterns.com/) |
| Advanced React Patterns | 高级模式教程 | [kentcdodds.com/blog](https://kentcdodds.com/blog) |
| React Performance Optimization | 性能优化指南 | [web.dev/articles/react](https://web.dev/articles/react) |
| React DevTools | 浏览器调试扩展 | [chrome.google.com/webstore/detail/react-developer-tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) |
| Redux Toolkit | 状态管理 | [redux-toolkit.js.org](https://redux-toolkit.js.org) |
| React Router | 客户端路由 | [reactrouter.com](https://reactrouter.com) |
| Framer Motion | 动画库 | [www.framer.com/motion/](https://www.framer.com/motion/) |

*速查表仅列核心 API，详细用法参见 [react.dev](https://react.dev)。*
