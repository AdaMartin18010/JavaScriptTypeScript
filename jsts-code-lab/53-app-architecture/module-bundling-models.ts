/**
 * @file module-bundling-models.ts
 * @category Application Architecture → Bundling
 * @model Module Bundling
 */

export interface ModuleGraph {
  entries: string[]
  chunks: Map<string, string[]>
}

export function computeTreeShakingExports(
  allExports: string[],
  usedExports: Set<string>
): { retained: string[]; removed: string[] } {
  const retained = allExports.filter((e) => usedExports.has(e))
  const removed = allExports.filter((e) => !usedExports.has(e))
  return { retained, removed }
}

export function splitChunks(modules: string[], maxChunkSize: number): string[][] {
  const chunks: string[][] = []
  let current: string[] = []
  for (const mod of modules) {
    current.push(mod)
    if (current.length >= maxChunkSize) {
      chunks.push(current)
      current = []
    }
  }
  if (current.length > 0) chunks.push(current)
  return chunks
}

export interface FederatedModule {
  remoteEntry: string
  exposedModules: Record<string, string>
}

export function resolveFederatedModule(remote: FederatedModule, exposedName: string): string | null {
  return remote.exposedModules[exposedName] ?? null
}
