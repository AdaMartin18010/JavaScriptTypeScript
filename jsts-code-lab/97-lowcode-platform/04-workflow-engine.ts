/**
 * @file 工作流引擎基础
 * @category Low-code -> Workflow Engine
 * @difficulty hard
 * @tags low-code, workflow, bpm, state-machine, dag
 *
 * @description
 * 工作流引擎是低代码平台实现业务自动化的核心。本模块实现了基于 DAG 的
 * 工作流定义、状态机执行、审批节点和事件驱动编排。
 */

// ============================================================================
// 1. 工作流定义模型
// ============================================================================

export type NodeType = 'start' | 'end' | 'task' | 'approval' | 'condition' | 'parallel' | 'subprocess' | 'delay' | 'event';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  config: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  condition?: string;       // 条件表达式
  priority?: number;        // 优先级（条件分支时使用）
  label?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  timeout?: number;         // 全局超时（ms）
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  defaultValue?: unknown;
  required?: boolean;
}

// ============================================================================
// 2. 流程实例与状态
// ============================================================================

export type InstanceStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'timeout';
export type NodeStatus = 'pending' | 'active' | 'completed' | 'skipped' | 'failed' | 'cancelled';

export interface NodeInstance {
  nodeId: string;
  status: NodeStatus;
  startTime?: number;
  endTime?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  assignee?: string;        // 审批节点处理人
}

export interface WorkflowInstance {
  id: string;
  definitionId: string;
  definitionVersion: number;
  status: InstanceStatus;
  variables: Record<string, unknown>;
  nodeInstances: Map<string, NodeInstance>;
  currentNodeIds: string[];
  startTime: number;
  endTime?: number;
  createdBy: string;
}

// ============================================================================
// 3. 工作流引擎核心
// ============================================================================

export interface TaskHandler {
  type: string;
  execute(node: WorkflowNode, context: ExecutionContext): Promise<Record<string, unknown>>;
}

export interface ExecutionContext {
  instance: WorkflowInstance;
  definition: WorkflowDefinition;
  variables: Record<string, unknown>;
}

export class WorkflowEngine {
  private definitions = new Map<string, WorkflowDefinition>();
  private instances = new Map<string, WorkflowInstance>();
  private taskHandlers = new Map<string, TaskHandler>();
  private listeners: Map<string, Set<(instance: WorkflowInstance) => void>> = new Map();

  registerDefinition(def: WorkflowDefinition): void {
    this.definitions.set(`${def.id}@${def.version}`, def);
  }

  getDefinition(id: string, version: number): WorkflowDefinition | undefined {
    return this.definitions.get(`${id}@${version}`);
  }

  registerTaskHandler(handler: TaskHandler): void {
    this.taskHandlers.set(handler.type, handler);
  }

