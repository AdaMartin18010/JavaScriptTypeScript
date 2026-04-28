/**
 * @file Multi-Agent Workflow（顺序 + 并行编排）
 * @category AI Agent → Workflow
 * @difficulty hard
 * @tags multi-agent, workflow, sequential, parallel, orchestration, mastra-pattern
 *
 * 演示：Sequential Agent Pipeline（流水线）与 Parallel Agent Swarm（蜂群）两种模式。
 * 包含状态共享、结果聚合、错误重试、超时控制等企业级编排能力。
 */

// ==================== 核心类型定义 ====================

export interface AgentContext {
  taskId: string;
  input: string;
  metadata: Record<string, unknown>;
  sharedState: Record<string, unknown>;
}

export interface AgentResult {
  agentName: string;
  success: boolean;
  output: string;
  tokensUsed: number;
  latencyMs: number;
  error?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  agentName: string;
  type: 'sequential' | 'parallel';
  condition?: (ctx: AgentContext) => boolean;
  transform?: (input: string, ctx: AgentContext) => string;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
  timeoutMs?: number;
}

export interface WorkflowDefinition {
  name: string;
  steps: WorkflowStep[];
}

// ==================== Agent 抽象层 ====================

export abstract class BaseAgent {
  constructor(
    public readonly name: string,
    public readonly description: string
  ) {}

  abstract execute(input: string, context: AgentContext): Promise<AgentResult>;
}

// 模拟 LLM 驱动的 Research Agent
export class ResearchAgent extends BaseAgent {
  constructor() {
    super('researcher', '研究员：收集信息、检索数据、分析背景');
  }

  async execute(input: string, context: AgentContext): Promise<AgentResult> {
    const start = performance.now();

    // 模拟研究过程：从 sharedState 读取已有信息，补充新研究
    const existingNotes = context.sharedState.researchNotes as string[] ?? [];
    const findings = [
      `关于 "${input}" 的背景调研完成`,
      `发现 3 个关键数据源`,
      `市场趋势：需求持续增长`,
    ];
    context.sharedState.researchNotes = [...existingNotes, ...findings];

    const latency = performance.now() - start;
    return {
      agentName: this.name,
      success: true,
      output: findings.join('\n'),
      tokensUsed: 450,
      latencyMs: latency + 120,
    };
  }
}

// 模拟 Writer Agent
export class WriterAgent extends BaseAgent {
  constructor() {
    super('writer', '写手：基于研究结果撰写内容');
  }

  async execute(input: string, context: AgentContext): Promise<AgentResult> {
    const start = performance.now();
    const notes = context.sharedState.researchNotes as string[] ?? [];

    const draft = [
      `## 关于 ${input} 的报告`,
      '',
      '### 背景',
      ...notes.map((n) => `- ${n}`),
      '',
      '### 正文',
      '基于以上调研，我们得出以下结论...',
      '(此处为模拟生成的正文内容)',
    ].join('\n');

    context.sharedState.draftContent = draft;

    const latency = performance.now() - start;
    return {
      agentName: this.name,
      success: true,
      output: draft,
      tokensUsed: 890,
      latencyMs: latency + 200,
    };
  }
}

// 模拟 Editor Agent（审校）
export class EditorAgent extends BaseAgent {
  constructor() {
    super('editor', '审校：检查语法、风格、事实准确性');
  }

  async execute(input: string, context: AgentContext): Promise<AgentResult> {
    const start = performance.now();
    const draft = context.sharedState.draftContent as string ?? input;

    const suggestions = [
      '语法检查：通过',
      '风格优化：建议增加过渡句',
      '事实核查：未发现明显错误',
    ];

    const revised = `${draft}\n\n---\n审校意见:\n${suggestions.map((s) => `- ${s}`).join('\n')}`;
    context.sharedState.finalContent = revised;

    const latency = performance.now() - start;
    return {
      agentName: this.name,
      success: true,
      output: revised,
      tokensUsed: 320,
      latencyMs: latency + 150,
    };
  }
}

