import { describe, it, expect } from 'vitest'
import { createReduxLikeStore, SignalsModel } from './state-management-architectures.js'

describe('createReduxLikeStore', () => {
  it('should update state and notify listeners', () => {
    const store = createReduxLikeStore({ count: 0 })
    let called = 0
    store.subscribe(() => called++)
    store.setState((s: any) => ({ count: s.count + 1 }))
    expect(store.getState().count).toBe(1)
    expect(called).toBe(1)
  })
})

describe('SignalsModel', () => {
  it('should notify on change', () => {
    const sig = new SignalsModel(0)
    let called = 0
    sig.subscribe(() => called++)
    sig.set(1)
    expect(sig.get()).toBe(1)
    expect(called).toBe(1)
  })
})
