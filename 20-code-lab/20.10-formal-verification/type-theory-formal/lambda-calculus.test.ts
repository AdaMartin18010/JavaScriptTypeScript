import { describe, it, expect } from 'vitest'
import { Var, Abs, App, betaReduce, normalize, freeVariables, substitute, ChurchNumerals, ChurchBooleans, typeCheck, TVar, TArrow } from './lambda-calculus'

describe('Lambda Calculus', () => {
  it('should construct terms', () => {
    const id = Abs('x', Var('x'))
    expect(id.kind).toBe('abs')
    expect(id.param).toBe('x')
  })

  it('should beta reduce identity application', () => {
    const term = App(Abs('x', Var('x')), Var('y'))
    const reduced = betaReduce(term)
    expect(reduced).not.toBeNull()
    expect(reduced!.kind).toBe('var')
    expect((reduced as { name: string }).name).toBe('y')
  })

  it('should normalize Church numeral addition', () => {
    const two = ChurchNumerals.fromNumber(2)
    const three = ChurchNumerals.fromNumber(3)
    const result = normalize(App(App(ChurchNumerals.add, two), three))
    expect(result.kind).toBe('abs')
  })

  it('should compute free variables', () => {
    const term = Abs('x', App(Var('x'), Var('y')))
    const fv = freeVariables(term)
    expect(fv.has('y')).toBe(true)
    expect(fv.has('x')).toBe(false)
  })

  it('should avoid capture during substitution', () => {
    const term = Abs('x', Var('y'))
    const result = substitute(term, 'y', Var('x'))
    expect(result.kind).toBe('abs')
    // Should have renamed bound variable to avoid capture
    expect((result as { param: string }).param).not.toBe('x')
  })
})

describe('Simple Type System', () => {
  it('should type check identity function', () => {
    const id = Abs('x', Var('x'))
    const env = new Map([['x', TVar('α')]])
    const type = typeCheck(id, env)
    expect(type).not.toBeNull()
    expect(type!.kind).toBe('arrow')
  })

  it('should detect unbound variable', () => {
    const term = Var('unknown')
    const type = typeCheck(term, new Map())
    expect(type).toBeNull()
  })
})

describe('Church Booleans', () => {
  it('should select true branch', () => {
    const result = App(App(ChurchBooleans.true, Var('a')), Var('b'))
    const reduced = normalize(result)
    expect(reduced.kind).toBe('var')
    expect((reduced as { name: string }).name).toBe('a')
  })
})
