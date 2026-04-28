# A2A Protocol Guide

> **English Summary** of `30.1-guides/a2a-protocol-guide.md`

---

## What is A2A

**A2A (Agent-to-Agent)** is an open standard by Google (2025-2026) defining interoperable communication between AI agents. Unlike MCP (Model Context Protocol) which focuses on "model-tool" interaction, A2A addresses "agent-agent" collaboration.

## Core Concepts

### Agent Card

JSON metadata exposing agent capabilities:

```json
{
  "name": "CodeReviewAgent",
  "capabilities": { "streaming": true },
  "skills": [{ "id": "typescript-review", "name": "TS Code Review" }]
}
```

### Task Lifecycle

```
Client Agent → Task Create → Server Agent
           ← Task Status (working)
           ← Artifact Stream (incremental)
           ← Task Complete (final result)
```

## A2A vs MCP

| Dimension | MCP | A2A |
|-----------|-----|-----|
| Pattern | Model ↔ Tool | Agent ↔ Agent |
| Granularity | Single tool call | Full task lifecycle |
| State | Stateless | Stateful (Task) |
| Discovery | Manual config | Agent Card auto-discovery |

## TypeScript Example

```typescript
interface AgentCard {
  name: string;
  capabilities: { streaming: boolean };
  skills: Array<{ id: string; name: string }>;
}

class A2AClient {
  async discoverAgent(url: string): Promise<AgentCard> {
    const res = await fetch(`${url}/.well-known/agent.json`);
    return res.json();
  }
}
```

---

*This is an English summary. For the full Chinese guide, see `../30.1-guides/a2a-protocol-guide.md`.*
