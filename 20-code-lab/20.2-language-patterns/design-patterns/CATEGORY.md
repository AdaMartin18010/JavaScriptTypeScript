---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 02-design-patterns

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块收录软件工程中经过验证的经典设计模式在 JavaScript/TypeScript 中的实现。设计模式是语言无关的，但本模块聚焦于利用 JS/TS 特有的动态特性、闭包、原型链、类型系统来表达这些模式，属于语言能力的应用层面。

**非本模块内容**：前端组件模式（如 React 高阶组件）、特定框架的架构模式。

## 在语言核心体系中的位置

```
语言核心
  ├── 00-language-core      → 语法与语义基础
  ├── 02-design-patterns（本模块）→ 经典模式的 JS/TS 表达
  └── 05-algorithms         → 算法实现
```

## 子模块目录结构

| 子模块 | 说明 | GoF 分类 | 典型文件 |
|--------|------|----------|----------|
| `creational/` | 创建型模式 | GoF Creational | `singleton.ts`, `factory.ts`, `builder.ts`, `prototype.ts` |
| `structural/` | 结构型模式 | GoF Structural | `adapter.ts`, `decorator.ts`, `proxy.ts`, `composite.ts` |
| `behavioral/` | 行为型模式 | GoF Behavioral | `observer.ts`, `strategy.ts`, `iterator.ts`, `command.ts` |
| `js-specific/` | JS 特有实现 | JS Idioms | `module-pattern.ts`, `revealing-module.ts`, `iife.md` |

## 模式对比矩阵

| 模式 | 分类 | JS 实现难度 | TS 类型安全 | 典型场景 |
|------|------|-------------|-------------|----------|
| **Singleton** | 创建型 | ⭐ 简单 | ⭐⭐ 私有构造器 | 全局配置、连接池 |
| **Factory** | 创建型 | ⭐ 简单 | ⭐⭐⭐ 返回联合类型 | 多态对象创建 |
| **Builder** | 创建型 | ⭐⭐ 中等 | ⭐⭐⭐ 链式类型推断 | 复杂对象组装 |
| **Adapter** | 结构型 | ⭐ 简单 | ⭐⭐⭐ 接口映射 | 第三方库封装 |
| **Decorator** | 结构型 | ⭐⭐ 中等 | ⭐⭐ 实验性装饰器 | AOP、日志、权限 |
| **Proxy** | 结构型 | ⭐ 简单 | ⭐⭐⭐ `Proxy<T>` | 懒加载、验证、缓存 |
| **Observer** | 行为型 | ⭐ 简单 | ⭐⭐⭐ 泛型事件 | 事件总线、响应式 |
| **Strategy** | 行为型 | ⭐ 简单 | ⭐⭐⭐ 策略接口 | 算法替换、排序 |
| **Command** | 行为型 | ⭐⭐ 中等 | ⭐⭐⭐ 命令接口 | 撤销/重做、队列 |

## 代码示例：Proxy 模式（带类型安全）

```typescript
// proxy-validation.ts — 使用 Proxy 实现属性验证

interface User {
  name: string;
  age: number;
  email: string;
}

function createValidatingProxy<T extends Record<string, any>>(
  target: T,
  validators: { [K in keyof T]?: (val: T[K]) => boolean }
): T {
  return new Proxy(target, {
    set(obj, prop: string | symbol, value: any) {
      const validator = validators[prop as keyof T];
      if (validator && !validator(value)) {
        throw new TypeError(`Invalid value for ${String(prop)}: ${value}`);
      }
      obj[prop as keyof T] = value;
      return true;
    }
  });
}

const user = createValidatingProxy<User>(
  { name: 'Alice', age: 30, email: 'alice@example.com' },
  {
    age: (v) => v >= 0 && v <= 150,
    email: (v) => /^\S+@\S+\.\S+$/.test(v)
  }
);

user.age = 31;      // ✅ 通过
// user.age = -5;   // ❌ TypeError: Invalid value for age: -5
```

