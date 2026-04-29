---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 00-language-core

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块专注于 JavaScript/TypeScript 语言本身的基础语法与语义机制，包括：

- 数据类型与类型转换
- 变量声明与作用域
- 函数与闭包
- 对象与原型链
- 模块系统（ESM / 动态导入）
- 元编程（Proxy / Reflect）

**非本模块内容**：框架 API、运行时平台特性、工程工具链配置。

## 在语言核心体系中的位置

```
语言核心基础（本模块）
  ├── 01-ecmascript-evolution   → 语言特性演进史
  ├── jsts-language-core-system → 深度理论机制
  └── 03-concurrency            → 异步与并发
```

## 子模块索引

| 子模块 | 核心主题 | 关键概念 |
|--------|----------|----------|
| **syntax** | 语法基础 | 表达式、语句、运算符、控制流、严格模式 |
| **types** | 数据类型 | 原始类型、引用类型、类型转换、typeof、TypeScript 类型注解 |
| **scope** | 作用域机制 | 词法作用域、作用域链、块级作用域、变量提升、TDZ |
| **closures** | 闭包 | 词法闭包、私有变量、工厂函数、模块模式 |
| **prototypes** | 原型与继承 | 原型链、`__proto__`、`prototype`、class 语法糖、混入模式 |
| **modules** | 模块系统 | ESM、CommonJS、动态导入 `import()`、循环依赖、tree-shaking |

## 权威参考链接

- [MDN JavaScript 指南](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide)
- [MDN JavaScript 参考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference)
- [ECMA-262 规范 (第 15 版)](https://262.ecma-international.org/15.0/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [JavaScript Info (现代教程)](https://javascript.info/)

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
