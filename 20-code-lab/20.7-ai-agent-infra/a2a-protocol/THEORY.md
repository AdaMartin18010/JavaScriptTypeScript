# A2A 协议

> **定位**：`20-code-lab/20.7-ai-agent-infra/a2a-protocol`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 AI Agent 间互操作的标准化通信问题。通过 A2A 协议实现跨平台、跨厂商的 Agent 协作。

### 1.2 形式化基础

A2A 协议定义在应用层，其会话状态机可形式化为：

```
State := submitted | working | input-required | completed | canceled | failed
Transition :=
  submitted ──agent:accept──► working
  working ──agent:need-input──► input-required
  working ──agent:complete──► completed
  working ──client:cancel──► canceled
  working ──agent:error──► failed
```

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Agent Card | 描述 Agent 能力与端点的元数据 | agent-card.json |
| Task | 跨 Agent 请求的工作单元 | task-protocol.ts |
| Artifact | 任务产出的结构化数据（文件、消息、结构化输出） | artifact.ts |
| Streaming | 服务端推送的任务状态更新（SSE） | streaming.ts |

---

## 二、设计原理

### 2.1 为什么存在

AI Agent 生态正在快速增长，但缺乏统一的互操作标准。A2A 协议定义了 Agent 发现、能力协商和任务协作的标准，是开放 Agent 网络的基础。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| A2A 标准 | 跨厂商互操作 | 生态初期 | 多 Agent 系统 |
| 私有协议 | 完全可控 | 孤岛化 | 封闭生态 |
| MCP | 模型-工具连接成熟 | 非 Agent 间协议 | 工具增强 LLM |

### 2.3 与相关技术的对比

与私有 API 对比：标准化降低集成成本，私有 API 更灵活可控。

与 MCP 对比：MCP 解决「模型如何调用工具」，A2A 解决「Agent 如何与 Agent 协作」。两者互补而非替代。

---

## 三、对比分析

| 维度 | A2A 协议 | MCP 协议 | 私有 API |
|------|---------|---------|---------|
| 定位 | Agent-to-Agent 互操作 | 模型-工具上下文连接 | 自定义集成 |
| 传输层 | HTTP/JSON-RPC | stdio / SSE / HTTP | 任意 |
| 发现机制 | Agent Card JSON | Tool/Resource 清单 | 手动配置 |
| 安全模型 | OAuth 2.0 / 委托身份 | 本地/服务器可控 | 自定义 |
| 生态阶段 | 早期（Google 主导） | 成长期（Anthropic 主导） | 成熟但封闭 |
| JS/TS 支持 | 实验 SDK | 官方 SDK（@modelcontextprotocol/sdk） | 取决于实现 |
| 状态管理 | 显式 Task 状态机 | 无状态（单次调用） | 自定义 |

---

## 四、实践映射

### 4.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 A2A 协议 核心机制的理解，并观察不同实现选择带来的行为差异。

### 4.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| A2A 替代 HTTP | A2A 建立在 HTTP 之上，是应用层协议 |
| 所有 Agent 都支持 A2A | A2A 需要生态适配，目前覆盖有限 |
| A2A 与 MCP 互斥 | 一个 Agent 可以同时暴露 A2A 端点并内置 MCP 工具 |

### 4.3 代码示例

#### Agent Card 元数据与任务发送

```typescript
interface AgentCard {
  name: string;
  url: string;
  version: string;
  capabilities: { streaming?: boolean; pushNotifications?: boolean };
  authentication?: { schemes: string[] };
}

class A2AClient {
  constructor(private card: AgentCard) {}

  async sendTask(params: { id: string; message: { role: 'user'; parts: [{ text: string }] } }) {
    const res = await fetch(`${this.card.url}/tasks/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  }
}
```

#### 服务端暴露 Agent Card

```typescript
// server.ts —— 使用 Hono 暴露 A2A Agent Card
import { Hono } from 'hono';

const app = new Hono();

const agentCard = {
  name: 'code-reviewer-agent',
  description: 'Review code diffs and suggest improvements',
  url: 'https://agent.example.com',
  version: '1.0.0',
  capabilities: {
    streaming: true,
    pushNotifications: false,
  },
  skills: [
    {
      id: 'review-diff',
      name: 'Review Diff',
      description: 'Analyze a git diff for bugs and style issues',
      parameters: {
        type: 'object',
        properties: {
          diff: { type: 'string' },
          language: { type: 'string', enum: ['typescript', 'javascript', 'rust'] },
        },
        required: ['diff'],
      },
    },
  ],
};

// A2A 发现端点
app.get('/.well-known/agent.json', (c) => c.json(agentCard));

// 任务接收端点
app.post('/tasks/send', async (c) => {
  const body = await c.req.json<{ id: string; message: { parts: Array<{ text: string }> } }>();
  const taskId = body.id ?? crypto.randomUUID();

  // 异步处理任务
  processTask(taskId, body.message).catch(console.error);

  return c.json({
    id: taskId,
    status: 'submitted',
    createdAt: new Date().toISOString(),
  });
});

// 任务状态查询
app.get('/tasks/:id', async (c) => {
  const id = c.req.param('id');
  const task = await taskStore.get(id);
  return task ? c.json(task) : c.json({ error: 'Task not found' }, 404);
});

