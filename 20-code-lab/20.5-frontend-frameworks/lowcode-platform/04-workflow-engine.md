# 工作流引擎基础

> 文件: `04-workflow-engine.ts` | 难度: ⭐⭐⭐⭐ (高级)

---

## 工作流引擎架构

```
定义层 (Definition)
├── 流程模型 (BPMN-like DAG)
├── 节点类型 (Task / Approval / Condition / Parallel)
├── 边与条件表达式
└── 变量声明

执行层 (Runtime)
├── 流程实例 (Instance)
├── 状态机 (State Machine)
├── 任务调度器
└── 事件总线

扩展层 (Extension)
├── 任务处理器注册
├── 审批动作 API
├── 定时器 / 延时节点
└── 子流程调用
```

---

## 节点类型

| 类型 | 功能 | 典型用途 |
|------|------|----------|
| `start` | 流程起点 | 初始化变量 |
| `end` | 流程终点 | 清理资源 |
| `task` | 自动任务 | 发送邮件、调用 API、数据处理 |
| `approval` | 人工审批 | 需要用户确认的节点 |
| `condition` | 条件分支 | if/else 路由 |
| `parallel` | 并行分支 | 同时执行多个任务 |
| `delay` | 延时节点 | 定时触发 |
| `subprocess` | 子流程 | 复用已有流程 |

---

## 条件表达式

工作流使用 JavaScript 表达式进行条件判断：

```typescript
// 条件边配置
{
  from: 'check',
  to: 'hr',
  condition: 'vars.amount > 10000 && vars.department === "sales"',
  priority: 1
}
```

### 安全沙箱（生产环境必需）

```typescript
// ❌ 危险：直接使用 new Function
const result = new Function('vars', `return ${expression}`)(variables);

// ✅ 安全：使用受限表达式解析器
import { createExpressionEvaluator } from 'safe-evaluator';
const evaluator = createExpressionEvaluator({
  allowedOperators: ['+', '-', '*', '/', '>', '<', '===', '&&', '||'],
  allowedFunctions: ['Math.max', 'Math.min'],
});
const result = evaluator.evaluate(expression, variables);
```

---

## 完整工作流引擎实现

### 工作流定义 DSL

```typescript
// workflow-definition.ts

interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'approval' | 'condition' | 'parallel' | 'delay' | 'subprocess';
  name: string;
  config?: Record<string, unknown>;
}

interface WorkflowEdge {
  from: string;
  to: string;
  condition?: string;
  priority?: number;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, unknown>;
}

// 示例：费用审批流程
export const expenseApprovalWorkflow: WorkflowDefinition = {
  id: 'expense-approval',
  name: '费用报销审批',
  nodes: [
    { id: 'start', type: 'start', name: '提交申请' },
    { id: 'auto-check', type: 'task', name: '自动校验', config: { script: 'validateExpense' } },
    { id: 'check-amount', type: 'condition', name: '金额判断' },
    { id: 'manager-approval', type: 'approval', name: '经理审批', config: { assignee: 'manager' } },
    { id: 'hr-approval', type: 'approval', name: 'HR审批', config: { assignee: 'hr' } },
    { id: 'finance-pay', type: 'task', name: '财务打款', config: { script: 'processPayment' } },
    { id: 'notify-reject', type: 'task', name: '通知驳回', config: { script: 'sendRejectEmail' } },
    { id: 'end', type: 'end', name: '流程结束' },
  ],
  edges: [
    { from: 'start', to: 'auto-check' },
    { from: 'auto-check', to: 'check-amount' },
    { from: 'check-amount', to: 'manager-approval', condition: 'vars.amount <= 5000', priority: 1 },
    { from: 'check-amount', to: 'hr-approval', condition: 'vars.amount > 5000', priority: 2 },
    { from: 'manager-approval', to: 'finance-pay', condition: 'vars.approved === true' },
    { from: 'manager-approval', to: 'notify-reject', condition: 'vars.approved === false' },
    { from: 'hr-approval', to: 'finance-pay', condition: 'vars.approved === true' },
    { from: 'hr-approval', to: 'notify-reject', condition: 'vars.approved === false' },
    { from: 'finance-pay', to: 'end' },
    { from: 'notify-reject', to: 'end' },
  ],
  variables: { amount: 0, approved: false, submitter: '' },
};
```

### 状态机执行引擎

