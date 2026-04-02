/**
 * @file BDI（Belief-Desire-Intention）智能体架构实现
 * @category Autonomous Systems → Agent Architectures
 * @difficulty hard
 * @tags bdi-agent, rescue-robot, deliberative-agent, plan-execution
 *
 * @description
 * BDI 模型是认知智能体的经典架构，广泛应用于机器人救援、游戏 NPC 与自动驾驶决策。
 * - Belief（信念）：智能体对环境的事实性认知，可随感知更新。
 * - Desire（欲望）：智能体希望达成的目标集合，通常带有优先级。
 * - Intention（意图）：当前正在执行的计划集合，是承诺采取行动的 desires。
 */

export type BeliefValue = string | number | boolean;

/** 信念：智能体对世界状态的认知单元 */
export interface Belief {
  id: string;
  predicate: string;
  value: BeliefValue;
  confidence: number;
  timestamp: number;
}

/** 欲望：智能体希望达成的目标 */
export interface Desire {
  id: string;
  goal: string;
  priority: number;
  deadline?: number;
}

/** 计划中的单步动作 */
export interface PlanAction {
  name: string;
  /** 前置条件：基于当前信念库判断是否可执行 */
  preconditions: (beliefs: ReadonlyMap<string, Belief>) => boolean;
  /** 执行动作，返回是否成功 */
  execute: () => boolean;
}

/** 意图：为达成某个欲望而形成的已承诺计划 */
export interface Intention {
  id: string;
  desireId: string;
  plan: PlanAction[];
  currentStep: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

export class BDIAgent {
  private beliefs: Map<string, Belief> = new Map();
  private desires: Map<string, Desire> = new Map();
  private intentions: Map<string, Intention> = new Map();
  private availablePlans: Map<string, PlanAction[]> = new Map();

  addBelief(belief: Belief): void {
    this.beliefs.set(belief.id, belief);
    this.reviseBeliefs();
  }

  updateBelief(id: string, updates: Partial<Omit<Belief, 'id' | 'timestamp'>>): void {
    const belief = this.beliefs.get(id);
    if (belief) {
      if (updates.predicate !== undefined) belief.predicate = updates.predicate;
      if (updates.value !== undefined) belief.value = updates.value;
      if (updates.confidence !== undefined) belief.confidence = updates.confidence;
      belief.timestamp = Date.now();
    }
  }

  addDesire(desire: Desire): void {
    this.desires.set(desire.id, desire);
    this.deliberate();
  }

  registerPlan(goal: string, plan: PlanAction[]): void {
    this.availablePlans.set(goal, plan);
  }

  /** 慎思（Deliberation）：从欲望中选择要追求的目标，并转化为意图 */
  private deliberate(): void {
    const sortedDesires = Array.from(this.desires.values())
      .filter((d) => !this.isAchieved(d))
      .sort((a, b) => b.priority - a.priority);

    for (const desire of sortedDesires.slice(0, 3)) {
      if (!this.hasActiveIntentionForDesire(desire.id)) {
        this.formIntention(desire);
      }
    }
  }

  /** 形成意图：检查计划的前置条件，若可行则创建意图 */
  private formIntention(desire: Desire): void {
    const plan = this.availablePlans.get(desire.goal);
    if (!plan || plan.length === 0) return;

    for (const action of plan) {
      if (!action.preconditions(this.beliefs)) {
        return; // 计划不可行，放弃形成意图
      }
    }

    const intention: Intention = {
      id: `int-${Date.now()}-${desire.id}`,
      desireId: desire.id,
      plan,
      currentStep: 0,
      status: 'pending',
    };
    this.intentions.set(intention.id, intention);
  }

  /** 执行所有处于 pending 或 executing 状态的意图 */
  execute(): void {
    for (const intention of this.intentions.values()) {
      if (intention.status === 'pending' || intention.status === 'executing') {
        this.executeIntention(intention);
      }
    }
  }

  private executeIntention(intention: Intention): void {
    intention.status = 'executing';
    while (intention.currentStep < intention.plan.length) {
      const action = intention.plan[intention.currentStep];
      const success = action.execute();
      if (success) {
        intention.currentStep++;
      } else {
        intention.status = 'failed';
        return;
      }
    }
    intention.status = 'completed';
    const desire = this.desires.get(intention.desireId);
    if (desire) {
      console.log(`[BDIAgent] 目标达成: ${desire.goal}`);
    }
  }

