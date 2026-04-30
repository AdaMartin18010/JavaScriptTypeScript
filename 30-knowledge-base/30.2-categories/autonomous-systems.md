# 自治系统

> 自治系统（Autonomous Systems）在 JavaScript/TypeScript 生态中的概念与应用。

---

## 核心概念

自治系统指**无需持续人工干预即可独立运行的软件系统**，常见于：

- **AI Agent**：基于 LLM 的自主决策代理
- **自愈系统**：自动检测故障并恢复
- **自动扩缩容**：根据负载动态调整资源
- **GitOps**：Git 为唯一事实源，自动同步状态

---

## 与 AI Agent 的关系

| 特性 | 传统自动化 | AI Agent |
|------|-----------|----------|
| 决策逻辑 | 预设规则 | LLM 推理 |
| 适应性 | 低 | 高 |
| 不确定性 | 无 | 有 |
| 人机协作 | 人类触发 | 自主触发 |

---

## 主流框架对比

| 维度 | LangChain | LlamaIndex | AutoGPT | CrewAI |
|------|-----------|------------|---------|--------|
| **定位** | LLM 应用编排框架 | 数据增强检索（RAG） | 全自动目标驱动 Agent | 多 Agent 协作编排 |
| **核心抽象** | Chains / Agents / Tools | Index / Query Engine / Retriever | 自主任务分解 | Crew / Agent / Task |
| **语言支持** | Python / JS / TS | Python / TS | Python | Python / TS（实验） |
| **RAG 能力** | 基础（Vectorstore） | 极强（多模态/图索引） | 有限 | 中等 |
| **多 Agent 协作** | LangGraph 支持 | 间接支持 | 单 Agent 循环 | 原生支持 |
| **记忆管理** | Memory 模块 | Chat Memory | 向量记忆 + 短期记忆 | 上下文共享 |
| **工具调用** | 丰富生态 | 基础 | 自研插件系统 | 丰富装饰器 |
| **学习曲线** | 中 | 中 | 高 | 低 |
| **适用场景** | 通用 LLM 应用 | 企业知识库 / 文档问答 | 研究实验 / 自动任务 | 工作流自动化 / 团队协作 |
| **2026 状态** | ✅ 活跃 | ✅ 活跃 | ⚠️ 重心转向 Forge | ✅ 快速增长 |

---

## 代码示例

### CrewAI + TypeScript（概念示例）

```typescript
// 基于 CrewAI Python 概念映射到 TypeScript 风格伪代码，展示多 Agent 协作模式
import { Agent, Task, Crew } from 'crewai';

// 定义研究员 Agent
const researcher = new Agent({
  role: '技术研究员',
  goal: '深入调研指定技术的最新发展趋势',
  backstory: '你是一位资深技术分析师，擅长从海量信息中提取关键洞察。',
  llm: 'gpt-4o',
  tools: ['web_search', 'arxiv_reader'],
  verbose: true,
});

// 定义撰写员 Agent
const writer = new Agent({
  role: '技术撰稿人',
  goal: '将技术调研结果转化为清晰易懂的文章',
  backstory: '你是一位顶尖技术写作者，擅长将复杂概念通俗化。',
  llm: 'gpt-4o',
  verbose: true,
});

// 定义任务
const researchTask = new Task({
  description: '调研 2026 年 JavaScript 后端框架的最新趋势，包括性能数据、社区活跃度和企业采用率。',
  expectedOutput: '一份结构化的调研报告，包含关键数据点和来源链接。',
  agent: researcher,
});

const writeTask = new Task({
  description: '基于调研报告撰写一篇面向开发者的技术博客。',
  expectedOutput: 'Markdown 格式的博客文章，字数不少于 1500 字。',
  agent: writer,
  context: [researchTask], // 依赖前序任务输出
});

// 组建 Crew 并执行
const crew = new Crew({
  agents: [researcher, writer],
  tasks: [researchTask, writeTask],
  process: 'sequential', // sequential | hierarchical
  memory: true,          // 启用共享记忆
});

(async () => {
  const result = await crew.kickoff({
    inputs: { topic: 'JavaScript Backend Frameworks in 2026' },
  });
  console.log(result);
})();
```

### LangChain JS Agent（工具调用 + ReAct 循环）

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// 初始化 LLM 与工具
const llm = new ChatOpenAI({ modelName: 'gpt-4o', temperature: 0 });
const tools = [new TavilySearchResults({ maxResults: 3 })];

// 创建 ReAct Agent
const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个擅长调研的 AI Agent，必要时使用搜索工具获取最新信息。'],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}'],
]);

const agent = await createReactAgent({ llm, tools, prompt });
const executor = new AgentExecutor({ agent, tools, verbose: true });

// 执行自主任务
const result = await executor.invoke({
  input: '2026 年 TypeScript 5.8 有哪些新特性？',
});
console.log(result.output);
```

### AutoGPT 风格思考-行动循环（TypeScript 伪代码）

```typescript
interface AgentState {
  goal: string;
  memory: string[];
  iterations: number;
}

async function autoGPTLoop(state: AgentState) {
  while (state.iterations < 10) {
    // 1. 思考（Reasoning）
    const thought = await llm.generateThought(state.goal, state.memory);

    // 2. 决定行动（Action）
    const action = await llm.decideAction(thought, availableTools);

    // 3. 执行并观察（Observation）
    const observation = await executeTool(action);

    // 4. 记忆更新
    state.memory.push(`Thought: ${thought}`);
    state.memory.push(`Action: ${action.name} -> ${observation}`);

    // 5. 终止条件判断
    if (await llm.isTaskComplete(state.memory)) {
      return state.memory.join('\n');
    }
    state.iterations++;
  }
  throw new Error('Max iterations reached');
}
```

### 自愈健康检查控制器

```typescript
interface HealthCheck {
  name: string;
  check: () => Promise<{ healthy: boolean; latencyMs: number }>;
  onUnhealthy: () => Promise<void>;
  maxRetries: number;
}

