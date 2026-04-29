---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# JavaScript / TypeScript 语义模型可视化图表

> 补充的可视化表征，包括架构图、时序图、状态机等

---

## 目录

- [JavaScript / TypeScript 语义模型可视化图表](#javascript--typescript-语义模型可视化图表)
  - [目录](#目录)
  - [1. 类型系统架构图](#1-类型系统架构图)
    - [TypeScript Compiler API 调用示例](#typescript-compiler-api-调用示例)
  - [2. 执行上下文生命周期时序图](#2-执行上下文生命周期时序图)
  - [3. Promise 状态机](#3-promise-状态机)
  - [4. JavaScript 内存模型](#4-javascript-内存模型)
  - [5. ECMAScript 规范算法结构](#5-ecmascript-规范算法结构)
  - [6. TypeScript 类型检查流程](#6-typescript-类型检查流程)
  - [7. 模块加载语义流程](#7-模块加载语义流程)
  - [8. 事件循环详细模型](#8-事件循环详细模型)
  - [9. 对象内部方法调用链](#9-对象内部方法调用链)
  - [10. TypeScript 声明合并语义](#10-typescript-声明合并语义)
  - [11. JavaScript 作用域链可视化](#11-javascript-作用域链可视化)
  - [12. 异步迭代器协议](#12-异步迭代器协议)
  - [13. 装饰器元数据语义（TypeScript 5.2+）](#13-装饰器元数据语义typescript-52)
  - [14. 分布式追踪上下文传播](#14-分布式追踪上下文传播)
  - [15. CI/CD 管道状态机](#15-cicd-管道状态机)
  - [16. 代码示例：Promise 状态机实操](#16-代码示例promise-状态机实操)
  - [17. 代码示例：作用域链与闭包](#17-代码示例作用域链与闭包)
  - [18. 代码示例：事件循环微任务演示](#18-代码示例事件循环微任务演示)
  - [权威参考链接](#权威参考链接)

## 1. 类型系统架构图

```mermaid
graph TB
    subgraph "TypeScript类型系统架构"
        TS[TypeScript Source Code] --> Parser[Parser / Scanner]
        Parser --> Binder[Binder<br/>符号绑定]
        Binder --> Checker[Type Checker<br/>类型检查器]
        Checker --> Emitter[Emitter<br/>代码生成器]

        subgraph "类型检查器内部"
            Checker --> TS1[类型推断引擎]
            Checker --> TS2[子类型检查]
            Checker --> TS3[泛型实例化]
            Checker --> TS4[控制流分析]

            TS1 --> Inf1[上下文类型推断]
            TS1 --> Inf2[最佳公共类型]
            TS1 --> Inf3[返回类型推断]

            TS2 --> Sub1[结构子类型]
            TS2 --> Sub2[变型检查]
            TS2 --> Sub3[条件类型求解]
        end

        Emitter --> JS[JavaScript Output]
        Emitter --> DTS[.d.ts Declaration]
    end
```

### TypeScript Compiler API 调用示例

```typescript
import * as ts from 'typescript';

// 创建程序实例，触发完整的 Parser → Binder → Checker 流程
const program = ts.createProgram(['src/main.ts'], {
  target: ts.ScriptTarget.ES2024,
  module: ts.ModuleKind.ESNext,
  strict: true,
});

// 获取类型检查器（对应 Checker 节点）
const checker = program.getTypeChecker();

// 遍历源文件的 AST（Parser 输出）
for (const sourceFile of program.getSourceFiles()) {
  if (!sourceFile.isDeclarationFile) {
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isFunctionDeclaration(node) && node.name) {
        const symbol = checker.getSymbolAtLocation(node.name);
        console.log(`Function: ${symbol?.name}`);
      }
    });
  }
}
```

---

## 2. 执行上下文生命周期时序图

```mermaid
sequenceDiagram
    participant Global as Global Context
    participant FunctionA as Function A
    participant FunctionB as Function B
    participant EventLoop as Event Loop

    Note over Global: Script开始执行
    Global->>Global: 创建全局执行上下文<br/>LexicalEnvironment = GlobalEnv<br/>VariableEnvironment = GlobalEnv

    Global->>FunctionA: 调用函数A
    FunctionA->>FunctionA: 创建函数执行上下文<br/>FunctionEnvironmentRecord
    FunctionA->>FunctionA: 绑定this
    FunctionA->>FunctionA: 声明实例化

    FunctionA->>FunctionB: 调用函数B
    FunctionB->>FunctionB: 创建函数执行上下文
    FunctionB->>FunctionB: 执行代码
    FunctionB-->>FunctionA: 返回
    FunctionB->>EventLoop: 添加微任务

    FunctionA->>FunctionA: 执行继续
    FunctionA-->>Global: 返回

    Global->>EventLoop: 执行微任务队列
    EventLoop->>EventLoop: 清空微任务

    Note over Global: Script执行完成
```

---

## 3. Promise 状态机

```mermaid
stateDiagram-v2
    [*] --> Pending: new Promise(executor)

    Pending --> Fulfilled: resolve(value)
    Pending --> Rejected: reject(reason)

    Fulfilled --> [*]: 调用 then/catch handlers
    Rejected --> [*]: 调用 catch handlers

    Fulfilled --> Fulfilled: then() 返回新 Promise
    Rejected --> Fulfilled: catch() 恢复

    note right of Pending
        内部槽: [[PromiseState]] = "pending"
        [[PromiseResult]] = undefined
    end note

    note right of Fulfilled
        [[PromiseState]] = "fulfilled"
        [[PromiseResult]] = value
        不可变状态
    end note

    note right of Rejected
        [[PromiseState]] = "rejected"
        [[PromiseResult]] = reason
        不可变状态
    end note
```

---

## 4. JavaScript 内存模型

```mermaid
graph TB
    subgraph "JavaScript内存模型"
        Stack[调用栈 Stack<br/>LIFO结构]

        Heap[堆内存 Heap]

        subgraph "堆内存区域"
            NewSpace[新生代 New Space]
            OldSpace[老生代 Old Space]
            CodeSpace[代码空间 Code Space]
            LargeObj[大对象空间 Large Object Space]
        end

        subgraph "新生代详情"
            FromSemi[From Semi-space]
            ToSemi[To Semi-space]
        end
    end

    Stack -->|引用| Heap
    Stack -->|原始值| Primitives[原始值存储<br/>number/string/boolean]

    NewSpace --> FromSemi
    NewSpace --> ToSemi

    style Stack fill:#f9f,stroke:#333
    style Heap fill:#bbf,stroke:#333
    style NewSpace fill:#bfb,stroke:#333
```

---

## 5. ECMAScript 规范算法结构

```mermaid
flowchart TD
    subgraph "ECMA-262 规范结构"
        Root[ECMAScript Language Specification]

        Root --> Grammar[语法 Grammar]
        Root --> Semantics[语义 Semantics]

        Grammar --> Lexical[词法语法]
        Grammar --> Syntactic[语法语法]
        Grammar --> RegExp[正则表达式语法]

        Semantics --> Static[静态语义]
        Semantics --> Runtime[运行时语义]

        Static --> Early[Early Errors]
        Static --> BoundNames[BoundNames]
        Static --> Contains[Contains]

        Runtime --> AOs[抽象操作 Abstract Operations]
        Runtime --> SyntaxOps[语法导向操作]
        Runtime --> Internal[内部方法 Internal Methods]

        AOs --> TypeConv[类型转换操作]
        AOs --> Testing[测试/断言操作]
        AOs --> Operations[运算操作]

        Internal --> O1[[Get]]
        Internal --> O2[[Set]]
        Internal --> O3[[Call]]
        Internal --> O4[[Construct]]
    end
```

---

## 6. TypeScript 类型检查流程

```mermaid
flowchart TD
    A[TypeScript Source] --> B[扫描 Tokens]
    B --> C[解析 AST]
    C --> D[绑定符号]

    D --> E[类型检查阶段]

    subgraph "类型检查详细流程"
        E --> E1[上下文类型推断]
        E1 --> E2[一般类型推断]

        E2 --> F{需要类型参数?}
        F -->|是| G[泛型实例化]
        F -->|否| H[直接检查]

        G --> I{满足约束?}
        I -->|是| J[替换类型参数]
        I -->|否| K[报错]

        J --> H
        H --> L{子类型检查}

        L -->|通过| M[检查通过]
        L -->|失败| N[结构子类型检查]

        N -->|通过| M
        N -->|失败| O[类型错误]
    end

    M --> P[控制流分析]
    P --> Q[收窄类型]
    Q --> R[生成声明文件]
    O --> S[错误报告]
```

---

## 7. 模块加载语义流程

```mermaid
sequenceDiagram
    participant Loader as Module Loader
    participant Resolve as Resolve
    participant Fetch as Fetch
    participant Translate as Translate
    participant Instantiate as Instantiate
    participant Evaluate as Evaluate

    Note over Loader: ESM 加载流程

    Loader->>Resolve: 解析模块标识符
    Resolve-->>Loader: 返回模块URL

    Loader->>Fetch: 获取模块资源
    Fetch-->>Loader: 返回模块源码

    Loader->>Translate: 转换源码
    Translate-->>Loader: 返回ECMAScript代码

    Loader->>Instantiate: 实例化模块
    Instantiate->>Instantiate: 创建Module Record
    Instantiate->>Instantiate: 创建Environment Record
    Instantiate-->>Loader: 返回Module Record

    Loader->>Evaluate: 执行模块
    Evaluate->>Evaluate: 执行模块体
    Evaluate->>Evaluate: 填充导出绑定
    Evaluate-->>Loader: 返回完成记录
```

---

## 8. 事件循环详细模型

```mermaid
graph TB
    subgraph "Event Loop 完整模型"
        EL[Event Loop]

        subgraph "任务队列"
            Macro[宏任务队列<br/>Macrotask Queue]
            Micro[微任务队列<br/>Microtask Queue]
            Render[渲染队列<br/>Render Queue]
        end

        subgraph "宏任务来源"
            T1[setTimeout/setInterval]
            T2[I/O 完成]
            T3[UI 事件]
            T4[MessageChannel]
        end

        subgraph "微任务来源"
            M1[Promise.then/catch]
            M2[MutationObserver]
            M3[queueMicrotask]
            M4[process.nextTick]
        end

        EL -->|取出一个| Macro
        Macro -->|执行后| ClearMicro[清空微任务队列]
        ClearMicro --> Micro
        Micro -->|微任务中产生新微任务| Micro
        ClearMicro --> CheckRender{需要渲染?}
        CheckRender -->|是| Render
        CheckRender -->|否| Macro
        Render --> Macro
    end

    T1 --> Macro
    T2 --> Macro
    T3 --> Macro
    T4 --> Macro

    M1 --> Micro
    M2 --> Micro
    M3 --> Micro
    M4 --> Micro
```

---

## 9. 对象内部方法调用链

```mermaid
sequenceDiagram
    participant User as User Code
    participant Proxy as Proxy Handler
    participant Target as Target Object
    participant Ordinary as Ordinary Object

    Note over User,Ordinary: 属性访问: obj.prop

    User->>Proxy: [[Get]](prop, receiver)

    alt Proxy 有 get trap
        Proxy->>Proxy: 执行 get trap
        Proxy->>Target: 可调用 target[[Get]]
    else Proxy 无 get trap
        Proxy->>Target: 转发到 target[[Get]]
    end

    Target->>Ordinary: OrdinaryGet
    Ordinary->>Ordinary: 检查自有属性
    Ordinary->>Ordinary: 检查原型链
    Ordinary-->>User: 返回值

    Note over User,Ordinary: 属性设置: obj.prop = value

    User->>Proxy: [[Set]](prop, value, receiver)

    alt Proxy 有 set trap
        Proxy->>Proxy: 执行 set trap
    else Proxy 无 set trap
        Proxy->>Target: 转发到 target[[Set]]
    end

    Target->>Ordinary: OrdinarySet
    Ordinary->>Ordinary: 检查属性描述符
    Ordinary->>Ordinary: 创建/更新属性
    Ordinary-->>User: 返回 boolean
```

---

## 10. TypeScript 声明合并语义

```mermaid
graph TB
    subgraph "TypeScript 声明合并"
        D1[接口声明
        interface User {
          name: string
        }]

        D2[接口声明
        interface User {
          age: number
        }]

        D3[命名空间声明
        namespace User {
          export function create()
        }]

        D4[类声明
        class User {
          constructor() {}
        }]

        D5[函数声明
        function User() {}
        ]

        subgraph "合并结果"
            R1[合并后的 User 接口:
            {
              name: string
              age: number
            }]

            R2[User 命名空间
            包含静态方法 create]

            R3[User 构造函数
            包含实例方法和静态成员]
        end
    end

    D1 -->|合并| R1
    D2 -->|合并| R1
    D3 -->|附加| R2
    D4 -->|主体| R3
    D5 -->|主体| R3
    R2 -->|附加到| R3
```

---

## 11. JavaScript 作用域链可视化

```mermaid
graph BT
    subgraph "作用域链示例"
        Global[全局作用域
        globalThis
        ─────────────────
        let globalVar = 1
        function outer() {}]

        Outer[outer 作用域
        ─────────────────
        let outerVar = 2
        function inner() {}]

        Inner[inner 作用域
        ─────────────────
        let innerVar = 3
        console.log(...)]

        Inner -->|outer Environment| Outer
        Outer -->|global Environment| Global
    end

    subgraph "变量查找路径"
        V1[innerVar] -->|找到| Inner
        V2[outerVar] -->|未找到 inner| Inner
        V2 -->|找到 outer| Outer
        V3[globalVar] -->|未找到 inner| Inner
        V3 -->|未找到 outer| Outer
        V3 -->|找到 global| Global
    end
```

---

## 12. 异步迭代器协议

```mermaid
sequenceDiagram
    participant For as for await...of
    participant AsyncIter as AsyncIterator
    participant Promise1 as Promise<T>
    participant Promise2 as Promise<T>

    Note over For,Promise2: Async Iteration Protocol

    For->>AsyncIter: [Symbol.asyncIterator]()
    AsyncIter-->>For: 返回 AsyncIterator 对象

    loop 迭代直到 done
        For->>AsyncIter: next()
        AsyncIter-->>For: 返回 Promise<IteratorResult>

        Note right of AsyncIter: IteratorResult = { value, done }

        alt done = false
            For->>Promise1: await value
            Promise1-->>For: 解析值
            For->>For: 执行循环体
        else done = true
            For->>For: 退出循环
        end
    end
```

---

## 13. 装饰器元数据语义（TypeScript 5.2+）

```mermaid
flowchart TD
    D[装饰器应用] --> D1[类装饰器]
    D --> D2[方法装饰器]
    D --> D3[访问器装饰器]
    D --> D4[属性装饰器]
    D --> D5[参数装饰器]

    subgraph "元数据API"
        API1[Symbol.metadata]
        API2[context.metadata]
        API3[DecoratorMetadata]
    end

    D1 --> API1
    D2 --> API2
    D3 --> API2
    D4 --> API2
    D5 --> API2

    API2 --> Store[元数据存储
    WeakMap目标 -> 元数据对象]

    Store --> Access[运行时访问
    target[Symbol.metadata]]
```

---

## 14. 分布式追踪上下文传播

```mermaid
sequenceDiagram
    participant Client as Client App
    participant Propagator as W3C Propagator
    participant HTTP as HTTP Headers
    participant Server as Server App

    Note over Client,Server: OpenTelemetry Trace Context Propagation

    Client->>Client: 创建 Span<br/>traceId=abc123, spanId=span001

    Client->>Propagator: inject(context, carrier)
    Propagator->>Propagator: 序列化 traceparent
    Propagator->>HTTP: 设置 traceparent header
    HTTP->>HTTP: traceparent: 00-abc123-span001-01

    Client->>Server: HTTP Request with Headers

    Server->>Propagator: extract(context, carrier)
    Propagator->>Propagator: 解析 traceparent
    Propagator-->>Server: 返回 SpanContext

    Server->>Server: 创建 Child Span<br/>parentSpanId=span001
    Server->>Server: spanId=span002
```

---

## 15. CI/CD 管道状态机

```mermaid
stateDiagram-v2
    [*] --> Source: Push/PR

    Source --> Build: 代码检出
    Build --> Test: 构建成功
    Build --> Failed: 构建失败

    Test --> Security: 单元测试通过
    Test --> Failed: 测试失败

    Security --> Package: 安全扫描通过
    Security --> Failed: 发现漏洞

    Package --> DeployStaging: 制品创建

    DeployStaging --> E2E: 部署成功
    DeployStaging --> Failed: 部署失败

    E2E --> DeployProd: E2E测试通过
    E2E --> Failed: E2E测试失败

    DeployProd --> [*]: 生产部署完成
    Failed --> [*]: 通知/回滚
```

---

## 16. 代码示例：Promise 状态机实操

```javascript
// 演示 Promise 的 Pending → Fulfilled / Rejected 状态转换
const p = new Promise((resolve, reject) => {
  console.log('executor 同步执行'); // PromiseState = "pending"
  setTimeout(() => resolve(42), 100);
});

// then() 返回新的 Promise，形成链式状态机
const p2 = p.then((value) => {
  console.log('Fulfilled:', value); // 42
  return value * 2;
});

// catch() 可将 Rejected 恢复为 Fulfilled
const p3 = Promise.reject('error')
  .catch((reason) => {
    console.log('Recovered from:', reason);
    return 'fallback';
  })
  .then((v) => console.log('Final:', v)); // "fallback"

// Promise.race vs Promise.any 的语义差异
const slow = new Promise((_, reject) => setTimeout(reject, 50, 'slow'));
const fast = new Promise((resolve) => setTimeout(resolve, 100, 'fast'));

Promise.race([slow, fast]).catch((e) => console.log('race:', e)); // "slow"（首个 settle）
Promise.any([slow, fast]).then((v) => console.log('any:', v));     // "fast"（首个 fulfilled）
```

---

## 17. 代码示例：作用域链与闭包

```javascript
// 对应「作用域链可视化」的可运行代码
function outer() {
  let outerVar = 2;

  function inner() {
    let innerVar = 3;
    // 作用域链查找：inner → outer → global
    console.log(innerVar); // 3  (inner)
    console.log(outerVar); // 2  (outer)
    console.log(globalVar); // 1 (global)
  }

  return inner;
}

let globalVar = 1;
const fn = outer();
fn(); // 闭包保留 outer 的词法环境，即使 outer 已执行完毕

// 块级作用域（ES2015+）不会进入作用域链的环境记录
function demoLet() {
  let x = 10;
  if (true) {
    let x = 20; // 独立的块级环境记录
    console.log(x); // 20
  }
  console.log(x); // 10
}
```

---

## 18. 代码示例：事件循环微任务演示

```javascript
// 验证「事件循环详细模型」的行为
console.log('1. Script start');

setTimeout(() => console.log('2. Macrotask (timeout)'), 0);

Promise.resolve().then(() => {
  console.log('3. Microtask 1');
  Promise.resolve().then(() => console.log('4. Microtask 2 (nested)'));
});

queueMicrotask(() => console.log('5. Microtask 3 (queueMicrotask)'));

console.log('6. Script end');

// 输出顺序：
// 1. Script start
// 6. Script end
// 3. Microtask 1
// 5. Microtask 3 (queueMicrotask)
// 4. Microtask 2 (nested)
// 2. Macrotask (timeout)
```

---

## 权威参考链接

- [ECMA-262 §9.2 Execution Contexts](https://tc39.es/ecma262/#sec-execution-contexts) — 执行上下文规范定义
- [ECMA-262 §27.2 Promise Objects](https://tc39.es/ecma262/#sec-promise-objects) — Promise 状态机规范
- [ECMA-262 §6.1.7.2 Object Internal Methods](https://tc39.es/ecma262/#sec-object-internal-methods-and-internal-slots) — 内部方法规范
- [V8 Blog — Ignition + TurboFan](https://v8.dev/blog/ignition-interpreter) — V8 编译管线详解
- [V8 Blog — Memory Management](https://v8.dev/blog/trash-talk) — V8 垃圾回收与内存模型
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) — 类型检查器可编程接口
- [TypeScript Handbook — Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) — 声明合并语义
- [MDN — Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop) — 事件循环模型
- [MDN — Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) — Proxy 内部方法
- [W3C Trace Context](https://www.w3.org/TR/trace-context/) — 分布式追踪上下文规范
- [OpenTelemetry JS API](https://opentelemetry.io/docs/languages/js/) — 分布式追踪实现
- [HTML Standard — Event Loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops) — 浏览器事件循环规范
- [Node.js — Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) — Node.js 事件循环官方文档

---

这些可视化图表补充了主分析文档，提供了更详细的架构和流程视角。
