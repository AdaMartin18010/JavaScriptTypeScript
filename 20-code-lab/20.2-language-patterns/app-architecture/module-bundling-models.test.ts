import { describe, it, expect } from 'vitest'
import { computeTreeShakingExports, splitChunks, resolveFederatedModule } from './module-bundling-models.js'

describe('computeTreeShakingExports', () => {
  it('retains only used exports', () => {
    const result = computeTreeShakingExports(['a', 'b', 'c'], new Set(['a', 'c']))
    expect(result.retained).toEqual(['a', 'c'])
    expect(result.removed).toEqual(['b'])
  })
})

describe('splitChunks', () => {
  it('splits modules into chunks', () => {
    expect(splitChunks(['a', 'b', 'c', 'd'], 2)).toEqual([['a', 'b'], ['c', 'd']])
  })
})

describe('resolveFederatedModule', () => {
  it('resolves exposed module', () => {
    const remote = { remoteEntry: 'http://remote.js', exposedModules: { button: './Button' } }
    expect(resolveFederatedModule(remote, 'button')).toBe('./Button')
    expect(resolveFederatedModule(remote, 'missing')).toBeNull()
  })
})
