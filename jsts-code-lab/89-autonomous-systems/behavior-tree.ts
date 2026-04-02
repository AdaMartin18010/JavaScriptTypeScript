/**
 * @file 行为树（Behavior Tree）完整实现
 * @category Autonomous Systems → Behavior Control
 * @difficulty hard
 * @tags behavior-tree, ai, npc, game-ai, patrol-chase-attack
 *
 * @description
 * 行为树是游戏 AI 与机器人控制中主流的决策框架，通过树状节点组合实现复杂行为。
 * - Selector（选择器）：顺序执行子节点，直到有一个成功（OR 逻辑）。
 * - Sequence（序列）：顺序执行子节点，直到有一个失败（AND 逻辑）。
 * - Parallel（并行）：同时执行多个子节点，按策略（全成功 / 任一成功）返回结果。
 * - Decorator（装饰器）：对单个子节点行为进行包装，如反转结果（Inverter）、重复执行（Repeater）、冷却时间（Cooldown）。
 * - Action（动作）：执行具体行为。
 * - Condition（条件）：检查环境状态。
 */

export type NodeStatus = 'success' | 'failure' | 'running';

export abstract class BTNode {
  abstract tick(): NodeStatus;
  abstract reset(): void;
}

/** 动作节点：执行具体游戏逻辑 */
export class ActionNode extends BTNode {
  constructor(private name: string, private action: () => NodeStatus) {
    super();
  }

  tick(): NodeStatus {
    return this.action();
  }

  reset(): void {
    // 动作节点通常无需额外重置
  }

  getName(): string {
    return this.name;
  }
}

/** 条件节点：返回 success 或 failure */
export class ConditionNode extends BTNode {
  constructor(private check: () => boolean) {
    super();
  }

  tick(): NodeStatus {
    return this.check() ? 'success' : 'failure';
  }

  reset(): void {}
}

/** 序列节点：所有子节点顺序成功才算成功 */
export class SequenceNode extends BTNode {
  private currentIndex = 0;

  constructor(private children: BTNode[]) {
    super();
  }

  tick(): NodeStatus {
    while (this.currentIndex < this.children.length) {
      const status = this.children[this.currentIndex].tick();
      if (status === 'failure') {
        this.reset();
        return 'failure';
      }
      if (status === 'running') {
        return 'running';
      }
      this.currentIndex++;
    }
    this.reset();
    return 'success';
  }

  reset(): void {
    this.currentIndex = 0;
    for (const child of this.children) {
      child.reset();
    }
  }
}

/** 选择器节点：子节点中有一个成功即成功 */
export class SelectorNode extends BTNode {
  private currentIndex = 0;

  constructor(private children: BTNode[]) {
    super();
  }

  tick(): NodeStatus {
    while (this.currentIndex < this.children.length) {
      const status = this.children[this.currentIndex].tick();
      if (status === 'success') {
        this.reset();
        return 'success';
      }
      if (status === 'running') {
        return 'running';
      }
      this.currentIndex++;
    }
    this.reset();
    return 'failure';
  }

  reset(): void {
    this.currentIndex = 0;
    for (const child of this.children) {
      child.reset();
    }
  }
}

/** 并行节点：同时执行所有子节点 */
export class ParallelNode extends BTNode {
  constructor(private children: BTNode[], private requiredSuccesses: number) {
    super();
  }

  tick(): NodeStatus {
    let successes = 0;
    let failures = 0;
    let runnings = 0;

    for (const child of this.children) {
      const status = child.tick();
      if (status === 'success') successes++;
      else if (status === 'failure') failures++;
      else runnings++;
    }

    if (successes >= this.requiredSuccesses) {
      this.reset();
      return 'success';
    }
    if (failures > this.children.length - this.requiredSuccesses) {
      this.reset();
      return 'failure';
    }
    return 'running';
  }

  reset(): void {
    for (const child of this.children) {
      child.reset();
    }
  }
}

