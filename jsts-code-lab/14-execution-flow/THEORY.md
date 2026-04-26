# 执行流 — 理论基础

## 1. 调用栈（Call Stack）

JavaScript 使用单线程调用栈管理函数调用：

- 每次函数调用压入栈帧（包含参数、局部变量、返回地址）
- 函数返回时弹出栈帧
- 栈溢出: 递归过深或循环引用导致 `RangeError: Maximum call stack size exceeded`

## 2. 执行上下文栈

```
全局上下文
  ├── 函数A上下文
  │     ├── 函数B上下文
  │     └── 返回函数A
  └── 返回全局
```

每个执行上下文包含：

- **变量环境（Variable Environment）**: var 声明、函数声明
- **词法环境（Lexical Environment）**: let/const 声明、块级作用域
- **this 绑定**: 由调用方式决定

## 3. 事件循环（Event Loop）

```
调用栈 → 清空 → 检查微任务队列 → 清空 → 检查宏任务队列 → 取出一个执行
```

- **宏任务（Macrotask）**: setTimeout、setInterval、I/O、UI 渲染
- **微任务（Microtask）**: Promise.then、MutationObserver、queueMicrotask
- **关键规则**: 每次宏任务执行后，清空所有微任务

## 4. 异步执行顺序

```javascript
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
console.log('4')
// 输出: 1 → 4 → 3 → 2
```

## 5. 与相邻模块的关系

- **03-concurrency**: 并发编程的深层机制
- **15-data-flow**: 数据在应用中的流动方式
- **05-execution-flow**: L1 层的执行流形式化分析
