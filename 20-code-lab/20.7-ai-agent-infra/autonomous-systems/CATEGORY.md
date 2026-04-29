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

---

*最后更新: 2026-04-29*
