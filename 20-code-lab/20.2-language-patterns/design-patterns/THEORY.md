# 设计模式理论基础

> GoF (Gang of Four) 设计模式的理论根基与形式化论证

---

## 1. 简介

本文档深入探讨设计模式的理论基础，包括其哲学根基、SOLID 原则的形式化定义，以及各类设计模式的数学模型。

**学习目标**:
- 理解设计模式的本质和价值
- 掌握 SOLID 原则的理论依据
- 能够根据场景选择合适的设计模式

---

## 2. 理论基础

### 2.1 设计模式的哲学基础

### 1. 设计模式的本质

设计模式不是代码复用，而是**设计经验复用**。它们代表了在特定上下文中对反复出现的问题的通用解决方案。

> "Each pattern describes a problem which occurs over and over again in our environment, and then describes the core of the solution to that problem, in such a way that you can use this solution a million times over, without ever doing it the same way twice."
> — Christopher Alexander

### 2. 设计原则（SOLID）的理论论证

#### S - 单一职责原则 (Single Responsibility Principle)

**理论基础**：

- 内聚性（Cohesion）的数学度量
- 信息隐藏（Information Hiding）原则

**形式化论证**：
设类 C 有 n 个方法 M = {m₁, m₂, ..., mₙ}，每个方法改变一个职责 R = {r₁, r₂, ..., rₘ}

内聚性 LCOM (Lack of Cohesion of Methods) =

```
|P| - |Q|
```

其中：

- P = {(mᵢ, mⱼ) | mᵢ 和 mⱼ 不共享任何实例变量}
- Q = {(mᵢ, mⱼ) | mᵢ 和 mⱼ 共享实例变量}

**结论**：LCOM 越低，内聚性越高，维护成本越低。

#### O - 开闭原则 (Open/Closed Principle)

**理论基础**：

- 模块稳定性与抽象程度的关系
- Bertrand Meyer 的契约式设计

**经济论证**：

```
修改现有代码的成本 = 理解成本 + 测试成本 + 风险成本
扩展新代码的成本 = 实现成本 + 测试成本

当系统复杂度达到临界点时：
修改成本 >> 扩展成本
```

#### L - 里氏替换原则 (Liskov Substitution Principle)

**理论基础**：

- 行为子类型（Behavioral Subtyping）
- 前置条件减弱、后置条件增强的契约理论

**形式化定义**：
对于类型 T 的对象 x，类型 S 的对象 y：

```
∀φ: 若 φ(x) 成立，则 φ(y) 也成立
```

其中 φ 是基于 T 的可证明性质

#### I - 接口隔离原则 (Interface Segregation Principle)

**理论基础**：

- 最小知识原则（Principle of Least Knowledge）
- 编译依赖理论

**论证**：
大型接口导致：

1. 不必要的重新编译
2. 实现者被迫实现不需要的方法
3. 客户端依赖不需要的方法

#### D - 依赖倒置原则 (Dependency Inversion Principle)

**理论基础**：

- 稳定依赖原则（Stable Dependencies Principle）
- 抽象稳定性定理

**架构论证**：

```
高层模块（策略）→ 应该稳定
低层模块（细节）→ 经常变化

依赖方向应该是：
细节 → 抽象 ← 策略
```

## 创建型模式的理论分析

### 单例模式 (Singleton)

**数学基础**：

- 唯一性保证：∃!x ∈ Singleton
- 全局可访问性：∀y, Accessible(y, x)

**并发理论**：

- DCL (Double-Checked Locking) 的正确性证明
- happens-before 关系的建立

**反模式警示**：
单例本质上是全局变量，违反了：

1. 封装性
2. 可测试性
3. 并发安全性

**适用条件**（形式化）：

```
使用单例当且仅当：
1. ∀t ∈ Time, Count(Instance) = 1
2. 实例化成本 > 同步开销
3. 状态不需要在不同上下文中变化
```

### 工厂模式 (Factory)

**类型理论**：
工厂模式实现了**抽象产品类型**的构造，将类型构造与使用分离。

**范畴论视角**：

```
Factory: C → D
其中 C 是参数类型范畴，D 是产品类型范畴
```

### 建造者模式 (Builder)

**组合数学**：
对于具有 n 个可选参数的类，建造者避免了 2ⁿ 个构造函数的组合爆炸。

**渐进构造理论**：

```
部分构造对象的不变性保持：
∀step ∈ BuildSteps, Invariant(partialObject) = true
```

## 结构型模式的理论分析

### 适配器模式 (Adapter)

**类型系统理论**：
适配器是一种类型转换器，满足：

```
Adapter: TargetInterface → AdapteeInterface
使得：∀m ∈ TargetInterface.methods,
      Adapter(m) 语义等价于 Adaptee 对应操作
```

### 装饰器模式 (Decorator)

**组合理论**：
装饰器实现了**透明组合**，满足：

```
Component = Leaf | Composite
Decorator(Component) 的行为 = Component 的行为 + 新增行为
```

