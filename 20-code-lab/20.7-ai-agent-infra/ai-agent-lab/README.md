# 94-ai-agent-lab

AI Agent 基础设施实战：MCP 协议实现、Vercel AI SDK 工具调用与多 Agent 工作流编排。

## Topics

| Topic | File |
|---|---|
| MCP Server 最小实现 | `mcp-server-demo.ts` |
| Vercel AI SDK Tool Calling | `vercel-ai-sdk-tool-calling.ts` |
| Multi-Agent Workflow | `multi-agent-workflow.ts` |
| Agent Memory Layer | `agent-memory.ts` |
| Tool Registry | `tool-registry.ts` |
| Agent Coordination | `agent-coordination.ts` |

## 环境要求

- Node.js >= 20
- TypeScript >= 5.5
- 运行代码示例前请确保已安装对应依赖：`npm install ai zod @modelcontextprotocol/sdk`

## Running Tests

```bash
npx vitest run 94-ai-agent-lab
```

## 关联文档

- [AI Agent 基础设施生态](../../../30-knowledge-base/30.2-categories/28-ai-agent-infrastructure.md)
- [AI 框架选型决策树](../../../30-knowledge-base/30.4-decision-trees/README.md)
