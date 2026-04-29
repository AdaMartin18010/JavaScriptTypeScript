# 自主系统理论：从自动化到自主决策

> **目标读者**：关注 AI Agent、自动化工作流、智能系统的工程师
> **关联文档**：``30-knowledge-base/30.2-categories/autonomous-systems.md`` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 3,000 字

---

## 1. 自主系统的层次

### 1.1 从自动化到自主

| 层级 | 名称 | 人类参与 | 示例 |
|------|------|---------|------|
| L0 | 手动 | 100% | 人工审批所有操作 |
| L1 | 辅助 | 80% | 代码补全、智能提示 |
| L2 | 部分自动 | 50% | CI/CD 自动部署 |
| L3 | 条件自动 | 20% | 异常时人工介入 |
| L4 | 高度自动 | 5% | 监控 + 告警 |
| L5 | 完全自主 | 0% | 自修复、自适应系统 |

**现实**：大多数"AI 系统"处于 L1-L2，L4+ 仅存在于特定封闭领域。

---

## 2. AI Agent 架构

### 2.1 ReAct 模式

```
Reason (推理) → Act (行动) → Observe (观察) → ...循环
```

```typescript
interface Agent {
  think(goal: string): Plan;
  act(plan: Plan): Action;
  observe(result: Result): State;
}
```

**完整 ReAct 循环实现：**

```typescript
interface Tool {
  name: string;
  description: string;
  execute(input: unknown): Promise<unknown>;
}

class ReActAgent {
  private tools: Map<string, Tool> = new Map();
  private memory: string[] = [];

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  async run(goal: string, maxIterations = 10): Promise<string> {
    let iteration = 0;
    let thought = `Goal: ${goal}`;

    while (iteration < maxIterations) {
      // Reason
      const action = await this.think(thought);
      if (action.type === 'finish') {
        return action.answer;
      }

      // Act
      const tool = this.tools.get(action.toolName);
      if (!tool) throw new Error(`Unknown tool: ${action.toolName}`);
      const observation = await tool.execute(action.input);

      // Observe
      thought = `Observation: ${JSON.stringify(observation)}`;
      this.memory.push(`Action: ${action.toolName}, Result: ${observation}`);
      iteration++;
    }
    throw new Error('Max iterations reached');
  }

  private async think(thought: string): Promise<ActionPlan> {
    // 实际实现中调用 LLM API
    return { type: 'action', toolName: 'search', input: thought };
  }
}

// 使用示例
const agent = new ReActAgent();
agent.registerTool({
  name: 'search',
  description: 'Web search',
  execute: async (q) => fetch(`https://api.search?q=${q}`).then(r => r.json())
});
await agent.run('查找本周 TypeScript 5.8 的新特性');
```

### 2.2 多 Agent 协作

| 模式 | 描述 | 示例 |
|------|------|------|
| **层级** | 经理 Agent 分配任务给执行 Agent | 项目管理 |
| **对等** | Agent 间协商 | 多角色辩论 |
| **管道** | 输出作为下一个的输入 | 流水线处理 |

**层级协作代码示例：**

```typescript
interface Task {
  id: string;
  description: string;
  priority: number;
}

class ManagerAgent {
  private workers: WorkerAgent[] = [];

  async delegate(tasks: Task[]): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};
    for (const task of tasks.sort((a, b) => b.priority - a.priority)) {
      const worker = this.selectWorker(task);
      results[task.id] = await worker.execute(task);
    }
    return results;
  }

  private selectWorker(task: Task): WorkerAgent {
    return this.workers.find(w => w.canHandle(task)) ?? this.workers[0];
  }
}

class WorkerAgent {
  constructor(private specialization: string) {}

  canHandle(task: Task): boolean {
    return task.description.includes(this.specialization);
  }

  async execute(task: Task): Promise<unknown> {
    console.log(`[${this.specialization}] Processing ${task.id}`);
    // 实际业务逻辑
    return { taskId: task.id, status: 'completed' };
  }
}
```

**BDI (Belief-Desire-Intention) Agent 模型：**

```typescript
type Belief = { subject: string; predicate: string; confidence: number };
type Desire = { goal: string; urgency: number };
type Intention = { plan: string; active: boolean };

class BDIAgent {
  beliefs: Belief[] = [];
  desires: Desire[] = [];
  intentions: Intention[] = [];

  perceive(observation: Belief): void {
    const existing = this.beliefs.find(
      b => b.subject === observation.subject && b.predicate === observation.predicate
    );
    if (existing) existing.confidence = observation.confidence;
    else this.beliefs.push(observation);
  }

