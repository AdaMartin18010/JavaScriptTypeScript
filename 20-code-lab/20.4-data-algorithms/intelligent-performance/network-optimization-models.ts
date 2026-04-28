/**
 * @file network-optimization-models.ts
 * @category Performance → Network
 * @model Network Optimization
 */

export interface PreloadHint {
  rel: 'preload' | 'prefetch' | 'preconnect'
  href: string
  as?: string
}

export function prioritizePreloads(hints: PreloadHint[]): PreloadHint[] {
  const order = { preload: 0, preconnect: 1, prefetch: 2 }
  return [...hints].sort((a, b) => order[a.rel] - order[b.rel])
}

export class ServiceWorkerCacheModel {
  private cache = new Map<string, { data: unknown; cachedAt: number; maxAge: number }>()

  put(key: string, data: unknown, maxAgeMs: number): void {
    this.cache.set(key, { data, cachedAt: Date.now(), maxAge: maxAgeMs })
  }

  match(key: string): unknown | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined
    if (Date.now() - entry.cachedAt > entry.maxAge) {
      this.cache.delete(key)
      return undefined
    }
    return entry.data
  }
}

export function batchHttpRequests<T>(urls: string[], batchSize: number): string[][] {
  const batches: string[][] = []
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize))
  }
  return batches
}
