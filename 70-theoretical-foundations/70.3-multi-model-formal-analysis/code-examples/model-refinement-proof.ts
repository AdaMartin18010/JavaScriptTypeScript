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

// ============================================================
// 5. 互模拟验证（Bisimulation）
// ============================================================

/**
 * 互模拟：R 是从 M1 到 M2 的模拟，且 R^{-1} 是从 M2 到 M1 的模拟
 *
 * 形式化：
 * R 是互模拟当且仅当：
 * (1) R 是模拟（M1 到 M2）
 * (2) R^{-1} = {(s2, s1) | (s1, s2) ∈ R} 是模拟（M2 到 M1）
 *
 * 互模拟意味着两个模型在行为上等价。
 */

/**
 * 验证 R 是否是互模拟
 */
function isBisimulation<S1, S2, A>(
  m1: Model<S1, A>,
  m2: Model<S2, A>,
  r: RefinementRelation<S1, S2>
): boolean {
  // 检查 R 是模拟（M1 → M2）
  const forward = isSimulation(m1, m2, r);
  if (!forward) return false;

  // 构造 R^{-1}
  const rInverse: RefinementRelation<S2, S1> = new Set(
    [...r].map(([s1, s2]) => [s2, s1] as [S2, S1])
  );

  // 检查 R^{-1} 是模拟（M2 → M1）
  const backward = isSimulation(m2, m1, rInverse);
  return backward;
}

// ============================================================
// 6. 向上模拟与向下模拟
// ============================================================

/**
 * 向下模拟（Downward Simulation）：
 * 具体模型 M1（抽象级别低）精化到抽象模型 M2
 * 要求：具体模型的每个行为在抽象模型中都有对应
 *
 * 向上模拟（Upward Simulation）：
 * 抽象模型 M2 的每个行为在具体模型 M1 中都有实现
 *
 * 两者结合 = 互模拟（双向精化）
 */

/**
 * 向下模拟验证：M1 ⊑_down M2
 * 对于 M1 中的每个转移，M2 中有对应
 */
function isDownwardSimulation<S1, S2, A>(
  m1: Model<S1, A>,
  m2: Model<S2, A>,
  r: RefinementRelation<S1, S2>
): boolean {
  return isSimulation(m1, m2, r);
}

/**
 * 向上模拟验证：M2 ⊑_up M1
 * 对于 M2 中的每个转移，M1 中有对应
 */
function isUpwardSimulation<S1, S2, A>(
  m1: Model<S1, A>,
  m2: Model<S2, A>,
  r: RefinementRelation<S1, S2>
): boolean {
  // 向上模拟 = R^{-1} 是向下模拟
  const rInverse: RefinementRelation<S2, S1> = new Set(
    [...r].map(([s1, s2]) => [s2, s1] as [S2, S1])
  );
  return isSimulation(m2, m1, rInverse);
}

// ============================================================
// 7. 精化关系的组合（Refinement Composition）
// ============================================================

/**
 * 精化关系的传递性：
 * 若 M1 ⊑ M2 且 M2 ⊑ M3，则 M1 ⊑ M3
 *
 * 组合证明：
 * 设 R12: M1 → M2，R23: M2 → M3
 * 定义 R13 = {(s1, s3) | ∃s2. (s1, s2) ∈ R12 ∧ (s2, s3) ∈ R23}
 * 则 R13 是从 M1 到 M3 的精化关系
 */

/**
 * 组合两个精化关系
 */
function composeRefinement<S1, S2, S3>(
  r12: RefinementRelation<S1, S2>,
  r23: RefinementRelation<S2, S3>
): RefinementRelation<S1, S3> {
  const r13: RefinementRelation<S1, S3> = new Set();

  for (const [s1, s2] of r12) {
    for (const [s2_, s3] of r23) {
      if (s2 === s2_) {
        r13.add([s1, s3] as [S1, S3]);
      }
    }
  }

  return r13;
}

/**
 * 验证精化组合：
 * 若 isRefinement(m1, m2, r12) 且 isRefinement(m2, m3, r23)，
 * 则 isRefinement(m1, m3, composeRefinement(r12, r23))
 */
function verifyRefinementComposition<S1, S2, S3, A>(
  m1: Model<S1, A>,
  m2: Model<S2, A>,
  m3: Model<S3, A>,
  r12: RefinementRelation<S1, S2>,
  r23: RefinementRelation<S2, S3>
): boolean {
  const isR12Valid = isRefinement(m1, m2, r12);
  const isR23Valid = isRefinement(m2, m3, r23);

  if (!isR12Valid || !isR23Valid) {
    return false; // 前提不成立
  }

  const r13 = composeRefinement(r12, r23);
  return isRefinement(m1, m3, r13);
}

// ============================================================
// 8. 数据精化示例（Data Refinement）
// ============================================================

/**
 * 数据精化：具体表示替换抽象表示
 *
 * 示例：用 Set 替换 Array 表示集合
 * - 抽象状态：数学集合
 * - 具体状态：数组（可能含重复）
 * - 抽象函数：abs(array) = Set(array)
 * - 精化关系：(array, set) 当且仅当 Set(array) = set
 */

interface AbstractSet {
  readonly elements: Set<number>;
  readonly add: (n: number) => AbstractSet;
}

interface ConcreteArray {
  readonly items: number[];
  readonly add: (n: number) => ConcreteArray;
}

const createAbstractSet = (elements: number[]): AbstractSet => {
  const set = new Set(elements);
  return {
    elements: set,
    add: (n: number) => createAbstractSet([...set, n])
  };
};

const createConcreteArray = (items: number[]): ConcreteArray => ({
  items,
  add: (n: number) => createConcreteArray([...items, n])
});

// 抽象函数：abs: Concrete → Abstract
const abs = (concrete: ConcreteArray): AbstractSet =>
  createAbstractSet(concrete.items);

// 精化关系 R = {(c, a) | abs(c) = a}
const dataRefinementRelation = (
  concrete: ConcreteArray,
  abstract: AbstractSet
): boolean => {
  const abstractFromConcrete = abs(concrete);
  return abstractFromConcrete.elements.size === abstract.elements.size &&
    [...abstractFromConcrete.elements].every(e => abstract.elements.has(e));
};

// 验证：数据精化保持操作语义
// 对于任何操作 op，若 (c, a) ∈ R，则 (op(c), op(a)) ∈ R
const verifyDataRefinement = (
  concrete: ConcreteArray,
  abstract: AbstractSet,
  value: number
): boolean => {
  const related = dataRefinementRelation(concrete, abstract);
  if (!related) return false;

  const newConcrete = concrete.add(value);
  const newAbstract = abstract.add(value);
  return dataRefinementRelation(newConcrete, newAbstract);
};

// 示例：c = [1, 2, 2] (具体), a = {1, 2} (抽象)
// abs(c) = {1, 2} = a，所以 (c, a) ∈ R
// c.add(3) = [1, 2, 2, 3], a.add(3) = {1, 2, 3}
// abs([1, 2, 2, 3]) = {1, 2, 3} = a.add(3)，所以保持精化
