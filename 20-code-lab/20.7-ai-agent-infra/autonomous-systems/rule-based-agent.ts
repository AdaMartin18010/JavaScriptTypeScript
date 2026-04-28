/**
 * @file 基于规则的智能体
 * @category Autonomous Systems → Rule-Based Agent
 * @difficulty medium
 * @tags rule-based-agent, expert-system, inference-engine, forward-chaining
 *
 * @description
 * 实现基于规则的产生式系统（Production System）：
 * - 事实（Fact）与规则（Rule）的表示
 * - 前向链推理（Forward Chaining）
 * - 规则匹配与触发（Rete 网络简化版）
 * - 冲突消解策略（优先级、最近使用）
 */

/** 事实断言 */
export interface Fact {
  /** 事实标识符 */
  id: string;
  /** 谓词（属性名） */
  predicate: string;
  /** 主体 */
  subject: string;
  /** 值 */
  value: string | number | boolean;
  /** 置信度 0.0 ~ 1.0 */
  confidence?: number;
}

/** 规则条件 */
export interface RuleCondition {
  /** 谓词 */
  predicate: string;
  /** 主体（支持通配符 *） */
  subject: string;
  /** 值（支持通配符 *） */
  value: string | number | boolean | '*';
  /** 比较操作 */
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte';
}

/** 规则动作 */
export type RuleAction =
  | { type: 'assert'; fact: Omit<Fact, 'id'> }
  | { type: 'retract'; predicate: string; subject: string }
  | { type: 'modify'; predicate: string; subject: string; value: string | number | boolean }
  | { type: 'log'; message: string };

/** 产生式规则 */
export interface Rule {
  /** 规则 ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 优先级（数字越大优先级越高） */
  priority: number;
  /** 前提条件（AND 关系） */
  conditions: RuleCondition[];
  /** 执行动作 */
  actions: RuleAction[];
  /** 是否只能触发一次 */
  once?: boolean;
}

/** 规则触发记录 */
export interface RuleFiring {
  ruleId: string;
  ruleName: string;
  timestamp: number;
  matchedFacts: Fact[];
}

/** 推理结果 */
export interface InferenceResult {
  /** 新增的事实 */
  newFacts: Fact[];
  /** 被移除的事实 */
  retractedFacts: Fact[];
  /** 触发记录 */
  firings: RuleFiring[];
  /** 迭代次数 */
  iterations: number;
}

/**
 * 基于规则的推理引擎
 *
 * 前向链推理：从已知事实出发，反复匹配规则前提，
 * 触发规则动作产生新事实，直到没有新规则可触发。
 */
export class RuleBasedAgent {
  private facts = new Map<string, Fact>();
  private rules: Rule[] = [];
  private firedRules = new Set<string>();
  private factCounter = 0;

  /**
   * 添加事实到知识库
   * @param fact - 事实（若不提供 id 则自动生成）
   */
  assert(fact: Omit<Fact, 'id'> & { id?: string }): Fact {
    const id = fact.id ?? `fact-${++this.factCounter}`;
    const fullFact: Fact = { confidence: 1.0, ...fact, id };
    this.facts.set(id, fullFact);
    return fullFact;
  }

  /**
   * 从知识库移除事实
   * @param predicate - 谓词
   * @param subject - 主体
   */
  retract(predicate: string, subject: string): Fact[] {
    const removed: Fact[] = [];
    for (const [id, fact] of this.facts) {
      if (fact.predicate === predicate && fact.subject === subject) {
        removed.push(fact);
        this.facts.delete(id);
      }
    }
    return removed;
  }

