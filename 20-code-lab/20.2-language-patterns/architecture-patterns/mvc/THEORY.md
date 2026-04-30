# MVC 模式

> **定位**：`20-code-lab/20.2-language-patterns/architecture-patterns/mvc`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决用户界面与业务逻辑混杂的问题。通过模型-视图-控制器分离职责，提升代码的组织性与可测试性。

### 1.2 形式化基础

MVC 可形式化为一个三元组 $(M, V, C)$：

- 模型 $M$：管理应用状态与业务规则，$M: D \to S$（数据到状态的映射）
- 视图 $V$：状态的可视化表示，$V: S \to UI$
- 控制器 $C$：输入事件的分发器，$C: E \to (M \times V)$

约束：视图直接依赖模型，但模型不依赖视图（观察者模式）。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 控制器 | 接收输入并调度模型与视图 | controllers/ |
| 模型 | 封装业务数据与验证规则 | models/ |
| 视图 | 负责渲染与用户展示 | views/ |

---

## 二、设计原理

### 2.1 为什么存在

用户界面与业务逻辑混杂导致代码难以维护和测试。MVC 通过分离模型、视图和控制器，使每一部分可以独立演进和验证。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 经典 MVC | 职责清晰 | 视图与控制器耦合 | 服务端渲染 |
| 前端 MVC | 组件化 | 模型与视图难同步 | 传统 SPA |

### 2.3 模式对比

| 维度 | MVC | MVP | MVVM | MVI | VIPER |
|------|-----|-----|------|-----|-------|
| 数据流方向 | 视图 ← 模型（观察者） | 视图 ← Presenter | 双向绑定 | 单向循环 (Intent → Model → View) | 单向（Router 解耦导航） |
| 视图依赖 | 直接依赖模型 | 不依赖模型 | 依赖 VM | 不依赖模型 | 不依赖模型 |
| 测试难度 | 中（需模拟视图） | 低（Presenter 无 UI） | 低（VM 可独立测试） | 低（纯函数归约） | 低（职责极细） |
| 前端框架代表 | Backbone.js | 早期 Android | Vue, Angular, Knockout | Redux, MviKotlin | iOS (Swift) |
| 适用场景 | 服务端渲染 / 早期 SPA | 企业级桌面应用 | 现代数据驱动 UI | 响应式状态管理 | 大型移动端应用 |
| 复杂度 | 低 | 中 | 中 | 中 | 高 |

---

## 三、实践映射

### 3.1 从理论到代码

以下示例展示一个纯 TypeScript 的 MVC 实现，用于管理 Todo 列表：

```typescript
// mvc-demo.ts
class TodoModel {
  private todos: { id: number; text: string; done: boolean }[] = [];
  private listeners: (() => void)[] = [];
  addTodo(text: string) {
    this.todos.push({ id: Date.now(), text, done: false });
    this.notify();
  }
  toggle(id: number) {
    const t = this.todos.find((x) => x.id === id);
    if (t) { t.done = !t.done; this.notify(); }
  }
  getTodos() { return [...this.todos]; }
  subscribe(fn: () => void) { this.listeners.push(fn); }
  private notify() { this.listeners.forEach((fn) => fn()); }
}

class TodoView {
  constructor(private container: HTMLElement, private onToggle: (id: number) => void) {}
  render(todos: ReturnType<TodoModel['getTodos']>) {
    this.container.innerHTML = todos.map((t) =>
      `<li data-id="${t.id}" style="text-decoration:${t.done ? 'line-through' : 'none'}">${t.text}</li>`
    ).join('');
    this.container.querySelectorAll('li').forEach((li) => {
      li.addEventListener('click', () => this.onToggle(Number(li.dataset.id)));
    });
  }
}

class TodoController {
  constructor(private model: TodoModel, private view: TodoView) {
    this.model.subscribe(() => this.view.render(this.model.getTodos()));
    this.view.render(this.model.getTodos());
  }
  add(text: string) { this.model.addTodo(text); }
}

// 组装
const model = new TodoModel();
const view = new TodoView(document.getElementById('todo-list')!, (id) => model.toggle(id));
const ctrl = new TodoController(model, view);
ctrl.add('Learn MVC');
```

