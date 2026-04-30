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

// TODO: 补充精化关系与对称差的联系、不可表达性的形式化证明