  deliberate(): void {
    // 根据信念选择最紧迫的欲望
    this.intentions = this.desires
      .filter(d => this.beliefs.some(b => b.subject.includes(d.goal) && b.confidence > 0.7))
      .sort((a, b) => b.urgency - a.urgency)
      .slice(0, 3)
      .map(d => ({ plan: d.goal, active: true }));
  }

  async execute(): Promise<void> {
    for (const intention of this.intentions.filter(i => i.active)) {
      console.log(`Executing plan: ${intention.plan}`);
      // 执行计划...
      intention.active = false;
    }
  }
}
```

---

## 3. JS/TS Agent 框架

| 框架 | 特点 | 适用 |
|------|------|------|
| **LangChain.js** | 生态最广 | 通用 Agent |
| **Mastra** | TypeScript 原生 | 结构化工作流 |
| **Vercel AI SDK** | 流式 UI | 聊天应用 |
| **AutoGen** | 微软出品 | 多 Agent 协作 |

**Mastra 工作流示例：**

```typescript
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';

const researchAgent = new Agent({
  name: 'ResearchAgent',
  instructions: 'You are a technical research assistant. Summarize findings concisely.',
  model: openai('gpt-4o'),
});

const result = await researchAgent.generate(
  'Analyze the impact of ESM on Node.js package ecosystem in 2026'
);
console.log(result.text);
```

**Vercel AI SDK 流式响应：**

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: 'You are a helpful coding assistant.',
    messages,
  });
  return result.toDataStreamResponse();
}
```

---

## 4. 行为树与任务调度

### 4.1 行为树

行为树是游戏 AI 和机器人控制中广泛使用的分层决策结构：

```typescript
abstract class BTNode {
  abstract tick(context: unknown): 'success' | 'failure' | 'running';
}

class Sequence extends BTNode {
  constructor(private children: BTNode[]) { super(); }

  tick(context: unknown): 'success' | 'failure' | 'running' {
    for (const child of this.children) {
      const status = child.tick(context);
      if (status !== 'success') return status;
    }
    return 'success';
  }
}

class Selector extends BTNode {
  constructor(private children: BTNode[]) { super(); }

  tick(context: unknown): 'success' | 'failure' | 'running' {
    for (const child of this.children) {
      const status = child.tick(context);
      if (status !== 'failure') return status;
    }
    return 'failure';
  }
}

class ActionNode extends BTNode {
  constructor(private action: (ctx: unknown) => boolean) { super(); }

  tick(context: unknown): 'success' | 'failure' | 'running' {
    return this.action(context) ? 'success' : 'failure';
  }
}

// 构建行为树：巡逻 → 发现敌人 → 攻击或逃跑
const patrolTree = new Selector([
  new Sequence([
    new ActionNode(ctx => ctx.hasEnemyInSight),
    new Selector([
      new ActionNode(ctx => ctx.health > 50 && ctx.attack()), // 攻击
      new ActionNode(ctx => ctx.flee()),                       // 逃跑
    ]),
  ]),
  new ActionNode(ctx => ctx.patrol()), // 继续巡逻
]);
```

### 4.2 自适应任务调度器

```typescript
interface ScheduledTask {
  id: string;
  execute: () => Promise<void>;
  priority: number;
  retryCount: number;
  maxRetries: number;
  backoffMs: number;
}

class AdaptiveTaskScheduler {
  private queue: ScheduledTask[] = [];
  private running = false;

  enqueue(task: Omit<ScheduledTask, 'retryCount'>): void {
    this.queue.push({ ...task, retryCount: 0 });
    this.queue.sort((a, b) => b.priority - a.priority);
    if (!this.running) this.process();
  }

  private async process(): Promise<void> {
    this.running = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      try {
        await task.execute();
      } catch (err) {
        if (task.retryCount < task.maxRetries) {
          task.retryCount++;
          const delay = task.backoffMs * Math.pow(2, task.retryCount);
          setTimeout(() => this.enqueue(task), delay);
        }
      }
    }
    this.running = false;
  }
}
```

---

## 5. 反馈控制与自修复

