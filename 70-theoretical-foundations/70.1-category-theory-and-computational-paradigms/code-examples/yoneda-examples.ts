/**
 * Yoneda 引理示例 — TypeScript 实现
 * 
 * 本文件提供 Yoneda 引理在 TypeScript 类型系统中的具体实现，
 * 用于支持 07-yoneda-lemma-and-representable-functors.md。
 * 
 * @theory Yoneda 引理
 * @reference Riehl, Category Theory in Context (2016)
 */

// ============================================================
// 1. Yoneda 引理的编程直觉
// ============================================================

/**
 * Yoneda 引理（协变版本）：
 * 对于任意函子 F: C → Set 和对象 A ∈ C，
 * Nat(Hom(A, -), F) ≅ F(A)
 * 
 * 编程直觉：一个对象 A 完全由它与其他对象的所有关系决定。
 * 即：要知道 A 是什么，只需要观察 Hom(A, X) 对于所有 X 的集合。
 */

// ============================================================
// 2. Representable Functor 示例
// ============================================================

/**
 * Reader 函子：Hom(A, -) 在 TS 中的实现
 * Reader<A, B> = (a: A) => B = Hom(A, B)
 */
type Reader<A, B> = (a: A) => B;

/**
 * Reader 的函子性（map）
 * 对应：给定 f: B → C，构造 Hom(A, B) → Hom(A, C)
 */
const readerMap = <A, B, C>(f: (b: B) => C): ((r: Reader<A, B>) => Reader<A, C>) =>
  (r: Reader<A, B>) => (a: A) => f(r(a));

// ============================================================
// 3. Yoneda 嵌入
// ============================================================

/**
 * Yoneda 嵌入 y: C → Set^{C^op}
 * y(A) = Hom(-, A)
 * 
 * 在 TS 中：将类型 A 嵌入为 "所有到 A 的函数类型"
 */
type YonedaEmbedding<A> = <X>(f: (x: X) => A) => (x: X) => A;

const yonedaEmbedding = <A>(): YonedaEmbedding<A> =>
  <X>(f: (x: X) => A) => f;

// ============================================================
// 4. API 设计中的 Yoneda 视角
// ============================================================

/**
 * Yoneda 引理告诉我们：一个接口完全由其所有使用方式决定。
 * 
 * 示例：设计一个 Logger 接口
 * 不是先定义接口，而是先定义使用场景，然后接口自然浮现。
 */

// 使用场景（"行为"）
type LogError = (msg: string) => void;
type LogInfo = (msg: string) => void;
type LogDebug = (msg: string) => void;

// 接口由使用场景的"和"决定
interface Logger {
  error: LogError;
  info: LogInfo;
  debug: LogDebug;
}

// Yoneda 视角：Logger ≅ Hom(Logger, Logger) 的自然变换
// 即：Logger 完全由它的使用方式决定

// ============================================================
// 5. 测试驱动开发的 Yoneda 视角
// ============================================================

/**
 * TDD 的 Yoneda 解释：
 * 测试是 "观察对象行为" 的方式。
 * 根据 Yoneda 引理，如果一个对象通过所有测试（即所有观察），
 * 那么它在行为上就是"正确的"。
 */

// 类型守卫作为 "特征函数"
type Test<A> = (a: A) => boolean;

// 一个对象通过所有测试 ↔ Yoneda 引理中的自然性条件
const yonedaTest = <A>(tests: Test<A>[], a: A): boolean =>
  tests.every(test => test(a));

// ============================================================
// 6. Contravariant Yoneda（逆变 Yoneda）
// ============================================================

/**
 * 逆变 Yoneda 引理：
 * 对于逆变函子 F: C^op → Set 和对象 A ∈ C，
 * Nat(Hom(-, A), F) ≅ F(A)
 *
 * 编程直觉：一个对象 A 完全由指向它的所有箭头决定。
 * 即：要知道 A 是什么，只需要观察 Hom(X, A) 对于所有 X 的集合。
 *
 * 在 TS 中：Contravariant Functor = 逆变函子
 */

/**
 * 逆变 Reader 函子：Hom(-, A) = (X) => (X → A)
 * 这是协变 Reader 的对偶
 */
type ContravariantReader<A, X> = (x: X) => A;

/**
 * 逆变函子的 map：给定 f: Y → X，构造 Hom(X, A) → Hom(Y, A)
 * contramap(f)(g) = g ∘ f
 */
