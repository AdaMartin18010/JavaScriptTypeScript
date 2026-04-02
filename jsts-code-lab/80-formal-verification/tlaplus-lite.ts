/**
 * @file TLA+ Lite — 极简状态机规范器
 * @category Formal Verification → TLA+
 * @difficulty hard
 * @tags tla-plus, state-machine, next-state, init, spec, invariant, deadlock
 * @description
 * 用 TypeScript 实现一个极简易的 TLA+ 风格状态机规范器，定义 Init、Next、Spec、
 * Invariants，并演示哲学家就餐问题的死锁检测。
 *
 * @theoretical_basis
 * - **TLA+ (Temporal Logic of Actions)**: Leslie Lamport 提出，将程序视为状态机，
 *   规范 Spec 定义为 Init ∧ □[Next]_{vars} ∧ Liveness。
 * - **Init**: 初始状态谓词。
 * - **Next**: 下一步关系（状态转移谓词），描述从当前状态到新状态的允许动作。
 * - **Invariant**: 状态不变量，要求在 Spec 的所有可达状态上成立。
 * - **Deadlock**: 不存在满足 Next 关系的出边的非终止状态。
 */

export type StatePredicate<S> = (state: S) => boolean;
export type NextRelation<S> = (current: S, next: S) => boolean;

export interface TLAPlusSpec<S> {
  name: string;
  variables: (keyof S)[];
  init: StatePredicate<S>;
  next: NextRelation<S>;
}

export class TLAPlusLite<S> {
  constructor(private spec: TLAPlusSpec<S>) {}

  /**
   * 生成所有满足 Init 的初始状态（基于枚举）
   */
  generateInitialStates(enumerator: () => S[]): S[] {
    return enumerator().filter(s => this.spec.init(s));
  }

  /**
   * 检查不变量是否在所有可达状态上成立
   */
  checkInvariant(
    initialStates: S[],
    invariant: StatePredicate<S>,
    stepGenerator: (state: S) => S[],
    maxDepth: number = 10
  ): { holds: boolean; counterexample?: S[] } {
    const queue: Array<{ state: S; path: S[] }> = initialStates.map(s => ({ state: s, path: [s] }));
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { state, path } = queue.shift()!;
      const key = JSON.stringify(state);
      if (visited.has(key)) continue;
      visited.add(key);

      if (!invariant(state)) {
        return { holds: false, counterexample: path };
      }

      if (path.length >= maxDepth) continue;

      const nextStates = stepGenerator(state).filter(ns => this.spec.next(state, ns));
      for (const ns of nextStates) {
        queue.push({ state: ns, path: [...path, ns] });
      }
    }

    return { holds: true };
  }

  /**
   * 死锁检测：检查是否存在非终止状态没有任何出边
   */
  checkDeadlock(
    initialStates: S[],
    stepGenerator: (state: S) => S[],
    isTerminal: (state: S) => boolean,
    maxDepth: number = 10
  ): { deadlocked: boolean; state?: S; path?: S[] } {
    const queue: Array<{ state: S; path: S[] }> = initialStates.map(s => ({ state: s, path: [s] }));
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { state, path } = queue.shift()!;
      const key = JSON.stringify(state);
      if (visited.has(key)) continue;
      visited.add(key);

      if (isTerminal(state)) continue;

      const nextStates = stepGenerator(state).filter(ns => this.spec.next(state, ns));
      if (nextStates.length === 0) {
        return { deadlocked: true, state, path };
      }

      if (path.length >= maxDepth) continue;

      for (const ns of nextStates) {
        queue.push({ state: ns, path: [...path, ns] });
      }
    }

    return { deadlocked: false };
  }
}

// ---------------------------------------------------------------------------
// 哲学家就餐问题（Dining Philosophers）
// ---------------------------------------------------------------------------

type ForkState = 'clean' | 'dirty';

type PhilosopherState = 'thinking' | 'hungry' | 'eating';

interface PhilosopherSystem {
  philosophers: PhilosopherState[];
  forks: ForkState[];
}

