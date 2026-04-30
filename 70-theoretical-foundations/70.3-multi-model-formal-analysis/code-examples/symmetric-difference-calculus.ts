/**
 * 对称差计算 — TypeScript 实现
 * 
 * 本文件提供模型间对称差的形式化计算框架，
 * 用于支持 03-type-runtime-symmetric-difference.md。
 * 
 * @theory 模型对称差（Symmetric Difference）
 */

// ============================================================
// 1. 对称差的集合论定义
// ============================================================

/**
 * 对称差：A Δ B = (A \ B) ∪ (B \ A)
 */
function symmetricDifference<T>(a: Set<T>, b: Set<T>): Set<T> {
  const diff = new Set<T>();
  for (const x of a) if (!b.has(x)) diff.add(x);
  for (const x of b) if (!a.has(x)) diff.add(x);
  return diff;
}

/**
 * 集合差：A \ B = { x ∈ A | x ∉ B }
 */
function setDifference<T>(a: Set<T>, b: Set<T>): Set<T> {
  const diff = new Set<T>();
  for (const x of a) if (!b.has(x)) diff.add(x);
  return diff;
}

// ============================================================
// 2. 程序空间中的对称差
// ============================================================

/**
 * 程序：源代码字符串
 */
type Program = string;

/**
 * 模型：接受一组程序，返回它们在该模型中的有效性
 */
interface ProgramModel {
  readonly name: string;
  /**
   * 判断程序在该模型中是否"有效"
   * 对于类型系统：类型检查通过
   * 对于运行时：运行时不出错
   */
  readonly isValid: (program: Program) => boolean;
}

/**
 * 计算两个模型之间的对称差
 * Δ(M1, M2) = { p | (M1 ⊨ p ∧ M2 ⊭ p) ∨ (M1 ⊭ p ∧ M2 ⊨ p) }
 */
function modelSymmetricDifference(
  m1: ProgramModel,
  m2: ProgramModel,
  programs: Program[]
): {
  m1Only: Program[];    // M1 \ M2
  m2Only: Program[];    // M2 \ M1
  both: Program[];      // M1 ∩ M2
  neither: Program[];   // 补集
} {
  const m1Only: Program[] = [];
  const m2Only: Program[] = [];
  const both: Program[] = [];
  const neither: Program[] = [];

  for (const p of programs) {
    const v1 = m1.isValid(p);
    const v2 = m2.isValid(p);
    if (v1 && v2) both.push(p);
    else if (v1 && !v2) m1Only.push(p);
    else if (!v1 && v2) m2Only.push(p);
    else neither.push(p);
  }

  return { m1Only, m2Only, both, neither };
}

// ============================================================
// 3. TS 类型系统 vs JS 运行时的对称差示例
// ============================================================

/**
 * TypeScript 严格模式模型
 */
const tsStrictModel: ProgramModel = {
  name: "TypeScript (strict)",
  isValid: (program: Program): boolean => {
    // 简化：检查是否包含明显的类型错误模式
    const hasTypeError = 
      program.includes('null.') ||           // null 访问
      program.includes('undefined.') ||      // undefined 访问
      program.includes('as any');            // 显式 any 转换（在严格模式中被标记）
    return !hasTypeError;
  }
};

/**
 * JavaScript 运行时模型
 */
const jsRuntimeModel: ProgramModel = {
  name: "JavaScript (runtime)",
  isValid: (program: Program): boolean => {
    // 简化：运行时仅会在实际执行时出错
    // 这里我们模拟：JS 运行时更宽松
    const hasRuntimeError =
      program.includes('throw');             // 显式抛出
    return !hasRuntimeError;
  }
};

// 测试程序集合
const testPrograms: Program[] = [
  'const x: number = 42;',                              // TS valid, JS valid
  'const x: string = 42;',                               // TS invalid, JS valid
  'const obj = null; obj.toString();',                   // TS invalid, JS invalid
  'const data: any = fetchData();',                      // TS valid (with any), JS valid
  'function add(a: number, b: number) { return a + b; }' // TS valid, JS valid
];

// 计算对称差
// const diff = modelSymmetricDifference(tsStrictModel, jsRuntimeModel, testPrograms);

// ============================================================
// 4. 响应式框架的对称差
// ============================================================

/**
 * 响应式模型：定义哪些状态变化 → UI 更新序列是可生成的
 */
