---
title: 状态管理库生态
description: JavaScript/TypeScript 状态管理生态 2025-2026 — Zustand 统治、Signals 革命、服务器状态管理与选型矩阵
---

# 状态管理生态

> **趋势洞察**：Zustand 以极简 API 和卓越性能成为 React 生态绝对主流；Signals 架构（Preact Signals、Solid Signals、Angular Signals）正在重塑响应式模型；Recoil 已归档，Redux Toolkit 退守企业级场景；服务器状态管理（TanStack Query）与客户端状态管理的边界日趋清晰。本地优先（Local-First）与 CRDT 协同状态开始从边缘走向主流。

---

## 核心数据概览（2026年5月）

| 方案 | GitHub Stars | npm 周下载量 | 最新版本 | 状态 |
|------|-------------|-------------|---------|------|
| Zustand | ~56k | ~350 万+ | v5.0.x | 🟢 活跃，React 生态首选 |
| TanStack Query v5 | ~45k | ~450 万+ | v5.75+ | 🟢 活跃，服务器状态标准 |
| Redux Toolkit | ~62k (redux 整体) | ~250 万+ | v2.7+ | 🟡 维护模式，企业存量 |
| Pinia | ~39k | ~200 万+ | v3.0+ | 🟢 活跃，Vue 官方推荐 |
| Jotai | ~19k | ~60 万+ | v2.12+ | 🟢 活跃，原子化方案 |
| SWR | ~32k | ~60 万+ | v2.3+ | 🟢 活跃，Vercel 出品 |
| Recoil | ~19k | — | — | 🔴 2025.1 已归档 |
| Valtio | ~10k | ~15 万+ | v2.1+ | 🟢 活跃 |
| MobX | ~27k | ~180 万+ | v6.13+ | 🟡 稳定维护 |
| XState | ~27k | ~100 万+ | v5.19+ | 🟢 活跃，状态机方案 |
| Nanostores | ~4.5k | ~25 万+ | v1.0+ | 🟢 活跃，跨框架 |
| Yjs | ~18k | ~50 万+ | v13.6+ | 🟢 活跃，CRDT 协同 |
| Apollo Client | ~19k | ~120 万+ | v3.13+ | 🟢 活跃，GraphQL 首选 |

> 📊 数据来源：GitHub Stars 统计自各仓库官方页面；npm 周下载量来自 npmjs.com 及 npmtrends.com（2026-04 至 2026-05 区间均值）。版本状态截至 2026-05-01。

---

## 状态管理演进：从 Flux 到 Signals

前端状态管理的演进史，本质是一部「如何以最小心智模型管理最大复杂度」的历史。

### 1. Flux 架构（2014）

Facebook 提出的单向数据流范式：

```
Action → Dispatcher → Store → View
```

**历史意义**：首次将「状态变更必须可预测」写入架构基因。但多 Store 的样板代码、Dispatcher 的冗余设计，为 Redux 的简化埋下伏笔。

### 2. Redux（2015）

Dan Abramov 将 Flux 中的 Dispatcher 与 Store 合并为单一 Store + reducer 纯函数：

```ts
// 经典的 Redux 样板
const counterReducer = (state = 0, action: { type: string }) => {
  switch (action.type) {
    case 'INCREMENT': return state + 1
    default: return state
  }
}
```

- **Stars**：~62k（redux 整体）
- **版本**：v5.0.x（core），v2.7+（RTK）
- **适用场景**：金融系统、企业级中后台、需要时间旅行调试与严格数据流审计的项目。
- **局限**：样板代码繁重；异步逻辑需 redux-thunk / redux-saga 额外引入；2026 年不再推荐用于新项目。

### 3. MobX（2015）

引入响应式编程（Reactive Programming），通过 Proxy / decorator 实现自动依赖追踪：

```ts
import { makeAutoObservable } from 'mobx'

class Store {
  count = 0
  constructor() {
    makeAutoObservable(this)
  }
  get double() { return this.count * 2 }
  increment() { this.count++ }
}
```

