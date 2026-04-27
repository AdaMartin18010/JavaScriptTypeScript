---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 05 - 状态管理库生态 (State Management)

> 📊 统计：20+ 主流库 | React生态占主导 | 原子化与轻量化为2025趋势 | Recol已于2025年归档

---

## 📑 目录

- [05 - 状态管理库生态 (State Management)](#05---状态管理库生态-state-management)
  - [📑 目录](#-目录)
  - [1. React 状态管理](#1-react-状态管理)
    - [1.1 Zustand ⭐48k 🐻](#11-zustand-48k-)
    - [1.2 Redux / Redux Toolkit ⭐61k](#12-redux--redux-toolkit-61k)
    - [1.3 Jotai ⭐18k](#13-jotai-18k)
    - [1.4 Recoil ⭐19k ⚠️ 已归档](#14-recoil-19k-️-已归档)
    - [1.5 Valtio ⭐9k](#15-valtio-9k)
    - [1.6 MobX ⭐27k](#16-mobx-27k)
    - [1.7 XState ⭐27k](#17-xstate-27k)
    - [1.8 React Query (TanStack Query) ⭐43k](#18-react-query-tanstack-query-43k)
    - [1.9 SWR ⭐31k](#19-swr-31k)
    - [1.10 Zustand-X](#110-zustand-x)
  - [2. Vue 状态管理](#2-vue-状态管理)
    - [2.1 Pinia ⭐35k 🍍](#21-pinia-35k-)
    - [2.2 Vuex ⭐28k ⚠️ 已弃用](#22-vuex-28k-️-已弃用)
  - [3. 跨框架状态管理](#3-跨框架状态管理)
    - [3.1 MobX ⭐27k](#31-mobx-27k)
    - [3.2 XState ⭐27k](#32-xstate-27k)
    - [3.3 Effector ⭐5k](#33-effector-5k)
    - [3.4 Immer ⭐27k](#34-immer-27k)
    - [3.5 Nano Stores ⭐6k](#35-nano-stores-6k)
    - [3.6 RxJS ⭐30k](#36-rxjs-30k)
  - [4. 服务端状态 (Server State)](#4-服务端状态-server-state)
    - [4.1 TanStack Query ⭐43k](#41-tanstack-query-43k)
    - [4.2 SWR ⭐31k](#42-swr-31k)
    - [4.3 RTK Query](#43-rtk-query)
    - [4.4 urql ⭐8k](#44-urql-8k)
    - [4.5 Apollo Client ⭐19k](#45-apollo-client-19k)
  - [5. 选型决策树](#5-选型决策树)
    - [5.1 React项目](#51-react项目)
    - [5.2 Vue项目](#52-vue项目)
    - [5.3 跨框架项目](#53-跨框架项目)
    - [5.4 快速对比表](#54-快速对比表)
  - [6. 2025趋势与展望](#6-2025趋势与展望)
    - [6.1 当前趋势](#61-当前趋势)
    - [6.2 技术演进](#62-技术演进)
    - [6.3 选型建议](#63-选型建议)
    - [6.4 迁移建议](#64-迁移建议)

---

## 1. React 状态管理

### 1.1 Zustand ⭐48k 🐻

| 属性 | 详情 |
|------|------|
| **Stars** | 48k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~1KB (minified+gzipped) |
| **维护者** | Poimandres (pmndrs) |

**特点**

- 🚀 2025年最热门React状态管理库，小熊状态管理
- 📝 极简API，无样板代码
- 🐻 基于Hook，无Provider包裹
- 🔄 支持中间件（持久化、日志、Immer等）

**适用场景**

- 中小型React应用
- 需要快速上手的项目
- 从useState/useReducer迁移

**代码示例**

```typescript
import { create } from "zustand"
import { persist, devtools } from "zustand/middleware"

interface BearStore {
  bears: number
  increase: () => void
  decrease: () => void
}

const useBearStore = create<BearStore>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: () => set((state) => ({ bears: state.bears + 1 })),
        decrease: () => set((state) => ({ bears: state.bears - 1 })),
      }),
      { name: "bear-storage" }
    )
  )
)

// 组件中使用
function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  return <h1>{bears} bears</h1>
}
```

**链接**

- 🏠 官网：<https://zustand-demo.pmnd.rs/>
- 📦 GitHub：<https://github.com/pmndrs/zustand>
- 📖 文档：<https://docs.pmnd.rs/zustand>

---

### 1.2 Redux / Redux Toolkit ⭐61k

| 属性 | 详情 |
|------|------|
| **Stars** | 61k (redux整体) |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~11KB |
| **维护者** | Redux Team |

**特点**

- 🏢 企业级标准，生态最成熟
- 🛠️ Redux Toolkit简化样板代码
- 🔍 Redux DevTools强大的调试能力
- 📚 丰富的中间件生态

**适用场景**

- 大型企业级应用
- 需要严格数据流控制
- 复杂的状态逻辑
- 团队协作项目

**代码示例**

```typescript
import { createSlice, configureStore } from "@reduxjs/toolkit"
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux"

// Slice定义
const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1 // Immer支持直接修改
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

// Store配置
export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
})

// TypeScript类型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// 组件中使用
function Counter() {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  )
}
```

**链接**

- 🏠 官网：<https://redux.js.org/>
- 📦 GitHub：<https://github.com/reduxjs/redux-toolkit>
- 📖 RTK文档：<https://redux-toolkit.js.org/>

---

### 1.3 Jotai ⭐18k

| 属性 | 详情 |
|------|------|
| **Stars** | 18k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~3KB |
| **维护者** | Poimandres (pmndrs) |

**特点**

- ⚛️ 原子化状态管理 (Atomic State Management)
- 🎯 基于原子与派生原子概念
- 🔄 自动依赖追踪与细粒度更新
- 🧩 组合式状态定义

**适用场景**

- 需要细粒度状态控制
- 复杂状态派生逻辑
- 避免不必要的重渲染

**代码示例**

```typescript
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai"
import { atomWithStorage, atomWithReset } from "jotai/utils"

// 基础原子
const countAtom = atom(0)

// 派生原子（只读）
const doubleCountAtom = atom((get) => get(countAtom) * 2)

// 派生原子（可写）
const incrementCountAtom = atom(
  (get) => get(countAtom),
  (get, set, by: number) => {
    set(countAtom, get(countAtom) + by)
  }
)

// 持久化原子
const storedCountAtom = atomWithStorage("count", 0)

// 异步原子
const fetchUserAtom = atom(async () => {
  const response = await fetch("/api/user")
  return response.json()
})

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  const doubleCount = useAtomValue(doubleCountAtom)
  const [, increment] = useAtom(incrementCountAtom)

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <button onClick={() => increment(10)}>+10</button>
    </div>
  )
}
```

**链接**

- 🏠 官网：<https://jotai.org/>
- 📦 GitHub：<https://github.com/pmndrs/jotai>
- 📖 文档：<https://jotai.org/docs/>

---

### 1.4 Recoil ⭐19k ⚠️ 已归档

| 属性 | 详情 |
|------|------|
| **Stars** | 19k |
| **TypeScript** | ✅ 支持 |
| **包体积** | ~25KB |
| **维护者** | Facebook (Meta) |
| **状态** | 🔴 2025年1月1日已归档，停止维护 |

**特点**

- 🏢 Facebook官方出品
- 🧪 实验性项目（Open Source Experimental）
- ⚛️ 原子化状态管理先驱
- 🔄 支持派生状态与异步查询

**⚠️ 重要提醒**：Recoil已于2025年1月1日被Meta官方归档，停止维护。新项目强烈建议使用 **Jotai** 替代（同为原子化状态管理，API相似，生态活跃）。

**适用场景**

- 探索原子化状态管理概念
- 已有项目维护

**代码示例**

```typescript
import { atom, selector, useRecoilState, useRecoilValue } from "recoil"

// 原子状态
const textState = atom({
  key: "textState",
  default: "",
})

// 派生状态
const charCountState = selector({
  key: "charCountState",
  get: ({ get }) => {
    const text = get(textState)
    return text.length
  },
})

// 异步查询
const currentUserNameQuery = selector({
  key: "CurrentUserName",
  get: async ({ get }) => {
    const response = await fetch("/api/user")
    const user = await response.json()
    return user.name
  },
})

function CharacterCounter() {
  const [text, setText] = useRecoilState(textState)
  const count = useRecoilValue(charCountState)

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <span>字符数: {count}</span>
    </div>
  )
}
```

**链接**

- 📦 GitHub：<https://github.com/facebookexperimental/Recoil>
- 📖 文档：<https://recoiljs.org/>

---

### 1.5 Valtio ⭐9k

| 属性 | 详情 |
|------|------|
| **Stars** | 9k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~2KB |
| **维护者** | Poimandres (pmndrs) |

**特点**

- 🔄 基于Proxy的响应式状态管理
- 📝 可变状态语法，类似MobX
- 🪝 支持React Hook与Vanilla JS
- ⚡ 细粒度订阅

**适用场景**

- 喜欢可变状态语法
- 复杂对象状态管理
- 非React场景

**代码示例**

```typescript
import { proxy, useSnapshot } from "valtio"
import { derive, subscribe } from "valtio/utils"

// 创建代理状态
const state = proxy({
  count: 0,
  user: {
    name: "John",
    age: 25,
  },
})

// 派生状态
const derivedState = derive({
  doubled: (get) => get(state).count * 2,
})

// 订阅变化
subscribe(state, () => {
  console.log("State changed:", state.count)
})

function Counter() {
  const snap = useSnapshot(state)
  const derived = useSnapshot(derivedState)

  return (
    <div>
      <p>Count: {snap.count}</p>
      <p>Doubled: {derived.doubled}</p>
      <button onClick={() => ++state.count}>+1</button>
      <button onClick={() => state.count--}>-1</button>
      <button onClick={() => state.user.age++}>Age++</button>
    </div>
  )
}

// Vanilla JS使用（无React）
state.count++ // 自动触发订阅
```

**链接**

- 📦 GitHub：<https://github.com/pmndrs/valtio>
- 📖 文档：<https://valtio.pmnd.rs/>

---

### 1.6 MobX ⭐27k

| 属性 | 详情 |
|------|------|
| **Stars** | 27k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~16KB |
| **维护者** | MobX Team |

**特点**

- 🔄 响应式编程范式
- 🎯 自动追踪依赖
- 📝 可变状态，面向对象风格
- 🏢 适合复杂业务逻辑

**适用场景**

- 复杂领域模型
- 面向对象设计风格
- 需要自动派生计算

**代码示例**

```typescript
import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react-lite"

class CounterStore {
  count = 0

  constructor() {
    makeAutoObservable(this)
  }

  increment() {
    this.count++
  }

  decrement() {
    this.count--
  }

  get doubleCount() {
    return this.count * 2
  }
}

const store = new CounterStore()

const Counter = observer(() => {
  return (
    <div>
      <p>Count: {store.count}</p>
      <p>Double: {store.doubleCount}</p>
      <button onClick={() => store.increment()}>+</button>
      <button onClick={() => store.decrement()}>-</button>
    </div>
  )
})

// 使用MobX 6的makeObservable/makeAutoObservable
class TodoStore {
  todos: Todo[] = []
  filter: "all" | "completed" | "active" = "all"

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  get filteredTodos() {
    switch (this.filter) {
      case "completed": return this.todos.filter(t => t.completed)
      case "active": return this.todos.filter(t => !t.completed)
      default: return this.todos
    }
  }

  addTodo(title: string) {
    this.todos.push({ id: Date.now(), title, completed: false })
  }
}
```

**链接**

- 🏠 官网：<https://mobx.js.org/>
- 📦 GitHub：<https://github.com/mobxjs/mobx>
- 📖 文档：<https://mobx.js.org/README.html>

---

### 1.7 XState ⭐27k

| 属性 | 详情 |
|------|------|
| **Stars** | 27k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~8KB (core) |
| **维护者** | Stately Team |

**特点**

- 🎮 有限状态机与状态图
- 📊 可视化编辑器 (Stately Studio)
- 🔒 类型安全的状态转换
- 🧪 易于测试

**适用场景**

- 复杂UI状态流程
- 工作流引擎
- 需要可视化状态机
- 严格的状态控制

**代码示例**

```typescript
import { createMachine, interpret } from "xstate"
import { useMachine } from "@xstate/react"

// 定义状态机
const toggleMachine = createMachine({
  id: "toggle",
  initial: "inactive",
  context: {
    count: 0,
  },
  states: {
    inactive: {
      on: { TOGGLE: "active" },
    },
    active: {
      entry: "incrementCount",
      on: { TOGGLE: "inactive" },
    },
  },
}, {
  actions: {
    incrementCount: (context) => {
      context.count++
    },
  },
})

// React中使用
function Toggle() {
  const [state, send] = useMachine(toggleMachine)

  return (
    <div>
      <button onClick={() => send({ type: "TOGGLE" })}>
        {state.matches("inactive") ? "Off" : "On"}
      </button>
      <span>切换次数: {state.context.count}</span>
    </div>
  )
}

// 更复杂的例子：请求状态机
const fetchMachine = createMachine({
  id: "fetch",
  initial: "idle",
  states: {
    idle: {
      on: { FETCH: "loading" },
    },
    loading: {
      on: {
        RESOLVE: "success",
        REJECT: "failure",
      },
    },
    success: {
      type: "final",
    },
    failure: {
      on: { RETRY: "loading" },
    },
  },
})
```

**链接**

- 🏠 官网：<https://stately.ai/>
- 📦 GitHub：<https://github.com/statelyai/xstate>
- 📖 文档：<https://xstate.js.org/docs/>
- 🎨 编辑器：<https://stately.ai/registry>

---

### 1.8 React Query (TanStack Query) ⭐43k

| 属性 | 详情 |
|------|------|
| **Stars** | 43k (TanStack Query整体) |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~12KB |
| **维护者** | TanStack Team |

**特点**

- 🌐 服务端状态管理首选
- 🔄 智能缓存与后台更新
- 🛠️ 强大的开发工具
- 📚 支持React、Vue、Svelte、Solid

**适用场景**

- REST API数据获取
- 服务端状态缓存
- 分页、无限滚动
- 乐观更新

**代码示例**

```typescript
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

// 配置客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      retry: 3,
    },
  },
})

// 查询Hook
function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users")
      if (!response.ok) throw new Error("Network error")
      return response.json()
    },
  })
}

// 突变Hook
function useAddUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newUser: User) => {
      const response = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      })
      return response.json()
    },
    onSuccess: () => {
      // 失效并重新获取
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

function Users() {
  const { data, isLoading, error } = useUsers()
  const addUser = useAddUser()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <ul>{data.map(user => <li key={user.id}>{user.name}</li>)}</ul>
      <button onClick={() => addUser.mutate({ name: "New User" })}>
        Add User
      </button>
    </div>
  )
}

// App入口
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Users />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**链接**

- 🏠 官网：<https://tanstack.com/query/latest>
- 📦 GitHub：<https://github.com/TanStack/query>
- 📖 文档：<https://tanstack.com/query/latest/docs/react/overview>

---

### 1.9 SWR ⭐31k

| 属性 | 详情 |
|------|------|
| **Stars** | 31k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~4KB |
| **维护者** | Vercel |

**特点**

- 🚀 Vercel出品，Next.js生态首选
- 🔄 基于stale-while-revalidate策略
- 📦 轻量简洁
- 🎯 支持实时数据同步

**适用场景**

- Next.js项目
- 需要轻量数据获取
- 实时数据同步
- 请求去重与重试

**代码示例**

```typescript
import useSWR, { SWRConfig, mutate } from "swr"
import useSWRMutation from "swr/mutation"

// 数据获取器
const fetcher = (url: string) => fetch(url).then(r => r.json())

// 基础使用
function Profile() {
  const { data, error, isLoading } = useSWR("/api/user", fetcher)

  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>

  return <div>Hello {data.name}!</div>
}

// 配置选项
function Dashboard() {
  const { data } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 3000,    // 每3秒刷新
    revalidateOnFocus: true,  // 窗口聚焦时重新验证
    dedupingInterval: 2000,   // 2秒内去重
  })

  return <div>{/* ... */}</div>
}

// 全局配置
function App() {
  return (
    <SWRConfig
      value={{
        refreshInterval: 3000,
        fetcher: (url) => fetch(url).then(r => r.json()),
      }}
    >
      <Dashboard />
    </SWRConfig>
  )
}

// 突变操作
async function updateUser(url: string, { arg }: { arg: User }) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  }).then(r => r.json())
}

function UpdateUser() {
  const { trigger } = useSWRMutation("/api/user", updateUser)

  return (
    <button onClick={() => trigger({ name: "New Name" })}>
      Update User
    </button>
  )
}
```

**链接**

- 🏠 官网：<https://swr.vercel.app/>
- 📦 GitHub：<https://github.com/vercel/swr>
- 📖 文档：<https://swr.vercel.app/docs/getting-started>

---

### 1.10 Zustand-X

| 属性 | 详情 |
|------|------|
| **基于** | Zustand |
| **TypeScript** | ✅ 原生支持 |
| **特点** | Zustand扩展版，提供更多功能 |
| **维护者** | 社区扩展 |

**特点**

- 🔧 基于Zustand的扩展封装
- 📝 提供更完整的Store模式
- 🔄 内置更多常用中间件组合
- 🎯 更适合大型项目架构

**适用场景**

- 需要比Zustand更完整功能的项目
- 团队需要统一Store模式
- 从MobX/MobX-State-Tree迁移

**链接**

- 📦 GitHub：<https://github.com/zustand-x/zustand-x>

---

## 2. Vue 状态管理

### 2.1 Pinia ⭐35k 🍍

| 属性 | 详情 |
|------|------|
| **Stars** | 35k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~1KB |
| **维护者** | Vue Team |

**特点**

- 🌲 Vue官方推荐（Vue3+）
- 📝 直观API，类似Vuex但更简洁
- 🔧 完整的TypeScript支持
- 🛠️ 内置开发工具支持
- 📦 模块化设计

**适用场景**

- 所有Vue3项目
- 需要TypeScript支持
- 从Vuex迁移

**代码示例**

```typescript
// stores/counter.ts
import { defineStore } from "pinia"
import { ref, computed } from "vue"

// Options API风格
export const useCounterStore = defineStore("counter", {
  state: () => ({
    count: 0,
    name: "Counter",
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
    doublePlusOne(): number {
      return this.doubleCount + 1
    },
  },
  actions: {
    increment() {
      this.count++
    },
    async fetchData() {
      const response = await fetch("/api/data")
      this.name = await response.text()
    },
  },
})

// Composition API风格
export const useCounterStore = defineStore("counter", () => {
  const count = ref(0)
  const name = ref("Counter")

  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  async function fetchData() {
    const response = await fetch("/api/data")
    name.value = await response.text()
  }

  return { count, name, doubleCount, increment, fetchData }
})

// 组件中使用
<script setup lang="ts">
import { useCounterStore } from "@/stores/counter"
import { storeToRefs } from "pinia"

const store = useCounterStore()
// 使用storeToRefs保持响应性
const { count, doubleCount } = storeToRefs(store)
const { increment } = store
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+</button>
  </div>
</template>
```

**链接**

- 🏠 官网：<https://pinia.vuejs.org/>
- 📦 GitHub：<https://github.com/vuejs/pinia>
- 📖 文档：<https://pinia.vuejs.org/introduction.html>

---

### 2.2 Vuex ⭐28k ⚠️ 已弃用

| 属性 | 详情 |
|------|------|
| **Stars** | 28k |
| **TypeScript** | ⚠️ 需要额外配置 |
| **包体积** | ~4KB |
| **维护者** | Vue Team |

**状态**

- ⚠️ Vuex 4是Vue3的最终版本
- 🚫 不再添加新功能
- 🔄 推荐使用Pinia替代

**适用场景**

- 仅用于Vue2项目维护
- 现有Vuex项目

**迁移指南**
Vue官方提供从Vuex到Pinia的迁移工具：<https://pinia.vuejs.org/cookbook/migration-vuex.html>

**链接**

- 📦 GitHub：<https://github.com/vuejs/vuex>
- 📖 文档：<https://vuex.vuejs.org/>

---

## 3. 跨框架状态管理

### 3.1 MobX ⭐27k

| 属性 | 详情 |
|------|------|
| **Stars** | 27k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~16KB |
| **维护者** | MobX Team |

**特点**

- 🔄 响应式编程范式
- 🎯 自动追踪依赖
- 📝 可变状态，面向对象风格
- 🏢 适合复杂业务逻辑
- 🌐 跨框架支持React、Vue、Angular

**适用场景**

- 复杂领域模型
- 面向对象设计风格
- 需要自动派生计算

**代码示例**

```typescript
import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react-lite"

class CounterStore {
  count = 0

  constructor() {
    makeAutoObservable(this)
  }

  increment() {
    this.count++
  }

  get doubleCount() {
    return this.count * 2
  }
}

const store = new CounterStore()

const Counter = observer(() => {
  return (
    <div>
      <p>Count: {store.count}</p>
      <p>Double: {store.doubleCount}</p>
      <button onClick={() => store.increment()}>+</button>
    </div>
  )
})
```

**链接**

- 🏠 官网：<https://mobx.js.org/>
- 📦 GitHub：<https://github.com/mobxjs/mobx>

---

### 3.2 XState ⭐27k

| 属性 | 详情 |
|------|------|
| **Stars** | 27k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~8KB (core) |
| **维护者** | Stately Team |

**特点**

- 🎮 有限状态机与状态图
- 📊 可视化编辑器 (Stately Studio)
- 🔒 类型安全的状态转换
- 🧪 易于测试
- 🌐 支持React、Vue、Svelte、Solid

**适用场景**

- 复杂UI状态流程
- 工作流引擎
- 需要可视化状态机
- 严格的状态控制

**代码示例**

```typescript
import { createMachine } from "xstate"
import { useMachine } from "@xstate/react"

const toggleMachine = createMachine({
  id: "toggle",
  initial: "inactive",
  states: {
    inactive: { on: { TOGGLE: "active" } },
    active: { on: { TOGGLE: "inactive" } },
  },
})

function Toggle() {
  const [state, send] = useMachine(toggleMachine)

  return (
    <button onClick={() => send({ type: "TOGGLE" })}>
      {state.matches("inactive") ? "Off" : "On"}
    </button>
  )
}
```

**链接**

- 🏠 官网：<https://stately.ai/>
- 📦 GitHub：<https://github.com/statelyai/xstate>
- 🎨 编辑器：<https://stately.ai/registry>

---

### 3.3 Effector ⭐5k

| 属性 | 详情 |
|------|------|
| **Stars** | 5k+ |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~8KB |
| **维护者** | Effector Team |

**特点**

- 🏢 专为业务逻辑设计的响应式状态管理
- 🔄 强大的事件驱动架构
- 🧪 内置测试友好设计
- 📊 优秀的TypeScript支持
- 🌐 跨框架支持（React、Vue、Svelte等）

**核心概念**

- **Store**: 存储状态
- **Event**: 触发状态变化的事件
- **Effect**: 处理副作用（如API调用）

**适用场景**

- 复杂业务逻辑
- 需要严格数据流控制
- 事件驱动架构

**代码示例**

```typescript
import { createStore, createEvent, createEffect } from "effector"
import { useUnit } from "effector-react"

const increment = createEvent()
const $counter = createStore(0).on(increment, (c) => c + 1)

function Counter() {
  const count = useUnit($counter)
  return <button onClick={() => increment()}>{count}</button>
}
```

**链接**

- 🏠 官网：<https://effector.dev/>
- 📦 GitHub：<https://github.com/effector/effector>

---

### 3.4 Immer ⭐27k

| 属性 | 详情 |
|------|------|
| **Stars** | 27k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~3KB |
| **维护者** | Immer Team |

**特点**

- 📝 通过可变语法创建不可变状态
- 🔄 与Redux、Zustand等完美集成
- ⚡ 高性能，使用结构共享
- 🎯 简化嵌套状态更新

**适用场景**

- 深嵌套对象状态更新
- 与Redux/Zustand配合使用
- 需要不可变数据但不想写繁琐的展开运算符

**代码示例**

```typescript
import { produce } from "immer"
import { create } from "zustand"

// 基础用法
const nextState = produce(baseState, (draft) => {
  draft.user.name = "New Name"
  draft.todos.push({ id: 3, text: "New Todo", done: false })
})

// 与Zustand结合使用
const useStore = create((set) => ({
  user: { name: "John" },
  updateUser: (name) =>
    set(produce((state) => { state.user.name = name })),
}))
```

**链接**

- 📦 GitHub：<https://github.com/immerjs/immer>
- 📖 文档：<https://immerjs.github.io/immer/>

---

### 3.5 Nano Stores ⭐6k

| 属性 | 详情 |
|------|------|
| **Stars** | 6k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~286B (极轻量) |
| **维护者** | Nano Stores Team |

**特点**

- 🪶 极轻量 (~286B)
- 🌐 跨框架：React、Vue、Svelte、Solid、Angular、Vanilla JS
- 🚀 高性能，无依赖
- 📦 模块化，按需引入

**适用场景**

- 多框架/库共存项目
- 对包体积极度敏感
- 微前端架构

**代码示例**

```typescript
import { atom, computed, task, allTasks } from "nanostores"
import { useStore } from "@nanostores/react" // 或 vue, svelte, solid

// 创建原子状态
export const $count = atom(0)

// 派生状态
export const $doubleCount = computed($count, (count) => count * 2)

// 多状态组合
export const $sum = computed([$count, $doubleCount], (a, b) => a + b)

// 异步任务
export const $user = atom<User | null>(null)

export async function fetchUser(id: string) {
  const data = await fetch(`/api/users/${id}`).then(r => r.json())
  $user.set(data)
}

// React中使用
import { useStore } from "@nanostores/react"

function Counter() {
  const count = useStore($count)
  const double = useStore($doubleCount)

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {double}</p>
      <button onClick={() => $count.set($count.get() + 1)}>+</button>
    </div>
  )
}

// Vue中使用
import { useStore } from "@nanostores/vue"

<script setup>
const count = useStore($count)
const double = useStore($doubleCount)
</script>

// Svelte中使用（无需Hook，直接绑定）
<script>
import { $count, $doubleCount } from "./stores"
</script>

<span>{$count} * 2 = {$doubleCount}</span>
```

**链接**

- 📦 GitHub：<https://github.com/nanostores/nanostores>
- 📖 文档：<https://github.com/nanostores/nanostores#guide>

---

### 3.6 RxJS ⭐30k

| 属性 | 详情 |
|------|------|
| **Stars** | 30k |
| **包体积** | ~30KB (全量) / 支持按需导入 |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~30KB (全量) |
| **维护者** | ReactiveX |

**特点**

- 🌊 响应式编程的工业标准
- 🔄 强大的Observable与Operator
- 📚 学习曲线陡峭但功能强大
- 🌐 跨平台，支持多种语言

**适用场景**

- 复杂异步数据流
- 实时数据同步
- 事件驱动架构
- 复杂状态组合

**代码示例**

```typescript
import { BehaviorSubject, combineLatest, map, distinctUntilChanged } from "rxjs"
import { useObservable, useBehaviorSubject } from "rxjs-hooks" // React绑定

// 创建状态流
const state$ = new BehaviorSubject({
  count: 0,
  user: null as User | null,
})

// 派生流
const count$ = state$.pipe(
  map(state => state.count),
  distinctUntilChanged()
)

const doubleCount$ = count$.pipe(map(c => c * 2))

// 多流组合
const combined$ = combineLatest([count$, doubleCount$]).pipe(
  map(([count, double]) => ({ count, double }))
)

// React中使用
import { useObservable } from "rxjs-hooks"

function Counter() {
  const count = useObservable(() => count$)
  const double = useObservable(() => doubleCount$)

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {double}</p>
      <button onClick={() => {
        const current = state$.getValue()
        state$.next({ ...current, count: current.count + 1 })
      }}>+</button>
    </div>
  )
}

// 服务层示例
class UserService {
  private users$ = new BehaviorSubject<User[]>([])
  private filter$ = new BehaviorSubject("")

  filteredUsers$ = combineLatest([this.users$, this.filter$]).pipe(
    map(([users, filter]) =>
      users.filter(u => u.name.includes(filter))
    )
  )

  setFilter(filter: string) {
    this.filter$.next(filter)
  }

  addUser(user: User) {
    this.users$.next([...this.users$.getValue(), user])
  }
}
```

**链接**

- 🏠 官网：<https://rxjs.dev/>
- 📦 GitHub：<https://github.com/ReactiveX/rxjs>
- 📖 文档：<https://rxjs.dev/guide/overview>

---

## 4. 服务端状态 (Server State)

### 4.1 TanStack Query ⭐43k

详见 [1.8 React Query](#18-react-query-tanstack-query)，已在前文介绍。

TanStack Query已支持多框架：

- React: @tanstack/react-query
- Vue: @tanstack/vue-query
- Svelte: @tanstack/svelte-query
- Solid: @tanstack/solid-query

---

### 4.2 SWR ⭐31k

详见 [1.9 SWR](#19-swr)，已在前文介绍。

SWR同样支持多框架：

- React: swr
- Vue: swr/vue

---

### 4.3 RTK Query

| 属性 | 详情 |
|------|------|
| **Stars** | 包含在RTK中 |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~11KB (包含RTK) |
| **维护者** | Redux Team |

**特点**

- 🔗 Redux Toolkit内置
- 📝 声明式API定义
- 🔄 自动缓存与失效
- 🏢 与Redux生态深度集成

**适用场景**

- 已使用Redux的项目
- 需要统一客户端与服务端状态
- 复杂缓存策略

**代码示例**

```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// 创建API Slice
export const pokemonApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://pokeapi.co/api/v2/" }),
  endpoints: (builder) => ({
    getPokemonByName: builder.query<Pokemon, string>({
      query: (name) => `pokemon/${name}`,
    }),
    addPokemon: builder.mutation<Pokemon, Partial<Pokemon>>({
      query: (body) => ({
        url: "pokemon",
        method: "POST",
        body,
      }),
    }),
  }),
})

// 自动生成Hooks
export const {
  useGetPokemonByNameQuery,
  useAddPokemonMutation
} = pokemonApi

// 组件中使用
function Pokemon({ name }: { name: string }) {
  const { data, error, isLoading } = useGetPokemonByNameQuery(name)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error!</div>

  return (
    <div>
      <h3>{data.name}</h3>
      <img src={data.sprites.front_default} alt={data.name} />
    </div>
  )
}

// Store配置
import { configureStore } from "@reduxjs/toolkit"

export const store = configureStore({
  reducer: {
    [pokemonApi.reducerPath]: pokemonApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(pokemonApi.middleware),
})
```

**链接**

- 📖 文档：<https://redux-toolkit.js.org/rtk-query/overview>

---

### 4.4 urql ⭐8k

| 属性 | 详情 |
|------|------|
| **Stars** | 8k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~7KB |
| **维护者** | Formidable Labs |

**特点**

- 📊 高度可扩展的GraphQL客户端
- 🔄 默认离线优先策略
- 🧩 插件系统
- 📝 比Apollo更轻量

**适用场景**

- GraphQL API
- 需要可扩展的缓存策略
- 对包体积敏感

**代码示例**

```typescript
import { createClient, Provider, useQuery, useMutation } from "urql"

// 创建客户端
const client = createClient({
  url: "https://api.example.com/graphql",
  exchanges: [
    dedupExchange,
    cacheExchange,
    fetchExchange,
  ],
})

// 查询
const USERS_QUERY = `
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`

function UsersList() {
  const [result] = useQuery({
    query: USERS_QUERY,
  })

  const { data, fetching, error } = result

  if (fetching) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <ul>
      {data.users.map((user: User) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

// 突变
const ADD_USER_MUTATION = `
  mutation AddUser($name: String!, $email: String!) {
    addUser(name: $name, email: $email) {
      id
      name
      email
    }
  }
`

function AddUser() {
  const [, addUser] = useMutation(ADD_USER_MUTATION)

  const handleSubmit = async (name: string, email: string) => {
    await addUser({ name, email })
  }

  return <form>{/* ... */}</form>
}

// App入口
function App() {
  return (
    <Provider value={client}>
      <UsersList />
    </Provider>
  )
}
```

**链接**

- 🏠 官网：<https://formidable.com/open-source/urql/>
- 📦 GitHub：<https://github.com/urql-graphql/urql>
- 📖 文档：<https://formidable.com/open-source/urql/docs/>

---

### 4.5 Apollo Client ⭐19k

| 属性 | 详情 |
|------|------|
| **Stars** | 19k |
| **TypeScript** | ✅ 原生支持 |
| **包体积** | ~30KB |
| **维护者** | Apollo GraphQL |

**特点**

- 🏢 最成熟的GraphQL客户端
- 🔄 强大的本地状态管理
- 📊 完整的开发工具链
- 🌐 支持React、Vue、Angular、iOS、Android

**适用场景**

- 企业级GraphQL应用
- 复杂的本地/远程状态协调
- 需要完整的工具链

**代码示例**

```typescript
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery,
  useMutation
} from "@apollo/client"

// 创建客户端
const client = new ApolloClient({
  uri: "https://api.example.com/graphql",
  cache: new InMemoryCache(),
})

// 定义查询
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`

// 定义突变
const ADD_USER = gql`
  mutation AddUser($name: String!, $email: String!) {
    addUser(name: $name, email: $email) {
      id
      name
      email
    }
  }
`

// 使用Hook
function Users() {
  const { loading, error, data } = useQuery(GET_USERS)
  const [addUser] = useMutation(ADD_USER, {
    update(cache, { data: { addUser } }) {
      const { users } = cache.readQuery({ query: GET_USERS })
      cache.writeQuery({
        query: GET_USERS,
        data: { users: [...users, addUser] },
      })
    },
  })

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <div>
      {data.users.map((user: User) => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={() => addUser({
        variables: { name: "New User", email: "new@example.com" }
      })}>
        Add User
      </button>
    </div>
  )
}

// 本地状态管理
const GET_LOCAL_STATE = gql`
  query GetLocalState {
    isLoggedIn @client
    currentUser @client
  }
`

// App入口
function App() {
  return (
    <ApolloProvider client={client}>
      <Users />
    </ApolloProvider>
  )
}
```

**链接**

- 🏠 官网：<https://www.apollographql.com/docs/react/>
- 📦 GitHub：<https://github.com/apollographql/apollo-client>
- 📖 文档：<https://www.apollographql.com/docs/react/>

---

## 5. 选型决策树

### 5.1 React项目

```
React项目状态管理选择
|
├─ 服务端数据为主？
│  ├─ 是 → TanStack Query / SWR
│  └─ 否 → 继续
|
├─ 需要状态机/复杂流程？
│  ├─ 是 → XState
│  └─ 否 → 继续
|
├─ 企业级/大型应用？
│  ├─ 是 → Redux Toolkit (+ RTK Query)
│  └─ 否 → 继续
|
├─ 喜欢响应式/可变语法？
│  ├─ 是 → MobX / Valtio
│  └─ 否 → 继续
|
├─ 需要细粒度原子化状态？
│  ├─ 是 → Jotai
│  └─ 否 → 继续
|
└─ 推荐：Zustand（平衡简洁与功能）
```

### 5.2 Vue项目

```
Vue项目状态管理选择
|
└─ Vue3+ → Pinia（官方推荐）
   Vue2  → Vuex 4（迁移到Pinia更佳）
```

### 5.3 跨框架项目

| 场景 | 推荐 |
|------|------|
| 极轻量需求 | Nano Stores (~286B) |
| 复杂异步流 | RxJS |
| 服务端状态 | TanStack Query |
| 业务逻辑驱动 | Effector |
| 响应式编程 | MobX |

### 5.4 快速对比表

| 库 | 体积 | 学习曲线 | 生态 | 推荐场景 |
|----|------|----------|------|----------|
| Zustand | ~1KB | ⭐ | ⭐⭐⭐⭐ | 通用首选 |
| Redux Toolkit | ~11KB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 大型企业应用 |
| Jotai | ~3KB | ⭐⭐ | ⭐⭐⭐⭐ | 原子化状态 |
| MobX | ~16KB | ⭐⭐⭐ | ⭐⭐⭐⭐ | 响应式编程 |
| Valtio | ~3.5KB | ⭐⭐ | ⭐⭐ | Proxy驱动可变状态 |
| XState | ~8KB | ⭐⭐⭐⭐ | ⭐⭐⭐ | 状态机/流程 |
| TanStack Query | ~12KB | ⭐⭐ | ⭐⭐⭐⭐⭐ | 服务端状态 |
| SWR | ~4KB | ⭐ | ⭐⭐⭐ | Next.js/Vercel生态 |
| Pinia | ~1KB | ⭐ | ⭐⭐⭐⭐⭐ | Vue生态 |
| Vuex | ~4KB | ⭐⭐ | ⭐⭐⭐ | Vue 2维护项目 |
| Nano Stores | ~286B | ⭐ | ⭐⭐⭐ | 跨框架/极轻量 |
| Effector | ~8KB | ⭐⭐⭐ | ⭐⭐⭐ | 业务逻辑状态 |
| RxJS | ~30KB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 复杂异步流 |

---

## 6. 2025趋势与展望

### 6.1 当前趋势

1. **🚀 Zustand统治地位** - 2025年React新项目的默认选择
2. **⚛️ 原子化成熟** - Jotai成为原子化状态管理首选（替代Recoil）
3. **🌐 跨框架统一** - TanStack Query、Nano Stores支持多框架
4. **🔄 服务端状态独立** - 客户端与服务端状态管理分离成为共识
5. **⚰️ Recoil退场** - Meta于2025年归档Recoil，原子化转向Jotai

### 6.2 技术演进

| 时代 | 代表 | 特点 |
|------|------|------|
| 2015-2018 | Redux/MobX | 单一Store，Flux架构 |
| 2018-2021 | Hooks时代 | useState/useReducer为主 |
| 2021-2023 | 原子化/轻量 | Recoil/Jotai/Zustand |
| 2024-2025 | 细粒度+服务端 | 原子化+独立服务端状态管理 |

### 6.3 选型建议

| 场景 | 推荐方案 | 说明 |
|------|----------|------|
| **新项目React** | Zustand + TanStack Query | 2025年最受欢迎组合 |
| **新项目Vue** | Pinia + TanStack Query | Vue官方推荐 |
| **跨框架微前端** | Nano Stores + TanStack Query | 极轻量，多框架支持 |
| **企业级大型应用** | Redux Toolkit + RTK Query | 生态最成熟 |
| **复杂状态机/工作流** | XState | 可视化、可测试 |
| **响应式/OOP风格** | MobX 或 Valtio | 可变状态语法 |
| **原子化细粒度** | Jotai | Recoil替代品，更轻量 |
| **事件驱动业务逻辑** | Effector | 严格的单向数据流 |
| **Next.js/Vercel** | SWR 或 TanStack Query | 官方生态支持 |

### 6.4 迁移建议

| 从 | 迁移到 | 说明 |
|----|--------|------|
| Recoil | Jotai | API相似，迁移成本低 |
| Vuex | Pinia | Vue官方提供迁移指南 |
| 传统Redux | Redux Toolkit | 官方工具集，大幅简化 |
| MobX | Valtio | 更轻量的Proxy方案 |

---

> 📅 最后更新：2026-04-04
>
> 📊 文档统计：20+ 库 | 6大分类 | 15+ 代码示例 | 覆盖React/Vue/跨框架
