# A2A 协议完整指南

> **定位**：`30-knowledge-base/30.1-guides/`
> **新增**：2026-04
> **规范来源**：a2aprotocol.org | Google A2A Whitepaper

---

## 一、什么是 A2A 协议

**A2A（Agent-to-Agent）协议**是 Google 于 2025-2026 年推动的开放标准，定义了 AI Agent 之间的**互操作通信机制**。与 MCP（Model Context Protocol）关注「模型-工具」交互不同，A2A 关注「Agent-Agent」协作。

---

## 二、核心概念

### 2.1 Agent Card

每个 Agent 必须暴露 **Agent Card**（JSON 元数据），描述其能力：

```json
{
  "name": "CodeReviewAgent",
  "description": "审查代码并返回质量报告",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false
  },
  "skills": [
    {
      "id": "typescript-review",
      "name": "TypeScript Code Review",
      "description": "审查 TS 代码的类型安全性和最佳实践"
    }
  ],
  "inputModes": ["text", "file"],
  "outputModes": ["text", "json"]
}
```

### 2.2 Task 生命周期

```
Client Agent          Server Agent
     │                     │
     │── Task Create ─────▶│
     │                     │
     │◀── Task Status ─────│
     │   (working)         │
     │                     │
     │◀── Artifact Stream ─│
     │   (增量结果)         │
     │                     │
     │◀── Task Complete ───│
     │   (最终结果)         │
```

---

## 三、协议架构

### 3.1 传输层

| 传输方式 | 适用场景 | 状态 |
|---------|---------|------|
| **HTTP/JSON-RPC 2.0** | 同步/简单任务 | 必选支持 |
| **SSE（Server-Sent Events）** | 流式响应 | 推荐支持 |
| **gRPC** | 高性能内部通信 | 可选 |

### 3.2 认证

- **OAuth 2.0**：标准授权流程
- **API Key**：简单场景
- **mTLS**：高安全场景

---

## 四、与 MCP 的对比

| 维度 | MCP | A2A |
|------|-----|-----|
| **通信模式** | 模型 ↔ 工具 | Agent ↔ Agent |
| **粒度** | 单次工具调用 | 完整任务生命周期 |
| **状态管理** | 无状态 | 有状态（Task） |
| **发现机制** | 手动配置 | Agent Card 自动发现 |
| **发起方** | 模型/用户 | Agent 自治 |

**协同使用**：MCP 处理「Agent 与工具的交互」，A2A 处理「Agent 与 Agent 的协作」。

---

## 五、TypeScript 实现示例

```typescript
// A2A Agent Card 类型定义
interface AgentCard {
  name: string;
  description: string;
  version: string;
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
  };
  skills: Skill[];
  inputModes: string[];
  outputModes: string[];
}

interface Skill {
  id: string;
  name: string;
  description: string;
}

// A2A Client 实现
class A2AClient {
  async discoverAgent(url: string): Promise<AgentCard> {
    const res = await fetch(`${url}/.well-known/agent.json`);
    return res.json();
  }

  async sendTask(agentUrl: string, skillId: string, input: unknown) {
    const res = await fetch(`${agentUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillId, input })
    });
    return res.json();
  }
}
```

---

## 六、部署架构

```
┌─────────────────────────────────────────┐
│           多 Agent 协作系统               │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐   A2A   ┌─────────┐       │
│  │ Planner │◀───────▶│ Coder   │       │
│  │  Agent  │         │  Agent  │       │
│  └────┬────┘         └────┬────┘       │
│       │                   │             │
│       │ A2A               │ MCP         │
│       ▼                   ▼             │
│  ┌─────────┐         ┌─────────┐       │
│  │ Reviewer│         │ GitHub  │       │
│  │  Agent  │         │  Tool   │       │
│  └─────────┘         └─────────┘       │
│                                         │
└─────────────────────────────────────────┘
```

---

*本指南为 2026 年 A2A 协议的完整技术参考。*