- **Stars**：~27k
- **版本**：v6.13+
- **适用场景**：深嵌套可变对象、OOP 风格团队、需要最小化重渲染粒度的复杂表单。
- **现状**：进入维护稳定期，新项目选择减少，但存量大型 OOP 项目仍稳定运行。

### 4. Zustand（2019）

Poimandres 团队以 Hooks 思维重新设计：单一 Store、基于选择器的订阅、无需 Provider。

- **Stars**：~56k
- **版本**：v5.0.x
- **适用场景**：2025-2026 年 React 新项目默认选择，中小型应用与大型应用均可。

### 5. Jotai（2020）

Recoil 思想的轻量实现，以「原子（Atom）」为最小状态单元，自下而上组合：

- **Stars**：~19k
- **版本**：v2.12+
- **适用场景**：需要原子化拆分、跨模块共享派生状态、Suspense 深度集成的 React 项目。

### 6. Signals 革命（2022-2026）

Signals 作为编译时/运行时可知的细粒度响应式原语，被 Solid、Preact、Angular、Vue、Qwik 等框架内置或官方支持，标志着「组件即状态容器」模型向「信号驱动 DOM」模型的范式转移。

---

## Zustand 深度解析

Zustand（德语「状态」）由 Poimandres (pmndrs) 团队维护，以 **~1KB 体积**、**零样板代码** 和 **无需 Provider** 的设计，成为 2025-2026 年 React 新项目的默认选择。

```tsx
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppStore {
  count: number
  user: { name: string } | null
  increment: () => void
  setUser: (user: { name: string }) => void
}

const useStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        user: null,
        increment: () => set((s) => ({ count: s.count + 1 })),
        setUser: (user) => set({ user }),
      }),
      { name: 'app-storage' }
    ),
    { name: 'AppStore' }
  )
)

// 组件中使用：直接选择，自动优化重渲染
function Counter() {
  const count = useStore((s) => s.count)
  return <button>{count}</button>
}
```

**为何胜出？**

- **极简心智模型**：比 Redux 减少 90% 的样板代码
- **完美 TypeScript**：无需声明文件，类型自动推导
- **中间件生态**：持久化、Immer、路由同步、订阅等一应俱全
- **RSC 兼容**：不依赖 React Context，与 Server Components 无冲突

> 📈 **State of React 2025**：**67% 的受访者** 将 Zustand 列为首选状态管理库，Redux 降至 18%。
> 📊 数据来源：State of React 2025 调查报告（stateofreact.com）。

### 中间件生态

Zustand 的中间件采用洋葱模型，可自由组合：

```tsx
import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()(
  devtools(
    immer(
      persist(
        subscribeWithSelector((set) => ({
          bears: 0,
          increase: (by) =>
            set((draft) => {
              draft.bears += by
            }),
        })),
        { name: 'bear-storage' }
      )
    ),
    { name: 'BearStore' }
  )
)
```

| 中间件 | 作用 | 适用场景 |
|--------|------|---------|
| `devtools` | Redux DevTools 集成 | 开发调试 |
| `persist` | 本地存储持久化 | 用户偏好、登录态 |
| `immer` | 可变语法写不可变更新 | 深层嵌套对象 |
| `subscribeWithSelector` | 细粒度订阅 + 等值比较 | 高频更新场景 |
| `redux` | 兼容 Redux reducer | 渐进式迁移 |

### 持久化与存储适配

`persist` 中间件支持自定义存储引擎：

```tsx
import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'

const hashStorage: StateStorage = {
  getItem: (key): string => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    return searchParams.get(key) ?? ''
  },
  setItem: (key, newValue): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    searchParams.set(key, newValue)
    location.hash = searchParams.toString()
  },
  removeItem: (key): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    searchParams.delete(key)
    location.hash = searchParams.toString()
  },
}

const useHashStore = create<{}>()(
  persist(() => ({}), {
    name: 'hash-store',
    storage: createJSONStorage(() => hashStorage),
  })
)
```

