/**
 * @file 自主智能体
 * @category Autonomous Systems → Agents
 * @difficulty hard
 * @tags autonomous-agents, decision-trees, reinforcement-learning, bdi
 */

// BDI (Belief-Desire-Intention) 架构
export interface Belief {
  id: string;
  predicate: string;
  value: unknown;
  confidence: number;
  timestamp: number;
}

export interface Desire {
  id: string;
  goal: string;
  priority: number;
  deadline?: number;
}

export interface Intention {
  id: string;
  desireId: string;
  plan: Action[];
  currentStep: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

export interface Action {
  name: string;
  preconditions: (beliefs: Belief[]) => boolean;
  execute: () => boolean;
}

export class BDIAgent {
  private beliefs: Map<string, Belief> = new Map();
  private desires: Map<string, Desire> = new Map();
  private intentions: Map<string, Intention> = new Map();
  private availablePlans: Map<string, Action[]> = new Map(); // goal -> plan
  
  // 添加信念
  addBelief(belief: Belief): void {
    this.beliefs.set(belief.id, belief);
    this.reviseBeliefs();
  }
  
  // 更新信念
  updateBelief(id: string, updates: Partial<Belief>): void {
    const belief = this.beliefs.get(id);
    if (belief) {
      Object.assign(belief, updates, { timestamp: Date.now() });
    }
  }
  
  // 添加目标
  addDesire(desire: Desire): void {
    this.desires.set(desire.id, desire);
    this.deliberate();
  }
  
  // 注册计划
  registerPlan(goal: string, plan: Action[]): void {
    this.availablePlans.set(goal, plan);
  }
  
  // 慎思：选择要追求的目标
  private deliberate(): void {
    // 按优先级排序目标
    const sortedDesires = Array.from(this.desires.values())
      .filter(d => !this.isAchieved(d))
      .sort((a, b) => b.priority - a.priority);
    
    for (const desire of sortedDesires.slice(0, 3)) { // 最多3个意图
      if (!this.hasIntentionForDesire(desire.id)) {
        this.formIntention(desire);
      }
    }
  }
  
  // 形成意图
  private formIntention(desire: Desire): void {
    const plan = this.availablePlans.get(desire.goal);
    if (!plan) return;
    
    // 检查计划的前提条件
    const beliefs = Array.from(this.beliefs.values());
    for (const action of plan) {
      if (!action.preconditions(beliefs)) {
        return; // 计划不可行
      }
    }
    
    const intention: Intention = {
      id: `int-${Date.now()}-${desire.id}`,
      desireId: desire.id,
      plan,
      currentStep: 0,
      status: 'pending'
    };
    
    this.intentions.set(intention.id, intention);
  }
  
  // 执行意图
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
      console.log(`[Agent] Goal achieved: ${desire.goal}`);
    }
  }
  
  private reviseBeliefs(): void {
    // 信念修正逻辑
    // 移除过期的低置信度信念
    const now = Date.now();
    for (const [id, belief] of this.beliefs) {
      if (belief.confidence < 0.3 && now - belief.timestamp > 60000) {
        this.beliefs.delete(id);
      }
    }
  }
  
  private isAchieved(desire: Desire): boolean {
    // 简化：检查是否有已完成的意图
    for (const intention of this.intentions.values()) {
      if (intention.desireId === desire.id && intention.status === 'completed') {
        return true;
      }
    }
    return false;
  }
  
  private hasIntentionForDesire(desireId: string): boolean {
    for (const intention of this.intentions.values()) {
      if (intention.desireId === desireId && 
          (intention.status === 'pending' || intention.status === 'executing')) {
        return true;
      }
    }
    return false;
  }
  
  getStatus(): { beliefs: number; desires: number; intentions: number } {
    return {
      beliefs: this.beliefs.size,
      desires: this.desires.size,
      intentions: this.intentions.size
    };
  }
}

// 决策树
export interface DecisionNode {
  type: 'decision' | 'action';
  condition?: (state: Record<string, unknown>) => boolean;
  trueBranch?: DecisionNode;
  falseBranch?: DecisionNode;
  action?: () => void;
  name: string;
}

export class DecisionTree {
  private root: DecisionNode;
  
  constructor(root: DecisionNode) {
    this.root = root;
  }
  
