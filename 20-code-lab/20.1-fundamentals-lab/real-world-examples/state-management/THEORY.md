# 状态管理

> **定位**：`20-code-lab/20.1-fundamentals-lab/real-world-examples/state-management`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决复杂应用状态的一致性与可预测性问题。涵盖单向数据流、不可变更新和状态持久化策略。

### 1.2 形式化基础

状态机可形式化为五元组 `M = (S, Sigma, delta, s0, F)`，其中状态转移函数 `delta: S x Sigma -> S` 保证给定相同输入始终产生相同下一状态。Redux  reducer 即为此 `delta` 的纯函数实现。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 不可变更新 | 状态变更始终返回新引用 | immutable-update.ts |
| 选择器 | 从全局状态派生局部视图的函数 | selectors.ts |

---

## 二、设计原理

### 2.1 为什么存在

UI 是状态的函数。当状态分散在多个组件中时，数据流变得不可预测。集中式状态管理通过单向数据流提升可预测性和可调试性。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 集中式 | 可预测、易调试 | 规模大了冗长 | 中大型应用 |
| 组件本地 | 简单直接 | 跨组件通信困难 | 局部 UI 状态 |

### 2.3 与相关技术的对比

| 维度 | Redux (RTK) | Zustand | Jotai | MobX | React Context |
|------|-------------|---------|-------|------|---------------|
| 范式 | 显式不可变 | 显式不可变 | 原子化 | 响应式/可变 | 依赖注入 |
| 样板代码 | 中（RTK 减少） | 极少 | 极少 | 少 | 少 |
| 选择器优化 | Reselect / RTK | 原生支持 | atom 衍生 | 自动追踪 | 手动 memo |
| 中间件生态 | 丰富 | 有限 | 有限 | 中等 | 无 |
| DevTools | 优秀 | 支持 | 支持 | 支持 | 无 |
| 学习曲线 | 中 | 低 | 低 | 中 | 低 |
| 适用规模 | 大型 | 中小型 | 中小型 | 中大型 | 小型 |

与 props drilling 对比：全局状态简化深层传递，但增加了全局依赖。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 状态管理 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 可运行示例：轻量级不可变 Store + 记忆化选择器

```typescript
// store.ts — 零依赖不可变状态管理，可运行 (Node.js / 浏览器)

type Listener<S> = (state: S, prev: S) => void;

interface Store<S> {
  getState(): S;
  setState(updater: (s: S) => S): void;
  subscribe(listener: Listener<S>): () => void;
}

function createStore<S>(initial: S): Store<S> {
  let state = initial;
  const listeners = new Set<Listener<S>>();

  return {
    getState: () => state,
    setState(updater) {
      const prev = state;
      state = updater(state);
      if (state !== prev) {
        listeners.forEach((l) => l(state, prev));
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// 记忆化选择器工厂（结构共享）
function createSelector<State, Result>(
  selector: (s: State) => Result,
  isEqual: (a: Result, b: Result) => boolean = Object.is
) {
  let lastState: State | undefined;
  let lastResult: Result | undefined;
  return (s: State): Result => {
    if (lastState !== s) {
      const next = selector(s);
      if (!lastResult || !isEqual(lastResult, next)) {
        lastResult = next;
      }
      lastState = s;
    }
    return lastResult!;
  };
}

// ===== 演示 =====
interface Todo {
  id: number;
  text: string;
  done: boolean;
}
interface AppState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

const store = createStore<AppState>({
  todos: [
    { id: 1, text: 'Learn TS', done: true },
    { id: 2, text: 'Build store', done: false },
  ],
  filter: 'all',
});

const selectVisibleTodos = createSelector((s: AppState) =>
  s.filter === 'all'
    ? s.todos
    : s.todos.filter((t) => (s.filter === 'active' ? !t.done : t.done))
);

const selectStats = createSelector((s: AppState) => ({
  total: s.todos.length,
  completed: s.todos.filter((t) => t.done).length,
}));

store.subscribe((state) => {
  console.log('Visible:', selectVisibleTodos(state).map((t) => t.text));
  console.log('Stats:', selectStats(state));
});

store.setState((s) => ({
  ...s,
  todos: s.todos.map((t) => (t.id === 2 ? { ...t, done: true } : t)),
}));
```

