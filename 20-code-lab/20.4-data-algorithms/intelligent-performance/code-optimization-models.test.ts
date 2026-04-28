import { describe, it, expect } from 'vitest'
import { findLargestModules, shouldLazyLoad, WorkerOffloader } from './code-optimization-models.js'

describe('findLargestModules', () => {
  it('finds top modules by size', () => {
    const analysis = { totalSize: 1000, moduleSizes: new Map([['a', 100], ['b', 500], ['c', 200]]) }
    const top = findLargestModules(analysis, 2)
    expect(top[0].module).toBe('b')
    expect(top[1].module).toBe('c')
  })
})

describe('shouldLazyLoad', () => {
  it('suggests lazy load for deep imports', () => {
    expect(shouldLazyLoad(3)).toBe(true)
    expect(shouldLazyLoad(1)).toBe(false)
  })
})

describe('WorkerOffloader', () => {
  it('offloads complex tasks', () => {
    const offloader = new WorkerOffloader('script.js')
    expect(offloader.canOffload(500)).toBe(false)
    expect(offloader.canOffload(1500)).toBe(true)
  })
})
