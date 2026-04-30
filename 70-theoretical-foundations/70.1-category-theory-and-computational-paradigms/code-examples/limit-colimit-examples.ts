/**
 * 极限与余极限示例 — TypeScript 实现
 * 
 * 本文件提供极限（Limit）和余极限（Colimit）在 TypeScript 中的代码实现，
 * 用于支持 05-limits-colimits-and-aggregation-patterns.md。
 * 
 * @theory 极限与余极限（Limits & Colimits）
 * @reference Leinster, Basic Category Theory (2014)
 */

// ============================================================
// 1. 等化子（Equalizer）—— Array.prototype.reduce
// ============================================================

/**
 * 等化子：给定两个并行态射 f, g: A → B，
 * 等化子 eq: E → A 满足 f ∘ eq = g ∘ eq，
 * 且对于任意 h: X → A 满足 f ∘ h = g ∘ h，
 * 存在唯一的 u: X → E 使得 eq ∘ u = h。
 * 
 * reduce 的类比：
 * 将数组的所有元素"等同化"为一个单一值
 */

/**
 * reduce 作为等化子的直觉：
 * 将 [a₁, a₂, ..., aₙ] "等同化"为单个值
 * 通过重复应用二元运算 (⊕) 直到所有元素"相等"（合并为一个）
 */
const reduceAsEqualizer = <A>(arr: A[], fn: (acc: A, curr: A) => A, init: A): A =>
  arr.reduce(fn, init);

// 示例：sum = reduce(+, 0) 将数字列表"等同化"为它们的和
const sum = (nums: number[]): number => reduceAsEqualizer(nums, (a, b) => a + b, 0);

// ============================================================
// 2. 积的极限（Limit over Discrete Diagram）—— Promise.all
// ============================================================

/**
 * Promise.all([p1, p2, ..., pn]) 作为积的极限：
 * - 对象：{ p1, p2, ..., pn }
 * - 锥：一个 Promise<[T1, T2, ..., Tn]> 加上到每个 pi 的投影
 * - 泛性质：对于任何其他同时满足所有 pi 的 Promise，存在唯一的映射到 Promise.all
 */

// Promise.all 的极限直觉：
// 它是"最一般的"同时等待所有 Promise 完成的方式
const limitPromiseAll = <T, U>(p1: Promise<T>, p2: Promise<U>): Promise<[T, U]> =>
  Promise.all([p1, p2]);

// 投影 π₁: Promise.all([p1, p2]) → p1
const project1 = <T, U>(p: Promise<[T, U]>): Promise<T> => p.then(([t, _]) => t);

// 投影 π₂: Promise.all([p1, p2]) → p2
const project2 = <T, U>(p: Promise<[T, U]>): Promise<U> => p.then(([_, u]) => u);

// ============================================================
// 3. 余极限（Colimit）—— Promise.race
// ============================================================

/**
 * Promise.race([p1, p2, ..., pn]) 作为余极限：
 * - 对象：{ p1, p2, ..., pn }
 * - 余锥：一个 Promise<T | U | ...> 加上从每个 pi 的注入
 * - 泛性质：对于任何其他从某个 pi 最先完成的 Promise，存在唯一的映射
 */

const colimitPromiseRace = <T, U>(p1: Promise<T>, p2: Promise<U>): Promise<T | U> =>
  Promise.race([p1, p2]);

// 注入 i₁: p1 → Promise.race([p1, p2])
const inject1 = <T, U>(p1: Promise<T>): Promise<T | U> => p1;

// 注入 i₂: p2 → Promise.race([p1, p2])
const inject2 = <T, U>(p2: Promise<U>): Promise<T | U> => p2;

// ============================================================
// 4. 拉回（Pullback）—— 类型交集 A & B
// ============================================================

/**
 * 拉回：给定 f: A → C, g: B → C，
 * 拉回 P = { (a, b) | f(a) = g(b) } 带投影到 A 和 B。
 * 
 * 在 TS 中：A & B 可以看作拉回，当 A 和 B 有共同约束时。
 */

