# 语言模式

> **定位**：`20-code-lab/20.2-language-patterns`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 语言模式 领域的核心理论与实践映射问题。通过代码示例和形式化分析建立从概念到实现的认知桥梁。

### 1.2 形式化基础

语言模式可视为在特定上下文（Context）中针对重复出现的问题（Problem）所给出的可复用解决方案（Solution）。形式化表达为：

```
Pattern = ⟨Context, Problem, Solution, Consequences⟩
```

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 核心概念 | 语言模式 的核心定义与语义 | 示例代码 |
| 实践模式 | 工程化中的典型应用场景 | patterns/ |

---

## 二、设计原理

### 2.1 为什么存在

语言模式 作为软件工程中的重要课题，其存在是为了解决特定领域的复杂度与可维护性挑战。通过建立系统化的理论框架和实践模式，开发者能够更高效地构建可靠的系统。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 方案 A | 通用、稳健 | 可能非最优 | 大多数场景 |
| 方案 B | 针对性强 | 适用范围窄 | 特定需求 |

### 2.3 与相关技术的对比

| 模式 | 意图 | 典型实现 | 适用场景 |
|------|------|---------|---------|
| 工厂模式 | 封装对象创建逻辑 | `class Factory { create() {} }` | 对象创建复杂 |
| 策略模式 | 运行时替换算法 | `interface Strategy { execute() }` | 多算法切换 |
| 观察者模式 | 一对多依赖通知 | `EventEmitter` / `Proxy` | 事件驱动系统 |
| 装饰器模式 | 动态增强行为 | ES Decorator / 高阶函数 | AOP、日志 |
| 单例模式 | 全局唯一实例 | `private constructor` | 配置中心 |

与其他相关技术对比，语言模式 在特定场景下提供了独特的权衡优势。

---

## 三、TypeScript 语言特有模式

### 3.1 Discriminated Unions（可辨识联合类型）

```typescript
// 用字面量类型标签实现代数数据类型
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default:
      // TypeScript 会在此报错若遗漏了分支（exhaustiveness check）
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

### 3.2 Branded Types（品牌类型）

```typescript
// 为同构类型赋予语义区分，避免单位/ID 混淆
 type UserId = string & { __brand: 'UserId' };
 type OrderId = string & { __brand: 'OrderId' };

 function UserId(id: string): UserId {
   return id as UserId;
 }
 function OrderId(id: string): OrderId {
   return id as OrderId;
 }

 const uid: UserId = UserId('u-123');
 const oid: OrderId = OrderId('o-456');
 // uid = oid; // ❌ 编译错误：类型不兼容
```

### 3.3 Builder Pattern with Method Chaining

```typescript
class SQLQueryBuilder {
  private parts: string[] = [];

  select(...columns: string[]): this {
    this.parts.push(`SELECT ${columns.join(', ')}`);
    return this;
  }

  from(table: string): this {
    this.parts.push(`FROM ${table}`);
    return this;
  }

  where(condition: string): this {
    this.parts.push(`WHERE ${condition}`);
    return this;
  }

  build(): string {
    return this.parts.join(' ');
  }
}

const sql = new SQLQueryBuilder()
  .select('id', 'name')
  .from('users')
  .where('age > 18')
  .build();
// "SELECT id, name FROM users WHERE age > 18"
```

### 3.4 Result / Option 类型（函数式错误处理）

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err('Division by zero');
  return ok(a / b);
}

const result = divide(10, 0);
if (!result.ok) {
  console.error(result.error); // 编译器自动收窄类型
} else {
  console.log(result.value);
}
```

---

## 四、实践映射

### 4.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 语言模式 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 策略模式 + 工厂模式组合示例

```typescript
// 策略接口
interface PaymentStrategy {
  pay(amount: number): Promise<string>;
}

// 具体策略
class AlipayStrategy implements PaymentStrategy {
  async pay(amount: number) {
    return `Alipay paid ¥${amount}`;
  }
}

class WechatStrategy implements PaymentStrategy {
  async pay(amount: number) {
    return `Wechat paid ¥${amount}`;
  }
}

// 工厂：根据类型创建策略
class PaymentFactory {
  static create(method: 'alipay' | 'wechat'): PaymentStrategy {
    const map: Record<string, new () => PaymentStrategy> = {
      alipay: AlipayStrategy,
      wechat: WechatStrategy,
    };
    return new map[method]();
  }
}

// 使用
const payment = PaymentFactory.create('alipay');
payment.pay(100).then(console.log);
```

