---
title: 状态管理库生态
description: JavaScript/TypeScript 状态管理生态 2025-2026 — Zustand 统治、Signals 革命、服务器状态管理与选型矩阵
---

# 状态管理生态

> **趋势洞察**：Zustand 以极简 API 和卓越性能成为 React 生态绝对主流；Signals 架构（Preact Signals、Solid Signals、Angular Signals）正在重塑响应式模型；Recoil 已归档，Redux Toolkit 退守企业级场景；服务器状态管理（TanStack Query）与客户端状态管理的边界日趋清晰。

---

## 核心数据概览（2026年5月）

| 方案 | GitHub Stars | npm 周下载量 | 状态 |
|------|-------------|-------------|------|
| Zustand | ~56k | ~350 万+ | 🟢 活跃，React 生态首选 |
| TanStack Query v5 | ~45k | ~450 万+ | 🟢 活跃，服务器状态标准 |
| Redux Toolkit | ~62k (redux 整体) | ~250 万+ | 🟡 维护模式，企业存量 |
| Pinia | ~39k | ~200 万+ | 🟢 活跃，Vue 官方推荐 |
| Jotai | ~19k | ~60 万+ | 🟢 活跃，原子化方案 |
| SWR | ~32k | ~60 万+ | 🟢 活跃，Vercel 出品 |
| Recoil | ~19k | - | 🔴 2025.1 已归档 |
| Valtio | ~10k | ~15 万+ | 🟢 活跃 |

---

## Zustand：React 状态管理的统治级方案

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

---

## 各类状态的分层管理

2026 年的共识是：**不再将所有状态放入一个全局 store**，而是按状态来源和生命周期分层：

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

---

## 选型矩阵

### 按框架

| 框架 | 首选客户端状态 | 首选服务器状态 | 备注 |
|------|--------------|--------------|------|
| React | Zustand | TanStack Query | Signals 可用 @preact/signals-react |
| Vue | Pinia | TanStack Query (Vue) | Vapor Mode 将进一步优化响应式 |
| Angular | Signals (内置) | TanStack Query (Angular) | v16+ 内置 signal |
| Solid | createSignal (内置) | TanStack Query (Solid) | 原生 Signals 体验最佳 |
| Svelte | runes (内置) | TanStack Query (Svelte) | Svelte 5 runes 即 Signals |

### 按场景

| 场景 | 推荐方案 |
|------|---------|
| 中小型 React 应用 | Zustand |
| 大型 React 应用 + 严格数据流 | Zustand + TanStack Query，或 Redux Toolkit（存量） |
| 需要原子化拆分状态 | Jotai |
| 可变状态 + 复杂对象 | Valtio |
| Vue 3 项目 | Pinia |
| 状态机 / 复杂工作流 | XState |
| 跨框架共享状态 | Nanostores / RxJS |

---

## 现状与迁移指南

- **Recoil**：已于 2025 年 1 月 1 日被 Meta 归档，停止维护。建议迁移至 **Jotai**（API 最接近）或 **Zustand**。
- **Redux Toolkit**：不再推荐用于新项目，但在金融、企业级存量系统中仍广泛存在。RTK Query 部分场景可被 TanStack Query 替代。
- **MobX**：进入维护稳定期，新项目选择减少，但存量大型 OOP 项目仍稳定运行。

---

> 📊 **数据统计时间**：2026年5月
> ⭐ Stars 与下载量数据来源于 GitHub / npm 公开 API
> 📎 关联实验室：[20.5-frontend-frameworks](../../20-code-lab/20.5-frontend-frameworks/)
