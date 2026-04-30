# 完成记录与异常传播机制

> **定位**：`10-fundamentals/10.6-ecmascript-spec/`
> **规范来源**：ECMA-262 §6.2.4 Completion Records | §13 Try/Catch 语句

---

## 完成记录的结构

ECMA-262 将**所有语句和表达式的求值结果**抽象为 Completion Record，这是规范层面的统一返回类型：

```
Completion Record {
  [[Type]]: normal | break | continue | return | throw,
  [[Value]]: any | empty,
  [[Target]]: String | empty
}
```

| 字段 | 类型 | 语义 |
|------|------|------|
| `[[Type]]` | normal / break / continue / return / throw | 完成类型，决定传播行为 |
| `[[Value]]` | any / empty | 关联值；`empty` 表示无显式值 |
| `[[Target]]` | String / empty | `break`/`continue` 的目标标签 |

---

## 类型语义

| [[Type]] | 触发场景 | 传播行为 |
|---------|---------|---------|
| `normal` | 正常执行 | 继续下一步 |
| `break` | `break` 语句 | 跳出最近的循环/switch |
| `continue` | `continue` 语句 | 跳到最近的循环迭代 |
| `return` | `return` 语句 | 从函数返回 |
| `throw` | `throw` 语句 | 沿调用栈传播，直到 try-catch |

---

## ReturnIfAbrupt 模式

```
// 伪代码模式（ECMA-262 §5.2.3）
1. 令 result 为 AbstractOperation()
2. 若 result 是 abrupt completion，返回 result
3. 令 value 为 result.[[Value]]
4. // 继续使用 value
```

规范中使用 `? Operation()` 作为此模式的简写，`! Operation()` 表示断言结果必为 normal completion。

---

## 代码示例：try/catch/finally 的规范级行为

```javascript
// ============================================
// 示例 1：finally 覆盖 return 值（规范级解释）
// ============================================

function demoFinally() {
  try {
    return 'try-return';   // 生成 Return Completion Record
  } finally {
    return 'finally-return'; // 新的 Return Completion 覆盖前者！
  }
}

console.log(demoFinally()); // "finally-return"

// 规范视角：
// 1. try 体执行结束，产生 { [[Type]]: return, [[Value]]: 'try-return' }
// 2. finally 体执行，产生 { [[Type]]: return, [[Value]]: 'finally-return' }
// 3. 后者覆盖前者（ECMA-262 §13.15.8 Runtime Semantics: Evaluation）
// 4. 函数最终返回 'finally-return'

// ============================================
// 示例 2：finally 中 throw 覆盖 return
// ============================================

function demoFinallyThrow() {
  try {
    return 'safe-value';
  } finally {
    throw new Error('finally-error'); // throw completion 覆盖 return
  }
}

try {
  console.log(demoFinallyThrow());
} catch (e) {
  console.log(e.message); // "finally-error" —— return 值丢失！
}

// ============================================
// 示例 3：catch 块不捕获同 try 中 throw 的 Completion？
// 不——catch 捕获 try 中的 throw，finally 总是执行
// ============================================

function executionOrder() {
  const log = [];
  try {
    log.push('try-start');
    throw new Error('boom');     // 产生 throw completion
    log.push('try-end');         // 永不到达
  } catch (e) {
    log.push('catch');           // 捕获 throw，转为 normal completion
    // catch 无 return/throw → 产生 normal completion
  } finally {
    log.push('finally');         // 总是执行，无论前面是什么 completion
  }
  log.push('after');
  return log;
}

console.log(executionOrder());
// ['try-start', 'catch', 'finally', 'after']

// ============================================
// 示例 4：嵌套 try-catch 的 Completion 传播链
// ============================================

function inner() {
  try {
    throw new Error('deep');
  } finally {
    console.log('inner-finally'); // 总是执行
  }
}

function outer() {
  try {
    inner();
  } catch (e) {
    console.log('outer-catch:', e.message);
    return 'recovered';
  } finally {
    console.log('outer-finally');
  }
}

console.log('result:', outer());
// inner-finally
// outer-catch: deep
// outer-finally
// result: recovered

// 规范视角的传播链：
// inner(): throw completion { [[Type]]: throw, [[Value]]: Error('deep') }
//   → inner 无 catch，throw completion 传播到 outer 的 try 体
//   → outer 的 catch 捕获，转为 normal，然后 return 'recovered'
//   → outer 的 finally 执行
//   → outer 返回 'recovered'

// ============================================
// 示例 5：break + finally 的交互（标签语句）
// ============================================

outerLoop: for (let i = 0; i < 3; i++) {
  innerLoop: for (let j = 0; j < 3; j++) {
    try {
      if (i === 1 && j === 1) {
        break outerLoop; // Break Completion { [[Target]]: 'outerLoop' }
      }
      console.log(`  [${i},${j}]`);
    } finally {
      console.log(`finally [${i},${j}]`); // break 前也会执行 finally！
    }
  }
}
// [0,0] finally [0,0]
// [0,1] finally [0,1]
// ...
// [1,0] finally [1,0]
// [1,1] finally [1,1]  ← break outerLoop 触发，但 finally 先执行
// (循环终止)
```

