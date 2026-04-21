# 编译阶段 vs 执行阶段

> JavaScript 的两阶段处理模型：预编译与运行时

---

## 内容大纲（TODO）

### 1. 编译阶段（Parsing & Compilation）

- 词法分析（Tokenization）
- 语法分析（Parsing → AST）
- 预编译（Hoisting、作用域分析）
- 字节码生成

### 2. 执行阶段（Execution）

- 全局代码执行
- 函数调用执行
- 评估上下文（Evaluation Context）

### 3. 即时编译（JIT）

- 基线编译
- 优化编译
- 推测性优化与去优化

### 4. 惰性解析（Lazy Parsing）

- 预解析（Pre-parsing）
- 完全解析的触发条件

### 5. 与类型系统的关系

- TypeScript 编译时 vs JS 运行时
- 类型擦除的时机
