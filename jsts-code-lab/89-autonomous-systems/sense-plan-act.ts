/**
 * @file 环境感知循环（Sense-Plan-Act）
 * @category Autonomous Systems → Perception-Action Loop
 * @difficulty medium
 * @tags sense-plan-act, perception, reactive-agent, environment-loop, robotics
 *
 * @description
 * 实现经典的 Sense-Plan-Act 自治循环：
 * - Sense：从环境传感器读取数据并更新内部世界模型
 * - Plan：基于当前世界模型生成行动计划
 * - Act：执行计划中的动作并观察效果
 * - 支持反应式（reactive）与慎思式（deliberative）混合模式
 */

/** 传感器读数 */
export interface SensorReading {
  /** 传感器 ID */
  sensorId: string;
  /** 读数类型 */
  type: string;
  /** 读数值 */
  value: number | string | boolean;
  /** 时间戳 */
  timestamp: number;
  /** 置信度 0.0 ~ 1.0 */
  confidence: number;
}

/** 世界模型中的实体 */
export interface WorldEntity {
  /** 实体 ID */
  id: string;
  /** 实体类型 */
  type: string;
  /** 属性 */
  properties: Record<string, number | string | boolean>;
  /** 最后更新时间 */
  lastUpdated: number;
}

/** 动作定义 */
export interface Action {
  /** 动作 ID */
  id: string;
  /** 动作名称 */
  name: string;
  /** 动作类型 */
  type: string;
  /** 目标实体 */
  target?: string;
  /** 动作参数 */
  parameters: Record<string, number | string | boolean>;
  /** 执行函数 */
  execute: (env: Environment) => ActionResult;
}

/** 动作执行结果 */
export interface ActionResult {
  /** 是否成功 */
  success: boolean;
  /** 结果描述 */
  message: string;
  /** 对世界模型的变更 */
  worldChanges?: Partial<WorldEntity>[];
}

/** 计划 */
export interface Plan {
  /** 计划 ID */
  id: string;
  /** 动作序列 */
  actions: Action[];
  /** 计划目标 */
  goal: string;
  /** 优先级 */
  priority: number;
}

/** 环境接口 */
export interface Environment {
  /** 读取所有传感器 */
  readSensors(): SensorReading[];
  /** 获取环境中的实体 */
  getEntities(): WorldEntity[];
  /** 应用动作效果到环境 */
  applyAction(effect: ActionResult): void;
}

/** SPA 循环结果 */
export interface SPALoopResult {
  /** 感知到的读数 */
  sensed: SensorReading[];
  /** 生成的计划 */
  plan?: Plan;
  /** 执行的动作结果 */
  actionResults: ActionResult[];
  /** 当前世界模型摘要 */
  worldModel: WorldEntity[];
  /** 循环耗时（ms） */
  durationMs: number;
}

/**
 * 世界模型（内部状态表示）
 */
export class WorldModel {
  private entities = new Map<string, WorldEntity>();

  /**
   * 更新或添加实体
   */
  updateEntity(entity: WorldEntity): void {
    this.entities.set(entity.id, { ...entity, lastUpdated: Date.now() });
  }

  /**
   * 获取实体
   */
  getEntity(id: string): WorldEntity | undefined {
    return this.entities.get(id);
  }

  /**
   * 获取所有实体
   */
  getAllEntities(): WorldEntity[] {
    return Array.from(this.entities.values());
  }

  /**
   * 移除过时实体（超过阈值时间未更新）
   * @param thresholdMs - 超时阈值（毫秒）
   */
  pruneStaleEntities(thresholdMs: number): WorldEntity[] {
    const now = Date.now();
    const removed: WorldEntity[] = [];
    for (const [id, entity] of this.entities) {
      if (now - entity.lastUpdated > thresholdMs) {
        removed.push(entity);
        this.entities.delete(id);
      }
    }
    return removed;
  }

  /**
   * 根据传感器读数更新世界模型
   */
  integrateSensorReading(reading: SensorReading): void {
    const entityId = reading.sensorId;
    const existing = this.entities.get(entityId);

    if (existing) {
      this.entities.set(entityId, {
        ...existing,
        properties: {
          ...existing.properties,
          [reading.type]: reading.value,
        },
        lastUpdated: reading.timestamp,
      });
    } else {
      this.entities.set(entityId, {
        id: entityId,
        type: 'sensor',
        properties: { [reading.type]: reading.value },
        lastUpdated: reading.timestamp,
      });
    }
  }
}

/**
 * Sense-Plan-Act 循环控制器
 *
 * 自治系统的核心控制循环，持续感知环境、制定计划并执行动作。
 */
export class SensePlanActLoop {
  private worldModel = new WorldModel();
  private plans: Plan[] = [];
  private isRunning = false;
  private loopCount = 0;

