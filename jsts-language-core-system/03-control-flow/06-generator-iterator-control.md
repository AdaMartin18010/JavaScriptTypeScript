# 生成器与迭代器控制流

> 可暂停/恢复的执行流：Generator 的完整语义

---

## 内容大纲（TODO）

### 1. 迭代器协议回顾

- Iterable 与 Iterator
- 手动实现迭代器

### 2. Generator 基础

- `function*` 语法
- `yield` 表达式
- Generator 对象的 `next()` 方法

### 3. Generator 控制流

- `yield`：产出值并暂停
- `next(value)`：传入值并恢复
- `return(value)`：提前终止
- `throw(error)`：向生成器注入异常

### 4. 委托生成器

- `yield*` 语法
- 委托给其他可迭代对象
- 委托给另一个生成器

### 5. 异步生成器

- `async function*`
- `for await...of` 消费

### 6. 实战模式

- 惰性序列生成
- 状态机实现
- 协程模式
- Redux-Saga 风格控制流

### 7. 常见陷阱

- 生成器不自动执行
- yield 的运算符优先级
- 生成器实例的重用
