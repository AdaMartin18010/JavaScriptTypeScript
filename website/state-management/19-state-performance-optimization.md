---
title: "状态性能优化：订阅、更新与内存"
description: "从响应式系统更新复杂度理论出发，深入剖析 Redux Reselect、Zustand Shallow、Jotai 原子更新、Vue Computed 缓存等工程实践中的性能优化策略，并形式化分析内存泄漏与大型列表状态管理。"
date: 2026-05-01
tags: ["state-management", "performance", "reactivity", "memory-leaks", "memoization", "virtualization"]
category: "engineering"
---

# 状态性能优化：订阅、更新与内存

在现代前端应用中，状态管理层的性能瓶颈往往不来自于业务逻辑本身的算法复杂度，而来自于**响应式系统通知与视图重渲染的协同效率**。当应用规模扩大、状态节点激增、订阅关系变得稠密时，一次看似简单的状态更新可能触发指数级的副作用传播。本文从形式化理论出发，系统梳理响应式更新的复杂度谱系，并映射到 Redux、Zustand、Jotai、Vue、React 等主流技术栈的具体优化手段，最终落脚于大型列表与内存治理的工程实践。

## 引言

状态管理的性能问题通常表现为三类症状：

1. **更新抖动（Update Jitter）**：单次状态变更导致过多无关组件重渲染；
2. **订阅膨胀（Subscription Bloat）**：订阅者数量随状态节点线性增长，通知成本失控；
3. **内存泄漏（Memory Leak）**：已卸载组件的订阅引用未被释放，导致闭包与状态树持续累积。

这些症状的根源在于响应式系统的**更新语义**与**依赖追踪机制**之间存在张力。理解不同响应式范式的复杂度特征，是进行针对性优化的前提。

## 理论严格表述

### 响应式更新的复杂度谱系

响应式系统可按其状态变更通知机制分为三大类，每一类对应不同的渐进时间复杂度：

#### O(1) 信号（Signal）模型

信号模型将状态抽象为可观察的原子单元（Signal），每个信号维护一组显式订阅者。当信号值变更时，系统直接遍历其订阅者列表并触发回调。

设状态图 \(G=(V, E)\)，其中 \(V\) 为信号节点，\(E\) 为派生依赖边。信号 \(s\in V\) 的更新复杂度为：

$$
T_{signal}(s) = O(|Sub(s)|)
$$

其中 \(Sub(s)\) 为直接订阅 \(s\) 的派生或副作用集合。在典型实现中（如 SolidJS、Preact Signals、Angular Signals），派生计算（Computed）通过**惰性求值（Lazy Evaluation）**与**脏标记（Dirty Flag）**进一步将单次传播路径上的重复求值降为摊还 \(O(1)\)。若系统设计为无环依赖图（DAG），则完整一次状态更新的总传播成本为 \(O(|V|+|E|)\) 的线性上界，且常数因子极小，因为无需对比差异或遍历整棵树。

#### O(n) 脏检查（Dirty Checking）模型

脏检查不维护显式依赖图，而是在变更触发后，周期性扫描作用域内的所有绑定以检测差异。AngularJS（1.x）是这一范式的典型代表。

设作用域内有 \(n\) 个绑定表达式，则单次消化循环（Digest Cycle）的复杂度为：

$$
T_{dirty}(n) = O(n \cdot k)
$$

其中 \(k\) 为单次表达式求值成本。若存在级联变更，.digest 需收敛至不动点，最坏情况下复杂度可达 \(O(n \cdot d)\)，\(d\) 为最大级联深度。尽管现代实现引入了 `Object.defineProperty` 拦截与变更批处理，其渐进复杂度本质仍高于显式订阅模型。

#### O(log n) 依赖追踪（Dependency Tracking）模型

依赖追踪模型在运行时动态构建依赖图。Vue 3 的 Proxy-based Reactivity System 与 MobX 的 Atom-Reaction 架构属于此类。与信号模型的核心差异在于：**依赖边是在派生函数执行时自动收集的**，而非显式注册。

