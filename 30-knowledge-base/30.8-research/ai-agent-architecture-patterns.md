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

## 代码示例：Plan-and-Execute Agent（TypeScript）

```typescript
interface Plan {
  steps: string[];
  dependencies: number[][]; // step index -> dependency step indices
}

class PlanAndExecuteAgent {
  private llm: LLMClient;
  private tools: Map<string, Tool>;

  constructor(llm: LLMClient, tools: Tool[]) {
    this.llm = llm;
    this.tools = new Map(tools.map(t => [t.name, t]));
  }

  async run(query: string): Promise<{ result: string; plan: Plan; executed: string[] }> {
    // Phase 1: Plan
    const plan = await this.generatePlan(query);
    
    // Phase 2: Execute with dependency-aware scheduling
    const results = new Map<number, string>();
    const executed: string[] = [];

    for (let i = 0; i < plan.steps.length; i++) {
      const context = plan.dependencies[i]
        .map(depIdx => `Step ${depIdx + 1} result: ${results.get(depIdx)}`)
        .join('\n');

      const stepPrompt = `Plan step ${i + 1}: ${plan.steps[i]}\n${context}\nExecute using tools if needed.`;
      const result = await this.executeStep(stepPrompt);
      results.set(i, result);
      executed.push(result);
    }

    // Phase 3: Synthesize
    const final = await this.llm.complete(
      `Based on the following executed steps, answer the original query:\n${executed.join('\n')}\n\nQuery: ${query}`
    );
    return { result: final, plan, executed };
  }

  private async generatePlan(query: string): Promise<Plan> {
    const response = await this.llm.complete(
      `Create a step-by-step plan to answer: ${query}. Output as JSON: { "steps": [...], "dependencies": [...] }`
    );
    return JSON.parse(response) as Plan;
  }

  private async executeStep(prompt: string): Promise<string> {
    // Simplified: in production, use ReAct-style tool selection here
    return this.llm.complete(prompt);
  }
}
```

## 代码示例：Reflexion Agent（自我反思循环）

```typescript
interface Attempt {
  output: string;
  evaluation: 'pass' | 'fail' | 'partial';
  reflection: string;
}

class ReflexionAgent {
  private llm: LLMClient;
  private maxAttempts = 3;

  async run(task: string): Promise<{ final: string; history: Attempt[] }> {
    const history: Attempt[] = [];

    for (let i = 0; i < this.maxAttempts; i++) {
      const previous = history.map(h => `Attempt ${history.indexOf(h) + 1}:\nOutput: ${h.output}\nReflection: ${h.reflection}`).join('\n\n');
      
      const output = await this.llm.complete(
        `Task: ${task}\n${previous}\n\nPlease complete the task, learning from past reflections.`
      );

      const evalResult = await this.evaluate(task, output);
      history.push({ output, evaluation: evalResult.score, reflection: evalResult.feedback });

      if (evalResult.score === 'pass') break;
    }

    return { final: history[history.length - 1].output, history };
  }

  private async evaluate(task: string, output: string): Promise<{ score: 'pass' | 'fail' | 'partial'; feedback: string }> {
    const prompt = `Evaluate if the following output satisfies the task.\nTask: ${task}\nOutput: ${output}\nRespond with JSON: { "score": "pass|fail|partial", "feedback": "..." }`;
    const response = await this.llm.complete(prompt);
    return JSON.parse(response);
  }
}
```

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

## 参考链接

- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling) — 结构化工具调用官方指南
- [Anthropic Tool Use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) — Claude 工具使用最佳实践
- [Vercel AI SDK — Agents](https://sdk.vercel.ai/docs/ai-sdk-core/agents) — TypeScript AI Agent 开发 SDK
- [Google A2A Protocol](https://google.github.io/A2A/) — Agent-to-Agent 通信协议规范
- [MCP Specification](https://modelcontextprotocol.io/) — 模型上下文协议官方文档
- [LangChain.js Documentation](https://js.langchain.com/) — JavaScript LangChain 官方文档
- [ReAct Paper (arXiv)](https://arxiv.org/abs/2210.03629) — 推理+行动语言模型论文
- [Reflexion Paper (arXiv)](https://arxiv.org/abs/2303.11366) — 自我反思智能体论文

## 进阶代码示例

### MCP Tool Server 最小实现

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'math-server', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'add',
      description: 'Add two numbers',
      inputSchema: {
        type: 'object',
        properties: { a: { type: 'number' }, b: { type: 'number' } },
        required: ['a', 'b'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'add') {
    const { a, b } = request.params.arguments as { a: number; b: number };
    return { content: [{ type: 'text', text: String(a + b) }] };
  }
  throw new Error('Tool not found');
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Multi-Agent 编排器（简化版）

```typescript
interface Agent {
  role: string;
  execute: (task: string, context: string) => Promise<string>;
}

class Orchestrator {
  private agents: Map<string, Agent> = new Map();

  register(agent: Agent) {
    this.agents.set(agent.role, agent);
  }

  async dispatch(plan: { role: string; task: string }[]): Promise<string[]> {
    const results: string[] = [];
    for (const step of plan) {
      const agent = this.agents.get(step.role);
      if (!agent) throw new Error(`Agent ${step.role} not found`);
      const context = results.join('\n');
      const result = await agent.execute(step.task, context);
      results.push(result);
    }
    return results;
  }
}

// 使用
const planner: Agent = { role: 'planner', execute: async (t) => `Plan: ${t}` };
const coder: Agent = { role: 'coder', execute: async (t) => `Code: ${t}` };
const orchestrator = new Orchestrator();
orchestrator.register(planner);
orchestrator.register(coder);
const output = await orchestrator.dispatch([
  { role: 'planner', task: 'Design API' },
  { role: 'coder', task: 'Implement endpoints' },
]);
```

### A2A 协议消息格式示例

```json
{
  "id": "msg-001",
  "type": "agent:message",
  "from": "agent://planner/001",
  "to": "agent://coder/002",
  "content": {
    "task": "Implement user authentication",
    "priority": "high",
    "deadline": "2026-05-01T00:00:00Z"
  },
  "protocol": "A2A/1.0"
}
```

---

## 扩展参考链接

- [MCP Specification](https://modelcontextprotocol.io/) — 模型上下文协议官方文档
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) — 官方 SDK 仓库
- [Google A2A Protocol](https://google.github.io/A2A/) — Agent-to-Agent 通信协议规范
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling) — 结构化工具调用官方指南
- [Anthropic Tool Use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) — Claude 工具使用最佳实践
- [Vercel AI SDK — Agents](https://sdk.vercel.ai/docs/ai-sdk-core/agents) — TypeScript AI Agent 开发 SDK
- [LangChain.js Documentation](https://js.langchain.com/) — JavaScript LangChain 官方文档
- [ReAct Paper (arXiv)](https://arxiv.org/abs/2210.03629) — 推理+行动语言模型论文
- [Reflexion Paper (arXiv)](https://arxiv.org/abs/2303.11366) — 自我反思智能体论文
- [AutoGen Multi-Agent Conversation](https://microsoft.github.io/autogen/) — 微软多 Agent 对话框架
- [CrewAI Documentation](https://docs.crewai.com/) — 多角色 Agent 协作平台文档

---

*最后更新: 2026-04-29*
