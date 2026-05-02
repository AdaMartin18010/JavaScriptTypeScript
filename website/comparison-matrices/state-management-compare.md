---
title: 状态管理库对比矩阵
description: 'Zustand、Redux、Jotai、Pinia、MobX、Recoil、Signals、TanStack Query 等状态管理方案全面选型对比'
---

# 状态管理库对比矩阵

> 最后更新: 2026-05-02 | 覆盖: React/Vue/Solid/多框架、服务端状态、Signals

---

## 核心对比表

| 特性 | Zustand | Redux Toolkit | Jotai | Pinia | MobX | Recoil | Solid Signals |
|------|---------|---------------|-------|-------|------|--------|---------------|
| **Stars** | 58k+ | 61k+ | 21k+ | 15k+ | 28k+ | 19k+ | 35k+ (Solid) |
| **包大小(gzip)** | ~1.1KB | ~7KB | ~4KB | ~4KB | ~16KB | ~14KB | ~0KB (内置) |
| **TypeScript** | ✅ 原生 | ✅ 原生 | ✅ 原生 | ✅ 原生 | ✅ 原生 | ✅ 原生 | ✅ 原生 |
| **学习曲线** | 低 | 高 | 低 | 中 | 中 | 中 | 低 |
| **DevTools** | ✅ | ✅ 强大 | ✅ | ✅ | ✅ | ⚠️ 有限 | ⚠️ 有限 |
| **中间件** | 少 | 丰富 | 少 | 中 | 丰富 | 少 | 无 |
| **SSR** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **持久化** | 插件 | 插件 | 插件 | 插件 | 插件 | 插件 | 手动 |
| **2026 状态** | 🟢 首选 | 🟡 存量 | 🟢 增长 | 🟢 Vue 首选 | 🟡 维护 | 🔴 不推荐 | 🟢 未来 |

📊 数据来源: GitHub Stars (2026-05-02), npm 周下载量, Bundlephobia

---

## 客户端状态管理

### Zustand

```bash
npm install zustand
```

**定位**: 极简 React 状态管理

- **优势**: 极简 API、极小体积、无样板、选择器优化重渲染
- **劣势**: 复杂场景需配合其他库
- **适用**: 中小型 React 项目、快速原型

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(persist(
  (set) => ({
    count: 0,
    inc: () => set((s) => ({ count: s.count + 1 })),
  }),
  { name: 'counter-storage' }
))
```

### Redux Toolkit

```bash
npm install @reduxjs/toolkit react-redux
```

**定位**: 可预测的大型应用状态容器

- **优势**: 生态最成熟、DevTools 强大、中间件丰富、RTK Query
- **劣势**: 学习曲线陡峭、样板代码
- **适用**: 大型应用、团队协作、需要严格数据流

```ts
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: { incremented: (state) => { state.value += 1 } },
})

const store = configureStore({ reducer: { counter: counterSlice.reducer } })
```

### Jotai

```bash
npm install jotai
```

**定位**: 原子化状态管理

- **优势**: 细粒度更新、派生状态简洁、异步原子、Suspense 集成
- **劣势**: 状态分散，大型项目需规范
- **适用**: 需要细粒度控制、派生状态复杂的应用

```ts
import { atom, useAtom } from 'jotai'

const countAtom = atom(0)
const doubledAtom = atom((get) => get(countAtom) * 2)
const asyncAtom = atom(async (get) => fetchUser(get(countAtom)))
```

### MobX

```bash
npm install mobx mobx-react-lite
```

**定位**: 响应式状态管理

- **优势**: 自动追踪依赖、装饰器语法、直观
- **劣势**: 魔法感强、调试困难、包体积较大
- **适用**: 需要自动响应的应用

```ts
import { makeAutoObservable } from 'mobx'

class Store {
  count = 0
  constructor() { makeAutoObservable(this) }
  increment() { this.count++ }
}
```

---

## Signals 革命

Signals 是 2024-2026 年状态管理领域最重要的范式转移。

| 方案 | 框架 | 包大小 | 特点 |
|------|------|--------|------|
| **Solid Signals** | SolidJS | 内置 | 细粒度更新标杆，无 Virtual DOM |
| **Preact Signals** | Preact/React | ~1KB | React 中可用，绕过重渲染 |
| **Vue Vapor Mode** | Vue | 内置 | 编译时 Signals 优化 |
| **Angular Signals** | Angular | 内置 | v16+ 引入，逐步替代 Zone.js |

```ts
// Preact Signals in React
import { signal, computed } from '@preact/signals-react'

const count = signal(0)
const doubled = computed(() => count.value * 2)

