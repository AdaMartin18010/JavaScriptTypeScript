# 函数

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/04-functions`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块深入研究函数作为一等公民的特性，解决高阶函数、柯里化和函数组合在实际开发中的应用问题。涵盖箭头函数、生成器和异步函数。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 一等函数 | 函数作为值传递与返回 | first-class.ts |
| 闭包 | 词法作用域的持久化引用 | closures.ts |
| 生成器 | 可暂停/恢复的迭代器函数 | generators.ts |

---

## 二、设计原理

### 2.1 为什么存在

函数是 JavaScript 的核心抽象机制。作为一等公民，函数支持高阶组合、惰性求值和闭包，这使得 JS 具备强大的表达力和函数式编程能力。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 纯函数 | 可测试、可缓存 | 需要额外传参 | 数据转换 |
| 副作用函数 | 直接操作外部 | 难以追踪依赖 | I/O 操作 |

### 2.3 特性对比表：函数声明 vs 函数表达式 vs 箭头函数

| 特性 | 函数声明 (Function Declaration) | 函数表达式 (Function Expression) | 箭头函数 (Arrow Function) |
|------|-------------------------------|--------------------------------|--------------------------|
| 语法 | `function foo() {}` | `const foo = function() {}` | `const foo = () => {}` |
| 变量提升 | 整体提升（含体） | 仅变量名提升，赋值不提升 | 无提升 |
| 自有 `this` | 有（运行时绑定） | 有（运行时绑定） | 无（继承词法 this） |
| `arguments` 对象 | 有 | 有 | 无（用剩余参数 `...args`） |
| 作为构造函数 | 可以 `new` | 可以 `new` | 不可以 |
| `prototype` 属性 | 有 | 有 | 无 |
| 隐式返回 | 不支持 | 不支持 | 单行表达式可省略 `{}` 隐式返回 |
| 适用场景 | 通用、需要递归或提升 | 回调、闭包、条件定义 | 简短回调、需要词法 this |

### 2.4 与相关技术的对比

与面向对象语言对比：JS 函数作为一等公民提供了更灵活的抽象能力。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 函数 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：三种函数定义的行为差异

```typescript
// 1. 函数声明 — 整体提升，可在定义前调用
console.log(declared(2)); // 4
function declared(x: number): number {
  return x * x;
}

// 2. 函数表达式 — 提升的是变量，不是函数体
// console.log(expressed(2)); // ReferenceError: Cannot access 'expressed' before initialization
const expressed = function (x: number): number {
  return x * x;
};

// 3. 箭头函数 — 无自身 this，适合回调与简短逻辑
const arrow = (x: number): number => x * x;

// 4. this 绑定差异演示
const obj = {
  name: 'Alice',
  greetDecl: function () {
    return `Hello, ${this.name}`; // this = obj
  },
  greetArrow: () => {
    return `Hello, ${(obj as any).name}`; // 词法 this，此处指向外层（如 global/module）
  },
  greetMethod() {
    setTimeout(function () {
      // console.log(this.name); // undefined 或报错，this 指向全局/timer
    }, 0);
    setTimeout(() => {
      console.log(this.name); // "Alice" — 继承词法 this
    }, 0);
  },
};

// 5. 高阶函数：柯里化示例
function curry<T, U, V>(fn: (a: T, b: U) => V) {
  return (a: T) => (b: U) => fn(a, b);
}
const add = (a: number, b: number) => a + b;
const curriedAdd = curry(add);
console.log(curriedAdd(3)(4)); // 7
```

### 3.3 代码示例：闭包与私有状态

```typescript
// closures-and-privacy.ts

// 模块模式：闭包模拟私有字段
function createCounter(initial = 0) {
  let count = initial; // 私有状态，外部无法直接访问

  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    get value() {
      return count;
    },
    reset() {
      count = initial;
    },
  };
}

const counter = createCounter(10);
counter.increment();
console.log(counter.value); // 11
// console.log(counter.count); // Error: Property 'count' does not exist

// 闭包陷阱：循环中延迟绑定
function createButtonsBuggy() {
  const buttons = [];
  for (var i = 0; i < 3; i++) {
    buttons.push(() => console.log(i)); // 所有按钮输出 3
  }
  return buttons;
}

function createButtonsFixed() {
  const buttons = [];
  for (let i = 0; i < 3; i++) {
    buttons.push(() => console.log(i)); // 每个闭包捕获独立的 i
  }
  return buttons;
}

// 或者使用 IIFE 绑定当前值
function createButtonsIIFE() {
  const buttons = [];
  for (var i = 0; i < 3; i++) {
    ((captured) => {
      buttons.push(() => console.log(captured));
    })(i);
  }
  return buttons;
}
```

### 3.4 代码示例：生成器与惰性序列

```typescript
// generators-lazy.ts

