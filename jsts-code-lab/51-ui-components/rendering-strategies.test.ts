import { describe, it, expect } from 'vitest'
import { selectRenderingStrategy, IslandsArchitecture } from './rendering-strategies'

describe('selectRenderingStrategy', () => {
  it('selects CSR when no SEO', () => {
    const d = selectRenderingStrategy(false, true)
    expect(d.strategy).toBe('csr')
  })

  it('selects SSG for static SEO', () => {
    const d = selectRenderingStrategy(true, false)
    expect(d.strategy).toBe('ssg')
  })

  it('selects streaming for tight TTFB', () => {
    const d = selectRenderingStrategy(true, true, 50)
    expect(d.strategy).toBe('streaming')
  })
})

describe('IslandsArchitecture', () => {
  it('should hydrate registered island', () => {
    const arch = new IslandsArchitecture()
    arch.registerIsland('counter', () => 42)
    expect(arch.hydrateIsland('counter')).toBe(42)
    expect(arch.listIslands()).toContain('counter')
  })
})
