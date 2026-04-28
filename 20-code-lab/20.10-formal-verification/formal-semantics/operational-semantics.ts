/**
 * @file 操作语义
 * @category Formal Semantics → Operational
 * @difficulty hard
 * @tags operational-semantics, small-step, big-step, abstract-machine
 *
 * @description
 * 实现小步/大步操作语义、抽象机模型，用于精确描述程序的执行行为。
 */

// ============================================================================
// 1. 表达式抽象语法
// ============================================================================

export type Expr = Num | Bool | Var | Add | Sub | Mul | Div | Lt | If | Let

export interface Num { kind: 'num'; value: number }
export interface Bool { kind: 'bool'; value: boolean }
export interface Var { kind: 'var'; name: string }
export interface Add { kind: 'add'; left: Expr; right: Expr }
export interface Sub { kind: 'sub'; left: Expr; right: Expr }
export interface Mul { kind: 'mul'; left: Expr; right: Expr }
export interface Div { kind: 'div'; left: Expr; right: Expr }
export interface Lt { kind: 'lt'; left: Expr; right: Expr }
export interface If { kind: 'if'; cond: Expr; then: Expr; els: Expr }
export interface Let { kind: 'let'; name: string; value: Expr; body: Expr }

export const E = {
  num: (v: number): Num => ({ kind: 'num', value: v }),
  bool: (v: boolean): Bool => ({ kind: 'bool', value: v }),
  var: (n: string): Var => ({ kind: 'var', name: n }),
  add: (l: Expr, r: Expr): Add => ({ kind: 'add', left: l, right: r }),
  sub: (l: Expr, r: Expr): Sub => ({ kind: 'sub', left: l, right: r }),
  mul: (l: Expr, r: Expr): Mul => ({ kind: 'mul', left: l, right: r }),
  div: (l: Expr, r: Expr): Div => ({ kind: 'div', left: l, right: r }),
  lt: (l: Expr, r: Expr): Lt => ({ kind: 'lt', left: l, right: r }),
  if: (c: Expr, t: Expr, e: Expr): If => ({ kind: 'if', cond: c, then: t, els: e }),
  let: (n: string, v: Expr, b: Expr): Let => ({ kind: 'let', name: n, value: v, body: b })
}

// ============================================================================
// 2. 环境
// ============================================================================

export type Env = Map<string, Value>
export type Value = { kind: 'num'; value: number } | { kind: 'bool'; value: boolean }

export const Val = {
  num: (v: number): Value => ({ kind: 'num', value: v }),
  bool: (v: boolean): Value => ({ kind: 'bool', value: v })
}

// ============================================================================
// 3. 小步操作语义 (Small-Step)
// ============================================================================

/**
 * 小步语义：e → e'（一步归约）
 */
export function smallStep(expr: Expr, env: Env): Expr | null {
  switch (expr.kind) {
    case 'num':
    case 'bool':
      return null // 值不能再归约

    case 'var': {
      const val = env.get(expr.name)
      if (!val) throw new Error(`Unbound variable: ${expr.name}`)
      return val.kind === 'num' ? E.num(val.value) : E.bool(val.value)
    }

    case 'add': {
      if (expr.left.kind === 'num' && expr.right.kind === 'num') {
        return E.num(expr.left.value + expr.right.value)
      }
      const leftStep = smallStep(expr.left, env)
      if (leftStep) return E.add(leftStep, expr.right)
      const rightStep = smallStep(expr.right, env)
      if (rightStep) return E.add(expr.left, rightStep)
      return null
    }

    case 'sub': {
      if (expr.left.kind === 'num' && expr.right.kind === 'num') {
        return E.num(expr.left.value - expr.right.value)
      }
      const leftStep = smallStep(expr.left, env)
      if (leftStep) return E.sub(leftStep, expr.right)
      const rightStep = smallStep(expr.right, env)
      if (rightStep) return E.sub(expr.left, rightStep)
      return null
    }

    case 'mul': {
      if (expr.left.kind === 'num' && expr.right.kind === 'num') {
        return E.num(expr.left.value * expr.right.value)
      }
      const leftStep = smallStep(expr.left, env)
      if (leftStep) return E.mul(leftStep, expr.right)
      const rightStep = smallStep(expr.right, env)
      if (rightStep) return E.mul(expr.left, rightStep)
      return null
    }

    case 'div': {
      if (expr.left.kind === 'num' && expr.right.kind === 'num') {
        if (expr.right.value === 0) throw new Error('Division by zero')
        return E.num(expr.left.value / expr.right.value)
      }
      const leftStep = smallStep(expr.left, env)
      if (leftStep) return E.div(leftStep, expr.right)
      const rightStep = smallStep(expr.right, env)
      if (rightStep) return E.div(expr.left, rightStep)
      return null
    }

    case 'lt': {
      if (expr.left.kind === 'num' && expr.right.kind === 'num') {
        return E.bool(expr.left.value < expr.right.value)
      }
      const leftStep = smallStep(expr.left, env)
      if (leftStep) return E.lt(leftStep, expr.right)
      const rightStep = smallStep(expr.right, env)
      if (rightStep) return E.lt(expr.left, rightStep)
      return null
    }

    case 'if': {
      if (expr.cond.kind === 'bool') {
        return expr.cond.value ? expr.then : expr.els
      }
      const condStep = smallStep(expr.cond, env)
      if (condStep) return E.if(condStep, expr.then, expr.els)
      return null
    }

    case 'let': {
      if (isValue(expr.value)) {
        const val = expr.value.kind === 'num'
          ? Val.num(expr.value.value)
          : Val.bool(expr.value.value)
        const newEnv = new Map(env)
        newEnv.set(expr.name, val)
        return substitute(expr.body, expr.name, expr.value)
      }
      const valueStep = smallStep(expr.value, env)
      if (valueStep) return E.let(expr.name, valueStep, expr.body)
      return null
    }
  }
}

