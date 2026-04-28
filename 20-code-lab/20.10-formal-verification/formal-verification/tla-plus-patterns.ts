/**
 * @file TLA+ 核心概念 TypeScript 模拟
 * @category Formal Verification → TLA+ Patterns
 * @difficulty hard
 * @description
 * 实现 TLA+（Temporal Logic of Actions）核心概念的简化模拟器。包括状态函数、
 * 行为（Behavior）、时序逻辑算子 □、◇、\leadsto 的简化解释器。演示两个进程
 * 互斥（Mutual Exclusion）的时序性质验证。
 *
 * @theoretical_basis
 * - **TLA+**: Leslie Lamport 设计的形式化规约语言，基于一阶逻辑、集合论与
 *   线性时序逻辑（LTL）的扩展。
 * - **状态函数 (State Function)**: 从状态到值的映射，如 `pc[i]` 表示进程 i 的
 *   程序计数器。
 * - **行为 (Behavior)**: 状态的无限序列 s0 -> s1 -> s2 -> ...，表示系统的执行轨迹。
 * - **动作 (Action)**: 带有 primed 变量的布尔表达式，如 `x' = x + 1`，描述
 *   状态转移的约束条件。
 * - **□ (Always)**: `□F` 表示 F 在行为的所有状态下成立。
 * - **◇ (Eventually)**: `◇F` 表示 F 在行为的某个未来状态下成立。
 * - **\leadsto (Leads-to)**: `P \leadsto Q` 等价于 `□(P => ◇Q)`，表示一旦 P 成立，
 *   Q 最终必然成立。
 *
 * @complexity_analysis
 * - 状态函数求值: O(1) 每次状态访问。
 * - 动作求值: O(|vars|) 比较当前状态与下一状态的变量赋值。
 * - □/◇ 验证: O(L * |F|) 其中 L 为行为长度（截断后的有限前缀），|F| 为子公式大小。
 * - \leadsto 验证: O(L^2 * |F|) 需对每对位置检查蕴含关系。
 * - 互斥验证示例: O(n * L) 其中 n 为进程数量。
 */

/** TLA+ 状态：变量名到值的映射 */
export type TLAState = Record<string, unknown>;

/** 行为：有限状态序列（模拟无限行为的截断前缀） */
export type Behavior = TLAState[];

/** 状态函数：从状态提取值 */
export type StateFunction<T> = (state: TLAState) => T;

/** 动作：判断状态对是否满足转移关系 */
export type Action = (current: TLAState, next: TLAState) => boolean;

/** 时序性质：判断行为是否满足 */
export type TemporalProperty = (behavior: Behavior) => boolean;

/**
 * 提取状态函数值。
 */
export function evalState<T>(state: TLAState, fn: StateFunction<T>): T {
  return fn(state);
}

/**
 * 构造变量访问的状态函数。
 */
export function variable<T>(name: string): StateFunction<T> {
  return state => state[name] as T;
}

/**
 * 构造动作：x' = expr(x, ...)。
 * 返回一个 Action，检查 next[varName] 是否等于 expr(current)。
 */
export function primedEquals(varName: string, expr: (state: TLAState) => unknown): Action {
  return (current, next) => {
    const expected = expr(current);
    return next[varName] === expected;
  };
}

/**
 * 构造动作：next[varName] 等于常量。
 */
export function primedConstant(varName: string, value: unknown): Action {
  return (_current, next) => next[varName] === value;
}

/**
 * 时序算子：□F (Globally / Always)
 */
export function always(sub: (state: TLAState) => boolean): TemporalProperty {
  return behavior => behavior.every(sub);
}

/**
 * 时序算子：◇F (Finally / Eventually)
 */
export function eventually(sub: (state: TLAState) => boolean): TemporalProperty {
  return behavior => behavior.some(sub);
}

/**
 * 时序算子：F U G (Until)
 */
export function until(
  f: (state: TLAState) => boolean,
  g: (state: TLAState) => boolean
): TemporalProperty {
  return behavior => {
    let foundG = false;
    for (const state of behavior) {
      if (g(state)) {
        foundG = true;
        break;
      }
      if (!f(state)) {
        return false;
      }
    }
    return foundG;
  };
}

/**
 * 时序算子：P \leadsto Q (Leads-to)
 * 简化实现：对于行为中每个满足 P 的位置，之后必须存在满足 Q 的位置。
 */
export function leadsTo(
  p: (state: TLAState) => boolean,
  q: (state: TLAState) => boolean
): TemporalProperty {
  return behavior => {
    for (let i = 0; i < behavior.length; i++) {
      if (p(behavior[i])) {
        const hasFutureQ = behavior.slice(i + 1).some(q);
        if (!hasFutureQ) {
          return false;
        }
      }
    }
    return true;
  };
}

