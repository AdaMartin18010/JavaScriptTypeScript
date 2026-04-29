# 控制流

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/03-control-flow`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块分析控制流结构（条件、循环、异常），解决复杂业务逻辑下的流程清晰性与错误处理问题。通过结构化编程原则提升代码可读性。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 短路求值 | && / || 的条件执行语义 | short-circuit.ts |
| 异常传播 | Error 的冒泡与捕获链 | error-handling.ts |

---

## 二、设计原理

### 2.1 为什么存在

程序的本质是控制流的组合。条件、循环和异常处理构成了业务逻辑的骨架，清晰的控制流设计直接影响代码的可读性与可维护性。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 早期返回 | 减少嵌套深度 | 分散退出点 | 验证前置条件 |
| 异常抛出 | 强制处理错误 | 控制流隐式跳转 | 不可恢复错误 |

### 2.3 特性对比表：控制流模式

| 模式 | 适用场景 | 可读性 | 扩展性 | 注意事项 |
|------|---------|--------|--------|----------|
| `if/else if/else` | 简单二元或有限条件 | 高 | 低 | 嵌套过深时用早期返回 |
| `switch` | 离散值多分支匹配 | 中 | 中 | 必须显式 `break`，否则穿透 |
| 三元运算符 `? :` | 简单值选择 | 中 | 低 | 避免嵌套超过一层 |
| 短路求值 `&& \|\|` | 默认值与条件执行 | 高 | 低 | 注意 `0`、`""`、`false` 等假值 |
| 策略模式/Map | 大量离散规则 | 高 | 高 | 将逻辑与数据分离 |
| 异常 `try/catch` | 错误恢复与资源清理 | 中 | 中 | 仅用于异常场景，不要控制正常流 |

### 2.4 与相关技术的对比

与结构化编程理论对比：JS 的异常机制增强了非局部退出能力。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 控制流 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：`switch` vs 策略模式（Map）

```typescript
// 传统 switch：容易遗漏 break，扩展性差
function getStatusMessage(status: number): string {
  switch (status) {
    case 200: return 'OK';
    case 201: return 'Created';
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 404: return 'Not Found';
    case 500: return 'Internal Server Error';
    default: return 'Unknown Status';
  }
}

// 策略模式（Map）：更 declarative，天然防穿透，可动态扩展
const statusMap = new Map<number, string>([
  [200, 'OK'],
  [201, 'Created'],
  [400, 'Bad Request'],
  [401, 'Unauthorized'],
  [404, 'Not Found'],
  [500, 'Internal Server Error'],
]);

function getStatusMessageModern(status: number): string {
  return statusMap.get(status) ?? 'Unknown Status';
}

// 带逻辑的复杂策略模式
interface Order {
  type: 'standard' | 'express' | 'international';
  weight: number;
}

const shippingStrategies: Record<Order['type'], (o: Order) => number> = {
  standard: (o) => o.weight * 1.0,
  express: (o) => o.weight * 2.5 + 10,
  international: (o) => o.weight * 5.0 + 25,
};

function calculateShipping(order: Order): number {
  const strategy = shippingStrategies[order.type];
  if (!strategy) throw new Error(`Unsupported order type: ${order.type}`);
  return strategy(order);
}
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| switch 默认有 break | 缺少 break 会导致穿透执行 |
| try/catch 可以捕获异步错误 | 异步错误需配合 await 或 .catch |

### 3.4 扩展阅读

- [MDN 控制流](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [MDN：switch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch)
- [MDN：try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
- [MDN：异常与错误处理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
- [ECMAScript® 2025 — Statements](https://tc39.es/ecma262/#sec-ecmascript-language-statements-and-declarations)
- `10-fundamentals/10.1-language-semantics/03-control-flow/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
