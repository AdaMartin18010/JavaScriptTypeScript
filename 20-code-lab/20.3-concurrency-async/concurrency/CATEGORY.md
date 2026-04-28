---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 03-concurrency

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块专注于 JavaScript 并发模型的语言级机制：事件循环、Promise、async/await、Worker Threads、Atomics、SharedArrayBuffer。这些是 ECMAScript 规范或 HTML 规范定义的语言/平台核心能力，不是某个库或框架的抽象。

**非本模块内容**：特定框架的并发工具（如 React Concurrent Features）、Node.js 特定的集群模块（属于平台扩展）。

## 在语言核心体系中的位置

```
语言核心
  ├── 00-language-core      → 语法基础
  ├── 03-concurrency（本模块）→ 异步与并发机制
  └── jsts-language-core-system/05-execution-flow → 执行流理论
```

## 关联索引

- [docs/language-core-index.md](../../../docs/language-core-index.md)
- [docs/categories/00-language-core.md](../../../docs/categories/00-language-core.md)
