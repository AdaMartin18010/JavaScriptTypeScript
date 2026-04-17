# JavaScript / TypeScript 深度技术分析

> 本文档是 `JSTS全景综述` 系列的执行摘要（Executive Summary）与 2026 最佳实践出口。
> 面向研究者与高级开发者，提供概念准确的深度分析，而非严格的数学证明。
> 版本：2026.04

---

## 目录

- [JavaScript / TypeScript 深度技术分析](#javascript--typescript-深度技术分析)
  - [目录](#目录)
  - [1. JS/TS 语言语义的核心特征](#1-jsts-语言语义的核心特征)
    - [1.1 类型：动态基础 + 可擦除静态层](#11-类型动态基础--可擦除静态层)
    - [1.2 作用域：词法作用域（Lexical Scoping）+ 提升（Hoisting）](#12-作用域词法作用域lexical-scoping-提升hoisting)
    - [1.3 并发：单线程事件循环 + 协作式调度](#13-并发单线程事件循环--协作式调度)
    - [1.4 对象：基于原型的委托（Prototype-based Delegation）](#14-对象基于原型的委托prototype-based-delegation)
    - [1.5 模块：静态 ESM + 动态 `import()` 的混合系统](#15-模块静态-esm--动态-import-的混合系统)
  - [2. 2024-2026 年的关键演进](#2-2024-2026-年的关键演进)
    - [2.1 ECMAScript 2025（ES16）](#21-ecmascript-2025es16)
    - [2.2 TypeScript 5.9 / 6.0 / 7.0 预览](#22-typescript-59--60--70-预览)
    - [2.3 V8 Maglev：编译器层级的范式转移](#23-v8-maglev编译器层级的范式转移)
    - [2.4 Node.js 24：Type Stripping 与 ESM 互操作的全面成熟](#24-nodejs-24type-stripping-与-esm-互操作的全面成熟)
  - [3. 类型系统深度洞察](#3-类型系统深度洞察)
    - [3.1 约束求解推断（Constraint-based Type Inference）](#31-约束求解推断constraint-based-type-inference)
    - [3.2 Gradual Typing：从动态到静态的连续谱](#32-gradual-typing从动态到静态的连续谱)
    - [3.3 结构性子类型（Structural Subtyping）](#33-结构性子类型structural-subtyping)
    - [3.4 变型规则（Variance）](#34-变型规则variance)
  - [4. 执行模型深度洞察](#4-执行模型深度洞察)
    - [4.1 三层边界：V8 / 宿主（Host）/ Node.js](#41-三层边界v8--宿主host-nodejs)
    - [4.2 Event Loop 的精确模型](#42-event-loop-的精确模型)
    - [4.3 Top-level await 语义](#43-top-level-await-语义)
  - [5. 运行时与性能洞察](#5-运行时与性能洞察)
    - [5.1 Hidden Classes 与 Inline Caches（IC）](#51-hidden-classes-与-inline-cachesic)
    - [5.2 垃圾回收（GC）：V8 的 Generational + Concurrent 策略](#52-垃圾回收gcv8-的-generational--concurrent-策略)
    - [5.3 现代模块解析（Module Resolution）](#53-现代模块解析module-resolution)
  - [6. 2026 年推荐配置](#6-2026-年推荐配置)
    - [6.1 2026 推荐技术栈](#61-2026-推荐技术栈)
    - [6.2 推荐 `tsconfig.json`（TypeScript 6.0 / 2026）](#62-推荐-tsconfigjsontypescript-60--2026)
      - [2026 年配置升级要点](#2026-年配置升级要点)
      - [关键选项语义解释](#关键选项语义解释)
    - [6.3 为 TypeScript 7.0 做准备](#63-为-typescript-70-做准备)
      - [核心准备策略](#核心准备策略)
  - [7. 从"知识图谱"到"深度分析"的学习路径建议](#7-从知识图谱到深度分析的学习路径建议)
    - [7.1 研究者路径（形式化视角）](#71-研究者路径形式化视角)
    - [7.2 工程师路径（实践视角）](#72-工程师路径实践视角)
    - [7.3 关键出口原则（Takeaways）](#73-关键出口原则takeaways)
  - [参考来源](#参考来源)

---

## 1. JS/TS 语言语义的核心特征

JavaScript 是一门动态、单线程、基于原型的脚本语言。TypeScript 在其之上构建了一个静态类型层。
理解这对"基底语言 + 静态叠加层"的组合，需要从五个维度把握其核心语义。

### 1.1 类型：动态基础 + 可擦除静态层

JavaScript 的运行时值携带自己的类型标签（tag），类型在运行时决定。
ECMAScript 规范定义了 8 种类型：Undefined, Null, Boolean, String, Symbol, BigInt, Number, Object [^ecma262-types]。
TypeScript 的类型系统是一个**可擦除的（erasable）**静态层：在编译时被检查，生成 JavaScript 时被完全擦除，不影响运行时行为 [^ts-spec-overview]。

这决定了 TS 的一个基本限制：**它无法执行依赖于运行时类型信息的静态检查**。
例如，`typeof x === 'string'` 这样的类型收窄（narrowing）必须依赖控制流分析，而非静态类型本身。

### 1.2 作用域：词法作用域（Lexical Scoping）+ 提升（Hoisting）

JavaScript 使用词法作用域。
作用域链在函数/块创建时即由源代码的物理嵌套结构决定，而非调用栈。
然而，`var` 声明存在变量提升，函数声明也会被提升，这导致在代码执行前，作用域环境记录（Environment Record）已经预分配了绑定 [^ecma262-env]。

ES2015 引入的 `let` 和 `const` 使用块级作用域（Block Scoping），并存在"暂时性死区"（Temporal Dead Zone, TDZ）：在声明到初始化之间访问变量会抛出 `ReferenceError` [^ecma262-tdZ]。

### 1.3 并发：单线程事件循环 + 协作式调度

JavaScript 的核心并发模型是**单线程 + 事件循环**。这意味着：

- 在单个代理（Agent）内部，不存在抢占式的线程切换。
- 所有的并行性（parallelism）都必须通过**代理集群（Agent Cluster）**实现，例如 Web Workers 或 Node.js Worker Threads [^ecma262-agents]。
- 共享内存并发通过 `SharedArrayBuffer` 和 `Atomics` API 实现，遵循 ECMAScript 的内存模型，保证顺序一致性（Sequentially Consistent）的原子操作 [^ecma262-memory]。

### 1.4 对象：基于原型的委托（Prototype-based Delegation）

JavaScript 的对象不是经典的类实例。每个对象都有一个内部槽 `[[Prototype]]`，当属性查找失败时，引擎会沿此链向上委托（delegate）查找 [^ecma262-ordinary-object]。

`class` 语法（ES2015）是**原型继承的语法糖**。
它引入了 `[[HomeObject]]` 和 `super` 绑定，但底层仍然是基于 `[[Prototype]]` 的委托机制，而非 Java/C++ 的类模板实例化 [^ecma262-classes]。

### 1.5 模块：静态 ESM + 动态 `import()` 的混合系统

ECMAScript 模块（ESM）的设计是静态的：模块依赖图在求值（evaluation）之前就已经构建完成，导入绑定是不可变的间接绑定（immutable indirect bindings）[^ecma262-modules]。

动态 `import()` 返回一个 Promise，允许运行时加载模块，但它仍然在宿主环境中执行完整的模块加载、链接、求值三阶段 [^ecma262-import]。
Node.js 在此基础上通过 `--experimental-require-module`（已在 v22 稳定化）实现了 CommonJS 对 ESM 的 `require()` 互操作 [^nodejs-require-module]。

> 更详细的语义分层分析，请参阅 [《JavaScript / TypeScript 语言语义模型全面分析》](JS_TS_语言语义模型全面分析.md)。

---

## 2. 2024-2026 年的关键演进

### 2.1 ECMAScript 2025（ES16）

ES2025 已于 2025 年 6 月定稿，主要新增特性包括：

- **`Object.groupBy` / `Map.groupBy`**：稳定地按键对可迭代对象进行分组，避免了社区中各种手写分组实现的歧义 [^tc39-proposal-groupby]。
- **`Promise.withResolvers`**：提供一个标准的 `{ promise, resolve, reject }` 工厂，消除了大量第三方实现 [^tc39-proposal-promise-withResolvers]。
- **`Promise.try`**：标准地捕获同步异常并转为 rejected Promise，替代了 `Promise.resolve().then(() => ...)` 的惯用写法 [^ecma262-promisetry]。
- **Iterator Helpers**：`Iterator.prototype.map`、`filter`、`take`、`drop`、`flatMap`、`reduce`、`toArray` 等方法进入标准，为可迭代对象提供了延迟求值的链式操作能力 [^tc39-proposal-iterator-helpers]。
- **`Atomics.waitAsync`**：允许在 Worker 中对共享内存执行异步等待，为在浏览器主线程中使用锁模式打开了大门 [^ecma262-atomics]。
- **Temporal API**：已达 Stage 4，是 ECMAScript 2026 的确定成员。它提供了不可变的日期/时间对象和时区安全运算，意图彻底替代 Date [^tc39-proposal-temporal]。
- **`import defer`**（延迟模块求值）作为 TC39 Stage 3 提案正在快速推进，预计进入 ES2026。它允许模块在首次实际使用其导出时才执行，减少启动时间和循环依赖风险 [^tc39-proposal-defer-import-eval]。
- **正则表达式增强**：`￿` 形式的集合操作与属性转义得到进一步补全。

### 2.2 TypeScript 5.9 / 6.0 / 7.0 预览

TypeScript 在 2025-2026 年进入了快速迭代周期，5.9 和 6.0 逐步铺垫了 2026 年 TypeScript 7.0 / Go 重写（代号 Corsa）的语义基线：

- **TypeScript 5.9（2025 年 4 月发布）**
  - **`--strictInference`**：要求编译器在推断结果可能过于宽泛（如从泛型参数推断出 `unknown`）或存在歧义时发出错误，强制开发者在关键边界显式注解类型 [^ts-5.9-release]。
  - **`--noUncheckedSideEffectImports`**：对 `import "./styles.css"` 这类纯副作用导入进行存在性检查，防止拼写错误或模块丢失 [^ts-5.9-release]。
  - **更精确的泛型上下文推断**：改进了嵌套回调中的泛型类型推导，减少了显式类型参数的需求。

- **TypeScript 6.0（2026 年 3 月 17 日发布）**
  - **`es2025` target/lib**：将 ES2025 标准 API（`Promise.try`、`RegExp.escape`、Iterator Helpers、Set 数学方法）定型到 `target: "ES2025"` [^ts-6.0-release]。
  - **Temporal API 类型支持**：为已达 Stage 4 的 Temporal API 提供完整类型声明，支持纳秒精度日期时间类型 [^ts-6.0-release]。
  - **`import defer` 支持**：TC39 Stage 3 提案，提供同步语法、惰性求值的模块导入 [^ts-6.0-release]。
  - **`#/` subpath imports**：增强对 `package.json` `imports` 字段的解析语义支持 [^ts-6.0-release]。
  - 语言服务架构的进一步现代化，为 Go 重写版的编辑器体验做前置准备。

- **TypeScript 7.0 预览（Go 原生重写，Project Corsa）**
  - Microsoft 官方宣布 TS 7.0 将采用 Go 语言重写编译器核心，预计 2026 年下半年发布。性能目标是将编译速度提升 **10 倍以上**，同时**完全保持现有语言语义和类型系统行为** [^microsoft-blog-ts-native-port]。
  - **JS 版 tsc 维护模式**：6.x 结束后，JavaScript 实现的 `tsc` 将进入维护模式。
  - **LSP 统一**：语言服务将全面迁移至 Language Server Protocol，降低编辑器集成耦合度。
  - 对工程实践的影响：`tsc` 的角色将从"类型检查 + 转译"进一步聚焦为"纯类型检查器"。

### 2.3 V8 Maglev：编译器层级的范式转移

Google V8 引擎在 2024 年完成了编译器栈的重构：

- **Turbofan 被 Maglev + Turboshaft 取代**。Maglev 是一个快速优化编译器（fast optimizing compiler），它在 Ignition 解释器和完全优化的 Turboshaft 之间架起了一座桥 [^v8-maglev-blog]。
- **去优化（Deoptimization）开销降低**：Maglev 生成的代码比 Turbofan 更快生成，且去优化的成本更低，这使得 V8 对动态类型的"猜测-验证-回退"循环更加高效。
- **对 TypeScript 编译后的高阶函数和闭包更友好**：Maglev 对闭包内联（closure inlining）和稀疏数组的处理有显著改进。

### 2.4 Node.js 24：Type Stripping 与 ESM 互操作的全面成熟

Node.js 24 于 2026 年 3 月发布，预计同年 10 月进入 LTS，代表了 TypeScript 原生执行和 ESM 互操作在 Node 生态中的全面成熟：

- **`--strip-types` 默认启用**：Node.js 24 无需额外标志即可直接执行 `.ts` 文件，通过类型剥离（Type Stripping，即 annotation removal）而不进行类型检查。这对开发脚本和测试用例非常友好，但**不能替代 `tsc` 的类型检查** [^nodejs-24-release]。
- **`require(esm)` 无标志启用**：Node.js 22 中稳定化的 `require()` 同步加载 ESM 能力，在 Node.js 24 中无需任何实验性标志即可直接使用。CommonJS 模块可以无缝 `require()` 没有顶层 `await` 的 ESM 模块 [^nodejs-24-release]。
- **ESM 加载器 API（`module.register`）成熟**：允许在 ESM 模块链接阶段进行精细的拦截和转换。
- **Temporal API 实验性支持**：Node.js 24 内置了 `--experimental-temporal` 标志，开发者可以开始试用未来的日期时间标准 [^nodejs-24-release]。

> WinterTC 与 Minimum Common Web API 的详细解读，请参阅 [《JS/TS 标准化生态与运行时互操作》](JS_TS_标准化生态与运行时互操作.md)。

---

## 3. 类型系统深度洞察

本节纠正常见误解（尤其是 Hindley-Milner 算法），并提供准确的类型系统概念。

### 3.1 约束求解推断（Constraint-based Type Inference）

**常见误解**：TypeScript 使用 Hindley-Milner（HM）算法。

**事实**：TypeScript 的类型推断**不是** HM。HM 要求类型系统具有全局的、最一般合一解（Most General Unifier, MGU），且不支持子类型、重载、泛型约束、结构化类型、以及泛型的协变/逆变推导 [^ts-faq-inference]。

TypeScript 使用的是**基于约束求解的推断**（constraint-based inference）。其过程大致为：

1. 为泛型参数和待推断的表达式引入类型变量。
2. 根据代码结构（如函数调用、对象字面量、上下文类型）生成一组**类型约束**（type constraints）。
3. 求解约束集，得到满足所有条件的最优类型。如果没有唯一解，TS 会引入 `unknown` 或发出错误 [^ts-spec-inference]。

例如：

```typescript
declare function foo<T>(x: T, y: T): T;
foo({ a: 1 }, { b: 2 });
```

TS 会生成约束 `T >: { a: number }` 和 `T >: { b: number }`，然后推断出最佳公共类型（best common type）`{ a: number; b: number }` [^ts-handbook-inference]。

### 3.2 Gradual Typing：从动态到静态的连续谱

TypeScript 是一个**Gradual Type System**（渐进式类型系统）。这意味着：

- 代码可以在完全没有类型注解的情况下被编译（在 `noImplicitAny: false` 时，会隐式退化为 `any`）。
- 类型正确性不是全有或全无：可以在模块级别混合高度类型的代码和遗留的 `any` 代码。
- `any` 在类型论上是一个**动态类型**（dynamic type），它既是所有类型的子类型，又是所有类型的超类型，形成了一个"信任边界" [^siek-taha-gt]。

在 2026 年的工程实践中，推荐通过 `strict: true` 和 `noImplicitAny: true` 逐步收敛动态边界，最终目标是消除非必要的 `any`。

> 渐进类型学术前沿的最新进展，请参阅 [《JavaScript / TypeScript 学术前沿瞭望》](JS_TS_学术前沿瞭望.md)。

### 3.3 结构性子类型（Structural Subtyping）

TypeScript 采用**结构性子类型**，而非 Java/C# 的**名义子类型**（Nominal Subtyping）。

形式化地说，对于对象类型 `A` 和 `B`：

```
A <: B  ⟺  ∀p ∈ properties(B). ∃p' ∈ properties(A).
           p.name = p'.name  ∧  p'.type <: p.type
```

这意味着类型的兼容性由形状（shape）决定，而非由声明位置或名称决定。

**工程影响**：

- 优点：极高的可组合性。不同库中的同构类型可以无缝互操作。
- 缺点：意外兼容性。一个 `UserDTO` 和一个 `AdminDTO` 如果字段完全重叠，可能在类型系统中被错误地互相赋值。
- 防御手段：使用 `brand` 类型（`type UserId = string & { __brand: 'UserId' }`）或 `unique symbol` 模拟名义类型 [^ts-advanced-types]。

### 3.4 变型规则（Variance）

变型描述了复合类型如何随其组件类型的子类型关系变化而变化。

| 变型 | 方向 | 位置特征 | TypeScript 示例 |
|------|------|----------|-----------------|
| **协变** (Covariant) | `A <: B ⟹ F<A> <: F<B>` | 输出位置（返回值） | `T[]`, `Promise<T>` |
| **逆变** (Contravariant) | `A <: B ⟹ F<B> <: F<A>` | 输入位置（参数） | `(x: T) => void` |
| **不变** (Invariant) | 无推导关系 | 输入输出兼有 | `MutableArray<T>` |
| **双变** (Bivariant) | 同时支持协变和逆变 | 历史兼容设计 | 方法参数（`strictFunctionTypes: false` 时）|

TypeScript 默认对函数参数是**逆变的**，但如果开启 `strictFunctionTypes`（`strict` 模式的子集），对象的方法参数会被检查为**双变的**（bivariant），这是为了兼容常见的 OO 模式（如 `Array.push` 的继承场景）。在 `strictFunctionTypes: true` 下，方法参数也会被严格检查为逆变 [^ts-handbook-variance]。

**2026 最佳实践**：始终开启 `strictFunctionTypes: true`。如果确实需要双变行为，应显式使用函数属性而非方法声明。

> 约束求解推断与类型特性的工程细节，请参阅 [《JavaScript/TypeScript 语言核心特性全览》](01_language_core.md) 第 10 章。

---

## 4. 执行模型深度洞察

### 4.1 三层边界：V8 / 宿主（Host）/ Node.js

JavaScript 代码的执行环境可以清晰地划分为三个层次：

1. **ECMAScript 引擎层（如 V8）**：负责解析、编译、执行 JS 字节码，管理堆内存、GC、调用栈。
2. **宿主环境层（如浏览器、Node.js）**：提供事件循环、I/O、网络、文件系统等**外部 API**。ECMAScript 规范本身不定义 `setTimeout`、`fetch` 或 `fs.readFile`，这些由宿主通过**宿主对象（Host Objects）**注入。
3. **运行时框架层（如 Node.js 的 libuv、浏览器的 Blink）**：负责将宿主的异步操作与引擎的调用栈桥接。

这种分层意味着：

- **Event Loop 不是 ECMAScript 规范的一部分**。ES 规范只定义了 Job Queue（微任务）和 Agent 的抽象模型 [^ecma262-jobs]。具体的宏任务调度（macrotask scheduling）完全由宿主决定。
- **Node.js 的 Event Loop 与浏览器的 Event Loop 不同**。Node.js 使用 libuv，有 6 个阶段（timers → pending callbacks → idle/prepare → poll → check → close callbacks），而浏览器通常只使用简单的 task queue + microtask checkpoint 模型 [^nodejs-event-loop]。

### 4.2 Event Loop 的精确模型

虽然 Event Loop 由宿主实现，但我们可以给出一个被广泛接受的精确操作语义（基于 WHATWG HTML 标准和 Node.js libuv 的共识）：

```
循环:
  1. 从任务队列（Task Queue）中取出一个最老的任务并执行。
  2. 执行完毕后，检查微任务队列（Microtask Queue）：
     重复：取出并执行所有微任务，直到队列为空。
     （注意：微任务的执行可能产生新的微任务，必须全部清空）
  3. 执行渲染步骤（浏览器中）：处理 Resize、Scroll、Animation Frame 等。
  4. 如果任务队列为空且没有待处理的异步事件，循环结束。
  5. 否则回到步骤 1。
```

**关键精确论断**：

- **一个宏任务执行完毕后，必须清空所有微任务，才会进入下一个宏任务或渲染**。这是保证 `Promise.then` 在 `setTimeout` 之前执行的根本原因 [^whatwg-event-loop]。
- **`process.nextTick`（Node.js）优先级高于微任务**。Node.js 在每次 C++ 到 JS 的边界 transition 时都会清空 `nextTickQueue`，然后再清空 `microtaskQueue`（Promise）[^nodejs-nexttick]。

### 4.3 Top-level await 语义

Top-level await（TLA）是 ES2022 引入的特性，它对模块求值语义有深远影响：

- **模块变成了异步的**：如果一个模块包含 TLA，它的 `Evaluate()` 方法会返回一个 Promise。所有依赖该模块的父模块也必须异步等待其完成 [^ecma262-tla]。
- **禁止循环 TLA 依赖**：如果模块 A TLA-imports B，而 B（直接或间接）TLA-imports A，引擎会在链接阶段抛出 `SyntaxError`。
- **Node.js ESM 中的影响**：如果一个 ESM 文件包含 TLA，Node.js 将无法通过 `require()` 同步加载它（因为 `require()` 是同步的）[^nodejs-require-module]。

> Event Loop 与并发语义的完整规范分析，请参阅 [《JavaScript 执行模型与并发语义深度解析》](04_concurrency.md)。

---

## 5. 运行时与性能洞察

### 5.1 Hidden Classes 与 Inline Caches（IC）

V8 等现代引擎使用 **Hidden Classes（或称 Maps / Shapes）** 来优化动态属性访问。

- 每个对象在创建时关联一个 Hidden Class。当对象按相同的顺序添加相同的属性时，它们会共享同一个 Hidden Class。
- 属性访问（如 `obj.x`）不是哈希表查找，而是通过 Hidden Class 的偏移量（offset）直接访问内存。这个偏移量被缓存在 **Inline Cache（IC）** 中 [^v8-hidden-classes]。

**性能反模式**：

- 在循环中动态添加不同名称的属性（导致 shape transition 爆炸）。
- 混合使用 `null` 原型对象和普通对象（无法共享 Hidden Class）。
- 在数组中混用不同的元素类型（Smi、Double、HeapObject），导致引擎降级为**字典模式（Dictionary Mode）**。

### 5.2 垃圾回收（GC）：V8 的 Generational + Concurrent 策略

V8 的 GC 基于**分代假说**：大多数对象很快死亡。

- **Minor GC（Scavenger）**：针对新生代（New Space），使用并行复制算法（parallel semi-space copying），STW（Stop-The-World）时间极短 [^v8-gc-blog]。
- **Major GC（Mark-Compact）**：针对老生代（Old Space）。现代 V8 已实现 **并发标记（Concurrent Marking）** 和 **并发整理（Concurrent Compaction）**，显著降低了主线程的停顿时间。
- **Orinoco 项目**：V8 的 GC 架构代号，目标是将主线程的 GC 工作尽可能地卸载到辅助线程上。

**Node.js 开发者的实际建议**：

- 避免在热路径上频繁创建临时大对象（会加速对象晋升到老生代，触发昂贵的 Major GC）。
- 使用 Worker Threads 处理 CPU 密集型任务，防止主线程 GC 停顿影响 Event Loop 的响应性。

### 5.3 现代模块解析（Module Resolution）

模块解析是现代 JS 工具链的核心瓶颈之一。

- **TypeScript 的模块解析策略**：`classic`、`node`、`node16`/`nodenext`、`bundler`。`nodenext` 是唯一正确支持 ESM 条件导出（`exports`）和 `.mts`/`.cts` 扩展名的策略 [^ts-handbook-modules]。
- **条件导出（Conditional Exports）**：`package.json` 的 `exports` 字段允许包作者为 `require` 和 `import` 提供不同的入口点。`"type": "module"` 决定了 `.js` 文件的默认解析模式 [^nodejs-packages]。
- **Extensionless imports 的问题**：在原生 ESM 中，`import './foo'` 不会自动补全 `.js`。Node.js 和 TypeScript 的 `nodenext` 都要求显式扩展名（或 `exports` 映射），这对习惯了 CommonJS 的开发者是一个重大心智模型转换。

> V8 编译器、GC 与模块解析的深入原理，请参阅 [《JS/TS 现代运行时深度分析》](JS_TS_现代运行时深度分析.md)。

---

## 6. 2026 年推荐配置

### 6.1 2026 推荐技术栈

| 领域 | 推荐选择 | 理由 |
|------|----------|------|
| **运行环境** | Node.js 24+ (LTS) | `--strip-types` 默认启用，`require(esm)` 无标志互操作 |
| **包管理器** | pnpm 10+ | 磁盘效率、内容可寻址存储、严格依赖隔离 |
| **编译/构建** | `tsc` (类型检查) + `esbuild` / `rolldown` / `vite` (转译/打包) | 分离类型检查与构建，为 TS 7.0 的纯类型检查器定位做准备 |
| **类型系统** | TypeScript 6.0+ | `strictInference`、`erasableSyntaxOnly` 确保语义清晰与可移植性 |
| **测试** | vitest | 原生 TS/ESM 支持，Vite 生态一致 |
| **代码规范** | ESLint 9 (Flat Config) + `@typescript-eslint` | 统一的配置格式，更强的 TS 规则 |
| **格式化** | Prettier 3+ | 一致，生态成熟 |
| **运行时类型校验** | `zod` 或 `valibot` | 编译时类型与运行时校验的桥接 |

### 6.2 推荐 `tsconfig.json`（TypeScript 6.0 / 2026）

以下配置是面向 Node.js 24+ 新项目的 **TypeScript 6.0 "黄金标准"**。它代表了 TypeScript 团队、V8 团队和 Node.js 团队在 2026 年的最佳实践共识，并为 TS 7.0（Go 重写版）做了前置兼容。

```json
{
  "compilerOptions": {
    "target": "ES2025",
    "lib": ["ES2025"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "strictInference": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

#### 2026 年配置升级要点

**从 TypeScript 5.8 升级到 6.0 的关键变化**：

| 配置项 | 5.8 推荐 | 6.0 推荐 | 变更原因 |
|--------|---------|---------|---------|
| `target` | `"ES2024"` | `"ES2025"` | ES2025 已定稿，Node.js 24+ 原生支持 |
| `lib` | `["ES2024"]` | `["ES2025"]` | 包含 `Promise.try`、`RegExp.escape` 等新 API |
| `strictInference` | 可选 | **强烈推荐启用** | 减少隐式 `unknown` 泄漏，TS 7.0 的前置准备 |
| `erasableSyntaxOnly` | 可选 | **强烈推荐启用** | Node.js 24 `--strip-types` 兼容性 |

**针对不同场景的变体配置**：

```json
// ===== 场景 A：前端应用（使用 Vite/Webpack）=====
{
  "compilerOptions": {
    "target": "ES2025",
    "lib": ["ES2025", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "strictInference": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noEmit": true
  }
}

// ===== 场景 B：Node.js 库（发布到 npm）=====
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "node16",
    "moduleResolution": "node16",
    "strict": true,
    "strictInference": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true
  }
}

// ===== 场景 C：纯类型检查（tsc 仅用于类型检查）=====
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "strictInference": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "erasableSyntaxOnly": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

#### 关键选项语义解释

- **`target: "ES2025"`** 与 **`lib: ["ES2025"]`**：将编译目标定为 ES2025 标准。配合 Node.js 24+（V8 13.x+），可以直接使用 `Promise.try`、Iterator Helpers、`Array.prototype.toSorted`、`Promise.withResolvers` 等特性，无需转译 [^ts-target]。
- **`strict: true`**：启用所有严格类型检查选项的总开关。它是 TypeScript 6.x 中确保类型安全性的基线 [^ts-strict]。
- **`strictInference: true`**：TypeScript 5.9+ 新增选项。要求编译器在推断结果过于宽泛或存在歧义时发出错误，强制开发者在关键边界显式注解类型，减少隐式的 `unknown` 或 `any` 泄漏 [^ts-5.9-release]。
- **`noImplicitAny: true`**：禁止编译器在无法推断类型时隐式回退到 `any`。这是 Gradual Typing 向完全静态类型收敛的第一步 [^ts-noimplicitany]。
- **`strictNullChecks: true`**：将 `null` 和 `undefined` 从所有类型的值域中分离出来。例如，`string` 不再包含 `null`，必须显式写成 `string \| null` [^ts-strictnullchecks]。
- **`strictFunctionTypes: true`**：强制函数参数逆变检查，关闭方法参数的双变兼容。这能捕获大量通过回调传递错误类型参数的 Bug [^ts-strictfunctiontypes]。
- **`noUncheckedIndexedAccess: true`**：对索引签名（如 `obj[key]` 或 `arr[i]`）的返回类型追加 `\| undefined`。这是防止数组越界和缺失键访问的最强防线 [^ts-nouncheckedindexedaccess]。
- **`exactOptionalPropertyTypes: true`**：区分 `"缺失的属性"` 和 `"显式设置为 undefined 的属性"`。例如，`{ x?: string }` 不接受 `{ x: undefined }` [^ts-exactoptionalpropertytypes]。
- **`module: "nodenext"`** 与 **`moduleResolution: "nodenext"`**：必须成对使用。这是唯一正确支持 Node.js 原生 ESM、条件导出、`.mts`/`.cts` 扩展名和 `package.json` `"type"` 字段的策略 [^ts-modulenodenext]。
- **`moduleResolution: "bundler"` vs `"nodenext"`**：
  - **应用代码（Frontend / Bundled Backend）**：推荐使用 `"bundler"`，它与 `"nodenext"` 几乎等价，但额外支持 `imports` 和 `exports` 中的 `types` 条件解析，且对 `?query` 和 `#fragment` 的导入更宽松，与 `vite` / `webpack` / `esbuild` 兼容更好 [^ts-module-bundler]。
  - **Node.js 原生库 / CLI 工具**：推荐 `"node16"` 或 `"nodenext"`，确保与 Node.js 原生模块解析行为 1:1 对齐。
- **`erasableSyntaxOnly: true`**：拒绝 `enum`、`namespace`、参数属性等不可被标准擦除器安全处理的语法。这确保了项目可以被 `esbuild`、`swc`、Babel 或 Node.js `--strip-types` 处理，也是 TS 7.0 的推荐前置配置 [^ts-5.8-erasable]。
- **`verbatimModuleSyntax: true`**：强制 `import type` / `export type` 语法。任何仅用于类型的导入必须显式标记为 `type`，确保转译器可以安全删除它们而不影响模块副作用 [^ts-verbatimmodulesyntax]。
- **`isolatedModules: true`**：要求每个文件必须能被独立编译，禁止跨文件的类型推断用于代码生成。这是与 `esbuild`、`swc`、Babel 以及 **TypeScript 7.0 预览版（Go 版）** 兼容的关键选项 [^ts-isolatedmodules]。
- **`noEmit: true`**：当 TS 仅作为类型检查器使用（由 `esbuild` 或 `vite` 负责输出 JS）时，设置 `noEmit: true` 避免生成不必要的 `.js` 和 `.d.ts` 文件 [^ts-noemit]。
- **`skipLibCheck: true`**：跳过 `node_modules` 中 `.d.ts` 文件的类型一致性检查。这能显著加快编译速度并避免第三方库之间的类型冲突，但代价是不检查声明文件的内部一致性 [^ts-skiplibcheck]。

### 6.3 为 TypeScript 7.0 做准备

TypeScript 7.0（Project Corsa，Go 原生重写版）预计于 2026 年发布。虽然微软承诺源码级向后兼容，但工程实践需要提前准备，以确保平滑迁移。

#### 核心准备策略

**1. 编写与原生编译器兼容的代码**

TS 7.0 的核心设计原则是"快速、独立的单文件编译"。以下配置现在是强制性的：

```json
{
  "compilerOptions": {
    "isolatedModules": true,      // 每个文件必须能独立编译
    "erasableSyntaxOnly": true,   // 拒绝需要代码生成的语法
    "verbatimModuleSyntax": true  // 显式区分类型导入
  }
}
```

**2. 避免已被标记为废弃的特性**

| 废弃特性 | 问题 | 替代方案 |
|---------|------|---------|
| `moduleResolution: "node"` | Node 10 之前的策略 | `"nodenext"` 或 `"bundler"` |
| `enum` 声明 | 需要代码生成（反向映射） | 对象字面量 + `as const` |
| `namespace` / `module` | 生成 IIFE 运行时对象 | ESM 模块（文件级命名空间）|
| 参数属性（parameter properties）| 生成构造函数内赋值 | 显式属性声明 + 赋值 |
| 尖括号断言 `<T>value` | JSX 冲突，无法安全擦除 | `as T` 断言 |
| `import = require()` | CommonJS 特定语法 | ESM `import` / `import()` |

**迁移示例**：

```typescript
// ❌ 避免：enum
enum Color { Red, Green, Blue }

// ✅ 推荐：const 对象 + as const
const Color = {
  Red: 'RED',
  Green: 'GREEN',
  Blue: 'BLUE'
} as const;
type Color = typeof Color[keyof typeof Color];

// ❌ 避免：namespace
namespace Utils {
  export function helper() {}
}

// ✅ 推荐：ESM 模块
// utils.ts
export function helper() {}

// ❌ 避免：参数属性
class Point {
  constructor(public x: number, public y: number) {}
}

// ✅ 推荐：显式声明
class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
```

**3. 工具链迁移策略**

如果你的工具链依赖 TypeScript 内部 API，需要提前迁移：

| 使用场景 | 当前做法 | 推荐迁移到 |
|---------|---------|-----------|
| AST 操作 | `require("typescript")` + `ts.createSourceFile` | `ts-morph`（高级抽象 API）|
| 虚拟文件系统 | 自定义实现 | `@typescript/vfs` |
| 类型检查集成 | 直接调用 `ts.createProgram` | LSP 客户端或 `typescript-language-server` |
| 代码生成 | 自定义 Transformer | `tsc` + 独立的代码生成工具 |

**4. 关注 LSP 生态**

TS 7.0 将全面采用 LSP：

```
当前架构：
  VS Code / Vim / Emacs ←→ TypeScript 语言服务 API（紧密耦合）

TS 7.0 架构：
  VS Code / Vim / Emacs ←→ LSP ←→ Go 实现的 TypeScript 语言服务器
```

- 确保编辑器/IDE 支持 LSP
- 自定义编辑器插件应迁移到 LSP 协议而非直接调用 tsc API

**5. 验证清单**

在升级到 TypeScript 7.0 前，确认以下检查项：

- [ ] `tsc --noEmit` 在 `isolatedModules: true` 下无错误
- [ ] `tsc --noEmit` 在 `erasableSyntaxOnly: true` 下无错误
- [ ] 没有使用 `enum`、`namespace`、参数属性
- [ ] `moduleResolution` 设置为 `"nodenext"` 或 `"bundler"`
- [ ] 所有纯类型导入使用 `import type` 或 `type` 修饰符
- [ ] 工具链不依赖 `typescript` 包的内部 API

---

## 7. 从"知识图谱"到"深度分析"的学习路径建议

`JSTS全景综述` 的读者通常有两类目标：

1. **研究者 / 语言设计者**：关注形式化语义、类型论、内存模型。
2. **高级开发者 / 架构师**：关注工程实践、性能调优、技术选型。

本节为两类读者提供从本系列其他文档（"知识图谱"）过渡到"深度分析"的阅读路径。

### 7.1 研究者路径（形式化视角）

| 阶段 | 推荐阅读 | 重点概念 |
|------|----------|----------|
| 1. 基础 | ECMA-262 规范第 5-10 章 | Environment Record, Completion Record, Abstract Closure |
| 2. 类型 | TypeScript 规范（Type Relationships 章节）| Structural Subtyping, Widening, F-Bounded Polymorphism |
| 3. 内存 | ECMA-262 第 28 章（Memory Model）| Happens-Before, Synchronizes-With, Data Race |
| 4. 编译 | V8 Blog (Maglev/Turboshaft) | Deoptimization, Hidden Class, IC, Turboshaft pipeline |

### 7.2 工程师路径（实践视角）

| 阶段 | 推荐阅读 | 重点概念 |
|------|----------|----------|
| 1. 基线 | 本文档第 6 节 + `tsconfig.json` | `strict`, `nodenext`, `erasableSyntaxOnly`, `strictInference` |
| 2. 性能 | V8 性能博客 + Node.js 诊断文档 | Hidden Classes, IC, GC heuristics, Clinic.js |
| 3. 并发 | 本文档第 4 节 + `worker_threads` 文档 | Event Loop phases, Atomics, TLA deadlock |
| 4. 模块 | Node.js Packages 文档 + TS Handbook | Conditional Exports, ESM/CJS interop, Resolution |

### 7.3 关键出口原则（Takeaways）

作为本文档的总结，以下是 2026 年 JS/TS 实践的七条核心原则：

1. **类型优先**：`strict: true`、`strictInference: true` 和 `noUncheckedIndexedAccess` 是新项目的默认基线。
2. **分离职责**：`tsc` 只做类型检查，构建交给 `esbuild`/`vite`。这是现代 TS 工作流的标准，也是 TS 7.0 的方向。
3. **拥抱 ESM**：Node.js 24 已经消除了 CJS 和 ESM 互操作的最大痛点。新项目应默认使用 ESM。
4. **理解擦除**：TypeScript 是编译时存在、运行时不存在的层。不要依赖 TS 类型做运行时逻辑。
5. **避免 Maglev Deopt**：保持对象形状稳定，避免动态增删属性、混用数组元素类型。
6. **慎用 Top-level await**：它会将模块变为异步，阻断同步 `require()`，并可能引入循环依赖错误。
7. **持续跟进规范**：ECMAScript 和 TypeScript 的演进速度在加快，2026 年的基线需要为 TS 7.0（Go 版）提前做准备。

---

## 参考来源

[^ecma262-types]: ECMA-262, 6.1 ECMAScript Language Types.
[^ecma262-env]: ECMA-262, 9.1 Environment Records.
[^ecma262-tdZ]: ECMA-262, 8.1.1.1.6 GetBindingValue.
[^ecma262-agents]: ECMA-262, 9.7 Agents and Agent Clusters.
[^ecma262-memory]: ECMA-262, 28 Memory Model.
[^ecma262-ordinary-object]: ECMA-262, 10.1 Ordinary Object Internal Methods and Internal Slots.
[^ecma262-classes]: ECMA-262, 15.7 Class Definitions.
[^ecma262-modules]: ECMA-262, 16 Modules.
[^ecma262-import]: ECMA-262, 13.3.10 Import Calls.
[^ecma262-jobs]: ECMA-262, 9.5 Jobs and Job Queues.
[^ecma262-atomics]: ECMA-262, 25.4 Atomics Object.
[^ecma262-tla]: ECMA-262, 16.2.1.5 AsyncModuleExecutionFulfilled.
[^ecma262-promisetry]: ECMA-262, 27.2.4.8 Promise.try.
[^ts-spec-overview]: TypeScript Language Specification, 1.1 About this Document.
[^ts-spec-inference]: TypeScript Language Specification, 5.2 Type Inference.
[^ts-faq-inference]: TypeScript FAQ, "Why doesn't TypeScript use Hindley-Milner?"
[^ts-handbook-inference]: TypeScript Handbook, More on Functions - Inferring Within Types.
[^ts-handbook-variance]: TypeScript Handbook, Generics - Variance Annotations.
[^ts-handbook-modules]: TypeScript Handbook, Modules - Module Resolution.
[^ts-strict]: TypeScript Documentation, `strict` compiler option.
[^ts-noimplicitany]: TypeScript Documentation, `noImplicitAny` compiler option.
[^ts-strictnullchecks]: TypeScript Documentation, `strictNullChecks` compiler option.
[^ts-strictfunctiontypes]: TypeScript Documentation, `strictFunctionTypes` compiler option.
[^ts-nouncheckedindexedaccess]: TypeScript Documentation, `noUncheckedIndexedAccess` compiler option.
[^ts-exactoptionalpropertytypes]: TypeScript Documentation, `exactOptionalPropertyTypes` compiler option.
[^ts-modulenodenext]: TypeScript Documentation, `module` compiler option - nodenext.
[^ts-module-bundler]: TypeScript Documentation, `moduleResolution` compiler option - bundler.
[^ts-target]: TypeScript Documentation, `target` compiler option.
[^ts-5.8-erasable]: TypeScript 5.8 Release Notes, `--erasableSyntaxOnly`.
[^ts-5.9-release]: TypeScript 5.9 Release Notes, April 2025.
[^ts-6.0-release]: TypeScript 6.0 Release Notes.
[^ts-verbatimmodulesyntax]: TypeScript Documentation, `verbatimModuleSyntax` compiler option.
[^ts-isolatedmodules]: TypeScript Documentation, `isolatedModules` compiler option.
[^ts-noemit]: TypeScript Documentation, `noEmit` compiler option.
[^ts-skiplibcheck]: TypeScript Documentation, `skipLibCheck` compiler option.
[^ts-advanced-types]: TypeScript Handbook, Advanced Types - Intersection Types & Branded Types.
[^v8-hidden-classes]: V8 Blog, "Fast properties" (2017).
[^v8-gc-blog]: V8 Blog, "Trash talk" (2019) and "Orinoco" series.
[^v8-maglev-blog]: V8 Blog, "Maglev: V8's Fastest Optimizing Compiler" (2023-2024).
[^whatwg-event-loop]: WHATWG HTML Standard, 8.1.6.3 Processing model.
[^nodejs-event-loop]: Node.js Documentation, "The Node.js Event Loop".
[^nodejs-nexttick]: Node.js Documentation, "process.nextTick(callback[, ...args])".
[^nodejs-24-release]: Node.js v24.0.0 Release Notes.
[^nodejs-require-module]: Node.js Documentation, "Modules: ECMAScript modules - Interoperability with CommonJS".
[^nodejs-packages]: Node.js Documentation, "Packages".
[^tc39-proposal-groupby]: TC39 Proposal, `Array.prototype.groupBy`.
[^tc39-proposal-promise-withResolvers]: TC39 Proposal, `Promise.withResolvers`.
[^tc39-proposal-iterator-helpers]: TC39 Proposal, Iterator Helpers.
[^tc39-proposal-temporal]: TC39 Proposal, Temporal.
[^tc39-proposal-defer-import-eval]: TC39 Proposal, Deferred Import Evaluation.
[^microsoft-blog-ts-native-port]: Microsoft Blog, "TypeScript Native Port" (2025).