function Component() {
  return <button onClick={() => count.value++}>{count} {doubled}</button>
}
```

---

## 服务端状态管理

| 工具 | Stars | 缓存策略 | 去重 | 重验证 | 乐观更新 | DevTools |
|------|-------|----------|:----:|:------:|:--------:|:--------:|
| **TanStack Query v5** | 42k+ | staleTime/gcTime | ✅ | ✅ | ✅ | ✅ |
| **SWR** | 30k+ | dedupingInterval | ✅ | ✅ | ⚠️ | ❌ |
| **RTK Query** | 61k+ (同 RTK) | tags | ✅ | ✅ | ✅ | ✅ |
| **Apollo Client** | 19k+ | InMemoryCache | ✅ | ✅ | ✅ | ✅ |

```ts
// TanStack Query v5
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

function Users() {
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  })
  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

---

## 跨框架方案

| 方案 | React | Vue | Svelte | Solid | 包大小 |
|------|:-----:|:---:|:------:|:-----:|--------|
| **Nanostores** | ✅ | ✅ | ✅ | ✅ | ~0.5KB |
| **RxJS** | ✅ | ✅ | ✅ | ✅ | ~15KB |
| **Valtio** | ✅ | ⚠️ | ❌ | ❌ | ~3KB |
| **XState** | ✅ | ✅ | ✅ | ✅ | ~10KB |

```ts
// Nanostores (多框架)
import { atom } from 'nanostores'
import { useStore } from '@nanostores/react' // or vue, solid, svelte

export const count = atom(0)

// React
function Counter() {
  const $count = useStore(count)
  return <button onClick={() => count.set($count + 1)}>{$count}</button>
}
```

---

## 性能对比

### 重渲染优化

| 方案 | 粒度 | 自动优化 | 手动优化 |
|------|------|:--------:|:--------:|
| **Zustand** | Store | 选择器 | `shallow` |
| **Jotai** | Atom | 自动 | `selectAtom` |
| **Redux** | Store | `useSelector` | `reselect` |
| **Signals** | Signal | 自动 | 无需 |
| **MobX** | Observable | 自动 | `observer` |

### 内存占用（1000 组件）

| 方案 | 内存 |
|------|------|
| **Signals** | ~5MB |
| **Zustand** | ~8MB |
| **Jotai** | ~10MB |
| **Redux** | ~15MB |
| **MobX** | ~20MB |

---

## 选型决策树

```
React 项目？
├── 是
│   ├── 需要细粒度更新 → Jotai / Signals
│   ├── 大型应用/团队 → Redux Toolkit
│   ├── 简单快速 → Zustand
│   └── 复杂状态机 → XState
├── Vue 项目 → Pinia
├── Solid 项目 → Signals (内置)
└── 跨框架 → Nanostores / RxJS

需要服务端状态？
├── 是 → TanStack Query (首选) / SWR
└── 否 → 客户端状态方案
```

| 场景 | 推荐 |
|------|------|
| React 新项目 | Zustand / Jotai |
| React 大型应用 | Redux Toolkit |
| Vue 项目 | Pinia |
| 服务端状态 | TanStack Query |
| 细粒度控制 | Jotai / Signals |
| 复杂异步流 | RxJS |
| 状态机逻辑 | XState |
| 跨框架共享 | Nanostores |

---

## 状态管理架构模式

### 分层架构

```
┌─────────────────────────────────────────┐
│           展示层 (UI Components)         │
│  React / Vue / Solid / Svelte           │
├─────────────────────────────────────────┤
│           状态层 (State Layer)           │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │ 本地状态 │ │ 共享状态 │ │ 远程状态  │  │
│  │ useState │ │ Zustand │ │ TanStack │  │
│  │  Signal  │ │  Jotai  │ │  Query   │  │
│  └─────────┘ └─────────┘ └──────────┘  │
├─────────────────────────────────────────┤
│           服务层 (Service Layer)         │
│  API Client / Cache / Persistence       │
└─────────────────────────────────────────┘
```

### 推荐分层策略

| 状态类型 | 工具 | 生命周期 | 作用域 |
|----------|------|----------|--------|
| **组件本地** | useState / Signal | 组件挂载 | 组件内 |
| **模块共享** | Zustand / Jotai | 页面级 | 页面内 |
| **全局应用** | Redux Toolkit / Pinia | 应用级 | 全局 |
| **服务端缓存** | TanStack Query / SWR | 按需/过期 | 全局 |
| **URL 状态** | 路由参数 | URL 级 | 共享 |
| **本地存储** | Zustand persist | 持久化 | 全局 |

---

## 高级状态管理方案

### Legend State

```bash
npm install @legendapp/state
```

**定位**: 基于 Signals 的响应式状态管理，自动跟踪依赖

- **Stars**: 6k+ | **包大小**: ~4KB
- **优势**: 自动优化重渲染、原生 Signals、持久化内置
- **特点**: 无需选择器，自动追踪使用到的属性

```ts
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'

const state = observable({ count: 0, user: { name: 'John' } })

// 自动追踪：只重渲染当 count 变化时
const Counter = observer(() => {
  return <div>{state.count.get()}</div>
})

// 直接修改，自动触发更新
state.count.set(c => c + 1)
```

### Valtio

```bash
npm install valtio
```

