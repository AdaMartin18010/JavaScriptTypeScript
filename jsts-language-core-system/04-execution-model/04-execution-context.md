# 执行上下文（Execution Context）

> JavaScript 代码执行的运行时环境抽象

---

## 内容大纲（TODO）

### 1. 执行上下文类型

- 全局执行上下文（Global Execution Context）
- 函数执行上下文（Function Execution Context）
- Eval 执行上下文

### 2. 执行上下文的创建

- 创建阶段（Creation Phase）
- 执行阶段（Execution Phase）

### 3. 执行上下文的组成

- 词法环境（LexicalEnvironment）
- 变量环境（VariableEnvironment）
- this 绑定

### 4. 执行上下文栈

- 栈的管理
- 全局上下文始终在栈底

### 5. 执行上下文的生命周期

- 创建 → 压栈 → 执行 → 弹栈 → 销毁

### 6. 与作用域的关系

- 执行上下文 vs 词法环境
- 调用栈 vs 作用域链
