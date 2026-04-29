# AI Agent 实验室 — 架构设计

## 1. 架构概述

本模块实现了完整的 AI Agent 运行时，包括感知、规划、记忆和工具调用四个核心子系统。展示从用户输入到自主任务执行的完整 Agent 循环。架构采用"观察→思考→行动"（ReAct）的认知循环模型，每个循环迭代中 Agent 感知环境状态、检索相关记忆、制定行动计划、执行工具调用，并将观察结果反馈到记忆系统，形成持续学习闭环。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           用户 / 环境 (User / Env)                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Input (Text / Image / Audio / Tool Result)            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         感知层 (Perception Layer)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │ Input Parser │  │  Context     │  │ Multimodal  │                   │
│  │ (Intent /    │  │  Assembler   │  │  Handler    │                   │
│  │  Entity NER) │  │ (System +    │  │ (Vision /   │                   │
│  │              │  │  History)    │  │  Audio)     │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         记忆层 (Memory Layer)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Working    │  │   Episodic   │  │   Semantic   │                   │
│  │   Memory     │  │   Memory     │  │   Memory     │                   │
│  │ (Current     │  │ (Past        │  │ (Vector DB   │                   │
│  │  Context)    │  │  Experiences)│  │  Knowledge)  │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         规划层 (Planning Layer)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Task       │  │   Strategy   │  │    Plan      │                   │
│  │  Decomposer  │  │   Selector   │  │   Executor   │                   │
│  │ (Sub-task    │  │ (ReAct /     │  │ (Step-by-    │                   │
│  │  Graph)      │  │  Reflection) │  │  step Exec)  │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         行动层 (Action Layer)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Tool       │  │    MCP       │  │    A2A       │                   │
│  │   Registry   │  │   Client     │  │   Agent      │                   │
│  │ (Schema +    │  │ (Model       │  │ (Multi-Agent │                   │
│  │  Executor)   │  │  Context)    │  │  Protocol)   │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         LLM 核心 (LLM Core)                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │         OpenAI / Anthropic / Gemini / Local (Ollama)             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 感知层（Perception）

| 组件 | 职责 | 关键技术 | 输入模态 |
|------|------|----------|----------|
| Input Parser | 自然语言理解，意图识别 | Prompt 工程 + JSON Schema | 文本 |
| Context Assembler | 历史对话、系统提示、环境信息组装 | Token 预算管理 | 文本 |
| Multimodal Handler | 文本、图像、音频多模态输入处理 | Base64 / URL 编码 | 多模态 |

### 3.2 规划层（Planning）

| 组件 | 职责 | 算法 | 适用场景 |
|------|------|------|----------|
| Task Decomposer | 复杂任务分解为可执行子任务 | 递归分解 / DAG | 多步骤任务 |
| Strategy Selector | ReAct / Plan-and-Solve / Reflection 策略选择 | 策略模式 | 动态选择 |
| Plan Executor | 计划步骤的顺序执行和状态跟踪 | 状态机 | 计划执行 |

### 3.3 记忆层（Memory）

| 组件 | 职责 | 存储介质 | 检索方式 |
|------|------|----------|----------|
| Working Memory | 当前对话上下文管理 | 内存 / Redis | 直接索引 |
| Episodic Memory | 历史经验存储和检索 | 向量 DB + 时间索引 | 相似度 + 时间 |
| Semantic Memory | 向量数据库长期知识存储 | pgvector / Chroma | 向量相似度 |

### 3.4 行动层（Action）

| 组件 | 职责 | 协议标准 | 互操作性 |
|------|------|----------|----------|
| Tool Registry | 工具定义、参数 Schema、执行器绑定 | JSON Schema | 高 |
| MCP Client | Model Context Protocol 客户端实现 | MCP 2024-11-05 | 跨模型 |
| A2A Agent | Agent-to-Agent 协议实现，多 Agent 协作 | A2A 草案 | 跨平台 |

## 4. 数据流

```
User Input → Perception → Memory Retrieval → Planning → Action (Tool Call/Response)
                ↑                                              ↓
           Memory Update ← Observation ← Tool Result
```

## 5. 技术栈对比

| Agent 框架 | 规划能力 | 记忆系统 | 工具协议 | 多 Agent | 类型安全 | 适用场景 |
|------------|----------|----------|----------|----------|----------|----------|
| 本实验室 | ReAct + Reflection | 三级记忆 | MCP + A2A | A2A | ★★★★★ | 学习/原型 |
| LangChain | LCEL / ReAct | 多种 | 自定义 | 有限 | ★★★ | 快速原型 |
| LangGraph | 图状态机 | 图记忆 | LangChain | 有 | ★★★ | 复杂工作流 |
| AutoGen | 群聊 | 上下文 | 自定义 | ★★★★★ | ★★ | 多 Agent 研究 |
| CrewAI | 角色驱动 | 短期 | 自定义 | ★★★★ | ★★ | 角色协作 |
| Vercel AI SDK | Stream / Tool | 无内置 | Tool Call | 无 | ★★★★★ | 产品集成 |
| OpenAI Agents SDK | Swarm / Handoff | 上下文 | 函数调用 | 有 | ★★★ | OpenAI 生态 |

