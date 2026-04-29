---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 01-ecmascript-evolution

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块专注于 ECMAScript 语言规范的版本演进，涵盖从 ES3 到 ES2026 的语言特性变迁。所有内容均围绕 TC39 提案与 ECMA-262 规范展开，不涉及具体框架或运行时的实现差异（除非用于说明语义）。

**非本模块内容**：框架特性、构建工具演进、非标准扩展。

## 在语言核心体系中的位置

```
语言核心
  ├── 00-language-core            → 语法基础
  ├── 01-ecmascript-evolution（本模块）→ 规范演进史
  └── 10-fundamentals/10.1-language-semantics → 语义基础
```

## 子模块目录结构

| 子模块 | 说明 |
|--------|------|
| `es2015/` | ES6 核心特性实验（let/const、箭头函数、类、模块） |
| `es2017/` | 异步函数与 Object 扩展 |
| `es2020/` | 空值合并、可选链、BigInt、动态 import |
| `es2024/` | GroupBy、Promise.withResolvers、Array 排序方法 |
| `es2025/` | Set 集合方法、正则增强 |
| `tc39-proposals/` | Stage 3/4 提案追踪与实验 |

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
- [MDN — JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) — Mozilla 权威文档
- [TC39 Proposals](https://github.com/tc39/proposals) — ECMAScript 提案仓库