function isValue(expr: Expr): boolean {
  return expr.kind === 'num' || expr.kind === 'bool'
}

function substitute(expr: Expr, varName: string, value: Expr): Expr {
  switch (expr.kind) {
    case 'num':
    case 'bool':
      return expr
    case 'var':
      return expr.name === varName ? value : expr
    case 'add':
      return E.add(substitute(expr.left, varName, value), substitute(expr.right, varName, value))
    case 'sub':
      return E.sub(substitute(expr.left, varName, value), substitute(expr.right, varName, value))
    case 'mul':
      return E.mul(substitute(expr.left, varName, value), substitute(expr.right, varName, value))
    case 'div':
      return E.div(substitute(expr.left, varName, value), substitute(expr.right, varName, value))
    case 'lt':
      return E.lt(substitute(expr.left, varName, value), substitute(expr.right, varName, value))
    case 'if':
      return E.if(substitute(expr.cond, varName, value), substitute(expr.then, varName, value), substitute(expr.els, varName, value))
    case 'let':
      if (expr.name === varName) return expr
      return E.let(expr.name, substitute(expr.value, varName, value), substitute(expr.body, varName, value))
  }
}

export function evaluateSmallStep(expr: Expr, env: Env = new Map()): Expr {
  let current = expr
  let steps = 0
  const maxSteps = 1000

  console.log(`  [Small-Step] Start: ${exprToString(current)}`)

  while (steps < maxSteps) {
    const next = smallStep(current, env)
    if (!next) break
    steps++
    console.log(`  [Small-Step] Step ${steps}: ${exprToString(next)}`)
    current = next
  }

  console.log(`  [Small-Step] Final: ${exprToString(current)} (${steps} steps)`)
  return current
}

// ============================================================================
// 4. 大步操作语义 (Big-Step)
// ============================================================================

/**
 * 大步语义：e ⇓ v（直接求值到结果）
 */
export function bigStep(expr: Expr, env: Env): Value {
  switch (expr.kind) {
    case 'num':
      return Val.num(expr.value)
    case 'bool':
      return Val.bool(expr.value)
    case 'var': {
      const val = env.get(expr.name)
      if (!val) throw new Error(`Unbound variable: ${expr.name}`)
      return val
    }
    case 'add': {
      const l = bigStep(expr.left, env)
      const r = bigStep(expr.right, env)
      if (l.kind !== 'num' || r.kind !== 'num') throw new Error('Type error in add')
      return Val.num(l.value + r.value)
    }
    case 'sub': {
      const l = bigStep(expr.left, env)
      const r = bigStep(expr.right, env)
      if (l.kind !== 'num' || r.kind !== 'num') throw new Error('Type error in sub')
      return Val.num(l.value - r.value)
    }
    case 'mul': {
      const l = bigStep(expr.left, env)
      const r = bigStep(expr.right, env)
      if (l.kind !== 'num' || r.kind !== 'num') throw new Error('Type error in mul')
      return Val.num(l.value * r.value)
    }
    case 'div': {
      const l = bigStep(expr.left, env)
      const r = bigStep(expr.right, env)
      if (l.kind !== 'num' || r.kind !== 'num') throw new Error('Type error in div')
      if (r.value === 0) throw new Error('Division by zero')
      return Val.num(l.value / r.value)
    }
    case 'lt': {
      const l = bigStep(expr.left, env)
      const r = bigStep(expr.right, env)
      if (l.kind !== 'num' || r.kind !== 'num') throw new Error('Type error in lt')
      return Val.bool(l.value < r.value)
    }
    case 'if': {
      const cond = bigStep(expr.cond, env)
      if (cond.kind !== 'bool') throw new Error('Type error in if')
      return cond.value ? bigStep(expr.then, env) : bigStep(expr.els, env)
    }
    case 'let': {
      const val = bigStep(expr.value, env)
      const newEnv = new Map(env)
      newEnv.set(expr.name, val)
      return bigStep(expr.body, newEnv)
    }
  }
}

// ============================================================================
// 5. 抽象机 (CEK Machine 简化版)
// ============================================================================