## 代码示例：Observer 模式（类型安全事件总线）

```typescript
// observer.ts — 泛型事件总线，支持类型推断

type EventMap = Record<string, any>;

class TypedEventBus<Events extends EventMap> {
  private listeners: {
    [K in keyof Events]?: Array<(payload: Events[K]) => void>;
  } = {};

  on<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): () => void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): void {
    const arr = this.listeners[event];
    if (!arr) return;
    const idx = arr.indexOf(listener);
    if (idx > -1) arr.splice(idx, 1);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners[event]?.forEach(fn => fn(payload));
  }
}

// 使用
interface AppEvents {
  'user:login': { id: string; name: string };
  'user:logout': { id: string };
  'error': Error;
}

const bus = new TypedEventBus<AppEvents>();
const unsub = bus.on('user:login', ({ id, name }) => {
  console.log(`Welcome ${name} (${id})`);
});
bus.emit('user:login', { id: 'u1', name: 'Alice' });
unsub();
```

## 代码示例：Strategy 模式（运行时算法替换）

```typescript
// strategy.ts — 策略模式 + 依赖注入

interface SortStrategy<T> {
  sort(data: T[]): T[];
}

class QuickSortStrategy<T> implements SortStrategy<T> {
  sort(data: T[]): T[] {
    if (data.length <= 1) return data;
    const pivot = data[0];
    const left = data.slice(1).filter(x => x < pivot);
    const right = data.slice(1).filter(x => x >= pivot);
    return [...this.sort(left), pivot, ...this.sort(right)];
  }
}

class MergeSortStrategy<T> implements SortStrategy<T> {
  sort(data: T[]): T[] {
    if (data.length <= 1) return data;
    const mid = Math.floor(data.length / 2);
    const left = this.sort(data.slice(0, mid));
    const right = this.sort(data.slice(mid));
    return this.merge(left, right);
  }

  private merge(left: T[], right: T[]): T[] {
    const result: T[] = [];
    while (left.length && right.length) {
      result.push(left[0] <= right[0] ? left.shift()! : right.shift()!);
    }
    return result.concat(left, right);
  }
}

class Sorter<T> {
  constructor(private strategy: SortStrategy<T>) {}

  setStrategy(strategy: SortStrategy<T>): void {
    this.strategy = strategy;
  }

  execute(data: T[]): T[] {
    return this.strategy.sort([...data]); // 不修改原数组
  }
}

// 使用
const sorter = new Sorter<number>(new QuickSortStrategy());
console.log(sorter.execute([3, 1, 4, 1, 5]));
sorter.setStrategy(new MergeSortStrategy());
console.log(sorter.execute([3, 1, 4, 1, 5]));
```

## 代码示例：Singleton（ES2022 私有字段实现）

```typescript
// singleton.ts — 线程安全的单例（JS 单线程语义下）

class DatabaseConnection {
  static #instance: DatabaseConnection | null = null;

  private constructor(public readonly connectionString: string) {
    // 初始化逻辑
  }

  static getInstance(connectionString = 'default'): DatabaseConnection {
    if (!DatabaseConnection.#instance) {
      DatabaseConnection.#instance = new DatabaseConnection(connectionString);
    }
    return DatabaseConnection.#instance;
  }

  static reset(): void {
    DatabaseConnection.#instance = null;
  }
}

// 测试
const db1 = DatabaseConnection.getInstance('postgres://localhost');
const db2 = DatabaseConnection.getInstance('mysql://localhost');
console.log(db1 === db2); // true，始终返回第一次创建的实例
```

## 代码示例：Builder 模式（链式类型推断）

