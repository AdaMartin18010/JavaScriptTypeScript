/**
 * @file memory-management-model.ts
 * @category Browser Runtime → Memory
 * @model Memory Management
 */

export class MemoryLeakDetector {
  private snapshots: { timestamp: number; heapSize: number }[] = []

  recordSnapshot(heapSize: number): void {
    this.snapshots.push({ timestamp: Date.now(), heapSize })
  }

  detectLeak(windowMs = 30000, thresholdRatio = 2.0): boolean {
    if (this.snapshots.length < 2) return false
    const recent = this.snapshots.filter(s => s.timestamp > Date.now() - windowMs)
    if (recent.length < 2) return false
    const first = recent[0].heapSize
    const last = recent[recent.length - 1].heapSize
    return last > first * thresholdRatio
  }

  getSnapshots(): { timestamp: number; heapSize: number }[] {
    return [...this.snapshots]
  }
}

export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn: (item: T) => void

  constructor(createFn: () => T, resetFn: (item: T) => void) {
    this.createFn = createFn
    this.resetFn = resetFn
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }

  release(item: T): void {
    this.resetFn(item)
    this.pool.push(item)
  }

  size(): number {
    return this.pool.length
  }
}

export function estimateRetainedSize(nodeCount: number, edgesPerNode = 3): number {
  const nodeOverhead = 56
  const edgeOverhead = 16
  return nodeCount * (nodeOverhead + edgesPerNode * edgeOverhead)
}