**定位**: Proxy 驱动的可变状态管理

- **Stars**: 8k+ | **包大小**: ~3KB
- **优势**: 可变语法、自动订阅、TypeScript 友好
- **适用**: 喜欢可变语法的开发者

```ts
import { proxy, useSnapshot } from 'valtio'

const state = proxy({ count: 0, nested: { value: 1 } })

function Counter() {
  const snap = useSnapshot(state)
  return (
    <button onClick={() => state.count++}>
      {snap.count}
    </button>
  )
}
```

### Effector

```bash
npm install effector
```

**定位**: 业务逻辑与 UI 分离的独立状态管理

- **Stars**: 9k+ | **包大小**: ~8KB
- **优势**: 纯函数事件驱动、测试友好、SSR 支持
- **适用**: 复杂业务逻辑、需要严格数据流

```ts
import { createStore, createEvent, sample } from 'effector'

const increment = createEvent()
const $count = createStore(0)
  .on(increment, count => count + 1)

// 纯逻辑，不依赖任何 UI 框架
$count.watch(count => console.log(count))
increment() // 1
```

---

## 状态持久化与同步

### 持久化方案对比

| 方案 | 库 | 存储 | 加密 | 压缩 | 版本控制 |
|------|-----|------|:----:|:----:|:--------:|
| **LocalStorage** | Zustand persist | localStorage | ❌ | ❌ | ❌ |
| **IndexedDB** | idb-keyval | IndexedDB | ❌ | ❌ | ❌ |
| **MMKV** | react-native-mmkv | 文件 | ❌ | ❌ | ❌ |
| **Secure Store** | expo-secure-store | Keychain | ✅ | ❌ | ❌ |

### 状态同步（本地优先）

```ts
// Electric SQL 本地优先同步
import { Shape } from '@electric-sql/client'

const shape = new Shape({
  url: 'http://localhost:3000/v1/shape',
  table: 'todos',
})

// 自动双向同步：本地 <-> 服务端
shape.subscribe(rows => {
  console.log('Synced rows:', rows)
})
```

| 工具 | Stars | 协议 | CRDT | 离线支持 | 冲突解决 |
|------|-------|------|:----:|:--------:|:--------:|
| **Yjs** | 18k+ | CRDT | ✅ | ✅ | 自动 |
| **Electric SQL** | 5k+ | 逻辑复制 | ❌ | ✅ | 最后写入 |
| **PowerSync** | 2k+ | SQLite | ❌ | ✅ | 自定义 |
| **Liveblocks** | 8k+ | 操作转换 | ❌ | ✅ | 实时 |
| **TinyBase** | 6k+ | 本地优先 | ❌ | ✅ | 手动 |

---

## 选型决策矩阵

| 维度 | 权重 | Zustand | Jotai | Redux | Pinia | Signals |
|------|:----:|:-------:|:-----:|:-----:|:-----:|:-------:|
| 学习成本 | 高 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 性能 | 高 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| DevTools | 中 | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 生态 | 中 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| SSR | 高 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 团队规模 | 中 | 小-中 | 小-中 | 大 | 中-大 | 小-中 |

---

## 2026-2027 趋势

| 趋势 | 描述 | 影响度 |
|------|------|:------:|
| **Signals 普及** | React 社区拥抱 Signals (Preact Signals, Legend State) | 🔥 极高 |
| **Zustand 统治** | 新建 React 项目默认选择，市占率 40%+ | 🔥 极高 |
| **服务端状态主导** | TanStack Query 成为数据获取标准 | 🔥 极高 |
| **本地优先架构** | Yjs + Electric SQL 推动协同状态管理 | 🔥 高 |
| **Redux 存量维护** | 新项目采用率 < 10%，但存量庞大 | 中 |
| **状态即服务** | Convex、Supabase Realtime 等后端即状态 | 🔥 高 |
| **编译时优化** | Vue Vapor Mode、Solid 编译时优化减少运行时开销 | 中 |
| **AI 驱动状态** | AI 生成状态管理代码、智能状态切分 | 新兴 |

### 2027 年技术栈推荐

| 场景 | 推荐方案 |
|------|----------|
| **React 新项目** | Zustand + TanStack Query |
| **React 高性能** | Preact Signals / Legend State |
| **Vue 项目** | Pinia + VueUse |
| **Solid 项目** | Signals (内置) + Solid Query |
| **跨框架组件库** | Nanostores |
| **复杂状态机** | XState |
| **本地优先应用** | Yjs + Electric SQL |
| **全栈实时** | Convex / Supabase Realtime |

---

## 参考资源

- [Zustand 文档](https://docs.pmnd.rs/zustand) 📚
- [Redux Toolkit 文档](https://redux-toolkit.js.org/) 📚
- [Jotai 文档](https://jotai.org/) 📚
- [Pinia 文档](https://pinia.vuejs.org/) 📚
- [TanStack Query 文档](https://tanstack.com/query/latest) 📚
