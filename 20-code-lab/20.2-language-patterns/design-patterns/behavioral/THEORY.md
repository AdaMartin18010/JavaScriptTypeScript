# 行为型设计模式（Behavioral Patterns）

> **定位**：`20-code-lab/20.2-language-patterns/design-patterns/behavioral`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决**对象间通信与职责分配**的问题。通过观察者、策略、命令等行为模式提升系统的灵活性与可扩展性。核心思想：将行为封装为可替换、可复用的对象，而非硬编码在调用方。

### 1.2 形式化基础

行为模式关注对象间的**通信模式**和**算法封装**。它们通过引入中介者来降低耦合，或通过将请求封装为对象来参数化调用。

### 1.3 模式速查表

| 模式 | 意图 | 典型场景 | TypeScript 实现要点 |
|------|------|---------|--------------------|
| **Observer** | 一对多依赖通知 | 事件系统、响应式数据 | `addListener`/`notify` |
| **Strategy** | 封装可互换算法族 | 排序策略、支付渠道 | 接口 + 多态实现 |
| **Command** | 将请求封装为对象 | 撤销/重做、队列调度 | `execute()`/`undo()` |
| **Iterator** | 顺序访问聚合元素 | 自定义集合遍历 | `Symbol.iterator`/`next()` |

---

## 二、设计原理

### 2.1 为什么存在

对象间的通信方式直接影响系统的灵活性和可维护性。行为模式封装了对象协作中的常见方案，使系统更容易扩展新行为而无需修改现有代码（开闭原则）。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 观察者 | 松耦合通知 | 内存泄漏风险 | 事件系统 |
| 策略 | 算法可替换 | 类数量增加 | 规则引擎 |

### 2.3 与相关技术的对比

与函数式组合对比：OOP 模式封装状态行为，函数组合更偏数据转换。现代 TS 项目常混合使用（如策略模式用函数实现）。

---

## 三、实践映射

### 3.1 从理论到代码

**Observer（事件发射器）**

```typescript
class EventEmitter<T extends Record<string, any>> {
  private listeners: { [K in keyof T]?: Array<(payload: T[K]) => void> } = {};

  on<K extends keyof T>(event: K, handler: (payload: T[K]) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(handler);
    return () => this.off(event, handler); // 返回取消订阅函数
  }

  off<K extends keyof T>(event: K, handler: (payload: T[K]) => void) {
    this.listeners[event] = this.listeners[event]?.filter(h => h !== handler);
  }

  emit<K extends keyof T>(event: K, payload: T[K]) {
    this.listeners[event]?.forEach(h => h(payload));
  }
}

// 可运行示例
interface AppEvents {
  userLogin: { userId: string; timestamp: number };
  dataUpdate: { records: number };
}

const bus = new EventEmitter<AppEvents>();
const unsub = bus.on('userLogin', ({ userId }) => console.log(`User ${userId} logged in`));
bus.emit('userLogin', { userId: 'u-42', timestamp: Date.now() }); // → User u-42 logged in
unsub(); // 取消订阅，防止内存泄漏
```

**Strategy（支付渠道策略）**

```typescript
interface PaymentStrategy {
  pay(amount: number): Promise<{ success: boolean; transactionId: string }>;
}

class StripeStrategy implements PaymentStrategy {
  async pay(amount: number) {
    console.log(`Charging $${amount} via Stripe...`);
    return { success: true, transactionId: `stripe_${Date.now()}` };
  }
}

class PayPalStrategy implements PaymentStrategy {
  async pay(amount: number) {
    console.log(`Charging $${amount} via PayPal...`);
    return { success: true, transactionId: `pp_${Date.now()}` };
  }
}

class CheckoutService {
  constructor(private strategy: PaymentStrategy) {}
  async checkout(cartTotal: number) {
    return this.strategy.pay(cartTotal);
  }
  setStrategy(strategy: PaymentStrategy) { this.strategy = strategy; }
}

// 可运行示例
const checkout = new CheckoutService(new StripeStrategy());
await checkout.checkout(99.00);
checkout.setStrategy(new PayPalStrategy());
await checkout.checkout(49.00);
```

**Command（撤销/重做）**

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class Editor {
  content = '';
  append(text: string) { this.content += text; }
  delete(len: number) { this.content = this.content.slice(0, -len); }
}

class AppendCommand implements Command {
  constructor(private editor: Editor, private text: string) {}
  execute() { this.editor.append(this.text); }
  undo() { this.editor.delete(this.text.length); }
}

class History {
  private stack: Command[] = [];
  private pointer = -1;

  execute(cmd: Command) {
    cmd.execute();
    this.stack = this.stack.slice(0, this.pointer + 1);
    this.stack.push(cmd);
    this.pointer++;
  }
  undo() {
    if (this.pointer < 0) return;
    this.stack[this.pointer--].undo();
  }
  redo() {
    if (this.pointer >= this.stack.length - 1) return;
    this.stack[++this.pointer].execute();
  }
}

// 可运行示例
const editor = new Editor();
const history = new History();
history.execute(new AppendCommand(editor, 'Hello'));
history.execute(new AppendCommand(editor, ' World'));
console.log(editor.content); // Hello World
history.undo();
console.log(editor.content); // Hello
history.redo();
console.log(editor.content); // Hello World
```

**Iterator（自定义范围迭代器）**

```typescript
class Range implements Iterable<number> {
  constructor(private start: number, private end: number, private step = 1) {}

  *[Symbol.iterator](): Iterator<number> {
    for (let i = this.start; i <= this.end; i += this.step) yield i;
  }
}

// 可运行示例
const range = new Range(1, 10, 2);
console.log([...range]); // [1, 3, 5, 7, 9]
for (const n of new Range(5, 5)) console.log(n); // 5
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 设计模式增加复杂度 | 模式是经验总结，在合适场景降低复杂度 |
| 所有行为问题都用观察者 | 应根据通信模式选择策略、命令等模式 |
| 命令模式必须实现 undo | 命令的核心是封装请求，undo 是扩展能力 |

### 3.3 扩展阅读

- [GoF Design Patterns — Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns)
- [Refactoring Guru: Behavioral Patterns](https://refactoring.guru/design-patterns/behavioral-patterns)
- [Node.js Events Module](https://nodejs.org/api/events.html)
- [MDN: Iterators and Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators)
- `20.2-language-patterns/design-patterns/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
