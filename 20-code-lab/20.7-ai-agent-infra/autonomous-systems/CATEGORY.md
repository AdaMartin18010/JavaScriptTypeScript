---
dimension: 应用领域
application-domain: AI 与 Agent 应用
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: 自主系统 — BDI Agent、行为树、规则引擎与任务调度
- **模块编号**: 89-autonomous-systems

## 边界说明

本模块聚焦自主智能体的设计与实现，包括：

- BDI（信念-欲望-意图）Agent 架构
- 行为树与规则引擎
- 反馈控制器与感知-规划-行动循环
- 任务调度器

机器人硬件控制和物理仿真环境不属于本模块范围。

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `bdi-agent.ts` | BDI 推理循环与意图堆栈 | `bdi-agent.test.ts` |
| `behavior-tree.ts` | 行为树节点（Selector / Sequence / Action） | `behavior-tree.test.ts` |
| `rule-based-agent.ts` | 前向链式规则引擎 | `rule-based-agent.test.ts` |
| `sense-plan-act.ts` | SPA 循环与传感器抽象 | `sense-plan-act.test.ts` |
| `task-scheduler.ts` | 优先级任务队列与抢占调度 | `task-scheduler.test.ts` |
| `autonomous-agents.ts` | 自主 Agent 组合与状态机 | `autonomous-agents.test.ts` |
| `index.ts` | 模块统一导出 | — |

## 代码示例

### BDI Agent 推理循环

```typescript
// bdi-agent.ts
interface Belief { id: string; value: unknown }
interface Desire { id: string; priority: number }
interface Intention { desireId: string; plan: () => Promise<void> }

export class BDIAgent {
  private beliefs = new Map<string, Belief>();
  private desires: Desire[] = [];
  private intentions: Intention[] = [];

  believe(belief: Belief) {
    this.beliefs.set(belief.id, belief);
  }

  desire(desire: Desire) {
    this.desires.push(desire);
    this.desires.sort((a, b) => b.priority - a.priority);
  }

  async deliberate() {
    // 选择最高优先级的未满足欲望
    for (const d of this.desires) {
      const alreadyIntended = this.intentions.some((i) => i.desireId === d.id);
      if (!alreadyIntended) {
        this.intentions.push({ desireId: d.id, plan: () => this.executePlan(d) });
      }
    }
  }

  async execute() {
    for (const intention of this.intentions) {
      await intention.plan();
    }
  }

  private async executePlan(desire: Desire): Promise<void> {
    console.log(`Executing plan for desire: ${desire.id}`);
  }
}
```

### 行为树节点实现

```typescript
// behavior-tree.ts
export type NodeStatus = 'success' | 'failure' | 'running';

export abstract class BTNode {
  abstract tick(): NodeStatus;
}

export class Selector extends BTNode {
  constructor(private children: BTNode[]) {
    super();
  }

  tick(): NodeStatus {
    for (const child of this.children) {
      const status = child.tick();
      if (status !== 'failure') return status;
    }
    return 'failure';
  }
}

export class Sequence extends BTNode {
  constructor(private children: BTNode[]) {
    super();
  }

  tick(): NodeStatus {
    for (const child of this.children) {
      const status = child.tick();
      if (status !== 'success') return status;
    }
    return 'success';
  }
}
```

### 优先级任务调度器

```typescript
// task-scheduler.ts
interface Task {
  id: string;
  priority: number;
  execute(): Promise<void>;
  preemptible?: boolean;
}

export class PriorityTaskScheduler {
  private queue: Task[] = [];
  private running?: Task;

  schedule(task: Task) {
    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority);
    this.pump();
  }

  private async pump() {
    if (this.running) {
      if (this.running.preemptible && this.queue[0]?.priority > this.running.priority) {
        // 简化：实际应实现取消令牌
        console.log(`Preempting ${this.running.id} for ${this.queue[0].id}`);
      }
      return;
    }

    while (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.running = next;
      await next.execute();
      this.running = undefined;
    }
  }
}
```

### 前向链式规则引擎