---

## 代码示例：规范中的 `?` 与 `!` 记法模拟

ECMA-262 §5.2.3.1 使用 `?` 表示 ReturnIfAbrupt，`!` 表示断言 normal completion。以下用 JavaScript 模拟这一模式：

```javascript
// ============================================
// 模拟 ReturnIfAbrupt (?) 和 AssertNormal (!)
// ============================================

// Completion Record 工厂
function NormalCompletion(value) {
  return { type: 'normal', value, target: undefined };
}
function ThrowCompletion(value) {
  return { type: 'throw', value, target: undefined };
}
function ReturnCompletion(value) {
  return { type: 'return', value, target: undefined };
}
function BreakCompletion(target) {
  return { type: 'break', value: undefined, target };
}

// 模拟 ? Operation() —— ReturnIfAbrupt
function abruptCheck(completion) {
  if (completion.type !== 'normal') {
    // 规范行为：直接返回当前 completion，中止后续执行
    throw { __isAbrupt: true, completion };
  }
  return completion.value;
}

// 模拟 ! Operation() —— AssertNormal
function assertNormal(completion) {
  if (completion.type !== 'normal') {
    throw new Error('AssertNormal failed: expected normal completion');
  }
  return completion.value;
}

// 包装执行环境，自动处理 abrupt completion 传播
function runWithAbruptHandling(fn) {
  try {
    return fn();
  } catch (e) {
    if (e && e.__isAbrupt) return e.completion;
    throw e;
  }
}

// 示例：模拟属性访问的抽象操作
function getV(obj, prop) {
  return runWithAbruptHandling(() => {
    // ? ToObject(obj)
    const O = abruptCheck(obj === null || obj === undefined
      ? ThrowCompletion(new TypeError('Cannot convert undefined to object'))
      : NormalCompletion(Object(obj)));

    // ! Get(O, prop)
    const result = assertNormal(NormalCompletion(O[prop]));
    return NormalCompletion(result);
  });
}

console.log(getV({ a: 1 }, 'a')); // { type: 'normal', value: 1, ... }
console.log(getV(null, 'a'));     // { type: 'throw', value: TypeError }
```

---

## 代码示例：Generator 的 Completion Record 语义

Generator 函数内部使用 Yield 产生暂停点，其完成语义与常规函数不同：

```javascript
// ============================================
// Generator 的完成状态机
// ============================================

function* gen() {
  yield 1;           // 产生 { value: 1, done: false }
  yield 2;           // 产生 { value: 2, done: false }
  return 'done';     // 产生 { value: 'done', done: true }
}

const g = gen();
console.log(g.next());  // { value: 1, done: false }
console.log(g.next());  // { value: 2, done: false }
console.log(g.next());  // { value: 'done', done: true }
console.log(g.next());  // { value: undefined, done: true } ← 已关闭

// ============================================
// throw() 向 generator 注入 throw completion
// ============================================

function* resilientGen() {
  try {
    yield 'A';
  } catch (e) {
    yield `Recovered: ${e.message}`;
  }
  yield 'B';
}

const r = resilientGen();
console.log(r.next());           // { value: 'A', done: false }
console.log(r.throw(new Error('boom'))); // { value: 'Recovered: boom', done: false }
console.log(r.next());           // { value: 'B', done: false }

// ============================================
// return() 向 generator 注入 return completion
// ============================================

function* resourceGen() {
  try {
    yield 'resource-1';
    yield 'resource-2';
  } finally {
    console.log('Cleanup executed'); // 模拟资源释放
  }
}

const res = resourceGen();
console.log(res.next());    // { value: 'resource-1', done: false }
console.log(res.return('early-exit')); // Cleanup executed → { value: 'early-exit', done: true }
```

