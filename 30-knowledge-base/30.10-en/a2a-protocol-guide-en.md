# A2A Protocol Guide

> **English Summary** of `30.1-guides/a2a-protocol-guide.md`

---

## What is A2A

**A2A (Agent-to-Agent)** is an open standard by Google (2025-2026) defining interoperable communication between AI agents. Unlike MCP (Model Context Protocol) which focuses on "model-tool" interaction, A2A addresses "agent-agent" collaboration.

**Core Design Goal**: Enable agents built with different frameworks (LangChain, CrewAI, AutoGen, etc.) to discover each other, negotiate capabilities, and collaborate on multi-step tasks without prior integration.

---

## A2A vs MCP: Detailed Comparison

| Dimension | MCP (Model Context Protocol) | A2A (Agent-to-Agent Protocol) |
|-----------|------------------------------|-------------------------------|
| **Scope** | Model ↔ Tool (single capability) | Agent ↔ Agent (full collaboration) |
| **Pattern** | Tool call / function call | Task delegation with lifecycle |
| **Granularity** | Single tool invocation | Full task lifecycle with streaming |
| **State** | Stateless | Stateful (Task has status/artifacts) |
| **Discovery** | Manual configuration (JSON) | Agent Card auto-discovery via `.well-known` |
| **Transport** | stdio / HTTP SSE | HTTP SSE / gRPC |
| **Use Case** | Give model access to files, DB, APIs | Multi-agent orchestration, cross-team agents |
| **Maintainer** | Anthropic (open standard) | Google (open standard) |
| **Analogy** | USB port (plug in a device) | Email protocol (agents send tasks to each other) |

**Complementary Relationship**: MCP equips an agent with *tools*; A2A lets agents *hire* other agents. A typical architecture: Agent A uses MCP to read a file, then uses A2A to delegate analysis to Agent B.

---

## Core Concepts

### Agent Card

JSON metadata exposing agent capabilities, discoverable at `/.well-known/agent.json`:

```json
{
  "name": "CodeReviewAgent",
  "description": "Reviews TypeScript code for type safety and best practices",
  "url": "https://agents.example.com/code-review",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  },
  "skills": [
    {
      "id": "typescript-review",
      "name": "TypeScript Code Review",
      "description": "Analyzes TS files for errors, anti-patterns, and type coverage",
      "tags": ["typescript", "static-analysis"],
      "examples": ["Review src/services/auth.ts for null safety"]
    },
    {
      "id": "security-audit",
      "name": "Security Audit",
      "description": "Detects XSS, SQL injection, and insecure dependencies",
      "tags": ["security", "owasp"]
    }
  ],
  "authentication": {
    "schemes": ["Bearer"]
  }
}
```

### Task Lifecycle

```
Client Agent → Task Create → Server Agent
           ← Task Status (working)
           ← Artifact Stream (incremental)
           ← Task Complete (final result)
           ← or Task Failed (error details)
```

**Task States**: `submitted` → `working` → `input-required` → `completed` | `failed` | `canceled`

---

## TypeScript Implementation Example

```typescript
// A2A Client — Agent discovery and task delegation
interface AgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
    stateTransitionHistory: boolean;
  };
  skills: Array<{
    id: string;
    name: string;
    description: string;
    tags: string[];
    examples?: string[];
  }>;
  authentication: {
    schemes: string[];
  };
}

interface Task {
  id: string;
  status: 'submitted' | 'working' | 'input-required' | 'completed' | 'failed' | 'canceled';
  artifacts: Artifact[];
  history: StatusUpdate[];
}

interface Artifact {
  name: string;
  content: string;
  mimeType: string;
}

interface StatusUpdate {
  state: Task['status'];
  timestamp: string;
  message?: string;
}

class A2AClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /** Discover agent capabilities via well-known endpoint */
  async discoverAgent(url: string): Promise<AgentCard> {
    const res = await fetch(`${url}/.well-known/agent.json`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Agent discovery failed: ${res.status}`);
    return res.json();
  }

  /** Create a task on a remote agent */
  async createTask(agentUrl: string, skillId: string, input: unknown): Promise<Task> {
    const res = await fetch(`${agentUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ skillId, input }),
    });
    return res.json();
  }

  /** Stream task updates via SSE */
  async streamTask(agentUrl: string, taskId: string, onUpdate: (update: StatusUpdate) => void) {
    const eventSource = new EventSource(
      `${agentUrl}/tasks/${taskId}/stream?token=${this.token}`
    );
    eventSource.onmessage = (event) => {
      onUpdate(JSON.parse(event.data));
    };
    return () => eventSource.close();
  }
}

// Usage: Multi-agent orchestration
async function orchestrateCodeReview(codeUrl: string) {
  const client = new A2AClient(process.env.A2A_TOKEN!);

  // 1. Discover the code review agent
  const reviewer = await client.discoverAgent('https://agents.example.com/code-review');
  console.log(`Found agent: ${reviewer.name} with skills: ${reviewer.skills.map(s => s.id).join(', ')}`);

  // 2. Delegate review task
  const task = await client.createTask(reviewer.url, 'typescript-review', {
    repositoryUrl: codeUrl,
    strictness: 'maximum',
  });

  // 3. Stream progress
  const unsubscribe = await client.streamTask(reviewer.url, task.id, (update) => {
    console.log(`[${update.timestamp}] ${update.state}: ${update.message || ''}`);
  });

  return { task, unsubscribe };
}
```

---

## Reference Links

- [A2A Protocol Specification (Google)](https://google.github.io/A2A/)
- [A2A GitHub Repository](https://github.com/google/A2A)
- [MCP (Model Context Protocol) — Anthropic](https://modelcontextprotocol.io/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Google Cloud — A2A Overview](https://cloud.google.com/blog/topics/ai-ml)

---

*This is an English summary. For the full Chinese guide, see `../30.1-guides/a2a-protocol-guide.md`.*
