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

### A2A Express Server Implementation

```typescript
// a2a-server.ts
import express from 'express';

const app = express();
app.use(express.json());

// Serve Agent Card
app.get('/.well-known/agent.json', (req, res) => {
  res.json({
    name: 'CodeReviewAgent',
    url: 'https://agents.example.com/code-review',
    version: '1.0.0',
    capabilities: { streaming: true, pushNotifications: false, stateTransitionHistory: true },
    skills: [{ id: 'typescript-review', name: 'TypeScript Code Review', tags: ['typescript'] }],
    authentication: { schemes: ['Bearer'] },
  });
});

// Create task
app.post('/tasks', (req, res) => {
  const { skillId, input } = req.body;
  const task: Task = {
    id: crypto.randomUUID(),
    status: 'submitted',
    artifacts: [],
    history: [{ state: 'submitted', timestamp: new Date().toISOString() }],
  };
  // enqueue for processing...
  res.status(201).json(task);
});

// Stream task updates
app.get('/tasks/:id/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // emit status updates...
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ state: 'working', timestamp: new Date().toISOString() })}\n\n`);
  }, 1000);
  req.on('close', () => clearInterval(interval));
});

app.listen(3000);
```

### Task Status Polling Client

```typescript
// polling-client.ts
class A2APollingClient {
  constructor(private client: A2AClient) {}

  async pollUntilComplete(
    agentUrl: string,
    taskId: string,
    intervalMs = 2000
  ): Promise<Task> {
    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        const task = await this.client.getTask(agentUrl, taskId);
        if (task.status === 'completed') {
          clearInterval(timer);
          resolve(task);
        }
        if (task.status === 'failed' || task.status === 'canceled') {
          clearInterval(timer);
          reject(new Error(`Task ${taskId} ${task.status}`));
        }
      }, intervalMs);
    });
  }

  async getTask(agentUrl: string, taskId: string): Promise<Task> {
    const res = await fetch(`${agentUrl}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${this.client['token']}` },
    });
    return res.json();
  }
}
```

### Push Notification Handler

```typescript
// push-handler.ts
app.post('/webhooks/a2a', (req, res) => {
  const { taskId, status, agentUrl } = req.body;
  console.log(`Push update: Task ${taskId} is now ${status} from ${agentUrl}`);
  // update local cache / notify user
  res.sendStatus(200);
});
```

### Agent Card Zod Schema Validation

```typescript
// agent-card-schema.ts
import { z } from 'zod';

const AgentCardSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  version: z.string(),
  capabilities: z.object({
    streaming: z.boolean(),
    pushNotifications: z.boolean(),
    stateTransitionHistory: z.boolean(),
  }),
  skills: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      tags: z.array(z.string()),
    })
  ),
  authentication: z.object({
    schemes: z.array(z.string()),
  }),
});

export type ValidatedAgentCard = z.infer<typeof AgentCardSchema>;
export const validateAgentCard = (data: unknown) => AgentCardSchema.parse(data);
```

### Error Handling for Task Failures

```typescript
// error-handling.ts
class A2AError extends Error {
  constructor(
    public code: 'TASK_FAILED' | 'AGENT_UNREACHABLE' | 'INVALID_SKILL',
    message: string
  ) {
    super(message);
  }
}

async function safeCreateTask(
  client: A2AClient,
  agentUrl: string,
  skillId: string,
  input: unknown
): Promise<Task> {
  try {
    const card = await client.discoverAgent(agentUrl);
    if (!card.skills.some((s) => s.id === skillId)) {
      throw new A2AError('INVALID_SKILL', `Skill ${skillId} not found on agent`);
    }
    return await client.createTask(agentUrl, skillId, input);
  } catch (err) {
    if (err instanceof A2AError) throw err;
    throw new A2AError('AGENT_UNREACHABLE', String(err));
  }
}
```

### MCP Tool Call within A2A Task

```typescript
// mcp-a2a-bridge.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function executeMCPWithinA2A(taskInput: { tool: string; args: unknown }) {
  const transport = new StdioClientTransport({ command: 'node', args: ['mcp-server.js'] });
  const client = new Client({ name: 'a2a-bridge', version: '1.0.0' });
  await client.connect(transport);

  const result = await client.callTool({ name: taskInput.tool, arguments: taskInput.args as any });
  await client.close();
  return result;
}
```

---

## Reference Links

- [A2A Protocol Specification (Google)](https://google.github.io/A2A/)
- [A2A GitHub Repository](https://github.com/google/A2A)
- [MCP (Model Context Protocol) — Anthropic](https://modelcontextprotocol.io/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Google Cloud — A2A Overview](https://cloud.google.com/blog/topics/ai-ml)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [LangChain Multi-Agent Orchestration](https://python.langchain.com/docs/modules/agents/)
- [AutoGen — Microsoft Research](https://github.com/microsoft/autogen)
- [CrewAI Documentation](https://docs.crewai.com/)
- [Zod Schema Validation](https://zod.dev/)
- [SSE (Server-Sent Events) MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

*This is an English summary. For the full Chinese guide, see `../30.1-guides/a2a-protocol-guide.md`.*