const contravariantReaderMap = <A, X, Y>(
  f: (y: Y) => X
): ((g: ContravariantReader<A, X>) => ContravariantReader<A, Y>) =>
  (g: ContravariantReader<A, X>) => (y: Y) => g(f(y));

// 示例：A = string
// g: (x: number) => string = x => x.toString()
// f: (y: boolean) => number = b => b ? 1 : 0
// contramap(f)(g): (y: boolean) => string = y => g(f(y)) = y => (y ? 1 : 0).toString()

// ============================================================
// 7. Coyoneda 构造
// ============================================================

/**
 * Coyoneda 引理：
 * 对于任意函子 F: C → Set 和对象 A ∈ C，
 * F(A) ≅ ∫^X F(X) × Hom(X, A)
 *
 * 编程直觉：任何 F(A) 都可以表示为"某个 F(X) 加上一个从 X 到 A 的映射"。
 * 这是自由函子构造的核心思想。
 *
 * 在 TS 中：Coyoneda = 存在类型（existential type）
 */

/**
 * Coyoneda 构造：∃X. F(X) × (X → A)
 */
interface Coyoneda<F, A> {
  readonly _tag: 'Coyoneda';
  /** 存在量化的类型 X（被隐藏） */
  readonly underlying: unknown;
  /** F(X) 的值 */
  readonly fx: F;
  /** f: X → A */
  readonly transform: (x: unknown) => A;
}

/**
 * 构造 Coyoneda：给定 F(X) 和 f: X → A
 */
const coyoneda = <F, A, X>(
  fx: F,
  transform: (x: X) => A
): Coyoneda<F, A> => ({
  _tag: 'Coyoneda',
  underlying: undefined,
  fx,
  transform: transform as (x: unknown) => A
});

/**
 * Coyoneda 的函子性（map）
 * map(g)(Coyoneda(fx, f)) = Coyoneda(fx, g ∘ f)
 */
const coyonedaMap = <F, A, B>(
  g: (a: A) => B
): ((ca: Coyoneda<F, A>) => Coyoneda<F, B>) =>
  (ca: Coyoneda<F, A>) => ({
    _tag: 'Coyoneda',
    underlying: ca.underlying,
    fx: ca.fx,
    transform: (x: unknown) => g(ca.transform(x))
  });

// 示例：Array 作为 Coyoneda
// Array<A> ≅ ∃X. Array<X> × (X → A) = Coyoneda<Array<unknown>, A>
const arrayAsCoyoneda = <A>(arr: A[]): Coyoneda<Array<unknown>, A> =>
  coyoneda<Array<unknown>, A, A>(arr as Array<unknown>, x => x as A);

// map(f)(arr) 在 Coyoneda 中表示为：
// Coyoneda(arr, f)
const arrayMapViaCoyoneda = <A, B>(f: (a: A) => B, arr: A[]): B[] => {
  const c = arrayAsCoyoneda(arr);
  const mapped = coyonedaMap(f)(c);
  return mapped.fx as B[];
};

// ============================================================
// 8. Yoneda 引理在 DSL 设计中的应用
// ============================================================

/**
 * 深度嵌入 DSL（Deep Embedding）vs 浅层嵌入（Shallow Embedding）
 *
 * Yoneda 引理告诉我们：
 * - 深度嵌入 = 语法树（初始代数）
 * - 浅层嵌入 = 语义解释（终余代数）
 * - 两者通过 Yoneda 引理等价
 */

// 深度嵌入：表达式语法树
type ExprDeep =
  | { tag: 'literal'; value: number }
  | { tag: 'add'; left: ExprDeep; right: ExprDeep }
  | { tag: 'mul'; left: ExprDeep; right: ExprDeep };

// 浅层嵌入：直接计算
type ExprShallow = (env: Record<string, number>) => number;

// Yoneda 视角：ExprDeep ≅ Nat(Hom(ExprDeep, -), id)
// 即：语法树由其所有可能的解释完全决定

/**
 * 解释函子：将深度嵌入解释为浅层嵌入
 */
const interpret = (expr: ExprDeep): ExprShallow => {
  switch (expr.tag) {
    case 'literal': return () => expr.value;
    case 'add': {
      const l = interpret(expr.left);
      const r = interpret(expr.right);
      return env => l(env) + r(env);
    }
    case 'mul': {
      const l = interpret(expr.left);
      const r = interpret(expr.right);
      return env => l(env) * r(env);
    }
  }
};

// Yoneda 引理保证：这种解释是唯一的（在同构意义下）
// 即：不存在两种本质上不同的解释方式
