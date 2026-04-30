# 执行上下文（Execution Context）

> **形式化定义**：执行上下文（Execution Context）是 ECMAScript 规范中代码执行的环境抽象，由 ECMA-262 §9.4 定义。每次函数调用或全局代码执行时创建，包含**词法环境（Lexical Environment）**、**变量环境（Variable Environment）**和**this 绑定**。执行上下文栈（Execution Context Stack，即调用栈）管理活跃上下文的 LIFO 顺序。
>
> 对齐版本：ECMAScript 2025 (ES16) §9.4 | TypeScript 5.8–6.0

---

## 1. 概念定义 (Concept Definition)

### 1.1 形式化定义

ECMA-262 §9.4 定义了执行上下文：

> *"An execution context is a specification device that is used to track the runtime evaluation of code by an ECMAScript implementation."*

执行上下文的字段：

| 字段 | 说明 |
|------|------|
| `[[LexicalEnvironment]]` | 词法环境，用于标识符解析 |
| `[[VariableEnvironment]]` | 变量环境，用于 var 声明 |
| `[[ThisBinding]]` | this 值 |
| `[[Function]]` | 当前函数对象（函数代码） |

---

## 2. 属性与特征 (Properties & Characteristics)

### 2.1 执行上下文类型矩阵

| 类型 | 创建时机 | LexicalEnvironment | this 绑定 |
|------|---------|-------------------|----------|
| 全局 | 脚本开始 | 全局环境 | globalThis |
| 函数 | 函数调用 | 函数环境 | 调用方式决定 |
| 模块 | 模块加载 | 模块环境 | undefined |
| eval | eval 调用 | 调用者环境 | 调用者 this |

---

## 3. 关系分析 (Relationship Analysis)

### 3.1 执行上下文栈

```mermaid
graph TD
    Global["全局上下文"] --> Fn1["outer()"]
    Fn1 --> Fn2["inner()"]
    Fn2 --> Fn3["deep()"]
    Fn3 --> Pop["return → 弹出"]
    Pop --> Fn2
```

---

## 4. 机制解释 (Mechanism Explanation)

### 4.1 执行上下文的创建流程

```mermaid
flowchart TD
    A[函数调用] --> B[创建执行上下文]
    B --> C[创建词法环境]
    B --> D[创建变量环境]
    B --> E[绑定 this]
    B --> F[变量实例化]
    F --> G[执行代码]
    G --> H[弹出上下文]
```

---

## 5. 论证与分析 (Argumentation & Analysis)

### 5.1 执行上下文 vs 调用栈

| 概念 | 作用 | 生命周期 |
|------|------|---------|
| 执行上下文 | 代码执行环境 | 函数执行期间 |
| 调用栈 | 上下文管理 | 程序运行期间 |
| 词法环境 | 变量存储 | 取决于闭包引用 |

---

## 6. 实例与示例 (Examples)

### 6.1 正例：执行上下文可视化

```javascript
const x = "global";

function outer() {
  const y = "outer";

  function inner() {
    const z = "inner";
    console.log(x, y, z); // 通过作用域链访问所有变量
  }

  inner();
}

outer();

// 执行上下文栈：
// 1. 全局上下文: x = "global"
// 2. outer 上下文: y = "outer"
// 3. inner 上下文: z = "inner"
```

---

## 7. 权威参考与国际化对齐 (References)

- **ECMA-262 §9.4** — Execution Contexts
- **MDN: Execution context** — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_context>

---

## 8. 思维表征总结 (Cognitive Representations)

### 8.1 执行上下文创建流程

```mermaid
flowchart TD
    Start[进入函数] --> Create[创建执行上下文]
    Create --> Lexical[创建词法环境]
    Create --> Variable[创建变量环境]
    Create --> This[确定 this 绑定]
    Create --> Init[变量实例化]
    Init --> Execute[执行函数体]
    Execute --> Pop[弹出上下文]
```

---

## 9. 更多执行上下文实例 (Advanced Examples)

### 9.1 正例：模块执行上下文的 this

```javascript
// ES 模块的顶层 this 是 undefined（严格模式默认）
// CommonJS 模块的顶层 this 指向 module.exports

// module.mjs
console.log(this); // undefined

// module.cjs
console.log(this === module.exports); // true
```

### 9.2 正例：eval 的执行上下文继承

```javascript
const x = 'global';

function outer() {
  const x = 'outer';
  eval('console.log(x)'); // "outer" — 继承调用者的词法环境

  // 间接 eval（如 (0, eval)('...')）使用全局环境
  const indirect = eval;
  indirect('console.log(x)'); // "global"（在浏览器中）或 ReferenceError（Node.js ESM）
}

outer();
```

### 9.3 正例：Realm 与 iframe 的执行上下文隔离

```javascript
// 不同 Realm 具有独立的 globalThis 和内置对象
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);

const iframeWindow = iframe.contentWindow;
console.log(iframeWindow.Array === Array); // false（不同 Realm）

// 跨 Realm 的 instanceof 检查会失败
const arr = new iframeWindow.Array();
console.log(arr instanceof Array); // false
console.log(Array.isArray(arr));   // true（推荐方式）
```

### 9.4 正例：AsyncContext (Stage 2) 的异步上下文传播

```javascript
// TC39 Async Context 提案（Stage 2）用于在异步调用中保持上下文
// 类似 AsyncLocalStorage 的规范级版本
// https://github.com/tc39/proposal-async-context

// Node.js AsyncLocalStorage（当前可用的实现）
import { AsyncLocalStorage } from 'node:async_hooks';

const storage = new AsyncLocalStorage();

storage.run({ userId: 42 }, () => {
  setTimeout(() => {
    console.log(storage.getStore()); // { userId: 42 }
  }, 0);
});
```

### 9.5 正例：Node.js vm 模块与独立上下文

```javascript
import { createContext, runInContext } from 'node:vm';

// 创建独立的执行上下文（新的全局环境）
const context = createContext({
  console,
  require,
  module: { exports: {} },
  global: {},
  customVar: 100
});

const code = `
  exports.result = customVar + 1;
  typeof Array; // 与宿主 Array 不同原型链
`;

runInContext(code, context);
console.log(context.module.exports.result); // 101
```

---

## 10. 权威参考与国际化对齐 (References)

- **ECMA-262 §9.4** — Execution Contexts: <https://tc39.es/ecma262/#sec-execution-contexts>
- **ECMA-262 §9.2** — ECMAScript Code Execution Contexts: <https://tc39.es/ecma262/#sec-execution-contexts>
- **MDN: Execution context** — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_context>
- **MDN: Realm** — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Realm>
- **Node.js: vm module** — <https://nodejs.org/api/vm.html>
- **Node.js: AsyncLocalStorage** — <https://nodejs.org/api/async_context.html>
- **TC39: Async Context Proposal** — <https://github.com/tc39/proposal-async-context>
- **TC39: ShadowRealm** — <https://github.com/tc39/proposal-shadowrealm>
- **V8 Blog: Understanding V8 Bytecode** — <https://v8.dev/blog/understanding-v8-bytecode>
- **HTML Living Standard §8.1.4.2** — Event loops: <https://html.spec.whatwg.org/multipage/webappapis.html#event-loops>

---

**参考规范**：ECMA-262 §9 | MDN | TC39 Proposals | Node.js Docs