设派生树的高度为 \(h\)，状态节点数为 \(n\)。由于依赖收集发生在执行期，系统通过树形结构（如 Vue 的 effect 作用域链）管理嵌套副作用。单次状态更新的通知路径长度平均为 \(O(h)\)，其中 \(h\) 通常与组件树深度同阶，即 \(O(\log n)\) 到 \(O(n)\) 之间。然而，得益于**组件级粒度**的更新调度，实际观测到的视图重渲染次数往往接近 \(O(\Delta)\)，\(\Delta\) 为实际受影响的组件子集。

| 模型 | 更新触发方式 | 依赖关系 | 渐进复杂度 | 代表实现 |
|------|-------------|---------|-----------|---------|
| Signal | 显式推送 | 静态/显式注册 | \(O(|Sub|)\) 摊还 \(O(1)\) | SolidJS, Preact Signals |
| 脏检查 | 轮询扫描 | 无显式图 | \(O(n)\) | AngularJS |
| 依赖追踪 | 运行时收集 | 动态图 | \(O(h)\) 到 \(O(\Delta)\) | Vue 3, MobX |

### 订阅者模式的通知复杂度

订阅者模式（Publish-Subscribe）是状态管理库的核心通信原语。设全局 Store 有 \(m\) 个订阅者，状态空间划分为 \(k\) 个切片（Slice）。若采用**广播通知**（Broadcast），则任意切片更新均通知全部 \(m\) 个订阅者，总通知成本为 \(O(m)\)。若采用**分层订阅**（Hierarchical Subscription），订阅者仅注册到特定切片或选择器路径，则通知成本降至 \(O(m_{slice})\)，其中 \(m_{slice} \ll m\)。

形式化地，定义通知效率 \(\eta\) 为实际受影响订阅者与总订阅者之比：

$$
\eta = \frac{|\{sub \in Sub \mid sub \text{ 关心变更 }\}|}{|Sub|}
$$

Redux 在无中间件辅助时，\(\eta = 1\)（全量通知）；引入 Reselect 与切片选择器后，\(\eta\) 可趋近于理论最优值。Zustand 通过按 Store 实例隔离订阅天然实现了 \(\eta_{zustand} \approx |Sub_{store}| / |Sub_{total}|\)。Jotai 的原子模型则将 \(\eta\) 精确到原子粒度：仅订阅特定原子的组件被通知。

### 内存泄漏的形式化分析

在响应式系统中，内存泄漏的本质是**可达性反转**：本应被垃圾回收器（GC）回收的组件实例，因持续持有对状态系统的引用而保持可达。

设组件生命周期为 \(L_{c} = [t_{mount}, t_{unmount}]\)。在 \(t_{unmount}\) 时刻，若组件注册的副作用函数 \(f_{c}\) 仍存在于全局 effect 集合 \(E\) 中，则 \(f_{c}\) 通过闭包引用组件作用域对象 \(O_{c}\)，形成路径：

$$
Global \rightarrow E \rightarrow f_{c} \rightarrow O_{c} \rightarrow \dots
$$

只要 \(Global\) 到 \(O_{c}\) 的引用链存在，GC 便无法回收 \(O_{c}\)。在 React 中，未清理的 `useEffect` 订阅、在 Redux 中未调用的 `unsubscribe()`、在 Vue 中未销毁的 `watch` 句柄，均是此类泄漏的典型来源。

更隐蔽的泄漏形式是**派生缓存泄漏**：Computed/Selector 缓存了派生值及其依赖集合，但若缓存策略缺乏 LRU 或 TTL 淘汰机制，随着状态空间扩张，缓存条目将持续累积。设缓存大小为 \(C\)，每个条目占用内存 \(s_{i}\)，则泄漏总量为 \(\sum_{i \in C} s_{i}\)。对于大型对象图，此值可达数十 MB。