#### 示例：Zustand 风格的极简原子化 Store

```typescript
// zustand-like-store.ts — 原子化、无样板的状态切片

type SetState<T> = (partial: Partial<T> | ((s: T) => Partial<T>)) => void;

function createZustandLikeStore<T extends object>(initial: T) {
  let state = { ...initial };
  const listeners = new Set<(s: T, prev: T) => void>();

  const setState: SetState<T> = (partial) => {
    const prev = state;
    const patch = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...patch };
    if (state !== prev) listeners.forEach((l) => l(state, prev));
  };

  const getState = () => state;
  const subscribe = (l: (s: T, prev: T) => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };

  return { getState, setState, subscribe };
}

// 使用示例：切片化状态管理
const useUserStore = createZustandLikeStore({ name: 'Alice', age: 30 });
const useCounterStore = createZustandLikeStore({ count: 0 });

useUserStore.subscribe((s) => console.log('User:', s.name));
useCounterStore.subscribe((s) => console.log('Counter:', s.count));

useUserStore.setState({ age: 31 }); // 仅触发 user store 监听器
useCounterStore.setState((s) => ({ count: s.count + 1 }));
```

#### 示例：Redux 中间件模式 — 日志中间件

```typescript
// middleware.ts — 可组合的 Redux 风格中间件

type Action = { type: string; payload?: unknown };
type Reducer<S> = (s: S, a: Action) => S;
type Middleware<S> = (store: { getState: () => S; dispatch: (a: Action) => void }) => (next: (a: Action) => void) => (a: Action) => void;

function applyMiddleware<S>(store: { getState: () => S; dispatch: (a: Action) => void }, reducer: Reducer<S>, ...middlewares: Middleware<S>[]) {
  let state = store.getState();
  const dispatch = (action: Action) => {
    state = reducer(state, action);
    (store.dispatch as (a: Action) => void)(action);
  };

  const chain = middlewares.map((mw) => mw({ getState: () => state, dispatch }));
  const composed = chain.reduceRight((next, mw) => mw(next), dispatch);

  return {
    dispatch: composed,
    getState: () => state,
  };
}

// 日志中间件
const loggerMiddleware: Middleware<unknown> = (store) => (next) => (action) => {
  console.log('[Dispatch]', action.type, action.payload);
  next(action);
  console.log('[Next State]', store.getState());
};

// 异步中间件（简化版 redux-thunk）
const thunkMiddleware: Middleware<unknown> = (store) => (next) => (action: unknown) => {
  if (typeof action === 'function') {
    return (action as (dispatch: (a: Action) => void, getState: () => unknown) => void)(next, store.getState);
  }
  return next(action as Action);
};
```

### 3.2 更多代码示例

#### Immer 集成：可变语法实现不可变更新

```typescript
import { produce } from 'immer';

interface State {
  user: { name: string; preferences: { theme: 'light' | 'dark' } };
  posts: Array<{ id: number; title: string; likes: number }>;
}

const initialState: State = {
  user: { name: 'Alice', preferences: { theme: 'light' } },
  posts: [{ id: 1, title: 'Hello', likes: 0 }],
};

// 使用 Immer 进行深层不可变更新
const nextState = produce(initialState, (draft) => {
  draft.user.preferences.theme = 'dark'; // 可变语法！
  draft.posts[0].likes += 1;
});

console.log(initialState.posts[0].likes); // 0（原状态未变）
console.log(nextState.posts[0].likes);    // 1
```

#### Redux Toolkit 风格 Slice

```typescript
// slice-pattern.ts — 自包含的状态切片
interface Slice<State, CaseReducers extends Record<string, (s: State, action: any) => State | void>> {
  name: string;
  initialState: State;
  reducers: CaseReducers;
}

function createSlice<State, CR extends Record<string, (s: State, action: any) => State | void>>(
  config: Slice<State, CR>
) {
  const actions = {} as { [K in keyof CR]: (payload?: any) => { type: string; payload: any } };
  for (const key of Object.keys(config.reducers)) {
    (actions as any)[key] = (payload?: any) => ({ type: `${config.name}/${key}`, payload });
  }

  function reducer(state = config.initialState, action: { type: string; payload?: any }): State {
    const caseReducer = config.reducers[action.type.split('/')[1] as keyof CR];
    if (caseReducer) {
      const next = caseReducer(state, action);
      return next === undefined ? state : (next as State);
    }
    return state;
  }

  return { actions, reducer };
}

// 使用
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (s) => { s.value += 1; }, // 可与 Immer 结合
    decrement: (s) => { s.value -= 1; },
    add: (s, action) => { s.value += action.payload; },
  },
});

console.log(counterSlice.actions.add(5)); // { type: 'counter/add', payload: 5 }
```

