# AI Agent 基础设施

> **定位**：`20-code-lab/20.7-ai-agent-infra`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 AI Agent 基础设施 领域的核心理论与实践映射问题。通过代码示例和形式化分析建立从概念到实现的认知桥梁。

Agent 基础设施的核心挑战在于：**如何可靠地将 LLM 的推理能力转化为可执行的动作序列**，同时保证可观测性、安全性和可回滚性。这涉及四个关键子域：

1. **工具编排（Tool Orchestration）**：模型 → 工具的调用链管理，含参数校验、超时控制、错误恢复。
2. **上下文工程（Context Engineering）**：长上下文窗口下的信息压缩、检索增强（RAG）与记忆管理。
3. **多 Agent 协作（Multi-Agent Coordination）**：Agent 间的任务分解、结果聚合与冲突解决。
4. **可观测性（Observability）**：推理轨迹追踪、Token 成本核算、幻觉检测。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| MCP Server | 向模型暴露工具与资源的标准化服务端 | `mcp-protocol/` |
| A2A Agent | 遵循 Google A2A 协议的自治智能体 | `a2a-protocol/` |
| Tool Registry | 运行时工具注册表，支持动态发现与版本控制 | `tool-registry.ts` |
| Memory Store | Agent 长期记忆存储（向量数据库 + 摘要缓存） | `memory-store.ts` |
| Orchestrator | 调度多个 Agent 或工具执行的控制中心 | `orchestrator.ts` |

---

## 二、设计原理

### 2.1 为什么存在

AI Agent 基础设施 作为软件工程中的重要课题，其存在是为了解决特定领域的复杂度与可维护性挑战。通过建立系统化的理论框架和实践模式，开发者能够更高效地构建可靠的系统。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| MCP + A2A 混合 | 工具复用 + Agent 协作兼备 | 架构复杂，需要协议转换层 | 企业级多 Agent 系统 |
| 纯 MCP 架构 | 工具生态丰富，跨模型复用 | Agent 间协作能力弱 | 工具密集型应用 |
| 纯 A2A 架构 | Agent 间协作原生支持 | 工具集成需额外适配 | 协作密集型工作流 |
| 直接 Function Calling | 简单直接，延迟最低 | 厂商锁定，可扩展性差 | 单一模型原型验证 |

### 2.3 与相关技术的对比

与其他相关技术对比，AI Agent 基础设施 在特定场景下提供了独特的权衡优势。

## 三、对比分析

| 维度 | MCP 协议 | A2A 协议 | 直接 Function Calling |
|------|---------|---------|----------------------|
| 交互范围 | 模型 ↔ 工具/资源 | Agent ↔ Agent | 单次请求 ↔ 工具 |
| 协议层级 | 应用层（stdio/SSE/HTTP） | 应用层（HTTP/JSON-RPC） | 厂商 API 扩展 |
| 生态开放度 | 开放标准（Anthropic 主导） | 开放标准（Google 主导） | 封闭（各 LLM 厂商） |
| 发现机制 | 动态 tools/resources 协商 | Agent Card 元数据 | 静态 JSON Schema |
| 可组合性 | 高（多 Server 组合） | 高（多 Agent 协作） | 低（单会话绑定） |
| JS/TS 成熟度 | SDK 稳定 | 实验阶段 | 成熟（OpenAI/Anthropic SDK） |

## 四、实践映射

### 4.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 AI Agent 基础设施 核心机制的理解，并观察不同实现选择带来的行为差异。

### 4.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| AI Agent 基础设施 很简单无需学习 | 深入理解能避免隐蔽 bug 和性能陷阱 |
| 理论脱离实际 | 理论指导实践中的架构决策 |
| 所有场景都需要多 Agent | 简单任务单 Agent + 工具链足够，过度拆分增加延迟 |
| Agent 越自治越好 | 自治性提升的同时需配套安全护栏（guardrails）与人工审核点 |

### 4.3 代码示例

#### Agent 基础设施编排器（MCP + A2A 混合）

```typescript
interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: unknown) => Promise<unknown>;
}

class AgentInfraOrchestrator {
  private mcpTools = new Map<string, AgentTool>();
  private agentRegistry = new Map<string, { url: string; capabilities: string[] }>();

  registerMcpTool(tool: AgentTool) {
    this.mcpTools.set(tool.name, tool);
  }

  registerAgent(id: string, meta: { url: string; capabilities: string[] }) {
    this.agentRegistry.set(id, meta);
  }

  async dispatch(intent: string, args: unknown) {
    // 优先本地 MCP 工具
    if (this.mcpTools.has(intent)) {
      return this.mcpTools.get(intent)!.execute(args);
    }
    // 否则委托给其他 Agent（A2A）
    for (const [id, meta] of this.agentRegistry) {
      if (meta.capabilities.includes(intent)) {
        return fetch(`${meta.url}/tasks/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: crypto.randomUUID(), message: { role: 'user', parts: [{ text: JSON.stringify(args) }] } }),
        }).then((r) => r.json());
      }
    }
    throw new Error(`No handler found for intent: ${intent}`);
  }
}
```

#### 带 Token 预算控制的工具链

```typescript
interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
  estimatedTokens: number;
}

