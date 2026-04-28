---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# Signals 范式深度分析

> 系统性分析 Signals 响应式范式：从 SolidJS 原生 Signals 到跨框架通用原语 alien-signals，涵盖实现原理、框架对比、性能数据与选型决策。

---

## 目录

- [1. Signals 核心原理](#1-signals-核心原理)
  - [1.1 什么是 Signal](#11-什么是-signal)
  - [1.2 依赖追踪机制](#12-依赖追踪机制)
  - [1.3 惰性求值与缓存](#13-惰性求值与缓存)
- [2. 主流框架 Signals 实现](#2-主流框架-signals-实现)
  - [2.1 SolidJS 原生 Signals](#21-solidjs-原生-signals)
  - [2.2 Preact Signals](#22-preact-signals)
  - [2.3 Angular signals()](#23-angular-signals)
  - [2.4 Vue 3.5+ Vapor Mode](#24-vue-35-vapor-mode)
  - [2.5 Svelte 5 Runes](#25-svelte-5-runes)
  - [2.6 alien-signals](#26-alien-signals)
- [3. 系统性对比](#3-系统性对比)
  - [3.1 Signals vs Hooks](#31-signals-vs-hooks)
  - [3.2 Signals vs Observer (RxJS)](#32-signals-vs-observer-rxjs)
  - [3.3 性能数据](#33-性能数据)
- [4. 选型决策分析](#4-选型决策分析)
  - [4.1 何时选择 Signals](#41-何时选择-signals)
  - [4.2 何时选择 Hooks](#42-何时选择-hooks)
  - [4.3 混合架构方案](#43-混合架构方案)
- [5. 未来趋势](#5-未来趋势)

---

## 1. Signals 核心原理

### 1.1 什么是 Signal

Signal 是**响应式原语（Reactive Primitive）**，它是一个包装了值的容器，能够追踪所有读取它的计算（effect / computed），并在值变化时精确通知这些依赖进行更新。

与传统状态管理（如 React 的 `useState`）的根本区别在于：

- **React `useState`**：状态变化 → 组件重渲染 → 虚拟 DOM diff → 更新真实 DOM
- **Signal**：状态变化 → 直接更新订阅该 Signal 的 DOM 节点（或计算）

```typescript
// SolidJS 风格
const [count, setCount] = createSignal(0);
const doubled = createMemo(() => count() * 2);

createEffect(() => {
  console.log("Count:", count()); // 每次 count 变化时自动执行
});

setCount(1); // Effect 自动触发，但组件函数不会重新执行！
```

### 1.2 依赖追踪机制

Signals 的自动依赖追踪基于**全局执行上下文栈**：

1. 当 `createEffect` 或 `createMemo` 执行时，将当前计算压入全局栈
2. 计算函数内部读取 Signal 时，Signal 检查栈顶是否存在计算上下文
3. 若存在，建立双向订阅关系：Signal 记录该计算为订阅者，计算记录该 Signal 为依赖
4. 计算重新执行前，清理所有旧依赖关系，避免内存泄漏

```
执行 createEffect(fn)
    ↓
将 Computation 压入 contextStack
    ↓
执行 fn() → 内部调用 count()
    ↓
count() 发现 contextStack 栈顶有 Computation
    ↓
count._subscribers.add(Computation)
Computation._dependencies.add(count)
    ↓
弹出 contextStack
```

### 1.3 惰性求值与缓存

**Computed Signal** 采用惰性求值策略：

- 仅在读取时才执行计算函数
- 若依赖未变化，直接返回缓存值
- 若依赖变化，标记为「脏」，下次读取时重新计算

```typescript
const a = createSignal(1);
const b = createSignal(2);
const sum = createComputed(() => {
  console.log("重新计算 sum");
  return a.get() + b.get();
});

a.set(10); // 不触发计算（无人读取 sum）
b.set(20); // 不触发计算
console.log(sum.get()); // "重新计算 sum" → 30
console.log(sum.get()); // 直接返回 30（缓存命中）
```

---

## 2. 主流框架 Signals 实现

### 2.1 SolidJS 原生 Signals

SolidJS 是 Signals 范式的标杆框架，其设计哲学：

- **组件函数只执行一次**（初始化时），与 React 的「每次更新重渲染」根本不同
- **无虚拟 DOM**，编译时将响应式绑定直接注入真实 DOM 操作
- **细粒度更新**：Signal 变化时只更新具体的 DOM 文本节点

```tsx
import { createSignal, createMemo, createEffect } from 'solid-js';

function Counter() {
  const [count, setCount] = createSignal(0);
  const doubled = createMemo(() => count() * 2);

  // 只在初始化时执行一次
  createEffect(() => {
    console.log("Count:", count());
  });

  // 编译后：button 的文本节点直接与 count Signal 绑定
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count()} (doubled: {doubled()})
    </button>
  );
}
```

**SolidJS v2 动向（2025）**：

| 特性 | 说明 |
|------|------|
| 全新编译器架构 | 更强的 tree-shaking 和编译时优化 |
| 改进的 SSR 流式渲染 | 更低的 TTFB（Time to First Byte） |
| SolidStart 深度集成 | 细粒度服务端/客户端边界控制 |
| Solid Native（实验性） | 推动跨端能力 |

### 2.2 Preact Signals

Preact Signals 是 Signals 范式在 React 生态中的「补丁」方案，允许在 React 组件中获得接近 SolidJS 的性能。

**核心特点**：

- 通过 `@preact/signals-react` 在 React 中使用
- Signal 变化时**绕过 React 的渲染调度**，直接更新 DOM
- 支持在 Hooks 规则之外使用（可在 if/for 中创建 Signal）

```tsx
import { signal, computed } from '@preact/signals-react';

// Signal 可在组件外部定义（全局状态）
const count = signal(0);
const doubled = computed(() => count.value * 2);

function Counter() {
  // 点击时 Counter 组件函数不会重新执行！
  return (
    <button onClick={() => count.value++}>
      Count: {count.value} (doubled: {doubled.value})
    </button>
  );
}
```

**与 React Context 的性能对比**：

| 场景 | React Context | Preact Signals | 提升倍数 |
|------|--------------|----------------|---------|
| 1000 个独立计数器 | 1x | 6-10x | 6-10x |
| 列表筛选 | 1x | 4-8x | 4-8x |
| 表单输入 | 1x | 8-12x | 8-12x |
| 实时数据看板 | 1x | 5-9x | 5-9x |

### 2.3 Angular signals()

Angular v16+ 引入原生 Signals，标志着企业级框架正式拥抱细粒度响应式。

**设计特点**：

- 与 RxJS **共存而非替代**：Signals 管同步状态，RxJS 管异步流
- 与变更检测集成：Signal 变化自动触发 Angular 的精准变更检测
- 支持 `computed` 和 `effect`，API 设计保守但稳定

```typescript
import { signal, computed, effect } from '@angular/core';

@Component({...})
export class UserListComponent {
  // 状态声明
  users = signal<User[]>([]);
  query = signal('');

  // 派生计算（惰性求值）
  filteredUsers = computed(() => {
    const q = this.query().toLowerCase();
    return this.users().filter(u => u.name.toLowerCase().includes(q));
  });

  constructor() {
    // 副作用：状态变化时自动执行
    effect(() => {
      console.log(`显示 ${this.filteredUsers().length} 个用户`);
    });
  }

  addUser(name: string) {
    this.users.update(users => [...users, { id: Date.now(), name }]);
  }
}
```

**Angular 变更检测演进**：

| 版本 | 模式 | 机制 |
|------|------|------|
| v15 之前 | Zone.js | 任何异步事件触发全局变更检测 |
| v16+ | Zone.js + Signals 混合 | Signal 变化精准标记脏组件 |
| v18+（实验）| Zoneless | 完全基于 Signals 驱动变更检测 |

### 2.4 Vue 3.5+ Vapor Mode

Vue 3.5 引入 Vapor Mode，将响应式系统从虚拟 DOM 提升到编译时直接 DOM 操作，与 SolidJS 的思路趋同。

**核心变化**：

- 编译器根据模板生成**直接 DOM 操作代码**，而非虚拟 DOM render 函数
- 保留 Vue 的响应式系统（基于 Proxy 的 `ref` / `reactive`）
- 基线包体积降至 **<10KB**

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

// Vapor Mode 编译后：直接操作 DOM 文本节点
// 无需虚拟 DOM diff
</script>

<template>
  <button @click="count++">
    Count: {{ count }} (doubled: {{ doubled }})
  </button>
</template>
```

**Vue 响应式系统 vs Signals**：

Vue 的 `ref`/`computed` 本质上就是 Signals，但封装在 Vue 的响应式系统中：

| 概念 | Vue | SolidJS |
|------|-----|---------|
| 状态原语 | `ref()` | `createSignal()` |
| 派生计算 | `computed()` | `createMemo()` |
| 副作用 | `watch()` / `watchEffect()` | `createEffect()` |
| 更新粒度 | 组件级（默认）/ Vapor Mode 节点级 | 节点级 |

### 2.5 Svelte 5 Runes

Svelte 5 用「显式 Runes」替代了 Svelte 1-4 的「编译器隐式响应式」，解决了响应式边界不可预测的核心痛点。

**核心 Runes**：

| Rune | 作用 | 对应概念 |
|------|------|---------|
| `$state()` | 声明响应式状态 | `createSignal()` / `ref()` |
| `$derived()` | 声明派生计算 | `createMemo()` / `computed()` |
| `$effect()` | 声明副作用 | `createEffect()` / `watchEffect()` |
| `$props()` | 声明组件 props | `defineProps()` |
| `$bindable()` | 声明双向绑定 prop | `v-model` / `bind:` |

```svelte
<script>
  // Svelte 5：显式边界
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log("Count changed:", count);
  });
</script>

<button onclick={() => count++}>
  Count: {count} (doubled: {doubled})
</button>
```

**Svelte 1-4 的隐式问题 vs Svelte 5 的显式方案**：

```svelte
<!-- Svelte 4：边界模糊 -->
<script>
  let count = 0;           // 响应式的？是（编译器魔法）
  let doubled = count * 2; // 响应式的？不是！容易遗漏 $:
</script>

<!-- Svelte 5：边界清晰 -->
<script>
  let count = $state(0);           // 显式：响应式
  let doubled = $derived(count * 2); // 显式：派生
</script>
```

### 2.6 alien-signals

alien-signals 是由 Vue 团队（尤雨溪）开发的**跨框架通用 Signal 原语**，目标是为所有框架提供统一的底层响应式系统。

**定位**：

- 框架无关的底层库（~1KB）
- 被 Vue Vapor Mode、Nuxt、VitePress 等采用
- API 设计参考了 SolidJS 和 Vue 响应式系统的最佳实践

```typescript
import { signal, computed, effect } from 'alien-signals';

const count = signal(0);
const doubled = computed(() => count.get() * 2);

effect(() => {
  console.log("Count:", count.get());
});

count.set(1); // Effect 自动触发
```

**alien-signals 的技术优势**：

1. **极简 API**：仅 `signal`、`computed`、`effect` 三个核心函数
2. **高效调度**：基于微任务的批量更新（batch）
3. **无框架绑定**：可被任何 UI 框架（甚至非 React/Vue/Solid）使用
4. **TypeScript 原生**：类型推断完善

---

## 3. 系统性对比

### 3.1 Signals vs Hooks

| 维度 | React Hooks | Signals |
|------|-------------|---------|
| **心智模型** | 组件是渲染函数 | 组件是 setup 函数（只执行一次） |
| **更新粒度** | 组件级别 | DOM 节点级别 |
| **虚拟 DOM** | 需要 diff | 无需 diff（直接绑定） |
| **组件重渲染** | 每次状态变化 | 从不重渲染 |
| **依赖管理** | 手动维护依赖数组 | 自动追踪 |
| **闭包陷阱** | 存在（stale closure） | 不存在 |
| **条件使用** | ❌ 不可条件调用 | ✅ 任意位置使用 |
| **生态成熟度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐☆☆ |
| **性能（基准）** | 1x | 6-10x |

**代码风格对比**：

```tsx
// React Hooks
function Counter() {
  const [count, setCount] = useState(0);
  const doubled = useMemo(() => count * 2, [count]);

  useEffect(() => {
    console.log("Count:", count);
  }, [count]);

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// SolidJS Signals
function Counter() {
  const [count, setCount] = createSignal(0);
  const doubled = createMemo(() => count() * 2);

  createEffect(() => {
    console.log("Count:", count());
  });

  return <button onClick={() => setCount(c => c + 1)}>{count()}</button>;
}
```

### 3.2 Signals vs Observer (RxJS)

Signals 和 Observable（RxJS）不是竞争关系，而是**互补关系**。

| 维度 | Signals | Observable (RxJS) |
|------|---------|-------------------|
| **核心抽象** | 同步值容器 | 异步事件流 |
| **时间维度** | 当前值（快照） | 时间序列（历史+未来） |
| **拉取/推送** | 拉取（读取时计算） | 推送（订阅后被动接收） |
| **操作符** | 无（简单直接） | 丰富（map/filter/merge 等） |
| **取消订阅** | 自动（computed/effect 自动清理） | 手动（需 unsubscribe） |
| **错误处理** | 无内置机制 | 完整的错误传播机制 |
| **适用场景** | UI 状态、派生计算 | 异步流、事件处理、复杂编排 |

**最佳实践：分层架构**

```
UI 层    → Signals (本地状态 + 直接 DOM 绑定)
状态层   → Signals (全局状态 + 派生计算)
服务层   → Observable (HTTP/WebSocket + 复杂编排)
桥接     → toSignal / toObservable
```

### 3.3 性能数据

**js-framework-benchmark（2025-2026）关键数据**：

| 框架 | 创建 1000 行 | 更新所有行 | 局部更新 | 启动时间 |
|------|-------------|-----------|---------|---------|
| **vanilla JS** | 1.00x | 1.00x | 1.00x | 1.00x |
| **SolidJS** | 1.05x | 1.02x | 1.01x | 1.10x |
| **Svelte 5** | 1.08x | 1.05x | 1.03x | 1.15x |
| **Vue 3.6 Vapor** | 1.15x | 1.10x | 1.08x | 1.20x |
| **Preact Signals** | 1.20x | 1.15x | 1.12x | 1.25x |
| **Angular Signals** | 1.35x | 1.25x | 1.20x | 1.80x |
| **React 19 (Compiler)** | 1.50x | 1.40x | 1.35x | 1.60x |
| **React 18 (手动优化)** | 2.00x | 1.80x | 1.70x | 1.60x |

> 数据说明：以 vanilla JS 为基准 1.00x，数值越小性能越好。React 19 + React Compiler 1.0 相比 React 18 手动优化提升约 25-35%。

**React Context vs Signals 大规模场景**：

| 场景（1000 个独立状态单元） | React Context | Signals | 提升倍数 |
|---------------------------|--------------|---------|---------|
| 独立计数器 | 1x | 6-10x | 6-10x |
| 列表筛选 | 1x | 4-8x | 4-8x |
| 表单输入 | 1x | 8-12x | 8-12x |
| 实时数据看板 | 1x | 5-9x | 5-9x |
| 树形控件展开/折叠 | 1x | 3-6x | 3-6x |

**性能提升的根本原因**：

1. **避免虚拟 DOM diff**：Signals 精确知道哪个 DOM 节点需要更新
2. **避免组件函数重新执行**：React 中每次 setState 触发整个组件重渲染
3. **避免调度开销**：React 的优先级计算、时间切片、批处理对简单更新是过度设计
4. **自动依赖追踪**：无需手动维护 useMemo/useCallback 的依赖数组

---

## 4. 选型决策分析

### 4.1 何时选择 Signals

✅ **高性能需求场景**：
- 实时数据可视化（图表、仪表盘）
- 大型列表/表格的频繁更新
- 高频率用户交互（拖拽、画布、游戏）
- 动画状态管理（60fps 更新）

✅ **状态频繁变化的局部组件**：
- 计数器、输入框、开关
- 鼠标/触摸跟踪
- 滚动位置监听

✅ **新项目 / 无历史包袱**：
- 技术栈可自由选择
- 团队愿意学习新范式
- 追求极致性能和包体积

✅ **框架原生支持 Signals**：
- SolidJS / SolidStart 项目
- Svelte 5 / SvelteKit 项目
- Angular v16+ 项目

### 4.2 何时选择 Hooks

✅ **生态成熟度优先**：
- 需要大量第三方 React 组件库
- 重度依赖 AI 辅助编码（React 训练数据最丰富）
- 招聘市场要求 React 技能

✅ **大型团队与遗留项目**：
- 现有大型 React 代码库
- 迁移成本过高
- 团队对 React 已非常熟悉

✅ **复杂异步流为主的应用**：
- 大量 HTTP 请求编排
- WebSocket 实时通信
- 复杂的状态机（此时 RxJS + Hooks 更合适）

✅ **React 19 + Compiler 已足够**：
- 中等规模应用
- React Compiler 1.0 自动优化后性能已可接受
- 不需要极致的每毫秒优化

### 4.3 混合架构方案

在现有 React 项目中逐步引入 Signals 的最佳路径：

**迁移优先级（从高到低）**：

1. **高频更新的本地状态**（计数器、输入框、动画）
2. **大型列表的筛选/排序状态**
3. **复杂表单的字段状态**
4. **画布/图表的交互状态**

**保留 React Hooks 的场景**：

- 服务端状态（TanStack Query / SWR）
- 第三方 React 库集成
- 低频更新的全局状态
- React Context（主题、国际化）

**混合方案示例**：

```tsx
import { useSignalState } from '@preact/signals-react';
import { useQuery } from '@tanstack/react-query';

function ProductList() {
  // 保留：服务端状态仍用 TanStack Query
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  // 迁移：筛选状态使用 Signal（高频更新，避免列表重渲染）
  const filter = useSignalState('');
  const sortBy = useSignalState('price');

  // Signal 变化不会触发 ProductList 重渲染，直接更新 DOM
  const filtered = useComputed(() =>
    products?.filter(p => p.name.includes(filter.value))
      .sort((a, b) => sortBy.value === 'price' ? a.price - b.price : 0)
  );

  return (
    <div>
      <input
        value={filter.value}
        onChange={e => filter.value = e.target.value}
      />
      {filtered.value?.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

---

## 5. 未来趋势

### 短期（2026-2027）

- **React Compiler 普及**：自动记忆化缩小 React 与 Signals 的性能差距，但不会消除根本差异
- **Preact Signals 在 React 生态中快速增长**：成为 React 项目性能优化的首选补丁
- **Angular Signals 成为企业级标准**：Zoneless 模式逐步成熟

### 中期（2027-2028）

- **React 可能引入官方 Signals API**：社区呼声持续高涨，Meta 内部已有多轮讨论
- **Signals 成为跨框架通用原语**：alien-signals 或类似标准被广泛采纳
- **新框架默认采用 Signals**：类似 ES Module 成为行业标准

### 长期（2028+）

- **响应式范式统一**：Signals 管同步状态，RxJS/Observable 管异步流
- **浏览器原生响应式 API**：TC39 或 W3C 可能引入类似 Signals 的标准提案
- **AI 编码工具对 Signals 的训练数据追平 React**

### 核心结论

> **Signals 不会完全取代 Hooks，但会成为「高性能场景的首选」。**
>
> 两者将长期共存：
> - **Signals**：高性能、细粒度、无虚拟 DOM（SolidJS、Svelte 5、Angular）
> - **Hooks**：生态成熟、人才丰富、第三方库丰富（React）
> - **混合方案**：React + Preact Signals 是渐进迁移的最佳路径

---

## 参考资源

- [SolidJS 官方文档](https://docs.solidjs.com/)
- [Preact Signals](https://preactjs.com/guide/v10/signals/)
- [Angular Signals](https://angular.dev/guide/signals)
- [Svelte 5 Runes](https://svelte.dev/docs/runes)
- [Vue Vapor Mode](https://github.com/vuejs/core-vapor)
- [alien-signals GitHub](https://github.com/stackblitz/alien-signals)
- [js-framework-benchmark](https://krausest.github.io/js-framework-benchmark/)
- [State of JS 2025](https://stateofjs.com/)

---

> 📅 本文档最后更新：2026 年 4 月
>
> 📦 代码示例：`jsts-code-lab/18-frontend-frameworks/signals-patterns/`
