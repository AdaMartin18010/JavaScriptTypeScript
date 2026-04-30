---
dimension: 应用领域
application-domain: AI 与 Agent 应用
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: AI Agent 实战 — MCP 协议、多 Agent 工作流与工具调用
- **模块编号**: 94-ai-agent-lab

## 边界说明

本模块聚焦 AI Agent 的实战实现，包括：
- MCP Server 最小实现
- Vercel AI SDK Tool Calling
- 多 Agent 协作工作流
- Agent 记忆层与工具注册

底层 AI 框架对比和模型 API 本身不属于本模块范围（请参见 `30-knowledge-base/30.2-categories/28-ai-agent-infrastructure.md`）。

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `mcp-server-demo.ts` | Model Context Protocol 最小 Server 实现 | — |
| `vercel-ai-sdk-tool-calling.ts` | Vercel AI SDK 工具调用与流式响应 | — |
| `multi-agent-workflow.ts` | 多 Agent 编排与任务委托 | `agent-coordination.test.ts` |
| `agent-memory.ts` | 短期记忆 / 长期记忆向量存储 | `agent-memory.test.ts` |
| `tool-registry.ts` | 工具注册表与 JSON Schema 生成 | `tool-registry.test.ts` |
| `agent-coordination.ts` | Agent 间通信与共识机制 | `agent-coordination.test.ts` |
| `ARCHITECTURE.md` | Agent 系统架构设计 | — |
| `index.ts` | 模块统一导出 | — |

## 代码示例

### MCP Server 最小实现

```typescript
// mcp-server-demo.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'weather-server', version: '1.0.0' }, {
  capabilities: { tools: {} },
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_weather',
      description: 'Get current weather for a city',
      inputSchema: {
        type: 'object',
        properties: { city: { type: 'string' } },
        required: ['city'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { city } = request.params.arguments as { city: string };
  const weather = await fetchWeather(city);
  return { content: [{ type: 'text', text: JSON.stringify(weather) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### 工具注册表动态调用

```typescript
// tool-registry.ts
export class ToolRegistry {
  private tools = new Map<
    string,
    { schema: unknown; execute: (args: unknown) => Promise<unknown> }
  >();

  register(name: string, schema: unknown, execute: (args: unknown) => Promise<unknown>) {
    this.tools.set(name, { schema, execute });
  }

  async call(name: string, args: unknown) {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    return tool.execute(args);
  }

  list() {
    return Array.from(this.tools.entries()).map(([name, { schema }]) => ({
      name,
      schema,
    }));
  }
}

// Zod schema 自动生成 JSON Schema
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const calculatorSchema = z.object({ a: z.number(), b: z.number(), op: z.enum(['+', '-', '*', '/']) });

const registry = new ToolRegistry();
registry.register(
  'calculator',
  zodToJsonSchema(calculatorSchema),
  async (args) => {
    const { a, b, op } = calculatorSchema.parse(args);
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 'Division by zero';
    }
  }
);
```

### 多 Agent 工作流编排

```typescript
// multi-agent-workflow.ts
export interface AgentNode {
  id: string;
  role: string;
  instructions: string;
  delegateTo?: string[];
}

export class AgentWorkflow {
  private agents = new Map<string, AgentNode>();

  addAgent(node: AgentNode) {
    this.agents.set(node.id, node);
  }

  async execute(startId: string, input: string): Promise<string> {
    const agent = this.agents.get(startId)!;
    // 简化：实际接入 LLM SDK 进行推理与委托
    const result = await this.runLLM(agent.instructions, input);
    if (agent.delegateTo) {
      for (const nextId of agent.delegateTo) {
        await this.execute(nextId, result);
      }
    }
    return result;
  }

  private async runLLM(instructions: string, input: string): Promise<string> {
    // LLM 调用占位
    return `Result of [${instructions}] on "${input}"`;
  }
}
```

### Vercel AI SDK 流式工具调用

```typescript
// vercel-ai-sdk-tool-calling.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const weatherTool = tool({
  description: 'Get weather for a city',
  parameters: z.object({ city: z.string() }),
  execute: async ({ city }) => {
    const res = await fetch(`https://api.weather.example.com/${city}`);
    return res.json();
  },
});

