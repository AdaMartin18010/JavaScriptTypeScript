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