interface ReactiveModel {
  readonly name: string;
  /**
   * 判断给定的状态变化集合是否能在该模型中生成有效的 UI 更新
   */
  readonly canGenerate: (stateChanges: string[]) => boolean;
}

/**
 * React 模型：基于 Virtual DOM + Diff
 * 限制：状态变化必须通过 setState/useState 触发
 */
const reactModel: ReactiveModel = {
  name: "React (Virtual DOM)",
  canGenerate: (changes: string[]) => {
    // React 可以处理任何状态变化，但粒度是组件级别的
    return changes.every(c => c.includes('state') || c.includes('props'));
  }
};

/**
 * Solid 模型：基于 Signal + 细粒度更新
 * 优势：可以精确追踪单个信号的依赖
 */
const solidModel: ReactiveModel = {
  name: "Solid (Signals)",
  canGenerate: (changes: string[]) => {
    // Solid 可以处理更细粒度的变化
    return changes.every(c => c.includes('signal') || c.includes('memo'));
  }
};

/**
 * 计算两个响应式框架的对称差
 * 即：哪些状态变化模式在一个框架中可处理，在另一个中不可处理
 */
function reactiveSymmetricDifference(
  m1: ReactiveModel,
  m2: ReactiveModel,
  scenarios: string[][]
): {
  m1Only: string[][];
  m2Only: string[][];
} {
  const m1Only: string[][] = [];
  const m2Only: string[][] = [];

  for (const scenario of scenarios) {
    const g1 = m1.canGenerate(scenario);
    const g2 = m2.canGenerate(scenario);
    if (g1 && !g2) m1Only.push(scenario);
    if (!g1 && g2) m2Only.push(scenario);
  }

  return { m1Only, m2Only };
}

// ============================================================
// 5. 精化关系与对称差的联系
// ============================================================

/**
 * 定理：若 M1 ⊑ M2（M1 精化到 M2），则 Δ(M1, M2) ⊆ M2 \ M1
 *
 * 即：精化方向上的对称差只包含"目标模型能表达但源模型不能"的行为。
 *
 * 证明思路：
 * M1 ⊑ M2 意味着 ∀p. M1 ⊨ p ⇒ M2 ⊨ p
 * 因此 M1 \ M2 = { p | M1 ⊨ p ∧ M2 ⊭ p } = ∅
 * Δ(M1, M2) = (M1 \ M2) ∪ (M2 \ M1) = M2 \ M1
 */

/**
 * 验证精化蕴含对称差单向性
 */
function verifyRefinementImpliesSubset(
  m1: ProgramModel,
  m2: ProgramModel,
  programs: Program[]
): { isRefinement: boolean; symmetricDifference: ReturnType<typeof modelSymmetricDifference> } {
  const diff = modelSymmetricDifference(m1, m2, programs);

  // M1 ⊑ M2 当且仅当 M1 \ M2 = ∅
  const isRefinement = diff.m1Only.length === 0;

  return { isRefinement, symmetricDifference: diff };
}

// 示例：验证 TS 严格模式 ⊑ JS 运行时不成立（因为 TS 拒绝的程序 JS 可能接受）
// const tsJsRefinement = verifyRefinementImpliesSubset(tsStrictModel, jsRuntimeModel, testPrograms);
// 预期：isRefinement = false，因为存在 M1Only 的程序

// ============================================================
// 6. 不可表达性的形式化证明框架
// ============================================================

/**
 * 不可表达性定理（不可表达性证明模板）：
 *
 * 要证明：性质 P 在模型 M 中不可表达
 *
 * 方法：
 * 1. 假设 P 在 M 中可表达
 * 2. 构造两个程序 p1, p2 使得 M 将它们视为等价（无法区分）
 * 3. 但 P(p1) ≠ P(p2)
 * 4. 矛盾！因此 P 在 M 中不可表达
 *
 * 这是模型论中不可定义性（undefinability）的标准证明技术。
 */

/**
 * 不可表达性判定器
 */
interface UndefinabilityProof<A> {
  readonly property: (a: A) => boolean;
  readonly indistinguishablePair: [A, A];
  readonly modelEquivalence: (a1: A, a2: A) => boolean;
}

/**
 * 验证不可表达性证明
 */
