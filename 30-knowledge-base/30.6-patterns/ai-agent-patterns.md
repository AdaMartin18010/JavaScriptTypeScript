# AI Agent 架构模式

> **定位**：`30-knowledge-base/30.6-patterns/`
> **新增**：2026-04

---

## Agent 模式对比矩阵

| 维度 | ReAct | Plan-and-Solve | Multi-Agent | Reflection | Human-in-the-Loop |
|------|-------|---------------|-------------|-----------|-------------------|
| **核心思想** | 思考-行动-观察循环 | 先规划再执行 | 分而治之，协作 | 自我评估与改进 | 人工关键节点介入 |
| **适用场景** | 工具调用、实时推理 | 复杂多步任务 | 大型项目、多领域 | 高质量生成 | 高风险决策 |
| **延迟** | 高（多轮迭代） | 中（规划+执行） | 高（通信开销） | 很高（多轮反思） | 不确定（依赖人工） |
| **实现复杂度** | 低 | 中 | 高 | 中 | 中 |
| **容错能力** | 中（观察纠错） | 中（重规划） | 高（冗余 Agent） | 高（迭代修正） | 最高（人工兜底） |
| **典型框架** | LangChain ReAct | Mastra Workflows | AutoGen / CrewAI | Self-RAG | Copilot Studio |

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

### 💻 代码示例：ReAct Agent 完整实现

```typescript
// react-agent.ts
import { OpenAI } from "openai";

interface Tool {
  name: string;
  description: string;
  execute: (input: string) => Promise<string>;
}

interface ReActStep {
  thought: string;
  action: string;
  observation: string;
}

class ReActAgent {
  private llm: OpenAI;
  private tools: Map<string, Tool>;
  private maxIterations = 10;

  constructor(tools: Tool[], apiKey: string) {
    this.llm = new OpenAI({ apiKey });
    this.tools = new Map(tools.map((t) => [t.name, t]));
  }

  async run(query: string): Promise<{ answer: string; steps: ReActStep[] }> {
    const steps: ReActStep[] = [];
    let context = `Question: ${query}\n\n`;

    for (let i = 0; i < this.maxIterations; i++) {
      // 1. Thought
      const thought = await this.generateThought(context);

      // 2. Action
      const action = await this.decideAction(context + `Thought: ${thought}\n`);

      if (action.tool === "finish") {
        return { answer: action.input, steps };
      }

      // 3. Observation
      const tool = this.tools.get(action.tool);
      const observation = tool
        ? await tool.execute(action.input)
        : `Error: Tool ${action.tool} not found`;

      steps.push({ thought, action: `${action.tool}(${action.input})`, observation });
      context += `Thought: ${thought}\nAction: ${action.tool}(${action.input})\nObservation: ${observation}\n\n`;
    }

    return { answer: "Max iterations reached", steps };
  }

  private async generateThought(context: string): Promise<string> {
    const prompt = `${context}Think step by step about what to do next.`;
    const res = await this.llm.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    return res.choices[0].message.content ?? "";
  }

  private async decideAction(context: string): Promise<{ tool: string; input: string }> {
    const toolDescriptions = Array.from(this.tools.values())
      .map((t) => `- ${t.name}: ${t.description}`)
      .join("\n");

    const prompt = `${context}\nAvailable tools:\n${toolDescriptions}\n\nRespond in format: TOOL: tool_name | INPUT: input_data. Use TOOL: finish | INPUT: final_answer when done.`;
    const res = await this.llm.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = res.choices[0].message.content ?? "";
    const match = text.match(/TOOL:\s*(\w+)\s*\|\s*INPUT:\s*(.+)/i);
    return match
      ? { tool: match[1].trim(), input: match[2].trim() }
      : { tool: "finish", input: text };
  }
}

// 使用示例
const searchTool: Tool = {
  name: "web_search",
  description: "Search the web for information",
  execute: async (q) => `Results for "${q}": TypeScript 5.6 released in 2025.`,
};

const agent = new ReActAgent([searchTool], process.env.OPENAI_API_KEY!);
const result = await agent.run("What is the latest TypeScript version?");
console.log(result.answer);
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

## 🔗 权威参考链接

- [ReAct: Synergizing Reasoning and Acting in Language Models (Paper)](https://arxiv.org/abs/2210.03629)
- [LangChain ReAct Agent 文档](https://js.langchain.com/docs/modules/agents/agent_types/react/)
- [AutoGen 多 Agent 框架](https://microsoft.github.io/autogen/)
- [CrewAI Multi-Agent 系统](https://docs.crewai.com/)
- [Self-RAG: Learning to Retrieve (Paper)](https://arxiv.org/abs/2310.11511)
- [Mastra Workflow 文档](https://mastra.ai/docs/workflows/overview)
- [Google A2A Protocol](https://github.com/google/a2a)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)

---

*本模式文档为 AI Agent 基础设施的架构设计参考。*
