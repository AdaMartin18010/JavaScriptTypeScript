# JS/TS 特定模式（JS/TS-Specific Patterns）

> **定位**：`20-code-lab/20.2-language-patterns/design-patterns/js-ts-specific`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 JavaScript 与 TypeScript 生态中特有的设计问题。涵盖模块模式、混入、branded types 等语言特定的惯用法。核心原则：充分利用 JS 的动态特性与 TS 的静态类型系统，写出既惯用又类型安全的代码。

### 1.2 形式化基础

JS/TS 模式诞生于语言演进的历史环境：ES5 缺乏原生模块和类，催生了 IIFE 和模块模式；ES6+ 引入 class 和 module 后，这些模式演化为了 TS 中的类型安全惯用法。

### 1.3 模式速查表

| 模式 | 意图 | 适用场景 | TS 增强 |
|------|------|---------|---------|
| **Module** | ES Module 封装私有成员 | 现代项目组织 | `export` / `export default` |
| **Revealing Module** | 暴露指定公共 API | 库/工具函数封装 | 配合 `namespace` 或 module |
| **IIFE** | 创建私有作用域 | 旧浏览器兼容、避免污染全局 | 极少使用，被 module 替代 |
| **Mixin** | 多源行为组合 | 横向功能复用（日志、序列化） | `interface` + `implements` 约束 |
| **Branded Type** | 名义子类型 | 区分同构异义类型（ID、货币） | 交叉类型 + `unique symbol` |
| **Builder** | 逐步构造复杂对象 | 配置对象、查询构造器 | 递归泛型 + 类型推导 |

---

## 二、设计原理

### 2.1 为什么存在

JavaScript 的动态特性和 TypeScript 的类型系统产生了独特的编程模式。这些模式充分利用了语言特性，是在 JS/TS 生态中高效开发的必备知识。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 模块模式 | 私有作用域 | 内存占用 | 兼容旧环境 |
| 类与接口 | 传统 OOP 熟悉感 | 运行时无类型 | 大型团队协作 |
| Branded Type | 编译期区分同构类型 | 需额外类型体操 | 安全关键场景 |
| Builder 模式 | 类型安全链式调用 | 泛型复杂度较高 | 复杂配置构造 |

### 2.3 与相关技术的对比

与经典 GoF 对比：JS/TS 模式充分利用动态特性和类型系统。许多经典模式在 JS 中可以用更轻量的函数或对象字面量实现。

---

## 三、实践映射

### 3.1 从理论到代码

**Module（ES Module 私有成员）**

```typescript
// math-utils.ts —— 模块内部私有，外部不可访问
const PI = 3.141592653589793;
const E = 2.718281828459045;

function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

// 仅导出公共 API
export function circleArea(radius: number): number {
  return PI * radius * radius;
}
export function compoundInterest(p: number, r: number, t: number): number {
  return p * Math.pow(E, r * t);
}
export { factorial };

// 可运行示例（Node.js / Deno / Browser ESM）
import { circleArea, factorial } from './math-utils';
console.log(circleArea(5)); // 78.54...
console.log(factorial(5));  // 120
// PI 和 E 不可访问，编译期即报错
```

**Revealing Module（显式暴露 API）**

```typescript
// counter.ts
function createCounter(initial = 0) {
  let count = initial;

  function increment() { return ++count; }
  function decrement() { return --count; }
  function getValue() { return count; }
  function reset() { count = initial; }

  // 只暴露需要公开的方法，内部状态完全隐藏
  return { increment, decrement, getValue, reset };
}

export type Counter = ReturnType<typeof createCounter>;

// 可运行示例
const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.getValue());  // 11
counter.reset();
console.log(counter.getValue());  // 10
// count 变量不可直接访问
```

**IIFE（立即执行函数表达式）**

```typescript
// 旧环境模拟模块（现代项目较少使用，但理解其原理有助于读老代码）
const DataStore = (function () {
  const cache = new Map<string, any>();

  return {
    set<T>(key: string, value: T) { cache.set(key, value); },
    get<T>(key: string): T | undefined { return cache.get(key); },
    size() { return cache.size; },
  };
})();

// 可运行示例
DataStore.set('user', { id: 1, name: 'Alice' });
console.log(DataStore.get('user')); // { id: 1, name: 'Alice' }
console.log(DataStore.size());      // 1
// cache 变量被闭包封闭，外部不可访问
```

**Mixin（TypeScript 类型安全混入）**

```typescript
// 定义可复用的行为类（无基类）
class Disposable {
  isDisposed = false;
  dispose() { this.isDisposed = true; }
}

class Activatable {
  isActive = false;
  activate() { this.isActive = true; }
  deactivate() { this.isActive = false; }
}

// 类型辅助：将构造函数合并
type Constructor<T = {}> = new (...args: any[]) => T;

function applyMixins<T extends Constructor, M extends Constructor[]>(
  derivedCtor: T,
  constructors: M
) {
  constructors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      if (name !== 'constructor') {
        derivedCtor.prototype[name] = baseCtor.prototype[name];
      }
    });
  });
  return derivedCtor as T & { new (...args: any[]): InstanceType<M[number]> };
}

// 目标类声明需要混入的接口（编译期类型检查）
class SmartWidget {
  name = 'SmartWidget';
  render() { console.log(`Rendering ${this.name}`); }
}
interface SmartWidget extends Disposable, Activatable {}
applyMixins(SmartWidget, [Disposable, Activatable]);

// 可运行示例
const widget = new SmartWidget();
widget.activate();
widget.render();
widget.dispose();
console.log(widget.isActive, widget.isDisposed); // true true
```

