---
title: "函子与自然变换在 JavaScript/TypeScript 中的体现"
description: "从 Array.map 到 Promise.then，系统分析 JS/TS 中的函子性和自然性，附大量可运行示例"
last-updated: 2026-04-30
review-cycle: 6 months
next-review: 2026-10-30
status: complete
priority: P1
actual-length: ~9500 words
references:
  - Mac Lane, Categories for the Working Mathematician (1998)
  - Milewski, Category Theory for Programmers (2019)
---

# 函子与自然变换在 JavaScript/TypeScript 中的体现

> **理论深度**: 中级
> **前置阅读**: [01-category-theory-primer-for-programmers.md](01-category-theory-primer-for-programmers.md)
> **目标读者**: 函数式编程爱好者、库设计者
> **核心问题**: "map" 这个词出现在 Array、Promise、Option、Tree、Observable 中，是巧合吗？

---

## 目录

- [函子与自然变换在 JavaScript/TypeScript 中的体现](#函子与自然变换在-javascripttypescript-中的体现)
  - [目录](#目录)
  - [0. 为什么每个库都有自己的 "map"？](#0-为什么每个库都有自己的-map)
  - [1. 协变函子：你每天都在写的结构保持映射](#1-协变函子你每天都在写的结构保持映射)
    - [1.1 Array.map：函子的教科书案例](#11-arraymap函子的教科书案例)
    - [1.2 Promise.then：异步计算容器的函子](#12-promisethen异步计算容器的函子)
    - [1.3 Option/Maybe：空值处理的函子视角](#13-optionmaybe空值处理的函子视角)
    - [1.4 Tree.map：递归结构的函子性](#14-treemap递归结构的函子性)
    - [1.5 违反函子律的代价：一个调试噩梦](#15-违反函子律的代价一个调试噩梦)
  - [2. 反变函子：箭头方向的反转](#2-反变函子箭头方向的反转)
    - [2.1 函数参数位置的反变性](#21-函数参数位置的反变性)
    - [2.2 Comparator：反变函子的实战](#22-comparator反变函子的实战)
    - [2.3 协变与反变的混合：函数类型的完整图景](#23-协变与反变的混合函数类型的完整图景)
  - [3. 双函子：两个容器的组合映射](#3-双函子两个容器的组合映射)
    - [3.1 Promise.all 作为积双函子](#31-promiseall-作为积双函子)
    - [3.2 Either.bimap：错误和成功同时映射](#32-eitherbimap错误和成功同时映射)
  - [4. 自然变换：与 map 可交换的转换](#4-自然变换与-map-可交换的转换)
    - [4.1 Array.flat 的自然性：严格证明](#41-arrayflat-的自然性严格证明)
    - [4.2 head 不是自然变换：为什么安全提取容器首元素不可能](#42-head-不是自然变换为什么安全提取容器首元素不可能)
    - [4.3 长度函数也不是自然变换](#43-长度函数也不是自然变换)
  - [5. 函子的组合与嵌套](#5-函子的组合与嵌套)
    - [5.1 函子组合的编程实现](#51-函子组合的编程实现)
    - [5.2 Promise\<Array\> 的双重函子性](#52-promisearray-的双重函子性)
  - [6. TS 类型系统与范畴的等价性：理想与现实](#6-ts-类型系统与范畴的等价性理想与现实)
    - [6.1 理想化的 TS 范畴](#61-理想化的-ts-范畴)
    - [6.2 现实中的破坏因素](#62-现实中的破坏因素)
  - [7. 反例：什么时候不该用函子](#7-反例什么时候不该用函子)
  - [参考文献](#参考文献)

---

## 0. 为什么每个库都有自己的 "map"？

你用过这些吗？

```typescript
// Array.map
[1, 2, 3].map(x => x * 2);

// Promise.then
Promise.resolve(5).then(x => x * 2);

// RxJS Observable.map
// observable.pipe(map(x => x * 2));

// lodash/fp.map
// _.map(x => x * 2, [1, 2, 3]);

// fp-ts Option.map
// O.map(x => x * 2)(some(5));
```

它们都叫 "map"，做着类似的事。这是巧合吗？

不是。它们都是**函子**（Functor）的实例。函子不是某个库的发明，而是一个跨越所有库、所有语言、所有数学领域的**普遍模式**。

**思维脉络**：程序员先发明了各种数据结构（数组、Promise、树），然后发现每个结构都需要一个"对内部元素应用函数"的方法。于是他们一次次地实现 `map`。数学家看着这些实现，说："它们都在做同一件事。让我给这件事起个名字——函子。"

---

## 1. 协变函子：你每天都在写的结构保持映射

### 1.1 Array.map：函子的教科书案例

Array.map 如此普遍，以至于你可能从未思考过它为什么"应该"存在。

```typescript
// ========== 没有 map 时 ==========
function doubleNumbers(arr: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    result[i] = arr[i] * 2;
  }
  return result;
}

function stringifyNumbers(arr: number[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < arr.length; i++) {
    result[i] = arr[i].toString();
  }
  return result;
}

// 看到了吗？doubleNumbers 和 stringifyNumbers 的结构完全一样，
// 只有 arr[i] * 2 vs arr[i].toString() 不同。

// ========== 有了 map 后 ==========
const double = (x: number) => x * 2;
const stringify = (x: number) => x.toString();

const doubled = [1, 2, 3].map(double);     // 复用 double 函数
const stringified = [1, 2, 3].map(stringify); // 复用 stringify 函数

// 更进一步：把 "map" 本身抽象出来
const mapNumbers = (f: (x: number) => number) => (arr: number[]): number[] =>
  arr.map(f);

// 但这还是限制了类型。真正的抽象：
const map = <A, B>(f: (a: A) => B) => (arr: A[]): B[] => arr.map(f);
// 现在 map(double) 可以作用于任何 number[]
// map(stringify) 也可以
```

**函子律的验证**：

```typescript
// 律 1: F(id) = id
const arr = [1, 2, 3];
const id = <A>(x: A): A => x;
console.log(JSON.stringify(arr.map(id)) === JSON.stringify(arr)); // true

// 律 2: F(g ∘ f) = F(g) ∘ F(f)
const f = (x: number) => x + 1;
const g = (x: number) => x * 2;

const left = arr.map(x => g(f(x)));   // map(g ∘ f)
const right = arr.map(f).map(g);       // map(g) ∘ map(f)

console.log(JSON.stringify(left) === JSON.stringify(right)); // true

// === 律 2 的实际意义：重构自由 ===
// 你可以把 [1,2,3].map(f).map(g) 重构成 [1,2,3].map(x => g(f(x)))
// 而不改变语义。这是 IDE 自动重构的数学基础。
```

### 1.2 Promise.then：异步计算容器的函子

Promise 是一个"将来会有值"的容器。`.then` 就是它的 `map`。

```typescript
// ========== 没有 then 的异步处理 ==========
function fetchAndDouble(): Promise<number> {
  return fetch('/api/number')
    .then(res => res.json())
    .then(data => {
      return data.value * 2; // 嵌在回调里，无法复用 double 函数
    });
}

// ========== 有了 then（函子视角） ==========
const double = (x: number) => x * 2;

function fetchAndDoubleElegant(): Promise<number> {
  return fetch('/api/number')
    .then(res => res.json())
    .then(data => data.value)
    .then(double); // 复用纯函数！
}

// then 让异步计算和同步函数解耦
// 你可以在不修改 double 的情况下，把它"提升"到 Promise 层面
```

**Promise.then 的函子律验证**：

```typescript
// 律 1: then(id) ≈ id（忽略 Promise 包装）
Promise.resolve(42).then(x => x).then(result => {
  console.log(result === 42); // true
});

// 律 2: then(g ∘ f) = then(g) ∘ then(f)
const f = (x: number) => x + 1;
const g = (x: number) => x.toString();

const p = Promise.resolve(5);

const left = p.then(x => g(f(x)));
const right = p.then(f).then(g);

Promise.all([left, right]).then(([a, b]) => {
  console.log(a === b); // true ✅
});

// 但注意：Promise.then 不是严格的函子，因为它还处理 rejection！
// then 的第二个参数（onRejected）引入了额外的行为。
// 从严格的范畴论角度，Promise.then 更像是一个"带有错误处理的增强函子"。
```

### 1.3 Option/Maybe：空值处理的函子视角

```typescript
// ========== 没有 Option 时：null 检查地狱 ==========
function getUserStreet(userId: string): string | null {
  const user = findUser(userId); // User | null
  if (!user) return null;

  const address = user.address; // Address | null
  if (!address) return null;

  const street = address.street; // string | null
  return street;
}

// 每一步都要检查 null，无法复用纯函数

// ========== 有了 Option 函子 ==========
type Option<T> = { tag: 'some'; value: T } | { tag: 'none' };

const some = <T>(value: T): Option<T> => ({ tag: 'some', value });
const none = <T>(): Option<T> => ({ tag: 'none' });

const OptionFunctor = {
  map: <A, B>(opt: Option<A>, f: (a: A) => B): Option<B> =>
    opt.tag === 'none' ? none<B>() : some(f(opt.value))
};

// 现在可以链式调用
function getUserStreetElegant(userId: string): Option<string> {
  return OptionFunctor.map(
    OptionFunctor.map(
      OptionFunctor.map(findUser(userId), u => u.address),
      a => a.street
    ),
    s => s.toUpperCase()
  );
}

// 更优雅的写法（如果 Option 有 chain/flatMap）
// findUser(userId)
//   .map(u => u.address)
//   .map(a => a.street)
//   .map(s => s.toUpperCase());

// === Option 的函子律 ===
// F(id)(some(42)) = some(id(42)) = some(42) ✅
// F(id)(none()) = none() ✅

// F(g ∘ f)(some(x)) = some(g(f(x)))
// F(g)(F(f)(some(x))) = F(g)(some(f(x))) = some(g(f(x))) ✅
// F(g ∘ f)(none()) = none() = F(g)(F(f)(none())) ✅
```

### 1.4 Tree.map：递归结构的函子性

```typescript
// 树结构也有 map
interface Tree<A> {
  tag: 'leaf';
  value: A;
} | {
  tag: 'node';
  left: Tree<A>;
  right: Tree<A>;
};

// ========== 没有 map 时：每个变换都要遍历整棵树 ==========
function doubleTree(tree: Tree<number>): Tree<number> {
  if (tree.tag === 'leaf') {
    return { tag: 'leaf', value: tree.value * 2 };
  }
  return {
    tag: 'node',
    left: doubleTree(tree.left),
    right: doubleTree(tree.right)
  };
}

function stringifyTree(tree: Tree<number>): Tree<string> {
  if (tree.tag === 'leaf') {
    return { tag: 'leaf', value: tree.value.toString() };
  }
  return {
    tag: 'node',
    left: stringifyTree(tree.left),
    right: stringifyTree(tree.right)
  };
}

// 又是完全相同的结构！

// ========== 有了 Tree.map ==========
const TreeFunctor = {
  map: <A, B>(tree: Tree<A>, f: (a: A) => B): Tree<B> => {
    if (tree.tag === 'leaf') {
      return { tag: 'leaf', value: f(tree.value) };
    }
    return {
      tag: 'node',
      left: TreeFunctor.map(tree.left, f),
      right: TreeFunctor.map(tree.right, f)
    };
  }
};

const myTree: Tree<number> = {
  tag: 'node',
  left: { tag: 'leaf', value: 1 },
  right: {
    tag: 'node',
    left: { tag: 'leaf', value: 2 },
    right: { tag: 'leaf', value: 3 }
  }
};

const doubledTree = TreeFunctor.map(myTree, x => x * 2);
const stringifiedTree = TreeFunctor.map(myTree, x => x.toString());
```

### 1.5 违反函子律的代价：一个调试噩梦

```typescript
// 反例：一个看似合理的 "map" 实现，但违反了函子律

class WeirdArray<T> {
  constructor(private items: T[]) {}

  map<U>(f: (t: T) => U): WeirdArray<U> {
    // "优化"：如果数组为空，返回一个有默认值的数组
    if (this.items.length === 0) {
      return new WeirdArray([f(undefined as unknown as T)]); // 危险！
    }
    return new WeirdArray(this.items.map(f));
  }
}

// 违反律 1: F(id) ≠ id
const empty = new WeirdArray<number>([]);
const mapped = empty.map(x => x); // 返回 [NaN] 或抛出异常！
// 因为 undefined 被传给了 id

// 违反律 2: F(g ∘ f) ≠ F(g) ∘ F(f)
const f = (x: number) => x + 1;
const g = (x: number) => x * 2;

const weird = new WeirdArray<number>([1, 2, 3]);
const way1 = weird.map(x => g(f(x)));
const way2 = weird.map(f).map(g);
// 对于非空数组，它们相等。但如果数组在某一步变空...

// 另一个真实的反例：Set 的"map"
// 如果我们定义 Set.prototype.map：
function setMap<T, U>(set: Set<T>, f: (t: T) => U): Set<U> {
  const result = new Set<U>();
  for (const item of set) {
    result.add(f(item));
  }
  return result;
}

const set = new Set([1, 2, 3]);
const f_mod = (x: number) => x % 2;

// setMap(set, f_mod) = Set {0, 1}
// setMap(setMap(set, f_mod), g) —— 第二步的输入只有 2 个元素
// setMap(set, x => g(f_mod(x))) —— 第一步的输入有 3 个元素
// 如果 g 依赖输入大小...

// 根本问题：Set.map 可能改变容器"大小"，破坏了结构保持
```

---

## 2. 反变函子：箭头方向的反转

### 2.1 函数参数位置的反变性

TypeScript 的类型系统有一个让初学者困惑的特性：函数参数是**反变**（Contravariant）的。

```typescript
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }

// Dog ≤ Animal（Dog 是 Animal 的子类型）

// 协变位置（返回值）：方向相同
type Producer<A> = () => A;
const dogProducer: Producer<Dog> = () => ({ name: 'Rex', bark: () => {} });
const animalProducer: Producer<Animal> = dogProducer; // ✅ Dog -> Animal

// 反变位置（参数）：方向反转
type Consumer<A> = (a: A) => void;
const animalConsumer: Consumer<Animal> = (a) => console.log(a.name);
const dogConsumer: Consumer<Dog> = animalConsumer; // ✅ Animal -> Dog（方向反转！）

// 为什么？
// animalConsumer 只用到 .name
// 任何 Dog 都有 .name，所以 animalConsumer 可以安全地消费 Dog
// 反过来不行：dogConsumer 可能用到 .bark，但 Animal 不一定有
```

**精确直觉类比**：反变函子 ≈ "前置条件处理器"。

- 如果一个函数能处理 Animal，它就能处理 Dog（Dog 是更具体的 Animal）
- 但如果一个函数要求处理 Dog，它不一定能处理 Animal（可能需要 bark）
- 所以 "能处理 Animal" 的函数集合 **更大**（包含更多函数）
- 子类型方向反转了：Dog ≤ Animal 但 Consumer<Animal> ≤ Consumer<Dog>

### 2.2 Comparator：反变函子的实战

```typescript
// 比较器是反变函子的经典例子
type Comparator<A> = (a1: A, a2: A) => number;

// 如果 Animal 可以按 name 比较
const compareAnimals: Comparator<Animal> = (a, b) =>
  a.name.localeCompare(b.name);

// 那么它也可以比较 Dog（因为 Dog 有 name）
const compareDogs: Comparator<Dog> = compareAnimals; // ✅

// 更复杂的例子：验证器
type Validator<A> = (value: A) => string[]; // 返回错误列表

// 基础验证器（检查 name 非空）
const validateAnimal: Validator<Animal> = (a) =>
  a.name.trim() === '' ? ['Name is required'] : [];

// 可以安全地用作 Dog 的验证器
const validateDog: Validator<Dog> = validateAnimal; // ✅

// 但 Dog 的专用验证器不能用于 Animal
const validateDogStrict: Validator<Dog> = (d) => {
  const errors: string[] = [];
  if (d.name.trim() === '') errors.push('Name is required');
  if (typeof d.bark !== 'function') errors.push('Dog must bark');
  return errors;
};

// const validateAnimalStrict: Validator<Animal> = validateDogStrict; // ❌ 编译错误
// Animal 可能没有 bark
```

### 2.3 协变与反变的混合：函数类型的完整图景

```typescript
// 一个函数可能在多个位置有不同变型
type Complex<A, B, C> = (a: A, b: (c: C) => A) => B;

// 分析：
// A 出现在参数位置（反变）和返回值中的参数位置（反变的反变 = 协变）
// 净效果：需要仔细分析

// TS 的 --strictFunctionTypes 模式启用严格的反变检查
// 关闭时，TS 对参数使用双变（Bivariant），这在某些场景下方便但不安全

// 双变的危险示例（非严格模式）：
interface EventHandler {
  handle(event: Animal): void;
}

interface DogEventHandler {
  handle(event: Dog): void;
}

// 在非严格模式下，这两者可能被视为可互换的
// 但如果把 DogEventHandler 当作 EventHandler 用，
// 传入一个 Cat（也是 Animal），DogEventHandler 可能调用 event.bark()，
// 而 Cat 没有 bark —— 运行时错误！
```

---

## 3. 双函子：两个容器的组合映射

### 3.1 Promise.all 作为积双函子

```typescript
// 双函子：同时是两个容器的函子
// Promise.all: (Promise<A>, Promise<B>) -> Promise<[A, B]>

// ========== 没有 Promise.all 时 ==========
async function fetchPairOld(): Promise<[User, Order]> {
  const userPromise = fetchUser();
  const orderPromise = fetchOrder();

  const user = await userPromise;
  const order = await orderPromise;
  return [user, order];
}

// 问题：如果 fetchUser 和 fetchOrder 有更多组合方式...
// 你需要为每种组合写不同的 await 模式

// ========== 有了 Promise.all ==========
async function fetchPairNew(): Promise<[User, Order]> {
  return Promise.all([fetchUser(), fetchOrder()]);
}

// Promise.all 是"积双函子"：
// 它在两个参数位置上都是函子

// 验证双函子性：
const pu = Promise.resolve(1);
const pv = Promise.resolve("hello");

const f = (x: number) => x * 2;
const g = (s: string) => s.toUpperCase();

// bimap(f, g)(Promise.all([pu, pv])) = Promise.all([pu.then(f), pv.then(g)])
const left = Promise.all([pu, pv]).then(([a, b]) => [f(a), g(b)] as const);
const right = Promise.all([pu.then(f), pv.then(g)]);

Promise.all([left, right]).then(([a, b]) => {
  console.log(a[0] === b[0] && a[1] === b[1]); // true ✅
});
```

### 3.2 Either.bimap：错误和成功同时映射

```typescript
// Either<E, A>：要么有错误 E，要么有成功值 A
type Either<E, A> = { tag: 'left'; value: E } | { tag: 'right'; value: A };

const left = <E, A>(e: E): Either<E, A> => ({ tag: 'left', value: e });
const right = <E, A>(a: A): Either<E, A> => ({ tag: 'right', value: a });

// bimap 同时在两个"通道"上映射
const bimap = <E1, E2, A1, A2>(
  ea: Either<E1, A1>,
  f: (e: E1) => E2,
  g: (a: A1) => A2
): Either<E2, A2> =>
  ea.tag === 'left' ? left(f(ea.value)) : right(g(ea.value));

// 实际应用：API 错误转换
interface HttpError { status: number; message: string; }
interface AppError { code: string; userMessage: string; }

const httpToAppError = (e: HttpError): AppError => ({
  code: `HTTP_${e.status}`,
  userMessage: e.status >= 500 ? 'Server error' : 'Client error'
});

const doubleIfSuccess = (x: number): number => x * 2;

const apiResult: Either<HttpError, number> = right(42);
const appResult = bimap(apiResult, httpToAppError, doubleIfSuccess);
// Either<AppError, number>
```

---

## 4. 自然变换：与 map 可交换的转换

### 4.1 Array.flat 的自然性：严格证明

```typescript
// flatten: Array<Array<A>> -> Array<A> 是自然变换

// 自然性条件：flatten ∘ map(map(f)) = map(f) ∘ flatten

const flatten = <A>(arr: A[][]): A[] => arr.flat();

// 测试框架
function testNaturality<A, B>(
  nested: A[][],
  f: (a: A) => B,
  name: string
): void {
  // 左路径：先 map 内层，再 flatten
  const left = flatten(nested.map(inner => inner.map(f)));

  // 右路径：先 flatten，再 map
  const right = flatten(nested).map(f);

  const passed = JSON.stringify(left) === JSON.stringify(right);
  console.log(`${name}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
}

// 测试用例 1: 数字转换
testNaturality(
  [[1, 2], [3, 4]],
  x => x * 2,
  'double'
);

// 测试用例 2: 类型转换
testNaturality(
  [[1, 2], [3]],
  x => x.toString(),
  'toString'
);

// 测试用例 3: 复杂对象
testNaturality(
  [[{ name: 'a' }], [{ name: 'b' }]],
  x => x.name.toUpperCase(),
  'object transform'
);

// 测试用例 4: 空数组边界
testNaturality<number, number>(
  [[], [1], []],
  x => x + 1,
  'with empties'
);
```

### 4.2 head 不是自然变换：为什么安全提取容器首元素不可能

```typescript
// head: Array<A> -> Option<A>（安全地取第一个元素）
// 为什么 head 不是自然变换？

const head = <A>(arr: A[]): Option<A> =>
  arr.length === 0 ? { tag: 'none' } : { tag: 'some', value: arr[0] };

const f = (x: number) => x.toString();

const arr: number[] = [];

// 左路径：先 map，再 head
const left = head(arr.map(f));
// arr.map(f) = []，所以 left = none

// 右路径：先 head，再 map
const right = OptionFunctor.map(head(arr), f);
// head(arr) = none，所以 right = none

// 等等，这看起来相等？让我们换例子：
const g = (x: number) => [x, x]; // number -> number[]

const arr2 = [[1, 2], [3, 4]]; // number[][]

// head 的类型：number[][] -> Option<number[]>
// 如果我们 "先 map(map(g))，再 head"：
const left2 = head(arr2.map(inner => inner.map(g)));
// arr2.map(...) = [[[1,1], [2,2]], [[3,3], [4,4]]]
// head(...) = some([[1,1], [2,2]])

// "先 head，再 map(g)"：
// 但 head 返回 Option<number[]>，不是 number[][]
// 我们需要 Option 的 map：
const right2 = OptionFunctor.map(head(arr2), inner => inner.map(g));
// head(arr2) = some([1,2])（第一个内层数组）
// 不是 some([[1,1], [2,2]])！

// 根本问题：head 丢失了"容器结构"（数组的其余部分）
// 而 map 保持容器结构
// 所以先 map 再 head 和先 head 再 map 的结果不同

// 这说明了一个深层原理：
// 自然变换必须与 "所有" 结构保持操作可交换
// head 改变容器形状（从 Array 到 Option），所以它不是自然变换
```

### 4.3 长度函数也不是自然变换

```typescript
// length: Array<A> -> number
// 为什么 length 不是自然变换？

// 自然变换要求：源和目标都是"函子"
// 但 number 不是函子！它不接受类型参数

// 更深层的原因：
const arr = [1, 2, 3];
const f = (x: number) => [x, x]; // 可能改变元素数量

// length(arr.map(f)) = 3（外层数组长度不变）
// 但如果我们有某种"总元素数"函数...

// length 与某些 map 可交换，但不是所有
// 例如：
const g = () => undefined; // 把所有元素变成 undefined
// length(arr.map(g)) === length(arr) === 3 ✅

// 但如果 map 可以过滤：
// arr.filter(x => x > 1).map(g) 的 length 与 arr.map(g).filter(...) 不同

// 结论：length 不是自然变换，因为它不保持"结构"
// 它把 Array 结构压缩成了一个标量
```

---

## 5. 函子的组合与嵌套

### 5.1 函子组合的编程实现

```typescript
// 函子可以组合：如果 F 和 G 都是函子，那么 F∘G 也是函子
// (F ∘ G)(A) = F(G(A))
// (F ∘ G)(f) = F(G(f))

// 示例：Array<Promise<A>> 的双重函子性

// 第一层：Promise 的 map
const PromiseFunctor = {
  map: <A, B>(pa: Promise<A>, f: (a: A) => B): Promise<B> => pa.then(f)
};

// 第二层：Array 的 map
const ArrayFunctor = {
  map: <A, B>(arr: A[], f: (a: A) => B): B[] => arr.map(f)
};

// 组合函子：先 map 内层 Promise，再 map 外层 Array
const composedMap = <A, B>(
  arrOfPromises: Promise<A>[],
  f: (a: A) => B
): Promise<B>[] =>
  ArrayFunctor.map(arrOfPromises, pa => PromiseFunctor.map(pa, f));

// 使用
const arr = [Promise.resolve(1), Promise.resolve(2)];
const result = composedMap(arr, x => x * 2);
// [Promise<2>, Promise<4>]

// Promise.all + map 的另一种组合
const allThenMap = <A, B>(arr: Promise<A>[], f: (a: A) => B): Promise<B[]> =>
  Promise.all(arr).then(results => results.map(f));

// allThenMap 与 composedMap 结果不同：
// composedMap: Promise<B>[]（每个 Promise 单独变换）
// allThenMap: Promise<B[]>（等所有完成后再一起变换）
```

### 5.2 Promise<Array<T>> 的双重函子性

```typescript
// 另一种组合顺序：Promise<Array<A>>

const mapInner = <A, B>(ppa: Promise<A[]>, f: (a: A) => B): Promise<B[]> =>
  ppa.then(arr => arr.map(f));

const mapOuter = <A, B>(ppa: Promise<A[]>, f: (arr: A[]) => B): Promise<B> =>
  ppa.then(f); // 这不是函子 map，因为 f 操作的是整个数组

// 正确的函子 map 应该是 mapInner：
// Promise<Array<A>> --mapInner(f)--> Promise<Array<B>>

// 函子律验证：
const ppa = Promise.resolve([1, 2, 3]);

// 律 1
mapInner(ppa, x => x).then(result => {
  console.log(JSON.stringify(result)); // [1, 2, 3]
});

// 律 2
const f = (x: number) => x + 1;
const g = (x: number) => x * 2;

const left = mapInner(ppa, x => g(f(x)));
const right = mapInner(mapInner(ppa, f), g);

Promise.all([left, right]).then(([a, b]) => {
  console.log(JSON.stringify(a) === JSON.stringify(b)); // true
});
```

---

## 6. TS 类型系统与范畴的等价性：理想与现实

### 6.1 理想化的 TS 范畴

如果我们对 TypeScript 做以下限制，它的类型系统近似构成一个良定义的范畴：

```typescript
// 限制 1: 排除 any
// 限制 2: 排除 unknown（或视为特殊对象）
// 限制 3: 只考虑全函数（对所有输入有定义）
// 限制 4: 只考虑纯函数（无副作用）

// 在这个理想世界中：
// 对象 = 简单类型（number, string, boolean, 对象类型，函数类型）
// 态射 = 纯函数
// 组合 = 函数组合
// 恒等 = 恒等函数

// 验证结合律
const h = (x: number): string => x.toString();
const g = (x: string): boolean => x.length > 0;
const f = (x: boolean): number => x ? 1 : 0;

const lhs = (x: number) => f(g(h(x)));
const rhs = (x: number) => f(g(h(x)));
// 在纯函数世界中，lhs 和 rhs 是相等的
```

### 6.2 现实中的破坏因素

```typescript
// 破坏因素 1: any
const anything: any = 42;
const identityAny = (x: any): any => x;
const weirdAny = (x: any): any => x + "hello";
// any -> any 不是单一集合，因为 any 允许任何操作

// 破坏因素 2: 运行时异常
const divide = (a: number, b: number): number => a / b;
// divide(1, 0) === Infinity，不是真正的异常
// 但如果：
const badDivide = (a: number, b: number): number => {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
};
// 这不是全函数，因为某些输入导致异常而不是返回值

// 破坏因素 3: 副作用
let counter = 0;
const increment = (): number => ++counter;
// increment() 和 increment() 结果不同
// 这不是函数，是过程

// 破坏因素 4: this 绑定
class Counter {
  count = 0;
  increment() { return ++this.count; }
}
const c = new Counter();
const method = c.increment;
// method() 会抛出异常或返回 NaN，因为 this 丢失了
// 这与函数的"纯"行为不同
```

---

## 7. 反例：什么时候不该用函子

```typescript
// 反例 1: 过度抽象一个简单的循环

// 正常代码
function sumEven(numbers: number[]): number {
  let sum = 0;
  for (const n of numbers) {
    if (n % 2 === 0) sum += n;
  }
  return sum;
}

// 强行函子化的版本
import { pipe } from 'fp-ts/lib/function';
import { filter, reduce } from 'fp-ts/lib/Array';

const sumEvenOverdone = (numbers: number[]): number =>
  pipe(
    numbers,
    filter((n: number) => n % 2 === 0),
    reduce(0, (acc, n) => acc + n)
  );

// 对于简单逻辑，这没有带来好处，反而引入了依赖

// 反例 2: 用函子处理需要 early return 的逻辑
function findFirstValid(users: User[]): User | null {
  for (const u of users) {
    if (u.age >= 18 && u.email && u.active) {
      return u; // early return
    }
  }
  return null;
}

// 函子版本需要扫描整个数组
const findFirstValidBad = (users: User[]): User | null => {
  const valid = users.filter(u => u.age >= 18 && u.email && u.active);
  return valid[0] ?? null; // O(n) 而不是提前退出
};

// 反例 3: 函子不适合状态机转换
// 状态转换通常需要根据当前状态改变容器类型，
// 而函子要求容器类型固定

// 反例 4: 性能敏感的代码
// 函子的链式调用可能创建大量中间数组/Promise
// [1,2,3].map(f).map(g).map(h) 创建 3 个数组
// 而 for 循环只创建一个结果数组
```

---

## 参考文献

1. Mac Lane, S. (1998). *Categories for the Working Mathematician* (2nd ed.). Springer.
2. Milewski, B. (2019). *Category Theory for Programmers*. Blurb.
3. Riehl, E. (2016). *Category Theory in Context*. Dover.
