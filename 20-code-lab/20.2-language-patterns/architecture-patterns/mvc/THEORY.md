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

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