**版本迁移（v4 → v5）**：v5 将底层存储从同步改为异步，需在组件内处理 `hydration` 状态或使用 `persist` 的 `onRehydrateStorage` 回调。

### TypeScript 深度集成

Zustand v5 改进了类型推导，支持「切片模式（Slice Pattern）」组合大型 Store：

```tsx
import { StateCreator, create } from 'zustand'

interface BearSlice {
  bears: number
  addBear: () => void
}

interface FishSlice {
  fishes: number
  addFish: () => void
}

type Store = BearSlice & FishSlice

const createBearSlice: StateCreator<Store, [], [], BearSlice> = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
})

const createFishSlice: StateCreator<Store, [], [], FishSlice> = (set) => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
})

const useStore = create<Store>()((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
}))
```

### 与 React 18 Concurrent Mode

Zustand 不依赖 React Context，天然避免 Concurrent Mode 下的「tearing」问题（即同一状态在不同组件渲染出不同快照）。其基于外部存储的订阅模型与 `useSyncExternalStore` 对齐，确保在 Transition 中状态一致性。

```tsx
// 与 startTransition 无冲突
import { useStore } from './store'
import { startTransition } from 'react'

function Search() {
  const setQuery = useStore((s) => s.setQuery)

  return (
    <input
      onChange={(e) => {
        startTransition(() => {
          setQuery(e.target.value)
        })
      }}
    />
  )
}
```

---

## Jotai 原子化状态管理

Jotai 以「原子（Atom）」为最小不可再分的状态单元，自下而上组合出复杂状态图，是 Recoil 理念的轻量实现（且 Recoil 已归档，Jotai 成为原子化方案的事实继承者）。

- **GitHub Stars**：~19k
- **版本**：v2.12+
- **适用场景**：需要原子化拆分、派生计算链、异步状态与 Suspense 深度集成的 React 项目。

### 原子组合

```tsx
import { atom, useAtom } from 'jotai'

// 基础原子
const countAtom = atom(0)

// 在组件中使用
function Counter() {
  const [count, setCount] = useAtom(countAtom)
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>
}
```

原子不依附于组件树，可在模块顶层定义并跨文件导入，天然支持代码分割。

### 派生原子（Derived Atoms）

```tsx
import { atom } from 'jotai'

const countAtom = atom(0)

// 只读派生原子
const doubleAtom = atom((get) => get(countAtom) * 2)

// 可写派生原子（类似 setter 转换器）
const decrementAtom = atom(
  (get) => get(countAtom),
  (get, set, by: number) => {
    set(countAtom, get(countAtom) - by)
  }
)

function DoubleCounter() {
  const [count, setCount] = useAtom(decrementAtom)
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => setCount(2)}>-2</button>
    </div>
  )
}
```

派生原子支持**多依赖追踪**：`atom((get) => get(a) + get(b))`，任一依赖更新即自动重算。

### 异步原子与 Suspense 集成

```tsx
import { atom, useAtom } from 'jotai'
import { Suspense } from 'react'

// 异步原子：自动触发 Suspense
const userAtom = atom(async () => {
  const res = await fetch('/api/user')
  return res.json()
})

function UserProfile() {
  const [user] = useAtom(userAtom)
  return <div>{user.name}</div>
}

function App() {
  return (
    <Suspense fallback={<p>加载中...</p>}>
      <UserProfile />
    </Suspense>
  )
}
```

Jotai 提供 `loadable` 工具以非 Suspense 方式处理异步：

```tsx
import { loadable } from 'jotai/utils'

const loadableUserAtom = loadable(userAtom)

function UserProfileSafe() {
  const [value] = useAtom(loadableUserAtom)
  if (value.state === 'hasError') return <div>Error</div>
  if (value.state === 'loading') return <div>Loading</div>
  return <div>{value.data.name}</div>
}
```

### Jotai 与 Zustand 的抉择