```typescript
// workflow-engine.ts
type NodeState = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

interface NodeInstance {
  nodeId: string;
  state: NodeState;
  startTime?: Date;
  endTime?: Date;
  output?: Record<string, unknown>;
  error?: string;
}

interface WorkflowInstance {
  id: string;
  definitionId: string;
  state: 'running' | 'completed' | 'failed' | 'suspended';
  variables: Record<string, unknown>;
  nodeStates: Map<string, NodeInstance>;
  currentNodes: Set<string>;
  history: string[];
}

class WorkflowEngine {
  private definitions = new Map<string, WorkflowDefinition>();
  private instances = new Map<string, WorkflowInstance>();
  private taskHandlers = new Map<string, (vars: Record<string, unknown>) => Promise<Record<string, unknown>>>();

  registerDefinition(def: WorkflowDefinition) {
    this.definitions.set(def.id, def);
  }

  registerTaskHandler(name: string, handler: (vars: Record<string, unknown>) => Promise<Record<string, unknown>>) {
    this.taskHandlers.set(name, handler);
  }

  async start(definitionId: string, initialVars: Record<string, unknown>): Promise<string> {
    const def = this.definitions.get(definitionId);
    if (!def) throw new Error(`Definition ${definitionId} not found`);

    const instance: WorkflowInstance = {
      id: crypto.randomUUID(),
      definitionId,
      state: 'running',
      variables: { ...def.variables, ...initialVars },
      nodeStates: new Map(),
      currentNodes: new Set(['start']),
      history: [],
    };

    this.instances.set(instance.id, instance);
    await this.runInstance(instance.id);
    return instance.id;
  }

  private async runInstance(instanceId: string) {
    const instance = this.instances.get(instanceId)!;
    const def = this.definitions.get(instance.definitionId)!;

    while (instance.currentNodes.size > 0 && instance.state === 'running') {
      const nodeIds = Array.from(instance.currentNodes);
      instance.currentNodes.clear();

      await Promise.all(nodeIds.map(nodeId => this.executeNode(instanceId, def, nodeId)));
    }

    if (instance.currentNodes.size === 0) {
      instance.state = instance.nodeStates.get('end')?.state === 'completed' ? 'completed' : 'failed';
    }
  }

  private async executeNode(instanceId: string, def: WorkflowDefinition, nodeId: string) {
    const instance = this.instances.get(instanceId)!;
    const node = def.nodes.find(n => n.id === nodeId)!;
    const nodeInstance: NodeInstance = {
      nodeId,
      state: 'running',
      startTime: new Date(),
    };
    instance.nodeStates.set(nodeId, nodeInstance);
    instance.history.push(`${new Date().toISOString()} [RUN] ${node.name} (${nodeId})`);

    try {
      switch (node.type) {
        case 'start':
        case 'end':
          nodeInstance.state = 'completed';
          break;

        case 'task': {
          const handler = this.taskHandlers.get(node.config?.script as string);
          if (!handler) throw new Error(`Task handler ${node.config?.script} not found`);
          const result = await handler(instance.variables);
          Object.assign(instance.variables, result);
          nodeInstance.output = result;
          nodeInstance.state = 'completed';
          break;
        }

        case 'approval': {
          // 暂停实例，等待外部审批动作
          instance.state = 'suspended';
          nodeInstance.state = 'pending';
          console.log(`Approval required from ${node.config?.assignee} for node ${nodeId}`);
          return; // 等待 resume
        }

        case 'condition': {
          // condition 节点本身不执行逻辑，由边路由决定
          nodeInstance.state = 'completed';
          break;
        }

        case 'parallel': {
          const outgoing = def.edges.filter(e => e.from === nodeId);
          outgoing.forEach(edge => instance.currentNodes.add(edge.to));
          nodeInstance.state = 'completed';
          return;
        }

        case 'delay': {
          const delayMs = (node.config?.duration as number) || 1000;
          await new Promise(r => setTimeout(r, delayMs));
          nodeInstance.state = 'completed';
          break;
        }

        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      nodeInstance.endTime = new Date();
      instance.history.push(`${new Date().toISOString()} [OK] ${node.name} (${nodeId})`);

      // 路由到下一节点
      const outgoingEdges = def.edges.filter(e => e.from === nodeId);
      const nextNodes = this.resolveNextNodes(outgoingEdges, instance.variables);
      nextNodes.forEach(id => instance.currentNodes.add(id));

    } catch (error) {
      nodeInstance.state = 'failed';
      nodeInstance.error = error instanceof Error ? error.message : String(error);
      instance.state = 'failed';
      instance.history.push(`${new Date().toISOString()} [ERR] ${node.name} (${nodeId}): ${nodeInstance.error}`);
    }
  }

  private resolveNextNodes(edges: WorkflowEdge[], vars: Record<string, unknown>): string[] {
    if (edges.length === 0) return [];
    if (edges.length === 1 && !edges[0].condition) return [edges[0].to];

    // 按优先级排序，找第一个满足条件的边
    const sorted = [...edges].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    for (const edge of sorted) {
      if (!edge.condition || this.evaluateCondition(edge.condition, vars)) {
        return [edge.to];
      }
    }
    return [];
  }

  private evaluateCondition(expression: string, vars: Record<string, unknown>): boolean {
    // 生产环境应使用受限表达式解析器
    const sandbox = new Map(Object.entries(vars));
    const fn = new Function('vars', `with(vars) { return ${expression}; }`);
    return Boolean(fn(sandbox));
  }

  // 外部审批动作 API
  async approve(instanceId: string, nodeId: string, decision: boolean, comment?: string) {
    const instance = this.instances.get(instanceId);
    if (!instance) throw new Error('Instance not found');

    instance.variables.approved = decision;
    if (comment) instance.variables.comment = comment;

    const nodeInstance = instance.nodeStates.get(nodeId);
    if (nodeInstance) {
      nodeInstance.state = 'completed';
      nodeInstance.endTime = new Date();
    }

    instance.state = 'running';
    const def = this.definitions.get(instance.definitionId)!;

    // 路由到下一节点
    const outgoingEdges = def.edges.filter(e => e.from === nodeId);
    const nextNodes = this.resolveNextNodes(outgoingEdges, instance.variables);
    nextNodes.forEach(id => instance.currentNodes.add(id));

    await this.runInstance(instanceId);
  }

  getInstance(id: string): WorkflowInstance | undefined {
    return this.instances.get(id);
  }
}

// 使用示例
const engine = new WorkflowEngine();

engine.registerDefinition(expenseApprovalWorkflow);
engine.registerTaskHandler('validateExpense', async (vars) => {
  const isValid = (vars.amount as number) > 0 && (vars.amount as number) < 100000;
  return { valid: isValid };
});
engine.registerTaskHandler('processPayment', async (vars) => {
  console.log(`Processing payment of ${vars.amount}`);
  return { paymentId: crypto.randomUUID(), status: 'paid' };
});
engine.registerTaskHandler('sendRejectEmail', async (vars) => {
  console.log(`Sending rejection email to ${vars.submitter}`);
  return { notified: true };
});

// 启动流程
const instanceId = await engine.start('expense-approval', {
  amount: 3000,
  submitter: 'alice@example.com',
});

// 经理审批
// await engine.approve(instanceId, 'manager-approval', true);
```