// 模拟 Code Agent（生成代码）
export class CodeAgent extends BaseAgent {
  constructor() {
    super('coder', '程序员：生成、重构或审查代码');
  }

  async execute(input: string, context: AgentContext): Promise<AgentResult> {
    const start = performance.now();

    const code = [
      '// 自动生成代码',
      `function handle${this.toPascalCase(input)}() {`,
      '  // TODO: 实现业务逻辑',
      '  return { status: "ok" };',
      '}',
    ].join('\n');

    const existing = (context.sharedState.codeSnippets as string[]) ?? [];
    context.sharedState.codeSnippets = [...existing, code];

    const latency = performance.now() - start;
    return {
      agentName: this.name,
      success: true,
      output: code,
      tokensUsed: 560,
      latencyMs: latency + 180,
    };
  }

  private toPascalCase(str: string): string {
    return str
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
  }
}

// 模拟 Test Agent（生成测试）
export class TestAgent extends BaseAgent {
  constructor() {
    super('tester', '测试工程师：生成单元测试与边界用例');
  }

  async execute(input: string, context: AgentContext): Promise<AgentResult> {
    const start = performance.now();

    const tests = [
      `describe('${input}', () => {`,
      '  it("should handle normal case", () => {',
      '    expect(handler()).toEqual({ status: "ok" });',
      '  });',
      '  it("should handle edge case with empty input", () => {',
      '    expect(handler("")).toBeDefined();',
      '  });',
      '});',
    ].join('\n');

    const existing = (context.sharedState.testCases as string[]) ?? [];
    context.sharedState.testCases = [...existing, tests];

    const latency = performance.now() - start;
    return {
      agentName: this.name,
      success: true,
      output: tests,
      tokensUsed: 410,
      latencyMs: latency + 140,
    };
  }
}

// ==================== Agent 注册表 ====================

export class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();

  register(agent: BaseAgent): void {
    this.agents.set(agent.name, agent);
  }

  get(name: string): BaseAgent {
    const agent = this.agents.get(name);
    if (!agent) {
      throw new Error(`Agent not found: ${name}`);
    }
    return agent;
  }
}

// ==================== Workflow 引擎 ====================

export class WorkflowEngine {
  constructor(private registry: AgentRegistry) {}

  // 执行顺序工作流（Sequential Pipeline）
  async executeSequential(
    workflow: WorkflowDefinition,
    initialInput: string,
    metadata: Record<string, unknown> = {}
  ): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    const context: AgentContext = {
      taskId: this.generateTaskId(),
      input: initialInput,
      metadata,
      sharedState: {},
    };

    let currentInput = initialInput;

    for (const step of workflow.steps) {
      // 条件判断
      if (step.condition && !step.condition(context)) {
        console.log(`[Workflow] 跳过步骤: ${step.name} (条件不满足)`);
        continue;
      }

      // 输入转换
      const stepInput = step.transform ? step.transform(currentInput, context) : currentInput;

      // 执行 Agent
      const result = await this.executeStep(step, stepInput, context);
      results.push(result);

      if (!result.success) {
        console.error(`[Workflow] 步骤失败: ${step.name} - ${result.error}`);
        break;
      }

      // 将输出作为下一步输入
      currentInput = result.output;
    }

