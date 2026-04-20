import { describe, it, expect } from 'vitest'
import { E, smallStep, evaluateSmallStep, bigStep, CEKMachine, Val } from './operational-semantics'

describe('Small-Step Semantics', () => {
  it('should reduce arithmetic', () => {
    const expr = E.add(E.num(1), E.num(2))
    const reduced = smallStep(expr, new Map())
    expect(reduced).not.toBeNull()
    expect(reduced!.kind).toBe('num')
    expect((reduced as { value: number }).value).toBe(3)
  })

  it('should reduce nested expressions', () => {
    const expr = E.mul(E.add(E.num(1), E.num(2)), E.num(3))
    const result = evaluateSmallStep(expr)
    expect(result.kind).toBe('num')
    expect((result as { value: number }).value).toBe(9)
  })

  it('should handle if-then-else', () => {
    const expr = E.if(E.bool(true), E.num(42), E.num(0))
    const reduced = smallStep(expr, new Map())
    expect(reduced).not.toBeNull()
    expect(reduced!.kind).toBe('num')
    expect((reduced as { value: number }).value).toBe(42)
  })
})

describe('Big-Step Semantics', () => {
  it('should evaluate arithmetic', () => {
    const expr = E.add(E.num(5), E.num(3))
    const result = bigStep(expr, new Map())
    expect(result).toEqual(Val.num(8))
  })

  it('should evaluate let binding', () => {
    const expr = E.let('x', E.num(10), E.add(E.var('x'), E.num(5)))
    const result = bigStep(expr, new Map())
    expect(result).toEqual(Val.num(15))
  })

  it('should handle division by zero', () => {
    const expr = E.div(E.num(10), E.num(0))
    expect(() => bigStep(expr, new Map())).toThrow('Division by zero')
  })

  it('should evaluate comparison', () => {
    const expr = E.lt(E.num(3), E.num(5))
    const result = bigStep(expr, new Map())
    expect(result).toEqual(Val.bool(true))
  })
})

describe('CEK Machine', () => {
  it('should evaluate addition', () => {
    const expr = E.add(E.num(1), E.add(E.num(2), E.num(3)))
    const machine = new CEKMachine(expr)
    const result = machine.run()
    expect(result.kind).toBe('num')
    expect((result as { value: number }).value).toBe(6)
  })
})