---

## 代码示例：for-await-of 与异步迭代器的 Completion

```javascript
// ============================================
// 异步迭代器的完成语义
// ============================================

async function* asyncGen() {
  try {
    yield await Promise.resolve(1);
    yield await Promise.resolve(2);
  } finally {
    console.log('Async generator cleanup');
  }
}

(async () => {
  // break 会触发异步迭代器的 return()，执行 finally
  for await (const x of asyncGen()) {
    console.log(x);
    if (x === 1) break; // 触发异步 return completion
  }
  // 输出：1 → Async generator cleanup
})();

// ============================================
// 显式调用 AsyncIterator.return()
// ============================================

(async () => {
  const it = asyncGen();
  console.log(await it.next());   // { value: 1, done: false }
  console.log(await it.return('end')); // Async generator cleanup → { value: 'end', done: true }
})();
```

---

## Completion 类型状态转移图

```
          +---------+
          |  Start  |
          +----+----+
               |
               v
          +---------+      throw       +---------+
     +----|  Normal |----------------->|  Throw  |----+
     |    +---------+                  +---------+    |
     |         |                            |         |
     |    break/continue               catch 块捕获   |
     |    (带 Target)                       |         |
     |         v                            v         |
     |    +---------+                  +---------+    |
     +--->|  Break  |                  |  Normal |<---+
          | Continue|                  +---------+
          +---------+
               |
               | return
               v
          +---------+
          | Return  |
          +---------+
               |
               | finally 覆盖
               v
          新的 Return / Throw
```

---

## 关键规范条款速查

| 条款 | 内容 | 位置 |
|------|------|------|
| **Completion Record 定义** | `[[Type]]`/`[[Value]]`/`[[Target]]` | ECMA-262 §6.2.4 |
| **UpdateEmpty** | 将 `empty` 值替换为指定值 | §6.2.4.2 |
| **ReturnIfAbrupt** | `?` / `!` 记法 | §5.2.3.1 |
| **TryStatement Evaluation** | try-catch-finally 求值算法 | §13.15.8 |
| **ThrowStatement** | `throw` 生成 throw completion | §13.16 |
| **Generator Start/Resume** | Generator 状态机与 completion | §27.5.3 |
| **AsyncGeneratorStart** | 异步生成器的完成语义 | §27.6.3 |
| **ForIn/OfHeadEvaluation** | 迭代循环的 completion 处理 | §14.7.5.3 |

---

## 权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| **ECMA-262 §6.2.4** | Completion Record 规范定义 | [tc39.es/ecma262/#sec-completion-record-specification-type](https://tc39.es/ecma262/#sec-completion-record-specification-type) |
| **ECMA-262 §13.15** | Try/Catch/Finally 语句语义 | [tc39.es/ecma262/#sec-try-statement](https://tc39.es/ecma262/#sec-try-statement) |
| **ECMA-262 §5.2.3** | ReturnIfAbrupt 与简写记法 | [tc39.es/ecma262/#sec-returnifabrupt](https://tc39.es/ecma262/#sec-returnifabrupt) |
| **ECMA-262 §27.5** | Generator 函数规范 | [tc39.es/ecma262/#sec-generator-function-definitions](https://tc39.es/ecma262/#sec-generator-function-definitions) |
| **MDN: try...catch** | 开发者友好的 try/catch 指南 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) |
| **MDN: Iteration protocols** | 迭代器/生成器协议 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) |
| **2ality: Exception handling in JS** | Dr. Axel Rauschmayer 深度解析 | [2ality.com/2017/01/try-catch-finally.html](https://2ality.com/2017/01/try-catch-finally.html) |
| **V8 Blog: Understanding Exceptions** | 引擎层面异常处理实现 | [v8.dev/blog](https://v8.dev/blog) |
| **MDN: return statement in try...catch...finally** | return 与 finally 的交互 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch#the_finally_block](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch#the_finally_block) |
| **TC39 Notes: Completion Records** | 规范会议记录与设计动机 | [github.com/tc39/ecma262/issues/2558](https://github.com/tc39/ecma262/issues/2558) |

---

*本文件为规范基础专题的完成记录深度分析，已增强规范视角代码示例。*
