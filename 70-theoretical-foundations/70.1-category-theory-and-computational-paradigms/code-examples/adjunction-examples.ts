/**
 * 伴随函子示例 — TypeScript 实现
 * 
 * 本文件提供伴随函子在 TypeScript 中的具体实现，
 * 用于支持 06-adjunctions-and-free-forgetful-pairs.md。
 * 
 * @theory 伴随函子（Adjunction）
 * @reference Pierce, Types and Programming Languages (2002)
 */

// ============================================================
// 1. 伴随的基本结构
// ============================================================

/**
 * 伴随函子对 F ⊣ G 的核心数据：
 * - F: C → D (左伴随)
 * - G: D → C (右伴随)
 * - 单位 η: id_C → G ∘ F
 * - 余单位 ε: F ∘ G → id_D
 * 
 * 满足三角恒等式：
 * (ε_F) ∘ (F_η) = id_F
 * (G_ε) ∘ (η_G) = id_G
 */

// ============================================================
// 2. 类型推断作为自由-遗忘伴随
// ============================================================

/**
 * 遗忘函子 U: Typed → Untyped
 * 忘记类型信息，将类型化程序映射为无类型程序
 */
type UntypedProgram = string; // 简化为字符串表示
type TypedProgram = { code: string; type: string };

const forgetfulFunctor = (typed: TypedProgram): UntypedProgram => typed.code;

/**
 * 自由函子 F: Untyped → Typed
 * 为无类型程序推断最一般的类型（理想化）
 */
const freeFunctor = (untyped: UntypedProgram): TypedProgram => ({
  code: untyped,
  type: 'unknown' // 理想情况下应推断最一般类型
});

/**
 * 单位 η: id → U ∘ F
 * 对于无类型程序 p，η(p) = p（因为 U(F(p)) = p）
 */
const unit = (untyped: UntypedProgram): UntypedProgram => untyped;

/**
 * 余单位 ε: F ∘ U → id
 * 对于类型化程序 tp，ε(tp) = F(U(tp)) = F(code)
 * 这是一个"类型擦除后再推断"的过程
 */
const counit = (typed: TypedProgram): TypedProgram =>
  freeFunctor(forgetfulFunctor(typed));

// ============================================================
// 3. 自动补全的伴随语义
// ============================================================

/**
 * 部分程序 → 完整程序的"自由构造"
 * 可以看作是从 "部分程序范畴" 到 "完整程序范畴" 的自由函子
 */
type PartialProgram = { code: string; holes: string[] };
type CompleteProgram = { code: string };

const complete = (partial: PartialProgram): CompleteProgram => ({
  code: partial.code // 理想情况下填充 holes
});

// 伴随关系：自动补全建议 = 从部分到完整的"最优"映射

// ============================================================
// 4. React useState 的伴随升降
// ============================================================

/**
 * useState 可以看作是从值到状态的"自由构造"：
 * - F: Value → State (将普通值提升为响应式状态)
 * - G: State → Value (读取状态的当前值)
 * - F ⊣ G 的伴随关系意味着：状态是最"自由"的响应式包装
 */

// 简化的 State 类型
type State<T> = { value: T; setValue: (v: T) => void };

// 自由构造 F: T → State<T>
const liftToState = <T>(initial: T): State<T> => {
  let value = initial;
  return {
    value,
    setValue: (v: T) => { value = v; }
  };
};

// 遗忘构造 G: State<T> → T
const extractValue = <T>(state: State<T>): T => state.value;

// ============================================================
// 5. 三角恒等式验证
// ============================================================

/**
 * 伴随 F ⊣ G 的三角恒等式：
 * (1) ε_F ∘ F(η) = id_F
 * (2) G(ε) ∘ η_G = id_G
 *
 * 以类型推断伴随为例验证：
 * F: Untyped → Typed (自由函子)
 * G: Typed → Untyped (遗忘函子)
 */

/**
 * 验证三角恒等式 (1)：ε_F ∘ F(η) = id_F
 *
 * 对于无类型程序 p:
 * - η(p) = p （单位：无类型程序保持不变）
 * - F(η(p)) = F(p) = { code: p, type: 'unknown' }
 * - ε_F(F(p)) = F(U(F(p))) = F(p.code) = F(p) = { code: p, type: 'unknown' }
 * （因为 U 遗忘类型信息，F 再推断仍为 'unknown'）
 */
const verifyTriangle1 = (untyped: UntypedProgram): boolean => {
  const fp = freeFunctor(untyped);        // F(p)
  const up = forgetfulFunctor(fp);        // U(F(p)) = p
  const fup = freeFunctor(up);            // F(U(F(p)))
  // ε_F(F(p)) = F(U(F(p)))，在理想推断系统中等价于 F(p)
  return fp.code === fup.code;
};

