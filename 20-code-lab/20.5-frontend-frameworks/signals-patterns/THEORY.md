# Signals 响应式范式

> **定位**：`20-code-lab/20.5-frontend-frameworks/signals-patterns`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决前端响应式系统的底层机制理解问题。涵盖 Pull（拉取）与 Push（推送）两种 reactivity 模型的设计原理与实现差异。

### 1.2 形式化基础

- **Push 模型**：数据变化时主动通知订阅者（如 EventEmitter、Signals、RxJS）。
- **Pull 模型**：消费者主动拉取最新值（如 React `useState` + render cycle、MobX `autorun` 底层仍属 push）。
- **细粒度追踪**：在值读取点建立依赖边，写入时沿边传播。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 响应式系统 | 依赖追踪与自动更新 | reactivity.ts |
| 细粒度订阅 | 仅追踪最小依赖单元 | fine-grained.ts |
| 脏检查 | 轮询比对旧值与新值 | dirty-check.ts |
| 批处理（Batch） | 将多次写操作合并为单次更新传播 | batch.ts |
| Memo（派生） | 基于依赖自动缓存计算结果 | memo.ts |

---

## 二、设计原理

### 2.1 为什么存在

前端 UI 状态与视图同步是永恒问题。Signals 范式通过显式的细粒度订阅，将同步成本从"组件级"降至"值级"。

### 2.2 Pull vs Push Reactivity 对比

| 维度 | Pull（拉取）| Push（推送）|
|------|------------|------------|
| 触发时机 | 消费者主动请求（如渲染周期） | 数据变化时立即通知 |
| 性能特征 | 批量处理、可能重复计算 | 即时传播、需防抖/批量 |
| 典型代表 | React Hooks、Vue `ref`（读取时）| Solid/Preact Signals、RxJS、Svelte |
| 内存模型 | 无持久订阅，每次渲染重建 | 持久依赖图，需手动清理 |
| 滞后性 | 可能读到旧值（直到下次拉取）| 实时一致 |
| 调试难度 | 堆栈深、调度复杂 | 传播链清晰 |

### 2.3 与相关技术的对比

与虚拟 DOM 对比：Signals 直接绑定细粒度 DOM 操作，省去 diff；虚拟 DOM 在跨平台和表达力上更灵活。现代趋势是两者融合（如 Vue Vapor Mode、React Compiler）。

---

## 三、实践映射

### 3.1 从理论到代码

以下是一个 **从零实现的自定义 Signal 系统**，展示依赖追踪与 push 传播：

```typescript
// custom-signals.ts
// 从零实现 Push 模型 Signal + Effect + Memo

type EffectFn = () => void;
let activeEffect: EffectFn | null = null;
const effectStack: EffectFn[] = [];

class Signal<T> {
  protected _value: T;
  protected _deps = new Set<EffectFn>();

  constructor(v: T) {
    this._value = v;
  }

  get value(): T {
    if (activeEffect) {
      this._deps.add(activeEffect);
    }
    return this._value;
  }

  set value(v: T) {
    if (Object.is(this._value, v)) return;
    this._value = v;
    // 快照 + 执行
    for (const fn of new Set(this._deps)) {
      fn();
    }
  }

  peek(): T {
    return this._value;
  }
}

function createEffect(fn: EffectFn) {
  const execute = () => {
    activeEffect = execute;
    effectStack.push(execute);
    try {
      fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1] || null;
    }
  };
  execute();
}

function createMemo<T>(fn: () => T): Signal<T> {
  const s = new Signal<T>(undefined as unknown as T);
  createEffect(() => {
    s.value = fn();
  });
  return s;
}

// 可运行示例
const firstName = new Signal('Ada');
const lastName = new Signal('Lovelace');
const fullName = createMemo(() => `${firstName.value} ${lastName.value}`);

createEffect(() => {
  console.log('Full name changed:', fullName.value);
});

console.log('--- update firstName ---');
firstName.value = 'Grace';   // 触发 effect
console.log('--- update lastName ---');
lastName.value = 'Hopper';   // 触发 effect
```

#### Preact Signals 使用示例

```typescript
// preact-signals-demo.ts
import { signal, computed, effect, batch } from '@preact/signals-core';

const count = signal(0);
const doubled = computed(() => count.value * 2);

effect(() => {
  console.log('count =', count.value, 'doubled =', doubled.value);
});

// 批量更新，仅触发一次 effect
batch(() => {
  count.value = 1;
  count.value = 2;
});
// 输出一次: count = 2, doubled = 4
```

#### SolidJS Signals 与清理

