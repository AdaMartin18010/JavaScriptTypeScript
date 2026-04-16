/**
 * @file memory-optimization-models.ts
 * @category Performance → Memory
 * @model Memory Optimization
 */

export class VirtualScroller {
  private itemHeight: number
  private viewportHeight: number
  private totalItems: number

  constructor(itemHeight: number, viewportHeight: number, totalItems: number) {
    this.itemHeight = itemHeight
    this.viewportHeight = viewportHeight
    this.totalItems = totalItems
  }

  getVisibleRange(scrollTop: number): { start: number; end: number; totalHeight: number } {
    const start = Math.max(0, Math.floor(scrollTop / this.itemHeight))
    const visibleCount = Math.ceil(this.viewportHeight / this.itemHeight) + 1
    const end = Math.min(this.totalItems, start + visibleCount)
    return { start, end, totalHeight: this.totalItems * this.itemHeight }
  }
}

export function createPlaceholder(width: number, height: number, color = '#e5e7eb'): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E`
}

export class ComponentCleanup {
  private disposers: Array<() => void> = []

  onUnmount(disposer: () => void): void {
    this.disposers.push(disposer)
  }

  cleanup(): void {
    this.disposers.forEach((d) => d())
    this.disposers = []
  }
}
