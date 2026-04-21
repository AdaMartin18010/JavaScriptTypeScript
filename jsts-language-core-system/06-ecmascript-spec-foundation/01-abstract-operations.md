# 抽象操作（Abstract Operations）

> ECMA-262 规范中定义的内部算法：ToPrimitive、ToString、ToNumber 等

---

## 内容大纲（TODO）

### 1. 抽象操作概述

- 什么是抽象操作
- 命名约定：`OperationName(arg1, arg2)`

### 2. 类型转换操作

- ToPrimitive
- ToBoolean
- ToNumber
- ToString
- ToObject

### 3. 对象操作

- GetValue / PutValue
- HasProperty
- Get / Set
- Delete
- DefinePropertyOrThrow

### 4. 环境操作

- GetIdentifierReference
- ResolveBinding
- InitializeBinding

### 5. 与日常开发的关系

- 隐式类型转换的规范解释
- == 运算符的抽象操作链
- 对象属性访问的底层过程
