/**
 * @file 有界模型检测（BMC）简化版
 * @category Formal Verification → Bounded Model Checking
 * @difficulty hard
 * @description
 * 实现有界模型检测（BMC）的简化版。将状态机的 k 步展开编码为约束求解路径
 *（用深度优先搜索模拟 SAT 求解器），演示反例生成。适用于教学场景，
 * 展示 BMC 将时序验证转化为有界路径搜索的核心思想。
 *
 * @theoretical_basis
 * - **BMC (Bounded Model Checking)**: Biere, Cimatti, Clarke 等人于 1999 年提出。
 *   将 LTL 性质验证转化为命题逻辑可满足性问题，通过 SAT/SMT 求解器寻找
 *   长度不超过 k 的反例。
 * - **k-步展开**: 将转移关系 T(s_i, s_{i+1}) 展开 k 次，与性质取反
 *   ¬φ 的 k-步编码合取，若可满足则存在长度 ≤ k 的反例。
 * - **路径编码**: `I(s0) ∧ ⋀_{i=0}^{k-1} T(s_i, s_{i+1}) ∧ ⋀_{i=0}^{k} ¬φ(s_i)`
 *   本实现以显式 DFS 模拟该可满足性查询。
 * - **归纳法**: 当 k 足够大（覆盖所有可达状态）时，BMC 可证明无反例存在。
 *
 * @complexity_analysis
 * - 状态空间遍历: O(b^k) 其中 b 为分支因子，k 为界（bound）。
 * - 路径编码（符号化）: O(k * |T|) 其中 |T| 为转移关系大小。
 * - SAT 求解（本实现以 DFS 模拟）: O(b^k) 显式状态枚举。
 * - 实际 BMC 使用现代 SAT 求解器可处理百万变量级问题。
 */

/** BMC 状态 */
export type BMCState = Record<string, unknown>;

/** BMC 转移：当前状态 -> 下一状态 */
export type BMCTransition = (state: BMCState) => BMCState | null;

/** BMC 状态机 */
export interface BMCSystem {
  initial: BMCState;
  transitions: BMCTransition[];
}

/** BMC 检查结果 */
export interface BMCResult {
  /** 是否找到反例 */
  counterexampleFound: boolean;
  /** 反例路径（状态序列） */
  counterexample?: BMCState[];
  /** 反例长度 */
  length?: number;
  /** 探索的节点数 */
  nodesExplored: number;
}

/**
 * 有界模型检测器。
 * 将系统展开 k 步，检查是否存在违反性质的有限路径。
 */
export class BMCChecker {
  constructor(private system: BMCSystem) {}

  /**
   * 检查是否存在长度不超过 maxBound 的反例。
   * @param property 要验证的安全性质
   * @param maxBound 最大展开步数 k
   */
  check(property: (state: BMCState) => boolean, maxBound: number): BMCResult {
    let nodesExplored = 0;

    const dfs = (state: BMCState, path: BMCState[], depth: number): BMCResult | null => {
      nodesExplored++;

      // 若当前状态违反性质，则找到反例
      if (!property(state)) {
        return {
          counterexampleFound: true,
          counterexample: [...path, state],
          length: path.length,
          nodesExplored
        };
      }

      if (depth >= maxBound) {
        return null;
      }

      for (const trans of this.system.transitions) {
        const next = trans(state);
        if (next) {
          const result = dfs(next, [...path, state], depth + 1);
          if (result) {
            return result;
          }
        }
      }

      return null;
    };

    const result = dfs(this.system.initial, [], 0);
    if (result) {
      return result;
    }

    return {
      counterexampleFound: false,
      nodesExplored
    };
  }

  /**
   * 检查活性性质：目标性质是否在给定界限内最终成立。
   * 若存在一条路径在 maxBound 步内始终不达成目标，则报告为反例。
   */
  checkLiveness(target: (state: BMCState) => boolean, maxBound: number): BMCResult {
    let nodesExplored = 0;

    const dfs = (state: BMCState, path: BMCState[], depth: number): BMCResult | null => {
      nodesExplored++;

      if (target(state)) {
        return null; // 这条路径满足活性，不是反例
      }

      if (depth >= maxBound) {
        // 到达界限仍未满足目标，找到反例
        return {
          counterexampleFound: true,
          counterexample: [...path, state],
          length: path.length,
          nodesExplored
        };
      }

      const nexts: BMCState[] = [];
      for (const trans of this.system.transitions) {
        const next = trans(state);
        if (next) {
          nexts.push(next);
        }
      }

      // 若当前状态无出边且未满足目标，也是反例
      if (nexts.length === 0) {
        return {
          counterexampleFound: true,
          counterexample: [...path, state],
          length: path.length,
          nodesExplored
        };
      }

      // 活性要求：所有路径都必须最终满足目标。只要有一条路径不满足就是反例
      // 但为了教学简化，我们找出第一条不满足的路径
      for (const next of nexts) {
        // 检测简单循环：若 next 已在 path 中，说明进入循环且未达成目标
        const isLoop = path.some(s => JSON.stringify(s) === JSON.stringify(next));
        if (isLoop) {
          return {
            counterexampleFound: true,
            counterexample: [...path, state, next],
            length: path.length + 1,
            nodesExplored
          };
        }
        const result = dfs(next, [...path, state], depth + 1);
        if (result) {
          return result;
        }
      }

      return null;
    };

    const result = dfs(this.system.initial, [], 0);
    if (result) {
      return result;
    }

    return {
      counterexampleFound: false,
      nodesExplored
    };
  }
}