#### 持久化中间件

```typescript
// persist-middleware.ts — 自动持久化到 localStorage
function persistMiddleware<S>(key: string) {
  return (store: Store<S>) => {
    // 恢复状态
    try {
      const saved = localStorage.getItem(key);
      if (saved) store.setState(() => JSON.parse(saved));
    } catch { /* ignore */ }

    // 订阅保存
    store.subscribe((state) => {
      localStorage.setItem(key, JSON.stringify(state));
    });
  };
}

// 使用
const appStore = createStore({ user: null as any, theme: 'light' });
persistMiddleware<typeof appStore.getState>('app-state')(appStore);
```

#### Undo/Redo 高阶 Store

```typescript
// undoable.ts — 给任意 Store 添加撤销/重做能力
interface UndoableState<T> {
  past: T[];
  present: T;
  future: T[];
}

function createUndoableStore<T>(initial: T) {
  const store = createStore<UndoableState<T>>({
    past: [],
    present: initial,
    future: [],
  });

  return {
    ...store,
    getPresent: () => store.getState().present,
    setPresent(updater: (t: T) => T) {
      const state = store.getState();
      const next = updater(state.present);
      if (next !== state.present) {
        store.setState(() => ({
          past: [...state.past, state.present],
          present: next,
          future: [],
        }));
      }
    },
    undo() {
      const state = store.getState();
      if (state.past.length === 0) return;
      const previous = state.past[state.past.length - 1];
      store.setState(() => ({
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      }));
    },
    redo() {
      const state = store.getState();
      if (state.future.length === 0) return;
      const next = state.future[0];
      store.setState(() => ({
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      }));
    },
  };
}
```

#### Signals 响应式模式

```typescript
// signals.ts — 极简响应式信号实现
class Signal<T> {
  private value: T;
  private listeners = new Set<(v: T) => void>();

  constructor(initial: T) { this.value = initial; }

  get() { return this.value; }

  set(v: T) {
    if (this.value !== v) {
      this.value = v;
      this.listeners.forEach((l) => l(v));
    }
  }

  subscribe(listener: (v: T) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 派生信号
  derived<R>(fn: (v: T) => R): Signal<R> {
    const derived = new Signal(fn(this.value));
    this.subscribe((v) => derived.set(fn(v)));
    return derived;
  }
}

// 使用
const count = new Signal(0);
const doubled = count.derived((c) => c * 2);

doubled.subscribe((d) => console.log('Doubled:', d));
count.set(5); // Doubled: 10
count.set(10); // Doubled: 20
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 所有状态都应全局管理 | 过度全局化导致组件难以复用和测试 |
| 直接修改状态更方便 | 直接修改破坏可预测性和时间旅行调试 |

### 3.3 扩展阅读

- [Redux 文档](https://redux.js.org/)
- [Redux Toolkit 文档](https://redux-toolkit.js.org/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Jotai 文档](https://jotai.org/)
- [TC39 Signals Proposal](https://github.com/tc39/proposal-signals)
- [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [React — Thinking in React (State 管理哲学)](https://react.dev/learn/thinking-in-react)
- [MobX 官方文档](https://mobx.js.org/README.html)
- [Reselect 文档](https://reselect.js.org/)
- [Flux Architecture (Facebook)](https://facebook.github.io/flux/)
- [State Machines in JavaScript — XState 文档](https://stately.ai/docs)
- [Immer 文档](https://immerjs.github.io/immer/) — 不可变数据工具库
- [Pinia 文档](https://pinia.vuejs.org/) — Vue 官方状态管理
- [Recoil 文档](https://recoiljs.org/) — React 原子化状态管理
- [TanStack Store](https://tanstack.com/store/latest) — 框架无关状态管理
- [Effector 文档](https://effector.dev/) — 响应式状态管理
- [MDN: Structured Clone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) — 深拷贝原生 API

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
