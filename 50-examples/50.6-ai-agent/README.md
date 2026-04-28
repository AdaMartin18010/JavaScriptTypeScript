# AI Agent 生产级示例项目

> **定位**：`50-examples/50.6-ai-agent/`
> **新增**：2026-04

---

## 项目：多 Agent 协作系统

**技术栈**：

- Mastra（AI Agent 框架）
- MCP（Model Context Protocol）
- better-auth（认证）
- TypeScript Strict

**架构**：

```
┌─────────────────────────────────────────┐
│           多 Agent 协作系统               │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐   A2A/MCP   ┌─────────┐   │
│  │ Planner │◀──────────▶│  Coder  │   │
│  │  Agent  │             │  Agent  │   │
│  └────┬────┘             └────┬────┘   │
│       │                       │         │
│       │      ┌─────────┐      │         │
│       └─────▶│ Reviewer│◀─────┘         │
│              │  Agent  │                │
│              └────┬────┘                │
│                   │                     │
│                   ▼                     │
│              ┌─────────┐                │
│              │ 用户界面 │                │
│              │ Next.js │                │
│              └─────────┘                │
│                                         │
└─────────────────────────────────────────┘
```

**功能特性**：

- 自然语言需求 → 代码生成
- 多 Agent 协作审查
- MCP 工具调用（GitHub、数据库）
- 流式响应 UI
- 用户反馈循环

**关联 code-lab 模块**：

- `20.7-ai-agent-infra/mcp-protocol/`
- `20.7-ai-agent-infra/agent-patterns/`

---

*本目录为 AI Agent 生产级应用的完整示例，覆盖 Mastra + MCP + better-auth 技术栈。*