  decide(state: Record<string, unknown>): string {
    let current: DecisionNode | undefined = this.root;
    const path: string[] = [];
    
    while (current) {
      path.push(current.name);
      
      if (current.type === 'action') {
        current.action?.();
        return path.join(' -> ');
      }
      
      if (current.condition?.(state)) {
        current = current.trueBranch;
      } else {
        current = current.falseBranch;
      }
    }
    
    return path.join(' -> ');
  }
}

// 状态机
export class StateMachine {
  private states: Map<string, State> = new Map();
  private currentState: string = '';
  private transitions: Array<{ from: string; to: string; condition: () => boolean }> = [];
  
  addState(name: string, onEnter?: () => void, onExit?: () => void): void {
    this.states.set(name, { name, onEnter, onExit });
  }
  
  addTransition(from: string, to: string, condition: () => boolean): void {
    this.transitions.push({ from, to, condition });
  }
  
  setInitialState(state: string): void {
    this.currentState = state;
    this.states.get(state)?.onEnter?.();
  }
  
  update(): void {
    for (const transition of this.transitions) {
      if (transition.from === this.currentState && transition.condition()) {
        this.transitionTo(transition.to);
        break;
      }
    }
  }
  
  private transitionTo(newState: string): void {
    this.states.get(this.currentState)?.onExit?.();
    this.currentState = newState;
    this.states.get(newState)?.onEnter?.();
    console.log(`[StateMachine] Transitioned to ${newState}`);
  }
  
  getCurrentState(): string {
    return this.currentState;
  }
}

interface State {
  name: string;
  onEnter?: () => void;
  onExit?: () => void;
}

// 强化学习基础 (Q-Learning简化版)
export class QLearningAgent {
  private qTable: Map<string, Map<string, number>> = new Map();
  private learningRate = 0.1;
  private discountFactor = 0.9;
  private explorationRate = 0.3;
  
  constructor(private actions: string[]) {}
  
  chooseAction(state: string): string {
    // ε-贪婪策略
    if (Math.random() < this.explorationRate) {
      return this.actions[Math.floor(Math.random() * this.actions.length)];
    }
    
    const stateActions = this.qTable.get(state);
    if (!stateActions) return this.actions[0];
    
    // 选择Q值最高的动作
    let bestAction = this.actions[0];
    let bestValue = -Infinity;
    
    for (const [action, value] of stateActions) {
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }
    
    return bestAction;
  }
  
  learn(state: string, action: string, reward: number, nextState: string): void {
    if (!this.qTable.has(state)) {
      this.qTable.set(state, new Map());
    }
    
    const stateActions = this.qTable.get(state)!;
    const currentQ = stateActions.get(action) || 0;
    
    // 计算下一状态的最大Q值
    const nextStateActions = this.qTable.get(nextState);
    let maxNextQ = 0;
    if (nextStateActions) {
      for (const value of nextStateActions.values()) {
        maxNextQ = Math.max(maxNextQ, value);
      }
    }
    
    // Q-learning更新公式
    const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
    stateActions.set(action, newQ);
  }
  
  decayExploration(decay: number): void {
    this.explorationRate = Math.max(0.01, this.explorationRate * decay);
  }
  
  getQTable(): Record<string, Record<string, number>> {
    const result: Record<string, Record<string, number>> = {};
    for (const [state, actions] of this.qTable) {
      result[state] = {};
      for (const [action, value] of actions) {
        result[state][action] = value;
      }
    }
    return result;
  }
}

// 行为树
export type BehaviorNode = SequenceNode | SelectorNode | ActionNode | ConditionNode;

export interface SequenceNode {
  type: 'sequence';
  children: BehaviorNode[];
}

export interface SelectorNode {
  type: 'selector';
  children: BehaviorNode[];
}

export interface ActionNode {
  type: 'action';
  name: string;
  execute: () => 'success' | 'failure' | 'running';
}

export interface ConditionNode {
  type: 'condition';
  check: () => boolean;
}

export class BehaviorTree {
  constructor(private root: BehaviorNode) {}
  
  tick(): 'success' | 'failure' | 'running' {
    return this.tickNode(this.root);
  }
  
