# 状态管理库对比矩阵

> 最后更新：2026年4月

## 核心对比表

| 特性 | Zustand | Redux | Jotai | Pinia |
|------|---------|-------|-------|-------|
| **GitHub Stars** | 47k | 61k | 20k | 42k |
| **包大小 (gzip)** | ~1.1KB | ~7KB (RTK) | ~4KB | ~4KB |
| **TypeScript 支持** | 🟢 原生 | 🟢 原生 | 🟢 原生 | 🟢 原生 |
| **学习曲线** | ⭐ 低 | ⭐⭐⭐ 高 | ⭐ 低 | ⭐⭐ 中 |
| **开发体验** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **DevTools 支持** | ✅ | ✅ 强大 | ✅ | ✅ |
| **中间件/插件** | 少 | 丰富 | 少 | 中 |
| **服务端渲染** | ✅ | ✅ | ✅ | ✅ |
| **持久化存储** | 插件 | 插件 | 插件 | 插件 |

## 详细分析

### Zustand

```bash
npm install zustand
```

- **设计理念**: 简单、快速、不可变状态管理
- **核心概念**: Store = Hook
- **优势**:
  - 极简 API，5分钟上手
  - 极小的包体积
  - 无样板代码
  - 支持选择器优化重渲染
- **劣势**: 复杂场景需配合其他库
- **适用场景**: 中小型项目、React 应用

```typescript
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}))
```

### Redux (RTK)

```bash
npm install @reduxjs/toolkit react-redux
```

- **设计理念**: 可预测的状态容器
- **核心概念**: Action → Reducer → Store
- **优势**:
  - 生态最成熟
  - Redux DevTools 强大
  - 中间件丰富
  - 适合大型复杂应用
- **劣势**: 学习曲线陡峭、样板代码多
- **适用场景**: 大型应用、团队协作

```typescript
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    incremented: (state) => { state.value += 1 },
  },
})
```

### Jotai

```bash
npm install jotai
```

- **设计理念**: 原子化状态管理 (Atomic CSS-in-JS 的理念)
- **核心概念**: Atom = 最小状态单元
- **优势**:
  - 基于原子，细粒度更新
  - 派生状态简洁
  - 支持异步原子
  - 类型推导优秀
- **劣势**: 状态分散，大型项目组织需规范
- **适用场景**: 需要细粒度控制、派生状态复杂的应用

```typescript
import { atom, useAtom } from 'jotai'

const countAtom = atom(0)
const doubledAtom = atom((get) => get(countAtom) * 2)
```

### Pinia

```bash
npm install pinia
```

- **设计理念**: Vue 生态的官方状态管理
- **核心概念**: Store = State + Getters + Actions
- **优势**:
  - Vue 官方推荐
  - TypeScript 体验极佳
  - 模块化设计
  - 热更新支持
- **劣势**: 仅适用于 Vue
- **适用场景**: Vue 2/3 项目

```typescript
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { double: (state) => state.count * 2 },
  actions: { increment() { this.count++ } },
})
```

## 特性对比详解

| 特性 | Zustand | Redux | Jotai | Pinia |
|------|---------|-------|-------|-------|
| **框架绑定** | React | 通用 (React/Vue等) | React | Vue |
| **状态粒度** | Store 级 | Store 级 | Atom 级 | Store 级 |
| **订阅方式** | 选择器 | connect/useSelector | useAtom | storeToRefs |
| **异步处理** | 直接写 | createAsyncThunk | atom(async) | actions |
| **不可变更新** | 内置 | Immer (RTK) | 内置 | 自动解包 |
| **模块拆分** | 多 Store | Slice | Atom 组合 | 多 Store |
| **时间旅行调试** | 基础 | 完整 | 基础 | 完整 |

## 选型建议

| 场景 | 推荐 |
|------|------|
| React 新项目，追求简单 | Zustand |
| React 大型应用，团队规范 | Redux Toolkit |
| 需要细粒度状态控制 | Jotai |
| Vue 项目 | Pinia |
| 从 Redux 迁移 | Zustand 或 Jotai |
| 需要跨框架共享 | Redux |