/** 装饰器基类 */
export abstract class DecoratorNode extends BTNode {
  constructor(protected child: BTNode) {
    super();
  }
}

/** Inverter：将子节点的 success 转为 failure，failure 转为 success */
export class InverterNode extends DecoratorNode {
  tick(): NodeStatus {
    const status = this.child.tick();
    if (status === 'success') return 'failure';
    if (status === 'failure') return 'success';
    return 'running';
  }

  reset(): void {
    this.child.reset();
  }
}

/** Repeater：重复执行子节点指定次数 */
export class RepeaterNode extends DecoratorNode {
  private count = 0;

  constructor(child: BTNode, private maxRepeats: number) {
    super(child);
  }

  tick(): NodeStatus {
    while (this.count < this.maxRepeats) {
      const status = this.child.tick();
      if (status === 'running') return 'running';
      this.count++;
      this.child.reset();
    }
    this.count = 0;
    return 'success';
  }

  reset(): void {
    this.count = 0;
    this.child.reset();
  }
}

/** Cooldown：在冷却时间内直接返回 failure，否则执行子节点 */
export class CooldownNode extends DecoratorNode {
  private lastExecutionTime = 0;

  constructor(child: BTNode, private cooldownMs: number) {
    super(child);
  }

  tick(): NodeStatus {
    const now = Date.now();
    if (now - this.lastExecutionTime < this.cooldownMs) {
      return 'failure';
    }
    this.lastExecutionTime = now;
    return this.child.tick();
  }

  reset(): void {
    this.lastExecutionTime = 0;
    this.child.reset();
  }
}

export class BehaviorTree {
  constructor(private root: BTNode) {}

  tick(): NodeStatus {
    return this.root.tick();
  }

  reset(): void {
    this.root.reset();
  }
}

/** NPC 巡逻-追击-攻击逻辑演示 */
export function demo(): void {
  console.log('=== 行为树：NPC 巡逻-追击-攻击 ===\n');

  // 模拟环境状态
  const world = {
    hasTarget: false,
    inAttackRange: false,
    health: 100,
  };

  const tree = new BehaviorTree(
    new SelectorNode([
      // 分支1：攻击序列（发现目标且在攻击范围内）
      new SequenceNode([
        new ConditionNode(() => world.hasTarget),
        new ConditionNode(() => world.inAttackRange),
        new CooldownNode(
          new ActionNode('attack', () => {
            console.log('  [NPC] 执行攻击!');
            return 'success';
          }),
          500
        ),
      ]),
      // 分支2：追击序列（发现目标但不在范围内）
      new SequenceNode([
        new ConditionNode(() => world.hasTarget),
        new InverterNode(new ConditionNode(() => world.inAttackRange)),
        new ActionNode('chase', () => {
          console.log('  [NPC] 追击目标...');
          return 'success';
        }),
      ]),
      // 分支3：巡逻（默认行为），并重复巡逻动作 2 次
      new RepeaterNode(
        new ActionNode('patrol', () => {
          console.log('  [NPC] 在区域内巡逻');
          return 'success';
        }),
        2
      ),
    ])
  );

  console.log('--- 场景 A：无目标，默认巡逻 ---');
  tree.tick();

  console.log('\n--- 场景 B：发现目标，但距离远，追击 ---');
  world.hasTarget = true;
  world.inAttackRange = false;
  tree.reset();
  tree.tick();

  console.log('\n--- 场景 C：目标进入攻击范围，攻击 ---');
  world.inAttackRange = true;
  tree.reset();
  tree.tick();

  console.log('\n--- 场景 D：并行节点演示：边移动边搜索 ---');
  const parallelTree = new BehaviorTree(
    new ParallelNode(
      [
        new ActionNode('move', () => {
          console.log('  [并行] 移动中...');
          return 'success';
        }),
        new ActionNode('scan', () => {
          console.log('  [并行] 扫描敌人...');
          return 'success';
        }),
      ],
      2 // 需要 2 个子节点都成功
    )
  );
  parallelTree.tick();
}