  /** 启动流程实例 */
  start(definitionId: string, version: number, variables: Record<string, unknown> = {}, createdBy = 'system'): WorkflowInstance {
    const def = this.getDefinition(definitionId, version);
    if (!def) throw new Error(`Workflow definition ${definitionId}@${version} not found`);

    const instanceId = `inst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const startNode = def.nodes.find((n) => n.type === 'start');
    if (!startNode) throw new Error('Workflow must have a start node');

    const instance: WorkflowInstance = {
      id: instanceId,
      definitionId,
      definitionVersion: version,
      status: 'running',
      variables: { ...this.initVariables(def.variables), ...variables },
      nodeInstances: new Map(),
      currentNodeIds: [startNode.id],
      startTime: Date.now(),
      createdBy,
    };

    this.instances.set(instanceId, instance);
    this.execute(instance);
    return instance;
  }

  private initVariables(vars: WorkflowVariable[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const v of vars) {
      if (v.defaultValue !== undefined) {
        result[v.name] = v.defaultValue;
      }
    }
    return result;
  }

  private async execute(instance: WorkflowInstance): Promise<void> {
    const def = this.getDefinition(instance.definitionId, instance.definitionVersion);
    if (!def) return;

    while (instance.currentNodeIds.length > 0 && instance.status === 'running') {
      const nodeId = instance.currentNodeIds.shift()!;
      const node = def.nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      await this.executeNode(node, instance, def);
    }

    if (instance.currentNodeIds.length === 0 && instance.status === 'running') {
      instance.status = 'completed';
      instance.endTime = Date.now();
      this.emit('completed', instance);
    }
  }

  private async executeNode(node: WorkflowNode, instance: WorkflowInstance, def: WorkflowDefinition): Promise<void> {
    const nodeInst: NodeInstance = {
      nodeId: node.id,
      status: 'active',
      startTime: Date.now(),
    };
    instance.nodeInstances.set(node.id, nodeInst);

    const context: ExecutionContext = {
      instance,
      definition: def,
      variables: instance.variables,
    };

    try {
      switch (node.type) {
        case 'start':
          nodeInst.output = { started: true };
          break;

        case 'end':
          nodeInst.output = { ended: true };
          instance.status = 'completed';
          break;

        case 'task': {
          const handler = this.taskHandlers.get(node.config.handlerType as string);
          if (handler) {
            nodeInst.output = await handler.execute(node, context);
          } else {
            nodeInst.output = await this.executeDefaultTask(node, context);
          }
          break;
        }

        case 'approval':
          nodeInst.status = 'pending';
          nodeInst.assignee = node.config.assignee as string;
          // 审批节点暂停流程，等待外部触发
          instance.currentNodeIds.unshift(node.id); // 放回队列，等待人工处理
          instance.status = 'paused';
          this.emit('approval', instance);
          return;

        case 'condition': {
          const result = this.evaluateCondition(node.config.expression as string, instance.variables);
          nodeInst.output = { result };
          break;
        }

        case 'delay':
          await this.delay(node.config.duration as number);
          nodeInst.output = { delayed: true };
          break;

        case 'parallel': {
          const branches = this.getParallelBranches(node.id, def);
          instance.currentNodeIds.push(...branches);
          nodeInst.output = { branches };
          break;
        }

        default:
          nodeInst.output = {};
      }

      if (node.type !== 'approval') {
        nodeInst.status = 'completed';
        nodeInst.endTime = Date.now();
        this.moveToNext(node.id, instance, def, nodeInst.output);
      }
    } catch (error) {
      nodeInst.status = 'failed';
      nodeInst.error = error instanceof Error ? error.message : String(error);
      instance.status = 'failed';
      this.emit('failed', instance);
    }
  }

  private async executeDefaultTask(node: WorkflowNode, context: ExecutionContext): Promise<Record<string, unknown>> {
    console.log(`[Workflow] Executing task: ${node.name}`);
    return { executed: true, nodeName: node.name };
  }

  private evaluateCondition(expression: string, variables: Record<string, unknown>): boolean {
    try {
      const fn = new Function('vars', `with(vars) { return !!(${expression}); }`);
      return fn(variables);
    } catch {
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private moveToNext(nodeId: string, instance: WorkflowInstance, def: WorkflowDefinition, output?: Record<string, unknown>): void {
    const edges = def.edges.filter((e) => e.from === nodeId);

    if (edges.length === 0) return;

    // 条件分支
    const conditionEdges = edges.filter((e) => e.condition);
    if (conditionEdges.length > 0) {
      const matched = conditionEdges
        .filter((e) => this.evaluateCondition(e.condition!, { ...instance.variables, ...output }))
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      if (matched.length > 0) {
        instance.currentNodeIds.push(matched[0].to);
      } else {
        // 无条件默认分支
        const defaultEdge = edges.find((e) => !e.condition);
        if (defaultEdge) instance.currentNodeIds.push(defaultEdge.to);
      }
    } else {
      // 顺序执行
      for (const edge of edges) {
        instance.currentNodeIds.push(edge.to);
      }
    }
  }

  private getParallelBranches(nodeId: string, def: WorkflowDefinition): string[] {
    // 简化：找到从 parallel 节点出发的所有直接边
    return def.edges.filter((e) => e.from === nodeId).map((e) => e.to);
  }

  /** 审批通过 */
  approve(instanceId: string, nodeId: string, comment?: string): void {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    const nodeInst = instance.nodeInstances.get(nodeId);
    if (!nodeInst || nodeInst.status !== 'pending') return;

    nodeInst.status = 'completed';
    nodeInst.output = { approved: true, comment };
    nodeInst.endTime = Date.now();

    instance.status = 'running';
    const def = this.getDefinition(instance.definitionId, instance.definitionVersion)!;
    this.moveToNext(nodeId, instance, def, nodeInst.output);
    this.execute(instance);
    this.emit('approved', instance);
  }

  /** 审批拒绝 */
  reject(instanceId: string, nodeId: string, comment?: string): void {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    const nodeInst = instance.nodeInstances.get(nodeId);
    if (!nodeInst) return;

    nodeInst.status = 'failed';
    nodeInst.output = { approved: false, comment };
    instance.status = 'failed';
    this.emit('rejected', instance);
  }

  getInstance(id: string): WorkflowInstance | undefined {
    return this.instances.get(id);
  }

  on(event: string, listener: (instance: WorkflowInstance) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)!.delete(listener);
  }

  private emit(event: string, instance: WorkflowInstance): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(instance);
      }
    }
  }
}

// ============================================================================
// 4. 演示
// ============================================================================

export function demo(): void {
  console.log('=== 工作流引擎基础 ===\n');

  const engine = new WorkflowEngine();

  // 注册任务处理器
  engine.registerTaskHandler({
    type: 'send-email',
    async execute(node, context) {
      console.log(`  [Task] 发送邮件给: ${node.config.to}`);
      return { sent: true, template: node.config.template };
    },
  });

  // 定义审批工作流
  const approvalFlow: WorkflowDefinition = {
    id: 'leave-request',
    name: '请假审批',
    version: 1,
    nodes: [
      { id: 'start', type: 'start', name: '开始', config: {} },
      { id: 'submit', type: 'task', name: '提交申请', config: { handlerType: 'send-email', to: 'manager@company.com' } },
      { id: 'check', type: 'condition', name: '天数检查', config: { expression: 'vars.days > 3' } },
      { id: 'manager', type: 'approval', name: '经理审批', config: { assignee: 'manager' } },
      { id: 'hr', type: 'approval', name: 'HR 审批', config: { assignee: 'hr' } },
      { id: 'notify', type: 'task', name: '通知结果', config: { handlerType: 'send-email', to: 'employee@company.com' } },
      { id: 'end', type: 'end', name: '结束', config: {} },
    ],
    edges: [
      { id: 'e1', from: 'start', to: 'submit' },
      { id: 'e2', from: 'submit', to: 'check' },
      { id: 'e3', from: 'check', to: 'hr', condition: 'vars.days > 3', priority: 1 },
      { id: 'e4', from: 'check', to: 'manager', condition: 'vars.days <= 3', priority: 0 },
      { id: 'e5', from: 'manager', to: 'notify' },
      { id: 'e6', from: 'hr', to: 'notify' },
      { id: 'e7', from: 'notify', to: 'end' },
    ],
    variables: [
      { name: 'days', type: 'number', defaultValue: 1, required: true },
      { name: 'reason', type: 'string', required: true },
    ],
  };

  engine.registerDefinition(approvalFlow);

  // 启动短假流程
  console.log('--- 启动 2 天请假流程 ---');
  const instance1 = engine.start('leave-request', 1, { days: 2, reason: '休息' }, 'employee-001');
  console.log('实例状态:', instance1.status);
  console.log('当前节点:', instance1.currentNodeIds);

  // 启动长假流程
  console.log('\n--- 启动 5 天请假流程 ---');
  const instance2 = engine.start('leave-request', 1, { days: 5, reason: '旅行' }, 'employee-002');
  console.log('实例状态:', instance2.status);
  console.log('当前节点:', instance2.currentNodeIds);

  // 模拟审批
  console.log('\n--- 经理审批 ---');
  engine.approve(instance1.id, 'manager', '批准');
  console.log('审批后状态:', engine.getInstance(instance1.id)?.status);
}
