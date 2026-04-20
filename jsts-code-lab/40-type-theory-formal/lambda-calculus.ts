/**
 * @file λ演算与类型基础
 * @category Type Theory → Lambda Calculus
 * @difficulty hard
 * @tags lambda-calculus, type-theory, church-rosser, simply-typed
 *
 * @description
 * λ演算是计算理论的基础。本实现包含无类型λ演算、Church 编码、
 * 简单类型系统，以及类型安全性证明的核心结构。
 */

// ============================================================================
// 1. 无类型 λ 演算 — 抽象语法树
// ============================================================================

export type Term = Variable | Abstraction | Application

export interface Variable {
  kind: 'var'
  name: string
}

export interface Abstraction {
  kind: 'abs'
  param: string
  body: Term
}

export interface Application {
  kind: 'app'
  func: Term
  arg: Term
}

export const Var = (name: string): Variable => ({ kind: 'var', name })
export const Abs = (param: string, body: Term): Abstraction => ({ kind: 'abs', param, body })
export const App = (func: Term, arg: Term): Application => ({ kind: 'app', func, arg })

// ============================================================================
// 2. 自由变量与替换
// ============================================================================

export function freeVariables(term: Term): Set<string> {
  switch (term.kind) {
    case 'var':
      return new Set([term.name])
    case 'abs':
      const fv = freeVariables(term.body)
      fv.delete(term.param)
      return fv
    case 'app':
      return new Set([...freeVariables(term.func), ...freeVariables(term.arg)])
  }
}

export function substitute(term: Term, varName: string, replacement: Term): Term {
  switch (term.kind) {
    case 'var':
      return term.name === varName ? replacement : term
    case 'abs':
      if (term.param === varName) return term
      // α-转换避免捕获
      if (freeVariables(replacement).has(term.param)) {
        const newParam = freshName(term.param, new Set([...freeVariables(term.body), ...freeVariables(replacement)]))
        const renamedBody = substitute(term.body, term.param, Var(newParam))
        return Abs(newParam, substitute(renamedBody, varName, replacement))
      }
      return Abs(term.param, substitute(term.body, varName, replacement))
    case 'app':
      return App(substitute(term.func, varName, replacement), substitute(term.arg, varName, replacement))
  }
}

function freshName(base: string, used: Set<string>): string {
  let i = 1
  let name = `${base}_${i}`
  while (used.has(name)) {
    i++
    name = `${base}_${i}`
  }
  return name
}

// ============================================================================
// 3. β-归约（小步语义）
// ============================================================================

export function betaReduce(term: Term): Term | null {
  switch (term.kind) {
    case 'app':
      if (term.func.kind === 'abs') {
        // (λx.M) N → M[x := N]
        return substitute(term.func.body, term.func.param, term.arg)
      }
      // 尝试先归约函数
      const reducedFunc = betaReduce(term.func)
      if (reducedFunc) return App(reducedFunc, term.arg)
      // 再归约参数
      const reducedArg = betaReduce(term.arg)
      if (reducedArg) return App(term.func, reducedArg)
      return null
    case 'abs':
      const reducedBody = betaReduce(term.body)
      return reducedBody ? Abs(term.param, reducedBody) : null
    case 'var':
      return null
  }
}

export function normalize(term: Term): Term {
  let current = term
  let steps = 0
  const maxSteps = 1000

  while (steps < maxSteps) {
    const next = betaReduce(current)
    if (!next) break
    current = next
    steps++
  }

  if (steps >= maxSteps) {
    console.warn('[Lambda] Normalization exceeded max steps, possible non-termination')
  }

  return current
}

// ============================================================================
// 4. Church 编码
// ============================================================================

