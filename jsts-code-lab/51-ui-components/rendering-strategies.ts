/**
 * @file rendering-strategies.ts
 * @category UI Components → Rendering
 * @model Rendering Strategies
 */

export type RenderingStrategy = 'csr' | 'ssr' | 'ssg' | 'isr' | 'streaming' | 'islands'

export interface RenderingDecision {
  strategy: RenderingStrategy
  reason: string
}

export function selectRenderingStrategy(
  needsSEO: boolean,
  needsDynamicData: boolean,
  acceptableTTFBMs = 300
): RenderingDecision {
  if (!needsSEO) {
    return { strategy: 'csr', reason: 'No SEO requirement; prioritize interactivity' }
  }
  if (!needsDynamicData) {
    return { strategy: 'ssg', reason: 'Static content; pre-build for fastest delivery' }
  }
  if (acceptableTTFBMs < 100) {
    return { strategy: 'streaming', reason: 'Tight TTFB; stream HTML progressively' }
  }
  return { strategy: 'ssr', reason: 'Dynamic + SEO; server-render per request' }
}

export class IslandsArchitecture {
  private islands = new Map<string, () => unknown>()

  registerIsland(id: string, renderFn: () => unknown): void {
    this.islands.set(id, renderFn)
  }

  hydrateIsland(id: string): unknown {
    const fn = this.islands.get(id)
    if (!fn) throw new Error(`Island ${id} not found`)
    return fn()
  }

  listIslands(): string[] {
    return Array.from(this.islands.keys())
  }
}
