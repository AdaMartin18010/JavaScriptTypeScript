---
title: MCP (Model Context Protocol) 完全指南
description: "Awesome JS/TS Ecosystem 指南: MCP (Model Context Protocol) 完全指南"
---

# MCP (Model Context Protocol) 完全指南

> 深度解析 Model Context Protocol 协议规范、Server/Client 开发实践、Transport 选型与安全最佳实践。

---

## 1. MCP 概述

### 1.1 什么是 MCP

**Model Context Protocol (MCP)** 是由 Anthropic 于 2024 年提出的开放协议，旨在标准化 AI 应用与外部数据源、工具之间的集成方式。

```
┌─────────────┐      MCP Protocol      ┌─────────────┐
│   AI Host   │  ═══════════════════►  │ MCP Server  │
│  (Claude /  │   JSON-RPC 2.0 over    │  (Tools /   │
│  Cursor /   │   stdio / SSE / HTTP   │  Resources /│
│  Claude Code│◄═════════════════════  │  Prompts)   │
└─────────────┘                        └─────────────┘
```

### 1.2 MCP 与 Function Calling 的区别

| 维度 | Function Calling | MCP |
|------|-----------------|-----|
| **标准化** | 厂商私有格式 (OpenAI/Anthropic) | 开放协议，跨厂商兼容 |
| **能力范围** | 仅工具调用 | 工具 + 资源 + 提示模板 |
| **发现机制** | 静态定义 | 运行时动态发现 |
| **生命周期** | 单次调用 | 有状态连接，支持订阅更新 |
| **传输层** | HTTP API 内置 | stdio / SSE / HTTP 可选 |

---

## 2. 架构核心概念

### 2.1 Server / Client / Host 三角关系

```
┌─────────────────────────────────────────────────────┐
│                      Host                            │
│  (Claude Desktop / Cursor / Claude Code / 自建应用) │
│                                                      │
│  ┌──────────────┐          ┌──────────────┐         │
│  │  MCP Client  │◄────────►│  MCP Client  │         │
│  │  (stdio)     │  MCP     │  (SSE)       │         │
│  └──────┬───────┘ Protocol └──────┬───────┘         │
│         │                         │                  │
│         └───────────┬─────────────┘                  │
│                     │                                │
│              ┌──────▼──────┐                         │
│              │  AI Model   │                         │
│              │ (Claude 3.5)│                         │
│              └─────────────┘                         │
└─────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
  ┌──────────────┐           ┌──────────────┐
  │ File System  │           │   Weather    │
  │ MCP Server   │           │  MCP Server  │
  └──────────────┘           └──────────────┘
```

**角色定义**：

- **Host**: 运行 AI 的应用程序，负责协调模型与客户端
- **Client**: Host 内的 MCP 连接管理器，维护与 Server 的传输连接
- **Server**: 提供工具、资源、提示模板的独立进程/服务

### 2.2 核心原语

| 原语 | 用途 | 示例 |
|------|------|------|
| **Tool** | 让 AI 执行操作 | `get_weather`, `read_file`, `execute_sql` |
| **Resource** | 为 AI 提供只读上下文 | `file://project/src/main.ts`, `db://schema/users` |
| **Prompt** | 预定义的提示模板 | `code_review`, `bug_analysis` |

---

## 3. Server 开发完整实践

### 3.1 最小可运行 Server

项目已提供完整实现：`jsts-code-lab/94-ai-agent-lab/mcp-server-demo.ts`

```typescript
import { createInterface } from 'node:readline'

class McpServer {
  private tools = new Map()
  private resources = new Map()
  private prompts = new Map()

  registerTool(name: string, schema: object, handler: Function) {
    this.tools.set(name, { schema, handler })
  }

  start() {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    rl.on('line', (line) => this.handleMessage(JSON.parse(line)))
  }

  private handleMessage(req: any) {
    switch (req.method) {
      case 'initialize':
        this.sendResponse(req.id, { protocolVersion: '2024-11-05', capabilities: {} })
        break
      case 'tools/list':
        this.sendResponse(req.id, { tools: Array.from(this.tools.keys()) })
        break
      case 'tools/call':
        const tool = this.tools.get(req.params.name)
        const result = tool.handler(req.params.arguments)
        this.sendResponse(req.id, { content: [{ type: 'text', text: result }] })
        break
    }
  }

  private sendResponse(id: string, result: any) {
    console.log(JSON.stringify({ jsonrpc: '2.0', id, result }))
  }
}
```