function enumeratePhilosopherStates(n: number): PhilosopherSystem[] {
  // 仅枚举初始状态：全部 thinking，全部 forks clean
  return [{
    philosophers: Array(n).fill('thinking'),
    forks: Array(n).fill('clean')
  }];
}

function generateNextStates(system: PhilosopherSystem): PhilosopherSystem[] {
  const n = system.philosophers.length;
  const results: PhilosopherSystem[] = [];

  for (let i = 0; i < n; i++) {
    // thinking -> hungry
    if (system.philosophers[i] === 'thinking') {
      const next = structuredClone(system);
      next.philosophers[i] = 'hungry';
      results.push(next);
    }

    // hungry -> eating (需要左右叉子)
    if (system.philosophers[i] === 'hungry') {
      const left = i;
      const right = (i + 1) % n;
      // 假设叉子被占用即变为 dirty，归还变为 clean
      // 当前简化：只有 clean 的叉子才能被拿
      if (system.forks[left] === 'clean' && system.forks[right] === 'clean') {
        const next = structuredClone(system);
        next.philosophers[i] = 'eating';
        next.forks[left] = 'dirty';
        next.forks[right] = 'dirty';
        results.push(next);
      }
    }

    // eating -> thinking (归还叉子)
    if (system.philosophers[i] === 'eating') {
      const next = structuredClone(system);
      next.philosophers[i] = 'thinking';
      next.forks[i] = 'clean';
      next.forks[(i + 1) % n] = 'clean';
      results.push(next);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// 演示
// ---------------------------------------------------------------------------

export function demo(): void {
  console.log('=== TLA+ Lite ===\n');

  const n = 2; // 2 位哲学家便于穷举

  const spec: TLAPlusSpec<PhilosopherSystem> = {
    name: 'DiningPhilosophers',
    variables: ['philosophers', 'forks'],
    init: s => s.philosophers.every(p => p === 'thinking') && s.forks.every(f => f === 'clean'),
    next: (curr, next) => {
      // 允许的变化：至多一位哲学家改变状态
      let changed = 0;
      for (let i = 0; i < n; i++) {
        if (curr.philosophers[i] !== next.philosophers[i]) changed++;
        if (curr.forks[i] !== next.forks[i]) changed++;
      }
      return changed <= 3; // 一位哲学家状态改变 + 两把叉子状态改变
    }
  };

  const checker = new TLAPlusLite(spec);
  const initialStates = checker.generateInitialStates(() => enumeratePhilosopherStates(n));

  console.log(`哲学家数量: ${n}`);

  // 不变量：没有相邻哲学家同时进食
  const noAdjacentEating: StatePredicate<PhilosopherSystem> = s => {
    for (let i = 0; i < n; i++) {
      if (s.philosophers[i] === 'eating' && s.philosophers[(i + 1) % n] === 'eating') {
        return false;
      }
    }
    return true;
  };

  const invResult = checker.checkInvariant(initialStates, noAdjacentEating, generateNextStates, 8);
  console.log('不变量 "无相邻进食" 成立:', invResult.holds);

  // 死锁检测：非 eating 且非 terminal 的状态下无出边即为死锁
  const deadlockResult = checker.checkDeadlock(
    initialStates,
    generateNextStates,
    s => false, // 无终止状态
    8
  );
  console.log('死锁检测:', deadlockResult.deadlocked ? `发现死锁！状态: ${JSON.stringify(deadlockResult.state)}` : '无死锁');

  // 活性检查：所有 hungry 哲学家最终都能 eating
  // 简化：检查是否存在某个 hungry 哲学家永远无法 eating
  const canEatEventually = checker.checkInvariant(
    initialStates,
    s => s.philosophers.every((p, i) => {
      if (p !== 'hungry') return true;
      const left = i;
      const right = (i + 1) % n;
      return s.forks[left] === 'dirty' && s.forks[right] === 'dirty';
    }),
    generateNextStates,
    8
  );
  console.log('活性检查（hungry 能获取双叉）:', canEatEventually.holds);
}