**递归结构**：

```
Dₙ(Dₙ₋₁(...(D₁(Base))...))
总成本 = Σ(cost(Dᵢ)) + cost(Base)
```

### 代理模式 (Proxy)

**控制理论**：
代理作为被控对象的控制器，引入控制流：

```
Client → Proxy Controller → RealSubject
         ↓
    [Access Control | Caching | Logging]
```

**延迟加载的经济学论证**：

```
设：
- 对象加载成本 = C
- 使用概率 = p
- 不使用概率 = 1-p

期望成本（直接加载）= C
期望成本（代理延迟加载）= p × C + (1-p) × ε

当 p < 1 - ε/C 时，代理更有利
```

## 行为型模式的理论分析

### 观察者模式 (Observer)

**发布-订阅系统的形式化**：

```
Subject: State → 2^Observer
notify: ΔState → ∀obs ∈ Observer, obs.update(ΔState)
```

**事件传播的复杂度分析**：

- 时间复杂度：O(|Observers|)
- 空间复杂度：O(|Observers| × |State|)

**循环依赖问题**：

```
观察者 A 观察 B
观察者 B 观察 A

形成循环更新，可能导致：
1. 无限递归
2. 状态不一致
3. 栈溢出

解决方案：依赖图检测、事件队列异步化
```

### 策略模式 (Strategy)

**算法替换的理论基础**：

```
Context 的行为 = Strategy.apply(Context.state)

策略切换的成本 = 策略对象的创建/切换开销
算法变体数 = n

使用策略模式比继承的优势：
- 运行时切换
- 组合优于继承
- 符合开闭原则
```

### 命令模式 (Command)

**命令作为一等公民**：

```
Command = (Receiver, Action, Parameters)

命令可以：
- 被存储（历史记录）
- 被队列化（延迟执行）
- 被组合（宏命令）
- 被撤销（逆操作）
```

**撤销操作的数学基础**：

```
设操作为函数 f: State → State
撤销操作 f⁻¹ 满足：f⁻¹(f(s)) = s

不是所有操作都有逆操作：
- 可逆：加法、设置值
- 不可逆：删除（需要备忘录）、IO操作
```

## 模式之间的关系

### 层次关系

```
架构模式 > 设计模式 > 惯用法

架构模式定义系统骨架
设计模式定义组件交互
惯用法定义语言特定技巧
```

### 组合关系

某些模式经常一起使用：

1. Factory + Singleton（工厂单例）
2. Strategy + Context（策略上下文）
3. Observer + Mediator（观察者中介）
4. Composite + Visitor（组合访问者）

### 替代关系

```
Strategy ↔ 条件语句
Decorator ↔ 继承
Factory ↔ 直接构造
Observer ↔ 轮询
```

## 反模式 (Anti-patterns)

### 1. 上帝对象 (God Object)

**症状**：一个类知道太多、做太多
**理论解释**：违反单一职责原则，内聚性极低

### 2. 贫血领域模型 (Anemic Domain Model)

**症状**：模型只有数据没有行为
**理论解释**：违反了面向对象的核心——数据与行为封装

### 3. 循环依赖 (Circular Dependency)

**症状**：A依赖B，B依赖A
**理论解释**：破坏了有向无环图（DAG）的模块结构

## 现代编程范式下的模式演进

### 函数式编程中的模式

- Strategy → 高阶函数
- Command → 函数组合
- Observer → 函数响应式编程 (FRP)
- Iterator → 生成器/迭代器协议

### 异步编程中的模式

- Promise 是 Future 模式的实现
- async/await 是 Coroutine 模式的语法糖
- EventEmitter 是 Observer 的异步变体

## 代码示例：可运行的经典模式实现

### 策略模式（高阶函数实现）

```typescript
// strategy-pattern.ts — 运行时算法切换

type PaymentStrategy = (amount: number) => { method: string; fee: number };

const creditCard: PaymentStrategy = (amount) => ({
  method: 'CreditCard',
  fee: amount * 0.025,
});

const paypal: PaymentStrategy = (amount) => ({
  method: 'PayPal',
  fee: amount * 0.029 + 0.30,
});

const crypto: PaymentStrategy = (amount) => ({
  method: 'Crypto',
  fee: amount * 0.005,
});

class PaymentContext {
  constructor(private strategy: PaymentStrategy) {}

  setStrategy(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  checkout(amount: number) {
    const result = this.strategy(amount);
    console.log(`Paid $${amount} via ${result.method}, fee: $${result.fee.toFixed(2)}`);
    return result;
  }
}

// 使用
const cart = new PaymentContext(creditCard);
cart.checkout(100);       // CreditCard
cart.setStrategy(paypal);
cart.checkout(100);       // PayPal
```

### 观察者模式（TypeScript + 类型安全事件）