## 6. 代码示例

### 6.1 Agent 运行时核心

```typescript
// ai-agent-lab/src/core/AgentRuntime.ts
interface AgentConfig {
  llm: LLMClient;
  memory: MemorySystem;
  tools: ToolRegistry;
  strategy: 'react' | 'plan-and-solve' | 'reflection';
  maxIterations: number;
}

interface AgentStep {
  thought: string;
  action?: { tool: string; input: object };
  observation?: string;
  isFinal: boolean;
  answer?: string;
}

class AgentRuntime {
  constructor(private config: AgentConfig) {}

  async run(input: string): Promise<string> {
    const context = await this.config.memory.assembleContext(input);
    let steps: AgentStep[] = [];

    for (let i = 0; i < this.config.maxIterations; i++) {
      const step = await this.executeStep(context, steps);
      steps.push(step);

      if (step.isFinal) {
        await this.config.memory.storeInteraction(input, step.answer!);
        return step.answer!;
      }

      if (step.action) {
        const result = await this.config.tools.execute(
          step.action.tool,
          step.action.input
        );
        step.observation = JSON.stringify(result);
      }
    }

    throw new Error('Max iterations reached without final answer');
  }

  private async executeStep(
    context: string,
    history: AgentStep[]
  ): Promise<AgentStep> {
    const prompt = this.buildReActPrompt(context, history);
    const response = await this.config.llm.complete(prompt, {
      responseFormat: { type: 'json_schema', schema: stepSchema },
    });

    return JSON.parse(response) as AgentStep;
  }

  private buildReActPrompt(context: string, history: AgentStep[]): string {
    const toolDescriptions = this.config.tools.describeAll();
    return `
You are a reasoning agent. Answer the user's question using the available tools.
Available tools:
${toolDescriptions}

Context: ${context}

Previous steps:
${history.map(s => `Thought: ${s.thought}\nAction: ${JSON.stringify(s.action)}\nObservation: ${s.observation}`).join('\n')}

Respond with JSON matching this schema:
{ "thought": "your reasoning", "action": { "tool": "name", "input": {} } | null, "isFinal": boolean, "answer": "final answer if isFinal" }
`.trim();
  }
}
```

### 6.2 工具注册表与 MCP 客户端

```typescript
// ai-agent-lab/src/tools/ToolRegistry.ts
interface ToolDefinition {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (input: any) => Promise<any>;
}

class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  describeAll(): string {
    return Array.from(this.tools.values())
      .map(t => `- ${t.name}: ${t.description}\n  Parameters: ${JSON.stringify(t.parameters)}`)
      .join('\n');
  }

  async execute(name: string, input: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    return tool.execute(input);
  }

  // MCP 协议适配
  toMCPFormat(): Array<{ name: string; description: string; inputSchema: JSONSchema }> {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.parameters,
    }));
  }
}

// 内置工具示例
const calculatorTool: ToolDefinition = {
  name: 'calculator',
  description: 'Perform basic arithmetic operations',
  parameters: {
    type: 'object',
    properties: {
      operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
      a: { type: 'number' },
      b: { type: 'number' },
    },
    required: ['operation', 'a', 'b'],
  },
  execute: async ({ operation, a, b }) => {
    switch (operation) {
      case 'add': return a + b;
      case 'subtract': return a - b;
      case 'multiply': return a * b;
      case 'divide': return b !== 0 ? a / b : 'Error: division by zero';
    }
  },
};
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| Agent 模式 | ReAct + Reflection | 灵活且可自我修正 |
| 记忆存储 | 向量 DB + 图数据库 | 语义检索 + 关系推理 |
| 工具协议 | MCP + A2A | 开放标准，互操作 |

## 8. 质量属性

- **自主性**: 无需人工干预完成多步任务
- **可解释性**: 思考过程和决策理由可追溯
- **安全性**: 工具调用沙箱，防止危险操作

## 9. 参考链接

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) — ReAct 论文 (Yao et al., 2022)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) — Anthropic 开放的模型上下文协议
- [A2A Protocol (Google)](https://google.github.io/A2A/) — Google Agent-to-Agent 协议
- [LangChain Documentation](https://python.langchain.com/docs/) — 主流 Agent 框架文档
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling) — OpenAI 工具调用指南
- [AI Agent Design Patterns - Microsoft](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/index.html) — 微软 AutoGen Agent 设计模式
