---
dimension: 综合
sub-dimension: App architecture
created: 2026-04-28
---

# CATEGORY.md — App Architecture

## 模块归属声明

本模块归属 **「综合」** 维度，聚焦应用架构（App Architecture）核心概念与工程实践。

## 包含内容

- MVC / MVVM / MVP 等经典分层架构
- Flux / Redux 单向数据流与状态管理
- 原子化设计（Atomic Design）与组件体系
- 微前端（Micro-frontends）与模块联邦
- 依赖注入（DI）与数据获取模式
- LLM 驱动架构新兴模式

## 子模块索引

| 子模块 | 核心思想 | 典型实现/库 |
|--------|----------|-------------|
| **mvc** | Model-View-Controller 分层，数据与视图分离 | Backbone.js、Server-side MVC |
| **mvvm** | Model-View-ViewModel，双向数据绑定 | Vue 2/3、Knockout.js |
| **flux** | 单向数据流，集中式状态管理 | Redux、Zustand、Valtio |
| **atomic-design** | 原子化设计系统，从原子到页面逐级组合 | Storybook、Bit.dev |
| **micro-frontends** | 微前端架构，独立部署、技术栈无关 | Module Federation、qiankun、single-spa |

## 代码示例

### Flux 单向数据流（手写 Redux）

```typescript
// mini-redux.ts — 理解 Redux 核心原理
interface Action<T = any> {
  type: string;
  payload?: T;
}

type Reducer<S> = (state: S | undefined, action: Action) => S;
type Listener = () => void;

function createStore<S>(reducer: Reducer<S>, initialState?: S) {
  let state = initialState;
  const listeners = new Set<Listener>();

  function getState(): S | undefined {
    return state;
  }

  function dispatch(action: Action): Action {
    state = reducer(state, action);
    listeners.forEach((l) => l());
    return action;
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  // 初始化状态
  dispatch({ type: '@@INIT' });

  return { getState, dispatch, subscribe };
}

// 使用示例
interface CounterState {
  count: number;
}

const counterReducer: Reducer<CounterState> = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
};

const store = createStore(counterReducer);
store.subscribe(() => console.log(store.getState()));
store.dispatch({ type: 'INCREMENT' }); // { count: 1 }
store.dispatch({ type: 'INCREMENT' }); // { count: 2 }
```

### 依赖注入容器

```typescript
// di-container.ts — 手动实现轻量级 DI
interface Constructor<T> {
  new (...args: any[]): T;
}

class DIContainer {
  private registry = new Map<symbol | string, { factory: () => any; singleton: boolean; instance?: any }>();

  register<T>(token: symbol | string, factory: () => T, singleton = false) {
    this.registry.set(token, { factory, singleton });
    return this;
  }

  resolve<T>(token: symbol | string): T {
    const entry = this.registry.get(token);
    if (!entry) throw new Error(`No provider for ${String(token)}`);

    if (entry.singleton) {
      if (!entry.instance) entry.instance = entry.factory();
      return entry.instance;
    }
    return entry.factory();
  }
}

// 令牌定义
const TOKENS = {
  Logger: Symbol('Logger'),
  Database: Symbol('Database'),
  UserService: Symbol('UserService'),
};

// 使用
const container = new DIContainer();
container.register(TOKENS.Logger, () => console, true);
container.register(TOKENS.Database, () => new Map(), true);
container.register(TOKENS.UserService, () => ({
  findById: (id: string) => ({ id, name: 'Alice' }),
}), false);

const db = container.resolve(TOKENS.Database);
```

### 微前端加载器（动态 import + Web Component）

```typescript
// micro-frontend-loader.ts — 基础微前端运行时
interface MicroApp {
  name: string;
  entry: string; // 远程入口 URL
  container: HTMLElement;
}

class MicroFrontendLoader {
  private loaded = new Set<string>();

  async load(app: MicroApp): Promise<void> {
    if (this.loaded.has(app.name)) return;

    // 获取远程模块入口
    const entryModule = await import(/* @vite-ignore */ app.entry);

    // 约定：远程模块导出 mount/unmount
    if (typeof entryModule.mount !== 'function') {
      throw new Error(`Micro-app "${app.name}" must export mount()`);
    }

    entryModule.mount(app.container);
    this.loaded.add(app.name);
  }

  async unload(name: string, container: HTMLElement): Promise<void> {
    const entryModule = await import(/* @vite-ignore */ 'URL_FOR_' + name);
    if (typeof entryModule.unmount === 'function') {
      entryModule.unmount(container);
    }
    this.loaded.delete(name);
  }
}

// HTML 中使用
// <div id="app-dashboard"></div>
// const loader = new MicroFrontendLoader();
// loader.load({ name: 'dashboard', entry: '/apps/dashboard/entry.js', container: document.getElementById('app-dashboard')! });
```

### 原子化设计：组件层级

```typescript
// atomic-design.ts — 类型级组件分类
// 层级约束通过类型系统表达

type AtomProps = { className?: string };
type MoleculeProps<T extends Record<string, unknown> = {}> = T & { atoms: React.ReactNode[] };
type OrganismProps<T extends Record<string, unknown> = {}> = T & { molecules: React.ReactNode[] };

// 原子：不可再分的最小 UI 单元
const Button = ({ className, children }: AtomProps & { children: React.ReactNode }) => (
  <button className={className}>{children}</button>
);

// 分子：由原子组合而成
const SearchField = ({ atoms }: MoleculeProps<{ placeholder?: string }>) => (
  <div className="search-field">{atoms}</div>
);

// 有机体：由分子组合而成
const Header = ({ molecules }: OrganismProps<{ title?: string }>) => (
  <header>{molecules}</header>
);
```

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| Redux 官方文档 | 文档 | [redux.js.org](https://redux.js.org/) |
| Zustand GitHub | 仓库 | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand) |
| Micro-frontends 架构指南 | 文章 | [martinfowler.com/articles/micro-frontends.html](https://martinfowler.com/articles/micro-frontends.html) |
| Module Federation 文档 | 文档 | [module-federation.io](https://module-federation.io/) |
| qiankun 微前端框架 | 文档 | [qiankun.umijs.org](https://qiankun.umijs.org/) |
| Atomic Design by Brad Frost | 书籍 | [atomicdesign.bradfrost.com](https://atomicdesign.bradfrost.com/) |
| single-spa 文档 | 文档 | [single-spa.js.org](https://single-spa.js.org/) |
| React — Thinking in React | 指南 | [react.dev/learn/thinking-in-react](https://react.dev/learn/thinking-in-react) |
| Vue.js — Composition API | 文档 | [vuejs.org/guide/extras/composition-api-faq.html](https://vuejs.org/guide/extras/composition-api-faq.html) |
| Clean Architecture (Uncle Bob) | 文章 | [blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) |

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 data-fetching-patterns.test.ts
- 📄 data-fetching-patterns.ts
- 📄 dependency-injection-models.test.ts
- 📄 dependency-injection-models.ts
- 📄 index.ts
- 📄 llm-driven-architecture.test.ts
- 📄 llm-driven-architecture.ts
- 📄 module-bundling-models.test.ts
- 📄 module-bundling-models.ts
- 📄 mvc-derivatives.test.ts
- 📄 mvc-derivatives.ts
- 📄 routing-navigation-models.test.ts
- ... 等 1 个条目

---

> 此分类文档已根据实际模块内容补充代码示例与权威链接。
