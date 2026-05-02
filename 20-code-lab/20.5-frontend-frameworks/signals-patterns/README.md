# Signals 跨框架范式：代码实验室

> **定位**：`20-code-lab/20.5-frontend-frameworks/signals-patterns/`
> **关联**：`30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/Signals_范式深度分析.md` | `docs/categories/05-state-management.md`

---

## 一、核心命题

**Signals** 正在从「框架特性」演变为「跨框架通用范式」。2026 年，Signals 已在 SolidJS（原生）、Angular（v16+）、Preact、Vue 3.5+（Vapor Mode）、Svelte 5（Runes）中获得原生或官方支持。

**性能优势**：Signals 的细粒度更新性能是 React Context 的 **6-10 倍**。

---

## 二、Signals 的形式化定义

### 2.1 核心抽象

Signal 是一个**可观察的状态单元**，包含：

- **值（Value）**：当前状态
- **订阅者（Subscribers）**：依赖该 Signal 的计算/副作用
- **更新语义**：值变化时，仅通知直接订阅者，而非整树重新渲染

```typescript
interface Signal<T> {
  get(): T;           // 读取值，自动追踪依赖
  set(value: T): void; // 设置值，触发订阅者
  peek(): T;          // 读取值，不追踪依赖
}
```

### 2.2 响应式图（Reactive Graph）

```
    count = signal(0)
         │
    ┌────┴────┐
    ▼         ▼
double      isEven
(derived)   (derived)
    │         │
    └────┬────┘
         ▼
    effect(() => console.log(double()))
```

**关键特征**：

- **懒计算（Lazy Evaluation）**：derived signal 仅在读取时重新计算
- **自动追踪（Automatic Tracking）**：依赖关系在运行时动态建立
- **细粒度更新（Granular Updates）**：仅更新变化的节点及其下游

---

## 三、跨框架实现对比

| 框架 | Signals API | 实现方式 | 特点 |
|------|------------|---------|------|
| **SolidJS** | `createSignal()` | 编译时 + 运行时 | 零虚拟 DOM，最纯粹 |
| **Vue 3.5+** | `shallowRef()` / `computed()` | Proxy 劫持 + 依赖追踪 | 与 Options API 兼容 |
| **Angular 16+** | `signal()` | 变更检测集成 | Zoneless 模式 |
| **Preact** | `@preact/signals` | 运行时补丁 | React 生态兼容 |
| **Svelte 5** | `$state()` / `$derived()` | 编译时转换 | Runes 语法 |
| **alien-signals** | `signal()` / `computed()` | 独立库 | 框架无关的原语 |

---

## 四、代码示例

### 4.1 alien-signals（框架无关）

```typescript
// signals-basic.ts
import { signal, computed, effect } from 'alien-signals';

// 定义状态
const count = signal(0);
const doubled = computed(() => count.get() * 2);

// 副作用
effect(() => {
  console.log('Count:', count.get(), 'Doubled:', doubled());
});

count.set(1); // 输出: Count: 1 Doubled: 2
count.set(2); // 输出: Count: 2 Doubled: 4
```

### 4.2 SolidJS 风格（细粒度）

```typescript
// solid-signals.ts
import { createSignal, createEffect, createMemo } from 'solid-js';

const [count, setCount] = createSignal(0);
const doubled = createMemo(() => count() * 2);

createEffect(() => {
  console.log('Effect:', count(), doubled());
});

setCount(1);
```

### 4.3 Vue 3.5 Signals

```typescript
// vue-signals.ts
import { shallowRef, computed, watchEffect } from 'vue';

const count = shallowRef(0);
const doubled = computed(() => count.value * 2);

watchEffect(() => {
  console.log('WatchEffect:', count.value, doubled.value);
});

count.value = 1;
```

---

## 五、Signals vs Hooks vs Observer

### 5.1 对比矩阵

| 维度 | Signals | React Hooks | MobX/Observer |
|------|---------|------------|---------------|
| **更新粒度** | 信号级 | 组件级 | 对象级 |
| **依赖追踪** | 自动 | 手动（deps数组） | 自动（Proxy） |
| **心智模型** | 响应式图 | 函数式重新执行 | 可观察对象 |
| **性能** | 最优 | 依赖 useMemo | 优 |
| **调试** | 依赖图可视化 | React DevTools | MobX DevTools |

### 5.2 决策树

```
状态管理需求
├── 简单局部状态
│   └── → useState（React）/ ref（Vue）
├── 跨组件共享状态
│   └── 更新频率高？
│       ├── 是 → Signals（Solid/Vue/Preact）
│       └── 否 → Context + useReducer / Pinia / Zustand
├── 复杂派生逻辑
│   └── → computed signals + effect
└── 外部状态集成
    └── → Signals + 适配器模式
```

---

## 六、Signals 的工程模式

### 6.1 状态提升（Lifted State）

```typescript
// 将组件状态提升为全局 signals
const globalCount = signal(0);

function Counter() {
  return <button onClick={() => globalCount.set(globalCount.get() + 1)}>
    {globalCount.get()}
  </button>;
}
```

### 6.2 资源管理（Resource Pattern）

```typescript
// 异步数据获取的 signal 封装
function createResource<T>(fetcher: () => Promise<T>) {
  const data = signal<T | undefined>(undefined);
  const error = signal<Error | undefined>(undefined);
  const loading = signal(false);

  async function refetch() {
    loading.set(true);
    try {
      data.set(await fetcher());
      error.set(undefined);
    } catch (e) {
      error.set(e as Error);
    } finally {
      loading.set(false);
    }
  }

  return { data, error, loading, refetch };
}
```

---

## 七、THEORY.md

### 理论深化：Signals 的响应式理论基础

Signals 的响应式模型可追溯至：

1. **电子表格计算**：单元格依赖图的自动重算（VisiCalc, 1979）
2. **函数式响应式编程（FRP）**：Event/Behavior 分离（Elliott & Hudak, 1997）
3. **细粒度响应式**：Svelte 编译时优化（Harris, 2019）

**形式化语义**：Signals 构成一个有向无环图（DAG），其中：

- 节点 = Signal（原子或派生）
- 边 = 依赖关系（读操作建立依赖）
- 更新传播 = DAG 的拓扑排序遍历

**定理（Signals 一致性定理）**：在 DAG 结构下，Signals 的更新传播保证无循环依赖时，所有派生信号最终收敛到与原子信号一致的状态。

---

*本模块为 L2 代码实验室的 Signals 范式专项，提供跨框架的代码示例与理论分析。*
