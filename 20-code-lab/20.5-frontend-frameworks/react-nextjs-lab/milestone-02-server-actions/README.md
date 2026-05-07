# M2: Server Actions 实战实验

## 目标

掌握 Server Actions 的声明、调用、错误处理、乐观更新等生产级模式。

## 实验环境

基于 M1 的 `rsc-lab` 项目继续开发。

## 实验任务

### 任务 1: 基础 Server Action

```tsx
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string;

  // 模拟数据库操作
  await db.todo.create({ data: { title, completed: false } });

  revalidatePath('/todos');
}

// app/todos/page.tsx
import { createTodo } from '../actions';

export default function TodosPage() {
  return (
    <form action={createTodo}>
      <input name="title" placeholder="New todo" required />
      <button type="submit">Add</button>
    </form>
  );
}
```

### 任务 2: 渐进增强表单

实现一个无 JavaScript 也能工作的表单，然后在有 JS 时增强体验：

```tsx
'use client';

import { useFormStatus } from 'react-dom';
import { createTodo } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending}>
      {pending ? 'Adding...' : 'Add Todo'}
    </button>
  );
}

export function TodoForm() {
  return (
    <form action={createTodo}>
      <input name="title" required />
      <SubmitButton />
    </form>
  );
}
```

### 任务 3: 乐观更新

```tsx
'use client';

import { useOptimistic } from 'react';
import { createTodo } from './actions';

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function handleSubmit(formData: FormData) {
    const title = formData.get('title') as string;
    addOptimisticTodo({ id: Date.now(), title, completed: false });
    await createTodo(formData);
  }

  return (
    <form action={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

## 验证清单

- [ ] 禁用 JavaScript 后表单仍可提交
- [ ] 启用 JavaScript 后有加载状态
- [ ] 乐观更新时 UI 即时响应
- [ ] 服务端错误正确显示在 UI 中
- [ ] `revalidatePath` / `revalidateTag` 正确刷新缓存

## 延伸阅读

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React useOptimistic](https://react.dev/reference/react/useOptimistic)
