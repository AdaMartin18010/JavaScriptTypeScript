/**
 * @file code-optimization-models.ts
 * @category Performance → Code
 * @model Code Optimization
 */

export interface BundleAnalysis {
  totalSize: number
  moduleSizes: Map<string, number>
}

export function findLargestModules(analysis: BundleAnalysis, topN = 5): { module: string; size: number }[] {
  const entries = Array.from(analysis.moduleSizes.entries())
  entries.sort((a, b) => b[1] - a[1])
  return entries.slice(0, topN).map(([module, size]) => ({ module, size }))
}

export function shouldLazyLoad(importDepth: number, threshold = 2): boolean {
  return importDepth > threshold
}

export class WorkerOffloader {
  private workerScript: string

  constructor(script: string) {
    this.workerScript = script
  }

  canOffload(taskComplexity: number, threshold = 1000): boolean {
    return taskComplexity > threshold && typeof this.workerScript === 'string'
  }
}