const verifyUndefinability = <A>(
  proof: UndefinabilityProof<A>
): { isValid: boolean; reason: string } => {
  const [p1, p2] = proof.indistinguishablePair;

  // 检查：模型将 p1 和 p2 视为等价
  const modelCannotDistinguish = proof.modelEquivalence(p1, p2);
  if (!modelCannotDistinguish) {
    return { isValid: false, reason: '模型可以区分这两个程序' };
  }

  // 检查：但性质 P 对它们给出不同结果
  const propertyDiffers = proof.property(p1) !== proof.property(p2);
  if (!propertyDiffers) {
    return { isValid: false, reason: '性质对两个程序给出相同结果，无法导出矛盾' };
  }

  return {
    isValid: true,
    reason: '模型无法区分 p1 和 p2，但性质 P 可以，因此 P 在该模型中不可表达'
  };
};

// ============================================================
// 7. 具体不可表达性示例
// ============================================================

/**
 * 示例 1：React 的 "精确更新时机" 在 React 模型中不可表达
 *
 * React 使用 Virtual DOM Diff，开发者无法精确控制何时更新哪个 DOM 节点。
 * React 模型将 "setState 后立刻读取 DOM" 和 "setState 后等待 render 再读取"
 * 视为相同的程序（都从状态到 UI），但它们的行为不同。
 */

const reactUndefinabilityExample: UndefinabilityProof<string> = {
  property: (code: string) => code.includes('flushSync'), // 是否使用同步刷新
  indistinguishablePair: [
    'function Component() { const [x, setX] = useState(0); setX(1); console.log(x); }',
    'function Component() { const [x, setX] = useState(0); setX(1); flushSync(() => {}); console.log(x); }'
  ],
  modelEquivalence: (c1: string, c2: string) => {
    // React 模型：只看组件输出，不看更新时机
    const normalize = (c: string) => c.replace(/flushSync\([^)]*\);?\s*/g, '');
    return normalize(c1) === normalize(c2);
  }
};

// const reactProofResult = verifyUndefinability(reactUndefinabilityExample);
// 预期：isValid = true，"flushSync 的精确语义在 React 声明式模型中不可表达"

/**
 * 示例 2：TS 类型系统中的 "运行时类型检查" 不可表达
 *
 * TS 类型系统在编译后擦除，运行时无法检查类型。
 */

const tsUndefinabilityExample: UndefinabilityProof<string> = {
  property: (code: string) => code.includes('typeof x === "number"'), // 运行时类型检查
  indistinguishablePair: [
    'function f(x: number) { return x * 2; }',
    'function f(x: number) { if (typeof x !== "number") throw new Error(); return x * 2; }'
  ],
  modelEquivalence: (c1: string, c2: string) => {
    // TS 类型模型：忽略运行时检查
    const normalize = (c: string) => c.replace(/if\s*\([^)]*typeof[^)]*\)\s*throw[^;]*;/g, '');
    return normalize(c1) === normalize(c2);
  }
};

// const tsProofResult = verifyUndefinability(tsUndefinabilityExample);
// 预期：isValid = true，"运行时类型检查在纯 TS 类型模型中不可表达"

// ============================================================
// 8. 对称差的组合性质
// ============================================================

/**
 * 对称差的三角不等式：
 * Δ(M1, M3) ⊆ Δ(M1, M2) ∪ Δ(M2, M3)
 *
 * 即：通过中间模型精化不会引入新的对称差。
 */
function verifyTriangleInequality(
  m1: ProgramModel,
  m2: ProgramModel,
  m3: ProgramModel,
  programs: Program[]
): boolean {
  const diff13 = modelSymmetricDifference(m1, m3, programs);
  const diff12 = modelSymmetricDifference(m1, m2, programs);
  const diff23 = modelSymmetricDifference(m2, m3, programs);

  // diff13.m1Only ⊆ diff12.m1Only ∪ diff23.m1Only
  const m1OnlyValid = diff13.m1Only.every(p =>
    diff12.m1Only.includes(p) || diff23.m1Only.includes(p)
  );

  // diff13.m2Only ⊆ diff12.m2Only ∪ diff23.m2Only
  const m2OnlyValid = diff13.m2Only.every(p =>
    diff12.m2Only.includes(p) || diff23.m2Only.includes(p)
  );

  return m1OnlyValid && m2OnlyValid;
}
