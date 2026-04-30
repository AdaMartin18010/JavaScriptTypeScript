/**
 * 笛卡尔闭范畴（CCC）证明 — TypeScript 实现
 * 
 * 本文件提供 TypeScript 类型系统中 CCC 结构的代码实现，
 * 用于支持 02-cartesian-closed-categories-and-typescript.md 中的形式化证明。
 * 
 * @theory 笛卡尔闭范畴（Cartesian Closed Category）
 * @reference Lambek & Scott, Introduction to Higher-Order Categorical Logic (1986)
 */

// ============================================================
// 1. 终端对象（Terminal Object）—— void / undefined
// ============================================================

/**
 * 终端对象：对于任意类型 A，存在唯一的态射 !: A → void
 * 在 TS 中，所有类型都可以映射到 void（忽略返回值）
 */
const terminal = <A>(): ((a: A) => void) => (_a: A) => undefined;

// 终端对象的泛性质：对于任意 f, g: A → void，有 f = g
// （因为 void 只有一个值 undefined）

// ============================================================
// 2. 初始对象（Initial Object）—— never
// ============================================================

/**
 * 初始对象：对于任意类型 A，存在唯一的态射 !: never → A
 * 在 TS 中，never 是底部类型，可以安全地转换到任何类型
 */
const initial = <A>(): ((n: never) => A) => (n: never) => n as A;

// 初始对象的泛性质：对于任意 f, g: never → A，有 f = g
// （因为 never 没有值，所以所有函数在定义域上相等）

// ============================================================
// 3. 二元积（Binary Product）—— { a: A, b: B }
// ============================================================

/**
 * 积类型：A × B = { a: A, b: B }
 */
type Product<A, B> = { readonly a: A; readonly b: B };

/**
 * 投影 π₁: A × B → A
 */
const pi1 = <A, B>(p: Product<A, B>): A => p.a;

/**
 * 投影 π₂: A × B → B
 */
const pi2 = <A, B>(p: Product<A, B>): B => p.b;

/**
 * 配对 ⟨f, g⟩: C → A × B
 * 满足：π₁ ∘ ⟨f, g⟩ = f 且 π₂ ∘ ⟨f, g⟩ = g
 */
const pair = <C, A, B>(f: (c: C) => A, g: (c: C) => B): ((c: C) => Product<A, B>) =>
  (c: C) => ({ a: f(c), b: g(c) });

// 验证泛性质
const verifyProduct = <C, A, B>(f: (c: C) => A, g: (c: C) => B, c: C): boolean => {
  const paired = pair(f, g);
  const p = paired(c);
  return pi1(p) === f(c) && pi2(p) === g(c);
};

// ============================================================
// 4. 指数对象（Exponential）—— (a: A) => B
// ============================================================

/**
 * 指数类型：B^A = (a: A) => B
 */
type Exponential<A, B> = (a: A) => B;

/**
 * Curry 变换：curry(f): C → B^A
 * 其中 f: C × A → B
 */
const curry = <C, A, B>(f: (ca: Product<C, A>) => B): ((c: C) => Exponential<A, B>) =>
  (c: C) => (a: A) => f({ a: c, b: a });

/**
 * Uncurry 变换：uncurry(g): C × A → B
 * 其中 g: C → B^A
 */
const uncurry = <C, A, B>(g: (c: C) => Exponential<A, B>): ((ca: Product<C, A>) => B) =>
  (ca: Product<C, A>) => g(ca.a)(ca.b);

/**
 * 求值态射 eval: B^A × A → B
 * eval(f, a) = f(a)
 */
const eval_ = <A, B>(fa: Product<Exponential<A, B>, A>): B => fa.a(fa.b);

// ============================================================
// 5. 验证 CCC 公理
// ============================================================

/**
 * 验证结合律：h ∘ (g ∘ f) = (h ∘ g) ∘ f
 */
const verifyAssociativity = <A, B, C, D>(
  f: (a: A) => B,
  g: (b: B) => C,
  h: (c: C) => D,
  a: A
): boolean => {
  const left = (x: A) => h(g(f(x)));
  const right = (x: A) => ((y: B) => h(g(y)))(f(x));
  return left(a) === right(a);
};

/**
 * 验证单位律：id ∘ f = f = f ∘ id
 */
const verifyIdentity = <A, B>(f: (a: A) => B, a: A): boolean => {
  const idA = (x: A) => x;
  const idB = (x: B) => x;
  return idB(f(a)) === f(a) && f(idA(a)) === f(a);
};

// ============================================================
// 6. 和类型（Coproduct）—— A | B
// ============================================================

/**
 * 判别式联合类型作为余积
 */
type Coproduct<A, B> = 
  | { readonly tag: 'left'; readonly value: A }
  | { readonly tag: 'right'; readonly value: B };

/**
 * 注入 i₁: A → A + B
 */
const i1 = <A, B>(a: A): Coproduct<A, B> => ({ tag: 'left', value: a });

/**
 * 注入 i₂: B → A + B
 */