class SelfHealingController {
  private checks: HealthCheck[] = [];
  private intervalMs: number;

  constructor(intervalMs: number = 30_000) {
    this.intervalMs = intervalMs;
  }

  register(check: HealthCheck) {
    this.checks.push(check);
  }

  start() {
    setInterval(() => this.runAll(), this.intervalMs);
  }

  private async runAll() {
    for (const check of this.checks) {
      const result = await check.check();
      if (!result.healthy) {
        console.warn(`[SelfHealing] ${check.name} unhealthy (${result.latencyMs}ms). Attempting recovery...`);
        let recovered = false;
        for (let i = 0; i < check.maxRetries; i++) {
          await check.onUnhealthy();
          const retry = await check.check();
          if (retry.healthy) {
            console.log(`[SelfHealing] ${check.name} recovered after ${i + 1} attempt(s).`);
            recovered = true;
            break;
          }
          await sleep(1000 * (i + 1)); // exponential backoff-ish
        }
        if (!recovered) {
          console.error(`[SelfHealing] ${check.name} failed to recover after ${check.maxRetries} retries.`);
          // Trigger paging / alerting here
        }
      }
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// 使用示例：数据库连接自愈
const dbHealer = new SelfHealingController(10_000);
dbHealer.register({
  name: 'postgres-primary',
  check: async () => {
    const start = performance.now();
    try {
      await db.query('SELECT 1');
      return { healthy: true, latencyMs: performance.now() - start };
    } catch {
      return { healthy: false, latencyMs: performance.now() - start };
    }
  },
  onUnhealthy: async () => {
    await db.reconnect();
  },
  maxRetries: 3,
});
dbHealer.start();
```

### GitOps 风格状态调和循环（TypeScript）

```typescript
type DesiredState = { replicas: number; image: string; env: Record<string, string> };
type ActualState = { replicas: number; image: string; env: Record<string, string>; status: 'running' | 'stopped' };

class GitOpsReconciler {
  constructor(
    private fetchDesired: () => Promise<DesiredState>,
    private fetchActual: () => Promise<ActualState>,
    private apply: (delta: Partial<DesiredState>) => Promise<void>,
  ) {}

  async reconcile() {
    const desired = await this.fetchDesired();
    const actual = await this.fetchActual();

    const delta: Partial<DesiredState> = {};
    if (desired.replicas !== actual.replicas) delta.replicas = desired.replicas;
    if (desired.image !== actual.image) delta.image = desired.image;

    const envDiff = Object.entries(desired.env).filter(
      ([k, v]) => actual.env[k] !== v,
    );
    if (envDiff.length > 0) delta.env = desired.env;

    if (Object.keys(delta).length > 0) {
      console.log('[Reconciler] Drift detected. Applying delta:', delta);
      await this.apply(delta);
    } else {
      console.log('[Reconciler] State converged.');
    }
  }

  start(intervalMs: number = 60_000) {
    this.reconcile();
    setInterval(() => this.reconcile(), intervalMs);
  }
}
```

### MCP (Model Context Protocol) 工具服务器骨架

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'weather-server', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_forecast',
      description: 'Get weather forecast for a city',
      inputSchema: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name' },
          days: { type: 'number', description: 'Forecast days (1-7)' },
        },
        required: ['city'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'get_forecast') {
    const { city, days = 3 } = request.params.arguments as { city: string; days?: number };
    const forecast = await fetchWeatherAPI(city, days);
    return { content: [{ type: 'text', text: JSON.stringify(forecast, null, 2) }] };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function fetchWeatherAPI(city: string, days: number) {
  // Stub for external weather service integration
  return { city, days, temperature: [22, 24, 21].slice(0, days) };
}

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 选型建议

| 场景 | 推荐框架 |
|------|----------|
| 企业知识库 / 文档 RAG | LlamaIndex |
| 通用 LLM 链式应用 | LangChain / LangGraph |
| 多 Agent 工作流自动化 | CrewAI |
| 研究实验 / 自主任务探索 | AutoGPT / MetaGPT |

---

## 权威参考链接

- [LangChain 官方文档（JS/TS）](https://js.langchain.com/)
- [LlamaIndex TypeScript 文档](https://ts.llamaindex.ai/)
- [CrewAI 官方文档](https://docs.crewai.com/)
- [AutoGPT GitHub](https://github.com/Significant-Gravitas/AutoGPT)
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Anthropic Model Context Protocol (MCP)](https://www.anthropic.com/news/model-context-protocol)
- [Microsoft Semantic Kernel Documentation](https://learn.microsoft.com/en-us/semantic-kernel/)
- [ReAct: Synergizing Reasoning and Acting in Language Models (Paper)](https://arxiv.org/abs/2210.03629)
- [AI Agent Patterns — LangChain Blog](https://blog.langchain.dev/agent-patterns/)
- [OpenAI Agents SDK (Beta)](https://github.com/openai/openai-agents-python)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Kubernetes Operator Pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
- [Argo CD — GitOps for Kubernetes](https://argo-cd.readthedocs.io/)
- [Flux CD — GitOps Toolkit](https://fluxcd.io/)
- [Google SRE — Handling Overload](https://sre.google/sre-book/handling-overload/)
- [AWS Auto Scaling Documentation](https://docs.aws.amazon.com/autoscaling/)

---

*最后更新: 2026-04-30*
