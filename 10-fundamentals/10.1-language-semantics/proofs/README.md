# 形式证明与推理树（Proofs）

> **定位**：`10-fundamentals/10.1-language-semantics/proofs/`
> **关联**：`axioms/` | `theorems/` | `30.5-diagrams/theorem-trees/`

---

## 证明目录

| 定理 | 证明状态 | 关联文件 |
|------|---------|---------|
| T1 JIT三态转化定理 | 归纳证明（基于V8实现） | `../theorems/jit-three-state-theorem.md` |
| T2 类型模块化定理 | 结构归纳（基于TS类型系统） | `../theorems/type-modularity-theorem.md` |
| T3 运行时收敛定理 | 演化论证（基于历史数据） | `../theorems/runtime-convergence-theorem.md` |
| T4 合成优先定理 | 反证法（基于渲染管道分析） | `../theorems/compositing-priority-theorem.md` |
| T5 JIT安全张力定理 | 矛盾证明（性能 vs 安全） | `../theorems/jit-security-tension-theorem.md` |

---

## 证明方法论

本项目采用"实用主义形式化"（Pragmatic Formalization）方法：

1. **不完全形式化**：不要求 Coq/Lean 级别的机器验证
2. **可追踪性**：每个推理步骤可追溯到规范或实现源码
3. **可证伪性**：明确列出假设边界，任一假设失效则结论失效

---

*推理树可视化参见 `30-knowledge-base/30.5-diagrams/theorem-trees/`。*
