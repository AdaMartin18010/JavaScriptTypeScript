# 框架中的 Signals 实现

> **定位**：`20-code-lab/20.5-frontend-frameworks/frontend-frameworks/signals-patterns`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决现代前端框架中细粒度响应式状态管理的实现差异问题。涵盖 Solid、Preact Signals 和 Angular Signals 的 API 设计与性能权衡。

### 1.2 形式化基础

- **Signal**：一个包装值，具备订阅/通知能力；读取时建立依赖，写入时触发副作用。
- **自动追踪（Auto-tracking）**：读取 signal 的上下文（effect / computed）自动成为其订阅者。
- **细粒度更新**：仅重新执行依赖发生变化的最小计算单元，而非整个组件。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Signal | 细粒度响应式原语，读时追踪、写时通知 | signal-core.ts |
| Effect | 副作用执行器，在依赖变化时自动运行 | effect.ts |
| Computed | 派生 signal，惰性求值 + 缓存 | computed.ts |

---

## 二、设计原理

### 2.1 为什么存在

虚拟 DOM diff 在频繁更新时存在运行时开销。Signals 通过编译时或运行时的依赖追踪，实现 DOM 的精确更新，跳过不必要的 diff 过程。

### 2.2 框架 Signals 对比

| 特性 | Solid Signals | Preact Signals | Angular Signals |
|------|--------------|----------------|-----------------|
| 实现层 | 运行时 + 编译优化 | 独立库（框架无关） | 框架内置（Zone.js 替代） |
| 语法 | `createSignal()` / `signal()` | `signal()` / `computed()` | `signal()` / `computed()` |
| 组件渲染 | 无虚拟 DOM，直接编译为 DOM 更新 | 可作为任意框架状态层 | 与变更检测集成 |
| 批量更新 | 自动事务 | `batch()` | `untracked()` / `effect()` |
| 生态耦合 | 深度绑定 Solid | React/Vue/原生均可 | Angular 专属 |
| 代表版本 | Solid 1.x | @preact/signals-core | Angular 16+ |

### 2.3 与相关技术的对比

与虚拟 DOM 对比：Signals 直接绑定细粒度 DOM 操作，省去 diff；虚拟 DOM 在跨平台和表达力上更灵活。现代趋势是两者融合（如 Vue Vapor Mode、React Compiler）。

---

## 三、实践映射

### 3.1 从理论到代码

以下是基于 **@preact/signals-core** 风格的轻量级 signal 响应式示例：

```typescript
// signals-framework.ts
// 轻量级 Signal + Effect + Computed（Preact/Solid 风格）

type Subscriber = () => void;

class Signal<T> {
  private _value: T;
  private _subs = new Set<Subscriber>();

  constructor(initial: T) {
    this._value = initial;
  }

  get value() {
    if (activeEffect) this._subs.add(activeEffect);
    return this._value;
  }

  set value(v: T) {
    if (this._value === v) return;
    this._value = v;
    this._notify();
  }

  private _notify() {
    // 快照避免循环订阅导致的问题
    const subs = Array.from(this._subs);
    for (const s of subs) s();
  }
}

let activeEffect: Subscriber | null = null;

function effect(fn: () => void) {
  const run = () => {
    activeEffect = run;
    fn();
    activeEffect = null;
  };
  run();
}

function computed<T>(fn: () => T): Signal<T> {
  const s = new Signal<T>(undefined as unknown as T);
  effect(() => {
    s.value = fn();
  });
  return s;
}

// 可运行示例
const count = new Signal(0);
const doubled = computed(() => count.value * 2);

effect(() => {
  console.log('count =', count.value, '| doubled =', doubled.value);
});

console.log('--- increment ---');
count.value = 1; // 触发 effect
console.log('--- increment ---');
count.value = 2; // 触发 effect
console.log('--- no change ---');
count.value = 2; // 值未变，不触发
```

### 3.2 Angular Signals 实战

```typescript
// angular-counter.ts — Angular 16+ Signals API
import { Component, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <button (click)="increment()">+1</button>
  `,
})
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  constructor() {
    effect(() => {
      console.log('Count changed to:', this.count());
    });
  }

  increment() {
    this.count.update((c) => c + 1);
  }
}
```

### 3.3 Preact Signals 在 React 中的使用

```tsx
// react-preact-signals.tsx
import { signal, computed, batch } from '@preact/signals-core';
import { useSignals } from '@preact/signals-react/runtime';

const todos = signal<{ id: number; text: string; done: boolean }[]>([]);
const completedCount = computed(() => todos.value.filter((t) => t.done).length);

function TodoList() {
  useSignals();

  function addTodo(text: string) {
    batch(() => {
      // 批量更新，只触发一次 effect / 重渲染
      todos.value = [...todos.value, { id: Date.now(), text, done: false }];
    });
  }

  function toggle(id: number) {
    todos.value = todos.value.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
  }

  return (
    <div>
      <p>Completed: {completedCount.value} / {todos.value.length}</p>
      {todos.value.map((t) => (
        <div key={t.id} onClick={() => toggle(t.id)}>
          {t.done ? '✅' : '⬜'} {t.text}
        </div>
      ))}
      <button onClick={() => addTodo('New todo')}>Add</button>
    </div>
  );
}
```

### 3.4 SolidJS 信号与派生

```tsx
// solid-counter.tsx
import { createSignal, createEffect, createMemo, batch } from 'solid-js';

function SolidCounter() {
  const [count, setCount] = createSignal(0);
  const doubled = createMemo(() => count() * 2);

  createEffect(() => {
    console.log('Solid count:', count());
  });

  return (
    <button
      onClick={() =>
        batch(() => {
          setCount((c) => c + 1);
        })
      }
    >
      {count()} × 2 = {doubled()}
    </button>
  );
}
```

### 3.5 常见误区

| 误区 | 正确理解 |
|------|---------|
| 虚拟 DOM 总是比 Signals 慢 | 中等复杂度 UI 下差距有限；Signals 优势在极高频更新 |
| Signals 只能用于小型项目 | Preact Signals 已被用于大型生产应用（如 Shopify） |
| Angular Signals 与 RxJS 冲突 | Angular 推荐 Signals 处理同步状态，RxJS 处理异步流，二者互补 |

### 3.6 扩展阅读

- [SolidJS Reactivity](https://www.solidjs.com/tutorial/introduction_signals)
- [Preact Signals — Core Docs](https://preactjs.com/guide/v10/signals/)
- [Angular Signals — Official Guide](https://angular.dev/guide/signals)
- [The Future of Reactivity — Ryan Carniato](https://dev.to/ryansolid/fine-grained-reactivity-already-won-2a99)
- [TC39 Signals Proposal (Stage 1)](https://github.com/tc39/proposal-signals) — 原生信号标准化提案
- [Vue Reactivity Deep Dive](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [React Compiler — React Docs](https://react.dev/learn/react-compiler)
- [Storeon — 极简状态管理中的信号思想](https://github.com/storeon/storeon)
- [StackBlitz — Signals Benchmark](https://github.com/ryansolid/solid-signals-benchmark)
- `20.5-frontend-frameworks/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
