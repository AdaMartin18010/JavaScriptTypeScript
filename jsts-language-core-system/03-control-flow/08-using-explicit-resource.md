# using 显式资源管理

> ES2025/ES2026 的显式资源管理：`using` 声明与 Symbol.dispose

---

## 内容大纲（TODO）

### 1. 背景与动机

- try/finally 的资源管理痛点
- RAII 模式在 JS 中的缺失

### 2. using 声明

- `using x = expr` 语法
- 块级作用域结束自动 dispose
- 与 const 类似的绑定语义

### 3. await using

- `await using x = expr`
- 异步 dispose 支持

### 4. DisposableStack / AsyncDisposableStack

- 多个资源的管理
- 错误处理与回退

### 5. Symbol.dispose / Symbol.asyncDispose

- 协议定义
- 自定义资源的实现

### 6. 与类型系统

- TS 5.2+ 的类型支持
- Disposable 约束类型

### 7. 实战模式

- 文件句柄管理
- 数据库连接池
- 锁机制
