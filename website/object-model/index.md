---
title: JavaScript 对象模型与原型链
description: 从 V8 引擎底层到语言表面的深度解析，涵盖对象创建、原型链、Class 语法糖、Proxy/Reflect、私有字段与对象设计模式。
prev: false
next: false
---

# JavaScript 对象模型与原型链

> 本专题是 L1 语言核心层的结构性缺口之一。JavaScript 的对象系统既是语言最灵活的部分，也是性能陷阱与安全隐患的集中地。理解 V8 的底层表示，是写出高性能、可维护代码的前提。

## 专题全景图

```mermaid
mindmap
  root((对象模型<br/>Object Model))
    对象基础
      字面量 / new / Object.create
      属性描述符
      Getter / Setter
      V8 JSObject
    原型链
      [[Prototype]]
      __proto__ / getPrototypeOf
      原型污染防护
      属性查找与 IC
    Class 语法糖
      extends / super
      new.target
      语义差异
    Proxy / Reflect
      拦截器矩阵
      不可撤销 Proxy
      性能代价
    私有字段
      #prefix
      WeakMap 模拟
      封装边界
    对象模式
      工厂 / 混入
      组合优于继承
      Object.assign 陷阱
```

## 延伸阅读

- **[对象模型理论研究](../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/OBJECT_MODEL_THEORY.md)** — 原型继承、属性描述符、Proxy元编程与内存布局的形式化语义，为专题中的 [01 对象基础](./01-object-fundamentals.md)、[02 原型链深度](./02-prototype-chain.md) 和 [03 Class vs 原型](./03-class-vs-prototype.md) 提供编译器视角的深度解析。
- **[JavaScript 引擎原理](../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/JS_ENGINE_PRINCIPLES.md)** — V8隐藏类、内联缓存与垃圾回收的形式化算法，直接支撑对象创建、属性访问与内存管理的性能优化策略。

## 学习路径

1. **对象基础** — 先建立对 JS 对象在 V8 中如何存储的直觉。
2. **原型链** — 理解属性查找的遍历过程与原型污染风险。
3. **Class vs 原型** — 破除“Class 就是传统 OOP”的误解。
4. **Proxy / Reflect** — 掌握元编程与拦截器。
5. **私有字段** — 厘清语言级私有与约定式私有的区别。
6. **对象模式** — 在实际工程中做出合理的对象设计决策。

## 章节导航

| 章节 | 内容 | 预计阅读 |
|---|---|---|
| [01 - 对象基础](./01-object-fundamentals) | 创建方式、属性描述符、Getter/Setter、V8 内部表示 | 15 min |
| [02 - 原型链深度](./02-prototype-chain) | `[[Prototype]]`、原型查找、原型污染、性能对比 | 20 min |
| [03 - Class vs 原型](./03-class-vs-prototype) | ES6 Class 继承链、`super`、`new.target` | 15 min |
| *04 - Proxy / Reflect*（待更新） | 拦截器、不可撤销 Proxy、Reflect API | 15 min |
| *05 - 私有字段*（待更新） | `#prefix`、WeakMap 模拟、封装模式 | 10 min |
| *06 - 对象模式*（待更新） | 工厂、混入、组合优于继承、Object.assign 陷阱 | 15 min |
