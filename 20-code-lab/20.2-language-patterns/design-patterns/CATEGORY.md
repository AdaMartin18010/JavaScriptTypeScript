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

---

*最后更新: 2026-04-29*
