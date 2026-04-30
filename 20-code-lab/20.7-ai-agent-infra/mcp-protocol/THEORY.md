# MCP 协议

> **定位**：`20-code-lab/20.7-ai-agent-infra/mcp-protocol`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 AI 模型与外部工具/数据源的标准化连接问题。通过 MCP 协议实现上下文感知的能力扩展。

### 1.2 形式化基础

MCP（Model Context Protocol）是一种开放协议，定义了 LLM 应用与外部能力源之间的标准化交互契约。协议核心包含三层：

1. **传输层（Transport）**：负责字节流的可靠传递，支持 `stdio`、`SSE`（Server-Sent Events）与 `HTTP` 三种传输模式。
2. **协议层（Protocol）**：基于 JSON-RPC 2.0 定义请求/响应格式，包括 `Initialize`、`ToolCall`、`ResourceRead`、`PromptGet` 等方法。
3. **能力层（Capabilities）**：声明 Server 提供的 `tools`、`resources`、`prompts` 三大能力类别，客户端通过 `capabilities` 协商确定可用功能。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Server | 向模型暴露工具与资源的后端 | mcp-server.ts |
| Client | 发起工具调用与资源读取的 LLM 应用侧 | mcp-client.ts |
| Tool | 模型可调用的函数式能力，含 JSON Schema 描述的输入参数 | tool-registry.ts |
| Resource | 可供模型订阅或读取的上下文数据（文件、数据库记录、API 响应） | resource-provider.ts |
| Prompt | 预定义的提示模板，支持参数插值 | prompt-template.ts |
| Context | 模型调用的附加上下文信息（如用户 ID、会话状态） | context-provider.ts |

---

## 二、设计原理

### 2.1 为什么存在

LLM 需要与外部世界交互才能解决实际问题。MCP 协议标准化了模型与工具、数据源之间的连接方式，降低了集成成本。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| MCP 标准 | 工具生态共享，跨模型复用 | 需适配 Provider 实现 | 通用 LLM 应用、多模型切换 |
| 直接集成 | 简单直接，无协议开销 | 重复开发，N×M 适配问题 | 单一应用、原型验证 |
| Function Calling | 厂商生态成熟 | 厂商锁定，schema 静态 | 单一厂商深度集成 |

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
| MCP 只连接数据库 | MCP 可连接任何工具、API 和数据源（文件系统、Git、浏览器、Slack 等） |
| MCP Server 必须远程部署 | MCP Server 可以本地（stdio）、远程（SSE/HTTP）或嵌入运行 |
| MCP 替代了 Function Calling | MCP 是更高层的标准，Function Calling 是具体实现方式之一 |

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

#### MCP Client（调用远程 Server）

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const client = new Client({ name: 'chat-app', version: '1.0.0' });
const transport = new SSEClientTransport(new URL('http://localhost:3000/sse'));

await client.connect(transport);

// 1. 发现可用工具
const tools = await client.listTools();
console.log('Available tools:', tools.tools.map((t) => t.name));

// 2. 调用工具（由 LLM 根据用户意图触发）
const result = await client.callTool({
  name: 'get_forecast',
  arguments: { city: 'Beijing' },
});
console.log('Tool result:', result);
```

#### 资源订阅与增量更新

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  SubscribeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'file-watcher', version: '1.0.0' },
  { capabilities: { resources: { subscribe: true } } }
);

const fileStore = new Map<string, string>();

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: Array.from(fileStore.keys()).map((uri) => ({
    uri,
    mimeType: 'text/plain',
    name: uri.split('/').pop() ?? uri,
  })),
}));

server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  const content = fileStore.get(req.params.uri);
  if (!content) throw new Error('Resource not found');
  return { contents: [{ uri: req.params.uri, mimeType: 'text/plain', text: content }] };
});

server.setRequestHandler(SubscribeRequestSchema, async (req) => {
  // 实际生产中使用 fs.watch 或 chokidar 监听文件变化
  watchFile(req.params.uri, (newContent) => {
    fileStore.set(req.params.uri, newContent);
    server.notification({ method: 'notifications/resources/updated', params: { uri: req.params.uri } });
  });
  return {};
});
```

#### SSE 传输层 Server（HTTP 模式）

```typescript
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

const app = express();
const server = new Server({ name: 'http-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });

// 注册工具...

let transport: SSEServerTransport;

app.get('/sse', async (req, res) => {
  transport = new SSEServerTransport('/message', res);
  await server.connect(transport);
});

app.post('/message', async (req, res) => {
  await transport.handlePostMessage(req, res, req.body);
});

app.listen(3000, () => console.log('MCP SSE Server on http://localhost:3000'));
```

#### Prompt 模板与参数插值

