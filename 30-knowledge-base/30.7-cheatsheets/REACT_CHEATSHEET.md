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

*速查表仅列核心 API，详细用法参见 [react.dev](https://react.dev)。*
