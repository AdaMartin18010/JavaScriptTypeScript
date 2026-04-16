import { describe, it, expect } from 'vitest'
import { SWRCache, dedupeRequests, batchRequests } from './data-fetching-patterns'

describe('SWRCache', () => {
  it('returns cached data within ttl', () => {
    const cache = new SWRCache<string>()
    cache.set('k', 'v', 1000)
    expect(cache.get('k')).toBe('v')
    expect(cache.stale('k')).toBe(false)
  })
})

describe('dedupeRequests', () => {
  it('dedupes concurrent requests', async () => {
    let calls = 0
    const fetcher = dedupeRequests(async () => {
      calls++
      return 'result'
    })
    const [a, b] = await Promise.all([fetcher('x'), fetcher('x')])
    expect(a).toBe('result')
    expect(b).toBe('result')
    expect(calls).toBe(1)
  })
})

describe('batchRequests', () => {
  it('batches multiple requests', async () => {
    let batchCount = 0
    const { queue } = batchRequests(async (items: number[]) => {
      batchCount++
      return items.map((i) => i * 2)
    }, 5)
    const [a, b] = await Promise.all([queue(1), queue(2)])
    expect(a).toBe(2)
    expect(b).toBe(4)
    expect(batchCount).toBe(1)
  })
})
