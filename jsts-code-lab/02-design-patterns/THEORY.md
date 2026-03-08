# 设计模式理论基础

## 设计模式的哲学基础

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

## 参考资源

### 经典著作

1. Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*
2. Fowler, M. (2002). *Patterns of Enterprise Application Architecture*
3. Freeman, E., & Freeman, E. (2004). *Head First Design Patterns*

### 学术论文

1. Aldrich, J. (2013). "The Power of Interoperability: Why Objects Are Inevitable"
2. Cook, W. R. (2009). "On Understanding Data Abstraction, Revisited"

### 在线资源

- [Refactoring.Guru](https://refactoring.guru/design-patterns)
- [SourceMaking](https://sourcemaking.com/design_patterns)
