# 调用栈（Call Stack）

> 函数调用追踪机制与栈溢出防护
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 调用栈基础

调用栈是 JavaScript 引擎用于追踪函数调用的数据结构（后进先出 LIFO）：

```javascript
function a() { b(); }
function b() { c(); }
function c() { console.trace(); }

a();
// 输出：
// c
// b
// a
// (anonymous)
```

---

## 2. 栈溢出（Stack Overflow）

当调用栈超过引擎限制时，抛出 `RangeError`：

```javascript
function infinite() {
  infinite(); // RangeError: Maximum call stack size exceeded
}
```

### 2.1 栈大小限制

| 环境 | 大致限制 |
|------|---------|
| Chrome/V8 | ~10,000–50,000 帧 |
| Firefox | ~10,000–20,000 帧 |
| Node.js | 默认 ~984 KB（可调 `--stack-size`） |

### 2.2 尾调用优化（TCO）

ES6 规范了尾调用优化，但大多数引擎未实现：

```javascript
// 尾调用（最后操作是函数调用）
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc); // 尾调用
}

// 如果 TCO 实现，不会增加栈深度
// 但当前 V8/SpiderMonkey 等未实现，仍可能溢出
```

### 2.3 循环替代递归

```javascript
// 递归（可能溢出）
function sumRecursive(arr) {
  if (arr.length === 0) return 0;
  return arr[0] + sumRecursive(arr.slice(1));
}

// 循环（安全）
function sumIterative(arr) {
  let sum = 0;
  for (const n of arr) sum += n;
  return sum;
}
```

---

## 3. 调试调用栈

### 3.1 console.trace()

```javascript
function process() {
  validate();
}

function validate() {
  console.trace("Validation called");
}

process();
```

### 3.2 Error.stack

```javascript
try {
  throw new Error("Sample error");
} catch (e) {
  console.log(e.stack);
}
```

---

**参考规范**：ECMA-262 §9.4 Execution Contexts
