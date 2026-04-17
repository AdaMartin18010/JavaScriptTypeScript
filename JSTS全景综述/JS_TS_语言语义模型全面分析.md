# JavaScript / TypeScript 语言语义模型全面分析

> 本文档基于 ECMA-262 2025、TypeScript 5.8–6.0 规范、HTML Living Standard、Node.js 文档及 PL 学术前沿，建立 JS/TS 的精确概念语义模型。面向研究者与高级开发者，强调规范引用与学术概念的准确性，摒弃不可执行的玩具代码与伪形式化表述。

**分析日期**: 2026-04-17
**TypeScript 版本**: 5.8–7.0
**ECMAScript 版本**: 2025 (ES16) / 2026 草案 [ECMA-262 2025]
**学术对齐**: Stanford CS 242 / MIT 6.1100·6.5110 / CMU 15-411·15-317 / Berkeley CS 164·263 / UW CSE 341

---

## 目录

- [JavaScript / TypeScript 语言语义模型全面分析](#javascript--typescript-语言语义模型全面分析)
  - [目录](#目录)
  - [1. 三层语义模型总览](#1-三层语义模型总览)
  - [2. 核心概念规范对照](#2-核心概念规范对照)
    - [2.1 语义层次与规范来源](#21-语义层次与规范来源)
    - [2.2 JS vs TS 语义边界矩阵](#22-js-vs-ts-语义边界矩阵)
    - [2.3 执行环境调度矩阵](#23-执行环境调度矩阵)
  - [3. 决策树：技术语义选型](#3-决策树技术语义选型)
    - [3.1 类型系统严格度决策](#31-类型系统严格度决策)
    - [3.2 异步并发模式决策](#32-异步并发模式决策)
    - [3.3 模块解析策略决策](#33-模块解析策略决策)
  - [4. 基于规范的精确语义模型](#4-基于规范的精确语义模型)
    - [4.1 JavaScript 运行时语义（ECMA-262 2025）](#41-javascript-运行时语义ecma-262-2025)
      - [4.1.1 执行上下文（Execution Context）](#411-执行上下文execution-context)
      - [4.1.2 完成记录（Completion Record）](#412-完成记录completion-record)
      - [4.1.3 环境记录（Environment Record）](#413-环境记录environment-record)
      - [4.1.4 对象内部方法（Internal Methods）](#414-对象内部方法internal-methods)
      - [4.1.5 Jobs 与 Job Queues（规范层面并发）](#415-jobs-与-job-queues规范层面并发)
    - [4.2 TypeScript 编译时 / 擦除语义](#42-typescript-编译时--擦除语义)
      - [4.2.1 编译时语义的本质](#421-编译时语义的本质)
      - [4.2.2 类型关系的三元判定](#422-类型关系的三元判定)
    - [4.3 宿主调度语义：浏览器与 Node.js](#43-宿主调度语义浏览器与-nodejs)
      - [4.3.1 引擎与宿主的边界](#431-引擎与宿主的边界)
      - [4.3.2 浏览器调度语义](#432-浏览器调度语义)
      - [4.3.3 Node.js 调度语义](#433-nodejs-调度语义)
  - [5. 语言层次与语义边界](#5-语言层次与语义边界)
    - [5.1 ECMAScript 规范内部层次](#51-ecmascript-规范内部层次)
    - [5.2 TypeScript 的编译时语义层次](#52-typescript-的编译时语义层次)
    - [5.3 引擎 - 宿主 - 运行时分界](#53-引擎---宿主---运行时分界)
  - [6. 类型系统深度语义](#6-类型系统深度语义)
    - [6.1 Gradual Typing 与一致性关系](#61-gradual-typing-与一致性关系)
    - [6.2 Structural Subtyping 的本质](#62-structural-subtyping-的本质)
    - [6.3 约束求解式类型推断](#63-约束求解式类型推断)
    - [6.4 类型擦除：保证与例外](#64-类型擦除保证与例外)
    - [6.5 方差与位置敏感性](#65-方差与位置敏感性)
    - [6.6 条件类型分发语义](#66-条件类型分发语义)
  - [7. 执行与调度模型语义](#7-执行与调度模型语义)
    - [7.1 ECMA-262 层面的 Jobs 与队列](#71-ecma-262-层面的-jobs-与队列)
    - [7.2 HTML 标准：浏览器 Event Loop](#72-html-标准浏览器-event-loop)
    - [7.3 Node.js：libuv Event Loop](#73-nodejslibuv-event-loop)
    - [7.4 Worker 的隔离语义](#74-worker-的隔离语义)
  - [8. 前沿特性语义分析](#8-前沿特性语义分析)
    - [8.1 `--erasableSyntaxOnly` 的语义意义](#81---erasablesyntaxonly-的语义意义)
    - [8.2 `--module nodenext` 与 ESM/CJS 互操作](#82---module-nodenext-与-esmcjs-互操作)
    - [8.3 `NoInfer<T>` 的约束语义](#83-noinfert-的约束语义)
    - [8.4 `using` 声明与显式资源管理](#84-using-声明与显式资源管理)
    - [8.5 `import defer` 语义模型](#85-import-defer-语义模型)
      - [语法与表面语义](#语法与表面语义)
      - [深层语义模型](#深层语义模型)
    - [8.6 TypeScript 7.0 / Go 重写对语义层的影响](#86-typescript-70--go-重写对语义层的影响)
      - [1. 语言语义不变性](#1-语言语义不变性)
      - [2. 编译器实现层面的变革](#2-编译器实现层面的变革)
      - [3. 对语义层的影响分析](#3-对语义层的影响分析)
      - [4. 对类型系统检查强度的长期影响](#4-对类型系统检查强度的长期影响)
      - [5. 对 `--erasableSyntaxOnly` 的长期影响](#5-对---erasablesyntaxonly-的长期影响)
      - [结论](#结论)
    - [8.7 ES2025 新特性语义](#87-es2025-新特性语义)
      - [Iterator Helpers](#iterator-helpers)
      - [Set Methods](#set-methods)
      - [Import Attributes (JSON Modules)](#import-attributes-json-modules)
      - [`Promise.try()`](#promisetry)
      - [`Float16Array`](#float16array)
    - [8.8 ES2026 前沿语义](#88-es2026-前沿语义)
      - [Temporal API](#temporal-api)
      - [Explicit Resource Management](#explicit-resource-management)
      - [`Error.isError`](#erroriserror)
      - [`Map.getOrInsert` / `getOrInsertComputed`](#mapgetorinsert--getorinsertcomputed)
    - [8.9 TypeScript 6.0 默认配置变革的语义影响](#89-typescript-60-默认配置变革的语义影响)
    - [8.10 Node.js 22/24 原生 type stripping 语义](#810-nodejs-2224-原生-type-stripping-语义)
  - [9. 综合论证与结论](#9-综合论证与结论)
    - [9.1 JS/TS 语义模型的核心特征](#91-jsts-语义模型的核心特征)
    - [9.2 学术概念与工程实践的对照](#92-学术概念与工程实践的对照)
    - [9.3 实践建议](#93-实践建议)
  - [10. 编译工程与工具链语义](#10-编译工程与工具链语义)
    - [10.1 Node.js 原生 TypeScript 执行语义](#101-nodejs-原生-typescript-执行语义)
      - [Amaro 的语义定位](#amaro-的语义定位)
      - [`--erasableSyntaxOnly` 的规范意义](#--erasablesyntaxonly-的规范意义)
      - [`require(esm)` 的互操作模型](#requireesm-的互操作模型)
    - [10.2 编译器与转译器的语义差异](#102-编译器与转译器的语义差异)
      - [类型擦除策略对比](#类型擦除策略对比)
      - [装饰器语义差异](#装饰器语义差异)
      - [模块降级语义](#模块降级语义)
    - [10.3 现代构建工具链的选型语义](#103-现代构建工具链的选型语义)
      - [开发服务器与通用前端：Vite](#开发服务器与通用前端vite)
      - [Next.js 生态：Turbopack](#nextjs-生态turbopack)
      - [Webpack 迁移提速：Rspack](#webpack-迁移提速rspack)
      - [下一代统一 Bundler：Rolldown](#下一代统一-bundlerrolldown)
      - [编译器性能天花板：tsgo](#编译器性能天花板tsgo)
    - [10.4 工程实践范式与 CI/CD 类型检查策略](#104-工程实践范式与-cicd-类型检查策略)
      - [分离转译与类型检查的语义分工](#分离转译与类型检查的语义分工)
      - [Monorepo 中的类型系统边界](#monorepo-中的类型系统边界)
      - [CI/CD 中的类型检查策略](#cicd-中的类型检查策略)
  - [11. 学术课程对齐框架](#11-学术课程对齐框架)
    - [11.1 渐进类型框架](#111-渐进类型框架)
    - [11.2 类型系统形式化谱系](#112-类型系统形式化谱系)
    - [11.3 编译器前端与类型擦除](#113-编译器前端与类型擦除)
    - [11.4 动态语义与运行时系统](#114-动态语义与运行时系统)
    - [11.5 形式化验证与程序推理](#115-形式化验证与程序推理)
  - [参考资源](#参考资源)

---

## 1. 三层语义模型总览

```mermaid
mindmap
  root((JS/TS 精确语义模型))
    L1[JavaScript 运行时语义<br/>ECMA-262 2025]
      执行上下文 Execution Context
      Realm 与全局环境
      环境记录 Environment Record
      完成记录 Completion Record
      抽象操作 Abstract Operations
      内部方法 Internal Methods
      Jobs 与 Job Queues
    L2[TypeScript 编译时 / 擦除语义]
      Gradual Typing
      Structural Subtyping
      约束求解式类型推断
      Type Erasure 与例外
      条件类型与映射类型
      方差 Variance
    L3[宿主调度语义]
      HTML Event Loop
      libuv Event Loop Node.js
      渲染流水线 Rendering Pipeline
      Worker Threads / Web Workers
      引擎与宿主边界
```

**核心立场**：JS/TS 的完整语义不能被单一规范涵盖。必须区分：

1. **ECMA-262** 定义的引擎级运行时语义；
2. **TypeScript 编译器** 实现的静态分析语义（不保证运行时类型安全）；
3. **宿主环境**（浏览器/Node.js）提供的调度、I/O 与并发语义 [ECMA-262 §2]。

---

## 2. 核心概念规范对照

### 2.1 语义层次与规范来源

| 语义层次 | 权威规范 | 关键抽象 | 与代码的关联阶段 |
|---------|---------|---------|----------------|
| **JavaScript 运行时** | ECMA-262 2025 | Execution Context, Environment Record, Completion Record, Job | 运行时 |
| **TypeScript 静态分析** | TypeScript 5.8 Language Specification / Compiler API | Type, Type Relationship, Constraint, Erasure | 编译时 |
| **浏览器调度** | HTML Living Standard §8.1 | Event Loop, Task Queue, Microtask, Rendering | 运行时 |
| **Node.js 调度** | Node.js Documentation / libuv | Event Loop Phases, `nextTick`, `setImmediate` | 运行时 |

### 2.2 JS vs TS 语义边界矩阵

| 维度 | JavaScript (ECMA-262) | TypeScript (编译时) | 关键差异 |
|------|----------------------|---------------------|---------|
| **类型系统** | 动态类型，运行时标签检查 | 静态类型，结构化子类型 | TS 类型信息在擦除后不可见 [TS Handbook: Type Erasure] |
| **类型推断** | 无（运行时求值） | 基于约束求解（constraint-based），**非 Hindley-Milner** | HM 要求全称量词与无子类型；TS 支持子类型与重载 [TS Deep Dive: Inference] |
| **类型兼容性** | 运行时鸭子类型 | 编译时 Structural Subtyping | 不依赖声明名称，而依赖成员结构 [TS Spec §3.11] |
| **泛型** | 无（对象仅携带原型） | 参数多态，编译后完全擦除 | 除 `enum`、`namespace`、参数属性等例外 |
| **Gradual Typing** | `any` 即为无约束动态值 | `any` 与 `unknown` 构成渐进类型边界 | `any` 与所有类型满足一致性关系 `~` [Siek & Taha 2006] |
| **模块语义** | ESM/CJS 运行时加载与链接 | 编译时模块解析、路径映射、声明合并 | TS 不执行模块加载，仅做类型检查与转译 |

### 2.3 执行环境调度矩阵

| 执行环境 | 调度模型 | 并发原语 | 与 V8 引擎的关系 |
|---------|---------|---------|----------------|
| **浏览器主线程** | HTML Event Loop + 渲染流水线 | Web Workers, Service Workers | V8 嵌入 Blink，由宿主控制 Job 入队 [HTML Standard §8.1] |
| **Node.js 主线程** | libuv Event Loop (7 phases) | Worker Threads, `cluster` | V8 与 libuv 协同，`nextTick` 为 Node.js 特有扩展 [Node.js Docs: Event Loop] |
| **Web Worker** | 独立 HTML Event Loop | `MessageChannel`, `Atomics` | 独立 V8 Isolate，无 DOM [HTML Standard §11] |
| **Service Worker** | 独立 Event Loop + 生命周期管理 | `fetch` 拦截、缓存 API | 受浏览器生命周期管理，不保证常驻 |

---

## 3. 决策树：技术语义选型

### 3.1 类型系统严格度决策

```mermaid
flowchart TD
    A[目标: 最大可移植性与宿主无关性?] -->|是| B[启用 --erasableSyntaxOnly]
    A -->|否| C[允许运行时语义: enum/namespace/参数属性]
    B --> D[需要最大程度类型安全?]
    D -->|是| E[--strict true + noImplicitAny + strictNullChecks]
    D -->|否| F[--strict false, 保留 JSDoc 迁移路径]
    E --> G[使用 --module nodenext 发布库?]
    G -->|是| H[确保 package.json 配置 exports/types 字段]
    G -->|否| I[选择 ESM 或 CJS 单一模块格式]
```

### 3.2 异步并发模式决策

```mermaid
flowchart TD
    A[需要并行计算?] -->|是| B[Worker Threads / Web Workers + SharedArrayBuffer]
    A -->|否| C[需要等待多个异步结果?]
    C -->|是| D[容错?]
    D -->|全部必须成功| E[Promise.all]
    D -->|允许部分失败| F[Promise.allSettled]
    C -->|否| G[需要顺序执行异步流?]
    G -->|是| H[async/await]
    G -->|否| I[事件流/背压控制 -> Async Iterators / Node.js Streams]
```

### 3.3 模块解析策略决策

```mermaid
flowchart TD
    A[运行时为 Node.js 22+?] -->|是| B[--module nodenext + --moduleResolution nodenext]
    A -->|否| C[--module esnext / commonjs]
    B --> D[需要 CJS 消费者 require() ESM?]
    D -->|是| E[Node.js 22+ 支持 require(esm) 但有限制]
    D -->|否| F[纯 ESM 输出]
    C --> G[浏览器环境?]
    G -->|是| H[ESM + importmap]
    G -->|否| I[根据 Node.js 版本选择 CJS 或 ESM]
```

---

## 4. 基于规范的精确语义模型

### 4.1 JavaScript 运行时语义（ECMA-262 2025）

#### 4.1.1 执行上下文（Execution Context）

ECMA-262 将执行上下文定义为运行时追踪代码执行的规范设备 [ECMA-262 §8.1]。一个执行上下文并非普通对象，而是一个包含以下字段的规范结构：

- **codeEvaluationState**：恢复该上下文执行所需的Continuation。
- **Function**：若该上下文正在执行函数代码，则为该函数对象；否则为 **null**。
- **Realm**：关联的 Realm Record，决定可用的内置对象与全局环境。
- **ScriptOrModule**：关联的 Script Record 或 Module Record。
- **LexicalEnvironment**：用于解析标识符词法绑定的环境记录。
- **VariableEnvironment**：用于解析 `var` 绑定的环境记录。
- **PrivateEnvironment**：用于解析私有标识符的私有环境记录。

> **规范说明**：执行上下文栈（Execution Context Stack）是严格的后进先出结构，但 Generator 和 async 函数通过挂起（suspend）与恢复（resume）机制，允许其执行上下文在栈中保留并在未来恢复 [ECMA-262 §8.1.3]。

#### 4.1.2 完成记录（Completion Record）

ECMA-262 的所有运行时求值都产生 Completion Record，这是一个规范类型 [ECMA-262 §6.2.4]：

```
Completion Record 结构:
  [[Type]]  ∈ { normal, break, continue, return, throw }
  [[Value]] ∈ any ECMAScript language value | empty
  [[Target]]∈ string | empty
```

控制流语义可通过以下说明性规则描述：

- 若表达式 `e` 求值为 `ReturnCompletion(v)`，则包含 `e` 的函数体立即以 `v` 返回。
- 若 `throw e` 求值为 `ThrowCompletion(err)`，则引擎沿执行上下文栈搜索最近的 `catch` 或异常处理器（通过 **RunJobs** 机制将其转化为 rejection）。

#### 4.1.3 环境记录（Environment Record）

环境记录是规范层面的抽象，用于建模作用域链 [ECMA-262 §9.1]：

| 环境记录类型 | 语义功能 |
|-------------|---------|
| **Declarative Environment Record** | 绑定 `let`、`const`、`class`、`function` 等声明 |
| **Object Environment Record** | 将 `with` 语句的对象属性映射为绑定（严格模式禁用） |
| **Function Environment Record** | 额外包含 `this` 绑定、 `new.target`、参数对象 |
| **Global Environment Record** | 复合记录，包含对象环境记录（全局对象）+ 声明性环境记录 |
| **Module Environment Record** | 包含显式导入/导出绑定，支持不可变间接绑定 |

**闭包语义**：当一个函数对象被创建时，其 `[[Environment]]` 内部槽被设置为当前执行上下文的词法环境。这意味着闭包捕获的是环境记录的引用，而非静态作用域的文本拷贝 [ECMA-262 §10.2.11]。

#### 4.1.4 对象内部方法（Internal Methods）

对象在 ECMA-262 中的行为由一组必需内部方法定义 [ECMA-262 §6.1.7.2]：

- `[[GetPrototypeOf]]()` → Object | Null
- `[[SetPrototypeOf]](V)` → Boolean
- `[[IsExtensible]]()` → Boolean
- `[[PreventExtensions]]()` → Boolean
- `[[GetOwnProperty]](P)` → Property Descriptor | Undefined
- `[[DefineOwnProperty]](P, Desc)` → Boolean
- `[[HasProperty]](P)` → Boolean
- `[[Get]](P, Receiver)` → ECMAScript value
- `[[Set]](P, V, Receiver)` → Boolean
- `[[Delete]](P)` → Boolean
- `[[OwnPropertyKeys]]()` → List of property keys

普通对象（ordinary object）使用规范定义的默认算法实现这些方法；异质对象（exotic object）如 `Proxy` 可覆盖这些行为。这构成了 JavaScript 对象模型的真正“形式化接口”。

#### 4.1.5 Jobs 与 Job Queues（规范层面并发）

ECMA-262 不定义完整的 Event Loop，而是定义了 **Job** 和 **Job Queue** 抽象 [ECMA-262 §9.5]。

- **Job**：一个抽象闭包，无参数，当调用时执行某些规范步骤。Job 的创建与执行之间存在 happen-before 关系。
- **Job Queue**：FIFO 队列，存放待执行的 Job。

规范要求存在至少两个队列 [ECMA-262 §9.5]：

1. **ScriptJobs**：用于初始脚本求值。
2. **PromiseJobs**：用于 Promise 的 resolution/rejection 处理。

**宿主的责任**：具体的 Event Loop 实现（如浏览器或 Node.js）负责从队列中取出 Job 并推入引擎执行。微任务（microtask）在规范中通常对应 PromiseJobs 队列的执行，但宿主可能扩展更多队列（如 Node.js 的 `nextTickQueue`）。

### 4.2 TypeScript 编译时 / 擦除语义

#### 4.2.1 编译时语义的本质

TypeScript 是一种 **编译时静态类型层**，它在 ECMA-262 运行时语义之上添加了类型判断与类型转换规则 [TS Handbook: TypeScript's Type System]。TypeScript 不引入新的运行时值语义（除擦除例外），而是：

1. **类型检查**：在编译时验证程序是否满足类型规则。
2. **擦除（Erasure）**：将类型注解、接口、泛型参数、类型别名等从源代码中移除，生成纯 ECMAScript 代码。
3. **代码生成**：在某些情况下（如 `enum`、`namespace`、装饰器元数据）生成额外的运行时结构。

#### 4.2.2 类型关系的三元判定

TypeScript 的类型检查核心可概括为三个判断：

1. **可赋值性（Assignable）**：`S` 可赋值给 `T`，记作 `S ≲ T`。这是 TypeScript 最常用的类型关系，比严格子类型稍宽（允许某些双变场景）。
2. **子类型（Subtype）**：`S` 是 `T` 的子类型，基于 Structural Subtyping。
3. **一致性（Consistent）**：在 Gradual Typing 框架下，`any` 与所有类型相互一致（见 §6.1）。

TypeScript 编译器在检查函数调用、变量赋值、返回值时，主要使用 **可赋值性** 判断。

### 4.3 宿主调度语义：浏览器与 Node.js

#### 4.3.1 引擎与宿主的边界

**V8 引擎** 负责：

- 解析 ECMAScript 源代码；
- 执行抽象操作与内部方法；
- 管理堆内存与垃圾回收；
- 执行 Job Queue 中的 Job（当被宿主调用时）。

**宿主环境** 负责：

- 提供全局对象（`window`、`global`、`process`）；
- 管理 I/O、定时器、网络请求；
- 实现 Event Loop，决定何时将任务推入 V8；
- 管理多线程 Worker 的生命周期。

这一边界至关重要：ECMA-262 规范中的 `HostEnqueuePromiseJob` 是一个宿主钩子（host hook），浏览器和 Node.js 以不同方式实现它，导致微任务优先级与执行时机的差异 [ECMA-262 §9.5]。

#### 4.3.2 浏览器调度语义

浏览器遵循 **HTML Living Standard** §8.1 的 Event Loop 定义：

- 一个浏览上下文（browsing context）通常有一个 Event Loop。
- Event Loop 维护多个 **task queues**（如 DOM 事件队列、网络事件队列、定时器队列）。
- 每个循环迭代执行：
  1. 从 task queue 中取出一个 **oldest task** 执行。
  2. 执行 **microtask checkpoint**：清空 microtask queue（包括 Promise callbacks 和 `queueMicrotask` 注册的回调）。
  3. 若必要，执行 **update the rendering**（样式计算、布局、绘制、`requestAnimationFrame`）。

> **规范要点**：在浏览器中，一个 task 执行完毕后必须清空所有 microtasks，然后才能执行渲染或下一个 task [HTML Standard §8.1.6.3]。

#### 4.3.3 Node.js 调度语义

Node.js 使用 **libuv** 实现 Event Loop，包含 7 个阶段（phase） [Node.js Docs: The Node.js Event Loop]：

1. **timers**：执行 `setTimeout` / `setInterval` 回调。
2. **pending callbacks**：执行系统操作（如 TCP 错误）的延迟回调。
3. **idle, prepare**：Node.js 内部使用。
4. **poll**：检索新的 I/O 事件；执行 I/O 回调；适当阻塞等待。
5. **check**：执行 `setImmediate` 回调。
6. **close callbacks**：执行 `close` 事件回调。

**Node.js 特有语义**：

- `process.nextTick` 回调在 **当前操作完成后、Event Loop 进入下一阶段前** 立即执行。从规范视角看，`nextTick` 队列的优先级高于 Promise microtask，但这并非 ECMA-262 规范的一部分，而是 Node.js 宿主扩展 [Node.js Docs: process.nextTick]。

---

## 5. 语言层次与语义边界

### 5.1 ECMAScript 规范内部层次

```mermaid
graph TB
    subgraph "ECMA-262 2025 规范层次"
    L1[词法语法<br/>Lexical Grammar] --> L2[语法语法<br/>Syntactic Grammar]
    L2 --> L3[静态语义<br/>Static Semantics]
    L3 --> L4[运行时语义<br/>Runtime Semantics]

    L4 --> R1[执行上下文栈]
    L4 --> R2[Realm & 环境记录]
    L4 --> R3[对象内部方法]
    L4 --> R4[Completion Records]
    L4 --> R5[Jobs & Job Queues]

    R3 --> M1[[Get]]
    R3 --> M2[[Set]]
    R3 --> M3[[Call]]
    R3 --> M4[[Construct]]
    end
```

### 5.2 TypeScript 的编译时语义层次

```mermaid
graph TB
    subgraph "TypeScript 编译时语义层次"
    T1[Top Types<br/>unknown / any] --> T2[Object Types]
    T1 --> T3[Primitive Types]

    T2 --> O1[具体对象类型]
    T2 --> O2[接口 Interface]
    T2 --> O3[类类型 Class Type]
    T2 --> O4[映射类型 Mapped Type]

    T3 --> P1[string]
    T3 --> P2[number]
    T3 --> P3[boolean]
    T3 --> P4[bigint]
    T3 --> P5[symbol]
    T3 --> P6[null / undefined]

    T2 --> G1[泛型参数]
    G1 --> G2[约束化实例化]

    B1[Bottom Type<br/>never] --> T3
    B1 --> T2
    end
```

### 5.3 引擎 - 宿主 - 运行时分界

| 责任域 | 规范/实现 | 控制范围 |
|-------|----------|---------|
| **引擎（V8/SpiderMonkey/JavaScriptCore）** | ECMA-262 | 执行抽象操作、内存管理、JIT 编译、Job 执行 |
| **宿主（浏览器/Node.js）** | HTML / libuv / 自定义 | Event Loop、I/O、定时器、Worker 生命周期、全局对象 |
| **TypeScript 编译器（tsc）** | TypeScript 语言规范 | 静态类型检查、擦除、模块解析、声明合并 |

**关键边界示例**：`Promise.then` 的回调注册由引擎的 Promise 内部方法处理，但回调何时被推入执行上下文栈由宿主的 `HostEnqueuePromiseJob` 实现决定 [ECMA-262 §26.2.5.3]。

---

## 6. 类型系统深度语义

### 6.1 Gradual Typing 与一致性关系

TypeScript 的类型系统属于 **Gradual Typing** 家族，其标志性特征是 `any` 类型 [Siek & Taha 2006]。Gradual Typing 的核心语义设备是 **一致性关系（consistency relation）**，记作 `~`：

**一致性规则（说明性）**：

- `T ~ T`  （自反性）
- `any ~ T` （`any` 与任何类型一致）
- `T ~ any` （对称性）
- 若 `S1 ~ T1` 且 `S2 ~ T2`，则 `{ x: S1, y: S2 } ~ { x: T1, y: T2 }`（结构一致性）

与标准子类型不同的是：一致性允许 `any` 出现在任何位置，而不破坏类型的整体一致性。这意味着 TypeScript 的 `any` 不仅是“关闭类型检查”的逃逸口，它在学术上被理解为 **动态类型与静态类型之间的渐近边界**。

**精度序（Precision Ordering）**：

Gradual Typing 还定义了精度序 `⊑`，表示一个类型比另一个类型“更精确”（包含更少的 `any`）：

- `any ⊑ T`（`any` 是最不精确的类型）
- 若 `S1 ⊑ T1` 且 `S2 ⊑ T2`，则 `{ x: S1 } ⊑ { x: T1 }`
- 若 `S ⊑ T`，则 `S` 是 `T` 的更精确近似

TypeScript 的 `unknown` 可被视为 `any` 的安全对偶：它是最顶端的静态类型，必须通过类型断言或窄化（narrowing）才能使用，因此不破坏静态类型保证。

### 6.2 Structural Subtyping 的本质

TypeScript 使用 **Structural Subtyping**（结构子类型），这与 Java、C# 的 **Nominal Subtyping**（名义子类型）形成根本对比 [Pierce 2002, TS Spec §3.11]。

**核心差异**：

| 特性 | Nominal Subtyping | Structural Subtyping |
|------|------------------|---------------------|
| 子类型判定依据 | 显式声明的继承/实现关系（`extends`/`implements`） | 类型的成员结构兼容性 |
| 跨模块/声明兼容性 | 要求同一声明来源（名称+位置） | 仅要求结构形状匹配 |
| 密封性（Sealedness） | 编译器可假设无额外子类型 | 任何时候都可能出现结构匹配的新类型 |
| 语义表达 | 类型即契约+身份 | 类型即契约 |

**TypeScript 的结构子类型规则（说明性）**：

对于对象类型，若 `S` 是 `T` 的子类型（`S <: T`），则：

- **宽度子类型（Width Subtyping）**：`S` 必须至少包含 `T` 的所有必需属性（`S` 可以有更多属性）。
- **深度子类型（Depth Subtyping）**：对于 `S` 和 `T` 的同名属性，该属性在 `S` 中的类型必须是其在 `T` 中类型的子类型。
- **函数子类型**：参数类型逆变（contravariant），返回类型协变（covariant）。在 `--strictFunctionTypes` 启用时，TypeScript 对函数参数使用严格的逆变检查。

**关键工程影响**：

- 在 TypeScript 中，两个从未互相引用的接口如果结构相同，即被视为兼容。这支持了鸭子类型的编译时表达，但也意味着**不存在真正的密封类型**（即无法阻止外部构造出结构匹配的类型）。
- `private` 和 `protected` 修饰符仅在类类型比较时引入名义化成分：当比较两个类类型时，如果一方包含 `private` 或 `protected` 成员，则另一方必须是同一类（或继承链上的类）的实例才被视为了兼容 [TS Handbook: Classes]。

### 6.3 约束求解式类型推断

**TypeScript 不使用 Hindley-Milner（HM）算法**。HM 算法适用于无子类型系统、无重载、无泛型约束的语言（如 ML、Haskell）。TypeScript 的类型推断是 **基于约束求解（constraint-based inference）** 的 [TS Compiler Internals, TS Deep Dive]。

**推断过程可概念性地描述为**：

1. **收集阶段**：编译器遍历 AST，为泛型参数和待推断类型生成一组 **约束（constraints）**。例如，对于 `function f<T>(x: T) { return x }`，调用 `f(42)` 会产生约束 `T = number`。
2. **求解阶段**：编译器求解约束系统，为每个类型参数选择 **最佳公共类型（best common type）** 或根据上下文类型（contextual type）进行推断。
3. **上下文敏感性**：TypeScript 大量依赖 **上下文类型推断（contextual typing）**。例如，在 `const arr: number[] = [1, 2, 3]` 中，数组字面量的元素类型从左侧的 `number[]` 获得上下文约束。

**与 HM 的关键差异**：

| 特性 | Hindley-Milner | TypeScript 约束推断 |
|------|---------------|---------------------|
| 子类型支持 | 不支持 | 核心机制 |
| 泛型约束 | 无（通过类型类间接实现） | 直接支持 `T extends U` |
| 重载解析 | 不支持 | 支持函数重载 |
| 错误定位 | 全局统一类型（最一般化类型） | 局部约束失败报告 |
| 全称量词 | 隐式 `∀`（let-polymorphism） | 显式泛型参数声明 |

**协变返回值与逆变参数推断**：

在函数类型推断中，TypeScript 遵循标准 PL 原则：

- 返回类型位置：协变（covariant）
- 参数类型位置：逆变（contravariant，在 `--strictFunctionTypes` 下）
- 泛型参数本身：默认双变（bivariant），但在严格模式下对读写位置分别检查 [TS Handbook: Type Compatibility]。

### 6.4 类型擦除：保证与例外

TypeScript 的核心设计承诺是 **Type Erasure**：类型注解、接口、类型别名、泛型参数在编译后完全消失，不生成任何运行时结构 [TS Handbook: Type Erasure]。

**完全擦除的构造**：

- 类型注解（`: Type`）
- 接口声明（`interface`）
- 类型别名（`type`）
- 泛型参数与约束
- `as` 类型断言

**有运行时语义的例外（擦除不彻底）**：

1. **`enum` 声明**：编译为对象和反向映射（reverse mapping）。`enum Color { Red }` 生成运行时对象 `Color` [TS Handbook: Enums]。
2. **`namespace` / `module` 声明**：编译为立即执行函数表达式（IIFE）以创建运行时命名空间对象 [TS Handbook: Namespaces]。
3. **参数属性（Parameter Properties）**：`constructor(public x: number)` 在编译后成为显式的属性赋值 `this.x = x`，这改变了构造函数的运行时行为 [TS Handbook: Classes]。
4. **装饰器元数据（Experimental Decorators）**：当启用 `emitDecoratorMetadata` 时，编译器注入 `Reflect.metadata` 调用，产生运行时类型信息 [TS Handbook: Decorators]。
5. **`import()` 类型与模块加载**：虽然类型 `import("mod")` 被擦除，但编译为动态 `import()` 表达式时保留模块加载的副作用 [TS Spec §2.4.1]。

**`--erasableSyntaxOnly` 的语义意义**：

TypeScript 5.8 引入 `--erasableSyntaxOnly`，该标志强制要求所有 TypeScript 专有语法必须能被完全擦除为纯 ECMAScript，不生成任何额外的运行时结构 [TS 5.8 Release Notes]。启用后，以下代码将报错：

- `enum` 声明
- `namespace` / `module` 声明
- 参数属性（parameter properties）
- `import alias = require()` 语法

该选项的目标是确保 TypeScript 代码可以无需转译器（transpiler）直接由支持 TypeScript 语法的运行时（如 Deno、Bun、Node.js 22+（Node.js 24 默认启用）的 `--experimental-strip-types`）执行。

### 6.5 方差与位置敏感性

TypeScript 的方差（variance）由类型参数在结构中的出现位置决定 [TS Handbook: Type Compatibility]：

| 位置 | 方差 | 说明 |
|------|------|------|
| 只读属性值 | 协变（Covariant） | `readonly x: T` |
| 函数参数 | 逆变（Contravariant，严格模式） | `(x: T) => void` |
| 可写属性值 | 不变（Invariant） | `x: T` 且同时可读可写 |
| 函数返回值 | 协变（Covariant） | `() => T` |
| 泛型参数（无修饰符） | 默认双变（Bivariant） | 可通过 `--strictFunctionTypes` 和 `--strictPropertyInitialization` 收紧 |

**说明性规则**：

若 `Cat <: Animal`，则：

- `() => Cat <: () => Animal` （返回类型协变）
- `(x: Animal) => void <: (x: Cat) => void` （参数类型逆变）
- `{ value: Cat }` **不是** `{ value: Animal }` 的子类型（若可写），因为可以写入 `Animal` 类型的值到期望 `Cat` 的容器中，导致类型不安全。

### 6.6 条件类型分发语义

条件类型 `T extends U ? X : Y` 在 TypeScript 中具有 **分发性（distributivity）** [TS Handbook: Conditional Types]：

**分发规则（说明性）**：

若 `T` 是裸类型参数（naked type parameter）且为联合类型 `A | B | C`，则：

```
(A | B | C) extends U ? X : Y  ≡  (A extends U ? X : Y) | (B extends U ? X : Y) | (C extends U ? X : Y)
```

**防止分发**：将类型参数包装为元组类型（tuple type）可阻止分发：

```
[T] extends [U] ? X : Y   // 不分发，整体判断
```

**never 的语义**：在条件类型分发中，`never` 作为空联合类型，分发后结果仍为 `never`。这是 `Exclude<T, U>` 和 `Extract<T, U>` 实现的基础：

```typescript
type Exclude<T, U> = T extends U ? never : T;
```

---

## 7. 执行与调度模型语义

### 7.1 ECMA-262 层面的 Jobs 与队列

ECMA-262 将异步操作的最小单位定义为 **Job** [ECMA-262 §9.5]。Promise 的 `then` 回调不直接执行，而是被包装为 Job 并推入 Job Queue。规范中的 `EnqueueJob(queueName, job, arguments)` 操作定义了这一过程。

**关键抽象**：

- `HostEnqueuePromiseJob(job, realm)`：宿主必须提供的钩子，用于将 Promise 相关的 Job 入队。
- 规范保证：如果 Job A 在 Job B 之前入队，则 A 必须在 B 之前执行（FIFO）。

> **注意**：ECMA-262 不定义 Job 与 UI 渲染、I/O 事件之间的相对顺序，这完全由宿主决定。

### 7.2 HTML 标准：浏览器 Event Loop

浏览器的 Event Loop 由 HTML Living Standard 精确定义 [HTML Standard §8.1]。一个 Event Loop 包含：

1. **Task Queue（任务队列）**：多个，如用户交互事件队列、网络事件队列、定时器队列。
2. **Microtask Queue（微任务队列）**：单一队列，包含 Promise callbacks 和 `MutationObserver` 回调、`queueMicrotask()` 注册的回调。

**每次循环迭代的规范步骤**：

1. 令 **oldestTask** 为 task queues 中最早进入的 task。
2. 设置 Event Loop 的 **currently running task** 为 oldestTask 并执行。
3. 执行完毕后，执行 **microtask checkpoint**：
   a. 当 microtask queue 非空时，出队并执行最老的 microtask。
   b. 若 microtask 执行过程中又产生了新 microtask，继续处理，直到队列为空。
4. 执行 **Update the rendering**（如果需要）。

**渲染时机**：浏览器在一次 task 和随后的所有 microtasks 执行完毕后，才进行渲染。因此，长时间运行的同步代码或密集的 microtask 链会阻塞渲染，导致 UI 卡顿 [HTML Standard §8.1.6.3]。

### 7.3 Node.js：libuv Event Loop

Node.js 的 Event Loop 基于 libuv，包含 7 个阶段。与浏览器不同的是，Node.js 的 `process.nextTick` 和 `Promise` microtask 有优先级差异 [Node.js Docs: Event Loop]：

**执行顺序（同一阶段内）**：

1. 执行当前阶段的回调（如 timer 回调）。
2. 清空 `nextTickQueue`（所有 `process.nextTick` 回调，包括递归产生的）。
3. 清空 microtask queue（Promise callbacks，包括递归产生的）。
4. 进入下一个 Event Loop 阶段。

**`setImmediate` vs `setTimeout(0)`**：

- `setImmediate` 在 check 阶段执行。
- `setTimeout(0)` 在 timers 阶段执行。
- 当两者在主模块中直接使用时，执行顺序取决于机器性能和当前 Event Loop 状态，通常 `setTimeout` 可能因最小阈值（约 1ms）而稍慢于 `setImmediate`。

### 7.4 Worker 的隔离语义

**Web Worker**（浏览器）和 **Worker Threads**（Node.js）都提供了与主线程隔离的执行环境，但语义有重要差异：

| 特性 | Web Worker | Node.js Worker Threads |
|------|-----------|----------------------|
| **规范** | HTML Living Standard §11 | Node.js `worker_threads` API |
| **全局对象** | `DedicatedWorkerGlobalScope` | `worker.MessagePort` + 自定义上下文 |
| **共享内存** | `SharedArrayBuffer` + `Atomics` | `SharedArrayBuffer` + `Atomics` + `MessageChannel` |
| **DOM 访问** | 无 | 无 |
| **模块系统** | ESM（`type: module`）或经典脚本 | 支持 ESM 和 CJS |
| **V8 关系** | 独立的 V8 Isolate，独立的 Event Loop | 独立的 V8 Isolate，但共享 libuv 线程池 |

> **隔离保证**：每个 Worker 运行在自己的 V8 Isolate 中，拥有独立的堆内存和垃圾回收器。它们不共享执行上下文栈或全局环境记录 [HTML Standard §11.1.1]。

---

## 8. 前沿特性语义分析

### 8.1 `--erasableSyntaxOnly` 的语义意义

`--erasableSyntaxOnly` 是 TypeScript 5.8 引入的编译选项 [TS 5.8 Release Notes]。其语义核心是：

> 拒绝任何无法被纯粹擦除为 ECMAScript 语法的 TypeScript 特性。

**被禁止的构造**：

| 构造 | 被禁止的原因 |
|------|-------------|
| `enum` | 生成运行时对象和反向映射 |
| `namespace` / `module` | 生成 IIFE 运行时命名空间对象 |
| 参数属性（Parameter Properties） | 在构造函数体内生成 `this.prop = param` |
| `import foo = require("mod")` | 非标准 ECMAScript 导入语法 |

**工程意义**：

- 确保 `.ts` 文件可以直接被现代运行时（Node.js 22+ `--experimental-strip-types`、Deno、Bun）加载，无需 `tsc` 转译。
- 标志着 TypeScript 向“纯注释型类型系统”的进一步收敛。

### 8.2 `--module nodenext` 与 ESM/CJS 互操作

`--module nodenext` 和 `--moduleResolution nodenext` 是 TypeScript 对 Node.js ESM/CJS 互操作规范的完整建模 [TS 5.8 Release Notes, Node.js Docs: ESM]。

**关键语义**：

1. **文件扩展名强制**：在 ESM 上下文中，相对导入必须包含 `.js` 扩展名（即使源文件是 `.ts`）。这直接映射到 Node.js ESM 加载器的行为。
2. **`__dirname` / `__filename` 不可用**：在 `.mts` 文件或 `"type": "module"` 的 `.ts` 文件中，这些 CJS 全局变量不存在。
3. **`require(esm)` 支持**：Node.js 22+ 开始支持 `require()` 加载 ESM 模块（带有异步边界限制）。TypeScript 5.8 的 `--module nodenext` 允许在 `.cts` 文件中对 ESM 模块使用 `require()`，前提是运行时支持 [Node.js Docs: require(esm)]。
4. **`exports` 字段解析**：类型解析严格遵循 Node.js `package.json` 的 `exports` 和 `types` 条件导出规则。

### 8.3 `NoInfer<T>` 的约束语义

TypeScript 5.8 引入内置工具类型 `NoInfer<T>` [TS 5.8 Release Notes]。其语义是：

> 在类型推断过程中，`NoInfer<T>` 包装的位置不参与最佳公共类型的推断，仅作为候选类型的消费侧使用。

**语义模型**：

假设函数签名 `declare function f<T>(arg: T, defaultValue: NoInfer<T>): T;`

- 调用 `f(1, 2)` 时，`T` 从第一个参数 `arg` 推断为 `number`。
- 第二个参数 `defaultValue` 的 `NoInfer<T>` 仅检查 `2` 是否可赋值给 `number`，不参与 `T` 的推断。

这解决了以下经典问题：当多个参数共同推断一个泛型参数时，编译器可能将它们的类型合并为过于宽泛的联合类型。`NoInfer<T>` 允许开发者明确指定“哪一侧应该主导推断，哪一侧只应接受推断结果”。

### 8.4 `using` 声明与显式资源管理

`using` 声明是 ECMAScript 显式资源管理（Explicit Resource Management）的 **Stage 4 / 已纳入 ECMAScript 2025 标准**，TypeScript 5.2+ 已支持 [TS 5.2 Release Notes, ECMA-262 2025]。

**语义核心**：

```typescript
{
  using file = await openFile("path");
  // ... 使用 file
} // 此处自动调用 file[Symbol.dispose]()
```

1. **同步 `using`**：绑定变量的作用域结束时，调用 `value[Symbol.dispose]()`。
2. **异步 `await using`**：绑定变量的作用域结束时，调用 `await value[Symbol.asyncDispose]()`。
3. **异常安全**：无论块内是否正常退出（return、throw、break），`dispose` 方法都会被调用，语义上类似于 RAII（Resource Acquisition Is Initialization）。

**规范语义**：

ECMA-262 标准定义了新的抽象操作 `DisposeResources`，它收集作用域内所有 `using` 声明的资源，在作用域退出时按 **后进先出（LIFO）** 顺序释放。如果某个 `dispose` 调用抛出异常，后续资源仍会被释放（best-effort），且原始异常（如果有）会被优先抛出 [ECMA-262 2025]。

### 8.5 `import defer` 语义模型

`import defer` 是 TC39 `import-defer` 提案的 Stage 3 语义，TypeScript 6.0 已提供完整支持 [TC39 Proposals: import-defer, TS 6.0 Release Notes]。该提案引入了模块加载的**延迟求值（lazy evaluation）**机制，对 JavaScript 的模块语义模型有重要扩展。

#### 语法与表面语义

```typescript
import defer * as mod from './heavy-module';
```

**表面特征**：

- 位于模块顶层，与常规 `import` 相同位置
- 声明局部常量绑定 `mod`
- 不返回 Promise，不改变代码的同步/异步性质

#### 深层语义模型

**与 `dynamic import()` 的本质区别（同步句法 vs 异步求值）**：

| 维度 | `import defer` | `dynamic import()` |
|------|----------------|-------------------|
| **句法范畴** | 声明语句（Declaration） | 表达式（Expression） |
| **求值上下文** | 同步作用域 | 异步上下文（Promise） |
| **模块图位置** | 静态参与模块图构建 | 动态加入模块图 |
| **绑定性质** | 词法作用域常量 | Promise 解析值 |
| **求值触发** | 首次访问命名空间属性 | Promise 解决时 |

**模块命名空间代理（Module Namespace Proxy）的惰性求值语义**：

```
ECMA-262 模块加载四阶段：
1. Fetch（获取源码）
2. Instantiate（实例化模块记录、解析依赖）
3. Evaluation（执行模块顶层代码）← import defer 延迟此阶段
4. 使用模块导出

import defer 的语义：
- 阶段 1-2 仍按宿主策略执行（可能提前发生）
- 阶段 3（Evaluation）被包装在代理中，延迟到属性访问
- 代理对象首次被访问时触发实际求值，后续访问使用缓存结果
```

**形式化语义说明**：

当执行 `import defer * as mod from './module'` 时：

1. 创建一个模块命名空间 exotic 对象的代理（Proxy）
2. 代理的 `[[Get]]` 内部方法被覆盖，在首次访问时：
   a. 检查模块是否已求值
   b. 若未求值，执行 `Evaluate()` 抽象操作
   c. 将结果缓存于模块记录中
   d. 后续访问直接返回缓存值
3. 模块的求值副作用（如顶层 `console.log`、全局状态修改）仅在首次访问时触发

**与 `dynamic import()` 的工程权衡**：

```typescript
// import defer —— 适合"声明即依赖，但初始化可延迟"的场景
import defer * as heavyAnalyzer from './analyzer';

function main() {
  if (condition) {
    // 模块求值在此处首次触发
    heavyAnalyzer.analyze();
  }
  // condition 为 false 时，analyzer 模块永不被求值
}

// dynamic import() —— 适合"运行时动态决定加载哪个模块"的场景
async function main() {
  const analyzer = condition
    ? await import('./analyzer-a')
    : await import('./analyzer-b');
  analyzer.analyze();
}
```

**类型系统语义**：

TypeScript 6.0 对 `import defer` 的类型检查：

- 命名空间对象 `mod` 的类型与 `import * as mod` 完全一致
- 类型擦除不改变语义，仅在输出 JavaScript 中保留 `import defer` 语法
- 编译器需要知晓宿主的 `import defer` 支持情况（通过 `target` 或 `lib` 配置）

*来源：[TC39 Proposals: import-defer], [TS 6.0 Release Notes], [The New Stack: ES2026]*

### 8.6 TypeScript 7.0 / Go 重写对语义层的影响

Microsoft 于 2024-2025 年宣布对 TypeScript 编译器进行原生（Native）重写，即 **TypeScript 7.0 / Go 重写（代号 Corsa）** 将基于 Go 语言实现新的编译器核心 [Microsoft Blog: TypeScript Native Port]。从语义学视角看，这一变革需要从多个层面理解。

#### 1. 语言语义不变性

Go 重写改变的是**编译器实现架构**和**增量检查模型**，并不改变 JavaScript 或 TypeScript 的**语言语义**。

**保持不变的语义保证**：

| 语义层面 | 不变性保证 | 理论依据 |
|---------|-----------|---------|
| **类型擦除** | 所有类型注解、接口、泛型参数仍完全擦除 | TS 设计语言原则 |
| **类型关系三元判定** | 可赋值性、子类型、一致性规则集不变 | 结构化子类型理论 |
| **ECMAScript 映射** | 编译器仍作为 ECMA-262 的静态检查层 | 渐进类型（Gradual Typing）框架 |
| **模块解析** | `moduleResolution` 的解析算法语义不变 | Node.js/Bundler 规范 |
| **声明合并** | `namespace`、`interface` 合并规则不变 | TS 语言规范 |

#### 2. 编译器实现层面的变革

**从 JavaScript 到 Go 的架构迁移**：

```
当前架构（tsc JS版）：
  TypeScript 源码 → Parser → Binder → Checker (单线程) → Emitter
                                    ↓
                               类型推断、关系检查
                                    ↓
                               事件循环限制吞吐量

Go 新架构（tsc Go版）：
  TypeScript 源码 → Parser → Binder → Checker (多 goroutine) → Emitter
                                    ↓
                               并行类型检查、增量缓存
                                    ↓
                               10x 性能提升目标
```

**关键实现变化**：

- **并发模型**：利用 goroutine 实现文件级并行类型检查，突破单线程限制
- **内存管理**：Go 的 GC 与值类型提供更紧凑的内存布局，减少类型检查器的内存占用
- **增量检查**：更激进的增量分析与持久化缓存，使得跨文件修改的响应时间大幅降低

#### 3. 对语义层的影响分析

**类型擦除语义不变，但编译器内部 IR 和增量检查模型将彻底改变**：

| 方面 | JS 版 tsc | Go 版 tsc | 对语义的影响 |
|------|----------|----------|------------|
| **中间表示（IR）** | 基于对象的 AST | 可能采用更紧凑的扁平化表示 | 无，仅影响编译器内部 |
| **类型检查顺序** | 单文件顺序 + 依赖图遍历 | 并行批处理 + 工作窃取 | 无，结果确定性保证 |
| **错误报告** | 按发现顺序报告 | 可能按文件/位置排序 | 无，仅输出格式 |
| **增量更新** | 细粒度依赖追踪 | 更激进的缓存策略 | 无，检查语义相同 |

**对工具链的潜在影响**：

- **AST 访问**：如果 Go 版使用不同的 AST 格式，依赖 `ts` 内部 API 的工具需要迁移
- **LSP 成为主要接口**：语言服务将全面 LSP 化，减少编辑器与编译器的直接耦合
- **插件 API**：Go 的静态编译模型可能影响编译器插件的加载机制

#### 4. 对类型系统检查强度的长期影响

编译速度的提升使得 TypeScript 团队可以在未来的 TS 7.x 版本中引入**更激进的控制流分析**和**更严格的跨文件类型推断**。这些变化是**检查强度的增强**，而非**语言语义的变更**：

- 更精确的空值分析（nullability analysis），减少 `null`/`undefined` 漏报
- 更严格的泛型参数上下文推断，减少显式类型参数需求
- 更激进的 `--strict` 模式扩展，捕获更多潜在类型错误

#### 5. 对 `--erasableSyntaxOnly` 的长期影响

原生编译器可能更严格地执行**可擦除语义**（erasable semantics）：

- 更快的编译速度降低了拒绝非擦除语法（如 `enum`、`namespace`）所带来的工程阻力
- `--erasableSyntaxOnly` 可能从"可选严格标志"演变为更受推荐的默认行为
- 推动 TypeScript 向纯注释型类型系统收敛，与 Node.js `--strip-types`、Deno 等运行时对齐

#### 结论

TypeScript 7.0 的 Go 重写是一场**编译器工程革命**，而非**类型理论革命**。对于语义分析而言：

1. **三层语义模型**（ECMA-262 运行时 / TS 编译时 / 宿主调度）的框架依然稳固
2. **类型擦除**的核心保证不变，TypeScript 仍保持"编译时存在、运行时不存在"的特性
3. **工程实践**需要关注工具链迁移（LSP、AST API），但代码语义无需改变

*来源：[Microsoft Blog: TypeScript Native Port], [TypeScript Roadmap 2025]*

### 8.7 ES2025 新特性语义

ECMAScript 2025（第 16 版，2025 年 6 月发布）带来了多项对语义模型有深远影响的特性 [ECMA-262 2025]。

#### Iterator Helpers

全局 `Iterator` 构造函数及原型方法（`.map`、`.filter`、`.take`、`.drop`、`.flatMap`、`.reduce`、`.forEach`、`.some`、`.every`、`.find` 等）为任意可迭代对象提供了**惰性求值链式操作** [ECMA-262 §27.1]。

**语义影响**：

- 消除了将可迭代对象强制转换为数组的内存开销
- 统一了 Array-like、Generator、自定义迭代器的操作语义
- TypeScript 5.8+ 已提供完整类型定义，类型推断需支持返回新的 `Iterator<T>` 而非 `Array<T>`

#### Set Methods

`Set.prototype` 新增集合运算方法：`union`、`intersection`、`difference`、`symmetricDifference`、`isSubsetOf`、`isSupersetOf`、`isDisjointOf` [ECMA-262 §24.2]。

**语义影响**：

- 将以往依赖第三方库（如 lodash、immutable.js）的集合代数语义纳入语言规范
- 运算结果返回新的 `Set` 实例，原集合不可变
- 为类型系统引入了「集合论类型操作」的运行时对应物

#### Import Attributes (JSON Modules)

正式确立 `import data from './data.json' with { type: 'json' }` 语法 [ECMA-262 §16.2]。

**语义影响**：

- 模块加载器必须在**解析阶段**校验属性元数据
- 对打包工具（Webpack/Vite/Rollup）和 Node.js ESM 实现产生直接影响
- TypeScript 5.8 的 `--module nodenext` 已原生支持该语法的类型检查与代码生成

#### `Promise.try()`

统一包装同步或异步回调，自动将同步异常转为 Promise 拒绝，避免 `Promise.resolve().then()` 的微任务延迟 [ECMA-262 §27.2]。

**语义影响**：

- 优化了异步边界错误处理的语义一致性
- 消除了手动 `try/catch` + `Promise.resolve()` 的样板代码

#### `Float16Array`

新增 16 位浮点 TypedArray，配套 `DataView.prototype.getFloat16` / `setFloat16` 及 `Math.f16round` [ECMA-262 §23.2]。

**语义影响**：

- 对 WebGPU、ML 模型传输和内存敏感型应用影响显著
- 编译器/运行时需支持 half-precision IEEE 754 运算

### 8.8 ES2026 前沿语义

2026 年 3 月 TC39 会议后，以下提案已锁定进入 ES2026（第 17 版）[^The New Stack: ES2026]。

#### Temporal API

被称为「ES2015 以来最大 additions」，提供不可变的日期时间对象（`Temporal.Instant`、`Temporal.PlainDate`、`Temporal.ZonedDateTime` 等），内置时区和历法支持，彻底替代存在数十年设计缺陷的 `Date` 对象。

**语义影响**：

- `Date` 的 mutable、时区混乱、月份从 0 开始等问题得到根本性解决
- TypeScript 6.0 已内置 Temporal API 的类型定义
- 对金融、航空、医疗等时区敏感领域有革命性意义

#### Explicit Resource Management

引入 `using` / `await using` 块级声明及 `Symbol.dispose` / `Symbol.asyncDispose`，实现确定性的作用域退出资源清理（RAII 语义）。

**语义影响**：

- 对文件句柄、锁、数据库连接等场景的标准化错误处理与清理顺序有根本性改进
- TypeScript 5.2 已提供语法支持，ES2026 将其纳入语言规范

#### `Error.isError`

提供跨 Realm（如 iframe、Node.js `vm` 模块）可靠的 Error 实例检测，解决了 `instanceof Error` 的 false negative 问题。

#### `Map.getOrInsert` / `getOrInsertComputed`

消除 `if (!map.has(k)) map.set(k, defaultValue)` 的竞态条件样板，提供原子化的「不存在则插入」语义。

### 8.9 TypeScript 6.0 默认配置变革的语义影响

TypeScript 6.0（2026 年 3 月 GA）是最后一个基于 JavaScript 代码库的 TS 版本 [TS 6.0 Release Notes]。其默认配置的变革对语义分析有直接影响：

| 配置项 | TS 5.x 默认 | TS 6.0 默认 | 语义影响 |
|--------|------------|------------|---------|
| `strict` | `false` | `true` | 新项目默认获得最大类型安全，减少 `any` 泄漏 |
| `module` | `commonjs` | `esnext` | 默认输出 ESM，与 Node.js 原生 ESM 语义对齐 |
| `target` | `es2016` | `es2025` | 默认支持最新的 ECMAScript 运行时语义 |
| `types` | 自动包含 `@types/*` | `[]` | 显式控制类型定义的作用域，减少隐式全局类型污染 |

**工程语义**：TS 6.0 的默认配置变化标志着 TypeScript 从「向后兼容 CJS/旧浏览器」向「面向现代运行时」的战略转型。

### 8.10 Node.js 22/24 原生 type stripping 语义

Node.js 22.18+ / 23.6+ / 24 LTS 已通过内置 **Amaro**（基于 SWC WASM）原生执行 `.ts` 文件，仅做类型擦除、不做类型检查 [Node.js Docs: Type Stripping]。

**三层语义模型的再审视**：

在 Node.js native TS 模式下，TypeScript 的语义发生了微妙的**工具链分工重组**：

- **L2 静态语义层**：`tsc --noEmit` 在 CI/编辑器中运行，负责类型检查与错误报告
- **L2 擦除语义层**：Node.js Amaro 在运行时执行，仅负责类型擦除与快速启动
- **L1 动态语义层**：V8 执行擦除后的 JavaScript，语义与编译后的 `.js` 完全一致

这意味着 TypeScript 正在从「编译到 JS 的语言」向「带静态检查的 JS 方言」演变。`--erasableSyntaxOnly` 的兴起正是这一趋势的语义保障：确保所有 TS 语法都可以被安全擦除，无需编译器生成额外的运行时代码（如 `enum`、参数属性）。

*来源：[ECMA-262 2025], [The New Stack: ES2026], [TS 6.0 Release Notes], [Node.js Docs: Type Stripping]*

---

## 9. 综合论证与结论

### 9.1 JS/TS 语义模型的核心特征

| 特征 | 规范论证 | 工程影响 |
|------|---------|---------|
| **动态类型基础** | ECMA-262 所有值在运行时携带类型标签（Type Tag） | 运行时高度灵活，但无法静态保证无类型错误 |
| **Gradual Typing 层** | TypeScript 通过 `any` 和 `unknown` 实现渐进类型边界 | 允许大型项目逐步迁移，但 `any` 会破坏类型安全保证 |
| **Structural Subtyping** | 类型兼容性基于成员结构而非声明身份 [TS Spec §3.11] | 支持接口演化和跨模块兼容，但无法创建真正的密封类型 |
| **单线程并发调度** | ECMA-262 Jobs + 宿主 Event Loop | 消除了数据竞争，但 I/O 密集任务需借助 Worker |
| **类型擦除为主** | 绝大多数 TS 语法无运行时残留 [TS Handbook] | 零运行时开销，但调试时丢失类型信息 |

### 9.2 学术概念与工程实践的对照

**Hindley-Milner 的澄清**：TypeScript 的类型推断在学术界和工程社区常被误称为 HM。实际上，由于 TS 支持子类型、泛型约束、函数重载和上下文敏感推断，其推断引擎是 **基于约束求解** 的专用实现，与 HM 的 let-polymorphism 和无子类型假设有本质区别。

**Event Loop 的澄清**：JS 的并发模型不能被简单概括为“宏任务 → 微任务 → 渲染”。准确的表述是：

- ECMA-262 定义了 Jobs 和 Job Queues；
- HTML 标准定义了浏览器的 Task Queue 和 Microtask Queue 及其与渲染的交互；
- Node.js 的 libuv 定义了 7 阶段 Event Loop 和 `nextTick` 扩展。

V8 引擎本身不负责调度，它只负责执行被推入的 Job。

### 9.3 实践建议

| 场景 | 推荐语义配置 | 理由 |
|------|-------------|------|
| **新启动项目** | TypeScript 5.8 + `--strict` + `--erasableSyntaxOnly` | 最大类型安全，兼容现代直接执行引擎 |
| **库开发（npm 发布）** | `--erasableSyntaxOnly` + `--verbatimModuleSyntax` + `--module nodenext` | 确保消费者无运行时副作用，支持 ESM/CJS 双模式 |
| **遗留项目迁移** | 渐进式启用 `--strictNullChecks` → `--strict` | 避免一次性引入大量类型错误 |
| **Node.js 22+ 服务端** | `--module nodenext` + `--moduleResolution nodenext` | 精确匹配 Node.js ESM/CJS 互操作语义 |
| **需要资源确定性释放** | `using` / `await using` | 提供异常安全的 RAII 语义 |
| **泛型推断失控** | 使用 `NoInfer<T>` 约束辅助参数 | 明确区分推断源与消费侧 |

---

## 10. 编译工程与工具链语义

> 本章将视角从"语言规范"转向"编译工程"，分析 JavaScript / TypeScript 在现代软件工程中的工具链语义与执行模型变迁。重点覆盖 Node.js 原生 TS 执行、编译器/转译器差异、构建工具链选型以及 CI/CD 中的类型检查策略。

### 10.1 Node.js 原生 TypeScript 执行语义

Node.js 22.18+ 和 24 LTS 引入了原生 TypeScript 支持，其底层引擎为 **Amaro**——一个基于 SWC WASM 的类型擦除器 [Node.js Docs: Type Stripping]。这一变革对 JS/TS 的编译工程语义产生了深远影响。

#### Amaro 的语义定位

Amaro 不是类型检查器，也不是完整的 TypeScript 编译器。它在语义上只负责**擦除阶段（Erasure Phase）**：

```
.ts 源码 ──► [Amaro: 词法分析 + 语法分析 + 类型节点删除] ──► .js 等价代码 ──► V8 执行
                ↑
                └── 不做类型检查、不做跨文件类型推断、不生成 .d.ts
```

这意味着：**运行时的语义正确性完全由开发者通过 `tsc --noEmit` 在 CI/编辑器中保证**，而 Node.js 只负责快速启动。TypeScript 的角色从「编译器」进一步收敛为「纯静态分析器」。

#### `--erasableSyntaxOnly` 的规范意义

为了确保 Amaro 能安全擦除所有语法，Node.js 官方推荐配合 TypeScript 的 `--erasableSyntaxOnly` 标志使用。该标志禁止以下运行时生成语法：

| 被禁止的语法 | 运行时行为 | 推荐替代方案 |
|-------------|-----------|-------------|
| `enum` | 生成反向映射对象 | `as const` 对象 |
| `namespace` / `module Foo {}` | 生成 IIFE 包装对象 | ESM `export` / 纯对象 |
| 参数属性（Parameter Properties） | 在构造函数体内隐式赋值 | 显式字段声明 + 显式赋值 |
| `import =` / `export =` | 生成 CJS `require`/`module.exports` | ESM 语法 |
| Legacy 装饰器（experimentalDecorators） | 生成辅助代码和元数据 | TC39 Stage 3 装饰器（TS 5.9+ 稳定支持） |

**语义结论**：`--erasableSyntaxOnly` 将 TypeScript 约束为「纯注释型类型系统」，与 Node.js type stripping、Deno 原生 TS、浏览器未来可能的 Type Annotations 提案形成语义对齐。

#### `require(esm)` 的互操作模型

Node.js 23 起默认启用 `require(esm)`，允许同步 `require()` 加载 ESM 模块 [Node.js Docs: require(esm)]。TS 5.8 的 `--module nodenext` 已支持这一语义的类型解析：

```typescript
// CJS 文件中
import { foo } from './esm-module.js'; // ESM 静态导入（顶层）
const { bar } = require('./esm-module.js'); // CJS 同步 require，ESM 语义兼容
```

这对语义层的意义在于：TypeScript 的模块解析层（`moduleResolution: NodeNext`）已能精确建模 Node.js 的双模块系统互操作，消除了此前 `ERR_REQUIRE_ESM` 导致的类型-运行时不一致。

### 10.2 编译器与转译器的语义差异

在现代工程中，"编译 TypeScript" 通常由多个工具协同完成。理解它们在**语义保留度**上的差异至关重要。本节建立 tsc、Babel、SWC、esbuild、Rolldown、tsgo 的语义差异矩阵。

#### 类型擦除策略对比

| 工具 | 类型擦除实现 | 与 tsc 擦除语义的一致性 | 关键差异 |
|------|-------------|---------------------|---------|
| **tsc** | 官方实现，基于完整 AST 遍历 | 100%（基准） | 同时执行类型检查，速度较慢 |
| **Babel** | `@babel/preset-typescript` 删除类型节点 | ~98% | 不处理 `const enum` 内联、不生成 `.d.ts` |
| **SWC** | Rust 原生 AST 遍历，类型节点删除 | ~99% | 默认不内联 `const enum`（可配置），装饰器处理与 tsc 略有差异 |
| **esbuild** | Go 实现，快速删除类型标注 | ~97% | 忽略 `emitDecoratorMetadata`，`isolatedModules` 强制为 true |
| **Rolldown** | 基于 Oxc 的 Rust bundler | ~98% | 作为 bundler 更关注 tree-shaking 语义，类型擦除委托给 Oxc |
| **tsgo** | Go 重写的官方 tsc | 100% | 未来官方替代方案，擦除语义与 JS 版 tsc 完全一致 |

#### 装饰器语义差异

TypeScript 的 decorators 经历了两个规范阶段：

- **Legacy 装饰器**（`experimentalDecorators`）：TS 1.5 引入的实验性实现，生成运行时代码和 `__decorate` 辅助函数
- **TC39 Stage 3 装饰器**（TS 5.9+ 稳定支持）：基于 `Symbol.metadata` 的新标准，语义与 Angular 18+、NestJS 11+ 对齐

**工程语义**：Babel 和 SWC 对 legacy 装饰器的支持相对成熟，但对 TC39 新装饰器的语义实现仍在追赶。对于使用新装饰器的项目，tsc 仍是语义最可靠的选择。

#### 模块降级语义

不同工具对 `import` / `export` 的降级策略存在细微但关键的差异：

- **tsc**：严格遵循 `module` 配置（`commonjs`、`nodenext`、`esnext`），`esModuleInterop` 控制默认导入的辅助代码生成
- **Babel**：通过 `@babel/preset-env` 和 `@babel/plugin-transform-modules-commonjs` 降级，辅助代码风格与 tsc 不同
- **SWC / esbuild / Rolldown**：模块降级通常与 bundling 一体化处理，对 `__esModule` 标记和 `default` 导出的处理可能与 tsc 不完全一致

**语义风险**：当库作者使用 SWC/esbuild 编译并发布 CJS 产物时，消费者（使用 tsc `moduleResolution: nodenext`）可能遇到默认导入的类型解析错误。这是目前混合工具链中最常见的"编译语义不一致"问题。

### 10.3 现代构建工具链的选型语义

2026 年的前端/Node.js 构建工具链已形成清晰的分层格局。本节不是功能罗列，而是从「源码 → 产物」的**语义保留度**角度分析选型逻辑。

#### 开发服务器与通用前端：Vite

Vite 6/7/8 通过「开发时原生 ESM + 生产时 Rollup/Rolldown 打包」的分层策略，最大程度保留了源码的模块语义。开发阶段无打包，意味着：

- 源码与浏览器执行的 JS 之间几乎没有语义变换（仅 TS 类型擦除）
- 调试时的 Source Map 1:1 对应关系最为清晰

#### Next.js 生态：Turbopack

Turbopack 作为 Next.js 15/16 的默认 bundler，在框架内部已稳定。其语义特征是：

- 深度集成 React Server Components 语义
- 对 `use client` / `use server` 指令有专门的模块边界处理
- **无法脱离 Next.js 单独使用**，其语义是 Next.js 框架语义的子集

#### Webpack 迁移提速：Rspack

Rspack 是字节跳动出品的 Rust 版 Webpack 替代品，API 兼容度极高。其语义价值在于：

- 对遗留项目的配置零改造迁移
- 保留了 Webpack 的模块图和 loader 链语义，但用 Rust 加速了执行

#### 下一代统一 Bundler：Rolldown

Rolldown（VoidZero）计划在 Vite 8 中取代 esbuild（dev）和 Rollup（prod）。其语义价值在于：

- 统一了开发阶段与生产阶段的 bundling 语义
- 基于 Oxc 的 parser/transformer，与 SWC 形成竞争
- 2026 H1 预计稳定，适合在新项目中试点

#### 编译器性能天花板：tsgo

TypeScript 7.0（Project Corsa）的 `tsgo` 将提供 8–10x 的编译速度提升。其语义意义在于：

- 作为官方编译器，**100% 保留 tsc 的擦除语义和类型检查语义**
- 消除了「tsc 太慢，必须用 SWC/esbuild 做开发转译」的工程妥协
- 长期看可能使「分离转译 + `tsc --noEmit`」的范式逐渐收敛为「tsgo 一体化」

### 10.4 工程实践范式与 CI/CD 类型检查策略

#### 分离转译与类型检查的语义分工

现代大型 TS 项目的标准构建范式是：

```
开发/生产构建：SWC / esbuild / Rolldown 负责快速转译（擦除语义层）
CI 类型检查：tsc --noEmit 负责完整静态分析（静态语义层）
```

这种分工的语义意义在于：

- **转译器只保证 L2 擦除语义**（源码 → JS 的正确转换）
- **类型检查器只保证 L2 静态语义**（类型关系的正确性）
- 两者并行执行，互不阻塞，解决了 tsc 作为单一瓶颈的性能问题

#### Monorepo 中的类型系统边界

现代 Monorepo 通过以下机制强化类型系统边界：

- **`isolatedDeclarations`**：要求导出声明具备充分的显式类型注解，使第三方工具能独立生成 `.d.ts`。这是对「类型擦除与声明生成解耦」的语义约束。
- **Project References**：通过 `composite: true` 和顶层 `references` 实现跨包增量编译，将类型检查从数分钟压缩到数十秒。
- **`package.json exports`**：通过 `exports: { ".": "./dist/index.js" }` 强制公开 API，防止内部模块被外部深导入，从而在包边界处维护类型契约的完整性。

#### CI/CD 中的类型检查策略

| 策略 | 适用场景 | 语义价值 |
|------|---------|---------|
| `tsc --noEmit` 作为阻塞检查 | 所有项目 | 将类型错误视为与单元测试失败同级别的合并阻塞条件 |
| `incremental: true` + `.tsbuildinfo` 缓存 | 大型代码库 | 将重复类型检查时间从分钟级降至秒级 |
| `tsgo` 试点（非阻塞） | 中型项目 | 在独立 CI job 中跑基准测试，评估 10x 提速的迁移可行性 |
| **Oxlint 快速初筛 + ESLint 深度检查** | 超大型代码库 | 用 Oxlint（秒级）做快速反馈，ESLint 做完整规则校验 |

**学术对齐**：这种「分层检查」的工程范式与 **Berkeley CS 164** 中讲授的 compiler pipeline 思想同构——将复杂问题分解为可并行、可增量、可缓存的阶段。

---

## 11. 学术课程对齐框架

> 本章将本项目的 JS/TS 语义分析与国际顶尖大学的 Programming Languages (PL)、Type Systems、Compiler Design 课程进行显式对齐，建立学术概念与工程实践之间的映射桥梁。

### 11.1 渐进类型框架

**对齐课程**：Stanford CS 242: Programming Languages (Fall 2024/2025) [Stanford CS 242]；UW CSE 341: Programming Languages (2024 Autumn) [UW CSE 341]

**核心理论**：

- **Stanford CS 242** 设有专门的 **Lecture 16: Gradual Typing** 专题讲座，系统讲授 Siek & Taha (2006) 的 consistency relation `T ~ S`、cast insertion、blame 追踪等概念。
- **UW CSE 341** 的 Dan Grossman 讲义 "Static vs. Dynamic Typing" [UW CSE 341 Static vs Dynamic] 直接讨论了类型检查的时机（编译时 vs. 运行时）、类型安全的近似性（type-checking is approximate）、以及静态类型的 early error detection 与动态类型的灵活性之间的 trade-off。

**与 JS/TS 的映射**：
TypeScript 并非「静态类型语言附加到动态语言上」的简单组合，而是一个 **Gradually Typed** 系统。`any` 类型对应 gradual typing 中的动态边界（dynamic boundary），`unknown` 对应受控的动态边界。`as T` 类型断言可视为显式的 cast insertion，但 TypeScript 并不执行运行时的 blame 追踪，这是其工程简化（也是 soundness 不完全）的来源。

### 11.2 类型系统形式化谱系

**对齐课程**：CMU 15-317: Constructive Logic (Fall 2024) [CMU 15-317]；MIT 6.5110: Foundations of Program Analysis [MIT 6.5110]

**核心理论**：

- **CMU 15-317** 的核心内容 "proofs as programs"（Curry-Howard 对应）是理解现代类型系统的元理论基石。课程通过自然演绎（natural deduction）与证明项讲授的类型规则，为深入理解类型 soundness、subtyping、polymorphism 提供了形式化训练。
- **MIT 6.5110** 从形式化角度讲授 Hindley-Milner Type Inference、Type Classes and Subtyping、以及 Type-based Program Analysis（如信息流、竞态检测）。

**与 JS/TS 的映射**：
TypeScript 的类型构造（`interface`、union/intersection、泛型、条件类型）均可映射到 **Simple Types → Polymorphism → Subtyping** 的学术谱系。TS 的 `infer` 关键字和条件类型分发是工程化的约束求解机制，虽非严格 HM，但其核心思想（基于统一/unification 的推断）与 HM 同根。MIT 课程中的 "type-based program analysis" 框架可直接用于解释 ESLint、TypeScript-ESLint 和 tsc 的 control flow analysis 如何将类型系统扩展为程序分析工具。

### 11.3 编译器前端与类型擦除

**对齐课程**：Stanford CS 143: Compilers (2025 Spring) [Stanford CS 143]；CMU 15-411: Compiler Design (2025 Spring) [CMU 15-411]；Berkeley CS 164: Programming Languages and Compilers (Fall 2025) [Berkeley CS 164]

**核心理论**：

- **Stanford CS 143** 将编译器前端划分为 Lexing → Parsing → Semantic Analysis & Type Checking → IR → Code Generation，其中 Type Checking 占据连续两周的核心课时。
- **CMU 15-411** 明确将 "Static vs. Dynamic Semantics" 和 "Type-Checking in Compiler Frontend" 作为课程目标，要求学生在命令式语言的编译器中实现完整的语义分析。
- **Berkeley CS 164** 从 S-Expression 解释器起步，逐步过渡到 x86-64 编译器，完整模拟了 "Interpreter → Compiler" 的演进路径。

**与 JS/TS 的映射**：
TypeScript 编译器 (`tsc`) 本质上是一个 **compiler frontend + type checker**。学术课程中的「语义分析 → 类型检查 → IR → 代码生成」流水线，为解释 TS 的 **type erasure**、**AST 转换**、以及 **tsc 作为 transpiler** 的角色提供了严谨的工程模型。Berkeley CS 164 的 "Interpreter → Compiler" 路径与 JS 引擎的 "解释执行 + JIT 编译" 模型同构，可用于论证 TS 的类型系统在编译时提供保证，而 JS 的动态语义在运行时主导行为。

### 11.4 动态语义与运行时系统

**对齐课程**：Berkeley CS 164: Programming Languages and Compilers [Berkeley CS 164]；MIT 6.1100: Computer Language Engineering (2025 Spring) [MIT 6.1100]

**核心理论**：

- **Berkeley CS 164** 在第 10 周专门讲授 First-Class Functions / Lambdas，这是 JavaScript 的标志性特性。课程从闭包实现与运行时环境角度分析函数类型的编译后行为。
- **MIT 6.1100** 的 Runtime Organization、Garbage Collection 和 JIT 专题将 Java/JavaScript 列为 JIT-compiled 语言的典型示例，并讲授了 dataflow analysis 与寄存器分配等优化技术。

**与 JS/TS 的映射**：
JS 的解释执行 + JIT 编译模型与 Berkeley CS 164 中 "先解释、后编译" 的构建过程同构。MIT 6.1100 对 Runtime Organization 的讲授为理解 V8 的 Execution Context、Environment Record、以及 Event Loop 提供了底层框架。TS 的类型擦除不改变这一动态语义层，但编译时类型信息可用于 JIT 引擎的 hidden class 优化（如 TS 编译后的 monomorphic 属性访问模式）。

### 11.5 形式化验证与程序推理

**对齐课程**：Berkeley CS 263: Design of Programming Languages / Reasoning about Programs (Spring 2026) [Berkeley CS 263]；MIT 6.5110: Foundations of Program Analysis [MIT 6.5110]

**核心理论**：

- **Berkeley CS 263**（2026 Spring 由 Max Willsey 重新设计为 "Reasoning about Programs"）强调用 operational / denotational semantics 精确描述程序行为，并使用 **Lean** 证明助手进行程序验证。
- **MIT 6.5110** 讲授 axiomatic semantics（Hoare 逻辑扩展）、separation logic 和 model checking，为从数学层面论证程序正确性提供工具。

**与 JS/TS 的映射**：
这些课程为 TS 的类型安全讨论引入了 **形式化验证** 维度。TypeScript 的类型系统提供了受限的 soundness 保证（Progress & Preservation 在 `strict` 模式下近似成立），但已知存在 7 种 unsound 行为（`any`、`as T`、双变、数组协变等）。Berkeley CS 263 使用 Lean 进行类型级推理的方法，可用于讨论 TS 社区中对 `dependent types` 近似（模板字面量类型、branded types）的形式化建模研究前沿。MIT 6.5110 中的 model checking 框架也与 `jsts-code-lab/80-formal-verification/` 中的 TLA+、时序逻辑内容形成呼应。

---

## 参考资源

1. **ECMAScript 2025 Language Specification** - <https://tc39.es/ecma262/2025/> [ECMA-262 2025]
2. **TypeScript 5.8 Release Notes** - <https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/> [TS 5.8 Release Notes]
3. **TypeScript 5.2 Release Notes (using)** - <https://devblogs.microsoft.com/typescript/announcing-typescript-5-2/> [TS 5.2 Release Notes]
4. **HTML Living Standard: Event Loops** - <https://html.spec.whatwg.org/multipage/webappapis.html#event-loops> [HTML Standard §8.1]
5. **Node.js Documentation: The Event Loop** - <https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/> [Node.js Docs: Event Loop]
6. **Node.js Documentation: require(esm)** - <https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require> [Node.js Docs: require(esm)]
7. **Siek, J. G., & Taha, W. (2006).** *Gradual Typing for Functional Languages.* Scheme and Functional Programming Workshop. [Siek & Taha 2006]
8. **Pierce, B. C. (2002).** *Types and Programming Languages.* MIT Press. [Pierce 2002]
9. **TypeScript Language Specification** - <https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md> [TS Spec]
10. **TypeScript Handbook: Type Erasure** - <https://www.typescriptlang.org/docs/handbook/2/basic-types.html#erased-types> [TS Handbook: Type Erasure]
11. **TypeScript 6.0 Release Notes** - <https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/> [TS 6.0 Release Notes]
12. **TC39 Proposals: import-defer** - <https://github.com/tc39/proposal-import-defer> [TC39 Proposals: import-defer]
13. **The New Stack: ES2026** - <https://thenewstack.io/javascript-what-to-expect-from-es2026/> [The New Stack: ES2026]
14. **Microsoft Blog: TypeScript Native Port** - <https://devblogs.microsoft.com/typescript/typescript-native-port/> [Microsoft Blog: TypeScript Native Port]
15. **Node.js Documentation: Type Stripping** - <https://nodejs.org/api/typescript.html#type-stripping> [Node.js Docs: Type Stripping]
16. **Stanford CS 242: Programming Languages** - <https://web.stanford.edu/class/cs242/> [Stanford CS 242]
17. **Stanford CS 143: Compilers** - <https://cs143.stanford.edu/> [Stanford CS 143]
18. **MIT 6.1100: Computer Language Engineering** - <https://6110-sp25.github.io/syllabus> [MIT 6.1100]
19. **MIT 6.5110: Foundations of Program Analysis** - <https://ocw.mit.edu/courses/6-820-fundamentals-of-program-analysis-fall-2015/pages/lecture-notes/> [MIT 6.5110]
20. **CMU 15-411: Compiler Design** - <https://www.cs.cmu.edu/~411/> [CMU 15-411]
21. **CMU 15-317: Constructive Logic** - <https://www.cs.cmu.edu/~crary/317-f24/> [CMU 15-317]
22. **Berkeley CS 164: Programming Languages and Compilers** - <https://schasins.com/berkeley-cs164-fall-2025/> [Berkeley CS 164]
23. **Berkeley CS 263: Reasoning about Programs** - <https://github.com/mwillsey/cs263/tree/2026-spring> [Berkeley CS 263]
24. **UW CSE 341: Programming Languages** - <http://courses.cs.washington.edu/courses/cse341/> [UW CSE 341]
25. **UW CSE 341: Static vs. Dynamic Typing Lecture** - <https://courses.cs.washington.edu/courses/cse341/19sp/lec18slides.pdf> [UW CSE 341 Static vs Dynamic]

---

*本文档基于 ECMA-262 2025/2026、TypeScript 5.8–7.0、HTML Living Standard、Node.js 原生规范及国际顶尖大学 PL 课程文献建立精确概念模型，摒弃伪形式化与玩具代码，面向研究者与高级开发者提供规范级语义分析。*
