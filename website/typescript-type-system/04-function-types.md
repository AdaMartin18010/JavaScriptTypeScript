---
title: 04 函数类型 — 重载、this参数与变型规则
description: 深入TypeScript函数类型系统：函数类型表达式与调用签名、泛型函数、函数重载、this参数与this类型、严格函数类型、剩余参数与元组、回调类型推断、构造函数签名、抽象方法类型。
keywords:
  - typescript function types
  - function overloads
  - this parameter
  - strict function types
  - generic functions
  - rest parameters
  - tuple types
  - callback types
  - construct signatures
  - call signatures
editLink: false
lastUpdated: true
---

# 04 函数类型 — 重载、this参数与变型规则

:::tip 本章核心
函数是 JavaScript 的一等公民，也是 TypeScript 类型系统中最复杂的构造之一。理解函数参数的**逆变**、重载的解析规则、`this` 的上下文绑定，是写出类型安全高阶函数的前提。
:::

---

## 4.1 函数类型表达式

### 4.1.1 基本语法

```ts
// 方式一：函数类型表达式
type Greet = (name: string) => string;

// 方式二：调用签名（Call Signature，在对象类型中）
interface Greetable {
  (name: string): string;
  prefix: string;
}

// 方式三：使用 Function（不推荐）
type BadGreet = Function; // ❌ 过于宽泛
```

### 4.1.2 调用签名与属性共存

```ts
interface Logger {
  (message: string): void;
  level: "debug" | "info" | "warn" | "error";
}

function createLogger(): Logger {
  const fn = ((message: string) => {
    console.log(`[${fn.level}] ${message}`);
  }) as Logger;
  fn.level = "info";
  return fn;
}

const log = createLogger();
log("hello");        // ✅ 调用签名
log.level = "debug"; // ✅ 属性访问
```

---

## 4.2 参数类型详解

### 4.2.1 可选参数与默认值

```ts
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}`;
}

// 带默认值的参数自动变为可选
function greet2(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}`;
}

// 可选参数必须在必选参数之后（除非使用 undefined 占位）
function bad(a?: string, b: number) {} // ❌
function good(a: number, b?: string) {} // ✅
function alsoGood(a: string | undefined, b: number) {} // ✅
```

### 4.2.2 剩余参数（Rest Parameters）

```ts
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3); // ✅
sum(...[1, 2, 3]); // ✅
```

### 4.2.3 元组类型的剩余参数

```ts
// 限定剩余参数的数量和类型
function tupleRest(a: string, ...rest: [number, boolean]): string {
  return `${a} ${rest[0]} ${rest[1]}`;
}

tupleRest("x", 1, true); // ✅
tupleRest("x", 1);       // ❌ 缺少 boolean
tupleRest("x", 1, true, 2); // ❌ 参数过多
```

**结合可选元组元素**：

```ts
function flexible(a: string, ...rest: [number, string?]): string {
  return `${a} ${rest[0]} ${rest[1] ?? ""}`;
}

flexible("x", 1);      // ✅
flexible("x", 1, "y"); // ✅
```

### 4.2.4 解构参数的类型

```ts
// 对象解构
function draw({ x, y, color }: { x: number; y: number; color?: string }) {
  console.log(`Draw at (${x}, ${y}) with ${color ?? "black"}`);
}

// 数组解构
function zip([x, y]: [number, string]): string {
  return `${x}-${y}`;
}
```

---

## 4.3 返回值类型

### 4.3.1 显式与推断

```ts
// 显式返回值类型
function add(a: number, b: number): number {
  return a + b;
}

// 推断返回值类型
function add2(a: number, b: number) {
  return a + b; // 推断为 number
}

// 函数返回 void
function log(msg: string): void {
  console.log(msg);
  // return undefined; // ✅ void 允许返回 undefined
  // return 1; // ❌
}
```

### 4.3.2 void 的深层语义

```ts
type VoidFn = () => void;

const fn: VoidFn = () => 42; // ✅ 合法！
// 虽然函数返回 42，但 void 上下文会忽略返回值

// 这在 Array.prototype.push 等场景中很有用
const nums: number[] = [];
const results = [1, 2, 3].map((n) => nums.push(n));
// map 期望 (n) => void，push 返回 number，但类型兼容
```

**void 与 undefined 的区别**：

| 特性 | `void` | `undefined` |
|------|--------|-------------|
| 作为返回值 | 表示"无返回值" | 表示"返回 undefined" |
| 回调兼容性 | 允许返回任何值（被忽略） | 必须返回 undefined |
| 变量类型 | ❌ 不推荐 | ✅ 可以声明 |

```ts
type VoidCallback = () => void;
type UndefinedCallback = () => undefined;

const cb1: VoidCallback = () => 1; // ✅
const cb2: UndefinedCallback = () => 1; // ❌
const cb3: UndefinedCallback = () => undefined; // ✅
```

