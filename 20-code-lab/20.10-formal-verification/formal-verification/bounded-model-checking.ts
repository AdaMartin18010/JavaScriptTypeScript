/**
 * @file 有界模型检测
 * @category Formal Verification → Bounded Model Checking
 * @difficulty hard
 * @tags bmc, k-induction, sat, state-unrolling, transition-system, safety
 * @description
 * 实现有界模型检测（Bounded Model Checking, BMC）教学演示，将有限状态转移系统
 * 展开为固定深度 k 的状态序列，检查安全性属性在该深度内是否成立。
 *
 * @theoretical_basis
 * - **BMC**: Biere, Cimatti, Clarke, Zhu 于 1999 年提出，将模型检测问题转换为
 *   命题可满足性问题（SAT）。将转移关系 T 展开 k 步，形成路径公式
 *   I(s₀) ∧ T(s₀, s₁) ∧ ... ∧ T(sₖ₋₁, sₖ)，并检查是否存在反例使得 ¬P(sᵢ) 对某个 i ≤ k 成立。
 * - **k-Induction**: BMC 的扩展技术，通过归纳步骤证明性质在所有深度均成立。
 */

export interface TransitionSystem<S> {
  name: string;
  initial: (state: S) => boolean;
  transition: (current: S, next: S) => boolean;
}

export interface BMCResult<S> {
  holds: boolean;
  depth: number;
  counterexample?: S[];
}

export class BoundedModelChecker<S> {
  constructor(private system: TransitionSystem<S>) {}

  /**
   * 有界模型检测核心算法
   *
   * 将状态机展开为深度 k 的路径，检查安全性属性 property 是否在所有可达状态上成立。
   * 若存在反例，返回第一条反例路径；否则返回 holds=true。
   *
   * 数学表达：
   *   ∃s₀, ..., sₖ. I(s₀) ∧ ⋀_{i=0}^{k-1} T(sᵢ, sᵢ₊₁) ∧ ⋁_{i=0}^{k} ¬P(sᵢ)
   */
  checkSafety(
    initialStates: S[],
    stepGenerator: (state: S) => S[],
    property: (state: S) => boolean,
    maxDepth = 5
  ): BMCResult<S> {
    // 过滤合法的初始状态
    const validInitials = initialStates.filter(s => this.system.initial(s));

    for (let k = 0; k <= maxDepth; k++) {
      const result = this.checkAtDepth(validInitials, stepGenerator, property, k);
      if (!result.holds) {
        return { holds: false, depth: k, counterexample: result.counterexample };
      }
    }

    return { holds: true, depth: maxDepth };
  }

  private checkAtDepth(
    initialStates: S[],
    stepGenerator: (state: S) => S[],
    property: (state: S) => boolean,
    depth: number
  ): { holds: boolean; counterexample?: S[] } {
    // BFS 搜索深度为 depth 的路径
    const queue: { state: S; path: S[] }[] = initialStates.map(s => ({ state: s, path: [s] }));
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { state, path } = queue.shift()!;
      const key = JSON.stringify({ state, depth: path.length - 1 });
      if (visited.has(key)) continue;
      visited.add(key);

      // 检查当前状态是否违反性质
      if (!property(state)) {
        return { holds: false, counterexample: path };
      }

      // 若已达到目标深度，停止扩展
      if (path.length - 1 >= depth) continue;

      const nextStates = stepGenerator(state).filter(ns => this.system.transition(state, ns));
      for (const ns of nextStates) {
        queue.push({ state: ns, path: [...path, ns] });
      }
    }

