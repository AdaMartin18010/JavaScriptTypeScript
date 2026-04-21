# 调用栈（Call Stack）

> 函数调用的 LIFO 结构：执行上下文帧的管理

---

## 内容大纲（TODO）

### 1. 调用栈基础

- LIFO 数据结构
- 执行上下文帧（Stack Frame）
- 栈的 push/pop 操作

### 2. 栈帧内容

- 函数参数
- 局部变量
- 返回地址
- 外层环境引用

### 3. 栈溢出（Stack Overflow）

- 无限递归
- 过深的调用链
- 尾调用优化（TCO）

### 4. 错误与调试

- 堆栈追踪（Stack Trace）
- Error.stack 的格式
- Source Map 与原始堆栈

### 5. 异步与调用栈

- 异步回调的堆栈断裂
- async/await 的堆栈恢复

### 6. 可视化

- 调用栈的 Mermaid 时序图