#### Proxy 模式实现可观察对象

```typescript
function createObservable<T extends object>(target: T, onChange: (prop: string, value: unknown) => void): T {
  return new Proxy(target, {
    set(obj, prop, value) {
      const result = Reflect.set(obj, prop, value);
      onChange(String(prop), value);
      return result;
    },
  });
}

const state = createObservable({ count: 0 }, (prop, val) => {
  console.log(`Property "${prop}" changed to ${val}`);
});

state.count++; // "Property "count" changed to 1"
```

### 3.5 Command 模式（命令 + 撤销）

```typescript
interface Command { execute(): void; undo(): void; }

class TextEditor {
  content = '';
  append(text: string) { this.content += text; }
  delete(n: number) { this.content = this.content.slice(0, -n); }
}

class AppendCommand implements Command {
  constructor(private editor: TextEditor, private text: string) {}
  execute() { this.editor.append(this.text); }
  undo() { this.editor.delete(this.text.length); }
}

class CommandHistory {
  private history: Command[] = [];
  private index = -1;
  execute(cmd: Command) {
    cmd.execute();
    this.history = this.history.slice(0, this.index + 1);
    this.history.push(cmd);
    this.index++;
  }
  undo() { if (this.index >= 0) this.history[this.index--].undo(); }
  redo() { if (this.index < this.history.length - 1) this.history[++this.index].execute(); }
}
```

### 3.6 State 模式（TypeScript 状态机）

```typescript
type State = 'idle' | 'loading' | 'success' | 'error';

class FetchStateMachine {
  private state: State = 'idle';
  transition(event: 'FETCH' | 'SUCCESS' | 'ERROR' | 'RESET') {
    const map: Record<State, Partial<Record<string, State>>> = {
      idle: { FETCH: 'loading' },
      loading: { SUCCESS: 'success', ERROR: 'error' },
      success: { RESET: 'idle', FETCH: 'loading' },
      error: { RESET: 'idle', FETCH: 'loading' },
    };
    const next = map[this.state][event];
    if (next) this.state = next;
    return this.state;
  }
}
```

### 3.7 satisfies 精确推断模式

```typescript
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
} satisfies { apiUrl: `https://${string}`; timeout: number; retries?: number };

// config.apiUrl 推断为字面量 "https://api.example.com"
```

### 4.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 语言模式 很简单无需学习 | 深入理解能避免隐蔽 bug 和性能陷阱 |
| 理论脱离实际 | 理论指导实践中的架构决策 |
| 任何场景都要用设计模式 | 过度设计会增加复杂度；KISS 优先 |
| TypeScript 类型系统只是文档 | 类型可用于编译期约束、代码生成和 IDE 智能提示 |

### 4.3 扩展阅读

#### 设计模式权威资源

- [Refactoring Guru — Design Patterns](https://refactoring.guru/design-patterns)
- [Refactoring Guru — Command Pattern](https://refactoring.guru/design-patterns/command)
- [Refactoring Guru — State Pattern](https://refactoring.guru/design-patterns/state)
- [Patterns.dev](https://www.patterns.dev/)
- [JavaScript Design Patterns (Addy Osmani)](https://addyosmani.com/resources/essentialjsdesignpatterns/book/)
- [Gamma et al. — Design Patterns (GoF)](https://en.wikipedia.org/wiki/Design_Patterns)

#### TypeScript 深度资源

- [TypeScript Handbook — Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [TypeScript satisfies Operator (4.9)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)
- [Effective TypeScript (Dan Vanderkam)](https://effectivetypescript.com/)
- [TypeScript Deep Dive (basarat)](https://basarat.gitbook.io/typescript/)
- [Total TypeScript (Matt Pocock)](https://www.totaltypescript.com/)
- [fp-ts — Functional Programming in TypeScript](https://gcanti.github.io/fp-ts/)

#### 通用参考

- [MDN Web Docs](https://developer.mozilla.org)
- `30-knowledge-base/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
