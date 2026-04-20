import { describe, it, expect } from 'vitest';
import {
  RoundRobinCoordinator,
  HierarchicalCoordinator,
  DebateCoordinator,
  PipelineCoordinator,
  createMockAgent,
  createReflectiveAgent,
} from './agent-coordination.js';

describe('RoundRobinCoordinator', () => {
  it('空注册表应返回错误', async () => {
    const coordinator = new RoundRobinCoordinator();
    const result = await coordinator.coordinate('test', 2);
    expect(result.success).toBe(false);
    expect(result.error).toContain('没有注册的 Agent');
  });

  it('应按轮询顺序调度 Agent', async () => {
    const coordinator = new RoundRobinCoordinator();
    coordinator.register(createMockAgent('a', 'p', 'A-{{input}}'));
    coordinator.register(createMockAgent('b', 'p', 'B-{{input}}'));

    const result = await coordinator.coordinate('start', 3);
    expect(result.success).toBe(true);
    expect(result.messages).toHaveLength(3);
    expect(result.messages[0].agentName).toBe('a');
    expect(result.messages[1].agentName).toBe('b');
    expect(result.messages[2].agentName).toBe('a');
  });

  it('应将上一步输出作为下一步输入', async () => {
    const coordinator = new RoundRobinCoordinator();
    coordinator.register(createMockAgent('a', 'p', 'step1'));
    coordinator.register(createMockAgent('b', 'p', 'step2-from-{{input}}'));

    const result = await coordinator.coordinate('init', 2);
    expect(result.output).toContain('step2-from-step1');
  });

  it('应处理执行异常', async () => {
    const coordinator = new RoundRobinCoordinator();
    coordinator.register({
      name: 'failer',
      role: 'processor',
      async process() {
        throw new Error('处理失败');
      },
    });

    const result = await coordinator.coordinate('test', 1);
    expect(result.success).toBe(false);
    expect(result.error).toContain('处理失败');
  });
});

describe('HierarchicalCoordinator', () => {
  it('Manager 应分解任务并分发给 Workers', async () => {
    const coordinator = new HierarchicalCoordinator();
    coordinator.registerWorker({
      name: 'w1',
      role: 'worker',
      capabilities: ['coding'],
      async process(input: string) {
        return `coded: ${input}`;
      },
    });

    const result = await coordinator.coordinate(
      'build app',
      async (task, workers) => [
        { id: '1', description: `${task} - module A`, assignedWorker: 'w1' },
      ],
      async (results) => `汇总:\n${Object.values(results).join('\n')}`
    );

    expect(result.success).toBe(true);
    expect(result.output).toContain('coded: build app - module A');
    expect(result.messages.some((m) => m.role === 'manager')).toBe(true);
    expect(result.messages.some((m) => m.role === 'worker')).toBe(true);
  });

  it('未指定 Worker 时应自动匹配', async () => {
    const coordinator = new HierarchicalCoordinator();
    coordinator.registerWorker({
      name: 'searcher',
      role: 'worker',
      capabilities: ['search', 'data'],
      async process(input: string) {
        return `searched: ${input}`;
      },
    });

    const result = await coordinator.coordinate(
      'search data',
      async () => [{ id: '1', description: 'search data' }], // 未指定 assignedWorker
      async (results) => Object.values(results)[0]
    );

    expect(result.success).toBe(true);
    expect(result.output).toContain('searched:');
  });

  it('无可用 Worker 时应返回提示', async () => {
    const coordinator = new HierarchicalCoordinator();
    const result = await coordinator.coordinate(
      'task',
      async () => [{ id: '1', description: 'do something' }],
      async (results) => Object.values(results)[0]
    );

    expect(result.success).toBe(true);
    expect(result.output).toContain('无可用 Worker');
  });
});

