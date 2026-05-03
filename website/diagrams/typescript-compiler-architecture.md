---
title: TypeScript 编译器架构
description: "TypeScript 编译器的内部架构：扫描器、解析器、绑定器、检查器与发射器的完整流程"
---

# TypeScript 编译器架构

> TypeScript 编译器（tsc）是一个功能丰富的转译器和类型检查器。理解其内部架构有助于诊断复杂的类型问题和优化编译性能。

## 编译器管线

```mermaid
flowchart LR
    A[源码 .ts] --> B[Scanner<br/>扫描器]
    B --> C[Token Stream]
    C --> D[Parser<br/>解析器]
    D --> E[AST]
    E --> F[Binder<br/>绑定器]
    F --> G[Symbol Table]
    E --> H[Checker<br/>类型检查器]
    H --> I[Type Information]
    E --> J[Emitter<br/>发射器]
    J --> K[.js 输出]
    J --> L[.d.ts 输出]
```

## 各阶段详解

### 1. Scanner（扫描器）

将源代码字符流转换为 Token 序列：

```typescript
// 源码
const x: number = 42;

// Token 序列
// [ConstKeyword, Identifier, Colon, NumberKeyword, Equals, NumericLiteral(42), Semicolon]
```

### 2. Parser（解析器）

将 Token 序列构建为抽象语法树（AST）：

```mermaid
flowchart TD
    A[SourceFile] --> B[VariableStatement]
    B --> C[VariableDeclarationList]
    C --> D[VariableDeclaration]
    D --> E[Identifier 'x']
    D --> F[TypeAnnotation]
    F --> G[NumberKeyword]
    D --> H[NumericLiteral 42]
```

### 3. Binder（绑定器）

建立标识符与声明之间的符号表：

```typescript
// 创建 Symbol
const symbol = createSymbol(/*flags*/ SymbolFlags.Variable, 'x');

// 建立作用域链
// 全局作用域 → 模块作用域 → 函数作用域 → 块级作用域
```

### 4. Checker（类型检查器）

核心类型检查逻辑：

```mermaid
flowchart TD
    A[类型检查] --> B[类型推断]
    A --> C[类型兼容性检查]
    A --> D[控制流分析]
    B --> E[变量初始化推断]
    B --> F[函数返回类型推断]
    C --> G[结构子类型检查]
    D --> H[类型收窄]
    D --> I[可达性分析]
```

### 5. Emitter（发射器）

生成输出文件：

```mermaid
flowchart LR
    A[AST] --> B[Transformer]
    B --> C[降级ES5/ES6]
    C --> D[Printer]
    D --> E[.js 文件]
    D --> F[.d.ts 文件]
    D --> G[Source Map]
```

## TSConfig 配置对编译器的影响

```mermaid
flowchart TB
    A[tsconfig.json] --> B[compilerOptions]
    B --> C[target]
    B --> D[module]
    B --> E[strict]
    C --> F[降级级别]
    D --> G[模块格式]
    E --> H[严格检查]
```

| 配置项 | 影响阶段 | 说明 |
|--------|----------|------|
| `target` | Emitter | 输出 JavaScript 版本 |
| `module` | Emitter | 模块系统格式 |
| `strict` | Checker | 启用所有严格类型检查 |
| `noEmit` | Emitter | 跳过文件生成 |
| `declaration` | Emitter | 生成 .d.ts 文件 |

## 编译性能优化

```mermaid
flowchart LR
    A[大项目编译慢] --> B[增量编译]
    A --> C[项目引用]
    A --> D[skipLibCheck]
    B --> E[仅编译修改的文件]
    C --> F[并行编译子项目]
    D --> G[跳过node_modules检查]
```

```json
// tsconfig.json 性能优化
&#123;
  "compilerOptions": &#123;
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo",
    "skipLibCheck": true,
    "composite": true
  &#125;
&#125;
```

## 参考资源

- [类型系统导读](/fundamentals/type-system) — TypeScript 类型理论基础
- [TSGo 原生编译器](/fundamentals/academic-frontiers) — TypeScript 编译器重写计划

---

 [← 返回架构图首页](./)
