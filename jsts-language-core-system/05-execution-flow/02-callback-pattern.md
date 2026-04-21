# 回调模式

> JavaScript 异步编程的原始形态：Callback Pattern 与 Callback Hell

---

## 内容大纲（TODO）

### 1. 回调基础

- 同步回调 vs 异步回调
- 高阶函数模式

### 2. 回调地狱（Callback Hell）

- 嵌套回调的问题
- 错误处理的困难
- 代码可读性下降

### 3. 回调约定

- Node.js Error-first Callback
- 回调函数的签名设计

### 4. 回调的替代演进

- Promise 化（Promisify）
- async/await 的转换

### 5. 常见陷阱

- 回调中的 this 丢失
- 同步回调导致的堆栈爆炸
- Zalgo 问题（有时同步有时异步）
