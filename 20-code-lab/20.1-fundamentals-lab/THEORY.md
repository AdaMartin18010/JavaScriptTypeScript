# 语言核心基础：理论基础

> **定位**：`20-code-lab/20.1-fundamentals-lab/`
> **关联**：`10-fundamentals/10.1-language-semantics/` | `10-fundamentals/10.2-type-system/`

---

## 一、核心理论

### 1.1 问题域定义

JavaScript 语言核心是所有上层抽象（框架、运行时、工具链）的**共同基础**。理解语言核心不仅是语法记忆，更是掌握**执行语义、类型 coercion、作用域链、闭包机制**等深层机制，这些是调试复杂 bug 和性能优化的根本能力。

### 1.2 关键概念

| 概念 | 定义 | 关联文件 |
|------|------|---------|
| **动态类型** | 变量无固定类型，类型检查推迟到运行时 | `type-coercion.ts` |
| **原型链** | 对象属性查找的委托机制 | `prototype-chain.ts` |
| **闭包** | 函数记住其词法作用域的能力 | `closures.ts` |
| **事件循环** | 单线程异步执行的调度机制 | `event-loop.ts` |
| **TDZ** | 暂时性死区，let/const 的初始化前访问保护 | `tdz-demo.ts` |

---

## 二、语言对比：JS vs TS vs WASM vs JS-Like

| 维度 | JavaScript | TypeScript | WebAssembly | AssemblyScript | Dart |
|------|-----------|-----------|-------------|---------------|------|
| **类型系统** | 动态弱类型 | 静态结构化类型 | 无（二进制） | 静态类似 TS | 静态强类型 |
| **编译阶段** | 无（解释/JIT） | tsc → JS | 二进制字节码 | asc → WASM | dart2js / VM |
| **运行时** | V8/SpiderMonkey/JSC | V8/SpiderMonkey/JSC | WASM VM | WASM VM | Dart VM / JS |
| **性能上限** | 中（JIT 优化后） | 中（同 JS） | 高（接近原生） | 高（WASM） | 中-高 |
| **互操作性** | 原生 | 完美降级为 JS | JS ↔ WASM API | 同 WASM | JS interop |
| **包生态** | npm（最大） | npm + @types | WASM 模块 | npm | pub.dev |
| **学习曲线** | 低 | 中 | 高（需 C++/Rust） | 中 | 中 |
| **最佳场景** | 快速原型、全栈 | 大型项目、团队协作 | 计算密集型、游戏 | 前端计算加速 | Flutter、全栈 |
| **类型擦除** | N/A | 是（编译后无类型） | N/A | N/A | 否（运行时有类型） |
| **泛型支持** | 无（运行时） | 完整（编译期） | 无 | 有限 | 完整 |

---

## 三、设计原理

### 3.1 为什么存在这些机制

JavaScript 的设计受 1995 年浏览器脚本需求的深刻影响：

- **动态类型**：快速原型，降低入门门槛
- **原型继承**：简化对象创建，避免类系统的复杂性
- **单线程事件循环**：避免并发编程的锁竞争，简化 DOM 操作
- **函数一等公民**：支持高阶函数和回调驱动的异步编程

### 3.2 权衡分析

| 机制 | 优点 | 缺点 | 现代替代/缓解 |
|------|------|------|-------------|
| 动态类型 | 灵活、快速原型 | 运行时错误、重构困难 | TypeScript 静态类型 |
| 原型继承 | 简洁、内存高效 | 理解曲线陡峭、继承关系隐式 | class 语法糖 |
| 单线程 | 无锁、DOM 安全 | CPU 密集型任务阻塞 | Worker Threads |
| 隐式类型转换 | 语法宽容 | 意外行为（`[] + {}`） | 严格相等 `===`、TS |

---

## 四、代码示例：TypeScript 高级类型收窄

```typescript
// type-narrowing.ts — 类型守卫与收窄模式

// 1. 自定义类型守卫（Type Predicate）
interface Cat {
  kind: 'cat';
  meow(): void;
}

interface Dog {
  kind: 'dog';
  bark(): void;
}

type Animal = Cat | Dog;

function isCat(animal: Animal): animal is Cat {
  return animal.kind === 'cat';
}

function makeSound(animal: Animal): void {
  if (isCat(animal)) {
    animal.meow(); // TypeScript 知道这里是 Cat
  } else {
    animal.bark(); // TypeScript 知道这里是 Dog
  }
}

// 2. 判别式联合（Discriminated Union）
interface Square {
  kind: 'square';
  size: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Circle {
  kind: 'circle';
  radius: number;
}

type Shape = Square | Rectangle | Circle;

// exhaustive switch：确保处理所有 case
function area(shape: Shape): number {
  switch (shape.kind) {
    case 'square':
      return shape.size ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'circle':
      return Math.PI * shape.radius ** 2;
    default:
      // 利用 never 类型进行穷尽检查
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}

// 3. 基于 in 操作符的收窄
interface Car {
  drive(): void;
  wheels: number;
}

interface Boat {
  sail(): void;
  draft: number;
}

function move(vehicle: Car | Boat): void {
  if ('drive' in vehicle) {
    vehicle.drive(); // Car
  } else {
    vehicle.sail(); // Boat
  }
}

// 4. 基于 typeof / instanceof 的收窄
function processValue(value: string | number | Date): string {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  const _exhaustive: never = value;
  return _exhaustive;
}

// 5. 品牌类型（Branded Types）— 模拟名义类型
type UserId = string & { __brand: 'UserId' };
type OrderId = string & { __brand: 'OrderId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createOrderId(id: string): OrderId {
  return id as OrderId;
}

function getUser(id: UserId) {
  return db.users.find(id);
}

const uid = createUserId('123');
const oid = createOrderId('456');
getUser(uid); // ✅ 正确
// getUser(oid); // ❌ 编译错误：类型不兼容
```