| 维度 | Zustand | Jotai |
|------|---------|-------|
| 心智模型 | 单一 Store，选择器切片 | 原子图，自下而上组合 |
| 代码量 | 更少 | 略多，但高度模块化 |
| 派生状态 | 需手动 selector / computed | 原生 `atom(get => ...)` |
| 异步集成 | 需配合 TanStack Query | 原生 Suspense 支持 |
| RSC 兼容 | 极佳 | 良好（需 `useAtom` 在 Client 组件） |
| 最佳场景 | 全局配置、用户态、主题 | 表单原子、多步骤向导、计算图 |

---

## Signals 革命：细粒度响应式的跨框架复兴

Signals（信号）作为最细粒度的响应式原语，正在各框架中成为核心机制：

| 框架 | Signals 实现 | 状态 |
|------|-------------|------|
| SolidJS | `createSignal` | 内置，性能标杆 |
| Preact | `@preact/signals` | 独立于框架，React 可用 |
| Angular | `signal()` / `computed()` | v16+ 内置 |
| Vue | `shallowRef` + Vapor Mode | Vue 3.4+ 响应式优化 |
| Qwik | `useSignal` | 内置 |

```tsx
// Preact Signals 在 React 中使用
import { signal, computed } from '@preact/signals-react'

const count = signal(0)
const double = computed(() => count.value * 2)

// 组件外也可读写，仅变更的 DOM 节点重渲染
function Counter() {
  return (
    <>
      <button onClick={() => count.value++}>{count}</button>
      <span>{double}</span>
    </>
  )
}
```

**Signals 的核心优势**：

- **真正的细粒度更新**：只更新引用该 signal 的 DOM 节点，而非整个组件树
- **脱离组件生命周期**：signal 可以在组件外部创建和修改
- **零依赖追踪开销**：编译时确定依赖关系，无运行时 Proxy 开销

### Solid Signals

SolidJS 将 Signals 作为唯一响应式原语，配合细粒度 JSX 编译，性能常年领跑前端框架基准测试：

```tsx
import { createSignal, createMemo, createEffect } from 'solid-js'

const [count, setCount] = createSignal(0)
const double = createMemo(() => count() * 2)

createEffect(() => {
  console.log('Count changed:', count())
})

// JSX 中直接使用 signal 函数调用
function Counter() {
  return (
    <button onClick={() => setCount(count() + 1)}>
      {count()} / {double()}
    </button>
  )
}
```

- **Stars**：~33k（solidjs/solid）
- **版本**：v1.9+
- **适用场景**：对首屏性能与运行时开销极度敏感的应用，如数据可视化仪表盘、嵌入式 WebView。

### Preact Signals

Preact Signals 以框架无关的设计成为 React 生态体验 Signals 的首选：

```tsx
// React + @preact/signals-react（自动优化）
import { signal, computed } from '@preact/signals-react'

const todos = signal<Todo[]>([])
const completedCount = computed(() => todos.value.filter((t) => t.done).length)

function TodoList() {
  // 使用 .value 读写，组件不会重渲染，仅文本节点更新
  return (
    <div>
      <span>已完成：{completedCount}</span>
      <ul>
        {todos.value.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  )
}
```

注意：`@preact/signals-react` 在 React 中通过 Babel 插件实现「绕过组件重渲染直接更新 DOM」，与 React 的调度模型存在潜在冲突，建议在性能关键路径或独立子树中使用。

### Vue Vapor Mode 响应式

Vue 3.4+ 引入 `shallowRef` 与 `computed` 的优化，Vapor Mode（无虚拟 DOM 编译模式）进一步将响应式系统推向 Signals 级别的细粒度：

```ts
import { shallowRef, computed, effect } from '@vue/reactivity'

const count = shallowRef(0)
const double = computed(() => count.value * 2)

effect(() => {
  console.log(double.value)
})

count.value++ // 仅触发依赖 double 的 DOM 更新
```

- **版本**：Vue 3.5+ / Vapor Mode 实验性
- **适用场景**：Vue 生态中需要突破虚拟 DOM 瓶颈的高频更新场景（动画、实时数据流）。

---

