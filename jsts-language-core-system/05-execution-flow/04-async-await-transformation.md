# async/await 转换语义

> async/await 作为 Promise 语法糖的底层转换与微任务调度

---

## 内容大纲（TODO）

### 1. 语法糖转换

- async 函数 → Promise 包装
- await 表达式 → .then() 的等价转换
- Generator + Promise 的早期实现对照

### 2. 执行暂停与恢复

- await 处的执行暂停
- Promise 解决后的恢复执行
- 恢复执行的微任务排队

### 3. 错误处理

- try/catch 与 Promise 拒绝的映射
- 未捕获的异常传播

### 4. 并发 vs 串行

- 顺序 await 的串行语义
- Promise.all + await 的并发语义

### 5. 性能考量

- async/await 的开销
- 与原生 Promise 的性能对比

### 6. 可视化

- async/await 执行的时序图
- 与 Promise 链的对照图