```typescript
// builder.ts — 类型安全的 SQL 查询构建器

class QueryBuilder<T extends Record<string, unknown>> {
  private _select: (keyof T)[] = [];
  private _where: string[] = [];
  private _params: unknown[] = [];
  private _orderBy?: { column: keyof T; direction: 'ASC' | 'DESC' };
  private _limit?: number;

  select(...columns: (keyof T)[]): this {
    this._select = columns;
    return this;
  }

  where<K extends keyof T>(column: K, operator: string, value: T[K]): this {
    this._where.push(`${String(column)} ${operator} ?`);
    this._params.push(value);
    return this;
  }

  orderBy(column: keyof T, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this._orderBy = { column, direction };
    return this;
  }

  limit(n: number): this {
    this._limit = n;
    return this;
  }

  build(): { sql: string; params: unknown[] } {
    const columns = this._select.length ? this._select.join(', ') : '*';
    let sql = `SELECT ${columns} FROM table`;
    if (this._where.length) sql += ` WHERE ${this._where.join(' AND ')}`;
    if (this._orderBy) sql += ` ORDER BY ${String(this._orderBy.column)} ${this._orderBy.direction}`;
    if (this._limit) sql += ` LIMIT ${this._limit}`;
    return { sql, params: this._params };
  }
}

interface UserTable {
  id: number;
  name: string;
  email: string;
  age: number;
}

const query = new QueryBuilder<UserTable>()
  .select('id', 'name', 'email')
  .where('age', '>', 18)
  .where('name', 'LIKE', 'A%')
  .orderBy('age', 'DESC')
  .limit(10)
  .build();

console.log(query.sql);
// SELECT id, name, email FROM table WHERE age > ? AND name LIKE ? ORDER BY age DESC LIMIT 10
```

## 代码示例：Factory 模式（带类型守卫）

```typescript
// factory.ts — 根据类型字符串创建对应实例

type Vehicle = Car | Truck | Motorcycle;

interface Car { type: 'car'; doors: number; brand: string; }
interface Truck { type: 'truck'; capacity: number; brand: string; }
interface Motorcycle { type: 'motorcycle'; hasSidecar: boolean; brand: string; }

class VehicleFactory {
  static create(config: { type: 'car'; doors: number; brand: string }): Car;
  static create(config: { type: 'truck'; capacity: number; brand: string }): Truck;
  static create(config: { type: 'motorcycle'; hasSidecar: boolean; brand: string }): Motorcycle;
  static create(config: any): Vehicle {
    switch (config.type) {
      case 'car': return { type: 'car', doors: config.doors, brand: config.brand };
      case 'truck': return { type: 'truck', capacity: config.capacity, brand: config.brand };
      case 'motorcycle': return { type: 'motorcycle', hasSidecar: config.hasSidecar, brand: config.brand };
      default: throw new Error(`Unknown vehicle type: ${config.type}`);
    }
  }
}

const car = VehicleFactory.create({ type: 'car', doors: 4, brand: 'Toyota' });
const truck = VehicleFactory.create({ type: 'truck', capacity: 5000, brand: 'Volvo' });
```

## 代码示例：Command 模式（撤销/重做栈）

```typescript
// command.ts — 命令模式实现撤销重做

interface Command {
  execute(): void;
  undo(): void;
}

class TextEditor {
  content = '';

  insert(text: string, position: number): Command {
    return {
      execute: () => {
        this.content = this.content.slice(0, position) + text + this.content.slice(position);
      },
      undo: () => {
        this.content = this.content.slice(0, position) + this.content.slice(position + text.length);
      },
    };
  }

  delete(position: number, length: number): Command {
    const deleted = this.content.slice(position, position + length);
    return {
      execute: () => {
        this.content = this.content.slice(0, position) + this.content.slice(position + length);
      },
      undo: () => {
        this.content = this.content.slice(0, position) + deleted + this.content.slice(position);
      },
    };
  }
}

class CommandHistory {
  private history: Command[] = [];
  private pointer = -1;

  execute(cmd: Command): void {
    cmd.execute();
    // 丢弃 pointer 之后的命令（重做历史）
    this.history = this.history.slice(0, this.pointer + 1);
    this.history.push(cmd);
    this.pointer++;
  }

  undo(): void {
    if (this.pointer < 0) return;
    this.history[this.pointer].undo();
    this.pointer--;
  }

  redo(): void {
    if (this.pointer >= this.history.length - 1) return;
    this.pointer++;
    this.history[this.pointer].execute();
  }
}

// 使用
const editor = new TextEditor();
const history = new CommandHistory();

history.execute(editor.insert('Hello', 0));
history.execute(editor.insert(' World', 5));
console.log(editor.content); // Hello World

history.undo();
console.log(editor.content); // Hello

history.redo();
console.log(editor.content); // Hello World
```