```typescript
// prompt-template.ts — MCP Prompt 模板实现
interface PromptArgument {
  name: string;
  description: string;
  required?: boolean;
}

interface PromptTemplate {
  name: string;
  description: string;
  arguments?: PromptArgument[];
  template: string; // 支持 {{argName}} 插值
}

function renderPrompt(template: PromptTemplate, args: Record<string, string>): string {
  let result = template.template;
  for (const [key, value] of Object.entries(args)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  // 检查必填参数
  for (const arg of template.arguments ?? []) {
    if (arg.required && !args[arg.name]) {
      throw new Error(`Missing required argument: ${arg.name}`);
    }
  }
  return result;
}

const codeReviewPrompt: PromptTemplate = {
  name: 'code-review',
  description: 'Generate a structured code review for the given code snippet',
  arguments: [
    { name: 'language', description: 'Programming language', required: true },
    { name: 'code', description: 'Code snippet to review', required: true },
  ],
  template: `Please review the following {{language}} code for:
1. Code correctness and edge cases
2. Performance considerations
3. Security vulnerabilities
4. Maintainability and readability

Code:
\`\`\`{{language}}
{{code}}
\`\`\`

Provide your review in a structured format with specific line references where applicable.`,
};

// 可运行示例
const review = renderPrompt(codeReviewPrompt, {
  language: 'typescript',
  code: 'function add(a: number, b: number) { return a + b; }',
});
console.log(review);
```

#### 工具 Schema 校验（Zod + JSON Schema）

```typescript
// tool-schema-validation.ts — 使用 Zod 定义并导出 JSON Schema
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const SearchToolSchema = z.object({
  query: z.string().min(1).describe('The search query string'),
  limit: z.number().int().min(1).max(100).default(10).describe('Maximum results to return'),
  filters: z
    .object({
      dateRange: z.tuple([z.string(), z.string()]).optional(),
      category: z.string().optional(),
    })
    .optional(),
});

type SearchToolInput = z.infer<typeof SearchToolSchema>;

const searchToolJsonSchema = zodToJsonSchema(SearchToolSchema, {
  name: 'search_tool',
  $refStrategy: 'none',
});

console.log('JSON Schema for MCP Tool:', JSON.stringify(searchToolJsonSchema, null, 2));

// 运行时校验
function validateToolInput(schema: z.ZodSchema<unknown>, input: unknown) {
  const result = schema.safeParse(input);
  if (!result.success) {
    return { valid: false, errors: result.error.issues.map((i) => i.message) };
  }
  return { valid: true, data: result.data };
}

// 可运行示例
console.log(validateToolInput(SearchToolSchema, { query: 'MCP protocol', limit: 5 }));
console.log(validateToolInput(SearchToolSchema, { query: '', limit: 200 })); // 校验失败
```

#### 错误处理与通知

```typescript
// mcp-error-handling.ts — MCP 协议错误码与通知处理
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

// 标准化错误码映射
const ErrorCodeMap = {
  [ErrorCode.InvalidRequest]: { status: 400, message: 'Invalid request format' },
  [ErrorCode.MethodNotFound]: { status: 404, message: 'Method not found' },
  [ErrorCode.InvalidParams]: { status: 422, message: 'Invalid parameters' },
  [ErrorCode.InternalError]: { status: 500, message: 'Internal server error' },
} as const;

function handleMcpError(error: unknown): { code: number; message: string; details?: unknown } {
  if (error instanceof McpError) {
    const mapped = ErrorCodeMap[error.code as keyof typeof ErrorCodeMap];
    return {
      code: mapped?.status ?? 500,
      message: error.message || mapped?.message || 'Unknown error',
      details: error.data,
    };
  }
  if (error instanceof Error) {
    return { code: 500, message: error.message };
  }
  return { code: 500, message: 'Unknown error occurred' };
}

// 通知发送辅助函数
async function sendProgressNotification(
  server: any, // Server instance
  progressToken: string,
  progress: number,
  total?: number
) {
  await server.notification({
    method: 'notifications/progress',
    params: { progressToken, progress, total },
  });
}

// 可运行示例
try {
  throw new McpError(ErrorCode.InvalidParams, 'Missing required field: city');
} catch (err) {
  console.log('Handled:', handleMcpError(err));
}
```

### 4.4 扩展阅读

- [MCP Protocol 官方文档](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification — GitHub](https://github.com/modelcontextprotocol/specification)
- [Anthropic — Model Context Protocol](https://docs.anthropic.com/en/docs/build-with-claude/mcp)
- [Anthropic — MCP Introduction Blog Post](https://www.anthropic.com/news/model-context-protocol)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)
- [LangChain.js — Tools & Tool Calling](https://js.langchain.com/docs/concepts/tool_calling/)
- [JSON Schema](https://json-schema.org/) — MCP 工具参数描述的基础规范
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification) — MCP 协议消息格式基础
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk) — Python 服务端/客户端 SDK
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) — MCP 调试与测试工具
- [Claude Desktop MCP 配置](https://modelcontextprotocol.io/quickstart/user) — Claude Desktop 集成指南
- [Zod Documentation](https://zod.dev/) — TypeScript 模式验证库
- [zod-to-json-schema](https://github.com/StefanTerdell/zod-to-json-schema) — Zod 转 JSON Schema 工具
- [SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html) — Server-Sent Events 标准
- [What is MCP? — Anthropic Docs](https://docs.anthropic.com/en/docs/agents-and-tools/mcp) — Anthropic 官方 MCP 概念解释

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
