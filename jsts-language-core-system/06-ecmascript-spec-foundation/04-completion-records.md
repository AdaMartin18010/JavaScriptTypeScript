# 完成记录（Completion Records）

> ECMAScript 规范中控制流转移的统一抽象

---

## 内容大纲（TODO）

### 1. Completion Record 结构

- [[Type]]：normal, break, continue, return, throw
- [[Value]]：完成值
- [[Target]]：标签目标

### 2. 各类 Completion

- Normal Completion
- Throw Completion（异常）
- Return Completion（函数返回）
- Break Completion
- Continue Completion

### 3. 抽象语义中的传播

- 语句序列的执行与 Completion 传播
- `?` 前缀操作（ReturnIfAbrupt）
- `!` 前缀操作（断言 Normal Completion）

### 4. 与开发者可见行为的关系

- try/catch/finally 的规范解释
- 函数返回值
- 循环控制（break/continue）

### 5. 可视化

- Completion Record 传播流程图
- try/catch 的 Completion 转换
