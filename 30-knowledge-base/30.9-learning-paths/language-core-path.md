---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# 语言核心专项学习路径 (Language Core Path)

> 从能写代码到理解代码为什么这样运行，最终触及 JavaScript/TypeScript 的形式化本质。
>
> **覆盖维度**：语言核心

## 路径目标与预期产出

完成本路径后，你将能够：

- **入门**：熟练编写类型安全的 TS 代码，掌握 ES2024/ES2025 核心特性
- **进阶**：进行"类型体操"设计、准确画出事件循环时序图、理解模块解析语义
- **专家**：阅读 ECMAScript 规格说明，理解形式化语义，甚至参与编译器/类型系统的设计

**预计总周期**：6–9 周（每天 2–3 小时）

---

## 目录

- [语言核心专项学习路径 (Language Core Path)](#语言核心专项学习路径-language-core-path)
  - [路径目标与预期产出](#路径目标与预期产出)
  - [目录](#目录)
  - [阶段一：入门](#阶段一入门)
    - [节点 1.1 基础类型系统](#节点-11-基础类型系统)
    - [节点 1.2 现代 ECMAScript 特性](#节点-12-现代-ecmascript-特性)
    - [节点 1.3 变量与作用域](#节点-13-变量与作用域)
  - [阶段二：进阶](#阶段二进阶)
    - [节点 2.1 高级类型与类型体操](#节点-21-高级类型与类型体操)
    - [节点 2.2 执行模型与事件循环](#节点-22-执行模型与事件循环)
    - [节点 2.3 模块系统与解析语义](#节点-23-模块系统与解析语义)
  - [阶段三：专家](#阶段三专家)
    - [节点 3.1 形式化语义基础](#节点-31-形式化语义基础)
    - [节点 3.2 类型理论](#节点-32-类型理论)
    - [节点 3.3 编译器前端与元编程](#节点-33-编译器前端与元编程)
  - [阶段验证 Checkpoint](#阶段验证-checkpoint)
  - [推荐资源](#推荐资源)

---

## 阶段一：入门 —— TypeScript 基础与 ECMAScript 现代语法 (1–2 周)

### 节点 1.1 基础类型系统

- **关联文件/模块**：
  - `10-fundamentals/10.1-language-semantics/`
  - `10-fundamentals/10.2-type-system/`
  - `docs/cheatsheets/TYPESCRIPT_CHEATSHEET.md`
- **关键技能**：
  - `interface` vs `type` 的核心区别
  - 泛型约束与条件类型基础
  - 类型守卫（`typeof` / `instanceof` / `in` / 自定义守卫）
  - TypeScript 5.6 `strictBuiltinIteratorReturn` 与类型收窄改进

**代码示例：基础类型守卫与类型收窄**

```typescript
// 自定义类型守卫
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

// discriminated union 收窄
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default:
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

### 节点 1.2 现代 ECMAScript 特性

- **关联文件/模块**：
  - `10-fundamentals/10.1-language-semantics/ecmascript-evolution/`
- **关键技能**：
  - ES2024 已发布特性：`Array.prototype.toSorted/toSpliced/toReversed`、`Promise.withResolvers`、`Object.groupBy`
  - ES2025 提案进度：`Set.prototype.union/intersection`、`Array.prototype.fromAsync`、`Temporal API`
  - Decorators（Stage 3）实际应用与限制
  - 理解 TC39 阶段流程（Stage 0–3）与提案生命周期

**代码示例：ES2024 新特性**

```typescript
// toSorted —— 不改变原数组的排序
const original = [3, 1, 4, 1, 5];
const sorted = original.toSorted((a, b) => a - b);
console.log(original); // [3, 1, 4, 1, 5] 不变
console.log(sorted);   // [1, 1, 3, 4, 5]

// Promise.withResolvers —— 手动 resolve/reject
function delay(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

// Object.groupBy —— 按属性分组
const people = [
  { name: 'Alice', age: 21 },
  { name: 'Bob', age: 17 },
  { name: 'Carol', age: 25 },
];
const byAdult = Object.groupBy(people, (p) => (p.age >= 18 ? 'adult' : 'minor'));
// { adult: [{Alice}, {Carol}], minor: [{Bob}] }
```

### 节点 1.3 变量与作用域

- **关联文件/模块**：
  - `10-fundamentals/10.1-language-semantics/variable-system/`
- **关键技能**：
  - 词法作用域 vs 动态作用域
  - 变量提升（Hoisting）与 TDZ（Temporal Dead Zone）
  - 闭包与内存泄漏防范
  - `const` / `let` / `var` 在循环、条件块中的微小区别与最佳实践

**代码示例：TDZ 与闭包陷阱**

```typescript
// TDZ 演示
function tdzDemo() {
  console.log(typeof x); // "undefined"（var 提升）
  // console.log(typeof y); // ReferenceError（let TDZ）
  var x = 1;
  let y = 2;
}

// 闭包循环陷阱与修复
function createCountersBroken() {
  const counters = [];
  for (var i = 0; i < 3; i++) {
    counters.push(() => i); // 全部返回 3
  }
  return counters;
}

function createCountersFixed() {
  const counters = [];
  for (let i = 0; i < 3; i++) {
    counters.push(() => i); // 分别返回 0, 1, 2
  }
  return counters;
}
```

---

## 阶段二：进阶 —— 类型系统深度与执行模型 (2–3 周)

### 节点 2.1 高级类型与类型体操

- **关联文件/模块**：
  - `20-code-lab/20.1-language-core/type-theory/`
- **关键技能**：
  - 映射类型、模板字面量类型、递归类型
  - TypeScript 5.6 `NoInfer<T>` 与 `satisfies` 运算符进阶用法
  - 类型推断的极限与边界（`infer` 分布条件类型）
  - 结构类型系统 vs 名义类型系统

**代码示例：类型体操 —— DeepPick**

```typescript
// DeepPick<T, 'a.b.c'> 实现
type DeepPick<T, Path extends string> = Path extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? { [P in K]: DeepPick<T[K], Rest> }
    : never
  : Path extends keyof T
    ? { [P in Path]: T[Path] }
    : never;

interface Nested {
  user: {
    profile: {
      name: string;
      age: number;
    };
    settings: {
      theme: 'light' | 'dark';
    };
  };
}

type NameOnly = DeepPick<Nested, 'user.profile.name'>;
// { user: { profile: { name: string } } }
```

### 节点 2.2 执行模型与事件循环

- **关联文件/模块**：
  - `10-fundamentals/10.4-execution-model/`
  - `20-code-lab/20.3-concurrency-async/`
- **关键技能**：
  - 宏任务 / 微任务 / `requestAnimationFrame` / `queueMicrotask` 的完整时序
  - V8 引擎的 Ignition + TurboFan + Maglev 流水线
  - `Atomics` API 与 SharedArrayBuffer 并发模型

**代码示例：事件循环时序可视化**

```typescript
// event-loop-order.ts —— 预测并验证输出顺序
async function eventLoopDemo() {
  console.log('1: sync start');

  setTimeout(() => console.log('6: macrotask (timeout)'), 0);

  Promise.resolve().then(() => {
    console.log('3: microtask 1');
    queueMicrotask(() => console.log('5: nested microtask'));
  });

  await Promise.resolve();
  console.log('4: await resume');

  requestAnimationFrame(() => console.log('7: rAF'));

  console.log('2: sync end');
}

// 预期输出顺序：1 → 2 → 3 → 4 → 5 → 6 → 7
```

### 节点 2.3 模块系统与解析语义

- **关联文件/模块**：
  - `10-fundamentals/10.8-module-system/`
- **关键技能**：
  - ESM vs CJS 的语义差异与互操作
  - `package.json` exports / imports 条件解析与子路径导入
  - TypeScript 的模块解析策略（`classic` vs `node` vs `bundler` vs `node16`）

**代码示例：条件导出最佳实践**

```json
{
  "name": "my-lib",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./package.json": "./package.json"
  }
}
```

---

## 阶段三：专家 —— 形式化语义与编译器设计 (3–4 周)

### 节点 3.1 形式化语义基础

- **关联文件/模块**：
  - `20-code-lab/20.10-formal-verification/formal-semantics/`
- **关键技能**：
  - 操作语义（Operational Semantics）
  - 指称语义（Denotational Semantics）
  - 使用 TLA+ 描述并发协议
  - 抽象解释（Abstract Interpretation）在静态分析中的应用

**代码示例：TLA+ 读写锁规格骨架**

```tla
(* ReadWriteLock.tla *)
------------------------------- MODULE ReadWriteLock -------------------------------
EXTENDS Naturals, Sequences, FiniteSets

CONSTANTS Readers, Writers

VARIABLES state, waitingReaders, waitingWriters

TypeInvariant ==
  /\ state \in {"idle", "reading", "writing"}
  /\ waitingReaders \subseteq Readers
  /\ waitingWriters \subseteq Writers

(* 安全性：读写互斥、写写互斥 *)
Mutex ==
  state = "writing" => waitingReaders = {}

(* 活性：等待的写者最终能写入 *)
NoWriterStarvation ==
  \A w \in Writers : w \in waitingWriters ~> state = "writing"
===================================================================================
```

### 节点 3.2 类型理论

- **关联文件/模块**：
  - `20-code-lab/20.1-language-core/type-theory/`
- **关键技能**：
  - 简单类型 lambda 演算
  - 子类型与 F-子类型
  - 类型健全性（Type Soundness）证明思路
  - 渐进类型（Gradual Typing）的理论基础与 soundness 折中

### 节点 3.3 编译器前端与元编程

- **关联文件/模块**：
  - `20-code-lab/20.11-rust-toolchain/compiler-design/`
- **关键技能**：
  - 词法分析 / 语法分析 / AST 遍历（使用 Babel / SWC / Oxc API）
  - TypeScript Compiler API 与转换器编写
  - 装饰器、宏与代码生成的边界

**代码示例：Babel 插件 —— 自动添加类型守卫**

```typescript
// babel-plugin-add-guard.ts
import { PluginObj } from '@babel/core';
import * as t from '@babel/types';

export default function addGuardPlugin(): PluginObj {
  return {
    visitor: {
      FunctionDeclaration(path) {
        const params = path.node.params;
        params.forEach((param) => {
          if (t.isIdentifier(param) && param.typeAnnotation) {
            // 在函数体开头插入类型守卫检查
            console.log(`Guard for ${param.name}`);
          }
        });
      },
    },
  };
}
```

---

## 阶段验证 Checkpoint

### Checkpoint 1：类型安全 EventEmitter

```typescript
// checkpoint-1-skeleton.ts —— 类型安全 EventEmitter 骨架
export interface EventMap {
  [event: string]: unknown;
}

export class TypedEventEmitter<Events extends EventMap> {
  private listeners = new Map<string, Set<(payload: unknown) => void>>();

  on<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): () => void {
    const key = String(event);
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener as (payload: unknown) => void);
    return () => this.listeners.get(key)?.delete(listener as (payload: unknown) => void);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const key = String(event);
    this.listeners.get(key)?.forEach((fn) => fn(payload));
  }
}

// 使用
interface MyEvents {
  login: { userId: string; timestamp: number };
  logout: { userId: string };
}

const emitter = new TypedEventEmitter<MyEvents>();
emitter.on('login', (e) => console.log(e.userId)); // e 自动推断为 { userId, timestamp }
```

- **代码位置**：`20-code-lab/20.1-language-core/event-emitter-typed.ts`
- **通过标准**：`vitest run` 全部通过，支持泛型事件名称与回调参数类型
- **难度**：⭐⭐ | **预计时间**：1 周

### Checkpoint 2：类型体操挑战 + 事件循环可视化

- **项目 A（类型体操）**：不借助库实现 `DeepPick<T, Path>`、`TupleToUnion<T>` 等工具类型
  - **代码位置**：`20-code-lab/20.1-language-core/type-challenges/`
  - **通过标准**：通过 5 道以上 hard 难度类型挑战
- **项目 B（执行模型）**：用代码 + 时序图解释一段包含 `Promise` / `setTimeout` / `async-await` / `Atomics` 的代码执行顺序
  - **代码位置**：`20-code-lab/20.3-concurrency-async/event-loop-visualization/`
  - **通过标准**：时序图与 Node.js/V8 实际输出 100% 一致
- **难度**：⭐⭐⭐⭐ | **预计时间**：2 周

### Checkpoint 3：形式化验证或玩具编译器

- **选项 A（形式化验证）**：用 TLA+ 描述并验证一个简化版的分布式锁或读写锁协议
  - **通过标准**：TLC 模型检查通过，所有不变量保持
- **选项 B（玩具编译器）**：实现一个支持变量声明、算术表达式、函数调用的迷你语言到 JS 的转译器
  - **通过标准**：通过 20+ 条测试用例，含错误处理
- **难度**：⭐⭐⭐⭐⭐ | **预计时间**：3–4 周

---

## 推荐资源

| 资源 | 类型 | 链接 |
|------|------|------|
| ECMAScript 2025 Language Specification | 规范 | [tc39.es/ecma262/](https://tc39.es/ecma262/) |
| TypeScript Compiler Internals | 文档 | [github.com/microsoft/TypeScript/wiki/Architectural-Overview](https://github.com/microsoft/TypeScript/wiki/Architectural-Overview) |
| TC39 Proposals Tracker | 追踪 | [tc39.es/proposals/](https://tc39.es/proposals/) |
| TypeScript 5.6 Release Notes | 博客 | [devblogs.microsoft.com/typescript/announcing-typescript-5-6/](https://devblogs.microsoft.com/typescript/announcing-typescript-5-6/) |
| TAPL (Types and Programming Languages) | 教材 | [www.cis.upenn.edu/~bcpierce/tapl/](https://www.cis.upenn.edu/~bcpierce/tapl/) |
| Dragon Book (Compilers) | 教材 | [en.wikipedia.org/wiki/Compilers:_Principles,_Techniques,_and_Tools](https://en.wikipedia.org/wiki/Compilers:_Principles,_Techniques,_and_Tools) |
| TLA+ Video Course | 视频 | [lamport.azurewebsites.net/video/videos.html](https://lamport.azurewebsites.net/video/videos.html) |
| Type Challenges | 练习 | [github.com/type-challenges/type-challenges](https://github.com/type-challenges/type-challenges) |
| JS Event Loop Visualizer | 工具 | [www.jsv9000.app/](https://www.jsv9000.app/) |
| V8 Blog | 博客 | [v8.dev/blog](https://v8.dev/blog) |
| Node.js Event Loop Guide | 文档 | [nodejs.org/en/docs/guides/event-loop-timers-and-nexttick](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick) |
| ECMAScript Spec Explorer | 工具 | [tc39.es/ecma262/multipage/](https://tc39.es/ecma262/multipage/) |
| TypeScript Deep Dive | 书籍 | [basarat.gitbook.io/typescript/](https://basarat.gitbook.io/typescript/) |
| Effective TypeScript | 书籍 | [effectivetypescript.com/](https://effectivetypescript.com/) |
| You Don't Know JS (2nd Edition) | 书籍 | [github.com/getify/You-Dont-Know-JS](https://github.com/getify/You-Dont-Know-JS) |
| JavaScript: The First 20 Years | 历史 | [dl.acm.org/doi/10.1145/3386327](https://dl.acm.org/doi/10.1145/3386327) |
| Crafting Interpreters | 教程 | [craftinginterpreters.com/](https://craftinginterpreters.com/) |

---

*最后更新: 2026-04-30*