  /**
   * 添加规则
   * @param rule - 规则
   */
  addRule(rule: Rule): void {
    this.rules.push(rule);
    // 按优先级降序排列
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 运行推理引擎
   * @param maxIterations - 最大迭代次数（防止无限循环）
   * @returns 推理结果
   */
  infer(maxIterations = 100): InferenceResult {
    const newFacts: Fact[] = [];
    const retractedFacts: Fact[] = [];
    const firings: RuleFiring[] = [];
    let iterations = 0;

    while (iterations < maxIterations) {
      iterations++;
      let anyFired = false;

      for (const rule of this.rules) {
        if (rule.once && this.firedRules.has(rule.id)) continue;

        const matchedFacts = this.matchRule(rule);
        if (matchedFacts !== null) {
          anyFired = true;
          this.firedRules.add(rule.id);

          for (const action of rule.actions) {
            switch (action.type) {
              case 'assert': {
                const fact = this.assert(action.fact);
                newFacts.push(fact);
                break;
              }
              case 'retract': {
                const removed = this.retract(action.predicate, action.subject);
                retractedFacts.push(...removed);
                break;
              }
              case 'modify': {
                for (const fact of this.facts.values()) {
                  if (fact.predicate === action.predicate && fact.subject === action.subject) {
                    this.facts.set(fact.id, { ...fact, value: action.value });
                  }
                }
                break;
              }
              case 'log':
                // 日志动作在推理中不直接产生事实变更
                break;
            }
          }

          firings.push({
            ruleId: rule.id,
            ruleName: rule.name,
            timestamp: Date.now(),
            matchedFacts,
          });

          // 每次只触发一条规则后重新匹配（避免一次迭代内过度触发）
          break;
        }
      }

      if (!anyFired) break;
    }

    return { newFacts, retractedFacts, firings, iterations };
  }

  /**
   * 获取当前知识库中的所有事实
   */
  getFacts(): Fact[] {
    return Array.from(this.facts.values());
  }

  /**
   * 查询符合谓词和主体的事实
   */
  query(predicate: string, subject?: string): Fact[] {
    return Array.from(this.facts.values()).filter(f => {
      if (f.predicate !== predicate) return false;
      if (subject !== undefined && f.subject !== subject) return false;
      return true;
    });
  }

  /**
   * 重置推理状态（保留规则和事实）
   */
  reset(): void {
    this.firedRules.clear();
  }

  /**
   * 完全清空（事实、规则、状态）
   */
  clear(): void {
    this.facts.clear();
    this.rules = [];
    this.firedRules.clear();
    this.factCounter = 0;
  }

  private matchRule(rule: Rule): Fact[] | null {
    const factList = Array.from(this.facts.values());
    const matched: Fact[] = [];

    for (const condition of rule.conditions) {
      const matching = factList.find(f => this.conditionMatches(f, condition));
      if (!matching) return null;
      matched.push(matching);
    }

    return matched;
  }

  private conditionMatches(fact: Fact, condition: RuleCondition): boolean {
    if (fact.predicate !== condition.predicate) return false;
    if (condition.subject !== '*' && fact.subject !== condition.subject) return false;
    if (condition.value !== '*' && fact.value !== condition.value) {
      const op = condition.operator ?? 'eq';
      const factVal = typeof fact.value === 'number' ? fact.value : NaN;
      const condVal = typeof condition.value === 'number' ? condition.value : NaN;

      if (Number.isNaN(factVal) || Number.isNaN(condVal)) return false;

      switch (op) {
        case 'gt': return factVal > condVal;
        case 'lt': return factVal < condVal;
        case 'gte': return factVal >= condVal;
        case 'lte': return factVal <= condVal;
        case 'ne': return fact.value !== condition.value;
        default: return false;
      }
    }

    return true;
  }
}

export function demo(): void {
  console.log('=== 基于规则的智能体 ===\n');

  const agent = new RuleBasedAgent();

  // 定义规则：温度控制
  agent.addRule({
    id: 'r1',
    name: '高温告警',
    priority: 10,
    conditions: [
      { predicate: 'temperature', subject: 'room', value: '*', operator: 'gt' },
    ],
    actions: [
      { type: 'assert', fact: { predicate: 'alert', subject: 'system', value: 'high-temperature' } },
    ],
  });

  agent.addRule({
    id: 'r2',
    name: '启动空调',
    priority: 5,
    conditions: [
      { predicate: 'alert', subject: 'system', value: 'high-temperature' },
    ],
    actions: [
      { type: 'assert', fact: { predicate: 'action', subject: 'ac', value: 'on' } },
    ],
  });

  // 添加初始事实
  agent.assert({ predicate: 'temperature', subject: 'room', value: 32 });

  console.log('初始事实:', agent.getFacts().map(f => `${f.predicate}(${f.subject})=${f.value}`));

  const result = agent.infer();
  console.log('\n推理迭代次数:', result.iterations);
  console.log('新增事实:', result.newFacts.map(f => `${f.predicate}(${f.subject})=${f.value}`));
  console.log('触发规则:', result.firings.map(f => f.ruleName));

  console.log('\n最终知识库:', agent.getFacts().map(f => `${f.predicate}(${f.subject})=${f.value}`));
}
