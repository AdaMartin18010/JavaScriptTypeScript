# 词法环境与变量环境

> ECMAScript 规范中执行上下文的两个环境组件

---

## 内容大纲（TODO）

### 1. 规范定义

- LexicalEnvironment：当前词法作用域
- VariableEnvironment：var 绑定的作用域

### 2. 为什么需要两个环境

- let/const vs var 的不同作用域规则
- 块级作用域的实现

### 3. 环境记录的类型

- 声明式环境记录
- 对象环境记录

### 4. 初始化过程

- 全局执行上下文的环境初始化
- 函数执行上下文的环境初始化
- 块语句的环境初始化

### 5. 与闭包的关系

- 闭包捕获的是 LexicalEnvironment
- 环境记录的生命周期延长

### 6. 可视化

- LexicalEnvironment vs VariableEnvironment 的 Mermaid 图
