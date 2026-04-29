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
  private _value: T;
  private _deps = new Set<EffectFn>();

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

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Pull 一定比 Push 简单 | React 的调度与并发模式使 Pull 模型同样复杂 |
| Signal 必然无内存泄漏 | 持久订阅需正确清理（如组件卸载时），否则 effect 会堆积 |
| 所有框架信号实现相同 | Solid 使用编译时优化，Preact 使用运行时链表，实现差异显著 |

### 3.3 扩展阅读

- [The Future of Reactivity — Ryan Carniato](https://dev.to/ryansolid/fine-grained-reactivity-already-won-2a99)
- [Push vs Pull in Reactive Systems](https://www.reactively.dev/blog/why-use-reactively)
- [Vue Reactivity Deep Dive](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [TC39 Signals Proposal](https://github.com/tc39/proposal-signals)
- `20.5-frontend-frameworks/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