const i2 = <A, B>(b: B): Coproduct<A, B> => ({ tag: 'right', value: b });

/**
 * Case 分析 [f, g]: A + B → C
 */
const case_ = <A, B, C>(
  f: (a: A) => C,
  g: (b: B) => C
): ((ab: Coproduct<A, B>) => C) => (ab: Coproduct<A, B>) =>
  ab.tag === 'left' ? f(ab.value) : g(ab.value);

// ============================================================
// 7. CCC 结构验证：分配律
// ============================================================

/**
 * 验证分配律：A × (B + C) ≅ (A × B) + (A × C)
 * 在 TS 中：{ a: A } & ({ tag: 'left', value: B } | { tag: 'right', value: C })
 *           ≅ ({ a: A, tag: 'left', value: B }) | ({ a: A, tag: 'right', value: C })
 */

type DistributeLeft<A, B, C> = Product<A, Coproduct<B, C>>;
type DistributeRight<A, B, C> = Coproduct<Product<A, B>, Product<A, C>>;

const distributeLeft = <A, B, C>(
  p: DistributeLeft<A, B, C>
): DistributeRight<A, B, C> => {
  const a = p.a;
  const bc = p.b;
  if (bc.tag === 'left') {
    return { tag: 'left', value: { a, b: bc.value } } as DistributeRight<A, B, C>;
  } else {
    return { tag: 'right', value: { a, b: bc.value } } as DistributeRight<A, B, C>;
  }
};

const distributeRight = <A, B, C>(
  p: DistributeRight<A, B, C>
): DistributeLeft<A, B, C> => {
  if (p.tag === 'left') {
    return { a: p.value.a, b: { tag: 'left', value: p.value.b } } as DistributeLeft<A, B, C>;
  } else {
    return { a: p.value.a, b: { tag: 'right', value: p.value.b } } as DistributeLeft<A, B, C>;
  }
};

// ============================================================
// 8. 积的结合律验证
// ============================================================

/**
 * 验证 (A × B) × C ≅ A × (B × C)
 */
type AssocLeft<A, B, C> = Product<Product<A, B>, C>;
type AssocRight<A, B, C> = Product<A, Product<B, C>>;

const assocLeft = <A, B, C>(p: AssocLeft<A, B, C>): AssocRight<A, B, C> => ({
  a: p.a.a,
  b: { a: p.a.b, b: p.b }
});

const assocRight = <A, B, C>(p: AssocRight<A, B, C>): AssocLeft<A, B, C> => ({
  a: { a: p.a, b: p.b.a },
  b: p.b.b
});

// ============================================================
// 9. 类型层面的范畴论构造：TypeScript 类型作为范畴
// ============================================================

/**
 * 在 TS 类型系统中，以下构造形成 CCC：
 * - 对象：所有 TS 类型（排除 any/unknown 的复杂行为）
 * - 态射：纯函数 (a: A) => B
 * - 积：{ a: A, b: B }
 * - 余积：A | B（带判别式）
 * - 指数：A => B
 * - 终端：void
 * - 初始：never
 *
 * 注意：这不是严格的数学 CCC，因为：
 * 1. TS 有子类型关系（额外结构）
 * 2. any 破坏了类型安全
 * 3. 运行时存在副作用
 */

/**
 * 严格 CCC 子集：仅使用 readonly 类型和纯函数
 */
type StrictCCCObject =
  | { readonly _tag: 'unit' }
  | { readonly _tag: 'void' }
  | { readonly _tag: 'product'; readonly left: StrictCCCObject; readonly right: StrictCCCObject }
  | { readonly _tag: 'exponential'; readonly domain: StrictCCCObject; readonly codomain: StrictCCCObject };

const unit: StrictCCCObject = { _tag: 'unit' };
const void_: StrictCCCObject = { _tag: 'void' };
const product = (l: StrictCCCObject, r: StrictCCCObject): StrictCCCObject => ({
  _tag: 'product', left: l, right: r
});
const exponential = (d: StrictCCCObject, c: StrictCCCObject): StrictCCCObject => ({
  _tag: 'exponential', domain: d, codomain: c
});

// 验证：((A × B) ⇒ C) ≅ (A ⇒ (B ⇒ C))  （Curry 同构）
const curryIsoLeft = (t: StrictCCCObject): StrictCCCObject => {
  if (t._tag !== 'exponential') return t;
  const domain = t.domain;
  const codomain = t.codomain;
  if (domain._tag !== 'product') return t;
  // (A × B) ⇒ C  →  A ⇒ (B ⇒ C)
  return exponential(
    domain.left,
    exponential(domain.right, codomain)
  );
};

const curryIsoRight = (t: StrictCCCObject): StrictCCCObject => {
  if (t._tag !== 'exponential') return t;
  const domain = t.domain;
  const codomain = t.codomain;
  if (codomain._tag !== 'exponential') return t;
  // A ⇒ (B ⇒ C)  →  (A × B) ⇒ C
  return exponential(
    product(domain, codomain.domain),
    codomain.codomain
  );
};