/**
 * 验证行为中的每一步都满足给定的 Action（用于检查 Next 关系）。
 */
export function checkNext(behavior: Behavior, nextAction: Action): boolean {
  for (let i = 0; i < behavior.length - 1; i++) {
    if (!nextAction(behavior[i], behavior[i + 1])) {
      return false;
    }
  }
  return true;
}

/**
 * 互斥状态机：两个进程竞争临界区。
 * 状态变量：pc1, pc2 ∈ {'ncs', 'wait', 'cs'}
 */
export interface MutualExclusionState {
  pc1: 'ncs' | 'wait' | 'cs';
  pc2: 'ncs' | 'wait' | 'cs';
}

/**
 * 生成互斥系统的示例行为（有限前缀）。
 */
export function generateMutexBehavior(): Behavior {
  const behavior: Behavior = [
    { pc1: 'ncs', pc2: 'ncs' },
    { pc1: 'wait', pc2: 'ncs' },
    { pc1: 'cs', pc2: 'ncs' },
    { pc1: 'ncs', pc2: 'ncs' },
    { pc1: 'ncs', pc2: 'wait' },
    { pc1: 'ncs', pc2: 'cs' },
    { pc1: 'ncs', pc2: 'ncs' }
  ];
  return behavior;
}

/**
 * 生成一个违反互斥的行为：两个进程同时进入临界区。
 */
export function generateBadMutexBehavior(): Behavior {
  return [
    { pc1: 'ncs', pc2: 'ncs' },
    { pc1: 'wait', pc2: 'wait' },
    { pc1: 'cs', pc2: 'cs' }, // 违反互斥
    { pc1: 'ncs', pc2: 'ncs' }
  ];
}

/**
 * 生成一个饥饿行为：进程 1 永远等待。
 */
export function generateStarvationBehavior(): Behavior {
  return [
    { pc1: 'wait', pc2: 'ncs' },
    { pc1: 'wait', pc2: 'cs' },
    { pc1: 'wait', pc2: 'ncs' },
    { pc1: 'wait', pc2: 'cs' },
    { pc1: 'wait', pc2: 'ncs' }
  ];
}

export function demo(): void {
  console.log('=== TLA+ 时序逻辑演示 ===\n');

  const goodBehavior = generateMutexBehavior();
  const badBehavior = generateBadMutexBehavior();
  const starvationBehavior = generateStarvationBehavior();

  // 安全性：互斥（两个进程不会同时在 cs）
  const mutexProp = always((s: TLAState) => !(s.pc1 === 'cs' && s.pc2 === 'cs'));
  console.log('--- 安全性：互斥 ---');
  console.log('良好行为满足互斥?', mutexProp(goodBehavior));
  console.log('错误行为满足互斥?', mutexProp(badBehavior));

  // 活性：如果一个进程在等待，最终它会进入临界区
  const livenessProp1 = leadsTo(
    (s: TLAState) => s.pc1 === 'wait',
    (s: TLAState) => s.pc1 === 'cs'
  );
  console.log('\n--- 活性：wait \leadsto cs (进程1) ---');
  console.log('良好行为满足活性?', livenessProp1(goodBehavior));
  console.log('饥饿行为满足活性?', livenessProp1(starvationBehavior));

  // 活性：如果一个进程在 ncs，最终它会进入 wait（简化假设）
  const livenessProp2 = leadsTo(
    (s: TLAState) => s.pc2 === 'ncs',
    (s: TLAState) => s.pc2 === 'cs' || s.pc2 === 'wait'
  );
  console.log('\n--- 活性：ncs \leadsto (wait ∨ cs) (进程2) ---');
  console.log('良好行为满足?', livenessProp2(goodBehavior));

  // ◇ 算子：最终某个进程进入 cs
  const eventuallyCS = eventually((s: TLAState) => s.pc1 === 'cs' || s.pc2 === 'cs');
  console.log('\n--- ◇(进程1在cs ∨ 进程2在cs) ---');
  console.log('良好行为满足?', eventuallyCS(goodBehavior));

  // □ 算子：进程状态始终在合法集合中
  const validStates = always(
    (s: TLAState) =>
      ['ncs', 'wait', 'cs'].includes(s.pc1 as string) &&
      ['ncs', 'wait', 'cs'].includes(s.pc2 as string)
  );
  console.log('\n--- □(状态合法) ---');
  console.log('良好行为满足?', validStates(goodBehavior));
}
