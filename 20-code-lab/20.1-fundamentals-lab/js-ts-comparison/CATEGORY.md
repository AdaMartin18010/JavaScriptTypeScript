---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 10-js-ts-comparison

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块从语法、语义模型、类型理论到编译工程实践，对 JavaScript 与 TypeScript 进行全方位对比分析。内容涵盖类型擦除、运行时差异、编译器 API 等语言核心议题，是理解 TS 作为 JS 超集的本质边界的关键模块。

**非本模块内容**：框架选型对比、工具链对比、运行时平台（Node/Deno/Bun）对比。

## 在语言核心体系中的位置

```
语言核心
  ├── 10-fundamentals/10.1-language-semantics → 类型系统理论
  ├── 10-fundamentals/10.7-js-ts-symmetric-difference → JS/TS 对称差
  └── 10-js-ts-comparison（本模块）→ 对比实验与编译器 API 实践
```

## 子模块目录结构

| 子模块 | 说明 |
|--------|------|
| `syntax-diffs/` | 语法差异对比实验 |
| `type-erasure/` | 类型擦除与运行时行为 |
| `compiler-api/` | TypeScript Compiler API 实践 |
| `performance/` | 编译性能与输出对比 |

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — 官方手册
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) — Basarat Ali Syed 开源书籍
