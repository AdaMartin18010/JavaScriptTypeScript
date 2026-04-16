/**
 * @file data-fetching-patterns.ts
 * @category Application Architecture → Data Fetching
 * @model Data Fetching Patterns
 */

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export class SWRCache<T> {
  private cache = new Map<string, CacheEntry<T>>()

  set(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs })
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return undefined
    }
    return entry.data
  }

  stale(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return true
    return Date.now() - entry.timestamp > entry.ttl
  }
}

export function dedupeRequests<T>(fetcher: (key: string) => Promise<T>): (key: string) => Promise<T> {
  const inflight = new Map<string, Promise<T>>()
  return (key: string) => {
    if (inflight.has(key)) return inflight.get(key)!
    const promise = fetcher(key).finally(() => inflight.delete(key))
    inflight.set(key, promise)
    return promise
  }
}

export function batchRequests<T, R>(
  processor: (items: T[]) => Promise<R[]>,
  delayMs = 10
): { queue: (item: T) => Promise<R> } {
  let batch: T[] = []
  let resolvers: Array<(result: R) => void> = []
  let timeout: ReturnType<typeof setTimeout> | null = null

  const flush = async () => {
    const currentBatch = batch
    const currentResolvers = resolvers
    batch = []
    resolvers = []
    timeout = null
    const results = await processor(currentBatch)
    currentResolvers.forEach((resolve, i) => resolve(results[i]))
  }

  return {
    queue: (item: T) => {
      return new Promise<R>((resolve) => {
        batch.push(item)
        resolvers.push(resolve)
        if (!timeout) timeout = setTimeout(flush, delayMs)
      })
    },
  }
}