---

## 4.4 this 参数与 this 类型

### 4.4.1 this 参数（伪参数）

TypeScript 允许函数第一个参数命名为 `this`，用于指定函数执行时的 `this` 类型。这个参数**不会出现在编译后的 JS 中**。

```ts
interface User {
  name: string;
  greet(this: User): string;
}

const user: User = {
  name: "TypeScript",
  greet() {
    return `Hello, ${this.name}`;
  },
};

user.greet(); // ✅

const greet = user.greet;
greet(); // ❌ this 类型为 void，但函数期望 User
```

### 4.4.2 this 参数的变型

```ts
// 在回调中控制 this 类型
type ClickHandler = (this: HTMLButtonElement, event: MouseEvent) => void;

function setupButton(button: HTMLButtonElement, handler: ClickHandler) {
  button.addEventListener("click", handler);
}
```

### 4.4.3 类方法中的 this 类型

```ts
class Counter {
  count = 0;

  increment(this: Counter): Counter {
    this.count++;
    return this;
  }
}

const c = new Counter();
const inc = c.increment;
inc(); // ❌ this 类型不匹配
```

---

## 4.5 函数重载（Overloads）

函数重载允许一个函数有**多个调用签名**，TypeScript 根据参数数量和类型选择匹配的签名。

### 4.5.1 基础重载

```ts
// 重载签名
function createElement(tag: "a"): HTMLAnchorElement;
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "span"): HTMLSpanElement;
function createElement(tag: "canvas"): HTMLCanvasElement;

// 实现签名（不对外暴露，必须是兼容所有重载的最宽类型）
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

const a = createElement("a");     // HTMLAnchorElement
const div = createElement("div"); // HTMLDivElement
// const bad = createElement("video"); // ❌ 无此重载
```

### 4.5.2 重载解析规则

```ts
function process(x: string): string;
function process(x: string, y: number): number;
function process(x: string, y?: number): string | number {
  return y === undefined ? x : y;
}

process("hello");          // string
process("hello", 42);      // number
// process("hello", "42"); // ❌ 无匹配的重载
```

**解析规则**：

1. 按**书写顺序**从上到下匹配
2. 第一个匹配的签名被使用
3. 实现签名不对外可见，仅用于类型检查函数体

### 4.5.3 对象方法重载

```ts
interface StringConvert {
  convert(input: string): string;
  convert(input: number): string;
  convert(input: Date): string;
}

const sc: StringConvert = {
  convert(input: string | number | Date): string {
    return String(input);
  },
};
```

### 4.5.4 重载与泛型的选择

```ts
// 重载方案
function fetchData(url: string): Promise<string>;
function fetchData(url: string, parse: true): Promise<object>;
function fetchData(url: string, parse?: boolean): Promise<string | object> {
  return fetch(url).then((r) => (parse ? r.json() : r.text()));
}

// 泛型方案（更推荐）
function fetchData2<T = string>(url: string): Promise<T> {
  return fetch(url).then((r) => r.json());
}
```

**何时使用重载**：

- 参数数量不同导致返回值类型不同
- 参数类型与返回值有**固定映射**（如 `createElement`）
- 某些参数组合**不合法**需要排除

**何时使用泛型**：

- 返回值类型与输入参数类型**直接相关**
- 需要保持类型参数的一致性

### 4.5.5 重载的陷阱

```ts
// 陷阱 1：实现签名太窄
function bad(x: string): string;
function bad(x: number): number;
function bad(x: string): string { // ❌ 实现签名不兼容 number 重载
  return x;
}

// 正确：
function good(x: string): string;
function good(x: number): number;
function good(x: string | number): string | number {
  return String(x);
}

// 陷阱 2：顺序错误（具体签名应在通用签名之前）
function wrong(x: any): any;
function wrong(x: string): string; // 永远不会被匹配！
function wrong(x: any): any { return x; }
```

---

## 4.6 严格函数类型（strictFunctionTypes）

`strictFunctionTypes` 是 TypeScript 中控制函数参数变型的核心配置。

### 4.6.1 开启前后的差异

```ts
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

// 开启 strictFunctionTypes 前（或方法参数）
type AnimalFn = (a: Animal) => void;
type DogFn = (d: Dog) => void;

const dogFn: DogFn = (dog) => console.log(dog.breed);

// 严格模式：❌ 参数逆变
const animalFn: AnimalFn = dogFn;

// 兼容模式：✅ 参数双变
const animalFn2: AnimalFn = dogFn;
```

### 4.6.2 为什么参数应该是逆变的？