### 状态选择器的 Memoization 理论

状态选择器（Selector）是从全局状态树 \(S\) 到视图模型 \(V\) 的映射函数 \(\sigma: S \rightarrow V\)。在 React-Redux 等框架中，每次 Store 更新都会重新执行选择器。若 \(\sigma\) 是纯函数且输入未变，则输出不变，无需触发重渲染。

Memoization 通过缓存 \((S_{input}, V_{output})\) 对实现此优化。定义选择器的引用透明性（Referential Transparency）：

$$
\forall s_1, s_2 \in S, \quad s_1 = s_2 \implies \sigma(s_1) \equiv \sigma(s_2)
$$

其中 \(\equiv\) 表示引用相等（`===`）。Reselect 的 `createSelector` 采用**分层 Memoization**：

1. 输入选择器（Input Selectors）分别对各自切片进行浅比较；
2. 若所有输入引用未变，则直接返回缓存的输出组合对象；
3. 若任一输入变化，则重新计算组合函数（Combiner），并用新结果替换缓存。

设输入选择器数量为 \(p\)，则单次评估的对比成本为 \(O(p)\)，远低于重新执行完整组合函数的 \(O(|S|)\) 或更高。此策略在函数式编程中对应**多路缓存（N-ary Memoization）**，其核心不变量为：

$$
CacheHit \iff \bigwedge_{i=1}^{p} (s_{i}^{new} \equiv s_{i}^{old})
$$

## 工程实践映射

### Redux 与 Reselect：分层 Memoization 的工程实现

在 Redux 生态中，全局状态更新默认触发所有 `useSelector` 订阅者的重新评估。若无优化，每次 dispatch 都会导致 \(O(|Components|)\) 级别的选择器执行。

Reselect 的 `createSelector` 通过两层缓存解决此问题：

```typescript
import { createSelector } from 'reselect'

// 输入选择器：仅提取相关切片，成本极低
const selectUsers = (state: RootState) => state.users.items
const selectFilter = (state: RootState) => state.users.filter

// 组合选择器：自动 memoize
const selectFilteredUsers = createSelector(
  [selectUsers, selectFilter],
  (users, filter) => users.filter(u => u.name.includes(filter))
)
```

**工程陷阱**：若输入选择器返回新引用（如每次返回展开后的新数组），则 memoization 永远失效。必须确保输入选择器返回**稳定引用**：

```typescript
// 错误：每次返回新对象，memoization 失效
const selectBad = (state) => ({ ...state.user })

// 正确：返回原始引用，依赖浅比较
const selectGood = (state) => state.user
```

在大型应用中，建议采用**结构化选择器目录**（如 `selectors/users/`、`selectors/posts/`），每个领域模块导出标准化选择器，并在单元测试中验证 memoization 命中率。

### Zustand：Shallow 比较与 Store 隔离

Zustand 的设计哲学是**最小化样板代码与最大化订阅精度**。与 Redux 的全局单 Store 不同，Zustand 鼓励按域创建多个独立 Store，天然实现订阅隔离。

```typescript
import { create } from 'zustand'
import { shallow } from 'zustand/shallow'

interface BearState {
  bears: number
  increase: () => void
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
}))

// 默认按引用比较：仅 bears 变化时重渲染
const bears = useBearStore((state) => state.bears)

// 多字段选择时启用 shallow 比较
const { bears, increase } = useBearStore(
  (state) => ({ bears: state.bears, increase: state.increase }),
  shallow
)
```

`shallow` 比较策略对返回的对象进行一层深度（one-level）的键值对比，适用于绝大多数多字段选择场景。其时间复杂度为 \(O(k)\)，\(k\) 为对象键数，远低于深比较（Deep Equal）的 \(O(n)\)。

**关键优化点**：

- **Action 稳定性**：将 Action Creator 定义在 Store 内部而非组件内，确保 `increase` 等函数引用恒定，避免触发不必要的比较失败；
- **Store 拆分**：避免单一巨型 Store，按业务边界（用户、订单、配置）拆分，降低每次更新的订阅基数。