export interface CEKState {
  control: Expr // 当前控制项
  environment: Env // 环境
  continuation: Continuation // 续延
}

export type Continuation =
  | { kind: 'halt' }
  | { kind: 'addL'; right: Expr; env: Env; k: Continuation }
  | { kind: 'addR'; left: number; k: Continuation }
  | { kind: 'ifK'; then: Expr; els: Expr; env: Env; k: Continuation }

export class CEKMachine {
  private state: CEKState

  constructor(expr: Expr) {
    this.state = {
      control: expr,
      environment: new Map(),
      continuation: { kind: 'halt' }
    }
  }

  step(): boolean {
    const { control, environment, continuation } = this.state

    switch (control.kind) {
      case 'num':
      case 'bool': {
        // 值，应用到续延
        this.applyContinuation(control, continuation)
        return true
      }
      case 'var': {
        const val = environment.get(control.name)
        if (!val) throw new Error(`Unbound variable: ${control.name}`)
        const valExpr = val.kind === 'num' ? E.num(val.value) : E.bool(val.value)
        this.applyContinuation(valExpr, continuation)
        return true
      }
      case 'add': {
        this.state = {
          control: control.left,
          environment,
          continuation: { kind: 'addL', right: control.right, env: environment, k: continuation }
        }
        return true
      }
      case 'if': {
        this.state = {
          control: control.cond,
          environment,
          continuation: { kind: 'ifK', then: control.then, els: control.els, env: environment, k: continuation }
        }
        return true
      }
      default:
        return false
    }
  }

  private applyContinuation(value: Expr, k: Continuation): void {
    switch (k.kind) {
      case 'halt':
        this.state = { control: value, environment: this.state.environment, continuation: k }
        break
      case 'addL':
        this.state = {
          control: k.right,
          environment: k.env,
          continuation: { kind: 'addR', left: (value as Num).value, k: k.k }
        }
        break
      case 'addR': {
        const result = E.num(k.left + (value as Num).value)
        this.applyContinuation(result, k.k)
        break
      }
      case 'ifK': {
        const cond = (value as Bool).value
        this.state = {
          control: cond ? k.then : k.els,
          environment: k.env,
          continuation: k.k
        }
        break
      }
    }
  }

  run(): Expr {
    let steps = 0
    while (this.step() && steps < 1000) {
      steps++
    }
    return this.state.control
  }
}

// ============================================================================
// 6. Demo
// ============================================================================

export function demo(): void {
  console.log('=== 操作语义演示 ===\n')

  console.log('1. 小步语义')
  const expr1 = E.add(E.num(1), E.mul(E.num(2), E.num(3))) // 1 + 2 * 3
  console.log('  表达式: 1 + 2 * 3')
  evaluateSmallStep(expr1)

  console.log('\n2. 大步语义')
  const expr2 = E.if(E.lt(E.num(3), E.num(5)), E.num(42), E.num(0)) // if 3 < 5 then 42 else 0
  console.log('  表达式: if 3 < 5 then 42 else 0')
  const result2 = bigStep(expr2, new Map())
  console.log('  结果:', result2)

  console.log('\n3. Let 绑定')
  const expr3 = E.let('x', E.num(10), E.add(E.var('x'), E.num(5))) // let x = 10 in x + 5
  console.log('  表达式: let x = 10 in x + 5')
  evaluateSmallStep(expr3)

  const result3 = bigStep(expr3, new Map())
  console.log('  大步结果:', result3)

  console.log('\n4. CEK 抽象机')
  const expr4 = E.add(E.num(1), E.add(E.num(2), E.num(3)))
  console.log('  表达式: 1 + (2 + 3)')
  const cek = new CEKMachine(expr4)
  const cekResult = cek.run()
  console.log('  CEK 结果:', exprToString(cekResult))

  console.log('\n操作语义要点:')
  console.log('- 小步语义：精确描述每一步计算')
  console.log('- 大步语义：直接给出输入输出的关系')
  console.log('- CEK 机：显式环境 + 续延的抽象机模型')
  console.log('- 两种语义等价性：e ⇓ v 当且仅当 e →* v')
}

function exprToString(expr: Expr): string {
  switch (expr.kind) {
    case 'num': return String(expr.value)
    case 'bool': return String(expr.value)
    case 'var': return expr.name
    case 'add': return `(${exprToString(expr.left)} + ${exprToString(expr.right)})`
    case 'sub': return `(${exprToString(expr.left)} - ${exprToString(expr.right)})`
    case 'mul': return `(${exprToString(expr.left)} * ${exprToString(expr.right)})`
    case 'div': return `(${exprToString(expr.left)} / ${exprToString(expr.right)})`
    case 'lt': return `(${exprToString(expr.left)} < ${exprToString(expr.right)})`
    case 'if': return `(if ${exprToString(expr.cond)} then ${exprToString(expr.then)} else ${exprToString(expr.els)})`
    case 'let': return `(let ${expr.name} = ${exprToString(expr.value)} in ${exprToString(expr.body)})`
  }
}