### 3.2 Tool 注册与实现

```typescript
// 类型安全的 Tool 定义
interface ToolSchema {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

// 注册数据库查询工具
server.registerTool({
  name: 'query_database',
  description: '执行安全的只读 SQL 查询',
  inputSchema: {
    type: 'object',
    properties: {
      sql: { type: 'string', description: 'SELECT 语句' },
      limit: { type: 'number', default: 100, maximum: 1000 }
    },
    required: ['sql']
  }
}, async (args: { sql: string; limit?: number }) => {
  // 安全校验：仅允许 SELECT
  const sanitized = args.sql.trim().toLowerCase()
  if (!sanitized.startsWith('select')) {
    throw new Error('仅允许只读查询 (SELECT)')
  }

  const results = await db.query(args.sql, { limit: args.limit || 100 })
  return JSON.stringify(results, null, 2)
})
```

### 3.3 Resource 暴露

```typescript
// 暴露文件系统资源
server.registerResource({
  uri: 'file://project/package.json',
  name: '项目配置',
  mimeType: 'application/json'
}, () => {
  return fs.readFileSync('./package.json', 'utf-8')
})

// 暴露动态资源（带订阅能力）
server.registerResource({
  uri: 'logs://application/latest',
  name: '最新日志',
  mimeType: 'text/plain'
}, () => {
  return tailLogFile(50) // 最近50行
})
```

### 3.4 Prompt 模板

```typescript
server.registerPrompt({
  name: 'code_review',
  description: '生成代码审查提示词',
  arguments: [
    { name: 'language', description: '编程语言', required: true },
    { name: 'code', description: '待审查代码', required: true }
  ]
}, (args: { language: string; code: string }) => {
  return `你是一位资深 ${args.language} 工程师。请审查以下代码，关注：
1. 类型安全性
2. 错误处理完整性
3. 性能优化空间
4. 可读性与命名规范

代码：\n\`\`\`${args.language}\n${args.code}\n\`\`\``
})
```

### 3.5 错误处理

```typescript
// MCP 标准错误码
enum McpErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  // 自定义错误码范围: -32000 to -32099
  ToolExecutionError = -32000,
  ValidationError = -32001,
  PermissionDenied = -32002
}

function sendError(id: string | number, code: number, message: string, data?: any) {
  console.log(JSON.stringify({
    jsonrpc: '2.0',
    id,
    error: { code, message, data }
  }))
}
```

---

## 4. Client 集成

### 4.1 使用官方 SDK

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const transport = new StdioClientTransport({
  command: 'node',
  args: ['./mcp-server.js']
})

const client = new Client({ name: 'my-app', version: '1.0.0' })
await client.connect(transport)

// 发现可用工具
const tools = await client.listTools()
console.log('可用工具:', tools.tools.map(t => t.name))

// 调用工具
const result = await client.callTool({
  name: 'get_weather',
  arguments: { city: '北京' }
})
console.log('天气:', result.content[0].text)
```

### 4.2 Next.js 集成示例

```typescript
// app/api/mcp/route.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'

const transport = new SSEClientTransport(new URL('http://localhost:3001/sse'))
const client = new Client({ name: 'nextjs-app', version: '1.0.0' })

export async function POST(req: Request) {
  const { message } = await req.json()

  await client.connect(transport)

  // 获取上下文资源
  const resources = await client.listResources()
  const context = await Promise.all(
    resources.resources.map(r => client.readResource({ uri: r.uri }))
  )

  // 调用工具辅助推理
  const tools = await client.listTools()

  // 发送到 AI 模型（伪代码）
  const response = await aiModel.complete({
    messages: [
      { role: 'system', content: `可用工具: ${tools.tools.map(t => t.name).join(', ')}` },
      { role: 'user', content: message }
    ]
  })

  return Response.json({ reply: response })
}
```

---

## 5. Transport 选型指南

| Transport | 适用场景 | 优点 | 缺点 |
|-----------|---------|------|------|
| **stdio** | 本地 CLI 工具、IDE 插件 | 简单、无网络依赖、进程隔离 | 仅本地、单连接 |
| **SSE** | Web 应用、远程服务 | 实时推送、HTTP 兼容 | 单向推送，需额外 POST 通道 |
| **HTTP** | 微服务、网关 | 无状态、负载均衡友好 | 轮询开销、实时性较差 |