```typescript
// rule-based-agent.ts — 前向链式规则引擎

interface Fact {
  id: string;
  value: unknown;
}

interface Rule {
  id: string;
  condition: (facts: Map<string, Fact>) => boolean;
  action: (facts: Map<string, Fact>) => Fact[];
  priority?: number;
}

export class ForwardChainingEngine {
  private facts = new Map<string, Fact>();
  private rules: Rule[] = [];

  addFact(fact: Fact): void {
    this.facts.set(fact.id, fact);
  }

  addRule(rule: Rule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  run(maxIterations = 100): Fact[] {
    const inferred: Fact[] = [];
    let changed = true;
    let iterations = 0;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      for (const rule of this.rules) {
        if (rule.condition(this.facts)) {
          const newFacts = rule.action(this.facts);
          for (const fact of newFacts) {
            if (!this.facts.has(fact.id)) {
              this.facts.set(fact.id, fact);
              inferred.push(fact);
              changed = true;
            }
          }
        }
      }
    }

    return inferred;
  }

  getFact(id: string): Fact | undefined {
    return this.facts.get(id);
  }
}

// 使用示例：医疗诊断规则
const engine = new ForwardChainingEngine();
engine.addFact({ id: 'symptom-fever', value: true });
engine.addFact({ id: 'symptom-cough', value: true });

engine.addRule({
  id: 'rule-flu',
  priority: 10,
  condition: (facts) =>
    facts.get('symptom-fever')?.value === true &&
    facts.get('symptom-cough')?.value === true,
  action: () => [{ id: 'diagnosis', value: 'Possible Influenza' }],
});

engine.addRule({
  id: 'rule-rest',
  priority: 5,
  condition: (facts) => facts.get('diagnosis')?.value === 'Possible Influenza',
  action: () => [{ id: 'recommendation', value: 'Rest and hydrate' }],
});

const results = engine.run();
console.log(results); // [{ id: 'diagnosis', ... }, { id: 'recommendation', ... }]
```

### 感知-规划-行动（SPA）循环

```typescript
// sense-plan-act.ts — SPA 循环骨架

interface Sensor<T> {
  read(): Promise<T>;
}

interface Actuator<T> {
  execute(action: T): Promise<void>;
}

interface Plan {
  steps: Array<() => Promise<void>>;
}

export class SPALoop<SenseData, ActionType> {
  private running = false;

  constructor(
    private sensor: Sensor<SenseData>,
    private actuator: Actuator<ActionType>,
    private planner: (senseData: SenseData) => Plan,
    private senseToAction: (senseData: SenseData, plan: Plan) => ActionType
  ) {}

  async start(intervalMs = 1000): Promise<void> {
    this.running = true;
    while (this.running) {
      // Sense
      const senseData = await this.sensor.read();

      // Plan
      const plan = this.planner(senseData);

      // Act
      const action = this.senseToAction(senseData, plan);
      await this.actuator.execute(action);

      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }

  stop(): void {
    this.running = false;
  }
}

// 使用示例：恒温器
const temperatureSensor: Sensor<number> = {
  read: async () => 22.5, // 读取室温
};

const heaterActuator: Actuator<{ targetTemp: number }> = {
  execute: async (action) => {
    console.log(`Adjusting heater to ${action.targetTemp}°C`);
  },
};

const thermostat = new SPALoop(
  temperatureSensor,
  heaterActuator,
  (temp) => ({
    steps: temp < 20 ? [async () => console.log('Heating...')] : [],
  }),
  (temp) => ({ targetTemp: temp < 20 ? 22 : 18 })
);

// thermostat.start(5000);
```

### 状态机驱动的自主 Agent