export const ChurchNumerals = {
  // n = λf.λx. f^n x
  zero: Abs('f', Abs('x', Var('x'))),

  succ: (n: Term): Term => Abs('f', Abs('x', App(Var('f'), App(App(n, Var('f')), Var('x'))))),

  fromNumber: (n: number): Term => {
    let result = ChurchNumerals.zero
    for (let i = 0; i < n; i++) {
      result = ChurchNumerals.succ(result)
    }
    return result
  },

  // 加法: λm.λn.λf.λx. m f (n f x)
  add: Abs('m', Abs('n', Abs('f', Abs('x',
    App(App(Var('m'), Var('f')), App(App(Var('n'), Var('f')), Var('x')))
  )))),

  // 乘法: λm.λn.λf. m (n f)
  mul: Abs('m', Abs('n', Abs('f',
    App(Var('m'), App(Var('n'), Var('f')))
  )))
}

// Church 布尔值
export const ChurchBooleans = {
  true: Abs('t', Abs('f', Var('t'))),
  false: Abs('t', Abs('f', Var('f'))),

  // if-then-else: λb.λt.λf. b t f
  ifThenElse: Abs('b', Abs('t', Abs('f', App(App(Var('b'), Var('t')), Var('f')))))
}

// ============================================================================
// 5. 简单类型 λ 演算
// ============================================================================

export type SimpleType = TypeVar | TypeArrow

export interface TypeVar {
  kind: 'typevar'
  name: string
}

export interface TypeArrow {
  kind: 'arrow'
  domain: SimpleType
  codomain: SimpleType
}

export const TVar = (name: string): TypeVar => ({ kind: 'typevar', name })
export const TArrow = (domain: SimpleType, codomain: SimpleType): TypeArrow => ({ kind: 'arrow', domain, codomain })

export function typeToString(t: SimpleType): string {
  switch (t.kind) {
    case 'typevar': return t.name
    case 'arrow': return `(${typeToString(t.domain)} → ${typeToString(t.codomain)})`
  }
}

// 类型环境 Γ
export type TypeEnv = Map<string, SimpleType>

export function typeCheck(term: Term, env: TypeEnv): SimpleType | null {
  switch (term.kind) {
    case 'var': {
      const t = env.get(term.name)
      if (!t) {
        console.log(`[TypeError] Unbound variable: ${term.name}`)
        return null
      }
      return t
    }
    case 'abs': {
      // 参数必须有类型标注（简化处理：从环境推断或要求标注）
      const paramType = env.get(term.param) ?? TVar('α')
      const bodyEnv = new Map(env)
      bodyEnv.set(term.param, paramType)
      const bodyType = typeCheck(term.body, bodyEnv)
      if (!bodyType) return null
      return TArrow(paramType, bodyType)
    }
    case 'app': {
      const funcType = typeCheck(term.func, env)
      const argType = typeCheck(term.arg, env)
      if (!funcType || !argType) return null

      if (funcType.kind !== 'arrow') {
        console.log(`[TypeError] Expected function type, got ${typeToString(funcType)}`)
        return null
      }

      // 简化：要求精确匹配（不做统一）
      if (!typesEqual(funcType.domain, argType)) {
        console.log(`[TypeError] Type mismatch: expected ${typeToString(funcType.domain)}, got ${typeToString(argType)}`)
        return null
      }

      return funcType.codomain
    }
  }
}

function typesEqual(a: SimpleType, b: SimpleType): boolean {
  if (a.kind !== b.kind) return false
  if (a.kind === 'typevar' && b.kind === 'typevar') return a.name === b.name
  if (a.kind === 'arrow' && b.kind === 'arrow') {
    return typesEqual(a.domain, b.domain) && typesEqual(a.codomain, b.codomain)
  }
  return false
}

// ============================================================================
// 6. 类型安全性定理结构
// ============================================================================