    return results;
  }

  // 执行并行工作流（Parallel Swarm）
  async executeParallel(
    workflow: WorkflowDefinition,
    initialInput: string,
    metadata: Record<string, unknown> = {}
  ): Promise<AgentResult[]> {
    const context: AgentContext = {
      taskId: this.generateTaskId(),
      input: initialInput,
      metadata,
      sharedState: {},
    };

    const promises = workflow.steps.map(async (step) => {
      if (step.condition && !step.condition(context)) {
        return null;
      }
      const stepInput = step.transform ? step.transform(initialInput, context) : initialInput;
      return this.executeStep(step, stepInput, context);
    });

    const results = (await Promise.all(promises)).filter((r): r is AgentResult => r !== null);
    return results;
  }

  // 混合工作流：顺序阶段 + 并行阶段
  async executeMixed(
    phases: Array<{ type: 'sequential' | 'parallel'; workflow: WorkflowDefinition }>,
    initialInput: string,
    metadata: Record<string, unknown> = {}
  ): Promise<AgentResult[][]> {
    const allResults: AgentResult[][] = [];
    let currentInput = initialInput;
    const sharedState: Record<string, unknown> = {};

    for (const phase of phases) {
      const context: AgentContext = {
        taskId: this.generateTaskId(),
        input: initialInput,
        metadata,
        sharedState,
      };

      // 为每个阶段注入共享状态（简化处理：直接复用同一对象引用）
      if (phase.type === 'sequential') {
        const results = await this.executeSequentialWithState(phase.workflow, currentInput, context);
        allResults.push(results);
        const lastSuccess = results.findLast((r) => r.success);
        if (lastSuccess) {
          currentInput = lastSuccess.output;
        }
      } else {
        const results = await this.executeParallelWithState(phase.workflow, currentInput, context);
        allResults.push(results);
        // 并行阶段后，聚合所有输出作为下一步输入
        currentInput = results.map((r) => r.output).join('\n\n---\n\n');
      }
    }

    return allResults;
  }

  private async executeStep(step: WorkflowStep, input: string, context: AgentContext): Promise<AgentResult> {
    const agent = this.registry.get(step.agentName);
    const retryPolicy = step.retryPolicy ?? { maxRetries: 1, backoffMs: 1000 };
    const timeoutMs = step.timeoutMs ?? 30000;

    for (let attempt = 0; attempt < retryPolicy.maxRetries; attempt++) {
      try {
        const result = await this.runWithTimeout(agent, input, context, timeoutMs);
        console.log(
          `[Workflow] ${step.name} (${agent.name}) 成功 | tokens: ${result.tokensUsed} | latency: ${result.latencyMs.toFixed(0)}ms`
        );
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[Workflow] ${step.name} 尝试 ${attempt + 1}/${retryPolicy.maxRetries} 失败: ${message}`);

        if (attempt < retryPolicy.maxRetries - 1) {
          await this.sleep(retryPolicy.backoffMs * (attempt + 1));
        } else {
          return {
            agentName: agent.name,
            success: false,
            output: '',
            tokensUsed: 0,
            latencyMs: 0,
            error: message,
          };
        }
      }
    }

    // 理论上不会到达此处，TS 需要兜底返回
    return {
      agentName: agent.name,
      success: false,
      output: '',
      tokensUsed: 0,
      latencyMs: 0,
      error: '未知错误',
    };
  }

  private runWithTimeout(
    agent: BaseAgent,
    input: string,
    context: AgentContext,
    timeoutMs: number
  ): Promise<AgentResult> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Agent ${agent.name} 执行超时 (${timeoutMs}ms)`));
      }, timeoutMs);

      agent
        .execute(input, context)
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err: Error) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private async executeSequentialWithState(
    workflow: WorkflowDefinition,
    initialInput: string,
    baseContext: AgentContext
  ): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    let currentInput = initialInput;

    for (const step of workflow.steps) {
      if (step.condition && !step.condition(baseContext)) continue;
      const stepInput = step.transform ? step.transform(currentInput, baseContext) : currentInput;
      const result = await this.executeStep(step, stepInput, baseContext);
      results.push(result);
      if (!result.success) break;
      currentInput = result.output;
    }

    return results;
  }

  private async executeParallelWithState(
    workflow: WorkflowDefinition,
    initialInput: string,
    baseContext: AgentContext
  ): Promise<AgentResult[]> {
    const promises = workflow.steps.map(async (step) => {
      if (step.condition && !step.condition(baseContext)) return null;
      const stepInput = step.transform ? step.transform(initialInput, baseContext) : initialInput;
      return this.executeStep(step, stepInput, baseContext);
    });

    return (await Promise.all(promises)).filter((r): r is AgentResult => r !== null);
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ==================== 预定义工作流 ====================

// 顺序：研究 → 写作 → 审校
export const contentPipelineWorkflow: WorkflowDefinition = {
  name: 'content-pipeline',
  steps: [
    {
      id: 'step-1',
      name: '背景研究',
      agentName: 'researcher',
      type: 'sequential',
    },
    {
      id: 'step-2',
      name: '内容撰写',
      agentName: 'writer',
      type: 'sequential',
      transform: (input, ctx) => {
        const notes = (ctx.sharedState.researchNotes as string[])?.join('\n') ?? '';
        return `主题: ${input}\n\n研究笔记:\n${notes}`;
      },
    },
    {
      id: 'step-3',
      name: '质量审校',
      agentName: 'editor',
      type: 'sequential',
      retryPolicy: { maxRetries: 2, backoffMs: 500 },
    },
  ],
};

// 并行：代码生成 + 测试生成（同一需求并行处理）
export const devSwarmWorkflow: WorkflowDefinition = {
  name: 'dev-swarm',
  steps: [
    {
      id: 'step-a',
      name: '生成代码',
      agentName: 'coder',
      type: 'parallel',
      timeoutMs: 10000,
    },
    {
      id: 'step-b',
      name: '生成测试',
      agentName: 'tester',
      type: 'parallel',
      timeoutMs: 10000,
    },
  ],
};

// 混合：先顺序研究，再并行开发与测试，最后顺序审校
export const fullProductWorkflow: Array<{ type: 'sequential' | 'parallel'; workflow: WorkflowDefinition }> = [
  {
    type: 'sequential',
    workflow: {
      name: 'research-phase',
      steps: [
        { id: 'r1', name: '需求分析', agentName: 'researcher', type: 'sequential' },
      ],
    },
  },
  {
    type: 'parallel',
    workflow: {
      name: 'dev-phase',
      steps: [
        { id: 'd1', name: '编码', agentName: 'coder', type: 'parallel' },
        { id: 'd2', name: '测试', agentName: 'tester', type: 'parallel' },
      ],
    },
  },
  {
    type: 'sequential',
    workflow: {
      name: 'review-phase',
      steps: [
        { id: 'v1', name: '代码审校', agentName: 'editor', type: 'sequential' },
      ],
    },
  },
];

// ==================== 演示入口 ====================

export async function demo(): Promise<void> {
  console.log('=== Multi-Agent Workflow 演示 ===\n');

  const registry = new AgentRegistry();
  registry.register(new ResearchAgent());
  registry.register(new WriterAgent());
  registry.register(new EditorAgent());
  registry.register(new CodeAgent());
  registry.register(new TestAgent());

  const engine = new WorkflowEngine(registry);

  // 1. 顺序工作流演示
  console.log('--- 顺序工作流：研究 → 写作 → 审校 ---');
  const sequentialResults = await engine.executeSequential(contentPipelineWorkflow, 'AI Agent 安全最佳实践');
  sequentialResults.forEach((r) => {
    console.log(`\n[${r.agentName}] success=${r.success} tokens=${r.tokensUsed}`);
    if (r.success) {
      console.log(r.output.slice(0, 200) + (r.output.length > 200 ? '...' : ''));
    } else {
      console.log(`Error: ${r.error}`);
    }
  });

  // 2. 并行工作流演示
  console.log('\n\n--- 并行工作流：代码 + 测试 同时生成 ---');
  const parallelResults = await engine.executeParallel(devSwarmWorkflow, 'user authentication handler');
  parallelResults.forEach((r) => {
    console.log(`\n[${r.agentName}] success=${r.success} latency=${r.latencyMs.toFixed(0)}ms`);
    console.log(r.output);
  });

  // 3. 混合工作流演示
  console.log('\n\n--- 混合工作流：研究 → (代码+测试) → 审校 ---');
  const mixedResults = await engine.executeMixed(fullProductWorkflow, 'secure payment gateway');
  mixedResults.forEach((phaseResults, idx) => {
    console.log(`\n阶段 ${idx + 1}:`);
    phaseResults.forEach((r) => {
      console.log(`  - ${r.agentName}: ${r.success ? '✅' : '❌'} (${r.latencyMs.toFixed(0)}ms)`);
    });
  });

  console.log('\n=== 演示完成 ===');
}

if (require.main === module) {
  demo().catch(console.error);
}