  /** 信念修正：移除过期且低置信度的信念 */
  private reviseBeliefs(): void {
    const now = Date.now();
    for (const [id, belief] of this.beliefs) {
      if (belief.confidence < 0.3 && now - belief.timestamp > 60000) {
        this.beliefs.delete(id);
      }
    }
  }

  private isAchieved(desire: Desire): boolean {
    for (const intention of this.intentions.values()) {
      if (intention.desireId === desire.id && intention.status === 'completed') {
        return true;
      }
    }
    return false;
  }

  private hasActiveIntentionForDesire(desireId: string): boolean {
    for (const intention of this.intentions.values()) {
      if (
        intention.desireId === desireId &&
        (intention.status === 'pending' || intention.status === 'executing')
      ) {
        return true;
      }
    }
    return false;
  }

  getStatus(): { beliefs: number; desires: number; intentions: number } {
    return {
      beliefs: this.beliefs.size,
      desires: this.desires.size,
      intentions: this.intentions.size,
    };
  }

  getIntentions(): Intention[] {
    return Array.from(this.intentions.values());
  }
}

/** 救援机器人演示：在火灾现场执行搜救、灭火与充电任务 */
export function demo(): void {
  console.log('=== BDI 救援机器人 ===\n');

  const robot = new BDIAgent();

  // 注册计划
  robot.registerPlan('rescue_victim', [
    {
      name: 'navigate_to_victim',
      preconditions: (beliefs) =>
        (beliefs.get('victim_location')?.value as boolean | undefined) === true,
      execute: () => {
        console.log('  [动作] 导航到受困者位置');
        return true;
      },
    },
    {
      name: 'clear_debris',
      preconditions: (beliefs) =>
        (beliefs.get('fire_nearby')?.value as boolean | undefined) !== true,
      execute: () => {
        console.log('  [动作] 清除障碍物');
        return true;
      },
    },
    {
      name: 'carry_victim',
      preconditions: () => true,
      execute: () => {
        console.log('  [动作] 转移受困者到安全区');
        return true;
      },
    },
  ]);

  robot.registerPlan('extinguish_fire', [
    {
      name: 'approach_fire',
      preconditions: () => true,
      execute: () => {
        console.log('  [动作] 接近火源');
        return true;
      },
    },
    {
      name: 'spray_water',
      preconditions: (beliefs) =>
        (beliefs.get('has_water')?.value as boolean | undefined) === true,
      execute: () => {
        console.log('  [动作] 喷水灭火');
        return true;
      },
    },
  ]);

  robot.registerPlan('recharge', [
    {
      name: 'return_to_base',
      preconditions: () => true,
      execute: () => {
        console.log('  [动作] 返回充电站');
        return true;
      },
    },
    {
      name: 'dock_and_charge',
      preconditions: () => true,
      execute: () => {
        console.log('  [动作] 对接充电');
        return true;
      },
    },
  ]);

  // 添加信念
  robot.addBelief({
    id: 'victim_location',
    predicate: 'victim_detected',
    value: true,
    confidence: 0.95,
    timestamp: Date.now(),
  });
  robot.addBelief({
    id: 'fire_nearby',
    predicate: 'fire_nearby',
    value: false,
    confidence: 0.9,
    timestamp: Date.now(),
  });
  robot.addBelief({
    id: 'has_water',
    predicate: 'has_water',
    value: true,
    confidence: 0.9,
    timestamp: Date.now(),
  });

  // 添加欲望（目标）
  robot.addDesire({ id: 'd1', goal: 'rescue_victim', priority: 10 });
  robot.addDesire({ id: 'd2', goal: 'extinguish_fire', priority: 5 });
  robot.addDesire({ id: 'd3', goal: 'recharge', priority: 2 });

  console.log('初始状态:', robot.getStatus());
  console.log('意图列表:', robot.getIntentions().map((i) => i.id));

  robot.execute();
  console.log('执行后状态:', robot.getStatus());
}