#### 带接口契约的 MVC 变体（MVP 风格）

通过引入接口进一步解耦视图与模型，使 Presenter（或控制器）成为唯一协调者：

```typescript
// mvc-with-contracts.ts
interface ITodoView {
  render(todos: { id: number; text: string; done: boolean }[]): void;
}

interface ITodoModel {
  addTodo(text: string): void;
  toggle(id: number): void;
  getTodos(): { id: number; text: string; done: boolean }[];
  subscribe(fn: () => void): void;
}

class TodoPresenter {
  constructor(private model: ITodoModel, private view: ITodoView) {
    this.model.subscribe(() => this.view.render(this.model.getTodos()));
  }
  init() { this.view.render(this.model.getTodos()); }
  handleAdd(text: string) { this.model.addTodo(text); }
  handleToggle(id: number) { this.model.toggle(id); }
}
```

#### MVVM 模式示例（双向绑定骨架）

```typescript
// mvvm-demo.ts — 响应式 ViewModel 骨架

type Effect = () => void;
let activeEffect: Effect | null = null;

function observable<T extends object>(obj: T): T {
  const deps = new Map<string | symbol, Set<Effect>>();
  return new Proxy(obj, {
    get(target, key) {
      if (activeEffect) {
        if (!deps.has(key)) deps.set(key, new Set());
        deps.get(key)!.add(activeEffect);
      }
      return target[key as keyof T];
    },
    set(target, key, value) {
      (target as any)[key] = value;
      deps.get(key)?.forEach((fn) => fn());
      return true;
    },
  });
}

function watch(fn: Effect) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

class TodoViewModel {
  state = observable({
    todos: [] as { id: number; text: string; done: boolean }[],
    filter: 'all' as 'all' | 'active' | 'completed',
  });

  get visibleTodos() {
    const { todos, filter } = this.state;
    if (filter === 'all') return todos;
    return todos.filter((t) => (filter === 'active' ? !t.done : t.done));
  }

  addTodo(text: string) {
    this.state.todos = [...this.state.todos, { id: Date.now(), text, done: false }];
  }

  toggle(id: number) {
    this.state.todos = this.state.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  }

  setFilter(filter: 'all' | 'active' | 'completed') {
    this.state.filter = filter;
  }
}

// 使用
const vm = new TodoViewModel();
watch(() => {
  console.log('Visible todos:', vm.visibleTodos.map((t) => t.text));
});

vm.addTodo('Learn MVVM');
vm.toggle(vm.state.todos[0].id);
```

#### React 中的 MVC 变体（Container/Presentational 组件）

```typescript
// react-mvc-variant.tsx
// Model: 纯逻辑 + 状态管理（可替换为 Redux/Zustand）
class TaskModel {
  private tasks: Task[] = [];
  private listeners: Set<(tasks: Task[]) => void> = new Set();

  add(task: Omit<Task, 'id'>) {
    this.tasks = [...this.tasks, { ...task, id: crypto.randomUUID() }];
    this.emit();
  }

  remove(id: string) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.emit();
  }

  subscribe(fn: (tasks: Task[]) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.listeners.forEach((fn) => fn([...this.tasks]));
  }
}

// View (Presentational): 纯渲染，无业务逻辑
function TaskListView({ tasks, onRemove }: { tasks: Task[]; onRemove: (id: string) => void }) {
  return (
    <ul>
      {tasks.map((t) => (
        <li key={t.id}>
          {t.title}
          <button onClick={() => onRemove(t.id)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}

// Controller (Container): 连接 Model 与 View
function TaskContainer() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const modelRef = useRef(new TaskModel());

  useEffect(() => {
    return modelRef.current.subscribe(setTasks);
  }, []);

  return (
    <TaskListView
      tasks={tasks}
      onRemove={(id) => modelRef.current.remove(id)}
    />
  );
}
```