describe('DebateCoordinator', () => {
  it('空注册表应返回错误', async () => {
    const coordinator = new DebateCoordinator();
    const result = await coordinator.coordinate('topic', 1);
    expect(result.success).toBe(false);
    expect(result.error).toContain('没有注册的 Agent');
  });

  it('应收集多轮讨论和投票', async () => {
    const coordinator = new DebateCoordinator();
    coordinator.register(createReflectiveAgent('a', 'A派'));
    coordinator.register(createReflectiveAgent('b', 'B派'));

    const result = await coordinator.coordinate('是否采用新技术？', 1, 'majority');
    expect(result.success).toBe(true);
    expect(result.votes).toBeDefined();
    expect(Object.keys(result.votes!)).toContain('a');
    expect(Object.keys(result.votes!)).toContain('b');
    expect(result.output).toContain('共识结果');
  });

  it('多数决应统计票数', async () => {
    const coordinator = new DebateCoordinator();
    coordinator.register(createReflectiveAgent('yes1', '赞成派'));
    coordinator.register(createReflectiveAgent('yes2', '赞成派'));
    coordinator.register(createReflectiveAgent('no1', '反对派'));

    const result = await coordinator.coordinate('通过方案？', 1, 'majority');
    expect(result.success).toBe(true);
    expect(result.output).toContain('票');
  });

  it('全票通过模式应要求一致', async () => {
    const coordinator = new DebateCoordinator();
    coordinator.register({
      name: 'unanimous-yes',
      role: 'voter',
      async process() {
        return '同意';
      },
    });
    coordinator.register({
      name: 'unanimous-yes2',
      role: 'voter',
      async process() {
        return '同意';
      },
    });

    const result = await coordinator.coordinate('一致通过？', 1, 'unanimous');
    expect(result.success).toBe(true);
    expect(result.output).toContain('全票通过');
  });

  it('应记录所有讨论消息', async () => {
    const coordinator = new DebateCoordinator();
    coordinator.register(createReflectiveAgent('x', 'X'));
    coordinator.register(createReflectiveAgent('y', 'Y'));

    const result = await coordinator.coordinate('test', 2, 'majority');
    expect(result.messages.length).toBeGreaterThanOrEqual(4); // 2 agents * 2 rounds
  });
});

describe('PipelineCoordinator', () => {
  it('应按顺序执行各阶段', async () => {
    const coordinator = new PipelineCoordinator();
    coordinator.addStage({
      name: 'stage1',
      agent: createMockAgent('s1', 'p', 'S1:{{input}}'),
    });
    coordinator.addStage({
      name: 'stage2',
      agent: createMockAgent('s2', 'p', 'S2:{{input}}'),
    });

    const result = await coordinator.coordinate('init');
    expect(result.success).toBe(true);
    expect(result.output).toBe('S2:S1:init');
    expect(result.messages).toHaveLength(2);
  });

  it('条件不满足时应跳过阶段', async () => {
    const coordinator = new PipelineCoordinator();
    coordinator.addStage({
      name: 'always',
      agent: createMockAgent('a', 'p', 'A:{{input}}'),
    });
    coordinator.addStage({
      name: 'conditional',
      agent: createMockAgent('b', 'p', 'B:{{input}}'),
      condition: (input) => input.includes('[trigger]'),
    });

    const result = await coordinator.coordinate('no-trigger');
    expect(result.success).toBe(true);
    expect(result.messages).toHaveLength(2);
    expect(result.messages[1].content).toContain('跳过阶段');
  });

  it('执行失败应中断流水线', async () => {
    const coordinator = new PipelineCoordinator();
    coordinator.addStage({
      name: 'ok',
      agent: createMockAgent('ok', 'p', 'ok'),
    });
    coordinator.addStage({
      name: 'fail',
      agent: {
        name: 'failer',
        role: 'processor',
        async process() {
          throw new Error('broken');
        },
      },
    });

    const result = await coordinator.coordinate('start');
    expect(result.success).toBe(false);
    expect(result.error).toContain('broken');
  });

  it('空流水线应直接返回输入', async () => {
    const coordinator = new PipelineCoordinator();
    const result = await coordinator.coordinate('unchanged');
    expect(result.success).toBe(true);
    expect(result.output).toBe('unchanged');
  });
});
