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

// TODO: 补充更多 Yoneda 引理的 TS 实现、Contravariant Yoneda、Coyoneda
