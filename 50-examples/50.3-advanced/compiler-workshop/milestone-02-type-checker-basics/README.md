# Milestone 2: Type Checker Basics —— 基础类型检查器

## 理论基础

### 类型环境（Type Environment）

类型检查的核心数据结构是**类型环境** Γ（Gamma），它是一个从变量名到类型的映射：

```
Γ = { x: number, y: string, add: (number, number) => number }
```

环境是**栈式结构**：进入函数体时 push 新作用域，退出时 pop。变量查找遵循**词法作用域规则**（从内到外）。

### 结构化子类型（Structural Subtyping）

TypeScript 采用结构子类型，判断依据是类型的"形状"而非名称：

```
{ x: number, y: number } <: { x: number }    ✓ 宽度子类型
{ x: number } <: { x: number, y: number }    ✗
```

本阶段实现：
- **自反性**：`T <: T`
- **原始类型相等性**：`number <: number`，`number </: string`
- **对象宽度子类型**：超集可赋值给子集
- **函数子类型**：参数逆变（contravariant），返回值协变（covariant）

### 类型错误报告

类型检查器需要报告精确的错误位置：

```
Error: Type 'string' is not assignable to type 'number'.
  at line 3, column 12
```

本实现通过 AST 节点的 `loc` 信息定位错误。

## 关键代码 Walkthrough

### `types.ts`

定义类型检查器内部使用的类型表示（Type Representation）。与 AST 中的 `TypeNode` 不同，这是**语义层面的类型**，包含：
- `PrimitiveType`: `number`, `string`, `boolean`, `null`, `undefined`, `void`, `never`
- `ObjectType`: 属性映射表
- `FunctionType`: 参数列表 + 返回类型
- `GenericType`: 类型参数（如 `T`）
- `ArrayType`: 元素类型
- `UnionType`: 联合类型（简化版）

### `environment.ts`

`TypeEnvironment` 实现作用域栈：
- `pushScope()`: 进入新作用域（如函数体）
- `popScope()`: 退出作用域
- `define(name, type)`: 在当前作用域绑定变量
- `lookup(name)`: 从当前作用域向外查找变量类型

### `typeChecker.ts`

`TypeChecker` 是核心类，对每种 AST 节点实现类型推导：
- `checkProgram`: 依次检查每条语句
- `checkVariableDeclaration`: 推断 initializer 类型，与注解对比
- `checkFunctionDeclaration`: 检查参数类型、返回类型兼容性
- `checkCallExpression`: 检查参数数量与类型匹配
- `checkBinaryExpression`: 检查运算符两边的类型是否合法

## 运行测试

```bash
pnpm test examples/advanced-compiler-workshop/milestone-02-type-checker-basics
```

## 延伸阅读

- `jsts-code-lab/40-type-theory-formal/02-subtyping/` —— 结构子类型的形式化实现
- `jsts-code-lab/40-type-theory-formal/THEORY.md` §4.3 —— 结构子类型 vs 名义子类型
- Pierce, TaPL 第 15 章 —— 子类型系统