  constructor(
    private environment: Environment,
    private planner: (worldModel: WorldModel) => Plan | undefined,
    private options?: {
      maxLoops?: number;
      staleThresholdMs?: number;
    }
  ) {}

  /**
   * 执行单次 Sense-Plan-Act 循环
   */
  step(): SPALoopResult {
    const startTime = Date.now();
    this.loopCount++;

    // Sense
    const readings = this.environment.readSensors();
    for (const reading of readings) {
      this.worldModel.integrateSensorReading(reading);
    }

    // 清理过时实体
    const staleThreshold = this.options?.staleThresholdMs ?? 30000;
    this.worldModel.pruneStaleEntities(staleThreshold);

    // Plan
    const plan = this.planner(this.worldModel);
    if (plan) {
      this.plans.push(plan);
      // 保持计划队列按优先级排序
      this.plans.sort((a, b) => b.priority - a.priority);
    }

    // Act
    const actionResults: ActionResult[] = [];
    const currentPlan = this.plans.shift();
    if (currentPlan) {
      for (const action of currentPlan.actions) {
        const result = action.execute(this.environment);
        actionResults.push(result);

        if (result.worldChanges) {
          for (const change of result.worldChanges) {
            if (change.id) {
              const existing = this.worldModel.getEntity(change.id);
              const entity = existing ?? {
                id: change.id,
                type: 'unknown',
                properties: {},
                lastUpdated: Date.now(),
              };
              this.worldModel.updateEntity({
                ...entity,
                properties: { ...entity.properties, ...change.properties },
              });
            }
          }
        }

        this.environment.applyAction(result);

        if (!result.success) break;
      }
    }

    return {
      sensed: readings,
      plan: currentPlan ?? undefined,
      actionResults,
      worldModel: this.worldModel.getAllEntities(),
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * 持续运行循环（同步模拟）
   * @returns 每次循环的结果
   */
  run(): SPALoopResult[] {
    this.isRunning = true;
    const results: SPALoopResult[] = [];
    const maxLoops = this.options?.maxLoops ?? 10;

    while (this.isRunning && this.loopCount < maxLoops) {
      results.push(this.step());
    }

    return results;
  }

  /**
   * 停止循环
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * 获取当前世界模型
   */
  getWorldModel(): WorldModel {
    return this.worldModel;
  }

  /**
   * 获取循环次数
   */
  getLoopCount(): number {
    return this.loopCount;
  }
}

/**
 * 简单的反应式规划器（基于规则匹配）
 *
 * 不构建复杂计划，而是根据当前世界状态直接选择最高优先级的动作。
 */
export class ReactivePlanner {
  private rules: { condition: (wm: WorldModel) => boolean; action: Action; priority: number }[] = [];

  addRule(condition: (wm: WorldModel) => boolean, action: Action, priority = 0): void {
    this.rules.push({ condition, action, priority });
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  plan(worldModel: WorldModel): Plan | undefined {
    const matched = this.rules.find(r => r.condition(worldModel));
    if (!matched) return undefined;

    return {
      id: `reactive-${Date.now()}`,
      actions: [matched.action],
      goal: matched.action.name,
      priority: matched.priority,
    };
  }
}

export function demo(): void {
  console.log('=== Sense-Plan-Act 循环 ===\n');

  // 模拟环境
  const mockEnvironment: Environment = {
    readSensors: () => [
      { sensorId: 'temp-sensor', type: 'temperature', value: 28, timestamp: Date.now(), confidence: 0.95 },
      { sensorId: 'light-sensor', type: 'light-level', value: 300, timestamp: Date.now(), confidence: 0.9 },
    ],
    getEntities: () => [],
    applyAction: () => {},
  };

  // 反应式规划器
  const planner = new ReactivePlanner();
  planner.addRule(
    wm => (wm.getEntity('temp-sensor')?.properties.temperature as number) > 25,
    {
      id: 'ac-on',
      name: '打开空调',
      type: 'control',
      parameters: { target: 24 },
      execute: () => ({ success: true, message: '空调已打开' }),
    },
    10
  );

  planner.addRule(
    wm => (wm.getEntity('light-sensor')?.properties['light-level'] as number) < 500,
    {
      id: 'light-on',
      name: '打开灯光',
      type: 'control',
      parameters: { brightness: 80 },
      execute: () => ({ success: true, message: '灯光已打开' }),
    },
    5
  );

  const loop = new SensePlanActLoop(mockEnvironment, wm => planner.plan(wm), {
    maxLoops: 3,
  });

  const results = loop.run();
  results.forEach((r, i) => {
    console.log(`第 ${i + 1} 次循环:`);
    console.log(`  感知: ${r.sensed.map(s => `${s.type}=${s.value}`).join(', ')}`);
    console.log(`  计划: ${r.plan?.goal ?? '无'}`);
    console.log(`  动作结果: ${r.actionResults.map(a => a.message).join(', ')}`);
    console.log(`  耗时: ${r.durationMs}ms`);
  });
}
