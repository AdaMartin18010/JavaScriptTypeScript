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

### CQRS 与事件溯源骨架

```typescript
// cqrs-event-sourcing.ts — 命令查询职责分离 + 事件溯源

// 领域事件
type DomainEvent =
  | { type: 'OrderCreated'; orderId: string; customerId: string; amount: number }
  | { type: 'OrderPaid'; orderId: string; paidAt: Date }
  | { type: 'OrderShipped'; orderId: string; trackingNumber: string };

// 事件存储（Append-only）
class EventStore {
  private streams = new Map<string, DomainEvent[]>();

  append(streamId: string, events: DomainEvent[], expectedVersion: number): void {
    const current = this.streams.get(streamId) ?? [];
    if (current.length !== expectedVersion) {
      throw new Error('Concurrency conflict: stream version mismatch');
    }
    current.push(...events);
    this.streams.set(streamId, current);
  }

  getStream(streamId: string): DomainEvent[] {
    return [...(this.streams.get(streamId) ?? [])];
  }
}

// 聚合根：Order
class OrderAggregate {
  private events: DomainEvent[] = [];
  private state = { status: 'draft' as string, amount: 0 };

  static create(orderId: string, customerId: string, amount: number): OrderAggregate {
    const order = new OrderAggregate();
    order.apply({ type: 'OrderCreated', orderId, customerId, amount });
    return order;
  }

  pay(): void {
    if (this.state.status !== 'draft') throw new Error('Invalid state transition');
    this.apply({ type: 'OrderPaid', orderId: 'todo', paidAt: new Date() });
  }

  private apply(event: DomainEvent): void {
    this.events.push(event);
    // 状态投影（简化示例）
    if (event.type === 'OrderCreated') this.state.amount = event.amount;
    if (event.type === 'OrderPaid') this.state.status = 'paid';
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.events];
  }
}

// 读取模型投影（Read Model）
class OrderReadModel {
  private projections = new Map<string, { status: string; amount: number }>();

  project(events: DomainEvent[]): void {
    for (const e of events) {
      if (e.type === 'OrderCreated') {
        this.projections.set(e.orderId, { status: 'draft', amount: e.amount });
      }
      if (e.type === 'OrderPaid') {
        const p = this.projections.get(e.orderId);
        if (p) p.status = 'paid';
      }
    }
  }

  get(orderId: string) {
    return this.projections.get(orderId);
  }
}
```

### 清洁架构（Clean Architecture）端口与适配器

```typescript
// clean-architecture.ts — 核心不依赖外层

// 领域层（最内层）
interface User {
  id: string;
  email: string;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// 用例层
class RegisterUserUseCase {
  constructor(private repo: UserRepository) {}

  async execute(email: string): Promise<User> {
    const user: User = { id: crypto.randomUUID(), email };
    await this.repo.save(user);
    return user;
  }
}

// 适配器层（外层）— 可替换为 Prisma / TypeORM / 内存存储
class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
}

// 基础设施层 — HTTP 控制器
class UserController {
  constructor(private useCase: RegisterUserUseCase) {}

  async handle(req: Request): Promise<Response> {
    const { email } = await req.json();
    const user = await this.useCase.execute(email);
    return Response.json(user);
  }
}

// 依赖注入组装（Composition Root）
const repo: UserRepository = new InMemoryUserRepository();
const useCase = new RegisterUserUseCase(repo);
const controller = new UserController(useCase);
```

### 限界上下文映射（DDD Strategic Design）

```typescript
// bounded-contexts.ts — 模块间集成模式

// 共享内核（Shared Kernel）
interface Money {
  amount: number;
  currency: 'USD' | 'EUR' | 'CNY';
}

// 客户上下文
namespace CustomerContext {
  export interface Customer {
    id: string;
    name: string;
    creditLimit: Money;
  }

  export class CustomerService {
    verifyCredit(customerId: string, amount: Money): boolean {
      // 客户上下文内的信用检查逻辑
      return true;
    }
  }
}

// 订单上下文（通过防腐层与客户上下文交互）
namespace OrderContext {
  interface CustomerACL {
    getCreditLimit(customerId: string): Promise<Money>;
  }

  export class OrderService {
    constructor(private customerACL: CustomerACL) {}

    async placeOrder(customerId: string, total: Money): Promise<void> {
      const creditLimit = await this.customerACL.getCreditLimit(customerId);
      if (total.amount > creditLimit.amount) {
        throw new Error('Credit limit exceeded');
      }
      // 创建订单...
    }
  }
}
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
| Domain-Driven Design Reference | 参考 | [domainlanguage.com/ddd/reference](https://domainlanguage.com/ddd/reference/) |
| Microsoft — CQRS Pattern | 文档 | [learn.microsoft.com/azure/architecture/patterns/cqrs](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs) |
| Martin Fowler — Event Sourcing | 文章 | [martinfowler.com/eaaDev/EventSourcing.html](https://martinfowler.com/eaaDev/EventSourcing.html) |
| Hexagonal Architecture (Alistair Cockburn) | 文章 | [alistair.cockburn.us/hexagonal-architecture](https://alistair.cockburn.us/hexagonal-architecture/) |
| NX Monorepo Tools | 文档 | [nx.dev](https://nx.dev/) — 企业级 Monorepo 架构 |
| Turborepo | 文档 | [turbo.build](https://turbo.build/) — Vercel 的高性能构建系统 |
| Event Store DB | 文档 | [developers.eventstore.com](https://developers.eventstore.com/) — 事件存储数据库 |
| InversifyJS | 仓库 | [inversify.io](https://inversify.io/) — TypeScript DI 容器 |
| TSyringe | 仓库 | [github.com/microsoft/tsyringe](https://github.com/microsoft/tsyringe) — Microsoft DI 容器 |

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