```typescript
// observer-pattern.ts — 类型安全的发布-订阅

type EventMap = { [key: string]: unknown };

class TypedEventEmitter<Events extends EventMap> {
  private listeners: { [K in keyof Events]?: Array<(payload: Events[K]) => void> } = {};

  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): () => void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(listener);
    return () => {
      this.listeners[event] = this.listeners[event]!.filter((l) => l !== listener);
    };
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    this.listeners[event]?.forEach((l) => l(payload));
  }
}

// 使用
interface AppEvents {
  userLogin: { userId: string; timestamp: number };
  dataChange: { table: string; rowId: number };
}

const bus = new TypedEventEmitter<AppEvents>();

const unsub = bus.on('userLogin', ({ userId }) => {
  console.log(`User ${userId} logged in`);
});

bus.emit('userLogin', { userId: 'u42', timestamp: Date.now() });
unsub();
```

### 命令模式（支持撤销）

```typescript
// command-pattern.ts — 命令队列与撤销栈

interface Command<T> {
  execute(): T;
  undo(): T;
}

class SetValueCommand implements Command<string> {
  private prevValue: string;

  constructor(private target: { value: string }, private newValue: string) {
    this.prevValue = target.value;
  }

  execute() {
    this.target.value = this.newValue;
    return this.target.value;
  }

  undo() {
    this.target.value = this.prevValue;
    return this.target.value;
  }
}

class CommandHistory {
  private history: Command<unknown>[] = [];
  private index = -1;

  execute<T>(cmd: Command<T>): T {
    this.history = this.history.slice(0, this.index + 1);
    this.history.push(cmd);
    this.index++;
    return cmd.execute();
  }

  undo(): unknown | undefined {
    if (this.index < 0) return undefined;
    const cmd = this.history[this.index];
    this.index--;
    return cmd.undo();
  }

  redo(): unknown | undefined {
    if (this.index >= this.history.length - 1) return undefined;
    this.index++;
    return this.history[this.index].execute();
  }
}

// 使用
const state = { value: 'initial' };
const history = new CommandHistory();

history.execute(new SetValueCommand(state, 'first'));
history.execute(new SetValueCommand(state, 'second'));
console.log(state.value); // 'second'
history.undo();
console.log(state.value); // 'first'
history.redo();
console.log(state.value); // 'second'
```

### 装饰器模式（透明包装）

```typescript
// decorator-pattern.ts — 运行时行为增强

interface DataSource {
  write(data: string): void;
  read(): string;
}

class FileDataSource implements DataSource {
  constructor(private filename: string) {}
  private content = '';
  write(data: string) { this.content = data; }
  read() { return this.content; }
}

class EncryptionDecorator implements DataSource {
  constructor(private wrappee: DataSource) {}

  write(data: string) {
    const encrypted = btoa(data); // 简化加密
    this.wrappee.write(encrypted);
  }

  read() {
    const encrypted = this.wrappee.read();
    try { return atob(encrypted); } catch { return encrypted; }
  }
}

class CompressionDecorator implements DataSource {
  constructor(private wrappee: DataSource) {}

  write(data: string) {
    const compressed = data.replace(/(.)+/g, (m, c) => m.length + c); // RLE 简化
    this.wrappee.write(compressed);
  }

  read() {
    const compressed = this.wrappee.read();
    return compressed.replace(/(\d+)(.)/g, (_, n, c) => c.repeat(Number(n)));
  }
}

// 使用：压缩 + 加密 + 文件存储
const source = new EncryptionDecorator(new CompressionDecorator(new FileDataSource('data.txt')));
source.write('aaaabbbcc');
console.log(source.read()); // 'aaaabbbcc'
```

## 6. 参考文献

### 6.1 经典著作

1. Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
2. Fowler, M. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley.
3. Freeman, E., & Freeman, E. (2004). *Head First Design Patterns*. O'Reilly Media.

### 6.2 学术论文

1. Aldrich, J. (2013). "The Power of Interoperability: Why Objects Are Inevitable". *ACM SIGPLAN Notices*.
2. Cook, W. R. (2009). "On Understanding Data Abstraction, Revisited". *ACM SIGPLAN Notices*.

### 6.3 在线资源

- [Refactoring.Guru - Design Patterns](https://refactoring.guru/design-patterns) - 交互式设计模式教程
- [SourceMaking - Design Patterns](https://sourcemaking.com/design_patterns) - 设计模式与反模式参考
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID) - SOLID 原则维基百科
- [GoF Design Patterns — SourceMaking](https://sourcemaking.com/design_patterns)
- [Martin Fowler — Patterns of Enterprise Application Architecture](https://martinfowler.com/eaaCatalog/)
- [Christopher Alexander — A Pattern Language](https://en.wikipedia.org/wiki/A_Pattern_Language)
- [Microsoft — Design Patterns in .NET](https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm)
- [Angular — Dependency Injection Pattern](https://angular.io/guide/dependency-injection)
- [React — Composition vs Inheritance](https://reactjs.org/docs/composition-vs-inheritance.html)
- [MDN — Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `index.ts`

> **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> **理论深化更新：2026-04-27**