---

## 审批节点状态流转

```
active → pending ──(approve)──> completed
            │
            └──(reject)──> failed
```

### 状态机可视化

```typescript
// 审批状态机定义
const approvalStateMachine = {
  initial: 'pending',
  states: {
    pending: {
      on: {
        APPROVE: 'approved',
        REJECT: 'rejected',
        DELEGATE: 'delegated',
        RECALL: 'recalled',
      },
    },
    delegated: {
      on: { APPROVE: 'approved', REJECT: 'rejected' },
    },
    approved: { type: 'final' as const },
    rejected: { type: 'final' as const },
    recalled: { type: 'final' as const },
  },
};
```

---

## 参考资源

### 规范标准
- [BPMN 2.0 规范 — OMG](https://www.omg.org/spec/BPMN/) — 业务流程模型与符号标准
- [BPMN.io](https://bpmn.io/) — BPMN 2.0 的 Web 建模工具包

### 工作流引擎实现
- [Temporal.io](https://temporal.io/) — 可靠的工作流编排平台（前身为 Cadence）
- [Camunda BPM](https://camunda.com/) — 开源 BPMN 工作流引擎
- [Node-RED](https://nodered.org/) — 基于流的低代码编程工具
- [n8n](https://n8n.io/) — 开源工作流自动化平台

### 数据管道工作流
- [Apache Airflow](https://airflow.apache.org/) — 可编程的数据管道编排
- [Dagster](https://dagster.io/) — 数据资产感知的工作流编排器
- [Prefect](https://www.prefect.io/) — Python 现代工作流编排

### JavaScript 生态
- [XState](https://xstate.js.org/) — JavaScript/TypeScript 状态机与工作流库
- [Robot](https://thisrobot.life/) — 轻量函数式状态机
- [json-logic-js](https://jsonlogic.com/) — 安全的 JSON 规则引擎（替代 new Function）
- [quickjs-emscripten](https://github.com/justjake/quickjs-emscripten/) — 安全沙箱 JS 执行

---

*最后更新: 2026-04-29*