### Jotai：原子级更新与精确重渲染

Jotai 将状态拆分为不可再分的原子（Atom），每个原子拥有独立的订阅列表。更新原子 `A` 时，仅通知依赖 `A` 的原子与组件。

```typescript
import { atom, useAtom } from 'jotai'

const countAtom = atom(0)
const doubleAtom = atom((get) => get(countAtom) * 2)

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>
}

function DoubleDisplay() {
  const [double] = useAtom(doubleAtom)
  return <p>Double: {double}</p>
}
```

在此例中，`countAtom` 更新时，`Counter` 与 `DoubleDisplay` 均重渲染，但其他未使用这些原子的组件完全不受影响。与 Context 的全树重渲染相比，Jotai 的 \(\eta\) 精确趋近于理论最小值。

对于派生状态，Jotai 的原生 `atom(read)` 自动具备 memoization：只要依赖原子未变，读取派生原子时直接返回缓存值，无需重新执行 `read` 函数。

### Vue：Computed 缓存与 Effect 作用域

Vue 3 的响应式系统基于 Proxy 代理与 `ReactiveEffect` 类。`computed` 是带有缓存的派生状态，其内部通过 `_dirty` 标志管理惰性求值：

```typescript
import { ref, computed, watchEffect } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

// 首次访问：执行 getter，缓存结果
console.log(double.value) // 0

// count 变更 → double 被标记为 dirty
// 再次访问时重新求值，否则返回缓存
count.value = 1
console.log(double.value) // 2
```

`computed` 的缓存策略可形式化为**惰性求值 + 脏标记**：

- **读路径**：若 `_dirty === false`，返回 `_value`（\(O(1)\)）；否则重新执行 getter 并更新缓存（\(O(cost_{getter})\)）。
- **写路径**：依赖的响应式变量变更时，递归将下游 computed 与 watch effect 标记为 dirty（\(O(|downstream|)\)）。

Vue 3.2+ 引入的 `effectScope` API 允许批量管理副作用生命周期，防止泄漏：

```typescript
import { effectScope, ref, watch } from 'vue'

const scope = effectScope()

scope.run(() => {
  const count = ref(0)
  watch(count, (v) => console.log(v))
})

// 组件卸载或逻辑层销毁时统一清理
scope.stop() // 所有内部 effect 被停止，引用释放
```

### React：useMemo、useCallback 与状态消费

在 React 中，状态消费组件的优化主要依赖 `useMemo` 与 `useCallback`，但需警惕**过度优化（Over-optimization）**。

```typescript
import { useMemo, useCallback, memo } from 'react'

interface ListProps {
  items: Item[]
  filter: string
}

const ExpensiveList = memo(function List({ items, filter }: ListProps) {
  // 仅当 items 或 filter 变化时重新过滤
  const filtered = useMemo(
    () => items.filter((i) => i.name.includes(filter)),
    [items, filter]
  )

  return (
    <ul>
      {filtered.map((item) => (
        <ListItem key={item.id} item={item} />
      ))}
    </ul>
  )
})

function Parent() {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<Item[]>([])

  // 稳定引用，避免 ExpensiveList 的 memo 失效
  const handleUpdate = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: true } : i)))
  }, [])

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
      <ExpensiveList items={items} filter="" />
    </div>
  )
}
```

**工程原则**：

1. `useMemo` 用于**昂贵计算**与**引用稳定性**（如作为其他 effect 或子组件的依赖）；
2. `useCallback` 用于**回调引用稳定**，配合 `React.memo` 阻断不必要的子树渲染；
3. 避免对廉价计算使用 `useMemo`，因为缓存本身有内存与比较开销；
4. 在状态管理库（Redux、Zustand）已提供选择器 memoization 时，React 层的 `useMemo` 应聚焦于**视图转换**（如排序、分组），而非状态切片。