/**
 * 验证三角恒等式 (2)：G(ε) ∘ η_G = id_G
 *
 * 对于类型化程序 tp:
 * - ε(tp) = F(U(tp)) （余单位：类型擦除后再推断）
 * - G(ε(tp)) = U(F(U(tp))) = U(tp) = tp.code
 * - η_G(tp) = U(tp) = tp.code
 * （两者都等于遗忘后的代码）
 */
const verifyTriangle2 = (typed: TypedProgram): boolean => {
  const erased = forgetfulFunctor(typed); // U(tp)
  const reinferred = freeFunctor(erased); // F(U(tp))
  const reerased = forgetfulFunctor(reinferred); // U(F(U(tp)))
  return erased === reerased;
};

// ============================================================
// 6. 乘积-对角伴随（Product ⊣ Diagonal）
// ============================================================

/**
 * 对角函子 Δ: C → C × C
 * Δ(A) = (A, A)
 *
 * 左伴随 = 积函子 ×: C × C → C
 * 右伴随 = 积函子 ×: C × C → C （自伴随）
 *
 * 即：× ⊣ Δ ⊣ ×
 *
 * 在 TS 中：
 * - Δ(A) = [A, A] （数组中两个相同类型）
 * - ×([A, B]) = A & B （交叉类型）
 */

type Diagonal<A> = [A, A];
type ProductCategory<A, B> = [A, B];

const diagonal = <A>(a: A): Diagonal<A> => [a, a];
const productFromCategory = <A, B>([a, b]: ProductCategory<A, B>): A & B =>
  ({ ...a as any, ...b as any }) as A & B;

// 伴随关系：Hom(A × B, C) ≅ Hom((A, B), Δ(C))
// 即：(A & B) => C  对应  (A => C, B => C)
const curryProduct = <A, B, C>(f: (ab: A & B) => C): [(a: A) => C, (b: B) => C] => [
  (a: A) => f(({ ...a as any }) as A & B),
  (b: B) => f(({ ...b as any }) as A & B)
];

// ============================================================
// 7. 极限伴随（Limit ⊣ Diagonal）
// ============================================================

/**
 * 对于图 J: D → C，极限函子 lim: C^D → C 右伴随于对角函子 Δ: C → C^D
 *
 * 即：lim ⊣ Δ
 *
 * 这意味着：Hom(lim(F), A) ≅ Hom(F, Δ(A))
 *
 * 在 TS 中（以 Promise.all 为例）：
 * - F = [Promise<T1>, Promise<T2>] （图）
 * - lim(F) = Promise<[T1, T2]> （极限）
 * - Δ(A) = [Promise<A>, Promise<A>] （常值图）
 */

/**
 * 极限伴随的编程体现：
 * 给定 f: Promise<[T1, T2]> → A，存在唯一的自然变换
 * [Promise<T1>, Promise<T2>] → [Promise<A>, Promise<A>]
 */
const limitAdjunctionExample = <T1, T2, A>(
  f: (result: [T1, T2]) => A
): [(pt1: Promise<T1>) => Promise<A>, (pt2: Promise<T2>) => Promise<A>] => [
  (pt1: Promise<T1>) => pt1.then(t1 => f([t1, undefined as unknown as T2])),
  (pt2: Promise<T2>) => pt2.then(t2 => f([undefined as unknown as T1, t2]))
];

// ============================================================
// 8. 自由-遗忘伴随的更多实例
// ============================================================

/**
 * 列表自由幺半群：F: Set → Mon
 * F(A) = List<A> （A 上的自由列表）
 * U: Mon → Set （遗忘幺半群结构）
 */

type List<A> = { readonly tag: 'nil' } | { readonly tag: 'cons'; readonly head: A; readonly tail: List<A> };

const nil = <A>(): List<A> => ({ tag: 'nil' });
const cons = <A>(head: A, tail: List<A>): List<A> => ({ tag: 'cons', head, tail });

// 自由构造 F: A → List<A>
const singletonList = <A>(a: A): List<A> => cons(a, nil());

// 遗忘构造 U: List<A> → A[]
const listToArray = <A>(list: List<A>): A[] => {
  const result: A[] = [];
  let current = list;
  while (current.tag === 'cons') {
    result.push(current.head);
    current = current.tail;
  }
  return result;
};

// 伴随单位 η: A → U(F(A))  即 a → [a]
const listUnit = <A>(a: A): A[] => [a];

// 伴随余单位 ε: F(U(List<A>)) → List<A>  即数组 → 列表
const listCounit = <A>(arr: A[]): List<A> =>
  arr.reduceRight((tail, head) => cons(head, tail), nil<A>());

// 验证：listToArray(listCounit([1, 2, 3])) = [1, 2, 3]
const verifyListAdjunction = (): boolean => {
  const original = [1, 2, 3];
  const list = listCounit(original);
  const back = listToArray(list);
  return JSON.stringify(original) === JSON.stringify(back);
};
