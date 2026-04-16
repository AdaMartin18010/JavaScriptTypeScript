import { describe, it, expect } from 'vitest'
import { prioritizePreloads, ServiceWorkerCacheModel, batchHttpRequests } from './network-optimization-models.js'

describe('prioritizePreloads', () => {
  it('sorts by priority', () => {
    const hints = [
      { rel: 'prefetch' as const, href: '/late' },
      { rel: 'preload' as const, href: '/critical' },
    ]
    const sorted = prioritizePreloads(hints)
    expect(sorted[0].href).toBe('/critical')
  })
})

describe('ServiceWorkerCacheModel', () => {
  it('returns cached entry within maxAge', () => {
    const cache = new ServiceWorkerCacheModel()
    cache.put('api', { data: 1 }, 1000)
    expect(cache.match('api')).toEqual({ data: 1 })
  })
})

describe('batchHttpRequests', () => {
  it('splits urls into batches', () => {
    expect(batchHttpRequests(['a', 'b', 'c'], 2)).toEqual([['a', 'b'], ['c']])
  })
})
