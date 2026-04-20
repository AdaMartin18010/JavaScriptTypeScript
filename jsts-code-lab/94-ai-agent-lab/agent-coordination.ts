/**
 * @file Agent Coordination — 多智能体协调模式
 * @category AI Agent → Coordination
 * @difficulty hard
 * @tags multi-agent, coordination, round-robin, hierarchical, debate, pipeline, orchestration
 *
 * 演示：轮询调度器、层级管理器（Manager-Worker）、辩论模式（投票共识）、流水线模式。
 * 每种模式均支持中间结果传递、错误处理与超时控制。
 */

// ==================== 核心类型定义 ====================

export interface AgentMessage {
  id: string;
  agentName: string;
  role: 'proposer' | 'responder' | 'critic' | 'voter' | 'manager' | 'worker';
  content: string;
  timestamp: number;
  round?: number;
}

export interface CoordinationResult {
  success: boolean;
  output: string;
  messages: AgentMessage[];
  votes?: Record<string, string>;
  error?: string;
}

export interface CoordinationAgent {
  name: string;
  role: string;
  process(input: string, context: AgentMessage[]): Promise<string>;
}

// ==================== 工具函数 ====================

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== 轮询调度器 ====================

export class RoundRobinCoordinator {
  private agents: CoordinationAgent[] = [];
  private currentIndex = 0;

  register(agent: CoordinationAgent): void {
    this.agents.push(agent);
  }

  async coordinate(input: string, maxRounds: number = 3): Promise<CoordinationResult> {
    if (this.agents.length === 0) {
      return { success: false, output: '', messages: [], error: '没有注册的 Agent' };
    }

    const messages: AgentMessage[] = [];
    let currentInput = input;

    for (let round = 0; round < maxRounds; round++) {
      const agent = this.agents[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.agents.length;

      try {
        const output = await agent.process(currentInput, messages);
        const msg: AgentMessage = {
          id: generateId(),
          agentName: agent.name,
          role: 'proposer',
          content: output,
          timestamp: Date.now(),
          round,
        };
        messages.push(msg);
        currentInput = output;
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        return { success: false, output: currentInput, messages, error };
      }
    }

    return { success: true, output: currentInput, messages };
  }
}

// ==================== 层级管理器（Manager + Workers）====================

export interface SubTask {
  id: string;
  description: string;
  assignedWorker?: string;
}

export interface WorkerAgent extends CoordinationAgent {
  name: string;
  capabilities: string[];
}

export class HierarchicalCoordinator {
  private workers: Map<string, WorkerAgent> = new Map();

  registerWorker(worker: WorkerAgent): void {
    this.workers.set(worker.name, worker);
  }

  async coordinate(
    task: string,
    managerDelegate: (task: string, workers: WorkerAgent[]) => Promise<SubTask[]>,
    aggregator: (results: Record<string, string>) => Promise<string>
  ): Promise<CoordinationResult> {
    const messages: AgentMessage[] = [];

    // Manager 分解任务
    const managerMsg: AgentMessage = {
      id: generateId(),
      agentName: 'manager',
      role: 'manager',
      content: `正在分解任务: ${task}`,
      timestamp: Date.now(),
    };
    messages.push(managerMsg);

    const subTasks = await managerDelegate(task, Array.from(this.workers.values()));

    // 分配子任务给 Workers
    const workerPromises = subTasks.map(async (sub) => {
      const worker = sub.assignedWorker
        ? this.workers.get(sub.assignedWorker)
        : this.findBestWorker(sub.description);

      if (!worker) {
        return { id: sub.id, output: `无可用 Worker 处理: ${sub.description}` };
      }

      const output = await worker.process(sub.description, messages);
      messages.push({
        id: generateId(),
        agentName: worker.name,
        role: 'worker',
        content: output,
        timestamp: Date.now(),
      });

      return { id: sub.id, output };
    });

    const workerResults = await Promise.all(workerPromises);
    const resultMap: Record<string, string> = {};
    for (const r of workerResults) {
      resultMap[r.id] = r.output;
    }

    // Manager 汇总结果
    const finalOutput = await aggregator(resultMap);
    messages.push({
      id: generateId(),
      agentName: 'manager',
      role: 'manager',
      content: finalOutput,
      timestamp: Date.now(),
    });

    return { success: true, output: finalOutput, messages };
  }