## React Context 性能优化与陷阱

Context API 常被误用为全局状态容器，导致性能灾难。正确理解其定位——**依赖注入**而非**状态管理**——至关重要。

### Context 性能陷阱

当 Context Value 变化时，**所有消费该 Context 的组件都会重渲染**，无论是否关心变化的部分：

```tsx
// ❌ 错误：每次渲染生成新对象，导致所有 Consumer 重渲染
const ThemeContext = createContext({ theme: 'dark', toggle: () => {} })

function Provider({ children }) {
  const [theme, setTheme] = useState('dark')
  // 每次渲染都是新对象！
  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme('light') }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

### 拆分上下文

将「读」与「写」分离，或使用多个细粒度 Context：

```tsx
// ✅ 正确：拆分为 ThemeState 与 ThemeDispatch
const ThemeStateContext = createContext('dark')
const ThemeDispatchContext = createContext<Dispatch<string>>(() => {})

function Provider({ children }) {
  const [theme, setTheme] = useState('dark')
  return (
    <ThemeStateContext.Provider value={theme}>
      <ThemeDispatchContext.Provider value={setTheme}>
        {children}
      </ThemeDispatchContext.Provider>
    </ThemeStateContext.Provider>
  )
}

// 只读主题的组件不会因 setTheme 变化而重渲染
function ThemedButton() {
  const theme = useContext(ThemeStateContext)
  return <button className={theme}>Click</button>
}
```

### useContextSelector

`use-context-selector` 库提供类 Zustand 的选择器订阅能力：

```tsx
import { createContext, useContextSelector } from 'use-context-selector'

const StoreContext = createContext(null)

function NameDisplay() {
  // 仅当 state.name 变化时重渲染
  const name = useContextSelector(StoreContext, (state) => state.name)
  return <span>{name}</span>
}
```

- **适用场景**：无法引入 Zustand/Jotai 的存量项目渐进优化。

---

## 服务端状态管理：缓存即状态

2026 年的共识是：**不再将所有状态放入一个全局 store**，而是按状态来源和生命周期分层。服务器状态（Server State）——来自 API 的数据及其缓存——应使用专用库管理。

```
┌─────────────────────────────────────────────┐
│  URL 状态 (路由参数、筛选条件)                │  → react-router / Next.js router
├─────────────────────────────────────────────┤
│  服务器状态 (API 数据、缓存)                  │  → TanStack Query / SWR / RTK Query
├─────────────────────────────────────────────┤
│  全局客户端状态 (用户身份、主题、配置)         │  → Zustand / Pinia / Context
├─────────────────────────────────────────────┤
│  局部组件状态 (UI 交互、表单临时值)            │  → useState / useReducer / Signals
├─────────────────────────────────────────────┤
│  派生状态 (计算属性、筛选结果)                 │  → computed / selector
└─────────────────────────────────────────────┘
```

### TanStack Query v5

- **GitHub Stars**：~45k
- **版本**：v5.75+
- **npm 周下载量**：~450 万+
- **适用场景**：任何需要服务端缓存、后台刷新、乐观更新、无限滚动的 React/Vue/Angular/Svelte/Solid 项目。

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await fetch('/api/todos')
      if (!res.ok) throw new Error('Network error')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 分钟内视为新鲜
  })
}

function useAddTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newTodo: string) =>
      fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text: newTodo }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

**缓存策略**：
- `staleTime`：数据视为新鲜的时间窗口，期间不会重新请求。
- `gcTime`（原 `cacheTime`）：垃圾回收时间，组件卸载后数据在内存中保留的时长。
- `placeholderData` / `initialData`：提升感知性能，减少 loading 闪烁。

### SWR

- **GitHub Stars**：~32k
- **版本**：v2.3+
- **适用场景**：Vercel 生态、偏好极简 API、对 Bundle 体积极度敏感的项目。

```tsx
import useSWR, { mutate } from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function Profile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
  })

  if (isLoading) return <div>loading...</div>
  if (error) return <div>failed to load</div>
  return <div>hello {data.name}!</div>
}
```

SWR 的「自动重验证（revalidate）」策略（聚焦、网络恢复、轮询）与 TanStack Query 类似，但 API 更精简，缺少部分高级功能（如乐观更新辅助、Mutation 自动取消）。

### RTK Query

Redux Toolkit 官方的服务端状态解决方案，与 Redux DevTools 深度集成。

- **版本**：v2.7+
- **适用场景**：存量 Redux 项目、需要服务端状态与客户端状态在同一时间旅行调试流中的企业级应用。

```tsx
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => 'posts',
      providesTags: ['Post'],
    }),
    addPost: builder.mutation<Post, Partial<Post>>({
      query: (body) => ({ url: 'posts', method: 'POST', body }),
      invalidatesTags: ['Post'],
    }),
  }),
})