```ts
function handleAnimals(process: (a: Animal) => void) {
  const cat: Animal = { name: "Whiskers" };
  process(cat); // 给回调一只 Cat
}

const processDog: (d: Dog) => void = (dog) => {
  console.log(dog.breed); // 需要 breed 属性
};

handleAnimals(processDog);
// 如果参数是协变的，这行会通过类型检查...
// 但运行时 cat 没有 breed 属性，会崩溃！
```

### 4.6.3 方法 vs 函数属性的差异

```ts
interface MethodStyle {
  process(a: Animal): void; // 方法语法
}

interface PropertyStyle {
  process: (a: Animal) => void; // 函数属性语法
}

const dogProcessor = {
  process(d: Dog) {
    console.log(d.breed);
  },
};

const m: MethodStyle = dogProcessor;      // ✅ 方法参数默认双变
const p: PropertyStyle = dogProcessor;    // ❌ strictFunctionTypes 下报错
```

**默认差异的原因**：JavaScript 中方法声明（`obj.method()`）的 `this` 绑定和原型链继承模式在严格逆变下会破坏大量既有代码。因此方法参数保持双变以兼容经典 OOP 模式。

---

## 4.7 泛型函数

### 4.7.1 基础泛型函数

```ts
function identity<T>(arg: T): T {
  return arg;
}

const s = identity("hello"); // T 推断为 "hello"
const n = identity(42);      // T 推断为 42
const x = identity<string>("hello"); // 显式指定
```

### 4.7.2 泛型约束

```ts
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello"); // ✅ string 有 length
logLength([1, 2]);  // ✅ 数组有 length
// logLength(42);   // ❌ number 没有 length
```

### 4.7.3 多个类型参数

```ts
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

const nums = map(["1", "2", "3"], (s) => parseInt(s));
// nums: number[]
```

### 4.7.4 泛型默认值

```ts
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}

// 使用默认值
const resp: ApiResponse = { data: {}, status: 200 }; // data: unknown

// 覆盖默认值
const resp2: ApiResponse<string> = { data: "hello", status: 200 };
```

### 4.7.5 在类型别名中定义泛型函数

```ts
type MapFn<T, U> = (item: T) => U;
type FilterFn<T> = (item: T) => boolean;

type ArrayMethods<T> = {
  map: <U>(fn: MapFn<T, U>) => U[];
  filter: (fn: FilterFn<T>) => T[];
};
```

---

## 4.8 构造函数类型

### 4.8.1 构造签名

```ts
interface Constructor<T> {
  new (...args: any[]): T;
}

// 使用
class Animal {
  constructor(public name: string) {}
}

function create<T>(Ctor: Constructor<T>, ...args: any[]): T {
  return new Ctor(...args);
}

const animal = create(Animal, "Lion"); // Animal
```

### 4.8.2 抽象构造签名

```ts
abstract class Shape {
  abstract area(): number;
}

interface AbstractConstructor<T> {
  abstract new (...args: any[]): T;
}

// TS 4.2+ 语法
interface AbstractCtor<T> {
  new (...args: any[]): T; // 对抽象类也有效（类型层面）
}
```

---

## 4.9 回调类型与类型推断

### 4.9.1 回调函数的参数推断

```ts
type Callback<T> = (err: Error | null, result: T) => void;

function asyncOp(callback: Callback<string>) {
  callback(null, "done");
}

// callback 的参数类型被上下文推断
asyncOp((err, result) => {
  // err: Error | null
  // result: string
});
```

### 4.9.2 逆变位置对回调的影响

```ts
// 逆变使得回调类型检查更安全
interface EventEmitter {
  on(event: string, listener: (data: unknown) => void): void;
}

const emitter: EventEmitter = {
  on(event, listener) {
    listener("any data");
  },
};

// 由于参数是逆变的，可以传入更具体的回调
emitter.on("data", (s: string) => {
  // 虽然 listener 声明为 (data: unknown) => void
  // 但可以传入 (data: string) => void
  // 因为 unknown 是 string 的父类型，参数位置逆变：
  // (unknown => void) <: (string => void)
  console.log(s.toUpperCase());
});
```

### 4.9.3 返回 void 的回调宽容性

```ts
function forEach<T>(arr: T[], callback: (item: T, index: number) => void): void {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i);
  }
}

// 允许返回任何值（被忽略）
const nums = [1, 2, 3];
forEach(nums, (n) => n * 2); // ✅ 虽然返回 number，但 void 上下文忽略它
```

---

## 4.10 条件类型与函数类型

### 4.10.1 提取函数签名信息

```ts
type Parameters<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

type ReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : never;

type MyFn = (a: string, b: number) => boolean;

type P = Parameters<MyFn>; // [string, number]
type R = ReturnType<MyFn>; // boolean
```

### 4.10.2 提取 this 类型

```ts
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any
  ? U
  : unknown;

type OmitThisParameter<T> = unknown extends ThisParameterType<T>
  ? T
  : T extends (this: unknown, ...args: infer A) => infer R
  ? (...args: A) => R
  : T;
```

