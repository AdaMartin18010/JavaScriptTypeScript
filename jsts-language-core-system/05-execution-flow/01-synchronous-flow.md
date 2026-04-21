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

## 5. 块级作用域与同步执行

```javascript
{
  const x = 1;
  let y = 2;
  console.log(x + y); // 3
}
// x 和 y 在此处不可访问
```

---

## 6. 调试技巧

### 6.1 debugger 语句

```javascript
function complex() {
  const a = 1;
  debugger; // 执行到这里会暂停（如果 DevTools 打开）
  const b = a + 2;
  return b;
}
```

### 6.2 断点与单步执行

- **Step Over (F10)**：执行当前行，不进入函数内部
- **Step Into (F11)**：进入函数内部
- **Step Out (Shift+F11)**：执行完当前函数并跳出

---

## 7. 同步阻塞的代价

```javascript
// 同步阻塞代码会冻结 UI
function heavyComputation() {
  const start = Date.now();
  while (Date.now() - start < 5000) {
    // 阻塞 5 秒
  }
}
// 在浏览器中会冻结页面，在 Node.js 中会阻塞事件循环
```

## 8. 严格模式对执行流的影响

```javascript
"use strict";

function test() {
  // this 不再指向全局对象
  console.log(this); // undefined
}

test();
```

严格模式改变了几种执行行为：

- 禁止隐式全局变量创建
- `this` 不自动装箱
- 禁止 `with` 语句
- 禁止重复参数名

## 9. 执行上下文栈（Call Stack）

```javascript
function a() { b(); }
function b() { c(); }
function c() {
  console.trace();
  // c
  // b
  // a
  // (anonymous)
}

a();
```

每个函数调用创建一个新的**执行上下文**，压入调用栈。

## 10. 同步 vs 异步的边界

```javascript
console.log("A");              // 同步
setTimeout(() => console.log("B"), 0); // 异步，加入任务队列
Promise.resolve().then(() => console.log("C")); // 微任务
console.log("D");              // 同步

// 输出：A → D → C → B
```

同步代码总是在异步代码之前完成。

---

**参考规范**：ECMA-262 §9.4 Execution Contexts

## 深入理解：引擎实现与优化

### V8 引擎视角

V8 是 Chrome 和 Node.js 使用的 JavaScript 引擎，其内部实现直接影响本节讨论的机制：

| 组件 | 功能 |
|------|------|
| Ignition | 解释器，生成字节码 |
| Sparkplug | 基线编译器，快速生成本地代码 |
| Maglev | 中层优化编译器，SSA 形式优化 |
| TurboFan | 顶层优化编译器，Sea of Nodes |

### 隐藏类与形状

```javascript
// V8 为相同结构的对象创建隐藏类
const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };
// p1 和 p2 共享同一个隐藏类

// 动态添加属性会创建新隐藏类
p1.z = 3; // 降级为字典模式
```

### 内联缓存（Inline Cache）

```javascript
function getX(obj) {
  return obj.x; // V8 缓存属性偏移
}

getX({ x: 1 }); // 单态（monomorphic）
getX({ x: 2 }); // 同类型，快速路径
```

### 性能提示

1. 对象初始化时声明所有属性
2. 避免动态删除属性
3. 数组使用连续数字索引
4. 函数参数类型保持一致

### 相关工具

- Chrome DevTools Performance 面板
- Node.js `--prof` 和 `--prof-process`
- V8 flags: `--trace-opt`, `--trace-deopt`
