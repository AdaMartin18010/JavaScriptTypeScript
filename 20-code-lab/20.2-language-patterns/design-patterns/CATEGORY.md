---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 02-design-patterns

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块收录软件工程中经过验证的经典设计模式在 JavaScript/TypeScript 中的实现。设计模式是语言无关的，但本模块聚焦于利用 JS/TS 特有的动态特性、闭包、原型链、类型系统来表达这些模式，属于语言能力的应用层面。

**非本模块内容**：前端组件模式（如 React 高阶组件）、特定框架的架构模式。

## 在语言核心体系中的位置

```
语言核心
  ├── 00-language-core      → 语法与语义基础
  ├── 02-design-patterns（本模块）→ 经典模式的 JS/TS 表达
  └── 05-algorithms         → 算法实现
```

## 子模块目录结构

| 子模块 | 说明 |
|--------|------|
| `creational/` | 创建型模式（单例、工厂、建造者、原型） |
| `structural/` | 结构型模式（适配器、装饰器、代理、组合） |
| `behavioral/` | 行为型模式（观察者、策略、迭代器、命令） |
| `js-specific/` | JS 特有实现（模块模式、揭示模块、IIFE） |

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
- [Refactoring Guru — Design Patterns](https://refactoring.guru/design-patterns) — 可视化设计模式指南
- [Patterns.dev](https://www.patterns.dev/) — 现代 Web 开发模式