```typescript
interface SystemMetric {
  timestamp: number;
  cpu: number;
  memory: number;
  errorRate: number;
}

class FeedbackController {
  private history: SystemMetric[] = [];
  private readonly thresholds = { cpu: 80, memory: 85, errorRate: 0.05 };

  observe(metric: SystemMetric): void {
    this.history.push(metric);
    if (this.history.length > 100) this.history.shift();
  }

  decide(): 'scale_up' | 'scale_down' | 'alert' | 'noop' {
    const latest = this.history[this.history.length - 1];
    if (!latest) return 'noop';

    if (latest.errorRate > this.thresholds.errorRate) return 'alert';
    if (latest.cpu > this.thresholds.cpu || latest.memory > this.thresholds.memory) {
      return 'scale_up';
    }
    if (this.history.length > 10 && this.isUnderutilized()) return 'scale_down';
    return 'noop';
  }

  private isUnderutilized(): boolean {
    const recent = this.history.slice(-10);
    const avgCpu = recent.reduce((s, m) => s + m.cpu, 0) / recent.length;
    return avgCpu < 20;
  }

  async act(decision: ReturnType<FeedbackController['decide']>): Promise<void> {
    switch (decision) {
      case 'scale_up': await this.triggerScaling(1); break;
      case 'scale_down': await this.triggerScaling(-1); break;
      case 'alert': await this.sendAlert(); break;
      case 'noop': break;
    }
  }

  private async triggerScaling(delta: number): Promise<void> {
    console.log(`Scaling by ${delta}`);
    // 调用云提供商 API
  }

  private async sendAlert(): Promise<void> {
    console.log('Sending alert to on-call engineer');
    // 调用 PagerDuty / Slack
  }
}
```

---

## 6. 反模式

### 反模式 1：过度自主

❌ Agent 在没有人工确认的情况下执行不可逆操作。
✅ 高风险操作设置人工审批关卡。

```typescript
// 安全拦截示例
class Guardrails {
  static async withHumanApproval<T>(
    action: () => Promise<T>,
    riskLevel: 'low' | 'medium' | 'high',
    context: string
  ): Promise<T> {
    if (riskLevel === 'high') {
      const approved = await this.requestApproval(context);
      if (!approved) throw new Error('Action rejected by human operator');
    }
    return action();
  }

  private static async requestApproval(context: string): Promise<boolean> {
    // 发送审批请求到控制台 / Slack
    console.log(`[APPROVAL REQUIRED] ${context}`);
    return false; // 默认拒绝
  }
}
```

### 反模式 2：忽视可解释性

❌ Agent 决策是黑盒。
✅ 记录推理链，支持决策追溯。

```typescript
class ExplainableAgent {
  private reasoningChain: Array<{ step: number; thought: string; action: string }> = [];

  async thinkWithTrace(goal: string): Promise<{ result: unknown; trace: typeof this.reasoningChain }> {
    this.reasoningChain = [];
    const result = await this.execute(goal, 0);
    return { result, trace: [...this.reasoningChain] };
  }

  private async execute(goal: string, step: number): Promise<unknown> {
    const thought = `Analyzing goal: ${goal}`;
    const action = 'search_database';
    this.reasoningChain.push({ step, thought, action });
    // 执行逻辑...
    return { goal, completed: true };
  }
}
```

---

## 7. 总结

自主系统的目标是**增强人类能力，不是替代人类判断**。

**核心原则**：
1. 渐进式自动化，从辅助到自主
2. 始终保留人类监督和接管能力
3. 可解释性是信任的基础

---

## 参考资源

- [LangChain.js Documentation](https://js.langchain.com/) — JS/TS 大模型应用框架官方文档
- [Mastra](https://mastra.ai/) — TypeScript 原生 AI 工作流框架
- [Vercel AI SDK](https://sdk.vercel.ai/docs) — 流式 UI 与 AI 交互 SDK
- [ReAct Paper (Yao et al., 2022)](https://arxiv.org/abs/2210.03629) — 推理-行动协同的奠基论文
- [AutoGen / Microsoft](https://microsoft.github.io/autogen/) — 多 Agent 对话编排框架
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) — Anthropic 开放的 AI 工具调用标准
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling) — 结构化工具调用指南
- [Behavior Trees in Robotics and AI](https://arxiv.org/abs/1709.00084) — Colledanchise & Ögren 综述
- [BDI Agent Model (Rao & Georgeff, 1995)](https://doi.org/10.1016/B978-0-444-81840-6.50029-9) — 信念-欲望-意图经典模型
- [The Bitter Lesson (Sutton, 2019)](http://www.incompleteideas.net/IncIdeas/BitterLesson.html) — 关于通用方法 vs 人类知识的反思

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `autonomous-agents.ts`
- `bdi-agent.ts`
- `behavior-tree.ts`
- `feedback-controller.ts`
- `index.ts`
- `rule-based-agent.ts`
- `sense-plan-act.ts`
- `task-scheduler.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-27
