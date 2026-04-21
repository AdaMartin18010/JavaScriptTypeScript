# 变量提升

> var/function/let/const 的提升机制差异与底层实现
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 提升的本质

提升是 JavaScript 在**编译阶段**将变量和函数声明移动到作用域顶部的行为：

```javascript
// 源代码
console.log(a);
var a = 1;

// 编译后（概念）
var a;           // 声明提升
console.log(a);  // undefined
a = 1;           // 赋值留在原地
```

---

## 2. 不同声明的提升行为

### 2.1 var 的提升

```javascript
console.log(x); // undefined
var x = 5;

// 等价于
var x;
console.log(x); // undefined
x = 5;
```

### 2.2 函数声明的提升

```javascript
sayHello(); // ✅ "Hello!"

function sayHello() {
  console.log("Hello!");
}

// 整个函数体都被提升
```

### 2.3 函数表达式的差异

```javascript
// 函数表达式不会被提升
greet(); // ❌ TypeError: greet is not a function

var greet = function() {
  console.log("Hi!");
};

// 等价于
var greet;
greet(); // greet 是 undefined
greet = function() { ... };
```

### 2.4 let/const 的 TDZ

```javascript
console.log(y); // ❌ ReferenceError
let y = 10;

// let 的声明被提升，但进入 TDZ（暂时性死区）
// 在赋值之前访问会报错
```

---

## 3. 提升的优先级

```javascript
var foo = 1;
function foo() {}

console.log(typeof foo); // "number"

// 实际执行顺序：
// 1. 函数声明提升：function foo() {}
// 2. 变量声明提升：var foo（被忽略，已声明）
// 3. 执行：foo = 1（覆盖函数）
```

**优先级**：函数声明 > 变量声明

---

## 4. 块级作用域中的提升

```javascript
var x = "global";

function test() {
  console.log(x); // undefined（不是 "global"！）
  var x = "local";
}

test();
```

`var` 提升到函数作用域顶部，遮蔽了全局变量。

### 4.1 let 的块级提升

```javascript
let x = "outer";
{
  console.log(x); // ❌ ReferenceError（TDZ）
  let x = "inner";
}
```

`let` 提升到块级作用域顶部，但处于 TDZ。

---

## 5. 类声明的提升

```javascript
const obj = new MyClass(); // ❌ ReferenceError

class MyClass {}

// 类声明类似 let，有 TDZ
```

---

## 6. 提升与执行上下文

```javascript
// 全局执行上下文创建时
// 1. 创建全局对象
// 2. 创建全局环境记录
// 3. 绑定函数声明
// 4. 绑定 var 声明（值为 undefined）
// 5. 绑定 let/const 声明（未初始化，TDZ）

// 函数执行上下文创建时
// 1. 创建词法环境
// 2. 绑定 arguments 对象
// 3. 绑定函数参数
// 4. 绑定函数声明
// 5. 绑定 var 声明
// 6. 绑定 let/const 声明（TDZ）
```

---

## 7. 最佳实践

```javascript
// ✅ 在作用域顶部声明
function good() {
  const a = 1;
  let b = 2;
  const c = 3;
  
  // 使用...
}

// ✅ 优先使用函数声明（整体提升，可预测）
function helper() { /* ... */ }

// ❌ 避免依赖提升
function bad() {
  console.log(x); // 不要这样
  var x = 1;
}

// ✅ 使用 let/const 避免意外提升
function better() {
  // x 在声明前不可用，更安全
  let x = 1;
  console.log(x);
}
```

---

## 8. 常见面试题

```javascript
// 问题 1
function test() {
  console.log(a); // undefined
  console.log(b); // ReferenceError
  var a = 1;
  let b = 2;
}

// 问题 2
var foo = 1;
function foo() {}
console.log(typeof foo); // "number"

// 问题 3
function bar() {
  return foo;
  var foo = 1;
}
console.log(bar()); // undefined
```

---

**参考规范**：ECMA-262 §9.4 Execution Contexts | ECMA-262 §14.3.1.2 Hoistable Declaration

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