```typescript
// autonomous-state-machine.ts — 状态机 + Agent 组合

type State<S, E> = {
  onEnter?: () => void;
  onExit?: () => void;
  transitions: Map<E, { target: S; guard?: () => boolean }>;
};

export class StateMachine<S extends string, E extends string> {
  private current: S;
  private states: Map<S, State<S, E>>;

  constructor(initial: S, states: Record<S, State<S, E>>) {
    this.current = initial;
    this.states = new Map(Object.entries(states) as [S, State<S, E>][]);
    this.states.get(initial)?.onEnter?.();
  }

  dispatch(event: E): boolean {
    const state = this.states.get(this.current)!;
    const transition = state.transitions.get(event);
    if (!transition) return false;
    if (transition.guard && !transition.guard()) return false;

    state.onExit?.();
    this.current = transition.target;
    this.states.get(this.current)?.onEnter?.();
    return true;
  }

  get state(): S {
    return this.current;
  }
}

// 巡逻机器人状态机
export type RobotState = 'idle' | 'patrolling' | 'chasing' | 'returning';
export type RobotEvent = 'start' | 'intruder_detected' | 'lost_track' | 'battery_low' | 'recharged';

export function createPatrolRobot() {
  return new StateMachine<RobotState, RobotEvent>('idle', {
    idle: {
      onEnter: () => console.log('[Robot] Entering idle mode'),
      transitions: new Map([
        ['start', { target: 'patrolling' }],
      ]),
    },
    patrolling: {
      onEnter: () => console.log('[Robot] Starting patrol route'),
      transitions: new Map([
        ['intruder_detected', { target: 'chasing' }],
        ['battery_low', { target: 'returning', guard: () => Math.random() > 0.5 }],
      ]),
    },
    chasing: {
      onEnter: () => console.log('[Robot] Intruder! Initiating chase'),
      transitions: new Map([
        ['lost_track', { target: 'patrolling' }],
        ['battery_low', { target: 'returning' }],
      ]),
    },
    returning: {
      onEnter: () => console.log('[Robot] Battery low, returning to base'),
      transitions: new Map([
        ['recharged', { target: 'idle' }],
      ]),
    },
  });
}
```

## 关联模块

- `33-ai-integration` — AI 集成
- `94-ai-agent-lab` — Agent 实战实验室
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| BDI Agent Model — Anand Rao | 论文 | [cs.uwaterloo.ca/~mdbloom/cs886fall09/BDI.pdf](https://cs.uwaterloo.ca/~mdbloom/cs886fall09/BDI.pdf) |
| Behavior Trees in Robotics and AI | 书籍 | [arxiv.org/abs/1709.00084](https://arxiv.org/abs/1709.00084) |
| Game AI Pro — Behavior Trees | 章节 | [gameaipro.com](http://www.gameaipro.com) |
| Promise-based Task Queues | 指南 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) |
| Temporal.io — Durable Execution | 文档 | [docs.temporal.io](https://docs.temporal.io) |
| Jason — Java-based Agent Framework | 框架 | [jason.sourceforge.net](https://jason.sourceforge.net/) |
| GOAL Agent Programming Language | 语言 | [goalapltools.sourceforge.net](https://goalapltools.sourceforge.net/) |
| Russell & Norvig — Artificial Intelligence: A Modern Approach | 教材 | [aima.cs.berkeley.edu](https://aima.cs.berkeley.edu/) |
| AIMA Python Code | 代码 | [github.com/aimacode/aima-python](https://github.com/aimacode/aima-python) |
| Building Games with AI — Sebastian Lague | 教程 | [www.youtube.com/c/SebastianLague](https://www.youtube.com/c/SebastianLague) |
| ReactiveX — Observable Patterns for Agents | 库 | [rxjs.dev](https://rxjs.dev) |
| Web Agents — W3C Community Group | 规范 | [www.w3.org/community/webagents/](https://www.w3.org/community/webagents/) |
| LangChain Agent Concepts | 文档 | [js.langchain.com/docs/concepts/agents](https://js.langchain.com/docs/concepts/agents) |
| AutoGPT — Autonomous GPT-4 Experiment | 项目 | [github.com/Significant-Gravitas/AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) |
| Microsoft Semantic Kernel | SDK | [github.com/microsoft/semantic-kernel](https://github.com/microsoft/semantic-kernel) |

---

*最后更新: 2026-04-29*
