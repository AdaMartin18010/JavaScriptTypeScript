# 前端框架 — 架构设计

## 1. 架构概述

本模块实现了主流前端框架的核心机制简化版，包括响应式系统、虚拟 DOM Diff、组件生命周期管理和状态管理。通过 TypeScript 代码揭示框架背后的设计原理。架构采用"信号驱动渲染"的调度模型，状态变更通过细粒度信号传播，经调度器批处理后触发虚拟 DOM 协调，最终通过 patch 操作映射到真实 DOM。

## 2. 架构图

```
┌────────────────────────────────────────────────────────────────────────┐
│                         组件层 (Component Layer)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Function   │  │   JSX/Template│  │   Props /   │  │  Lifecycle  │ │
│  │  Component   │  │   Compiler    │  │   State     │  │   Hooks     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      响应式引擎 (Reactivity Engine)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │    Signal    │  │    Effect    │  │   Computed   │                   │
│  │  (Reactive   │  │ (Side-effect │  │  (Memoized   │                   │
│  │   Primitive) │  │   Tracking)  │  │   Derived)   │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      调度器 (Scheduler)                                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │   Microtask Batching  │  Priority Queue  │  Time Slicing (yield) │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    虚拟 DOM 协调器 (Reconciler)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │    VNode     │  │  Diff Algo   │  │   Patcher    │                   │
│  │  (Element /  │  │ (Same-level +│  │ (DOM Ops:    │                   │
│  │  Component / │  │   Keyed)     │  │ create/update│                   │
│  │   Text)      │  │              │  │ /move/remove)│                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      渲染层 (Renderer)                                   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        Real DOM / Browser APIs                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 响应式引擎

| 组件 | 职责 | 算法 | 框架对应 |
|------|------|------|----------|
| Signal | 细粒度的响应式原语，订阅-发布模式 | 依赖图 + 脏检查 | Solid Signals, Vue Ref |
| Effect | 副作用追踪器，自动收集依赖并重新执行 | 依赖收集 + 调度 | useEffect, watchEffect |
| Computed | 派生信号，缓存计算结果 | Memoization + 懒计算 | useMemo, computed |

### 3.2 虚拟 DOM 系统

| 组件 | 职责 | 复杂度 | 关键优化 |
|------|------|--------|----------|
| VNode | 虚拟节点抽象（标签、属性、子节点） | O(1) 创建 | 字符串编译时优化 |
| Diff 算法 | 同层比较，Key 优化列表更新 | O(n) | Key 复用、最长递增子序列 |
| Patch 引擎 | 将差异应用到真实 DOM | O(diff count) | 批量 DOM 操作 |

### 3.3 组件系统

| 组件 | 职责 | 设计模式 | 框架对应 |
|------|------|----------|----------|
| Component | 函数式组件封装 | 组合模式 | React FC, Vue SFC |
| Props/State | 输入属性与内部状态管理 | 单向数据流 | props / state |
| Lifecycle Hooks | 挂载、更新、卸载钩子 | 观察者模式 | onMount, useEffect |

## 4. 数据流

```
状态变更 → Signal 通知 → Effect 调度 → VNode 重新渲染 → Diff → Patch DOM
```

## 5. 框架技术栈对比

| 维度 | 本实验室 | React 19 | Vue 3 | Solid | Svelte 5 |
|------|---------|----------|-------|-------|----------|
| 响应式模型 | Signal + Effect | Hooks + Compiler | Proxy + Ref | Signal (纯) | Rune (编译时) |
| 粒度 | 信号级 | 组件级 (默认) | 组件级 | 信号级 | 语句级 |
| 编译器 | 无 | React Compiler (新) | SFC Compiler | 无 | Svelte Compiler |
| VDOM | 有 | 有 | 有 | 无 (直接 DOM) | 无 (直接 DOM) |
| 包体积 | ~3KB | ~40KB | ~35KB | ~7KB | ~5KB |
| 学习曲线 | 低 | 中 | 低 | 低 | 低 |
| 生态系统 | 教学 | ★★★★★ | ★★★★★ | ★★★ | ★★★★ |
| 核心理念 | 原理揭示 | UI = f(state) | 渐进式 | 细粒度响应 | 编译时优化 |

## 6. 代码示例

### 6.1 响应式信号系统

```typescript
// frontend-frameworks/src/reactivity/Signal.ts
type Subscriber = () => void;