/**
 * 构造一个教学用的互斥协议系统（两进程竞争临界区）。
 * 状态：{ p1: 'ncs'|'wait'|'cs', p2: 'ncs'|'wait'|'cs' }
 */
export function mutexBMCSystem(): BMCSystem {
  const states: BMCState[] = [];
  const labels = ['ncs', 'wait', 'cs'] as const;
  for (const p1 of labels) {
    for (const p2 of labels) {
      states.push({ p1, p2 });
    }
  }

  const mkTrans = (
    cond: (s: BMCState) => boolean,
    update: (s: BMCState) => BMCState
  ): BMCTransition => {
    return s => (cond(s) ? { ...update(s) } : null);
  };

  return {
    initial: { p1: 'ncs', p2: 'ncs' },
    transitions: [
      // P1: ncs -> wait
      mkTrans(s => s['p1'] === 'ncs', s => ({ ...s, p1: 'wait' })),
      // P1: wait -> cs
      mkTrans(s => s['p1'] === 'wait' && s['p2'] !== 'cs', s => ({ ...s, p1: 'cs' })),
      // P1: cs -> ncs
      mkTrans(s => s['p1'] === 'cs', s => ({ ...s, p1: 'ncs' })),
      // P2: ncs -> wait
      mkTrans(s => s['p2'] === 'ncs', s => ({ ...s, p2: 'wait' })),
      // P2: wait -> cs
      mkTrans(s => s['p2'] === 'wait' && s['p1'] !== 'cs', s => ({ ...s, p2: 'cs' })),
      // P2: cs -> ncs
      mkTrans(s => s['p2'] === 'cs', s => ({ ...s, p2: 'ncs' }))
    ]
  };
}

/**
 * 构造一个故意有缺陷的互斥系统（两进程可同时进入 cs）。
 */
export function buggyMutexBMCSystem(): BMCSystem {
  return {
    initial: { p1: 'ncs', p2: 'ncs' },
    transitions: [
      s => (s['p1'] === 'ncs' ? { ...s, p1: 'wait' } : null),
      s => (s['p1'] === 'wait' ? { ...s, p1: 'cs' } : null), // 缺少对 p2 的检查
      s => (s['p1'] === 'cs' ? { ...s, p1: 'ncs' } : null),
      s => (s['p2'] === 'ncs' ? { ...s, p2: 'wait' } : null),
      s => (s['p2'] === 'wait' ? { ...s, p2: 'cs' } : null), // 缺少对 p1 的检查
      s => (s['p2'] === 'cs' ? { ...s, p2: 'ncs' } : null)
    ]
  };
}

export function demo(): void {
  console.log('=== 有界模型检测（BMC）演示 ===\n');

  // 演示 1：正确系统的安全性验证
  console.log('--- 正确互斥系统：安全性 G(¬(p1=cs ∧ p2=cs)) ---');
  const correctSystem = mutexBMCSystem();
  const checker1 = new BMCChecker(correctSystem);
  const safety1 = (s: BMCState) => !(s['p1'] === 'cs' && s['p2'] === 'cs');
  const result1 = checker1.check(safety1, 5);
  console.log('反例 found?', result1.counterexampleFound);
  console.log('探索节点数:', result1.nodesExplored);

  // 演示 2：缺陷系统的安全性验证（应找到反例）
  console.log('\n--- 缺陷互斥系统：安全性 G(¬(p1=cs ∧ p2=cs)) ---');
  const buggySystem = buggyMutexBMCSystem();
  const checker2 = new BMCChecker(buggySystem);
  const result2 = checker2.check(safety1, 5);
  console.log('反例 found?', result2.counterexampleFound);
  if (result2.counterexample) {
    console.log('反例路径:', result2.counterexample.map(s => `(${s['p1']},${s['p2']})`).join(' -> '));
  }
  console.log('探索节点数:', result2.nodesExplored);

  // 演示 3：活性验证（正确系统：等待进程最终会进入 cs）
  console.log('\n--- 正确系统：活性 F(p1=cs) ---');
  const liveness = (s: BMCState) => s['p1'] === 'cs';
  const result3 = checker1.checkLiveness(liveness, 6);
  console.log('反例 found?', result3.counterexampleFound);
  if (result3.counterexample) {
    console.log('活性反例路径:', result3.counterexample.map(s => `(${s['p1']},${s['p2']})`).join(' -> '));
  }
  console.log('探索节点数:', result3.nodesExplored);

  // 演示 4：活性在更小的 bound 下可能产生伪反例
  console.log('\n--- 正确系统：活性 F(p1=cs) with bound=2 ---');
  const result4 = checker1.checkLiveness(liveness, 2);
  console.log('反例 found?', result4.counterexampleFound);
  if (result4.counterexample) {
    console.log('伪反例路径:', result4.counterexample.map(s => `(${s['p1']},${s['p2']})`).join(' -> '));
  }
}