class TokenBudgetToolChain {
  private totalBudget: number;
  private usedTokens = 0;

  constructor(budget: number) {
    this.totalBudget = budget;
  }

  async execute(calls: ToolCall[], executor: (call: ToolCall) => Promise<unknown>) {
    const results: unknown[] = [];
    for (const call of calls) {
      if (this.usedTokens + call.estimatedTokens > this.totalBudget) {
        throw new Error(`Token budget exceeded: ${this.usedTokens}/${this.totalBudget}`);
      }
      const start = performance.now();
      const result = await executor(call);
      const latency = performance.now() - start;
      this.usedTokens += call.estimatedTokens;

      console.log(`[ToolChain] ${call.name} ok | latency=${latency.toFixed(0)}ms | budget=${this.usedTokens}/${this.totalBudget}`);
      results.push(result);
    }
    return results;
  }
}

// 使用示例
const chain = new TokenBudgetToolChain(4000);
await chain.execute(
  [
    { name: 'search-docs', arguments: { q: 'MCP protocol' }, estimatedTokens: 800 },
    { name: 'summarize', arguments: { text: '{{prev}}' }, estimatedTokens: 1200 },
  ],
  async (call) => mcpClient.callTool({ name: call.name, arguments: call.arguments })
);
```

#### A2A 协议最小实现（Agent Card + Task 发送）

```typescript
interface AgentCard {
  name: string;
  description: string;
  url: string;
  capabilities: { skillId: string; name: string }[];
  authentication?: { schemes: string[] };
}

interface A2ATask {
  id: string;
  sessionId: string;
  status: 'submitted' | 'working' | 'input-required' | 'completed' | 'canceled';
  messages: { role: 'user' | 'agent'; parts: { text: string }[] }[];
  artifacts?: { name: string; parts: { text?: string; file?: { bytes: string; mimeType: string } }[] }[];
}

class A2AClient {
  constructor(private agentCard: AgentCard) {}

  async sendTask(text: string): Promise<A2ATask> {
    const res = await fetch(`${this.agentCard.url}/tasks/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        message: { role: 'user', parts: [{ text }] },
      }),
    });
    return res.json();
  }

  async getTask(id: string): Promise<A2ATask> {
    const res = await fetch(`${this.agentCard.url}/tasks/${id}`);
    return res.json();
  }
}

// 发现 Agent（通过 well-known endpoint）
async function discoverAgent(baseUrl: string): Promise<AgentCard> {
  const res = await fetch(`${baseUrl}/.well-known/agent.json`);
  return res.json();
}
```

#### 记忆管理（向量检索 + 摘要缓存）

```typescript
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

interface MemoryEntry {
  id: string;
  content: string;
  embedding: number[];
  timestamp: Date;
  summary?: string;
}

class AgentMemory {
  private memories: MemoryEntry[] = [];

  async add(content: string) {
    const { embedding } = await embed({ model: openai.embedding('text-embedding-3-small'), value: content });
    this.memories.push({ id: crypto.randomUUID(), content, embedding, timestamp: new Date() });
  }

  async recall(query: string, topK = 3): Promise<string[]> {
    const { embedding } = await embed({ model: openai.embedding('text-embedding-3-small'), value: query });
    const scored = this.memories.map((m) => ({
      memory: m,
      score: cosineSimilarity(m.embedding, embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => s.memory.content);
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
```

### 4.4 扩展阅读

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Google A2A Protocol](https://github.com/google/A2A)
- [Google A2A — Agent Card Specification](https://github.com/google/A2A/blob/main/documentation/agent-card.md)
- [Anthropic — Build with Claude](https://docs.anthropic.com/en/docs/build-with-claude)
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [LangChain.js](https://js.langchain.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs) — 统一的 LLM 调用与流式响应处理
- [LlamaIndex.TS](https://ts.llamaindex.ai/) — RAG 与数据代理的 TS 实现
- [AI Agent Design Patterns — Microsoft Research](https://www.microsoft.com/en-us/research/publication/the-shift-from-models-to-compound-ai-systems/)
- [Building Effective Agents — Anthropic](https://www.anthropic.com/research/building-effective-agents)
- `30-knowledge-base/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