export const { useGetPostsQuery, useAddPostMutation } = api
```

**与 TanStack Query 的对比**：RTK Query 更利于 Redux 存量迁移，但新项目首选 TanStack Query。

### Apollo Client 缓存策略

GraphQL 生态的标准客户端：

- **GitHub Stars**：~19k
- **版本**：v3.13+
- **适用场景**：GraphQL 后端、需要类型安全的端到端数据流、复杂实体关系缓存（`InMemoryCache` 的 `typePolicies`）。

```tsx
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

const client = new ApolloClient({
  uri: 'https://api.example.com/graphql',
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          todos: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming]
            },
          },
        },
      },
    },
  }),
})
```

Apollo 的规范化缓存自动按 `__typename + id` 合并实体，避免重复请求同一对象，是 REST 缓存难以比拟的优势。

---

## 跨框架状态方案

### Pinia（Vue 官方推荐）

- **GitHub Stars**：~39k
- **版本**：v3.0+
- **npm 周下载量**：~200 万+
- **适用场景**：Vue 2/3 项目全局状态管理，Vue 官方从 Vuex 迁移后的唯一推荐。

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  return { count, doubleCount, increment }
})

// 在组件中使用
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
counter.increment()
```

Pinia 的 Composition API 风格与 Vue 3 完全对齐，支持 SSR、插件生态（持久化、路由同步），并可通过 `pinia` 实例在 Vue 与非 Vue 代码间共享。

### Nanostores（多框架原子状态）

- **GitHub Stars**：~4.5k
- **版本**：v1.0+
- **npm 周下载量**：~25 万+
- **适用场景**：微前端、跨框架组件库、Astro/SSR 项目需要在 React、Vue、Svelte、Solid 之间共享状态。

```ts
// stores/counter.ts
import { atom, computed } from 'nanostores'

export const count = atom(0)
export const double = computed(count, (value) => value * 2)

export function increment() {
  count.set(count.get() + 1)
}
```

```tsx
// React 组件
import { useStore } from '@nanostores/react'
import { count, increment } from '../stores/counter'

function Counter() {
  const value = useStore(count)
  return <button onClick={increment}>{value}</button>
}
```

```vue
<!-- Vue 组件 -->
<script setup>
import { useStore } from '@nanostores/vue'
import { count, increment } from '../stores/counter'

const value = useStore(count)
</script>

<template>
  <button @click="increment">{{ value }}</button>
</template>
```

Nanostores 体积极小（~300B），无框架依赖，是跨框架共享状态的最轻量方案。

### RxJS

- **GitHub Stars**：~31k
- **版本**：v7.8+ / v8 开发中
- **适用场景**：复杂异步流（WebSocket、用户输入防抖、多源事件合并）、需要精确控制订阅生命周期的系统级前端。

```ts
import { BehaviorSubject, combineLatest } from 'rxjs'
import { map, debounceTime } from 'rxjs/operators'

const search$ = new BehaviorSubject('')
const filters$ = new BehaviorSubject<string[]>([])

const results$ = combineLatest([search$, filters$]).pipe(
  debounceTime(300),
  map(([query, filters]) => fetchResults(query, filters))
)
```

