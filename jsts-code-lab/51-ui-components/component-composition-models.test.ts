import { describe, it, expect } from 'vitest'
import { CompoundComponentRegistry, withHigherOrderComponent, composeHooks } from './component-composition-models.js'

describe('CompoundComponentRegistry', () => {
  it('should register and retrieve parts', () => {
    const registry = new CompoundComponentRegistry()
    registry.registerPart('header', 'Header')
    expect(registry.getPart('header')).toBe('Header')
  })
})

describe('withHigherOrderComponent', () => {
  it('should merge props', () => {
    const Base = (props: { a: number; b: number }) => props.a + props.b
    const Hoc = withHigherOrderComponent(Base, { b: 10 })
    expect(Hoc({ a: 5, b: 0 } as { a: number; b: number })).toBe(15)
  })
})

describe('composeHooks', () => {
  it('should compose multiple hooks', () => {
    const composed = composeHooks(() => 1, () => 2)
    expect(composed()).toEqual([1, 2])
  })
})
