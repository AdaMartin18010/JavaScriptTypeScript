---
title: 04 Server Actions 设计模式
description: 掌握 Next.js Server Actions 的全部模式：表单处理、乐观更新、错误处理、文件上传、以及 Server Actions 的安全最佳实践。
---

# 04 Server Actions 设计模式

> **前置知识**：Next.js App Router、React 表单基础
>
> **目标**：能够设计类型安全的 Server Actions，实现乐观更新，并掌握安全最佳实践

---

## 1. Server Actions 基础

### 1.1 定义与调用

```tsx
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

// 定义 Server Action
export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string;

  if (!title || title.trim().length === 0) {
    throw new Error('Title is required');
  }

  await db.todos.create({ title: title.trim() });

  // 重新验证页面缓存
  revalidatePath('/todos');
}

// app/todos/page.tsx
import { createTodo } from './actions';

export default function TodoPage() {
  return (
    <form action={createTodo}>
      <input name="title" placeholder="New todo..." required />
      <button type="submit">Add</button>
    </form>
  );
}
```

### 1.2 带类型安全的 Server Actions

```tsx
// lib/actions.ts
'use server';

import { z } from 'zod';

const createTodoSchema = z.object({
  title: z.string().min(1).max(100),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export async function createTodo(formData: FormData) {
  // 解析并验证
  const rawData = {
    title: formData.get('title'),
    priority: formData.get('priority'),
  };

  const result = createTodoSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const todo = await db.todos.create(result.data);

  revalidatePath('/todos');
  return { success: true, todo };
}
```

---

## 2. 表单处理模式

### 2.1 渐进增强表单

```tsx
// 无需 JavaScript 即可工作的表单，有 JS 时增强体验
'use client';

import { useFormStatus } from 'react-dom';
import { createTodo } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add Todo'}
    </button>
  );
}

export default function TodoForm() {
  return (
    <form action={createTodo}>
      <input name="title" placeholder="New todo..." required />
      <SubmitButton />
    </form>
  );
}
```

### 2.2 受控表单 + Server Action

```tsx
'use client';

import { useState } from 'react';
import { createTodo } from './actions';

export default function TodoForm() {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await createTodo(formData);
    if ('error' in result) {
      setError(result.error.title?.[0] || 'Something went wrong');
    } else {
      setTitle('');
      setError(null);
    }
  }

  return (
    <form action={handleSubmit}>
      <input
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New todo..."
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Add</button>
    </form>
  );
}
```

---

## 3. 乐观更新（Optimistic Updates）

### 3.1 useOptimistic Hook

```tsx
'use client';

import { useOptimistic } from 'react';
import { createTodo, deleteTodo } from './actions';

type Todo = { id: string; title: string; completed: boolean };

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function handleCreate(formData: FormData) {
    const title = formData.get('title') as string;

    // 立即更新 UI（乐观更新）
    addOptimisticTodo({
      id: `temp-${Date.now()}`,
      title,
      completed: false,
    });

    // 发送请求
    await createTodo(formData);
  }

  return (
    <div>
      <form action={handleCreate}>
        <input name="title" placeholder="New todo..." />
        <button type="submit">Add</button>
      </form>

      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id} style={{ opacity: todo.id.startsWith('temp-') ? 0.5 : 1 }}>
            {todo.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.2 乐观删除

```tsx
const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
  initialTodos,
  (state, todoId: string) => state.filter((t) => t.id !== todoId)
);

async function handleDelete(todoId: string) {
  updateOptimisticTodos(todoId);  // 立即移除
  await deleteTodo(todoId);        // 发送请求
}
```

---

## 4. 错误处理模式

### 4.1 表单验证错误

```tsx
// lib/actions.ts
'use server';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> };

export async function createTodo(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const title = formData.get('title');

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return {
      success: false,
      errors: { title: ['Title is required'] },
    };
  }

  try {
    const todo = await db.todos.create({ title: title.trim() });
    revalidatePath('/todos');
    return { success: true, data: { id: todo.id } };
  } catch (error) {
    return {
      success: false,
      errors: { _form: ['Failed to create todo. Please try again.'] },
    };
  }
}
```

### 4.2 客户端错误处理

```tsx
'use client';

