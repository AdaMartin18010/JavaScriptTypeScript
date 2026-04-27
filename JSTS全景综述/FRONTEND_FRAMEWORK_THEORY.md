---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 前端框架理论全景

> **理论深度**: 研究生级别
> **参考来源**: React Core Team Papers, Vue RFCs, ECMAScript Spec, Astro/Next.js Architecture
> **适用范围**: 前端框架原理研究、框架设计、性能优化决策

---

## 目录

- [前端框架理论全景](#前端框架理论全景)
  - [目录](#目录)
  - [1. React 的代数效应（Algebraic Effects）理论基础](#1-react-的代数效应algebraic-effects理论基础)
    - [1.1 理论解释](#11-理论解释)
    - [1.2 形式化模型](#12-形式化模型)
    - [1.3 代码示例](#13-代码示例)
    - [1.4 框架对比](#14-框架对比)
  - [2. Virtual DOM 的 Diff 算法形式化](#2-virtual-dom-的-diff-算法形式化)
    - [2.1 理论解释](#21-理论解释)
    - [2.2 形式化模型](#22-形式化模型)
    - [2.3 代码示例](#23-代码示例)
    - [2.4 框架对比](#24-框架对比)
  - [3. 响应式系统的形式化](#3-响应式系统的形式化)
    - [3.1 理论解释](#31-理论解释)
    - [3.2 形式化模型](#32-形式化模型)
    - [3.3 代码示例](#33-代码示例)
    - [3.4 框架对比](#34-框架对比)
    - [10.4 框架对比](#104-框架对比)
  - [总结](#总结)

---

## 1. React 的代数效应（Algebraic Effects）理论基础

### 1.1 理论解释

代数效应（Algebraic Effects）是一种用于描述计算副作用的形式化理论。React Hooks 的设计深受代数效应启发，尽管 JavaScript 原生不支持代数效应，但 React 通过 Fiber 架构和调用栈模拟实现了类似语义。

**核心概念：**

- **Effect（效应）**: 可恢复的暂停点，类似于函数调用但可"捕获"
- **Handler（处理器）**: 定义如何解释和处理效应的代码
- **Continuation（延续）**: 代表"剩余计算"的函数，允许恢复执行

### 1.2 形式化模型

**代数效应的形式语义：**

$$
\frac{E \vdash e_1 : T_1 \quad E, x:T_1 \vdash e_2 : T_2}{E \vdash \text{do } x \leftarrow e_1 \text{ in } e_2 : T_2} \quad (\text{Do})
$$

$$
\frac{E \vdash e : T_1 \quad E \vdash h : T_1 \Rightarrow T_2}{E \vdash \text{handle } e \text{ with } h : T_2} \quad (\text{Handle})
$$

**React Fiber 的代数效应模拟：**

```
设 Fiber 节点 F = (type, props, state, child, sibling, return, effectTag, nextEffect)

代数效应操作模拟：
perform(effect, payload) ≈ 创建更新任务 U = (effect, payload, resolve, reject)

handle(effect, handler) ≈
  调度器从更新队列 dequeue U
  执行 handler(U.payload)
  调用 U.resolve/U.reject 恢复执行

Continuation K = Fiber.alternate (当前 Fiber 的上一次状态快照)
```

**Hooks 的代数效应解释：**

```
useState(initial)  ≈  perform(GetState, { hookIndex }) >>= (oldState →
                      perform(SetState, { hookIndex, initial })
                      return [oldState, setState])

useEffect(fn, deps) ≈ perform(ScheduleEffect, { fn, deps, cleanup })
```

### 1.3 代码示例

```typescript
// === 模拟代数效应的 TypeScript 实现 ===

// Effect 类型定义
type Effect<T, R> = {
  type: string;
  payload: T;
  resolve: (value: R) => void;
  reject: (reason: unknown) => void;
  continuation: () => void;
};

// Effect Handler 接口
interface EffectHandler<T, R> {
  (payload: T, resume: (value: R) => void): void;
}

// 代数效应运行时
class AlgebraicEffectsRuntime {
  private effectQueue: Effect<unknown, unknown>[] = [];
  private handlers = new Map<string, EffectHandler<unknown, unknown>>();

  register<T, R>(type: string, handler: EffectHandler<T, R>): void {
    this.handlers.set(type, handler as EffectHandler<unknown, unknown>);
  }

  perform<T, R>(type: string, payload: T): Promise<R> {
    return new Promise((resolve, reject) => {
      const effect: Effect<T, R> = {
        type,
        payload,
        resolve,
        reject,
        continuation: () => {}
      };
      this.effectQueue.push(effect as Effect<unknown, unknown>);
      this.processQueue();
    });
  }

  private processQueue(): void {
    while (this.effectQueue.length > 0) {
      const effect = this.effectQueue.shift()!;
      const handler = this.handlers.get(effect.type);
      if (handler) {
        handler(effect.payload, effect.resolve);
      } else {
        effect.reject(new Error(`No handler for effect: ${effect.type}`));
      }
    }
  }
}

// React Hooks 的代数效应风格实现
class ReactLikeHooks<TState> {
  private state: TState[] = [];
  private stateIndex = 0;
  private effects: Array<{
    fn: () => (() => void) | void;
    deps: unknown[];
    cleanup?: () => void;
  }> = [];
  private effectIndex = 0;

  useState<S>(initial: S): [S, (newState: S | ((prev: S) => S)) => void] {
    const index = this.stateIndex++;
    if (this.state.length <= index) {
      this.state[index] = initial as unknown;
    }

    const setState = (newState: S | ((prev: S) => S)) => {
      const current = this.state[index] as S;
      this.state[index] = typeof newState === 'function'
        ? (newState as (prev: S) => S)(current)
        : newState;
      this.scheduleUpdate();
    };

    return [this.state[index] as S, setState];
  }

  useEffect(fn: () => (() => void) | void, deps: unknown[]): void {
    const index = this.effectIndex++;
    const oldEffect = this.effects[index];

    const hasChanged = !oldEffect ||
      !deps.every((dep, i) => Object.is(dep, oldEffect.deps[i]));

    if (hasChanged) {
      if (oldEffect?.cleanup) oldEffect.cleanup();
      this.effects[index] = { fn, deps };
    }
  }

  private scheduleUpdate(): void {
    // 调度更新，类似 React 的调度器
    Promise.resolve().then(() => this.flushEffects());
  }

  private flushEffects(): void {
    this.effects.forEach(effect => {
      if (!effect.cleanup) {
        effect.cleanup = effect.fn() || undefined;
      }
    });
  }

  resetIndices(): void {
    this.stateIndex = 0;
    this.effectIndex = 0;
  }
}

// 使用示例
function ExampleComponent() {
  const hooks = new ReactLikeHooks<{ count: number }>();

  function render() {
    hooks.resetIndices();
    const [count, setCount] = hooks.useState(0);

    hooks.useEffect(() => {
      console.log(`Count changed to: ${count}`);
      return () => console.log('Cleanup');
    }, [count]);

    return { count, setCount };
  }

  return { render, hooks };
}
```

### 1.4 框架对比

| 特性 | React (Fiber) | Vue (Composition API) | Svelte | Solid |
|------|---------------|----------------------|--------|-------|
| **效应模型** | 代数效应模拟 | 响应式依赖追踪 | 编译时消除 | 细粒度响应式 |
| **调度策略** | 时间切片 + 优先级 | 立即同步执行 | 立即同步执行 | 同步执行 |
| **可恢复性** | 支持（Suspense） | 部分支持 | 不支持 | 不支持 |
| **实现复杂度** | 高 | 中 | 低 | 低 |
| **理论纯度** | 最纯 | 中等 | 编译时纯 | 运行时纯 |

**代数效应完整度对比：**

```
完整代数效应特性:
┌─────────────────────────┬───────┬───────┬───────┬───────┐
│ 特性                    │ React │ Vue   │ Svelte│ Solid │
├─────────────────────────┼───────┼───────┼───────┼───────┤
│ perform/resume          │   ✓   │   ✗   │   ✗   │   ✗   │
│ 多 handler 组合         │   ✓   │   ✗   │   ✗   │   ✗   │
│ 效应冒泡                │   ✓   │   ✗   │   ✗   │   ✗   │
│ 延续捕获 (Continuation) │   ✓   │   ~   │   ✗   │   ✗   │
│ 效应取消                │   ✓   │   ~   │   ✗   │   ✗   │
└─────────────────────────┴───────┴───────┴───────┴───────┘

✓ = 完整支持, ~ = 部分支持, ✗ = 不支持
```

---

## 2. Virtual DOM 的 Diff 算法形式化

### 2.1 理论解释

Virtual DOM 是一种在内存中表示 UI 结构的轻量级 JavaScript 对象树。Diff 算法通过比较两棵树的差异，计算出最小的 DOM 操作序列。

**核心问题**：给定两棵树 $T_1$ (旧树) 和 $T_2$ (新树)，求最小的编辑脚本 $S$ 使得 $apply(T_1, S) = T_2$

### 2.2 形式化模型

**树编辑距离（Tree Edit Distance）：**

设 $d(T_1, T_2)$ 为将 $T_1$ 转换为 $T_2$ 的最小操作成本：

$$
d(T_1, T_2) = \min_{S \in \mathcal{S}(T_1, T_2)} \sum_{op \in S} cost(op)
$$

其中操作 $op \in \{Insert, Delete, Replace, Reorder\}$

**React Diff 算法的假设与复杂度：**

```
假设1 (类型一致性):
  ∀n₁ ∈ T₁, n₂ ∈ T₂, if type(n₁) ≠ type(n₂) → n₁ 被替换

假设2 (Key 稳定性):
  ∃key(n) s.t. key(n₁) = key(n₂) → n₁ 与 n₂ 是同一节点的不同状态

假设3 (层级限制):
  仅比较同一层级的节点，不跨层级比较

复杂度分析:
  最坏情况: O(n³) (无 key，完全重排)
  有 key 最优: O(n)
  React 实现: O(n) (启发式算法)
```

**Diff 算法的形式化描述：**

$$
\text{diff}(V_{old}, V_{new}) = \begin{cases}
\text{REPLACE}(V_{new}) & \text{if } type(V_{old}) \neq type(V_{new}) \\
\text{UPDATE}(props) \oplus \text{diffChildren} & \text{if } type(V_{old}) = type(V_{new})
\end{cases}
$$

$$
\text{diffChildren}(C_{old}, C_{new}) = \text{LIS}(\text{keyedDiff}) \cup \text{unkeyedDiff}
$$

其中 LIS 是最长递增子序列算法，用于优化移动操作。

**双端 Diff 算法（Vue/Svelte 优化）：**

```
算法: 双端比较 (Two-Pointer Diff)
输入: oldChildren[0..m-1], newChildren[0..n-1]
输出: patch 操作序列

i = 0, j = m-1, k = 0, l = n-1
while i ≤ j and k ≤ l:
  if sameVnode(old[i], new[k]): i++, k++, continue
  if sameVnode(old[j], new[l]): j--, l--, continue
  if sameVnode(old[i], new[l]): i++, l--, move, continue
  if sameVnode(old[j], new[k]): j--, k++, move, continue

  // 线性查找
  idx = findIdx(old, new[k], i, j)
  if idx exists: move old[idx] to k
  else: insert new[k]
  k++
```

### 2.3 代码示例

```typescript
// === Virtual DOM 与 Diff 算法的完整实现 ===

// VNode 类型定义
type VNodeType = string | Function;

interface VNode {
  type: VNodeType;
  props: Record<string, unknown>;
  key?: string | number;
  children: (VNode | string | number | null)[];
  el?: HTMLElement | Text;
}

// 创建 VNode 的工厂函数
function h(
  type: VNodeType,
  props: Record<string, unknown> | null,
  ...children: (VNode | string | number | null)[]
): VNode {
  const flatChildren = children.flat().filter(c => c !== null);
  return {
    type,
    props: props || {},
    key: props?.key as string | number | undefined,
    children: flatChildren
  };
}

// Diff 结果类型
type Patch =
  | { type: 'CREATE'; newNode: VNode }
  | { type: 'REMOVE' }
  | { type: 'REPLACE'; newNode: VNode }
  | { type: 'UPDATE'; props: Record<string, unknown>; childrenPatches: Patch[] };

// 判断是否为相同 VNode
function isSameVNode(n1: VNode | null, n2: VNode | null): boolean {
  if (!n1 || !n2) return false;
  return n1.type === n2.type && n1.key === n2.key;
}

// 核心 Diff 算法
function diff(oldVNode: VNode | null, newVNode: VNode | null): Patch | null {
  // 1. 都为空
  if (!oldVNode && !newVNode) return null;

  // 2. 新增节点
  if (!oldVNode) {
    return { type: 'CREATE', newNode: newVNode! };
  }

  // 3. 删除节点
  if (!newVNode) {
    return { type: 'REMOVE' };
  }

  // 4. 类型不同，完全替换
  if (oldVNode.type !== newVNode.type || oldVNode.key !== newVNode.key) {
    return { type: 'REPLACE', newNode: newVNode };
  }

  // 5. 同类型节点，比较 props 和 children
  const propsPatch = diffProps(oldVNode.props, newVNode.props);
  const childrenPatches = diffChildren(oldVNode.children, newVNode.children);

  return {
    type: 'UPDATE',
    props: propsPatch,
    childrenPatches
  };
}

// Props Diff
function diffProps(
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>
): Record<string, unknown> {
  const patches: Record<string, unknown> = {};

  // 处理修改和新增
  for (const key in newProps) {
    if (oldProps[key] !== newProps[key]) {
      patches[key] = newProps[key];
    }
  }

  // 处理删除 (标记为 null)
  for (const key in oldProps) {
    if (!(key in newProps)) {
      patches[key] = null;
    }
  }

  return patches;
}

// Children Diff - 带 Key 的优化算法
function diffChildren(
  oldChildren: (VNode | string | number | null)[],
  newChildren: (VNode | string | number | null)[]
): Patch[] {
  const patches: Patch[] = [];

  // 1. 提取 keyed 和 unkeyed 节点
  const { keyed: oldKeyed, unkeyed: oldUnkeyed } = extractNodes(oldChildren);
  const { keyed: newKeyed, unkeyed: newUnkeyed } = extractNodes(newChildren);

  // 2. 处理 keyed 节点 - 使用最长递增子序列优化
  const keyedPatches = diffKeyedChildren(oldKeyed, newKeyed);
  patches.push(...keyedPatches);

  // 3. 处理 unkeyed 节点
  const maxLen = Math.max(oldUnkeyed.length, newUnkeyed.length);
  for (let i = 0; i < maxLen; i++) {
    const patch = diff(
      normalizeVNode(oldUnkeyed[i]),
      normalizeVNode(newUnkeyed[i])
    );
    patches.push(patch);
  }

  return patches;
}

// 辅助函数：提取 keyed/unkeyed 节点
function extractNodes(children: (VNode | string | number | null)[]) {
  const keyed: Map<string | number, VNode> = new Map();
  const unkeyed: (VNode | string | number | null)[] = [];

  for (const child of children) {
    if (child && typeof child === 'object' && child.key !== undefined) {
      keyed.set(child.key, child);
    } else {
      unkeyed.push(child);
    }
  }

  return { keyed, unkeyed };
}

// 最长递增子序列算法 (LIS)
function getLIS(arr: number[]): number[] {
  if (arr.length === 0) return [];

  const tails: number[] = [arr[0]];
  const prevIndices: number[] = new Array(arr.length).fill(-1);
  const tailIndices: number[] = [0];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > tails[tails.length - 1]) {
      prevIndices[i] = tailIndices[tails.length - 1];
      tails.push(arr[i]);
      tailIndices.push(i);
    } else {
      let left = 0, right = tails.length - 1;
      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (tails[mid] < arr[i]) left = mid + 1;
        else right = mid;
      }
      tails[left] = arr[i];
      tailIndices[left] = i;
      if (left > 0) prevIndices[i] = tailIndices[left - 1];
    }
  }

  // 重构 LIS
  const lis: number[] = [];
  let k = tailIndices[tailIndices.length - 1];
  while (k >= 0) {
    lis.unshift(k);
    k = prevIndices[k];
  }

  return lis;
}

// Keyed Children Diff
function diffKeyedChildren(
  oldKeyed: Map<string | number, VNode>,
  newKeyed: Map<string | number, VNode>
): Patch[] {
  const patches: Patch[] = [];
  const oldKeys = Array.from(oldKeyed.keys());
  const newKeys = Array.from(newKeyed.keys());

  // 构建 key -> index 映射
  const oldKeyIndexMap = new Map(oldKeys.map((k, i) => [k, i]));

  // 计算 new 节点在 old 中的位置
  const newIndexInOld: number[] = newKeys.map(key =>
    oldKeyIndexMap.get(key) ?? -1
  );

  // 使用 LIS 找出不需要移动的节点
  const lis = getLIS(newIndexInOld.filter(idx => idx !== -1));
  const lisSet = new Set(lis);

  // 生成 patches
  let lisIdx = lis.length - 1;
  for (let i = newKeys.length - 1; i >= 0; i--) {
    const key = newKeys[i];
    const newNode = newKeyed.get(key)!;
    const oldIndex = newIndexInOld[i];

    if (oldIndex === -1) {
      // 新节点，需要创建
      patches.unshift({ type: 'CREATE', newNode });
    } else {
      const oldNode = oldKeyed.get(key)!;
      if (lisIdx >= 0 && newIndexInOld.filter(idx => idx !== -1)[lisIdx] === oldIndex) {
        // 在 LIS 中，不需要移动，只比较内容
        lisIdx--;
        patches.unshift(diff(oldNode, newNode));
      } else {
        // 需要移动
        patches.unshift({ type: 'REPLACE', newNode }); // 简化处理
      }
    }
  }

  return patches;
}

// 将文本/数字规范化为 VNode
function normalizeVNode(node: VNode | string | number | null | undefined): VNode | null {
  if (node === null || node === undefined) return null;
  if (typeof node === 'string' || typeof node === 'number') {
    return { type: 'text', props: {}, children: [String(node)], key: undefined };
  }
  return node;
}

// Patch 应用器
function patch(el: HTMLElement | Text, patches: Patch[]): HTMLElement | Text {
  // 简化实现，实际中需要递归应用
  return el;
}

// === 使用示例 ===
const oldVNode = h('div', { id: 'app', class: 'container' },
  h('h1', { key: 'title' }, 'Hello'),
  h('p', { key: 'p1' }, 'Paragraph 1'),
  h('p', { key: 'p2' }, 'Paragraph 2')
);

const newVNode = h('div', { id: 'app', class: 'wrapper' },
  h('h1', { key: 'title' }, 'Hello World'),
  h('p', { key: 'p3' }, 'Paragraph 3'),  // 新增
  h('p', { key: 'p1' }, 'Paragraph 1'),
  h('p', { key: 'p2' }, 'Paragraph 2 Updated')
);

const patches = diff(oldVNode, newVNode);
console.log(JSON.stringify(patches, null, 2));
```

### 2.4 框架对比

| 算法特性 | React (Reconciliation) | Vue 3 | Preact | Inferno |
|---------|------------------------|-------|--------|---------|
| **Diff 策略** | 双缓冲 + 时间切片 | 双端比较 | 简化 React | 极致优化 |
| **Key 算法** | LIS 优化 | LIS + 双端 | 简单映射 | 预编译优化 |
| **编译优化** | 无 | PatchFlag | 无 | 预编译推断 |
| **时间复杂度** | O(n) | O(n) | O(n) | O(1) 多数情况 |
| **内存占用** | 中 | 低 | 极低 | 极低 |

**性能对比（操作/秒）：**

```
创建 1000 行:
┌─────────────┬──────────┬──────────┬──────────┬──────────┐
│ 框架        │ 创建     │ 更新     │ 交换     │ 清除     │
├─────────────┼──────────┼──────────┼──────────┼──────────┤
│ Vanilla     │ ~50,000  │ ~50,000  │ ~50,000  │ ~100,000 │
│ React 18    │ ~2,500   │ ~8,000   │ ~5,000   │ ~15,000  │
│ Vue 3       │ ~4,000   │ ~12,000  │ ~8,000   │ ~25,000  │
│ Svelte      │ ~6,000   │ ~15,000  │ ~10,000  │ ~30,000  │
│ Solid       │ ~8,000   │ ~25,000  │ ~20,000  │ ~50,000  │
└─────────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 3. 响应式系统的形式化

### 3.1 理论解释

响应式编程是一种面向数据流和变化传播的编程范式。当数据变化时，依赖该数据的计算自动更新。

**核心概念：**

- **Observable（可观察对象）**: 数据的生产者
- **Observer（观察者）**: 数据的消费者
- **Subscription（订阅）**: 连接生产者和消费者的关系
- **Signal（信号）**: 细粒度的响应式原语

### 3.2 形式化模型

**响应式系统的代数结构：**

$$
\text{ReactiveSystem} = (S, D, F, \triangleright)
$$

其中：

- $S$: Signal 集合 $S = \{s_1, s_2, ..., s_n\}$
- $D$: 依赖关系有向无环图 $D = (S, E)$
- $F$: 副作用函数集合
- $\triangleright$: 传播算子

**依赖追踪的形式化：**

```
依赖收集阶段 (Track Phase):
  currentEffect = E
  访问 s.value → s.deps.add(E)

触发阶段 (Trigger Phase):
  s.value = newValue → propagate(s)

  propagate(s):
    for each effect in s.deps:
      if effect not dirty:
        markDirty(effect)
        for each s' in effect.signals:
          propagate(s')
```

**信号的形式语义：**

$$
\text{Signal}\langle T \rangle = \{\text{value}: T, \text{subscribers}: \mathcal{P}(\text{Effect})\}
$$

$$
\text{createSignal}(v_0) = \{\text{value} = v_0, \text{subscribers} = \emptyset\}
$$

$$
\text{get}(s) = s.\text{value} \quad \text{并注册当前 effect 到 subscribers}
$$

$$
\text{set}(s, v) = \begin{cases}
s.\text{value} \leftarrow v & \text{if } v \neq s.\text{value} \\
\forall e \in s.\text{subscribers}: \text{schedule}(e) & \text{if } v \neq s.\text{value}
\end{cases}
$$

**计算属性（Computed/Memo）的形式化：**

$$
\text{Computed}\langle T \rangle = \{\text{signal}: \text{Signal}\langle T \rangle, \text{fn}: () \rightarrow T, \text{dirty}: \text{boolean}\}
$$

$$
\text{get}(c) = \begin{cases}
c.\text{signal}.\text{value} & \text{if } \neg c.\text{dirty} \\
\text{recompute}(c) & \text{if } c.\text{dirty}
\end{cases}
$$

### 3.3 代码示例

```typescript
// === 响应式系统的完整实现 ===

// 全局上下文
let currentEffect: (() => void) | null = null;
let effectQueue: (() => void)[] = [];
let isFlushing = false;

// Signal 类
class Signal<T> {
  private _value: T;
  private _subscribers: Set<Effect> = new Set();
  private _version = 0;

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    // 依赖收集
    if (currentEffect) {
      this._subscribers.add(currentEffect);
    }
    return this._value;
  }

  set value(newValue: T) {
    if (!Object.is(this._value, newValue)) {
      this._value = newValue;
      this._version++;
      this.notify();
    }
  }

  get version(): number {
    return this._version;
  }

  private notify(): void {
    // 批量调度更新
    for (const effect of this._subscribers) {
      scheduleEffect(effect);
    }
  }

  peek(): T {
    return this._value;
  }
}

// Effect 类型
type Effect = {
  fn: () => void;
  signals: Set<Signal<unknown>>;
  cleanup?: () => void;
};

// 创建 Signal
function createSignal<T>(initialValue: T): [() => T, (v: T) => void] {
  const signal = new Signal(initialValue);
  return [
    () => signal.value,
    (v: T) => { signal.value = v; }
  ];
}

// 创建 Effect
function createEffect(fn: () => void | (() => void)): void {
  const effect: Effect = {
    fn: executeEffect,
    signals: new Set()
  };

  function executeEffect() {
    // 清理旧的订阅
    effect.signals.forEach(signal => {
      // 需要从 signal 的 subscribers 中移除
    });
    effect.signals.clear();

    // 设置当前 effect 上下文
    const prevEffect = currentEffect;
    currentEffect = effect.fn;

    try {
      const cleanup = fn();
      if (typeof cleanup === 'function') {
        effect.cleanup = cleanup;
      }
    } finally {
      currentEffect = prevEffect;
    }
  }

  // 立即执行一次以收集依赖
  executeEffect();
}

// 调度 Effect
function scheduleEffect(effect: () => void): void {
  if (!effectQueue.includes(effect)) {
    effectQueue.push(effect);
    if (!isFlushing) {
      isFlushing = true;
      Promise.resolve().then(flushEffects);
    }
  }
}

// 刷新 Effect 队列
function flushEffects(): void {
  while (effectQueue.length > 0) {
    const effect = effectQueue.shift()!;
    effect();
  }
  isFlushing = false;
}

// 计算属性 (Computed)
class Computed<T> {
  private _signal: Signal<T>;
  private _fn: () => T;
  private _dirty = true;
  private _version = -1;

  constructor(fn: () => T) {
    this._fn = fn;
    this._signal = new Signal(undefined as T);

    // 创建内部 effect 来追踪依赖
    createEffect(() => {
      if (this._dirty) {
        const value = fn();
        this._signal.value = value;
        this._dirty = false;
      }
    });
  }

  get value(): T {
    // 检查依赖的版本
    // 简化实现，实际需要追踪依赖 signal 的版本
    return this._signal.value;
  }

  invalidate(): void {
    this._dirty = true;
  }
}

function createComputed<T>(fn: () => T): () => T {
  const computed = new Computed(fn);
  return () => computed.value;
}

// === MobX 风格的响应式系统 ===

const observableSymbol = Symbol('observable');

function makeObservable<T extends object>(obj: T): T {
  const signals = new Map<string | symbol, Signal<unknown>>();

  return new Proxy(obj, {
    get(target, key) {
      if (!signals.has(key)) {
        signals.set(key, new Signal((target as Record<string | symbol, unknown>)[key]));
      }
      const signal = signals.get(key)!;
      return signal.value;
    },
    set(target, key, value) {
      if (!signals.has(key)) {
        signals.set(key, new Signal(value));
      } else {
        signals.get(key)!.value = value;
      }
      return true;
    }
  });
}

function autorun(fn: () => void): () => void {
  createEffect(fn);
  return () => {}; // 返回取消函数
}

// === Vue 风格的响应式系统 ===

function ref<T>(value: T): { value: T } {
  const signal = new Signal(value);
  return {
    get value() { return signal.value; },
    set value(v) { signal.value = v; }
  };
}

function reactive<T extends object>(obj: T): T {
  return makeObservable(obj);
}

function watchEffect(fn: () => void): void {
  createEffect(fn);
}

function computed<T>(getter: () => T): { readonly value: T } {
  const c = new Computed(getter);
  return { get value() { return c.value; } };
}

// === 使用示例 ===

// 基础 Signal 使用
const [getCount, setCount] = createSignal(0);
const [getName, setName] = createSignal('World');

createEffect(() => {
  console.log(`Count: ${getCount()}, Name: ${getName()}`);
});

setCount(1); // 输出: Count: 1, Name: World
setName('React'); // 输出: Count: 1, Name: React

// Computed 使用
const [getFirstName, setFirstName] = createSignal('John');
const [getLastName, setLastName] = createSignal('Doe');

const getFullName = createComputed(() => {
  return `${getFirstName()} ${getLastName()}`;
});

createEffect(() => {
  console.log(`Full name: ${getFullName()}`);
});

setFirstName('Jane'); // 输出: Full name: Jane Doe

// 复杂依赖图
const [getA, setA] = createSignal(1);
const [getB, setB] = createSignal(2);

const getC = createComputed(() => getA() + getB());
const getD = createComputed(() => getC() * 2);

createEffect(() => {
  console.log(`D = ${getD()}`); // D = (A + B) * 2
});

setA(5); // A=5, B=2, C=7, D=14
setB(3); // A=5, B=3, C=8, D=16
```

### 3.4 框架对比

| 特性 | Signals (Solid) | Vue Reactivity | MobX | RxJS |
|------|-----------------|----------------|------|------|
| **粒度** | 细粒度（值级别） | 细粒度（属性级别） | 中粒度（对象级别） | 流级别 |
| **拉取/推送** | 拉取（懒计算） | 拉取（懒计算） | 推送 + 拉取 | 推送为主 |
| **自动追踪** | 是 | 是 | 是 | 否（显式） |
| **开发体验** | 需要 getter | 透明响应 | 装饰器/装饰 | 操作符链 |
| **性能** | 最优 | 优秀 | 良好 | 中等 |

**响应式系统类型对比：**

```
响应式粒度:
┌─────────────────────────────────────────────────────────────┐
│ 粒度级别        实现                    典型框架           │
├─────────────────────────────────────────────────────────────┤
│ 值级 (Value)    Signal<T>               Solid, Preact     │
│ 属性级 (Prop)   Proxy + Dep             Vue 3             │
│ 对象级 (Object) Observable Object       MobX 5            │
│ 流级 (Stream)   Observable<T>           RxJS, XStream     │
│ 状态级 (State)  State Machine           Redux, Zustand    │
└─────────────────────────────────────────────────────────────┘
```

**响应式传播算法对比：**

| 算法 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **脏检查** | 简单，无依赖收集开销 | O(n) 检查，低效 | Angular 1.x |
| **依赖收集** | 精确，只更新需要更新的 | 需要运行时支持 | Vue, MobX |
| **编译时分析** | 零运行时开销 | 不够灵活 | Svelte |
| **信号 + 图** | 最优性能，懒计算 | 实现复杂 | Solid |


// ========== 5. Slots 模式（Vue 风格） ==========

interface Slots {
  header?: React.ReactNode;
  default?: React.ReactNode;
  footer?: React.ReactNode;
}

interface CardProps {
  slots: Slots;
  className?: string;
}

function Card({ slots, className }: CardProps) {
  return (
    <div className={`card ${className || ''}`}>
      {slots.header && (
        <div className="card-header">{slots.header}</div>
      )}
      <div className="card-body">{slots.default}</div>
      {slots.footer && (
        <div className="card-footer">{slots.footer}</div>
      )}
    </div>
  );
}

// 使用 Slots
function CardExample() {
  return (
    <Card
      slots={{
        header: <h2>Card Title</h2>,
        default: <p>This is the main content of the card.</p>,
        footer: <button>Action</button>
      }}
    />
  );
}

// ========== 6. Control Props 模式 ==========

interface ToggleProps {
  on?: boolean;
  defaultOn?: boolean;
  onToggle?: (on: boolean) => void;
}

function useToggleControl({
  on: controlledOn,
  defaultOn = false,
  onToggle
}: ToggleProps) {
  const [onState, setOnState] = useState(defaultOn);
  const isControlled = controlledOn !== undefined;
  const on = isControlled ? controlledOn : onState;

  const toggle = useCallback(() => {
    const newValue = !on;
    if (!isControlled) {
      setOnState(newValue);
    }
    onToggle?.(newValue);
  }, [on, isControlled, onToggle]);

  return { on, toggle };
}

function Toggle(props: ToggleProps) {
  const { on, toggle } = useToggleControl(props);

  return (
    <button
      onClick={toggle}
      className={`toggle ${on ? 'on' : 'off'}`}
      aria-pressed={on}
    >
      {on ? 'ON' : 'OFF'}
    </button>
  );
}

// ========== 7. State Reducer 模式 ==========

type ToggleState = { on: boolean };
type ToggleAction = { type: 'toggle' } | { type: 'reset'; initialOn: boolean };

function toggleReducer(state: ToggleState, action: ToggleAction): ToggleState {
  switch (action.type) {
    case 'toggle':
      return { on: !state.on };
    case 'reset':
      return { on: action.initialOn };
    default:
      return state;
  }
}

function useToggleWithReducer(
  initialOn: boolean = false,
  reducer: typeof toggleReducer = toggleReducer
) {
  const [state, dispatch] = useReducer(reducer, { on: initialOn });

  const toggle = useCallback(() => dispatch({ type: 'toggle' }), []);
  const reset = useCallback(() =>
    dispatch({ type: 'reset', initialOn }),
    [initialOn]
  );

  return { on: state.on, toggle, reset };
}

// ========== 8. Props Getters 模式 ==========

function useCounter({ initial = 0, step = 1 } = {}) {
  const [count, setCount] = useState(initial);

  const increment = useCallback(() => setCount(c => c + step), [step]);
  const decrement = useCallback(() => setCount(c => c - step), [step]);
  const reset = useCallback(() => setCount(initial), [initial]);

  // Props getters 提供可组合的 props
  const getIncrementProps = useCallback((props = {}) => ({
    onClick: increment,
    ...props
  }), [increment]);

  const getDecrementProps = useCallback((props = {}) => ({
    onClick: decrement,
    ...props
  }), [decrement]);

  const getCountProps = useCallback((props = {}) => ({
    'aria-valuenow': count,
    ...props
  }), [count]);

  return {
    count,
    increment,
    decrement,
    reset,
    getIncrementProps,
    getDecrementProps,
    getCountProps
  };
}

// 使用 Props Getters
function Counter() {
  const { count, getIncrementProps, getDecrementProps } = useCounter();

  return (
    <div>
      <span>{count}</span>
      <button {...getIncrementProps()}>+</button>
      <button {...getDecrementProps({ 'aria-label': 'Decrease' })}>-</button>
    </div>
  );
}

// ========== 9. Provider Pattern 组合 ==========

// 多层 Provider 组合器
function composeProviders(...providers: Array<React.FC<{ children: React.ReactNode }>>) {
  return function ComposedProviders({ children }: { children: React.ReactNode }) {
    return providers.reduceRight(
      (child, Provider) => <Provider>{child}</Provider>,
      children
    );
  };
}

// 使用
const AllProviders = composeProviders(
  ThemeProvider,
  UserProvider,
  NotificationProvider,
  ModalProvider
);

function App() {
  return (
    <AllProviders>
      <Application />
    </AllProviders>
  );
}

```

### 9.4 框架对比

| 模式 | React | Vue | Svelte | Angular |
|------|-------|-----|--------|---------|
| **Compound Components** | Context + Hook | Provide/Inject | 上下文 API | ContentChild |
| **Render Props** | 原生 | Scoped Slot | Slot props | TemplateRef |
| **HOC** | 高阶函数 | Mixins（不推荐） | 无 | 装饰器 |
| **Custom Hooks** | useXxx | Composables | 无（运行时响应） | Service |
| **Slots** | children | 原生 Slot | 原生 Slot | ng-content |
| **Provider Pattern** | Context | Provide/Inject | setContext | DI |

**组合模式复杂度对比：**

```

复用粒度:
┌─────────────────────────────────────────────────────────────┐
│ 粒度        模式                    适用场景                │
├─────────────────────────────────────────────────────────────┤
│ UI          Slots, Render Props     布局复用                │
│ 逻辑        Custom Hooks, Composables 状态逻辑复用          │
│ 行为        HOC, 指令               横切关注点              │
│ 数据        Provider, Service       全局状态                │
│ 结构        Compound Components     紧密耦合的组件组        │
└─────────────────────────────────────────────────────────────┘

```

---

## 10. 前端性能优化理论

### 10.1 理论解释

前端性能优化涉及加载性能、运行时性能和渲染性能三个维度。形式化方法可以帮助我们量化优化效果。

**核心概念：**
- **代码分割**: 将代码拆分为按需加载的块
- **懒加载**: 延迟加载非关键资源
- **预加载**: 提前加载可能需要的资源
- **缓存策略**: 浏览器和服务器的缓存利用

### 10.2 形式化模型

**加载性能的形式化：**

$$
\text{LCP} = \max(T_{fcp}, T_{lcp})
$$

$$
T_{fcp} = \min_{r \in Resources} \{end(r) \mid r \text{ 渲染首屏内容}\}
$$

$$
\text{TBT} = \sum_{t \in Tasks} \max(0, duration(t) - 50ms)
$$

**代码分割的形式化：**

```

设原始 Bundle B = {m₁, m₂, ..., mₙ}

分割策略 σ: B → {B₁, B₂, ..., Bₖ}
约束:

  1. ⋃ Bᵢ = B (完整性)
  2. Bᵢ ∩ Bⱼ = ∅ or 共享 chunk (允许重复)
  3. |Bᵢ| < threshold (大小限制)

最优分割:
  argmin_{σ} ∑ᵢ P(Bᵢ需要加载) × |Bᵢ|

```

**资源加载优先级：**

$$
\text{priority}(r) = \alpha \cdot critical(r) + \beta \cdot usage(r) + \gamma \cdot \frac{1}{size(r)}
$$

其中：
- $critical(r) \in \{0, 1\}$: 是否为关键资源
- $usage(r)$: 资源被使用的概率
- $size(r)$: 资源大小

**缓存命中率模型：**

$$
\text{Hit Rate} = \frac{\sum_{r \in R_{cache}} access(r)}{\sum_{r \in R_{all}} access(r)}
$$

### 10.3 代码示例

```typescript
// === 前端性能优化的形式化实现 ===

// ========== 1. 代码分割与动态导入 ==========

// React.lazy + Suspense
import React, { lazy, Suspense, ComponentType } from 'react';

// 路由级代码分割
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// 预加载函数
const lazyWithPreload = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => {
  const Component = lazy(factory);
  (Component as any).preload = factory;
  return Component;
};

const HeavyComponent = lazyWithPreload(() => import('./HeavyComponent'));

// 路由预加载
function RouteWithPreload({ path, component: Component }: {
  path: string;
  component: React.LazyExoticComponent<ComponentType<any>> & { preload?: () => void }
}) {
  return (
    <div
      onMouseEnter={() => Component.preload?.()}
      onFocus={() => Component.preload?.()}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <Component />
      </Suspense>
    </div>
  );
}

// ========== 2. 虚拟列表优化 ==========

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  // 可见区域计算
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, idx) => (
            <div key={startIndex + idx} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + idx)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== 3. 图片懒加载与优化 ==========

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  placeholder?: string;
}

function OptimizedImage({
  src,
  alt,
  width,
  height,
  lazy = true,
  placeholder
}: OptimizedImageProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  // 生成响应式图片 URL
  const srcSet = width ? generateSrcSet(src, width) : undefined;

  return (
    <div
      className={`image-container ${loaded ? 'loaded' : ''}`}
      style={{ aspectRatio: width && height ? width / height : undefined }}
    >
      {placeholder && !loaded && (
        <img src={placeholder} alt="" className="placeholder" />
      )}
      <img
        src={src}
        srcSet={srcSet}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
      />
      {error && <div className="error-fallback">Failed to load image</div>}
    </div>
  );
}

function generateSrcSet(src: string, baseWidth: number): string {
  const sizes = [0.5, 1, 1.5, 2];
  return sizes
    .map(size => `${src}?w=${Math.round(baseWidth * size)} ${size}x`)
    .join(', ');
}

// ========== 4. 预加载策略 ==========

// 资源预加载管理器
class PreloadManager {
  private preloaded = new Set<string>();
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver(
      entries => this.handleIntersection(entries),
      { rootMargin: '200px' }
    );
  }

  // 预加载 JS 模块
  preloadModule(url: string): Promise<unknown> {
    if (this.preloaded.has(url)) return Promise.resolve();

    this.preloaded.add(url);
    return import(/* webpackIgnore: true */ url);
  }

  // 预加载图片
  preloadImage(src: string): Promise<void> {
    if (this.preloaded.has(src)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloaded.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // 预加载 CSS
  preloadStyle(href: string): void {
    if (this.preloaded.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);

    this.preloaded.add(href);
  }

  // 基于可见性的预加载
  observeForPreload(element: Element, resources: string[]): void {
    (element as any).__preloadResources = resources;
    this.observer.observe(element);
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const resources = (entry.target as any).__preloadResources as string[];
        if (resources) {
          resources.forEach(r => this.preloadImage(r));
          this.observer.unobserve(entry.target);
        }
      }
    });
  }

  // 使用 link rel=prefetch 进行预测性预加载
  prefetch(url: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  // 使用 link rel=preload 进行关键资源预加载
  preloadCritical(url: string, as: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    if (as === 'font') link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
}

const preloadManager = new PreloadManager();

// ========== 5. 防抖与节流 Hook ==========

function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  return React.useCallback((...args: Parameters<T>) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  const inThrottle = React.useRef(false);

  return React.useCallback((...args: Parameters<T>) => {
    if (!inThrottle.current) {
      fn(...args);
      inThrottle.current = true;
      setTimeout(() => inThrottle.current = false, limit);
    }
  }, [fn, limit]);
}

// ========== 6. Web Worker 封装 ==========

class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{ task: unknown; resolve: (value: unknown) => void }> = [];
  private availableWorkers: Worker[] = [];

  constructor(private workerScript: string, poolSize: number = navigator.hardwareConcurrency || 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.onmessage = (e) => this.handleMessage(worker, e.data);
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  execute(task: unknown): Promise<unknown> {
    return new Promise((resolve) => {
      if (this.availableWorkers.length > 0) {
        const worker = this.availableWorkers.pop()!;
        worker.postMessage(task);
        (worker as any).__currentResolve = resolve;
      } else {
        this.queue.push({ task, resolve });
      }
    });
  }

  private handleMessage(worker: Worker, result: unknown): void {
    const resolve = (worker as any).__currentResolve;
    if (resolve) {
      resolve(result);
      (worker as any).__currentResolve = undefined;
    }

    if (this.queue.length > 0) {
      const { task, resolve: nextResolve } = this.queue.shift()!;
      worker.postMessage(task);
      (worker as any).__currentResolve = nextResolve;
    } else {
      this.availableWorkers.push(worker);
    }
  }

  terminate(): void {
    this.workers.forEach(w => w.terminate());
  }
}

// ========== 7. 性能监控 ==========

class PerformanceMonitor {
  private metrics: Record<string, number[]> = {};

  // 测量函数执行时间
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    this.record(name, duration);
    return result;
  }

  // 异步测量
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    this.record(name, duration);
    return result;
  }

  private record(name: string, value: number): void {
    if (!this.metrics[name]) this.metrics[name] = [];
    this.metrics[name].push(value);
  }

  // 获取统计报告
  getReport(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const report: Record<string, any> = {};

    for (const [name, values] of Object.entries(this.metrics)) {
      report[name] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    }

    return report;
  }

  // 核心 Web Vitals 监控
  observeWebVitals(): void {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.record('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
        this.record('FID', fid);
      }
    }).observe({ entryTypes: ['first-input'] });

    // CLS
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.record('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });

    // TTFB
    window.addEventListener('load', () => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (nav) {
        this.record('TTFB', nav.responseStart - nav.startTime);
      }
    });
  }
}

// ========== 8. Service Worker 缓存策略 ==========

// service-worker.ts
const CACHE_NAME = 'app-cache-v1';
const STATIC_ASSETS = ['/index.html', '/app.js', '/styles.css'];

// 安装时预缓存
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 缓存策略
async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    return caches.match(request) || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then(response => {
    caches.open(CACHE_NAME).then(cache => {
      cache.put(request, response.clone());
    });
    return response;
  });

  return cached || fetchPromise;
}

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;

  if (request.url.includes('/api/')) {
    event.respondWith(networkFirst(request));
  } else if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});
```

### 10.4 框架对比

| 优化策略 | React | Vue | Svelte | Next.js |
|---------|-------|-----|--------|---------|
| **代码分割** | lazy + Suspense | defineAsyncComponent | 编译时自动 | 自动 + 手动 |
| **虚拟列表** | react-window | vue-virtual-scroller | 需第三方 | 需第三方 |
| **图片优化** | 需第三方 | 需第三方 | 需第三方 | next/image |
| **预加载** | 手动 | 手动 | 手动 | 自动 |
| **Tree Shaking** | webpack/rollup | vite/rollup | 编译时 | webpack |
| **压缩** | Terser | terser | 编译时 | SWC |

**性能指标目标（Web Vitals）：**

```
Core Web Vitals 阈值:
┌─────────────────────┬──────────┬──────────┬──────────┐
│ 指标                │ 良好     │ 需改进   │ 差       │
├─────────────────────┼──────────┼──────────┼──────────┤
│ LCP (最大内容绘制)  │ ≤2.5s    │ ≤4.0s    │ >4.0s    │
│ FID (首次输入延迟)  │ ≤100ms   │ ≤300ms   │ >300ms   │
│ CLS (累积布局偏移)  │ ≤0.1     │ ≤0.25    │ >0.25    │
│ FCP (首次内容绘制)  │ ≤1.8s    │ ≤3.0s    │ >3.0s    │
│ TTFB (首字节时间)   │ ≤800ms   │ ≤1800ms  │ >1800ms  │
│ TBT (总阻塞时间)    │ ≤200ms   │ ≤600ms   │ >600ms   │
└─────────────────────┴──────────┴──────────┴──────────┘
```

**性能优化策略效果对比：**

```
优化策略影响 (相对基线):
┌─────────────────────┬──────────┬──────────┬──────────┐
│ 策略                │ LCP      │ TTI      │ Bundle   │
├─────────────────────┼──────────┼──────────┼──────────┤
│ 代码分割            │ -10%     │ -30%     │ -50%     │
│ 懒加载图片          │ -20%     │ -5%      │ -10%     │
│ 预加载关键资源      │ -15%     │ -10%     │ 0%       │
│ Service Worker      │ -5%      │ -20%     │ -80%(重复)│
│ Tree Shaking        │ 0%       │ -5%      │ -40%     │
│ 压缩 (gzip/brotli)  │ 0%       │ -5%      │ -70%     │
└─────────────────────┴──────────┴──────────┴──────────┘
```

---

## 总结

本文档从前端框架的十个核心理论维度进行了系统性的形式化分析：

| 主题 | 核心理论 | 关键公式/模型 | 最佳实践 |
|------|---------|--------------|---------|
| **代数效应** | 副作用建模 | $perform/handle$ 对 | React Fiber 调度 |
| **Virtual DOM** | 树编辑距离 | $d(T_1, T_2) = \min \sum cost(op)$ | Key + LIS 优化 |
| **响应式系统** | 依赖图传播 | $Signal + Effect$ 图 | 细粒度更新 |
| **状态管理** | 状态机 | $\mathcal{M} = (S, A, \delta, s_0)$ | 原子化状态 |
| **Hydration** | DOM 同构 | $DOM_{ssr} \cong DOM_{client}$ | 渐进式注水 |
| **Islands** | 部分激活 | $Page = (S, I, \prec)$ | 按需加载 JS |
| **Server Components** | 服务端/客户端边界 | $C_{server} \cap C_{client} = \emptyset$ | 零客户端 JS |
| **前端路由** | Trie 匹配 | $O(k)$ 复杂度 | 嵌套路由 |
| **组件组合** | 范畴论组合 | $\circ, \triangleright, \otimes$ | 复合组件 |
| **性能优化** | 资源调度 | $\text{priority}(r)$ 加权 | Core Web Vitals |

**框架设计趋势：**

1. **从 Virtual DOM 到 Signals**: 细粒度响应式取代全量 Diff
2. **从 SPA 到 Islands/Server Components**: 减少客户端 JavaScript
3. **从运行时到编译时**: Svelte/Solid 的编译优化策略
4. **从手动优化到自动优化**: 框架内置的代码分割和资源优先级

这些理论不仅是理解现有框架的基础，也为未来框架设计提供了数学上的指导。
