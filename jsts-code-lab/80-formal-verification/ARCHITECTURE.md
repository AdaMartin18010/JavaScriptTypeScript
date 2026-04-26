# 形式化验证 — 架构设计

## 1. 架构概述

本模块实现了形式化方法的简化工具集，包括 Hoare 逻辑验证器、类型检查器和属性测试框架。展示如何用数学方法保证程序正确性。

## 2. 核心组件

### 2.1 规范解析器

- **Hoare Triple Parser**: `{P} C {Q}` 前置/后置条件解析
- **Invariant Detector**: 循环不变式推断
- **Assertion Checker**: 运行时断言验证

### 2.2 验证引擎

- **Weakest Precondition Calculator**: 最弱前置条件计算
- **Symbolic Executor**: 符号执行引擎，探索所有路径
- **SMT Interface**: 与 Z3 求解器的交互接口

### 2.3 测试生成器

- **Property Generator**: 基于类型的随机输入生成
- **Shrinker**: 反例最小化，定位最小失败输入
- **Coverage Analyzer**: 形式化覆盖度评估

## 3. 数据流

```
Program + Specification → Parser → Verification Engine → SMT Solver → Result (Verified/Counterexample)
```

## 4. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 验证方法 | Hoare 逻辑 + 符号执行 | 教学直观性 |
| SMT 后端 | Z3（可选）| 工业级求解器 |
| 输入生成 | 基于类型 + 自定义策略 | 高覆盖率 |

## 5. 质量属性

- **严谨性**: 基于数学逻辑的严格验证
- **可教育性**: 每一步验证过程可展示
- **实用性**: 可发现测试难以覆盖的边界情况