  private tickNode(node: BehaviorNode): 'success' | 'failure' | 'running' {
    switch (node.type) {
      case 'sequence':
        for (const child of node.children) {
          const result = this.tickNode(child);
          if (result === 'failure') return 'failure';
          if (result === 'running') return 'running';
        }
        return 'success';
        
      case 'selector':
        for (const child of node.children) {
          const result = this.tickNode(child);
          if (result === 'success') return 'success';
          if (result === 'running') return 'running';
        }
        return 'failure';
        
      case 'action':
        return node.execute();
        
      case 'condition':
        return node.check() ? 'success' : 'failure';
        
      default:
        return 'failure';
    }
  }
}

export function demo(): void {
  console.log('=== 自动化系统 ===\n');
  
  // BDI智能体
  console.log('--- BDI智能体 ---');
  const agent = new BDIAgent();
  
  // 注册计划
  agent.registerPlan('get_food', [
    {
      name: 'check_fridge',
      preconditions: () => true,
      execute: () => { console.log('  Checking fridge...'); return true; }
    },
    {
      name: 'prepare_meal',
      preconditions: () => true,
      execute: () => { console.log('  Preparing meal...'); return true; }
    },
    {
      name: 'eat',
      preconditions: () => true,
      execute: () => { console.log('  Eating...'); return true; }
    }
  ]);
  
  // 添加信念
  agent.addBelief({
    id: 'belief-1',
    predicate: 'hungry',
    value: true,
    confidence: 0.9,
    timestamp: Date.now()
  });
  
  // 添加目标
  agent.addDesire({
    id: 'desire-1',
    goal: 'get_food',
    priority: 10
  });
  
  console.log('智能体状态:', agent.getStatus());
  agent.execute();
  
  // 决策树
  console.log('\n--- 决策树 ---');
  const decisionTree = new DecisionTree({
    type: 'decision',
    name: 'is_raining',
    condition: (state) => state.weather === 'rain',
    trueBranch: {
      type: 'action',
      name: 'take_umbrella',
      action: () => console.log('Taking umbrella')
    },
    falseBranch: {
      type: 'decision',
      name: 'is_hot',
      condition: (state) => (state.temperature as number) > 30,
      trueBranch: {
        type: 'action',
        name: 'wear_shorts',
        action: () => console.log('Wearing shorts')
      },
      falseBranch: {
        type: 'action',
        name: 'normal_clothes',
        action: () => console.log('Normal clothes')
      }
    }
  });
  
  console.log('决策路径 (雨天):', decisionTree.decide({ weather: 'rain', temperature: 25 }));
  console.log('决策路径 (炎热):', decisionTree.decide({ weather: 'sunny', temperature: 35 }));
  
  // Q-Learning
  console.log('\n--- Q-Learning ---');
  const rlAgent = new QLearningAgent(['up', 'down', 'left', 'right']);
  
  // 模拟训练
  for (let episode = 0; episode < 100; episode++) {
    let state = 'start';
    for (let step = 0; step < 10; step++) {
      const action = rlAgent.chooseAction(state);
      const reward = Math.random() > 0.5 ? 1 : -1; // 随机奖励
      const nextState = action === 'up' ? 'goal' : state;
      
      rlAgent.learn(state, action, reward, nextState);
      state = nextState;
      
      if (state === 'goal') break;
    }
    rlAgent.decayExploration(0.99);
  }
  
  console.log('学习后的Q表 (部分):');
  const qTable = rlAgent.getQTable();
  for (const [state, actions] of Object.entries(qTable).slice(0, 3)) {
    console.log(`  ${state}:`, actions);
  }
  
  // 行为树
  console.log('\n--- 行为树 ---');
  let hasTarget = false;
  let inRange = false;
  
  const behaviorTree = new BehaviorTree({
    type: 'selector',
    children: [
      {
        type: 'sequence',
        children: [
          {
            type: 'condition',
            check: () => hasTarget
          },
          {
            type: 'condition',
            check: () => inRange
          },
          {
            type: 'action',
            name: 'attack',
            execute: () => {
              console.log('Attacking target!');
              return 'success';
            }
          }
        ]
      },
      {
        type: 'action',
        name: 'patrol',
        execute: () => {
          console.log('Patrolling...');
          return 'success';
        }
      }
    ]
  });
  
  console.log('巡逻模式:');
  behaviorTree.tick();
  
  hasTarget = true;
  inRange = true;
  console.log('攻击模式:');
  behaviorTree.tick();
}
