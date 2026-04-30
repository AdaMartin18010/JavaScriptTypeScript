---
title: "计算范式的范畴论统一模型"
description: "从命令式、函数式、面向对象、响应式的具体代码出发，理解它们背后的范畴结构"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: complete
priority: P1
actual-length: ~9500 words
references:
  - Moggi, Notions of Computation and Monads (1991)
  - Jacobs, Categorical Logic and Type Theory (1999)
---

# 计算范式的范畴论统一模型

> **理论深度**: 中级
> **前置阅读**: [01-category-theory-primer-for-programmers.md](01-category-theory-primer-for-programmers.md), [04-monads-algebraic-effects-comparison.md](04-monads-algebraic-effects-comparison.md)
> **目标读者**: 语言设计者、架构师
> **核心问题**: 命令式、函数式、面向对象、响应式——这些范式的差异是本质的，还是只是"语法糖"？

---

## 目录

- [计算范式的范畴论统一模型](#计算范式的范畴论统一模型)
  - [目录](#目录)
  - [0. 同一个问题，四种写法](#0-同一个问题四种写法)
  - [1. 命令式编程：State Monad 的 Kleisli 范畴](#1-命令式编程state-monad-的-kleisli-范畴)
    - [1.1 状态变换的范畴直觉](#11-状态变换的范畴直觉)
    - [1.2 赋值语句的范畴论语义](#12-赋值语句的范畴论语义)
    - [1.3 Kleisli 组合：命令式的真正结构](#13-kleisli-组合命令式的真正结构)
  - [2. 函数式编程：笛卡尔闭范畴](#2-函数式编程笛卡尔闭范畴)
    - [2.1 纯函数与引用透明](#21-纯函数与引用透明)
    - [2.2 惰性求值与无限对象](#22-惰性求值与无限对象)
    - [2.3 函数式抽象的范畴论价值](#23-函数式抽象的范畴论价值)
  - [3. 面向对象编程：F-余代数范畴](#3-面向对象编程f-余代数范畴)
    - [3.1 对象作为状态机](#31-对象作为状态机)
    - [3.2 继承与子类型多态的范畴论解释](#32-继承与子类型多态的范畴论解释)
    - [3.3 OOP 范畴模型的局限](#33-oop-范畴模型的局限)
  - [4. 响应式编程：时间索引范畴](#4-响应式编程时间索引范畴)
    - [4.1 Signal 与 Event Stream](#41-signal-与-event-stream)
    - [4.2 响应式算子的范畴结构](#42-响应式算子的范畴结构)
  - [5. JS/TS 的多范式混合：范畴论语义下的统一](#5-jsts-的多范式混合范畴论语义下的统一)
    - [5.1 效应系统的视角](#51-效应系统的视角)
    - [5.2 范式选择作为范畴选择](#52-范式选择作为范畴选择)
  - [6. 反例：范畴论模型的盲区](#6-反例范畴论模型的盲区)
  - [参考文献](#参考文献)

---

## 0. 同一个问题，四种写法

假设你要实现一个计数器，支持增加、减少、获取当前值。四种范式会写出完全不同的代码：

```typescript
// ========== 命令式 ==========
let count = 0;
function increment() { count++; }
function decrement() { count--; }
function getCount() { return count; }

// ========== 函数式 ==========
const createCounter = (initial: number) => {
  let count = initial; // 闭包状态
  return {
    increment: () => { count++; },
    decrement: () => { count--; },
    getCount: () => count
  };
};

// ========== 面向对象 ==========
class Counter {
  private count = 0;
  increment() { this.count++; }
  decrement() { this.count--; }
  getCount() { return this.count; }
}

// ========== 响应式 ==========
import { BehaviorSubject } from 'rxjs';
const count$ = new BehaviorSubject(0);
// count$.next(count$.value + 1) 来递增
// count$.subscribe(console.log) 来监听
```

范畴论的核心洞见是：**这些代码不是"做不同的事"，而是在"不同的范畴"中做同一件事——组合计算**。

- 命令式在 **Kleisli(State)** 范畴中组合
- 函数式在 **笛卡尔闭范畴** 中组合
- 面向对象在 **F-余代数** 范畴中组合
- 响应式在 **时间索引范畴** 中组合

理解这一点，你就能在适当的场景选择适当的范式，而不是被某种"信仰"束缚。

---

## 1. 命令式编程：State Monad 的 Kleisli 范畴

### 1.1 状态变换的范畴直觉

命令式编程的核心是**状态变换**。你写了一系列语句，每条语句都读取当前状态并产生新状态。在范畴论中，这对应于**Kleisli 范畴**——一种"在单子内部"进行组合的范畴。

```typescript
// 状态变换的类型：S -> (A, S)
// 读作：给定旧状态 S，产生一个值 A 和新状态 S
type State<S, A> = (s: S) => [A, S];

// 示例：银行账户状态
type BankState = {
  balance: number;
  transactions: string[];
};

// 存款：状态变换
deposit(100): State<BankState, void>
// 输入: { balance: 50, transactions: [] }
// 输出: [undefined, { balance: 150, transactions: ['Deposited 100'] }]

// ========== 没有 Kleisli 视角时 ==========
function depositManual(amount: number, state: BankState): BankState {
  return {
    balance: state.balance + amount,
    transactions: [...state.transactions, `Deposited ${amount}`]
  };
}

function withdrawManual(amount: number, state: BankState): BankState {
  if (state.balance < amount) throw new Error('Insufficient funds');
  return {
    balance: state.balance - amount,
    transactions: [...state.transactions, `Withdrew ${amount}`]
  };
}

// 组合两个操作：手动传递状态
function transferManual(
  fromState: BankState,
  toState: BankState,
  amount: number
): [BankState, BankState] {
  const newFrom = withdrawManual(amount, fromState);
  const newTo = depositManual(amount, toState);
  return [newFrom, newTo];
}
// 问题：状态传递是 ad-hoc 的。如果再加一个中间检查？

// ========== 有了 Kleisli 视角 ==========
const deposit = (amount: number): State<BankState, void> =>
  (state) => [
    undefined,
    {
      balance: state.balance + amount,
      transactions: [...state.transactions, `Deposited ${amount}`]
    }
  ];

const withdraw = (amount: number): State<BankState, void> =>
  (state) => {
    if (state.balance < amount) throw new Error('Insufficient funds');
    return [
      undefined,
      {
        balance: state.balance - amount,
        transactions: [...state.transactions, `Withdrew ${amount}`]
      }
    ];
  };

// Kleisli 组合：自动传递状态
const kleisliCompose = <S, A, B>(
  f: State<S, A>,
  g: State<S, B>
): State<S, B> =>
  (s) => {
    const [_, s1] = f(s);   // 执行 f，忽略返回值，获取新状态
    return g(s1);            // 用新状态执行 g
  };

// 现在组合是结构化的
const depositThenWithdraw = kleisliCompose(
  deposit(100),
  withdraw(50)
);

const initialState: BankState = { balance: 0, transactions: [] };
const [_, finalState] = depositThenWithdraw(initialState);
console.log(finalState.balance); // 50
```

### 1.2 赋值语句的范畴论语义

```typescript
// x = e 在范畴论语义中是什么？

// 它是状态变换的一个特例：
// assign(x, e): State<S, void> = s => [undefined, s[x := eval(e, s)]]

const assign = <S extends Record<string, any>, K extends keyof S>(
  key: K,
  value: S[K]
): State<S, void> =>
  (s) => [
    undefined,
    { ...s, [key]: value }
  ];

// 读变量是另一个操作
const read = <S extends Record<string, any>, K extends keyof S>(
  key: K
): State<S, S[K]> =>
  (s) => [s[key], s];

// 用这些原语构造更复杂的操作
const complexOperation: State<{ a: number; b: number }, number> =
  (s) => {
    const [aVal, s1] = read('a')(s);
    const [_, s2] = assign('b', aVal * 2)(s1);
    const [bVal, s3] = read('b')(s2);
    return [bVal, s3];
  };

// 这正是命令式代码 "const temp = a; b = temp * 2; return b;" 的范畴论语义
```

### 1.3 Kleisli 组合：命令式的真正结构

```typescript
// Kleisli 组合的核心：态射不是 A -> B，而是 A -> M(B)
// 其中 M 是某个"效应"（这里是 State）

// 这使得命令式代码可以被"纯化"：
// 任何命令式程序都可以重写为纯函数 + State Monad

// 例如，这个命令式函数：
function imperativeSum(n: number): number {
  let sum = 0;           // 初始化状态
  for (let i = 1; i <= n; i++) {
    sum += i;            // 状态变换
  }
  return sum;            // 提取结果
}

// 它的纯函数版本：
type SumState = { sum: number; i: number };

const sumLoop: State<SumState, number> = (s) => {
  if (s.i > 10) return [s.sum, s];
  return sumLoop({ sum: s.sum + s.i, i: s.i + 1 });
};

// 或者用 Kleisli 组合写得更优雅
const sumKleisli = (n: number): State<{ sum: number }, number> => {
  const step: State<{ sum: number; i: number }, void> =
    (s) => [undefined, { sum: s.sum + s.i, i: s.i + 1 }];

  // ... 这里展示了命令式循环如何用递归 + Kleisli 组合表达
  return (s) => [s.sum + (n * (n + 1)) / 2, s]; // 直接公式
};

// 真正的价值：命令式代码的"纯化"让我们可以测试和推理
// 因为 State 变换是显式的，不是隐式的全局状态
```

---

## 2. 函数式编程：笛卡尔闭范畴

### 2.1 纯函数与引用透明

```typescript
// 函数式编程的核心：所有函数都是纯函数
// 纯函数 = 相同的输入永远产生相同的输出，且无副作用

// ========== 对比：不纯 vs 纯 ==========

// 不纯函数
let globalCounter = 0;
function impureIncrement(): number {
  globalCounter++;
  return globalCounter;
}

// 纯函数
const pureIncrement = (counter: number): [number, number] =>
  [counter + 1, counter + 1]; // [新值, 返回值]

// 不纯函数的结果不可预测：
console.log(impureIncrement()); // 1
console.log(impureIncrement()); // 2 —— 同样的"调用"，不同结果！

// 纯函数的结果永远可预测：
console.log(pureIncrement(0)); // [1, 1]
console.log(pureIncrement(0)); // [1, 1] —— 永远相同

// ========== 引用透明 ==========
// 引用透明意味着：函数调用可以被它的返回值替换，而不改变程序语义

// 不纯代码中，替换不成立：
const x = impureIncrement();
const y = impureIncrement();
// 不能替换为 const x = 1; const y = 1;

// 纯代码中，替换成立：
const a = pureIncrement(0);
// 可以替换为 const a = [1, 1];

// 范畴论语义：
// 纯函数是真正的"态射"——它们只依赖于输入和输出类型
// 不纯函数不是态射，因为它们还依赖隐式的"环境"（状态、IO、时间）
```

### 2.2 惰性求值与无限对象

```typescript
// 惰性求值允许你处理"无限"数据结构

// 无限的自然数流
function* naturals(): Generator<number> {
  let n = 0;
  while (true) yield n++;
}

// 惰性求值对应范畴论中的"终 coalgebra"
// 一个无限流可以看作：Stream<A> = { head: A; tail: Stream<A> }

interface Stream<A> {
  head: A;
  tail: () => Stream<A>; // 惰性 tail
}

const makeStream = <A>(head: A, getTail: () => Stream<A>): Stream<A> => ({
  head,
  tail: getTail
});

const natStream = (n: number): Stream<number> =>
  makeStream(n, () => natStream(n + 1));

// 取前 5 个
const take = <A>(stream: Stream<A>, n: number): A[] => {
  if (n <= 0) return [];
  return [stream.head, ...take(stream.tail(), n - 1)];
};

console.log(take(natStream(0), 5)); // [0, 1, 2, 3, 4]

// 在严格的（eager）求值语言中，无限递归会崩溃
// 但在惰性求值中，只有被访问的部分才会被计算
// 这对应范畴论中 "无限对象作为极限" 的构造
```

### 2.3 函数式抽象的范畴论价值

```typescript
// 函数式编程的真正力量：高阶函数作为"结构"

// 任何命令式循环都可以抽象为高阶函数

// map：对列表的每个元素应用函数
const map = <A, B>(arr: A[], f: (a: A) => B): B[] =>
  arr.reduce((acc, a) => [...acc, f(a)], [] as B[]);

// filter：选择满足条件的元素
const filter = <A>(arr: A[], pred: (a: A) => boolean): A[] =>
  arr.reduce((acc, a) => pred(a) ? [...acc, a] : acc, [] as A[]);

// reduce：折叠列表为单一值
const reduce = <A, B>(arr: A[], f: (b: B, a: A) => B, init: B): B => {
  let acc = init;
  for (const a of arr) acc = f(acc, a);
  return acc;
};

// 这些高阶函数是"多态态射"——它们在所有类型上"自然"工作
// map: ∀A,B. (A -> B) -> ([A] -> [B])
// 这是一个自然变换！

// 函数式代码的可组合性：
const process = (data: number[]): string[] =>
  data
    .filter(x => x > 0)
    .map(x => x * 2)
    .map(x => x.toString());

// 这个管道是态射的组合：
// filter > 0 : [number] -> [number]
// map (*2) : [number] -> [number]
// map toString : [number] -> [string]
// process = map(toString) ∘ map(*2) ∘ filter(>0)
```

---

## 3. 面向对象编程：F-余代数范畴

### 3.1 对象作为状态机

```typescript
// 在范畴论语义中，对象 = 状态 + 方法集合
// 方法 = 从当前状态到（返回值 + 新状态）的映射

// 这正是 F-余代数的定义：
// 给定一个函子 F，F-余代数是态射 S -> F(S)
// 其中 S 是状态类型

// 例如，一个计数器的 F-余代数：
type CounterState = { value: number };

// 方法签名决定了"F"的形状：
// increment: S -> S（无返回值，只改变状态）
// getValue: S -> number × S（返回值，状态不变）

type CounterF<S> = {
  increment: S;
  getValue: [number, S];
};

// 余代数结构：
const counterCoalgebra = (state: CounterState): CounterF<CounterState> => ({
  increment: { value: state.value + 1 },
  getValue: [state.value, state]
});

// 这看起来不像 OOP？让我们用 class 重写：
class CounterOOP {
  private state: CounterState = { value: 0 };

  increment() {
    this.state = counterCoalgebra(this.state).increment;
  }

  getValue(): number {
    return counterCoalgebra(this.state).getValue[0];
  }
}

// 等价！OOP 的 this 就是余代数中的状态 S
// 方法调用就是应用余代数结构然后更新状态
```

### 3.2 继承与子类型多态的范畴论解释

```typescript
// 继承对应于"余代数同态"

interface AnimalCoalgebra<S> {
  speak: [string, S]; // 返回值 + 新状态
}

interface DogCoalgebra<S> extends AnimalCoalgebra<S> {
  bark: [string, S]; // 额外的方法
}

// Dog 的余代数可以"投影"到 Animal 的余代数
// 这就是子类型多态：Dog ≤ Animal

// 实际 TypeScript 代码：
class Animal {
  protected name: string;
  constructor(name: string) { this.name = name; }
  speak(): string { return `${this.name} makes a sound`; }
}

class Dog extends Animal {
  private breed: string;
  constructor(name: string, breed: string) {
    super(name);
    this.breed = breed;
  }
  speak(): string { return `${this.name} barks`; }
  getBreed(): string { return this.breed; }
}

// 子类型多态：
const myDog: Dog = new Dog('Rex', 'Labrador');
const myAnimal: Animal = myDog; // Dog ≤ Animal

// 范畴论语义：
// 存在态射 Dog -> Animal（向上转型）
// 这是由 Dog 的额外结构"遗忘"（forget）掉得到的
// 所以继承 = 遗忘函子（Forgetful Functor）
```

### 3.3 OOP 范畴模型的局限

```typescript
// 反例 1: 可变状态破坏了纯函数假设
class MutableCounter {
  count = 0;
  increment() { this.count++; }
}
// counter.increment() 不是纯函数，因为它没有明确的输入输出

// 反例 2: this 绑定的动态性
const counter = new MutableCounter();
const increment = counter.increment;
increment(); // this 是 undefined！NaN

// 反例 3: 原型链不是严格的范畴论结构
function Foo() {}
Foo.prototype.bar = 1;
const foo = new Foo();
// 属性查找是运行时动态解析的，不是态射组合

// 反例 4: 多重继承/混入的复杂性
// TS 不支持真正的多重继承
// mixin 模式破坏了简单的范畴论模型
```

---

## 4. 响应式编程：时间索引范畴

### 4.1 Signal 与 Event Stream

```typescript
// 响应式编程的核心直觉：值随时间变化

// Signal<A> = Time -> A
// 在每个时间点 t，Signal 有一个确定的值 A(t)

type Time = number;
type Signal<A> = (time: Time) => A;

// 示例：鼠标位置信号
const mouseX: Signal<number> = (time) => {
  // 在实际实现中，这会查询当前鼠标位置
  return Math.sin(time / 1000) * 100; // 模拟
};

// Event Stream = 离散时间点上的值序列
type Event<A> = Array<[Time, A]>;

// 信号的组合对应范畴论中的积：
const combineSignals = <A, B>(sigA: Signal<A>, sigB: Signal<B>): Signal<[A, B]> =>
  (time) => [sigA(time), sigB(time)];

// 这就像是 Promise.all，但是在连续的时间域上

// 实际实现（RxJS 风格）：
import { Observable, combineLatest } from 'rxjs';

const signalA$ = new Observable<number>(observer => {
  let i = 0;
  const id = setInterval(() => observer.next(i++), 1000);
  return () => clearInterval(id);
});

const signalB$ = new Observable<string>(observer => {
  const values = ['a', 'b', 'c'];
  let i = 0;
  const id = setInterval(() => observer.next(values[i++ % 3]), 1500);
  return () => clearInterval(id);
});

// combineLatest 是积的极限在响应式中的体现
const combined$ = combineLatest([signalA$, signalB$]);
// combined$ 发出 [number, string] 对
```

### 4.2 响应式算子的范畴结构

```typescript
// 响应式算子也有函子性

// map: (A -> B) -> (Signal<A> -> Signal<B>)
const mapSignal = <A, B>(sig: Signal<A>, f: (a: A) => B): Signal<B> =>
  (time) => f(sig(time));

// 验证函子律：
const sig: Signal<number> = (t) => t;
const f = (x: number) => x * 2;
const g = (x: number) => x.toString();

// F(id) = id
const mappedId = mapSignal(sig, x => x);
console.log(mappedId(10) === sig(10)); // true ✅

// F(g ∘ f) = F(g) ∘ F(f)
const left = mapSignal(sig, x => g(f(x)));
const right = mapSignal(mapSignal(sig, f), g);
console.log(left(10) === right(10)); // true ✅

// merge 是余积在响应式中的体现
const mergeSignals = <A>(sigA: Signal<A>, sigB: Signal<A>): Signal<A> =>
  (time) => {
    // 简化的 merge：选择最近更新的值
    // 实际实现更复杂
    return Math.random() > 0.5 ? sigA(time) : sigB(time);
  };

// scan 是 fold/reduce 在响应式时间域上的体现
// scan(f, init)(Signal<A>) = Signal<B>
// 其中 B(t) = fold(f, init)([A(0), A(1), ..., A(t)])
```

---

## 5. JS/TS 的多范式混合：范畴论语义下的统一

### 5.1 效应系统的视角

```typescript
// 范畴论的真正力量：不同范式只是"效应"的不同包装方式

// 纯函数：Identity 单子（无效应）
const pure = (x: number): number => x + 1;

// 命令式状态：State 单子
type StateEffect<S, A> = (s: S) => [A, S];

// 错误处理：Either 单子
type ErrorEffect<E, A> = { tag: 'ok'; value: A } | { tag: 'err'; error: E };

// 异步：Promise 单子
type AsyncEffect<A> = Promise<A>;

// 非确定性：List/Array 单子
type NonDetEffect<A> = A[];

// 日志：Writer 单子
type WriterEffect<W, A> = [A, W[]];

// ========== 效应的组合 ==========
// 实际程序通常需要多种效应：异步 + 错误 + 状态

// 不使用范畴论：嵌套回调地狱
function nestedEffects(): void {
  let state = { count: 0 };

  fetch('/api/data')
    .then(res => {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    })
    .then(data => {
      state.count += data.length;
      return processData(data);
    })
    .catch(err => {
      console.error(err);
      state.count = 0;
    });
}

// 使用范畴论（单子变换器 / 代数效应）：
// async function cleanEffects(): Eff<Async & Error & State, Result> {
//   const data = await fetch('/api/data');
//   const processed = await processData(data);
//   yield* updateState(s => ({ count: s.count + processed.length }));
//   return processed;
// }
// 注：JS/TS 目前没有原生代数效应，但可以用生成器或库模拟
```

### 5.2 范式选择作为范畴选择

```typescript
// 范畴论教给你的不是"用哪个范式"，而是"这个计算在哪个范畴中表达最自然"

// 场景 1：数据转换管道
// 最自然：函数式（笛卡尔闭范畴）
const pipeline = (data: RawData): ProcessedData =>
  data
    .filter(isValid)
    .map(normalize)
    .map(enrich)
    .reduce(merge, emptyResult);

// 场景 2：需要维护可变状态的游戏循环
// 最自然：命令式（State Monad）
type GameState = { player: Player; enemies: Enemy[]; score: number };
const gameTick = (input: Input): State<GameState, RenderCommand> =>
  (state) => {
    const newState = updatePhysics(input, state);
    const commands = render(newState);
    return [commands, newState];
  };

// 场景 3：需要封装和接口的大型系统
// 最自然：面向对象（F-余代数）
interface Repository<T> {
  find(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

// 场景 4：实时数据流
// 最自然：响应式（时间索引范畴）
interface DataStream<A> {
  subscribe(observer: (value: A) => void): () => void;
  map<B>(f: (a: A) => B): DataStream<B>;
  filter(pred: (a: A) => boolean): DataStream<A>;
  scan<B>(f: (acc: B, a: A) => B, init: B): DataStream<B>;
}
```

---

## 6. 反例：范畴论模型的盲区

```typescript
// 反例 1: 性能差异
// 范畴论说 map(f).map(g) 和 map(x => g(f(x))) "相等"
// 但从性能角度，前者创建中间数组，后者不创建

const arr = new Array(1000000).fill(0).map((_, i) => i);

// 慢：创建中间数组
const slow = arr.map(x => x * 2).map(x => x + 1);

// 快：单次遍历
const fast = arr.map(x => x * 2 + 1);

// 反例 2: 内存管理
// 函数式风格创建大量中间对象
// 命令式风格可以复用内存

// 反例 3: 调试和错误追踪
// 纯函数的栈追踪清晰
// 但 async/await 的栈追踪在 Promise 边界处断裂

// 反例 4: 范畴论无法捕捉"用户体验"
// 两个 API 在范畴论语义上可能等价
// 但一个返回 200ms，一个返回 2s

// 反例 5: 安全性和权限
// 范畴论不区分"能执行"和"被允许执行"
// 一个纯函数可以在数学上等价于另一个
// 但一个可能读取敏感数据，另一个不读

// 反例 6: 真实世界的 OOP 不符合范畴论模型
// 原型链、Reflect、Proxy、eval 都破坏了简单的代数结构
const obj = {};
Object.defineProperty(obj, 'dynamic', {
  get() { return Math.random(); }
});
// obj.dynamic 每次调用结果不同
// 这不是任何范畴论意义上的"态射"
```

---

## 参考文献

1. Moggi, E. (1991). "Notions of Computation and Monads." *Information and Computation*, 93(1), 55-92.
2. Jacobs, B. (1999). *Categorical Logic and Type Theory*. Elsevier.
3. Rutten, J. J. M. M. (2000). "Universal Coalgebra: A Theory of Systems." *Theoretical Computer Science*, 249(1), 3-80.
4. Elliott, C. (2009). "Push-Pull Functional Reactive Programming." *Haskell Symposium*.