interface HasName { name: string }
interface HasAge { age: number }

// Person = HasName & HasAge = { name: string, age: number }
// 这是 HasName 和 HasAge 在 "至少有一个属性" 上的拉回
type Person = HasName & HasAge;

// 类型守卫作为拉回的条件
const isPerson = (obj: unknown): obj is Person =>
  typeof obj === 'object' && obj !== null &&
  'name' in obj && 'age' in obj;

// ============================================================
// 5. 推出（Pushout）—— 类型联合 A | B
// ============================================================

/**
 * 推出：给定 f: C → A, g: C → B，
 * 推出 P = A ∪ B / ~，其中 f(c) ~ g(c)。
 * 
 * 在 TS 中：A | B 作为推出（带判别式）。
 */

type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number };

// 推出：Circle 和 Rectangle 在 "都是 Shape" 上的推出
// 注入 i₁: Circle → Shape
const circle = (radius: number): Shape => ({ kind: 'circle', radius });

// 注入 i₂: Rectangle → Shape
const rectangle = (w: number, h: number): Shape => ({ kind: 'rectangle', width: w, height: h });

// ============================================================
// 6. Object.assign 与余积（Coproduct）
// ============================================================

/**
 * Object.assign(a, b) 的直觉：
 * 将两个对象的属性"合并"，类似于余积的合并操作。
 * 
 * 注意：这不是严格的范畴论余积，因为：
 * 1. 属性可能冲突（需要解决策略）
 * 2. 结果不是"不相交并集"
 */

const mergeAsCoproduct = <A extends object, B extends object>(a: A, b: B): A & B =>
  ({ ...a, ...b }) as A & B;

// ============================================================
// 7. 等化子的泛性质完整验证
// ============================================================

/**
 * 等化子 eq: E → A 满足 f ∘ eq = g ∘ eq
 * 泛性质：对于任意 h: X → A 满足 f ∘ h = g ∘ h，
 * 存在唯一的 u: X → E 使得 eq ∘ u = h
 *
 * 在 TS 中：Array.prototype.filter 是等化子的近似
 */

/**
 * 等化子构造：找出满足 f(x) = g(x) 的所有 x
 */
const equalizer = <A, B>(
  domain: A[],
  f: (a: A) => B,
  g: (a: A) => B
): { eq: A[]; inclusion: (e: A) => A } => {
  const eq = domain.filter(a => f(a) === g(a));
  const inclusion = (e: A): A => e; // eq ↪ A
  return { eq, inclusion };
};

/**
 * 验证泛性质：
 * 给定 h: X → A 满足 f ∘ h = g ∘ h，
 * 存在唯一的 u: X → E
 */
const verifyEqualizerUniversal = <X, A, B>(
  domain: A[],
  f: (a: A) => B,
  g: (a: A) => B,
  h: (x: X) => A,
  xs: X[] // 测试用例
): boolean => {
  // 前提：f ∘ h = g ∘ h
  const precondition = xs.every(x => f(h(x)) === g(h(x)));
  if (!precondition) return false;

  const { eq } = equalizer(domain, f, g);

  // 存在 u: X → E 使得 inclusion ∘ u = h
  // u(x) 必须是 h(x) 且 h(x) ∈ eq
  const u = (x: X): A | undefined => {
    const hx = h(x);
    return eq.includes(hx as any) ? hx : undefined;
  };

  // 验证：对所有 x，u(x) 存在且 inclusion(u(x)) = h(x)
  return xs.every(x => {
    const ux = u(x);
    return ux !== undefined && ux === h(x);
  });
};

// 示例：找出满足 x % 2 === 0 和 x > 0 的共同解
// f(x) = x % 2, g(x) = 0 的等化子 = 偶数集合
const evenEqualizer = equalizer(
  [1, 2, 3, 4, 5, 6],
  (x: number) => x % 2,
  () => 0
);
// evenEqualizer.eq = [2, 4, 6]