```typescript
// solid-signals-demo.ts
import { createSignal, createEffect, createMemo, onCleanup } from 'solid-js';

const [count, setCount] = createSignal(0);
const doubled = createMemo(() => count() * 2);

createEffect(() => {
  console.log('doubled:', doubled());
  onCleanup(() => {
    console.log('cleanup previous effect run');
  });
});

setCount(1); // 触发 effect 并先执行 cleanup
setCount(2);
```

#### Angular Signals（v16+）

```typescript
// angular-signals-demo.ts
import { signal, computed, effect } from '@angular/core';

const firstName = signal('Alan');
const lastName = signal('Turing');
const fullName = computed(() => `${firstName()} ${lastName()}`);

effect(() => {
  console.log('Full name:', fullName());
});

firstName.set('Grace');
```

#### 批处理与调度器

```typescript
// batch-scheduler.ts
let batchedEffects = new Set<EffectFn>();
let scheduled = false;

function scheduleEffect(fn: EffectFn) {
  batchedEffects.add(fn);
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    for (const f of batchedEffects) f();
    batchedEffects.clear();
  });
}

class BatchedSignal<T> extends Signal<T> {
  set value(v: T) {
    if (Object.is(this._value, v)) return;
    this._value = v;
    for (const fn of this._deps) {
      scheduleEffect(fn);
    }
  }
}
```

#### Vue 3 Reactivity（`@vue/reactivity`）独立使用

```typescript
// vue-reactivity-demo.ts
import { ref, computed, effect, stop } from '@vue/reactivity';

const count = ref(0);
const doubled = computed(() => count.value * 2);

const runner = effect(() => {
  console.log('Vue effect:', count.value, doubled.value);
});

count.value++; // 触发 effect
count.value++;

// 停止监听
stop(runner);
count.value++; // 不再触发
```

#### Svelte 5 Runes

```typescript
// svelte-runes-demo.ts — Svelte 5 编译器将 $state/$derived 转换为细粒度信号
// 以下为概念性等价代码（实际由 Svelte 编译器处理）
import { writable, derived } from 'svelte/store';

// Svelte 5: let count = $state(0);
const count = writable(0);

// Svelte 5: let doubled = $derived(count * 2);
const doubled = derived(count, ($count) => $count * 2);

// Svelte 5: $effect(() => { console.log(doubled); })
doubled.subscribe((value) => {
  console.log('Svelte doubled:', value);
});

count.set(5); // 输出: Svelte doubled: 10
```

#### React `useSyncExternalStore` 桥接 Signal

```typescript
// react-signal-bridge.ts
import { useSyncExternalStore } from 'react';

function useSignal<T>(signal: Signal<T>): T {
  return useSyncExternalStore(
    (callback) => {
      const effectFn = () => callback();
      // 订阅 signal 变化（假设 signal 提供 subscribe 方法）
      signal._deps.add(effectFn);
      return () => {
        signal._deps.delete(effectFn);
      };
    },
    () => signal.peek(),
    () => signal.peek()
  );
}

// 使用：const count = useSignal(mySignal);
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Pull 一定比 Push 简单 | React 的调度与并发模式使 Pull 模型同样复杂 |
| Signal 必然无内存泄漏 | 持久订阅需正确清理（如组件卸载时），否则 effect 会堆积 |
| 所有框架信号实现相同 | Solid 使用编译时优化，Preact 使用运行时链表，实现差异显著 |
| 忽略 Batch 的必要性 | 高频写入无 batch 会导致 O(n²) 级 effect 重算 |

### 3.3 扩展阅读

- [The Future of Reactivity — Ryan Carniato](https://dev.to/ryansolid/fine-grained-reactivity-already-won-2a99)
- [Push vs Pull in Reactive Systems](https://www.reactively.dev/blog/why-use-reactively)
- [Vue Reactivity Deep Dive](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [TC39 Signals Proposal](https://github.com/tc39/proposal-signals)
- [Preact Signals Documentation](https://preactjs.com/guide/v10/signals/)
- [SolidJS Reactivity — Docs](https://docs.solidjs.com/concepts/signals)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [React Compiler — React Docs](https://react.dev/learn/react-compiler)
- [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) — React 官方外部状态同步 Hook
- [Vue Reactivity API](https://vuejs.org/api/reactivity-core.html) — Vue 3 独立响应式 API
- [Svelte 5 Runes](https://svelte.dev/docs/runes) — Svelte 5 官方 Runes 文档
- [RxJS vs Signals — Angular Blog](https://blog.angular.dev/signals-vs-rxjs-whose-side-are-you-on-54345389ec9c)
- [Why Signals Are Better Than Hooks](https://www.builder.io/blog/signals-vs-hooks) — Builder.io 技术博客
- [TC39 Signals GitHub](https://github.com/tc39/proposal-signals) — ECMAScript 标准提案仓库
- [Preact Signals Core Source](https://github.com/preactjs/signals) — Preact Signals 源码

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
