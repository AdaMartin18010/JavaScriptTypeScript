# AI Agent 架构模式

> AI Agent 系统的架构设计与模式参考。

---

## 核心模式

### 1. ReAct（Reasoning + Acting）

交替进行推理（Thought）和行动（Action），基于环境反馈迭代：

```
Thought → Action → Observation → Thought → ...
```

### 2. Plan-and-Execute

先制定计划，再按步骤执行：

```
用户输入 → 计划生成 → 步骤 1 → 步骤 2 → ... → 总结
```

### 3. Multi-Agent 协作

多个专用 Agent 分工协作：

- **Planner Agent**：任务分解
- **Executor Agent**：工具调用
- **Critic Agent**：结果校验

## 协议标准

| 协议 | 用途 |
|------|------|
| **MCP** | 模型上下文协议，标准化工具暴露 |
| **A2A** | Agent-to-Agent 通信协议 |

---

*最后更新: 2026-04-29*