## 代码示例：Adapter 模式（旧 API 适配新接口）

```typescript
// adapter.ts — 将遗留 XMLHttpRequest 适配为 fetch 风格接口

interface FetchLike {
  fetch(url: string, options?: { method?: string; body?: string }): Promise<{ json(): Promise<unknown> }>;
}

class XMLHttpRequestAdapter implements FetchLike {
  fetch(url: string, options: { method?: string; body?: string } = {}): Promise<{ json(): Promise<unknown> }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(options.method ?? 'GET', url);
      xhr.onload = () => resolve({
        json: () => Promise.resolve(JSON.parse(xhr.responseText)),
      });
      xhr.onerror = () => reject(new Error('Request failed'));
      xhr.send(options.body ?? null);
    });
  }
}

// 现代代码可直接使用适配后的接口
const api: FetchLike = new XMLHttpRequestAdapter();
api.fetch('/api/data').then(r => r.json()).then(console.log);
```

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)

## 权威外部链接

| 资源 | 类型 | 链接 |
|------|------|------|
| Refactoring Guru — Design Patterns | 可视化指南 | [refactoring.guru/design-patterns](https://refactoring.guru/design-patterns) |
| Patterns.dev | 现代 Web 模式 | [www.patterns.dev](https://www.patterns.dev/) |
| JavaScript Design Patterns (Addy Osmani) | 开源书籍 | [addyosmani.com/resources/essentialjsdesignpatterns/book](https://addyosmani.com/resources/essentialjsdesignpatterns/book/) |
| TypeScript Design Patterns (GitHub) | TS 实现集合 | [github.com/torokmark/design_patterns_in_typescript](https://github.com/torokmark/design_patterns_in_typescript) |
| Node.js Design Patterns (Book) | Node.js 专用 | [www.nodejsdesignpatterns.com](https://www.nodejsdesignpatterns.com/) |
| GoF Design Patterns (Wikipedia) | 参考 | [en.wikipedia.org/wiki/Design_Patterns](https://en.wikipedia.org/wiki/Design_Patterns) |
| TC39 — Class Fields & Private Methods | 规范 | [tc39.es/proposal-class-fields](https://tc39.es/proposal-class-fields/) |
| MDN — Proxy | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) |
| Head First Design Patterns (2nd Ed.) | 书籍 | [wickedlysmart.com/head-first-design-patterns](https://wickedlysmart.com/head-first-design-patterns/) |
| TC39 — Decorators Proposal | 规范 | [github.com/tc39/proposal-decorators](https://github.com/tc39/proposal-decorators) |
| SOLID Principles (Uncle Bob) | 文章 | [blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html) |
| DRY, KISS, YAGNI Principles | 指南 | [thevaluable.dev/principles-dry-kiss-yagni](https://thevaluable.dev/principles-dry-kiss-yagni/) |
| Martin Fowler — Patterns of Enterprise Application Architecture | 书籍 | [martinfowler.com/books/eaa.html](https://martinfowler.com/books/eaa.html) |
| Functional Design Patterns (Scott Wlaschin) | 演讲 | [fsharpforfunandprofit.com/fppatterns](https://fsharpforfunandprofit.com/fppatterns/) |
| RxJS Observable Pattern | 文档 | [rxjs.dev/guide/observable](https://rxjs.dev/guide/observable) — 响应式观察者模式工业实现 |

---

*最后更新: 2026-04-30*
