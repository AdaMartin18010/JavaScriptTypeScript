---
title: 状态管理库对比矩阵
description: 'Zustand、Redux、Jotai、Pinia、MobX、Recoil、Signals、TanStack Query 等状态管理方案全面选型对比'
---

# 状态管理库对比矩阵

> 最后更新: 2026-05-01 | 覆盖: React/Vue/Solid/多框架、服务端状态、Signals

---

## 核心对比表

| 特性 | Zustand | Redux Toolkit | Jotai | Pinia | MobX | Recoil | Solid Signals |
|------|---------|---------------|-------|-------|------|--------|---------------|
| **Stars** | 47k+ | 61k+ | 20k+ | 42k+ | 27k+ | 19k+ | 35k+ (Solid) |
| **包大小(gzip)** | ~1.1KB | ~7KB | ~4KB | ~4KB | ~16KB | ~14KB | ~0KB (内置) |
| **TypeScript** | ✅ 原生 | ✅ 原生 | ✅ 原生 | ✅ 原生 | ✅ 原生 | ✅ 原生 | ✅ 原生 |
| **学习曲线** | 低 | 高 | 低 | 中 | 中 | 中 | 低 |
| **DevTools** | ✅ | ✅ 强大 | ✅ | ✅ | ✅ | ⚠️ 有限 | ⚠️ 有限 |
| **中间件** | 少 | 丰富 | 少 | 中 | 丰富 | 少 | 无 |
| **SSR** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **持久化** | 插件 | 插件 | 插件 | 插件 | 插件 | 插件 | 手动 |
| **2026 状态** | 🟢 首选 | 🟡 存量 | 🟢 增长 | 🟢 Vue 首选 | 🟡 维护 | 🔴 不推荐 | 🟢 未来 |

📊 数据来源: GitHub Stars (2026-05), npm 周下载量, Bundlephobia

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

## 2026 趋势

| 趋势 | 描述 |
|------|------|
| **Signals 普及** | React 社区拥抱 Signals (Preact Signals, Legend State) |
| **Zustand 统治** | 新建 React 项目默认选择 |
| **服务端状态主导** | TanStack Query 成为数据获取标准 |
| **本地优先** | Yjs + Electric SQL 推动协同状态 |
| **Redux 存量** | 新项目采用率 < 10%，但存量庞大 |

---

## 参考资源

- [Zustand 文档](https://docs.pmnd.rs/zustand) 📚
- [Redux Toolkit 文档](https://redux-toolkit.js.org/) 📚
- [Jotai 文档](https://jotai.org/) 📚
- [Pinia 文档](https://pinia.vuejs.org/) 📚
- [TanStack Query 文档](https://tanstack.com/query/latest) 📚