### 状态拆分：按域拆分 Store 的性能收益

单一全局 Store 的架构在中小型项目中简化了数据流，但在大型应用中会导致**订阅基数膨胀**与**Reducer 组合爆炸**。按域拆分（Domain Splitting）将状态空间 \(S\) 划分为互不相交的子空间：

$$
S = S_{user} \times S_{order} \times S_{config} \times \dots
$$

各子空间独立管理更新与订阅，使得：

- 单次领域事件仅通知该领域的订阅者；
- 各领域的选择器、派生逻辑、持久化策略可独立演进；
- 代码分割（Code Splitting）可按领域异步加载 Store 模块。

Redux Toolkit 的 `createSlice` 与 Zustand 的多 Store 模式均支持此策略。对于必须跨领域通信的场景，引入**事件总线**或**Saga / Effect** 进行显式编排，而非将状态耦合到同一棵树。

### 大型列表的状态优化：虚拟化、分页与增量加载

当状态树中包含数万条记录时，即使响应式系统本身足够高效，视图层的 DOM 渲染也会成为瓶颈。工程上采用三层优化策略：

#### 1. 虚拟化（Virtualization）

虚拟化仅渲染视口内的列表项，将 DOM 节点数从 \(O(n)\) 降至 \(O(v)\)，\(v\) 为可视项数。react-window 与 vue-virtual-scroller 是典型实现：

```typescript
import { FixedSizeList as List } from 'react-window'

function VirtualizedList({ items }: { items: Item[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>{items[index].name}</div>
  )

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

**状态层配合**：虚拟化组件通常仅需要可见切片的数据。状态层应支持**切片选择器**（如 `selectItemsRange(start, end)`），避免将完整数组注入组件。

#### 2. 分页（Pagination）与游标（Cursor）

将完整数据集 \(D\) 分页为 \(D = \bigcup_{i=1}^{k} P_i\)。状态树中仅保留当前页 \(P_{current}\) 与分页元数据（总页数、当前游标），显著降低内存占用与订阅复杂度。

GraphQL Relay 风格的**连接（Connection）模型**是此策略的规范化表达：

```typescript
interface Connection<T> {
  edges: Array<{ node: T; cursor: string }>
  pageInfo: {
    hasNextPage: boolean
    endCursor: string
  }
}
```

#### 3. 增量加载（Incremental Loading）

对于实时数据流（如日志、消息、交易记录），采用增量加载策略：状态树维护已加载的**最小有序集合**，新数据通过追加（Append）或合并（Merge）操作集成，避免全量替换数组引用导致虚拟化组件的重置。

```typescript
// 增量合并：保持引用稳定，仅追加新项
function mergeItems(existing: Item[], incoming: Item[]): Item[] {
  const existingIds = new Set(existing.map((i) => i.id))
  const newItems = incoming.filter((i) => !existingIds.has(i.id))
  return newItems.length > 0 ? [...existing, ...newItems] : existing
}
```

## Mermaid 图表

### 响应式系统更新复杂度对比

```mermaid
graph TD
    A[State Change] --> B{Reactivity Model}
    B -->|Signal| C[O(1) Direct Push<br/>SolidJS / Preact Signals]
    B -->|Dirty Check| D[O(n) Scan<br/>AngularJS Digest]
    B -->|Dependency Track| E[O(log n) ~ O(Δ)<br/>Vue 3 / MobX]
    C --> F[Subscriber List<br/>Explicit Registration]
    D --> G[Scope Scan<br/>Periodic Check]
    E --> H[Dynamic Graph<br/>Runtime Tracking]
    F --> I[Effect Execution]
    G --> I
    H --> I
    style C fill:#90EE90
    style D fill:#FFB6C1
    style E fill:#87CEEB
