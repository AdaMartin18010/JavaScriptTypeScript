# 数据流与认知轨迹

> **核心命题**：数据流架构不仅是技术选择，它塑造了开发者的心智模型。Redux、MobX、Zustand、Signals 四种模式对应四种不同的认知策略，理解这些策略可以帮助我们选择适合团队心智模型的状态管理方案。

---

## 目录

1. [历史脉络：从 MVC 到 Signals](#1-历史脉络从-mvc-到-signals)
2. [Redux：命令日志与时间旅行的认知模型](#2-redux命令日志与时间旅行的认知模型)
3. [MobX：透明响应式的代理魔法](#3-mobx透明响应式的代理魔法)
4. [Zustand：最小主义的状态容器](#4-zustand最小主义的状态容器)
5. [Signals：细粒度响应式的回归](#5-signals细粒度响应式的回归)
6. [Flux 架构的认知负荷分析](#6-flux-架构的认知负荷分析)
7. [单向 vs 双向绑定的对称差](#7-单向-vs-双向绑定的对称差)
8. [数据流图的心智模型](#8-数据流图的心智模型)
9. [状态管理的认知经济学](#9-状态管理的认知经济学)
10. [精确直觉类比与边界](#10-精确直觉类比与边界)
11. [反例与局限性](#11-反例与局限性)

---

## 1. 历史脉络：从 MVC 到 Signals

前端状态管理的演化，是"心智模型简化"的持续过程。

```
1979: MVC（Smalltalk）
  → Model-View-Controller 分离
  → 双向数据流（View ↔ Controller ↔ Model）

2004: AJAX + jQuery
  → 手动 DOM 操作
  → 无明确状态管理

2010: Backbone.js
  → Model + View + Router
  → 事件驱动的状态变化

2013: React + Flux
  → 单向数据流
  → Action → Dispatcher → Store → View

2015: Redux
  → Flux 的简化版
  → 单一状态树 + 纯函数 reducer

2016: MobX
  → 透明响应式编程
  → 自动追踪依赖

2018: Zustand
  → 极简状态管理
  → 无样板代码

2021: Signals（Solid/Vue/Preact）
  → 细粒度响应式
  → 编译时/运行时依赖追踪
```

**核心洞察**：状态管理框架的演化方向是"用更少的认知成本表达相同的状态逻辑"。

---

## 2. Redux：命令日志与时间旅行的认知模型

### 2.1 Redux 的核心计算模型

Redux 将应用状态建模为一个**命令日志**（Command Log）。

```
Redux 计算模型：

State(t+1) = Reducer(State(t), Action(t))

其中：
  State = 不可变的全局状态树
  Action = 描述"发生了什么"的纯对象
  Reducer = (State, Action) → State 的纯函数

时间旅行 = 重新执行 Action 序列
  State(t) = foldl(reducer, initialState, actions[0..t])
```

**TypeScript 形式化**：

```typescript
// Redux 的核心类型
type State = unknown;
type Action = { type: string; payload?: unknown };
type Reducer<S> = (state: S | undefined, action: Action) => S;
type Store<S> = {
  getState(): S;
  dispatch(action: Action): void;
  subscribe(listener: () => void): () => void;
};

// 创建 store = 创建一个状态机
function createStore<S>(
  reducer: Reducer<S>,
  initialState?: S
): Store<S> {
  let state = initialState;
  const listeners = new Set<() => void>();
  
  return {
    getState: () => state!,
    dispatch: (action) => {
      state = reducer(state, action);
      listeners.forEach(l => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
```

### 2.2 Redux 的认知负荷分析

Redux 要求开发者在脑中维护一个**全局状态转换模型**。

```
认知负荷来源：

1. 全局状态树（高）
   → 需要理解整个应用的状态结构
   → 每个 reducer 都可能影响全局状态

2. Action 的命名空间（中）
   → 需要记住所有 Action 类型
   → 避免命名冲突

3. 中间件链（高）
   → redux-thunk, redux-saga, redux-observable
   → 每个中间件增加一层间接性

4. 选择器（中）
   → 从全局状态中提取局部数据
   → 需要理解状态树的结构
```

**正例：Redux 的时间旅行调试**

```typescript
// Redux 的杀手级特性：时间旅行
// 因为 State(t) = fold(reducer, initialState, actions[0..t])
// 所以可以通过"重放" Action 序列回到任意历史状态

// 调试器实现：
class TimeTravelDebugger {
  private actions: Action[] = [];
  private currentIndex = 0;
  
  dispatch(action: Action) {
    this.actions.push(action);
    this.currentIndex++;
  }
  
  jumpTo(index: number) {
    // 重新计算到指定索引的状态
    let state = initialState;
    for (let i = 0; i <= index; i++) {
      state = reducer(state, this.actions[i]);
    }
    return state;
  }
}
```

**反例：Redux 的样板代码**

```typescript
// Redux 的"样板代码"问题：

// 1. 定义 Action 类型
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

// 2. 定义 Action Creator
const increment = () => ({ type: INCREMENT });
const decrement = () => ({ type: DECREMENT });

// 3. 定义 Reducer
function counter(state = 0, action: Action) {
  switch (action.type) {
    case INCREMENT: return state + 1;
    case DECREMENT: return state - 1;
    default: return state;
  }
}

// 4. 连接组件
// ... mapStateToProps, mapDispatchToProps

// 一个简单的计数器需要 20+ 行代码！
// 认知负荷：开发者需要追踪 4 个相关但分离的概念
```

---

## 3. MobX：透明响应式的代理魔法

### 3.1 MobX 的计算模型

MobX 使用**透明响应式编程**（Transparent Reactive Programming）——开发者不需要显式声明依赖，系统自动追踪。

```
MobX 核心概念：

observable(state) = 响应式数据源
  当 state 变化时，自动通知所有"观察者"

computed(fn) = 派生值
  自动追踪 fn 中访问的 observable
  当依赖变化时，自动重新计算

autorun(fn) = 副作用
  自动追踪 fn 中访问的 observable
  当依赖变化时，自动重新执行

action(fn) = 状态变更的边界
  在 action 内可以修改多个 observable
  action 结束后，统一触发更新
```

**TypeScript 形式化**：

```typescript
// MobX 的简化模型
interface Observable<T> {
  value: T;
  subscribers: Set<Effect>;
}

interface Effect {
  execute(): void;
  deps: Set<Observable<unknown>>;
}

function observable<T>(value: T): Observable<T> {
  return {
    value,
    subscribers: new Set(),
  };
}

function autorun(fn: () => void): void {
  const effect: Effect = {
    execute: fn,
    deps: new Set(),
  };
  
  // 执行时自动追踪依赖
  activeEffect = effect;
  fn();
  activeEffect = null;
}

let activeEffect: Effect | null = null;

function track<T>(obs: Observable<T>): T {
  if (activeEffect) {
    obs.subscribers.add(activeEffect);
    activeEffect.deps.add(obs as Observable<unknown>);
  }
  return obs.value;
}
```

### 3.2 MobX 的认知模型：Excel 表格

MobX 的心智模型最接近 **Excel 电子表格**。

```
Excel          MobX
─────────────────────────────
单元格         observable
公式           computed
图表更新       autorun/reaction
手动输入       action

A1 = 10        const a = observable(10)
B1 = A1 * 2    const b = computed(() => a.get() * 2)
图表引用 B1    autorun(() => console.log(b.get()))
```

**认知优势**：

```
Excel 是全球数十亿人熟悉的工具。
MobX 的心智模型与 Excel 同构：
- 单元格自动更新 → observable 自动通知
- 公式自动重算 → computed 自动重新计算
- 图表自动刷新 → UI 自动更新

这意味着：任何会用 Excel 的人，
都可以在 5 分钟内理解 MobX 的核心概念。
```

**反例：MobX 的"魔法"问题**

```typescript
// MobX 的自动追踪是"隐式"的

class Store {
  @observable count = 0;
  
  @computed get doubled() {
    return this.count * 2;
  }
}

// 问题 1：如果不小心在 computed 中调用非 observable
// MobX 不会追踪它——bug！

// 问题 2：条件依赖
@computed get conditional() {
  if (this.flag) {
    return this.a;  // 依赖 a
  } else {
    return this.b;  // 依赖 b
  }
}
// 当 flag 从 true 变为 false 时，
// MobX 需要动态更新依赖集合

// 问题 3：异步代码
@action async fetchData() {
  const data = await api.fetch();
  this.data = data;  // 在 await 之后，不在 action 内！
}
```

---

## 4. Zustand：最小主义的状态容器

### 4.1 Zustand 的计算模型

Zustand 是一个极简的状态管理库，核心代码不到 100 行。

```
Zustand 计算模型：

Store = 函数式闭包
  create(set, get) => state

更新 = 直接调用 set
  set(newState) 或 set(state => newState)

订阅 = 选择器函数
  useStore(selector) => 只订阅 selector 依赖的部分
```

**TypeScript 实现**：

```typescript
// Zustand 的核心实现（简化版）
type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
type GetState<T> = () => T;
type Subscribe<T> = (callback: (state: T) => void) => () => void;

interface StoreApi<T> {
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: Subscribe<T>;
}

function createStore<T>(createState: (set: SetState<T>, get: GetState<T>) => T): StoreApi<T> {
  let state: T;
  const listeners = new Set<(state: T) => void>();
  
  const setState: SetState<T> = (partial) => {
    const nextState = typeof partial === 'function' 
      ? { ...state, ...(partial as Function)(state) }
      : { ...state, ...partial };
    state = nextState as T;
    listeners.forEach(listener => listener(state));
  };
  
  const getState: GetState<T> = () => state;
  
  const subscribe: Subscribe<T> = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  };
  
  state = createState(setState, getState);
  
  return { setState, getState, subscribe };
}
```

### 4.2 Zustand 的认知经济学

Zustand 的设计哲学是**最小认知成本**。

```
Redux: 4 个概念（Action, Reducer, Store, Middleware）
MobX: 4 个概念（observable, computed, autorun, action）
Zustand: 2 个概念（create, set）

Zustand 的认知负荷 = Redux 的 50% = MobX 的 50%

但表达能力：
  Zustand ≈ Redux（都可以管理全局状态）
  Zustand < MobX（缺少自动依赖追踪）
```

**正例：Zustand 的简洁性**

```typescript
// 创建 store
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// 在组件中使用
function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}

// 对比 Redux：
// - 不需要 Action 类型
// - 不需要 Reducer
// - 不需要 mapStateToProps
// - 不需要 Provider

// 认知负荷：Zustand < Redux（约 1/4）
```

---

## 5. Signals：细粒度响应式的回归

### 5.1 Signals 的计算模型

Signals 是前端响应式的"原语"——最小、最细粒度的响应式单元。

```
Signal<T> = (getter, setter)

getter() = 读取当前值（建立依赖关系）
setter(v) = 设置新值（触发更新）

effect(fn) = 副作用（自动追踪 fn 中的 signal 访问）
computed(fn) = 派生 signal（缓存计算结果）

核心特性：
- 同步更新（没有异步批处理）
- 细粒度（只更新真正依赖的 DOM 节点）
- 无虚拟 DOM（直接更新真实 DOM）
```

**TypeScript 实现**：

```typescript
// Signal 的最小实现
function createSignal<T>(value: T): [() => T, (v: T) => void] {
  const subscribers = new Set<() => void>();
  
  const read = () => {
    const currentEffect = getCurrentEffect();
    if (currentEffect) subscribers.add(currentEffect);
    return value;
  };
  
  const write = (newValue: T) => {
    value = newValue;
    subscribers.forEach(effect => effect());
  };
  
  return [read, write];
}

let currentEffect: (() => void) | null = null;

function getCurrentEffect(): (() => void) | null {
  return currentEffect;
}

function createEffect(fn: () => void): void {
  const execute = () => {
    currentEffect = execute;
    fn();
    currentEffect = null;
  };
  execute();
}

function createMemo<T>(fn: () => T): () => T {
  const [value, setValue] = createSignal<T>(null as T);
  createEffect(() => setValue(fn()));
  return value;
}
```

### 5.2 Signals 与历史模式的关系

```
Signals 不是新发明——它是响应式的"原点"。

历史脉络：
1970s: Spreadsheet（VisiCalc）
  → 单元格 = 最早的 signal

1990s: Excel
  → 公式 = computed signal

2000s: Knockout.js
  → observable = signal

2010s: MobX
  → 透明响应式 = 自动追踪的 signal

2020s: Solid/Vue Signals
  → 回归显式 signal
  → 但更好的性能（编译时优化）
```

**对称差分析：Signals vs 其他模式**

```
Signals \\ Redux = {
  "细粒度更新",
  "无样板代码",
  "直接 DOM 更新"
}

Redux \\ Signals = {
  "时间旅行调试",
  "显式的状态变化日志",
  "中间件生态"
}

Signals \\ MobX = {
  "显式依赖（无魔法）",
  "更小的运行时",
  "更好的可预测性"
}

MobX \\ Signals = {
  "自动依赖追踪",
  "类语法支持",
  "更成熟的生态"
}
```

---

## 6. Flux 架构的认知负荷分析

### 6.1 Flux 的单向数据流

Flux 架构的核心是**单向数据流**——数据只能沿一个方向流动。

```
Flux 数据流：

Action → Dispatcher → Store → View
   ↑                       |
   └────── 用户交互 ────────┘

Action = { type, payload }
  → 描述"发生了什么"

Dispatcher = 中央路由器
  → 将 Action 分发到所有 Store

Store = 状态 + 逻辑
  → 根据 Action 更新状态
  → 通知 View 更新

View = React 组件
  → 监听 Store 变化
  → 重新渲染
```

### 6.2 单向数据流的认知优势

```
单向数据流 vs 双向绑定：

双向绑定（如 AngularJS）：
  View ↔ Model
  → 数据可以在任意方向流动
  → 变化来源难以追踪
  → "是谁修改了这个状态？"

单向数据流（Flux/Redux）：
  Action → Store → View
  → 数据只能沿一个方向流动
  → 变化来源明确
  → "这个 Action 导致了状态变化"

认知科学解释：
  单向数据流减少了"因果推理"的认知负荷。
  人类大脑擅长追踪"A 导致 B"的线性因果链，
  不擅长处理"A 和 B 相互影响"的循环因果。
```

---

## 7. 单向 vs 双向绑定的对称差

### 7.1 形式化对比

```
单向绑定：
  View = f(Model)
  Model 变化 → View 自动更新
  View 不直接修改 Model

双向绑定：
  View = f(Model)
  Model = g(View)
  View 和 Model 相互同步

范畴论视角：
  单向绑定 = 态射（有方向）
  双向绑定 = 同构（双向映射）
  
  单向绑定更简单，因为只有一个方向需要理解。
  双向绑定更强大，但需要处理循环更新问题。
```

### 7.2 工程选择

| 场景 | 推荐 | 理由 |
|------|------|------|
| 表单输入 | 双向绑定 | 输入框 ↔ 状态自然同步 |
| 复杂应用状态 | 单向绑定 | 变化来源可追踪 |
| 实时协作 | CRDT/单向 | 冲突解决明确 |
| 简单计数器 | 都可以 | 复杂度低 |

---

## 8. 数据流图的心智模型

### 8.1 数据流作为有向图

```
数据流可以表示为有向图：

节点 = 状态（state）或派生值（derived）
边 = 依赖关系（"A 依赖 B"）

数据流图示例：

  userId ──→ fetchUser ──→ user
                              │
                              ↓
  posts ──→ filterPosts ──→ filteredPosts
                              │
                              ↓
                           renderPosts

当 userId 变化时：
  fetchUser 重新执行 → user 更新 → renderPosts 更新
  
当 posts 变化时：
  filterPosts 重新执行 → filteredPosts 更新 → renderPosts 更新

当 userId 和 posts 同时变化时：
  两个分支并行更新，最终汇聚到 renderPosts
```

### 8.2 数据流图的认知优势

```
人类大脑擅长处理"图"结构：

- 节点 = 概念（容易记忆）
- 边 = 关系（容易理解）
- 路径 = 因果链（容易追踪）

因此，数据流图是一种"认知友好"的状态表示。

对比：
  Redux 的 Action/Reducer = 隐式的数据流图
    → 需要开发者自己"画"出图
    
  Vue/MobX 的响应式 = 自动构建的数据流图
    → 系统帮你"画"图
    → 但图是隐式的——看不到
```

---

## 9. 状态管理的认知经济学

### 9.1 认知成本公式

```
状态管理的总认知成本 = 
  学习成本（掌握框架概念）
  + 阅读成本（理解他人代码）
  + 调试成本（定位状态问题）
  + 维护成本（修改状态逻辑）

不同框架的认知成本：

Redux:
  学习成本：高（4+ 个核心概念）
  阅读成本：中（样板代码多，但模式固定）
  调试成本：低（时间旅行、明确的数据流）
  维护成本：中（reducer 逻辑集中）

MobX:
  学习成本：中（概念少，但"魔法"需要理解）
  阅读成本：低（代码接近自然语言）
  调试成本：中（依赖追踪隐式）
  维护成本：低（自动处理依赖）

Zustand:
  学习成本：低（2 个概念）
  阅读成本：低（极简 API）
  调试成本：中（缺少时间旅行）
  维护成本：低（代码量少）

Signals:
  学习成本：低（1 个核心概念）
  阅读成本：低（显式依赖）
  调试成本：低（同步更新，可预测）
  维护成本：低（细粒度，影响范围小）
```

### 9.2 团队规模与状态管理选型

```
小型团队（1-3 人）：
  → Zustand / Signals
  → 认知成本低，开发速度快

中型团队（4-10 人）：
  → MobX / Zustand
  → 平衡开发速度和可维护性

大型团队（10+ 人）：
  → Redux / Signals（规范化）
  → 明确的数据流，便于协作

超大型团队（50+ 人）：
  → Redux + 强规范
  → 时间旅行调试、状态回放对于大规模系统至关重要
```

---

## 10. 精确直觉类比与边界

### 10.1 状态管理像家庭财务管理

| 概念 | 家庭财务 | 状态管理 |
|------|---------|---------|
| 全局状态 | 家庭总账本 | Redux Store |
| 个人账户 | 每个人的钱包 | Zustand 的独立 Store |
| 记账 | 每次消费记录 | Action |
| 自动转账 | 银行自动扣款 | MobX 自动追踪 |
| 预算 | 月度预算表 | computed |
| 审计 | 年底查账 | 时间旅行调试 |

**哪里像**：
- ✅ 像财务管理一样，状态管理需要"记账"（记录变化）
- ✅ 像财务管理一样，"自动"机制减少认知负担

**哪里不像**：
- ❌ 不像财务管理，软件状态可以"回滚"到任意历史点
- ❌ 不像财务管理，软件状态可以"复制"（无副作用）

### 10.2 数据流像水管系统

| 概念 | 水管 | 数据流 |
|------|------|--------|
| 状态 | 水箱 | Store |
| 数据流 | 水管 | 连接/订阅 |
| 单向阀 | 止回阀 | 单向数据流 |
| 水泵 | 加压泵 | Action/Dispatch |
| 水龙头 | 出水口 | View |
| 水表 | 流量计 | 调试工具 |

**哪里像**：
- ✅ 像水管一样，数据流有明确的方向
- ✅ 像水管一样，"漏水"（状态不一致）需要修复

**哪里不像**：
- ❌ 不像水管，数据可以"分叉"（一个状态多个订阅者）
- ❌ 不像水管，数据可以"时间旅行"（回放历史）

---

## 11. 反例与局限性

### 11.1 没有"最好"的状态管理方案

```
从范畴论的角度：

不同的状态管理方案 = 不同的范畴
不同的范畴 = 不同的表达能力 + 不同的约束

Redux 的范畴：
  对象 = 状态快照
  态射 = Action（状态转换）
  
MobX 的范畴：
  对象 = 响应式对象
  态射 = 自动追踪的依赖关系

Zustand 的范畴：
  对象 = 函数式闭包
  态射 = 函数调用

不存在"万能范畴"。
选择状态管理方案 = 选择适合你问题的范畴。
```

### 11.2 过度工程化的陷阱

```
反例：为简单计数器使用 Redux

const store = createStore(
  (state = 0, action) => {
    switch (action.type) {
      case 'INCREMENT': return state + 1;
      default: return state;
    }
  }
);

// 为了一个计数器，引入了：
// - Action 类型
// - Reducer
// - Store
// - Provider
// - connect/useSelector

// 认知成本 >> 问题复杂度
// 这是典型的"过度工程化"

建议：
  问题复杂度 < 100 行代码 → useState
  问题复杂度 100-1000 行 → Zustand/Signals
  问题复杂度 > 1000 行 → Redux/MobX
```

### 11.3 状态管理的未来趋势

```
趋势 1：Signals 标准化
  → TC39 正在讨论 Signals 提案
  → 未来可能成为 JavaScript 原生特性

趋势 2：编译时优化
  → Svelte/Vue/Solid 在编译时分析依赖
  → 运行时开销趋近于零

趋势 3：服务器状态管理
  → React Query/SWR/TanStack Query
  → 区分"客户端状态"和"服务器状态"

趋势 4：并发状态管理
  → React Concurrent Features
  → useTransition, useDeferredValue
  → 状态更新可以有优先级
```

---

## 参考文献

1. Facebook. "Flux Architecture." facebook.github.io/flux.
2. Redux Team. "Redux Documentation." redux.js.org.
3. MobX Team. "MobX Documentation." mobx.js.org.
4. Zustand Team. "Zustand Documentation." github.com/pmndrs/zustand.
5. SolidJS Team. "Solid.js Documentation." solidjs.com.
6. Vue Team. "Vue Reactivity Documentation." vuejs.org.
7. Preact Team. "Signals." preactjs.com/guide/v10/signals.
8. Reactive Streams. "Reactive Streams Specification." reactive-streams.org.
9. Meijer, E. (2012). "Your Mouse is a Database." *Communications of the ACM*, 55(5), 66-73.
10. Czaplicki, E. (2012). "Elm: Concurrent FRP for Functional GUIs." *PhD Thesis*.


### 12. 状态管理模式的认知演化轨迹

开发者对状态管理的心智模型经历了从"命令式"到"声明式"的演化。

**认知演化阶段**：

```
阶段 1：命令式思维（jQuery 时代）
  → "我要修改这个 DOM 元素"
  → 直接操作 DOM
  → 认知负荷：追踪所有 DOM 操作

阶段 2：模板绑定思维（AngularJS 时代）
  → "这个输入框绑定到 user.name"
  → 双向绑定自动同步
  → 认知负荷：理解绑定语法

阶段 3：单向数据流思维（Redux 时代）
  → "发送一个 Action 来修改状态"
  → 数据沿固定方向流动
  → 认知负荷：追踪 Action → Reducer → State 链

阶段 4：响应式思维（MobX/Signals 时代）
  → "声明依赖关系，系统自动更新"
  → 自动追踪依赖
  → 认知负荷：理解响应式图的结构

阶段 5：细粒度思维（Solid/Vue 3 时代）
  → "精确控制每个状态的更新范围"
  → 编译时/运行时优化
  → 认知负荷：理解更新粒度对性能的影响
```

**精确直觉类比：状态管理像交通信号灯系统**

| 模式 | 交通系统 | 特点 |
|------|---------|------|
| jQuery | 无信号灯 | 混乱，容易撞车 |
| AngularJS | 手动信号灯 | 需要人工控制每个路口 |
| Redux | 中央调度系统 | 所有车辆按统一规则行驶 |
| MobX | 智能交通系统 | 自动调节，但规则复杂 |
| Zustand | 小型环岛 | 简单，适合小范围 |
| Signals | 自适应信号灯 | 每个路口独立优化 |

**哪里像**：
- ✅ 像交通系统一样，好的状态管理需要"规则"和"协调"
- ✅ 像交通系统一样，"规模"决定了所需的复杂度

**哪里不像**：
- ❌ 不像交通系统，软件状态可以"撤销"和"重放"
- ❌ 不像交通系统，软件状态更新是瞬时的

---

## 参考文献

1. Facebook. "Flux Architecture." facebook.github.io/flux.
2. Redux Team. "Redux Documentation." redux.js.org.
3. MobX Team. "MobX Documentation." mobx.js.org.
4. Zustand Team. "Zustand Documentation." github.com/pmndrs/zustand.
5. SolidJS Team. "Solid.js Documentation." solidjs.com.
6. Vue Team. "Vue Reactivity Documentation." vuejs.org.
7. Preact Team. "Signals." preactjs.com/guide/v10/signals.
8. Reactive Streams. "Reactive Streams Specification." reactive-streams.org.
9. Meijer, E. (2012). "Your Mouse is a Database." *Communications of the ACM*, 55(5), 66-73.
10. Czaplicki, E. (2012). "Elm: Concurrent FRP for Functional GUIs." *PhD Thesis*.
11. Sweller, J. (1988). "Cognitive Load During Problem Solving." *Cognitive Science*, 12(2), 257-285.
12. Kahneman, D. (2011). *Thinking, Fast and Slow*. Farrar, Straus and Giroux.
