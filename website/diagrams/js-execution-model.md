---
title: JavaScript 执行模型与 ECMA-262 规范对应
description: "JavaScript 代码执行到引擎实现的完整映射，含执行上下文、环境记录与 Realm 的关系"
---

# JavaScript 执行模型与 ECMA-262 规范对应

> 本文档将 JavaScript 代码的执行流程与 ECMA-262 规范中的抽象概念进行映射，帮助理解代码在引擎中的实际运行方式。

## 执行模型全景

```mermaid
flowchart TB
    subgraph 规范层 ECMA-262
        A[执行上下文<br/>Execution Context] --> B[词法环境<br/>Lexical Environment]
        B --> C[环境记录<br/>Environment Record]
        C --> D[声明性记录<br/>Declarative ER]
        C --> E[对象性记录<br/>Object ER]
        A --> F[Realm]
        F --> G[全局对象]
        F --> H[内部库]
    end
    subgraph 实现层 V8
        I[调用栈] --> J[栈帧]
        J --> K[局部变量]
        J --> L[this指针]
        M[堆] --> N[闭包变量]
        M --> O[对象与原型]
    end
    A -.->|实现| I
    C -.->|实现| K
    F -.->|实现| O
```

## 执行上下文栈

```mermaid
flowchart TB
    subgraph 调用栈
        A[全局执行上下文] --> B[foo()]
        B --> C[bar()]
        C --> D[baz()]
    end
    subgraph 每个上下文的组成
        E[词法环境] --> F[变量环境]
        E --> G[this绑定]
        F --> H[环境记录]
        H --> I[Outer引用]
    end
```

### 执行上下文的创建过程

```javascript
// 代码执行前的准备阶段
function example() &#123;
  let local = 1;      // 在词法环境中创建绑定
  const fixed = 2;    // 创建不可变绑定
  function inner() &#123;&#125; // 创建函数对象并初始化
&#125;

// 执行上下文的三个阶段：
// 1. 创建阶段：建立词法环境，提升变量/函数声明
// 2. 执行阶段：逐行执行代码
// 3. 销毁阶段：弹出调用栈（闭包变量保留在堆中）
```

## Realm 与全局对象

Realm 是 ECMA-262 中的独立执行环境，每个 Realm 有自己的全局对象：

```mermaid
flowchart LR
    subgraph Realm A
        A1[windowA] --> A2[ArrayA]
        A1 --> A3[JSONA]
    end
    subgraph Realm B
        B1[windowB] --> B2[ArrayB]
        B1 --> B3[JSONB]
    end
    A2 -.x.-> B2
    A1 -.->|iframe| B1
```

```javascript
// 不同 Realm 的数组构造函数不同
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);

const iframeArray = iframe.contentWindow.Array;
console.log(Array === iframeArray); // false

const arr = [];
console.log(arr instanceof Array); // true
console.log(arr instanceof iframeArray); // false
```

## 闭包的规范解释

```mermaid
flowchart TB
    subgraph 闭包机制
        A[外部函数] --> B[创建环境记录]
        B --> C[内部函数]
        C --> D[引用外部变量]
        D --> E[环境记录保留在堆中]
        F[外部函数返回] --> G[调用栈弹出]
        G -.->|但| E
    end
```

```javascript
function createCounter() &#123;
  let count = 0; // 环境记录中的绑定
  return &#123;
    increment: () => ++count,
    getValue: () => count,
  &#125;;
&#125;

const counter = createCounter();
// createCounter 的执行上下文已弹出，但环境记录被闭包引用保留
```

## 参考资源

- [执行模型导读](/fundamentals/execution-model) — V8 引擎架构深度解析
- [ECMAScript 规范导读](/fundamentals/ecmascript-spec) — 抽象操作与完成记录

---

 [← 返回架构图首页](./)
