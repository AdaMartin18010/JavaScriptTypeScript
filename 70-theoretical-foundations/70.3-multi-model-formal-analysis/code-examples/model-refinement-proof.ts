/**
 * 模型精化关系证明 — TypeScript 形式化规约
 * 
 * 本文件提供模型精化关系的形式化定义和验证框架，
 * 用于支持 01-model-refinement-and-simulation.md。
 * 
 * @theory 模型精化（Model Refinement）
 * @reference Milner, Communication and Concurrency (1989)
 */

// ============================================================
// 1. 基本定义
// ============================================================

/**
 * 计算模型：状态集合 + 转移关系 + 满足关系
 */
interface Model<S, A> {
  /** 状态集合 */
  readonly states: Set<S>;
  /** 转移关系：s --a--> s' */
  readonly transitions: Set<[S, A, S]>;
  /** 初始状态 */
  readonly initial: S;
  /** 满足关系：状态满足某性质 */
  readonly satisfies: (s: S, prop: string) => boolean;
}

/**
 * 精化关系：M1 ⊑ M2 当且仅当 M2 可模拟 M1 的所有行为
 * 
 * 形式化定义：
 * M1 ⊑ M2 ⇔ ∃ R ⊆ S1 × S2.
 *   (1) (s1₀, s2₀) ∈ R  （初始状态相关）
 *   (2) ∀ (s1, s2) ∈ R, ∀ a ∈ A.
 *       s1 --a--> s1' ⇒ ∃ s2'. s2 --a--> s2' ∧ (s1', s2') ∈ R
 */
type RefinementRelation<S1, S2> = Set<[S1, S2]>;

// ============================================================
// 2. 模拟关系验证
// ============================================================

/**
 * 验证 R 是否是从 M1 到 M2 的模拟关系
 */
function isSimulation<S1, S2, A>(
  m1: Model<S1, A>,
  m2: Model<S2, A>,
  r: RefinementRelation<S1, S2>
): boolean {
  // 检查所有 R 中的配对
  for (const [s1, s2] of r) {
    // 对于 M1 中的每个转移 s1 --a--> s1'
    for (const [from, action, to] of m1.transitions) {
      if (from === s1) {
        // 必须在 M2 中存在对应的转移 s2 --a--> s2'
        const hasCorresponding = [...m2.transitions].some(
          ([f, a, t]) => f === s2 && a === action && r.has([to, t] as [S1, S2])
        );
        if (!hasCorresponding) return false;
      }
    }
  }
  return true;
}

// ============================================================
// 3. 精化关系验证
// ============================================================

/**
 * 验证 M1 ⊑ M2（M1 精化到 M2）
 */
function isRefinement<S1, S2, A>(
  m1: Model<S1, A>,
  m2: Model<S2, A>,
  r: RefinementRelation<S1, S2>
): boolean {
  // (1) 初始状态相关
  const initialRelated = r.has([m1.initial, m2.initial] as [S1, S2]);
  if (!initialRelated) return false;

  // (2) 模拟条件
  return isSimulation(m1, m2, r);
}

// ============================================================
// 4. TS 严格模式 vs JS 运行时的精化关系示例
// ============================================================

/**
 * 简化的 TS 严格模式模型：
 * - 状态：类型环境 Γ + 表达式 e
 * - 转移：类型检查通过 → 求值
 */
interface TSStrictState {
  readonly typeEnv: Map<string, string>;
  readonly expression: string;
  readonly typeChecked: boolean;
}

/**
 * 简化的 JS 运行时模型：
 * - 状态：运行时环境 + 表达式
 * - 转移：直接求值（无类型检查）
 */
interface JSRuntimeState {
  readonly runtimeEnv: Map<string, unknown>;
  readonly expression: string;
}

/**
 * 从 TS 严格状态到 JS 运行时状态的映射
 * （类型擦除 = 遗忘函子）
 */
const eraseTypes = (ts: TSStrictState): JSRuntimeState => ({
  runtimeEnv: new Map(), // 类型信息被擦除
  expression: ts.expression
});

/**
 * 精化关系 R：TS_strict ⊑ JS
 * 
 * 命题：对于所有在 TS 严格模式中类型检查通过的程序，
 * 其在 JS 运行时中的行为是定义良好的（不抛出类型错误）。
 * 
 * 注意：这不是严格的精化，因为 TS 的类型系统是声音但不完备的。
 */

// TODO: 补充互模拟验证、向上/向下模拟、精化关系的组合