import { useFormState } from 'react-dom';
import { createTodo, ActionResult } from './actions';

function TodoFormContent({ state }: { state: ActionResult<{ id: string }> | null }) {
  return (
    <>
      <input name="title" placeholder="New todo..." />
      {state?.success === false && state.errors.title && (
        <p className="error">{state.errors.title[0]}</p>
      )}
      {state?.success === false && state.errors._form && (
        <p className="error">{state.errors._form[0]}</p>
      )}
      <button type="submit">Add</button>
    </>
  );
}

export default function TodoForm() {
  const [state, formAction] = useFormState(createTodo, null);

  return (
    <form action={formAction}>
      <TodoFormContent state={state} />
    </form>
  );
}
```

---

## 5. 安全最佳实践

### 5.1 输入验证

```tsx
'use server';

import { z } from 'zod';

const todoSchema = z.object({
  title: z.string().min(1).max(100),
  userId: z.string().uuid(),
});

export async function createTodo(formData: FormData) {
  // ❌ 不安全：信任客户端传入的 userId
  // const userId = formData.get('userId');

  // ✅ 安全：从 session 获取用户身份
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const result = todoSchema.safeParse({
    title: formData.get('title'),
    userId: session.user.id,
  });

  if (!result.success) {
    throw new Error('Invalid input');
  }

  return db.todos.create(result.data);
}
```

### 5.2 权限检查

```tsx
'use server';

export async function deleteTodo(todoId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const todo = await db.todos.findById(todoId);
  if (!todo) {
    throw new Error('Todo not found');
  }

  // 权限检查：只能删除自己的 todo
  if (todo.userId !== session.user.id) {
    throw new Error('Forbidden');
  }

  await db.todos.delete(todoId);
  revalidatePath('/todos');
}
```

### 5.3 速率限制

```tsx
'use server';

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 每分钟 5 次
});

export async function createTodo(formData: FormData) {
  const session = await auth();
  const { success } = await ratelimit.limit(session.user.id);

  if (!success) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // ... 创建逻辑
}
```

---

## 6. 高级模式

### 6.1 批量操作

```tsx
'use server';

export async function batchUpdateTodos(ids: string[], completed: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  // 验证所有权
  const todos = await db.todos.findMany({ where: { id: { in: ids } } });
  if (todos.some((t) => t.userId !== session.user.id)) {
    throw new Error('Forbidden');
  }

  await db.todos.updateMany({
    where: { id: { in: ids } },
    data: { completed },
  });

  revalidatePath('/todos');
}
```

### 6.2 文件上传

```tsx
'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function uploadAvatar(formData: FormData) {
  const file = formData.get('avatar') as File;

  if (!file || file.size === 0) {
    throw new Error('No file uploaded');
  }

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  // 验证文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File too large');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const filename = `${Date.now()}-${file.name}`;
  await writeFile(join(uploadDir, filename), buffer);

  return { url: `/uploads/${filename}` };
}
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **信任客户端输入** | 直接信任 formData 中的 userId | 从 session/auth 获取用户身份 |
| **缺少输入验证** | 直接将 formData 写入数据库 | 使用 Zod/Yup 验证所有输入 |
| **忘记 revalidate** | Server Action 后页面数据未更新 | 调用 `revalidatePath` 或 `revalidateTag` |
| **忽略错误处理** | Server Action 抛错导致白屏 | 使用 try/catch 和错误边界 |

---

## 练习

1. 实现一个带有乐观更新的待办事项列表：添加、完成、删除都支持乐观更新。
2. 设计一个带有文件上传的 Server Action，包含类型验证、大小限制和病毒扫描接口。
3. 实现一个带有权限控制的 Server Action：用户只能编辑自己的资源，管理员可以编辑所有资源。

---

## 延伸阅读

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [React useOptimistic](https://react.dev/reference/react/useOptimistic)