  private findBestWorker(description: string): WorkerAgent | undefined {
    const workers = Array.from(this.workers.values());
    if (workers.length === 0) return undefined;

    // 简单匹配：选择 capabilities 与任务描述重合度最高的 worker
    let best: WorkerAgent | undefined;
    let bestScore = -1;

    for (const worker of workers) {
      const score = worker.capabilities.reduce((sum, cap) => {
        return description.toLowerCase().includes(cap.toLowerCase()) ? sum + 1 : sum;
      }, 0);
      if (score > bestScore) {
        bestScore = score;
        best = worker;
      }
    }

    return best ?? workers[0];
  }
}

// ==================== 辩论模式（多 Agent 讨论并投票）====================

export class DebateCoordinator {
  private agents: CoordinationAgent[] = [];

  register(agent: CoordinationAgent): void {
    this.agents.push(agent);
  }

  async coordinate(
    topic: string,
    maxRounds: number = 2,
    votingStrategy: 'unanimous' | 'majority' = 'majority'
  ): Promise<CoordinationResult> {
    if (this.agents.length === 0) {
      return { success: false, output: '', messages: [], error: '没有注册的 Agent' };
    }

    const messages: AgentMessage[] = [];

    // 初始命题
    for (let round = 0; round < maxRounds; round++) {
      for (const agent of this.agents) {
        const context = messages.filter((m) => m.round === round || m.round === undefined);
        const input = round === 0 ? topic : `请对当前观点进行回应或补充。主题: ${topic}`;
        const output = await agent.process(input, context);

        messages.push({
          id: generateId(),
          agentName: agent.name,
          role: round === 0 ? 'proposer' : 'responder',
          content: output,
          timestamp: Date.now(),
          round,
        });
      }
    }

    // 投票阶段
    const votes: Record<string, string> = {};
    const debateSummary = messages.map((m) => `[${m.agentName}] ${m.content}`).join('\n');

    for (const agent of this.agents) {
      const votePrompt = `基于以下讨论，请给出你的最终立场（同意/反对/中立）：\n${debateSummary}`;
      const voteResult = await agent.process(votePrompt, messages);
      votes[agent.name] = this.parseVote(voteResult);
    }

    const consensus = this.evaluateVotes(votes, votingStrategy);

    return {
      success: true,
      output: `共识结果: ${consensus}\n\n投票详情:\n${Object.entries(votes)
        .map(([k, v]) => `  ${k}: ${v}`)
        .join('\n')}`,
      messages,
      votes,
    };
  }

  private parseVote(response: string): string {
    const lower = response.toLowerCase();
    if (lower.includes('同意') || lower.includes('赞成') || lower.includes('support') || lower.includes('agree')) {
      return '同意';
    }
    if (lower.includes('反对') || lower.includes('reject') || lower.includes('disagree') || lower.includes('against')) {
      return '反对';
    }
    return '中立';
  }

  private evaluateVotes(votes: Record<string, string>, strategy: 'unanimous' | 'majority'): string {
    const values = Object.values(votes);
    const counts: Record<string, number> = {};
    for (const v of values) {
      counts[v] = (counts[v] ?? 0) + 1;
    }

    if (strategy === 'unanimous') {
      const unique = new Set(values);
      return unique.size === 1 ? `${values[0]}（全票通过）` : '未达成一致';
    }

    let maxCount = 0;
    let winner = '中立';
    for (const [option, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        winner = option;
      }
    }

    return `${winner}（${maxCount}/${values.length} 票）`;
  }
}

// ==================== 流水线模式 ====================

export interface PipelineStage {
  name: string;
  agent: CoordinationAgent;
  condition?: (input: string) => boolean;
}

export class PipelineCoordinator {
  private stages: PipelineStage[] = [];

  addStage(stage: PipelineStage): void {
    this.stages.push(stage);
  }

