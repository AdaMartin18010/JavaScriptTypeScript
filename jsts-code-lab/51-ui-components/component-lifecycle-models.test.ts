import { describe, it, expect } from 'vitest'
import { ReactLifecycleModel, VueLifecycleModel, compareLifecycleHooks } from './component-lifecycle-models'

describe('Lifecycle Models', () => {
  it('React model has correct framework', () => {
    const m = new ReactLifecycleModel()
    expect(m.framework).toBe('react')
    expect(() => m.mount()).not.toThrow()
  })

  it('Vue model has correct framework', () => {
    const m = new VueLifecycleModel()
    expect(m.framework).toBe('vue')
    expect(() => m.update()).not.toThrow()
  })

  it('compareLifecycleHooks returns all frameworks', () => {
    const hooks = compareLifecycleHooks()
    expect(Object.keys(hooks)).toContain('react')
    expect(Object.keys(hooks)).toContain('vue')
  })
})
