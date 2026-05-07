---
title: 08 真实库类型分析
description: 深入分析 tRPC、Zod、Prisma、Redux 的核心类型设计，理解工业级库的类型系统架构。
---

# 08 真实库类型分析

> **前置知识**：泛型、条件类型、类型推断
>
> **目标**：能够读懂主流库的类型源码，理解其设计模式

---

## 1. Zod 的类型推导

### 1.1 核心模式

```typescript
// Zod 的核心：从 Schema 推导 TypeScript 类型
import { z } from 'zod';

// 定义 Schema
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).optional(),
  role: z.enum(['admin', 'user', 'guest']),
});

// 推导类型
type User = z.infer<typeof UserSchema>;
// {
//   id: string;
//   name: string;
//   email: string;
//   age?: number;
//   role: 'admin' | 'user' | 'guest';
// }
```

### 1.2 类型推导机制

```typescript
// Zod 内部的简化版类型推导

// 基础类型标记
abstract class ZodType<T> {
  readonly _output!: T;

  // 解析并返回类型化的数据
  parse(data: unknown): T { /* ... */ }
}

// 对象类型
class ZodObject<T extends ZodRawShape> extends ZodType<{
  [K in keyof T]: T[K]['_output'];
}> {
  constructor(public shape: T) { super(); }
}

// 字符串类型
class ZodString extends ZodType<string> {
  email(): this { return this; }
  min(n: number): this { return this; }
}

// 可选类型
class ZodOptional<T extends ZodType<any>> extends ZodType<
  T['_output'] | undefined
> {
  constructor(public innerType: T) { super(); }
}

// infer 辅助类型
type infer<T extends ZodType<any>> = T['_output'];

// 使用
const schema = new ZodObject({
  name: new ZodString(),
  age: new ZodOptional(new ZodNumber()),
});

type Result = infer<typeof schema>;
// { name: string; age: number | undefined }
```

---

## 2. tRPC 的路由类型

### 2.1 端到端类型安全

```typescript
// server/router.ts
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

const appRouter = t.router({
  user: t.router({
    getById: t.procedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        return db.users.findById(input.id);
      }),
    create: t.procedure
      .input(z.object({ name: z.string(), email: z.string() }))
      .mutation(({ input }) => {
        return db.users.create(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
```

```typescript
// client/client.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/router';

const client = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc' })],
});

// 完全类型安全！
const user = await client.user.getById.query({ id: '123' });
// user 的类型自动推断为 db.users.findById 的返回类型

// 输入类型错误会在编译时报错
// await client.user.getById.query({ id: 123 }); // ❌ Type 'number' is not assignable to type 'string'
```

### 2.2 类型推导核心

```typescript
// tRPC 内部的简化版类型推导

type DecoratedProcedureRecord<T extends Record<string, AnyProcedure>> = {
  [K in keyof T]: T[K] extends Procedure<infer I, infer O>
    ? {
        query: (input: I) => Promise<O>;
        mutate: (input: I) => Promise<O>;
      }
    : never;
};

// 递归推导嵌套路由
type DecoratedRouter<T extends Record<string, AnyRouter | AnyProcedure>> = {
  [K in keyof T]: T[K] extends AnyRouter
    ? DecoratedRouter<T[K]['_def']['record']>
    : T[K] extends AnyProcedure
    ? DecoratedProcedure<T[K]>
    : never;
};
```

---

## 3. Prisma 的查询类型

### 3.1 类型安全的查询

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 基本查询：返回类型自动推断
const user = await prisma.user.findUnique({
  where: { id: '123' },
});
// user: { id: string; email: string; name: string | null; } | null

// 包含关系：返回类型自动包含关联数据
const userWithPosts = await prisma.user.findUnique({
  where: { id: '123' },
  include: { posts: true },
});
// userWithPosts: { id: string; email: string; posts: Post[]; } | null

// 选择字段：返回类型自动限制
const userNameOnly = await prisma.user.findUnique({
  where: { id: '123' },
  select: { name: true },
});
// userNameOnly: { name: string | null; } | null
```

### 3.2 Select 类型推导

```typescript
// Prisma 内部的简化版类型推导

type UserSelect<Extends extends { select?: any; include?: any }> = {
  id?: boolean;
  email?: boolean;
  name?: boolean;
  posts?: boolean | PostFindManyArgs;
};

// 根据 select 参数推导返回类型
type GetPayload<S extends { select?: any; include?: any }> =
  S extends { select: infer Select }
    ? Select extends Record<string, true>
      ? { [K in keyof Select]: User[K] }
      : never
    : S extends { include: infer Include }
    ? User & { [K in keyof Include]: Include[K] extends true ? Post[] : never }
    : User;
```

---

## 4. Redux Toolkit 的类型设计

### 4.1 Slice 类型推导

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
  loading: boolean;
}

const initialState: CounterState = {
  value: 0,
  loading: false,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

// 自动推导的类型
const { increment, decrement, incrementByAmount } = counterSlice.actions;
// increment: ActionCreatorWithoutPayload<'counter/increment'>
// incrementByAmount: ActionCreatorWithPayload<number, 'counter/incrementByAmount'>
```

### 4.2 createSlice 的类型机制

```typescript
// 简化版 createSlice 类型

function createSlice<
  State,
  CaseReducers extends SliceCaseReducers<State>
>(config: {
  name: string;
  initialState: State;
  reducers: CaseReducers;
}) {
  type Actions = {
    [K in keyof CaseReducers]: CaseReducers[K] extends (
      state: State,
      action: PayloadAction<infer P>
    ) => void
      ? ActionCreatorWithPayload<P, `${config['name']}/${K & string}`>
      : ActionCreatorWithoutPayload<`${config['name']}/${K & string}`>;
  };

  return {
    actions: {} as Actions,
    reducer: (state: State, action: AnyAction) => state,
  };
}
```

---

## 5. 类型设计模式总结

### 5.1 常见模式

| 模式 | 示例 | 用途 |
|------|------|------|
| **Phantom Type** | Zod 的 `_output` | 标记类型信息，不占用运行时 |
| **Builder Pattern** | Zod 链式调用 | 渐进式构建复杂类型 |
| **Type Map** | tRPC 路由推导 | 从结构推导类型 |
| **Conditional Return** | Prisma Select | 根据输入参数改变返回类型 |
| **branded type** | 名义类型安全 | 区分相同结构的类型 |

### 5.2 设计原则

```
1. 类型信息应该尽可能从运行时结构自动推导
2. 避免用户重复定义类型（DRY）
3. 错误应该在编译时捕获
4. 类型系统应该引导正确的使用方式
5. 复杂的类型逻辑应该隐藏在库内部
```

---

## 练习

1. 实现一个简化版 Zod：支持 `string()`、`number()`、`object()` 和 `infer`。
2. 实现一个类型安全的 EventEmitter：根据事件名映射到对应的 payload 类型。
3. 分析你常用的一个库的类型设计，画出其类型推导流程图。

---

## 延伸阅读

- [Zod Source Code](https://github.com/colinhacks/zod)
- [tRPC Type System](https://trpc.io/docs/concepts)
- [Prisma Client Types](https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety)