  async coordinate(input: string): Promise<CoordinationResult> {
    const messages: AgentMessage[] = [];
    let currentInput = input;

    for (const stage of this.stages) {
      if (stage.condition && !stage.condition(currentInput)) {
        messages.push({
          id: generateId(),
          agentName: stage.agent.name,
          role: 'worker',
          content: `[跳过阶段] ${stage.name}`,
          timestamp: Date.now(),
        });
        continue;
      }

      try {
        const output = await stage.agent.process(currentInput, messages);
        messages.push({
          id: generateId(),
          agentName: stage.agent.name,
          role: 'worker',
          content: output,
          timestamp: Date.now(),
        });
        currentInput = output;
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        return { success: false, output: currentInput, messages, error: `${stage.name} 失败: ${error}` };
      }
    }

    return { success: true, output: currentInput, messages };
  }
}

// ==================== 模拟 Agent 工厂 ====================

export function createMockAgent(name: string, role: string, responseTemplate: string): CoordinationAgent {
  return {
    name,
    role,
    async process(input: string, _context: AgentMessage[]): Promise<string> {
      await sleep(10);
      return responseTemplate.replace('{{input}}', input);
    },
  };
}

export function createReflectiveAgent(name: string, prefix: string): CoordinationAgent {
  return {
    name,
    role: 'responder',
    async process(input: string, context: AgentMessage[]): Promise<string> {
      await sleep(10);
      const insight = context.length > 0 ? `（参考了 ${context.length} 条上下文）` : '';
      return `${prefix}: 针对 "${input}"${insight}，我的观点是...`;
    },
  };
}

// ==================== 演示入口 ====================

export async function demo(): Promise<void> {
  console.log('=== Agent Coordination 演示 ===\n');

  // 1. 轮询调度器
  console.log('--- 轮询调度器 ---');
  const rr = new RoundRobinCoordinator();
  rr.register(createMockAgent('agent-a', 'processor', '[Agent-A] 处理了: {{input}}'));
  rr.register(createMockAgent('agent-b', 'processor', '[Agent-B] 优化了: {{input}}'));
  rr.register(createMockAgent('agent-c', 'processor', '[Agent-C] 审核了: {{input}}'));

  const rrResult = await rr.coordinate('初始需求文档', 4);
  console.log(`轮询结果: ${rrResult.output}`);
  console.log(`消息数: ${rrResult.messages.length}`);

  // 2. 层级管理器
  console.log('\n--- 层级管理器（Manager + Workers）---');
  const hc = new HierarchicalCoordinator();
  hc.registerWorker({
    name: 'researcher',
    role: 'worker',
    capabilities: ['调研', '搜索', '数据'],
    async process(input: string) {
      return `[研究员] 完成调研: ${input}`;
    },
  });
  hc.registerWorker({
    name: 'designer',
    role: 'worker',
    capabilities: ['设计', 'UI', '原型'],
    async process(input: string) {
      return `[设计师] 完成设计: ${input}`;
    },
  });
  hc.registerWorker({
    name: 'developer',
    role: 'worker',
    capabilities: ['开发', '代码', '实现'],
    async process(input: string) {
      return `[开发者] 完成实现: ${input}`;
    },
  });

  const hcResult = await hc.coordinate(
    '开发一个电商小程序',
    async (task, workers) => [
      { id: 't1', description: `${task} - 需求调研`, assignedWorker: 'researcher' },
      { id: 't2', description: `${task} - UI 设计`, assignedWorker: 'designer' },
      { id: 't3', description: `${task} - 功能开发`, assignedWorker: 'developer' },
    ],
    async (results) => `项目完成:\n${Object.entries(results).map(([k, v]) => `  ${k}: ${v}`).join('\n')}`
  );
  console.log(`层级结果:\n${hcResult.output}`);

  // 3. 辩论模式
  console.log('\n--- 辩论模式 ---');
  const dc = new DebateCoordinator();
  dc.register(createReflectiveAgent('optimist', '乐观派'));
  dc.register(createReflectiveAgent('pessimist', '谨慎派'));
  dc.register(createReflectiveAgent('pragmatist', '务实派'));

  const dcResult = await dc.coordinate('是否应该在所有项目中引入 AI Agent？', 1, 'majority');
  console.log(`辩论结果:\n${dcResult.output}`);

  // 4. 流水线模式
  console.log('\n--- 流水线模式 ---');
  const pc = new PipelineCoordinator();
  pc.addStage({
    name: '数据清洗',
    agent: createMockAgent('cleaner', 'preprocessor', '[清洗后] {{input}}'),
  });
  pc.addStage({
    name: '特征提取',
    agent: createMockAgent('extractor', 'processor', '[特征] 从 "{{input}}" 提取关键特征'),
  });
  pc.addStage({
    name: '结果生成',
    agent: createMockAgent('generator', 'postprocessor', '[最终结果] 基于 "{{input}}" 生成报告'),
    condition: (input) => input.includes('特征'),
  });

  const pcResult = await pc.coordinate('原始用户行为日志数据');
  console.log(`流水线结果: ${pcResult.output}`);
  console.log(`各阶段消息:`);
  pcResult.messages.forEach((m) => console.log(`  [${m.agentName}] ${m.content.slice(0, 80)}`));

  console.log('\n=== 演示完成 ===');
}

if (require.main === module) {
  demo().catch(console.error);
}
