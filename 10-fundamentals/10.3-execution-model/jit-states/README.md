# JIT 三态转化（JIT Three-State Transformation）

> **定位**：`10-fundamentals/10.3-execution-model/jit-states/`
> **关联**：`../theorems/jit-three-state-theorem.md` | `30.5-diagrams/theorem-trees/jit-three-state-proof.mmd`

---

## 三态定义

| 状态 | 引擎阶段 | 特征 |
|------|---------|------|
| **解释执行** | Ignition | 字节码解释器，通用但较慢 |
| **编译执行** | Sparkplug | 快速机器码生成，基线优化 |
| **优化执行** | TurboFan | 深度优化机器码，基于类型假设 |

## 状态转化触发条件

```
源码输入
   │
   ▼
对象结构稳定？ ──否──→ 保持 Ignition
   │是
   ▼
Hidden Class 建立
   │
   ▼
类型可测？ ──否──→ 保持 Sparkplug
   │是
   ▼
特化机器码生成
   │
   ▼
热点检测（调用频率 > threshold）
   │
   ▼
TurboFan 深度优化
   │
   ▼
任一假设失效 ──→ Deoptimize ──→ 回退 Ignition
```

---

*完整数学表述和范畴论映射参见 `../theorems/jit-three-state-theorem.md`。*
