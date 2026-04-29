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

---

## 权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| **ECMA-262 §6.2.4** | Completion Record 规范定义 | [tc39.es/ecma262/#sec-completion-record-specification-type](https://tc39.es/ecma262/#sec-completion-record-specification-type) |
| **ECMA-262 §13.15** | Try/Catch/Finally 语句语义 | [tc39.es/ecma262/#sec-try-statement](https://tc39.es/ecma262/#sec-try-statement) |
| **MDN: try...catch** | 开发者友好的 try/catch 指南 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) |
| **2ality: Exception handling in JS** | Dr. Axel Rauschmayer 深度解析 | [2ality.com/2017/01/try-catch-finally.html](https://2ality.com/2017/01/try-catch-finally.html) |
| **V8 Blog: Understanding Exceptions** | 引擎层面异常处理实现 | [v8.dev/blog](https://v8.dev/blog) |

---

*本文件为规范基础专题的完成记录深度分析，已增强规范视角代码示例。*