export const TypeSafety = {
  /**
   * Progress 定理：若 ⊢ M : τ 且 M 不是值，则存在 M' 使 M → M'
   *
   * 证明思路（对推导结构归纳）：
   * - 变量：不可能，因为闭合项中变量无类型
   * - 抽象：已经是值
   * - 应用：M ≡ M₁ M₂
   *   - 若 M₁ → M₁'，则 M₁ M₂ → M₁' M₂
   *   - 若 M₁ 是值且 M₂ → M₂'，则 M₁ M₂ → M₁ M₂'
   *   - 若 M₁, M₂ 都是值，且 M₁ ≡ λx.M'，则 (λx.M') M₂ → M'[x:=M₂]
   */
  progress: (term: Term, type: SimpleType): boolean => {
    // 简化检查：如果可归约，返回 true
    return betaReduce(term) !== null || term.kind === 'abs'
  },

  /**
   * Preservation 定理：若 ⊢ M : τ 且 M → M'，则 ⊢ M' : τ
   *
   * 证明思路（对归约关系归纳）：
   * - β-归约核心：替换保持类型
   *   若 Γ, x:σ ⊢ M : τ 且 Γ ⊢ N : σ，则 Γ ⊢ M[x:=N] : τ
   */
  preservation: (before: Term, after: Term, type: SimpleType): boolean => {
    // 简化验证：重新类型检查归约后的项
    const env = new Map<string, SimpleType>()
    const afterType = typeCheck(after, env)
    return afterType !== null && typesEqual(afterType, type)
  }
}

// ============================================================================
// 7. Demo
// ============================================================================

export function demo(): void {
  console.log('=== λ演算与类型理论演示 ===\n')

  console.log('1. 基本 λ 项构造')
  const identity = Abs('x', Var('x')) // λx.x
  const apply = App(identity, Var('y')) // (λx.x) y
  console.log('  恒等函数: λx.x')
  console.log('  应用: (λx.x) y')

  console.log('\n2. β-归约')
  const reduced = betaReduce(apply)
  console.log('  (λx.x) y →', reduced ? termToString(reduced) : '已是最简式')

  console.log('\n3. Church 数字')
  const two = ChurchNumerals.fromNumber(2)
  console.log('  数字 2 的 Church 编码已构造')

  const three = ChurchNumerals.fromNumber(3)
  const addResult = App(App(ChurchNumerals.add, two), three)
  const normalizedAdd = normalize(addResult)
  console.log('  2 + 3 的归约结果已计算')

  console.log('\n4. 简单类型检查')
  const typedId = Abs('x', Var('x'))
  const env = new Map<string, SimpleType>([['x', TVar('α')]])
  const idType = typeCheck(typedId, env)
  console.log('  λx.x 的类型:', idType ? typeToString(idType) : '类型错误')

  const k = Abs('x', Abs('y', Var('x')))
  const env2 = new Map<string, SimpleType>([['x', TVar('α')], ['y', TVar('β')]])
  const kType = typeCheck(k, env2)
  console.log('  λx.λy.x 的类型:', kType ? typeToString(kType) : '类型错误')

  // 类型错误示例
  const badApp = App(Var('x'), Var('y'))
  const badType = typeCheck(badApp, new Map())
  console.log('  x y (空环境) 的类型:', badType ? typeToString(badType) : '类型错误（预期）')

  console.log('\n5. 自由变量')
  const fvTerm = Abs('x', App(Var('x'), Var('y'))) // λx. x y
  const fv = freeVariables(fvTerm)
  console.log('  λx. x y 的自由变量:', [...fv])

  console.log('\nλ演算要点:')
  console.log('- 三条构造规则：变量、抽象、应用')
  console.log('- β-归约是核心计算规则')
  console.log('- Church-Rosser 定理：归约的合流性')
  console.log('- 简单类型系统保证类型安全性 (Progress + Preservation)')
}

function termToString(term: Term): string {
  switch (term.kind) {
    case 'var': return term.name
    case 'abs': return `(λ${term.param}. ${termToString(term.body)})`
    case 'app': return `(${termToString(term.func)} ${termToString(term.arg)})`
  }
}
