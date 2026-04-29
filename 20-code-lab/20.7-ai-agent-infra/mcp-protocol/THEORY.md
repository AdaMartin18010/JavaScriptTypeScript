# MCP 协议

> **定位**：`20-code-lab/20.7-ai-agent-infra/mcp-protocol`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 AI 模型与外部工具/数据源的标准化连接问题。通过 MCP 协议实现上下文感知的能力扩展。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Server | 向模型暴露工具与资源的后端 | mcp-server.ts |
| Context | 模型调用的附加上下文信息 | context-provider.ts |

---

## 二、设计原理

### 2.1 为什么存在

LLM 需要与外部世界交互才能解决实际问题。MCP 协议标准化了模型与工具、数据源之间的连接方式，降低了集成成本。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| MCP 标准 | 工具生态共享 | 适配成本 | 通用 LLM 应用 |
| 直接集成 | 简单直接 | 重复开发 | 单一应用 |

### 2.3 与相关技术的对比

与直接 API 调用对比：标准化降低重复开发，直接调用更灵活。

## 三、对比分析

| 维度 | MCP 协议 | 直接 API 集成 | Function Calling（OpenAI） |
|------|---------|-------------|---------------------------|
| 定位 | 模型-工具开放标准 | 点对点集成 | 厂商特定协议 |
| 传输层 | stdio / SSE / HTTP | HTTP / 任意 | HTTP JSON |
| 工具发现 | 动态能力协商（tools/resources） | 手动文档 | 静态 schema |
| 上下文管理 | 内置 resource 订阅与更新 | 手动实现 | 单次请求注入 |
| 可移植性 | 高（跨模型复用 Server） | 低 | 中（OpenAI 兼容） |
| JS/TS SDK | `@modelcontextprotocol/sdk` | 任意 HTTP 客户端 | `openai` npm 包 |

## 四、实践映射

### 4.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 MCP 协议 核心机制的理解，并观察不同实现选择带来的行为差异。

### 4.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| MCP 只连接数据库 | MCP 可连接任何工具、API 和数据源 |
| MCP Server 必须远程部署 | MCP Server 可以本地、远程或嵌入运行 |

### 4.3 代码示例

#### MCP Server（基于 stdio）实现

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'weather-server', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_forecast',
      description: 'Get weather forecast by city',
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
  const forecast = await fetchWeather(city); // 模拟外部调用
  return { content: [{ type: 'text', text: JSON.stringify(forecast) }] };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
```

### 4.4 扩展阅读

- [MCP Protocol 官方文档](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Anthropic — Model Context Protocol](https://docs.anthropic.com/en/docs/build-with-claude/mcp)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- `20.7-ai-agent-infra/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