#### 事件总线解耦 MVC 通信

```typescript
// event-bus-mvc.ts
// 使用发布-订阅解耦 Model ↔ View 的直接依赖

type EventMap = {
  'todo:added': { id: number; text: string };
  'todo:toggled': { id: number; done: boolean };
  'todo:removed': { id: number };
};

class EventBus<E extends Record<string, any>> {
  private listeners: { [K in keyof E]?: Set<(payload: E[K]) => void> } = {};

  on<K extends keyof E>(event: K, handler: (payload: E[K]) => void) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]!.add(handler);
    return () => this.listeners[event]!.delete(handler);
  }

  emit<K extends keyof E>(event: K, payload: E[K]) {
    this.listeners[event]?.forEach((fn) => fn(payload));
  }
}

const bus = new EventBus<EventMap>();

// Model 通过事件总线通知变更
class EventDrivenModel {
  private todos: Map<number, Todo> = new Map();

  add(text: string) {
    const id = Date.now();
    this.todos.set(id, { id, text, done: false });
    bus.emit('todo:added', { id, text });
  }

  toggle(id: number) {
    const todo = this.todos.get(id);
    if (todo) {
      todo.done = !todo.done;
      bus.emit('todo:toggled', { id, done: todo.done });
    }
  }
}

// View 订阅事件总线
class EventDrivenView {
  constructor(private container: HTMLElement) {
    bus.on('todo:added', ({ id, text }) => {
      const li = document.createElement('li');
      li.dataset.id = String(id);
      li.textContent = text;
      this.container.appendChild(li);
    });
    bus.on('todo:toggled', ({ id, done }) => {
      const li = this.container.querySelector(`[data-id="${id}"]`);
      if (li) li.classList.toggle('done', done);
    });
  }
}
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| MVC 只适用于服务端 | MVC 思想也适用于前端组件设计 |
| 控制器应该包含业务逻辑 | 业务逻辑应集中在模型层 |
| 视图可以直接修改模型 | 视图应通过控制器或绑定间接更新模型 |

### 3.3 扩展阅读

- [MVC Pattern — MDN](https://developer.mozilla.org/en-US/docs/Glossary/MVC)
- [Apple — MVC](https://developer.apple.com/library/archive/documentation/General/Conceptual/DevPedia-CocoaCore/MVC.html)
- [Microsoft — MVC Pattern](https://learn.microsoft.com/en-us/previous-versions/msp-n-p/ff649643(v=pandp.10))
- [Backbone.js — MVC in the browser](https://backbonejs.org/)
- [Model-View-Controller (MVC) — Martin Fowler](https://martinfowler.com/eaaCatalog/modelViewController.html)
- [MVP vs MVC vs MVVM — Microsoft Docs](https://learn.microsoft.com/en-us/archive/msdn-magazine/2013/april/mvvm-mvc-mvp-which-one-to-use)
- [Model-View-ViewModel (MVVM) — Microsoft](https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm)
- [The Elm Architecture — Evan Czaplicki](https://guide.elm-lang.org/architecture/)
- [Martin Fowler — Presentation Domain Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)
- [Google — Android Architecture Components (MVVM Guide)](https://developer.android.com/topic/libraries/architecture)
- [Angular — Understanding MVC in Angular](https://angular.io/guide/architecture)
- [React — Thinking in React](https://react.dev/learn/thinking-in-react) — React 官方组件设计哲学
- [Redux — Three Principles](https://redux.js.org/understanding/thinking-in-redux/three-principles) — 单向数据流与 MVC 的关系
- [Refactoring Guru — MVC](https://refactoring.guru/design-patterns/mvc) — 可视化设计模式指南
- [Patterns of Enterprise Application Architecture — Martin Fowler](https://martinfowler.com/eaaCatalog/) — 企业应用架构模式

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
