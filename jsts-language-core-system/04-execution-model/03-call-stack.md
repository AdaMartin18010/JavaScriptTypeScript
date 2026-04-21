# 调用栈（Call Stack）

> 函数调用追踪机制、栈溢出与尾调用优化
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 调用栈基础

调用栈是 JavaScript 引擎用于追踪函数调用的**后进先出（LIFO）**数据结构：

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

ES6 规范了尾调用优化，但**大多数引擎未实现**：

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

// 尾递归优化（Trampoline）
function trampoline(fn) {
  return function(...args) {
    let result = fn.apply(this, args);
    while (typeof result === "function") {
      result = result();
    }
    return result;
  };
}
```

---

## 3. 异步与调用栈

异步回调不在原始调用栈中执行：

```javascript
function asyncOperation() {
  setTimeout(() => {
    console.log("Async callback");
    console.trace(); // 调用栈从 setTimeout 回调开始
  }, 0);
}

asyncOperation();
// 异步回调的调用栈不包含 asyncOperation
```

**async/await 的调用栈**：现代引擎已优化，async/await 的调用栈可以跨异步边界：

```javascript
async function level1() {
  await level2();
}

async function level2() {
  await level3();
}

async function level3() {
  console.trace(); // Chrome 显示完整的 async 调用链
}

level1();
```

---

## 4. 调试技巧

### 4.1 console.trace()

```javascript
function process() {
  validate();
}

function validate() {
  console.trace("Validation called");
}

process();
```

### 4.2 Error.stack

```javascript
try {
  throw new Error("Sample error");
} catch (e) {
  console.log(e.stack);
}
```

### 4.3 Chrome DevTools

- **Performance 面板**：记录火焰图，查看长任务
- **Sources 面板**：设置断点，单步调试
- **async stack traces**：在 DevTools Settings 中启用

---

## 5. 调用栈与性能

```javascript
// 深层嵌套调用栈影响性能
function deeplyNested(n) {
  if (n <= 0) return n;
  return deeplyNested(n - 1) + 1;
}

// 调用栈过深会导致：
// 1. 内存占用增加
// 2. 垃圾回收压力
// 3. 调试困难
```

---

## 6. 尾调用优化（TCO）现状

```javascript
// ES6 规范了尾调用优化，但引擎未广泛实现
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc); // 尾调用
}

// 替代方案：循环
function factorialIter(n) {
  let acc = 1;
  for (let i = 2; i <= n; i++) acc *= i;
  return acc;
}
```

| 引擎 | TCO 支持 |
|------|---------|
| V8 (Chrome/Node) | ❌ 已移除实验性支持 |
| SpiderMonkey (Firefox) | ❌ |
| JavaScriptCore (Safari) | ❌ |

---

**参考规范**：ECMA-262 §9.4 Execution Contexts

## 扩展话题：相关规范与实现细节

### 规范引用

ECMA-262 规范详细定义了本节所有机制。关键章节包括：
- §6.2.3 Completion Record 规范
- §9.1 Environment Records
- §9.4 Execution Contexts
- §10.2.1.1 OrdinaryCallBindThis

### 引擎实现差异

| 引擎 | 相关实现 |
|------|---------|
| V8 (Chrome/Node) | 快速属性访问、隐藏类优化 |
| SpiderMonkey (Firefox) | 形状(shape)系统、基线编译器 |
| JavaScriptCore (Safari) | DFG/FTL 编译器、类型推断 |

### 调试技巧

`javascript
// 使用 Chrome DevTools 检查内部状态
debugger; // 在 Sources 面板查看 Scope 链

// 使用 console.trace() 查看调用栈
function deep() {
  console.trace("Current stack");
}
`

### 常见面试题

1. 解释暂时性死区(TDZ)及其产生原因
2. var/let/const 的区别是什么？
3. 函数声明和函数表达式的提升行为有何不同？
4. 解释 this 的四种绑定规则
5. 什么是闭包？它如何工作？

### 推荐阅读

- ECMA-262 规范官方文档
- TypeScript Handbook
- You Don't Know JS (Kyle Simpson)
- JavaScript: The Definitive Guide

## 深入理解：内存模型与性能

### 内存布局

JavaScript 引擎在内存中组织对象和变量：

`
栈内存（Stack）：
  - 原始值（number, string, boolean等）
  - 函数调用帧
  - 局部变量引用

堆内存（Heap）：
  - 对象
  - 函数闭包
  - 大型数据结构
`

### V8 优化技术

| 技术 | 描述 |
|------|------|
| 隐藏类 | 为对象创建内部形状描述 |
| 内联缓存 | 缓存属性查找位置 |
| 标量替换 | 将小对象分解为局部变量 |
| 逃逸分析 | 确定对象是否离开作用域 |

### 性能基准

`javascript
// 快速属性访问（单态）
obj.x; // 优化：直接偏移访问

// 多态属性访问
if (condition) obj = { x: 1 }; else obj = { x: 2, y: 3 };
obj.x; // 降级：字典查找
`

### 垃圾回收影响

`javascript
// 减少 GC 压力
function process() {
  const data = new Array(1000000);
  // 使用 data...
  // 函数返回后，data 可被回收
}

// 避免内存泄漏
let cache = {};
// 定期清理或使用 WeakMap
`

### 最佳实践总结

1. **优先使用 const**：不可变性帮助引擎优化
2. **避免动态属性**：稳定结构利于隐藏类
3. **减少嵌套深度**：浅层作用域链查找更快
4. **使用箭头函数**：减少 this 绑定开销
5. **缓存频繁访问**：将深层属性提取到局部变量
