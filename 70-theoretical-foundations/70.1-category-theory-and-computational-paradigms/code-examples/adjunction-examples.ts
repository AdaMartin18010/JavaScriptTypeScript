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

// TODO: 补充更多伴随实例、三角恒等式验证、Adjunction 与 Limit 的关系