RxJS 的学习曲线陡峭，但在「事件即流」的场景中无可替代。与 React 集成时可使用 `useObservable` hook 或 `useSyncExternalStore` 包装。

---

## 持久化与状态同步

### Zustand Persist

前文已详述 `persist` 中间件，此处补充多 Tab 同步能力：

```tsx
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({ count: 0, inc: () => set((s) => ({ count: s.count + 1 })) }),
    {
      name: 'counter-storage',
      // 监听 storage 事件，实现多 Tab 同步
      onRehydrateStorage: () => (state) => {
        console.log('hydrated', state)
      },
    }
  )
)
```

结合 `BroadcastChannel API` 或 `storage` 事件可实现跨 Tab 状态同步。

### Redux Persist

- **GitHub Stars**：~13k
- **版本**：v6.0+
- **适用场景**：存量 Redux 项目需要状态持久化与迁移（migrate）。

```ts
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'settings'],
  version: 1,
  migrate: (state) => {
    // 处理版本迁移逻辑
    return Promise.resolve(state)
  },
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
export const persistor = persistStore(store)
```

Redux Persist 的 `transform` 机制支持加密、压缩、过期清理，但配置复杂度高于 Zustand persist。

### Yjs CRDT 协同状态

- **GitHub Stars**：~18k
- **版本**：v13.6+
- **适用场景**：实时协同编辑、白板、表单同步、本地优先（Local-First）应用。

Yjs 基于 CRDT（无冲突复制数据类型），可在无中央服务器的情况下实现多客户端最终一致性：

```ts
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const doc = new Y.Doc()
const yarray = doc.getArray('todos')

// 通过 WebSocket 同步
const provider = new WebsocketProvider(
  'wss://demos.yjs.dev',
  'my-room',
  doc
)

// 像操作普通数组一样操作，自动同步到所有连接端
yarray.push(['Buy milk'])

// 观测变化
yarray.observe((event) => {
  console.log('Local or remote change:', event.changes)
})
```

**本地优先（Local-First）趋势**：2025-2026 年，以 Yjs、Automerge、Electric SQL 为代表的本地优先数据库将状态持久化与协同同步合二为一。用户数据首先写入本地 IndexedDB，再后台同步至服务器，兼具离线可用性与数据主权。

| 方案 | 同步模型 | 适用场景 |
|------|---------|---------|
| Yjs | CRDT + WebSocket | 文档协同、富文本、白板 |
| Automerge | CRDT | 实验性项目、Rust/WASM 高性能需求 |
| Electric SQL | CRDT + PostgreSQL | 现有 PostgreSQL 后端渐进增强本地优先 |
| Zustand + yjs | 中间件桥接 | 已有 Zustand 项目快速接入协同 |

---

## 2026 趋势与展望

1. **Signals 普及化**：React Compiler（React 19+）引入的自动记忆化虽缓解了重渲染问题，但 Signals 的「绕过虚拟 DOM 直接更新」仍具根本性优势。预计 2026 年末，React 核心团队可能发布官方 Signals 提案。
2. **服务端状态主导**：TanStack Query 的下载量已超越多数客户端状态库，「客户端只保留 UI 状态，其余交给服务端缓存」成为架构默认。
3. **本地优先（Local-First）崛起**：离线可用、数据主权、低延迟写入驱动 Yjs / Electric SQL / PowerSync 进入主流选型清单。
4. **Zustand 地位固化**：在 React 客户端状态领域，Zustand 与 Jotai 形成「双寡头」，分别统治「简单全局」与「原子化复杂」场景。
5. **跨框架方案增长**：微前端与 Islands 架构推动 Nanostores、RxJS 等框架无关方案用量上升。

> 📊 趋势判断综合来源：State of JS 2024 / State of React 2025 调查报告、npm 下载量趋势（npmtrends.com, 2024-2025）、GitHub 仓库 release 活跃度、Vercel / Netlify 年度生态报告。

---

## 选型决策树