---

## 4.11 函数类型的边缘情况

### 4.11.1 可选参数与严格检查

```ts
function fn(x?: number): void {}
function fn2(x: number | undefined): void {}

fn();      // ✅
fn(undefined); // ✅

fn2();     // ❌ 缺少参数
fn2(undefined); // ✅
```

### 4.11.2 参数名在函数类型中的意义

```ts
// 参数名仅用于文档和 IDE 提示，不参与类型检查
type F1 = (x: number) => void;
type F2 = (y: number) => void;

const f: F1 = (y) => {}; // ✅ 参数名不同不影响兼容性
```

### 4.11.3 可变参数与泛型

```ts
function pipe<T>(...fns: ((arg: T) => T)[]): (arg: T) => T {
  return (arg) => fns.reduce((acc, fn) => fn(acc), arg);
}

const addOne = (n: number) => n + 1;
const double = (n: number) => n * 2;

const piped = pipe(addOne, double);
piped(3); // (3 + 1) * 2 = 8
```

---

## 4.12 自测题

### 题目 1

```ts
interface Processor {
  (input: string): number;
  label: string;
}

function createProcessor(): Processor {
  const fn = (input: string) => input.length;
  fn.label = "length";
  return fn;
}

const p = createProcessor();
p("hello"); // 返回值类型是什么？
p.label;    // 类型是什么？
```

<details>
<summary>答案</summary>

- `p("hello")` 返回 `number`
- `p.label` 类型是 `string`

</details>

### 题目 2

```ts
function process(x: string): string;
function process(x: number): number;
function process(x: string | number): string | number {
  return x;
}

const result = process("hello" as string | number);
// result 的类型是什么？
```

<details>
<summary>答案</summary>

`result` 的类型是 `string | number`。因为传入的参数类型是联合类型，TypeScript 会匹配所有可能的重载并返回联合的返回值类型。

</details>

### 题目 3

```ts
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

type AnimalCallback = (a: Animal) => void;
type DogCallback = (d: Dog) => void;

let ac: AnimalCallback = (a) => console.log(a.name);
let dc: DogCallback = (d) => console.log(d.breed);

ac = dc; // strictFunctionTypes 下是否合法？
dc = ac; // strictFunctionTypes 下是否合法？
```

<details>
<summary>答案</summary>

- `ac = dc`：❌ **不合法**。参数位置是逆变的。`DogCallback` 要求参数有 `breed`，但 `AnimalCallback` 可能传入没有 `breed` 的 Animal。
- `dc = ac`：✅ **合法**。`AnimalCallback` 接受任何 Animal，当然也能接受 Dog。

</details>

### 题目 4

```ts
function setup(this: HTMLElement, handler: (this: HTMLElement) => void): void {
  handler.call(this);
}

setup(() => {
  console.log(this); // this 的类型是什么？
});
```

<details>
<summary>答案</summary>

在箭头函数中，`this` 由**词法作用域**决定，而不是由函数的 `this` 参数决定。如果此代码在模块顶层，箭头函数的 `this` 类型通常是 `typeof globalThis` 或模块上下文。

如果要在回调中使用 HTMLElement 类型的 this，必须使用普通函数：

```ts
setup(function () {
  console.log(this.tagName); // this: HTMLElement
});
```

</details>

---

## 4.13 本章小结

| 概念 | 要点 |
|------|------|
| 函数类型表达式 | `(x: T) => U`；调用签名可附加属性 |
| 可选/默认参数 | 可选参数在后；带默认值即自动可选 |
| 剩余参数 | `...rest: number[]` 或 `...rest: [number, string]` 元组形式 |
| void 返回值 | 回调中允许返回任何值（被忽略）；与 `undefined` 有区别 |
| this 参数 | 伪参数，控制函数执行时的 this 类型；编译后擦除 |
| 函数重载 | 多个签名 + 一个实现签名；按顺序匹配；实现签名需兼容所有重载 |
| strictFunctionTypes | 开启后函数参数为逆变；方法参数保持双变 |
| 泛型函数 | `<T>(x: T) => T`；约束用 `extends`；默认值用 `=` |
| 构造签名 | `new (...args: any[]) => T` |
| 回调类型推断 | 上下文类型推断回调参数；void 返回的宽容性 |

---

## 参考与延伸阅读

1. [TypeScript Handbook: Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
2. [TypeScript Handbook: More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
3. [strictFunctionTypes](https://www.typescriptlang.org/tsconfig#strictFunctionTypes)
4. [Function Overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads)
5. [this parameters](https://www.typescriptlang.org/docs/handbook/2/functions.html#this-parameters)

---

:::info 下一章
进入 TypeScript 类型系统最核心也最迷人的领域：泛型深度解析 → *05 泛型深度*（待更新）
:::