class Signal<T> {
  private _value: T;
  private subscribers: Set<Subscriber> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    // 依赖收集：当前正在执行的 Effect 自动订阅此 Signal
    if (currentEffect) {
      this.subscribers.add(currentEffect);
    }
    return this._value;
  }

  set value(newValue: T) {
    if (this._value !== newValue) {
      this._value = newValue;
      // 通知所有订阅者
      for (const sub of this.subscribers) {
        sub();
      }
    }
  }
}

let currentEffect: Subscriber | null = null;

function createEffect(fn: () => void): void {
  const effect = () => {
    currentEffect = effect;
    try {
      fn();
    } finally {
      currentEffect = null;
    }
  };
  effect(); // 立即执行以收集依赖
}

function createComputed<T>(fn: () => T): Signal<T> {
  const signal = new Signal<T>(undefined as T);
  createEffect(() => {
    signal.value = fn();
  });
  return signal;
}

// 使用示例
const count = new Signal(0);
const doubled = createComputed(() => count.value * 2);

createEffect(() => {
  console.log(`Count: ${count.value}, Doubled: ${doubled.value}`);
});

count.value = 5; // 自动触发 Effect 重新执行
```

### 6.2 虚拟 DOM Diff 算法

```typescript
// frontend-frameworks/src/vdom/Diff.ts
interface VNode {
  type: string | Function;
  props: Record<string, any>;
  children: (VNode | string)[];
  key?: string | number;
}

type Patch =
  | { type: 'CREATE'; vnode: VNode }
  | { type: 'REMOVE' }
  | { type: 'REPLACE'; vnode: VNode }
  | { type: 'UPDATE'; props: Record<string, any>; children: Patch[] };

function diff(oldVNode: VNode | string | null, newVNode: VNode | string | null): Patch | null {
  // 1. 新建
  if (!oldVNode) {
    return { type: 'CREATE', vnode: newVNode as VNode };
  }

  // 2. 删除
  if (!newVNode) {
    return { type: 'REMOVE' };
  }

  // 3. 文本节点
  if (typeof oldVNode === 'string' || typeof newVNode === 'string') {
    if (oldVNode !== newVNode) {
      return { type: 'REPLACE', vnode: newVNode as VNode };
    }
    return null;
  }

  // 4. 不同类型直接替换
  if (oldVNode.type !== newVNode.type) {
    return { type: 'REPLACE', vnode: newVNode };
  }

  // 5. 同类型更新：比较 props 和 children
  const propsDiff = diffProps(oldVNode.props, newVNode.props);
  const childrenDiff = diffChildren(oldVNode.children, newVNode.children);

  if (Object.keys(propsDiff).length === 0 && childrenDiff.every(c => c === null)) {
    return null;
  }

  return { type: 'UPDATE', props: propsDiff, children: childrenDiff };
}

function diffChildren(
  oldChildren: (VNode | string)[],
  newChildren: (VNode | string)[]
): (Patch | null)[] {
  const patches: (Patch | null)[] = [];
  const maxLen = Math.max(oldChildren.length, newChildren.length);

  // 简单实现：同索引比较（生产环境应使用 Key + LIS 优化）
  for (let i = 0; i < maxLen; i++) {
    patches.push(diff(oldChildren[i] ?? null, newChildren[i] ?? null));
  }

  return patches;
}

function diffProps(oldProps: Record<string, any>, newProps: Record<string, any>): Record<string, any> {
  const diff: Record<string, any> = {};
  for (const key of new Set([...Object.keys(oldProps), ...Object.keys(newProps)])) {
    if (oldProps[key] !== newProps[key]) {
      diff[key] = newProps[key];
    }
  }
  return diff;
}
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 响应式粒度 | Signal 级别 | 最小化重新计算范围 |
| Diff 策略 | 同层 + Key | 平衡性能与实现复杂度 |
| 渲染触发 | 微任务批处理 | 减少 DOM 操作次数 |

## 8. 质量属性

- **性能**: 细粒度更新避免全量渲染
- **可预测性**: 单向数据流确保状态变化可追溯
- **可组合性**: 组件嵌套和逻辑复用

## 9. 参考链接

- [React Documentation](https://react.dev/) — React 官方文档与架构说明
- [Vue.js Documentation](https://vuejs.org/guide/essentials/reactivity-fundamentals.html) — Vue 响应式系统详解
- [SolidJS Reactivity](https://www.solidjs.com/tutorial/introduction_signals) — Solid 信号原语教程
- [Svelte 5 Runes](https://svelte.dev/blog/runes) — Svelte 5 编译时响应式介绍
- [Build your own React](https://pomb.us/build-your-own-react/) — Rodrigo Pombo 手写 React 经典教程
- [How React Works Under the Hood](https://github.com/acdlite/react-fiber-architecture) — React Fiber 架构说明
