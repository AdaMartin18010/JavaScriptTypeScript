# 同步执行流

> 同步代码的调用栈可视化与执行顺序分析
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 同步执行基础

JavaScript 是**单线程**执行模型，同步代码按顺序逐行执行：

```javascript
console.log("1");
console.log("2");
console.log("3");
// 输出：1, 2, 3
```

---

## 2. 调用栈可视化

```javascript
function a() {
  console.log("a");
  b();
}

function b() {
  console.log("b");
  c();
}

function c() {
  console.log("c");
}

a();
```

调用栈变化：

```
Step 1: [main, a]
Step 2: [main, a, b]
Step 3: [main, a, b, c]
Step 4: [main, a, b]    (c returns)
Step 5: [main, a]        (b returns)
Step 6: [main]           (a returns)
```

---

## 3. 执行顺序分析

### 3.1 表达式求值顺序

```javascript
const result = foo() + bar() * baz();
// 求值顺序：foo() → bar() → baz() → * → +
```

### 3.2 运算符优先级与结合性

```javascript
const x = 1 + 2 * 3;      // 7（* 优先级 > +）
const y = (1 + 2) * 3;    // 9

const z = a = b = c = 1;  // 右结合：a = (b = (c = 1))
```

### 3.3 短路求值的执行流

```javascript
const result = true || anything();   // anything() 不会执行
const result2 = false && anything(); // anything() 不会执行

// 逗号运算符
const x = (1, 2, 3); // 3（返回最后一个值）
```

---

## 4. 异常对执行流的影响

### 4.1 throw 时的栈展开

```javascript
function c() { throw new Error("Oops"); }
function b() { c(); }
function a() { b(); }

try {
  a();
} catch (e) {
  console.log(e.stack);
  // Error: Oops
  //   at c (...)
  //   at b (...)
  //   at a (...)
}
```

### 4.2 try/catch/finally 的执行顺序

```javascript
function test() {
  try {
    console.log("try");
    throw new Error("err");
  } catch (e) {
    console.log("catch");
  } finally {
    console.log("finally");
  }
}
// 输出：try → catch → finally
```

### 4.3 finally 中的 return

```javascript
function test() {
  try {
    return "try";
  } finally {
    return "finally"; // 覆盖 try 的返回值
  }
}
console.log(test()); // "finally"
```

---

## 5. 调试技巧

### 5.1 debugger 语句

```javascript
function complex() {
  const a = 1;
  debugger; // 执行到这里会暂停（如果 DevTools 打开）
  const b = a + 2;
  return b;
}
```

### 5.2 断点与单步执行

- **Step Over (F10)**：执行当前行，不进入函数内部
- **Step Into (F11)**：进入函数内部
- **Step Out (Shift+F11)**：执行完当前函数并跳出

---

**参考规范**：ECMA-262 §9.4 Execution Contexts