```

### 状态性能优化技术栈映射

```mermaid
flowchart LR
    subgraph Theory["理论维度"]
        T1[复杂度理论]
        T2[Memoization]
        T3[引用透明性]
        T4[订阅粒度]
    end
    subgraph Engineering["工程实践"]
        E1[Redux + Reselect]
        E2[Zustand Shallow]
        E3[Jotai Atom]
        E4[Vue Computed]
        E5[React useMemo]
    end
    T1 -->|O(p) input selectors| E1
    T2 -->|分层缓存| E1
    T3 -->|稳定引用| E2
    T4 -->|原子级订阅| E3
    T2 -->|脏标记惰性求值| E4
    T3 -->|依赖数组| E5
```

### 大型列表状态优化分层架构

```mermaid
graph TB
    subgraph DataLayer["数据层"]
        D1[完整数据集 D]
        D2[分页/游标]
        D3[增量合并器]
    end
    subgraph StateLayer["状态层"]
        S1[领域 Store]
        S2[范围选择器<br/>selectRange(start, end)]
        S3[Memoized Derived]
    end
    subgraph ViewLayer["视图层"]
        V1[虚拟化容器]
        V2[可视项渲染]
        V3[占位符回收]
    end
    D1 --> D2
    D2 --> D3
    D3 --> S1
    S1 --> S2
    S2 --> S3
    S3 --> V1
    V1 --> V2
    V1 --> V3
    style DataLayer fill:#E1F5FE
    style StateLayer fill:#E8F5E9
    style ViewLayer fill:#FFF3E0
```

## 理论要点总结

1. **更新复杂度决定上限**：Signal 模型的 \(O(1)\) 推送在微更新场景下具有最优渐进表现；依赖追踪模型通过运行时图构建平衡了自动化与效率；脏检查模型在现代前端中已被逐步淘汰。

2. **订阅精度决定实际成本**：无论理论复杂度如何，实际性能取决于通知了多少无关订阅者。Redux 的全局广播需通过 Reselect 降低 \(\eta\)；Zustand 通过 Store 隔离天然提升 \(\eta\)；Jotai 将 \(\eta\) 精确到原子级别。

3. **Memoization 是引用语义的艺术**：`createSelector`、`computed`、`useMemo` 的有效性完全依赖于输入引用的稳定性。返回新引用是性能优化的头号敌人。

4. **内存泄漏是可达性管理问题**：响应式系统的闭包与缓存若缺乏显式清理（`unsubscribe`、`scope.stop`、`useEffect` cleanup），将导致组件实例无法被 GC 回收。派生缓存需引入淘汰策略防止无限膨胀。

5. **大型列表需三层协同**：虚拟化降低 DOM 成本，分页降低状态内存，增量加载保持引用稳定。三者缺一不可。

## 参考资源

1. Redux Reselect Documentation. "Reselect | Redux Toolkit." *Redux Toolkit Docs*, <https://redux-toolkit.js.org/api/createSelector>. 官方文档详细阐述了 `createSelector` 的 memoization 机制与输入选择器的设计原则。

2. Zustand Documentation. "Zustand: Bear necessities for state management." *GitHub - pmndrs/zustand*, <https://github.com/pmndrs/zustand>. 涵盖了多 Store 模式、shallow 比较、订阅隔离与 TypeScript 最佳实践。

3. Jotai Documentation. "Jotai: Primitive and flexible state management for React." *Jotai Docs*, <https://jotai.org/docs/core/atom>. 深入解释了原子模型、派生原子缓存、异步原子与调试工具。

4. Vue.js Documentation. "Reactivity in Depth." *Vue.js Guide*, <https://vuejs.org/guide/extras/reactivity-in-depth.html>. 官方指南剖析了 Proxy-based 响应式系统、effect 作用域、`computed` 的惰性求值与缓存策略。

5. Preact Team. "Signals: A reactive primitive for application state." *Preact Signals Docs*, <https://preactjs.com/guide/v10/signals/>. 阐述了 Signal 模型的 \(O(1)\) 更新语义、与框架无关的设计及其在 React 集成中的性能优势。
