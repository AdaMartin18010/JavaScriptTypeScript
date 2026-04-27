# A2A (Agent-to-Agent) Protocol Guide

> Deep dive into Google's A2A protocol specification, Agent Cards auto-discovery, capability negotiation, and multi-agent orchestration practices.

---

## 1. What is A2A?

**Agent-to-Agent Protocol (A2A)** is an open protocol proposed by Google in 2025 to standardize communication and collaboration between different AI Agents. In early 2026, the protocol was placed under the **Linux Foundation** as a neutral open standard.

Unlike MCP (Model Context Protocol), which focuses on "Agent ↔ Tool" integration, A2A specializes in "Agent ↔ Agent" interoperability — enabling intelligent agents from different vendors, frameworks, and deployment environments to discover each other, negotiate capabilities, delegate tasks, and collaborate on complex goals.

### 1.1 A2A vs MCP

| Dimension | MCP | A2A |
|-----------|-----|-----|
| Scope | Agent ↔ Tools / Resources | Agent ↔ Agent |
| Discovery | Static configuration | **Agent Cards** auto-discovery |
| Negotiation | Server-declared capabilities | Bidirectional capability negotiation |
| Task Model | Stateless tool calls | Stateful task lifecycle |
| Transport | stdio / SSE / HTTP | JSON-RPC 2.0 / gRPC |

**In one sentence**: MCP solves "how Agent uses tools"; A2A solves "how Agents collaborate with each other".

---

## 2. Core Architecture

### 2.1 Agent Card

The foundation of auto-discovery. Each agent exposes its capabilities at `/.well-known/agent.json`:

```json
{
  "name": "DataAnalysisAgent",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false
  },
  "skills": [
    {
      "id": "csv-analysis",
      "name": "CSV Data Analysis",
      "inputModes": ["text", "file"],
      "outputModes": ["text", "chart"]
    }
  ],
  "authentication": {
    "type": "oauth2",
    "endpoint": "https://auth.example.com/oauth2"
  }
}
```

### 2.2 Task Lifecycle

```
Task Submission → Capability Negotiation → Execution → Updates → Completion
```

Each task has a unique ID and progresses through states:
- `submitted` — Task received
- `working` — Agent is processing
- `input-required` — Need additional input from user
- `completed` — Task finished with result
- `failed` — Task failed with error

---

## 3. Multi-Agent Orchestration Patterns

### 3.1 Sequential Pipeline

```typescript
// Sequential execution: Agent A → Agent B → Agent C
async function sequentialPipeline(input: string) {
    const resultA = await agentA.execute({ task: input });
    const resultB = await agentB.execute({ task: resultA.output });
    const resultC = await agentC.execute({ task: resultB.output });
    return resultC.output;
}
```

### 3.2 Parallel Swarm

```typescript
// Parallel execution: all agents work on the same input
async function parallelSwarm(input: string) {
    const results = await Promise.all([
        agentA.execute({ task: input }),
        agentB.execute({ task: input }),
        agentC.execute({ task: input }),
    ]);
    return aggregate(results);
}
```

### 3.3 Hierarchical Delegation

```typescript
// Manager agent delegates to worker agents
async function hierarchicalDelegation(goal: string) {
    const plan = await managerAgent.plan(goal);

    const subtasks = plan.subtasks.map(async (subtask) => {
        const worker = selectWorker(subtask.skillRequired);
        return worker.execute({ task: subtask.description });
    });

    const results = await Promise.all(subtasks);
    return managerAgent.synthesize(results);
}
```

---

## 4. Security Best Practices

1. **Authentication**: OAuth 2.0 or mTLS between agents
2. **Authorization**: Capability-based access control
3. **Input Validation**: Sanitize all inter-agent messages
4. **Rate Limiting**: Prevent cascading overload
5. **Audit Logging**: Record all inter-agent communications

---

*For the full Chinese version, see [../guides/a2a-protocol-guide.md](../guides/a2a-protocol-guide.md)*
