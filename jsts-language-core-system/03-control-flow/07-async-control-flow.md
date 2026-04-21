# 异步控制流

> Promise、async/await 与并发控制的完整执行模型

---

## 内容大纲（TODO）

### 1. Promise 控制流

- Promise 的创建与解决
- .then / .catch / .finally 链
- Promise 的不可变性

### 2. async / await

- async 函数总是返回 Promise
- await 的表达式暂停语义
- 错误传播机制

### 3. 并发控制

- Promise.all：全部成功
- Promise.race：竞争
- Promise.allSettled（ES2020）：全部完成
- Promise.any（ES2021）：任一成功
- Promise.try（ES2025）

### 4. 串行 vs 并行

- 串行执行模式
- 并行执行模式
- 混合模式

### 5. 取消与超时

- AbortController
- 超时封装模式
- 可取消的 Promise 模式

### 6. 常见陷阱

- 串行误用为并行
- async/await 中的循环陷阱
- 未处理的 Promise 拒绝