**Branded Type（名义子类型）**

```typescript
// branded-types.ts — 区分同构异义值
declare const UserIdSymbol: unique symbol;
declare const OrderIdSymbol: unique symbol;

export type UserId = string & { readonly [UserIdSymbol]: true };
export type OrderId = string & { readonly [OrderIdSymbol]: true };

export function UserId(id: string): UserId {
  return id as UserId;
}
export function OrderId(id: string): OrderId {
  return id as OrderId;
}

// 使用：编译期防止 ID 混用
function fetchUser(id: UserId) { /* ... */ }
function fetchOrder(id: OrderId) { /* ... */ }

const uid = UserId('u-123');
const oid = OrderId('o-456');

fetchUser(uid);   // ✅ OK
// fetchUser(oid); // ❌ 编译错误：类型不兼容
```

**Builder 模式（类型安全链式调用）**

```typescript
// builder.ts — 带类型约束的 SQL 风格查询构造器
class QueryBuilder<TSelect extends string = never, TWhere extends string = never> {
  private fields: TSelect[] = [];
  private conditions: string[] = [];

  select<K extends string>(field: K): QueryBuilder<TSelect | K, TWhere> {
    const next = new QueryBuilder<TSelect | K, TWhere>();
    next.fields = [...this.fields, field as any];
    next.conditions = [...this.conditions];
    return next;
  }

  where(condition: string): QueryBuilder<TSelect, TWhere> {
    const next = new QueryBuilder<TSelect, TWhere>();
    next.fields = [...this.fields];
    next.conditions = [...this.conditions, condition];
    return next;
  }

  build(): { fields: TSelect[]; where: string[] } {
    return { fields: this.fields, where: this.conditions };
  }
}

// 使用
const q = new QueryBuilder()
  .select('name')
  .select('email')
  .where('age > 18')
  .where('active = true')
  .build();

console.log(q);
// { fields: ['name', 'email'], where: ['age > 18', 'active = true'] }
```

**Strategy 模式（函数式实现）**

```typescript
// strategy.ts — 以函数表替代类继承
interface PaymentContext {
  amount: number;
  currency: string;
}

type PaymentStrategy = (ctx: PaymentContext) => Promise<{ success: boolean; transactionId: string }>;

const strategies = {
  creditCard: async (ctx: PaymentContext) => {
    console.log(`Charging ${ctx.amount} ${ctx.currency} via credit card`);
    return { success: true, transactionId: `cc-${Date.now()}` };
  },
  paypal: async (ctx: PaymentContext) => {
    console.log(`Charging ${ctx.amount} ${ctx.currency} via PayPal`);
    return { success: true, transactionId: `pp-${Date.now()}` };
  },
  crypto: async (ctx: PaymentContext) => {
    console.log(`Charging ${ctx.amount} ${ctx.currency} via crypto`);
    return { success: true, transactionId: `cr-${Date.now()}` };
  },
} as const;

type StrategyName = keyof typeof strategies;

function pay(name: StrategyName, context: PaymentContext) {
  const strategy = strategies[name];
  return strategy(context);
}

// 使用
pay('creditCard', { amount: 99.99, currency: 'USD' });
pay('paypal', { amount: 49.99, currency: 'EUR' });
// pay('unknown', ...); // ❌ 编译错误
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| TS 类型影响运行时 | 类型擦除后运行时无类型信息 |
| any 是类型系统的逃生舱 | 过度使用 any 等于放弃类型安全 |
| IIFE 在现代 JS 中已过时 | 模块系统已取代 IIFE，但闭包原理仍然重要 |
| Mixin 等于多重继承 | Mixin 是行为组合，不引入继承层次冲突 |

### 3.3 扩展阅读

- [JavaScript Patterns — Stoyan Stefanov](https://shichuan.github.io/javascript-patterns/)
- [TypeScript Handbook: Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html)
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [Exploring ES6: Modules](https://exploringjs.com/es6/ch_modules.html)
- [TypeScript Handbook: Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [Branded Types in TypeScript](https://egghead.io/blog/using-branded-types-in-typescript) — 名义子类型详解
- [Total TypeScript — Matt Pocock](https://www.totaltypescript.com/) — 高级 TS 模式
- [Refactoring Guru: Design Patterns](https://refactoring.guru/design-patterns) — 可视化设计模式
- [Patterns.dev](https://www.patterns.dev/) — 现代 Web 应用模式
- `20.2-language-patterns/design-patterns/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