    return { holds: true };
  }

  /**
   * k-Induction 归纳基例检查（Base Case）
   *
   * 验证性质在从初始状态出发、长度不超过 k 的所有路径上成立。
   */
  checkKInductionBase(
    initialStates: S[],
    stepGenerator: (state: S) => S[],
    property: (state: S) => boolean,
    k: number
  ): BMCResult<S> {
    return this.checkSafety(initialStates, stepGenerator, property, k);
  }

  /**
   * k-Induction 归纳步骤检查（Inductive Step，教学级简化）
   *
   * 假设 property 在长度不超过 k 的路径前缀上成立，检查下一步是否也成立。
   * 实际实现中需要无环假设或额外约束，此处仅做概念演示。
   */
  checkKInductionStep(
    states: S[],
    stepGenerator: (state: S) => S[],
    property: (state: S) => boolean,
    k: number
  ): { inductive: boolean; counterexample?: S[] } {
    // 简化：检查是否存在一条长度为 k 的合法路径，最后一步违反性质
    // 实际 k-induction 还需保证路径中无重复状态（simple path）
    const queue: { state: S; path: S[] }[] = states.map(s => ({ state: s, path: [s] }));
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { state, path } = queue.shift()!;
      const key = JSON.stringify(state);
      if (visited.has(key)) continue;
      visited.add(key);

      if (path.length === k + 1) {
        if (!property(state)) {
          return { inductive: false, counterexample: path };
        }
        continue;
      }

      const nextStates = stepGenerator(state).filter(ns => this.system.transition(state, ns));
      for (const ns of nextStates) {
        queue.push({ state: ns, path: [...path, ns] });
      }
    }

    return { inductive: true };
  }
}

// ---------------------------------------------------------------------------
// 演示：互斥协议的有界模型检测
// ---------------------------------------------------------------------------

type ProcessState = 'idle' | 'waiting' | 'critical';

interface MutualExclusionState {
  p1: ProcessState;
  p2: ProcessState;
}

function generateMutexStates(state: MutualExclusionState): MutualExclusionState[] {
  const results: MutualExclusionState[] = [];

  // P1 转移
  if (state.p1 === 'idle') {
    results.push({ ...state, p1: 'waiting' });
  }
  if (state.p1 === 'waiting' && state.p2 !== 'critical') {
    results.push({ ...state, p1: 'critical' });
  }
  if (state.p1 === 'critical') {
    results.push({ ...state, p1: 'idle' });
  }

  // P2 转移
  if (state.p2 === 'idle') {
    results.push({ ...state, p2: 'waiting' });
  }
  if (state.p2 === 'waiting' && state.p1 !== 'critical') {
    results.push({ ...state, p2: 'critical' });
  }
  if (state.p2 === 'critical') {
    results.push({ ...state, p2: 'idle' });
  }

  return results;
}

export function demo(): void {
  console.log('=== Bounded Model Checking ===\n');

  const mutexSystem: TransitionSystem<MutualExclusionState> = {
    name: 'MutexProtocol',
    initial: s => s.p1 === 'idle' && s.p2 === 'idle',
    transition: (curr, next) => {
      // 检查是否只有一位进程改变状态
      const changes = (curr.p1 !== next.p1 ? 1 : 0) + (curr.p2 !== next.p2 ? 1 : 0);
      return changes <= 1;
    }
  };

  const bmc = new BoundedModelChecker(mutexSystem);
  const initialStates: MutualExclusionState[] = [{ p1: 'idle', p2: 'idle' }];

  // 安全性：不会同时进入 critical section
  const safetyProperty = (s: MutualExclusionState) => !(s.p1 === 'critical' && s.p2 === 'critical');

  const result = bmc.checkSafety(initialStates, generateMutexStates, safetyProperty, 6);
  console.log('Safety (no simultaneous critical):', result.holds, 'Depth checked:', result.depth);
  if (!result.holds && result.counterexample) {
    console.log('Counterexample:', result.counterexample.map(s => `(${s.p1}, ${s.p2})`).join(' -> '));
  }

  // 故意破坏安全性以演示 BMC 找反例：假设系统允许同时进入 critical
  const brokenSystem: TransitionSystem<MutualExclusionState> = {
    ...mutexSystem,
    transition: () => true // 任意转移都允许
  };

  const brokenBMC = new BoundedModelChecker(brokenSystem);
  const brokenResult = brokenBMC.checkSafety(initialStates, generateMutexStates, safetyProperty, 3);
  console.log('\nBroken system safety:', brokenResult.holds);
  if (!brokenResult.holds && brokenResult.counterexample) {
    console.log('Counterexample found by BMC:', brokenResult.counterexample.map(s => `(${s.p1}, ${s.p2})`).join(' -> '));
  }

  // k-Induction 演示
  const base = bmc.checkKInductionBase(initialStates, generateMutexStates, safetyProperty, 2);
  console.log('\nk-Induction base case (k=2):', base.holds);
}
