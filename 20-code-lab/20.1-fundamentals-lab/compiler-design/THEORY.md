# 编译器设计理论：从词法分析到代码生成

> **目标读者**：对编译原理感兴趣的开发者、工具链作者
> **关联文档**：[`docs/categories/79-compiler-design.md`](../../docs/categories/79-compiler-design.md)
> **版本**：2026-04

---

## 1. 编译器Pipeline

```
源代码
  ↓
词法分析 (Lexer) → Token 流
  ↓
语法分析 (Parser) → AST
  ↓
语义分析 → 类型检查、符号表
  ↓
中间表示 (IR) → 优化
  ↓
代码生成 → 目标代码
```

---

## 2. TypeScript 编译器架构

### 2.1 tsc 内部

```
Scanner → Parser → Binder → Checker → Emitter
(扫描)   (解析)   (绑定)   (检查)   (输出)
```

### 2.2 tsgo (TypeScript 7.0)

```
Go 重写 → 10x 构建速度
  ↓
保留类型系统语义
  ↓
兼容现有 tsconfig
```

---

## 3. 工具链编译器

| 编译器 | 输入 | 输出 | 特点 |
|--------|------|------|------|
| **tsc** | TS | JS + .d.ts | 类型检查 + 转译 |
| **Babel** | JS/TS | JS | 插件化、灵活 |
| **SWC** | JS/TS | JS | Rust、极快 |
| **esbuild** | JS/TS | JS | Go、极简 |
| **oxc** | JS/TS | JS | Rust、统一工具链 |

---

## 4. 总结

编译器是**编程语言的灵魂**。理解编译器原理，是理解语言特性的最佳途径。

---

## 参考资源

- [Crafting Interpreters](https://craftinginterpreters.com/)
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [SWC 文档](https://swc.rs/)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `ast.ts`
- `code-gen.ts`
- `compiler-pipeline.ts`
- `index.ts`
- `lexer.ts`
- `parser.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-27