---

## 五、代码示例：JavaScript 核心机制深度演示

```typescript
// core-mechanisms.ts — 闭包、原型链、事件循环

// 1. 闭包与私有状态模块模式
function createCounter() {
  let count = 0; // 被闭包捕获的私有状态

  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getValue() {
      return count;
    },
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getValue());  // 2
// console.log(counter.count);    // undefined — 私有状态不可访问

// 2. 原型链委托
const animal = {
  speak() {
    return 'Some sound';
  },
};

const dog = Object.create(animal);
dog.speak = function () {
  return 'Woof!';
};

console.log(dog.speak());        // "Woof!" — 自身属性
console.log(dog.__proto__.speak()); // "Some sound" — 原型链

// 3. 微任务与宏任务执行顺序演示
console.log('1. Script start');

setTimeout(() => console.log('2. setTimeout (macrotask)'), 0);

Promise.resolve().then(() => {
  console.log('3. Promise 1 (microtask)');
}).then(() => {
  console.log('4. Promise 2 (microtask)');
});

queueMicrotask(() => {
  console.log('5. queueMicrotask');
});

console.log('6. Script end');

// 输出顺序：1 → 6 → 3 → 5 → 4 → 2
```

---

## 六、实践映射

### 6.1 从理论到代码

本模块的代码示例覆盖：

- `index.ts`：类型 coercion 的边界案例
- 执行上下文与作用域链的可视化
- 闭包在模块模式和工厂函数中的应用

### 6.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| `var` 与 `let` 只是语法差异 | `var` 有函数作用域和变量提升，`let` 有块作用域和 TDZ |
| `this` 指向函数本身 | `this` 由调用方式决定，箭头函数捕获词法 this |
| `==` 与 `===` 只是严格程度差异 | `==` 触发隐式类型转换，可能产生意外结果 |

---

## 七、扩展阅读

- `10-fundamentals/10.1-language-semantics/axioms/` — 三条公理化基础
- `10-fundamentals/10.2-type-system/structural-vs-nominal.md` — 结构子类型理论
- `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/01_language_core.md` — 语言核心全景综述

---

## 八、权威参考与外部链接

| 资源 | 描述 | 链接 |
|------|------|------|
| **ECMA-262** | JavaScript 语言规范 | [tc39.es/ecma262](https://tc39.es/ecma262/) |
| **TypeScript Handbook** | 官方类型系统文档 | [typescriptlang.org/docs/handbook/intro.html](https://www.typescriptlang.org/docs/handbook/intro.html) |
| **You Don't Know JS** | Kyle Simpson 深度 JS 系列 | [github.com/getify/You-Dont-Know-JS](https://github.com/getify/You-Dont-Know-JS) |
| **2ality** | Dr. Axel Rauschmayer 的 JS/TS 深度博客 | [2ality.com](https://2ality.com/) |
| **WebAssembly Spec** | WASM 核心规范 | [webassembly.github.io/spec/core](https://webassembly.github.io/spec/core/) |
| **V8 Blog** | Google V8 引擎官方博客 | [v8.dev/blog](https://v8.dev/blog) |
| **MDN JavaScript** | Mozilla 开发者网络参考 | [developer.mozilla.org/en-US/docs/Web/JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) |
| **TC39 Proposals** | JavaScript 语言演进提案 | [github.com/tc39/proposals](https://github.com/tc39/proposals) |

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*

## 深化补充

### 新增代码示例：Temporal Dead Zone (TDZ) 与隐式转换陷阱

```typescript
// tdz-deep-dive.ts

// 1. TDZ：typeof 在死区内也会报错
function tdzDemo() {
  console.log(typeof notYet); // ❌ ReferenceError: Cannot access 'notYet' before initialization
  let notYet = 42;
}

// 2. 隐式转换边缘案例
function coercionTraps() {
  const cases = [
    { expr: "[] + {}", expected: "[object Object]" },
    { expr: "{} + []", expected: 0 }, // 在语句开头 {} 被解析为代码块
    { expr: "[] + []", expected: "" },
    { expr: "1 + '2'", expected: "12" },
    { expr: "1 - '2'", expected: -1 },
  ];
  return cases;
}

// 3. 闭包内存泄漏模式
function leakPattern() {
  const bigData = new Array(1e6).fill('x');
  return {
    getSize: () => bigData.length, // bigData 被闭包捕获，无法释放
  };
}
const leaky = leakPattern();
// 即使不再需要 bigData，它仍驻留内存
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| ECMA-262 Lexical Environments | [tc39.es/ecma262/#sec-lexical-environments](https://tc39.es/ecma262/#sec-lexical-environments) | 作用域与 TDZ 规范 |
| MDN — Closures | [developer.mozilla.org/en-US/docs/Web/JavaScript/Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) | 闭包详解 |
| MDN — Event Loop | [developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) | 事件循环可视化 |
| V8 Blog — Trash Talk | [v8.dev/blog/trash-talk](https://v8.dev/blog/trash-talk) | 垃圾回收机制 |
| 2ality — JavaScript Types | [2ality.com/2020/04/types-javascript.html](https://2ality.com/2020/04/types-javascript.html) | JS 类型系统深度分析 |
| JavaScript.info | [javascript.info](https://javascript.info/) | 现代 JS 教程 |