async function runAgent() {
  const result = streamText({
    model: openai('gpt-4o'),
    prompt: 'What is the weather in Tokyo?',
    tools: { weather: weatherTool },
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}
```

### Agent 记忆层（向量存储检索）

```typescript
// agent-memory.ts
export class AgentMemory {
  private shortTerm: string[] = [];
  private longTerm = new Map<string, number[]>(); // 简化的向量存储

  addShortTerm(message: string) {
    this.shortTerm.push(message);
    if (this.shortTerm.length > 20) this.shortTerm.shift();
  }

  async storeLongTerm(key: string, embedding: number[]) {
    this.longTerm.set(key, embedding);
  }

  cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] ** 2;
      normB += b[i] ** 2;
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async retrieveRelevant(query: number[], topK = 3): Promise<string[]> {
    const scored = Array.from(this.longTerm.entries())
      .map(([key, emb]) => ({ key, score: this.cosineSimilarity(query, emb) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    return scored.map(s => s.key);
  }
}
```

### ReAct 循环实现

```typescript
// react-loop.ts — 推理-行动循环

interface ReActStep {
  thought: string;
  action?: { tool: string; input: unknown };
  observation?: string;
}

async function reactLoop(
  query: string,
  tools: Map<string, (input: unknown) => Promise<unknown>>,
  llm: { complete(prompt: string): Promise<string> },
  maxSteps = 10
): Promise<string> {
  const history: ReActStep[] = [];

  for (let step = 0; step < maxSteps; step++) {
    const prompt = `
Question: ${query}
${history.map(h => `Thought: ${h.thought}\nAction: ${JSON.stringify(h.action)}\nObservation: ${h.observation}`).join('\n')}
Thought:`;

    const response = await llm.complete(prompt);
    const thought = response.trim();

    // 简单解析：如果包含 "Action:" 则提取工具调用
    const actionMatch = thought.match(/Action:\s*(\w+)\s*\((.*)\)/);
    if (actionMatch) {
      const [, toolName, toolInput] = actionMatch;
      const toolFn = tools.get(toolName);
      if (toolFn) {
        const observation = String(await toolFn(JSON.parse(toolInput)));
        history.push({ thought, action: { tool: toolName, input: JSON.parse(toolInput) }, observation });
        if (observation.includes('FINAL_ANSWER')) return observation.replace('FINAL_ANSWER: ', '');
      }
    } else {
      // 无 Action，直接作为答案
      return thought;
    }
  }

  return 'Max steps exceeded';
}
```

### 结构化输出解析（Zod + LLM）

```typescript
// structured-output.ts — 强制 LLM 返回可验证的结构化数据

import { z } from 'zod';

const PersonSchema = z.object({
  name: z.string(),
  age: z.number().int().positive(),
  email: z.string().email(),
  skills: z.array(z.string()).min(1),
});

type Person = z.infer<typeof PersonSchema>;

async function extractPerson(text: string, llm: { complete(prompt: string): Promise<string> }): Promise<Person> {
  const prompt = `
Extract person information from the following text as valid JSON matching this schema:
${JSON.stringify(PersonSchema.shape, null, 2)}

Text: """${text}"""

Respond with JSON only, no markdown.`;

  const response = await llm.complete(prompt);
  const parsed = JSON.parse(response);
  return PersonSchema.parse(parsed); // Zod 验证，失败则抛出
}
```

## 关联模块

- `33-ai-integration` — AI 集成
- `89-autonomous-systems` — 自主系统
- `examples/ai-agent-production/` — 生产级示例
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Model Context Protocol | 规范 | [modelcontextprotocol.io](https://modelcontextprotocol.io) |
| Vercel AI SDK | 文档 | [sdk.vercel.ai/docs](https://sdk.vercel.ai/docs) |
| LangChain.js Docs | 文档 | [js.langchain.com](https://js.langchain.com) |
| LangGraph Documentation | 文档 | [langchain-ai.github.io/langgraphjs](https://langchain-ai.github.io/langgraphjs/) |
| Anthropic — Building Effective Agents | 指南 | [anthropic.com/research/building-effective-agents](https://www.anthropic.com/research/building-effective-agents) |
| OpenAI Function Calling | 文档 | [platform.openai.com/docs/guides/function-calling](https://platform.openai.com/docs/guides/function-calling) |
| AutoGen — Multi-Agent Conversation | 文档 | [microsoft.github.io/autogen](https://microsoft.github.io/autogen) |
| MCP SDK for TypeScript | 源码 | [github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) |
| Vercel AI SDK GitHub | 源码 | [github.com/vercel/ai](https://github.com/vercel/ai) |
| ReAct Paper — Reasoning + Acting | 论文 | [arxiv.org/abs/2210.03629](https://arxiv.org/abs/2210.03629) |
| OpenAI — Structured Outputs | 文档 | [platform.openai.com/docs/guides/structured-outputs](https://platform.openai.com/docs/guides/structured-outputs) |
| Google — AI Agent Whitepaper | 白皮书 | [ai.google/discover/agentic-ai](https://ai.google/discover/agentic-ai/) |
| Hugging Face — Agents Course | 课程 | [huggingface.co/learn/agents-course](https://huggingface.co/learn/agents-course) |
| Zod — Schema Validation | 文档 | [zod.dev](https://zod.dev) |

---

*最后更新: 2026-04-30*
