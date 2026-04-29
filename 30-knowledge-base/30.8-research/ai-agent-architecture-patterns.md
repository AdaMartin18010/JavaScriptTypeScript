# AI Agent 架构模式（2026 版）

> AI Agent 系统的架构设计与模式参考。
> **权威参考**: [ReAct Paper (Yao et al., 2023)](https://arxiv.org/abs/2210.03629) | [Reflexion Paper (Shinn et al., 2023)](https://arxiv.org/abs/2303.11366) | [Plan-and-Solve Prompting](https://arxiv.org/abs/2305.04091) | [AutoGPT GitHub](https://github.com/Significant-Gravitas/AutoGPT) | [LangChain Docs](https://python.langchain.com/docs/) | [MCP Specification](https://modelcontextprotocol.io/)

---

## 核心模式

### 1. ReAct（Reasoning + Acting）

交替进行推理（Thought）和行动（Action），基于环境反馈迭代：

```
Thought → Action → Observation → Thought → ...
```

**特点**：
- 适合工具调用、网页浏览、数据库查询
- 每一步都有可解释的中间过程
- 容易陷入循环，需设置最大步数

---

### 2. Plan-and-Execute（计划与执行）

先制定计划，再按步骤执行：

```
用户输入 → 计划生成 → 步骤 1 → 步骤 2 → ... → 总结
```

**特点**：
- 适合多步骤复杂任务
- 计划可一次性生成或动态调整
- 执行阶段可并行化

---

### 3. Reflexion（自我反思）

执行后通过自我评估进行迭代改进：

```
尝试 → 评估 → 反思 → 重试 → ... → 成功
```

**特点**：
- 通过失败案例学习
- 需要评估器（Evaluator）和评分机制
- 成本较高（多次 LLM 调用）

---

## Agent 架构对比表

| 维度 | ReAct | Plan-and-Solve | Reflexion | Multi-Agent |
|------|-------|---------------|-----------|-------------|
| **核心思想** | 推理-行动交替 | 先计划后执行 | 失败-反思-重试 | 多角色分工协作 |
| **适用任务** | 工具调用、搜索 | 复杂多步任务 | 代码生成、写作 | 软件开发、研究 |
| **可解释性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **执行效率** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **容错能力** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Token 成本** | 中 | 低（计划一次性） | 高（多次迭代） | 高（多角色通信） |
| **并行能力** | ❌ 串行 | ✅ 步骤可并行 | ❌ 串行迭代 | ✅ 角色可并行 |
| **代表实现** | LangChain Agent | LLMCompiler, Plan-and-Execute | Reflexion (代码) | AutoGen, CrewAI |

---

## 协议标准

| 协议 | 用途 | 状态 | 参考 |
|------|------|------|------|
| **MCP** | 模型上下文协议，标准化工具暴露 | 标准化中 | [modelcontextprotocol.io](https://modelcontextprotocol.io/) |
| **A2A** | Agent-to-Agent 通信协议 | Google 提出 | [google.github.io/A2A](https://google.github.io/A2A/) |
| **Function Calling** | LLM 结构化工具调用 | OpenAI/Anthropic/Google 支持 | [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling) |

---

## 代码示例：ReAct Agent（TypeScript）

```typescript
interface Tool {
  name: string;
  description: string;
  execute: (input: string) => Promise<string>;
}

interface ReActStep {
  thought: string;
  action: string;
  actionInput: string;
  observation: string;
}

class ReActAgent {
  private llm: LLMClient;
  private tools: Map<string, Tool>;
  private maxIterations = 10;

  constructor(llm: LLMClient, tools: Tool[]) {
    this.llm = llm;
    this.tools = new Map(tools.map(t => [t.name, t]));
  }

  async run(query: string): Promise<{ answer: string; steps: ReActStep[] }> {
    const steps: ReActStep[] = [];
    let currentQuery = query;

    for (let i = 0; i < this.maxIterations; i++) {
      // 构建 ReAct 提示
      const prompt = this.buildPrompt(currentQuery, steps);
      const response = await this.llm.complete(prompt);

      // 解析 Thought / Action / Action Input
      const parsed = this.parseResponse(response);
      
      if (parsed.action === 'Final Answer') {
        return { answer: parsed.actionInput, steps };
      }

      // 执行工具
      const tool = this.tools.get(parsed.action);
      const observation = tool 
        ? await tool.execute(parsed.actionInput)
        : `Error: Tool ${parsed.action} not found`;

      steps.push({
        thought: parsed.thought,
        action: parsed.action,
        actionInput: parsed.actionInput,
        observation
      });

      currentQuery += `\nObservation: ${observation}`;
    }

    throw new Error('Max iterations exceeded');
  }

  private buildPrompt(query: string, steps: ReActStep[]): string {
    const toolDesc = Array.from(this.tools.values())
      .map(t => `${t.name}: ${t.description}`)
      .join('\n');

    let prompt = `You are a reasoning agent. Answer the following question by thinking step by step and using tools when needed.\n\n`;
    prompt += `Available tools:\n${toolDesc}\n\n`;
    prompt += `Use this format:\nThought: [your reasoning]\nAction: [tool name or "Final Answer"]\nAction Input: [input to tool or final answer]\n\n`;
    prompt += `Question: ${query}\n\n`;

    for (const step of steps) {
      prompt += `Thought: ${step.thought}\nAction: ${step.action}\nAction Input: ${step.actionInput}\nObservation: ${step.observation}\n\n`;
    }

    return prompt;
  }

  private parseResponse(response: string) {
    const thoughtMatch = response.match(/Thought:\s*(.+)/);
    const actionMatch = response.match(/Action:\s*(.+)/);
    const inputMatch = response.match(/Action Input:\s*(.+)/);

    return {
      thought: thoughtMatch?.[1]?.trim() || '',
      action: actionMatch?.[1]?.trim() || '',
      actionInput: inputMatch?.[1]?.trim() || ''
    };
  }
}

// 使用示例
const searchTool: Tool = {
  name: 'Search',
  description: 'Search the web for information',
  execute: async (q) => `Search results for "${q}": ...`
};

const calculatorTool: Tool = {
  name: 'Calculator',
  description: 'Perform mathematical calculations',
  execute: async (expr) => String(eval(expr)) // 生产环境需安全沙箱
};

const agent = new ReActAgent(openaiClient, [searchTool, calculatorTool]);
const result = await agent.run('What is the population of Tokyo divided by 2?');
console.log(result.answer);
// Steps 会展示完整的推理链
```

> 📖 参考：[ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) | [LangChain ReAct Agent](https://python.langchain.com/docs/modules/agents/agent_types/react/)

---

## Multi-Agent 协作架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Orchestrator                            │
│         (任务分解、路由、结果聚合)                            │
└─────────────────────────────────────────────────────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│  Planner   │ │  Executor  │ │   Critic   │ │ Researcher │
│   Agent    │ │   Agent    │ │   Agent    │ │   Agent    │
├────────────┤ ├────────────┤ ├────────────┤ ├────────────┤
│ 任务分解   │ │ 工具调用   │ │ 结果校验   │ │ 信息检索   │
│ 依赖排序   │ │ API 调用   │ │ 质量评分   │ │ 知识库查询 │
│ 生成计划   │ │ 代码执行   │ │ 反馈生成   │ │ 文档阅读   │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                          │
                          ▼
                   ┌────────────┐
                   │  Shared    │
                   │  Memory    │
                   │ (Vector DB)│
                   └────────────┘
```

> 📖 参考：[AutoGen Multi-Agent Conversation](https://microsoft.github.io/autogen/) | [CrewAI Documentation](https://docs.crewai.com/)

---

## Agent 评估指标

| 指标 | 说明 | 测量方式 |
|------|------|----------|
| **任务成功率** | 完成用户意图的比例 | 人工标注 / 自动评判 |
| **平均步数** | 完成任务的 LLM 调用次数 | 日志统计 |
| **Token 效率** | 每任务消耗的平均 Token 数 | API 用量统计 |
| **延迟** | 端到端响应时间 | 计时器 |
| **幻觉率** | 生成虚假信息的频率 | 事实核查 / NLI 模型 |
| **工具调用准确率** | 正确选择工具的比例 | 正确工具 / 总调用 |

---

*最后更新: 2026-04-29*