```
开始选型
│
├─ 框架是 Vue？
│   └─ 是 → Pinia（客户端）+ TanStack Query（服务端）
│
├─ 需要跨框架共享状态（React + Vue + Svelte）？
│   └─ 是 → Nanostores（轻量）或 RxJS（流复杂）
│
├─ 需要实时多人协同编辑？
│   └─ 是 → Yjs / Automerge + 本地优先架构
│
├─ 服务端状态（API 缓存）占比 > 80%？
│   └─ 是 → TanStack Query（React/Vue/Angular/Svelte/Solid 全覆盖）
│
├─ 项目规模
│   ├─ 小型应用（< 20 个全局状态字段）
│   │   └─ React Context + useReducer（避免引入库）
│   │   或 Zustand（为未来扩展预留）
│   ├─ 中型应用（20-100 个字段，多模块）
│   │   └─ Zustand（推荐）
│   │   或 Jotai（状态高度原子化、模块间强依赖）
│   └─ 大型企业级（严格审计、时间旅行、微服务聚合）
│       └─ 存量 Redux Toolkit → 渐进迁移至 Zustand + TanStack Query
│       或 全新项目采用 Zustand + RTK Query（若团队 Redux 经验丰富）
│
├─ 性能极度敏感（动画、高频数据流）？
│   └─ 是 → Signals（Preact Signals in React / Solid Signals）
│
├─ 需要状态机管理复杂工作流？
│   └─ 是 → XState
│
└─ 默认推荐
    └─ React 生态：Zustand + TanStack Query
       Vue 生态：Pinia + TanStack Query
       跨框架：Nanostores
```

---

## 选型矩阵

### 按框架

| 框架 | 首选客户端状态 | 首选服务器状态 | 备注 |
|------|--------------|--------------|------|
| React | Zustand | TanStack Query | Signals 可用 @preact/signals-react |
| Vue | Pinia | TanStack Query (Vue) | Vapor Mode 将进一步优化响应式 |
| Angular | Signals（内置） | TanStack Query (Angular) | v16+ 内置 signal |
| Solid | createSignal（内置） | TanStack Query (Solid) | 原生 Signals 体验最佳 |
| Svelte | runes（内置） | TanStack Query (Svelte) | Svelte 5 runes 即 Signals |

### 按场景

| 场景 | 推荐方案 |
|------|---------|
| 中小型 React 应用 | Zustand |
| 大型 React 应用 + 严格数据流 | Zustand + TanStack Query，或 Redux Toolkit（存量） |
| 需要原子化拆分状态 | Jotai |
| 可变状态 + 复杂对象 | Valtio / MobX |
| Vue 3 项目 | Pinia |
| 状态机 / 复杂工作流 | XState |
| 跨框架共享状态 | Nanostores / RxJS |
| 实时协同编辑 | Yjs / Automerge |
| 本地优先架构 | Electric SQL + Zustand / Nanostores |
| GraphQL 服务端状态 | Apollo Client |

---

## 现状与迁移指南

- **Recoil**：已于 2025 年 1 月 1 日被 Meta 归档，停止维护。建议迁移至 **Jotai**（API 最接近）或 **Zustand**。
- **Redux Toolkit**：不再推荐用于新项目，但在金融、企业级存量系统中仍广泛存在。RTK Query 部分场景可被 TanStack Query 替代。
- **MobX**：进入维护稳定期，新项目选择减少，但存量大型 OOP 项目仍稳定运行。MobX 6 的 `makeAutoObservable` 已大幅降低配置成本，迁移至 Zustand 的收益需权衡。
- **Vuex**：Vue 官方已全面转向 Pinia，Vuex 进入维护模式，新项目不应使用。

---

> 📊 **数据统计时间**：2026年5月
> ⭐ Stars 与下载量数据来源于 GitHub / npm 公开 API 及 npmtrends.com 聚合统计
> 📈 趋势洞察参考 State of React 2025、State of JS 2024、Vercel 生态报告
> 📎 关联实验室：[20.5-frontend-frameworks](../../20-code-lab/20.5-frontend-frameworks/)