// 无限斐波那契序列（惰性求值）
function* fibonacci(): Generator<number, never, unknown> {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
console.log(fib.next().value); // 0
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2

// 带提前终止的生成器
function* range(start: number, end: number, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

// 生成器组合：管道式数据处理
function* map<T, U>(iter: Iterable<T>, fn: (x: T) => U): Generator<U> {
  for (const x of iter) yield fn(x);
}

function* filter<T>(iter: Iterable<T>, predicate: (x: T) => boolean): Generator<T> {
  for (const x of iter) {
    if (predicate(x)) yield x;
  }
}

function* take<T>(iter: Iterable<T>, n: number): Generator<T> {
  let count = 0;
  for (const x of iter) {
    if (count++ >= n) return;
    yield x;
  }
}

// 惰性管道：仅处理需要的元素
const pipeline = take(
  filter(
    map(range(1, 1000), (x) => x * x),
    (x) => x % 2 === 0
  ),
  5
);
console.log([...pipeline]); // [4, 16, 36, 64, 100]

// 双向通信生成器
function* game(): Generator<string, void, string> {
  const name = yield 'What is your name?';
  yield `Hello, ${name}!`;
}

const g = game();
console.log(g.next().value);       // 'What is your name?'
console.log(g.next('Alice').value); // 'Hello, Alice!'
```

### 3.5 代码示例：异步函数与并发模式

```typescript
// async-patterns.ts

// 顺序执行（保留依赖）
async function sequentialFetch(urls: string[]): Promise<string[]> {
  const results: string[] = [];
  for (const url of urls) {
    const res = await fetch(url);
    results.push(await res.text());
  }
  return results;
}

// 并行执行（Promise.all）
async function parallelFetch(urls: string[]): Promise<string[]> {
  const responses = await Promise.all(urls.map((url) => fetch(url)));
  return Promise.all(responses.map((r) => r.text()));
}

// 异步生成器：处理流式数据
async function* fetchPaginated<T>(baseUrl: string): AsyncGenerator<T[], void, unknown> {
  let page = 1;
  while (true) {
    const res = await fetch(`${baseUrl}?page=${page}`);
    const data: T[] = await res.json();
    if (data.length === 0) return;
    yield data;
    page++;
  }
}

// 使用 for await...of 消费异步生成器
async function consumeStream() {
  for await (const batch of fetchPaginated('https://api.example.com/items')) {
    console.log(`Received ${batch.length} items`);
  }
}

// 带重试的异步包装器
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delayMs * Math.pow(2, i))); // 指数退避
      }
    }
  }
  throw lastError!;
}
```

### 3.6 代码示例：函数组合与管道

```typescript
// function-composition.ts

type Fn<T, U> = (x: T) => U;

// 右结合组合：compose(f, g, h)(x) === f(g(h(x)))
function compose<T>(...fns: Fn<any, any>[]): Fn<T, any> {
  return (x) => fns.reduceRight((acc, fn) => fn(acc), x);
}

// 左结合管道：pipe(x, f, g, h) === h(g(f(x)))
function pipe<T>(x: T, ...fns: Fn<any, any>[]): any {
  return fns.reduce((acc, fn) => fn(acc), x);
}

// 实际应用：数据转换管道
const trim = (s: string) => s.trim();
const toLower = (s: string) => s.toLowerCase();
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const removeExtraSpaces = (s: string) => s.replace(/\s+/g, ' ');

const normalizeName = compose(capitalize, toLower, trim, removeExtraSpaces);
console.log(normalizeName('  JOHN   DOE  ')); // 'John doe'

// 类型安全的部分应用
function partial<T extends unknown[], U extends unknown[], R>(
  fn: (...args: [...T, ...U]) => R,
  ...prefix: T
): (...suffix: U) => R {
  return (...suffix) => fn(...prefix, ...suffix);
}

const add = (a: number, b: number, c: number) => a + b + c;
const addFive = partial(add, 2, 3);
console.log(addFive(5)); // 10
```

### 3.7 代码示例：记忆化（Memoization）

```typescript
// memoization.ts

function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;
}

// 斐波那契记忆化（从指数级优化到线性级）
const fibMemo = memoize((n: number): number => {
  if (n < 2) return n;
  return fibMemo(n - 1) + fibMemo(n - 2);
});

console.log(fibMemo(50)); // 12586269025（毫秒级完成）

// 带 LRU 限制的记忆化
function memoizeLRU<T extends (...args: any[]) => any>(fn: T, maxSize = 100): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      // 提升到最近使用
      const val = cache.get(key)!;
      cache.delete(key);
      cache.set(key, val);
      return val;
    }

    const result = fn.apply(this, args);
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(key, result);
    return result;
  } as T;
}
```

### 3.8 常见误区

| 误区 | 正确理解 |
|------|---------|
| 箭头函数完全等价于普通函数 | 箭头函数无自身 this、arguments 和原型 |
| async 函数总是返回 Promise | 即使返回非 Promise 值也会被包装 |
| 生成器函数立即执行 | 调用生成器函数返回迭代器，不执行体，首次 next() 才开始 |
| 闭包不会导致内存泄漏 | 未释放的闭包引用会阻止垃圾回收 |

---

## 四、扩展阅读

- [MDN 函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- [MDN：箭头函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [MDN：async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN：生成器函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
- [MDN：Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [MDN：Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
- [ECMAScript® 2025 — ECMAScript Function Objects](https://tc39.es/ecma262/#sec-ecmascript-function-objects)
- [ECMAScript® 2025 — Async Function Objects](https://tc39.es/ecma262/#sec-async-function-objects)
- [ECMAScript® 2025 — GeneratorFunction Objects](https://tc39.es/ecma262/#sec-generatorfunction-objects)
- [JavaScript Info：Functions](https://javascript.info/function-basics) — 函数基础与进阶
- [JavaScript Info：Closure](https://javascript.info/closure) — 闭包可视化教程
- [You Don't Know JS Yet: Scope & Closures](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/README.md) — 作用域与闭包深度解析
- [Functional-Light JavaScript](https://github.com/getify/Functional-Light-JS) — 轻量级函数式编程
- [Lodash FP Guide](https://github.com/lodash/lodash/wiki/FP-Guide) — 函数式工具库参考
- `10-fundamentals/10.1-language-semantics/04-functions/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
