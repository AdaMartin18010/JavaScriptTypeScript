---
title: "数据流与认知轨迹"
description: "Redux vs MobX vs Zustand vs Signals：状态管理模式的认知科学对比"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: complete
priority: P1
actual-length: ~9000 words
references:
  - Redux Documentation
  - MobX Documentation
  - Zustand Documentation
---

# 数据流与认知轨迹

> **理论深度**: 跨学科
> **前置阅读**: [01-cognitive-science-primer-for-developers.md](01-cognitive-science-primer-for-developers.md)
> **目标读者**: 前端开发者、状态管理设计者

---

## 目录

- [数据流与认知轨迹](#数据流与认知轨迹)
  - [目录](#目录)
  - [0. 状态管理如何影响你的大脑？](#0-状态管理如何影响你的大脑)
  - [1. Redux：显式数据流的认知负荷](#1-redux显式数据流的认知负荷)
    - [1.1 Action → Reducer → Store 的心智模型](#11-action--reducer--store-的心智模型)
    - [1.2 认知优势与成本](#12-认知优势与成本)
    - [1.3 反例：Redux 的过度工程](#13-反例redux-的过度工程)
  - [2. MobX：响应式代理的透明性幻觉](#2-mobx响应式代理的透明性幻觉)
    - [2.1 自动依赖追踪的双刃剑](#21-自动依赖追踪的双刃剑)
    - [2.2 反例：隐式更新的调试噩梦](#22-反例隐式更新的调试噩梦)
  - [3. Zustand：极简主义的认知减负](#3-zustand极简主义的认知减负)
    - [3.1 "只是 Hooks"的心智模型](#31-只是-hooks的心智模型)
  - [4. Signals：细粒度的认知精确性](#4-signals细粒度的认知精确性)
    - [4.1 为什么 Signals 减少了工作记忆负荷](#41-为什么-signals-减少了工作记忆负荷)
  - [5. 四种模式的认知维度对比](#5-四种模式的认知维度对比)
  - [参考文献](#参考文献)

---

## 0. 状态管理如何影响你的大脑？

当你在调试一个状态管理 bug 时，你的大脑在做什么？

```
1. 定位：哪个组件触发了更新？
2. 追踪：这个更新如何传播到整个应用？
3. 验证：最终状态是否符合预期？
4. 修复：如何修改代码使行为正确？
```

每一步都消耗工作记忆。不同的状态管理模式对这个流程的影响截然不同：

- **Redux**：更新路径明确但冗长，需要记住 Action → Reducer → Store → Selector → Component 的完整链条
- **MobX**：更新自动发生，但调试时需要"反向工程"依赖关系
- **Zustand**：更新路径短，但需要记住哪些组件订阅了哪些状态
- **Signals**：更新精确到原子，认知负荷最低

本章将用认知科学分析四种主流状态管理模式。

---

## 1. Redux：显式数据流的认知负荷

### 1.1 Action → Reducer → Store 的心智模型

Redux 的核心是**单向数据流**：

```typescript
// 1. 定义 Action
type Action =
  | { type: 'INCREMENT'; payload: number }
  | { type: 'SET_USER'; payload: User };

// 2. 定义 Reducer
function counterReducer(state = 0, action: Action): number {
  switch (action.type) {
    case 'INCREMENT': return state + action.payload;
    default: return state;
  }
}

// 3. 创建 Store
const store = createStore(counterReducer);

// 4. 分发 Action
store.dispatch({ type: 'INCREMENT', payload: 1 });

// 5. 选择状态
const count = useSelector((state: RootState) => state.counter);
```

**认知分析**：

- 工作记忆需要同时保持：Action 类型、Reducer 逻辑、Selector 函数
- 更新链条长：4 个步骤（Action → Reducer → Store → Component）
- 但每一步都是显式的，调试时可以逐步追踪

### 1.2 认知优势与成本

| 维度 | 优势 | 成本 |
|------|------|------|
| 可预测性 | 高（单向流）| 需要记住完整链条 |
| 调试 | 容易（ Redux DevTools）| 需要理解中间件 |
| 学习曲线 | 陡峭 | 概念多（Action/Reducer/Store/Middleware）|
| 样板代码 | 多 | 外在认知负荷高 |

### 1.3 反例：Redux 的过度工程

```typescript
// 反例：为了修改一个计数器，需要 5 个文件
// actions/counter.ts
type IncrementAction = { type: 'counter/increment'; payload: number };

// reducers/counter.ts
function counterReducer(state = 0, action: IncrementAction) { ... }

// selectors/counter.ts
const selectCount = (state: RootState) => state.counter;

// components/Counter.tsx
const count = useSelector(selectCount);
const dispatch = useDispatch();

// tests/counter.test.ts
// ...
```

**认知成本**：为了理解计数器如何工作，你需要在 5 个文件之间跳转。工作记忆的 4 个槽位被文件位置占满，留给实际逻辑的空间所剩无几。

---

## 2. MobX：响应式代理的透明性幻觉

### 2.1 自动依赖追踪的双刃剑

MobX 的核心是**透明响应式**：状态变化自动触发更新。

```typescript
import { makeAutoObservable } from 'mobx';

class Store {
  count = 0;

  constructor() {
    makeAutoObservable(this);
  }

  increment() {
    this.count++;  // 自动触发所有依赖的更新
  }
}

// 组件自动订阅
function Counter() {
  const store = useStore();
  return <div>{store.count}</div>;  // 自动追踪对 count 的依赖
}
```

**认知分析**：

- 外在负荷低：不需要写 Action/Reducer/Selector
- 但隐藏依赖增加了**意外性**：你不知道哪些组件会更新

### 2.2 反例：隐式更新的调试噩梦

```typescript
// 反例：一个状态变化触发了 20 个组件更新
// 但只有 3 个是预期的

class OrderStore {
  items = [];
  discount = 0;

  get total() {
    return this.items.reduce((sum, item) => sum + item.price, 0) * (1 - this.discount);
  }
}

// 当修改 discount 时：
// 1. total 重新计算
// 2. 所有使用 total 的组件更新
// 3. 这些组件的子组件也可能更新
// 4. 某些不相关的组件因为"意外依赖"也更新了

// 调试时的问题：
// "为什么这个组件更新了？"
// "我没有直接修改它的 props！"
```

---

## 3. Zustand：极简主义的认知减负

### 3.1 "只是 Hooks"的心智模型

Zustand 的设计哲学：状态管理应该像 React Hooks 一样简单。

```typescript
import { create } from 'zustand';

// 定义 store（一个 hook）
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// 使用
function Counter() {
  const { count, increment } = useStore();  // 自动订阅
  return <button onClick={increment}>{count}</button>;
}
```

**认知优势**：

- 只有一个概念：Hook
- 更新路径短：set → 组件
- 没有样板代码

**对称差分析**：

```
Zustand 能力 \\ Redux 能力 = {
  "极简 API",
  "无 Provider 包裹",
  "自动订阅（基于选择器）"
}

Redux 能力 \\ Zustand 能力 = {
  "时间旅行调试",
  "中间件生态",
  "DevTools 集成",
  "标准化模式"
}
```

---

## 4. Signals：细粒度的认知精确性

### 4.1 为什么 Signals 减少了工作记忆负荷

Signals（如 SolidJS 的 createSignal）是**最细粒度**的响应式原语。

```typescript
// Solid Signals
const [count, setCount] = createSignal(0);
const doubled = () => count() * 2;  // 派生信号

// 只有 count 变化时，使用 count 的 DOM 节点更新
// 不使用 count 的组件完全不参与更新
```

**认知分析**：

- 更新粒度精确到单个值
- 不需要"虚拟 DOM Diff"的心智模型
- 不需要理解"组件重新渲染"

**类比**：

- Redux ≈ 重新打印整本书来修正一个错别字
- MobX ≈ 自动找到并替换所有出现的地方
- Zustand ≈ 标记需要更新的章节
- Signals ≈ 只修改那个错别字本身

---

## 5. 四种模式的认知维度对比

| 认知维度 | Redux | MobX | Zustand | Signals |
|---------|-------|------|---------|---------|
| **抽象梯度** | 高 | 中 | 低 | 低 |
| **隐藏依赖** | 低（显式）| 高（自动）| 低 | 低 |
| **渐进评估** | 低（需要完整配置）| 高 | 高 | 高 |
| **粘度** | 高（修改需改多处）| 低 | 低 | 低 |
| **一致性** | 高（严格模式）| 中 | 中 | 高 |
| **错误倾向** | 低（显式减少错误）| 中（隐式导致意外）| 低 | 低 |

**选择建议**：

| 场景 | 推荐 |
|------|------|
| 大型团队，需要严格规范 | Redux |
| 中小型应用，追求开发效率 | MobX / Zustand |
| 性能敏感，需要精确控制 | Signals |
| 快速原型，最小配置 | Zustand |

---

## 参考文献

1. Redux Team. "Redux Documentation."
2. Michel Weststrate. "MobX Documentation."
3. Zustand Team. "Zustand Documentation."
4. SolidJS Team. "Signals Documentation."
