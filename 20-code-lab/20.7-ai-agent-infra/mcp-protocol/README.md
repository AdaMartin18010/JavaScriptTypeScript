# MCP 协议代码实验室

> **定位**：`20-code-lab/20.7-ai-agent-infra/mcp-protocol/`

---

## 一、MCP 核心概念

**MCP（Model Context Protocol）**是 Anthropic 推出的开放标准，定义了 AI 模型与外部工具之间的通信协议。

### 1.1 架构

```
┌─────────────┐      MCP      ┌─────────────┐
│   Client    │ ◀──────────▶ │   Server    │
│  (AI SDK)   │   JSON-RPC   │  (Tool API) │
└─────────────┘              └─────────────┘
```

### 1.2 核心原语

| 原语 | 说明 |
|------|------|
| **Tools** | 可调用的函数/工具 |
| **Resources** | 模型可读取的数据源 |
| **Prompts** | 预定义的提示模板 |

---

## 二、代码示例

### 2.1 MCP Server（TypeScript）

```typescript
// server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'weather-server',
  version: '1.0.0'
}, {
  capabilities: { tools: {} }
});

server.setRequestHandler('tools/list', async () => {
  return {
    tools: [{
      name: 'get_weather',
      description: '获取指定城市的天气',
      inputSchema: {
        type: 'object',
        properties: {
          city: { type: 'string' }
        },
        required: ['city']
      }
    }]
  };
});

server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'get_weather') {
    const { city } = request.params.arguments as { city: string };
    return {
      content: [{ type: 'text', text: `${city} 天气：晴天 25°C` }]
    };
  }
  throw new Error('Unknown tool');
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### 2.2 MCP Client

```typescript
// client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({ name: 'ai-app', version: '1.0.0' });
await client.connect(transport);

const tools = await client.listTools();
const result = await client.callTool({
  name: 'get_weather',
  arguments: { city: '北京' }
});
```

---

## 三、THEORY.md

### 理论深化：MCP 的设计哲学

MCP 解决的核心问题是 **「工具碎片化」**：每个 AI 应用都需要单独集成每个工具（GitHub、Slack、数据库等）。MCP 通过标准化协议，使任何支持 MCP 的客户端都能调用任何 MCP 服务器。

**与 Function Calling 的对比**：

| 维度 | Function Calling | MCP |
|------|-----------------|-----|
| 标准化 | 各厂商不同 | 统一协议 |
| 发现 | 硬编码 | 动态发现 |
| 生态 | 孤立 | 互通 |
| 传输 | HTTP | stdio / SSE / HTTP |

---

*本模块为 L2 代码实验室的 MCP 协议专项。*
