# AI Agent 架构模式

> **定位**：`30-knowledge-base/30.6-patterns/`
> **新增**：2026-04

---

## 一、ReAct 模式（Reasoning + Acting）

```
循环：
  1. Thought：分析当前状态和目标
  2. Action：选择并执行工具
  3. Observation：获取工具执行结果
  4. 重复直至目标达成
```

**TypeScript 实现框架**：

```typescript
interface ReActLoop {
  thought(state: AgentState): string;
  action(thought: string): ToolCall;
  observe(result: ToolResult): Observation;
  shouldContinue(state: AgentState): boolean;
}
```

---

## 二、Plan-and-Solve 模式

```
阶段 1：规划
  - 将复杂任务分解为子任务列表
  - 确定依赖关系和执行顺序

阶段 2：执行
  - 按拓扑顺序执行子任务
  - 处理失败和重试

阶段 3：验证
  - 检查最终结果是否符合预期
  - 必要时重新规划
```

---

## 三、Multi-Agent Orchestration

```
协调者模式（Orchestrator）
├── 主 Agent：任务分解与分配
├── 专家 Agent：领域-specific 处理
│   ├── CodeAgent：代码生成
│   ├── ReviewAgent：代码审查
│   └── TestAgent：测试生成
└── 验证 Agent：结果整合与验证

通信协议：A2A / 内部消息总线
```

---

## 四、Reflection 模式

```
生成 → 评估 → 改进 循环

1. 初始生成（Draft）
2. 自我评估（Critique）
   - 检查正确性
   - 检查完整性
   - 检查安全性
3. 迭代改进（Refine）
   - 根据评估结果修正
4. 重复直至通过阈值
```

---

## 五、Human-in-the-Loop

| 交互点 | 自动化程度 | 人工介入 |
|--------|-----------|---------|
| 任务分解 | 高 | 复杂任务确认 |
| 工具执行 | 中 | 高风险操作审批 |
| 结果验证 | 低 | 最终输出审核 |
| 异常处理 | 低 | 错误纠正指导 |

---

*本模式文档为 AI Agent 基础设施的架构设计参考。*
