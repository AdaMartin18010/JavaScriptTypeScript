# 形式化验证：理论基础

> **定位**：`20-code-lab/20.10-formal-verification/`
> **关联**：`10-fundamentals/10.1-language-semantics/proofs/`

---

## 一、核心理论

### 1.1 形式化方法谱系

| 方法 | 严格性 | 可扩展性 | JS/TS 应用 |
|------|--------|---------|-----------|
| **Hoare Logic** | 高 | 低 | 关键函数正确性 |
| **Model Checking** | 高 | 中 | 状态机验证 |
| **Property-Based Testing** | 中 | 高 | 随机生成测试用例 |
| **Type Systems** | 中 | 高 | TypeScript 静态检查 |
| **AI-Assisted Review** | 低 | 极高 | Copilot Code Review |

### 1.2 Hoare 三元组

```
{P} C {Q}
```

- **P**：前置条件（Precondition）
- **C**：命令/程序
- **Q**：后置条件（Postcondition）

**示例**：

```
{x > 0} x = x + 1 {x > 1}
```

---

## 二、设计原理

### 2.1 为什么 JS/TS 缺乏形式化验证

| 障碍 | 说明 | 缓解方向 |
|------|------|---------|
| 动态类型 | 运行时类型不确定 | TypeScript + 运行时检查 |
| 闭包与原型 | 复杂的状态空间 | 局部验证 + 不变性模式 |
| 宿主环境依赖 | DOM/Node API 难以建模 | 抽象规范 + Mock |

### 2.2 实用主义形式化

本项目的核心理念：在 JS/TS 生态中，**类型系统**是最实用的形式化工具。

```
TypeScript 类型检查 = 轻量级形式化验证
  - 前置条件：函数参数类型
  - 后置条件：函数返回类型
  - 不变性：readonly / const
  - 可达性分析：控制流类型收窄
```

---

## 三、扩展阅读

- `10-fundamentals/10.1-language-semantics/theorems/`
- `JSTS全景综述/FORMAL_SEMANTICS_COMPLETE.md`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