async function processTask(taskId: string, message: { parts: Array<{ text: string }> }) {
  await taskStore.update(taskId, { status: 'working' });
  // ... 实际业务逻辑
  await taskStore.update(taskId, { status: 'completed', result: { summary: 'LGTM' } });
}
```

#### SSE 流式任务更新

```typescript
// streaming.ts —— Server-Sent Events 推送任务状态
app.post('/tasks/sendSubscribe', async (c) => {
  const body = await c.req.json();
  const taskId = body.id ?? crypto.randomUUID();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ id: taskId, status: 'submitted' });

      for await (const update of runAgentPipeline(taskId, body.message)) {
        send({ id: taskId, status: 'working', artifact: update });
      }

      send({ id: taskId, status: 'completed' });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
});

async function* runAgentPipeline(taskId: string, message: { parts: Array<{ text: string }> }) {
  const text = message.parts.map((p) => p.text).join('');
  const chunks = text.split(/\n\n/);
  for (const chunk of chunks) {
    await new Promise((r) => setTimeout(r, 200));
    yield { type: 'text', content: `Processed: ${chunk.slice(0, 50)}...` };
  }
}
```

#### 带 OAuth 2.0 委托的身份验证中间件

```typescript
// auth.ts —— 验证调用方 Agent 的 Bearer Token
import { createMiddleware } from 'hono/factory';

export const a2aAuth = createMiddleware(async (c, next) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing Bearer token' }, 401);
  }

  const token = auth.slice(7);
  const jwks = await fetch('https://idp.example.com/.well-known/jwks.json').then((r) => r.json());

  // 使用 jose 库验证 JWT
  const { jwtVerify } = await import('jose');
  const { payload } = await jwtVerify(token, createLocalJWKSet(jwks), {
    issuer: 'https://idp.example.com',
    audience: 'a2a-agent-network',
  });

  c.set('agentIdentity', payload.sub);
  await next();
});

app.use('/tasks/*', a2aAuth);
```

#### 多 Agent 编排：路由与扇出

```typescript
// orchestrator.ts —— 将任务分发给多个专业 Agent
interface AgentRegistry {
  findAgents(skillId: string): Promise<AgentCard[]>;
}

class A2AOrchestrator {
  constructor(private registry: AgentRegistry, private client: A2AClient) {}

  async fanOut(task: Task, skillId: string): Promise<Artifact[]> {
    const agents = await this.registry.findAgents(skillId);
    const results = await Promise.allSettled(
      agents.map((agent) => this.client.sendTask({ ...task, target: agent })),
    );
    return results
      .filter((r): r is PromiseFulfilledResult<Artifact> => r.status === 'fulfilled')
      .map((r) => r.value);
  }

  async route(task: Task): Promise<AgentCard> {
    const intent = await classifyIntent(task.message.parts.map((p) => p.text).join(' '));
    const candidates = await this.registry.findAgents(intent.skillId);
    // 选择负载最低且能力匹配的 Agent
    return candidates.sort((a, b) => (a.load ?? 0) - (b.load ?? 0))[0];
  }
}
```

#### 任务重试与断路器模式

```typescript
// resilience.ts —— 带指数退避的 A2A 任务调用
async function sendTaskWithRetry(
  client: A2AClient,
  task: Parameters<A2AClient['sendTask']>[0],
  maxRetries = 3,
): Promise<unknown> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await client.sendTask(task);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const delay = Math.min(1000 * 2 ** attempt, 8000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Unreachable');
}

class CircuitBreaker {
  private failures = 0;
  private threshold = 5;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') throw new Error('Circuit breaker is OPEN');
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (e) {
      this.onFailure();
      throw e;
    }
  }

  private onSuccess() { this.failures = 0; this.state = 'closed'; }
  private onFailure() { this.failures++; if (this.failures >= this.threshold) this.state = 'open'; }
}
```

### 4.4 扩展阅读

- [A2A Protocol — Google GitHub](https://github.com/google/A2A)
- [A2A Protocol 规范](https://google.github.io/A2A/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Hono Web Framework](https://hono.dev/) — 轻量边缘运行时框架，适合 A2A Agent 服务端
- [OAuth 2.0 Token Exchange (RFC 8693)](https://datatracker.ietf.org/doc/html/rfc8693) — A2A 委托身份的技术基础
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- [Google Cloud A2A 官方文档](https://cloud.google.com/agent-to-agent)
- [LangChain Agent Interoperability](https://js.langchain.com/docs/concepts/agents/) — 与 A2A 互补的 Agent 编排方案
- [jose — JWT/JWS/JWE 库](https://github.com/panva/jose) — A2A OAuth 验证的推荐实现
- [Agent Protocol (OpenAI)](https://platform.openai.com/docs/api-reference) — 对比理解 Agent 通信的另一种设计
- [Cloudflare Agents](https://developers.cloudflare.com/agents/) — 边缘原生 Agent 部署平台
- [Temporal — 可靠任务编排](https://temporal.io/) — 复杂多 Agent 工作流的持久化执行引擎
- `20.7-ai-agent-infra/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
