# 元编程

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/07-metaprogramming`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块探索代理、反射和装饰器等元编程技术，解决在运行时拦截和修改对象行为的高级抽象问题。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Proxy | 拦截对象基本操作的代理器 | proxy-examples.ts |
| Reflect | 提供可拦截操作的默认行为 | reflect-api.ts |
| 装饰器 | 类与成员的注解式元编程 | decorators.ts |

---

## 二、设计原理

### 2.1 为什么存在

元编程允许代码在运行时检查和修改自身行为。代理和反射机制为框架开发、测试模拟和 API 拦截提供了强大的基础设施。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Proxy | 能力强大、透明拦截 | 性能开销显著 | 调试/监控 |
| 显式方法 | 性能最优 | 侵入性修改 | 高频调用路径 |

### 2.3 与相关技术的对比

与 Ruby 元编程对比：JS Proxy 提供了更系统化的拦截能力。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 元编程 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Proxy 可以拦截所有操作 | 部分原生对象内部槽无法被代理 |
| Reflect 只是 Proxy 的镜像 | Reflect 提供默认行为且可用于普通对象 |

### 3.3 扩展阅读

- [MDN Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- `10-fundamentals/10.1-language-semantics/07-metaprogramming/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
