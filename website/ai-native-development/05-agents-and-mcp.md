# 05. Agents 与 MCP 协议

## 什么是 Agent？

Agent = LLM + 工具 + 记忆 + 规划能力。能自主决策、调用工具、完成任务。

```
传统应用: 用户 → [固定流程] → 结果
Agent:    用户 → [LLM 决策 → 工具调用 → 观察 → 再决策...] → 结果
```

## MCP: Model Context Protocol

MCP 是 Anthropic 提出的开放协议，标准化 LLM 与外部工具的交互。

```
┌─────────┐     ┌─────────────┐     ┌──────────┐
│  LLM    │◀───▶│  MCP Host   │◀───▶│  Tools   │
│ (Claude)│     │ (Client)    │     │ (Server) │
└─────────┘     └─────────────┘     └──────────┘
```

## MCP Server 示例

```typescript
// server.ts —— MCP Server
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'weather-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'get_weather',
    description: '获取指定城市的天气',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名称' },
      },
      required: ['city'],
    },
  }],
}));

server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'get_weather') {
    const { city } = request.params.arguments;
    const weather = await fetchWeather(city);
    return { content: [{ type: 'text', text: JSON.stringify(weather) }] };
  }
  throw new Error('Unknown tool');
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Agent 框架对比

| 框架 | 特点 | 适用场景 |
|------|------|----------|
| **LangGraph** | 图结构工作流 | 复杂多步骤任务 |
| **AutoGen** | 多 Agent 对话 | 协作编码、讨论 |
| **Vercel AI SDK** | 简化工具调用 | Web 应用集成 |

## LangGraph 示例

```typescript
import { StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({ model: 'gpt-4o' });

// 定义状态
interface AgentState {
  messages: BaseMessage[];
  nextStep: string;
}

// 定义节点
const graph = new StateGraph<AgentState>({ channels: { /* ... */ } })
  .addNode('agent', async (state) => {
    const response = await model.invoke(state.messages);
    return { messages: [...state.messages, response] };
  })
  .addNode('tool', async (state) => {
    // 执行工具调用
    const toolResult = await executeTool(state.messages);
    return { messages: [...state.messages, toolResult] };
  })
  .addEdge('agent', 'tool')
  .addEdge('tool', 'agent')
  .setEntryPoint('agent');

const app = graph.compile();
const result = await app.invoke({ messages: [new HumanMessage('查询北京天气')] });
```

## 延伸阅读

- [Model Context Protocol 官方](https://modelcontextprotocol.io/)
- [LangGraph 文档](https://langchain-ai.github.io/langgraphjs/)
- [AutoGen 文档](https://microsoft.github.io/autogen/)