// ============================================================
// 8. 极限与余极限的对偶性
// ============================================================

/**
 * 对偶原理：
 * 极限 ←→ 余极限（箭头反向）
 * 积 ←→ 余积
 * 等化子 ←→ 余等化子
 * 拉回 ←→ 推出
 *
 * 在 TS 中：
 * - 极限 ≈ 交集/约束满足
 * - 余极限 ≈ 并集/合并操作
 */

/**
 * 余等化子（Coequalizer）：给定 f, g: A → B，
 * coequalizer: B → Q 满足 coequalizer ∘ f = coequalizer ∘ g
 * 泛性质：对于任意 h: B → X 满足 h ∘ f = h ∘ g，
 * 存在唯一的 u: Q → X 使得 u ∘ coequalizer = h
 *
 * 在 TS 中：按等价关系商化
 */
const coequalizer = <A, B>(
  codomain: B[],
  f: (a: A) => B,
  g: (a: A) => B,
  as: A[]
): { quotient: B[][]; proj: (b: B) => B[] } => {
  // 等价关系：b1 ~ b2 当且仅当 ∃a. f(a) = b1 ∧ g(a) = b2
  const equivalence: Map<B, Set<B>> = new Map();

  for (const a of as) {
    const fa = f(a);
    const ga = g(a);
    if (!equivalence.has(fa)) equivalence.set(fa, new Set());
    equivalence.get(fa)!.add(ga);
  }

  // 商集 = 等价类
  const classes: B[][] = [];
  const visited = new Set<B>();
  for (const b of codomain) {
    if (visited.has(b)) continue;
    const cls = [b];
    visited.add(b);
    const related = equivalence.get(b);
    if (related) {
      for (const r of related) {
        if (!visited.has(r)) {
          cls.push(r);
          visited.add(r);
        }
      }
    }
    classes.push(cls);
  }

  const proj = (b: B): B[] =>
    classes.find(c => c.includes(b as any)) || [b];

  return { quotient: classes, proj };
};

// 示例：f(a) = a, g(a) = a + 1 (mod 4) 的余等化子
// 商化后：0 ~ 1 ~ 2 ~ 3 (因为 f(0)=0, g(0)=1; f(1)=1, g(1)=2; ...)
// 实际上等价类取决于具体定义

// ============================================================
// 9. 泛性质的完整验证框架
// ============================================================

/**
 * 通用极限验证器：
 * 给定锥 (C, c_i) 和候选极限 (L, l_i)，
 * 验证 L 是否满足泛性质
 */
interface Cone<A, Index> {
  readonly apex: A;
  readonly projections: Map<Index, (a: A) => A>;
}

/**
 * 验证极限泛性质：
 * 对于任何其他锥 (C, c_i)，存在唯一的 !u: C → L
 * 使得 l_i ∘ !u = c_i 对所有 i 成立
 */
const verifyLimitUniversal = <A, Index>(
  limitCone: Cone<A, Index>,
  otherCone: Cone<A, Index>,
  uniqueMorphism: (c: A) => A,
  testCases: A[]
): boolean => {
  for (const test of testCases) {
    const u = uniqueMorphism(test);
    // 验证：对所有 i，limitProjection_i(u) = otherProjection_i(test)
    for (const [index, limitProj] of limitCone.projections) {
      const otherProj = otherCone.projections.get(index);
      if (!otherProj) return false;
      if (limitProj(u) !== otherProj(test)) return false;
    }
  }
  return true;
};

// 应用到 Promise.all：
// limitCone = (Promise<[T, U]>, { π₁, π₂ })
// otherCone = (Promise<{ t: T, u: U }>, { c₁: p => p.then(x => x.t), c₂: p => p.then(x => x.u) })
// uniqueMorphism = p => p.then(x => [x.t, x.u])
