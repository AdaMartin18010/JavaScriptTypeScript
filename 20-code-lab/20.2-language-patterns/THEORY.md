# 语言模式

> **定位**：`20-code-lab/20.2-language-patterns`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 语言模式 领域的核心理论与实践映射问题。通过代码示例和形式化分析建立从概念到实现的认知桥梁。

### 1.2 形式化基础

语言模式可视为在特定上下文（Context）中针对重复出现的问题（Problem）所给出的可复用解决方案（Solution）。形式化表达为：

```
Pattern = ⟨Context, Problem, Solution, Consequences⟩
```

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 核心概念 | 语言模式 的核心定义与语义 | 示例代码 |
| 实践模式 | 工程化中的典型应用场景 | patterns/ |

---

## 二、设计原理

### 2.1 为什么存在

语言模式 作为软件工程中的重要课题，其存在是为了解决特定领域的复杂度与可维护性挑战。通过建立系统化的理论框架和实践模式，开发者能够更高效地构建可靠的系统。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 方案 A | 通用、稳健 | 可能非最优 | 大多数场景 |
| 方案 B | 针对性强 | 适用范围窄 | 特定需求 |

### 2.3 与相关技术的对比

| 模式 | 意图 | 典型实现 | 适用场景 |
|------|------|---------|---------|
| 工厂模式 | 封装对象创建逻辑 | `class Factory { create() {} }` | 对象创建复杂 |
| 策略模式 | 运行时替换算法 | `interface Strategy { execute() }` | 多算法切换 |
| 观察者模式 | 一对多依赖通知 | `EventEmitter` / `Proxy` | 事件驱动系统 |
| 装饰器模式 | 动态增强行为 | ES Decorator / 高阶函数 | AOP、日志 |
| 单例模式 | 全局唯一实例 | `private constructor` | 配置中心 |

与其他相关技术对比，语言模式 在特定场景下提供了独特的权衡优势。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 语言模式 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 策略模式 + 工厂模式组合示例

```typescript
// 策略接口
interface PaymentStrategy {
  pay(amount: number): Promise<string>;
}

// 具体策略
class AlipayStrategy implements PaymentStrategy {
  async pay(amount: number) {
    return `Alipay paid ¥${amount}`;
  }
}

class WechatStrategy implements PaymentStrategy {
  async pay(amount: number) {
    return `Wechat paid ¥${amount}`;
  }
}

// 工厂：根据类型创建策略
class PaymentFactory {
  static create(method: 'alipay' | 'wechat'): PaymentStrategy {
    const map: Record<string, new () => PaymentStrategy> = {
      alipay: AlipayStrategy,
      wechat: WechatStrategy,
    };
    return new map[method]();
  }
}

// 使用
const payment = PaymentFactory.create('alipay');
payment.pay(100).then(console.log);
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 语言模式 很简单无需学习 | 深入理解能避免隐蔽 bug 和性能陷阱 |
| 理论脱离实际 | 理论指导实践中的架构决策 |

### 3.3 扩展阅读

- [MDN Web Docs](https://developer.mozilla.org)
- [Refactoring Guru — Design Patterns](https://refactoring.guru/design-patterns)
- [Patterns.dev](https://www.patterns.dev/)
- [JavaScript Design Patterns (Addy Osmani)](https://addyosmani.com/resources/essentialjsdesignpatterns/book/)
- [Gamma et al. — Design Patterns (GoF)](https://en.wikipedia.org/wiki/Design_Patterns)
- `30-knowledge-base/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