### 5.1 stdio Server 示例

```typescript
// 直接运行: node mcp-server.ts
const server = new McpServer('filesystem', '1.0.0')
// ... 注册工具
server.start() // 监听 stdin
```

### 5.2 SSE Server 示例

```typescript
import express from 'express'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'

const app = express()
const transport = new SSEServerTransport('/messages', res)

app.get('/sse', (req, res) => {
  transport.start(res)
})

app.post('/messages', (req, res) => {
  transport.handlePostMessage(req, res)
})

app.listen(3001)
```

---

## 6. 安全最佳实践

### 6.1 输入验证

```typescript
import { z } from 'zod'

const QuerySchema = z.object({
  sql: z.string().regex(/^SELECT\s/i, '仅允许 SELECT 语句'),
  limit: z.number().max(1000).default(100)
})

server.registerTool({
  name: 'query_database',
  description: '执行安全的只读 SQL 查询',
  inputSchema: zodToJsonSchema(QuerySchema)
}, async (args) => {
  const parsed = QuerySchema.parse(args) // Zod 校验
  // ... 执行查询
})
```

### 6.2 权限最小化

```typescript
// 文件系统 Server 应限制访问范围
const ALLOWED_PATHS = [
  process.cwd(),
  path.join(process.cwd(), 'src'),
  path.join(process.cwd(), 'docs')
]

function validatePath(requestedPath: string): void {
  const resolved = path.resolve(requestedPath)
  const allowed = ALLOWED_PATHS.some(p => resolved.startsWith(p))
  if (!allowed) {
    throw new Error(`访问被拒绝: ${requestedPath}`)
  }
}
```

### 6.3 沙箱执行

```typescript
// 使用 vm2 或 isolated-vm 执行不受信代码
import { Isolate } from 'isolated-vm'

const isolate = new Isolate({ memoryLimit: 128 })
const context = await isolate.createContext()

server.registerTool({
  name: 'safe_eval',
  description: '在沙箱中执行 JavaScript 表达式',
  inputSchema: {
    type: 'object',
    properties: {
      expression: { type: 'string' }
    }
  }
}, async (args: { expression: string }) => {
  const script = await isolate.compileScript(args.expression)
  const result = await script.run(context, { timeout: 5000 })
  return String(result)
})
```

---

## 7. 调试与测试

### 7.1 使用 MCP Inspector

```bash
# 安装 Inspector
npm install -g @anthropics/mcp-inspector

# 启动交互式调试
npx @anthropics/mcp-inspector node ./my-server.ts
```

Inspector 提供：

- 工具列表与在线测试
- 资源浏览
- 原始 JSON-RPC 消息查看
- 错误诊断

### 7.2 单元测试策略

```typescript
import { describe, it, expect } from 'vitest'
import { McpServer } from './mcp-server'

describe('MCP Server', () => {
  it('should list registered tools', () => {
    const server = new McpServer('test', '1.0.0')
    server.registerTool({ name: 'test_tool', description: 'Test', inputSchema: { type: 'object' } },
      () => 'ok')

    const tools = server.listTools()
    expect(tools).toHaveLength(1)
    expect(tools[0].name).toBe('test_tool')
  })

  it('should validate tool arguments', async () => {
    const server = new McpServer('test', '1.0.0')
    server.registerTool({
      name: 'calculate',
      description: 'Calc',
      inputSchema: {
        type: 'object',
        properties: { a: { type: 'number' }, b: { type: 'number' } },
        required: ['a', 'b']
      }
    }, (args: { a: number; b: number }) => args.a + args.b)

    await expect(server.callTool('calculate', { a: 1 }))
      .rejects.toThrow('Missing required parameter: b')
  })
})
```

---

## 8. 生态工具与资源

| 工具 | 用途 |
|------|------|
| **@modelcontextprotocol/sdk** | 官方 TypeScript SDK |
| **@anthropics/mcp-inspector** | 交互式调试工具 |
| **fastmcp** | Python 快速开发框架 |
| **mcp-cli** | 命令行测试工具 |

---

> **关联文档**
>
> - `jsts-code-lab/94-ai-agent-lab/mcp-server-demo.ts` — 纯 TypeScript MCP Server 实现
> - [AI Agent 基础设施](../categories/ai-agent-infrastructure.md)
> - [AI SDK 指南](./ai-sdk-guide.md)
